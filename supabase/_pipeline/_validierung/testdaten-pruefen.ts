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
const userGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL});`)
const goalPhases = numberScalar(`SELECT count(*) FROM goals.goal_phases WHERE user_id IN (${IDS_SQL});`)
const bodyMeasurements = numberScalar(`SELECT count(*) FROM goals.body_measurements WHERE user_id IN (${IDS_SQL});`)
const bodyCircumferences = numberScalar(`SELECT count(*) FROM goals.body_circumferences WHERE user_id IN (${IDS_SQL});`)
const preferences = numberScalar(`SELECT count(*) FROM nutrition.food_preferences WHERE user_id IN (${IDS_SQL});`)
const preferenceItems = numberScalar(`SELECT count(*) FROM nutrition.food_preference_items WHERE user_id IN (${IDS_SQL});`)
const meals = numberScalar(`SELECT count(*) FROM nutrition.meals WHERE user_id IN (${IDS_SQL});`)
const items = numberScalar(`SELECT count(*) FROM nutrition.meal_items WHERE user_id IN (${IDS_SQL});`)
const waterLogs = numberScalar(`SELECT count(*) FROM nutrition.water_logs WHERE user_id IN (${IDS_SQL});`)
const trainingSessions = numberScalar(`SELECT count(*) FROM training.workout_sessions WHERE user_id IN (${IDS_SQL});`)
const trainingExercises = numberScalar(`
  SELECT count(*)
  FROM training.workout_exercises we
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${IDS_SQL});`)
const trainingSets = numberScalar(`
  SELECT count(*)
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${IDS_SQL});`)
const recoveryCheckins = numberScalar(`SELECT count(*) FROM recovery.checkins WHERE user_id IN (${IDS_SQL});`)
const supplementCatalog = numberScalar(`SELECT count(*) FROM supplements.supplement_catalog WHERE is_active;`)
const supplementStacks = numberScalar(`SELECT count(*) FROM supplements.user_stacks WHERE user_id IN (${IDS_SQL});`)
const supplementStackItems = numberScalar(`
  SELECT count(*)
  FROM supplements.stack_items si
  JOIN supplements.user_stacks us ON us.id = si.stack_id
  WHERE us.user_id IN (${IDS_SQL});`)
const supplementIntakeLogs = numberScalar(`SELECT count(*) FROM supplements.intake_logs WHERE user_id IN (${IDS_SQL});`)
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
  if (userGoals !== 0) errors.push(`user_goals: ${userGoals}, erwartet 0`)
  if (goalPhases !== 0) errors.push(`goal_phases: ${goalPhases}, erwartet 0`)
  if (bodyMeasurements !== 0) errors.push(`body_measurements: ${bodyMeasurements}, erwartet 0`)
  if (bodyCircumferences !== 0) errors.push(`body_circumferences: ${bodyCircumferences}, erwartet 0`)
  if (preferences !== 0) errors.push(`food_preferences: ${preferences}, erwartet 0`)
  if (preferenceItems !== 0) errors.push(`food_preference_items: ${preferenceItems}, erwartet 0`)
  if (meals !== 0) errors.push(`meals: ${meals}, erwartet 0`)
  if (items !== 0) errors.push(`meal_items: ${items}, erwartet 0`)
  if (waterLogs !== 0) errors.push(`water_logs: ${waterLogs}, erwartet 0`)
  if (trainingSessions !== 0) errors.push(`training.workout_sessions: ${trainingSessions}, erwartet 0`)
  if (trainingExercises !== 0) errors.push(`training.workout_exercises: ${trainingExercises}, erwartet 0`)
  if (trainingSets !== 0) errors.push(`training.workout_sets: ${trainingSets}, erwartet 0`)
  if (recoveryCheckins !== 0) errors.push(`recovery.checkins: ${recoveryCheckins}, erwartet 0`)
  if (supplementStacks !== 0) errors.push(`supplements.user_stacks: ${supplementStacks}, erwartet 0`)
  if (supplementStackItems !== 0) errors.push(`supplements.stack_items: ${supplementStackItems}, erwartet 0`)
  if (supplementIntakeLogs !== 0) errors.push(`supplements.intake_logs: ${supplementIntakeLogs}, erwartet 0`)
  if (supplementCatalog < 44) errors.push(`supplements.supplement_catalog: ${supplementCatalog}, erwartet mindestens 44`)
  if (foods !== 7140) errors.push(`foods: ${foods}, erwartet 7140`)
  if (nutrients !== 869501) errors.push(`food_nutrients: ${nutrients}, erwartet 869501`)

  console.log('C-82 Testdaten-Pruefung (clean)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Goals/Phasen: ${userGoals}/${goalPhases}`)
  console.log(`  Koerpermessungen/Umfaenge: ${bodyMeasurements}/${bodyCircumferences}`)
  console.log(`  Preferences/Items: ${preferences}/${preferenceItems}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
  console.log(`  Training Sessions/Exercises/Sets: ${trainingSessions}/${trainingExercises}/${trainingSets}`)
  console.log(`  Recovery Check-ins: ${recoveryCheckins}`)
  console.log(`  Supplements Katalog/Stacks/Items/Logs: ${supplementCatalog}/${supplementStacks}/${supplementStackItems}/${supplementIntakeLogs}`)
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
  if (userGoals !== 3) errors.push(`user_goals: ${userGoals}, erwartet 3`)
  if (goalPhases !== 3) errors.push(`goal_phases: ${goalPhases}, erwartet 3`)
  if (bodyMeasurements !== 43) errors.push(`body_measurements: ${bodyMeasurements}, erwartet 43`)
  if (bodyCircumferences !== 7) errors.push(`body_circumferences: ${bodyCircumferences}, erwartet 7`)
  if (preferences !== 1) errors.push(`food_preferences: ${preferences}, erwartet 1`)
  if (preferenceItems !== 3) errors.push(`food_preference_items: ${preferenceItems}, erwartet 3`)
  if (meals < 120) errors.push(`meals: ${meals}, erwartet mindestens 120`)
  if (items < 1000) errors.push(`meal_items: ${items}, erwartet mindestens 1000`)
  if (waterLogs < 120) errors.push(`water_logs: ${waterLogs}, erwartet mindestens 120`)
  if (trainingSessions !== 9) errors.push(`training.workout_sessions: ${trainingSessions}, erwartet 9`)
  if (trainingExercises !== 18) errors.push(`training.workout_exercises: ${trainingExercises}, erwartet 18`)
  if (trainingSets !== 60) errors.push(`training.workout_sets: ${trainingSets}, erwartet 60`)
  if (recoveryCheckins !== 36) errors.push(`recovery.checkins: ${recoveryCheckins}, erwartet 36`)
  if (supplementCatalog < 44) errors.push(`supplements.supplement_catalog: ${supplementCatalog}, erwartet mindestens 44`)
  if (supplementStacks !== 1) errors.push(`supplements.user_stacks: ${supplementStacks}, erwartet 1`)
  if (supplementStackItems !== 4) errors.push(`supplements.stack_items: ${supplementStackItems}, erwartet 4`)
  if (supplementIntakeLogs !== 4) errors.push(`supplements.intake_logs: ${supplementIntakeLogs}, erwartet 4`)
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
  if (numberScalar(`SELECT count(*) FROM goals.phase_am('${tom}'::uuid, DATE '2026-08-02');`) !== 0) {
    errors.push('Fall Tag ohne Phase: goals.phase_am liefert vor erster gueltig_ab trotzdem eine Zeile')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.phase_am('${tom}'::uuid, DATE '2026-08-10')
    WHERE phase_type = 'maintenance'
      AND gueltig_ab = DATE '2026-08-03';`)) {
    errors.push('Fall Goals Phase vor Wechsel: maintenance am 2026-08-10 fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.phase_am('${tom}'::uuid, DATE '2026-08-18')
    WHERE phase_type = 'lean_bulk'
      AND gueltig_ab = DATE '2026-08-17';`)) {
    errors.push('Fall Goals Phasenwechsel: lean_bulk am 2026-08-18 fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.user_goals
    WHERE user_id = '${tom}'::uuid
      AND status = 'active'
    GROUP BY user_id
    HAVING count(*) = 2
       AND count(*) FILTER (WHERE is_primary) = 1
       AND max(priority) <= 3;`)) {
    errors.push('Fall Goals aktiv: Toms zwei aktive Ziele mit genau einem Primary fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT count(*) AS messungen,
             min(measurement_date) AS von,
             max(measurement_date) AS bis,
             min(weight_kg) AS min_kg,
             max(weight_kg) AS max_kg,
             max(weight_kg) FILTER (WHERE measurement_date = DATE '2026-09-13') AS latest_kg
      FROM goals.body_measurements
      WHERE user_id = '${tom}'::uuid
    ) m
    JOIN public.profiles p ON p.id = '${tom}'::uuid
    WHERE m.messungen = 43
      AND m.von = DATE '2026-08-02'
      AND m.bis = DATE '2026-09-13'
      AND m.max_kg - m.min_kg >= 0.8
      AND p.body_weight_kg = m.latest_kg;`)) {
    errors.push('Fall Koerpermessungen: 43-Tage-Gewichtsverlauf oder Profilgewicht-Sync fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.body_measurements
    WHERE user_id = '${tom}'::uuid
      AND measurement_date = DATE '2026-09-13'
      AND measurement_time = TIME '07:05'
      AND height_cm_snapshot = 185
      AND bmi IS NOT NULL
      AND lean_mass_kg IS NOT NULL
      AND ffmi IS NOT NULL;`)) {
    errors.push('Fall Koerpermessungen: Hoehen-Snapshot oder abgeleitete Werte fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.body_circumferences
    WHERE user_id = '${tom}'::uuid
      AND measurement_date = DATE '2026-09-13'
      AND measurement_time = TIME '07:10'
      AND neck_cm IS NOT NULL
      AND shoulders_cm IS NOT NULL
      AND chest_cm IS NOT NULL
      AND upper_arm_left_cm IS NOT NULL
      AND upper_arm_right_cm IS NOT NULL
      AND forearm_left_cm IS NOT NULL
      AND forearm_right_cm IS NOT NULL
      AND waist_cm IS NOT NULL
      AND hip_cm IS NOT NULL
      AND thigh_left_cm IS NOT NULL
      AND thigh_right_cm IS NOT NULL
      AND calf_left_cm IS NOT NULL
      AND calf_right_cm IS NOT NULL;`)) {
    errors.push('Fall Umfaenge: letzte Messung mit 13 Koerperumfaengen fehlt')
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
    FROM (
      SELECT
        count(*) AS snacks,
        string_agg(to_char(meal_time, 'HH24:MI'), ',' ORDER BY meal_time, created_at, id) AS zeiten
      FROM nutrition.meals
      WHERE user_id = '${tom}'::uuid
        AND entry_date = DATE '2026-08-14'
        AND meal_type = 'snack'
    ) d
    WHERE snacks = 2
      AND zeiten = '10:14,16:00';`)) {
    errors.push('Fall mehrere Snacks: zwei Snacks am selben Tag werden nicht nach meal_time sortierbar gespeichert')
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
    FROM nutrition.food_preferences_read('${tom}'::uuid) pref
    WHERE pref->'preferences'->>'diet_type' = 'omnivore'
      AND jsonb_array_length(pref->'search_application'->'hard') = 1
      AND jsonb_array_length(pref->'search_application'->'soft') = 1
      AND jsonb_array_length(pref->'search_application'->'boost') = 1
      AND pref->'search_application'->'hard' @> '[{"target_type":"tag","tag_code":"contains_nuts"}]'::jsonb
      AND pref->'search_application'->'boost' @> '[{"target_type":"food"}]'::jsonb;`)) {
    errors.push('Fall Preferences: Leseschicht liefert hard/soft/boost nicht vollstaendig')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.hydration_day('${tom}'::uuid, DATE '2026-08-16')
    WHERE log_count > 0
      AND target_ml = 3400
      AND total_ml < target_ml * 0.60
      AND avg_14d_days = 14
      AND avg_14d_total_ml > total_ml
      AND behind_14d_avg_pct > 20;`)) {
    errors.push('Fall Hydration unter Ziel: Summe, Ziel oder 14-Tage-Vergleich stimmen nicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM training.workout_sessions s
    JOIN training.workout_exercises we ON we.workout_session_id = s.id
    JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
    JOIN training.exercises e ON e.id = we.exercise_id
    JOIN training.exercise_muscles em ON em.exercise_id = e.id
    WHERE s.user_id = '${tom}'::uuid
      AND s.session_date = DATE '2026-08-03'
      AND s.started_time = TIME '17:30'
      AND s.ended_time = TIME '18:45'
      AND s.total_sets > 0
      AND s.total_volume_kg > 0
      AND we.exercise_name = e.name
      AND e.name = 'Barbell Bench Press'
      AND ws.estimated_1rm IS NOT NULL
      AND em.role = 'primary';`)) {
    errors.push('Fall Training: Sitzung mit echter Uebung, Muskelzuordnung und estimated_1rm fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT count(DISTINCT session_date) AS tage
      FROM training.workout_sessions
      WHERE user_id = '${tom}'::uuid
        AND status = 'completed'
        AND session_date BETWEEN DATE '2026-08-03' AND DATE '2026-09-06'
    ) d
  WHERE tage >= 9;`)) {
    errors.push('Fall Training Verlauf: mehrere Wochen abgeschlossene Sitzungen fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM recovery.checkins
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '2026-08-18'
      AND checkin_time = TIME '07:18'
      AND hrv_rmssd IS NULL
      AND sleep_quality = 3
      AND subjective_feeling = 3
      AND mood = 'tired'
      AND (soreness->>'chest')::int = 3;`)) {
    errors.push('Fall Recovery manual: schlechter Check-in ohne HRV fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT count(*) AS checkins,
             min(entry_date) AS von,
             max(entry_date) AS bis,
             count(*) FILTER (WHERE hrv_rmssd IS NULL) AS ohne_hrv
      FROM recovery.checkins
      WHERE user_id = '${tom}'::uuid
    ) r
    WHERE checkins >= 35
      AND von = DATE '2026-08-03'
      AND bis = DATE '2026-09-07'
      AND ohne_hrv > 0;`)) {
    errors.push('Fall Recovery Verlauf: mehrere Wochen Check-ins mit HRV-losen Zeilen fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.user_stacks us
    JOIN supplements.stack_items si ON si.stack_id = us.id
    JOIN supplements.supplement_catalog c ON c.id = si.supplement_id
    WHERE us.user_id = '${tom}'::uuid
      AND us.is_active
      AND us.name = 'Muskelaufbau Basics'
      AND c.slug = 'creatine-monohydrate'
      AND si.dose = 5
      AND si.dose_unit = 'g';`)) {
    errors.push('Fall Supplements Stack: aktiver Stack mit Kreatin aus Katalog fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.user_stacks us
    JOIN supplements.stack_items si ON si.stack_id = us.id
    JOIN supplements.supplement_catalog c ON c.id = si.supplement_id
    WHERE us.user_id = '${tom}'::uuid
      AND c.slug = 'vitamin-d3'
      AND si.stock_remaining <= si.low_stock_threshold;`)) {
    errors.push('Fall Supplements Refill: Vitamin-D3 Low-Stock-Item fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.intake_logs il
    WHERE il.user_id = '${tom}'::uuid
      AND il.intake_date = DATE '2026-08-18'
      AND il.intake_time = TIME '08:12'
      AND il.status = 'taken'
      AND il.supplement_name_snapshot = 'Vitamin D3'
      AND il.dose_snapshot = 5000
      AND il.dose_unit_snapshot = 'IU';`)) {
    errors.push('Fall Supplements Einnahme: eingefrorener Vitamin-D3-Snapshot fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.daily_intake_summary
    WHERE user_id = '${tom}'::uuid
      AND intake_date = DATE '2026-08-18'
      AND total_logged = 4
      AND total_taken = 3
      AND total_planned = 1;`)) {
    errors.push('Fall Supplements Tagesuebersicht: 3 genommen und 1 geplant fehlen')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.micronutrient_snapshot('${tom}'::uuid, DATE '2026-08-16');`) !== 8) {
    errors.push('Fall Micronutrient snapshot: liefert nicht exakt 8 Werte')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.micronutrient_snapshot('${tom}'::uuid, DATE '2026-08-16')
    WHERE nutrient_code = 'F18:3CN3'
      AND reference_kind = 'GOAL'
      AND reference_pct IS NOT NULL;`)) {
    errors.push('Fall Micronutrient snapshot: Omega-3 (ALA) wird nicht gegen Goals-Ziel bewertet')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.micronutrient_below_threshold('${max}'::uuid, DATE '2026-08-09') mangel
    CROSS JOIN nutrition.micronutrient_below_threshold('${tom}'::uuid, DATE '2026-08-16') normal
    WHERE mangel.threshold_pct = 75
      AND normal.threshold_pct = 75
      AND mangel.total_assessed > 0
      AND normal.total_assessed > 0
      AND mangel.below_count > normal.below_count;`)) {
    errors.push('Fall Below threshold: Mangel-Szenariotag ist nicht laenger als ein normaler Tag')
  }

  console.log('C-82 Testdaten-Pruefung (present)')
  console.log(`  Nutzer/Profile/Ziele: ${users}/${profiles}/${targets}`)
  console.log(`  Goals/Phasen: ${userGoals}/${goalPhases}`)
  console.log(`  Koerpermessungen/Umfaenge: ${bodyMeasurements}/${bodyCircumferences}`)
  console.log(`  Preferences/Items: ${preferences}/${preferenceItems}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
  console.log(`  Training Sessions/Exercises/Sets: ${trainingSessions}/${trainingExercises}/${trainingSets}`)
  console.log(`  Recovery Check-ins: ${recoveryCheckins}`)
  console.log(`  Supplements Katalog/Stacks/Items/Logs: ${supplementCatalog}/${supplementStacks}/${supplementStackItems}/${supplementIntakeLogs}`)
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
