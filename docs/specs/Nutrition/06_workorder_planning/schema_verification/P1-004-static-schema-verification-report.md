# Nutrition P1-004 Static Schema Verification Report

## Scope

This report verifies the committed Nutrition P1 schema migration files before any BLS import work.

Verified migrations:

- `supabase/migrations/20240522_001_nutrition_schema_foundation.sql`
- `supabase/migrations/20240522_002_nutrition_food_core_tables.sql`

No Supabase command was executed. No migration was applied. Raw BLS files were not read or modified.

## Result

PASS

## Findings

- Migration ordering is corrected: schema foundation sorts before food core tables.
- `nutrition` schema is created before dependent objects.
- `pg_trgm` is created before trigram index usage.
- `pgcrypto` is created before `gen_random_uuid()` usage.
- Food core tables are declared in dependency order.
- Foreign key references target tables declared earlier in the migration.
- RLS is enabled on all seven food core tables.
- Policy creation is guarded through `pg_policies` checks.
- Rollback/DOWN content remains comment-only.
- Migrations contain no `supabase db push` or `supabase db reset` command.
- Static migration guard allows both migrations.
- `nutrient_defs` seed count is 138.
- `tag_definitions` seed count is 16.
- No placeholder nutrient seed text is present.
- No deprecated RDA updates are used as productive seed.
- `nutrient_reference_values` remains separate and is not faked in WO-003.

## Tom-Only Local Validation

If Tom wants execution-level validation, run it only against a local Supabase project after reviewing the migrations:

```bat
supabase db reset
```

Do not run production `supabase db push` as part of this verification batch.
