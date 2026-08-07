import assert from 'node:assert/strict'
import test from 'node:test'

import {
  GRAMS_TO_ML,
  WATER_QUICK_AMOUNTS_ML,
  WATER_UNIT,
  buildWaterLogInsert,
  emptyHydrationSummary,
  hydrationPercent,
  parseHydrationSummaries,
  parseStoredWaterLogs,
  waterLogCreateSchema,
  waterLogUpdateSchema,
} from '../water-model'

const LOG_ID = '11111111-1111-1111-1111-111111111111'

test('the unit is millilitres, fixed — no per-row unit column', () => {
  assert.equal(WATER_UNIT, 'ml')
  // 1 g Wasser = 1 ml. Steht als Konstante, damit die physikalische
  // Annahme sichtbar ist statt stillschweigend.
  assert.equal(GRAMS_TO_ML, 1)
})

test('quick add amounts match SPEC_04 feature 8', () => {
  assert.deepEqual([...WATER_QUICK_AMOUNTS_ML], [250, 500, 750, 1000])
})

test('create schema rejects non-positive, non-finite and unknown sources', () => {
  assert.equal(waterLogCreateSchema.safeParse({ entry_date: '2026-08-06', amount_ml: 250 }).success, true)
  assert.equal(waterLogCreateSchema.safeParse({ entry_date: '2026-08-06', amount_ml: 0 }).success, false)
  assert.equal(waterLogCreateSchema.safeParse({ entry_date: '2026-08-06', amount_ml: -250 }).success, false)
  assert.equal(
    waterLogCreateSchema.safeParse({ entry_date: '2026-08-06', amount_ml: Number.POSITIVE_INFINITY }).success,
    false,
  )
  assert.equal(waterLogCreateSchema.safeParse({ entry_date: '06.08.2026', amount_ml: 250 }).success, false)
  assert.equal(
    waterLogCreateSchema.safeParse({ entry_date: '2026-08-06', amount_ml: 250, source: 'guess' }).success,
    false,
  )
  assert.equal(waterLogUpdateSchema.safeParse({ id: LOG_ID, amount_ml: 300 }).success, true)
  assert.equal(waterLogUpdateSchema.safeParse({ id: 'nope', amount_ml: 300 }).success, false)
})

test('source defaults to manual when not given', () => {
  const parsed = waterLogCreateSchema.parse({ entry_date: '2026-08-06', amount_ml: 250 })
  assert.equal(parsed.source, 'manual')
})

test('insert payload carries the user id and nothing invented', () => {
  const row = buildWaterLogInsert('user-1', { entry_date: '2026-08-06', amount_ml: 250, source: 'quick_add' })
  assert.deepEqual(row, {
    user_id: 'user-1',
    entry_date: '2026-08-06',
    amount_ml: 250,
    source: 'quick_add',
  })
  // logged_at kommt aus dem DEFAULT der Datenbank, nicht vom Client —
  // ein clientseitiger Zeitstempel haengt an der Uhr des Aufrufers.
  assert.equal('logged_at' in row, false)
})

test('numeric strings from PostgREST arrive as numbers', () => {
  const logs = parseStoredWaterLogs([
    { id: LOG_ID, entry_date: '2026-08-06', amount_ml: '250.00', source: 'quick_add', logged_at: '2026-08-06T12:00:00Z' },
  ])
  assert.equal(logs.length, 1)
  assert.equal(logs[0].amount_ml, 250)
})

test('malformed log rows drop out instead of failing the whole read', () => {
  const logs = parseStoredWaterLogs([
    { id: LOG_ID, entry_date: '2026-08-06', amount_ml: 250, source: 'manual' },
    { id: LOG_ID, entry_date: '2026-08-06', amount_ml: 250, source: 'sneaky' },
    { id: LOG_ID, entry_date: '2026-08-06', source: 'manual' },
    null,
  ])
  assert.equal(logs.length, 1)
  assert.equal(parseStoredWaterLogs(null).length, 0)
})

test('hydration adds both sources and reports completeness', () => {
  const [row] = parseHydrationSummaries([
    {
      entry_date: '2026-08-06',
      logged_ml: '1050.00',
      log_count: '3',
      food_ml: '180.0000',
      food_ml_missing: '0',
      total_ml: '1230.0000',
      total_complete: true,
    },
  ])
  assert.equal(row.loggedMl, 1050)
  assert.equal(row.foodMl, 180)
  assert.equal(row.totalMl, 1230)
  assert.equal(row.logCount, 3)
  assert.equal(row.complete, true)
})

test('a missing food water value makes the total a lower bound, not a truth', () => {
  const [row] = parseHydrationSummaries([
    {
      entry_date: '2026-08-06',
      logged_ml: '1050.00',
      log_count: '3',
      food_ml: '180.0000',
      food_ml_missing: '1',
      total_ml: '1230.0000',
      total_complete: false,
    },
  ])
  assert.equal(row.foodMissing, 1)
  assert.equal(row.complete, false)
  // Der Wert bleibt lesbar — er ist eine Untergrenze, keine Luege.
  assert.equal(row.totalMl, 1230)
})

test('a claimed complete flag does not survive a missing counter', () => {
  // Defensiv: kaeme total_complete=true zusammen mit food_ml_missing>0,
  // waere eines von beiden falsch. Dann gilt "nicht vollstaendig".
  const [row] = parseHydrationSummaries([
    { entry_date: '2026-08-06', food_ml_missing: '2', total_complete: true },
  ])
  assert.equal(row.complete, false)
})

test('a day with nothing logged is null everywhere, not a row of zeros', () => {
  const row = emptyHydrationSummary('2026-08-07')
  assert.equal(row.loggedMl, null)
  assert.equal(row.foodMl, null)
  assert.equal(row.totalMl, null)
  assert.equal(row.logCount, 0)
  assert.equal(row.complete, false)
})

test('percent needs a target and never invents one', () => {
  const row = parseHydrationSummaries([
    { entry_date: '2026-08-06', logged_ml: '1500', food_ml: '600', total_ml: '2100', food_ml_missing: '0', total_complete: true },
  ])[0]
  assert.equal(hydrationPercent(row, 3000), 70)
  // Ohne Ziel: null. Nicht 0 % (waere "nichts geschafft") und nicht 100 %.
  // [read] Das Ziel liegt laut ADR in nutrition_targets (Goals, C-06);
  // [cmd] diese Tabelle existiert noch nicht.
  assert.equal(hydrationPercent(row, null), null)
  assert.equal(hydrationPercent(row, 0), null)
  assert.equal(hydrationPercent(row, -1), null)
  // Ohne erfasste Menge ebenfalls null, nicht 0.
  assert.equal(hydrationPercent(emptyHydrationSummary('2026-08-07'), 3000), null)
})
