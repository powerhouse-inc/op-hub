#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# upload-to-staging.sh — Upload all 3 drives to staging in the correct order
#
# Order:
#   1. builders (dev) → builder profiles
#   2. operator team admin → resource templates, service offerings, expense reports
#      + remap contributors to point to staging builder IDs
#   3. network admin → network profile, workstream, SOW
#      + remap builders doc to point to operator BP from step 2
#
# Usage:
#   bash scripts/drive-sync/upload-to-staging.sh
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
source "$SCRIPT_DIR/lib/common.sh"

# Default to staging, use --local for local testing
TARGET_PROFILE="staging"
TARGET_CONFIRM="CONFIRM_REMOTE=yes"
SB_CLI_PROFILE_FLAG="-p staging"
if [ "${1:-}" = "--local" ]; then
  TARGET_PROFILE="local"
  TARGET_CONFIRM=""
  SB_CLI_PROFILE_FLAG=""
fi

export SB_PROFILE="$TARGET_PROFILE"
export DATA_DIR TARGET_PROFILE
if [ "$TARGET_PROFILE" != "local" ]; then
  export CONFIRM_REMOTE=yes
fi

step "Upload to ${TARGET_PROFILE} — 3 drives"

# Clean id-maps from previous runs
rm -f "$DATA_DIR/builders-dev/id-map.json" \
      "$DATA_DIR/powerhouse-operator-team-admin/id-map.json" \
      "$DATA_DIR/powerhouse-network-admin/id-map.json" \
      "$DATA_DIR/builders-cross-map.json"

# ── Step 1: Builders ─────────────────────────────────────────────────────────

step "Drive 1/3: builders"

bash "$SCRIPT_DIR/upload.sh" "$DATA_DIR/builders-dev"

log "Builders uploaded"

# ── Step 2: Generate cross-map and upload operator drive ──────────────────────

step "Generating cross-map (staging builder IDs → new staging builder IDs)"

python3 -c "
import json

# Staging builders (old download): staging ID → name
with open('$DATA_DIR/builders/manifest.json') as f:
    stg = json.load(f)
stg_id_to_name = {d['id']: d['name'] for d in stg['documents']}

# Dev builders (just uploaded): dev ID → staging ID, plus name
with open('$DATA_DIR/builders-dev/manifest.json') as f:
    dev = json.load(f)
with open('$DATA_DIR/builders-dev/id-map.json') as f:
    dev_map = json.load(f)
dev_name_to_new = {d['name']: dev_map[d['id']] for d in dev['documents'] if d['id'] in dev_map}

# Cross-map: old staging builder ID → new staging builder ID (via name)
cross_map = {sid: dev_name_to_new[name] for sid, name in stg_id_to_name.items() if name in dev_name_to_new}
with open('$DATA_DIR/builders-cross-map.json', 'w') as f:
    json.dump(cross_map, f, indent=2)
print(f'  Cross-map: {len(cross_map)} entries')
"

step "Drive 2/3: operator team admin"

EXTERNAL_ID_MAP="$DATA_DIR/builders-cross-map.json" \
  bash "$SCRIPT_DIR/upload.sh" "$DATA_DIR/powerhouse-operator-team-admin" "Powerhouse Operator Team Admin"

log "Operator drive uploaded with contributors remapped"

# ── Step 3: Upload network admin and remap builders doc ───────────────────────

step "Drive 3/3: network admin"

bash "$SCRIPT_DIR/upload.sh" "$DATA_DIR/powerhouse-network-admin"

# Remap the builders doc: replace old dev operator BP PHID with new staging operator BP ID
step "Remap network admin builders doc"

python3 << 'PYEOF'
import json, subprocess, tempfile, os

data_dir = os.environ.get("DATA_DIR", "scripts/drive-sync/data")

# Load ID maps
with open(f'{data_dir}/powerhouse-operator-team-admin/id-map.json') as f:
    op_map = json.load(f)
with open(f'{data_dir}/powerhouse-operator-team-admin/manifest.json') as f:
    op_manifest = json.load(f)
with open(f'{data_dir}/powerhouse-network-admin/id-map.json') as f:
    net_map = json.load(f)
with open(f'{data_dir}/powerhouse-network-admin/manifest.json') as f:
    net_manifest = json.load(f)

# Find the operator BP doc new ID
op_bp = [d for d in op_manifest['documents'] if d['type'] == 'powerhouse/builder-profile'][0]
new_op_bp_id = op_map[op_bp['id']]
print(f'  Operator BP new ID: {new_op_bp_id}')

# Find the builders doc in network admin
builders_doc = [d for d in net_manifest['documents'] if d['type'] == 'powerhouse/builders'][0]
new_builders_doc_id = net_map[builders_doc['id']]
print(f'  Network admin builders doc new ID: {new_builders_doc_id}')

# Read current state to find the old builder PHID
with open(f'{data_dir}/powerhouse-network-admin/states/{builders_doc["id"]}.json') as f:
    builders_state = json.load(f)
old_phids = builders_state.get('builders', [])
print(f'  Old builder PHIDs: {old_phids}')

# Remove old and add new
def mutate(doc_id, op, inp):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(inp, f)
        tmp = f.name
    try:
        subprocess.run(
            ['switchboard', '-p', os.environ.get('TARGET_PROFILE', 'staging'), 'docs', 'mutate', doc_id, '--op', op,
             '--input-file', tmp, '--format', 'json', '--quiet'],
            capture_output=True, text=True, timeout=30, check=True)
    finally:
        os.unlink(tmp)

for old_phid in old_phids:
    try:
        mutate(new_builders_doc_id, 'removeBuilder', {'builderPhid': old_phid})
    except Exception:
        pass  # might not exist if state wasn't applied
    mutate(new_builders_doc_id, 'addBuilder', {'builderPhid': new_op_bp_id})
    print(f'  Remapped: {old_phid} → {new_op_bp_id}')

print('  Done')
PYEOF

export DATA_DIR TARGET_PROFILE

log "Network admin builders doc remapped to operator BP"

# ── Summary ───────────────────────────────────────────────────────────────────

step "All done"
log "3 drives uploaded to staging"
log "Builders: $(python3 -c "import json; f=open('$DATA_DIR/builders-dev/id-map.json'); d=json.load(f); print(len(d), 'docs')")"
log "Operator: $(python3 -c "import json; f=open('$DATA_DIR/powerhouse-operator-team-admin/id-map.json'); d=json.load(f); print(len(d), 'docs')")"
log "Network:  $(python3 -c "import json; f=open('$DATA_DIR/powerhouse-network-admin/id-map.json'); d=json.load(f); print(len(d), 'docs')")"
