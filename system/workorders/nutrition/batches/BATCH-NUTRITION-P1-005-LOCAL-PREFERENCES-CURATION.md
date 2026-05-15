# BATCH-NUTRITION-P1-005-LOCAL-PREFERENCES-CURATION

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only Nutrition Preferences + Human Layer Curation foundation after the
local Food Search and Human Layer V1 slices. This batch creates the local
preference schema/catalog/API/preview needed before preference-aware Smart
Search can be safely implemented.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-024-local-preferences-curation-foundation.md` | `WO-nutrition-024` | `local-preferences-curation-foundation` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local Supabase/Test DB only
- No DEV/LIVE, Supabase Cloud, production DB, unsourced food/nutrient values, source-unbacked aliases/display names, AI-generated preference mappings, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- Preference catalog is read-only and source-backed by current specs plus old-platform screen text supplied by Tom
- Smart Search preference application is documented only and remains blocked until a later governed step
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-024` | `apps/web/src/lib/nutrition/preferences-catalog.ts` |
| `WO-nutrition-024` | `apps/web/src/lib/nutrition/__tests__/preferences-catalog.test.ts` |
| `WO-nutrition-024` | `apps/web/src/app/api/nutrition/preferences/catalog/route.ts` |
| `WO-nutrition-024` | `apps/web/src/app/nutrition/page.tsx` |
| `WO-nutrition-024` | `system/workorders/cli/nutrition-preferences-foundation.ts` |
| `WO-nutrition-024` | `system/workorders/cli/__tests__/nutrition-preferences-foundation.test.ts` |
| `WO-nutrition-024` | `docs/project/p1-005/P1-005-local-preferences-foundation.sql` |
| `WO-nutrition-024` | `docs/project/p1-005/P1-005-local-preferences-foundation-validation.sql` |
| `WO-nutrition-024` | `docs/project/p1-005/P1-005-local-preferences-foundation-report.md` |
| `WO-nutrition-024` | `docs/project/p1-005/P1-005-preferences-spec-gap-patch.md` |
| `WO-nutrition-024` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
