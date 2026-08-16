#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const MODE = process.argv.includes('--clean') ? 'clean' : 'present'
const IDS = [
  '10000000-0000-0000-0000-000000000101',
  '10000000-0000-0000-0000-000000000102',
  '10000000-0000-0000-0000-000000000103',
]
const IDS_SQL = IDS.map(id => `'${id}'`).join(', ')
const SEP = '\u0001'

function sql(query: string): string[][] {
  return execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-F', SEP,
    '-c', query,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean)
    .map(line => line.split(SEP))
}

function numberScalar(query: string): number {
  return Number(sql(query)[0]?.[0] ?? 0)
}

const errors: string[] = []
const users = numberScalar(`SELECT count(*) FROM auth.users WHERE id IN (${IDS_SQL});`)
const profiles = numberScalar(`SELECT count(*) FROM public.profiles WHERE id IN (${IDS_SQL});`)
const targets = numberScalar(`SELECT count(*) FROM goals.nutrition_targets WHERE user_id IN (${IDS_SQL});`)
const meals = numberScalar(`SELECT count(*) FROM nutrition.meals WHERE user_id IN (${IDS_SQL});`)
const items = numberScalar(`SELECT count(*) FROM nutrition.meal_items WHERE user_id IN (${IDS_SQL});`)
const maxDays = numberScalar(`
  SELECT COALESCE(max(tage), 0)
  FROM (
    SELECT user_id, count(DISTINCT entry_date) AS tage
    FROM nutrition.meals
    WHERE user_id IN (${IDS_SQL})
    GROUP BY user_id
  ) d;`)

if (MODE === 'clean') {
  const foods = numberScalar(`SELECT count(*) FROM nutrition.foods;`)
  const nutrients = numberScalar(`SELECT count(*) FROM nutrition.food_nutrients;`)
  if (users !== 0) errors.push(`auth.users: ${users}, erwartet 0`)
  if (profiles !== 0) errors.push(`profiles: ${profiles}, erwartet 0`)
  if (targets !== 0) errors.push(`nutrition_targets: ${targets}, erwartet 0`)
  if (meals !== 0) errors.push(`meals: ${meals}, erwartet 0`)
  if (items !== 0) errors.push(`meal_items: ${items}, erwartet 0`)
  if (foods !== 7140) errors.push(`foods: ${foods}, erwartet 7140`)
  if (nutrients !== 869501) errors.push(`food_nutrients: ${nutrients}, erwartet 869501`)

  console.log('C-82 Testdaten-Pruefung (clean)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Meals/Items: ${meals}/${items}`)
  console.log(`  foods/food_nutrients: ${foods}/${nutrients}`)
} else {
  const frozenMissing = numberScalar(`SELECT count(*) FROM nutrition.meal_items WHERE user_id IN (${IDS_SQL}) AND frozen_at IS NULL;`)
  const nutrientSnapshotsMissing = numberScalar(`
    SELECT count(*)
    FROM nutrition.meal_items
    WHERE user_id IN (${IDS_SQL})
      AND (nutrients IS NULL OR nutrients = '{}'::jsonb);`)
  const portionRows = numberScalar(`SELECT count(*) FROM nutrition.meal_items WHERE user_id IN (${IDS_SQL}) AND portion_name IS NOT NULL;`)
  const dailyRows = numberScalar(`SELECT count(*) FROM nutrition.daily_summary WHERE user_id IN (${IDS_SQL});`)
  const assessmentRows = numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${IDS[0]}'::uuid, DATE '2026-08-16');`)
  const assessmentPctRows = numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${IDS[0]}'::uuid, DATE '2026-08-16')
    WHERE reference_pct IS NOT NULL;`)
  const missingCounters = sql(`
    SELECT
      COALESCE(sum(enercc_missing), 0)::text,
      COALESCE(sum(vita_missing), 0)::text,
      COALESCE(sum(fe_missing), 0)::text
    FROM nutrition.daily_summary
    WHERE user_id IN (${IDS_SQL});`)[0] ?? ['0', '0', '0']

  if (users !== 3) errors.push(`auth.users: ${users}, erwartet 3`)
  if (profiles !== 3) errors.push(`profiles: ${profiles}, erwartet 3`)
  if (targets !== 3) errors.push(`nutrition_targets: ${targets}, erwartet 3`)
  if (meals < 42) errors.push(`meals: ${meals}, erwartet mindestens 42`)
  if (items < 120) errors.push(`meal_items: ${items}, erwartet mindestens 120`)
  if (maxDays < 14) errors.push(`max Tage je Nutzer: ${maxDays}, erwartet mindestens 14`)
  if (frozenMissing !== 0) errors.push(`${frozenMissing} meal_items ohne frozen_at`)
  if (nutrientSnapshotsMissing !== 0) errors.push(`${nutrientSnapshotsMissing} meal_items ohne nutrient-Snapshot`)
  if (portionRows === 0) errors.push('keine meal_items mit gespeicherter Portion')
  if (dailyRows < 42) errors.push(`daily_summary: ${dailyRows}, erwartet mindestens 42`)
  if (assessmentRows === 0) errors.push('daily_reference_assessment liefert keine Zeilen')
  if (assessmentPctRows === 0) errors.push('daily_reference_assessment liefert keinen Deckungsgrad')

  console.log('C-82 Testdaten-Pruefung (present)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Meals/Items: ${meals}/${items}`)
  console.log(`  Max. Tage je Nutzer: ${maxDays}`)
  console.log(`  Portionierte Items: ${portionRows}`)
  console.log(`  daily_summary Zeilen: ${dailyRows}`)
  console.log(`  daily_reference_assessment: ${assessmentRows} Zeilen, ${assessmentPctRows} mit Prozentwert`)
  console.log(`  Fehlzaehler-Summen ENERCC/VITA/FE: ${missingCounters.join('/')}`)
}

if (errors.length) {
  console.error('')
  console.error(`FEHLER: ${errors.length}`)
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

console.log('OK: C-82 Testdaten stimmen.')
