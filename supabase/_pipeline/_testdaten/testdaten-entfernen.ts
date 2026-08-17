#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const IDS = [
  '10000000-0000-0000-0000-000000000101',
  '10000000-0000-0000-0000-000000000102',
  '10000000-0000-0000-0000-000000000103',
]

const ids = IDS.map(id => `'${id}'`).join(', ')

const sql = `
BEGIN;

WITH deleted_items AS (
  DELETE FROM nutrition.meal_items
  WHERE user_id IN (${ids})
  RETURNING 1
),
deleted_meals AS (
  DELETE FROM nutrition.meals
  WHERE user_id IN (${ids})
  RETURNING 1
),
deleted_preference_items AS (
  DELETE FROM nutrition.food_preference_items
  WHERE user_id IN (${ids})
  RETURNING 1
),
deleted_preferences AS (
  DELETE FROM nutrition.food_preferences
  WHERE user_id IN (${ids})
  RETURNING 1
),
deleted_targets AS (
  DELETE FROM goals.nutrition_targets
  WHERE user_id IN (${ids})
  RETURNING 1
),
deleted_profiles AS (
  DELETE FROM public.profiles
  WHERE id IN (${ids})
  RETURNING 1
),
deleted_users AS (
  DELETE FROM auth.users
  WHERE id IN (${ids})
  RETURNING 1
)
SELECT
  (SELECT count(*) FROM deleted_items) AS meal_items,
  (SELECT count(*) FROM deleted_meals) AS meals,
  (SELECT count(*) FROM deleted_preference_items) AS food_preference_items,
  (SELECT count(*) FROM deleted_preferences) AS food_preferences,
  (SELECT count(*) FROM deleted_targets) AS nutrition_targets,
  (SELECT count(*) FROM deleted_profiles) AS profiles,
  (SELECT count(*) FROM deleted_users) AS users;

COMMIT;
`

const result = spawnSync('docker', [
  'exec', '-i', CONTAINER,
  'psql', '-U', 'postgres', '-d', DB,
  '-v', 'ON_ERROR_STOP=1',
  '-f', '-',
], { input: sql, encoding: 'utf8' })

if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log(`C-82 Testdaten entfernt aus Datenbank ${DB}.`)
