# BATCH-NUTRITION-P1-005-HUMAN-LAYER-GAP-ANALYSIS

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status

ready_to_run

## Purpose

Local-only read-only Human Layer gap analysis for remaining category coverage and
alias coverage before any future mapping or alias expansion apply boundary.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-027-human-layer-gap-analysis.md` | `WO-nutrition-027` | `human-layer-gap-analysis` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- Local read-only analysis reports, helper tests, curation summary UI, and handover docs only
- No DEV/LIVE, Supabase Cloud, production DB, DB schema change, DB data write, raw BLS commit, source-unbacked food/nutrient values, source-unbacked aliases/display names/categories/tags, RDA changes, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- This batch must not apply new category mappings or aliases
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-027` | `apps/web/src/lib/nutrition/human-layer-gap-analysis.ts` |
| `WO-nutrition-027` | `apps/web/src/lib/nutrition/__tests__/human-layer-gap-analysis.test.ts` |
| `WO-nutrition-027` | `apps/web/src/lib/nutrition/curation.ts` |
| `WO-nutrition-027` | `apps/web/src/lib/nutrition/__tests__/curation.test.ts` |
| `WO-nutrition-027` | `apps/web/src/app/nutrition/curation/page.tsx` |
| `WO-nutrition-027` | `docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md` |
| `WO-nutrition-027` | `docs/project/p1-005/P1-005-human-layer-alias-coverage-analysis.md` |
| `WO-nutrition-027` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
