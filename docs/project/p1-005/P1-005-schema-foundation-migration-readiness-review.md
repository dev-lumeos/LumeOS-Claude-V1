# P1-005 Schema-Only Migration Readiness Review

> **Status**: REVIEW_COMPLETE / READY_FOR_NARROW_EXECUTION_APPROVAL
> **Reviewed file**: `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`
> **Review mode**: Static only. No Supabase command, no DB apply, no migration execution, no import activity.

## Decision

The promoted schema-only migration candidate is **safe as a review artifact** and is now **ready for a future narrow execution-boundary approval**, provided the existing human and DB-migration gates remain in force.

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

## Drift / Execution Notes

### Existing-object drift is now handled explicitly

The candidate now detects incompatible existing-object drift and fails explicitly before proceeding.

If `nutrition.nutrient_defs` already exists with:
- missing columns
- different nullability
- different defaults
- different check constraints

then execution will now stop with a clear drift exception instead of silently succeeding.

This is the correct narrow posture for a schema-only slice because it:

- allows first creation safely
- allows exact-shape reapplication safely
- refuses partial or incompatible state without widening into seed, RDA, or import work

### The file is now execution-shaped

The candidate no longer uses review-only transaction framing such as `begin; ... rollback;`.

It now has:
- explicit scope/do-not-do comments
- explicit drift assumptions
- explicit post-apply validation queries
- explicit rollback posture comments

### Rollback posture

The current rollback posture is acceptable for planning and static review:
- rollback notes are kept in documentation
- executable down migration is intentionally absent

That remains acceptable for a future narrow execution approval because the candidate now carries:
- explicit rollback posture comments
- explicit post-apply validation query references
- explicit drift-stop behavior

## Belongs In `supabase/migrations`?

Yes.

The path is appropriate because the repo is now reviewing the exact future migration shape under the normal db-migration governance gates.

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
- **Drift handling**: pass
- **Ready for future execution approval**: **yes, under a narrow schema-only execution boundary**

## Smallest Safe Next Step

Open only a narrow schema-only execution boundary if Tom wants to proceed. Seed payload, RDA updates, BLS import, Supabase commands, and any broader Nutrition migration work must remain separate follow-up boundaries.
