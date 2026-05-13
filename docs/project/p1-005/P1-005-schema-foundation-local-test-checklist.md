# P1-005 Schema Foundation Local Test Checklist

> **Status**: LOCAL_ONLY_SEED_APPLIED
> **Migration already applied locally**: `supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql`
> **Environment**: local Supabase/Test DB only

## Purpose

This checklist defines the next local-only verification steps after the successful local apply of the schema-only Nutrition foundation slice.

It is for Tom's local testing only.

## Scope

Covered here:

- local verification of `nutrition.nutrient_defs`
- local inspection of schema shape
- local confirmation that the approved local-only `nutrient_defs` seed boundary contains exactly 138 rows
- local confirmation that partial RDA/reference fields remain source-bound
- local preparation for future non-local decisions

Not covered here:

- DEV promotion
- LIVE/prod promotion
- seed payload
- RDA updates
- RDA/reference-values backfill
- BLS import
- any broader DB work

## Local Facts Already Proven

The following are already confirmed on local Supabase/Test DB for the first applied schema slice:

- `nutrition.nutrient_defs` exists
- 14 foundation-slice columns exist
- primary key on `code` exists
- `display_tier` check exists
- `nutrient_defs_group_sort_idx` exists

The current local target shape after the Thai i18n correction slice is:

- 16 columns total
- `name_th` present as `text not null`
- `group_th` present as `text not null`

The local-only nutrient_defs seed boundary has now also been applied to local Supabase/Test DB only:

- `nutrition.nutrient_defs` row count is 138
- all 138 rows have `name_th = ''`
- all 138 rows have `group_th = ''`
- UTF-8 correction has been applied locally after the first seed pipe corrupted German text through `??` replacement sequences
- local validation now confirms zero rows where `name_de`, `group_de`, or `unit` contains `??`
- sample checks now preserve `Aminosäuren`, `Essigsäure`, `Kohlenhydrate, verfügbar`, and `Fettlösliche Vitamine`
- `rda_male` and `rda_female` remain partial by design; values exist only where explicitly declared in the current source/spec
- missing RDA values are not local test failures and must remain `NULL` unless a verified future source candidate authorizes them
- no DEV/LIVE action, BLS import, raw BLS commit, migration execution outside local, or broader DB work was performed

## Open RDA / Reference-Values Boundary

The current local `nutrition.nutrient_defs` seed does not complete the RDA/reference-values model.

- Current RDA fields are partial by design.
- Missing RDA values are not errors.
- Do not infer missing values from nutrient name, unit, group, neighboring rows, or male/female symmetry.
- Do not backfill from internet sources.
- Do not use DGE, EFSA, NIH, or other authority values unless a future explicit source-candidate validates those sources.
- Do not copy male/female values unless both are explicitly sourced.
- A future `nutrient_reference_values` / RDA source candidate must decide RDA/AI/UL modeling, sex and age groups, units, region/source priority, source references, validation rules, and rollback posture.
- That future reference-values candidate is separate from BLS import and separate from the `nutrient_defs` schema/seed boundary.

## Local-Only Verification Commands

```powershell
docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select to_regclass('nutrition.nutrient_defs') as nutrient_defs_regclass;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select column_name, data_type, is_nullable from information_schema.columns where table_schema='nutrition' and table_name='nutrient_defs' order by ordinal_position;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select indexname, indexdef from pg_indexes where schemaname='nutrition' and tablename='nutrient_defs' order by indexname;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select conname, pg_get_constraintdef(c.oid) as definition from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_namespace n on n.oid = t.relnamespace where n.nspname='nutrition' and t.relname='nutrient_defs' order by conname;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select count(*) as row_count, count(*) filter (where name_th = '') as empty_name_th, count(*) filter (where group_th = '') as empty_group_th from nutrition.nutrient_defs;"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select count(*) as corrupted_text_rows from nutrition.nutrient_defs where name_de like '%??%' or group_de like '%??%' or unit like '%??%';"

docker exec supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres -c "select code, name_de, group_de from nutrition.nutrient_defs where code in ('AAE9','ACEAC','CHO','VITA') order by code;"
```

## Local Review Checklist

- [ ] `nutrition.nutrient_defs` resolves through `to_regclass`
- [ ] exactly the expected structural columns are present for the active local slice under review
- [ ] target shape remains 16 columns total
- [ ] `name_th` is `text not null default ''`
- [ ] `group_th` is `text not null default ''`
- [ ] local-only seed rows are present only after the explicit seed boundary
- [ ] `row_count = 138`
- [ ] `empty_name_th = 138`
- [ ] `empty_group_th = 138`
- [ ] `corrupted_text_rows = 0`
- [ ] German UTF-8 samples render as `Aminosäuren`, `Essigsäure`, `Kohlenhydrate, verfügbar`, and `Fettlösliche Vitamine`
- [ ] no RDA update step was bundled into the migration
- [ ] missing RDA/reference values remain accepted as source-bound gaps, not defects
- [ ] no inferred, internet-sourced, or copied male/female RDA values were added
- [ ] no BLS import logic or staging/import objects were bundled into the migration
- [ ] index and constraint names match the reviewed candidate
- [ ] no unexpected extra Nutrition tables were introduced by this local-only step

## Stop Conditions

Stop and do not widen scope if any of the following is true:

- local schema shape differs from the reviewed candidate
- unexpected Nutrition tables appear
- any test attempt requires seed payload, RDA updates, or BLS import to continue
- any test attempt requires inferred/backfilled RDA/reference values to continue
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
- RDA/reference-values backfill
- BLS import
