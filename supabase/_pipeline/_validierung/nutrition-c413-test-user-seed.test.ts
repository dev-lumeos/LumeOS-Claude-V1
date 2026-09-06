import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-413: tom.seed-Aufbauplan beschreibt seine volle 21-Tage-Laufzeit', () => {
  const plan = one<{ daysCount: number; describedDays: number }>(`
    SELECT json_build_object(
      'daysCount', mp.days_count,
      'describedDays', count(DISTINCT d.plan_date)::integer
    )
    FROM nutrition.meal_plans mp
    JOIN auth.users u ON u.id = mp.user_id
    JOIN nutrition.meal_plan_weeks w ON w.plan_id = mp.id
    JOIN nutrition.meal_plan_days d ON d.week_id = w.id
    WHERE u.email = 'tom.seed@example.com'
      AND mp.name = 'Aufbau-Wochenplan'
    GROUP BY mp.id;
  `)

  assert.equal(plan.daysCount, 21)
  assert.equal(plan.describedDays, 21)
})

test('C-241: test-user hat einen kleinen, aktuellen Grundbestand statt einer leeren Buehne', () => {
  const state = one<{
    preferences: number
    preferenceItems: number
    slots: number
    plans: number
    planDays: number
    planEntries: number
    planLogs: string[]
    meals: number
    mealItems: number
    intakeLogs: number
    latestIntake: string
  }>(`
    WITH u AS (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')
    SELECT json_build_object(
      'preferences', (SELECT count(*)::integer FROM nutrition.food_preferences WHERE user_id = (SELECT id FROM u)),
      'preferenceItems', (SELECT count(*)::integer FROM nutrition.food_preference_items WHERE user_id = (SELECT id FROM u)),
      'slots', (SELECT count(*)::integer FROM nutrition.meal_slots WHERE user_id = (SELECT id FROM u)),
      'plans', (SELECT count(*)::integer FROM nutrition.meal_plans WHERE user_id = (SELECT id FROM u)),
      'planDays', (SELECT count(*)::integer FROM nutrition.meal_plan_days WHERE user_id = (SELECT id FROM u)),
      'planEntries', (SELECT count(*)::integer FROM nutrition.meal_plan_entries WHERE user_id = (SELECT id FROM u)),
      'planLogs', (SELECT COALESCE(json_agg(status ORDER BY status), '[]'::json) FROM nutrition.meal_plan_logs WHERE user_id = (SELECT id FROM u)),
      'meals', (SELECT count(*)::integer FROM nutrition.meals WHERE user_id = (SELECT id FROM u)),
      'mealItems', (SELECT count(*)::integer FROM nutrition.meal_items WHERE user_id = (SELECT id FROM u)),
      'intakeLogs', (SELECT count(*)::integer FROM supplements.intake_logs WHERE user_id = (SELECT id FROM u)),
      'latestIntake', (SELECT max(intake_date)::text FROM supplements.intake_logs WHERE user_id = (SELECT id FROM u))
    );
  `)

  assert.equal(state.preferences, 1)
  assert.equal(state.preferenceItems, 3)
  assert.equal(state.slots, 4)
  assert.equal(state.plans, 1)
  assert.equal(state.planDays, 7)
  assert.equal(state.planEntries, 28)
  assert.deepEqual(state.planLogs, ['confirmed', 'skipped'])
  assert.equal(state.meals, 7)
  assert.equal(state.mealItems, 14)
  assert.equal(state.intakeLogs, 90)
  assert.equal(state.latestIntake, new Date().toISOString().slice(0, 10))
})
