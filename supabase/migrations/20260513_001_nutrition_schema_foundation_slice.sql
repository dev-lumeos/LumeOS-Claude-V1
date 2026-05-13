-- STATUS: EXECUTION_CANDIDATE_REVIEW_ONLY
-- PURPOSE: P1-005 schema-only foundation slice candidate for later migration execution approval.
-- DO NOT EXECUTE. DO NOT APPLY THROUGH SUPABASE OR DIRECT DB ACCESS WITHOUT A NEW EXPLICIT EXECUTION DECISION.
-- AUTHORIZATION BOUNDARY:
--   - No DB apply
--   - No Supabase command
--   - No migration execution
--   - No BLS import
--   - No raw BLS commit
--
-- WHAT THIS MIGRATION DOES:
--   - creates schema `nutrition` when absent
--   - creates `nutrition.nutrient_defs` when absent
--   - validates an existing `nutrition.nutrient_defs` table against the expected schema-only shape
--   - creates the additive group/sort index when absent
--
-- WHAT THIS MIGRATION DOES NOT DO:
--   - no nutrient_defs seed payload
--   - no RDA update statements
--   - no BLS import logic or staging/import execution paths
--   - no RLS policies
--   - no grants
--
-- DRIFT ASSUMPTIONS:
--   - if `nutrition.nutrient_defs` does not exist, this candidate creates it
--   - if `nutrition.nutrient_defs` already exists and matches the expected structural shape, this candidate is a no-op except for the index
--   - if `nutrition.nutrient_defs` exists with incompatible drift, this candidate must fail immediately and require a separate drift-reconciliation decision
--
-- SOURCE CHAIN:
--   - docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql
--   - docs/project/p1-005/P1-005-additive-migration-candidate-plan.md
--   - docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--   - docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md
--
-- POST-APPLY VALIDATION QUERIES (REFERENCE ONLY - DO NOT RUN UNDER THIS REVIEW):
--   SELECT to_regclass('nutrition.nutrient_defs');
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'nutrition' AND table_name = 'nutrient_defs'
--   ORDER BY ordinal_position;
--   SELECT indexname, indexdef
--   FROM pg_indexes
--   WHERE schemaname = 'nutrition' AND tablename = 'nutrient_defs';
--
-- ROLLBACK POSTURE:
--   - no executable DOWN migration is authored here
--   - rollback remains a separately approved future action
--   - use docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md
--     and docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--     for non-executing rollback and post-apply validation guidance

create schema if not exists nutrition;

do $$
declare
  drift_issues text[] := array[]::text[];
begin
  if to_regclass('nutrition.nutrient_defs') is null then
    execute $ddl$
      create table nutrition.nutrient_defs (
        code                text primary key,
        name_de             text not null,
        name_en             text not null,
        unit                text not null,
        group_de            text not null,
        group_en            text not null,
        sort_index          integer not null,
        display_tier        integer not null default 2 check (display_tier in (1, 2, 3)),
        is_always_computed  boolean not null default false,
        is_partly_computed  boolean not null default false,
        formula             text,
        rda_male            numeric(10,3),
        rda_female          numeric(10,3),
        rda_unit            text
      )
    $ddl$;
  else
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'code'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column code must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'name_de'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column name_de must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'name_en'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column name_en must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'unit'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column unit must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'group_de'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column group_de must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'group_en'
        and data_type = 'text'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column group_en must exist as text not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'sort_index'
        and data_type = 'integer'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column sort_index must exist as integer not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'display_tier'
        and data_type = 'integer'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column display_tier must exist as integer not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'is_always_computed'
        and data_type = 'boolean'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column is_always_computed must exist as boolean not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'is_partly_computed'
        and data_type = 'boolean'
        and is_nullable = 'NO'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column is_partly_computed must exist as boolean not null');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'formula'
        and data_type = 'text'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column formula must exist as text');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'rda_male'
        and data_type = 'numeric'
        and numeric_precision = 10
        and numeric_scale = 3
    ) is not true then
      drift_issues := array_append(drift_issues, 'column rda_male must exist as numeric(10,3)');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'rda_female'
        and data_type = 'numeric'
        and numeric_precision = 10
        and numeric_scale = 3
    ) is not true then
      drift_issues := array_append(drift_issues, 'column rda_female must exist as numeric(10,3)');
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'nutrition'
        and table_name = 'nutrient_defs'
        and column_name = 'rda_unit'
        and data_type = 'text'
    ) is not true then
      drift_issues := array_append(drift_issues, 'column rda_unit must exist as text');
    end if;

    if exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
       and tc.table_schema = kcu.table_schema
       and tc.table_name = kcu.table_name
      where tc.table_schema = 'nutrition'
        and tc.table_name = 'nutrient_defs'
        and tc.constraint_type = 'PRIMARY KEY'
        and kcu.column_name = 'code'
    ) is not true then
      drift_issues := array_append(drift_issues, 'primary key on code must exist');
    end if;

    if exists (
      select 1
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'nutrition'
        and t.relname = 'nutrient_defs'
        and c.contype = 'c'
        and pg_get_constraintdef(c.oid) like '%display_tier IN (1, 2, 3)%'
    ) is not true then
      drift_issues := array_append(drift_issues, 'display_tier check constraint must enforce values 1, 2, 3');
    end if;

    if array_length(drift_issues, 1) is not null then
      raise exception
        using
          message = 'nutrition.nutrient_defs drift detected; manual schema reconciliation required before applying schema-only slice',
          detail = array_to_string(drift_issues, E'\n');
    end if;
  end if;
end
$$;

create index if not exists nutrient_defs_group_sort_idx
  on nutrition.nutrient_defs (group_en, sort_index);
