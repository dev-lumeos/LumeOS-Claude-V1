import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SUMMARY_MACROS,
  emptyDailySummary,
  incompleteMacros,
  isSummaryComplete,
  parseDailySummaryRows,
} from '../diary-summary'

// Zahlen wie im Wegwerf-DB-Nachweis zu 053: drei Positionen,
// CHO 120+80+40 = 240, ENERCC 600+400+200 = 1200, FIBT nie gemessen.
const ROW = {
  entry_date: '2026-08-06',
  meal_count: '2',
  item_count: '3',
  cho: '240.0000',
  enercc: '1200.0000',
  fat: '30.0000',
  prot625: '15.0000',
  fibt: null,
  cho_missing: '0',
  enercc_missing: '0',
  fat_missing: '0',
  prot625_missing: '0',
  fibt_missing: '3',
}

test('daily summary covers the nine macros that 052 stores as columns', () => {
  assert.deepEqual([...SUMMARY_MACROS], [
    'enercc',
    'prot625',
    'fat',
    'cho',
    'fibt',
    'sugar',
    'fasat',
    'nacl',
    'water_g',
  ])
})

test('numeric strings from PostgREST arrive as numbers', () => {
  const [row] = parseDailySummaryRows([ROW])
  assert.equal(row.entry_date, '2026-08-06')
  assert.equal(row.meal_count, 2)
  assert.equal(row.item_count, 3)
  assert.equal(row.macros.cho.value, 240)
  assert.equal(row.macros.enercc.value, 1200)
  assert.equal(row.macros.prot625.value, 15)
})

test('a nutrient nobody measured stays null and is flagged, never zero', () => {
  const [row] = parseDailySummaryRows([ROW])
  // Das ist der Kern: FIBT wurde bei keiner der drei Positionen gemessen.
  assert.equal(row.macros.fibt.value, null)
  assert.notEqual(row.macros.fibt.value, 0)
  assert.equal(row.macros.fibt.missing, 3)
  assert.equal(row.macros.fibt.complete, false)
})

test('a macro measured on every position counts as complete', () => {
  const [row] = parseDailySummaryRows([ROW])
  assert.equal(row.macros.cho.complete, true)
  assert.equal(row.macros.cho.missing, 0)
})

test('a partially measured macro is a lower bound, not a truth', () => {
  const [row] = parseDailySummaryRows([{ ...ROW, sugar: '12.5000', sugar_missing: '1' }])
  assert.equal(row.macros.sugar.value, 12.5)
  assert.equal(row.macros.sugar.missing, 1)
  // Wert vorhanden, aber eine Position fehlt -> nicht vollstaendig.
  assert.equal(row.macros.sugar.complete, false)
})

test('incomplete macros are reported so the surface can show the gap', () => {
  const [row] = parseDailySummaryRows([ROW])
  const gaps = incompleteMacros(row)
  assert.ok(gaps.includes('fibt'))
  assert.equal(gaps.includes('cho'), false)
  // Nicht gemessene Makros (sugar, fasat, nacl, water_g) zaehlen auch als Luecke.
  assert.equal(isSummaryComplete(row), false)
})

test('a day with meals but no items reports zero items and no totals', () => {
  const [row] = parseDailySummaryRows([
    { entry_date: '2026-08-07', meal_count: '1', item_count: '0', cho: null, cho_missing: '0' },
  ])
  assert.equal(row.meal_count, 1)
  assert.equal(row.item_count, 0)
  assert.equal(row.macros.cho.value, null)
  // Ohne Positionen ist nichts vollstaendig — 0 Positionen sind nicht "0 g".
  assert.equal(row.macros.cho.complete, false)
})

test('an empty day is null everywhere, not a row of zeros', () => {
  const row = emptyDailySummary('2026-08-08')
  assert.equal(row.entry_date, '2026-08-08')
  assert.equal(row.meal_count, 0)
  assert.equal(row.item_count, 0)
  for (const macro of SUMMARY_MACROS) {
    assert.equal(row.macros[macro].value, null)
    assert.equal(row.macros[macro].complete, false)
  }
  assert.equal(isSummaryComplete(row), false)
})

test('malformed rows drop out instead of failing the whole read', () => {
  const rows = parseDailySummaryRows([ROW, null, 'nope', {}, { meal_count: '1' }])
  assert.equal(rows.length, 1)
  assert.equal(parseDailySummaryRows(null).length, 0)
  assert.equal(parseDailySummaryRows('nope').length, 0)
})
