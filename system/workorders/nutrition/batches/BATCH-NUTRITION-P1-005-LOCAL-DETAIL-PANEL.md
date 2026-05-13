# BATCH-NUTRITION-P1-005-LOCAL-DETAIL-PANEL

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
ready_to_run

## Purpose

Local-only UI visibility batch for the seeded `nutrition.nutrient_defs` table.

This batch exists to add a read-only nutrient detail panel or route to the existing local debug page:

- `http://127.0.0.1:5001/nutrition/local-schema`

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-013-local-nutrient-detail-panel.md` | `WO-nutrition-013` | `local-nutrient-detail-panel` | `standard` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- Local-only UI/API code
- Read-only local DB inspection only through the existing debug path
- DB apply, migrations, Supabase commands, seed changes, RDA updates, BLS import, DEV/LIVE actions, production routing changes, MiniMax routing changes, manual runtime_state edits, and manual queue edits remain forbidden

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-013` | `apps/web/src/app/nutrition/local-schema/nutrient-detail-panel.tsx` |
| `WO-nutrition-013` | `apps/web/src/lib/nutrition/nutrient-detail-selection.ts` |
| `WO-nutrition-013` | `apps/web/src/lib/nutrition/__tests__/nutrient-detail-selection.test.ts` |
