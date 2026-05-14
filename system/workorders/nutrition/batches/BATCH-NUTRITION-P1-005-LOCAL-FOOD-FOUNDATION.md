# BATCH-NUTRITION-P1-005-LOCAL-FOOD-FOUNDATION

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only schema foundation batch for the minimum Nutrition food tables needed
before food search can exist:

- `nutrition.foods`
- `nutrition.food_nutrients`

This batch is intentionally narrow and exists to prove the governed lifecycle for
a local-only DB foundation slice:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-018-local-food-foundation-schema.md` | `WO-nutrition-018` | `local-food-foundation-schema` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB only
- Schema-only migration candidate and local-only apply after gates pass
- No food search or food UI
- No rows inserted into `nutrition.foods` or `nutrition.food_nutrients`
- Documentation impact is required and must update/validate active handover SSOT
- BLS import, raw BLS commit, invented food values, seed/import rows, DEV/LIVE actions, Supabase Cloud commands, production routing changes, MiniMax routing changes, service restarts, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-018` | `supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql` |
| `WO-nutrition-018` | `apps/web/src/lib/nutrition/local-schema-debug.ts` |
| `WO-nutrition-018` | `apps/web/src/lib/nutrition/__tests__/local-schema-debug.test.ts` |
| `WO-nutrition-018` | `apps/web/src/app/nutrition/local-schema/page.tsx` |
| `WO-nutrition-018` | `system/workorders/nutrition/__tests__/food-foundation-slice.test.ts` |
| `WO-nutrition-018` | `docs/project/p1-005/P1-005-local-food-foundation-validation.md` |
| `WO-nutrition-018` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
