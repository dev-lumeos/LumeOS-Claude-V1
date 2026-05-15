# BATCH-NUTRITION-P1-005-LOCAL-FOOD-SEARCH-HARDENING

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only Nutrition Human Layer and Food Search hardening after the initial
Food Taxonomy foundation. This batch improves deterministic L3/L4 category
coverage, local `sort_weight`, SPEC_07-style read-only search parameters, and
the visible local `/nutrition` search UI.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-023-local-food-search-human-layer-hardening.md` | `WO-nutrition-023` | `local-food-search-human-layer-hardening` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB only
- No DEV/LIVE, Supabase Cloud, production DB, raw BLS commit, BLS import expansion, RDA changes, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- No unsourced categories, aliases, display names, food values, or nutrient values
- BLS labels must remain source-backed technical labels, not final product copy
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-023` | `system/workorders/cli/nutrition-human-layer.ts` |
| `WO-nutrition-023` | `system/workorders/cli/__tests__/nutrition-human-layer.test.ts` |
| `WO-nutrition-023` | `docs/project/p1-005/P1-005-local-food-human-layer.sql` |
| `WO-nutrition-023` | `docs/project/p1-005/P1-005-local-food-human-layer-validation.sql` |
| `WO-nutrition-023` | `docs/project/p1-005/P1-005-local-food-human-layer-report.md` |
| `WO-nutrition-023` | `apps/web/src/lib/nutrition/food-search.ts` |
| `WO-nutrition-023` | `apps/web/src/lib/nutrition/__tests__/food-search.test.ts` |
| `WO-nutrition-023` | `apps/web/src/app/api/nutrition/foods/route.ts` |
| `WO-nutrition-023` | `apps/web/src/app/api/nutrition/foods/categories/route.ts` |
| `WO-nutrition-023` | `apps/web/src/app/nutrition/page.tsx` |
| `WO-nutrition-023` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
