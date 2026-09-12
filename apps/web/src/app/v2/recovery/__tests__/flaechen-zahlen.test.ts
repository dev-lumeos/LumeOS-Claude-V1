// Wieviele der 96 auf jede Flaeche fallen (G-55).
//
// `[read]` Der Auftrag verlangt „die Zahl je Flaeche" im Bericht.
// Eine Zahl im Bericht veraltet still — diese hier faellt auf, sobald
// jemand die Zuordnung aendert.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKEL_ZU_FLAECHE, FLAECHEN, muskelnZurFlaeche, flaechenVonMuskel } from '../muskel-ebenen'

/**
 * `[cmd]` **Am 2026-09-12 gezaehlt** (G-430), vorher 2026-08-18.
 *
 * `[read]` **Summe 97 bei 96 Namen** — `Obliques` deckt zwei Flaechen
 * (Bauchseite und Flanke), alle uebrigen genau eine.
 *
 * **Was G-430 geaendert hat:**
 *
 *     upper-back  6  ->  latissimus 4, teres-major 1, teres-minor 1
 *     lower-back  2  ->  erector-spinae 2, flanke 1
 *     deltoids    8  ->  7   (Teres Minor hat eine eigene Flaeche)
 *     trapezius   2  ->  3   (Rhomboids, der keinen Pfad hat)
 */
const ERWARTET: Record<string, number> = {
  forearm: 17,
  calves: 10,
  quadriceps: 9,
  adductors: 8,
  gluteal: 8,
  deltoids: 7,
  abs: 5,
  chest: 5,
  hamstring: 4,
  latissimus: 4,
  neck: 4,
  biceps: 3,
  trapezius: 3,
  'erector-spinae': 2,
  obliques: 2,
  tibialis: 2,
  flanke: 1,
  'teres-major': 1,
  'teres-minor': 1,
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

test('jeder der 96 Muskeln landet auf mindestens einer Flaeche', () => {
  // [cmd] Die Gegenprobe: keine verloren.
  //
  // ══ G-430: 96 -> 97 Zuordnungen bei 96 Namen ═══════════════════
  //
  // `[cmd]` **Hier stand `assert.equal(summe, 96)`.** `[read]` **Die
  // Summe war nur solange gleich der Namenszahl, wie JEDER Name genau
  // EINE Flaeche traf.** `Obliques` **trifft seit G-430 zwei**
  // (Bauchseite und Flanke).
  //
  // `[read]` **Die Frage, die der Test wirklich stellt, ist:
  // faellt ein Muskel durch?** — und die wird jetzt direkt
  // gestellt, statt ueber eine Summe, die aus zwei Gruenden
  // abweichen kann.
  assert.equal(Object.keys(MUSKEL_ZU_FLAECHE).length, 96,
    'Die Zuordnung selbst muss 96 Eintraege fuehren.')

  const ohne = Object.keys(MUSKEL_ZU_FLAECHE)
    .filter(name => flaechenVonMuskel(name).length === 0)
  assert.deepEqual(ohne, [],
    `Diese Muskeln landen auf keiner Flaeche: ${ohne.join(', ')}. `
    + 'Ein Muskel ohne Flaeche wird am Bildschirm nie sichtbar.')

  // Und die Summe bleibt nachpruefbar — nur als Folge, nicht als Regel.
  const summe = Object.values(ERWARTET).reduce((a, b) => a + b, 0)
  const mehrfach = Object.keys(MUSKEL_ZU_FLAECHE)
    .filter(name => flaechenVonMuskel(name).length > 1)
  assert.equal(summe, 96 + mehrfach.length,
    `Summe ${summe}: erwartet 96 plus ${mehrfach.length} Mehrfach-`
    + `zuordnung(en) (${mehrfach.join(', ') || '—'}).`)
})
