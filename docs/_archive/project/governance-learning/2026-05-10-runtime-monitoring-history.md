# Runtime Monitoring History Summary

Date: 2026-05-10

## Layer

Model runtime / Spark / Codex runtime observability.

## Change

The model runtime checker now supports explicit local monitoring history:

- `--record-history` appends one JSONL row per route per check.
- `--history-summary` prints a human-readable aggregate.
- `--history-json` prints a machine-readable aggregate.
- History is stored under `system/reports/model-runtime-history/`.
- The history path is ignored and must not be committed.

## Safety

- Default checks remain read-only.
- History writes require explicit `--record-history`.
- Endpoint checks still use short `/v1/models` health calls and do not send workorder prompts.
- Codex CLI is recorded as `external_ok`, not endpoint-checked.
- MealCam optional offline remains informational/non-blocking for normal governance work.

## UI / Reports

- Governance UI Runtime page can record an endpoint check and show history summaries.
- Operator Doctor reports whether runtime history exists and suggests the safe record command when missing.
- Batch dossiers include a compact runtime history summary when available.

## Remaining Work

- Add a read-only polling toggle only after manual history recording remains stable.
- Add trend charts in the UI if the JSONL history becomes large enough to justify visualization.
