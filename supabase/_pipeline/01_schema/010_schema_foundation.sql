-- STATUS: NON_EXECUTABLE_SQL_DRAFT
-- PURPOSE: First non-planning P1-005 schema-only foundation slice candidate.
-- DO NOT APPLY. DO NOT COPY INTO supabase/migrations/ WITHOUT A NEW EXPLICIT EXECUTION DECISION.
-- AUTHORIZATION BOUNDARY:
--   - No DB apply
--   - No Supabase command
--   - No migration execution
--   - No BLS import
--   - No raw BLS commit
--
-- SOURCE CHAIN:
--   - docs/project/p1-005/P1-005-additive-migration-candidate-plan.md
--   - docs/project/p1-005/P1-005-rollback-and-validation-checklist.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md
--   - docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md
--   - docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md
--
-- WHY THIS IS THE FIRST NON-PLANNING CANDIDATE:
--   This draft moves from prose planning into concrete SQL shape, while staying additive,
--   reviewable, schema-only, and fully outside the executable migration path.

-- PROMOTION STATUS:
--   Promoted as source material for the non-executed migration candidate:
--   supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql
--   The migration candidate remains review-only until a later explicit execution decision.

-- Candidate future migration name if later promoted as a schema-only slice:
--   supabase/migrations/20260513_001_nutrition_schema_foundation_slice.sql

begin;

-- Schema-only slice scope. Keep this first candidate narrow:
-- 1. Create the nutrition schema.
-- 2. Create nutrient_defs structure only.
-- Excluded intentionally from this schema-only slice:
-- - foods / food_nutrients bulk structures
-- - nutrient_defs seed payload
-- - RDA update statements
-- - BLS import logic or staging/import execution paths
-- - RLS policies
-- - grants
-- - Supabase apply / migration execution
-- - migration history mutations

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

-- Review notes:
-- - nutrient_defs is explicitly defined in SPEC_06.
-- - The index is additive and does not introduce data or policy behavior.
-- - No nutrient_defs seed statements are included in this schema-only slice.
-- - No RDA updates are included in this schema-only slice.
-- - No down/rollback SQL is authored here; rollback remains documented in the paired validation plan.

rollback;
