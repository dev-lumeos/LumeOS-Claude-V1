# BATCH-GOVERNANCE-P1-018-system-tree-readmes

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: documentation-only governance audit follow-up

## Status

ready_to_run

## Purpose

Run Phase 1 of the system tree cleanup proposal by adding README/index files
only. The batch makes the `system/` tree navigable without moving, deleting,
archiving, or changing runtime behavior.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> reviewer if configured ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-GOVERNANCE-P1-018-system-tree-readmes.md` | `WO-governance-018` | `system-tree-readmes` | `standard` | not required; docs only |

## Execution Guard

- README/index additions only
- No cleanup, moves, deletes, or archive moves
- No product work
- No DB/Supabase/migration execution
- No BLS import
- No DEV/LIVE or production routing
- No service restart
- No runtime behavior change
- No manual runtime_state edits
- No manual queue edits
- Documentation impact is required and must update/validate active handover and TODO SSOT
- Required orchestration mode for this exercise: `spark1_orchestrated`
- Reviewer route if review is configured: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-governance-018` | `system/README.md` |
| `WO-governance-018` | `system/memory/README.md` |
| `WO-governance-018` | `system/reports/README.md` |
| `WO-governance-018` | `system/state/README.md` |
| `WO-governance-018` | `system/workorders/README.md` |
| `WO-governance-018` | `system/workorders/nutrition/README.md` |
| `WO-governance-018` | `system/workorders/nutrition/batches/README.md` |
| `WO-governance-018` | `system/workorders/nutrition/drafts/README.md` |
| `WO-governance-018` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
| `WO-governance-018` | `docs/project/OPEN_TODOS.md` |
| `WO-governance-018` | `docs/project/GOVERNANCE_TODO_REGISTER.json` |
| `WO-governance-018` | `system/project-profiles/profiles/lumeos.json` |
