# BATCH-NUTRITION-P1-005-SOURCE-CHAIN-READINESS

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

First executable non-draft P1-005 batch for one narrow output only:

- `docs/project/p1-005/P1-005-source-chain-readiness-report.md`

This batch exists to allow one governed execution-scoped path for the P1-005 source-chain readiness report only.

It does not authorize:

- BLS import
- raw BLS commit
- DB work
- Supabase commands
- migration execution
- product implementation
- production routing changes
- MiniMax production routing

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-005-source-chain-readiness.md` | `WO-nutrition-005` | `p1-005-source-chain-readiness-report` | `docs` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- No other Nutrition batch is allowed by this exception
- Only the readiness report path is in execution scope
- All DB, Supabase, migration, import, approval, runtime-state, queue-state, and routing mutations remain forbidden

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-005` | `docs/project/p1-005/P1-005-source-chain-readiness-report.md` |
