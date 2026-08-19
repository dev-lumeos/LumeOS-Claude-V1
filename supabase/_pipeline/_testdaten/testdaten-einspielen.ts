#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

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
const TODAY_DATE = argValue('--today') ?? NEXT_START_DATE

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
  setType: 'working' | 'warmup'
}

type RecoveryCheckinRow = {
  userId: string
  entryDate: string
  checkinTime: string
  sleepHours: number
  sleepQuality: number
  subjectiveFeeling: number
  mood: 'motivated' | 'good' | 'neutral' | 'tired' | 'sick'
  energyLevel: number
  motivation: number
  soreness: string
  stressLevel: number
  alcoholUnits: number
  caffeineMg: number
  screenTimeBeforeBed: number
  hrvRmssd: number | null
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
  status: 'active' | 'paused' | 'achieved' | 'abandoned' | 'on_hold'
  priority: number
  isPrimary: boolean
  progressPct: number
  motivationReason: string | null
  difficultyLevel: 'easy' | 'moderate' | 'challenging' | 'aggressive' | 'unrealistic' | null
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
    activityLevel: 'very_active',
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

const DAY_SCALE = [0.88, 1.06, 0.96, 1.12, 0.92, 1.04, 1.0, 1.15, 0.9, 1.08, 0.98, 1.02]
const MEAL_SCALE: Record<string, number[]> = {
  breakfast: [0.9, 1.1, 1.0, 1.05],
  lunch: [1.05, 0.95, 1.12, 0.9],
  snack: [0.8, 1.2, 0.9, 1.1],
  dinner: [1.1, 0.9, 1.05, 0.95],
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
  const dayIndex = daysOffset(START_DATE, date)
  const userOffset = USERS.findIndex(seedUser => seedUser.email === user.email) * 3
  const dayScale = DAY_SCALE[(dayIndex + userOffset) % DAY_SCALE.length]!

  return Object.fromEntries(MEAL_TYPES.map((mealType, mealIndex) => {
    const mealScale = MEAL_SCALE[mealType][(dayIndex + mealIndex + userOffset) % MEAL_SCALE[mealType].length]!
    const templates = plan[mealType].map((template, itemIndex) =>
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
    status: 'open',
    achievedDate: null,
    achievedValue: null,
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
    stockRemaining: 30,
    stockUnit: 'g',
    lowStockThreshold: 30,
    sortOrder: 1,
    notes: 'C-82 Szenario: Refill-Hinweis bei etwa einem Monat Reichweite',
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
      notes: skipped
        ? 'C-82 Szenario: voller Supplement-Tag ausgelassen, gekoppelt an harte Trainings-/Erholungsphase'
        : template.note,
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
    return [250]
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
      trainingSets.push({
        workoutExerciseId: exerciseId,
        setNumber: setIndex + 1,
        reps,
        weightKg: Number(weightKg.toFixed(2)),
        rpe: Number(Math.min(10, set.rpe + ((day.index + setIndex) % 4 === 0 ? 0.5 : 0)).toFixed(1)),
        setType: set.setType ?? 'working',
      })
    })
  })
}

function recoveryCheckinFor(date: string, index: number): RecoveryCheckinRow {
  if (date === relDate('2026-08-18')) {
    return {
      userId: '10000000-0000-0000-0000-000000000101',
      entryDate: date,
      checkinTime: '07:18',
      sleepHours: 4.8,
      sleepQuality: 3,
      subjectiveFeeling: 3,
      mood: 'tired',
      energyLevel: 3,
      motivation: 3,
      soreness: '{"chest":3,"quadriceps":2,"lower_back":2}',
      stressLevel: 8,
      alcoholUnits: 1,
      caffeineMg: 420,
      screenTimeBeforeBed: 95,
      hrvRmssd: null,
      notes: 'C-67 Szenario: schlechte Erholung ohne HRV fuer manual mode',
    }
  }

  const isAfterLegs = [relDate('2026-08-10'), relDate('2026-08-24'), relDate('2026-09-07')].includes(date)
  return {
    userId: '10000000-0000-0000-0000-000000000101',
    entryDate: date,
    checkinTime: '07:12',
    sleepHours: isAfterLegs ? 7.0 : 7.6 + (index % 3) * 0.2,
    sleepQuality: isAfterLegs ? 7 : 8,
    subjectiveFeeling: isAfterLegs ? 7 : 8,
    mood: index % 5 === 0 ? 'motivated' : 'good',
    energyLevel: isAfterLegs ? 7 : 8,
    motivation: index % 5 === 0 ? 9 : 8,
    soreness: isAfterLegs ? '{"quadriceps":2,"glutes":2}' : '{"chest":1,"back":1}',
    stressLevel: index % 6 === 0 ? 5 : 3,
    alcoholUnits: 0,
    caffeineMg: 260 + (index % 3) * 40,
    screenTimeBeforeBed: 25 + (index % 4) * 10,
    hrvRmssd: index % 4 === 0 ? 62 + index : null,
    notes: 'C-67 Testdaten: Recovery Check-in fuer Verlauf und manual mode',
  }
}

ALL_DATES.slice(1, 171).forEach((date, index) => {
  recoveryCheckins.push(recoveryCheckinFor(date, index))
})

const userIds = USERS.map(user => lit(user.id)).join(', ')
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
  set.setType,
])).join(',\n')
const recoveryCheckinValues = recoveryCheckins.map(checkin => tuple([
  checkin.userId,
  checkin.entryDate,
  checkin.checkinTime,
  checkin.sleepHours,
  checkin.sleepQuality,
  checkin.subjectiveFeeling,
  checkin.mood,
  checkin.energyLevel,
  checkin.motivation,
  checkin.soreness,
  checkin.stressLevel,
  checkin.alcoholUnits,
  checkin.caffeineMg,
  checkin.screenTimeBeforeBed,
  checkin.hrvRmssd,
  checkin.notes,
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

const sql = `
BEGIN;

DELETE FROM nutrition.water_logs WHERE user_id IN (${userIds});
DELETE FROM nutrition.meal_items WHERE user_id IN (${userIds});
DELETE FROM nutrition.meals WHERE user_id IN (${userIds});
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
DELETE FROM recovery.checkins WHERE user_id IN (${userIds});
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
DELETE FROM public.profiles WHERE id IN (${userIds});
DELETE FROM auth.users WHERE id IN (${userIds});

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
FROM test_users;

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
  difficulty_level text
) ON COMMIT DROP;

INSERT INTO test_goals VALUES
${goalValues};

INSERT INTO goals.user_goals (
  id, user_id, goal_type, subtype, title, description,
  target_value, target_unit, start_value, current_value,
  gueltig_ab, target_date, status, priority, is_primary,
  progress_pct, motivation_reason, difficulty_level
)
SELECT
  id, user_id, goal_type, subtype, title, description,
  target_value, target_unit, start_value, current_value,
  gueltig_ab, target_date, status, priority, is_primary,
  progress_pct, motivation_reason, difficulty_level
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
  LEFT JOIN supplements.supplement_catalog c ON c.slug = i.supplement_slug
  WHERE c.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Testdaten: Supplement-Slugs fehlen im Katalog: %', v_missing;
  END IF;
END $$;

INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, dose, dose_unit, frequency, timing,
  stock_remaining, stock_unit, low_stock_threshold, sort_order, notes
)
SELECT
  i.id, i.stack_id, c.id, i.dose, i.dose_unit, i.frequency, i.timing,
  i.stock_remaining, i.stock_unit, i.low_stock_threshold, i.sort_order, i.notes
FROM test_supplement_stack_items i
JOIN supplements.supplement_catalog c ON c.slug = i.supplement_slug;

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
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de) AS food_name,
    i.amount_g,
    i.portion_name,
    i.portion_quantity,
    i.portion_amount_g,
    COALESCE(jsonb_object_agg(fn.nutrient_code, round(fn.value * i.amount_g / 100, 5))
      FILTER (WHERE fn.nutrient_code IS NOT NULL), '{}'::jsonb) AS nutrients,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'ENERCC') AS enercc,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'PROT625') AS prot625,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FAT') AS fat,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'CHO') AS cho,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FIBT') AS fibt,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'SUGAR') AS sugar,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'FASAT') AS fasat,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'NACL') AS nacl,
    max(round(fn.value * i.amount_g / 100, 5)) FILTER (WHERE fn.nutrient_code = 'WATER') AS water_g
  FROM test_items i
  JOIN nutrition.foods f ON f.bls_code = i.bls_code
  LEFT JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
  GROUP BY
    i.meal_id, i.user_id, f.id, f.name_display_de, f.name_de,
    i.amount_g, i.portion_name, i.portion_quantity, i.portion_amount_g
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
  set_type text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_training_sets VALUES
${trainingSetValues};

INSERT INTO training.workout_sets (
  workout_exercise_id, set_number, reps, weight_kg, rpe, set_type, completed_at
)
SELECT workout_exercise_id, set_number, reps, weight_kg, rpe, set_type, now()
FROM test_training_sets;

CREATE TEMP TABLE test_recovery_checkins (
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  checkin_time time NOT NULL,
  sleep_hours numeric NOT NULL,
  sleep_quality smallint NOT NULL,
  subjective_feeling smallint NOT NULL,
  mood text NOT NULL,
  energy_level smallint NOT NULL,
  motivation smallint NOT NULL,
  soreness jsonb NOT NULL,
  stress_level smallint NOT NULL,
  alcohol_units numeric NOT NULL,
  caffeine_mg integer NOT NULL,
  screen_time_before_bed integer NOT NULL,
  hrv_rmssd numeric,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_recovery_checkins VALUES
${recoveryCheckinValues};

INSERT INTO recovery.checkins (
  user_id, entry_date, checkin_time,
  sleep_hours, sleep_quality, subjective_feeling, mood,
  energy_level, motivation, soreness, stress_level,
  alcohol_units, caffeine_mg, screen_time_before_bed, hrv_rmssd, notes
)
SELECT
  user_id, entry_date, checkin_time,
  sleep_hours, sleep_quality, subjective_feeling, mood,
  energy_level, motivation, soreness, stress_level,
  alcohol_units, caffeine_mg, screen_time_before_bed, hrv_rmssd, notes
FROM test_recovery_checkins;

DO $$
DECLARE
  v_users integer;
  v_meals integer;
  v_items integer;
  v_water integer;
  v_training_sessions integer;
  v_training_exercises integer;
  v_training_sets integer;
  v_recovery_checkins integer;
  v_user_goals integer;
  v_goal_phases integer;
  v_body_measurements integer;
  v_body_circumferences integer;
  v_supplement_stacks integer;
  v_supplement_items integer;
  v_supplement_logs integer;
  v_medical_reports integer;
  v_medical_values integer;
  v_max_days integer;
BEGIN
  SELECT count(*) INTO v_users FROM auth.users WHERE id IN (${userIds});
  SELECT count(*) INTO v_meals FROM nutrition.meals WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_items FROM nutrition.meal_items WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_water FROM nutrition.water_logs WHERE user_id IN (${userIds});
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
  SELECT max(tage) INTO v_max_days
  FROM (
    SELECT user_id, count(DISTINCT entry_date)::integer AS tage
    FROM nutrition.meals
    WHERE user_id IN (${userIds})
    GROUP BY user_id
  ) d;

  RAISE NOTICE 'OK: C-82 Testdaten: % Nutzer, % Mahlzeiten, % Positionen, % Wassereintraege, max % Tage',
    v_users, v_meals, v_items, v_water, v_max_days;
  RAISE NOTICE 'OK: C-66 Training-Testdaten: % Sitzungen, % Uebungen, % Saetze',
    v_training_sessions, v_training_exercises, v_training_sets;
  RAISE NOTICE 'OK: C-67 Recovery-Testdaten: % Check-ins',
    v_recovery_checkins;
  RAISE NOTICE 'OK: GO-07 Goals-Testdaten: % Ziele, % Phasen',
    v_user_goals, v_goal_phases;
  RAISE NOTICE 'OK: GO-10 Koerpermessungen-Testdaten: % Gewicht/KFA, % Umfaenge',
    v_body_measurements, v_body_circumferences;
  RAISE NOTICE 'OK: C-68 Supplements-Testdaten: % Stacks, % Items, % Einnahmen',
    v_supplement_stacks, v_supplement_items, v_supplement_logs;
  RAISE NOTICE 'OK: C-69 Medical-Testdaten: % Befunde, % Messwerte',
    v_medical_reports, v_medical_values;
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

console.log(`C-82 Testdaten eingespielt in Datenbank ${DB}: ${USERS.length} Nutzer, ${meals.length} Mahlzeiten, ${items.length} Positionen, ${waterLogs.length} Wassereintraege, ${trainingSessions.length} Trainingssitzungen, ${trainingExercises.length} Trainingsuebungen, ${trainingSets.length} Saetze, ${recoveryCheckins.length} Recovery-Check-ins, ${goalRows.length} Ziele, ${goalPhaseRows.length} Phasen, ${goalMilestoneRows.length} Meilensteine, ${bodyMeasurements.length} Koerpermessungen, ${bodyCircumferences.length} Umfangsmessungen, ${supplementStacks.length} Supplement-Stacks, ${supplementStackItems.length} Supplement-Items, ${supplementIntakeLogs.length} Supplement-Einnahmen, ${medicalLabReports.length + 1} Medical-Befunde, ${medicalLabValues.length + medicalImportRows.length} Medical-Messwerte.`)
