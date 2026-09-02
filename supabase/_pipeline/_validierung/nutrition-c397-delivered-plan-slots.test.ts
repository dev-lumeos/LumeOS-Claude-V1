// C-397 / E-59: Gelieferte Pläne tragen die vom Plan vorgegebene Struktur.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

type Plan = {
  name: string
  origin: string
  slots: Array<{ position: number; name: string; plannedTime: string }>
}

test('C-397: drei gelieferte Pläne tragen eigene, unterschiedlich benannte Slots', () => {
  const result = one<{ plans: Plan[]; aufbauSlots: number }>(`
    WITH target_plans AS (
      SELECT mp.id, mp.name, mp.plan_origin
      FROM nutrition.meal_plans mp
      JOIN auth.users u ON u.id = mp.user_id
      WHERE u.email = 'dev@lumeos.app'
        AND mp.name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan')
    )
    SELECT json_build_object(
      'plans', coalesce(json_agg(json_build_object(
        'name', tp.name,
        'origin', tp.plan_origin,
        'slots', (SELECT coalesce(json_agg(json_build_object(
          'position', s.position,
          'name', s.name,
          'plannedTime', to_char(s.planned_time, 'HH24:MI')
        ) ORDER BY s.position), '[]'::json)
        FROM nutrition.meal_plan_slots s
        WHERE s.plan_id = tp.id)
      ) ORDER BY tp.name), '[]'::json),
      'aufbauSlots', (
        SELECT count(*)::integer
        FROM nutrition.meal_plan_slots s
        JOIN nutrition.meal_plans mp ON mp.id = s.plan_id
        JOIN auth.users u ON u.id = mp.user_id
        WHERE u.email = 'dev@lumeos.app'
          AND mp.name = 'Aufbau-Wochenplan'
      )
    )
    FROM target_plans tp;
  `)

  assert.equal(result.aufbauSlots, 0, 'Aufbau-Wochenplan bleibt ein Selbstplan ohne gelieferte Slots')
  assert.deepEqual(result.plans, [
    {
      name: 'Buddy auto-plan', origin: 'buddy', slots: [
        { position: 1, name: 'Frühstück', plannedTime: '07:30' },
        { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
        { position: 3, name: 'Zwischenmahlzeit', plannedTime: '16:00' },
        { position: 4, name: 'Abendessen', plannedTime: '19:30' },
      ],
    },
    {
      name: 'Cut 4-Meal 2200', origin: 'coach_created', slots: [
        { position: 1, name: 'Frühstück', plannedTime: '07:30' },
        { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
        { position: 3, name: 'Nachmittagsmahlzeit', plannedTime: '16:00' },
        { position: 4, name: 'Abendessen', plannedTime: '19:30' },
      ],
    },
    {
      name: 'Lean bulk 3100', origin: 'marketplace', slots: [
        { position: 1, name: 'Frühstück', plannedTime: '07:30' },
        { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
        { position: 3, name: 'Pre-Workout-Mahlzeit', plannedTime: '16:00' },
        { position: 4, name: 'Abendessen', plannedTime: '19:30' },
      ],
    },
  ])
})
