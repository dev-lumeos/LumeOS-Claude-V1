# BATCH-NUTRITION-P1-005-IMPORT-PREPARATION-DRAFT

STATUS: NON_EXECUTABLE_DRAFT

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `NOT_DISPATCHABLE`

Execution authority: none

## Purpose

Review-only batch candidate for the next safe `P1-005` step after source-chain readiness.

This candidate exists only to define a planning-only path toward future Nutrition/BLS import and DB work without executing any import, DB, Supabase, migration, or product implementation action.

## Proposed Scope

Allowed future outputs if Tom later opens a narrow planning-only execution boundary:

- `docs/project/p1-005/P1-005-bls-source-inventory.md`
- `docs/project/p1-005/P1-005-import-field-mapping.md`
- `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md`
- `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md`

## Proposed Included Workorders

These are proposed only. They do not exist yet and are not queue released:

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-NUTRITION-P1-006-bls-source-inventory.md` | `WO-nutrition-006` | `p1-005-bls-source-inventory` | `docs` | review only |
| 2 | `WO-NUTRITION-P1-007-import-field-mapping.md` | `WO-nutrition-007` | `p1-005-import-field-mapping` | `docs` | review only |
| 3 | `WO-NUTRITION-P1-008-additive-migration-plan.md` | `WO-nutrition-008` | `p1-005-additive-migration-plan` | `planning` | review only |

## Forbidden Actions

- no BLS import
- no raw BLS commit
- no DB changes
- no Supabase commands
- no migrations
- no product implementation
- no dispatcher execution
- no Codex Worker execution
- no approval grants
- no runtime_state edits
- no queue edits
- no endpoint checks

## Review Gate

This batch candidate is for Tom review only.

It must not be treated as dispatchable, queue-released, or executable.

If Tom later approves a narrow planning-only execution boundary, a separate executable batch must be created explicitly and, if needed, added as its own exact per-batch allowlist entry.
