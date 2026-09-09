// C-385/E-57: Injektionsstellen trennen Rotation, Gewebezustand und
// quellengebundene Nadelvarianten; weder IM noch SC erfindet eine Ruhezeit.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C385_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-385-Test braucht LUMEOS_C385_DATABASE als Wegwerf-Datenbank, nie postgres.')
const OWNER_ID = '10000000-0000-0000-0000-000000000101'
const OTHER_ID = '10000000-0000-0000-0000-000000000102'
const TEST_USER_EMAIL = 'test-user@lumeos.local'
const FIXTURE_SQL = `
  INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
    ('${OWNER_ID}'::uuid, 'c385-owner@example.test', '{"provider":"email"}'::jsonb, now()),
    ('${OTHER_ID}'::uuid, 'c385-other@example.test', '{"provider":"email"}'::jsonb, now()),
    ('10000000-0000-0000-0000-000000000103'::uuid, '${TEST_USER_EMAIL}', '{"provider":"email"}'::jsonb, now());
  INSERT INTO public.profiles (id, biological_sex, height_cm, body_weight_kg) VALUES
    ('${OWNER_ID}'::uuid, 'male', 178, 80),
    ('${OTHER_ID}'::uuid, 'male', 178, 80),
    ('10000000-0000-0000-0000-000000000103'::uuid, 'male', 180, 80)
  ON CONFLICT (id) DO UPDATE SET
    biological_sex = EXCLUDED.biological_sex,
    height_cm = EXCLUDED.height_cm,
    body_weight_kg = EXCLUDED.body_weight_kg;
`

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output) as T
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-U', 'postgres', '-d', DB,
    '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

test('C-385: Quellenvarianten, Rotation und Gewebezustand bleiben getrennt und RLS trennt Nutzer', () => {
  const model = one<{
    tables: string[]
    rls: Record<string, boolean>
    im: { minimumRestDays: number | null; rotationRequired: boolean; rotationDistanceMm: number | null; rotationQuadrantDays: number | null }
    sc: { minimumRestDays: number | null; rotationRequired: boolean; rotationDistanceMm: number | null; rotationQuadrantDays: number | null }
    lipohypertrophy: { avoidanceMinMonths: number; avoidanceMaxMonths: number }
    needleRows: Array<{ sourceKey: string; evidenceType: string }>
    deltoid: Array<{ sourceKey: string; gaugeRange: string; lengthRange: string }>
    ventroglutealSources: string[]
    ownerContext: { measurementCount: number; measurementDate: string; source: string; weightKg: number; bmi: number }
    fallbackContext: { measurementCount: number; measurementDate: string | null; source: string; weightKg: number | null; bmi: number | null }
  }>(`
    BEGIN;
    ${FIXTURE_SQL}
    INSERT INTO goals.body_measurements (
      id, user_id, measurement_date, measurement_time, weight_kg, height_cm_snapshot, measurement_source
    ) VALUES
      ('38500000-0000-0000-0000-000000000001'::uuid, '${OWNER_ID}'::uuid, DATE '2099-01-01', TIME '08:00', 81, 178, 'manual'),
      ('38500000-0000-0000-0000-000000000002'::uuid, '${OWNER_ID}'::uuid, DATE '2099-01-02', TIME '09:00', 82, 178, 'manual');
    SELECT json_build_object(
      'tables', (SELECT COALESCE(json_agg(relname ORDER BY relname), '[]'::json)
                 FROM pg_class
                 WHERE oid IN (
                   'medical.injection_sites'::regclass,
                   'medical.injection_needle_recommendations'::regclass,
                   'medical.injection_tissue_condition_guidance'::regclass,
                   'medical.injection_logs'::regclass,
                   'medical.injection_site_conditions'::regclass
                 )),
      'rls', (SELECT json_object_agg(relname, relrowsecurity)
              FROM pg_class
              WHERE oid IN (
                'medical.injection_sites'::regclass,
                'medical.injection_needle_recommendations'::regclass,
                'medical.injection_tissue_condition_guidance'::regclass,
                'medical.injection_logs'::regclass,
                'medical.injection_site_conditions'::regclass
              )),
      'im', (SELECT json_build_object(
        'minimumRestDays', minimum_rest_days,
        'rotationRequired', rotation_required,
        'rotationDistanceMm', rotation_distance_mm,
        'rotationQuadrantDays', rotation_quadrant_interval_days
      ) FROM medical.injection_sites WHERE id = 'delt_l'),
      'sc', (SELECT json_build_object(
        'minimumRestDays', minimum_rest_days,
        'rotationRequired', rotation_required,
        'rotationDistanceMm', rotation_distance_mm,
        'rotationQuadrantDays', rotation_quadrant_interval_days
      ) FROM medical.injection_sites WHERE id = 'abd_l'),
      'lipohypertrophy', (SELECT json_build_object(
        'avoidanceMinMonths', avoidance_min_months,
        'avoidanceMaxMonths', avoidance_max_months
      ) FROM medical.injection_tissue_condition_guidance WHERE condition_code = 'lipohypertrophy'),
      'needleRows', (SELECT json_agg(json_build_object(
        'sourceKey', source_key, 'evidenceType', evidence_type
      ) ORDER BY source_key) FROM medical.injection_needle_recommendations),
      'deltoid', (SELECT json_agg(json_build_object(
        'sourceKey', source_key, 'gaugeRange', gauge_range, 'lengthRange', length_range
      ) ORDER BY source_key)
      FROM medical.injection_needle_suggestions('deltoid', 'im', '${OWNER_ID}'::uuid)),
      'ventroglutealSources', (SELECT json_agg(source_key ORDER BY source_key)
                               FROM medical.injection_needle_suggestions('ventrogluteal', 'im', '${OWNER_ID}'::uuid)),
      'ownerContext', (SELECT json_build_object(
        'measurementCount', body_measurement_count,
        'measurementDate', measurement_date,
        'source', source,
        'weightKg', weight_kg,
        'bmi', bmi
      ) FROM medical.injection_body_measurement_context('${OWNER_ID}'::uuid)),
      'fallbackContext', (SELECT json_build_object(
        'measurementCount', body_measurement_count,
        'measurementDate', measurement_date,
        'source', source,
        'weightKg', weight_kg,
        'bmi', bmi
      ) FROM medical.injection_body_measurement_context((SELECT id FROM auth.users WHERE email = '${TEST_USER_EMAIL}')))
    );
    ROLLBACK;
  `)

  assert.deepEqual(model.tables, [
    'injection_logs',
    'injection_needle_recommendations',
    'injection_site_conditions',
    'injection_sites',
    'injection_tissue_condition_guidance',
  ])
  assert.deepEqual(model.rls, {
    injection_logs: true,
    injection_needle_recommendations: true,
    injection_site_conditions: true,
    injection_sites: true,
    injection_tissue_condition_guidance: true,
  })
  assert.deepEqual(model.im, {
    minimumRestDays: null,
    rotationRequired: true,
    rotationDistanceMm: null,
    rotationQuadrantDays: null,
  })
  assert.deepEqual(model.sc, {
    minimumRestDays: null,
    rotationRequired: true,
    rotationDistanceMm: 10,
    rotationQuadrantDays: 7,
  })
  assert.deepEqual(model.lipohypertrophy, { avoidanceMinMonths: 3, avoidanceMaxMonths: 6 })
  assert.deepEqual(model.needleRows.map(row => row.sourceKey), [
    'cdc_2026', 'cook_2006', 'fda_xyosted_2019', 'fitter_forward_2025',
    'larkin_2018', 'open_rn_2023', 'spratt_2017', 'zaybak_2007',
  ])
  assert.ok(model.needleRows.every(row => row.evidenceType.length > 0))
  assert.deepEqual(model.deltoid.map(row => row.sourceKey), ['cdc_2026', 'cook_2006'])
  assert.deepEqual(model.ventroglutealSources, ['larkin_2018', 'zaybak_2007'])
  assert.ok(model.ownerContext.measurementCount >= 2, 'alle Messzeilen des Nutzers werden gezaehlt')
  assert.deepEqual({
    measurementDate: model.ownerContext.measurementDate,
    source: model.ownerContext.source,
    weightKg: model.ownerContext.weightKg,
    bmi: model.ownerContext.bmi,
  }, {
    measurementDate: '2099-01-02',
    source: 'body_measurements',
    weightKg: 82,
    bmi: 25.88,
  })
  assert.equal(model.fallbackContext.measurementCount, 0)
  assert.equal(model.fallbackContext.measurementDate, null)
  assert.equal(model.fallbackContext.source, 'profiles')
  assert.notEqual(model.fallbackContext.bmi, null, 'ohne Messreihe wird BMI aus Profilgewicht und -groesse berechnet')

  const rlsProbe = psql(`
    BEGIN;
    ${FIXTURE_SQL}
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER_ID}', true);
    INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at)
    VALUES ('${OWNER_ID}'::uuid, 'delt_l', now());
    SELECT count(*) AS own_logs FROM medical.injection_logs WHERE user_id = '${OWNER_ID}'::uuid;
    SELECT set_config('request.jwt.claim.sub', '${OTHER_ID}', true);
    SELECT count(*) AS foreign_logs_visible FROM medical.injection_logs WHERE user_id = '${OWNER_ID}'::uuid;
    WITH changed AS (
      UPDATE medical.injection_logs SET injected_at = now()
      WHERE user_id = '${OWNER_ID}'::uuid RETURNING 1
    ) SELECT count(*) AS foreign_logs_changed FROM changed;
    ROLLBACK;
  `)
  assert.equal(rlsProbe.status, 0, rlsProbe.stderr)
  assert.match(rlsProbe.stdout, /own_logs\s*\n-+\n\s*1/)
  assert.match(rlsProbe.stdout, /foreign_logs_visible\s*\n-+\n\s*0/)
  assert.match(rlsProbe.stdout, /foreign_logs_changed\s*\n-+\n\s*0/)

  const foreignInsert = psql(`
    BEGIN;
    ${FIXTURE_SQL}
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OTHER_ID}', true);
    INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at)
    VALUES ('${OWNER_ID}'::uuid, 'delt_l', now());
    ROLLBACK;
  `)
  assert.notEqual(foreignInsert.status, 0, 'ein Nutzer darf kein fremdes Injektionsprotokoll anlegen')
  assert.match(foreignInsert.stderr, /row-level security/i)
})
