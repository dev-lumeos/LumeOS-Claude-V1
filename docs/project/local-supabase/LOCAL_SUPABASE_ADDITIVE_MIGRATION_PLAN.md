# Local Supabase Additive Migration Validation Plan

STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY

This plan is retained for historical governance context. It is not an active migration runbook and does not authorize Supabase commands, DB writes, migration execution, resets, pushes, or product execution.

Date: 2026-05-05

## 1. Scope

This plan defines how to validate the committed Nutrition migrations against the existing local Supabase database without destroying local state.

Scope boundaries:

- Local-only validation.
- Additive migration validation only.
- No production database access.
- No `supabase db reset`.
- No `supabase db push`.
- No `supabase db push --linked`.
- No migration execution by Codex.
- No BLS import.
- No raw BLS file changes.
- No secrets in docs.

## 2. Current DB State Summary

Source: [LOCAL_SUPABASE_INVENTORY_REPORT.md](./LOCAL_SUPABASE_INVENTORY_REPORT.md)

Current known local state:

| Area | State |
| --- | --- |
| Local Supabase | running |
| Studio | `http://127.0.0.1:54323` |
| Local DB target | `postgresql://postgres:<redacted>@127.0.0.1:54322/postgres` |
| Existing public governance tables | `workorders`, `execution_tokens`, `governance_artefacts`, `wo_failure_events` |
| Local migration history | `20260423120000 control_plane_tables` |
| `nutrition` schema | absent |
| Nutrition tables | absent |
| Nutrition migrations in local migration history | absent |
| Row estimates | inspected user tables estimate `0` rows |

Even with zero row estimates, the local database contains schema and migration-history state that must be preserved.

## 3. Migrations To Validate

Committed repo migrations:

| Order | Migration |
| ---: | --- |
| 1 | `supabase/migrations/20240522_001_nutrition_schema_foundation.sql` |
| 2 | `supabase/migrations/20240522_002_nutrition_food_core_tables.sql` |

Expected relationship:

- `20240522_001_nutrition_schema_foundation.sql` creates foundational Nutrition schema objects.
- `20240522_002_nutrition_food_core_tables.sql` depends on the `nutrition` schema and creates Nutrition food-core structures and seeds.

## 4. Why DB Reset Is Forbidden

`supabase db reset` recreates the local database from migrations and seed state. In this repository that would discard the current local database schema state and migration-history state, including the existing control-plane migration record and governance tables.

The local DB is not an empty disposable target. Reset remains forbidden unless Tom explicitly decides to discard the local database and has a backup/recovery plan.

## 5. Safe Strategy Options

### A. Manual Transaction In Local DB With ROLLBACK

Tom-only concept:

1. Open a local DB SQL session.
2. Start a transaction with `BEGIN`.
3. Paste/apply the two Nutrition migration SQL files in order.
4. Run read-only validation `SELECT` checks.
5. End with `ROLLBACK`.

Pros:

- Preserves the existing local database if all DDL remains transactional.
- Fast feedback against the real local database engine and installed extensions.
- Does not write final schema state when rolled back.

Cons:

- Some operations can be awkward in manual transaction testing.
- Human must ensure `ROLLBACK` is reached.
- Migration-history behavior is not equivalent to an actual applied migration.
- If any statement uses behavior that cannot run inside a transaction in the future, this approach must stop.

Safety note:

Postgres supports transactional DDL for many schema changes, but this must still be treated carefully. Do not run this from automation. Tom should use this only as a controlled local dry-run.

### B. Temporary Cloned Local Database Or Container

Tom-only concept:

1. Create a clone/copy of the current local database or a disposable local Postgres/Supabase target.
2. Apply the two Nutrition migrations to the clone only.
3. Run validation checks against the clone.
4. Destroy the clone after review.

Pros:

- Preserves the original local DB.
- Closest safe route for validating actual applied schema state.
- Allows inspection after migration without relying on transaction rollback.

Cons:

- More setup work.
- Supabase service wiring may differ from the original local stack.
- Clone procedure must avoid copying secrets into docs or commits.

### C. Additive Apply To Local DB With Explicit Tom Approval

Tom-only concept:

1. Confirm all read-only preflight checks pass.
2. Apply the Nutrition migrations locally in order without reset.
3. Record migration version only if the apply path is intentionally equivalent to migration application.
4. Run validation checks.
5. Stop immediately on any failure.

Pros:

- Produces the desired local schema if successful.
- Preserves existing control-plane state when applied correctly.

Cons:

- Mutates the main local database.
- Failed partial application may require explicit recovery.
- Requires clear Tom approval before any SQL apply.

This path is not recommended as the first validation step.

## 6. Recommended Path

Recommended sequence:

1. Run read-only conflict checks against the current local DB.
2. Prefer a transaction-based dry-run with explicit `ROLLBACK`.
3. If transaction testing is not feasible or does not provide enough confidence, validate in a cloned local database/container.
4. Apply additively to the main local DB only after Tom explicitly approves the final local application plan.

Do not directly mutate the main local database until Tom approves.

## 7. Validation SQL

Run these `SELECT` checks only after the Nutrition SQL has been applied in a controlled transaction or clone.

### Nutrition Schema Exists

```sql
select exists (
  select 1
  from information_schema.schemata
  where schema_name = 'nutrition'
) as nutrition_schema_exists;
```

Expected: `true`.

### Expected Nutrition Tables Exist

```sql
select table_name
from information_schema.tables
where table_schema = 'nutrition'
order by table_name;
```

Expected tables should include, at minimum:

- `nutrient_defs`
- `tag_definitions`
- food-core tables created by `20240522_002_nutrition_food_core_tables.sql`

### Nutrient Definitions Count

```sql
select count(*) as nutrient_defs_count
from nutrition.nutrient_defs;
```

Expected: `138`.

### Tag Definitions Count

```sql
select count(*) as tag_definitions_count
from nutrition.tag_definitions;
```

Expected: `16`.

### RLS Enabled On Nutrition Tables

```sql
select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'nutrition'
  and c.relkind = 'r'
order by c.relname;
```

Expected: RLS is enabled where the migration/spec requires it.

### Policies Exist

```sql
select schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd
from pg_policies
where schemaname = 'nutrition'
order by tablename, policyname;
```

Expected: policies match the migration/spec and are not duplicated.

### Indexes Exist

```sql
select schemaname,
       tablename,
       indexname,
       indexdef
from pg_indexes
where schemaname = 'nutrition'
order by tablename, indexname;
```

Expected: indexes required by the Nutrition migrations are present.

### Migration History State

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

Expected:

- In transaction dry-run mode before rollback: migration history may reflect only the current session changes until rollback.
- In clone validation: history depends on chosen apply method.
- In direct additive apply: Nutrition migration records should exist only if Tom intentionally uses a migration-history-aware apply path.

### No Unexpected Writes Outside Nutrition Schema

```sql
select schemaname,
       relname as table_name,
       n_live_tup as estimated_rows
from pg_stat_user_tables
where schemaname <> 'nutrition'
order by schemaname, relname;
```

Expected: no unexpected application-data changes outside `nutrition`. System tables may have normal metadata effects depending on the validation path.

## 8. Conflict Checks Before Apply

Run these read-only checks before any transaction dry-run, clone apply, or direct additive apply.

### Nutrition Schema Already Exists

```sql
select exists (
  select 1
  from information_schema.schemata
  where schema_name = 'nutrition'
) as nutrition_schema_exists;
```

Expected before first apply: `false`.

### Existing Nutrition Object Name Conflicts

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'nutrition'
order by table_schema, table_name;
```

Expected before first apply: no rows.

### Required Extensions

```sql
select extname
from pg_extension
order by extname;
```

Expected: required extensions for the Nutrition migrations are either already present or created safely by the migration.

### Existing Policies That Could Conflict

```sql
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'nutrition'
order by tablename, policyname;
```

Expected before first apply: no rows.

### Function Name Conflicts

```sql
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'nutrition'
order by p.proname, arguments;
```

Expected before first apply: no rows unless the object is intentionally pre-existing.

### Migration Versions Already Applied

```sql
select version, name
from supabase_migrations.schema_migrations
where version in ('20240522001', '20240522002', '20240522_001', '20240522_002')
   or name in ('nutrition_schema_foundation', 'nutrition_food_core_tables')
order by version;
```

Expected before first apply: no rows. If rows are present, stop and reconcile migration history before applying anything.

## 9. Rollback / Recovery

No reset.

For transaction dry-run:

- Start with `BEGIN`.
- Apply SQL only inside the transaction.
- Run validation `SELECT`s.
- Finish with `ROLLBACK`.
- Confirm `nutrition` schema is absent afterward if the rollback was expected to remove it.

For cloned DB validation:

- Destroy or discard only the clone.
- Do not alter the original local database.

For explicit additive apply to the main local DB:

- Stop immediately on failure.
- Do not manually drop schemas/tables/functions unless Tom explicitly approves a recovery plan.
- Preserve logs and error output for diagnosis.
- Prefer a forward additive repair migration over ad hoc destructive cleanup.

## 10. Exact Tom-Only Commands

These commands are for Tom to run manually if he approves the corresponding step. They are listed for planning only and were not executed by Codex.

### Read-Only Inventory Recheck

```powershell
supabase status
```

```powershell
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select schema_name from information_schema.schemata order by schema_name;"
```

```powershell
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select version, name from supabase_migrations.schema_migrations order by version;"
```

### Optional Transaction Dry-Run Skeleton

Warning: this applies SQL inside a transaction and must end with `ROLLBACK`. Tom-only.

```sql
begin;

-- Paste contents of:
-- supabase/migrations/20240522_001_nutrition_schema_foundation.sql

-- Paste contents of:
-- supabase/migrations/20240522_002_nutrition_food_core_tables.sql

-- Run validation SELECT checks from this plan.

rollback;
```

### Explicit Warning Before Any Direct Apply

Before applying to the main local DB, Tom must explicitly approve:

- target database
- migration order
- apply method
- whether migration history should be recorded
- recovery approach if a statement fails

Forbidden commands:

```powershell
supabase db reset
supabase db push
supabase db push --linked
supabase migration up
```

## 11. Governance Gate

Before Tom applies anything locally, these gates should be clean:

| Gate | Required Result |
| --- | --- |
| `governance-invariant-check` | no critical/high findings |
| `agent-contract-check` | no critical/high findings |
| `spec-source-chain-check` | Nutrition workorders/source chain pass or known findings resolved |
| `governance-learning-check` | no critical/high governance memory findings |
| `promotion-governance` | clean branch/review state |
| migration guard | committed Nutrition migrations pass static guard |
| inventory check | target DB state matches this plan or differences are reconciled |

## 12. Final Decision Point

Tom must decide whether the next validation should be:

1. transaction dry-run against the current local DB, or
2. cloned local DB validation.

The recommended next decision is to approve a transaction-based local dry-run with explicit `ROLLBACK`. Direct additive apply to the main local DB should wait until that dry-run is reviewed.
