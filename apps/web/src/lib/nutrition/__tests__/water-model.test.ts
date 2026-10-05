import assert from 'node:assert/strict'
import test from 'node:test'

import {
  GRAMS_TO_ML,
  WATER_QUICK_AMOUNTS_ML,
  WATER_UNIT,
  buildWaterLogInsert,
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

// G-592: die fuenf Tests zu `parseHydrationSummaries`, `emptyHydrationSummary`
// und `hydrationPercent` sind mit dem zweiten Leseweg gefallen. Ihre Regeln
// (null statt 0, Untergrenze, Defensivflag) bewacht jetzt
// `app/v2/nutrition/__tests__/g592-hydration-leer.test.ts` am lebenden Weg.
