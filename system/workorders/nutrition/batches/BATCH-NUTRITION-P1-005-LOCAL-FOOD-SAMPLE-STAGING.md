# BATCH-NUTRITION-P1-005-LOCAL-FOOD-SAMPLE-STAGING

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only deterministic food sample staging batch for the minimum Nutrition
food foundation tables:

- `nutrition.foods`
- `nutrition.food_nutrients`

This batch exists to create enough source-backed local food data for the next
real Food Search step while keeping BLS import, raw BLS commits, DEV/LIVE, and
production routing blocked.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-019-local-food-sample-staging.md` | `WO-nutrition-019` | `local-food-sample-staging` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB only
- Small deterministic source-backed BLS sample only
- No broad/full BLS import
- No raw BLS commit
- No invented food values
- No RDA value changes
- No food search or food search UI
- Documentation impact is required and must update/validate active handover SSOT
- DEV/LIVE actions, Supabase Cloud commands, production routing changes, MiniMax routing changes, service restarts, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-019` | `system/workorders/cli/nutrition_food_sample_extract.py` |
| `WO-nutrition-019` | `system/workorders/cli/__tests__/test_nutrition_food_sample_extract.py` |
| `WO-nutrition-019` | `docs/project/p1-005/P1-005-local-food-sample-staging.sql` |
| `WO-nutrition-019` | `docs/project/p1-005/P1-005-local-food-sample-staging-report.md` |
| `WO-nutrition-019` | `apps/web/src/app/nutrition/local-schema/page.tsx` |
| `WO-nutrition-019` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
