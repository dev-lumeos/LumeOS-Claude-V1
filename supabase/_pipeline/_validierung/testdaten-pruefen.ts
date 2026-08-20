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
const COACH_ID = '10000000-0000-0000-0000-000000000901'
const IDS_SQL = IDS.map(id => `'${id}'`).join(', ')
const SEP = '\u0001'
const ANCHOR_DATE = '2026-08-02'
const START_DATE = process.env.LUMEOS_TESTDATA_START ?? '2026-05-20'
const NEXT_START_DATE = process.env.LUMEOS_TESTDATA_NEXT_START ?? '2026-08-19'
const WINDOW_DAYS = Number(process.env.LUMEOS_TESTDATA_DAYS ?? 90)
function addIsoDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
function daysOffset(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000)
}
function relDate(anchorDate: string): string {
  return addIsoDays(START_DATE, daysOffset(ANCHOR_DATE, anchorDate))
}
const END_DATE = addIsoDays(NEXT_START_DATE, WINDOW_DAYS - 1)
const TODAY_DATE = NEXT_START_DATE

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
const coachUsers = numberScalar(`SELECT count(*) FROM auth.users WHERE id = '${COACH_ID}'::uuid;`)
const profiles = numberScalar(`SELECT count(*) FROM public.profiles WHERE id IN (${IDS_SQL});`)
const targets = numberScalar(`SELECT count(*) FROM goals.nutrition_targets WHERE user_id IN (${IDS_SQL});`)
const userGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL});`)
const goalPhases = numberScalar(`SELECT count(*) FROM goals.goal_phases WHERE user_id IN (${IDS_SQL});`)
const goalMilestones = numberScalar(`SELECT count(*) FROM goals.goal_milestones WHERE user_id IN (${IDS_SQL});`)
const achievedGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL}) AND status = 'achieved';`)
const missedGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL}) AND status = 'missed';`)
const abandonedGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL}) AND status = 'abandoned';`)
const activeGoals = numberScalar(`SELECT count(*) FROM goals.user_goals WHERE user_id IN (${IDS_SQL}) AND status = 'active';`)
const achievedMilestones = numberScalar(`SELECT count(*) FROM goals.goal_milestones WHERE user_id IN (${IDS_SQL}) AND status = 'achieved';`)
const missedMilestones = numberScalar(`SELECT count(*) FROM goals.goal_milestones WHERE user_id IN (${IDS_SQL}) AND status = 'missed';`)
const abandonedMilestones = numberScalar(`SELECT count(*) FROM goals.goal_milestones WHERE user_id IN (${IDS_SQL}) AND status = 'abandoned';`)
const bodyMeasurements = numberScalar(`SELECT count(*) FROM goals.body_measurements WHERE user_id IN (${IDS_SQL});`)
const bodyCircumferences = numberScalar(`SELECT count(*) FROM goals.body_circumferences WHERE user_id IN (${IDS_SQL});`)
const preferences = numberScalar(`SELECT count(*) FROM nutrition.food_preferences WHERE user_id IN (${IDS_SQL});`)
const preferenceItems = numberScalar(`SELECT count(*) FROM nutrition.food_preference_items WHERE user_id IN (${IDS_SQL});`)
const recipes = numberScalar(`SELECT count(*) FROM nutrition.recipes WHERE user_id IN (${IDS_SQL});`)
const recipeIngredients = numberScalar(`SELECT count(*) FROM nutrition.recipe_ingredients WHERE user_id IN (${IDS_SQL});`)
const mealPlans = numberScalar(`SELECT count(*) FROM nutrition.meal_plans WHERE user_id IN (${IDS_SQL});`)
const mealPlanWeeks = numberScalar(`SELECT count(*) FROM nutrition.meal_plan_weeks WHERE user_id IN (${IDS_SQL});`)
const mealPlanDays = numberScalar(`SELECT count(*) FROM nutrition.meal_plan_days WHERE user_id IN (${IDS_SQL});`)
const mealPlanEntries = numberScalar(`SELECT count(*) FROM nutrition.meal_plan_entries WHERE user_id IN (${IDS_SQL});`)
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
const trainingSetsWithRir = numberScalar(`
  SELECT count(*)
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${IDS_SQL})
    AND ws.rir IS NOT NULL;`)
const trainingPrSets = numberScalar(`
  SELECT count(*)
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${IDS_SQL})
    AND ws.is_pr;`)
const trainingPrExercises = numberScalar(`
  SELECT count(DISTINCT e.name)
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  JOIN training.exercises e ON e.id = we.exercise_id
  WHERE s.user_id IN (${IDS_SQL})
    AND ws.is_pr;`)
const trainingStatusRows = sql(`
  SELECT status, count(*)::text
  FROM training.workout_sessions
  WHERE user_id IN (${IDS_SQL})
  GROUP BY status
  ORDER BY status;`)
const recoveryCheckins = numberScalar(`SELECT count(*) FROM recovery.checkins WHERE user_id IN (${IDS_SQL});`)
const recoveryScores = numberScalar(`SELECT count(*) FROM recovery.scores WHERE user_id IN (${IDS_SQL});`)
const recoveryModalities = numberScalar(`SELECT count(*) FROM recovery.modality_log WHERE user_id IN (${IDS_SQL});`)
const medicalCatalog = numberScalar(`SELECT count(*) FROM medical.biomarker_catalog;`)
const medicalRanges = numberScalar(`SELECT count(*) FROM medical.biomarker_reference_ranges;`)
const medicalAliases = numberScalar(`SELECT count(*) FROM medical.biomarker_aliases;`)
const medicalReports = numberScalar(`SELECT count(*) FROM medical.lab_reports WHERE user_id IN (${IDS_SQL});`)
const medicalValues = numberScalar(`SELECT count(*) FROM medical.lab_result_values WHERE user_id IN (${IDS_SQL});`)
const medicationActiveSubstances = numberScalar(`SELECT count(*) FROM medical.medication_active_substances;`)
const medicationFormulations = numberScalar(`SELECT count(*) FROM medical.medication_formulations;`)
const medicationProducts = numberScalar(`SELECT count(*) FROM medical.medication_products;`)
const userMedications = numberScalar(`SELECT count(*) FROM medical.user_medications WHERE user_id IN (${IDS_SQL});`)
const userConditions = numberScalar(`SELECT count(*) FROM medical.user_conditions WHERE user_id IN (${IDS_SQL});`)
const supplementCatalog = numberScalar(`SELECT count(*) FROM supplements.supplement_catalog WHERE is_active;`)
const substanceAliases = numberScalar(`SELECT count(*) FROM supplements.substance_aliases;`)
const substanceLocalKimiMatches = numberScalar(`
  SELECT count(*)
  FROM supplements.substance_alias_matches
  WHERE (catalog_a = 'kimi_substance' AND catalog_b = 'lumeos_supplement_catalog')
     OR (catalog_a = 'lumeos_supplement_catalog' AND catalog_b = 'kimi_substance');`)
const ruleCatalog = numberScalar(`SELECT count(*) FROM supplements.rule_catalog;`)
const ruleWarning = numberScalar(`SELECT count(*) FROM supplements.rule_catalog WHERE rule_type = 'warning';`)
const ruleGap = numberScalar(`SELECT count(*) FROM supplements.rule_catalog WHERE rule_type = 'nutrient_gap';`)
const ruleMedication = numberScalar(`SELECT count(*) FROM supplements.rule_catalog WHERE rule_type = 'medication';`)
const supplementStacks = numberScalar(`SELECT count(*) FROM supplements.user_stacks WHERE user_id IN (${IDS_SQL});`)
const supplementStackItems = numberScalar(`
  SELECT count(*)
  FROM supplements.stack_items si
  JOIN supplements.user_stacks us ON us.id = si.stack_id
  WHERE us.user_id IN (${IDS_SQL});`)
const supplementIntakeLogs = numberScalar(`SELECT count(*) FROM supplements.intake_logs WHERE user_id IN (${IDS_SQL});`)
const coachPermissions = numberScalar(`SELECT count(*) FROM coach.client_permissions WHERE client_id IN (${IDS_SQL});`)
const coachAutonomy = numberScalar(`SELECT count(*) FROM coach.client_autonomy WHERE client_id IN (${IDS_SQL});`)
const coachPendingActions = numberScalar(`SELECT count(*) FROM coach.pending_actions WHERE client_id IN (${IDS_SQL});`)
const coachActionLog = numberScalar(`SELECT count(*) FROM coach.action_log WHERE client_id IN (${IDS_SQL});`)
const coachPermissionLogs = numberScalar(`SELECT count(*) FROM coach.permission_change_log WHERE client_id IN (${IDS_SQL});`)
const coachAutonomyLogs = numberScalar(`SELECT count(*) FROM coach.autonomy_change_log WHERE client_id IN (${IDS_SQL});`)
const coachRelationships = numberScalar(`SELECT count(*) FROM coach.relationships WHERE client_id IN (${IDS_SQL});`)
const coachRelationshipLogs = numberScalar(`SELECT count(*) FROM coach.relationship_change_log WHERE client_id IN (${IDS_SQL});`)
const coachCheckinTemplates = numberScalar(`SELECT count(*) FROM coach.checkin_templates WHERE client_id IN (${IDS_SQL});`)
const coachCheckins = numberScalar(`SELECT count(*) FROM coach.checkins WHERE client_id IN (${IDS_SQL});`)
const coachMessages = numberScalar(`SELECT count(*) FROM coach.messages WHERE client_id IN (${IDS_SQL});`)
const coachAlerts = numberScalar(`SELECT count(*) FROM coach.alerts WHERE client_id IN (${IDS_SQL});`)
const coachPermissionVariants = numberScalar(`
  SELECT count(DISTINCT visibility)
  FROM coach.client_permissions cp
  CROSS JOIN LATERAL (VALUES
    (cp.nutrition_visibility),
    (cp.training_visibility),
    (cp.recovery_visibility),
    (cp.goals_visibility),
    (cp.supplements_visibility),
    (cp.medical_visibility),
    (cp.buddy_visibility)
  ) v(visibility)
  WHERE cp.coach_id = '${COACH_ID}'::uuid
    AND cp.client_id = '${IDS[0]}'::uuid;`)
const supplementCompliance30d = Number(sql(`
  SELECT round(
    sum(total_taken)::numeric / NULLIF(sum(total_taken + total_skipped), 0) * 100,
    1
  )::text
  FROM supplements.daily_intake_summary
  WHERE user_id = '${IDS[0]}'::uuid
    AND intake_date BETWEEN DATE '${addIsoDays(TODAY_DATE, -29)}' AND DATE '${TODAY_DATE}';`)[0]?.[0] ?? 0)
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
  if (coachUsers !== 0) errors.push(`coach auth.users: ${coachUsers}, erwartet 0`)
  if (profiles !== 0) errors.push(`profiles: ${profiles}, erwartet 0`)
  if (targets !== 0) errors.push(`nutrition_targets: ${targets}, erwartet 0`)
  if (userGoals !== 0) errors.push(`user_goals: ${userGoals}, erwartet 0`)
  if (goalPhases !== 0) errors.push(`goal_phases: ${goalPhases}, erwartet 0`)
  if (goalMilestones !== 0) errors.push(`goal_milestones: ${goalMilestones}, erwartet 0`)
  if (bodyMeasurements !== 0) errors.push(`body_measurements: ${bodyMeasurements}, erwartet 0`)
  if (bodyCircumferences !== 0) errors.push(`body_circumferences: ${bodyCircumferences}, erwartet 0`)
  if (preferences !== 0) errors.push(`food_preferences: ${preferences}, erwartet 0`)
  if (preferenceItems !== 0) errors.push(`food_preference_items: ${preferenceItems}, erwartet 0`)
  if (recipes !== 0) errors.push(`recipes: ${recipes}, erwartet 0`)
  if (recipeIngredients !== 0) errors.push(`recipe_ingredients: ${recipeIngredients}, erwartet 0`)
  if (mealPlans !== 0) errors.push(`meal_plans: ${mealPlans}, erwartet 0`)
  if (mealPlanWeeks !== 0) errors.push(`meal_plan_weeks: ${mealPlanWeeks}, erwartet 0`)
  if (mealPlanDays !== 0) errors.push(`meal_plan_days: ${mealPlanDays}, erwartet 0`)
  if (mealPlanEntries !== 0) errors.push(`meal_plan_entries: ${mealPlanEntries}, erwartet 0`)
  if (meals !== 0) errors.push(`meals: ${meals}, erwartet 0`)
  if (items !== 0) errors.push(`meal_items: ${items}, erwartet 0`)
  if (waterLogs !== 0) errors.push(`water_logs: ${waterLogs}, erwartet 0`)
  if (trainingSessions !== 0) errors.push(`training.workout_sessions: ${trainingSessions}, erwartet 0`)
  if (trainingExercises !== 0) errors.push(`training.workout_exercises: ${trainingExercises}, erwartet 0`)
  if (trainingSets !== 0) errors.push(`training.workout_sets: ${trainingSets}, erwartet 0`)
  if (recoveryModalities !== 0) errors.push(`recovery.modality_log: ${recoveryModalities}, erwartet 0`)
  if (recoveryScores !== 0) errors.push(`recovery.scores: ${recoveryScores}, erwartet 0`)
  if (recoveryCheckins !== 0) errors.push(`recovery.checkins: ${recoveryCheckins}, erwartet 0`)
  if (medicalReports !== 0) errors.push(`medical.lab_reports: ${medicalReports}, erwartet 0`)
  if (medicalValues !== 0) errors.push(`medical.lab_result_values: ${medicalValues}, erwartet 0`)
  if (userMedications !== 0) errors.push(`medical.user_medications: ${userMedications}, erwartet 0`)
  if (userConditions !== 0) errors.push(`medical.user_conditions: ${userConditions}, erwartet 0`)
  if (medicalCatalog !== 11676) errors.push(`medical.biomarker_catalog: ${medicalCatalog}, erwartet 11676`)
  if (medicalRanges !== 564) errors.push(`medical.biomarker_reference_ranges: ${medicalRanges}, erwartet 564`)
  if (medicalAliases < 292) errors.push(`medical.biomarker_aliases: ${medicalAliases}, erwartet mindestens 292`)
  if (medicationActiveSubstances < 56) errors.push(`medical.medication_active_substances: ${medicationActiveSubstances}, erwartet mindestens 56`)
  if (medicationFormulations < 119) errors.push(`medical.medication_formulations: ${medicationFormulations}, erwartet mindestens 119`)
  if (medicationProducts < 124) errors.push(`medical.medication_products: ${medicationProducts}, erwartet mindestens 124`)
  if (supplementStacks !== 0) errors.push(`supplements.user_stacks: ${supplementStacks}, erwartet 0`)
  if (supplementStackItems !== 0) errors.push(`supplements.stack_items: ${supplementStackItems}, erwartet 0`)
  if (supplementIntakeLogs !== 0) errors.push(`supplements.intake_logs: ${supplementIntakeLogs}, erwartet 0`)
  if (coachPermissions !== 0) errors.push(`coach.client_permissions: ${coachPermissions}, erwartet 0`)
  if (coachAutonomy !== 0) errors.push(`coach.client_autonomy: ${coachAutonomy}, erwartet 0`)
  if (coachPendingActions !== 0) errors.push(`coach.pending_actions: ${coachPendingActions}, erwartet 0`)
  if (coachActionLog !== 0) errors.push(`coach.action_log: ${coachActionLog}, erwartet 0`)
  if (coachPermissionLogs !== 0) errors.push(`coach.permission_change_log: ${coachPermissionLogs}, erwartet 0`)
  if (coachAutonomyLogs !== 0) errors.push(`coach.autonomy_change_log: ${coachAutonomyLogs}, erwartet 0`)
  if (coachRelationships !== 0) errors.push(`coach.relationships: ${coachRelationships}, erwartet 0`)
  if (coachRelationshipLogs !== 0) errors.push(`coach.relationship_change_log: ${coachRelationshipLogs}, erwartet 0`)
  if (coachCheckinTemplates !== 0) errors.push(`coach.checkin_templates: ${coachCheckinTemplates}, erwartet 0`)
  if (coachCheckins !== 0) errors.push(`coach.checkins: ${coachCheckins}, erwartet 0`)
  if (coachMessages !== 0) errors.push(`coach.messages: ${coachMessages}, erwartet 0`)
  if (coachAlerts !== 0) errors.push(`coach.alerts: ${coachAlerts}, erwartet 0`)
  if (supplementCatalog < 44) errors.push(`supplements.supplement_catalog: ${supplementCatalog}, erwartet mindestens 44`)
  if (substanceAliases < 1100) errors.push(`supplements.substance_aliases: ${substanceAliases}, erwartet mindestens 1100`)
  if (substanceLocalKimiMatches < 16) errors.push(`supplements.substance_alias_matches LumeOS-Kimi: ${substanceLocalKimiMatches}, erwartet mindestens 16`)
  if (ruleCatalog !== 64) errors.push(`supplements.rule_catalog: ${ruleCatalog}, erwartet 64`)
  if (foods !== 7140) errors.push(`foods: ${foods}, erwartet 7140`)
  if (nutrients !== 869501) errors.push(`food_nutrients: ${nutrients}, erwartet 869501`)

  console.log('C-82 Testdaten-Pruefung (clean)')
  console.log(`  Nutzer/Coach/Profile/Ziele: ${users}/${coachUsers}/${profiles}/${targets}`)
  console.log(`  Goals/Phasen: ${userGoals}/${goalPhases}`)
  console.log(`  Meilensteine: ${goalMilestones}`)
  console.log(`  Koerpermessungen/Umfaenge: ${bodyMeasurements}/${bodyCircumferences}`)
  console.log(`  Preferences/Items: ${preferences}/${preferenceItems}`)
  console.log(`  Rezepte/Zutaten/Plaene/Wochen/Tage/Eintraege: ${recipes}/${recipeIngredients}/${mealPlans}/${mealPlanWeeks}/${mealPlanDays}/${mealPlanEntries}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
  console.log(`  Training Sessions/Exercises/Sets: ${trainingSessions}/${trainingExercises}/${trainingSets}`)
  console.log(`  Recovery Check-ins/Scores/Modalitaeten: ${recoveryCheckins}/${recoveryScores}/${recoveryModalities}`)
  console.log(`  Medical Katalog/Bereiche/Aliase/Befunde/Werte: ${medicalCatalog}/${medicalRanges}/${medicalAliases}/${medicalReports}/${medicalValues}`)
  console.log(`  Medical Medikamente Wirkstoffe/Formulierungen/Produkte/User/Conditions: ${medicationActiveSubstances}/${medicationFormulations}/${medicationProducts}/${userMedications}/${userConditions}`)
  console.log(`  Supplements Katalog/Stacks/Items/Logs: ${supplementCatalog}/${supplementStacks}/${supplementStackItems}/${supplementIntakeLogs}`)
  console.log(`  Supplements Regeln warning/gap/medication: ${ruleWarning}/${ruleGap}/${ruleMedication}`)
  console.log(`  Coach Permissions/Autonomy/Pending/Actions/Logs: ${coachPermissions}/${coachAutonomy}/${coachPendingActions}/${coachActionLog}/${coachPermissionLogs + coachAutonomyLogs}`)
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
  const distinctFoods = numberScalar(`
    SELECT count(DISTINCT mi.food_id)
    FROM nutrition.meals m
    JOIN nutrition.meal_items mi ON mi.meal_id = m.id
    WHERE m.user_id IN (${IDS_SQL});`)
  const tomDistinctDailyGrams = numberScalar(`
    SELECT count(DISTINCT grams)
    FROM (
      SELECT m.entry_date, sum(mi.amount_g)::numeric(10,1) AS grams
      FROM nutrition.meals m
      JOIN nutrition.meal_items mi ON mi.meal_id = m.id
      WHERE m.user_id = '${IDS[0]}'::uuid
      GROUP BY m.entry_date
    ) d;`)
  const tomDistinctDailyKcal = numberScalar(`
    SELECT count(DISTINCT round(enercc, 1))
    FROM nutrition.daily_summary
    WHERE user_id = '${IDS[0]}'::uuid;`)
  const assessmentRows = numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${IDS[0]}'::uuid, DATE '${relDate('2026-08-16')}');`)
  const assessmentPctRows = numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${IDS[0]}'::uuid, DATE '${relDate('2026-08-16')}')
    WHERE reference_pct IS NOT NULL;`)
  const missingCounters = sql(`
    SELECT
      COALESCE(sum(enercc_missing), 0)::text,
      COALESCE(sum(vita_missing), 0)::text,
      COALESCE(sum(fe_missing), 0)::text
    FROM nutrition.daily_summary
    WHERE user_id IN (${IDS_SQL});`)[0] ?? ['0', '0', '0']

  if (users !== 3) errors.push(`auth.users: ${users}, erwartet 3`)
  if (coachUsers !== 1) errors.push(`coach auth.users: ${coachUsers}, erwartet 1`)
  if (profiles !== 3) errors.push(`profiles: ${profiles}, erwartet 3`)
  if (targets !== 3) errors.push(`nutrition_targets: ${targets}, erwartet 3`)
  if (userGoals !== 6) errors.push(`user_goals: ${userGoals}, erwartet 6`)
  if (goalPhases !== 3) errors.push(`goal_phases: ${goalPhases}, erwartet 3`)
  if (goalMilestones !== 7) errors.push(`goal_milestones: ${goalMilestones}, erwartet 7`)
  if (activeGoals !== 3) errors.push(`aktive user_goals: ${activeGoals}, erwartet 3`)
  if (achievedGoals < 1) errors.push('kein erreichtes Ziel in der Historie')
  if (missedGoals < 1) errors.push('kein verfehltes Ziel in der Historie')
  if (abandonedGoals < 1) errors.push('kein abgebrochenes Ziel in der Historie')
  if (achievedMilestones < 1) errors.push('kein erreichter Meilenstein in der Historie')
  if (missedMilestones < 1) errors.push('kein verfehlter Meilenstein in der Historie')
  if (abandonedMilestones < 1) errors.push('kein abgebrochener Meilenstein in der Historie')
  if (bodyMeasurements !== 181) errors.push(`body_measurements: ${bodyMeasurements}, erwartet 181`)
  if (bodyCircumferences < 25) errors.push(`body_circumferences: ${bodyCircumferences}, erwartet mindestens 25`)
  if (preferences !== 1) errors.push(`food_preferences: ${preferences}, erwartet 1`)
  if (preferenceItems !== 3) errors.push(`food_preference_items: ${preferenceItems}, erwartet 3`)
  if (recipes !== 3) errors.push(`recipes: ${recipes}, erwartet 3`)
  if (recipeIngredients !== 11) errors.push(`recipe_ingredients: ${recipeIngredients}, erwartet 11`)
  if (mealPlans !== 1) errors.push(`meal_plans: ${mealPlans}, erwartet 1`)
  if (mealPlanWeeks !== 3) errors.push(`meal_plan_weeks: ${mealPlanWeeks}, erwartet 3`)
  if (mealPlanDays !== 21) errors.push(`meal_plan_days: ${mealPlanDays}, erwartet 21`)
  if (mealPlanEntries !== 56) errors.push(`meal_plan_entries: ${mealPlanEntries}, erwartet 56`)
  if (meals < 500) errors.push(`meals: ${meals}, erwartet mindestens 500`)
  if (items < 5000) errors.push(`meal_items: ${items}, erwartet mindestens 5000`)
  if (waterLogs < 500) errors.push(`water_logs: ${waterLogs}, erwartet mindestens 500`)
  if (trainingSessions < 25) errors.push(`training.workout_sessions: ${trainingSessions}, erwartet mindestens 25`)
  if (trainingExercises < 50) errors.push(`training.workout_exercises: ${trainingExercises}, erwartet mindestens 50`)
  if (trainingSets < 85) errors.push(`training.workout_sets: ${trainingSets}, erwartet mindestens 85 abgeschlossene Satzzeilen`)
  if (trainingSetsWithRir !== trainingSets) errors.push(`training.workout_sets mit rir: ${trainingSetsWithRir}/${trainingSets}`)
  if (trainingPrSets < 5) errors.push(`training.workout_sets is_pr: ${trainingPrSets}, erwartet mindestens 5`)
  if (trainingPrExercises < 3) errors.push(`Uebungen mit PR-Satz: ${trainingPrExercises}, erwartet mindestens 3`)
  if (recoveryCheckins < 160) errors.push(`recovery.checkins: ${recoveryCheckins}, erwartet mindestens 160`)
  if (recoveryScores < 160) errors.push(`recovery.scores: ${recoveryScores}, erwartet mindestens 160`)
  if (recoveryModalities < 50) errors.push(`recovery.modality_log: ${recoveryModalities}, erwartet mindestens 50`)
  if (medicalCatalog !== 11676) errors.push(`medical.biomarker_catalog: ${medicalCatalog}, erwartet 11676`)
  if (medicalRanges !== 564) errors.push(`medical.biomarker_reference_ranges: ${medicalRanges}, erwartet 564`)
  if (medicalAliases < 292) errors.push(`medical.biomarker_aliases: ${medicalAliases}, erwartet mindestens 292`)
  if (medicalReports !== 5) errors.push(`medical.lab_reports: ${medicalReports}, erwartet 5`)
  if (medicalValues !== 140) errors.push(`medical.lab_result_values: ${medicalValues}, erwartet 140`)
  if (medicationActiveSubstances < 56) errors.push(`medical.medication_active_substances: ${medicationActiveSubstances}, erwartet mindestens 56`)
  if (medicationFormulations < 119) errors.push(`medical.medication_formulations: ${medicationFormulations}, erwartet mindestens 119`)
  if (medicationProducts < 124) errors.push(`medical.medication_products: ${medicationProducts}, erwartet mindestens 124`)
  if (userMedications !== 1) errors.push(`medical.user_medications: ${userMedications}, erwartet 1`)
  if (userConditions !== 1) errors.push(`medical.user_conditions: ${userConditions}, erwartet 1`)
  if (supplementCatalog < 44) errors.push(`supplements.supplement_catalog: ${supplementCatalog}, erwartet mindestens 44`)
  if (substanceAliases < 1100) errors.push(`supplements.substance_aliases: ${substanceAliases}, erwartet mindestens 1100`)
  if (substanceLocalKimiMatches < 16) errors.push(`supplements.substance_alias_matches LumeOS-Kimi: ${substanceLocalKimiMatches}, erwartet mindestens 16`)
  if (ruleWarning !== 29) errors.push(`supplements.rule_catalog warning: ${ruleWarning}, erwartet 29`)
  if (ruleGap !== 15) errors.push(`supplements.rule_catalog nutrient_gap: ${ruleGap}, erwartet 15`)
  if (ruleMedication !== 20) errors.push(`supplements.rule_catalog medication: ${ruleMedication}, erwartet 20`)
  if (supplementStacks !== 1) errors.push(`supplements.user_stacks: ${supplementStacks}, erwartet 1`)
  if (supplementStackItems !== 4) errors.push(`supplements.stack_items: ${supplementStackItems}, erwartet 4`)
  if (supplementIntakeLogs !== 360) errors.push(`supplements.intake_logs: ${supplementIntakeLogs}, erwartet 360`)
  // F-07: Max traegt eine zweite Permissions-/Autonomy-Zeile (nur
  // Training/Recovery summary); dazu Beziehungen, Check-ins,
  // Nachrichten und Alerts fuer das Portal.
  if (coachPermissions !== 2) errors.push(`coach.client_permissions: ${coachPermissions}, erwartet 2`)
  if (coachAutonomy !== 2) errors.push(`coach.client_autonomy: ${coachAutonomy}, erwartet 2`)
  if (coachPendingActions !== 1) errors.push(`coach.pending_actions: ${coachPendingActions}, erwartet 1`)
  if (coachActionLog !== 1) errors.push(`coach.action_log: ${coachActionLog}, erwartet 1`)
  if (coachPermissionLogs < 3) errors.push(`coach.permission_change_log: ${coachPermissionLogs}, erwartet mindestens 3`)
  if (coachAutonomyLogs < 3) errors.push(`coach.autonomy_change_log: ${coachAutonomyLogs}, erwartet mindestens 3`)
  if (coachRelationships !== 3) errors.push(`coach.relationships: ${coachRelationships}, erwartet 3 (aktiv/aktiv/eingeladen)`)
  if (coachRelationshipLogs < 3) errors.push(`coach.relationship_change_log: ${coachRelationshipLogs}, erwartet mindestens 3`)
  if (coachCheckinTemplates !== 1) errors.push(`coach.checkin_templates: ${coachCheckinTemplates}, erwartet 1`)
  if (coachCheckins !== 3) errors.push(`coach.checkins: ${coachCheckins}, erwartet 3 (reviewed/submitted/pending)`)
  if (coachMessages !== 3) errors.push(`coach.messages: ${coachMessages}, erwartet 3`)
  if (coachAlerts !== 3) errors.push(`coach.alerts: ${coachAlerts}, erwartet 3`)
  if (coachPermissionVariants < 3) errors.push(`Coach-Permissions unterscheiden sich nicht genug: ${coachPermissionVariants} Sichtbarkeitswerte`)
  if (maxDays < 170) errors.push(`max Tage je Nutzer: ${maxDays}, erwartet mindestens 170`)
  if (frozenMissing !== 0) errors.push(`${frozenMissing} meal_items ohne frozen_at`)
  if (nutrientSnapshotsMissing !== 0) errors.push(`${nutrientSnapshotsMissing} meal_items ohne nutrient-Snapshot`)
  if (portionRows === 0) errors.push('keine meal_items mit gespeicherter Portion')
  if (dailyRows < 170) errors.push(`daily_summary: ${dailyRows}, erwartet mindestens 170`)
  if (distinctFoods < 40) errors.push(`verschiedene Lebensmittel: ${distinctFoods}, erwartet mindestens 40`)
  if (tomDistinctDailyGrams < 60) errors.push(`Tom Tagesgramm-Varianten: ${tomDistinctDailyGrams}, erwartet mindestens 60`)
  if (tomDistinctDailyKcal < 60) errors.push(`Tom Tageskalorien-Varianten: ${tomDistinctDailyKcal}, erwartet mindestens 60`)
  if (assessmentRows === 0) errors.push('daily_reference_assessment liefert keine Zeilen')
  if (assessmentPctRows === 0) errors.push('daily_reference_assessment liefert keinen Deckungsgrad')

  const tom = IDS[0]
  const max = IDS[1]
  const sarah = IDS[2]

  if (!hasRows(`
    SELECT 1
    FROM nutrition.meals
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${TODAY_DATE}'
    GROUP BY user_id, entry_date
    HAVING count(*) = 4;`)) {
    errors.push(`Fall heutiger Tag: Tom hat am ${TODAY_DATE} nicht genau 4 Mahlzeiten`)
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.water_logs
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${TODAY_DATE}'
    GROUP BY user_id, entry_date
    HAVING count(*) > 0;`)) {
    errors.push(`Fall heutiger Tag: Tom hat am ${TODAY_DATE} keinen Wassereintrag`)
  }
  if (!hasRows(`
    SELECT 1
    FROM recovery.checkins
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${TODAY_DATE}';`)) {
    errors.push(`Fall heutiger Tag: Tom hat am ${TODAY_DATE} keinen Recovery-Check-in`)
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.adaptive_tdee('${tom}'::uuid, DATE '${TODAY_DATE}', 14)
    WHERE status = 'complete'
      AND reliable
      AND complete_intake_days = 14
      AND weight_measurement_count = 14
      AND adaptive_tdee_kcal IS NOT NULL
      AND formula_tdee_kcal IS NOT NULL;`)) {
    errors.push(`Fall heutiger Tag: adaptive_tdee ist am ${TODAY_DATE} nicht complete`)
  }

  if (numberScalar(`SELECT count(*) FROM goals.zielwerte_am('${tom}'::uuid, DATE '${relDate('2026-08-02')}');`) !== 0) {
    errors.push('Fall Tag ohne Ziel: goals.zielwerte_am liefert vor gueltig_ab trotzdem eine Zeile')
  }
  if (numberScalar(`SELECT count(*) FROM goals.phase_am('${tom}'::uuid, DATE '${relDate('2026-08-02')}');`) !== 0) {
    errors.push('Fall Tag ohne Phase: goals.phase_am liefert vor erster gueltig_ab trotzdem eine Zeile')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.phase_am('${tom}'::uuid, DATE '${relDate('2026-08-10')}')
    WHERE phase_type = 'maintenance'
      AND gueltig_ab = DATE '${relDate('2026-08-03')}';`)) {
    errors.push('Fall Goals Phase vor Wechsel: maintenance am 2026-08-10 fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.phase_am('${tom}'::uuid, DATE '${relDate('2026-08-18')}')
    WHERE phase_type = 'lean_bulk'
      AND gueltig_ab = DATE '${relDate('2026-08-17')}';`)) {
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
    FROM goals.adaptive_tdee('${tom}'::uuid, DATE '${relDate('2026-09-13')}', 14)
    WHERE status = 'complete'
      AND reliable
      AND complete_intake_days = 14
      AND weight_measurement_count = 14
      AND source = 'derived_adaptive_tdee'
      AND formula_tdee_kcal IS NOT NULL
      AND raw_tdee_kcal IS NOT NULL
      AND adaptive_tdee_kcal IS NOT NULL
      AND adaptive_tdee_kcal <> formula_tdee_kcal;`)) {
    errors.push('Fall Adaptive TDEE: Tom liefert keinen belastbaren 14-Tage-Wert neben dem Formelwert')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.adaptive_tdee('${max}'::uuid, DATE '${relDate('2026-09-13')}', 14)
    WHERE adaptive_tdee_kcal IS NULL
      AND NOT reliable
      AND status IN ('insufficient_weight_measurements', 'insufficient_intake_days');`)) {
    errors.push('Fall Adaptive TDEE ohne Daten: Max bekommt trotz fehlender Gewichtsdaten einen Wert')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.goal_progress_at('30000000-0000-0000-0000-000000000101'::uuid, DATE '${END_DATE}')
    WHERE progress_status = 'measured'
      AND current_source = 'goals.body_measurements'
      AND current_value = 85
      AND measured_at = DATE '${END_DATE}';`)) {
    errors.push('Fall Ziel-Fortschritt: Gewichtsziel liest nicht die echte Koerpermessung')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.goal_milestone_status('32000000-0000-0000-0000-000000000101'::uuid, DATE '${END_DATE}')
    WHERE computed_status = 'achieved'
      AND current_value = 85
      AND source = 'seed';`)) {
    errors.push('Fall Meilenstein erreicht: 85-kg-Meilenstein wird nicht erreicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.goal_milestone_status('32000000-0000-0000-0000-000000000102'::uuid, DATE '${END_DATE}')
    WHERE computed_status = 'open'
      AND current_value = 85;`)) {
    errors.push('Fall Meilenstein offen: 86,5-kg-Meilenstein bleibt nicht offen')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.goal_milestone_status('32000000-0000-0000-0000-000000000103'::uuid, DATE '${END_DATE}')
    WHERE computed_status = 'missed'
      AND current_value = 85;`)) {
    errors.push('Fall Meilenstein verfehlt: verfehlter Meilenstein verschwindet oder gilt als erreicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.goal_milestone_status('32000000-0000-0000-0000-000000000201'::uuid, DATE '${END_DATE}')
    WHERE computed_status = 'not_measurable'
      AND current_value IS NULL
      AND progress_pct IS NULL;`)) {
    errors.push('Fall Ziel ohne messbare Quelle: Performance-Meilenstein bekommt geratenen Fortschritt')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT count(*) AS messungen,
             min(measurement_date) AS von,
             max(measurement_date) AS bis,
             min(weight_kg) AS min_kg,
             max(weight_kg) AS max_kg,
             max(weight_kg) FILTER (WHERE measurement_date = DATE '${END_DATE}') AS latest_kg
      FROM goals.body_measurements
      WHERE user_id = '${tom}'::uuid
    ) m
    JOIN public.profiles p ON p.id = '${tom}'::uuid
    WHERE m.messungen = 181
      AND m.von = DATE '${relDate('2026-08-02')}'
      AND m.bis = DATE '${END_DATE}'
      AND m.max_kg - m.min_kg >= 0.8
      AND p.body_weight_kg = m.latest_kg;`)) {
    errors.push('Fall Koerpermessungen: 181-Tage-Gewichtsverlauf oder Profilgewicht-Sync fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.body_measurements
    WHERE user_id = '${tom}'::uuid
      AND measurement_date = DATE '${END_DATE}'
      AND measurement_time = TIME '07:05'
      AND height_cm_snapshot = 185
      AND measurement_source = 'manual'
      AND bf_method = 'manual'
      AND bmi IS NOT NULL
      AND lean_mass_kg IS NOT NULL
      AND ffmi IS NOT NULL;`)) {
    errors.push('Fall Koerpermessungen: Hoehen-Snapshot, Herkunft oder abgeleitete Werte fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.body_circumferences
    WHERE user_id = '${tom}'::uuid
      AND measurement_date = DATE '${END_DATE}'
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
      AND calf_right_cm IS NOT NULL
      AND measurement_source = 'manual';`)) {
    errors.push('Fall Umfaenge: letzte Messung mit 13 Koerperumfaengen oder Herkunft fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM goals.body_composition_navy('${tom}'::uuid, DATE '${END_DATE}')
    WHERE method = 'navy_circumference'
      AND source = 'derived_navy'
      AND input_source = 'manual'
      AND standard_error_pct_points = 3.5
      AND body_fat_pct BETWEEN 5 AND 35
      AND body_fat_pct - body_fat_pct_min = 3.5
      AND body_fat_pct_max - body_fat_pct = 3.5
      AND ffmi IS NOT NULL
      AND lean_mass_kg IS NOT NULL
      AND caution LIKE '%Athleten%';`)) {
    errors.push('Fall Navy-Koerperfett: Wert, Spanne, FFMI oder Herkunft fehlen')
  }
  if (numberScalar(`SELECT count(*) FROM goals.body_composition_navy('${sarah}'::uuid, DATE '${END_DATE}');`) !== 0) {
    errors.push('Fall Navy-Koerperfett ohne Umfaenge: Funktion liefert trotz fehlender Eingaben eine Zeile')
  }
  if (!hasRows(`
    WITH first_value AS (
      SELECT body_fat_pct
      FROM goals.body_composition_navy('${tom}'::uuid, DATE '${relDate('2026-08-02')}')
    ),
    last_value AS (
      SELECT body_fat_pct
      FROM goals.body_composition_navy('${tom}'::uuid, DATE '${END_DATE}')
    )
    SELECT 1
    FROM first_value f
    CROSS JOIN last_value l
    WHERE f.body_fat_pct > l.body_fat_pct
      AND f.body_fat_pct - l.body_fat_pct >= 1.0;`)) {
    errors.push('Fall Navy-Koerperfett Verlauf: ueber 180 Tage ist keine fallende Tendenz sichtbar')
  }
  if (!hasRows(`SELECT 1 FROM nutrition.daily_summary WHERE user_id = '${tom}'::uuid AND entry_date = DATE '${relDate('2026-08-02')}' AND item_count > 0;`)) {
    errors.push('Fall Tag ohne Ziel: daily_summary fehlt oder hat keine Positionen')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${tom}'::uuid, DATE '${relDate('2026-08-05')}')
    WHERE nutrient_code = 'VITA'
      AND reference_kind = 'UL'
      AND reference_status = 'complete'
      AND reference_pct > 100;`)) {
    errors.push('Fall Vitamin A ueber UL: VITA UL > 100 % fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '${relDate('2026-08-04')}')
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
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '${relDate('2026-08-06')}')
    WHERE reference_status = 'incomplete'
      AND missing_count > 0;`)) {
    errors.push('Fall lueckenhafte Daten: reference_status incomplete fehlt')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '${relDate('2026-08-09')}')
    WHERE nutrient_code IN ('FE', 'CA', 'VITD')
      AND reference_status = 'complete'
      AND reference_direction = 'target'
      AND reference_pct < 50;`) !== 3) {
    errors.push('Fall Mikronaehrstoffmangel: FE, CA und VITD liegen nicht alle unter 50 %')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.daily_reference_assessment('${max}'::uuid, DATE '${relDate('2026-08-09')}')
    WHERE nutrient_code IN ('F18:2CN6', 'F18:3CN3')
      AND reference_kind = 'AI'
      AND reference_direction = 'target'
      AND reference_status = 'complete'
      AND reference_basis = 'goals_target_from_energy_percent'
      AND reference_value_min IS NOT NULL
      AND reference_pct IS NOT NULL;`) !== 2) {
    errors.push('Fall essenzielle Fettsaeuren: Linolsaeure und Alpha-Linolensaeure werden nicht gegen Goals-Ziele bewertet')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_reference_assessment('${tom}'::uuid, DATE '${relDate('2026-08-16')}')
    WHERE nutrient_code = 'CHORL'
      AND reference_kind = 'NO_REFERENCE'
      AND reference_direction = 'not_applicable'
      AND reference_status = 'not_applicable'
      AND reference_pct IS NULL;`)) {
    errors.push('Fall ohne Referenz: CHORL bleibt nicht sauber NO_REFERENCE ohne Prozentwert')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.micronutrient_below_threshold('${max}'::uuid, DATE '${relDate('2026-08-09')}')
    WHERE total_assessed >= 17
      AND below_count >= 16
      AND below_count <= total_assessed;`)) {
    errors.push('Fall Mikronaehrstoffmangel: Below-threshold-Liste bewertet den Szenariotag nicht plausibel')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-07')}'
      AND ds.enercc / z.kcal * 100 BETWEEN 35 AND 45;`)) {
    errors.push('Fall Kalorien unter Ziel: Zielerreichung liegt nicht bei rund 40 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${max}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-10')}'
      AND ds.enercc / z.kcal * 100 > 140;`)) {
    errors.push('Fall Kalorien ueber Ziel: Zielerreichung liegt nicht ueber 140 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-21')}'
      AND ds.prot625 / z.protein_g * 100 < 50;`)) {
    errors.push('Fall Protein unter Ziel: Protein liegt nicht unter 50 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-22')}'
      AND ds.prot625 / z.protein_g * 100 > 140;`)) {
    errors.push('Fall Protein ueber Ziel: Protein liegt nicht ueber 140 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-23')}'
      AND ds.fat / z.fat_g * 100 < 50;`)) {
    errors.push('Fall Fett unter Ziel: Fett liegt nicht unter 50 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-24')}'
      AND ds.fat / z.fat_g * 100 > 140;`)) {
    errors.push('Fall Fett ueber Ziel: Fett liegt nicht ueber 140 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-25')}'
      AND ds.cho / z.carbs_g * 100 < 50;`)) {
    errors.push('Fall Kohlenhydrate unter Ziel: Kohlenhydrate liegen nicht unter 50 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary ds
    JOIN goals.zielwerte_am(ds.user_id, ds.entry_date) z ON true
    WHERE ds.user_id = '${tom}'::uuid
      AND ds.entry_date = DATE '${relDate('2026-08-26')}'
      AND ds.cho / z.carbs_g * 100 > 140;`)) {
    errors.push('Fall Kohlenhydrate ueber Ziel: Kohlenhydrate liegen nicht ueber 140 %')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${relDate('2026-08-11')}'
      AND meal_count >= 1
      AND item_count = 0
      AND enercc IS NULL;`)) {
    errors.push('Fall leere Mahlzeiten: meal_count >= 1, item_count 0 und NULL-Summen fehlen')
  }
  if (numberScalar(`SELECT count(*) FROM nutrition.meals WHERE user_id = '${max}'::uuid AND entry_date = DATE '${relDate('2026-08-08')}';`) !== 0) {
    errors.push('Fall Tag ohne Mahlzeit: nutrition.meals enthaelt Zeilen')
  }
  if (numberScalar(`SELECT count(*) FROM nutrition.daily_summary WHERE user_id = '${max}'::uuid AND entry_date = DATE '${relDate('2026-08-08')}';`) !== 0) {
    errors.push('Fall Tag ohne Mahlzeit: daily_summary enthaelt eine Zeile')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.daily_summary
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${relDate('2026-08-13')}'
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
        AND m.entry_date = DATE '${relDate('2026-08-13')}'
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
        AND entry_date = DATE '${relDate('2026-08-14')}'
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
    FROM nutrition.daily_reference_assessment('${sarah}'::uuid, DATE '${relDate('2026-08-16')}')
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
    FROM nutrition.recipes r
    JOIN nutrition.recipe_nutrition(r.id) rn ON rn.recipe_id = r.id
    WHERE r.user_id = '${tom}'::uuid
      AND r.name_de = 'Huhn-Reis-Bowl'
      AND r.cuisine_code = 'asian'
      AND r.cooking_skill = 'intermediate'
      AND r.prep_time_min = 25
      AND rn.ingredient_count = 4
      AND rn.enercc > 0
      AND rn.prot625 > 0;`)) {
    errors.push('Fall C-150 Rezept: Huhn-Reis-Bowl mit Zutaten und gerechneten Naehrwerten fehlt')
  }
  if (!hasRows(`
    WITH weeks AS (
      SELECT
        count(*) FILTER (WHERE copied_from_week_id IS NULL AND name = 'Gefuellte Aufbauwoche') AS filled_weeks,
        count(*) FILTER (WHERE copied_from_week_id IS NULL AND name = 'Leere Planwoche') AS empty_weeks,
        count(*) FILTER (WHERE copied_from_week_id IS NOT NULL) AS copied_weeks
      FROM nutrition.meal_plan_weeks
      WHERE user_id = '${tom}'::uuid
    ),
    entry_counts AS (
      SELECT
        count(e.id) FILTER (WHERE w.copied_from_week_id IS NULL AND w.name = 'Gefuellte Aufbauwoche') AS filled_entries,
        count(e.id) FILTER (WHERE w.copied_from_week_id IS NULL AND w.name = 'Leere Planwoche') AS empty_entries,
        count(e.id) FILTER (WHERE w.copied_from_week_id IS NOT NULL) AS copied_entries
      FROM nutrition.meal_plan_weeks w
      JOIN nutrition.meal_plan_days d ON d.week_id = w.id
      LEFT JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
      WHERE w.user_id = '${tom}'::uuid
    )
    SELECT 1
    FROM weeks, entry_counts
    WHERE filled_weeks = 1
      AND empty_weeks = 1
      AND copied_weeks = 1
      AND filled_entries = 28
      AND empty_entries = 0
      AND copied_entries = 28;`)) {
    errors.push('Fall C-150 Wochenplan: gefuellte/leere/kopierte Woche stimmt nicht')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.meal_plans mp
    JOIN auth.users u ON u.id = mp.user_id
    WHERE u.email = 'test-user@lumeos.local';`) !== 0) {
    errors.push('Fall C-150 RLS-Gegenkonto: test-user hat Wochenplaene, erwartet keine')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.hydration_day('${tom}'::uuid, DATE '${relDate('2026-08-16')}')
    WHERE log_count > 0
      AND target_ml = 2762
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
      AND s.session_date = DATE '${relDate('2026-08-03')}'
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
        AND session_date BETWEEN DATE '${relDate('2026-08-03')}' AND DATE '${relDate('2026-09-06')}'
    ) d
  WHERE tage >= 5;`)) {
    errors.push('Fall Training Verlauf: mehrere Wochen abgeschlossene Sitzungen fehlen')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM training.workout_sessions
    WHERE user_id = '${tom}'::uuid
      AND status = 'completed'
      AND session_date > DATE '${TODAY_DATE}';`) !== 0) {
    errors.push('Fall Training Status: completed-Sitzungen nach heute vorhanden')
  }
  if (!hasRows(`
    SELECT 1
    FROM training.workout_sessions
    WHERE user_id = '${tom}'::uuid
      AND status = 'cancelled'
      AND session_date <= DATE '${TODAY_DATE}';`)) {
    errors.push('Fall Training Status: cancelled-Sitzung fehlt')
  }
  if (!hasRows(`
    WITH future AS (
      SELECT
        count(*) AS total,
        count(*) FILTER (WHERE status = 'planned') AS planned
      FROM training.workout_sessions
      WHERE user_id = '${tom}'::uuid
        AND session_date > DATE '${TODAY_DATE}'
    )
    SELECT 1 FROM future WHERE total > 0 AND total = planned;`)) {
    errors.push('Fall Training Status: Zukunftssitzungen sind nicht vollstaendig planned')
  }
  if (!hasRows(`
    WITH bench AS (
      SELECT s.session_date, max(ws.estimated_1rm) AS best_1rm
      FROM training.workout_sessions s
      JOIN training.workout_exercises we ON we.workout_session_id = s.id
      JOIN training.workout_sets ws ON ws.workout_exercise_id = we.id
      WHERE s.user_id = '${tom}'::uuid
        AND s.status = 'completed'
        AND we.exercise_name = 'Barbell Bench Press'
      GROUP BY s.session_date
    ),
    edge AS (
      SELECT
        (SELECT best_1rm FROM bench ORDER BY session_date ASC LIMIT 1) AS first_1rm,
        (SELECT best_1rm FROM bench ORDER BY session_date DESC LIMIT 1) AS last_1rm
    )
    SELECT 1
    FROM edge
    WHERE last_1rm > first_1rm * 1.035
      AND round(last_1rm, 1) = 99.3;`)) {
    errors.push('Fall Training e1RM: Bankdruecken steigt nicht plausibel bis 99,3 kg')
  }
  if (!hasRows(`
    SELECT 1
    FROM recovery.checkins
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${relDate('2026-08-18')}'
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
    FROM recovery.scores
    WHERE user_id = '${tom}'::uuid
      AND entry_date = DATE '${relDate('2026-08-18')}'
      AND mode = 'manual'
      AND algorithm_version = 'manual_v1_c125'
      AND hrv_score IS NULL
      AND hrv_source = 'not_used_manual_mode'
      AND nutrition_score = 70
      AND nutrition_source = 'fallback_c123_e9'
      AND modality_bonus = 0
      AND soreness_reported_count = 3
      AND soreness_avg_used BETWEEN 2.32 AND 2.34
      AND soreness_score BETWEEN 22.1 AND 22.3
      AND score BETWEEN 40 AND 80;`)) {
    errors.push('Fall Recovery Score: Manual-Score ohne HRV oder E2-Soreness-Regel fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM recovery.modality_log
    WHERE user_id = '${tom}'::uuid
      AND modality_type IN ('sauna','massage','cold_plunge','stretching')
      AND bonus_source = 'pending_c124_e5'
      AND bonus_value = 0
    GROUP BY user_id
    HAVING count(DISTINCT modality_type) = 4
       AND count(*) >= 50;`)) {
    errors.push('Fall Recovery Modalitaeten: Sauna, Massage, Eisbad und Dehnen mit pending-Bonus fehlen')
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
    WHERE checkins >= 160
      AND von = DATE '${relDate('2026-08-03')}'
      AND bis >= DATE '${relDate('2026-09-07')}'
      AND ohne_hrv > 0;`)) {
    errors.push('Fall Recovery Verlauf: mehrere Wochen Check-ins mit HRV-losen Zeilen fehlen')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_reports r
    JOIN medical.lab_result_values v ON v.report_id = r.id
    JOIN medical.biomarker_catalog c ON c.loinc_code = v.loinc_code
    WHERE r.user_id = '${tom}'::uuid
      AND r.report_date = DATE '${relDate('2026-08-18')}'
      AND r.report_time = TIME '09:20'
      AND r.source = 'seed'
      AND c.loinc_code = '718-7'
      AND c.long_common_name = 'Hemoglobin [Mass/volume] in Blood'
      AND v.marker_name_snapshot = 'Hemoglobin'
      AND v.unit_snapshot = 'g/dL'
      AND v.frozen_at IS NOT NULL;`)) {
    errors.push('Fall Medical Befund: Befundwert ist nicht mit LOINC-Katalog und eingefrorenem Snapshot verbunden')
  }
  if (!hasRows(`
    SELECT 1
    FROM (
      SELECT
        count(DISTINCT r.id) AS reports,
        count(DISTINCT v.loinc_code) AS marker,
        min(r.report_date) AS von,
        max(r.report_date) AS bis
      FROM medical.lab_reports r
      JOIN medical.lab_result_values v ON v.report_id = r.id
      WHERE r.user_id = '${tom}'::uuid
        AND r.title LIKE 'C-76 Verlaufspanel%'
        AND v.loinc_code <> '17861-6'
    ) p
    WHERE reports = 4
      AND marker = 34
      AND von = DATE '${relDate('2026-02-18')}'
      AND bis = DATE '${relDate('2026-08-18')}';`)) {
    errors.push('Fall Medical Verlaufspanel: vier Befunde mit 34 wiederholten Markern fehlen')
  }
  if (!hasRows(`
    WITH glucose AS (
      SELECT r.report_date, v.value_numeric
      FROM medical.lab_reports r
      JOIN medical.lab_result_values v ON v.report_id = r.id
      WHERE r.user_id = '${tom}'::uuid
        AND v.loinc_code = '1558-6'
    ),
    hba1c AS (
      SELECT r.report_date, v.value_numeric
      FROM medical.lab_reports r
      JOIN medical.lab_result_values v ON v.report_id = r.id
      WHERE r.user_id = '${tom}'::uuid
        AND v.loinc_code = '4548-4'
    )
    SELECT 1
    FROM glucose g1
    JOIN glucose g2 ON g1.report_date = DATE '${relDate('2026-02-18')}' AND g2.report_date = DATE '${relDate('2026-08-18')}'
    JOIN hba1c h1 ON h1.report_date = DATE '${relDate('2026-02-18')}'
    JOIN hba1c h2 ON h2.report_date = DATE '${relDate('2026-08-18')}'
    WHERE g2.value_numeric > g1.value_numeric
      AND h2.value_numeric >= h1.value_numeric;`)) {
    errors.push('Fall Medical Verlauf: Glukose/HbA1c zeigen keine erkennbare Tendenz')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_result_values_read('${tom}'::uuid, '50000000-0000-0000-0000-000000000104'::uuid)
    WHERE loinc_code = '718-7'
      AND reference_source = 'lab_report'
      AND reference_low = 13.5
      AND reference_high = 17.5
      AND reference_unit = 'g/dL';`)) {
    errors.push('Fall Medical Laborbereich: labor-eigener Referenzbereich gewinnt nicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_result_values_read('${tom}'::uuid, '50000000-0000-0000-0000-000000000104'::uuid)
    WHERE loinc_code = '17861-6'
      AND reference_source = 'catalog_fallback'
      AND reference_text = '8.5–10.5 mg/dL';`)) {
    errors.push('Fall Medical Katalog-Fallback: Calcium ohne Laborbereich nutzt keinen Katalogbereich')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_reports r
    JOIN medical.lab_result_values v ON v.report_id = r.id
    WHERE r.user_id = '${tom}'::uuid
      AND r.report_date = DATE '${relDate('2026-08-19')}'
      AND r.report_time = TIME '08:40'
      AND r.title = 'C-72 Importierter Rohbefund'
      AND v.raw_marker_name = 'Hämoglobin'
      AND v.loinc_code = '718-7'
      AND v.match_status = 'exact'
      AND v.entry_confidence >= 0.95
      AND NOT v.needs_verification;`)) {
    errors.push('Fall Medical Import exakt: Hämoglobin wird nicht eindeutig auf 718-7 gemappt')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_reports r
    JOIN medical.lab_result_values v ON v.report_id = r.id
    WHERE r.user_id = '${tom}'::uuid
      AND r.report_date = DATE '${relDate('2026-08-19')}'
      AND v.raw_marker_name = 'Glukose'
      AND v.loinc_code IS NULL
      AND v.match_status = 'ambiguous'
      AND v.needs_verification
      AND jsonb_array_length(v.match_candidates) >= 3;`)) {
    errors.push('Fall Medical Import mehrdeutig: Glukose bleibt nicht als mehrdeutig mit Kandidaten erhalten')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.lab_reports r
    JOIN medical.lab_result_values v ON v.report_id = r.id
    WHERE r.user_id = '${tom}'::uuid
      AND r.report_date = DATE '${relDate('2026-08-19')}'
      AND v.raw_marker_name = 'Unbekannter Marker X'
      AND v.marker_name_snapshot = 'Unbekannter Marker X'
      AND v.loinc_code IS NULL
      AND v.match_status = 'unknown'
      AND v.needs_verification
      AND jsonb_array_length(v.match_candidates) = 0;`)) {
    errors.push('Fall Medical Import unbekannt: unbekannter Rohmarker wird nicht gespeichert')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.user_medications um
    JOIN medical.medication_active_substances s ON s.id = um.active_substance_id
    WHERE um.user_id = '${tom}'::uuid
      AND um.name = 'Warfarin'
      AND 'anticoagulant:warfarin' = ANY(um.drug_class)
      AND 'CYP2C9_substrate' = ANY(um.cyp_profile)
      AND um.dose_amount = 5
      AND um.dose_unit = 'mg'
      AND um.doses_per_day = 1
      AND um.measurement_source = 'seed'
      AND um.frozen_at IS NOT NULL
      AND um.drug_class = s.drug_class
      AND um.cyp_profile = s.cyp_profile;`)) {
    errors.push('Fall Medical Medikation: Warfarin-Snapshot mit drug_class/cyp_profile fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM medical.user_conditions
    WHERE user_id = '${tom}'::uuid
      AND condition_code = 'hypertension'
      AND status = 'active'
      AND measurement_source = 'seed';`)) {
    errors.push('Fall Medical Conditions: hypertension-Condition fuer Tom fehlt')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM medical.user_medications um
    JOIN auth.users u ON u.id = um.user_id
    WHERE u.email = 'test-user@lumeos.local';`) !== 0) {
    errors.push('Fall Medical Medikation: test-user hat Medikation, erwartet keine')
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
    FROM supplements.stack_item_substance_matches m
    JOIN supplements.user_stacks us ON us.user_id = m.user_id
    WHERE m.user_id = '${tom}'::uuid
      AND m.supplement_slug = 'creatine-monohydrate'
      AND m.kimi_substance_id = 'sub_9f9bb8c160'
      AND us.is_active;`)) {
    errors.push('Fall Supplements Substanzbruecke: Kreatin-Stack-Item trifft Kimi-Substanz nicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.platform_input_status('${tom}'::uuid, DATE '${TODAY_DATE}')
    WHERE input_path = 'sleep.sleep_latency_min'
      AND input_status = 'missing_input';`)) {
    errors.push('Fall missing_input: sleep.sleep_latency_min wird nicht als fehlender Eingang gemeldet')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.rule_assessment('${tom}'::uuid, DATE '${TODAY_DATE}')
    WHERE rule_id = 'wr_anticoag_stack'
      AND evaluation_state = 'fulfilled'
      AND recommended_action_type = 'physician_referral';`)) {
    errors.push('Fall Regeln: wr_anticoag_stack feuert fuer Warfarin + Omega-3 nicht')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.rule_assessment('${tom}'::uuid, DATE '${TODAY_DATE}')
    WHERE rule_id = 'wr_warfarin_vitk'
      AND evaluation_state = 'not_fulfilled'
      AND cardinality(missing_inputs) = 0;`)) {
    errors.push('Fall Regeln: wr_warfarin_vitk ist nicht sauber nicht_erfuellt')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.rule_assessment('${tom}'::uuid, DATE '${TODAY_DATE}')
    WHERE rule_id = 'wr_lab_biotin'
      AND evaluation_state = 'missing_input'
      AND 'medical.lab_draw_scheduled_within_days' = ANY(missing_inputs);`)) {
    errors.push('Fall Regeln: wr_lab_biotin meldet fehlenden Laborabnahme-Eingang nicht')
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
      AND il.intake_date = DATE '${relDate('2026-08-18')}'
      AND il.intake_time = TIME '08:12'
      AND il.status = 'skipped'
      AND il.supplement_name_snapshot = 'Vitamin D3'
      AND il.dose_snapshot = 5000
      AND il.dose_unit_snapshot = 'IU';`)) {
    errors.push('Fall Supplements Einnahme: eingefrorener Vitamin-D3-Snapshot fehlt')
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.daily_intake_summary
    WHERE user_id = '${tom}'::uuid
      AND intake_date = DATE '${relDate('2026-08-18')}'
      AND total_logged = 4
      AND total_skipped = 4
      AND compliance_pct = 0;`)) {
    errors.push('Fall Supplements Tagesuebersicht: voller ausgelassener Tag fehlt')
  }
  if (!(supplementCompliance30d > 0 && supplementCompliance30d < 100)) {
    errors.push(`Fall Supplements Compliance: 30-Tage-Compliance ${supplementCompliance30d}, erwartet unter 100 und ueber 0`)
  }
  if (!hasRows(`
    SELECT 1
    FROM supplements.user_stacks us
    JOIN supplements.stack_items si ON si.stack_id = us.id
    JOIN supplements.supplement_catalog c ON c.id = si.supplement_id
    WHERE us.user_id = '${tom}'::uuid
      AND (
        (c.slug = 'creatine-monohydrate' AND si.stock_remaining = 150 AND si.low_stock_threshold = 150)
        OR (c.slug = 'omega-3-epa-dha' AND si.stock_remaining = 14 AND si.low_stock_threshold = 14)
        OR (c.slug = 'vitamin-d3' AND si.stock_remaining = 4 AND si.low_stock_threshold = 7)
      )
    GROUP BY us.user_id
    HAVING count(DISTINCT c.slug) = 3;`)) {
    errors.push('Fall Supplements Refill-Stufen: 1 Monat, 2 Wochen und 1 Woche fehlen')
  }
  if (numberScalar(`
    SELECT count(*)
    FROM nutrition.micronutrient_snapshot('${tom}'::uuid, DATE '${relDate('2026-08-16')}');`) !== 8) {
    errors.push('Fall Micronutrient snapshot: liefert nicht exakt 8 Werte')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.micronutrient_snapshot('${tom}'::uuid, DATE '${relDate('2026-08-16')}')
    WHERE nutrient_code = 'F18:3CN3'
      AND reference_kind = 'GOAL'
      AND reference_pct IS NOT NULL;`)) {
    errors.push('Fall Micronutrient snapshot: Omega-3 (ALA) wird nicht gegen Goals-Ziel bewertet')
  }
  if (!hasRows(`
    SELECT 1
    FROM nutrition.micronutrient_below_threshold('${max}'::uuid, DATE '${relDate('2026-08-09')}') mangel
    CROSS JOIN nutrition.micronutrient_below_threshold('${tom}'::uuid, DATE '${relDate('2026-08-16')}') normal
    WHERE mangel.threshold_pct = 75
      AND normal.threshold_pct = 75
      AND mangel.total_assessed > 0
      AND normal.total_assessed > 0
      AND mangel.below_count > normal.below_count;`)) {
    errors.push('Fall Below threshold: Mangel-Szenariotag ist nicht laenger als ein normaler Tag')
  }

  console.log('C-82 Testdaten-Pruefung (present)')
  console.log(`  Nutzer/Coach/Profile/Ziele: ${users}/${coachUsers}/${profiles}/${targets}`)
  console.log(`  Goals/Phasen: ${userGoals}/${goalPhases}`)
  console.log(`  Meilensteine: ${goalMilestones}`)
  console.log(`  Koerpermessungen/Umfaenge: ${bodyMeasurements}/${bodyCircumferences}`)
  console.log(`  Preferences/Items: ${preferences}/${preferenceItems}`)
  console.log(`  Rezepte/Zutaten/Plaene/Wochen/Tage/Eintraege: ${recipes}/${recipeIngredients}/${mealPlans}/${mealPlanWeeks}/${mealPlanDays}/${mealPlanEntries}`)
  console.log(`  Meals/Items/Water: ${meals}/${items}/${waterLogs}`)
  console.log(`  Training Sessions/Exercises/Sets: ${trainingSessions}/${trainingExercises}/${trainingSets}`)
  console.log(`  Training Status: ${trainingStatusRows.map(([status, count]) => `${status}:${count}`).join(', ')}`)
  console.log(`  Training RIR/PR-Saetze/PR-Uebungen: ${trainingSetsWithRir}/${trainingPrSets}/${trainingPrExercises}`)
  console.log(`  Recovery Check-ins/Scores/Modalitaeten: ${recoveryCheckins}/${recoveryScores}/${recoveryModalities}`)
  console.log(`  Medical Katalog/Bereiche/Aliase/Befunde/Werte: ${medicalCatalog}/${medicalRanges}/${medicalAliases}/${medicalReports}/${medicalValues}`)
  console.log(`  Supplements Katalog/Stacks/Items/Logs: ${supplementCatalog}/${supplementStacks}/${supplementStackItems}/${supplementIntakeLogs}`)
  console.log(`  Supplements Substanzaliase/LumeOS-Kimi-Treffer: ${substanceAliases}/${substanceLocalKimiMatches}`)
  console.log(`  Supplements Regeln warning/gap/medication: ${ruleWarning}/${ruleGap}/${ruleMedication}`)
  console.log(`  Supplements Compliance 30d: ${supplementCompliance30d}%`)
  console.log(`  Coach Permissions/Autonomy/Pending/Actions/Logs: ${coachPermissions}/${coachAutonomy}/${coachPendingActions}/${coachActionLog}/${coachPermissionLogs + coachAutonomyLogs}`)
  console.log(`  Max. Tage je Nutzer: ${maxDays}`)
  console.log(`  Portionierte Items: ${portionRows}`)
  console.log(`  Verschiedene Lebensmittel: ${distinctFoods}`)
  console.log(`  Tom Tagesgramm-/Kalorien-Varianten: ${tomDistinctDailyGrams}/${tomDistinctDailyKcal}`)
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
