# BATCH-NUTRITION-P1-005-LOCAL-FOOD-SEARCH

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only read-only Food Search and Food Detail slice for the populated
Nutrition food foundation:

- `nutrition.foods`
- `nutrition.food_nutrients`
- `nutrition.nutrient_defs`

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-021-local-food-search-ui.md` | `WO-nutrition-021` | `local-food-search-ui` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB read-only queries only
- No DB writes, migrations, Supabase commands, seed/import changes, RDA changes, or BLS import expansion
- No invented display names, aliases, categories, or nutrient values
- BLS labels must be presented as source-backed technical labels, not final product copy
- Documentation impact is required and must update/validate active handover SSOT
- DEV/LIVE actions, Supabase Cloud commands, production routing changes, MiniMax routing changes, service restarts, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-021` | `apps/web/src/lib/nutrition/food-search.ts` |
| `WO-nutrition-021` | `apps/web/src/lib/nutrition/__tests__/food-search.test.ts` |
| `WO-nutrition-021` | `apps/web/src/app/api/nutrition/foods/route.ts` |
| `WO-nutrition-021` | `apps/web/src/app/nutrition/page.tsx` |
| `WO-nutrition-021` | `docs/project/p1-005/P1-005-local-food-search-slice.md` |
| `WO-nutrition-021` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
