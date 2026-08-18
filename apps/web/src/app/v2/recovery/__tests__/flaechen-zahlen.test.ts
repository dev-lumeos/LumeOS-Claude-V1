// Wieviele der 96 auf jede Flaeche fallen (G-55).
//
// `[read]` Der Auftrag verlangt „die Zahl je Flaeche" im Bericht.
// Eine Zahl im Bericht veraltet still — diese hier faellt auf, sobald
// jemand die Zuordnung aendert.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKEL_ZU_FLAECHE, FLAECHEN, muskelnZurFlaeche } from '../muskel-ebenen'

/** `[cmd]` Am 2026-08-18 gezaehlt. Summe muss 96 ergeben. */
const ERWARTET: Record<string, number> = {
  forearm: 17,
  calves: 10,
  quadriceps: 9,
  gluteal: 8,
  adductors: 8,
  deltoids: 8,
  'upper-back': 6,
  abs: 5,
  chest: 5,
  hamstring: 4,
  neck: 4,
  biceps: 3,
  trapezius: 2,
  obliques: 2,
  'lower-back': 2,
  tibialis: 2,
  triceps: 1,
}

test('die Zahl je Flaeche stimmt mit dem Bericht ueberein', () => {
  const ist: Record<string, number> = {}
  for (const f of FLAECHEN) {
    const n = muskelnZurFlaeche(f).length
    if (n > 0) ist[f] = n
  }
  assert.deepEqual(ist, ERWARTET,
    'Die Verteilung hat sich geaendert — dann auch den Bericht '
    + '(docs/ssot/104-muskelkarte.md) nachziehen.')
})

test('die Summe je Flaeche ergibt genau 96', () => {
  // [cmd] Die Gegenprobe: keine doppelt gezaehlt, keine verloren.
  const summe = Object.values(ERWARTET).reduce((a, b) => a + b, 0)
  assert.equal(summe, 96, `Summe ${summe} statt 96`)
  assert.equal(Object.keys(MUSKEL_ZU_FLAECHE).length, 96,
    'Die Zuordnung selbst muss 96 Eintraege fuehren.')
})
