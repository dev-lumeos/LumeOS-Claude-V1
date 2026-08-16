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

function hasRows(query: string): boolean {
  return numberScalar(query) > 0
}

const errors: string[] = []
const users = numberScalar(`SELECT count(*) FROM auth.users WHERE id IN (${IDS_SQL});`)
const profiles = numberScalar(`SELECT count(*) FROM public.profiles WHERE id IN (${IDS_SQL});`)
const targets = numberScalar(`SELECT count(*) FROM goals.nutrition_targets WHERE user_id IN (${IDS_SQL});`)
const meals = numberScalar(`SELECT count(*) FROM nutrition.meals WHERE user_id IN (${IDS_SQL});`)
const items = numberScalar(`SELECT count(*) FROM nutrition.meal_items WHERE user_id IN (${IDS_SQL});`)
const waterLogs = numberScalar(`SELECT count(*) FROM nutrition.water_logs WHERE user_id IN (${IDS_SQL});`)
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
  if (waterLogs !== 0) errors.push(`water_logs: ${waterLogs}, erwartet 0`)
  if (foods !== 7140) errors.push(`foods: ${foods}, erwartet 7140`)
  if (nutrients !== 869501) errors.push(`food_nutrients: ${nutrients}, erwartet 869501`)

  console.log('C-82 Testdaten-Pruefung (clean)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
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
  if (meals < 120) errors.push(`meals: ${meals}, erwartet mindestens 120`)
  if (items < 1000) errors.push(`meal_items: ${items}, erwartet mindestens 1000`)
  if (waterLogs < 120) errors.push(`water_logs: ${waterLogs}, erwartet mindestens 120`)
  if (maxDays < 42) errors.push(`max Tage je Nutzer: ${maxDays}, erwartet mindestens 42`)
  if (frozenMissing !== 0) errors.push(`${frozenMissing} meal_items ohne frozen_at`)
  if (nutrientSnapshotsMissing !== 0) errors.push(`${nutrientSnapshotsMissing} meal_items ohne nutrient-Snapshot`)
  if (portionRows === 0) errors.push('keine meal_items mit gespeicherter Portion')
  if (dailyRows < 42) errors.push(`daily_summary: ${dailyRows}, erwartet mindestens 42`)
  if (assessmentRows === 0) errors.push('daily_reference_assessment liefert keine Zeilen')
  if (assessmentPctRows === 0) errors.push('daily_reference_assessment liefert keinen Deckungsgrad')

  const tom = IDS[0]
  const max = IDS[1]
  const sarah = IDS[2]

  if (numberScalar(`SELECT count(*) FROM goals.zielwerte_am('${tom}'::uuid, DATE '2026-08-02');`) !== 0) {
    errors.push('Fall Tag ohne Ziel: goals.zielwerte_am liefert vor gueltig_ab trotzdem eine Zeile')
  }
  if (!hasRows(`SELECT 1 FROM nutrition.daily_summary WHERE user_id = '${tom}'::uuid AND entry_date = DATE '2026-08-02' AND item_count > 0;`)) {
    errors.push('Fall Tag ohne Ziel: daily_summary fehlt oder hat keine Positionen')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${tom}'::uuid, DATE '2026-08-05')
    WHERE nutrient_code = 'VITA'
      AND reference_kind = 'UL'
      AND reference_status = 'complete'
      AND reference_pct > 100;`)) {
    errors.push('Fall Vitamin A ueber UL: VITA UL > 100 % fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '2026-08-04')
    WHERE (
        nutrient_code = 'NA'
        AND actual_value > 2000
        AND reference_status = 'complete'
      )
      OR (
        nutrient_code = 'NACL'
        AND reference_status = 'complete'
        AND reference_pct > 100
      );`)) {
    errors.push('Fall Salz/Natrium: Natrium > 2000 mg oder Salz > 100 % fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '2026-08-06')
    WHERE reference_status = 'incomplete'
      AND missing_count > 0;`)) {
    errors.push('Fall lueckenhafte Daten: reference_status incomplete fehlt')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '2026-08-09')
    WHERE nutrient_code IN ('FE', 'CA', 'VITD')
      AND reference_status = 'complete'
      AND reference_direction = 'target'
      AND reference_pct < 50;`) !== 3) {
    errors.push('Fall Mikronaehrstoffmangel: FE, CA und VITD liegen nicht alle unter 50 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '2026-08-07'
      AND ds.enercc / z.kcal * 100 BETWEEN 35 AND 45;`)) {
    errors.push('Fall Kalorien unter Ziel: Zielerreichung liegt nicht bei rund 40 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${max}'::uuid
      AND ds.entry_date = DATE '2026-08-10'
      AND ds.enercc / z.kcal * 100 > 140;`)) {
    errors.push('Fall Kalorien ueber Ziel: Zielerreichung liegt nicht ueber 140 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '2026-08-11'
      AND meal_count >= 1
      AND item_count = 0
      AND enercc IS NULL;`)) {
    errors.push('Fall leere Mahlzeiten: meal_count >= 1, item_count 0 und NULL-Summen fehlen')
  }
  if (numberScalar(`SELECT count(*) FROM nutrition.meals WHERE user_id = '${max}'::uuid AND entry_date = DATE '2026-08-08';`) !== 0) {
    errors.push('Fall Tag ohne Mahlzeit: nutrition.meals enthaelt Zeilen')
  }
  if (numberScalar(`SELECT count(*) FROM nutrition.daily_summary WHERE user_id = '${max}'::uuid AND entry_date = DATE '2026-08-08';`) !== 0) {
    errors.push('Fall Tag ohne Mahlzeit: daily_summary enthaelt eine Zeile')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '2026-08-13'
      AND item_count >= 20;`)) {
    errors.push('Fall viele Positionen: item_count >= 20 fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT
        count(*) FILTER (WHERE mi.portion_name IS NOT NULL) AS portioniert,
        count(*) FILTER (WHERE mi.portion_name IS NULL) AS gramm
      FROM nutrition.meals m
      JOIN nutrition.meal_items mi ON mi.meal_id = m.id
      WHERE m.user_id = '${tom}'::uuid
        AND m.entry_date = DATE '2026-08-13'
    ) d
    WHERE portioniert > 0 AND gramm > 0;`)) {
    errors.push('Fall gemischte Mengenangaben: Portionen und Gramm kommen nicht gemeinsam vor')
  }
  if (!hasRows(`
    SELECT 1
    FROM public.profiles
    WHERE id = '${sarah}'::uuid
      AND birth_date IS NULL
      AND body_weight_kg IS NULL;`)) {
    errors.push('Fall Profil unvollstaendig: Sarah hat nicht birth_date/body_weight_kg NULL')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${sarah}'::uuid, DATE '2026-08-16')
    WHERE reference_status = 'missing_profile';`)) {
    errors.push('Fall Profil unvollstaendig: missing_profile fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.hydration_day('${tom}'::uuid, DATE '2026-08-16')
    WHERE log_count > 0
      AND target_ml = 2975
      AND total_ml < target_ml * 0.60
      AND avg_14d_days = 14
      AND avg_14d_total_ml > total_ml
      AND behind_14d_avg_pct > 20;`)) {
    errors.push('Fall Hydration unter Ziel: Summe, Ziel oder 14-Tage-Vergleich stimmen nicht')
  }

  console.log('C-82 Testdaten-Pruefung (present)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
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
