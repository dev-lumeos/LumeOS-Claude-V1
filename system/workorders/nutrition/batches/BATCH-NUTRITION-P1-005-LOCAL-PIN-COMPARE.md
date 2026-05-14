# BATCH-NUTRITION-P1-005-LOCAL-PIN-COMPARE

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only UI visibility batch for a small read-only nutrient pin/compare affordance on:

- `http://127.0.0.1:5001/nutrition/local-schema`

This batch is intentionally harmless and exists to prove the governed full workflow path:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step -> checks -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-015-local-nutrient-pin-compare.md` | `WO-nutrition-015` | `local-nutrient-pin-compare` | `standard` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local-only UI code
- Existing read-only local debug data path only
- DB apply, migrations, Supabase commands, seed changes, RDA updates, BLS import, DEV/LIVE actions, production routing changes, MiniMax routing changes, manual runtime_state edits, and manual queue edits remain forbidden
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-015` | `apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx` |
| `WO-nutrition-015` | `apps/web/src/lib/nutrition/nutrient-pin-compare.ts` |
| `WO-nutrition-015` | `apps/web/src/lib/nutrition/__tests__/nutrient-pin-compare.test.ts` |

