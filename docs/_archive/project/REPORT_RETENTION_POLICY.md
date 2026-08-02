# Governance Report Retention Policy

Date: 2026-05-11

## Purpose

Governance tooling creates local reports, prompts, runtime history, screenshots, dossiers, and learning drafts. Some are durable governance records; others are privacy-sensitive local artifacts. This policy defines what may be committed, what must stay ignored, and how to inspect local artifacts without dumping prompt or transcript bodies.

Product work remains closed unless Tom explicitly opens it.

## Report Categories

| Category | Examples | Commit Policy | Retention |
|---|---|---|---|
| Codex Worker reports | `system/reports/codex-worker/` | Never commit by default. Local ignored runtime artifacts. | Keep latest useful runs during active diagnosis; delete manually when no longer useful. |
| Runtime/model history | `system/reports/model-runtime-history/` | Never commit generated history. Summaries may be documented manually. | Keep locally while monitoring runtime instability; refresh after hardware changes. |
| Browser smoke artifacts | `tmp/governance-ui-browser-smoke/` | Never commit generated screenshots unless a future baseline convention is explicitly added. | Keep latest local smoke screenshots only. |
| Batch dossiers | `system/reports/dossiers/` or written dossier outputs | Review before commit. Commit only intentional, redacted, durable governance dossiers. | Keep durable dossiers that explain governance decisions. |
| Governance learning drafts | `docs/project/governance-learning/drafts/` | May be committed only as explicit review drafts. Never promote automatically. | Review, promote to final incident records, or delete manually. |
| Final learning records | `docs/project/governance-learning/*.md` | May be committed after review. | Durable. Do not auto-delete. |
| Transient CLI/test output | `tmp/`, `*.log`, local command transcripts | Do not commit. | Delete manually when obsolete. |

## Never Commit

- Codex Worker prompt files and execution reports from `system/reports/codex-worker/`.
- Runtime history JSONL/latest files from `system/reports/model-runtime-history/`.
- Generated browser smoke screenshots from `tmp/governance-ui-browser-smoke/`.
- Raw command transcripts containing local paths, prompts, stdout/stderr dumps, tokens, secrets, or environment details.
- Raw BLS/local data files.
- Runtime state, approval queue, lock files, `.env`, or local credentials.

## Safe Summarizer

Use the report retention summarizer for local metadata inspection:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\report-retention-summarizer.ts --json
```

Optional cleanup preview:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\report-retention-summarizer.ts --cleanup-dry-run --json
```

The summarizer is read-only. It scans known ignored local artifact folders and reports:

- file path
- file type
- size
- modified time
- category
- likely sensitive flags
- recommended action
- whether policy says the file is ignored
- whether the file appears tracked by Git

It does not print prompt, transcript, stdout, stderr, or raw report bodies by default.

## Redaction Behavior

The redaction helper masks:

- local absolute paths
- environment-looking key/value secrets
- bearer/API-key-looking strings
- emails
- prompt/transcript/raw output blocks

Redacted summaries are for review only. They are not canonical memory and must not be written into `system/memory/canonical/` automatically.

## Cleanup Policy

Cleanup is dry-run only in the summarizer. It lists delete candidates but does not delete files.

Manual deletion is acceptable for ignored local artifacts when they are no longer useful:

- `system/reports/codex-worker/`
- `system/reports/model-runtime-history/`
- `tmp/governance-ui-browser-smoke/`
- transient local logs

Do not delete through this workflow:

- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `docs/project/GOVERNANCE_TODO_REGISTER.json`
- final governance learning records
- canonical memory
- batch dossiers intentionally committed as durable records

## Safety Rules

This policy does not authorize product work, Supabase commands, migrations, approval grants, runtime-state edits, queue edits, endpoint checks, or canonical-memory writes.
