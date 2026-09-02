// C-392/E-58: freie Mahlzeiten-Slots sind je Nutzer geschützt und ohne Obergrenze geordnet.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const DEV_USER = 'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'
const SEED_USER = '10000000-0000-0000-0000-000000000101'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return (output === '' ? null : JSON.parse(output)) as T
}

function scalar(sql: string): string | null {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return output === '' ? null : output
}

function psql(sql: string) {
  return spawnSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-q', '-U', 'postgres', '-d', DB,
    '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

test('C-392: meal_slots folgen E-58, haben keine Mahlzeitenobergrenze und RLS trennt Nutzer', () => {
  const exists = scalar("SELECT to_regclass('nutrition.meal_slots')::text;")
  assert.equal(exists, 'nutrition.meal_slots', 'meal_slots muss als eigene Tabelle existieren')

  const result = one<{
    columns: string[]
    forbiddenColumns: string[]
    uniquePosition: string | null
    rlsEnabled: boolean
    policies: string[]
    mealsPerDayCheck: string | null
    slots: Record<string, Array<{ position: number; name: string; planned_time: string }>>
    filledTimes: string[]
    missingMealTimes: number
    mealTypeCounts: { meals: number; planEntries: number }
  }>(`
    SELECT json_build_object(
      'columns', (SELECT COALESCE(json_agg(column_name ORDER BY ordinal_position), '[]'::json)
                  FROM information_schema.columns
                  WHERE table_schema = 'nutrition' AND table_name = 'meal_slots'),
      'forbiddenColumns', (SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
                           FROM information_schema.columns
                           WHERE table_schema = 'nutrition' AND table_name = 'meal_slots'
                             AND column_name IN ('kind', 'category', 'meal_type')),
      'uniquePosition', (SELECT pg_get_constraintdef(c.oid)
                         FROM pg_constraint c
                         WHERE c.conrelid = 'nutrition.meal_slots'::regclass
                           AND c.contype IN ('p', 'u')),
      'rlsEnabled', (SELECT relrowsecurity FROM pg_class WHERE oid = 'nutrition.meal_slots'::regclass),
      'policies', (SELECT COALESCE(json_agg(policyname ORDER BY policyname), '[]'::json)
                   FROM pg_policies
                   WHERE schemaname = 'nutrition' AND tablename = 'meal_slots'),
      'mealsPerDayCheck', (SELECT pg_get_constraintdef(c.oid)
                           FROM pg_constraint c
                           WHERE c.conrelid = 'nutrition.food_preferences'::regclass
                             AND c.conname = 'food_preferences_meals_per_day_check'),
      'slots', (SELECT json_object_agg(user_id::text, slots)
                FROM (
                  SELECT user_id, json_agg(json_build_object(
                    'position', position, 'name', name, 'planned_time', to_char(planned_time, 'HH24:MI')
                  ) ORDER BY position) AS slots
                  FROM nutrition.meal_slots
                  WHERE user_id IN ('${DEV_USER}'::uuid, '${SEED_USER}'::uuid)
                  GROUP BY user_id
                ) seeded),
      'filledTimes', (SELECT COALESCE(json_agg(to_char(meal_time, 'HH24:MI') ORDER BY entry_date), '[]'::json)
                      FROM nutrition.meals
                      WHERE id IN (
                        'f8197998-0b80-4e61-8e9c-922260086637'::uuid,
                        '374fb71b-db68-41f3-aae7-a847ce801876'::uuid,
                        '4ff64c7d-da42-46dc-af02-c6a58f14c3b5'::uuid,
                        'a8e6fdbc-8b53-4c06-ac0a-31042016096f'::uuid,
                        'a5b1553d-6a9b-4e5f-9bb2-0c0595dc732e'::uuid
                      )),
      'missingMealTimes', (SELECT count(*) FROM nutrition.meals WHERE meal_time IS NULL),
      'mealTypeCounts', json_build_object(
        'meals', (SELECT count(*) FROM nutrition.meals WHERE meal_type IS NOT NULL),
        'planEntries', (SELECT count(*) FROM nutrition.meal_plan_entries WHERE meal_type IS NOT NULL)
      )
    );
  `)

  assert.deepEqual(result.columns, ['user_id', 'position', 'name', 'planned_time'])
  assert.deepEqual(result.forbiddenColumns, [])
  assert.match(result.uniquePosition ?? '', /UNIQUE \(user_id, "?position"?\)|PRIMARY KEY \(user_id, "?position"?\)/)
  assert.equal(result.rlsEnabled, true)
  assert.deepEqual(result.policies, [
    'meal_slots_delete', 'meal_slots_insert', 'meal_slots_select', 'meal_slots_update',
  ])
  assert.equal(result.mealsPerDayCheck, null)
  assert.deepEqual(result.slots, {
    [DEV_USER]: [
      { position: 1, name: 'Frühstück', planned_time: '07:30' },
      { position: 2, name: 'Snack', planned_time: '10:14' },
      { position: 3, name: 'Mittagessen', planned_time: '12:30' },
      { position: 4, name: 'Nachmittagssnack', planned_time: '16:00' },
      { position: 5, name: 'Abendessen', planned_time: '19:30' },
    ],
    [SEED_USER]: [
      { position: 1, name: 'Frühstück', planned_time: '07:30' },
      { position: 2, name: 'Snack', planned_time: '10:14' },
      { position: 3, name: 'Mittagessen', planned_time: '12:30' },
      { position: 4, name: 'Nachmittagssnack', planned_time: '16:00' },
      { position: 5, name: 'Abendessen', planned_time: '19:30' },
    ],
  })
  assert.deepEqual(result.filledTimes, ['12:30', '12:30', '12:30', '12:30', '12:30'])
  assert.equal(result.missingMealTimes, 0)
  assert.deepEqual(result.mealTypeCounts, { meals: 2899, planEntries: 309 })

  const rlsProbe = psql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000392', true);
    INSERT INTO nutrition.meal_slots (user_id, position, name, planned_time)
    SELECT '90000000-0000-0000-0000-000000000392'::uuid, n, 'Probe ' || n, TIME '06:00' + (n - 1) * INTERVAL '1 hour'
    FROM generate_series(1, 9) AS n;
    SELECT count(*) AS own_slots FROM nutrition.meal_slots WHERE user_id = '90000000-0000-0000-0000-000000000392'::uuid;
    SELECT set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000393', true);
    SELECT count(*) AS foreign_slots_visible FROM nutrition.meal_slots WHERE user_id = '90000000-0000-0000-0000-000000000392'::uuid;
    WITH changed AS (
      UPDATE nutrition.meal_slots
      SET name = 'Fremd'
      WHERE user_id = '90000000-0000-0000-0000-000000000392'::uuid
      RETURNING 1
    )
    SELECT count(*) AS foreign_slots_changed FROM changed;
    ROLLBACK;
  `)
  assert.equal(rlsProbe.status, 0, rlsProbe.stderr)
  assert.match(rlsProbe.stdout, /own_slots\s*\n-+\n\s*9/)
  assert.match(rlsProbe.stdout, /foreign_slots_visible\s*\n-+\n\s*0/)
  assert.match(rlsProbe.stdout, /foreign_slots_changed\s*\n-+\n\s*0/)

  const foreignInsert = psql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000393', true);
    INSERT INTO nutrition.meal_slots (user_id, position, name, planned_time)
    VALUES ('90000000-0000-0000-0000-000000000392'::uuid, 99, 'Fremd', TIME '12:00');
    ROLLBACK;
  `)
  assert.notEqual(foreignInsert.status, 0, 'ein Nutzer darf keinen fremden Slot anlegen')
  assert.match(foreignInsert.stderr, /row-level security/i)
})
