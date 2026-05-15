# BATCH-NUTRITION-P1-005-LOCAL-PREFERENCE-PREVIEW-CURATION

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status

ready_to_run

## Purpose

Local-only read-only preference-aware Food Search preview plus Human Layer
curation dashboard after the local Preferences foundation. This batch improves
the local product surface without enabling persisted preferences, production
Smart Search, diary logging, MealItem creation, or any remote database action.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-025-local-preference-preview-curation.md` | `WO-nutrition-025` | `local-preference-preview-curation` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local read-only API/UI/helper/report/docs changes only
- No DEV/LIVE, Supabase Cloud, production DB, DB schema change, DB data write, raw BLS commit, source-unbacked food/nutrient values, source-unbacked aliases/display names, RDA changes, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- Preference preview is local-only and must not be represented as production Smart Search
- Curation dashboard is read-only and must not expose save/apply controls
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-025` | `apps/web/src/lib/nutrition/preference-search-preview.ts` |
| `WO-nutrition-025` | `apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts` |
| `WO-nutrition-025` | `apps/web/src/app/api/nutrition/foods/smart-preview/route.ts` |
| `WO-nutrition-025` | `apps/web/src/lib/nutrition/curation.ts` |
| `WO-nutrition-025` | `apps/web/src/lib/nutrition/__tests__/curation.test.ts` |
| `WO-nutrition-025` | `apps/web/src/app/api/nutrition/curation/route.ts` |
| `WO-nutrition-025` | `apps/web/src/app/nutrition/curation/page.tsx` |
| `WO-nutrition-025` | `apps/web/src/app/nutrition/page.tsx` |
| `WO-nutrition-025` | `docs/project/p1-005/P1-005-local-preference-preview-curation-report.md` |
| `WO-nutrition-025` | `docs/project/p1-005/P1-005-local-preference-preview-curation-validation.md` |
| `WO-nutrition-025` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
