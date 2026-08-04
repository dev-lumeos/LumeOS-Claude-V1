# BATCH-NUTRITION-P1-005-IMPORT-PREPARATION

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

First executable planning-only P1-005 batch for post-readiness import/DB preparation outputs only:

- `docs/project/p1-005/P1-005-bls-source-inventory.md`
- `docs/project/p1-005/P1-005-import-field-mapping.md`
- `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md`
- `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md`

This batch exists to allow one governed execution-scoped planning path toward future Nutrition/BLS work without executing import, DB, Supabase, or migration actions.

It does not authorize:

- BLS import
- raw BLS commit
- DB work
- Supabase commands
- migration execution
- product implementation
- approval grants
- production routing changes
- MiniMax production routing

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-006-bls-source-inventory.md` | `WO-nutrition-006` | `p1-005-bls-source-inventory` | `docs` | not required |
| 2 | `../WO-NUTRITION-P1-007-import-field-mapping.md` | `WO-nutrition-007` | `p1-005-import-field-mapping` | `docs` | not required |
| 3 | `../WO-NUTRITION-P1-008-additive-migration-plan.md` | `WO-nutrition-008` | `p1-005-additive-migration-plan` | `docs` | not required |
| 4 | `../WO-NUTRITION-P1-009-rollback-validation-checklist.md` | `WO-nutrition-009` | `p1-005-rollback-validation-checklist` | `docs` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- No other Nutrition batch is allowed by this exception
- Only the four planning outputs above are in execution scope
- All DB, Supabase, migration, import, approval, runtime-state, queue-state, and routing mutations remain forbidden

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-006` | `docs/project/p1-005/P1-005-bls-source-inventory.md` |
| `WO-nutrition-007` | `docs/project/p1-005/P1-005-import-field-mapping.md` |
| `WO-nutrition-008` | `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md` |
| `WO-nutrition-009` | `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md` |
