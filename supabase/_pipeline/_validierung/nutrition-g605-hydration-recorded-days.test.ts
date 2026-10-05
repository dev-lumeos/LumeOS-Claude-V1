// G-605: Der 14-Tage-Schnitt kennt nur Tage mit Wassereintrag.
// Dieser Test laeuft nur gegen eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('G-605 braucht eine Wegwerf-Datenbank, nie postgres.')
}

const USER = '60500000-0000-0000-0000-000000000001'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  const json = output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? ''
  return JSON.parse(json) as T
}

test('G-605: leeres Fenster bleibt unbekannt, belegtes Fenster mittelt nur erfasste Tage', () => {
  const result = one<{
    empty: {
      average: number | null
      days: number
      delta: number | null
      behindPct: number | null
    }
    recorded: {
      todayTotal: number
      average: number
      days: number
      delta: number
      behindPct: number
    }
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${USER}'::uuid, 'g605-hydration@example.test', '{}'::jsonb, now());

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
    ) VALUES
      ('${USER}'::uuid, DATE '2099-06-02', 500, 'manual', TIMESTAMPTZ '2099-06-02 08:00:00+00'),
      ('${USER}'::uuid, DATE '2099-06-05', 1000, 'manual', TIMESTAMPTZ '2099-06-05 08:00:00+00'),
      ('${USER}'::uuid, DATE '2099-06-15', 600, 'manual', TIMESTAMPTZ '2099-06-15 08:00:00+00');

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${USER}', true);

    SELECT json_build_object(
      'empty', (
        SELECT json_build_object(
          'average', d.avg_14d_total_ml,
          'days', d.avg_14d_days,
          'delta', d.delta_vs_14d_ml,
          'behindPct', d.behind_14d_avg_pct
        )
        FROM nutrition.hydration_day('${USER}'::uuid, DATE '2099-07-15') d
      ),
      'recorded', (
        SELECT json_build_object(
          'todayTotal', d.total_ml,
          'average', d.avg_14d_total_ml,
          'days', d.avg_14d_days,
          'delta', d.delta_vs_14d_ml,
          'behindPct', d.behind_14d_avg_pct
        )
        FROM nutrition.hydration_day('${USER}'::uuid, DATE '2099-06-15') d
      )
    )::text;
    ROLLBACK;
  `)

  assert.deepEqual(result.empty, {
    average: null,
    days: 0,
    delta: null,
    behindPct: null,
  })
  assert.deepEqual(result.recorded, {
    todayTotal: 600,
    average: 750,
    days: 2,
    delta: -150,
    behindPct: 20,
  })
})
