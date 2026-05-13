# P1-005 Schema-Only Foundation Draft Review

> **Status**: REVIEW_COMPLETE / READY_IF_PROMOTED_AS_SCHEMA_ONLY_SLICE
> **Reviewed files**:
> - `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
> - `docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md`
> **Review mode**: Static only. No DB execution, Supabase command, migration execution, or import activity.

## Decision

The SQL draft is **safe as a non-executable draft artifact** and **is ready to be promoted into a real migration candidate only if it is promoted explicitly as a schema-only slice**.

## What Is Good

1. The draft stays outside `supabase/migrations/` and clearly marks itself non-executable.
2. The SQL body is additive-only:
   - `create schema if not exists nutrition`
   - `create table if not exists nutrition.nutrient_defs`
   - one additive index
3. The draft avoids destructive SQL, import logic, credentials, runtime state, and queue state.
4. The validation plan keeps review in dry-run/read-only governance tooling.

## Promotion Scope Decision

The prior ambiguity is now resolved:

- this candidate is **not** a full foundation migration
- this candidate is **not** a seed payload candidate
- this candidate is **not** an RDA update candidate
- this candidate is **not** a BLS import candidate
- this candidate is **only** a schema-only slice candidate for structural objects

## What This Candidate Includes

- `create schema if not exists nutrition`
- `create table if not exists nutrition.nutrient_defs`
- one additive index on `nutrition.nutrient_defs`

## What This Candidate Explicitly Excludes

`SPEC_06_DATABASE_SCHEMA.md` also contains follow-up material that remains intentionally out of scope for this slice:

- nutrient_defs seed payload
- RDA update statements
- BLS import logic
- Supabase apply / migration execution

## Rollback / Validation Posture

The validation plan is correct for a draft-only review and is now appropriately aligned to the chosen promotion target:

- exact promotion scope: `schema-only slice`
- exact separation of follow-up seed/RDA candidates
- exact rollback strategy for the schema-only promoted scope

## Recommendation

Promote this draft **only as a schema-only slice**.

Do **not** widen it during promotion. In particular, do not add:

- nutrient_defs seed payload
- RDA updates
- BLS import logic
- Supabase apply / migration execution

## Smallest Safe Follow-Up

The smallest safe follow-up is a narrow promotion review for a schema-only migration candidate path. Seed payload and RDA updates should be prepared as separate follow-up candidates.

## Final Review Result

- **Static safety**: pass
- **Additive-only safety**: pass
- **Validation-plan quality**: pass
- **Ready for migration-candidate promotion**: **yes, only as a schema-only slice**
