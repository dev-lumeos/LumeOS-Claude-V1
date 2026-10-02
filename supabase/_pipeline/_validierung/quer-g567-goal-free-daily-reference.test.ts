// G-567 / E-87: Die Mikronaehrstoff-Tagesreferenz folgt dem Bedarf,
// nicht einer Diaetphase. Zwei Ziele und kein Ziel muessen dieselbe
// ALA-Referenz aus derselben TDEE-Basis liefern.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-567 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-567 A2/A3: zwei Zielphasen und kein Ziel liefern dieselbe TDEE-basierte ALA-Referenz', () => {
  const result = one<{
    goalCalls: number
    tdeeCalls: number
    twoGoalError: string | null
    twoGoalReference: number | null
    noGoalReference: number | null
    expectedReference: number | null
    twoGoalKind: string | null
    noGoalKind: string | null
    twoGoalSource: string | null
    noGoalSource: string | null
    twoGoalSupplementReference: number | null
    noGoalSupplementReference: number | null
    supplementCallsSnapshot: boolean
    thresholdCallsSnapshot: boolean
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES
      ('56700000-0000-0000-0000-000000000001',
       'test-user@lumeos.local',
       '{"provider":"email","providers":["email"]}'::jsonb, now()),
      ('56700000-0000-0000-0000-000000000002',
       'g567-ohne-ziel@lumeos.local',
       '{"provider":"email","providers":["email"]}'::jsonb, now());

    INSERT INTO public.profiles (
      id, birth_date, biological_sex, height_cm, body_weight_kg,
      activity_level, experience_level
    ) VALUES
      ('56700000-0000-0000-0000-000000000001',
       DATE '1990-05-17', 'male', 182, 83.74, 'moderate', 'pro'),
      ('56700000-0000-0000-0000-000000000002',
       DATE '1990-05-17', 'male', 182, 83.74, 'moderate', 'pro')
    ON CONFLICT (id) DO UPDATE SET
      birth_date = EXCLUDED.birth_date,
      biological_sex = EXCLUDED.biological_sex,
      height_cm = EXCLUDED.height_cm,
      body_weight_kg = EXCLUDED.body_weight_kg,
      activity_level = EXCLUDED.activity_level,
      experience_level = EXCLUDED.experience_level;

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('56700000-0000-0000-0000-000000000101',
       '56700000-0000-0000-0000-000000000001',
       'body_composition', 'G-567 Abbauziel', DATE '2099-01-01', 1),
      ('56700000-0000-0000-0000-000000000102',
       '56700000-0000-0000-0000-000000000001',
       'body_composition', 'G-567 Aufbauziel', DATE '2099-01-01', 2);

    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, parameters, gueltig_ab,
      created_at, strategie_code, zielrate_pct_kg_woche
    ) VALUES
      ('56700000-0000-0000-0000-000000000201',
       '56700000-0000-0000-0000-000000000001',
       '56700000-0000-0000-0000-000000000101',
       'fat_loss', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 08:00:00+00', 'moderate_cut', -0.500),
      ('56700000-0000-0000-0000-000000000202',
       '56700000-0000-0000-0000-000000000001',
       '56700000-0000-0000-0000-000000000102',
       'lean_bulk', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 09:00:00+00', 'lean_bulk', 0.250);

    CREATE TEMP TABLE g567_result (
      fall text PRIMARY KEY,
      wert jsonb NOT NULL
    ) ON COMMIT DROP;

    DO $probe$
    DECLARE
      v_row record;
    BEGIN
      BEGIN
        SELECT * INTO v_row
        FROM nutrition.micronutrient_snapshot(
          '56700000-0000-0000-0000-000000000001', DATE '2099-01-15'
        )
        WHERE nutrient_code = 'F18:3CN3';

        INSERT INTO g567_result VALUES (
          'two_goals', jsonb_build_object(
            'error', NULL,
            'reference', v_row.reference_value,
            'kind', v_row.reference_kind,
            'source', v_row.value_source
          )
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g567_result VALUES (
          'two_goals', jsonb_build_object(
            'error', SQLERRM,
            'reference', NULL,
            'kind', NULL,
            'source', NULL
          )
        );
      END;

      SELECT * INTO v_row
      FROM nutrition.micronutrient_snapshot(
        '56700000-0000-0000-0000-000000000002', DATE '2099-01-15'
      )
      WHERE nutrient_code = 'F18:3CN3';

      INSERT INTO g567_result VALUES (
        'no_goal', jsonb_build_object(
          'reference', v_row.reference_value,
          'kind', v_row.reference_kind,
          'source', v_row.value_source
        )
      );

      SELECT * INTO v_row
      FROM nutrition.micronutrient_snapshot_with_supplements(
        '56700000-0000-0000-0000-000000000001', DATE '2099-01-15'
      )
      WHERE nutrient_code = 'F18:3CN3';
      INSERT INTO g567_result VALUES (
        'two_goals_supplements',
        jsonb_build_object('reference', v_row.reference_value)
      );

      SELECT * INTO v_row
      FROM nutrition.micronutrient_snapshot_with_supplements(
        '56700000-0000-0000-0000-000000000002', DATE '2099-01-15'
      )
      WHERE nutrient_code = 'F18:3CN3';
      INSERT INTO g567_result VALUES (
        'no_goal_supplements',
        jsonb_build_object('reference', v_row.reference_value)
      );
    END
    $probe$;

    WITH snapshot_fn AS (
      SELECT pg_get_functiondef(
        'nutrition.micronutrient_snapshot(uuid,date)'::regprocedure
      ) AS body
    ), supplement_fn AS (
      SELECT pg_get_functiondef(
        'nutrition.micronutrient_snapshot_with_supplements(uuid,date)'::regprocedure
      ) AS body
    ), threshold_fn AS (
      SELECT pg_get_functiondef(
        'nutrition.micronutrient_below_threshold(uuid,date,numeric)'::regprocedure
      ) AS body
    ), basis AS (
      SELECT b.tdee
      FROM goals.tdee_basis_am(
        '56700000-0000-0000-0000-000000000002', DATE '2099-01-15'
      ) b
    )
    SELECT json_build_object(
      'goalCalls',
        (position('goals.zielwerte_am' IN snapshot_fn.body) > 0)::int
        + (position('goals.berechne_zielwerte' IN snapshot_fn.body) > 0)::int,
      'tdeeCalls', (position('goals.tdee_basis_am' IN snapshot_fn.body) > 0)::int,
      'twoGoalError', (SELECT wert->>'error' FROM g567_result WHERE fall='two_goals'),
      'twoGoalReference', (SELECT (wert->>'reference')::numeric FROM g567_result WHERE fall='two_goals'),
      'noGoalReference', (SELECT (wert->>'reference')::numeric FROM g567_result WHERE fall='no_goal'),
      'expectedReference', (SELECT round(tdee * 0.005 / 9, 1) FROM basis),
      'twoGoalKind', (SELECT wert->>'kind' FROM g567_result WHERE fall='two_goals'),
      'noGoalKind', (SELECT wert->>'kind' FROM g567_result WHERE fall='no_goal'),
      'twoGoalSource', (SELECT wert->>'source' FROM g567_result WHERE fall='two_goals'),
      'noGoalSource', (SELECT wert->>'source' FROM g567_result WHERE fall='no_goal'),
      'twoGoalSupplementReference', (
        SELECT (wert->>'reference')::numeric
        FROM g567_result WHERE fall='two_goals_supplements'
      ),
      'noGoalSupplementReference', (
        SELECT (wert->>'reference')::numeric
        FROM g567_result WHERE fall='no_goal_supplements'
      ),
      'supplementCallsSnapshot', position(
        'nutrition.micronutrient_snapshot(' IN supplement_fn.body
      ) > 0,
      'thresholdCallsSnapshot', position(
        'nutrition.micronutrient_snapshot(' IN threshold_fn.body
      ) > 0
    ) FROM snapshot_fn, supplement_fn, threshold_fn;

    ROLLBACK;
  `)

  assert.equal(result.twoGoalError, null)
  assert.equal(result.goalCalls, 0)
  assert.equal(result.tdeeCalls, 1)
  assert.equal(result.twoGoalReference, result.expectedReference)
  assert.equal(result.noGoalReference, result.expectedReference)
  assert.equal(result.twoGoalReference, result.noGoalReference)
  assert.equal(result.twoGoalKind, 'AI')
  assert.equal(result.noGoalKind, 'AI')
  assert.equal(result.twoGoalSource, 'tdee_alpha_linolenic_acid')
  assert.equal(result.noGoalSource, 'tdee_alpha_linolenic_acid')
  assert.equal(result.twoGoalSupplementReference, result.expectedReference)
  assert.equal(result.noGoalSupplementReference, result.expectedReference)
  assert.equal(result.supplementCallsSnapshot, true)
  assert.equal(result.thresholdCallsSnapshot, true)
})
