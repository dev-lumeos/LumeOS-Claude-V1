// C-350/E-34: Vitamin A wird aus BLS-Komponenten bewertet, EFSA ist die
// bevorzugte Magnesium-UL und die kompakte Flag-Funktion bleibt äquivalent.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const USER_ID = '10000000-0000-0000-0000-000000000101'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-350: Vitamin A wird nur aus vollständigen BLS-Komponenten als IE ausgegeben', () => {
  const result = one<{
    factors: Array<{ nutrient_code: string; factor: number; from_unit: string; to_unit: string }>
    day: { status: string; total_iu: number | null; value_complete: boolean; incomplete_component_count: number }
  }>(`
    SELECT json_build_object(
      'factors', (SELECT json_agg(json_build_object(
          'nutrient_code', nutrient_code, 'factor', factor,
          'from_unit', from_unit, 'to_unit', to_unit
        ) ORDER BY nutrient_code)
        FROM nutrition.nutrient_unit_conversion_factors
        WHERE nutrient_code IN ('RETOL', 'CARTB', 'CAROTPAXB')),
      'day', (SELECT row_to_json(d)
        FROM nutrition.vitamin_a_iu_daily('${USER_ID}'::uuid, DATE '2026-08-01') d)
    );
  `)

  assert.deepEqual(result.factors, [
    { nutrient_code: 'CAROTPAXB', factor: 0.8333333333, from_unit: 'ug', to_unit: 'IU' },
    { nutrient_code: 'CARTB', factor: 1.6666666667, from_unit: 'ug', to_unit: 'IU' },
    { nutrient_code: 'RETOL', factor: 3.3333333333, from_unit: 'ug', to_unit: 'IU' },
  ])
  assert.equal(result.day.status, 'incomplete')
  assert.equal(result.day.total_iu, null)
  assert.equal(result.day.value_complete, false)
  assert.ok(result.day.incomplete_component_count > 0)
})

test('C-350: EFSA 250 mg ist die bevorzugte Magnesium-UL, NAM 350 mg bleibt erhalten', () => {
  const result = one<{
    magnesiumUls: Array<{ source: string; value_max: number; source_priority: number; intake_sources: string[] }>
    selected: { reference_value_max: number; source: string }
  }>(`
    SELECT json_build_object(
      'magnesiumUls', (SELECT json_agg(json_build_object(
          'source', source, 'value_max', value_max,
          'source_priority', source_priority,
          'intake_sources', applies_to_intake_sources
        ) ORDER BY source_priority DESC, source)
        FROM nutrition.nutrient_reference_values
        WHERE nutrient_code = 'MG' AND reference_kind = 'UL'),
      'selected', (SELECT json_build_object(
          'reference_value_max', a.reference_value_max,
          'source', a.source
        )
        FROM nutrition.daily_reference_assessment('${USER_ID}'::uuid, DATE '2026-08-29') a
        WHERE a.nutrient_code = 'MG' AND a.reference_kind = 'UL')
    );
  `)

  assert.deepEqual(result.magnesiumUls, [
    {
      source: 'EFSA tolerable upper intake level for magnesium',
      value_max: 250,
      source_priority: 100,
      intake_sources: ['supplements', 'pharmacological'],
    },
    {
      source: 'National Academies Dietary Reference Intakes',
      value_max: 350,
      source_priority: 0,
      intake_sources: ['supplements', 'pharmacological'],
    },
  ])
  assert.deepEqual(result.selected, {
    reference_value_max: 250,
    source: 'EFSA tolerable upper intake level for magnesium',
  })
})

test('C-349: kompakte Flag-Antwort hat dieselben zehn Zähler wie die Tagesreihe', () => {
  type FlagCount = {
    nutrient_code: string
    reference_direction: string
    triggered_day_count: number
    assessed_day_count: number
    incomplete_day_count: number
  }
  const result = one<{ expected: FlagCount[]; actual: FlagCount[] }>(`
    WITH expected AS (
      SELECT
        w.nutrient_code,
        w.nutrient_name_de,
        w.reference_direction,
        count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL
          AND ((w.reference_direction = 'upper_limit' AND d.reference_pct > 100)
            OR (w.reference_direction = 'target' AND d.reference_pct < 80)))::integer AS triggered_day_count,
        count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL)::integer AS assessed_day_count,
        count(*) FILTER (WHERE d.reference_status = 'incomplete')::integer AS incomplete_day_count
      FROM nutrition.reference_assessment_window('${USER_ID}'::uuid, DATE '2026-08-29', 90) w
      CROSS JOIN LATERAL jsonb_to_recordset(w.daily_assessments) AS d(
        reference_pct numeric, reference_status text
      )
      WHERE w.reference_direction IN ('target', 'upper_limit')
      GROUP BY w.nutrient_code, w.nutrient_name_de, w.reference_direction
      HAVING count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL) >= 4
         AND count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL
              AND ((w.reference_direction = 'upper_limit' AND d.reference_pct > 100)
                OR (w.reference_direction = 'target' AND d.reference_pct < 80)))
             >= count(*) FILTER (WHERE d.reference_status = 'complete' AND d.reference_pct IS NOT NULL) * 0.5
    )
    SELECT json_build_object(
      'expected', (SELECT COALESCE(json_agg(row_to_json(e) ORDER BY nutrient_code, reference_direction), '[]'::json) FROM expected e),
      'actual', (SELECT COALESCE(json_agg(row_to_json(a) ORDER BY nutrient_code, reference_direction), '[]'::json)
                 FROM nutrition.reference_assessment_window_flags('${USER_ID}'::uuid, DATE '2026-08-29', 90) a)
    );
  `)

  assert.equal(result.expected.length, 10)
  assert.deepEqual(result.actual, result.expected)
  assert.deepEqual(result.actual.map((row) => ({
    nutrient_code: row.nutrient_code,
    reference_direction: row.reference_direction,
    triggered_day_count: row.triggered_day_count,
    assessed_day_count: row.assessed_day_count,
    incomplete_day_count: row.incomplete_day_count,
  })), [
    { nutrient_code: 'CA', reference_direction: 'target', triggered_day_count: 56, assessed_day_count: 90, incomplete_day_count: 0 },
    { nutrient_code: 'CLD', reference_direction: 'target', triggered_day_count: 15, assessed_day_count: 25, incomplete_day_count: 65 },
    { nutrient_code: 'F18:2CN6', reference_direction: 'target', triggered_day_count: 84, assessed_day_count: 90, incomplete_day_count: 0 },
    { nutrient_code: 'F18:3CN3', reference_direction: 'target', triggered_day_count: 55, assessed_day_count: 90, incomplete_day_count: 0 },
    { nutrient_code: 'MG', reference_direction: 'upper_limit', triggered_day_count: 88, assessed_day_count: 88, incomplete_day_count: 2 },
    { nutrient_code: 'NA', reference_direction: 'target', triggered_day_count: 61, assessed_day_count: 71, incomplete_day_count: 19 },
    { nutrient_code: 'NACL', reference_direction: 'target', triggered_day_count: 78, assessed_day_count: 90, incomplete_day_count: 0 },
    { nutrient_code: 'NIA', reference_direction: 'upper_limit', triggered_day_count: 51, assessed_day_count: 73, incomplete_day_count: 17 },
    { nutrient_code: 'VITD', reference_direction: 'target', triggered_day_count: 56, assessed_day_count: 90, incomplete_day_count: 0 },
    { nutrient_code: 'WATER', reference_direction: 'target', triggered_day_count: 88, assessed_day_count: 88, incomplete_day_count: 2 },
  ])
})
