#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
// G-175: das Anmeldewort des Pruefkontos kommt aus derselben Quelle
// wie tools/schuss.mjs und die Nachweisskripte — eine Stelle.
import { KONTEN } from '../../../tools/konten.mjs'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const ALLOWED_ARGS = new Set(['--start', '--next-start', '--days', '--today'])

for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index]!
  if (!arg.startsWith('--')) continue
  if (!ALLOWED_ARGS.has(arg)) {
    throw new Error(`Unbekannter Parameter: ${arg}`)
  }
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${arg} braucht einen Wert`)
  }
  index += 1
}

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name)
  return index >= 0 ? (process.argv[index + 1] ?? null) : null
}

function addIsoDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysOffset(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000)
}

const ANCHOR_DATE = '2026-08-02'
const START_DATE = argValue('--start') ?? '2026-05-20'
const NEXT_START_DATE = argValue('--next-start') ?? '2026-08-19'
const WINDOW_DAYS = Number(argValue('--days') ?? 90)
if (!/^\d{4}-\d{2}-\d{2}$/.test(START_DATE) || !/^\d{4}-\d{2}-\d{2}$/.test(NEXT_START_DATE)) {
  throw new Error('--start und --next-start muessen YYYY-MM-DD sein')
}
if (!Number.isInteger(WINDOW_DAYS) || WINDOW_DAYS <= 0) {
  throw new Error('--days muss eine positive ganze Zahl sein')
}
const WINDOWS = [
  { start: START_DATE, end: addIsoDays(START_DATE, WINDOW_DAYS) },
  { start: NEXT_START_DATE, end: addIsoDays(NEXT_START_DATE, WINDOW_DAYS - 1) },
]
const TARGET_START_DATE = addIsoDays(START_DATE, 1)
const ALL_DATES = WINDOWS.flatMap(window => daysBetween(window.start, window.end))
const END_DATE = WINDOWS[WINDOWS.length - 1]!.end
// C-412/C-413: Einnahmeprotokolle muessen bis zum Lauftag reichen.
// --today bleibt fuer einen reproduzierbaren Nachweis moeglich.
const TODAY_DATE = argValue('--today') ?? new Date().toISOString().slice(0, 10)

function relDate(anchorDate: string): string {
  return addIsoDays(START_DATE, daysOffset(ANCHOR_DATE, anchorDate))
}

type TestUser = {
  id: string
  email: string
  displayName: string
  birthDate: string | null
  biologicalSex: 'male' | 'female'
  heightCm: number
  bodyWeightKg: number | null
  activityLevel: 'light' | 'moderate' | 'active' | 'very_active'
  nutritionGoal: 'lose_weight' | 'gain_muscle' | 'performance'
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  tdee: number
}

type MealRow = {
  id: string
  userId: string
  entryDate: string
  mealType: string
  mealTime: string
  notes: string
}

type WaterLogRow = {
  userId: string
  entryDate: string
  amountMl: number
  source: 'manual' | 'quick_add'
  loggedAt: string
}

type TrainingSessionRow = {
  id: string
  userId: string
  sessionDate: string
  startedTime: string
  endedTime: string
  name: string
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  location: string
  notes: string
}

type TrainingExerciseTemplate = {
  exerciseName: string
  plannedSets: number
  plannedReps: string
  plannedWeightKg: number | null
  sets: Array<{
    reps: number
    weightKg: number
    rpe: number
    setType?: 'working' | 'warmup'
  }>
}

type TrainingExerciseRow = {
  id: string
  sessionId: string
  exerciseName: string
  exerciseOrder: number
  plannedSets: number
  plannedReps: string
  plannedWeightKg: number | null
}

type TrainingSetRow = {
  workoutExerciseId: string
  setNumber: number
  reps: number
  weightKg: number
  rpe: number
  rir: number
  setType: 'working' | 'warmup'
  isPr: boolean
}

type RecoveryCheckinRow = {
  userId: string
  entryDate: string
  checkinTime: string
  sleepHours: number
  sleepQuality: number
  sleepStartTime: string | null
  sleepEndTime: string | null
  subjectiveFeeling: number
  mood: 'motivated' | 'good' | 'neutral' | 'tired' | 'sick'
  energyLevel: number
  motivation: number
  soreness: string
  stressLevel: number
  workStress: number | null
  lifeStress: number | null
  alcoholUnits: number
  caffeineMg: number
  screenTimeBeforeBed: number
  restingHr: number | null
  hrvRmssd: number | null
  spo2Pct: number | null
  respiratoryRate: number | null
  notes: string
}

type RecoveryModalityLogRow = {
  userId: string
  entryDate: string
  loggedTime: string
  modalityType: 'sauna' | 'cold_plunge' | 'massage' | 'stretching'
  durationMin: number
  detail: string
  immediateEffect: number
  nextDayEffect: number
  notes: string
}

type GoalRow = {
  id: string
  userId: string
  goalType: 'body_composition' | 'performance' | 'health' | 'lifestyle'
  subtype: string | null
  title: string
  description: string | null
  targetValue: number | null
  targetUnit: string | null
  startValue: number | null
  currentValue: number | null
  gueltigAb: string
  targetDate: string | null
  status: 'active' | 'paused' | 'achieved' | 'missed' | 'abandoned' | 'on_hold'
  priority: number
  isPrimary: boolean
  progressPct: number
  motivationReason: string | null
  difficultyLevel: 'easy' | 'moderate' | 'challenging' | 'aggressive' | 'unrealistic' | null
  achievementDate: string | null
}

type GoalPhaseRow = {
  id: string
  userId: string
  goalId: string | null
  phaseType: 'fat_loss' | 'lean_bulk' | 'maintenance' | 'recomp' | 'contest_prep' | 'reverse_diet' | 'expert_bb_annual' | 'mini_cut' | 'peak_week'
  variant: string | null
  parameters: string
  gueltigAb: string
  projectedEndDate: string | null
  actualEndDate: string | null
  transitionedFrom: string | null
  recommendedNext: string | null
  transitionReason: string | null
}

type GoalMilestoneRow = {
  id: string
  goalId: string
  userId: string
  milestoneType: 'absolute_value' | 'percentage' | 'date' | 'behavioral'
  title: string
  description: string | null
  targetValue: number | null
  targetUnit: string | null
  thresholdPct: number | null
  targetDate: string | null
  status: 'open' | 'achieved' | 'missed' | 'abandoned'
  achievedDate: string | null
  achievedValue: number | null
  celebrationMessage: string | null
  autoGenerated: boolean
  notificationSent: boolean
  source: 'seed'
  sourceDetail: string
}

type BodyMeasurementRow = {
  userId: string
  measurementDate: string
  measurementTime: string
  weightKg: number
  bodyFatPct: number | null
  bfMethod: 'manual' | 'visual' | null
  measurementSource: 'manual'
  notes: string
}

type BodyCircumferenceRow = {
  userId: string
  measurementDate: string
  measurementTime: string
  neckCm: number
  shouldersCm: number
  chestCm: number
  upperArmLeftCm: number
  upperArmRightCm: number
  forearmLeftCm: number
  forearmRightCm: number
  waistCm: number
  hipCm: number
  thighLeftCm: number
  thighRightCm: number
  calfLeftCm: number
  calfRightCm: number
  measurementSource: 'manual'
  notes: string
}

type SupplementStackRow = {
  id: string
  userId: string
  name: string
  description: string
  goal: 'muscle_building' | 'fat_loss' | 'recovery_sleep' | 'health' | 'longevity' | 'performance' | 'custom'
  isActive: boolean
}

type SupplementStackItemRow = {
  id: string
  stackId: string
  supplementSlug: string
  dose: number
  doseUnit: string
  frequency: 'daily' | 'weekdays' | 'training_days' | 'custom' | 'cycling'
  timing: 'morning' | 'midday' | 'evening' | 'pre_workout' | 'post_workout' | 'bedtime' | 'with_meal' | 'any'
  stockRemaining: number | null
  stockUnit: string | null
  lowStockThreshold: number | null
  sortOrder: number
  notes: string
}

type SupplementIntakeLogRow = {
  userId: string
  stackItemId: string
  intakeDate: string
  intakeTime: string
  status: 'planned' | 'taken' | 'skipped' | 'snoozed'
  supplementNameSnapshot: string
  doseSnapshot: number
  doseUnitSnapshot: string
  actualDose: number | null
  actualDoseUnit: string | null
  notes: string
}

type MedicalLabReportRow = {
  id: string
  userId: string
  reportDate: string
  reportTime: string
  labName: string
  title: string
  source: 'manual' | 'pdf_upload' | 'photo_ocr' | 'lab_import' | 'seed'
  notes: string
}

type MedicalLabValueRow = {
  reportId: string
  userId: string
  loincCode: string
  markerNameSnapshot: string
  unitSnapshot: string
  valueNumeric: number
  valueText: string | null
  valueOperator: '=' | '<' | '<=' | '>' | '>='
  labReferenceLow: number | null
  labReferenceHigh: number | null
  labReferenceText: string | null
  labReferenceUnit: string | null
  labReferenceSource: string | null
  source: 'manual' | 'pdf_upload' | 'photo_ocr' | 'lab_import' | 'seed'
  notes: string
}

type ItemTemplate = {
  blsCode: string
  amountG: number
  portionName?: string
  portionQuantity?: number
  portionAmountG?: number
}

type ItemRow = ItemTemplate & {
  mealId: string
  userId: string
}

type RecipeRow = {
  id: string
  userId: string
  nameDe: string
  description: string
  instructions: string
  cuisineCode: string
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
  prepTimeMin: number
  cookTimeMin: number
  servings: number
  tags: string
}

type RecipeIngredientRow = {
  recipeId: string
  userId: string
  sortOrder: number
  blsCode: string
  amountG: number
  portionName?: string
  portionQuantity?: number
  portionAmountG?: number
}

type MealPlanRow = {
  id: string
  userId: string
  name: string
  description: string
  planOrigin?: 'self_created' | 'coach_created' | 'marketplace' | 'buddy'
  lifecycleType: 'once' | 'rollover' | 'sequence'
  startDate: string
  daysCount: number
  targetKcal: number
  targetProteinG: number
  targetCarbsG: number
  targetFatG: number
  isActive: boolean
}

type MealPlanSlotRow = {
  planId: string
  userId: string
  position: number
  name: string
  plannedTime: string
}

type MealPlanWeekRow = {
  id: string
  planId: string
  userId: string
  weekStart: string
  name: string
}

type MealPlanDayRow = {
  id: string
  weekId: string
  userId: string
  planDate: string
  dayIndex: number
  notes: string | null
}

type MealPlanEntryRow = {
  dayId: string
  userId: string
  mealType: (typeof MEAL_TYPES)[number]
  plannedTime: string
  slotOrder: number
  entryType: 'recipe' | 'bls'
  recipeId?: string
  blsCode?: string
  amountG?: number
  plannedServings?: number
  portionName?: string
  portionQuantity?: number
  portionAmountG?: number
  note?: string
}

type DayPlan = Record<string, ItemTemplate[]>
type SpecialDayPlan = DayPlan | 'skip-day'

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'] as const
const MEAL_TIMES: Record<(typeof MEAL_TYPES)[number], string> = {
  breakfast: '07:30',
  lunch: '12:30',
  snack: '16:00',
  dinner: '19:30',
}

const USERS: TestUser[] = [
  {
    id: '10000000-0000-0000-0000-000000000101',
    email: 'tom.seed@example.com',
    displayName: 'Tom Miller',
    birthDate: '1995-03-15',
    biologicalSex: 'male',
    heightCm: 185,
    bodyWeightKg: 85,
    activityLevel: 'light',
    nutritionGoal: 'gain_muscle',
    kcal: 2500,
    proteinG: 170,
    carbsG: 313,
    fatG: 75,
    tdee: 2273,
  },
  {
    id: '10000000-0000-0000-0000-000000000102',
    email: 'max.seed@example.com',
    displayName: 'Max Schmidt',
    birthDate: '1998-07-22',
    biologicalSex: 'male',
    heightCm: 178,
    bodyWeightKg: 78,
    activityLevel: 'light',
    nutritionGoal: 'performance',
    kcal: 2200,
    proteinG: 156,
    carbsG: 275,
    fatG: 65,
    tdee: 1913,
  },
  {
    id: '10000000-0000-0000-0000-000000000103',
    email: 'sarah.seed@example.com',
    displayName: 'Sarah Johnson',
    birthDate: null,
    biologicalSex: 'female',
    heightCm: 165,
    bodyWeightKg: null,
    activityLevel: 'active',
    nutritionGoal: 'lose_weight',
    kcal: 1800,
    proteinG: 150,
    carbsG: 200,
    fatG: 50,
    tdee: 2250,
  },
]

const COACH_USER = {
  id: '10000000-0000-0000-0000-000000000901',
  email: 'coach.seed@example.com',
  displayName: 'Coach Seed',
}

const PLANS: Record<string, Record<string, ItemTemplate[]>> = {
  'tom.seed@example.com': {
    breakfast: [
      { blsCode: 'C133000', amountG: 80, portionName: '1 Tasse roh', portionQuantity: 1, portionAmountG: 80 },
      { blsCode: 'F503100', amountG: 120 },
      { blsCode: 'E111100', amountG: 116, portionName: '1 Ei (Größe M)', portionQuantity: 2, portionAmountG: 58 },
    ],
    lunch: [
      { blsCode: 'V416100', amountG: 220 },
      { blsCode: 'C351000', amountG: 95 },
      { blsCode: 'G312132', amountG: 220 },
      { blsCode: 'Q120000', amountG: 15, portionName: '1 EL', portionQuantity: 1, portionAmountG: 15 },
    ],
    snack: [
      { blsCode: 'M713100', amountG: 250 },
      { blsCode: 'B101000', amountG: 60, portionName: '1 Scheibe', portionQuantity: 2, portionAmountG: 30 },
    ],
    dinner: [
      { blsCode: 'T410052', amountG: 180 },
      { blsCode: 'K420100', amountG: 300 },
      { blsCode: 'G211100', amountG: 120 },
      { blsCode: 'Q120000', amountG: 10, portionName: '1 EL', portionQuantity: 0.667, portionAmountG: 15 },
    ],
  },
  'max.seed@example.com': {
    breakfast: [
      { blsCode: 'B101000', amountG: 90, portionName: '1 Scheibe', portionQuantity: 3, portionAmountG: 30 },
      { blsCode: 'E111100', amountG: 174, portionName: '1 Ei (Größe M)', portionQuantity: 3, portionAmountG: 58 },
      { blsCode: 'F503100', amountG: 100 },
    ],
    lunch: [
      { blsCode: 'V416100', amountG: 200 },
      { blsCode: 'K110100', amountG: 320 },
      { blsCode: 'G312132', amountG: 180 },
      { blsCode: 'Q120000', amountG: 15, portionName: '1 EL', portionQuantity: 1, portionAmountG: 15 },
    ],
    snack: [
      { blsCode: 'M141100', amountG: 300 },
      { blsCode: 'C133000', amountG: 50, portionName: '1 Portion Müsli', portionQuantity: 1, portionAmountG: 50 },
    ],
    dinner: [
      { blsCode: 'T410052', amountG: 160 },
      { blsCode: 'C352000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
      { blsCode: 'G211100', amountG: 150 },
    ],
  },
  'sarah.seed@example.com': {
    breakfast: [
      { blsCode: 'C133000', amountG: 60, portionName: '1 Portion Müsli', portionQuantity: 1.2, portionAmountG: 50 },
      { blsCode: 'M141100', amountG: 250 },
      { blsCode: 'F503100', amountG: 100 },
    ],
    lunch: [
      { blsCode: 'E111100', amountG: 116, portionName: '1 Ei (Größe M)', portionQuantity: 2, portionAmountG: 58 },
      { blsCode: 'C351000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
      { blsCode: 'G312132', amountG: 250 },
      { blsCode: 'Q120000', amountG: 10, portionName: '1 EL', portionQuantity: 0.667, portionAmountG: 15 },
    ],
    snack: [
      { blsCode: 'M713100', amountG: 200 },
      { blsCode: 'B101000', amountG: 30, portionName: '1 Scheibe', portionQuantity: 1, portionAmountG: 30 },
    ],
    dinner: [
      { blsCode: 'K420100', amountG: 250 },
      { blsCode: 'G211100', amountG: 180 },
      { blsCode: 'E111100', amountG: 58, portionName: '1 Ei (Größe M)', portionQuantity: 1, portionAmountG: 58 },
      { blsCode: 'Q120000', amountG: 10, portionName: '1 EL', portionQuantity: 0.667, portionAmountG: 15 },
    ],
  },
}

const SPECIAL_DAY_PLANS: Record<string, Record<string, SpecialDayPlan>> = {
  'tom.seed@example.com': {
    [relDate('2026-08-05')]: {
      breakfast: [
        { blsCode: 'Y273032', amountG: 20 },
        { blsCode: 'C352000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-07')]: {
      breakfast: [
        { blsCode: 'C352000', amountG: 250 },
        { blsCode: 'F503100', amountG: 120 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-11')]: {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-13')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 80, portionName: '1 Tasse roh', portionQuantity: 1, portionAmountG: 80 },
        { blsCode: 'M141100', amountG: 200 },
        { blsCode: 'F503100', amountG: 100 },
        { blsCode: 'B101000', amountG: 30, portionName: '1 Scheibe', portionQuantity: 1, portionAmountG: 30 },
        { blsCode: 'E111100', amountG: 58, portionName: '1 Ei (Größe M)', portionQuantity: 1, portionAmountG: 58 },
        { blsCode: 'Q120000', amountG: 5 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 100 },
        { blsCode: 'C352000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
        { blsCode: 'G312132', amountG: 100 },
        { blsCode: 'G211100', amountG: 100 },
        { blsCode: 'Q120000', amountG: 15, portionName: '1 EL', portionQuantity: 1, portionAmountG: 15 },
        { blsCode: 'R111000', amountG: 1 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 100 },
        { blsCode: 'B101000', amountG: 60, portionName: '1 Scheibe', portionQuantity: 2, portionAmountG: 30 },
        { blsCode: 'F503100', amountG: 80 },
        { blsCode: 'C133000', amountG: 50, portionName: '1 Portion Müsli', portionQuantity: 1, portionAmountG: 50 },
        { blsCode: 'S111000', amountG: 20 },
        { blsCode: 'Q120000', amountG: 5 },
      ],
      dinner: [
        { blsCode: 'T410052', amountG: 100 },
        { blsCode: 'K420100', amountG: 150 },
        { blsCode: 'G312132', amountG: 150 },
        { blsCode: 'C351000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
        { blsCode: 'E111100', amountG: 58, portionName: '1 Ei (Größe M)', portionQuantity: 1, portionAmountG: 58 },
        { blsCode: 'Q120000', amountG: 10 },
      ],
    },
    [relDate('2026-08-21')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 90 },
        { blsCode: 'F110100', amountG: 180 },
      ],
      lunch: [
        { blsCode: 'C352000', amountG: 160 },
        { blsCode: 'G620132', amountG: 200 },
        { blsCode: 'Q120000', amountG: 20 },
      ],
      snack: [
        { blsCode: 'F503100', amountG: 180 },
        { blsCode: 'S111000', amountG: 30 },
      ],
      dinner: [
        { blsCode: 'K420100', amountG: 350 },
        { blsCode: 'G561100', amountG: 180 },
        { blsCode: 'Q120000', amountG: 15 },
      ],
    },
    [relDate('2026-08-22')]: {
      breakfast: [
        { blsCode: 'E111100', amountG: 232, portionName: '1 Ei (Größe M)', portionQuantity: 4, portionAmountG: 58 },
        { blsCode: 'M710100', amountG: 300 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 300 },
        { blsCode: 'C351000', amountG: 80 },
        { blsCode: 'G312132', amountG: 200 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 300 },
      ],
      dinner: [
        { blsCode: 'T121100', amountG: 260 },
        { blsCode: 'G211100', amountG: 200 },
        { blsCode: 'Q120000', amountG: 10 },
      ],
    },
    [relDate('2026-08-23')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 80 },
        { blsCode: 'M141100', amountG: 250 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 250 },
        { blsCode: 'C352000', amountG: 140 },
        { blsCode: 'G311132', amountG: 200 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 250 },
        { blsCode: 'F110100', amountG: 150 },
      ],
      dinner: [
        { blsCode: 'T204100', amountG: 220 },
        { blsCode: 'K110100', amountG: 300 },
        { blsCode: 'G520100', amountG: 180 },
      ],
    },
    [relDate('2026-08-24')]: {
      breakfast: [
        { blsCode: 'E111100', amountG: 174, portionName: '1 Ei (Größe M)', portionQuantity: 3, portionAmountG: 58 },
        { blsCode: 'F502100', amountG: 150 },
      ],
      lunch: [
        { blsCode: 'T410100', amountG: 250 },
        { blsCode: 'C351000', amountG: 90 },
        { blsCode: 'Q120000', amountG: 35 },
      ],
      snack: [
        { blsCode: 'H120100', amountG: 60 },
        { blsCode: 'M713500', amountG: 200 },
      ],
      dinner: [
        { blsCode: 'V122100', amountG: 220 },
        { blsCode: 'K420100', amountG: 220 },
        { blsCode: 'Q120000', amountG: 25 },
      ],
    },
    [relDate('2026-08-25')]: {
      breakfast: [
        { blsCode: 'E111100', amountG: 174, portionName: '1 Ei (Größe M)', portionQuantity: 3, portionAmountG: 58 },
        { blsCode: 'M711100', amountG: 250 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 240 },
        { blsCode: 'G211100', amountG: 240 },
        { blsCode: 'Q120000', amountG: 20 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 250 },
      ],
      dinner: [
        { blsCode: 'T410100', amountG: 220 },
        { blsCode: 'G582100', amountG: 250 },
        { blsCode: 'Q120000', amountG: 15 },
      ],
    },
    [relDate('2026-08-26')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 130 },
        { blsCode: 'F503100', amountG: 180 },
        { blsCode: 'S111000', amountG: 25 },
      ],
      lunch: [
        { blsCode: 'C352000', amountG: 220 },
        { blsCode: 'G620132', amountG: 180 },
        { blsCode: 'V416100', amountG: 120 },
      ],
      snack: [
        { blsCode: 'B101000', amountG: 120, portionName: '1 Scheibe', portionQuantity: 4, portionAmountG: 30 },
        { blsCode: 'F130100', amountG: 180 },
      ],
      dinner: [
        { blsCode: 'C119200', amountG: 180 },
        { blsCode: 'G760132', amountG: 180 },
        { blsCode: 'Q120000', amountG: 10 },
      ],
    },
  },
  'max.seed@example.com': {
    [relDate('2026-08-04')]: {
      breakfast: [
        { blsCode: 'R111000', amountG: 6 },
        { blsCode: 'B101000', amountG: 60, portionName: '1 Scheibe', portionQuantity: 2, portionAmountG: 30 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-06')]: {
      breakfast: [
        { blsCode: 'R466000', amountG: 50 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-08')]: 'skip-day',
    [relDate('2026-08-09')]: {
      breakfast: [
        { blsCode: 'C352000', amountG: 300 },
        { blsCode: 'S111000', amountG: 200 },
        { blsCode: 'Q120000', amountG: 50 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-10')]: {
      breakfast: [
        { blsCode: 'Q120000', amountG: 300 },
        { blsCode: 'S111000', amountG: 150 },
        { blsCode: 'C352000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
        { blsCode: 'V416100', amountG: 200 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    [relDate('2026-08-23')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 80 },
        { blsCode: 'M141100', amountG: 250 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 250 },
        { blsCode: 'C352000', amountG: 140 },
        { blsCode: 'G311132', amountG: 200 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 250 },
        { blsCode: 'F110100', amountG: 150 },
      ],
      dinner: [
        { blsCode: 'T204100', amountG: 220 },
        { blsCode: 'K110100', amountG: 300 },
        { blsCode: 'G520100', amountG: 180 },
      ],
    },
    [relDate('2026-08-24')]: {
      breakfast: [
        { blsCode: 'E111100', amountG: 174, portionName: '1 Ei (Größe M)', portionQuantity: 3, portionAmountG: 58 },
        { blsCode: 'F502100', amountG: 150 },
      ],
      lunch: [
        { blsCode: 'T410100', amountG: 250 },
        { blsCode: 'C351000', amountG: 90 },
        { blsCode: 'Q120000', amountG: 35 },
      ],
      snack: [
        { blsCode: 'H120100', amountG: 60 },
        { blsCode: 'M713500', amountG: 200 },
      ],
      dinner: [
        { blsCode: 'V122100', amountG: 220 },
        { blsCode: 'K420100', amountG: 220 },
        { blsCode: 'Q120000', amountG: 25 },
      ],
    },
    [relDate('2026-08-25')]: {
      breakfast: [
        { blsCode: 'E111100', amountG: 174, portionName: '1 Ei (Größe M)', portionQuantity: 3, portionAmountG: 58 },
        { blsCode: 'M711100', amountG: 250 },
      ],
      lunch: [
        { blsCode: 'V416100', amountG: 240 },
        { blsCode: 'G211100', amountG: 240 },
        { blsCode: 'Q120000', amountG: 20 },
      ],
      snack: [
        { blsCode: 'M713100', amountG: 250 },
      ],
      dinner: [
        { blsCode: 'T410100', amountG: 220 },
        { blsCode: 'G582100', amountG: 250 },
        { blsCode: 'Q120000', amountG: 15 },
      ],
    },
    [relDate('2026-08-26')]: {
      breakfast: [
        { blsCode: 'C133000', amountG: 130 },
        { blsCode: 'F503100', amountG: 180 },
        { blsCode: 'S111000', amountG: 25 },
      ],
      lunch: [
        { blsCode: 'C352000', amountG: 220 },
        { blsCode: 'G620132', amountG: 180 },
        { blsCode: 'V416100', amountG: 120 },
      ],
      snack: [
        { blsCode: 'B101000', amountG: 120, portionName: '1 Scheibe', portionQuantity: 4, portionAmountG: 30 },
        { blsCode: 'F130100', amountG: 180 },
      ],
      dinner: [
        { blsCode: 'C119200', amountG: 180 },
        { blsCode: 'G760132', amountG: 180 },
        { blsCode: 'Q120000', amountG: 10 },
      ],
    },
  },
}

const FOOD_ROTATIONS: Record<string, string[]> = {
  C133000: ['C133000', 'B101000', 'B710500', 'B491000'],
  F503100: ['F503100', 'F110100', 'F130100', 'F304100', 'F514100', 'F516100', 'F603100'],
  E111100: ['E111100'],
  V416100: ['V416100', 'T121100', 'T204100', 'T410100', 'V122100'],
  C351000: ['C351000', 'C352000', 'C119100', 'C119200', 'K110100', 'K420100'],
  G312132: ['G312132', 'G311132', 'G620132', 'G760132', 'G710132', 'G582132'],
  Q120000: ['Q120000'],
  M713100: ['M713100', 'M710100', 'M711100', 'M141100', 'M111300'],
  B101000: ['B101000', 'B710500', 'B491000'],
  T410052: ['T410052', 'T121100', 'T204100', 'V416100', 'V122100'],
  K420100: ['K420100', 'K110100', 'C119132', 'C352000'],
  G211100: ['G211100', 'G561100', 'G520100', 'G541100', 'G322100'],
  M141100: ['M141100', 'M713100', 'M710100', 'M711100'],
  K110100: ['K110100', 'K420100', 'C119132', 'C352000'],
  C352000: ['C352000', 'C351000', 'C119100', 'C119200'],
}

const WEEKDAY_SCALE = [0.96, 0.99, 1.03, 1.01, 1.04, 0.98, 1.02]
const WEEK_BLOCK_SCALE = [0.98, 1.00, 1.02, 1.01, 0.99]
const MEAL_SCALE: Record<string, number[]> = {
  breakfast: [0.96, 1.00, 1.03, 1.01, 1.04, 0.98, 1.02],
  lunch: [0.98, 1.03, 1.06, 1.02, 1.05, 1.00, 1.04],
  snack: [0.94, 0.98, 1.02, 0.97, 1.03, 1.00, 0.96],
  dinner: [1.00, 1.02, 1.05, 1.03, 1.06, 1.01, 1.04],
}
const EXTRA_ITEMS: Record<string, ItemTemplate> = {
  breakfast: { blsCode: 'F503100', amountG: 70 },
  lunch: { blsCode: 'G312132', amountG: 90 },
  snack: { blsCode: 'B101000', amountG: 30, portionName: '1 Scheibe', portionQuantity: 1, portionAmountG: 30 },
  dinner: { blsCode: 'G211100', amountG: 90 },
}

function globalDayIndex(date: string): number {
  const index = ALL_DATES.indexOf(date)
  return index >= 0 ? index : daysOffset(START_DATE, date)
}

function dayScaleFor(user: TestUser, date: string): number {
  const dayIndex = globalDayIndex(date)
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
  const weekIndex = Math.floor(dayIndex / 7)
  const userOffset = USERS.findIndex(seedUser => seedUser.email === user.email)
  const hasTraining = dayIndex % 6 === 1
  const afterTraining = dayIndex > 0 && (dayIndex - 1) % 6 === 1
  const trainingScale = hasTraining ? 1.08 : afterTraining ? 1.04 : 1.00
  const userScale = 1 + userOffset * 0.015

  return WEEKDAY_SCALE[dow]! * WEEK_BLOCK_SCALE[(weekIndex + userOffset) % WEEK_BLOCK_SCALE.length]! * trainingScale * userScale
}

function templatesForMeal(templates: ItemTemplate[], mealType: string, dayIndex: number, mealIndex: number, userOffset: number): ItemTemplate[] {
  const next = [...templates]
  const marker = dayIndex + mealIndex + userOffset

  if (next.length > 1 && marker % 8 === 3) {
    next.pop()
  }
  if (marker % 9 === 4) {
    next.push(EXTRA_ITEMS[mealType]!)
  }

  return next
}

function rotatedTemplate(template: ItemTemplate, offset: number, dayScale: number, mealScale: number): ItemTemplate {
  const rotation = FOOD_ROTATIONS[template.blsCode] ?? [template.blsCode]
  const blsCode = rotation[offset % rotation.length]!
  const itemScale = 1 + (((offset * 37) % 17) - 8) * 0.0125
  const amountG = Math.max(1, Math.round(template.amountG * dayScale * mealScale * itemScale))
  const next: ItemTemplate = { blsCode, amountG }

  return next
}

function variedDayPlan(plan: DayPlan, user: TestUser, date: string): DayPlan {
  const dayIndex = globalDayIndex(date)
  const userOffset = USERS.findIndex(seedUser => seedUser.email === user.email) * 3
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
  const dayScale = dayScaleFor(user, date)

  return Object.fromEntries(MEAL_TYPES.map((mealType, mealIndex) => {
    const mealScale = MEAL_SCALE[mealType][dow]!
    const mealTemplates = templatesForMeal(plan[mealType], mealType, dayIndex, mealIndex, userOffset)
    const templates = mealTemplates.map((template, itemIndex) =>
      rotatedTemplate(template, dayIndex + mealIndex + itemIndex + userOffset, dayScale, mealScale))
    return [mealType, templates]
  })) as DayPlan
}

function uuidFrom(label: string): string {
  const hex = crypto.createHash('sha1').update(`lumeos-testdaten:${label}`).digest('hex').slice(0, 32)
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    ((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
    hex.slice(20, 32),
  ].join('-')
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetween(start: string, end: string): string[] {
  const dates: string[] = []
  for (let date = start; date <= end; date = addDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

function lit(value: string | number | boolean | null): string {
  if (value === null) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(6)
  return `'${value.replace(/'/g, "''")}'`
}

function tuple(values: Array<string | number | boolean | null>): string {
  return `(${values.map(lit).join(', ')})`
}

const meals: MealRow[] = []
const items: ItemRow[] = []
const waterLogs: WaterLogRow[] = []
const trainingSessions: TrainingSessionRow[] = []
const trainingExercises: TrainingExerciseRow[] = []
const trainingSets: TrainingSetRow[] = []
const recoveryCheckins: RecoveryCheckinRow[] = []
const recoveryModalities: RecoveryModalityLogRow[] = []
const goalRows: GoalRow[] = [
  {
    id: '30000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    goalType: 'body_composition',
    subtype: 'gain_muscle',
    title: 'Lean Bulk bis September',
    description: 'C-82/GO-07 Testziel fuer sichtbare Goals-Kacheln',
    targetValue: 88,
    targetUnit: 'kg',
    startValue: 85,
    currentValue: 86.2,
    gueltigAb: relDate('2026-08-03'),
    targetDate: addIsoDays(END_DATE, 30),
    status: 'active',
    priority: 1,
    isPrimary: true,
    progressPct: 40,
    motivationReason: 'Muskelaufbau ohne aggressiven Ueberschuss',
    difficultyLevel: 'moderate',
    achievementDate: null,
  },
  {
    id: '30000000-0000-0000-0000-000000000102',
    userId: '10000000-0000-0000-0000-000000000101',
    goalType: 'performance',
    subtype: 'strength',
    title: 'Bankdruecken stabilisieren',
    description: 'Sekundaeres Performance-Ziel fuer Max-3-aktive-Regel',
    targetValue: 120,
    targetUnit: 'kg',
    startValue: 105,
    currentValue: 110,
    gueltigAb: relDate('2026-08-10'),
    targetDate: relDate('2026-10-31'),
    status: 'active',
    priority: 2,
    isPrimary: false,
    progressPct: 33,
    motivationReason: 'Kraftziel parallel zum Aufbau',
    difficultyLevel: 'challenging',
    achievementDate: null,
  },
  {
    id: '30000000-0000-0000-0000-000000000103',
    userId: '10000000-0000-0000-0000-000000000101',
    goalType: 'body_composition',
    subtype: 'cut',
    title: 'Fruehjahrs-Cut abgeschlossen',
    description: 'C-140 Historie: erreichtes Ziel fuer die Kachel Abgeschlossene Ziele',
    targetValue: 84,
    targetUnit: 'kg',
    startValue: 88,
    currentValue: 84,
    gueltigAb: relDate('2026-03-01'),
    targetDate: relDate('2026-06-07'),
    status: 'achieved',
    priority: 4,
    isPrimary: false,
    progressPct: 100,
    motivationReason: 'Historischer Cut vor dem aktuellen Aufbau',
    difficultyLevel: 'challenging',
    achievementDate: relDate('2026-06-06'),
  },
  {
    id: '30000000-0000-0000-0000-000000000104',
    userId: '10000000-0000-0000-0000-000000000101',
    goalType: 'performance',
    subtype: 'strength',
    title: '120 kg Bankdruecken bis Juli',
    description: 'C-140 Historie: verfehltes Ziel bleibt sichtbar und zaehlt nicht als abgebrochen',
    targetValue: 120,
    targetUnit: 'kg',
    startValue: 105,
    currentValue: 112,
    gueltigAb: relDate('2026-04-01'),
    targetDate: relDate('2026-07-01'),
    status: 'missed',
    priority: 5,
    isPrimary: false,
    progressPct: 46.67,
    motivationReason: 'Historischer Performance-Versuch fuer Fortschrittsverlauf',
    difficultyLevel: 'aggressive',
    achievementDate: null,
  },
  {
    id: '30000000-0000-0000-0000-000000000105',
    userId: '10000000-0000-0000-0000-000000000101',
    goalType: 'lifestyle',
    subtype: 'cardio_frequency',
    title: 'Vier Cardio-Einheiten pro Woche',
    description: 'C-140 Historie: abgebrochenes Ziel fuer History- und Gamification-Vorarbeit',
    targetValue: 4,
    targetUnit: 'sessions_per_week',
    startValue: 1,
    currentValue: 2,
    gueltigAb: relDate('2026-05-01'),
    targetDate: relDate('2026-07-15'),
    status: 'abandoned',
    priority: 6,
    isPrimary: false,
    progressPct: 33.33,
    motivationReason: 'Historisches Lifestyle-Ziel wurde zugunsten des Aufbaus beendet',
    difficultyLevel: 'moderate',
    achievementDate: null,
  },
  {
    id: '30000000-0000-0000-0000-000000000201',
    userId: '10000000-0000-0000-0000-000000000102',
    goalType: 'performance',
    subtype: 'training_capacity',
    title: 'Mehr Trainingsleistung',
    description: 'Performance-Ziel ohne Default-Phase aus GO-06',
    targetValue: null,
    targetUnit: null,
    startValue: null,
    currentValue: null,
    gueltigAb: relDate('2026-08-03'),
    targetDate: null,
    status: 'active',
    priority: 1,
    isPrimary: true,
    progressPct: 0,
    motivationReason: 'Performance bleibt als Goal-Typ erhalten, auch wenn die Phase offen ist',
    difficultyLevel: null,
    achievementDate: null,
  },
]
const goalPhaseRows: GoalPhaseRow[] = [
  {
    id: '31000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    goalId: '30000000-0000-0000-0000-000000000101',
    phaseType: 'maintenance',
    variant: 'baseline',
    parameters: '{"source":"GO-07 testdata","reason":"Startphase vor Lean Bulk"}',
    gueltigAb: relDate('2026-08-03'),
    projectedEndDate: relDate('2026-08-16'),
    actualEndDate: relDate('2026-08-16'),
    transitionedFrom: null,
    recommendedNext: 'lean_bulk',
    transitionReason: 'Ausgangswoche stabilisieren',
  },
  {
    id: '31000000-0000-0000-0000-000000000102',
    userId: '10000000-0000-0000-0000-000000000101',
    goalId: '30000000-0000-0000-0000-000000000101',
    phaseType: 'lean_bulk',
    variant: 'moderate',
    parameters: '{"source":"GO-07 testdata","calorie_surplus_kcal":250}',
    gueltigAb: relDate('2026-08-17'),
    projectedEndDate: relDate('2026-09-30'),
    actualEndDate: null,
    transitionedFrom: 'maintenance',
    recommendedNext: 'mini_cut',
    transitionReason: 'Phasenwechsel im Testzeitraum',
  },
  {
    id: '31000000-0000-0000-0000-000000000201',
    userId: '10000000-0000-0000-0000-000000000102',
    goalId: null,
    phaseType: 'maintenance',
    variant: 'performance_placeholder',
    parameters: '{"source":"GO-07 testdata","note":"Phase unabhaengig vom konkreten Ziel"}',
    gueltigAb: relDate('2026-08-05'),
    projectedEndDate: null,
    actualEndDate: null,
    transitionedFrom: null,
    recommendedNext: null,
    transitionReason: 'Performance hat kein eigenes Phasenmapping',
  },
]

const goalMilestoneRows: GoalMilestoneRow[] = [
  {
    id: '32000000-0000-0000-0000-000000000101',
    goalId: '30000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'absolute_value',
    title: '85 kg erreicht',
    description: 'GO-11 Szenario: erreichter Meilenstein aus echtem Gewichtsverlauf',
    targetValue: 85,
    targetUnit: 'kg',
    thresholdPct: null,
    targetDate: relDate('2026-09-13'),
    status: 'achieved',
    achievedDate: relDate('2026-09-13'),
    achievedValue: 85,
    celebrationMessage: 'Erste Etappe im Lean Bulk erreicht',
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000102',
    goalId: '30000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'absolute_value',
    title: '86,5 kg offen',
    description: 'GO-11 Szenario: offener Meilenstein bleibt sichtbar',
    targetValue: 86.5,
    targetUnit: 'kg',
    thresholdPct: null,
    targetDate: addIsoDays(END_DATE, 30),
    status: 'open',
    achievedDate: null,
    achievedValue: null,
    celebrationMessage: null,
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000103',
    goalId: '30000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'absolute_value',
    title: '86 kg bis 20. August',
    description: 'GO-11 Szenario: verfehlter Meilenstein verschwindet nicht',
    targetValue: 86,
    targetUnit: 'kg',
    thresholdPct: null,
    targetDate: relDate('2026-08-20'),
    status: 'missed',
    achievedDate: null,
    achievedValue: 85,
    celebrationMessage: null,
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000201',
    goalId: '30000000-0000-0000-0000-000000000201',
    userId: '10000000-0000-0000-0000-000000000102',
    milestoneType: 'behavioral',
    title: 'Trainingsleistung stabilisieren',
    description: 'GO-11 Szenario: Ziel ohne gebauten Fortschrittspfad liefert keinen geratenen Fortschritt',
    targetValue: null,
    targetUnit: null,
    thresholdPct: null,
    targetDate: relDate('2026-09-13'),
    status: 'open',
    achievedDate: null,
    achievedValue: null,
    celebrationMessage: null,
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000104',
    goalId: '30000000-0000-0000-0000-000000000103',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'absolute_value',
    title: '84 kg im Cut erreicht',
    description: 'C-140 Historie: erreichter Meilenstein eines abgeschlossenen Ziels',
    targetValue: 84,
    targetUnit: 'kg',
    thresholdPct: null,
    targetDate: relDate('2026-06-07'),
    status: 'achieved',
    achievedDate: relDate('2026-06-06'),
    achievedValue: 84,
    celebrationMessage: 'Cut-Ziel erreicht',
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000105',
    goalId: '30000000-0000-0000-0000-000000000104',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'absolute_value',
    title: '120 kg Bankdruecken verfehlt',
    description: 'C-140 Historie: verfehlter Meilenstein eines verfehlten Ziels',
    targetValue: 120,
    targetUnit: 'kg',
    thresholdPct: null,
    targetDate: relDate('2026-07-01'),
    status: 'missed',
    achievedDate: null,
    achievedValue: 112,
    celebrationMessage: null,
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
  {
    id: '32000000-0000-0000-0000-000000000106',
    goalId: '30000000-0000-0000-0000-000000000105',
    userId: '10000000-0000-0000-0000-000000000101',
    milestoneType: 'behavioral',
    title: 'Cardio-Ziel abgebrochen',
    description: 'C-140 Historie: abgebrochener Meilenstein fuer ein abgebrochenes Ziel',
    targetValue: null,
    targetUnit: null,
    thresholdPct: null,
    targetDate: relDate('2026-07-15'),
    status: 'abandoned',
    achievedDate: null,
    achievedValue: null,
    celebrationMessage: null,
    autoGenerated: false,
    notificationSent: false,
    source: 'seed',
    sourceDetail: 'testdaten-einspielen.ts',
  },
]

const bodyMeasurements: BodyMeasurementRow[] = ALL_DATES.map((date, index, allDates) => {
  const trend = index / (allDates.length - 1)
  const noise = ((index % 5) - 2) * 0.08
  return {
    userId: '10000000-0000-0000-0000-000000000101',
    measurementDate: date,
    measurementTime: '07:05',
    weightKg: Number((83.8 + 1.2 * trend + noise).toFixed(2)),
    bodyFatPct: Number((15.8 - 0.6 * trend + ((index % 4) - 1.5) * 0.05).toFixed(2)),
    bfMethod: 'manual',
    measurementSource: 'manual',
    notes: 'GO-10 Testdaten: taeglicher Gewichtsverlauf fuer adaptive TDEE',
  }
})
bodyMeasurements[bodyMeasurements.length - 1]!.weightKg = 85

const bodyCircumferences: BodyCircumferenceRow[] = ALL_DATES
  .filter((date, index) => index % 7 === 0 || date === END_DATE)
  .map((date, index, rows) => {
    const trend = rows.length > 1 ? index / (rows.length - 1) : 0
    return {
      date,
      neck: 41.2 - 0.3 * trend,
      shoulders: 123.0 + 1.5 * trend,
      chest: 107.0 + 1.4 * trend,
      armL: 38.4 + 0.6 * trend,
      armR: 38.9 + 0.6 * trend,
      forearmL: 31.6 + 0.4 * trend,
      forearmR: 31.9 + 0.3 * trend,
      waist: 84.0 - 2.0 * trend,
      hip: 97.0 - 1.0 * trend,
      thighL: 59.5 + 0.5 * trend,
      thighR: 60.0 + 0.5 * trend,
      calfL: 38.7 + 0.3 * trend,
      calfR: 39.2 + 0.3 * trend,
    }
  }).map(row => ({
  userId: '10000000-0000-0000-0000-000000000101',
  measurementDate: row.date,
  measurementTime: '07:10',
  neckCm: Number(row.neck.toFixed(1)),
  shouldersCm: Number(row.shoulders.toFixed(1)),
  chestCm: Number(row.chest.toFixed(1)),
  upperArmLeftCm: Number(row.armL.toFixed(1)),
  upperArmRightCm: Number(row.armR.toFixed(1)),
  forearmLeftCm: Number(row.forearmL.toFixed(1)),
  forearmRightCm: Number(row.forearmR.toFixed(1)),
  waistCm: Number(row.waist.toFixed(1)),
  hipCm: Number(row.hip.toFixed(1)),
  thighLeftCm: Number(row.thighL.toFixed(1)),
  thighRightCm: Number(row.thighR.toFixed(1)),
  calfLeftCm: Number(row.calfL.toFixed(1)),
  calfRightCm: Number(row.calfR.toFixed(1)),
  measurementSource: 'manual',
  notes: 'GO-10 Testdaten: woechentliche Umfangsmessung fuer Goals Composition',
}))

const supplementStacks: SupplementStackRow[] = [
  {
    id: '40000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    name: 'Muskelaufbau Basics',
    description: 'C-68 Testdaten: aktiver Supplement-Stack mit Refill-Fall',
    goal: 'muscle_building',
    isActive: true,
  },
]

const supplementStackItems: SupplementStackItemRow[] = [
  {
    id: '41000000-0000-0000-0000-000000000101',
    stackId: '40000000-0000-0000-0000-000000000101',
    supplementSlug: 'creatine-monohydrate',
    dose: 5,
    doseUnit: 'g',
    frequency: 'daily',
    timing: 'morning',
    stockRemaining: 150,
    stockUnit: 'g',
    lowStockThreshold: 150,
    sortOrder: 1,
    notes: 'Monats-Hinweis: Bestand reicht bei 5 g pro Tag etwa 30 Tage',
  },
  {
    id: '41000000-0000-0000-0000-000000000102',
    stackId: '40000000-0000-0000-0000-000000000101',
    supplementSlug: 'vitamin-d3',
    dose: 5000,
    doseUnit: 'IU',
    frequency: 'daily',
    timing: 'morning',
    stockRemaining: 4,
    stockUnit: 'softgels',
    lowStockThreshold: 7,
    sortOrder: 2,
    notes: 'C-68 Szenario: refillUrgent, weil Restbestand unter Schwelle',
  },
  {
    id: '41000000-0000-0000-0000-000000000103',
    stackId: '40000000-0000-0000-0000-000000000101',
    supplementSlug: 'omega-3-epa-dha',
    dose: 2,
    doseUnit: 'g',
    frequency: 'daily',
    timing: 'with_meal',
    stockRemaining: 14,
    stockUnit: 'softgels',
    lowStockThreshold: 14,
    sortOrder: 3,
    notes: 'C-82 Szenario: Refill-Warnung bei etwa zwei Wochen Reichweite',
  },
  {
    id: '41000000-0000-0000-0000-000000000104',
    stackId: '40000000-0000-0000-0000-000000000101',
    supplementSlug: 'magnesium',
    dose: 400,
    doseUnit: 'mg',
    frequency: 'daily',
    timing: 'evening',
    stockRemaining: 24,
    stockUnit: 'capsules',
    lowStockThreshold: 10,
    sortOrder: 4,
    notes: 'Abends',
  },
]

const supplementIntakeLogs: SupplementIntakeLogRow[] = [
]

const SUPPLEMENT_LOG_DAYS = daysBetween(addIsoDays(TODAY_DATE, -89), TODAY_DATE)
const SUPPLEMENT_SKIP_DAYS = new Set([
  addIsoDays(TODAY_DATE, -84),
  addIsoDays(TODAY_DATE, -71),
  addIsoDays(TODAY_DATE, -58),
  addIsoDays(TODAY_DATE, -45),
  addIsoDays(TODAY_DATE, -32),
  addIsoDays(TODAY_DATE, -19),
  addIsoDays(TODAY_DATE, -6),
  relDate('2026-08-18'),
])
const SUPPLEMENT_SKIP_NOTES = [
  'vergessen',
  'unterwegs',
  'keine Lust',
  'nach spaetem Training ausgelassen',
] as const
const SUPPLEMENT_LOG_TEMPLATES = [
  {
    stackItemId: '41000000-0000-0000-0000-000000000101',
    time: '08:10',
    name: 'Creatine Monohydrate',
    dose: 5,
    unit: 'g',
    note: 'C-82 Testdaten: Kreatin-Tagesprotokoll fuer Compliance-Historie',
  },
  {
    stackItemId: '41000000-0000-0000-0000-000000000102',
    time: '08:12',
    name: 'Vitamin D3',
    dose: 5000,
    unit: 'IU',
    note: 'C-82 Testdaten: Vitamin-D3-Tagesprotokoll mit urgent Refill',
  },
  {
    stackItemId: '41000000-0000-0000-0000-000000000103',
    time: '12:45',
    name: 'Omega-3 (EPA/DHA)',
    dose: 2,
    unit: 'g',
    note: 'C-82 Testdaten: Omega-3-Tagesprotokoll mit 2-Wochen-Reichweite',
  },
  {
    stackItemId: '41000000-0000-0000-0000-000000000104',
    time: '21:30',
    name: 'Magnesium',
    dose: 400,
    unit: 'mg',
    note: 'C-82 Testdaten: Magnesium-Tagesprotokoll',
  },
] as const

for (const date of SUPPLEMENT_LOG_DAYS) {
  const skipped = SUPPLEMENT_SKIP_DAYS.has(date)
  const skipNote = SUPPLEMENT_SKIP_NOTES[Math.abs(daysOffset(TODAY_DATE, date)) % SUPPLEMENT_SKIP_NOTES.length]!
  for (const template of SUPPLEMENT_LOG_TEMPLATES) {
    supplementIntakeLogs.push({
      userId: '10000000-0000-0000-0000-000000000101',
      stackItemId: template.stackItemId,
      intakeDate: date,
      intakeTime: template.time,
      status: skipped ? 'skipped' : 'taken',
      supplementNameSnapshot: template.name,
      doseSnapshot: template.dose,
      doseUnitSnapshot: template.unit,
      actualDose: skipped ? null : template.dose,
      actualDoseUnit: skipped ? null : template.unit,
      notes: skipped ? skipNote : template.note,
    })
  }
}

type MedicalPanelMarker = {
  loincCode: string
  name: string
  unit: string
  labReferenceLow: number
  labReferenceHigh: number
  values: readonly [number, number, number, number]
}

const MEDICAL_PANEL_REPORTS = [
  { id: '50000000-0000-0000-0000-000000000101', reportDate: relDate('2026-02-18'), title: 'C-76 Verlaufspanel 1' },
  { id: '50000000-0000-0000-0000-000000000102', reportDate: relDate('2026-04-18'), title: 'C-76 Verlaufspanel 2' },
  { id: '50000000-0000-0000-0000-000000000103', reportDate: relDate('2026-06-18'), title: 'C-76 Verlaufspanel 3' },
  { id: '50000000-0000-0000-0000-000000000104', reportDate: relDate('2026-08-18'), title: 'C-76 Verlaufspanel 4' },
] as const

const medicalPanelMarkers: MedicalPanelMarker[] = [
  { loincCode: '2986-8', name: 'Total Testosterone', unit: 'ng/dL', labReferenceLow: 300, labReferenceHigh: 1000, values: [580, 650, 700, 712] },
  { loincCode: '1558-6', name: 'Glucose (fasting)', unit: 'mg/dL', labReferenceLow: 70, labReferenceHigh: 99, values: [88, 94, 99, 102] },
  { loincCode: '4548-4', name: 'HbA1c', unit: '%', labReferenceLow: 4.0, labReferenceHigh: 5.7, values: [5.2, 5.3, 5.4, 5.4] },
  { loincCode: '2991-8', name: 'Free Testosterone', unit: 'ng/dL', labReferenceLow: 9, labReferenceHigh: 30, values: [12, 15.5, 18, 18.4] },
  { loincCode: '2243-4', name: 'Estradiol (sens.)', unit: 'pg/mL', labReferenceLow: 10, labReferenceHigh: 40, values: [22, 32, 27, 26] },
  { loincCode: '14635-7', name: 'Vitamin D (25-OH)', unit: 'ng/mL', labReferenceLow: 30, labReferenceHigh: 100, values: [22, 36, 46, 48] },
  { loincCode: '4544-3', name: 'Hematocrit', unit: '%', labReferenceLow: 39, labReferenceHigh: 50, values: [44, 45, 47, 48] },
  { loincCode: '13457-7', name: 'LDL Cholesterol', unit: 'mg/dL', labReferenceLow: 0, labReferenceHigh: 130, values: [118, 108, 102, 102] },
  { loincCode: '2276-4', name: 'Ferritin', unit: 'ng/mL', labReferenceLow: 12, labReferenceHigh: 300, values: [88, 118, 138, 142] },
  { loincCode: '30522-7', name: 'hs-CRP', unit: 'mg/L', labReferenceLow: 0, labReferenceHigh: 3.0, values: [0.7, 0.5, 0.6, 0.6] },
  { loincCode: '1884-6', name: 'ApoB', unit: 'mg/dL', labReferenceLow: 0, labReferenceHigh: 130, values: [104, 94, 88, 88] },
  { loincCode: '20448-7', name: 'Insulin (fasting)', unit: 'µIU/mL', labReferenceLow: 2.6, labReferenceHigh: 24.9, values: [5.2, 6.2, 7.1, 7.4] },
  { loincCode: '1742-6', name: 'ALT', unit: 'U/L', labReferenceLow: 0, labReferenceHigh: 40, values: [24, 27, 28, 28] },
  { loincCode: '718-7', name: 'Hemoglobin', unit: 'g/dL', labReferenceLow: 13.5, labReferenceHigh: 17.5, values: [15.0, 15.5, 15.8, 15.8] },
  { loincCode: '2160-0', name: 'Creatinine', unit: 'mg/dL', labReferenceLow: 0.7, labReferenceHigh: 1.3, values: [1.05, 1.10, 1.13, 1.14] },
  { loincCode: '3016-3', name: 'TSH', unit: 'mIU/L', labReferenceLow: 0.4, labReferenceHigh: 4.5, values: [1.9, 1.7, 1.9, 1.8] },
  { loincCode: '2857-1', name: 'PSA', unit: 'ng/mL', labReferenceLow: 0, labReferenceHigh: 2.5, values: [0.7, 0.8, 0.9, 0.9] },
  { loincCode: '2085-9', name: 'HDL Cholesterol', unit: 'mg/dL', labReferenceLow: 40, labReferenceHigh: 100, values: [48, 54, 57, 58] },
  { loincCode: '2571-8', name: 'Triglycerides', unit: 'mg/dL', labReferenceLow: 0, labReferenceHigh: 150, values: [102, 90, 80, 78] },
  { loincCode: '1920-8', name: 'AST', unit: 'U/L', labReferenceLow: 0, labReferenceHigh: 40, values: [20, 22, 23, 22] },
  { loincCode: '3051-0', name: 'Free T3', unit: 'pg/mL', labReferenceLow: 2.3, labReferenceHigh: 4.2, values: [3.4, 3.2, 3.1, 3.1] },
  { loincCode: '2484-4', name: 'IGF-1', unit: 'ng/mL', labReferenceLow: 115, labReferenceHigh: 355, values: [180, 240, 282, 286] },
  { loincCode: '2143-6', name: 'Cortisol (AM)', unit: 'µg/dL', labReferenceLow: 6, labReferenceHigh: 23, values: [14.8, 15.6, 16.0, 16.2] },
  { loincCode: '2324-2', name: 'GGT', unit: 'U/L', labReferenceLow: 0, labReferenceHigh: 60, values: [18, 21, 23, 24] },
  { loincCode: '13967-5', name: 'SHBG', unit: 'nmol/L', labReferenceLow: 10, labReferenceHigh: 57, values: [36, 34, 32, 32] },
  { loincCode: '2132-9', name: 'Vitamin B12', unit: 'pg/mL', labReferenceLow: 200, labReferenceHigh: 900, values: [480, 560, 600, 612] },
  { loincCode: '2601-3', name: 'Magnesium (RBC)', unit: 'mg/dL', labReferenceLow: 4.2, labReferenceHigh: 6.8, values: [5.2, 5.6, 5.8, 5.9] },
  { loincCode: '10501-5', name: 'LH', unit: 'IU/L', labReferenceLow: 1.7, labReferenceHigh: 8.6, values: [4.0, 4.3, 4.1, 4.2] },
  { loincCode: '13965-9', name: 'Homocysteine', unit: 'µmol/L', labReferenceLow: 5, labReferenceHigh: 15, values: [11.2, 10.4, 9.9, 9.8] },
  { loincCode: '2093-3', name: 'Total Cholesterol', unit: 'mg/dL', labReferenceLow: 0, labReferenceHigh: 200, values: [192, 186, 185, 184] },
  { loincCode: '2842-3', name: 'Prolactin', unit: 'ng/mL', labReferenceLow: 2, labReferenceHigh: 18, values: [8.8, 9.2, 9.3, 9.4] },
  { loincCode: '5763-8', name: 'Zinc (serum)', unit: 'µg/dL', labReferenceLow: 70, labReferenceHigh: 120, values: [84, 91, 95, 96] },
  { loincCode: '3024-7', name: 'Free T4', unit: 'ng/dL', labReferenceLow: 0.8, labReferenceHigh: 1.8, values: [1.3, 1.3, 1.3, 1.3] },
  { loincCode: '15067-2', name: 'FSH', unit: 'IU/L', labReferenceLow: 1.5, labReferenceHigh: 12.4, values: [4.0, 3.9, 3.8, 3.8] },
]

const medicalLabReports: MedicalLabReportRow[] = MEDICAL_PANEL_REPORTS.map(report => ({
  id: report.id,
  userId: '10000000-0000-0000-0000-000000000101',
  reportDate: report.reportDate,
  reportTime: '09:20',
  labName: 'LumeOS Testlabor',
  title: report.title,
  source: 'seed',
  notes: 'C-76 Testdaten: Verlaufspanel mit 34 Markern aus der Medical-Vorlage',
}))

const medicalPanelValues: MedicalLabValueRow[] = medicalLabReports.flatMap((report, reportIndex) =>
  medicalPanelMarkers.map(marker => ({
    reportId: report.id,
    userId: report.userId,
    loincCode: marker.loincCode,
    markerNameSnapshot: marker.name,
    unitSnapshot: marker.unit,
    valueNumeric: marker.values[reportIndex],
    valueText: null,
    valueOperator: '=',
    labReferenceLow: marker.labReferenceLow,
    labReferenceHigh: marker.labReferenceHigh,
    labReferenceText: `${marker.labReferenceLow}-${marker.labReferenceHigh} ${marker.unit}`,
    labReferenceUnit: marker.unit,
    labReferenceSource: 'LumeOS Testlabor Verlaufspanel',
    source: 'seed',
    notes: 'C-76 Testdaten: wiederholter Marker fuer Zeitreihe und Sparkline',
  })),
)

const medicalLabValues: MedicalLabValueRow[] = [
  ...medicalPanelValues,
  {
    reportId: '50000000-0000-0000-0000-000000000104',
    userId: '10000000-0000-0000-0000-000000000101',
    loincCode: '17861-6',
    markerNameSnapshot: 'Calcium',
    unitSnapshot: 'mg/dL',
    valueNumeric: 9.4,
    valueText: null,
    valueOperator: '=',
    labReferenceLow: null,
    labReferenceHigh: null,
    labReferenceText: null,
    labReferenceUnit: null,
    labReferenceSource: null,
    source: 'seed',
    notes: 'C-69 Testdaten: kein Laborbereich im Befund; Lesefunktion nutzt Katalog-Fallback',
  },
]

const medicalImportRows = [
  {
    marker_name: 'Hämoglobin',
    value_numeric: 15.4,
    unit: 'g/dL',
    value_operator: '=',
    lab_reference_low: 13.5,
    lab_reference_high: 17.5,
    lab_reference_unit: 'g/dL',
    lab_reference_source: 'C-72 Testlabor Befunddruck',
    notes: 'C-72 Importfall: deutscher Markername eindeutig',
  },
  {
    marker_name: 'Glukose',
    value_numeric: 102,
    unit: 'mg/dL',
    value_operator: '=',
    lab_reference_text: '70–99 mg/dL',
    lab_reference_unit: 'mg/dL',
    lab_reference_source: 'C-72 Testlabor Befunddruck',
    notes: 'C-72 Importfall: ohne Systemkontext mehrdeutig',
  },
  {
    marker_name: 'Unbekannter Marker X',
    value_numeric: 42,
    unit: 'U/L',
    value_operator: '=',
    notes: 'C-72 Importfall: Rohmarker bleibt gespeichert',
  },
]
for (const user of USERS) {
  const plan = PLANS[user.email]
  for (const date of ALL_DATES) {
    const specialPlan = SPECIAL_DAY_PLANS[user.email]?.[date] ?? null
    if (specialPlan === 'skip-day') continue
    const dayPlan = specialPlan ?? variedDayPlan(plan, user, date)

    for (const mealType of MEAL_TYPES) {
      const mealId = uuidFrom(`${user.email}:${date}:${mealType}`)
      meals.push({
        id: mealId,
        userId: user.id,
        entryDate: date,
        mealType,
        mealTime: MEAL_TIMES[mealType],
        notes: `C-82 Testdaten aus dem Vorgaengerrepo: ${user.displayName}`,
      })
      for (const template of dayPlan[mealType]) {
        items.push({ ...template, mealId, userId: user.id })
      }
    }
  }
}

const secondSnackDate = relDate('2026-08-14')
const secondSnackId = uuidFrom(`tom.seed@example.com:${secondSnackDate}:snack:zweiter-snack`)
meals.push({
  id: secondSnackId,
  userId: '10000000-0000-0000-0000-000000000101',
  entryDate: secondSnackDate,
  mealType: 'snack',
  mealTime: '10:14',
  notes: 'C-61/C-59 Testdaten: zweiter Snack am selben Tag',
})
items.push({
  mealId: secondSnackId,
  userId: '10000000-0000-0000-0000-000000000101',
  blsCode: 'F503100',
  amountG: 80,
})

function waterAmountsFor(user: TestUser, date: string): number[] {
  if (user.email === 'tom.seed@example.com' && date === relDate('2026-08-16')) {
    return [100]
  }
  if (user.email === 'tom.seed@example.com') {
    return [1000, 750]
  }
  if (user.email === 'max.seed@example.com') {
    return [750, 500]
  }
  return [500]
}

for (const user of USERS) {
  for (const date of ALL_DATES) {
    if (SPECIAL_DAY_PLANS[user.email]?.[date] === 'skip-day') continue
    waterAmountsFor(user, date).forEach((amountMl, index) => {
      waterLogs.push({
        userId: user.id,
        entryDate: date,
        amountMl,
        source: index === 0 ? 'quick_add' : 'manual',
        loggedAt: `${date}T${String(8 + index * 5).padStart(2, '0')}:00:00Z`,
      })
    })
  }
}

const TRAINING_PLAN: Record<string, TrainingExerciseTemplate[]> = {
  push: [
    {
      exerciseName: 'Barbell Bench Press',
      plannedSets: 3,
      plannedReps: '5-8',
      plannedWeightKg: 82.5,
      sets: [
        { reps: 8, weightKg: 60, rpe: 6.5, setType: 'warmup' },
        { reps: 8, weightKg: 80, rpe: 8 },
        { reps: 7, weightKg: 82.5, rpe: 8.5 },
        { reps: 6, weightKg: 82.5, rpe: 9 },
      ],
    },
    {
      exerciseName: 'Barbell bench press incline',
      plannedSets: 3,
      plannedReps: '8-10',
      plannedWeightKg: 60,
      sets: [
        { reps: 10, weightKg: 57.5, rpe: 8 },
        { reps: 9, weightKg: 60, rpe: 8.5 },
        { reps: 8, weightKg: 60, rpe: 9 },
      ],
    },
  ],
  pull: [
    {
      exerciseName: 'Barbell bent over row pronated grip',
      plannedSets: 3,
      plannedReps: '8-10',
      plannedWeightKg: 75,
      sets: [
        { reps: 10, weightKg: 70, rpe: 7.5 },
        { reps: 9, weightKg: 75, rpe: 8 },
        { reps: 8, weightKg: 75, rpe: 8.5 },
      ],
    },
    {
      exerciseName: 'band kneeling lat pulldown',
      plannedSets: 3,
      plannedReps: '10-12',
      plannedWeightKg: 35,
      sets: [
        { reps: 12, weightKg: 32.5, rpe: 7.5 },
        { reps: 11, weightKg: 35, rpe: 8 },
        { reps: 10, weightKg: 35, rpe: 8.5 },
      ],
    },
  ],
  legs: [
    {
      exerciseName: 'Barbell  squat back POV',
      plannedSets: 3,
      plannedReps: '5-8',
      plannedWeightKg: 105,
      sets: [
        { reps: 8, weightKg: 80, rpe: 6.5, setType: 'warmup' },
        { reps: 8, weightKg: 100, rpe: 8 },
        { reps: 7, weightKg: 105, rpe: 8.5 },
        { reps: 6, weightKg: 105, rpe: 9 },
      ],
    },
    {
      exerciseName: 'Band Deadlift',
      plannedSets: 3,
      plannedReps: '6-8',
      plannedWeightKg: 115,
      sets: [
        { reps: 8, weightKg: 110, rpe: 8 },
        { reps: 7, weightKg: 115, rpe: 8.5 },
        { reps: 6, weightKg: 115, rpe: 9 },
      ],
    },
  ],
}

const TRAINING_SEQUENCE = ['push', 'pull', 'legs'] as const
const TRAINING_DAYS = ALL_DATES
  .filter((_, index) => index % 6 === 1)
  .map((date, index) => {
    const key = TRAINING_SEQUENCE[index % TRAINING_SEQUENCE.length]!
    return { date, key, name: `${key[0]!.toUpperCase()}${key.slice(1)} ${Math.floor(index / 3) + 1}`, index }
  })
const CANCELLED_TRAINING_INDEX = 13
const COMPLETED_TRAINING_DAYS = TRAINING_DAYS
  .filter(day => day.date <= TODAY_DATE && day.index !== CANCELLED_TRAINING_INDEX)
const COMPLETED_OCCURRENCES = new Map<string, number>()
for (const day of COMPLETED_TRAINING_DAYS) {
  for (const template of TRAINING_PLAN[day.key]) {
    COMPLETED_OCCURRENCES.set(
      template.exerciseName,
      (COMPLETED_OCCURRENCES.get(template.exerciseName) ?? 0) + 1,
    )
  }
}
const seenCompletedOccurrences = new Map<string, number>()
const bestE1rmByExercise = new Map<string, number>()

const E1RM_PROGRESS_TARGETS: Record<string, { target: number; gainPct: number }> = {
  'Barbell Bench Press': { target: 99.3, gainPct: 0.04 },
  'Barbell  squat back POV': { target: 126.0, gainPct: 0.06 },
  'Band Deadlift': { target: 138.0, gainPct: 0.05 },
}

function e1rm(weightKg: number, reps: number): number {
  return weightKg / (1.0278 - 0.0278 * reps)
}

function weightForE1rm(targetE1rm: number, reps: number): number {
  return targetE1rm * (1.0278 - 0.0278 * reps)
}

function sessionStatus(day: { date: string; index: number }): TrainingSessionRow['status'] {
  if (day.date > TODAY_DATE) return 'planned'
  if (day.index === CANCELLED_TRAINING_INDEX) return 'cancelled'
  return 'completed'
}

for (const day of TRAINING_DAYS) {
  const sessionId = uuidFrom(`tom.seed@example.com:training:${day.date}:${day.key}`)
  const status = sessionStatus(day)
  trainingSessions.push({
    id: sessionId,
    userId: '10000000-0000-0000-0000-000000000101',
    sessionDate: day.date,
    startedTime: '17:30',
    endedTime: '18:45',
    name: day.name,
    status,
    location: 'Gym',
    notes: status === 'planned'
      ? 'C-103 Testdaten: zukuenftige Sitzung geplant, nicht abgeschlossen'
      : status === 'cancelled'
        ? 'C-103 Szenario: abgebrochene/ausgefallene Sitzung'
        : 'C-66/C-104 Testdaten: abgeschlossene Sitzung mit progressiver e1RM-Kurve',
  })

  TRAINING_PLAN[day.key].forEach((template, exerciseIndex) => {
    const exerciseId = uuidFrom(`tom.seed@example.com:training:${day.date}:${day.key}:${template.exerciseName}`)
    trainingExercises.push({
      id: exerciseId,
      sessionId,
      exerciseName: template.exerciseName,
      exerciseOrder: exerciseIndex + 1,
      plannedSets: template.plannedSets,
      plannedReps: template.plannedReps,
      plannedWeightKg: template.plannedWeightKg,
    })
    if (status !== 'completed') return
    const occurrence = seenCompletedOccurrences.get(template.exerciseName) ?? 0
    seenCompletedOccurrences.set(template.exerciseName, occurrence + 1)
    const occurrenceCount = COMPLETED_OCCURRENCES.get(template.exerciseName) ?? 1
    const progressShare = occurrenceCount > 1 ? occurrence / (occurrenceCount - 1) : 1
    const target = E1RM_PROGRESS_TARGETS[template.exerciseName]
    const templateBestE1rm = Math.max(...template.sets.map(set => e1rm(set.weightKg, set.reps)))
    const progressionKg = progressShare * 2
    template.sets.forEach((set, setIndex) => {
      let reps = Math.max(1, set.reps + ((day.index + setIndex) % 3 === 0 ? 1 : 0))
      let weightKg = set.weightKg + progressionKg + ((day.index + setIndex) % 2) * 0.75
      if (target) {
        reps = set.reps
        const setShare = e1rm(set.weightKg, set.reps) / templateBestE1rm
        const currentTarget = target.target * (1 - target.gainPct + target.gainPct * progressShare)
        weightKg = weightForE1rm(currentTarget * setShare, reps)
      }
      const roundedWeightKg = Number(weightKg.toFixed(2))
      const rpe = Number(Math.min(10, set.rpe + ((day.index + setIndex) % 4 === 0 ? 0.5 : 0)).toFixed(1))
      const rir = Math.max(0, Math.min(10, Math.round(10 - rpe)))
      const currentE1rm = e1rm(roundedWeightKg, reps)
      const previousBest = bestE1rmByExercise.get(template.exerciseName) ?? 0
      const isPr = (set.setType ?? 'working') === 'working' && currentE1rm > previousBest + 0.05
      if (isPr || currentE1rm > previousBest) bestE1rmByExercise.set(template.exerciseName, currentE1rm)
      trainingSets.push({
        workoutExerciseId: exerciseId,
        setNumber: setIndex + 1,
        reps,
        weightKg: roundedWeightKg,
        rpe,
        rir,
        setType: set.setType ?? 'working',
        isPr,
      })
    })
  })
}

/**
 * Deterministisches Rauschen 0..1 (C-236) — mulberry32-Mischschritt
 * mit dem Index als Saat. KEIN Math.random(): die Seeds muessen bei
 * jedem Kettenlauf identisch sein, sonst ist keine Erwartung pruefbar.
 */
function rausch(saat: number): number {
  let t = (saat + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const r1 = (x: number) => Math.round(x * 10) / 10
const klemme = (x: number, unten: number, oben: number) =>
  Math.max(unten, Math.min(oben, x))

/** Minuten seit Mitternacht als TIME-Text, negativ = Vortag. */
function alsUhrzeit(minuten: number): string {
  const m = ((Math.round(minuten) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/**
 * C-236: plausible Messwerte statt Zaehlreihen.
 *
 * `[read]` Der Befund aus G-160: hrv_rmssd lief als perfekte
 * arithmetische Reihe 62..230 (+4 je Messtag) — physiologisch
 * unmoeglich (menschliche RMSSD ~20-80 ms) und als Nachweis wertlos.
 * Jetzt: Basiswert + langsame Welle + deterministisches Rauschen, je
 * Spalte eigene Saat. Das Zaehlreihen-Gate am Ende des Laufs prueft,
 * dass keine Reihe mit konstanter Differenz (>5 Werte) zurueckkommt.
 */
function recoveryCheckinFor(date: string, index: number): RecoveryCheckinRow {
  if (date === relDate('2026-08-18')) {
    return {
      userId: '10000000-0000-0000-0000-000000000101',
      entryDate: date,
      checkinTime: '07:18',
      sleepHours: 4.8,
      sleepQuality: 3,
      sleepStartTime: '01:10',
      sleepEndTime: '06:00',
      subjectiveFeeling: 3,
      mood: 'tired',
      energyLevel: 3,
      motivation: 3,
      soreness: '{"chest":3,"quadriceps":2,"lower_back":2}',
      stressLevel: 8,
      workStress: 8,
      lifeStress: 6,
      alcoholUnits: 1,
      caffeineMg: 420,
      screenTimeBeforeBed: 95,
      restingHr: null,
      hrvRmssd: null,
      spo2Pct: null,
      respiratoryRate: null,
      notes: 'C-67 Szenario: schlechte Erholung ohne HRV fuer manual mode',
    }
  }

  const isAfterLegs = [relDate('2026-08-10'), relDate('2026-08-24'), relDate('2026-09-07')].includes(date)
  // Messtag: jeder vierte Tag traegt Wearable-Werte — wie bisher 43
  // von 170, nur die WERTE sind jetzt plausibel.
  const messtag = index % 4 === 0

  // Zwei Sinus-Frequenzen + Rauschen je Spalte: die schnelle
  // Komponente verhindert, dass ganzzahlige Skalen in >5 gleiche
  // Werte hintereinander fallen — das Zaehlreihen-Gate wertet auch
  // die Differenz 0 als Reihe. `[cmd]` Gegen die Formeln vorgerechnet:
  // laengste konstante Differenzfolge sleep 4 · quality 5 · feeling 4.
  const schlaf = klemme(
    r1(7.4 + 0.5 * Math.sin(index / 5.3) + 0.4 * Math.sin(index / 2.1)
      + (rausch(index * 23 + 1) - 0.5) * 1.4),
    5.6, 9.0)
  const qualitaet = klemme(
    Math.round(schlaf * 0.9 + 0.9 * Math.sin(index / 3.4)
      + (rausch(index * 41 + 5) - 0.5) * 3.2 + 0.7),
    3, 10) - (isAfterLegs ? 1 : 0)
  const gefuehl = klemme(
    Math.round(qualitaet + 0.8 * Math.sin(index / 2.6)
      + (rausch(index * 53 + 9) - 0.5) * 3.0),
    3, 10) - (isAfterLegs ? 1 : 0)
  const stress = klemme(
    Math.round(4 + 2.5 * Math.sin(index / 7.3) + 1.2 * Math.sin(index / 2.8)
      + (rausch(index * 11 + 13) - 0.5) * 4),
    1, 9)
  // Bettzeiten passend zur Dauer: Aufwachen 06:30-07:20, Einschlafen
  // = Aufwachen - Schlafdauer - 15 min Einschlafzeit (ueber
  // Mitternacht hinweg, daher Vortagslogik in alsUhrzeit).
  const aufwachen = 390 + Math.round(rausch(index * 29 + 17) * 50)
  const einschlafen = aufwachen - schlaf * 60 - 15

  return {
    userId: '10000000-0000-0000-0000-000000000101',
    entryDate: date,
    checkinTime: '07:12',
    sleepHours: schlaf,
    sleepQuality: qualitaet,
    sleepStartTime: alsUhrzeit(einschlafen),
    sleepEndTime: alsUhrzeit(aufwachen),
    subjectiveFeeling: gefuehl,
    mood: gefuehl >= 8 && rausch(index * 61 + 21) > 0.5 ? 'motivated'
      : gefuehl <= 4 ? 'tired'
        : gefuehl >= 7 ? 'good' : 'neutral',
    energyLevel: klemme(gefuehl + (rausch(index * 67 + 25) > 0.5 ? 0 : -1), 3, 9),
    motivation: klemme(gefuehl + Math.round(rausch(index * 71 + 33)), 3, 10),
    soreness: isAfterLegs ? '{"quadriceps":2,"glutes":2}' : '{"chest":1,"back":1}',
    stressLevel: stress,
    workStress: klemme(stress + Math.round((rausch(index * 83 + 37) - 0.3) * 3), 1, 9),
    lifeStress: klemme(stress + Math.round((rausch(index * 89 + 41) - 0.7) * 3), 1, 9),
    alcoholUnits: 0,
    caffeineMg: 260 + (index % 3) * 40,
    screenTimeBeforeBed: 25 + (index % 4) * 10,
    restingHr: messtag
      ? Math.round(klemme(53 - 5 * Math.sin(index / 9.7) + (rausch(index * 31 + 7) - 0.5) * 6, 44, 62))
      : null,
    hrvRmssd: messtag
      ? klemme(r1(54 + 8 * Math.sin(index / 9.7) + (rausch(index * 17 + 3) - 0.5) * 16), 24, 78)
      : null,
    spo2Pct: messtag
      ? klemme(r1(96.8 + (rausch(index * 13 + 11) - 0.5) * 2.2), 94.5, 99.0)
      : null,
    respiratoryRate: messtag
      ? klemme(r1(14.2 + (rausch(index * 7 + 29) - 0.5) * 3), 11.5, 17.0)
      : null,
    notes: 'C-67 Testdaten: Recovery Check-in fuer Verlauf und manual mode',
  }
}

function pushRecoveryModalities(date: string, index: number): void {
  const userId = '10000000-0000-0000-0000-000000000101'
  if (index % 9 === 0) {
    recoveryModalities.push({
      userId,
      entryDate: date,
      loggedTime: '19:15',
      modalityType: 'sauna',
      durationMin: 18 + (index % 4) * 4,
      detail: '2 Durchgaenge, moderat',
      immediateEffect: 7 + (index % 2),
      nextDayEffect: 6 + (index % 3),
      notes: 'C-125 Seed: Sauna-Modalitaet, Bonuswert wartet auf C-124',
    })
  }
  if (index % 13 === 4) {
    recoveryModalities.push({
      userId,
      entryDate: date,
      loggedTime: '18:40',
      modalityType: 'massage',
      durationMin: 45 + (index % 3) * 10,
      detail: 'Sportmassage Beine/Ruecken',
      immediateEffect: 8,
      nextDayEffect: 7 + (index % 2),
      notes: 'C-125 Seed: Massage-Modalitaet, Bonuswert wartet auf C-124',
    })
  }
  if (index % 11 === 6) {
    recoveryModalities.push({
      userId,
      entryDate: date,
      loggedTime: '07:45',
      modalityType: 'cold_plunge',
      durationMin: 3 + (index % 3),
      detail: 'Eisbad nach Training',
      immediateEffect: 6,
      nextDayEffect: 6 + (index % 2),
      notes: 'C-125 Seed: Eisbad-Modalitaet, Bonuswert wartet auf C-124',
    })
  }
  if (index % 4 === 2) {
    recoveryModalities.push({
      userId,
      entryDate: date,
      loggedTime: '21:05',
      modalityType: 'stretching',
      durationMin: 10 + (index % 5) * 3,
      detail: 'Mobility und Dehnen vor dem Schlafen',
      immediateEffect: 6 + (index % 3),
      nextDayEffect: 5 + (index % 3),
      notes: 'C-125 Seed: Dehnen-Modalitaet, Bonuswert wartet auf C-124',
    })
  }
}

ALL_DATES.slice(1, 171).forEach((date, index) => {
  recoveryCheckins.push(recoveryCheckinFor(date, index))
  pushRecoveryModalities(date, index)
})

const TOM_ID = '10000000-0000-0000-0000-000000000101'
const RECIPE_IDS = {
  oats: uuidFrom('tom.seed@example.com:recipe:banana-yogurt-oats'),
  chickenRice: uuidFrom('tom.seed@example.com:recipe:chicken-rice-bowl'),
  salmonSweetPotato: uuidFrom('tom.seed@example.com:recipe:salmon-sweet-potato'),
}
const MEAL_PLAN_ID = uuidFrom('tom.seed@example.com:meal-plan:aufbau-woche')
const FILLED_WEEK_ID = uuidFrom('tom.seed@example.com:meal-plan-week:filled')
const EMPTY_WEEK_ID = uuidFrom('tom.seed@example.com:meal-plan-week:empty')
const FILLED_WEEK_START = relDate('2026-08-31')
const EMPTY_WEEK_START = relDate('2026-09-14')
const COPIED_WEEK_START = relDate('2026-09-21')

const recipeRows: RecipeRow[] = [
  {
    id: RECIPE_IDS.oats,
    userId: TOM_ID,
    nameDe: 'Banane-Joghurt-Haferflocken',
    description: 'C-150 Rezept: schneller Aufbau-Fruehstueckstest',
    instructions: 'Haferflocken mit Joghurt verruehren, Banane schneiden, zehn Minuten quellen lassen.',
    cuisineCode: 'mediterranean',
    cookingSkill: 'beginner',
    prepTimeMin: 10,
    cookTimeMin: 0,
    servings: 1,
    tags: '{quick,breakfast,high_protein}',
  },
  {
    id: RECIPE_IDS.chickenRice,
    userId: TOM_ID,
    nameDe: 'Huhn-Reis-Bowl',
    description: 'C-150 Rezept: mittlerer Meal-Prep-Fall mit preferred_cuisines',
    instructions: 'Reis kochen, Huhn braten, Brokkoli garen und mit Olivenoel abschmecken.',
    cuisineCode: 'asian',
    cookingSkill: 'intermediate',
    prepTimeMin: 25,
    cookTimeMin: 20,
    servings: 2,
    tags: '{meal_prep,lunch,high_protein}',
  },
  {
    id: RECIPE_IDS.salmonSweetPotato,
    userId: TOM_ID,
    nameDe: 'Lachs mit Suesskartoffel und Spinat',
    description: 'C-150 Rezept: laengerer Dinner-Fall fuer Filtergrenzen',
    instructions: 'Suesskartoffel garen, Lachs duensten, Spinat kurz erhitzen.',
    cuisineCode: 'nordic',
    cookingSkill: 'advanced',
    prepTimeMin: 45,
    cookTimeMin: 25,
    servings: 2,
    tags: '{dinner,omega3,advanced}',
  },
]

const recipeIngredientRows: RecipeIngredientRow[] = [
  { recipeId: RECIPE_IDS.oats, userId: TOM_ID, sortOrder: 1, blsCode: 'C133000', amountG: 80, portionName: '1 Tasse roh', portionQuantity: 1, portionAmountG: 80 },
  { recipeId: RECIPE_IDS.oats, userId: TOM_ID, sortOrder: 2, blsCode: 'M141100', amountG: 250 },
  { recipeId: RECIPE_IDS.oats, userId: TOM_ID, sortOrder: 3, blsCode: 'F503100', amountG: 120 },
  { recipeId: RECIPE_IDS.chickenRice, userId: TOM_ID, sortOrder: 1, blsCode: 'V416100', amountG: 440 },
  { recipeId: RECIPE_IDS.chickenRice, userId: TOM_ID, sortOrder: 2, blsCode: 'C351000', amountG: 190 },
  { recipeId: RECIPE_IDS.chickenRice, userId: TOM_ID, sortOrder: 3, blsCode: 'G312132', amountG: 440 },
  { recipeId: RECIPE_IDS.chickenRice, userId: TOM_ID, sortOrder: 4, blsCode: 'Q120000', amountG: 30, portionName: '1 EL', portionQuantity: 2, portionAmountG: 15 },
  { recipeId: RECIPE_IDS.salmonSweetPotato, userId: TOM_ID, sortOrder: 1, blsCode: 'T410052', amountG: 360 },
  { recipeId: RECIPE_IDS.salmonSweetPotato, userId: TOM_ID, sortOrder: 2, blsCode: 'K420100', amountG: 600 },
  { recipeId: RECIPE_IDS.salmonSweetPotato, userId: TOM_ID, sortOrder: 3, blsCode: 'G211100', amountG: 240 },
  { recipeId: RECIPE_IDS.salmonSweetPotato, userId: TOM_ID, sortOrder: 4, blsCode: 'Q120000', amountG: 20 },
]

const C380_MEAL_SLOTS = [
  { mealType: 'breakfast' as const, plannedTime: '07:30' },
  { mealType: 'lunch' as const, plannedTime: '12:30' },
  { mealType: 'dinner' as const, plannedTime: '19:30' },
  { mealType: 'snack' as const, plannedTime: '16:00' },
]

const C380_PLAN_ORIGINS = {
  'cut-2200': 'coach_created',
  'lean-bulk-3100': 'marketplace',
  'buddy-2700': 'buddy',
} as const

const C380_PLAN_SLOTS = {
  'cut-2200': [
    { position: 1, name: 'Frühstück', plannedTime: '07:30' },
    { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
    { position: 3, name: 'Nachmittagsmahlzeit', plannedTime: '16:00' },
    { position: 4, name: 'Abendessen', plannedTime: '19:30' },
  ],
  'lean-bulk-3100': [
    { position: 1, name: 'Frühstück', plannedTime: '07:30' },
    { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
    { position: 3, name: 'Pre-Workout-Mahlzeit', plannedTime: '16:00' },
    { position: 4, name: 'Abendessen', plannedTime: '19:30' },
  ],
  'buddy-2700': [
    { position: 1, name: 'Frühstück', plannedTime: '07:30' },
    { position: 2, name: 'Mittagessen', plannedTime: '12:30' },
    { position: 3, name: 'Zwischenmahlzeit', plannedTime: '16:00' },
    { position: 4, name: 'Abendessen', plannedTime: '19:30' },
  ],
} as const

const C380_SEED_PLANS = [
  {
    slug: 'cut-2200', name: 'Cut 4-Meal 2200', targetKcal: 2200, targetProteinG: 165, targetCarbsG: 250, targetFatG: 70,
    days: [
      [['M713100', 500], ['V416172', 300], ['C351000', 250], ['H120100', 75]],
      [['M710100', 500], ['T410072', 300], ['E401000', 300], ['H120100', 31]],
      [['M141100', 700], ['V486172', 300], ['C351000', 300], ['H120100', 50]],
      [['M711100', 500], ['T410072', 300], ['C133000', 300], ['H120100', 25]],
      [['M713100', 400], ['U211162', 400], ['C351000', 300], ['H120100', 45]],
      [['M141100', 600], ['V416172', 300], ['E401000', 350], ['H120100', 40]],
      [['M710100', 500], ['U211162', 350], ['C351000', 300], ['H120100', 45]],
    ],
  },
  {
    slug: 'lean-bulk-3100', name: 'Lean bulk 3100', targetKcal: 3100, targetProteinG: 190, targetCarbsG: 400, targetFatG: 90,
    days: [
      [['M141100', 600], ['V416172', 300], ['C351000', 500], ['H120100', 80]],
      [['M710100', 500], ['T410072', 300], ['E401000', 550], ['H120100', 35]],
      [['M141100', 700], ['V486172', 250], ['C351000', 600], ['H120100', 40]],
      [['M713100', 400], ['T121902', 350], ['E401000', 600], ['H120100', 60]],
      [['M141100', 600], ['U211162', 400], ['C351000', 520], ['H120100', 55]],
      [['M711100', 400], ['T410072', 350], ['C133000', 500], ['H120100', 50]],
      [['M141100', 600], ['V486172', 250], ['C133000', 550], ['H120100', 75]],
    ],
  },
  {
    slug: 'buddy-2700', name: 'Buddy auto-plan', targetKcal: 2700, targetProteinG: 175, targetCarbsG: 325, targetFatG: 80,
    days: [
      [['M713100', 500], ['V416172', 300], ['C351000', 400], ['H120100', 70]],
      [['M141100', 700], ['V416172', 350], ['C351000', 400], ['H120100', 60]],
      [['M710100', 500], ['T410072', 350], ['E401000', 350], ['H120100', 60]],
      [['M711100', 500], ['T121902', 350], ['C351000', 450], ['H120100', 55]],
      [['M141100', 450], ['V486172', 300], ['E510000', 430], ['H120100', 70]],
      [['M141100', 500], ['U211162', 400], ['C351000', 420], ['H120100', 55]],
      [['M713100', 500], ['T410072', 300], ['C133000', 400], ['H120100', 50]],
    ],
  },
] as const

const c380PlanId = (slug: string) => uuidFrom(`tom.seed@example.com:meal-plan:c380:${slug}`)
const c380WeekId = (slug: string) => uuidFrom(`tom.seed@example.com:meal-plan-week:c380:${slug}`)
const c380DayId = (slug: string, dayIndex: number) => uuidFrom(`tom.seed@example.com:meal-plan-day:c380:${slug}:${dayIndex}`)

const c380MealPlanRows: MealPlanRow[] = C380_SEED_PLANS.map(plan => ({
  id: c380PlanId(plan.slug),
  userId: TOM_ID,
  name: plan.name,
  description: 'C-380 Seed: abwechslungsreiche Vier-Mahlzeiten-Woche',
  planOrigin: C380_PLAN_ORIGINS[plan.slug],
  lifecycleType: 'once',
  startDate: plan.slug === 'cut-2200' ? relDate('2026-09-02') : relDate('2026-09-01'),
  daysCount: plan.slug === 'cut-2200' ? 28 : plan.slug === 'lean-bulk-3100' ? 84 : 7,
  targetKcal: plan.targetKcal,
  targetProteinG: plan.targetProteinG,
  targetCarbsG: plan.targetCarbsG,
  targetFatG: plan.targetFatG,
  isActive: false,
}))

const c380MealPlanSlotRows: MealPlanSlotRow[] = C380_SEED_PLANS.flatMap(plan =>
  C380_PLAN_SLOTS[plan.slug].map(slot => ({
    planId: c380PlanId(plan.slug),
    userId: TOM_ID,
    ...slot,
  })),
)

const c380MealPlanWeekRows: MealPlanWeekRow[] = C380_SEED_PLANS.map(plan => ({
  id: c380WeekId(plan.slug),
  planId: c380PlanId(plan.slug),
  userId: TOM_ID,
  weekStart: FILLED_WEEK_START,
  name: 'C-380 abwechslungsreiche Woche',
}))

const c380MealPlanDayRows: MealPlanDayRow[] = C380_SEED_PLANS.flatMap(plan =>
  plan.days.map((_, index) => ({
    id: c380DayId(plan.slug, index + 1),
    weekId: c380WeekId(plan.slug),
    userId: TOM_ID,
    planDate: addIsoDays(FILLED_WEEK_START, index),
    dayIndex: index + 1,
    notes: 'C-380: anderer Tagesplan statt Tageskopie',
  })),
)

const c380MealPlanEntryRows: MealPlanEntryRow[] = C380_SEED_PLANS.flatMap(plan =>
  plan.days.flatMap((day, dayIndex) => day.map(([blsCode, amountG], mealIndex) => {
    const slot = C380_MEAL_SLOTS[mealIndex]!
    return {
      dayId: c380DayId(plan.slug, dayIndex + 1),
      userId: TOM_ID,
      mealType: slot.mealType,
      plannedTime: slot.plannedTime,
      slotOrder: 1,
      entryType: 'bls',
      blsCode,
      amountG,
      note: 'C-380 Seed: abwechslungsreiche Vier-Mahlzeiten-Woche',
    }
  })),
)

const mealPlanRows: MealPlanRow[] = [{
  id: MEAL_PLAN_ID,
  userId: TOM_ID,
  name: 'Aufbau-Wochenplan',
  description: 'C-150 Seed: eine gefuellte, eine leere und eine kopierte Woche',
  lifecycleType: 'once',
  startDate: relDate('2026-09-01'),
  // C-413/E-62: Der Seed beschreibt genau drei Wochen (gefuellt,
  // leer, Kopie). Bei once ist days_count deshalb 21, nicht 28.
  daysCount: 21,
  targetKcal: 2500,
  targetProteinG: 170,
  targetCarbsG: 313,
  targetFatG: 75,
  isActive: true,
}, ...c380MealPlanRows]

const mealPlanWeekRows: MealPlanWeekRow[] = [
  {
    id: FILLED_WEEK_ID,
    planId: MEAL_PLAN_ID,
    userId: TOM_ID,
    weekStart: FILLED_WEEK_START,
    name: 'Gefuellte Aufbauwoche',
  },
  {
    id: EMPTY_WEEK_ID,
    planId: MEAL_PLAN_ID,
    userId: TOM_ID,
    weekStart: EMPTY_WEEK_START,
    name: 'Leere Planwoche',
  },
  ...c380MealPlanWeekRows,
]

const mealPlanDayRows: MealPlanDayRow[] = [
  ...Array.from({ length: 7 }, (_, index) => ({
    id: uuidFrom(`tom.seed@example.com:meal-plan-day:filled:${index + 1}`),
    weekId: FILLED_WEEK_ID,
    userId: TOM_ID,
    planDate: addIsoDays(FILLED_WEEK_START, index),
    dayIndex: index + 1,
    notes: index === 2 ? 'C-150 Testfall: geplanter Tag fuer Tagebuch-Uebernahme' : null,
  })),
  ...Array.from({ length: 7 }, (_, index) => ({
    id: uuidFrom(`tom.seed@example.com:meal-plan-day:empty:${index + 1}`),
    weekId: EMPTY_WEEK_ID,
    userId: TOM_ID,
    planDate: addIsoDays(EMPTY_WEEK_START, index),
    dayIndex: index + 1,
    notes: 'C-150 Testfall: leere Woche bleibt leer',
  })),
  ...c380MealPlanDayRows,
]

const c150MealPlanEntryRows: MealPlanEntryRow[] = mealPlanDayRows
  .filter(day => day.weekId === FILLED_WEEK_ID)
  .flatMap((day, index) => [
    {
      dayId: day.id,
      userId: TOM_ID,
      mealType: 'breakfast',
      plannedTime: '07:30',
      slotOrder: 1,
      entryType: 'recipe',
      recipeId: RECIPE_IDS.oats,
      plannedServings: index % 3 === 0 ? 1.25 : 1,
      note: 'Rezept-Fruehstueck',
    },
    {
      dayId: day.id,
      userId: TOM_ID,
      mealType: 'lunch',
      plannedTime: '12:30',
      slotOrder: 1,
      entryType: 'recipe',
      recipeId: RECIPE_IDS.chickenRice,
      plannedServings: index % 2 === 0 ? 1 : 0.75,
      note: 'Meal-Prep-Bowl',
    },
    {
      dayId: day.id,
      userId: TOM_ID,
      mealType: 'snack',
      plannedTime: '16:00',
      slotOrder: 1,
      entryType: 'bls',
      blsCode: index % 2 === 0 ? 'M713100' : 'B101000',
      amountG: index % 2 === 0 ? 250 : 60,
      portionName: index % 2 === 0 ? undefined : '1 Scheibe',
      portionQuantity: index % 2 === 0 ? undefined : 2,
      portionAmountG: index % 2 === 0 ? undefined : 30,
      note: 'Direktes Lebensmittel im Plan',
    },
    {
      dayId: day.id,
      userId: TOM_ID,
      mealType: 'dinner',
      plannedTime: '19:30',
      slotOrder: 1,
      entryType: index % 2 === 0 ? 'recipe' : 'bls',
      recipeId: index % 2 === 0 ? RECIPE_IDS.salmonSweetPotato : undefined,
      plannedServings: index % 2 === 0 ? 1 : undefined,
      blsCode: index % 2 === 0 ? undefined : 'T410052',
      amountG: index % 2 === 0 ? undefined : 180,
      note: index % 2 === 0 ? 'Rezept-Dinner' : 'Direkter Lachs im Plan',
    },
  ])

const mealPlanEntryRows: MealPlanEntryRow[] = [
  ...c150MealPlanEntryRows,
  ...c380MealPlanEntryRows,
]

const mealPlanSlotRows: MealPlanSlotRow[] = c380MealPlanSlotRows

const userIds = USERS.map(user => lit(user.id)).join(', ')
const allSeedUserIds = [...USERS.map(user => lit(user.id)), lit(COACH_USER.id)].join(', ')
const userValues = USERS.map(user => tuple([
  user.id,
  user.email,
  user.displayName,
  user.birthDate,
  user.biologicalSex,
  user.heightCm,
  user.bodyWeightKg,
  user.activityLevel,
  user.nutritionGoal,
  user.kcal,
  user.proteinG,
  user.carbsG,
  user.fatG,
  user.tdee,
])).join(',\n')
const mealValues = meals.map(meal => tuple([
  meal.id,
  meal.userId,
  meal.entryDate,
  meal.mealType,
  meal.mealTime,
  meal.notes,
])).join(',\n')
const waterValues = waterLogs.map(log => tuple([
  log.userId,
  log.entryDate,
  log.amountMl,
  log.source,
  log.loggedAt,
])).join(',\n')
const trainingSessionValues = trainingSessions.map(session => tuple([
  session.id,
  session.userId,
  session.sessionDate,
  session.startedTime,
  session.endedTime,
  session.name,
  session.status,
  session.location,
  session.notes,
])).join(',\n')
const trainingExerciseValues = trainingExercises.map(exercise => tuple([
  exercise.id,
  exercise.sessionId,
  exercise.exerciseName,
  exercise.exerciseOrder,
  exercise.plannedSets,
  exercise.plannedReps,
  exercise.plannedWeightKg,
])).join(',\n')
const trainingSetValues = trainingSets.map(set => tuple([
  set.workoutExerciseId,
  set.setNumber,
  set.reps,
  set.weightKg,
  set.rpe,
  set.rir,
  set.setType,
  set.isPr,
])).join(',\n')
const recoveryCheckinValues = recoveryCheckins.map(checkin => tuple([
  checkin.userId,
  checkin.entryDate,
  checkin.checkinTime,
  checkin.sleepHours,
  checkin.sleepQuality,
  checkin.sleepStartTime,
  checkin.sleepEndTime,
  checkin.subjectiveFeeling,
  checkin.mood,
  checkin.energyLevel,
  checkin.motivation,
  checkin.soreness,
  checkin.stressLevel,
  checkin.workStress,
  checkin.lifeStress,
  checkin.alcoholUnits,
  checkin.caffeineMg,
  checkin.screenTimeBeforeBed,
  checkin.restingHr,
  checkin.hrvRmssd,
  checkin.spo2Pct,
  checkin.respiratoryRate,
  checkin.notes,
])).join(',\n')
const recoveryModalityValues = recoveryModalities.map(modality => tuple([
  modality.userId,
  modality.entryDate,
  modality.loggedTime,
  modality.modalityType,
  modality.durationMin,
  modality.detail,
  modality.immediateEffect,
  modality.nextDayEffect,
  modality.notes,
])).join(',\n')
const goalValues = goalRows.map(goal => tuple([
  goal.id,
  goal.userId,
  goal.goalType,
  goal.subtype,
  goal.title,
  goal.description,
  goal.targetValue,
  goal.targetUnit,
  goal.startValue,
  goal.currentValue,
  goal.gueltigAb,
  goal.targetDate,
  goal.status,
  goal.priority,
  goal.isPrimary,
  goal.progressPct,
  goal.motivationReason,
  goal.difficultyLevel,
  goal.achievementDate,
])).join(',\n')
const goalPhaseValues = goalPhaseRows.map(phase => tuple([
  phase.id,
  phase.userId,
  phase.goalId,
  phase.phaseType,
  phase.variant,
  phase.parameters,
  phase.gueltigAb,
  phase.projectedEndDate,
  phase.actualEndDate,
  phase.transitionedFrom,
  phase.recommendedNext,
  phase.transitionReason,
])).join(',\n')
const goalMilestoneValues = goalMilestoneRows.map(milestone => tuple([
  milestone.id,
  milestone.goalId,
  milestone.userId,
  milestone.milestoneType,
  milestone.title,
  milestone.description,
  milestone.targetValue,
  milestone.targetUnit,
  milestone.thresholdPct,
  milestone.targetDate,
  milestone.status,
  milestone.achievedDate,
  milestone.achievedValue,
  milestone.celebrationMessage,
  milestone.autoGenerated,
  milestone.notificationSent,
  milestone.source,
  milestone.sourceDetail,
])).join(',\n')
const bodyMeasurementValues = bodyMeasurements.map(measurement => tuple([
  measurement.userId,
  measurement.measurementDate,
  measurement.measurementTime,
  measurement.weightKg,
  measurement.bodyFatPct,
  measurement.bfMethod,
  measurement.measurementSource,
  measurement.notes,
])).join(',\n')
const bodyCircumferenceValues = bodyCircumferences.map(measurement => tuple([
  measurement.userId,
  measurement.measurementDate,
  measurement.measurementTime,
  measurement.neckCm,
  measurement.shouldersCm,
  measurement.chestCm,
  measurement.upperArmLeftCm,
  measurement.upperArmRightCm,
  measurement.forearmLeftCm,
  measurement.forearmRightCm,
  measurement.waistCm,
  measurement.hipCm,
  measurement.thighLeftCm,
  measurement.thighRightCm,
  measurement.calfLeftCm,
  measurement.calfRightCm,
  measurement.measurementSource,
  measurement.notes,
])).join(',\n')
const supplementStackValues = supplementStacks.map(stack => tuple([
  stack.id,
  stack.userId,
  stack.name,
  stack.description,
  stack.goal,
  stack.isActive,
])).join(',\n')
const supplementStackItemValues = supplementStackItems.map(item => tuple([
  item.id,
  item.stackId,
  item.supplementSlug,
  item.dose,
  item.doseUnit,
  item.frequency,
  item.timing,
  item.stockRemaining,
  item.stockUnit,
  item.lowStockThreshold,
  item.sortOrder,
  item.notes,
])).join(',\n')
const supplementIntakeLogValues = supplementIntakeLogs.map(log => tuple([
  log.userId,
  log.stackItemId,
  log.intakeDate,
  log.intakeTime,
  log.status,
  log.supplementNameSnapshot,
  log.doseSnapshot,
  log.doseUnitSnapshot,
  log.actualDose,
  log.actualDoseUnit,
  log.notes,
])).join(',\n')
const medicalLabReportValues = medicalLabReports.map(report => tuple([
  report.id,
  report.userId,
  report.reportDate,
  report.reportTime,
  report.labName,
  report.title,
  report.source,
  report.notes,
])).join(',\n')
const medicalLabValueValues = medicalLabValues.map(value => tuple([
  value.reportId,
  value.userId,
  value.loincCode,
  value.markerNameSnapshot,
  value.unitSnapshot,
  value.valueNumeric,
  value.valueText,
  value.valueOperator,
  value.labReferenceLow,
  value.labReferenceHigh,
  value.labReferenceText,
  value.labReferenceUnit,
  value.labReferenceSource,
  value.source,
  value.notes,
])).join(',\n')
const medicalImportRowsJson = JSON.stringify(medicalImportRows).replace(/'/g, "''")
const itemValues = items.map(item => tuple([
  item.mealId,
  item.userId,
  item.blsCode,
  item.amountG,
  item.portionName ?? null,
  item.portionQuantity ?? null,
  item.portionAmountG ?? null,
])).join(',\n')
const recipeValues = recipeRows.map(recipe => tuple([
  recipe.id,
  recipe.userId,
  recipe.nameDe,
  recipe.description,
  recipe.instructions,
  recipe.cuisineCode,
  recipe.cookingSkill,
  recipe.prepTimeMin,
  recipe.cookTimeMin,
  recipe.servings,
  recipe.tags,
])).join(',\n')
const recipeIngredientValues = recipeIngredientRows.map(ingredient => tuple([
  ingredient.recipeId,
  ingredient.userId,
  ingredient.sortOrder,
  ingredient.blsCode,
  ingredient.amountG,
  ingredient.portionName ?? null,
  ingredient.portionQuantity ?? null,
  ingredient.portionAmountG ?? null,
])).join(',\n')
const mealPlanValues = mealPlanRows.map(plan => tuple([
  plan.id,
  plan.userId,
  plan.name,
  plan.description,
  plan.planOrigin ?? 'self_created',
  plan.lifecycleType,
  plan.startDate,
  plan.daysCount,
  plan.targetKcal,
  plan.targetProteinG,
  plan.targetCarbsG,
  plan.targetFatG,
  plan.isActive,
])).join(',\n')
const mealPlanSlotValues = mealPlanSlotRows.map(slot => tuple([
  slot.planId,
  slot.userId,
  slot.position,
  slot.name,
  slot.plannedTime,
])).join(',\n')
const mealPlanWeekValues = mealPlanWeekRows.map(week => tuple([
  week.id,
  week.planId,
  week.userId,
  week.weekStart,
  week.name,
])).join(',\n')
const mealPlanDayValues = mealPlanDayRows.map(day => tuple([
  day.id,
  day.weekId,
  day.userId,
  day.planDate,
  day.dayIndex,
  day.notes,
])).join(',\n')
const mealPlanEntryValues = mealPlanEntryRows.map(entry => tuple([
  entry.dayId,
  entry.userId,
  entry.mealType,
  entry.plannedTime,
  entry.slotOrder,
  entry.entryType,
  entry.recipeId ?? null,
  entry.blsCode ?? null,
  entry.amountG ?? null,
  entry.plannedServings ?? null,
  entry.portionName ?? null,
  entry.portionQuantity ?? null,
  entry.portionAmountG ?? null,
  entry.note ?? null,
])).join(',\n')

const sql = `
BEGIN;

DELETE FROM nutrition.meal_plan_entries WHERE user_id IN (${userIds});
DELETE FROM nutrition.meal_plan_days WHERE user_id IN (${userIds});
DELETE FROM nutrition.meal_plan_weeks WHERE user_id IN (${userIds});
DELETE FROM nutrition.meal_plans WHERE user_id IN (${userIds});
-- C-241/C-413: Der Grundbestand des Nachweiskontos ist klein und
-- vollstaendig kettengetragen. Nur seine eigenen, hiervon abhaengigen
-- Nutrition- und Supplement-Zeilen werden vor dem Neuaufbau ersetzt.
DELETE FROM nutrition.meal_plan_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_plan_entries
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_plan_days
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_plan_weeks
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_plans
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_slots
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meal_items
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.meals
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM supplements.intake_logs
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM supplements.stack_items si
USING supplements.user_stacks us
WHERE si.stack_id = us.id
  AND us.user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM supplements.user_stacks
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.food_preference_items
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.food_preferences
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');
DELETE FROM nutrition.recipe_ingredients WHERE user_id IN (${userIds});
DELETE FROM nutrition.recipes WHERE user_id IN (${userIds});
DELETE FROM nutrition.water_logs WHERE user_id IN (${userIds});
DELETE FROM nutrition.meal_items WHERE user_id IN (${userIds});
DELETE FROM nutrition.meals WHERE user_id IN (${userIds});
DELETE FROM coach.action_log WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.pending_actions WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.permission_change_log WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.autonomy_change_log WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.alerts WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.messages WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.checkins WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.checkin_templates WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.relationship_change_log WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
ALTER TABLE coach.relationships DISABLE TRIGGER relationships_change_log;
DELETE FROM coach.relationships WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
ALTER TABLE coach.relationships ENABLE TRIGGER relationships_change_log;
ALTER TABLE coach.client_permissions DISABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy DISABLE TRIGGER client_autonomy_change_log;
DELETE FROM coach.client_permissions WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
DELETE FROM coach.client_autonomy WHERE coach_id = ${lit(COACH_USER.id)}::uuid OR client_id = ${lit(COACH_USER.id)}::uuid;
ALTER TABLE coach.client_permissions ENABLE TRIGGER client_permissions_change_log;
ALTER TABLE coach.client_autonomy ENABLE TRIGGER client_autonomy_change_log;
DELETE FROM training.workout_sets ws
USING training.workout_exercises we, training.workout_sessions s
WHERE ws.workout_exercise_id = we.id
  AND we.workout_session_id = s.id
  AND s.user_id IN (${userIds});
DELETE FROM training.workout_exercises we
USING training.workout_sessions s
WHERE we.workout_session_id = s.id
  AND s.user_id IN (${userIds});
DELETE FROM training.workout_sessions WHERE user_id IN (${userIds});
DELETE FROM recovery.modality_log WHERE user_id IN (${userIds});
DELETE FROM recovery.scores WHERE user_id IN (${userIds});
DELETE FROM recovery.checkins WHERE user_id IN (${userIds});
DELETE FROM recovery.score_contributions WHERE user_id IN (${userIds});
DELETE FROM recovery.stress_logs WHERE user_id IN (${userIds});
DELETE FROM recovery.recovery_protocols WHERE user_id IN (${userIds});
DELETE FROM recovery.overtraining_alerts WHERE user_id IN (${userIds});
DELETE FROM medical.health_events WHERE user_id IN (${userIds});
DELETE FROM medical.appointments WHERE user_id IN (${userIds});
-- C-429: Der Nachweisbestand liegt beim separaten Pruefkonto, nicht bei
-- einem der drei grossen Seedprofile.
DELETE FROM medical.health_events
WHERE id IN ('c4290000-0000-0000-0000-000000000031'::uuid,
             'c4290000-0000-0000-0000-000000000032'::uuid,
             'c4290000-0000-0000-0000-000000000033'::uuid);
DELETE FROM medical.appointments
WHERE id = 'c4290000-0000-0000-0000-000000000021'::uuid;
DELETE FROM storage.objects
WHERE bucket_id = 'medical-originals'
  AND name = '20000000-0000-0000-0000-000000000901/c4290000-0000-0000-0000-000000000011.pdf';
DELETE FROM medical.lab_reports
WHERE id = 'c4290000-0000-0000-0000-000000000011'::uuid;
DELETE FROM storage.objects
WHERE bucket_id = 'medical-originals'
  AND split_part(name, '/', 1) IN (
    SELECT id::text FROM auth.users WHERE id IN (${userIds})
  );
DELETE FROM medical.user_conditions WHERE user_id IN (${userIds});
DELETE FROM medical.user_medications WHERE user_id IN (${userIds});
DELETE FROM medical.lab_result_values WHERE user_id IN (${userIds});
DELETE FROM medical.lab_reports WHERE user_id IN (${userIds});
DELETE FROM supplements.intake_logs WHERE user_id IN (${userIds});
DELETE FROM supplements.stack_items si
USING supplements.user_stacks us
WHERE si.stack_id = us.id
  AND us.user_id IN (${userIds});
DELETE FROM supplements.user_stacks WHERE user_id IN (${userIds});
DELETE FROM nutrition.food_preference_items WHERE user_id IN (${userIds});
DELETE FROM nutrition.food_preferences WHERE user_id IN (${userIds});
DELETE FROM goals.body_circumferences WHERE user_id IN (${userIds});
DELETE FROM goals.body_measurements WHERE user_id IN (${userIds});
DELETE FROM goals.goal_milestones WHERE user_id IN (${userIds});
DELETE FROM goals.goal_phases WHERE user_id IN (${userIds});
DELETE FROM goals.user_goals WHERE user_id IN (${userIds});
DELETE FROM goals.nutrition_targets WHERE user_id IN (${userIds});
DELETE FROM public.profiles WHERE id IN (${allSeedUserIds});

CREATE TEMP TABLE test_users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  display_name text NOT NULL,
  birth_date date,
  biological_sex text NOT NULL,
  height_cm numeric NOT NULL,
  body_weight_kg numeric,
  activity_level text NOT NULL,
  nutrition_goal text NOT NULL,
  kcal numeric NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  tdee numeric NOT NULL
) ON COMMIT DROP;

INSERT INTO test_users VALUES
${userValues};

INSERT INTO auth.users (
  id, email, raw_app_meta_data, created_at
)
SELECT
  id,
  email,
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'full_name', display_name, 'seed', 'c82_testdaten'),
  now()
FROM test_users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data;

INSERT INTO auth.users (
  id, email, raw_app_meta_data, created_at
)
VALUES (
  ${lit(COACH_USER.id)}::uuid,
  ${lit(COACH_USER.email)},
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'full_name', ${lit(COACH_USER.displayName)}, 'seed', 'c147_coach'),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data;

-- ── G-175: das Pruefkonto ist anmeldbar, kettengetragen ─────────
-- test-user@lumeos.local ist das Nachweiskonto (C-209). Vorher wurde
-- sein Passwort je Sitzung von Hand zurechtgebogen — der Kopierschritt
-- war die Fehlerquelle, an der zwei Agenten kollidierten. Jetzt setzt
-- die Kette den Hash auf das hinterlegte Wort (tools/konten.mjs);
-- nach jedem Neuaufbau geht die Anmeldung wieder.
-- [read] Der bcrypt-Hash traegt ein Salz und ist je Lauf anders —
-- funktional identisch; die pruefbare Erwartung ist der crypt-Check,
-- nicht das Hash-Byte.
-- [cmd] Die kette.json-Wegwerf-Datenbank traegt ein MINIMAL-auth
-- (4 Spalten, kein encrypted_password, kein GoTrue) — dort gibt es
-- keine Anmeldung, also auch nichts zu setzen. Der Block prueft die
-- Spalte und ueberspringt sich sonst mit Ansage, statt den Lauf zu
-- brechen.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
      AND column_name = 'encrypted_password'
  ) THEN
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    SELECT
      '20000000-0000-0000-0000-000000000901'::uuid,
      'test-user@lumeos.local',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'seed', 'g175_pruefkonto'),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'test-user@lumeos.local'
    );
    RAISE NOTICE 'G-175: Minimal-auth ohne encrypted_password — Pruefkonto-Passwort uebersprungen.';
    RETURN;
  END IF;

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, created_at
  )
  SELECT
    '20000000-0000-0000-0000-000000000901'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated',
    'test-user@lumeos.local', now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'seed', 'g175_pruefkonto'),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test-user@lumeos.local'
  );

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(${lit(KONTEN['test-user@lumeos.local'])}, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE email = 'test-user@lumeos.local';

  RAISE NOTICE 'G-175: Pruefkonto-Passwort gesetzt (test-user@lumeos.local).';
END $$;

-- C-421/E-72: Das Nachweiskonto existiert jetzt und braucht bis heute
-- lesbare Zeilen fuer jede neue Recovery-Grundlage; leere Karten sind kein Ergebnis.
WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
)
INSERT INTO recovery.stress_logs (
  user_id, entry_date, logged_at, stress_level, work_stress, life_stress,
  hrv_impact_points, source, notes
)
SELECT u.id, current_date - d, (current_date - d)::timestamp + time '07:15',
  (4 + (d % 3))::smallint, (3 + (d % 4))::smallint, (3 + ((d + 1) % 4))::smallint,
  (-1 * (d % 3))::numeric, 'checkin', 'C-421 Nachweis-Stressverlauf'
FROM test_user u CROSS JOIN generate_series(0, 6) AS d;

WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
)
INSERT INTO recovery.score_contributions (
  user_id, entry_date, source_module, contribution_key, input_score,
  weight_percent, weighted_points, source_status
)
SELECT u.id, current_date - d, source_module, contribution_key, input_score,
  weight_percent, round(input_score * weight_percent / 100, 2), source_status
FROM test_user u
CROSS JOIN generate_series(0, 6) AS d
CROSS JOIN (VALUES
  ('recovery'::text, 'sleep_quality'::text, 80::numeric, 30::numeric, 'measured'::text),
  ('training', 'training_load', 70::numeric, 15::numeric, 'measured'),
  ('nutrition', 'nutrition_compliance', 70::numeric, 10::numeric, 'fallback')
) AS contribution(source_module, contribution_key, input_score, weight_percent, source_status);

WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
)
INSERT INTO recovery.recovery_protocols (
  user_id, protocol_key, name, target_condition, started_on, duration_days,
  daily_activities, status, completed_days
)
SELECT u.id, protocol_key, name, target_condition, current_date - 3, duration_days,
  daily_activities::jsonb, status, completed_days
FROM test_user u
CROSS JOIN (VALUES
  ('active_recovery_week'::text, 'Active Recovery Week'::text, 'general_recovery'::text, 7,
   '["Light cardio 25 min", "Mobility flow", "Sleep 8h target"]'::text, 'active'::text, 3),
  ('sleep_optimization', 'Sleep Optimization', 'poor_sleep', 14,
   '["No caffeine after 14:00", "Screen-free wind-down"]', 'completed', 14)
) AS protocol(protocol_key, name, target_condition, duration_days, daily_activities, status, completed_days);

WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
)
INSERT INTO recovery.overtraining_alerts (
  user_id, alert_date, severity, signals, recommended_action, status
)
SELECT u.id, current_date - 2, 'moderate',
  '[{"id":"score_low","value":52,"threshold":55,"days":3},{"id":"sleep_poor","value":5.5,"threshold":6,"days":3},{"id":"fatigue","value":4,"threshold":4,"days":3}]'::jsonb,
  'Light training and recovery protocol', 'acknowledged'
FROM test_user u;

-- C-423/E-72: Der Katalog hat fuer alle vier Produkt-Zieltypen eine
-- nichtleere kuratierte Vorlage. Daneben belegt genau ein oeffentlich
-- teilbarer test-user-Stack die zweite Herkunft samt Katalogvorschlag.
DELETE FROM supplements.stack_curation_candidate_items
WHERE candidate_id = 'c4230000-0000-0000-0000-000000000031'::uuid;
DELETE FROM supplements.stack_curation_candidates
WHERE id = 'c4230000-0000-0000-0000-000000000031'::uuid;
DELETE FROM supplements.stack_template_items
WHERE template_id IN (
  'c4230000-0000-0000-0000-000000000011'::uuid,
  'c4230000-0000-0000-0000-000000000012'::uuid,
  'c4230000-0000-0000-0000-000000000013'::uuid,
  'c4230000-0000-0000-0000-000000000014'::uuid,
  'c4230000-0000-0000-0000-000000000021'::uuid
);

INSERT INTO supplements.user_stacks (id, user_id, name, description, goal, source, is_active)
SELECT 'c4230000-0000-0000-0000-000000000001'::uuid, u.id,
       'C423 Test-user teilen', 'E-72 Nachweis fuer einen oeffentlich teilbaren Nutzerstack.',
       'health', 'user', false
FROM auth.users u WHERE u.email = 'test-user@lumeos.local'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now();

DELETE FROM supplements.stack_items
WHERE stack_id = 'c4230000-0000-0000-0000-000000000001'::uuid;
INSERT INTO supplements.stack_items (stack_id, supplement_id, dose, dose_unit, timing, frequency, sort_order)
SELECT 'c4230000-0000-0000-0000-000000000001'::uuid, s.id, 200, 'mg', 'morning', 'daily', 0
FROM supplements.supplements s WHERE s.is_active ORDER BY s.id LIMIT 1;

-- G-374/E-72: Ein Zyklus ist erst mit allen drei zusammengehoerigen Werten
-- lesbar. Bestehende NULL bleiben bewusst "kein Zyklus", keine erfundene Zeit.
UPDATE supplements.stack_items
SET frequency = 'cycling',
    cycling = '{"on_weeks":8,"off_weeks":4,"started_on":"2026-09-08"}'::jsonb
WHERE stack_id = 'c4230000-0000-0000-0000-000000000001'::uuid
  AND sort_order = 0;

INSERT INTO supplements.stack_templates (id, name_de, description_de, goal, source, is_public, sort_order)
VALUES
  ('c4230000-0000-0000-0000-000000000011'::uuid, 'Koerperkomposition Grundlagen', 'Kuratierter Startpunkt fuer Koerperkomposition.', 'body_composition', 'curated', true, 1),
  ('c4230000-0000-0000-0000-000000000012'::uuid, 'Performance Grundlagen', 'Kuratierter Startpunkt fuer Leistung.', 'performance', 'curated', true, 2),
  ('c4230000-0000-0000-0000-000000000013'::uuid, 'Gesundheit Grundlagen', 'Kuratierter Startpunkt fuer allgemeine Gesundheit.', 'health', 'curated', true, 3),
  ('c4230000-0000-0000-0000-000000000014'::uuid, 'Lifestyle Grundlagen', 'Kuratierter Startpunkt fuer den Alltag.', 'lifestyle', 'curated', true, 4)
ON CONFLICT (id) DO UPDATE SET
  name_de = EXCLUDED.name_de, description_de = EXCLUDED.description_de, goal = EXCLUDED.goal,
  source = EXCLUDED.source, is_public = EXCLUDED.is_public, sort_order = EXCLUDED.sort_order, updated_at = now();

INSERT INTO supplements.stack_templates (
  id, owner_id, origin_stack_id, name_de, description_de, goal, source, is_public, sort_order
)
SELECT 'c4230000-0000-0000-0000-000000000021'::uuid, u.id,
       'c4230000-0000-0000-0000-000000000001'::uuid, 'C423 Test-user teilen',
       'E-72 Nachweis fuer einen oeffentlich teilbaren Nutzerstack.', 'health', 'user', true, 10
FROM auth.users u WHERE u.email = 'test-user@lumeos.local'
ON CONFLICT (id) DO UPDATE SET
  owner_id = EXCLUDED.owner_id, origin_stack_id = EXCLUDED.origin_stack_id,
  name_de = EXCLUDED.name_de, description_de = EXCLUDED.description_de, goal = EXCLUDED.goal,
  source = EXCLUDED.source, is_public = EXCLUDED.is_public, updated_at = now();

WITH source_supplement AS (
  SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1
), templates AS (
  SELECT unnest(ARRAY[
    'c4230000-0000-0000-0000-000000000011'::uuid,
    'c4230000-0000-0000-0000-000000000012'::uuid,
    'c4230000-0000-0000-0000-000000000013'::uuid,
    'c4230000-0000-0000-0000-000000000014'::uuid,
    'c4230000-0000-0000-0000-000000000021'::uuid
  ]) AS template_id
)
INSERT INTO supplements.stack_template_items (
  template_id, supplement_id, dose_amount, dose_unit, timing, frequency, tier, sort_order
)
SELECT t.template_id, s.id, 200, 'mg', 'morning', 'daily', 'good', 0
FROM templates t CROSS JOIN source_supplement s;

INSERT INTO supplements.stack_curation_candidates (
  id, source_template_id, origin_stack_id, owner_id, name_de, description_de, goal, reason, status
)
SELECT 'c4230000-0000-0000-0000-000000000031'::uuid,
       'c4230000-0000-0000-0000-000000000021'::uuid,
       'c4230000-0000-0000-0000-000000000001'::uuid, u.id,
       'C423 Test-user teilen', 'E-72 Nachweis fuer einen oeffentlich teilbaren Nutzerstack.',
       'health', 'E-72 Seed: freiwillig geteilter Nutzerstack als Katalogvorschlag.', 'pending'
FROM auth.users u WHERE u.email = 'test-user@lumeos.local';

INSERT INTO supplements.stack_curation_candidate_items (
  candidate_id, supplement_id, dose_amount, dose_unit, timing, frequency, tier, sort_order
)
SELECT 'c4230000-0000-0000-0000-000000000031'::uuid, s.id, 200, 'mg', 'morning', 'daily', 'good', 0
FROM supplements.supplements s WHERE s.is_active ORDER BY s.id LIMIT 1;

INSERT INTO public.profiles (
  id, birth_date, biological_sex, height_cm, body_weight_kg, activity_level, nutrition_goal
)
SELECT id, birth_date, biological_sex, height_cm, body_weight_kg, activity_level, nutrition_goal
FROM test_users
ON CONFLICT (id) DO UPDATE SET
  birth_date = EXCLUDED.birth_date,
  biological_sex = EXCLUDED.biological_sex,
  height_cm = EXCLUDED.height_cm,
  body_weight_kg = EXCLUDED.body_weight_kg,
  activity_level = EXCLUDED.activity_level,
  nutrition_goal = EXCLUDED.nutrition_goal,
  updated_at = now();

INSERT INTO public.profiles (id)
VALUES (${lit(COACH_USER.id)}::uuid)
ON CONFLICT (id) DO NOTHING;

INSERT INTO coach.coach_profiles (user_id, display_name, email)
VALUES (${lit(COACH_USER.id)}::uuid, ${lit(COACH_USER.displayName)}, ${lit(COACH_USER.email)})
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  is_active = true,
  updated_at = now();

INSERT INTO coach.client_permissions (
  id, coach_id, client_id,
  nutrition_visibility, training_visibility, recovery_visibility, goals_visibility,
  supplements_visibility, medical_visibility, buddy_visibility,
  nutrition_auto_apply, training_auto_apply, recovery_auto_apply, goals_auto_apply,
  supplements_auto_apply, medical_auto_apply, buddy_auto_apply,
  client_note, changed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000101'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'summary', 'summary', 'none', 'summary',
  'none', 'none', 'none',
  false, false, false, false,
  false, false, false,
  'C-147 Seed: Ausgangszustand vor differenzierten Coach-Rechten',
  '10000000-0000-0000-0000-000000000101'::uuid
);

UPDATE coach.client_permissions
SET nutrition_visibility = 'full',
    training_visibility = 'full',
    recovery_visibility = 'summary',
    goals_visibility = 'full',
    supplements_visibility = 'summary',
    medical_visibility = 'none',
    buddy_visibility = 'summary',
    training_auto_apply = true,
    client_note = 'C-147 Seed: Training offen, Medical gesperrt, Nutrition mit Bestaetigung',
    changed_by = '10000000-0000-0000-0000-000000000101'::uuid
WHERE id = '60000000-0000-0000-0000-000000000101'::uuid;

INSERT INTO coach.client_autonomy (
  id, coach_id, client_id,
  nutrition_level, training_level, recovery_level, goals_level,
  supplements_level, medical_level, buddy_level, safety_level,
  coach_note, changed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000102'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  2, 2, 2, 2, 2, 2, 2, 1,
  'C-147 Seed: Ausgangszustand fuer Autonomy-Historie',
  ${lit(COACH_USER.id)}::uuid
);

UPDATE coach.client_autonomy
SET nutrition_level = 3,
    training_level = 4,
    recovery_level = 2,
    goals_level = 3,
    supplements_level = 2,
    medical_level = 1,
    buddy_level = 3,
    safety_level = 2,
    coach_note = 'C-147 Seed: Coach setzt differenzierte Reifegrade je Modul',
    changed_by = ${lit(COACH_USER.id)}::uuid
WHERE id = '60000000-0000-0000-0000-000000000102'::uuid;

INSERT INTO coach.pending_actions (
  id, coach_id, client_id, module, action_type, preview, payload,
  status, expires_at, created_by
)
VALUES (
  '60000000-0000-0000-0000-000000000103'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'nutrition',
  'adjust_macro_targets',
  '{"title":"Protein leicht anheben","summary":"Coach schlaegt +10 g Protein am Trainingstag vor"}'::jsonb,
  '{"protein_g_delta":10,"reason":"C-147 Pending Action mit Nutzerbestaetigung"}'::jsonb,
  'pending',
  now() + interval '10 minutes',
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO coach.action_log (
  id, coach_id, client_id, module, action_type,
  payload_snapshot, undo_data, executed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000104'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'training',
  'adjust_training_day',
  '{"day":"upper","change":"Bench-Topset priorisiert"}'::jsonb,
  '{"restore":{"day":"upper","change":"vorherige Uebungsreihenfolge"}}'::jsonb,
  ${lit(COACH_USER.id)}::uuid
);

-- ------------------------------------------------------------------
-- F-07: Beziehungen, Rechte fuer den zweiten Athleten, Check-ins,
-- Nachrichten und Alerts. Drei Athleten in drei Zustaenden:
--   tom.seed   aktiv, historisch ohne nacherfundenen Namenssnapshot (C-440)
--   max.seed   aktiv, historisch ohne nacherfundenen Namenssnapshot
--   sarah.seed eingeladen, noch keine Rechte, aktueller Coach-Namenssnapshot
-- Daten relativ zu current_date — der Vorrat altert nicht (C-78-Regel).
-- ------------------------------------------------------------------

INSERT INTO coach.relationships (
  id, coach_id, client_id, status, invited_by, invite_note, coach_display_name, started_at, changed_by
)
VALUES
(
  '60000000-0000-0000-0000-000000000201'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'active',
  ${lit(COACH_USER.id)}::uuid,
  'F-07 Seed: aktive Beziehung seit 120 Tagen',
  NULL,
  now() - interval '120 days',
  ${lit(COACH_USER.id)}::uuid
),
(
  '60000000-0000-0000-0000-000000000202'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000102'::uuid,
  'active',
  ${lit(COACH_USER.id)}::uuid,
  'F-07 Seed: aktive Beziehung seit 45 Tagen',
  NULL,
  now() - interval '45 days',
  ${lit(COACH_USER.id)}::uuid
),
(
  '60000000-0000-0000-0000-000000000203'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000103'::uuid,
  'invited',
  ${lit(COACH_USER.id)}::uuid,
  'F-07 Seed: Einladung offen, keine Rechte',
  ${lit(COACH_USER.displayName)},
  NULL,
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO coach.client_permissions (
  id, coach_id, client_id,
  nutrition_visibility, training_visibility, recovery_visibility, goals_visibility,
  supplements_visibility, medical_visibility, buddy_visibility,
  client_note, changed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000204'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000102'::uuid,
  'none', 'summary', 'summary', 'none',
  'none', 'none', 'none',
  'F-07 Seed: Max gibt nur Training und Recovery als Zusammenfassung frei',
  '10000000-0000-0000-0000-000000000102'::uuid
);

INSERT INTO coach.client_autonomy (
  id, coach_id, client_id,
  nutrition_level, training_level, recovery_level, goals_level,
  supplements_level, medical_level, buddy_level, safety_level,
  coach_note, changed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000205'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000102'::uuid,
  2, 2, 2, 2, 2, 2, 2, 1,
  'F-07 Seed: Ausgangszustand fuer den zweiten Athleten',
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO coach.checkin_templates (
  id, coach_id, client_id, name, cadence, fields, changed_by
)
VALUES (
  '60000000-0000-0000-0000-000000000206'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'Woechentlicher Standard',
  'weekly',
  '[
    {"key":"gewicht_kg","label":"Gewicht (kg)","typ":"zahl"},
    {"key":"energie","label":"Energie (1-10)","typ":"zahl"},
    {"key":"schlaf","label":"Schlaf (1-10)","typ":"zahl"},
    {"key":"training_verlauf","label":"Wie lief das Training?","typ":"text"},
    {"key":"fragen","label":"Offene Fragen","typ":"text"}
  ]'::jsonb,
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO coach.checkins (
  id, coach_id, client_id, template_id, due_date, status,
  auto_data, client_data, client_note, coach_feedback, coach_notes,
  submitted_at, reviewed_at, changed_by
)
VALUES
(
  '60000000-0000-0000-0000-000000000207'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  '60000000-0000-0000-0000-000000000206'::uuid,
  current_date - 8,
  'reviewed',
  '{"training":{"freigegeben":true,"einheiten_30d":9,"letzte_einheit_tage":2},"nutrition":{"freigegeben":true,"kcal_schnitt":2431}}'::jsonb,
  '{"gewicht_kg":85.4,"energie":7,"schlaf":7,"training_verlauf":"Bank fuehlte sich schwer an, Rest gut.","fragen":"Refeed am Samstag ok?"}'::jsonb,
  'Woche war stressig im Job.',
  'Gute Woche. Refeed Samstag passt — Protein halten. Bank beobachten wir.',
  'Bank-Topset stagniert zweite Woche, beim naechsten Block adressieren.',
  now() - interval '8 days',
  now() - interval '7 days',
  ${lit(COACH_USER.id)}::uuid
),
(
  '60000000-0000-0000-0000-000000000208'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  '60000000-0000-0000-0000-000000000206'::uuid,
  current_date - 1,
  'submitted',
  '{"training":{"freigegeben":true,"einheiten_30d":10,"letzte_einheit_tage":1},"nutrition":{"freigegeben":true,"kcal_schnitt":2405}}'::jsonb,
  '{"gewicht_kg":84.9,"energie":6,"schlaf":6,"training_verlauf":"Deadlift-PR, sonst solide.","fragen":"Schlaf ist schlechter geworden, Ideen?"}'::jsonb,
  NULL,
  NULL,
  NULL,
  now() - interval '1 day',
  NULL,
  '10000000-0000-0000-0000-000000000101'::uuid
),
(
  '60000000-0000-0000-0000-000000000209'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  '60000000-0000-0000-0000-000000000206'::uuid,
  current_date + 6,
  'pending',
  '{}'::jsonb,
  '{}'::jsonb,
  NULL, NULL, NULL,
  NULL, NULL,
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO coach.messages (
  id, coach_id, client_id, sender_id, body, sent_at, read_at
)
VALUES
(
  '60000000-0000-0000-0000-000000000210'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  'Check-in ist reviewt — Feedback steht drin. Meld dich bei Fragen.',
  now() - interval '7 days',
  now() - interval '7 days' + interval '3 hours'
),
(
  '60000000-0000-0000-0000-000000000211'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'Danke! Refeed hat gut getan. Neuer Check-in ist eingereicht.',
  now() - interval '1 day',
  NULL
),
(
  '60000000-0000-0000-0000-000000000212'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000102'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  'Willkommen an Bord — sobald du magst, schalte weitere Module frei.',
  now() - interval '44 days',
  NULL
);

INSERT INTO coach.alerts (
  id, coach_id, client_id, module, title, detail, metric, status, created_by
)
VALUES
(
  '60000000-0000-0000-0000-000000000213'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'general',
  'Check-in eingereicht, Review offen',
  'Der Check-in vom Vortag wartet auf eine Antwort.',
  jsonb_build_object('eingereicht_vor_tagen', 1),
  'open',
  ${lit(COACH_USER.id)}::uuid
),
(
  '60000000-0000-0000-0000-000000000214'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid,
  'nutrition',
  'Kalorienschnitt 7 Tage unter Ziel',
  'Schnitt 2.405 kcal gegen Ziel 2.500 kcal ueber die letzten 7 Tage.',
  '{"kcal_schnitt_7d":2405,"kcal_ziel":2500}'::jsonb,
  'open',
  ${lit(COACH_USER.id)}::uuid
),
(
  '60000000-0000-0000-0000-000000000215'::uuid,
  ${lit(COACH_USER.id)}::uuid,
  '10000000-0000-0000-0000-000000000102'::uuid,
  'recovery',
  'Recovery-Schnitt gegenueber Vorwoche gefallen',
  '7-Tage-Schnitt 62 gegen 70 in der Vorwoche.',
  '{"score_schnitt_7d":62,"score_vorwoche":70}'::jsonb,
  'read',
  ${lit(COACH_USER.id)}::uuid
);

INSERT INTO goals.nutrition_targets (
  user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g,
  linoleic_acid_g, alpha_linolenic_acid_g,
  herkunft, tdee, nutrition_goal, notiz
)
SELECT id, DATE '${TARGET_START_DATE}', kcal, protein_g, carbs_g, fat_g,
       ROUND(kcal * 0.04 / 9, 1), ROUND(kcal * 0.005 / 9, 1),
       'formel', tdee, nutrition_goal,
       'C-82 Testdaten aus Vorgängerrepo-Zuschnitt'
FROM test_users
ON CONFLICT (user_id, gueltig_ab) DO UPDATE SET
  kcal = EXCLUDED.kcal,
  protein_g = EXCLUDED.protein_g,
  carbs_g = EXCLUDED.carbs_g,
  fat_g = EXCLUDED.fat_g,
  linoleic_acid_g = EXCLUDED.linoleic_acid_g,
  alpha_linolenic_acid_g = EXCLUDED.alpha_linolenic_acid_g,
  tdee = EXCLUDED.tdee,
  nutrition_goal = EXCLUDED.nutrition_goal,
  notiz = EXCLUDED.notiz,
  updated_at = now();

CREATE TEMP TABLE test_goals (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  goal_type text NOT NULL,
  subtype text,
  title text NOT NULL,
  description text,
  target_value numeric,
  target_unit text,
  start_value numeric,
  current_value numeric,
  gueltig_ab date NOT NULL,
  target_date date,
  status text NOT NULL,
  priority smallint NOT NULL,
  is_primary boolean NOT NULL,
  progress_pct numeric NOT NULL,
  motivation_reason text,
  difficulty_level text,
  achievement_date date
) ON COMMIT DROP;

INSERT INTO test_goals VALUES
${goalValues};

INSERT INTO goals.user_goals (
  id, user_id, goal_type, subtype, title, description,
  target_value, target_unit, start_value, current_value,
  gueltig_ab, target_date, status, priority, is_primary,
  progress_pct, motivation_reason, difficulty_level, achievement_date
)
SELECT
  id, user_id, goal_type, subtype, title, description,
  target_value, target_unit, start_value, current_value,
  gueltig_ab, target_date, status, priority, is_primary,
  progress_pct, motivation_reason, difficulty_level, achievement_date
FROM test_goals;

CREATE TEMP TABLE test_goal_phases (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  goal_id uuid,
  phase_type text NOT NULL,
  variant text,
  parameters jsonb NOT NULL,
  gueltig_ab date NOT NULL,
  projected_end_date date,
  actual_end_date date,
  transitioned_from text,
  recommended_next text,
  transition_reason text
) ON COMMIT DROP;

INSERT INTO test_goal_phases VALUES
${goalPhaseValues};

INSERT INTO goals.goal_phases (
  id, user_id, goal_id, phase_type, variant, parameters,
  gueltig_ab, projected_end_date, actual_end_date,
  transitioned_from, recommended_next, transition_reason
)
SELECT
  id, user_id, goal_id, phase_type, variant, parameters,
  gueltig_ab, projected_end_date, actual_end_date,
  transitioned_from, recommended_next, transition_reason
FROM test_goal_phases;

CREATE TEMP TABLE test_goal_milestones (
  id uuid PRIMARY KEY,
  goal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  milestone_type text NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  target_unit text,
  threshold_pct numeric,
  target_date date,
  status text NOT NULL,
  achieved_date date,
  achieved_value numeric,
  celebration_message text,
  auto_generated boolean NOT NULL,
  notification_sent boolean NOT NULL,
  source text NOT NULL,
  source_detail text
) ON COMMIT DROP;

INSERT INTO test_goal_milestones VALUES
${goalMilestoneValues};

INSERT INTO goals.goal_milestones (
  id, goal_id, user_id, milestone_type, title, description,
  target_value, target_unit, threshold_pct, target_date, status,
  achieved_date, achieved_value, celebration_message,
  auto_generated, notification_sent, source, source_detail
)
SELECT
  id, goal_id, user_id, milestone_type, title, description,
  target_value, target_unit, threshold_pct, target_date, status,
  achieved_date, achieved_value, celebration_message,
  auto_generated, notification_sent, source, source_detail
FROM test_goal_milestones;

CREATE TEMP TABLE test_body_measurements (
  user_id uuid NOT NULL,
  measurement_date date NOT NULL,
  measurement_time time NOT NULL,
  weight_kg numeric NOT NULL,
  body_fat_pct numeric,
  bf_method text,
  measurement_source text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_body_measurements VALUES
${bodyMeasurementValues};

INSERT INTO goals.body_measurements (
  user_id, measurement_date, measurement_time, weight_kg, body_fat_pct, bf_method, measurement_source, notes
)
SELECT user_id, measurement_date, measurement_time, weight_kg, body_fat_pct, bf_method, measurement_source, notes
FROM test_body_measurements;

CREATE TEMP TABLE test_body_circumferences (
  user_id uuid NOT NULL,
  measurement_date date NOT NULL,
  measurement_time time NOT NULL,
  neck_cm numeric NOT NULL,
  shoulders_cm numeric NOT NULL,
  chest_cm numeric NOT NULL,
  upper_arm_left_cm numeric NOT NULL,
  upper_arm_right_cm numeric NOT NULL,
  forearm_left_cm numeric NOT NULL,
  forearm_right_cm numeric NOT NULL,
  waist_cm numeric NOT NULL,
  hip_cm numeric NOT NULL,
  thigh_left_cm numeric NOT NULL,
  thigh_right_cm numeric NOT NULL,
  calf_left_cm numeric NOT NULL,
  calf_right_cm numeric NOT NULL,
  measurement_source text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_body_circumferences VALUES
${bodyCircumferenceValues};

INSERT INTO goals.body_circumferences (
  user_id, measurement_date, measurement_time,
  neck_cm, shoulders_cm, chest_cm,
  upper_arm_left_cm, upper_arm_right_cm,
  forearm_left_cm, forearm_right_cm,
  waist_cm, hip_cm,
  thigh_left_cm, thigh_right_cm,
  calf_left_cm, calf_right_cm,
  measurement_source,
  notes
)
SELECT
  user_id, measurement_date, measurement_time,
  neck_cm, shoulders_cm, chest_cm,
  upper_arm_left_cm, upper_arm_right_cm,
  forearm_left_cm, forearm_right_cm,
  waist_cm, hip_cm,
  thigh_left_cm, thigh_right_cm,
  calf_left_cm, calf_right_cm,
  measurement_source,
  notes
FROM test_body_circumferences;

CREATE TEMP TABLE test_supplement_stacks (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  goal text NOT NULL,
  is_active boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO test_supplement_stacks VALUES
${supplementStackValues};

INSERT INTO supplements.user_stacks (
  id, user_id, name, description, goal, source, is_active
)
SELECT id, user_id, name, description, goal, 'user', is_active
FROM test_supplement_stacks;

CREATE TEMP TABLE test_supplement_stack_items (
  id uuid PRIMARY KEY,
  stack_id uuid NOT NULL,
  supplement_slug text NOT NULL,
  dose numeric NOT NULL,
  dose_unit text NOT NULL,
  frequency text NOT NULL,
  timing text NOT NULL,
  stock_remaining numeric,
  stock_unit text,
  low_stock_threshold numeric,
  sort_order integer NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_supplement_stack_items VALUES
${supplementStackItemValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT i.supplement_slug, ', ' ORDER BY i.supplement_slug)
    INTO v_missing
  FROM test_supplement_stack_items i
  LEFT JOIN LATERAL (
    SELECT
      CASE
        WHEN m.catalog_a = 'kimi_substance' THEN m.entity_id_a
        ELSE m.entity_id_b
      END AS kimi_substance_id
    FROM supplements.substance_alias_matches m
    WHERE (
        m.catalog_a = 'lumeos_supplement_catalog'
        AND m.catalog_b = 'kimi_substance'
        AND m.entity_id_a = i.supplement_slug
      ) OR (
        m.catalog_a = 'kimi_substance'
        AND m.catalog_b = 'lumeos_supplement_catalog'
        AND m.entity_id_b = i.supplement_slug
      )
    ORDER BY kimi_substance_id
    LIMIT 1
  ) match ON true
  LEFT JOIN supplements.supplements s ON s.slug = COALESCE(match.kimi_substance_id, i.supplement_slug)
  WHERE s.id IS NULL
    AND i.supplement_slug NOT IN ('magnesium', 'vitamin-d3');

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Testdaten: Supplement-Slugs fehlen im neuen Katalog: %', v_missing;
  END IF;
END $$;

CREATE TEMP TABLE test_supplement_stack_item_resolution AS
SELECT
  i.*,
  s.id AS new_supplement_id,
  CASE i.supplement_slug
    WHEN 'magnesium' THEN 'Magnesium'
    WHEN 'vitamin-d3' THEN 'Vitamin D3'
    ELSE i.supplement_slug
  END AS unresolved_custom_name
FROM test_supplement_stack_items i
LEFT JOIN LATERAL (
  SELECT
    CASE
      WHEN m.catalog_a = 'kimi_substance' THEN m.entity_id_a
      ELSE m.entity_id_b
    END AS kimi_substance_id
  FROM supplements.substance_alias_matches m
  WHERE (
      m.catalog_a = 'lumeos_supplement_catalog'
      AND m.catalog_b = 'kimi_substance'
      AND m.entity_id_a = i.supplement_slug
    ) OR (
      m.catalog_a = 'kimi_substance'
      AND m.catalog_b = 'lumeos_supplement_catalog'
      AND m.entity_id_b = i.supplement_slug
    )
  ORDER BY kimi_substance_id
  LIMIT 1
) match ON true
LEFT JOIN supplements.supplements s ON s.slug = COALESCE(match.kimi_substance_id, i.supplement_slug);

INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, custom_name, dose, dose_unit, frequency, timing,
  stock_remaining, stock_unit, low_stock_threshold, sort_order, notes
)
SELECT
  i.id, i.stack_id, i.new_supplement_id,
  CASE WHEN i.new_supplement_id IS NULL THEN i.unresolved_custom_name ELSE NULL END,
  i.dose, i.dose_unit, i.frequency, i.timing,
  i.stock_remaining, i.stock_unit, i.low_stock_threshold, i.sort_order, i.notes
FROM test_supplement_stack_item_resolution i;

CREATE TEMP TABLE test_supplement_intake_logs (
  user_id uuid NOT NULL,
  stack_item_id uuid NOT NULL,
  intake_date date NOT NULL,
  intake_time time NOT NULL,
  status text NOT NULL,
  supplement_name_snapshot text NOT NULL,
  dose_snapshot numeric NOT NULL,
  dose_unit_snapshot text NOT NULL,
  actual_dose numeric,
  actual_dose_unit text,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_supplement_intake_logs VALUES
${supplementIntakeLogValues};

INSERT INTO supplements.intake_logs (
  user_id, stack_item_id, intake_date, intake_time, status,
  supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
  actual_dose, actual_dose_unit, notes
)
SELECT
  user_id, stack_item_id, intake_date, intake_time, status,
  supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
  actual_dose, actual_dose_unit, notes
FROM test_supplement_intake_logs;

CREATE TEMP TABLE test_medical_lab_reports (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  report_date date NOT NULL,
  report_time time NOT NULL,
  lab_name text NOT NULL,
  title text NOT NULL,
  source text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_medical_lab_reports VALUES
${medicalLabReportValues};

INSERT INTO medical.lab_reports (
  id, user_id, report_date, report_time, lab_name, title, source, notes
)
SELECT id, user_id, report_date, report_time, lab_name, title, source, notes
FROM test_medical_lab_reports;

-- C-429/E-72: Ein Original ist ein privates Storage-Objekt, nicht nur ein
-- file_ref-Text. Der Seed benutzt denselben Upload-then-attach-Vertrag wie
-- die Anwendung; die 241 Byte sind bewusst ein harmloser Nachweiswert.
INSERT INTO medical.lab_reports (id, user_id, report_date, report_time, lab_name, title, source, source_detail, notes)
VALUES (
  'c4290000-0000-0000-0000-000000000011'::uuid,
  '20000000-0000-0000-0000-000000000901'::uuid,
  DATE '${relDate('2026-08-18')}', TIME '09:20', 'C-429 Testlabor',
  'C-429 Originalbefund', 'seed', 'C-429 Testdaten: test-user Original mit Herkunft',
  'C-429 E-72 Nachweisbestand'
);
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000901';
INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
VALUES (
  'medical-originals',
  '20000000-0000-0000-0000-000000000901/c4290000-0000-0000-0000-000000000011.pdf',
  '20000000-0000-0000-0000-000000000901',
  '{"size":241,"mimetype":"application/pdf"}'::jsonb
);
SELECT medical.attach_lab_report_original(
  'c4290000-0000-0000-0000-000000000011'::uuid,
  '20000000-0000-0000-0000-000000000901/c4290000-0000-0000-0000-000000000011.pdf'
);
RESET ROLE;

CREATE TEMP TABLE test_medical_lab_values (
  report_id uuid NOT NULL,
  user_id uuid NOT NULL,
  loinc_code text NOT NULL,
  marker_name_snapshot text NOT NULL,
  unit_snapshot text NOT NULL,
  value_numeric numeric NOT NULL,
  value_text text,
  value_operator text NOT NULL,
  lab_reference_low numeric,
  lab_reference_high numeric,
  lab_reference_text text,
  lab_reference_unit text,
  lab_reference_source text,
  source text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_medical_lab_values VALUES
${medicalLabValueValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT v.loinc_code, ', ' ORDER BY v.loinc_code)
    INTO v_missing
  FROM test_medical_lab_values v
  LEFT JOIN medical.biomarker_catalog c ON c.loinc_code = v.loinc_code
  WHERE c.loinc_code IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Testdaten: LOINC-Codes fehlen im Medical-Katalog: %', v_missing;
  END IF;
END $$;

INSERT INTO medical.lab_result_values (
  report_id, user_id, loinc_code,
  marker_name_snapshot, unit_snapshot,
  value_numeric, value_text, value_operator,
  lab_reference_low, lab_reference_high, lab_reference_text,
  lab_reference_unit, lab_reference_source,
  source, notes
)
SELECT
  report_id, user_id, loinc_code,
  marker_name_snapshot, unit_snapshot,
  value_numeric, value_text, value_operator,
  lab_reference_low, lab_reference_high, lab_reference_text,
  lab_reference_unit, lab_reference_source,
  source, notes
FROM test_medical_lab_values;

DO $$
DECLARE
  v_warfarin text;
BEGIN
  SELECT id INTO v_warfarin
  FROM medical.medication_active_substances
  WHERE 'anticoagulant:warfarin' = ANY(drug_class)
  ORDER BY canonical_name
  LIMIT 1;

  IF v_warfarin IS NULL THEN
    RAISE EXCEPTION 'C-130 Testdaten: Warfarin fehlt im Medikamentenkatalog';
  END IF;
END $$;

INSERT INTO medical.user_medications (
  user_id, active_substance_id, name, drug_class, cyp_profile,
  dose_amount, dose_unit, doses_per_day, route, start_date,
  is_active, indication, notes, measurement_source, source_detail,
  source_kind, source_actor, source_recorded_at, source_lab_report_id
)
SELECT
  '10000000-0000-0000-0000-000000000101'::uuid,
  s.id,
  s.canonical_name,
  s.drug_class,
  s.cyp_profile,
  5,
  'mg',
  1,
  'oral',
  DATE '${relDate('2026-08-15')}',
  true,
  'C-130 Szenario: Warfarin fuer spaetere Vitamin-K-Regel',
  'Seed-Medikation fuer Regelpruefung, keine Dosierungsempfehlung',
  'seed',
  'C-130 Testdaten aus Kimi-Medikamentenkatalog',
  'seed',
  'C-130 Testdaten',
  now(),
  NULL
FROM medical.medication_active_substances s
WHERE 'anticoagulant:warfarin' = ANY(s.drug_class)
ORDER BY s.canonical_name
LIMIT 1;

INSERT INTO medical.user_conditions (
  user_id, condition_code, status, start_date, notes,
  measurement_source, source_detail,
  source_kind, source_actor, source_recorded_at, source_lab_report_id
)
VALUES (
  '10000000-0000-0000-0000-000000000101'::uuid,
  'hypertension',
  'active',
  DATE '${relDate('2026-08-10')}',
  'C-130 Szenario fuer Conditions-Feldvertrag',
  'seed',
  'C-130 Testdaten, keine Krankengeschichte',
  'seed',
  'C-130 Testdaten',
  now(),
  NULL
);

-- C-429/E-74: Diese drei Eintraege sind vom Nutzer festgehaltene Zitate mit
-- Herkunft, keine medizinische Bewertung des Systems.
INSERT INTO medical.appointments (
  id, user_id, appointment_type, starts_at, time_zone, status, title, lab_report_id,
  source_kind, source_actor, source_recorded_at, source_lab_report_id
)
VALUES (
  'c4290000-0000-0000-0000-000000000021'::uuid,
  '20000000-0000-0000-0000-000000000901'::uuid,
  'labor',
  '${relDate('2026-08-24')} 09:30:00+07'::timestamptz,
  'Asia/Bangkok',
  'scheduled',
  'C-429 Kontrolltermin',
  'c4290000-0000-0000-0000-000000000011'::uuid,
  'seed',
  'C-429 Testdaten',
  now(),
  'c4290000-0000-0000-0000-000000000011'::uuid
);

INSERT INTO medical.health_events (
  id, user_id, event_type, occurred_on, title, source_kind, source_actor,
  source_recorded_at, source_lab_report_id
)
VALUES
  ('c4290000-0000-0000-0000-000000000031'::uuid, '20000000-0000-0000-0000-000000000901'::uuid, 'diagnosis', DATE '${relDate('2024-10-12')}',
   'Arztzitat: Kniearthrose', 'clinician', 'Dr. Beispiel', '${relDate('2024-10-12')} 10:00:00+07',
   'c4290000-0000-0000-0000-000000000011'::uuid),
  ('c4290000-0000-0000-0000-000000000032'::uuid, '20000000-0000-0000-0000-000000000901'::uuid, 'treatment', DATE '${relDate('2024-10-20')}',
   'Arztzitat: Physiotherapie verordnet', 'clinician', 'Dr. Beispiel', '${relDate('2024-10-20')} 10:00:00+07',
   'c4290000-0000-0000-0000-000000000011'::uuid),
  ('c4290000-0000-0000-0000-000000000033'::uuid, '20000000-0000-0000-0000-000000000901'::uuid, 'operation', DATE '${relDate('2025-01-15')}',
   'Arztzitat: Knieoperation dokumentiert', 'document', 'OP-Bericht', '${relDate('2025-01-15')} 10:00:00+07',
   'c4290000-0000-0000-0000-000000000011'::uuid);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000101', true);
SELECT *
FROM medical.import_lab_report_rows(
  '10000000-0000-0000-0000-000000000101'::uuid,
  DATE '${relDate('2026-08-19')}',
  TIME '08:40',
  'C-72 Testlabor',
  'C-72 Importierter Rohbefund',
  'seed',
  '${medicalImportRowsJson}'::jsonb
);
RESET ROLE;

SELECT nutrition.food_preferences_write(
  '10000000-0000-0000-0000-000000000101'::uuid,
  jsonb_build_object(
    'diet_type', 'omnivore',
    'allergies', jsonb_build_array('tree_nuts'),
    'intolerances', jsonb_build_array('lactose'),
    'general_exclusions', jsonb_build_array('ultra_processed'),
    'preferred_cuisines', jsonb_build_array('mediterranean'),
    'meals_per_day', 4,
    'snacks_per_day', 1,
    'cooking_skill', 'advanced',
    'prep_time_max_min', 30,
    'budget_level', 'medium',
    'meal_prep_ok', true,
    'planner_notes', 'G-11a Testdaten: Allergie, Abneigung und Like fuer spaetere Suchwirkung'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'preference', 'hard_exclude',
      'strength', 'hard_exclude',
      'target_type', 'tag',
      'tag_code', 'contains_nuts',
      'source', 'settings'
    ),
    jsonb_build_object(
      'preference', 'disliked',
      'strength', 'soft_dislike',
      'target_type', 'category',
      'category_id', (
        SELECT id FROM nutrition.food_categories
        WHERE slug = 'backwaren-gebaeck-snack-kategorie-kekse-plaetzchen'
      ),
      'source', 'settings'
    ),
    jsonb_build_object(
      'preference', 'liked',
      'strength', 'boost',
      'target_type', 'food',
      'food_id', (
        SELECT id FROM nutrition.foods
        WHERE bls_code = 'C352000'
      ),
      'source', 'settings'
    )
  )
);

-- C-241/C-413: Ein begrenzter, aber voll lesbarer Nutrition-Grundbestand
-- fuer das Nachweiskonto. Die Daten sind absichtlich nicht von dev kopiert:
-- ein Kettenlauf darf Toms Konto nicht als Testbuehne verwenden.
SELECT nutrition.food_preferences_write(
  (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
  jsonb_build_object(
    'diet_type', 'omnivore',
    'allergies', jsonb_build_array(),
    'intolerances', jsonb_build_array('lactose'),
    'general_exclusions', jsonb_build_array(),
    'preferred_cuisines', jsonb_build_array('mediterranean'),
    'meals_per_day', 4,
    'snacks_per_day', 1,
    'cooking_skill', 'intermediate',
    'prep_time_max_min', 30,
    'budget_level', 'medium',
    'meal_prep_ok', true,
    'planner_notes', 'C-241/C-413: kleiner kettengetragener Nachweisbestand'
  ),
  jsonb_build_array(
    jsonb_build_object('preference', 'hard_exclude', 'strength', 'hard_exclude',
      'target_type', 'tag', 'tag_code', 'contains_nuts', 'source', 'settings'),
    jsonb_build_object('preference', 'liked', 'strength', 'boost',
      'target_type', 'food', 'food_id', (SELECT id FROM nutrition.foods WHERE bls_code = 'C352000'),
      'source', 'settings'),
    jsonb_build_object('preference', 'disliked', 'strength', 'soft_dislike',
      'target_type', 'food', 'food_id', (SELECT id FROM nutrition.foods WHERE bls_code = 'T410052'),
      'source', 'settings')
  )
);

INSERT INTO nutrition.meal_slots (user_id, position, name, planned_time)
SELECT u.id, s.position, s.name, s.planned_time::time
FROM (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local') u
CROSS JOIN (VALUES
  (1, 'Fruehstueck', '07:30'),
  (2, 'Mittagessen', '12:30'),
  (3, 'Snack', '16:00'),
  (4, 'Abendessen', '19:30')
) AS s(position, name, planned_time);

INSERT INTO nutrition.meal_plans (
  id, user_id, name, description, lifecycle_type, start_date, days_count,
  target_kcal, target_protein_g, target_carbs_g, target_fat_g, is_active,
  measurement_source, source_detail
)
SELECT
  'c4130000-0000-0000-0000-000000000001'::uuid, u.id,
  'Nachweiswoche', 'C-241/C-413: eine voll lesbare Woche', 'once',
  DATE ${lit(addIsoDays(TODAY_DATE, -6))}, 7, 2200, 160, 230, 70, true,
  'seed', 'C-241/C-413 test-user Grundbestand'
FROM auth.users u WHERE u.email = 'test-user@lumeos.local';

INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start, name)
SELECT
  'c4130000-0000-0000-0000-000000000002'::uuid,
  'c4130000-0000-0000-0000-000000000001'::uuid, u.id,
  DATE ${lit(addIsoDays(TODAY_DATE, -6))}, 'Nachweiswoche'
FROM auth.users u WHERE u.email = 'test-user@lumeos.local';

INSERT INTO nutrition.meal_plan_days (week_id, user_id, plan_date, day_index, notes)
SELECT
  'c4130000-0000-0000-0000-000000000002'::uuid, u.id,
  DATE ${lit(addIsoDays(TODAY_DATE, -6))} + d, d + 1, 'C-241/C-413 Nachweistag'
FROM auth.users u
CROSS JOIN generate_series(0, 6) AS d
WHERE u.email = 'test-user@lumeos.local';

INSERT INTO nutrition.meal_plan_entries (
  day_id, user_id, meal_type, planned_time, slot_order, entry_type, food_id, amount_g, note
)
SELECT d.id, d.user_id, e.meal_type, e.planned_time::time, 1, 'bls', f.id, e.amount_g,
       'C-241/C-413 Planposition'
FROM nutrition.meal_plan_days d
CROSS JOIN (VALUES
  ('breakfast', '07:30', 'C352000', 250::numeric),
  ('lunch', '12:30', 'M713100', 180::numeric),
  ('snack', '16:00', 'F503100', 150::numeric),
  ('dinner', '19:30', 'T410052', 180::numeric)
) AS e(meal_type, planned_time, bls_code, amount_g)
JOIN nutrition.foods f ON f.bls_code = e.bls_code
WHERE d.week_id = 'c4130000-0000-0000-0000-000000000002'::uuid;

INSERT INTO nutrition.meals (user_id, entry_date, meal_type, meal_time, notes, entry_source, source_detail)
SELECT u.id, DATE ${lit(addIsoDays(TODAY_DATE, -6))} + d, 'dinner', time '19:30',
       'C-241/C-413 gespeicherte Mahlzeit', 'seed', 'C-241/C-413 test-user Grundbestand'
FROM auth.users u
CROSS JOIN generate_series(0, 6) AS d
WHERE u.email = 'test-user@lumeos.local';

WITH meal_foods AS (
  SELECT m.id AS meal_id, m.user_id, f.id AS food_id, f.bls_code, a.amount_g
  FROM nutrition.meals m
  CROSS JOIN (VALUES ('C352000', 250::numeric), ('T410052', 180::numeric)) AS a(bls_code, amount_g)
  JOIN nutrition.foods f ON f.bls_code = a.bls_code
  WHERE m.user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')
), frozen AS (
  SELECT mf.*, s.food_name, s.nutrients, s.enercc, s.prot625, s.fat, s.cho, s.fibt, s.sugar, s.fasat, s.nacl, s.water_g
  FROM meal_foods mf
  CROSS JOIN LATERAL nutrition.food_nutrient_snapshot('bls', mf.food_id, NULL, mf.amount_g) s
)
INSERT INTO nutrition.meal_items (
  meal_id, user_id, food_id, food_source, food_name, amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, nutrients,
  measurement_source, source_detail
)
SELECT meal_id, user_id, food_id, 'bls', food_name, amount_g,
       enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, nutrients,
       'seed', 'C-241/C-413 test-user Grundbestand'
FROM frozen;

INSERT INTO nutrition.meal_plan_logs (
  plan_id, plan_entry_id, user_id, execution_date, status,
  actual_meal_id, confirmation_mode, confirmed_at
)
SELECT p.id, e.id, p.user_id, d.plan_date, 'confirmed', m.id, 'manual', now()
FROM nutrition.meal_plans p
JOIN nutrition.meal_plan_weeks w ON w.plan_id = p.id
JOIN nutrition.meal_plan_days d ON d.week_id = w.id AND d.day_index = 1
JOIN nutrition.meal_plan_entries e ON e.day_id = d.id AND e.meal_type = 'dinner'
JOIN nutrition.meals m ON m.user_id = p.user_id AND m.entry_date = d.plan_date AND m.meal_type = 'dinner'
WHERE p.id = 'c4130000-0000-0000-0000-000000000001'::uuid;

INSERT INTO nutrition.meal_plan_logs (plan_id, plan_entry_id, user_id, execution_date, status, skipped_at)
SELECT p.id, e.id, p.user_id, d.plan_date, 'skipped', now()
FROM nutrition.meal_plans p
JOIN nutrition.meal_plan_weeks w ON w.plan_id = p.id
JOIN nutrition.meal_plan_days d ON d.week_id = w.id AND d.day_index = 2
JOIN nutrition.meal_plan_entries e ON e.day_id = d.id AND e.meal_type = 'breakfast'
WHERE p.id = 'c4130000-0000-0000-0000-000000000001'::uuid;

INSERT INTO supplements.user_stacks (id, user_id, name, description, goal, source, is_active)
SELECT 'c4130000-0000-0000-0000-000000000003'::uuid, u.id,
       'Nachweis-Stack', 'C-413: aktueller 90-Tage-Stream', 'muscle_building', 'user', true
FROM auth.users u WHERE u.email = 'test-user@lumeos.local';

INSERT INTO supplements.stack_items (
  id, stack_id, custom_name, dose, dose_unit, frequency, timing, sort_order, notes
)
VALUES (
  'c4130000-0000-0000-0000-000000000004'::uuid,
  'c4130000-0000-0000-0000-000000000003'::uuid,
  'Vitamin D3', 2000, 'IU', 'daily', 'morning', 1,
  'C-413 test-user Nachweisposition'
);

INSERT INTO supplements.intake_logs (
  user_id, stack_item_id, intake_date, intake_time, status,
  supplement_name_snapshot, dose_snapshot, dose_unit_snapshot,
  actual_dose, actual_dose_unit, notes, measurement_source, source_detail
)
SELECT u.id, 'c4130000-0000-0000-0000-000000000004'::uuid,
       DATE ${lit(TODAY_DATE)} - d, time '08:10',
       CASE WHEN d % 11 = 0 THEN 'skipped' ELSE 'taken' END,
       'Vitamin D3', 2000, 'IU',
       CASE WHEN d % 11 = 0 THEN NULL ELSE 2000 END,
       CASE WHEN d % 11 = 0 THEN NULL ELSE 'IU' END,
       'C-413 aktueller 90-Tage-Nachweis', 'seed', 'C-413 test-user Grundbestand'
FROM auth.users u
CROSS JOIN generate_series(0, 89) AS d
WHERE u.email = 'test-user@lumeos.local';

CREATE TEMP TABLE test_recipes (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  name_de text NOT NULL,
  description text NOT NULL,
  instructions text NOT NULL,
  cuisine_code text NOT NULL,
  cooking_skill text NOT NULL,
  prep_time_min integer NOT NULL,
  cook_time_min integer NOT NULL,
  servings numeric NOT NULL,
  tags text[] NOT NULL
) ON COMMIT DROP;

INSERT INTO test_recipes VALUES
${recipeValues};

INSERT INTO nutrition.recipes (
  id, user_id, name_de, description, instructions, cuisine_code,
  cooking_skill, prep_time_min, cook_time_min, servings, tags,
  measurement_source, source_detail
)
SELECT
  id, user_id, name_de, description, instructions, cuisine_code,
  cooking_skill, prep_time_min, cook_time_min, servings, tags,
  'seed', 'C-150 Testdaten Rezepte'
FROM test_recipes;

CREATE TEMP TABLE test_recipe_ingredients (
  recipe_id uuid NOT NULL,
  user_id uuid NOT NULL,
  sort_order integer NOT NULL,
  bls_code text NOT NULL,
  amount_g numeric NOT NULL,
  portion_name text,
  portion_quantity numeric,
  portion_amount_g numeric
) ON COMMIT DROP;

INSERT INTO test_recipe_ingredients VALUES
${recipeIngredientValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT i.bls_code, ', ' ORDER BY i.bls_code)
    INTO v_missing
  FROM test_recipe_ingredients i
  LEFT JOIN nutrition.foods f ON f.bls_code = i.bls_code
  WHERE f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'C-150 Rezept-Testdaten: BLS-Codes fehlen im Bestand: %', v_missing;
  END IF;
END $$;

INSERT INTO nutrition.recipe_ingredients (
  recipe_id, user_id, sort_order, food_source, food_id, food_name_snapshot,
  amount_g, portion_name, portion_quantity, portion_amount_g
)
SELECT
  i.recipe_id, i.user_id, i.sort_order, 'bls', f.id,
  COALESCE(NULLIF(f.name_display_de, ''), f.name_de),
  i.amount_g, i.portion_name, i.portion_quantity, i.portion_amount_g
FROM test_recipe_ingredients i
JOIN nutrition.foods f ON f.bls_code = i.bls_code;

CREATE TEMP TABLE test_meal_plans (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  plan_origin text NOT NULL,
  lifecycle_type text NOT NULL,
  start_date date NOT NULL,
  days_count integer NOT NULL,
  target_kcal numeric NOT NULL,
  target_protein_g numeric NOT NULL,
  target_carbs_g numeric NOT NULL,
  target_fat_g numeric NOT NULL,
  is_active boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO test_meal_plans VALUES
${mealPlanValues};

INSERT INTO nutrition.meal_plans (
  id, user_id, name, description, plan_origin, target_kcal, target_protein_g,
  target_carbs_g, target_fat_g, is_active, lifecycle_type, start_date, days_count,
  measurement_source, source_detail
)
SELECT
  id, user_id, name, description, plan_origin, target_kcal, target_protein_g,
  target_carbs_g, target_fat_g, is_active, lifecycle_type, start_date, days_count,
  'seed', 'C-150 Testdaten Wochenplan'
FROM test_meal_plans;

CREATE TEMP TABLE test_meal_plan_slots (
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  position integer NOT NULL,
  name text NOT NULL,
  planned_time time NOT NULL,
  PRIMARY KEY (plan_id, position)
) ON COMMIT DROP;

INSERT INTO test_meal_plan_slots VALUES
${mealPlanSlotValues};

INSERT INTO nutrition.meal_plan_slots (plan_id, user_id, position, name, planned_time)
SELECT plan_id, user_id, position, name, planned_time
FROM test_meal_plan_slots
ON CONFLICT (plan_id, position) DO UPDATE
  SET name = EXCLUDED.name,
      planned_time = EXCLUDED.planned_time;

CREATE TEMP TABLE test_meal_plan_weeks (
  id uuid PRIMARY KEY,
  plan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  name text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_meal_plan_weeks VALUES
${mealPlanWeekValues};

INSERT INTO nutrition.meal_plan_weeks (
  id, plan_id, user_id, week_start, name
)
SELECT id, plan_id, user_id, week_start, name
FROM test_meal_plan_weeks;

CREATE TEMP TABLE test_meal_plan_days (
  id uuid PRIMARY KEY,
  week_id uuid NOT NULL,
  user_id uuid NOT NULL,
  plan_date date NOT NULL,
  day_index smallint NOT NULL,
  notes text
) ON COMMIT DROP;

INSERT INTO test_meal_plan_days VALUES
${mealPlanDayValues};

INSERT INTO nutrition.meal_plan_days (
  id, week_id, user_id, plan_date, day_index, notes
)
SELECT id, week_id, user_id, plan_date, day_index, notes
FROM test_meal_plan_days;

CREATE TEMP TABLE test_meal_plan_entries (
  day_id uuid NOT NULL,
  user_id uuid NOT NULL,
  meal_type text NOT NULL,
  planned_time time NOT NULL,
  slot_order integer NOT NULL,
  entry_type text NOT NULL,
  recipe_id uuid,
  bls_code text,
  amount_g numeric,
  planned_servings numeric,
  portion_name text,
  portion_quantity numeric,
  portion_amount_g numeric,
  note text
) ON COMMIT DROP;

INSERT INTO test_meal_plan_entries VALUES
${mealPlanEntryValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT e.bls_code, ', ' ORDER BY e.bls_code)
    INTO v_missing
  FROM test_meal_plan_entries e
  LEFT JOIN nutrition.foods f ON f.bls_code = e.bls_code
  WHERE e.bls_code IS NOT NULL
    AND f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'C-150 Wochenplan-Testdaten: BLS-Codes fehlen im Bestand: %', v_missing;
  END IF;
END $$;

INSERT INTO nutrition.meal_plan_entries (
  day_id, user_id, meal_type, planned_time, slot_order, entry_type,
  recipe_id, food_id, amount_g, planned_servings,
  portion_name, portion_quantity, portion_amount_g, note
)
SELECT
  e.day_id, e.user_id, e.meal_type, e.planned_time, e.slot_order, e.entry_type,
  e.recipe_id, f.id, e.amount_g, e.planned_servings,
  e.portion_name, e.portion_quantity, e.portion_amount_g, e.note
FROM test_meal_plan_entries e
LEFT JOIN nutrition.foods f ON f.bls_code = e.bls_code;

SELECT nutrition.copy_meal_plan_week(
  ${lit(FILLED_WEEK_ID)}::uuid,
  DATE ${lit(COPIED_WEEK_START)}
);

CREATE TEMP TABLE test_meals (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  meal_type text NOT NULL,
  meal_time time NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_meals VALUES
${mealValues};

INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, meal_time, notes)
SELECT id, user_id, entry_date, meal_type, meal_time, notes
FROM test_meals;

CREATE TEMP TABLE test_water_logs (
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  amount_ml numeric NOT NULL,
  source text NOT NULL,
  logged_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO test_water_logs VALUES
${waterValues};

INSERT INTO nutrition.water_logs (user_id, entry_date, amount_ml, source, logged_at)
SELECT user_id, entry_date, amount_ml, source, logged_at
FROM test_water_logs;

CREATE TEMP TABLE test_items (
  meal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  bls_code text NOT NULL,
  amount_g numeric NOT NULL,
  portion_name text,
  portion_quantity numeric,
  portion_amount_g numeric
) ON COMMIT DROP;

INSERT INTO test_items VALUES
${itemValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT i.bls_code, ', ' ORDER BY i.bls_code)
    INTO v_missing
  FROM test_items i
  LEFT JOIN nutrition.foods f ON f.bls_code = i.bls_code
  WHERE f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Testdaten: BLS-Codes fehlen im Bestand: %', v_missing;
  END IF;
END $$;

WITH frozen AS (
  SELECT
    i.meal_id,
    i.user_id,
    f.id AS food_id,
    snap.food_name,
    i.amount_g,
    i.portion_name,
    i.portion_quantity,
    i.portion_amount_g,
    snap.nutrients,
    snap.enercc,
    snap.prot625,
    snap.fat,
    snap.cho,
    snap.fibt,
    snap.sugar,
    snap.fasat,
    snap.nacl,
    snap.water_g
  FROM test_items i
  JOIN nutrition.foods f ON f.bls_code = i.bls_code
  CROSS JOIN LATERAL nutrition.food_nutrient_snapshot('bls', f.id, NULL, i.amount_g) snap
)
INSERT INTO nutrition.meal_items (
  meal_id, user_id, food_id, food_source, food_name, amount_g,
  portion_name, portion_quantity, portion_amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, nutrients
)
SELECT
  meal_id, user_id, food_id, 'bls', food_name, amount_g,
  portion_name, portion_quantity, portion_amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, nutrients
FROM frozen;

CREATE TEMP TABLE test_training_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  session_date date NOT NULL,
  started_time time NOT NULL,
  ended_time time NOT NULL,
  name text NOT NULL,
  status text NOT NULL,
  location text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_training_sessions VALUES
${trainingSessionValues};

INSERT INTO training.workout_sessions (
  id, user_id, session_date, started_time, ended_time, name, status, location, notes, duration_minutes
)
SELECT id, user_id, session_date, started_time, ended_time, name, status, location, notes, 75
FROM test_training_sessions;

CREATE TEMP TABLE test_training_exercises (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL,
  exercise_name text NOT NULL,
  exercise_order integer NOT NULL,
  planned_sets integer NOT NULL,
  planned_reps text NOT NULL,
  planned_weight_kg numeric
) ON COMMIT DROP;

INSERT INTO test_training_exercises VALUES
${trainingExerciseValues};

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(DISTINCT t.exercise_name, ', ' ORDER BY t.exercise_name)
    INTO v_missing
  FROM test_training_exercises t
  LEFT JOIN training.exercises e ON e.name = t.exercise_name
  WHERE e.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Testdaten: Training-Uebungen fehlen im Bestand: %', v_missing;
  END IF;
END $$;

INSERT INTO training.workout_exercises (
  id, workout_session_id, exercise_id, exercise_order,
  planned_sets, planned_reps, planned_weight_kg
)
SELECT
  t.id,
  t.session_id,
  e.id,
  t.exercise_order,
  t.planned_sets,
  t.planned_reps,
  t.planned_weight_kg
FROM test_training_exercises t
JOIN training.exercises e ON e.name = t.exercise_name;

CREATE TEMP TABLE test_training_sets (
  workout_exercise_id uuid NOT NULL,
  set_number smallint NOT NULL,
  reps integer NOT NULL,
  weight_kg numeric NOT NULL,
  rpe numeric NOT NULL,
  rir smallint NOT NULL,
  set_type text NOT NULL,
  is_pr boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO test_training_sets VALUES
${trainingSetValues};

INSERT INTO training.workout_sets (
  workout_exercise_id, set_number, reps, weight_kg, rpe, rir, set_type, completed_at, is_pr
)
SELECT workout_exercise_id, set_number, reps, weight_kg, rpe, rir, set_type, now(), is_pr
FROM test_training_sets;

CREATE TEMP TABLE test_recovery_checkins (
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  checkin_time time NOT NULL,
  sleep_hours numeric NOT NULL,
  sleep_quality smallint NOT NULL,
  sleep_start_time time,
  sleep_end_time time,
  subjective_feeling smallint NOT NULL,
  mood text NOT NULL,
  energy_level smallint NOT NULL,
  motivation smallint NOT NULL,
  soreness jsonb NOT NULL,
  stress_level smallint NOT NULL,
  work_stress smallint,
  life_stress smallint,
  alcohol_units numeric NOT NULL,
  caffeine_mg integer NOT NULL,
  screen_time_before_bed integer NOT NULL,
  resting_hr integer,
  hrv_rmssd numeric,
  spo2_pct numeric,
  respiratory_rate numeric,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_recovery_checkins VALUES
${recoveryCheckinValues};

INSERT INTO recovery.checkins (
  user_id, entry_date, checkin_time,
  sleep_hours, sleep_quality, sleep_start_time, sleep_end_time,
  subjective_feeling, mood, energy_level, motivation, soreness,
  stress_level, work_stress, life_stress,
  alcohol_units, caffeine_mg, screen_time_before_bed,
  resting_hr, hrv_rmssd, spo2_pct, respiratory_rate, notes
)
SELECT
  user_id, entry_date, checkin_time,
  sleep_hours, sleep_quality, sleep_start_time, sleep_end_time,
  subjective_feeling, mood, energy_level, motivation, soreness,
  stress_level, work_stress, life_stress,
  alcohol_units, caffeine_mg, screen_time_before_bed,
  resting_hr, hrv_rmssd, spo2_pct, respiratory_rate, notes
FROM test_recovery_checkins;

CREATE TEMP TABLE test_recovery_modalities (
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  logged_time time NOT NULL,
  modality_type text NOT NULL,
  duration_min integer NOT NULL,
  detail text NOT NULL,
  immediate_effect smallint NOT NULL,
  next_day_effect smallint NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_recovery_modalities VALUES
${recoveryModalityValues};

INSERT INTO recovery.modality_log (
  user_id, entry_date, logged_time, modality_type, duration_min,
  detail, immediate_effect, next_day_effect, bonus_value, bonus_source,
  notes, measurement_source, source_detail
)
SELECT
  user_id, entry_date, logged_time, modality_type, duration_min,
  detail, immediate_effect, next_day_effect,
  recovery.modality_bonus_value(modality_type), 'pending_c124_e5',
  notes, 'seed', 'C-125 Testdaten Modalitaeten'
FROM test_recovery_modalities;

SELECT recovery.refresh_scores_for_user(id)
FROM (VALUES ${USERS.map(user => `('${user.id}'::uuid)`).join(', ')}) seed_users(id);

-- ── C-236: das Zaehlreihen-Gate ─────────────────────────────────
-- Kein Seed-Wert darf sich als arithmetische Reihe lesen lassen:
-- konstante Differenz (auch 0) ueber MEHR als fuenf Werte in Folge.
-- Genau so sah der G-160-Befund aus (hrv_rmssd 62..230, +4 je
-- Messtag) — und genau hier bricht der Kettenlauf, wenn er
-- zurueckkommt.
--
-- [cmd] Geprueft werden die SEED-Nutzer dieses Laufs — nicht alle:
-- der erste Live-Lauf brach am ALTbestand von dev@lumeos.app, der
-- erst im Folgeschritt (eigenes-konto-fuellen.sql) neu kopiert wird.
-- Die Kopie erbt aus der gepruefte Quelle.
DO $$
DECLARE
  v_fund record;
BEGIN
  FOR v_fund IN
    WITH reihen AS (
      SELECT user_id, 'hrv_rmssd' AS reihe, entry_date::text AS pos, hrv_rmssd::numeric AS wert
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND hrv_rmssd IS NOT NULL
      UNION ALL
      SELECT user_id, 'resting_hr', entry_date::text, resting_hr
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND resting_hr IS NOT NULL
      UNION ALL
      SELECT user_id, 'spo2_pct', entry_date::text, spo2_pct
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND spo2_pct IS NOT NULL
      UNION ALL
      SELECT user_id, 'respiratory_rate', entry_date::text, respiratory_rate
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND respiratory_rate IS NOT NULL
      UNION ALL
      SELECT user_id, 'sleep_hours', entry_date::text, sleep_hours
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND sleep_hours IS NOT NULL
      UNION ALL
      SELECT user_id, 'sleep_quality', entry_date::text, sleep_quality
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND sleep_quality IS NOT NULL
      UNION ALL
      SELECT user_id, 'subjective_feeling', entry_date::text, subjective_feeling
        FROM recovery.checkins WHERE user_id IN (${USERS.map(user => `'${user.id}'::uuid`).join(', ')}) AND subjective_feeling IS NOT NULL
      UNION ALL
      SELECT ws.user_id, 'gewicht:' || we.exercise_name,
             ws.session_date::text || '#' || st.set_number, st.weight_kg
        FROM training.workout_sets st
        JOIN training.workout_exercises we ON we.id = st.workout_exercise_id
        JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
       WHERE st.set_type = 'working'
    ),
    nummeriert AS (
      SELECT user_id, reihe, wert,
             row_number() OVER (PARTITION BY user_id, reihe ORDER BY pos) rn
        FROM reihen
    ),
    differenzen AS (
      SELECT user_id, reihe, rn,
             wert - lag(wert) OVER (PARTITION BY user_id, reihe ORDER BY rn) d
        FROM nummeriert
    ),
    inseln AS (
      SELECT user_id, reihe, d,
             rn - row_number() OVER (PARTITION BY user_id, reihe, d ORDER BY rn) grp
        FROM differenzen WHERE d IS NOT NULL
    )
    SELECT user_id, reihe, d, count(*) + 1 AS werte_in_folge
      FROM inseln
     GROUP BY user_id, reihe, d, grp
    HAVING count(*) >= 5
  LOOP
    RAISE EXCEPTION
      'C-236 Zaehlreihen-Gate: % traegt % Werte in Folge mit konstanter Differenz % (user %)',
      v_fund.reihe, v_fund.werte_in_folge, v_fund.d, v_fund.user_id;
  END LOOP;
END $$;

DO $$
DECLARE
  v_users integer;
  v_meals integer;
  v_items integer;
  v_water integer;
  v_recipes integer;
  v_recipe_ingredients integer;
  v_meal_plans integer;
  v_meal_plan_weeks integer;
  v_meal_plan_entries integer;
  v_training_sessions integer;
  v_training_exercises integer;
  v_training_sets integer;
  v_recovery_checkins integer;
  v_recovery_scores integer;
  v_recovery_modalities integer;
  v_user_goals integer;
  v_goal_phases integer;
  v_body_measurements integer;
  v_body_circumferences integer;
  v_supplement_stacks integer;
  v_supplement_items integer;
  v_supplement_logs integer;
  v_medical_reports integer;
  v_medical_values integer;
  v_medical_medications integer;
  v_medical_conditions integer;
  v_coach_permissions integer;
  v_coach_autonomy integer;
  v_coach_pending integer;
  v_coach_actions integer;
  v_permission_logs integer;
  v_autonomy_logs integer;
  v_sets_with_rir integer;
  v_pr_sets integer;
  v_max_days integer;
BEGIN
  SELECT count(*) INTO v_users FROM auth.users WHERE id IN (${userIds});
  SELECT count(*) INTO v_meals FROM nutrition.meals WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_items FROM nutrition.meal_items WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_water FROM nutrition.water_logs WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_recipes FROM nutrition.recipes WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_recipe_ingredients FROM nutrition.recipe_ingredients WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_meal_plans FROM nutrition.meal_plans WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_meal_plan_weeks FROM nutrition.meal_plan_weeks WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_meal_plan_entries FROM nutrition.meal_plan_entries WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_training_sessions FROM training.workout_sessions WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_training_exercises
  FROM training.workout_exercises we
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${userIds});
  SELECT count(*) INTO v_training_sets
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${userIds});
  SELECT count(*) INTO v_recovery_checkins FROM recovery.checkins WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_recovery_scores FROM recovery.scores WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_recovery_modalities FROM recovery.modality_log WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_user_goals FROM goals.user_goals WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_goal_phases FROM goals.goal_phases WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_body_measurements FROM goals.body_measurements WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_body_circumferences FROM goals.body_circumferences WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_supplement_stacks FROM supplements.user_stacks WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_supplement_items
  FROM supplements.stack_items si
  JOIN supplements.user_stacks us ON us.id = si.stack_id
  WHERE us.user_id IN (${userIds});
  SELECT count(*) INTO v_supplement_logs FROM supplements.intake_logs WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_medical_reports FROM medical.lab_reports WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_medical_values FROM medical.lab_result_values WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_medical_medications FROM medical.user_medications WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_medical_conditions FROM medical.user_conditions WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_coach_permissions FROM coach.client_permissions WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_coach_autonomy FROM coach.client_autonomy WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_coach_pending FROM coach.pending_actions WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_coach_actions FROM coach.action_log WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_permission_logs FROM coach.permission_change_log WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_autonomy_logs FROM coach.autonomy_change_log WHERE coach_id IN (${allSeedUserIds}) OR client_id IN (${allSeedUserIds});
  SELECT count(*) INTO v_sets_with_rir
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${userIds})
    AND ws.rir IS NOT NULL;
  SELECT count(*) INTO v_pr_sets
  FROM training.workout_sets ws
  JOIN training.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN training.workout_sessions s ON s.id = we.workout_session_id
  WHERE s.user_id IN (${userIds})
    AND ws.is_pr;
  SELECT max(tage) INTO v_max_days
  FROM (
    SELECT user_id, count(DISTINCT entry_date)::integer AS tage
    FROM nutrition.meals
    WHERE user_id IN (${userIds})
    GROUP BY user_id
  ) d;

  RAISE NOTICE 'OK: C-82 Testdaten: % Nutzer, % Mahlzeiten, % Positionen, % Wassereintraege, max % Tage',
    v_users, v_meals, v_items, v_water, v_max_days;
  RAISE NOTICE 'OK: C-150 Rezept-/Plan-Testdaten: % Rezepte, % Zutaten, % Plaene, % Wochen, % Planeintraege',
    v_recipes, v_recipe_ingredients, v_meal_plans, v_meal_plan_weeks, v_meal_plan_entries;
  RAISE NOTICE 'OK: C-66 Training-Testdaten: % Sitzungen, % Uebungen, % Saetze',
    v_training_sessions, v_training_exercises, v_training_sets;
  RAISE NOTICE 'OK: C-147 Training-Saetze: % Saetze mit RIR, % PR-Saetze',
    v_sets_with_rir, v_pr_sets;
  RAISE NOTICE 'OK: C-125 Recovery-Testdaten: % Check-ins, % Scores, % Modalitaeten',
    v_recovery_checkins, v_recovery_scores, v_recovery_modalities;
  RAISE NOTICE 'OK: GO-07 Goals-Testdaten: % Ziele, % Phasen',
    v_user_goals, v_goal_phases;
  RAISE NOTICE 'OK: GO-10 Koerpermessungen-Testdaten: % Gewicht/KFA, % Umfaenge',
    v_body_measurements, v_body_circumferences;
  RAISE NOTICE 'OK: C-68 Supplements-Testdaten: % Stacks, % Items, % Einnahmen',
    v_supplement_stacks, v_supplement_items, v_supplement_logs;
  RAISE NOTICE 'OK: C-69 Medical-Testdaten: % Befunde, % Messwerte',
    v_medical_reports, v_medical_values;
  RAISE NOTICE 'OK: C-130 Medical-Testdaten: % Medikamente, % Conditions',
    v_medical_medications, v_medical_conditions;
  RAISE NOTICE 'OK: C-147 Coach-Testdaten: % Permissions, % Autonomy, % Pending, % Actions, %/% Logs',
    v_coach_permissions, v_coach_autonomy, v_coach_pending, v_coach_actions,
    v_permission_logs, v_autonomy_logs;
END $$;

DO $$
DECLARE
  v_relationships integer;
  v_rel_logs integer;
  v_templates integer;
  v_checkins integer;
  v_messages integer;
  v_alerts integer;
  v_coach_profiles integer;
  v_named_invites integer;
  v_historical_empty integer;
  v_historical_named integer;
BEGIN
  SELECT count(*) INTO v_relationships FROM coach.relationships WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_rel_logs FROM coach.relationship_change_log WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_templates FROM coach.checkin_templates WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_checkins FROM coach.checkins WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_messages FROM coach.messages WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_alerts FROM coach.alerts WHERE coach_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_coach_profiles FROM coach.coach_profiles WHERE user_id = ${lit(COACH_USER.id)}::uuid;
  SELECT count(*) INTO v_named_invites
  FROM coach.relationships
  WHERE coach_id = ${lit(COACH_USER.id)}::uuid
    AND status = 'invited'
    AND coach_display_name = ${lit(COACH_USER.displayName)};
  SELECT count(*) INTO v_historical_empty
  FROM coach.relationships
  WHERE coach_id = ${lit(COACH_USER.id)}::uuid
    AND status = 'active'
    AND started_at IS NOT NULL
    AND coach_display_name IS NULL;
  SELECT count(*) INTO v_historical_named
  FROM coach.relationships
  WHERE coach_id = ${lit(COACH_USER.id)}::uuid
    AND status = 'active'
    AND started_at IS NOT NULL
    AND coach_display_name IS NOT NULL;

  IF v_relationships <> 3 THEN
    RAISE EXCEPTION 'F-07: % Beziehungen statt 3', v_relationships;
  END IF;
  IF v_rel_logs < 3 THEN
    RAISE EXCEPTION 'F-07: % Beziehungs-Logzeilen statt >= 3', v_rel_logs;
  END IF;
  IF v_coach_profiles <> 1 OR v_named_invites <> 1
     OR v_historical_empty <> 2 OR v_historical_named <> 0 THEN
    RAISE EXCEPTION 'F-07/C-268/C-440: Coach-Profile %, benannte offene Einladungen %, historische leere/benannte Snapshots %/% statt 1/1/2/0',
      v_coach_profiles, v_named_invites, v_historical_empty, v_historical_named;
  END IF;
  IF v_templates <> 1 OR v_checkins <> 3 OR v_messages <> 3 OR v_alerts <> 3 THEN
    RAISE EXCEPTION 'F-07: Vorlagen %, Check-ins %, Nachrichten %, Alerts % — erwartet 1/3/3/3',
      v_templates, v_checkins, v_messages, v_alerts;
  END IF;

  RAISE NOTICE 'OK: F-07 Coach-Portal-Testdaten: % Beziehungen, % Vorlagen, % Check-ins, % Nachrichten, % Alerts',
    v_relationships, v_templates, v_checkins, v_messages, v_alerts;
END $$;

COMMIT;
`

const result = spawnSync('docker', [
  'exec', '-i', CONTAINER,
  'psql', '-U', 'postgres', '-d', DB,
  '-v', 'ON_ERROR_STOP=1',
  '-f', '-',
], { input: sql, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })

if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log(`C-82 Testdaten eingespielt in Datenbank ${DB}: ${USERS.length} Nutzer plus 1 Coach, ${meals.length} Mahlzeiten, ${items.length} Positionen, ${waterLogs.length} Wassereintraege, ${recipeRows.length} Rezepte, ${recipeIngredientRows.length} Rezeptzutaten, ${mealPlanRows.length} Wochenplan, ${mealPlanWeekRows.length + 1} Planwochen, ${mealPlanEntryRows.length + c150MealPlanEntryRows.length} Planeintraege, ${trainingSessions.length} Trainingssitzungen, ${trainingExercises.length} Trainingsuebungen, ${trainingSets.length} Saetze, ${recoveryCheckins.length} Recovery-Check-ins, ${recoveryModalities.length} Recovery-Modalitaeten, ${goalRows.length} Ziele, ${goalPhaseRows.length} Phasen, ${goalMilestoneRows.length} Meilensteine, ${bodyMeasurements.length} Koerpermessungen, ${bodyCircumferences.length} Umfangsmessungen, ${supplementStacks.length} Supplement-Stacks, ${supplementStackItems.length} Supplement-Items, ${supplementIntakeLogs.length} Supplement-Einnahmen, ${medicalLabReports.length + 1} Medical-Befunde, ${medicalLabValues.length + medicalImportRows.length} Medical-Messwerte, 1 Medical-Medikation, 1 Medical-Condition, 1 Coach-Beziehung.`)
