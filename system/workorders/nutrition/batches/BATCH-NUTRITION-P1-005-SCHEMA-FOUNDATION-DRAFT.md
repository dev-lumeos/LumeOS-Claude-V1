# BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT

STATUS: EXECUTABLE_SCOPED_BATCH

Queue state: `NOT_QUEUE_RELEASED`

Dispatch state: `SCOPED_EXECUTION_ALLOWED_IF_DISPATCHED_VIA_GOVERNED_WORKFLOW`

Execution authority: exact per-batch product-gate exception only

## Status
candidate_ready_for_review

## Purpose

First tightly scoped non-planning P1-005 execution candidate.

This batch is limited to reviewed draft artifacts only:

- `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
- `docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md`

It exists to convert the completed planning package into one concrete SQL-shape candidate without:

- running DB work
- running Supabase commands
- executing migrations
- importing BLS data
- writing under `supabase/migrations/`

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `../WO-NUTRITION-P1-010-schema-foundation-sql-draft.md` | `WO-nutrition-010` | `p1-005-schema-foundation-sql-draft` | `docs` | not required |
| 2 | `../WO-NUTRITION-P1-011-schema-foundation-draft-validation-plan.md` | `WO-nutrition-011` | `p1-005-schema-foundation-draft-validation-plan` | `docs` | not required |

## Execution Guard

- Exact batch-path allowlist only
- No wildcard product-gate widening
- No other Nutrition batch is allowed by this exception
- Only the two draft outputs above are in scope
- All DB, Supabase, migration, import, approval, runtime-state, queue-state, and routing mutations remain forbidden

## Expected Outputs

| WO | Output |
|---|---|
| `WO-nutrition-010` | `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql` |
| `WO-nutrition-011` | `docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md` |
