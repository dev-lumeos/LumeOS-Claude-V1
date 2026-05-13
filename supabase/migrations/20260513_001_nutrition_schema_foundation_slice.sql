-- STATUS: MIGRATION_CANDIDATE_ONLY
-- PURPOSE: P1-005 schema-only foundation slice candidate for later migration promotion.
-- DO NOT EXECUTE. DO NOT APPLY THROUGH SUPABASE OR DIRECT DB ACCESS WITHOUT A NEW EXPLICIT EXECUTION DECISION.
-- AUTHORIZATION BOUNDARY:
--   - No DB apply
--   - No Supabase command
--   - No migration execution
--   - No BLS import
--   - No raw BLS commit
--
-- SOURCE CHAIN:
--   - docs/project/p1-005/sql-drafts/P1-005-nutrition-schema-foundation-candidate.sql
--   - docs/project/p1-005/P1-005-additive-migration-candidate-plan.md
--   - docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md
--
-- SCOPE:
--   This candidate is schema-only.
--   It creates or adjusts structural schema objects only.
--   It explicitly excludes:
--   - nutrient_defs seed payload
--   - RDA update statements
--   - BLS import logic or staging/import execution paths
--   - RLS policies
--   - grants
--   - Supabase apply / migration execution
--
-- ROLLBACK NOTES:
--   No executable down migration is authored here.
--   Use docs/project/p1-005/P1-005-schema-foundation-draft-validation-plan.md
--   and docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--   for non-executing rollback and validation guidance.

begin;

create schema if not exists nutrition;

set search_path = nutrition, public;

create table if not exists nutrition.nutrient_defs (
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
);

create index if not exists nutrient_defs_group_sort_idx
  on nutrition.nutrient_defs (group_en, sort_index);

rollback;
