# BATCH-GOVERNANCE-P1-017-system-tree-audit

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: documentation-only governance audit

## Status

ready_to_run

## Purpose

Create a factual audit of the repository `system/` tree and classify active,
supporting, generated, archived, placeholder, stale, and unknown areas.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> reviewer if configured ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-GOVERNANCE-P1-017-system-tree-audit.md` | `WO-governance-017` | `system-tree-audit` | `standard` | not required; audit/docs only |

## Execution Guard

- Audit and explanation only
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
| `WO-governance-017` | `docs/project/system-structure/SYSTEM_TREE_AUDIT.md` |
| `WO-governance-017` | `docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json` |
| `WO-governance-017` | `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md` |
| `WO-governance-017` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
| `WO-governance-017` | `docs/project/OPEN_TODOS.md` |
| `WO-governance-017` | `docs/project/GOVERNANCE_TODO_REGISTER.json` |
| `WO-governance-017` | `system/project-profiles/profiles/lumeos.json` |
