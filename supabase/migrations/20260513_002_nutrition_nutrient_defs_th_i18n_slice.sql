-- STATUS: EXECUTION_CANDIDATE_REVIEW_ONLY
-- PURPOSE: Add Thai i18n columns to nutrition.nutrient_defs as a schema-only local correction slice.
-- DO NOT EXECUTE OUTSIDE A NEW EXPLICIT LOCAL-ONLY EXECUTION DECISION.
-- AUTHORIZATION BOUNDARY:
--   - No DEV or LIVE apply
--   - No Supabase CLI apply or reset
--   - No seed payload
--   - No RDA updates
--   - No BLS import
--   - No raw BLS commit
--
-- WHAT THIS MIGRATION DOES:
--   - verifies that nutrition.nutrient_defs already exists
--   - verifies baseline schema compatibility for the existing de/en columns
--   - adds name_th and group_th when missing
--
-- WHAT THIS MIGRATION DOES NOT DO:
--   - no seed rows
--   - no nutrient_defs data backfill
--   - no RDA updates
--   - no BLS import logic
--   - no other Nutrition tables
--
-- DRIFT ASSUMPTIONS:
--   - this correction depends on the previously applied schema-only foundation slice
--   - it assumes nutrition.nutrient_defs is still empty before any seed payload boundary
--   - if the table is missing, populated, or structurally incompatible, this candidate must stop
--
-- POST-APPLY VALIDATION QUERIES (REFERENCE ONLY):
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'nutrition' AND table_name = 'nutrient_defs'
--   ORDER BY ordinal_position;
--
--   SELECT count(*) FROM nutrition.nutrient_defs;
--
-- ROLLBACK POSTURE:
--   - no executable DOWN migration is authored here
--   - rollback remains a separately approved future action

do $$
declare
  drift_issues text[] := array[]::text[];
  nutrient_count integer := 0;
begin
  if to_regclass('nutrition.nutrient_defs') is null then
    raise exception
      using
        message = 'nutrition.nutrient_defs is missing; apply the schema foundation slice before the Thai i18n correction';
  end if;

  select count(*)::int into nutrient_count from nutrition.nutrient_defs;
  if nutrient_count <> 0 then
    raise exception
      using
        message = 'nutrition.nutrient_defs is not empty; Thai i18n correction candidate requires pre-seed local state',
        detail = format('row_count=%s', nutrient_count);
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
      and column_name = 'name_th'
      and data_type = 'text'
      and is_nullable = 'NO'
  ) is not true
     and exists (
       select 1
       from information_schema.columns
       where table_schema = 'nutrition'
         and table_name = 'nutrient_defs'
         and column_name = 'name_th'
     ) then
    drift_issues := array_append(drift_issues, 'column name_th exists but is not text not null');
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'nutrition'
      and table_name = 'nutrient_defs'
      and column_name = 'group_th'
      and data_type = 'text'
      and is_nullable = 'NO'
  ) is not true
     and exists (
       select 1
       from information_schema.columns
       where table_schema = 'nutrition'
         and table_name = 'nutrient_defs'
         and column_name = 'group_th'
     ) then
    drift_issues := array_append(drift_issues, 'column group_th exists but is not text not null');
  end if;

  if array_length(drift_issues, 1) is not null then
    raise exception
      using
        message = 'nutrition.nutrient_defs Thai i18n drift detected; manual schema reconciliation required before applying correction slice',
        detail = array_to_string(drift_issues, E'\n');
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'nutrition'
      and table_name = 'nutrient_defs'
      and column_name = 'name_th'
  ) then
    alter table nutrition.nutrient_defs add column name_th text not null;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'nutrition'
      and table_name = 'nutrient_defs'
      and column_name = 'group_th'
  ) then
    alter table nutrition.nutrient_defs add column group_th text not null;
  end if;
end
$$;
