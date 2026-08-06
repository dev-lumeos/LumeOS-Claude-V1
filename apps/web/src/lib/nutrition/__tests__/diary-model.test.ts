import assert from 'node:assert/strict'
import test from 'node:test'

import {
  NUTRIENT_REFERENCE_GRAMS,
  QUICK_MACRO_COLUMNS,
  buildMealInsert,
  buildMealItemAmountUpdate,
  buildMealItemInsert,
  computeFrozenNutrients,
  httpStatusForDiaryError,
  mealCreateSchema,
  mealItemCreateSchema,
  mealItemUpdateSchema,
  parseStoredMealItems,
  parseStoredMeals,
  portionFactor,
  sumMealItemMacros,
} from '../diary-model'

const FOOD_ID = '11111111-1111-1111-1111-111111111111'
const MEAL_ID = '22222222-2222-2222-2222-222222222222'
const ITEM_ID = '33333333-3333-3333-3333-333333333333'

// Testlebensmittel je 100 g: CHO 80, FAT 10, PROT625 5, ENERCC 400.
// Dieselben Zahlen wie im Wegwerf-DB-Nachweis zu 052.
const ROWS = [
  { nutrient_code: 'CHO', value: 80 },
  { nutrient_code: 'FAT', value: 10 },
  { nutrient_code: 'PROT625', value: 5 },
  { nutrient_code: 'ENERCC', value: 400 },
]

test('reference base is 100 g — the rule every diary calculation rests on', () => {
  assert.equal(NUTRIENT_REFERENCE_GRAMS, 100)
  assert.equal(portionFactor(150), 1.5)
  assert.equal(portionFactor(100), 1)
  assert.equal(portionFactor(50), 0.5)
})

test('freezing scales every nutrient by amount / 100', () => {
  const frozen = computeFrozenNutrients(ROWS, 150)
  assert.equal(frozen.nutrients.CHO, 120)
  assert.equal(frozen.nutrients.FAT, 15)
  assert.equal(frozen.nutrients.PROT625, 7.5)
  assert.equal(frozen.nutrients.ENERCC, 600)
  assert.equal(frozen.macros.cho, 120)
  assert.equal(frozen.macros.fat, 15)
  assert.equal(frozen.macros.prot625, 7.5)
  assert.equal(frozen.macros.enercc, 600)
})

test('a missing nutrient stays absent instead of becoming zero', () => {
  const frozen = computeFrozenNutrients(ROWS, 100)
  // FIBT wurde nie gemessen — kein Schluessel, Spalte null.
  assert.equal('FIBT' in frozen.nutrients, false)
  assert.equal(frozen.macros.fibt, null)
  assert.equal(frozen.macros.sugar, null)
  // Ein gemessener Nullwert bleibt dagegen 0.
  const withZero = computeFrozenNutrients([{ nutrient_code: 'FIBT', value: 0 }], 100)
  assert.equal(withZero.nutrients.FIBT, 0)
  assert.equal(withZero.macros.fibt, 0)
})

test('freezing rounds to the numeric(12,5) precision of food_nutrients', () => {
  const frozen = computeFrozenNutrients([{ nutrient_code: 'CHO', value: 0.1 }], 30)
  // 0.1 * 0.3 = 0.030000000000000002 in Gleitkomma — gerundet 0.03.
  assert.equal(frozen.nutrients.CHO, 0.03)
})

test('freezing ignores malformed nutrient rows', () => {
  const frozen = computeFrozenNutrients(
    [
      { nutrient_code: 'CHO', value: 80 },
      { nutrient_code: 'BAD', value: Number.NaN },
      { nutrient_code: '', value: 1 },
    ] as never,
    100,
  )
  assert.equal(frozen.nutrients.CHO, 80)
  assert.equal('BAD' in frozen.nutrients, false)
})

test('quick macro columns map to codes that exist in nutrient_defs', () => {
  // [cmd] 2026-08-06 gegen die laufende Instanz geprueft: alle neun Codes
  // liegen in nutrition.nutrient_defs.
  assert.deepEqual(Object.values(QUICK_MACRO_COLUMNS), [
    'ENERCC',
    'PROT625',
    'FAT',
    'CHO',
    'FIBT',
    'SUGAR',
    'FASAT',
    'NACL',
    'WATER',
  ])
})

test('meal schema accepts only ISO dates and known meal types', () => {
  assert.equal(mealCreateSchema.safeParse({ entry_date: '2026-08-06', meal_type: 'breakfast' }).success, true)
  assert.equal(mealCreateSchema.safeParse({ entry_date: '06.08.2026', meal_type: 'breakfast' }).success, false)
  assert.equal(mealCreateSchema.safeParse({ entry_date: '2026-08-06', meal_type: 'brunch' }).success, false)
})

test('meal item schema rejects non-positive and non-finite amounts', () => {
  assert.equal(mealItemCreateSchema.safeParse({ meal_id: MEAL_ID, food_id: FOOD_ID, amount_g: 150 }).success, true)
  assert.equal(mealItemCreateSchema.safeParse({ meal_id: MEAL_ID, food_id: FOOD_ID, amount_g: 0 }).success, false)
  assert.equal(mealItemCreateSchema.safeParse({ meal_id: MEAL_ID, food_id: FOOD_ID, amount_g: -5 }).success, false)
  assert.equal(
    mealItemCreateSchema.safeParse({ meal_id: MEAL_ID, food_id: FOOD_ID, amount_g: Number.POSITIVE_INFINITY })
      .success,
    false,
  )
  assert.equal(mealItemUpdateSchema.safeParse({ id: ITEM_ID, amount_g: 200 }).success, true)
  assert.equal(mealItemUpdateSchema.safeParse({ id: 'nope', amount_g: 200 }).success, false)
})

test('meal insert payload carries the user id and normalizes notes', () => {
  assert.deepEqual(buildMealInsert('user-1', { entry_date: '2026-08-06', meal_type: 'lunch' }), {
    user_id: 'user-1',
    entry_date: '2026-08-06',
    meal_type: 'lunch',
    notes: null,
  })
})

test('meal item insert freezes the macros and leaves frozen_at to the database', () => {
  const frozen = computeFrozenNutrients(ROWS, 150)
  const row = buildMealItemInsert('user-1', { meal_id: MEAL_ID, food_id: FOOD_ID, amount_g: 150 }, 'Testfood', frozen)
  assert.equal(row.user_id, 'user-1')
  assert.equal(row.food_source, 'bls')
  assert.equal(row.food_name, 'Testfood')
  assert.equal(row.amount_g, 150)
  assert.equal(row.cho, 120)
  assert.equal(row.enercc, 600)
  assert.deepEqual(row.nutrients, { CHO: 120, FAT: 15, PROT625: 7.5, ENERCC: 600 })
  // frozen_at kommt aus dem DEFAULT der Datenbank, nicht vom Client.
  assert.equal('frozen_at' in row, false)
})

test('amount update refreezes the values and stamps frozen_at', () => {
  const frozen = computeFrozenNutrients(ROWS, 50)
  const patch = buildMealItemAmountUpdate(50, frozen)
  assert.equal(patch.amount_g, 50)
  assert.equal(patch.cho, 40)
  assert.equal(patch.enercc, 200)
  assert.equal(typeof patch.frozen_at, 'string')
})

test('stored row parsers drop malformed rows instead of failing', () => {
  const meals = parseStoredMeals([
    { id: MEAL_ID, entry_date: '2026-08-06', meal_type: 'dinner', notes: null },
    { id: MEAL_ID, entry_date: '2026-08-06', meal_type: 'brunch' },
    null,
    'nope',
  ])
  assert.equal(meals.length, 1)
  assert.equal(meals[0].meal_type, 'dinner')

  const items = parseStoredMealItems([
    { id: ITEM_ID, meal_id: MEAL_ID, food_id: FOOD_ID, food_name: 'A', amount_g: '150.00', cho: '120.0000' },
    { id: ITEM_ID, meal_id: MEAL_ID, food_name: 'B' },
  ])
  assert.equal(items.length, 1)
  // PostgREST liefert numeric als String — muss als Zahl ankommen.
  assert.equal(items[0].amount_g, 150)
  assert.equal(items[0].cho, 120)
  assert.equal(items[0].fat, null)
})

test('meal totals keep missing values honest instead of counting them as zero', () => {
  const items = parseStoredMealItems([
    { id: ITEM_ID, meal_id: MEAL_ID, food_id: FOOD_ID, food_name: 'A', amount_g: 100, cho: 80, enercc: 400 },
    { id: ITEM_ID, meal_id: MEAL_ID, food_id: FOOD_ID, food_name: 'B', amount_g: 100, cho: 20, enercc: null },
  ])
  const totals = sumMealItemMacros(items)
  assert.equal(totals.cho, 100)
  assert.equal(totals.enercc, 400)
  // enercc fehlte bei einer Position — die Summe ist als unvollstaendig markiert.
  assert.ok(totals.incompleteFields.includes('enercc'))
  assert.equal(totals.incompleteFields.includes('cho'), false)
  // Keine einzige Zeile mit Wert -> null, nicht 0.
  assert.equal(sumMealItemMacros([]).cho, null)
})

test('error codes map to stable http status values', () => {
  assert.equal(httpStatusForDiaryError('NO_SESSION'), 401)
  assert.equal(httpStatusForDiaryError('VALIDATION_FAILED'), 400)
  assert.equal(httpStatusForDiaryError('UNKNOWN_FOOD'), 400)
  assert.equal(httpStatusForDiaryError('DUPLICATE_MEAL'), 409)
  assert.equal(httpStatusForDiaryError('NOT_FOUND'), 404)
  assert.equal(httpStatusForDiaryError('DB_UNAVAILABLE'), 503)
  assert.equal(httpStatusForDiaryError('WRITE_FAILED'), 500)
})
