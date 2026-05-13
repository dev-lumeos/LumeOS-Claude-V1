# P1-005 Schema Foundation Draft Validation Plan

> **Status**: NON_EXECUTABLE_DRAFT
> **Purpose**: Validate the first additive SQL candidate for P1-005 without DB execution.
> **Authorization**: No DB work, no Supabase commands, no migration execution, no BLS import.

## Candidate Under Review

- Draft SQL: `docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql`
- Intended future migration path only if later approved:
  - `supabase/migrations/20260513_001_nutrition_schema_foundation.sql`

## Why This Is The First Safe Non-Planning Step

This candidate is narrower than a full Nutrition migration set:

- it converts planning into concrete SQL shape
- it stays outside `supabase/migrations/`
- it uses only additive schema foundation elements
- it excludes seeds, import logic, RLS, grants, DB apply, and migration execution

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
4. Promotion readiness for a later execution-boundary decision

Do not validate by running SQL.

## Review Checklist

### Structural checks

- [ ] Draft remains outside `supabase/migrations/`
- [ ] Draft contains additive statements only
- [ ] No destructive SQL appears
- [ ] No import logic appears
- [ ] No seed inserts appear
- [ ] No production credentials, endpoints, or environment assumptions appear

### Source-chain checks

- [ ] Every table/column in the draft is explicitly supported by `SPEC_06_DATABASE_SCHEMA.md`
- [ ] The draft does not claim raw-source facts beyond the completed planning outputs
- [ ] The draft matches the staged ordering described in `P1-005-additive-migration-candidate-plan.md`

### Promotion checks

- [ ] Candidate future migration filename is only a proposal, not an active migration
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

- the candidate needs writing under `supabase/migrations/`
- the candidate needs seed data authoring
- the candidate needs raw BLS import logic
- the candidate requires Supabase CLI use
- the candidate expands into RLS, grants, or bulk table creation beyond this foundation-only scope

## What Remains Blocked

Still blocked until a later explicit execution decision:

- promotion into `supabase/migrations/`
- any SQL execution
- any Supabase command
- any DB apply
- any BLS import or raw-data commit

## Next Approval Boundary

Tom must explicitly decide whether to open a narrow execution boundary for promoting this reviewed draft into the first real migration-authoring path, or keep all DB/migration work blocked.
