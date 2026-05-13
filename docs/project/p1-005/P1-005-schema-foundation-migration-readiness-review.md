# P1-005 Schema-Only Migration Readiness Review

> **Status**: REVIEW_COMPLETE / NOT_READY_FOR_EXECUTION_APPROVAL
> **Reviewed file**: `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`
> **Review mode**: Static only. No Supabase command, no DB apply, no migration execution, no import activity.

## Decision

The promoted schema-only migration candidate is **safe as a review artifact** but **not yet ready for a future execution-boundary approval**.

## What Passes

1. **Additive-only safety**
   - The candidate creates schema, table, and index only.
   - No destructive SQL appears.
   - No seed payload, RDA updates, BLS import logic, grants, or RLS logic is coupled into this file.

2. **Idempotency where appropriate**
   - `create schema if not exists nutrition`
   - `create table if not exists nutrition.nutrient_defs`
   - `create index if not exists nutrient_defs_group_sort_idx`

3. **Schema qualification**
   - The table and index target `nutrition.nutrient_defs`.
   - The candidate does not rely on unqualified object names for DDL targets.

4. **Migration guard posture**
   - The file contains no executable rollback section.
   - The file contains no Supabase CLI instructions.

## Execution-Readiness Blockers

### Blocker 1: Existing-object drift is not handled strongly enough

`create table if not exists nutrition.nutrient_defs (...)` is safe for first creation, but it does **not** reconcile partial or drifted existing state.

If `nutrition.nutrient_defs` already exists with:
- missing columns
- different nullability
- different defaults
- different check constraints

then execution could succeed without producing the intended structural result.

For a real execution boundary, the candidate needs one explicit decision:

1. either execution is allowed **only against a confirmed-empty/no-table state**, or
2. the candidate must be expanded into a drift-aware schema authoring step with explicit `alter table` reconciliation rules.

### Blocker 2: The file is still review-only, not execution-shaped

The candidate intentionally contains:
- review-only header text
- `begin;`
- `rollback;`

That is correct for static review safety, but it is not the final shape for a migration that is actually meant to run.

Before any execution-boundary approval, the repo needs one explicit follow-up change:

- convert the review-only candidate into an execution-shaped migration file, while keeping the same schema-only scope

### Blocker 3: Rollback is documentation-level, not execution-level

The current rollback posture is acceptable for planning and static review:
- rollback notes are kept in documentation
- executable down migration is intentionally absent

But a real execution boundary still needs:
- a concrete rollback hint for this exact migration step
- an explicit statement of the allowed execution precondition
- a concrete validation sequence for post-apply verification

## Belongs In `supabase/migrations`?

Yes, **as a review-only migration candidate**.

No, **not yet as an executable migration artifact**.

The path is appropriate because the repo is now reviewing the exact future migration shape. The blocker is not the path; the blocker is that execution-shaping and drift policy are still unresolved.

## Coupling Review

The candidate remains properly decoupled from later work:

- nutrient seed payload remains separate
- RDA updates remain separate
- BLS import remains separate
- food core tables remain separate

That separation is correct and should be preserved.

## Required Gates Before Future Execution Approval

If Tom later considers execution approval, this candidate should require at least:

- `db-migration-gate`
- `rollback-gate`
- `review-gate`
- `typecheck-gate`
- `test-gate`
- `files-scope-gate`
- `human-approval-gate`

## Final Result

- **Static safety**: pass
- **Additive-only safety**: pass
- **Schema-only boundary**: pass
- **Migration guard posture**: pass
- **Ready for future execution approval**: **no**

## Smallest Safe Next Step

Keep this file review-only and prepare one narrow follow-up refinement:

1. define whether execution assumes a clean/no-table target state, or
2. author a drift-aware schema-only execution candidate that explicitly reconciles existing-object state without widening into seed, RDA, or import work
