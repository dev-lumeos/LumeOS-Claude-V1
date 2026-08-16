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
  notes: string
}

type WaterLogRow = {
  userId: string
  entryDate: string
  amountMl: number
  source: 'manual' | 'quick_add'
  loggedAt: string
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
        notes: `C-82 Testdaten aus dem Vorgaengerrepo: ${user.displayName}`,
      })
      for (const template of dayPlan[mealType]) {
        items.push({ ...template, mealId, userId: user.id })
      }
    }
  }
}

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
  meal.notes,
])).join(',\n')
const waterValues = waterLogs.map(log => tuple([
  log.userId,
  log.entryDate,
  log.amountMl,
  log.source,
  log.loggedAt,
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

CREATE TEMP TABLE test_meals (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  meal_type text NOT NULL,
  notes text NOT NULL
) ON COMMIT DROP;

INSERT INTO test_meals VALUES
${mealValues};

INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, notes)
SELECT id, user_id, entry_date, meal_type, notes
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

DO $$
DECLARE
  v_users integer;
  v_meals integer;
  v_items integer;
  v_water integer;
  v_max_days integer;
BEGIN
  SELECT count(*) INTO v_users FROM auth.users WHERE id IN (${userIds});
  SELECT count(*) INTO v_meals FROM nutrition.meals WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_items FROM nutrition.meal_items WHERE user_id IN (${userIds});
  SELECT count(*) INTO v_water FROM nutrition.water_logs WHERE user_id IN (${userIds});
  SELECT max(tage) INTO v_max_days
  FROM (
    SELECT user_id, count(DISTINCT entry_date)::integer AS tage
    FROM nutrition.meals
    WHERE user_id IN (${userIds})
    GROUP BY user_id
  ) d;

  RAISE NOTICE 'OK: C-82 Testdaten: % Nutzer, % Mahlzeiten, % Positionen, % Wassereintraege, max % Tage',
    v_users, v_meals, v_items, v_water, v_max_days;
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

console.log(`C-82 Testdaten eingespielt in Datenbank ${DB}: ${USERS.length} Nutzer, ${meals.length} Mahlzeiten, ${items.length} Positionen, ${waterLogs.length} Wassereintraege.`)
