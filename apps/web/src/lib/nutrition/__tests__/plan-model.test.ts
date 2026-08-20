// G-97: die Zeilenzahl des Planner-Rasters aus den Vorlieben.
//
// `[read]` Die Funktion hat eine Falle, in die der erste Bau
// hineingelaufen ist: `meals_per_day` und `snacks_per_day` zaehlen
// GETRENNT. Der Test haelt das fest, damit es nicht ein zweites Mal
// verwechselt wird.
import test from 'node:test'
import assert from 'node:assert/strict'

import { rasterZeilen } from '../plan-model'

test('die Vorgabe der Datenbank ergibt vier Reihen', () => {
  // `[cmd]` 050_preferences_foundation.sql: meals 3, snacks 1.
  const r = rasterZeilen(3, 1)
  assert.deepEqual(r.zeilen, ['breakfast', 'lunch', 'dinner', 'snack'])
  assert.match(r.grund, /3 Hauptmahlzeiten und 1 Snack/)
})

test('dev@lumeos.app: 4 Mahlzeiten, 1 Snack — drei Reihen plus Snacks', () => {
  // `[cmd]` Der Live-Stand am 2026-08-20. Vier Hauptmahlzeiten kann das
  // Schema nicht abbilden, es gibt nur drei `meal_type`-Reihen.
  const r = rasterZeilen(4, 1)
  assert.deepEqual(r.zeilen, ['breakfast', 'lunch', 'dinner', 'snack'])
  assert.match(r.grund, /nur drei/)
})

test('ohne Snacks faellt die Snackreihe weg', () => {
  const r = rasterZeilen(3, 0)
  assert.deepEqual(r.zeilen, ['breakfast', 'lunch', 'dinner'])
  assert.match(r.grund, /ohne Snacks/)
})

test('zwei Mahlzeiten ergeben zwei Reihen', () => {
  const r = rasterZeilen(2, 0)
  assert.deepEqual(r.zeilen, ['breakfast', 'lunch'])
})

test('ohne Angabe bleiben die vier Reihen des Entwurfs', () => {
  const r = rasterZeilen(null, null)
  assert.equal(r.zeilen.length, 4)
  assert.match(r.grund, /Entwurf/)
})

test('die Snackreihe kommt auch ohne Hauptmahlzeitangabe nicht allein', () => {
  // `meals_per_day` unter 1 ist kein gueltiger Wert (CHECK: 2..6) —
  // die Funktion faellt dann auf den Entwurf zurueck.
  const r = rasterZeilen(0, 2)
  assert.equal(r.zeilen.length, 4)
})
