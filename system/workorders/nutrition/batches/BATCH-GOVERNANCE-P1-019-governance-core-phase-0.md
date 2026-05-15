# BATCH-GOVERNANCE-P1-019-governance-core-phase-0

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: documentation-only governance architecture planning

## Status

ready_to_run

## Purpose

Run Phase 0 of the AI-Governance-Core extraction plan. The batch prepares a
read-only source verification report and a Phase-1 copy manifest for Tom review
before any extraction is approved.

Required governed lifecycle:

Spark1 orchestrator -> assigned worker -> reviewer if configured ->
documentation impact handling -> SSOT_SYNC_CHECK -> dossier.

Routing note: this is a docs-only governance planning task. The existing
`docs-agent` worker route is appropriate. It is not a security-specialist
workorder and must not be rerouted as one.

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-GOVERNANCE-P1-019-governance-core-phase-0.md` | `WO-governance-019` | `governance-core-phase-0` | `standard` | not required; docs/planning only |

## Execution Guard

- Phase-0 planning docs and SSOT pointers only
- No extraction or copy into `D:\GitHub\AI-Governance-Core`
- No file moves, deletes, archive moves, or generated report cleanup
- No product code changes
- No DB/Supabase/migration execution
- No BLS import
- No DEV/LIVE or production routing
- No MiniMax routing
- No service restart
- No runtime behavior change
- No manual runtime_state edits
- No manual queue edits
- Documentation impact is required and must update/validate active handover and TODO SSOT
- Required orchestration mode: `spark1_orchestrated`
- Reviewer route if review is configured: `LUMEOS_FAST_REVIEWER_ROUTE=nemotron-review-agent`

## Expected Outputs

| WO | Output |
|---|---|
| `WO-governance-019` | `docs/project/governance-core-extraction/PHASE_0_SOURCE_VERIFICATION_REPORT.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/PHASE_1_COPY_MANIFEST.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/GOVERNANCE_CORE_EXTRACTION_BLUEPRINT.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/GOVERNANCE_CORE_TARGET_STRUCTURE.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/LUMEOS_PROJECT_REATTACH_PLAN.md` |
| `WO-governance-019` | `docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md` |
| `WO-governance-019` | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` |
| `WO-governance-019` | `docs/project/OPEN_TODOS.md` |
| `WO-governance-019` | `docs/project/GOVERNANCE_TODO_REGISTER.json` |
| `WO-governance-019` | `system/project-profiles/profiles/lumeos.json` |
