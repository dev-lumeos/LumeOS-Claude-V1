# BATCH-NUTRITION-P1-005-HUMAN-LAYER-V2-WILD-APPLY

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status

ready_to_run

## Purpose

Local-only deterministic apply for exactly one Human Layer category rule:
currently unassigned `V2%` BLS foods -> SPEC_05 `game_meat` / local `wild`
category.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> DGX3/Nemotron review step ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-028-human-layer-v2-wild-apply.md` | `WO-nutrition-028` | `human-layer-v2-wild-apply` | `standard` | not required for Tom-authorized local-only boundary |

## Execution Guard

- Exact batch-path allowlist only
- Local-only deterministic category update for `category_id IS NULL AND bls_code LIKE 'V2%'`
- No other category rules
- No aliases, display names, tags, food values, nutrient values, or RDA updates
- No DEV/LIVE, Supabase Cloud, production DB, raw BLS commit, diary write flow, MealItem creation, production routing, MiniMax routing, service restart, manual runtime_state edits, or manual queue edits
- Documentation impact is required and must update/validate active handover SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Required reviewer route for this exercise: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-028` | `docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply.sql` |
| `WO-nutrition-028` | `docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-validation.sql` |
| `WO-nutrition-028` | `docs/project/p1-005/P1-005-human-layer-v2-wild-category-apply-report.md` |
| `WO-nutrition-028` | `docs/project/p1-005/P1-005-human-layer-category-coverage-analysis.md` |
| `WO-nutrition-028` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
