# BATCH-NUTRITION-P1-005-LOCAL-BLS-IMPORT-EXPANSION

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only deterministic BLS import expansion for the existing Nutrition food
foundation tables:

- `nutrition.foods`
- `nutrition.food_nutrients`

This batch expands the local Test DB from the 10-food sample to the largest
safe deterministic BLS-backed dataset, preferring full local import when
mapping is complete and validation passes.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-020-local-bls-import-expansion.md` | `WO-nutrition-020` | `local-bls-import-expansion` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB only
- Deterministic BLS-backed local import expansion only
- Generated bulk CSV artifacts are local runtime artifacts and must not be committed
- No source workbook commit
- No unsupported food or nutrient values
- No RDA value changes
- No schema change unless separately reported before execution
- Documentation impact is required and must update/validate active handover SSOT
- DEV/LIVE actions, Supabase Cloud commands, production DB work, production routing changes, MiniMax routing changes, service restarts, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-020` | `system/workorders/cli/nutrition_food_bls_import_expand.py` |
| `WO-nutrition-020` | `system/workorders/cli/__tests__/test_nutrition_food_bls_import_expand.py` |
| `WO-nutrition-020` | `docs/project/p1-005/P1-005-local-bls-import-expansion-report.md` |
| `WO-nutrition-020` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
