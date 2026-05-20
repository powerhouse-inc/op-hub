# Drive Sync Scripts

Download drives from a source switchboard and recreate them on a target switchboard — or upload existing drive data from disk straight to a target without re-downloading.

## Prerequisites

- `switchboard` CLI installed and configured with profiles
- `python3`

## Quick Start

### Sync bai-dev → local (download + upload)

```bash
bash scripts/drive-sync/sync.sh --source bai-dev --target local
```

This downloads the 8 demo drives from bai-dev, uploads them to your local switchboard, and remaps cross-drive references (e.g., contributor IDs). The default drive list is:

- `powerhouse-network-admin`
- `933f946f-5fab-4dea-85ea-aeb85f1f2fd1` (the `builders` drive — its slug on bai-dev is its UUID)
- `powerhouse-rgh-operator-admin`
- `bai-team-admin`
- `growth-team-admin`
- `core-dev-team-admin`
- `teeps-team-admin`
- `powerhouse-genesis-operational-hub`

### Upload from an existing data folder (skip download)

If `scripts/drive-sync/data/` already contains drive folders (each with its own `drive-info.json`, `manifest.json`, `states/`, `ops/`), just upload to the target — no source profile needed:

```bash
SB_PROFILE=local bash scripts/drive-sync/upload-all.sh
```

`upload-all.sh` will:

1. **Discover drives automatically** by scanning every subdirectory of `data/` that contains a `drive-info.json`. Folders can be named with the drive's UUID or with its slug — both work, because the slug, name, and `preferredEditor` are read directly from `drive-info.json`.
2. **Sort uploads in dependency-safe order** so cross-drive references can resolve: `powerhouse-network-admin` → `builders` (uuid-slug) → operator/team admins → operational hub.
3. **Create each drive with the correct `preferredEditor`** by passing `PREFERRED_EDITOR=<value from drive-info.json>` to `upload.sh`. So a team-admin drive lands on the target with the `builder-team-admin` editor, the network-admin drive with `network-admin`, etc.
4. **Print Connect URLs** for every uploaded drive at the end.

Verify before writing anything:

```bash
SB_PROFILE=local bash scripts/drive-sync/upload-all.sh --dry-run
```

The dry-run prints a table like `[N] <name> (<slug>) — N docs, N folders, editor=<editor>` so you can confirm discovery and editor assignment before any uploads happen.

After `upload-all.sh` finishes, run the cross-drive ID remap to fix contributor references between drives (this step is folded into `sync.sh` but is separate from `upload-all.sh`):

```bash
# Merge each drive's id-map.json into merged-id-map.json
python3 -c "
import json, os
DATA='scripts/drive-sync/data'
merged={}
for d in os.listdir(DATA):
    p=os.path.join(DATA, d, 'id-map.json')
    if os.path.exists(p):
        merged.update(json.load(open(p)))
json.dump(merged, open(os.path.join(DATA, 'merged-id-map.json'), 'w'), indent=2)
print(f'Merged {len(merged)} IDs')
"
```

(Or just rerun `sync.sh` once with `--source bai-dev --target local` — the download phase is a no-op if data is already on disk, then phase 3's cross-drive remap kicks in. See "How It Works" below for the data-already-on-disk skip rules.)

## Individual Scripts

### download.sh — Download a drive

```bash
SB_PROFILE=bai-dev bash scripts/drive-sync/download.sh <drive-slug> [output-dir]
```

Downloads the drive tree and all document states to a local directory. Skips if data already exists (delete the directory to re-download).

### upload.sh — Upload a single drive

```bash
SB_PROFILE=local bash scripts/drive-sync/upload.sh <data-dir> [drive-name]
```

Creates the drive, folders, documents, and applies document states on the target. Saves an ID mapping file (`id-map.json`) for old→new ID resolution.

Environment variables:

- `PREFERRED_EDITOR` — drive editor id (e.g., `builder-team-admin`, `network-admin`, `contributor-billing-editor`). Defaults to whatever the source drive specified.
- `EXISTING_DRIVE` — drive id to upload into (skips drive creation, applies docs only).

### upload-all.sh — Upload every drive in `data/`

```bash
SB_PROFILE=local bash scripts/drive-sync/upload-all.sh [options]
```

Options:

- `--target <profile>` — Switchboard profile (default: `local`, also read from `SB_PROFILE`)
- `--data-dir <dir>` — Data directory (default: `scripts/drive-sync/data`)
- `--skip <slugs>` — Comma-separated drive slugs to skip
- `--only <slugs>` — Comma-separated drive slugs to upload (overrides default list)
- `--dry-run` — Show what would be uploaded without doing it

Drive discovery is by scanning `data/*/drive-info.json` — folder name is irrelevant.

### sync.sh — Full orchestration (download + upload + remap)

```bash
bash scripts/drive-sync/sync.sh --source <profile> --target <profile> [options]
```

Options:

- `--drives <slugs>` — Comma-separated drive slugs (default: the 8 bai-dev demo drives listed above)
- `--data-dir <dir>` — Data directory (default: `scripts/drive-sync/data`)
- `--exclude <ids>` — Comma-separated doc IDs to exclude
- `--clean` — Delete existing data before downloading

## How It Works

| Phase | What happens |
|-------|-------------|
| Download | `switchboard docs get <id> --state` for each document — no model-specific GraphQL |
| Upload | `switchboard docs create --type <type> --drive <drive>` + `switchboard docs mutate --op` |
| Remap | Cross-drive references (contributor IDs, opHubMember) updated with merged ID map |

### Document type handling

| Type | Strategy |
|------|----------|
| `powerhouse/builder-profile` | Dedicated: isOperator, profile, links, skills, scopes, contributors |
| `powerhouse/resource-template` | Dedicated: info, status, audiences, facets, services, FAQs, content sections |
| `powerhouse/service-offering` | Dedicated: info, status, billing, facets, option groups, tiers, pricing |
| Any other type | Generic: operations discovered via `switchboard models get`, state fields matched to mutation inputs |

### Compatibility check

Before uploading, the script checks that the target switchboard has all required document types registered. Missing types are skipped with a warning.

### Drive editor assignment

The `preferredEditor` value is read from each drive's `drive-info.json` and passed through to `upload.sh` so the new drive on the target lands with the same editor as the source. Add new drive-editor mappings simply by setting `preferredEditor` in the source drive — no script changes needed.

## Files

```
scripts/drive-sync/
├── lib/common.sh    # Shared helpers
├── download.sh      # Phase 1: download drive
├── upload.sh        # Phase 2: upload one drive
├── upload-all.sh    # Phase 2 (batch): upload every drive in data/
├── sync.sh          # Orchestrator: download + upload + remap
└── data/            # Drive data on disk (git-ignored)
    └── <uuid-or-slug>/
        ├── drive-info.json   # slug, name, preferredEditor, …
        ├── manifest.json     # documents + folders
        ├── tree.json
        ├── states/<doc-id>.json
        ├── ops/<doc-id>.json
        └── id-map.json       # written by upload.sh: oldId → newId
```
