#!/usr/bin/env python3
"""
Post-sync remap for the powerhouse/builders doc inside powerhouse-network-admin.

Phase 3 of sync.sh handles builder-profile.contributors and operationalHubMember.phid,
but it does NOT touch the powerhouse/builders doc whose `builders[]` field holds PHIDs
that point at builder-profile docs in the team-admin drives.

This script:
  1. Locates the source-side `powerhouse/builders` doc in the network-admin data dir.
  2. Reads its source state (the original PHID list).
  3. Resolves each old PHID → new PHID via the merged ID map.
  4. Looks up the new doc id of the builders doc in the network-admin id-map.
  5. Calls addBuilder on the new doc once per remapped PHID.

Env vars:
  TARGET_PROFILE   switchboard profile to write to (default: bai-dev)
  DATA_DIR         drive-sync data dir (default: scripts/drive-sync/data)
  NETWORK_ADMIN    network-admin drive dir name under DATA_DIR
                   (default: 5e9df222-ed39-4f44-a3eb-87f6098e43b4)
"""

import json, os, subprocess, sys, tempfile

DATA_DIR = os.environ.get("DATA_DIR", "scripts/drive-sync/data")
NETWORK_ADMIN_DIR = os.environ.get("NETWORK_ADMIN", "5e9df222-ed39-4f44-a3eb-87f6098e43b4")
TARGET_PROFILE = os.environ.get("TARGET_PROFILE", "bai-dev")

G, Y, R, NC = "\033[0;32m", "\033[1;33m", "\033[0;31m", "\033[0m"
def log(m):  print(f"  {G}✓{NC} {m}", flush=True)
def warn(m): print(f"  {Y}!{NC} {m}", flush=True)
def die(m):  print(f"  {R}✗{NC} {m}", flush=True); sys.exit(1)

drive_dir = os.path.join(DATA_DIR, NETWORK_ADMIN_DIR)
if not os.path.isdir(drive_dir):
    die(f"network-admin data dir not found: {drive_dir}")

manifest_path = os.path.join(drive_dir, "manifest.json")
id_map_path   = os.path.join(drive_dir, "id-map.json")
merged_map_path = os.path.join(DATA_DIR, "merged-id-map.json")

for p in (manifest_path, id_map_path, merged_map_path):
    if not os.path.exists(p):
        die(f"missing required file: {p}")

with open(manifest_path) as f: manifest = json.load(f)
with open(id_map_path)   as f: drive_map = json.load(f)
with open(merged_map_path) as f: merged_map = json.load(f)

builders_docs = [d for d in manifest["documents"] if d["type"] == "powerhouse/builders"]
if not builders_docs:
    warn("no powerhouse/builders doc in network-admin manifest — nothing to do")
    sys.exit(0)

if len(builders_docs) > 1:
    warn(f"found {len(builders_docs)} powerhouse/builders docs — will process all")

remapped = 0
skipped  = 0
for d in builders_docs:
    old_id = d["id"]
    new_id = drive_map.get(old_id)
    if not new_id:
        warn(f"no new id for source doc {old_id} ({d.get('name')}) — skipping")
        continue

    state_path = os.path.join(drive_dir, "states", f"{old_id}.json")
    if not os.path.exists(state_path):
        warn(f"no source state for {old_id} — skipping")
        continue
    with open(state_path) as f:
        state = json.load(f)

    old_phids = state.get("builders") or []
    if not old_phids:
        warn(f"source builders[] empty for {old_id} — skipping")
        continue

    log(f"remapping {len(old_phids)} PHID(s) for builders doc {new_id}")
    for old_phid in old_phids:
        new_phid = merged_map.get(old_phid)
        if not new_phid:
            warn(f"  no remap for {old_phid} — skipping (not uploaded?)")
            skipped += 1
            continue

        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tf:
            json.dump({"builderPhid": new_phid}, tf)
            tmppath = tf.name
        try:
            r = subprocess.run(
                ["switchboard", "--profile", TARGET_PROFILE,
                 "docs", "mutate", new_id, "--op", "addBuilder",
                 "--input-file", tmppath, "--format", "json"],
                capture_output=True, text=True, timeout=30,
            )
            if r.returncode != 0:
                warn(f"  addBuilder failed for {new_phid}: {r.stderr[:200]}")
            else:
                log(f"  addBuilder ok: {old_phid[:8]}… → {new_phid[:8]}…")
                remapped += 1
        finally:
            os.unlink(tmppath)

log(f"done — added {remapped} builder PHID(s), skipped {skipped}")
