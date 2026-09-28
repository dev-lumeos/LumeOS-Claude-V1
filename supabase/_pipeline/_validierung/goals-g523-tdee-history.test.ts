import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G523_DATABASE
if (!db || db === 'postgres') throw new Error('G-523 braucht eine Wegwerf-Datenbank, nie postgres.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-523 B2/B3: EWMA nimmt alpha 0,3 gegen den Vorgaengerwert', () => {
  const result = one<{
    first: number
    second: number
    alphaOneFirst: number
    alphaOneSecond: number
  }>(`
    WITH values AS (
      SELECT
        goals.tdee_ema(3500, 2500, 0.3) AS first,
        goals.tdee_ema(3500, 2500, 1.0) AS alpha_one_first
    )
    SELECT json_build_object(
      'first', first,
      'second', goals.tdee_ema(2500, first, 0.3),
      'alphaOneFirst', alpha_one_first,
      'alphaOneSecond', goals.tdee_ema(2500, alpha_one_first, 1.0)
    )
    FROM values;
  `)

  assert.deepEqual(result, {
    first: 2800,
    second: 2710,
    alphaOneFirst: 3500,
    alphaOneSecond: 2500,
  })
  assert.notEqual(result.alphaOneFirst, result.first)
  assert.notEqual(result.alphaOneSecond, result.second)
})

test('G-524: die Reihe traegt Rechnung, Glaettung und Verlaesslichkeit', () => {
  const result = one<{
    columns: string[]
    uniqueKey: boolean
    rls: boolean
  }>(`
    SELECT json_build_object(
      'columns', (
        SELECT json_agg(column_name ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'tdee_history'
      ),
      'uniqueKey', EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'goals.tdee_history'::regclass
          AND contype = 'u'
          AND pg_get_constraintdef(oid) = 'UNIQUE (user_id, stichtag, window_days)'
      ),
      'rls', (
        SELECT relrowsecurity
        FROM pg_class
        WHERE oid = 'goals.tdee_history'::regclass
      )
    );
  `)

  for (const column of [
    'user_id', 'stichtag', 'window_days', 'raw_tdee_kcal',
    'adaptive_tdee_kcal', 'alpha', 'method', 'confidence', 'reliable',
  ]) {
    assert.ok(result.columns.includes(column), `Spalte ${column} fehlt`)
  }
  assert.equal(result.uniqueKey, true)
  assert.equal(result.rls, true)
})

test('G-524/G-523: test-user nutzt Historie, Fremdzeilen bleiben unsichtbar', () => {
  const result = one<{
    ownRows: number
    foreignRows: number
    previous: number
    source: string
  }>(`
    BEGIN;
    WITH users AS (
      SELECT
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local') AS test_id,
        (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app') AS other_id
    )
    INSERT INTO goals.tdee_history (
      user_id, stichtag, window_days, complete_intake_days,
      weight_measurement_count, weight_start_kg, weight_end_kg,
      weight_delta_kg, measurement_span_days, avg_intake_kcal,
      formula_tdee_kcal, raw_tdee_kcal, previous_tdee_kcal,
      previous_source, adaptive_tdee_kcal, delta_to_formula_kcal,
      alpha, confidence, reliable, status, method
    )
    SELECT test_id, DATE '2099-01-01', 14, 14, 2, 80, 80, 0, 13,
           2500, 2500, 2500, 2500, 'formula_seed', 2500, 0,
           0.3, 'medium', true, 'complete', 'ewma_alpha_0_3_previous_tdee'
    FROM users
    UNION ALL
    SELECT other_id, DATE '2099-01-01', 14, 14, 2, 80, 80, 0, 13,
           2500, 2500, 2500, 2500, 'formula_seed', 2500, 0,
           0.3, 'medium', true, 'complete', 'ewma_alpha_0_3_previous_tdee'
    FROM users;

    SELECT set_config(
      'test.test_user_id',
      (SELECT id::text FROM auth.users WHERE email = 'test-user@lumeos.local'),
      true
    );
    SET LOCAL ROLE authenticated;
    SELECT set_config(
      'request.jwt.claim.sub',
      current_setting('test.test_user_id'),
      true
    );

    SELECT json_build_object(
      'ownRows', count(*) FILTER (
        WHERE user_id = current_setting('test.test_user_id')::uuid
      ),
      'foreignRows', count(*) FILTER (
        WHERE user_id <> current_setting('test.test_user_id')::uuid
      ),
      'previous', (
        SELECT previous_tdee_kcal
        FROM goals.tdee_previous_value(
          current_setting('test.test_user_id')::uuid,
          DATE '2099-01-02', 14, 2400
        )
      ),
      'source', (
        SELECT previous_source
        FROM goals.tdee_previous_value(
          current_setting('test.test_user_id')::uuid,
          DATE '2099-01-02', 14, 2400
        )
      )
    )
    FROM goals.tdee_history;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    ownRows: 1,
    foreignRows: 0,
    previous: 2500,
    source: 'history',
  })
})

test('G-524: ohne Vorgaenger ist der Formelwert nur der Startwert', () => {
  const result = one<{ previous: number; source: string }>(`
    SELECT json_build_object(
      'previous', previous_tdee_kcal,
      'source', previous_source
    )
    FROM goals.tdee_previous_value(
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      DATE '1900-01-01', 14, 2475
    );
  `)

  assert.deepEqual(result, { previous: 2475, source: 'formula_seed' })
})

test('G-523 B4/B5: adaptive TDEE behaelt confidence/reliable und nennt EWMA', () => {
  const result = one<{
    confidence: string
    reliable: boolean
    status: string
    method: string
    alpha: number
  }>(`
    SELECT json_build_object(
      'confidence', confidence,
      'reliable', reliable,
      'status', status,
      'method', method,
      'alpha', alpha
    )
    FROM goals.adaptive_tdee(
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      DATE '2026-09-15',
      14
    );
  `)

  assert.equal(result.confidence, 'low')
  assert.equal(result.reliable, false)
  assert.equal(result.status, 'insufficient_intake_days')
  assert.equal(result.alpha, 0.3)
  assert.match(result.method, /ewma_alpha_0_3_previous_tdee/)
  assert.doesNotMatch(result.method, /alpha_1_formula_baseline/)
})

test('G-524: der Schreibweg protokolliert test-user ohne erfundene Berechnung', () => {
  const result = one<{
    status: string
    reliable: boolean
    raw: number | null
    adaptive: number | null
  }>(`
    BEGIN;
    SELECT goals.record_adaptive_tdee(
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      DATE '2026-09-15',
      14
    );
    SELECT json_build_object(
      'status', status,
      'reliable', reliable,
      'raw', raw_tdee_kcal,
      'adaptive', adaptive_tdee_kcal
    )
    FROM goals.tdee_history
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')
      AND stichtag = DATE '2026-09-15'
      AND window_days = 14;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    status: 'insufficient_intake_days',
    reliable: false,
    raw: null,
    adaptive: null,
  })
})

test('G-524: Rechte werden erst entzogen und dann klein erteilt', () => {
  const result = one<{
    anonSelect: boolean
    authenticatedSelect: boolean
    authenticatedInsert: boolean
    serviceRoleDml: boolean
    authenticatedRecord: boolean
    serviceRoleRecord: boolean
  }>(`
    SELECT json_build_object(
      'anonSelect', has_table_privilege('anon', 'goals.tdee_history', 'SELECT'),
      'authenticatedSelect', has_table_privilege('authenticated', 'goals.tdee_history', 'SELECT'),
      'authenticatedInsert', has_table_privilege('authenticated', 'goals.tdee_history', 'INSERT'),
      'serviceRoleDml', has_table_privilege(
        'service_role', 'goals.tdee_history', 'SELECT,INSERT,UPDATE,DELETE'
      ),
      'authenticatedRecord', has_function_privilege(
        'authenticated', 'goals.record_adaptive_tdee(uuid,date,integer)', 'EXECUTE'
      ),
      'serviceRoleRecord', has_function_privilege(
        'service_role', 'goals.record_adaptive_tdee(uuid,date,integer)', 'EXECUTE'
      )
    );
  `)

  assert.deepEqual(result, {
    anonSelect: false,
    authenticatedSelect: true,
    authenticatedInsert: false,
    serviceRoleDml: true,
    authenticatedRecord: false,
    serviceRoleRecord: true,
  })
})
