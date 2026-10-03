// G-563: Zielwerte gehoeren zu genau einem Ziel. Der nutzerweite Altvertrag
// darf bei mehreren Zielphasen nicht still eine davon auswaehlen.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

const USER_ID = '56300000-0000-0000-0000-000000000001'
const OTHER_USER_ID = '56300000-0000-0000-0000-000000000002'
const CUT_PHASE_ID = '56300000-0000-0000-0000-000000000201'
const BULK_PHASE_ID = '56300000-0000-0000-0000-000000000202'
const OTHER_PHASE_ID = '56300000-0000-0000-0000-000000000203'

if (!db || db === 'postgres') {
  throw new Error('G-563 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

const fixture = `
  INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
  VALUES
    ('${USER_ID}', 'test-user@lumeos.local',
     '{"provider":"email","providers":["email"]}'::jsonb, now()),
    ('${OTHER_USER_ID}', 'g594-other@example.test',
     '{"provider":"email","providers":["email"]}'::jsonb, now());

  INSERT INTO public.profiles (
    id, birth_date, biological_sex, height_cm, body_weight_kg,
    activity_level, experience_level
  ) VALUES
    ('${USER_ID}', DATE '1990-05-17', 'male', 182, 83.74, 'moderate', 'pro'),
    ('${OTHER_USER_ID}', DATE '1991-06-18', 'female', 168, 64.20, 'moderate', 'advanced')
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
    ('56300000-0000-0000-0000-000000000101',
     '56300000-0000-0000-0000-000000000001',
     'body_composition', 'G-563 Abbauziel', DATE '2099-01-01', 1),
    ('56300000-0000-0000-0000-000000000102',
     '${USER_ID}',
     'body_composition', 'G-563 Aufbauziel', DATE '2099-01-01', 2),
    ('56300000-0000-0000-0000-000000000103',
     '${OTHER_USER_ID}',
     'body_composition', 'G-594 fremdes Ziel', DATE '2099-01-01', 1);

  INSERT INTO goals.body_measurements (
    user_id, measurement_date, measurement_time, weight_kg
  ) VALUES (
    '${USER_ID}',
    DATE '2099-01-01', TIME '08:00', 83.74
  );

  INSERT INTO goals.goal_phases (
    id, user_id, goal_id, phase_type, parameters, gueltig_ab,
    created_at, strategie_code, zielrate_pct_kg_woche
  ) VALUES
    ('56300000-0000-0000-0000-000000000201',
     '56300000-0000-0000-0000-000000000001',
     '56300000-0000-0000-0000-000000000101',
     'fat_loss', '{}'::jsonb, DATE '2099-01-01',
     TIMESTAMPTZ '2099-01-01 08:00:00+00', 'moderate_cut', -0.500),
    ('56300000-0000-0000-0000-000000000202',
     '${USER_ID}',
     '56300000-0000-0000-0000-000000000102',
     'lean_bulk', '{}'::jsonb, DATE '2099-01-01',
     TIMESTAMPTZ '2099-01-01 09:00:00+00', 'lean_bulk', 0.250),
    ('${OTHER_PHASE_ID}',
     '${OTHER_USER_ID}',
     '56300000-0000-0000-0000-000000000103',
     'fat_loss', '{}'::jsonb, DATE '2099-01-01',
     TIMESTAMPTZ '2099-01-01 10:00:00+00', 'moderate_cut', -0.500);

  CREATE TEMP TABLE g563_result (
    fall text PRIMARY KEY,
    wert jsonb NOT NULL
  ) ON COMMIT DROP;
  GRANT SELECT, INSERT ON g563_result TO authenticated;

  SELECT set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', '${USER_ID}',
      'role', 'authenticated'
    )::text,
    true
  );
  SET LOCAL ROLE authenticated;
`

test('G-563 A3/A4: die nutzerweite Vorschau wirft bei zwei Zielphasen wie der Schreibweg', () => {
  const result = one<{ message: string }>(`
    BEGIN;
    ${fixture}

    DO $probe$
    BEGIN
      BEGIN
        PERFORM * FROM goals.berechne_zielwerte(
          '56300000-0000-0000-0000-000000000001', DATE '2099-01-15'
        );
        INSERT INTO g563_result VALUES (
          'unscoped', jsonb_build_object('message', 'angenommen')
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g563_result VALUES (
          'unscoped', jsonb_build_object('message', SQLERRM)
        );
      END;
    END
    $probe$;

    SELECT wert FROM g563_result WHERE fall = 'unscoped';
    ROLLBACK;
  `)

  assert.equal(
    result.message,
    'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt',
  )
})

test('G-563 A2/A4: dieselben Nutzerdaten liefern je Ziel ihre eigene Rate und Kalorienzahl', () => {
  const result = one<{
    exists: boolean
    arguments: string | null
    cutRate: number | null
    bulkRate: number | null
    cutKcal: number | null
    bulkKcal: number | null
    cutExpected: number | null
    bulkExpected: number | null
    cutObstacle: string | null
    bulkObstacle: string | null
    cutGoalId: string | null
    bulkGoalId: string | null
  }>(`
    BEGIN;
    ${fixture}

    DO $probe$
    DECLARE
      v_exists boolean := to_regprocedure(
        'goals.berechne_zielwerte(uuid,uuid,date)'
      ) IS NOT NULL;
      v_arguments text;
      v_cut record;
      v_bulk record;
    BEGIN
      IF NOT v_exists THEN
        INSERT INTO g563_result VALUES (
          'scoped', jsonb_build_object('exists', false)
        );
        RETURN;
      END IF;

      SELECT pg_get_function_arguments(
        'goals.berechne_zielwerte(uuid,uuid,date)'::regprocedure
      ) INTO v_arguments;

      EXECUTE $sql$
        SELECT * FROM goals.berechne_zielwerte(
          '56300000-0000-0000-0000-000000000001'::uuid,
          '56300000-0000-0000-0000-000000000101'::uuid,
          DATE '2099-01-15'
        )
      $sql$ INTO v_cut;
      EXECUTE $sql$
        SELECT * FROM goals.berechne_zielwerte(
          '56300000-0000-0000-0000-000000000001'::uuid,
          '56300000-0000-0000-0000-000000000102'::uuid,
          DATE '2099-01-15'
        )
      $sql$ INTO v_bulk;

      INSERT INTO g563_result VALUES (
        'scoped',
        jsonb_build_object(
          'exists', v_exists,
          'arguments', v_arguments,
          'cutRate', v_cut.zielrate_pct_kg_woche,
          'bulkRate', v_bulk.zielrate_pct_kg_woche,
          'cutKcal', v_cut.kcal,
          'bulkKcal', v_bulk.kcal,
          'cutExpected', round(
            v_cut.tdee + goals.kcal_delta_aus_zielrate(-0.500, 83.74), 1
          ),
          'bulkExpected', round(
            v_bulk.tdee + goals.kcal_delta_aus_zielrate(0.250, 83.74), 1
          ),
          'cutObstacle', v_cut.hindernis,
          'bulkObstacle', v_bulk.hindernis,
          'cutGoalId', v_cut.goal_id,
          'bulkGoalId', v_bulk.goal_id
        )
      );
    END
    $probe$;

    SELECT wert FROM g563_result WHERE fall = 'scoped';
    ROLLBACK;
  `)

  assert.equal(result.exists, true)
  assert.equal(
    result.arguments,
    'p_user_id uuid, p_goal_id uuid, p_stichtag date DEFAULT CURRENT_DATE',
  )
  assert.equal(result.cutRate, -0.5)
  assert.equal(result.bulkRate, 0.25)
  assert.equal(result.cutKcal, result.cutExpected)
  assert.equal(result.bulkKcal, result.bulkExpected)
  assert.notEqual(result.cutKcal, result.bulkKcal)
  assert.equal(result.cutObstacle, null)
  assert.equal(result.bulkObstacle, null)
  assert.equal(result.cutGoalId, '56300000-0000-0000-0000-000000000101')
  assert.equal(result.bulkGoalId, '56300000-0000-0000-0000-000000000102')
})

test('G-594 A1: eine genannte aktive Phase waehlt bei zwei Nutzerphasen ihr Ziel', () => {
  const result = one<{
    phaseId: string
    kcal: number
    proteinG: number
    carbsG: number
    fatG: number
  }>(`
    BEGIN;
    ${fixture}

    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, phase_id, kcal, herkunft
    ) VALUES (
      '${USER_ID}', DATE '2099-01-15', '${CUT_PHASE_ID}', 1, 'formel'
    );

    SELECT json_build_object(
      'phaseId', phase_id,
      'kcal', kcal,
      'proteinG', protein_g,
      'carbsG', carbs_g,
      'fatG', fat_g
    )
    FROM goals.nutrition_targets
    WHERE user_id = '${USER_ID}'::uuid
      AND gueltig_ab = DATE '2099-01-15';
    ROLLBACK;
  `)

  assert.equal(result.phaseId, CUT_PHASE_ID)
  assert.equal(typeof result.kcal, 'number')
  assert.equal(typeof result.proteinG, 'number')
  assert.equal(typeof result.carbsG, 'number')
  assert.equal(typeof result.fatG, 'number')
})

test('G-594 A1: zwei aktive Phasen ohne genannte Phase bleiben mehrdeutig', () => {
  const result = one<{ code: string, message: string }>(`
    BEGIN;
    ${fixture}

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.nutrition_targets (
          user_id, gueltig_ab, kcal, herkunft
        ) VALUES (
          '${USER_ID}', DATE '2099-01-15', 1, 'formel'
        );
        INSERT INTO g563_result VALUES (
          'g594_ambiguous', jsonb_build_object('code', '00000', 'message', 'angenommen')
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g563_result VALUES (
          'g594_ambiguous', jsonb_build_object('code', SQLSTATE, 'message', SQLERRM)
        );
      END;
    END
    $probe$;

    SELECT wert FROM g563_result WHERE fall = 'g594_ambiguous';
    ROLLBACK;
  `)

  assert.equal(result.code, '23514')
  assert.equal(
    result.message,
    'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt',
  )
})

test('G-594 A1: eine genannte fremde Phase wird mit 23514 abgewiesen', () => {
  const result = one<{ code: string, message: string }>(`
    BEGIN;
    ${fixture}

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.nutrition_targets (
          user_id, gueltig_ab, phase_id, kcal, herkunft
        ) VALUES (
          '${USER_ID}', DATE '2099-01-15', '${OTHER_PHASE_ID}', 1, 'formel'
        );
        INSERT INTO g563_result VALUES (
          'g594_other', jsonb_build_object('code', '00000', 'message', 'angenommen')
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g563_result VALUES (
          'g594_other', jsonb_build_object('code', SQLSTATE, 'message', SQLERRM)
        );
      END;
    END
    $probe$;

    SELECT wert FROM g563_result WHERE fall = 'g594_other';
    ROLLBACK;
  `)

  assert.equal(result.code, '23514')
  assert.equal(
    result.message,
    'nutrition_targets: genannte phase_id ist am Gueltigkeitstag keine aktive Phase dieses Nutzers',
  )
})

test('G-594 A1: eine genannte inaktive Phase wird mit 23514 abgewiesen', () => {
  const result = one<{ code: string, message: string }>(`
    BEGIN;
    ${fixture}
    RESET ROLE;
    UPDATE goals.goal_phases
    SET actual_end_date = DATE '2099-01-14',
        transition_reason = 'G-594 Inaktivitaetsprobe'
    WHERE id = '${BULK_PHASE_ID}'::uuid;
    SET LOCAL ROLE authenticated;

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.nutrition_targets (
          user_id, gueltig_ab, phase_id, kcal, herkunft
        ) VALUES (
          '${USER_ID}', DATE '2099-01-15', '${BULK_PHASE_ID}', 1, 'formel'
        );
        INSERT INTO g563_result VALUES (
          'g594_inactive', jsonb_build_object('code', '00000', 'message', 'angenommen')
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g563_result VALUES (
          'g594_inactive', jsonb_build_object('code', SQLSTATE, 'message', SQLERRM)
        );
      END;
    END
    $probe$;

    SELECT wert FROM g563_result WHERE fall = 'g594_inactive';
    ROLLBACK;
  `)

  assert.equal(result.code, '23514')
  assert.equal(
    result.message,
    'nutrition_targets: genannte phase_id ist am Gueltigkeitstag keine aktive Phase dieses Nutzers',
  )
})

test('G-594 A1: eine aktive Phase ohne genannte Phase wird weiter automatisch gewaehlt', () => {
  const result = one<{ phaseId: string, kcal: number }>(`
    BEGIN;
    ${fixture}
    RESET ROLE;
    UPDATE goals.goal_phases
    SET actual_end_date = DATE '2099-01-14',
        transition_reason = 'G-594 Eindeutigkeitsprobe'
    WHERE id = '${BULK_PHASE_ID}'::uuid;
    SET LOCAL ROLE authenticated;

    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, herkunft
    ) VALUES (
      '${USER_ID}', DATE '2099-01-15', 1, 'formel'
    );

    SELECT json_build_object('phaseId', phase_id, 'kcal', kcal)
    FROM goals.nutrition_targets
    WHERE user_id = '${USER_ID}'::uuid
      AND gueltig_ab = DATE '2099-01-15';
    ROLLBACK;
  `)

  assert.equal(result.phaseId, CUT_PHASE_ID)
  assert.equal(typeof result.kcal, 'number')
})
