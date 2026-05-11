#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# upload-all.sh — Upload all downloaded drives to a target switchboard
#
# Uploads all drives from the data/ directory to recreate the full staging
# environment locally. Runs upload.sh for each drive in dependency order
# (network admin first, then team admins, then operational hubs).
#
# Usage:
#   SB_PROFILE=local bash scripts/drive-sync/upload-all.sh [options]
#
# Options:
#   --target <profile>  Switchboard profile to use (default: local)
#   --data-dir <dir>    Data directory (default: scripts/drive-sync/data)
#   --skip <slugs>      Comma-separated drive slugs to skip
#   --only <slugs>      Comma-separated drive slugs to upload (overrides default list)
#   --dry-run           Show what would be uploaded without doing it
#
# Example:
#   bash scripts/drive-sync/upload-all.sh --target local
#   bash scripts/drive-sync/upload-all.sh --only builders,powerhouse-operator-team-admin
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"
TARGET_PROFILE="${SB_PROFILE:-local}"
SKIP_SLUGS=""
ONLY_SLUGS=""
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)   TARGET_PROFILE="$2"; shift 2 ;;
    --data-dir) DATA_DIR="$2"; shift 2 ;;
    --skip)     SKIP_SLUGS="$2"; shift 2 ;;
    --only)     ONLY_SLUGS="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=true; shift ;;
    *)          echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}  ✓${NC} $*"; }
warn() { echo -e "${YELLOW}  !${NC} $*"; }
err()  { echo -e "${RED}  ✗${NC} $*" >&2; }
step() { echo -e "\n${CYAN}━━━ $* ━━━${NC}"; }

# Upload order — dependency-safe:
# 1. Network-level drives (no cross-drive deps)
# 2. Builder profiles drive (referenced by team admins)
# 3. Team admin drives (reference builder profiles)
# 4. Operational hub drives (reference team admins)
# 5. Empty/utility drives
DRIVE_ORDER=(
  "powerhouse-network-admin:Powerhouse Network Admin"
  "builders:builders"
  "powerhouse-operator-team-admin:Powerhouse Operator Team Admin"
  "bai-team-admin:BAI Team Admin"
  "powerhouse-rgh-operator-admin:Powerhouse RGH Operator Admin"
  "growth-team-admin:Growth Team Admin"
  "core-dev-team-admin:Core Dev Team Admin"
  "powerhouse-genesis-operational-hub:Powerhouse Genesis Operational Hub"
)

# Build skip set
IFS=',' read -ra SKIP_ARRAY <<< "$SKIP_SLUGS"
declare -A SKIP_SET
for s in "${SKIP_ARRAY[@]}"; do
  [[ -n "$s" ]] && SKIP_SET["$s"]=1
done

# Build only set (if specified)
IFS=',' read -ra ONLY_ARRAY <<< "$ONLY_SLUGS"
declare -A ONLY_SET
for s in "${ONLY_ARRAY[@]}"; do
  [[ -n "$s" ]] && ONLY_SET["$s"]=1
done

# Switch to target profile
switchboard config use "$TARGET_PROFILE" >/dev/null 2>&1

step "Upload All Drives"
echo -e "  ${CYAN}Profile:${NC} $TARGET_PROFILE"
echo -e "  ${CYAN}Data:${NC}    $DATA_DIR"

# Preflight
switchboard ping --format json >/dev/null 2>&1 || { err "Switchboard not reachable"; exit 1; }
log "Switchboard reachable"

# Count what we'll upload
TOTAL=0
UPLOAD_LIST=()
for entry in "${DRIVE_ORDER[@]}"; do
  slug="${entry%%:*}"
  name="${entry#*:}"
  dir="$DATA_DIR/$slug"

  # Skip if no data
  [[ ! -f "$dir/manifest.json" ]] && continue

  # Skip if in skip list
  [[ -n "${SKIP_SET[$slug]:-}" ]] && continue

  # Skip if --only is set and this isn't in it
  if [[ ${#ONLY_ARRAY[@]} -gt 0 ]] && [[ -n "${ONLY_ARRAY[0]:-}" ]] && [[ -z "${ONLY_SET[$slug]+x}" ]]; then
    continue
  fi

  # Count docs
  docs=$(python3 -c "import json; m=json.load(open('$dir/manifest.json')); print(len(m.get('documents',[])))")
  folders=$(python3 -c "import json; m=json.load(open('$dir/manifest.json')); print(len(m.get('folders',[])))")

  UPLOAD_LIST+=("$entry")
  TOTAL=$((TOTAL + 1))
  echo -e "  ${CYAN}[$TOTAL]${NC} $name ($slug) — $docs docs, $folders folders"
done

echo ""
echo -e "  ${CYAN}Total:${NC} $TOTAL drives to upload"

if $DRY_RUN; then
  log "Dry run — nothing uploaded"
  exit 0
fi

# Auto-confirm for local profiles
PROFILE_URL=$(switchboard config show --format json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
if ! echo "$PROFILE_URL" | grep -qE "localhost|127\.0\.0\.1"; then
  echo ""
  echo -e "  ${RED}⚠  This is a REMOTE target: $PROFILE_URL${NC}"
  echo -e "  ${RED}   Uploading will create drives and documents on the remote server.${NC}"
  read -r -p "  Type 'yes' to confirm: " confirmation
  if [ "$confirmation" != "yes" ]; then
    err "Aborted"
    exit 1
  fi
fi

# Upload each drive
SUCCEEDED=0
FAILED=0
SKIPPED=0

for entry in "${UPLOAD_LIST[@]}"; do
  slug="${entry%%:*}"
  name="${entry#*:}"
  dir="$DATA_DIR/$slug"

  step "Uploading: $name ($slug)"

  if SB_PROFILE="$TARGET_PROFILE" bash "$SCRIPT_DIR/upload.sh" "$dir" "$name" 2>&1; then
    log "Completed: $name"
    SUCCEEDED=$((SUCCEEDED + 1))
  else
    err "Failed: $name"
    FAILED=$((FAILED + 1))
  fi
done

# Summary
step "Upload All — Summary"
echo -e "  ${GREEN}✓${NC} Succeeded: $SUCCEEDED"
[[ $FAILED -gt 0 ]] && echo -e "  ${RED}✗${NC} Failed: $FAILED"
[[ $SKIPPED -gt 0 ]] && echo -e "  ${YELLOW}!${NC} Skipped: $SKIPPED"
echo -e "  ${CYAN}Total:${NC} $TOTAL drives"

# List all drives on the target
step "Drives on target"
switchboard drives list --format json 2>/dev/null | python3 -c "
import sys, json
drives = json.load(sys.stdin)
for d in drives:
    name = d.get('name', d.get('slug', '?'))
    slug = d.get('slug', '?')
    print(f'  {name:<40s} {slug}')
" 2>/dev/null || true

echo ""
log "Done!"
