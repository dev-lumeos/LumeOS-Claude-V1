// C-342: Formgebundene IE-Faktoren, UL-Geltung und Plan-Herkunft.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const CLIENT_ID = '10000000-0000-0000-0000-000000000101'
const COACH_ID = '10000000-0000-0000-0000-000000000901'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-342: Faktoren bleiben formgebunden, UL 0 ist unzulaessig und Planursprung ist getrennt', () => {
  const result = one<{
    factors: Array<{ nutrient_code: string; form_code: string; from_unit: string; to_unit: string; factor: number; source: string }>
    referenceColumns: string[]
    planOriginColumn: boolean
    mealPlanLogs: boolean
    scope: Record<string, string[]>
    zeroUlRejected: boolean
    legacyOriginMissing: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c342_result (zero_ul_rejected boolean NOT NULL);
    DO $$
    BEGIN
      BEGIN
        INSERT INTO nutrition.nutrient_reference_values (
          nutrient_code, reference_kind, population_group, age_min, age_max,
          sex, is_pregnant, is_lactating, value_min, value_max, unit, basis,
          target_applies_to, applies_to_intake_sources, source, source_version,
          source_locator, source_url, notes
        ) VALUES (
          'VITD', 'UL', 'c342_probe', 18, NULL, 'both', false, false,
          0, 0, 'ug/day', 'per_day', ARRAY['VITD'],
          ARRAY['foods', 'fortified_foods', 'supplements', 'pharmacological'],
          'C-342 probe', '2026-08-30', 'zero must fail',
          'https://example.invalid/c342', 'temporary test row'
        );
        INSERT INTO c342_result VALUES (false);
      EXCEPTION WHEN check_violation THEN
        INSERT INTO c342_result VALUES (true);
      END;
    END $$;
    SELECT json_build_object(
      'factors', (SELECT COALESCE(json_agg(json_build_object(
          'nutrient_code', nutrient_code, 'form_code', form_code,
          'from_unit', from_unit, 'to_unit', to_unit, 'factor', factor,
          'source', source
        ) ORDER BY nutrient_code, form_code), '[]'::json)
        FROM nutrition.nutrient_unit_conversion_factors),
      'referenceColumns', (SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
        FROM information_schema.columns
        WHERE table_schema = 'nutrition' AND table_name = 'nutrient_reference_values'
          AND column_name IN ('is_derived', 'derivation_note', 'applies_to_intake_sources')),
      'planOriginColumn', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'nutrition' AND table_name = 'meal_plans' AND column_name = 'plan_origin'
      ),
      'mealPlanLogs', to_regclass('nutrition.meal_plan_logs') IS NOT NULL,
      'scope', (SELECT COALESCE(json_object_agg(nutrient_code, applies_to_intake_sources), '{}'::json)
        FROM nutrition.nutrient_reference_values
        WHERE reference_kind = 'UL' AND nutrient_code IN ('MG', 'NIA', 'FOLAC')),
      'zeroUlRejected', (SELECT bool_and(zero_ul_rejected) FROM c342_result),
      'legacyOriginMissing', (SELECT bool_and(plan_origin IS NULL) FROM nutrition.meal_plans)
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.factors.map(({ nutrient_code, form_code, from_unit, to_unit, factor }) => ({ nutrient_code, form_code, from_unit, to_unit, factor })), [
    { nutrient_code: 'VITA', form_code: 'dietary_alpha_carotene', from_unit: 'ug RAE', to_unit: 'IU', factor: 40 },
    { nutrient_code: 'VITA', form_code: 'dietary_beta_carotene', from_unit: 'ug RAE', to_unit: 'IU', factor: 20 },
    { nutrient_code: 'VITA', form_code: 'dietary_beta_cryptoxanthin', from_unit: 'ug RAE', to_unit: 'IU', factor: 40 },
    { nutrient_code: 'VITA', form_code: 'retinol', from_unit: 'ug RAE', to_unit: 'IU', factor: 3.3333333333 },
    { nutrient_code: 'VITA', form_code: 'supplemental_beta_carotene', from_unit: 'ug RAE', to_unit: 'IU', factor: 3.3333333333 },
    { nutrient_code: 'VITD', form_code: 'vitamin_d2', from_unit: 'ug', to_unit: 'IU', factor: 40 },
    { nutrient_code: 'VITD', form_code: 'vitamin_d3', from_unit: 'ug', to_unit: 'IU', factor: 40 },
  ])
  assert.ok(result.factors.every(row => row.source.length > 0))
  assert.deepEqual(result.referenceColumns, ['applies_to_intake_sources', 'derivation_note', 'is_derived'])
  assert.equal(result.planOriginColumn, true)
  assert.equal(result.mealPlanLogs, true)
  assert.deepEqual(result.scope, {
    FOLAC: ['supplements'],
    MG: ['supplements', 'pharmacological'],
    NIA: ['fortified_foods', 'supplements'],
  })
  assert.equal(result.zeroUlRejected, true)
  assert.equal(result.legacyOriginMissing, true)
})

test('C-342: Nutrition-Stufe 3 erlaubt dem Coach keine direkte Planbearbeitung', () => {
  const result = one<{ direct: boolean }>(`
    SELECT json_build_object(
      'direct', coach.darf_nutrition_plan_aendern('${CLIENT_ID}'::uuid)
    )
    FROM (SELECT set_config('request.jwt.claim.sub', '${COACH_ID}', false)) AS session_claim;
  `)

  assert.equal(result.direct, false)
})
