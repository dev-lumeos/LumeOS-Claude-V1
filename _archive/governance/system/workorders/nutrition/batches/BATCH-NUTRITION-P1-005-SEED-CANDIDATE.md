# BATCH-NUTRITION-P1-005-SEED-CANDIDATE

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

First executable local-only review batch for the `nutrition.nutrient_defs` seed payload candidate only:

- `docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md`

This batch exists to create a governed review artifact for the nutrient seed payload without executing any insert, local DB apply, Supabase command, DEV/LIVE action, BLS import, raw BLS commit, or migration execution.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-012-nutrient-defs-seed-candidate.md` | `WO-nutrition-012` | `p1-005-nutrient-defs-seed-candidate` | `docs` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- No other Nutrition batch is allowed by this exception
- Only the review-only seed candidate output above is in execution scope
- Seed execution, local DB apply, Supabase commands, DEV/LIVE actions, BLS import, raw BLS commit, migration execution, runtime-state mutation, queue mutation, and routing changes remain forbidden

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-012` | `docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md` |
