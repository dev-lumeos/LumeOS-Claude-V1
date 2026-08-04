# BATCH-NUTRITION-P1-005-LOCAL-RDA-FILTER

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only UI visibility batch for a small read-only RDA availability filter on:

- `http://127.0.0.1:5001/nutrition/local-schema`

This batch is intentionally harmless and exists to prove the governed lifecycle after the mandatory documentation-impact gate:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step -> documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-017-local-rda-availability-filter.md` | `WO-nutrition-017` | `local-rda-availability-filter` | `standard` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local-only UI code
- Existing read-only local debug data path only
- Documentation impact is required and must update/validate active handover SSOT
- DB apply, migrations, Supabase commands, seed changes, RDA updates, BLS import, DEV/LIVE actions, production routing changes, MiniMax routing changes, service restarts, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-017` | `apps/web/src/app/nutrition/local-schema/nutrient-preview-filter.tsx` |
| `WO-nutrition-017` | `apps/web/src/lib/nutrition/nutrient-preview-filter.ts` |
| `WO-nutrition-017` | `apps/web/src/lib/nutrition/__tests__/nutrient-preview-filter.test.ts` |
| `WO-nutrition-017` | `apps/web/src/lib/nutrition/__tests__/nutrient-rda-availability-filter.test.ts` |
| `WO-nutrition-017` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
