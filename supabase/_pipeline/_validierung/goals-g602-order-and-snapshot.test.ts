// G-602: Zielreihenfolge und Groessen-Snapshot werden atomar in der Datenbank
// durchgesetzt. Dieser Test laeuft nur gegen eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('G-602 braucht eine Wegwerf-Datenbank, nie postgres.')
}

const OWNER = '60200000-0000-0000-0000-000000000001'
const OTHER = '60200000-0000-0000-0000-000000000002'
const GOAL_A = '60200000-0000-0000-0000-000000000101'
const GOAL_B = '60200000-0000-0000-0000-000000000102'
const GOAL_C = '60200000-0000-0000-0000-000000000103'
const FOREIGN_GOAL = '60200000-0000-0000-0000-000000000104'
const PAUSED_GOAL = '60200000-0000-0000-0000-000000000105'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  const json = output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? ''
  return JSON.parse(json) as T
}

test('G-602 A1: Tausch und Ringtausch sind atomar, Fehler lassen alle Plaetze stehen', () => {
  const result = one<{
    contract: { invoker: boolean; emptySearchPath: boolean; authenticated: boolean; anon: boolean }
    afterSwap: Array<{ id: string; priority: number }>
    afterRing: Array<{ id: string; priority: number }>
    invalid: Array<{ label: string; state: string; message: string; unchanged: boolean }>
    directState: string
    directConstraint: string
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'g602-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'g602-other@example.test', '{}'::jsonb, now());

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, status, priority
    ) VALUES
      ('${GOAL_A}', '${OWNER}', 'health', 'G-602 A', DATE '2099-01-01', 'active', 1),
      ('${GOAL_B}', '${OWNER}', 'health', 'G-602 B', DATE '2099-01-01', 'active', 2),
      ('${GOAL_C}', '${OWNER}', 'health', 'G-602 C', DATE '2099-01-01', 'active', 3),
      ('${FOREIGN_GOAL}', '${OTHER}', 'health', 'G-602 fremd', DATE '2099-01-01', 'active', 1),
      ('${PAUSED_GOAL}', '${OWNER}', 'health', 'G-602 pausiert', DATE '2099-01-01', 'paused', 5);

    CREATE TEMP TABLE g602_invalid (
      label text PRIMARY KEY,
      state text NOT NULL,
      message text NOT NULL,
      unchanged boolean NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g602_invalid TO authenticated;

    CREATE OR REPLACE FUNCTION pg_temp.g602_attempt(p_label text, p_payload jsonb)
    RETURNS void
    LANGUAGE plpgsql
    AS $fn$
    DECLARE
      v_before jsonb;
      v_after jsonb;
      v_state text := 'unexpected_success';
      v_message text := '';
    BEGIN
      SELECT jsonb_object_agg(id::text, priority ORDER BY id)
      INTO v_before
      FROM goals.user_goals
      WHERE user_id = '${OWNER}'::uuid AND status = 'active';

      BEGIN
        PERFORM goals.ziel_reihenfolge_setzen(p_payload);
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE, v_message = MESSAGE_TEXT;
      END;

      SELECT jsonb_object_agg(id::text, priority ORDER BY id)
      INTO v_after
      FROM goals.user_goals
      WHERE user_id = '${OWNER}'::uuid AND status = 'active';

      INSERT INTO g602_invalid VALUES (p_label, v_state, v_message, v_before = v_after);
    END;
    $fn$;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);

    SELECT goals.ziel_reihenfolge_setzen(
      '[{"goal_id":"${GOAL_A}","priority":2},{"goal_id":"${GOAL_B}","priority":1},{"goal_id":"${GOAL_C}","priority":3}]'::jsonb
    );
    CREATE TEMP TABLE g602_after_swap AS
    SELECT id, priority FROM goals.user_goals
    WHERE user_id = '${OWNER}'::uuid AND status = 'active';

    SELECT goals.ziel_reihenfolge_setzen(
      '[{"goal_id":"${GOAL_A}","priority":3},{"goal_id":"${GOAL_B}","priority":2},{"goal_id":"${GOAL_C}","priority":1}]'::jsonb
    );
    CREATE TEMP TABLE g602_after_ring AS
    SELECT id, priority FROM goals.user_goals
    WHERE user_id = '${OWNER}'::uuid AND status = 'active';

    SELECT pg_temp.g602_attempt(
      'dublette',
      '[{"goal_id":"${GOAL_A}","priority":1},{"goal_id":"${GOAL_B}","priority":1},{"goal_id":"${GOAL_C}","priority":3}]'::jsonb
    );
    SELECT pg_temp.g602_attempt(
      'luecke',
      '[{"goal_id":"${GOAL_A}","priority":1},{"goal_id":"${GOAL_B}","priority":3}]'::jsonb
    );
    SELECT pg_temp.g602_attempt(
      'platz_4',
      '[{"goal_id":"${GOAL_A}","priority":2},{"goal_id":"${GOAL_B}","priority":3},{"goal_id":"${GOAL_C}","priority":4}]'::jsonb
    );
    SELECT pg_temp.g602_attempt(
      'fremd',
      '[{"goal_id":"${GOAL_A}","priority":1},{"goal_id":"${GOAL_B}","priority":2},{"goal_id":"${FOREIGN_GOAL}","priority":3}]'::jsonb
    );
    SELECT pg_temp.g602_attempt(
      'inaktiv',
      '[{"goal_id":"${GOAL_A}","priority":1},{"goal_id":"${GOAL_B}","priority":2},{"goal_id":"${PAUSED_GOAL}","priority":3}]'::jsonb
    );
    SELECT pg_temp.g602_attempt(
      'nicht_alle',
      '[{"goal_id":"${GOAL_A}","priority":2},{"goal_id":"${GOAL_B}","priority":3}]'::jsonb
    );

    CREATE TEMP TABLE g602_direct (state text, constraint_name text) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g602_direct TO authenticated;
    DO $direct$
    DECLARE
      v_state text;
      v_constraint text;
    BEGIN
      BEGIN
        INSERT INTO goals.user_goals (
          user_id, goal_type, title, gueltig_ab, status, priority
        ) VALUES (
          '${OWNER}'::uuid, 'health', 'G-602 direkte Dublette', DATE '2099-01-01', 'active', 1
        );
        INSERT INTO g602_direct VALUES ('unexpected_success', '');
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE, v_constraint = CONSTRAINT_NAME;
        INSERT INTO g602_direct VALUES (v_state, v_constraint);
      END;
    END;
    $direct$;

    RESET ROLE;
    SELECT json_build_object(
      'contract', (
        SELECT json_build_object(
          'invoker', NOT p.prosecdef,
          'emptySearchPath', p.proconfig @> ARRAY['search_path=""']::text[],
          'authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
          'anon', has_function_privilege('anon', p.oid, 'EXECUTE')
        )
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'goals'
          AND p.proname = 'ziel_reihenfolge_setzen'
          AND pg_get_function_identity_arguments(p.oid) = 'p_reihenfolge jsonb'
      ),
      'afterSwap', (
        SELECT json_agg(json_build_object('id', id, 'priority', priority) ORDER BY priority)
        FROM g602_after_swap
      ),
      'afterRing', (
        SELECT json_agg(json_build_object('id', id, 'priority', priority) ORDER BY priority)
        FROM g602_after_ring
      ),
      'invalid', (
        SELECT json_agg(json_build_object(
          'label', label, 'state', state, 'message', message, 'unchanged', unchanged
        ) ORDER BY label)
        FROM g602_invalid
      ),
      'directState', (SELECT state FROM g602_direct),
      'directConstraint', (SELECT constraint_name FROM g602_direct)
    )::text;
    ROLLBACK;
  `)

  assert.deepEqual(result.contract, {
    invoker: true,
    emptySearchPath: true,
    authenticated: true,
    anon: false,
  })
  assert.deepEqual(result.afterSwap, [
    { id: GOAL_B, priority: 1 },
    { id: GOAL_A, priority: 2 },
    { id: GOAL_C, priority: 3 },
  ])
  assert.deepEqual(result.afterRing, [
    { id: GOAL_C, priority: 1 },
    { id: GOAL_B, priority: 2 },
    { id: GOAL_A, priority: 3 },
  ])
  assert.deepEqual(result.invalid, [
    {
      label: 'dublette', state: '23514',
      message: 'ziel_reihenfolge_setzen: Prioritaeten sind nicht eindeutig', unchanged: true,
    },
    {
      label: 'fremd', state: '42501',
      message: 'ziel_reihenfolge_setzen: Ziel gehoert nicht dem Nutzer oder ist nicht aktiv', unchanged: true,
    },
    {
      label: 'inaktiv', state: '42501',
      message: 'ziel_reihenfolge_setzen: Ziel gehoert nicht dem Nutzer oder ist nicht aktiv', unchanged: true,
    },
    {
      label: 'luecke', state: '23514',
      message: 'ziel_reihenfolge_setzen: Prioritaeten sind keine Umordnung der heutigen Plaetze', unchanged: true,
    },
    {
      label: 'nicht_alle', state: '23514',
      message: 'ziel_reihenfolge_setzen: Alle aktiven Ziele muessen genannt sein', unchanged: true,
    },
    {
      label: 'platz_4', state: '23514',
      message: 'ziel_reihenfolge_setzen: Prioritaeten muessen zwischen 1 und 3 liegen', unchanged: true,
    },
  ])
  assert.equal(result.directState, '23505')
  assert.equal(result.directConstraint, 'uq_user_goals_active_slot')
})

test('G-602 A2: nur ein Datumswechsel erneuert den Groessen-Snapshot', () => {
  const result = one<{
    triggerCount: number
    initialSnapshot: number
    afterWeightAndSnapshotSabotage: number
    afterDateAndSnapshotSabotage: number
    bmiAfterDateChange: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${OWNER}'::uuid, 'g602-snapshot@example.test', '{}'::jsonb, now());
    INSERT INTO public.profiles (
      id, biological_sex, height_cm, body_weight_kg, experience_level
    ) VALUES ('${OWNER}'::uuid, 'male', 180, 80, 'beginner')
    ON CONFLICT (id) DO UPDATE SET
      biological_sex = EXCLUDED.biological_sex,
      height_cm = EXCLUDED.height_cm,
      body_weight_kg = EXCLUDED.body_weight_kg,
      experience_level = EXCLUDED.experience_level;
    INSERT INTO goals.body_measurements (
      id, user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (
      '60200000-0000-0000-0000-000000000201', '${OWNER}'::uuid,
      DATE '2099-01-01', TIME '08:00', 80
    );

    CREATE TEMP TABLE g602_snapshot (
      initial_snapshot numeric,
      after_weight_sabotage numeric,
      after_date_sabotage numeric,
      bmi_after_date numeric
    ) ON COMMIT DROP;
    INSERT INTO g602_snapshot (initial_snapshot)
    SELECT height_cm_snapshot FROM goals.body_measurements
    WHERE id = '60200000-0000-0000-0000-000000000201';

    UPDATE public.profiles SET height_cm = 182 WHERE id = '${OWNER}'::uuid;
    UPDATE goals.body_measurements
    SET weight_kg = 81, height_cm_snapshot = 199
    WHERE id = '60200000-0000-0000-0000-000000000201';
    UPDATE g602_snapshot SET after_weight_sabotage = (
      SELECT height_cm_snapshot FROM goals.body_measurements
      WHERE id = '60200000-0000-0000-0000-000000000201'
    );

    UPDATE goals.body_measurements
    SET measurement_date = DATE '2099-01-02', height_cm_snapshot = 199
    WHERE id = '60200000-0000-0000-0000-000000000201';
    UPDATE g602_snapshot SET
      after_date_sabotage = bm.height_cm_snapshot,
      bmi_after_date = bm.bmi
    FROM goals.body_measurements bm
    WHERE bm.id = '60200000-0000-0000-0000-000000000201';

    SELECT json_build_object(
      'triggerCount', (
        SELECT count(*)::integer FROM pg_trigger
        WHERE tgname = 'body_measurements_fill_snapshot' AND NOT tgisinternal
      ),
      'initialSnapshot', initial_snapshot,
      'afterWeightAndSnapshotSabotage', after_weight_sabotage,
      'afterDateAndSnapshotSabotage', after_date_sabotage,
      'bmiAfterDateChange', bmi_after_date
    )::text
    FROM g602_snapshot;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    triggerCount: 1,
    initialSnapshot: 180,
    afterWeightAndSnapshotSabotage: 180,
    afterDateAndSnapshotSabotage: 182,
    bmiAfterDateChange: 24.45,
  })
})
