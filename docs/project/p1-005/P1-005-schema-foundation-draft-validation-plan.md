# P1-005 Schema-Only Foundation Draft Validation Plan

> **Status**: MIGRATION_CANDIDATE_REVIEW_ONLY
> **Purpose**: Validate the first additive schema-only migration candidate for P1-005 without DB execution.
> **Authorization**: No DB work, no Supabase commands, no migration execution, no BLS import.

## Candidate Under Review

- Source draft SQL: `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
- Migration candidate path:
  - `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`

## Why This Is The First Safe Non-Planning Step

This candidate is narrower than a full Nutrition foundation migration:

- it converts planning into concrete SQL shape
- it is explicitly schema-only
- it is now promoted into a real migration-candidate path
- it uses only additive schema foundation elements
- it excludes the nutrient_defs seed payload
- it excludes RDA updates
- it excludes BLS import logic
- it excludes RLS, grants, DB apply, and migration execution

That makes it the smallest technically meaningful step beyond documentation-only planning.

## Required Source Inputs

- `docs/project/p1-005/P1-005-bls-source-inventory.md`
- `docs/project/p1-005/P1-005-import-field-mapping.md`
- `docs/project/p1-005/P1-005-additive-migration-candidate-plan.md`
- `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md`
- `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md`

## Validation Scope

Validate only:

1. SQL draft coherence against the approved schema spec
2. Additive-only behavior
3. Path safety
4. Promotion readiness for a later schema-only execution-boundary decision

Do not validate by running SQL.

## Review Checklist

### Structural checks

- [ ] Migration candidate filename and header clearly mark review-only status
- [ ] Draft contains additive statements only
- [ ] No destructive SQL appears
- [ ] No import logic appears
- [ ] No nutrient_defs seed payload appears
- [ ] No RDA update statements appear
- [ ] No production credentials, endpoints, or environment assumptions appear

### Source-chain checks

- [ ] Every table/column in the draft is explicitly supported by `SPEC_06_DATABASE_SCHEMA.md`
- [ ] The draft does not claim raw-source facts beyond the completed planning outputs
- [ ] The draft matches the staged ordering described in `P1-005-additive-migration-candidate-plan.md`
- [ ] The draft is clearly framed as a schema-only slice rather than a full foundation migration

### Promotion checks

- [ ] Migration candidate remains review-only and is not treated as execution authorization
- [ ] Nutrient seed payload remains deferred to a separate candidate
- [ ] RDA updates remain deferred to a separate candidate
- [ ] Rollback remains documentation-only
- [ ] Local validation remains limited to dry-run/read-only governance tooling

## Required Dry-Run Commands

```powershell
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --dry-run --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-005-SCHEMA-FOUNDATION-DRAFT.md --doctor --json --project lumeos
```

## Stop Conditions

Stop immediately if:

- the candidate needs nutrient seed data authoring
- the candidate needs RDA update authoring
- the candidate needs raw BLS import logic
- the candidate requires Supabase CLI use
- the candidate expands into RLS, grants, or bulk table creation beyond this foundation-only scope

## What Remains Blocked

Still blocked until a later explicit execution decision:

- any SQL execution
- any Supabase command
- any DB apply
- any nutrient_defs seed payload
- any RDA updates
- any BLS import or raw-data commit

## Next Approval Boundary

Tom must explicitly decide whether to open a narrow execution boundary for executing or further authoring this reviewed schema-only migration candidate, or keep all DB/migration work blocked.
