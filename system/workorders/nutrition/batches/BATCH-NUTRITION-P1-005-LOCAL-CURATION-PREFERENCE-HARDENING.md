# BATCH-NUTRITION-P1-005-LOCAL-CURATION-PREFERENCE-HARDENING

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status

ready_to_run

## Purpose

Local-only Human Layer curation persistence foundation plus curation UI and
preference-aware search preview hardening. This batch continues local Nutrition
development without enabling diary logging, MealItem creation, remote database
actions, production Smart Search, source-unbacked labels, or source-unbacked mappings.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-026-local-curation-preference-hardening.md` | `WO-nutrition-026` | `local-curation-preference-hardening` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local-only schema, read-only API/UI/helper/report/docs changes only
- No DEV/LIVE, Supabase Cloud, production DB, raw BLS commit, source-unbacked food/nutrient values, source-unbacked aliases/display names, RDA changes, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- Curation persistence tables do not mutate foods, category assignments, aliases, or display names
- Preference preview is local-only and must not be represented as production Smart Search
- Curation UI remains read-only and must not expose save/apply controls
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-026` | `apps/web/src/lib/nutrition/curation.ts` |
| `WO-nutrition-026` | `apps/web/src/lib/nutrition/__tests__/curation.test.ts` |
| `WO-nutrition-026` | `apps/web/src/app/api/nutrition/curation/route.ts` |
| `WO-nutrition-026` | `apps/web/src/app/nutrition/curation/page.tsx` |
| `WO-nutrition-026` | `apps/web/src/lib/nutrition/preference-search-preview.ts` |
| `WO-nutrition-026` | `apps/web/src/lib/nutrition/__tests__/preference-search-preview.test.ts` |
| `WO-nutrition-026` | `apps/web/src/app/nutrition/page.tsx` |
| `WO-nutrition-026` | `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql` |
| `WO-nutrition-026` | `docs/project/p1-005/P1-005-local-curation-persistence-validation.sql` |
| `WO-nutrition-026` | `docs/project/p1-005/P1-005-local-curation-preference-hardening-report.md` |
| `WO-nutrition-026` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
