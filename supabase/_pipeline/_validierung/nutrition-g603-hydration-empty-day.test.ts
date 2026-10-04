// G-603: Ein Tag ohne Wassereintrag ist nicht gleichbedeutend mit 0 ml.
// Dieser Test laeuft nur gegen eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('G-603 braucht eine Wegwerf-Datenbank, nie postgres.')
}

const USER = '60300000-0000-0000-0000-000000000001'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  const json = output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? ''
  return JSON.parse(json) as T
}

test('G-603: leerer Tag bleibt unbekannt, ein Wassereintrag rechnet unveraendert', () => {
  const result = one<{
    functionCount: number
    empty: {
      loggedMl: number | null
      logCount: number
      totalMl: number | null
      totalComplete: boolean
      targetMl: number
      progressPct: number | null
    }
    filled: {
      loggedMl: number
      logCount: number
      foodMl: number | null
      foodMlMissing: number
      totalMl: number
      totalComplete: boolean
      targetMl: number
      progressPct: number
    }
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${USER}'::uuid, 'g603-hydration@example.test', '{}'::jsonb, now());

    INSERT INTO public.profiles (
      id, biological_sex, height_cm, body_weight_kg, activity_level, experience_level
    ) VALUES (
      '${USER}'::uuid, 'female', 170, 80, 'sedentary', 'beginner'
    )
    ON CONFLICT (id) DO UPDATE SET
      body_weight_kg = EXCLUDED.body_weight_kg,
      activity_level = EXCLUDED.activity_level;

    INSERT INTO nutrition.water_logs (
      user_id, entry_date, amount_ml, source, logged_at
    ) VALUES (
      '${USER}'::uuid, DATE '2099-06-02', 500, 'manual', TIMESTAMPTZ '2099-06-02 08:00:00+00'
    );

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${USER}', true);

    SELECT json_build_object(
      'functionCount', (
        SELECT count(*)::integer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'nutrition'
          AND p.proname = 'hydration_day'
          AND pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid, p_entry_date date'
      ),
      'empty', (
        SELECT json_build_object(
          'loggedMl', d.logged_ml,
          'logCount', d.log_count,
          'totalMl', d.total_ml,
          'totalComplete', d.total_complete,
          'targetMl', d.target_ml,
          'progressPct', d.progress_pct
        )
        FROM nutrition.hydration_day('${USER}'::uuid, DATE '2099-06-01') d
      ),
      'filled', (
        SELECT json_build_object(
          'loggedMl', d.logged_ml,
          'logCount', d.log_count,
          'foodMl', d.food_ml,
          'foodMlMissing', d.food_ml_missing,
          'totalMl', d.total_ml,
          'totalComplete', d.total_complete,
          'targetMl', d.target_ml,
          'progressPct', d.progress_pct
        )
        FROM nutrition.hydration_day('${USER}'::uuid, DATE '2099-06-02') d
      )
    )::text;
    ROLLBACK;
  `)

  assert.equal(result.functionCount, 1)
  assert.deepEqual(result.empty, {
    loggedMl: null,
    logCount: 0,
    totalMl: null,
    totalComplete: false,
    targetMl: 2400,
    progressPct: null,
  })
  assert.deepEqual(result.filled, {
    loggedMl: 500,
    logCount: 1,
    foodMl: null,
    foodMlMissing: 0,
    totalMl: 500,
    totalComplete: true,
    targetMl: 2400,
    progressPct: 20.8,
  })
})
