# P1-005 Schema Foundation Execution Readiness

> **Status**: READY_FOR_TOM_EXECUTION_DECISION
> **Execution mode**: Not authorized. This package is for review only.
> **Target migration**: `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`

## Exact Migration File

- `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`

## Exact Scope

This candidate is a **schema-only** Nutrition foundation slice.

It is limited to:

- creating schema `nutrition` if absent
- creating `nutrition.nutrient_defs` if absent
- validating an existing `nutrition.nutrient_defs` table against the expected structural shape
- creating `nutrient_defs_group_sort_idx` if absent

## Explicit Exclusions

This candidate does **not** include:

- `nutrient_defs` seed payload
- RDA updates
- BLS import logic
- staging/import execution paths
- RLS policies
- grants
- food core tables
- Supabase apply under this review
- DB apply under this review

Seeds, RDA updates, and BLS import remain separate follow-up candidates.

## Required Gates Before Execution

The following gates must remain active before any future run:

- `human-approval-gate`
- `db-migration-gate`
- `rollback-gate`
- `review-gate`
- `typecheck-gate`
- `test-gate`
- `files-scope-gate`

## Pre-Execution Checks

These checks should be green immediately before any future execution decision:

```powershell
cmd.exe /c node node_modules\typescript\bin\tsc --noEmit
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts --json --project lumeos
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json --project lumeos
cmd.exe /c node --import tsx -e "const fs=require('fs'); import('./system/agent-registry/authorize-tool-call.ts').then(({guardMigrationContent})=>{const sql=fs.readFileSync('supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql','utf8'); const result=guardMigrationContent(sql,'db-migration-agent'); console.log(JSON.stringify(result)); process.exit(result.allowed?0:1);}).catch(err=>{console.error(err); process.exit(1);})"
```

## Execution Command Plan

**DO NOT RUN UNDER THE CURRENT GATE STATE**

This is the exact future execution shape to review, not an authorization:

```powershell
cmd.exe /c supabase db push
```

If a narrower manual SQL apply path is ever preferred instead of `db push`, that must be approved separately. It is not authorized by this package.

## Rollback Plan

Rollback remains a separately approved future action.

Execution-time rollback posture for this exact migration candidate:

- if drift is detected, the migration must stop before applying structural changes
- no executable `DOWN` block is included in the migration file
- rollback must stay schema-only
- any future rollback action must not introduce seed, RDA, or import scope

Reference docs:

- `docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md`
- `docs/project/p1-005/P1-005-rollback-and-validation-checklist.md`

## Post-Apply Validation Queries

**REFERENCE ONLY - DO NOT RUN UNDER THE CURRENT GATE STATE**

```sql
SELECT to_regclass('nutrition.nutrient_defs');

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'nutrition' AND table_name = 'nutrient_defs'
ORDER BY ordinal_position;

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'nutrition' AND tablename = 'nutrient_defs';
```

## Stop Conditions

Stop immediately if any of the following is true:

- static guard no longer allows the migration file
- governance invariant, agent contract, or learning checks regress
- the file widens into seed payload, RDA updates, or BLS import
- execution requires a broader product-gate opening
- execution requires additional schema objects beyond this exact slice
- the target environment contains incompatible `nutrition.nutrient_defs` drift
- any future execution proposal attempts to bundle this with food core tables, grants, or RLS

## Readiness Result

- static SQL safety: pass
- additive-only safety: pass
- schema-only boundary: pass
- drift-aware behavior: pass
- static migration guard: pass
- ready for Tom execution decision: **yes**

## Final Tom Decision Sentence

Tom must explicitly decide whether to open a **narrow schema-only execution boundary** for `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`, while keeping seed payload, RDA updates, BLS import, and all broader DB work blocked.
