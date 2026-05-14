-- STATUS: LOCAL_EXECUTION_CANDIDATE
-- PURPOSE: P1-005 local-only Nutrition food foundation schema slice.
-- AUTHORIZATION BOUNDARY:
--   - Local Supabase/Test DB only after gates pass
--   - No DEV/LIVE
--   - No Supabase Cloud
--   - No BLS import
--   - No raw BLS commit
--   - No seed/import rows
--   - No food search/UI
--
-- WHAT THIS MIGRATION DOES:
--   - verifies that nutrition.nutrient_defs exists
--   - creates nutrition.foods when absent
--   - creates nutrition.food_nutrients when absent
--   - creates supporting indexes for future read/query work
--   - ensures nutrition.food_nutrients.nutrient_code references nutrition.nutrient_defs(code)
--
-- WHAT THIS MIGRATION DOES NOT DO:
--   - no food rows
--   - no food_nutrients rows
--   - no BLS import logic
--   - no raw BLS data
--   - no seed payload
--   - no RDA/reference value updates
--   - no food search route or UI
--   - no DEV/LIVE apply
--
-- DRIFT ASSUMPTIONS:
--   - if nutrition.foods or nutrition.food_nutrients are absent, this slice creates them
--   - if either table already exists with the required compatible shape, this slice is additive/no-op
--   - if existing objects are incompatible, this slice fails with a drift error and requires a separate reconciliation decision
--
-- SOURCE CHAIN:
--   - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
--   - docs/project/p1-005/P1-005-bls-source-inventory.md
--   - docs/project/p1-005/P1-005-import-field-mapping.md
--   - docs/project/p1-005/P1-005-additive-migration-candidate-plan.md
--   - docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--
-- POST-APPLY VALIDATION QUERIES:
--   SELECT to_regclass('nutrition.foods') AS foods_table;
--   SELECT to_regclass('nutrition.food_nutrients') AS food_nutrients_table;
--   SELECT count(*) FROM nutrition.foods;
--   SELECT count(*) FROM nutrition.food_nutrients;
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'nutrition.food_nutrients'::regclass
--     AND contype = 'f';
--
-- ROLLBACK POSTURE:
--   - no executable DOWN migration is authored here
--   - local rollback, if needed, requires a separate explicit rollback boundary
--   - because this slice inserts no rows, expected post-apply row counts are zero

create schema if not exists nutrition;

do $$
declare
  drift_issues text[] := array[]::text[];
begin
  if to_regclass('nutrition.nutrient_defs') is null then
    raise exception
      using message = 'nutrition.nutrient_defs is missing; apply and seed the local nutrient foundation before food foundation';
  end if;

  if to_regclass('nutrition.foods') is null then
    create table nutrition.foods (
      id           uuid primary key default gen_random_uuid(),
      bls_code     text unique not null,
      name_de      text not null,
      name_en      text,
      name_th      text not null default '',
      name_display text,
      sort_weight  integer not null default 500 check (sort_weight between 0 and 1000),
      created_at   timestamptz not null default now(),
      updated_at   timestamptz not null default now()
    );
  else
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'foods'
        and column_name = 'id'
        and data_type = 'uuid'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.foods.id must exist as uuid not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'foods'
        and column_name = 'bls_code'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.foods.bls_code must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'foods'
        and column_name = 'name_de'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.foods.name_de must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
       and tc.table_schema = kcu.table_schema
       and tc.table_name = kcu.table_name
      where tc.table_schema = 'nutrition'
        and tc.table_name = 'foods'
        and tc.constraint_type = 'PRIMARY KEY'
        and kcu.column_name = 'id'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.foods primary key on id must exist');
    end if;

    if exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
       and tc.table_schema = kcu.table_schema
       and tc.table_name = kcu.table_name
      where tc.table_schema = 'nutrition'
        and tc.table_name = 'foods'
        and tc.constraint_type = 'UNIQUE'
        and kcu.column_name = 'bls_code'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.foods unique constraint on bls_code must exist');
    end if;
  end if;

  if to_regclass('nutrition.food_nutrients') is null then
    create table nutrition.food_nutrients (
      food_id       uuid not null references nutrition.foods(id) on delete cascade,
      nutrient_code text not null references nutrition.nutrient_defs(code),
      value         numeric(12,5) not null,
      data_source   text not null default 'bls_4_0',
      primary key (food_id, nutrient_code)
    );
  else
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'food_nutrients'
        and column_name = 'food_id'
        and data_type = 'uuid'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.food_nutrients.food_id must exist as uuid not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'food_nutrients'
        and column_name = 'nutrient_code'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.food_nutrients.nutrient_code must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'food_nutrients'
        and column_name = 'value'
        and data_type = 'numeric'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.food_nutrients.value must exist as numeric not null');
    end if;

    if exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
       and tc.table_schema = kcu.table_schema
       and tc.table_name = kcu.table_name
      where tc.table_schema = 'nutrition'
        and tc.table_name = 'food_nutrients'
        and tc.constraint_type = 'PRIMARY KEY'
        and kcu.column_name in ('food_id', 'nutrient_code')
      group by tc.constraint_name
      having count(distinct kcu.column_name) = 2
    ) is not true then
      drift_issues := array_append(drift_issues, 'nutrition.food_nutrients primary key on food_id, nutrient_code must exist');
    end if;
  end if;

  if exists (
    select 1
    from pg_constraint c
    join pg_class source_table on source_table.oid = c.conrelid
    join pg_namespace source_ns on source_ns.oid = source_table.relnamespace
    join pg_class target_table on target_table.oid = c.confrelid
    join pg_namespace target_ns on target_ns.oid = target_table.relnamespace
    join unnest(c.conkey) with ordinality source_key(attnum, ordinality) on true
    join pg_attribute source_attribute
      on source_attribute.attrelid = source_table.oid
     and source_attribute.attnum = source_key.attnum
    join unnest(c.confkey) with ordinality target_key(attnum, ordinality)
      on target_key.ordinality = source_key.ordinality
    join pg_attribute target_attribute
      on target_attribute.attrelid = target_table.oid
     and target_attribute.attnum = target_key.attnum
    where c.contype = 'f'
      and source_ns.nspname = 'nutrition'
      and source_table.relname = 'food_nutrients'
      and source_attribute.attname = 'nutrient_code'
      and target_ns.nspname = 'nutrition'
      and target_table.relname = 'nutrient_defs'
      and target_attribute.attname = 'code'
  ) is not true then
    drift_issues := array_append(drift_issues, 'nutrition.food_nutrients must reference nutrition.nutrient_defs(code)');
  end if;

  if array_length(drift_issues, 1) is not null then
    raise exception
      using
        message = 'nutrition food foundation drift detected; manual schema reconciliation required before applying local slice',
        detail = array_to_string(drift_issues, E'\n');
  end if;
end
$$;

create index if not exists foods_bls_code_idx
  on nutrition.foods (bls_code);

create index if not exists foods_sort_weight_idx
  on nutrition.foods (sort_weight desc);

create index if not exists food_nutrients_food_idx
  on nutrition.food_nutrients (food_id);

create index if not exists food_nutrients_nutrient_code_idx
  on nutrition.food_nutrients (nutrient_code);
