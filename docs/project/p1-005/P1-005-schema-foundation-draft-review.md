# P1-005 Schema Foundation Draft Review

> **Status**: REVIEW_COMPLETE / NOT_READY_FOR_PROMOTION
> **Reviewed files**:
> - `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
> - `docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md`
> **Review mode**: Static only. No DB execution, Supabase command, migration execution, or import activity.

## Decision

The SQL draft is **safe as a non-executable draft artifact** but **not yet ready to be promoted into a real migration candidate**.

## What Is Good

1. The draft stays outside `supabase/migrations/` and clearly marks itself non-executable.
2. The SQL body is additive-only:
   - `create schema if not exists nutrition`
   - `create table if not exists nutrition.nutrient_defs`
   - one additive index
3. The draft avoids destructive SQL, import logic, credentials, runtime state, and queue state.
4. The validation plan keeps review in dry-run/read-only governance tooling.

## Promotion Blockers

### Blocker 1: Foundation scope is incomplete relative to the approved schema source

`SPEC_06_DATABASE_SCHEMA.md` defines `nutrition.nutrient_defs` as both:

- table structure
- seed payload for 138 nutrient definitions
- follow-up RDA update statements

The current SQL draft includes only the table definition and one index:

- draft table scope: `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
- approved source scope: `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`

That means the draft is not yet a complete candidate for the first real migration-authoring boundary if the intended target is the schema-foundation migration described in the spec/history.

### Blocker 2: Promotion target is ambiguous

The draft names a future migration path:

- `supabase/migrations/20260513_001_nutrition_schema_foundation.sql`

But its actual content is narrower than the historically referenced foundation migration scope in:

- `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md`

That historical reference expects the foundation migration to create foundational Nutrition schema objects, while the draft currently covers only:

- schema creation
- one table
- one index

Before promotion, the repo needs one explicit decision:

1. either this remains a **foundation slice** candidate with a renamed target
2. or it is expanded to match the intended first real migration scope

### Blocker 3: Rollback posture is review-safe but not promotion-complete

The validation plan is correct for a draft-only review, but a real migration candidate needs a stronger pairing:

- exact promotion scope
- exact seed inclusion/exclusion decision
- exact rollback strategy for that promoted scope

Right now the rollback material is still deliberately generic, which is appropriate for planning but not sufficient for promotion to an actual migration candidate.

## Recommendation

Do **not** promote this draft yet.

Recommended next change before any execution-boundary approval:

1. Decide whether the first real migration candidate is:
   - `schema_only_slice`, or
   - `full_foundation_with_nutrient_defs_seed`
2. Align the SQL draft and validation plan to that exact target.
3. Only then ask for promotion approval.

## Smallest Safe Follow-Up

The smallest safe follow-up is **not** DB execution.

It is one of these two documentation-level refinements:

- **Option A — recommended**
  Rename/reframe the artifact as a `schema-only slice` candidate and keep seeds explicitly out of scope.

- **Option B**
  Expand the draft into a fuller foundation candidate by adding only the documented `nutrient_defs` seed and RDA update section, still outside `supabase/migrations/` and still non-executable.

## Final Review Result

- **Static safety**: pass
- **Additive-only safety**: pass
- **Validation-plan quality**: pass
- **Ready for migration-candidate promotion**: **no**
