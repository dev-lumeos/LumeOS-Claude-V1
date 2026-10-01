// G-561: Gewichtswaechter messen denselben relativen Anteil wie die Zielrate.
// Die sechs Katalogregeln duerfen deshalb keine pauschalen kg-Grenzen tragen.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-561 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-561 A1/A3: genau sechs alte kg-Waechter tragen ihre umgerechnete relative Schwelle', () => {
  const result = one<{
    absoluteRows: number
    relativeRows: number
    codes: string[]
    guards: string[]
  }>(`
    WITH affected AS (
      SELECT gs.code, guard
      FROM goals.goal_strategies gs
      CROSS JOIN LATERAL unnest(gs.guards) guard
      WHERE gs.code = ANY (ARRAY[
        'lose', 'aggressive_cut', 'moderate_cut', 'conservative_cut',
        'lean_bulk', 'reverse_diet'
      ]::text[])
        AND guard ~* '(weekly_loss|gain >|weekly gain)'
    )
    SELECT json_build_object(
      'absoluteRows', count(*) FILTER (WHERE guard ~* '[0-9] ?kg'),
      'relativeRows', count(*) FILTER (WHERE guard ~* '[0-9] ?% BW/week'),
      'codes', json_agg(code ORDER BY code),
      'guards', json_agg(guard ORDER BY code)
    )
    FROM affected;
  `)

  assert.equal(result.absoluteRows, 0)
  assert.equal(result.relativeRows, 6)
  assert.deepEqual(result.codes, [
    'aggressive_cut', 'conservative_cut', 'lean_bulk',
    'lose', 'moderate_cut', 'reverse_diet',
  ])
  assert.deepEqual(result.guards, [
    'weekly_loss > 1.194% BW/week → +150 kcal',
    'weekly_loss > 1.194% BW/week → +150 kcal',
    'gain > 1.194% BW/week → surplus too high',
    'weekly_loss > 1.194% BW/week → +150 kcal',
    'weekly_loss > 1.194% BW/week → +150 kcal',
    'weekly gain > 0.597% BW/week → slow increase',
  ])
})

test('G-561 A2/A3: die aktuelle Schwelle skaliert mit dem Gewicht, die 83,74-kg-Strenge bleibt', () => {
  const result = one<{
    referencePct: number
    referenceKg: number
    lightLimitKg: number
    heavyLimitKg: number
    cases: Array<{ weight: number; trend: number; triggers: boolean }>
  }>(`
    WITH threshold AS (
      SELECT (regexp_match(guard, '([0-9]+(?:\\.[0-9]+)?)% BW/week'))[1]::numeric AS pct
      FROM goals.goal_strategies gs
      CROSS JOIN LATERAL unnest(gs.guards) guard
      WHERE gs.code = 'lose' AND guard LIKE 'weekly_loss%'
    ), cases(weight, trend) AS (
      VALUES (60.0, 0.716), (60.0, 0.717),
             (100.0, 1.193), (100.0, 1.195)
    )
    SELECT json_build_object(
      'referencePct', t.pct,
      'referenceKg', round((t.pct * 83.74 / 100)::numeric, 3),
      'lightLimitKg', round((t.pct * 60 / 100)::numeric, 3),
      'heavyLimitKg', round((t.pct * 100 / 100)::numeric, 3),
      'cases', (
        SELECT json_agg(json_build_object(
          'weight', c.weight,
          'trend', c.trend,
          'triggers', (c.trend / c.weight * 100) > t.pct
        ) ORDER BY c.weight, c.trend)
        FROM cases c
      )
    )
    FROM threshold t;
  `)

  assert.equal(result.referencePct, 1.194)
  assert.equal(result.referenceKg, 1)
  assert.equal(result.lightLimitKg, 0.716)
  assert.equal(result.heavyLimitKg, 1.194)
  assert.deepEqual(result.cases, [
    { weight: 60, trend: 0.716, triggers: false },
    { weight: 60, trend: 0.717, triggers: true },
    { weight: 100, trend: 1.193, triggers: false },
    { weight: 100, trend: 1.195, triggers: true },
  ])
})

test('G-561 A5: test-user mit zwei Zielphasen behaelt je Strategie den relativen Waechter', () => {
  const result = one<{
    openPhases: number
    goalReferences: number
    guardRows: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    SELECT
      '56100000-0000-0000-0000-000000000001',
      'test-user@lumeos.local',
      '{"provider":"email","providers":["email"]}'::jsonb,
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'test-user@lumeos.local'
    );

    INSERT INTO public.profiles (
      id, birth_date, biological_sex, height_cm, body_weight_kg,
      activity_level, experience_level
    ) VALUES (
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      DATE '1990-05-17', 'male', 182, 60, 'moderate', 'pro'
    ) ON CONFLICT (id) DO UPDATE SET body_weight_kg = EXCLUDED.body_weight_kg;

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('56100000-0000-0000-0000-000000000101',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'body_composition', 'G-561 Abbauziel', DATE '2099-01-01', 1),
      ('56100000-0000-0000-0000-000000000102',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'body_composition', 'G-561 Aufbauziel', DATE '2099-01-01', 2);

    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, parameters, gueltig_ab,
      created_at, strategie_code, zielrate_pct_kg_woche
    ) VALUES
      ('56100000-0000-0000-0000-000000000201',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       '56100000-0000-0000-0000-000000000101',
       'fat_loss', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 08:00:00+00', 'moderate_cut', -0.750),
      ('56100000-0000-0000-0000-000000000202',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       '56100000-0000-0000-0000-000000000102',
       'lean_bulk', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 09:00:00+00', 'lean_bulk', 0.250);

    SELECT json_build_object(
      'openPhases', count(*),
      'goalReferences', count(DISTINCT p.goal_id),
      'guardRows', count(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM unnest(s.guards) guard
          WHERE guard ~* '[0-9] ?% BW/week'
        )
      )
    )
    FROM goals.phase_am(
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      DATE '2099-01-15'
    ) p
    JOIN goals.goal_phases gp ON gp.id = p.phase_id
    JOIN goals.goal_strategies s ON s.code = gp.strategie_code
    WHERE p.goal_id IN (
      '56100000-0000-0000-0000-000000000101',
      '56100000-0000-0000-0000-000000000102'
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    openPhases: 2,
    goalReferences: 2,
    guardRows: 2,
  })
})
