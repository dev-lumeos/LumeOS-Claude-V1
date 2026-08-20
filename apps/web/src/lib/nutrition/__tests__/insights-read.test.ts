// G-101: die Energieanteile der Makros.
//
// `[read]` Die Entscheidung, die hier festgehalten wird: normiert wird
// gegen die **Summe der drei**, nicht gegen `enercc`. Alkohol und
// Ballaststoffe tragen ebenfalls Energie; gegen `enercc` gerechnet
// fehlten Prozentpunkte, ohne dass die Anzeige sagen koennte, wo.
import test from 'node:test'
import assert from 'node:assert/strict'

import { energieAnteile } from '../insights-read'

test('die drei Anteile ergeben zusammen 100 %', () => {
  const a = energieAnteile(166, 285, 66)
  assert.ok(a.protein !== null && a.carbs !== null && a.fat !== null)
  const summe = a.protein! + a.carbs! + a.fat!
  // Rundung auf eine Nachkommastelle: 0,1 Toleranz.
  assert.ok(Math.abs(summe - 100) <= 0.2, `Summe ${summe}`)
})

test('die Atwater-Faktoren stimmen', () => {
  // 100 g Protein (400 kcal) gegen 100 g Fett (900 kcal): 400/1300.
  const a = energieAnteile(100, 0, 100)
  assert.equal(a.protein, 30.8)
  assert.equal(a.fat, 69.2)
  assert.equal(a.carbs, 0)
})

test('der gemessene 14-Tage-Schnitt von dev', () => {
  // `[cmd]` 166 g P, 285 g C, 66 g F am 2026-08-20.
  // 664 + 1.140 + 594 = 2.398 kcal aus den drei Makros.
  const a = energieAnteile(166, 285, 66)
  assert.equal(a.protein, 27.7)
  assert.equal(a.carbs, 47.5)
  assert.equal(a.fat, 24.8)
})

test('ohne Werte gibt es keine Anteile', () => {
  assert.deepEqual(energieAnteile(null, 285, 66),
    { protein: null, carbs: null, fat: null })
})

test('ein Nulltag ergibt keine Anteile statt einer Division durch null', () => {
  assert.deepEqual(energieAnteile(0, 0, 0),
    { protein: null, carbs: null, fat: null })
})
