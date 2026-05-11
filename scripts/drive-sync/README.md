# Drive Sync Scripts

Download drives from a source switchboard and recreate them on a target switchboard.

## Prerequisites

- `switchboard` CLI installed and configured with profiles
- `python3`

## Quick Start

Sync staging → local:

```bash
bash scripts/drive-sync/sync.sh --source staging-remote --target local
```

This downloads `builders` and `powerhouse-operator-team-admin` from staging, uploads them to your local switchboard, and remaps cross-drive references (e.g., contributor IDs).

## Individual Scripts

### download.sh — Download a drive

```bash
SB_PROFILE=staging-remote bash scripts/drive-sync/download.sh <drive-slug> [output-dir]
```

Downloads the drive tree and all document states to a local directory. Skips if data already exists (delete the directory to re-download).

### upload.sh — Upload a drive

```bash
SB_PROFILE=local bash scripts/drive-sync/upload.sh <data-dir> [drive-name]
```

Creates the drive, folders, documents, and applies document states on the target. Saves an ID mapping file (`id-map.json`) for old→new ID resolution.

### sync.sh — Full orchestration

```bash
bash scripts/drive-sync/sync.sh --source <profile> --target <profile> [options]
```

Options:
- `--drives <slugs>` — Comma-separated drive slugs (default: `builders,powerhouse-operator-team-admin`)
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

## Files

```
scripts/drive-sync/
├── lib/common.sh    # Shared helpers
├── download.sh      # Phase 1: download drive
├── upload.sh        # Phase 2: upload drive
├── sync.sh          # Orchestrator
└── data/            # Downloaded drive data (git-ignored)
```
