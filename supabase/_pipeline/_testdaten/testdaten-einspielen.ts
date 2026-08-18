#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const START_DATE = '2026-08-02'
const TARGET_START_DATE = '2026-08-03'
const END_DATE = '2026-09-13'

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
    '2026-08-05': {
      breakfast: [
        { blsCode: 'Y273032', amountG: 20 },
        { blsCode: 'C352000', amountG: 75, portionName: '1 Portion roh', portionQuantity: 1, portionAmountG: 75 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-07': {
      breakfast: [
        { blsCode: 'C352000', amountG: 250 },
        { blsCode: 'F503100', amountG: 120 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-11': {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-13': {
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
  },
  'max.seed@example.com': {
    '2026-08-04': {
      breakfast: [
        { blsCode: 'R111000', amountG: 6 },
        { blsCode: 'B101000', amountG: 60, portionName: '1 Scheibe', portionQuantity: 2, portionAmountG: 30 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-06': {
      breakfast: [
        { blsCode: 'R466000', amountG: 50 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-08': 'skip-day',
    '2026-08-09': {
      breakfast: [
        { blsCode: 'C352000', amountG: 300 },
        { blsCode: 'S111000', amountG: 200 },
        { blsCode: 'Q120000', amountG: 50 },
      ],
      lunch: [],
      snack: [],
      dinner: [],
    },
    '2026-08-10': {
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
  },
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
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(3)
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
    gueltigAb: '2026-08-03',
    targetDate: '2026-09-30',
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
    gueltigAb: '2026-08-10',
    targetDate: '2026-10-31',
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
    gueltigAb: '2026-08-03',
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
    gueltigAb: '2026-08-03',
    projectedEndDate: '2026-08-16',
    actualEndDate: '2026-08-16',
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
    gueltigAb: '2026-08-17',
    projectedEndDate: '2026-09-30',
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
    gueltigAb: '2026-08-05',
    projectedEndDate: null,
    actualEndDate: null,
    transitionedFrom: null,
    recommendedNext: null,
    transitionReason: 'Performance hat kein eigenes Phasenmapping',
  },
]

const bodyMeasurements: BodyMeasurementRow[] = daysBetween(START_DATE, END_DATE).map((date, index, allDates) => {
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

const bodyCircumferences: BodyCircumferenceRow[] = [
  { date: '2026-08-02', neck: 41.2, shoulders: 123.0, chest: 107.0, armL: 38.4, armR: 38.9, forearmL: 31.6, forearmR: 31.9, waist: 84.0, hip: 97.0, thighL: 59.5, thighR: 60.0, calfL: 38.7, calfR: 39.2 },
  { date: '2026-08-09', neck: 41.1, shoulders: 123.3, chest: 107.3, armL: 38.5, armR: 39.0, forearmL: 31.7, forearmR: 32.0, waist: 83.8, hip: 96.8, thighL: 59.6, thighR: 60.1, calfL: 38.8, calfR: 39.3 },
  { date: '2026-08-16', neck: 41.1, shoulders: 123.7, chest: 107.6, armL: 38.6, armR: 39.1, forearmL: 31.8, forearmR: 32.0, waist: 83.4, hip: 96.6, thighL: 59.7, thighR: 60.2, calfL: 38.8, calfR: 39.3 },
  { date: '2026-08-23', neck: 41.0, shoulders: 124.0, chest: 107.8, armL: 38.7, armR: 39.2, forearmL: 31.8, forearmR: 32.1, waist: 83.0, hip: 96.4, thighL: 59.8, thighR: 60.3, calfL: 38.9, calfR: 39.4 },
  { date: '2026-08-30', neck: 41.0, shoulders: 124.2, chest: 108.0, armL: 38.8, armR: 39.3, forearmL: 31.9, forearmR: 32.1, waist: 82.7, hip: 96.3, thighL: 59.9, thighR: 60.4, calfL: 38.9, calfR: 39.4 },
  { date: '2026-09-06', neck: 41.0, shoulders: 124.4, chest: 108.2, armL: 38.9, armR: 39.4, forearmL: 32.0, forearmR: 32.2, waist: 82.4, hip: 96.1, thighL: 60.0, thighR: 60.5, calfL: 39.0, calfR: 39.5 },
  { date: '2026-09-13', neck: 40.9, shoulders: 124.5, chest: 108.4, armL: 39.0, armR: 39.5, forearmL: 32.0, forearmR: 32.2, waist: 82.0, hip: 96.0, thighL: 60.0, thighR: 60.5, calfL: 39.0, calfR: 39.5 },
].map(row => ({
  userId: '10000000-0000-0000-0000-000000000101',
  measurementDate: row.date,
  measurementTime: '07:10',
  neckCm: row.neck,
  shouldersCm: row.shoulders,
  chestCm: row.chest,
  upperArmLeftCm: row.armL,
  upperArmRightCm: row.armR,
  forearmLeftCm: row.forearmL,
  forearmRightCm: row.forearmR,
  waistCm: row.waist,
  hipCm: row.hip,
  thighLeftCm: row.thighL,
  thighRightCm: row.thighR,
  calfLeftCm: row.calfL,
  calfRightCm: row.calfR,
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
    stockRemaining: 180,
    stockUnit: 'g',
    lowStockThreshold: 50,
    sortOrder: 1,
    notes: 'Baseline-Supplement',
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
    stockRemaining: 30,
    stockUnit: 'softgels',
    lowStockThreshold: 10,
    sortOrder: 3,
    notes: 'Mit Mahlzeit',
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
  {
    userId: '10000000-0000-0000-0000-000000000101',
    stackItemId: '41000000-0000-0000-0000-000000000101',
    intakeDate: '2026-08-18',
    intakeTime: '08:10',
    status: 'taken',
    supplementNameSnapshot: 'Creatine Monohydrate',
    doseSnapshot: 5,
    doseUnitSnapshot: 'g',
    actualDose: 5,
    actualDoseUnit: 'g',
    notes: 'C-68 Testdaten: eingenommen, Snapshot bleibt auch bei Stack-Aenderung',
  },
  {
    userId: '10000000-0000-0000-0000-000000000101',
    stackItemId: '41000000-0000-0000-0000-000000000102',
    intakeDate: '2026-08-18',
    intakeTime: '08:12',
    status: 'taken',
    supplementNameSnapshot: 'Vitamin D3',
    doseSnapshot: 5000,
    doseUnitSnapshot: 'IU',
    actualDose: 5000,
    actualDoseUnit: 'IU',
    notes: 'C-68 Testdaten: Low-Stock-Item wurde genommen',
  },
  {
    userId: '10000000-0000-0000-0000-000000000101',
    stackItemId: '41000000-0000-0000-0000-000000000103',
    intakeDate: '2026-08-18',
    intakeTime: '12:45',
    status: 'taken',
    supplementNameSnapshot: 'Omega-3 (EPA/DHA)',
    doseSnapshot: 2,
    doseUnitSnapshot: 'g',
    actualDose: 2,
    actualDoseUnit: 'g',
    notes: 'C-68 Testdaten: Einnahme mit Mahlzeit',
  },
  {
    userId: '10000000-0000-0000-0000-000000000101',
    stackItemId: '41000000-0000-0000-0000-000000000104',
    intakeDate: '2026-08-18',
    intakeTime: '21:30',
    status: 'planned',
    supplementNameSnapshot: 'Magnesium',
    doseSnapshot: 400,
    doseUnitSnapshot: 'mg',
    actualDose: null,
    actualDoseUnit: null,
    notes: 'C-68 Testdaten: geplante Abend-Einnahme',
  },
]

const medicalLabReports: MedicalLabReportRow[] = [
  {
    id: '50000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    reportDate: '2026-08-18',
    reportTime: '09:20',
    labName: 'LumeOS Testlabor',
    title: 'C-69 Beispielbefund',
    source: 'seed',
    notes: 'C-69 Testdaten: ein Laborbefund mit Laborbereich und Katalog-Fallback',
  },
]

const medicalLabValues: MedicalLabValueRow[] = [
  {
    reportId: '50000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    loincCode: '718-7',
    markerNameSnapshot: 'Hemoglobin',
    unitSnapshot: 'g/dL',
    valueNumeric: 15.2,
    valueText: null,
    valueOperator: '=',
    labReferenceLow: 13.8,
    labReferenceHigh: 17.2,
    labReferenceText: null,
    labReferenceUnit: 'g/dL',
    labReferenceSource: 'LumeOS Testlabor Befunddruck',
    source: 'seed',
    notes: 'Labor-eigener Bereich gewinnt vor Katalog-Fallback',
  },
  {
    reportId: '50000000-0000-0000-0000-000000000101',
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
    notes: 'Kein Laborbereich im Befund; Lesefunktion nutzt Katalog-Fallback',
  },
  {
    reportId: '50000000-0000-0000-0000-000000000101',
    userId: '10000000-0000-0000-0000-000000000101',
    loincCode: '2345-7',
    markerNameSnapshot: 'Glucose',
    unitSnapshot: 'mg/dL',
    valueNumeric: 102,
    valueText: null,
    valueOperator: '=',
    labReferenceLow: 70,
    labReferenceHigh: 99,
    labReferenceText: null,
    labReferenceUnit: 'mg/dL',
    labReferenceSource: 'LumeOS Testlabor Befunddruck',
    source: 'seed',
    notes: 'Wert ausserhalb des labor-eigenen Bereichs fuer spaetere Anzeigepruefung',
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
  for (const date of daysBetween(START_DATE, END_DATE)) {
    const specialPlan = SPECIAL_DAY_PLANS[user.email]?.[date] ?? null
    if (specialPlan === 'skip-day') continue
    const dayPlan = specialPlan ?? plan

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

const secondSnackId = uuidFrom('tom.seed@example.com:2026-08-14:snack:zweiter-snack')
meals.push({
  id: secondSnackId,
  userId: '10000000-0000-0000-0000-000000000101',
  entryDate: '2026-08-14',
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
  if (user.email === 'tom.seed@example.com' && date === '2026-08-16') {
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
  for (const date of daysBetween(START_DATE, END_DATE)) {
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

const TRAINING_DAYS = [
  { date: '2026-08-03', key: 'push', name: 'Push A' },
  { date: '2026-08-06', key: 'pull', name: 'Pull A' },
  { date: '2026-08-09', key: 'legs', name: 'Legs A' },
  { date: '2026-08-17', key: 'push', name: 'Push A' },
  { date: '2026-08-20', key: 'pull', name: 'Pull A' },
  { date: '2026-08-23', key: 'legs', name: 'Legs A' },
  { date: '2026-08-31', key: 'push', name: 'Push A' },
  { date: '2026-09-03', key: 'pull', name: 'Pull A' },
  { date: '2026-09-06', key: 'legs', name: 'Legs A' },
] as const

for (const day of TRAINING_DAYS) {
  const sessionId = uuidFrom(`tom.seed@example.com:training:${day.date}:${day.key}`)
  trainingSessions.push({
    id: sessionId,
    userId: '10000000-0000-0000-0000-000000000101',
    sessionDate: day.date,
    startedTime: '17:30',
    endedTime: '18:45',
    name: day.name,
    location: 'Gym',
    notes: 'C-66 Testdaten: mehrere Wochen Training mit echten Uebungen und Saetzen',
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
    template.sets.forEach((set, setIndex) => {
      trainingSets.push({
        workoutExerciseId: exerciseId,
        setNumber: setIndex + 1,
        reps: set.reps,
        weightKg: set.weightKg,
        rpe: set.rpe,
        setType: set.setType ?? 'working',
      })
    })
  })
}

function recoveryCheckinFor(date: string, index: number): RecoveryCheckinRow {
  if (date === '2026-08-18') {
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

  const isAfterLegs = ['2026-08-10', '2026-08-24', '2026-09-07'].includes(date)
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

daysBetween('2026-08-03', '2026-09-07').forEach((date, index) => {
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
  user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee, nutrition_goal, notiz
)
SELECT id, DATE '${TARGET_START_DATE}', kcal, protein_g, carbs_g, fat_g,
       'formel', tdee, nutrition_goal,
       'C-82 Testdaten aus Vorgängerrepo-Zuschnitt'
FROM test_users
ON CONFLICT (user_id, gueltig_ab) DO UPDATE SET
  kcal = EXCLUDED.kcal,
  protein_g = EXCLUDED.protein_g,
  carbs_g = EXCLUDED.carbs_g,
  fat_g = EXCLUDED.fat_g,
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
  DATE '2026-08-19',
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
  location text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_training_sessions VALUES
${trainingSessionValues};

INSERT INTO training.workout_sessions (
  id, user_id, session_date, started_time, ended_time, name, status, location, notes, duration_minutes
)
SELECT id, user_id, session_date, started_time, ended_time, name, 'completed', location, notes, 75
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

console.log(`C-82 Testdaten eingespielt in Datenbank ${DB}: ${USERS.length} Nutzer, ${meals.length} Mahlzeiten, ${items.length} Positionen, ${waterLogs.length} Wassereintraege, ${trainingSessions.length} Trainingssitzungen, ${trainingExercises.length} Trainingsuebungen, ${trainingSets.length} Saetze, ${recoveryCheckins.length} Recovery-Check-ins, ${goalRows.length} Ziele, ${goalPhaseRows.length} Phasen, ${bodyMeasurements.length} Koerpermessungen, ${bodyCircumferences.length} Umfangsmessungen, ${supplementStacks.length} Supplement-Stacks, ${supplementStackItems.length} Supplement-Items, ${supplementIntakeLogs.length} Supplement-Einnahmen, ${medicalLabReports.length + 1} Medical-Befunde, ${medicalLabValues.length + medicalImportRows.length} Medical-Messwerte.`)
