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

function lit(value: string | number | null): string {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(3)
  return `'${value.replace(/'/g, "''")}'`
}

function tuple(values: Array<string | number | null>): string {
  return `(${values.map(lit).join(', ')})`
}

const meals: MealRow[] = []
const items: ItemRow[] = []
const waterLogs: WaterLogRow[] = []
const trainingSessions: TrainingSessionRow[] = []
const trainingExercises: TrainingExerciseRow[] = []
const trainingSets: TrainingSetRow[] = []
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
DELETE FROM nutrition.food_preference_items WHERE user_id IN (${userIds});
DELETE FROM nutrition.food_preferences WHERE user_id IN (${userIds});
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

DO $$
DECLARE
  v_users integer;
  v_meals integer;
  v_items integer;
  v_water integer;
  v_training_sessions integer;
  v_training_exercises integer;
  v_training_sets integer;
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

console.log(`C-82 Testdaten eingespielt in Datenbank ${DB}: ${USERS.length} Nutzer, ${meals.length} Mahlzeiten, ${items.length} Positionen, ${waterLogs.length} Wassereintraege, ${trainingSessions.length} Trainingssitzungen, ${trainingExercises.length} Trainingsuebungen, ${trainingSets.length} Saetze.`)
