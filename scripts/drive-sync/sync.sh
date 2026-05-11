#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# sync.sh — Orchestrator: download drives from source, upload to target
#
# Handles multi-drive sync with cross-drive ID remapping (e.g., the operator
# drive's builder-profile contributors reference builder IDs from the builders
# drive).
#
# Usage:
#   bash sync.sh --source <profile> --target <profile> [options]
#
# Options:
#   --source <profile>   Source switchboard profile (required)
#   --target <profile>   Target switchboard profile (required)
#   --drives <slugs>     Comma-separated drive slugs to sync (default: see below)
#   --data-dir <dir>     Directory for downloaded data (default: ./data)
#   --exclude <ids>      Comma-separated doc IDs to exclude from download
#   --clean              Delete existing data before downloading
#
# Default drives (contributor-billing):
#   builders,powerhouse-operator-team-admin
#
# Example:
#   bash scripts/drive-sync/sync.sh \
#     --source staging-remote \
#     --target local
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# ── Parse arguments ──────────────────────────────────────────────────────────

SOURCE_PROFILE=""
TARGET_PROFILE=""
DRIVES="builders,powerhouse-operator-team-admin"
DATA_DIR="$SCRIPT_DIR/data"
EXCLUDE_IDS=""
CLEAN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)  SOURCE_PROFILE="$2"; shift 2 ;;
    --target)  TARGET_PROFILE="$2"; shift 2 ;;
    --drives)  DRIVES="$2"; shift 2 ;;
    --data-dir) DATA_DIR="$2"; shift 2 ;;
    --exclude) EXCLUDE_IDS="$2"; shift 2 ;;
    --clean)   CLEAN=true; shift ;;
    *) die "Unknown option: $1" ;;
  esac
done

[ -n "$SOURCE_PROFILE" ] || die "Missing --source <profile>"
[ -n "$TARGET_PROFILE" ] || die "Missing --target <profile>"

IFS=',' read -ra DRIVE_SLUGS <<< "$DRIVES"

step "Drive Sync"
log "Source: $SOURCE_PROFILE"
log "Target: $TARGET_PROFILE"
log "Drives: ${DRIVE_SLUGS[*]}"
log "Data dir: $DATA_DIR"

# ── Safety: prevent source == target ─────────────────────────────────────────

if [ "$SOURCE_PROFILE" = "$TARGET_PROFILE" ]; then
  die "Source and target profiles are the same ('$SOURCE_PROFILE'). This would be destructive. Aborting."
fi

# Verify target is what we expect before doing anything
switchboard config use "$TARGET_PROFILE" >/dev/null 2>&1
confirm_target "upload drives/documents to"

# Switch back — download phase will set its own profile
switchboard config use "$SOURCE_PROFILE" >/dev/null 2>&1

# ── Phase 1: Download all drives from source ─────────────────────────────────

step "Phase 1: Download drives from source"

for slug in "${DRIVE_SLUGS[@]}"; do
  echo ""
  log "Downloading: $slug"

  if [ "$CLEAN" = true ] && [ -d "$DATA_DIR/$slug" ]; then
    rm -rf "$DATA_DIR/$slug"
    log "Cleaned existing data for $slug"
  fi

  SB_PROFILE="$SOURCE_PROFILE" EXCLUDE_IDS="$EXCLUDE_IDS" \
    bash "$SCRIPT_DIR/download.sh" "$slug" "$DATA_DIR/$slug"
done

# ── Phase 2: Upload all drives to target (order matters) ─────────────────────

step "Phase 2: Upload drives to target"

# Upload in order. Earlier drives' ID maps are available for later drives.
# The "builders" drive should be uploaded first so its ID map can be used
# to remap contributor references in the operator drive.

MERGED_ID_MAP="$DATA_DIR/merged-id-map.json"
echo "{}" > "$MERGED_ID_MAP"

for slug in "${DRIVE_SLUGS[@]}"; do
  echo ""
  log "Uploading: $slug"

  # Safety: verify we're targeting the right profile before each upload
  switchboard config use "$TARGET_PROFILE" >/dev/null 2>&1
  assert_profile "$TARGET_PROFILE"

  ID_MAP_FILE="$DATA_DIR/$slug/id-map.json"

  SB_PROFILE="$TARGET_PROFILE" ID_MAP_FILE="$ID_MAP_FILE" \
    bash "$SCRIPT_DIR/upload.sh" "$DATA_DIR/$slug"

  # Merge this drive's ID map into the global map
  if [ -f "$ID_MAP_FILE" ]; then
    python3 -c "
import json
with open('$MERGED_ID_MAP') as f:
    merged = json.load(f)
with open('$ID_MAP_FILE') as f:
    drive_map = json.load(f)
merged.update(drive_map)
with open('$MERGED_ID_MAP', 'w') as f:
    json.dump(merged, f, indent=2)
"
  fi
done

# ── Phase 3: Cross-drive ID remapping ─────────────────────────────────────────

step "Phase 3: Cross-drive ID remapping"

# After all drives are uploaded, we need to fix cross-drive references.
# The main case: operator drive's builder-profile has `contributors` that
# reference builder IDs from the builders drive.

python3 << 'PYEOF'
import subprocess, json, sys, os, tempfile

data_dir = os.environ.get("DATA_DIR", "data")
target_profile = os.environ.get("TARGET_PROFILE", "local")

G = "\033[0;32m"
Y = "\033[1;33m"
R = "\033[0;31m"
NC = "\033[0m"

def log(msg):  print(f"  {G}✓{NC} {msg}")
def warn(msg): print(f"  {Y}!{NC} {msg}")

# Load merged ID map
merged_map_path = os.path.join(data_dir, "merged-id-map.json")
if not os.path.exists(merged_map_path):
    print(f"  {Y}!{NC} No merged ID map found — skipping cross-drive remapping")
    sys.exit(0)

with open(merged_map_path) as f:
    merged_map = json.load(f)

if not merged_map:
    log("No IDs to remap")
    sys.exit(0)

def map_id(old_id):
    return merged_map.get(old_id, old_id)

def mutate(doc_id, op, input_data):
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(input_data, f)
        tmppath = f.name
    try:
        subprocess.run(
            ["switchboard", "docs", "mutate", doc_id, "--op", op,
             "--input-file", tmppath, "--format", "json", "--quiet"],
            capture_output=True, text=True, timeout=30, check=True,
        )
    finally:
        os.unlink(tmppath)

# Find all uploaded drives' manifests
drive_dirs = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]

remapped = 0
for drive_dir_name in drive_dirs:
    drive_path = os.path.join(data_dir, drive_dir_name)
    manifest_path = os.path.join(drive_path, "manifest.json")
    id_map_path = os.path.join(drive_path, "id-map.json")

    if not os.path.exists(manifest_path) or not os.path.exists(id_map_path):
        continue

    with open(manifest_path) as f:
        manifest = json.load(f)
    with open(id_map_path) as f:
        drive_id_map = json.load(f)

    for doc in manifest["documents"]:
        old_id = doc["id"]
        new_id = drive_id_map.get(old_id)
        if not new_id:
            continue

        state_path = os.path.join(drive_path, "states", f"{old_id}.json")
        if not os.path.exists(state_path):
            continue
        with open(state_path) as f:
            state = json.load(f)
        if not state:
            continue

        doc_type = doc["type"]

        # Builder profile: remap contributors
        if doc_type == "powerhouse/builder-profile":
            contributors = state.get("contributors") or []
            needs_remap = any(c in merged_map and merged_map[c] != drive_id_map.get(c) for c in contributors)
            if needs_remap:
                # The upload already added contributors with map_id from the drive's own map.
                # But those contributor IDs come from a DIFFERENT drive (builders).
                # We need to check if any were mapped incorrectly (not in this drive's map).
                for old_contrib_id in contributors:
                    # If this contributor ID exists in merged map but NOT in this drive's map,
                    # it's a cross-drive reference that needs remapping.
                    if old_contrib_id in merged_map and old_contrib_id not in drive_id_map:
                        new_contrib_id = merged_map[old_contrib_id]
                        # Remove the old (unmapped) contributor and add the remapped one
                        try:
                            mutate(new_id, "removeContributor", {"contributorPHID": old_contrib_id})
                        except Exception:
                            pass  # might not exist
                        try:
                            mutate(new_id, "addContributor", {"contributorPHID": new_contrib_id})
                            remapped += 1
                        except Exception as e:
                            warn(f"Failed to remap contributor {old_contrib_id} → {new_contrib_id}: {e}")

            # Also remap operationalHubMember.phid if it's cross-drive
            ohm = state.get("operationalHubMember") or {}
            if ohm.get("phid") and ohm["phid"] in merged_map and ohm["phid"] not in drive_id_map:
                new_phid = merged_map[ohm["phid"]]
                try:
                    mutate(new_id, "setOpHubMember", {
                        "name": ohm.get("name"),
                        "phid": new_phid,
                    })
                    remapped += 1
                except Exception as e:
                    warn(f"Failed to remap opHubMember phid: {e}")

if remapped > 0:
    log(f"Remapped {remapped} cross-drive reference(s)")
else:
    log("No cross-drive references needed remapping")
PYEOF

# ── Done ─────────────────────────────────────────────────────────────────────

step "Sync complete"
log "All drives synced from $SOURCE_PROFILE → $TARGET_PROFILE"

# Print Connect URLs for all uploaded drives
for slug in "${DRIVE_SLUGS[@]}"; do
  if [ -f "$DATA_DIR/$slug/id-map.json" ]; then
    # Read the drive slug from the upload output (it's in the id-map context)
    log "Data for $slug: $DATA_DIR/$slug/"
  fi
done

echo ""
log "Done!"
