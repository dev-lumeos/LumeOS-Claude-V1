# P1-005 Schema Foundation Local Test Checklist

> **Status**: LOCAL_ONLY_TESTING
> **Migration already applied locally**: `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`
> **Environment**: local Supabase/Test DB only

## Purpose

This checklist defines the next local-only verification steps after the successful local apply of the schema-only Nutrition foundation slice.

It is for Tom's local testing only.

## Scope

Covered here:

- local verification of `nutrition.nutrient_defs`
- local inspection of schema shape
- local confirmation that no seed/import side effects occurred
- local preparation for future non-local decisions

Not covered here:

- DEV promotion
- LIVE/prod promotion
- seed payload
- RDA updates
- BLS import
- any broader DB work

## Local Facts Already Proven

The following are already confirmed on local Supabase/Test DB for the first applied schema slice:

- `nutrition.nutrient_defs` exists
- 14 foundation-slice columns exist
- primary key on `code` exists
- `display_tier` check exists
- `nutrient_defs_group_sort_idx` exists

The next target shape for the Thai i18n correction slice is:

- 16 columns total
- `name_th` present as `text not null`
- `group_th` present as `text not null`

## Local-Only Verification Commands

```powershell
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select to_regclass('nutrition.nutrient_defs') as nutrient_defs_regclass;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select column_name, data_type, is_nullable from information_schema.columns where table_schema='nutrition' and table_name='nutrient_defs' order by ordinal_position;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select indexname, indexdef from pg_indexes where schemaname='nutrition' and tablename='nutrient_defs' order by indexname;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select conname, pg_get_constraintdef(c.oid) as definition from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace where n.nspname='nutrition' and t.relname='nutrient_defs' order by conname;"
```

## Local Review Checklist

- [ ] `nutrition.nutrient_defs` resolves through `to_regclass`
- [ ] exactly the expected structural columns are present for the active local slice under review
- [ ] if the Thai i18n correction slice is applied later, the target shape becomes 16 columns total
- [ ] no seed rows were inserted by this migration step
- [ ] no RDA update step was bundled into the migration
- [ ] no BLS import logic or staging/import objects were bundled into the migration
- [ ] index and constraint names match the reviewed candidate
- [ ] no unexpected extra Nutrition tables were introduced by this local-only step

## Stop Conditions

Stop and do not widen scope if any of the following is true:

- local schema shape differs from the reviewed candidate
- unexpected Nutrition tables appear
- any test attempt requires seed payload, RDA updates, or BLS import to continue
- any next step would require DEV or LIVE promotion

## Next Local-Only Step

Tom should review the local schema result against this checklist and decide whether the schema-only local proof is sufficient to keep the migration local-only for now.

## Explicit Boundary

This checklist does not authorize:

- DEV promotion
- LIVE/prod promotion
- `supabase db push`
- `supabase db reset`
- migration execution outside local
- seed payload
- RDA updates
- BLS import
