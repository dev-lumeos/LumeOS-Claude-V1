// Die fünf System-Scores und der Gesamtwert — geprüft (G-135).
//
// `[read]` Warum hier und nicht im Browser: `rechneSystem` und
// `rechneGesamt` sind reine Rechnungen über `MarkerReihe[]`, ohne
// Datenbank und ohne React. Dieselbe Begründung wie bei
// `lagezaehlung.test.ts`.
//
// `[cmd]` **DIE ERWARTETEN ZAHLEN SIND GEMESSEN, NICHT GERECHNET.**
// Am 2026-08-21 in SQL gegen die laufende Instanz, Konto
// `dev@lumeos.app`, mit derselben Punktevergabe:
//
//   cardiovascular  5 Marker   90   HDL 100, hs-CRP 100, Triglyceride 100,
//                                   Homocystein 75, LDL 75
//   hormonal        6 Marker  100   alle sechs im Optimalband
//   liver           3 Marker   92   AST 100, GGT 100, ALT 75
//   metabolic       3 Marker   83   HbA1c 100, Glucose 75, Insulin 75
//   kidney          1 Marker   75   Creatinine 75
//
//   Gesamt: 88 bei Gewicht 1,00
//
// `[read]` G-101 hat gezeigt, wohin die eigene Kopfrechnung führt —
// dort stand 27,2 im Test und 27,7 in den Daten, und der Code hatte
// recht.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  GEWICHT, PUNKTE, SYSTEME, punkteFuer, rechneGesamt, rechneScores,
  rechneSystem, type System,
} from '../systemscore'
import type { MarkerReihe } from '../reihe'

function reihe(teil: Partial<MarkerReihe> & { name: string }): MarkerReihe {
  return {
    schluessel: teil.name,
    loinc_code: null,
    kurz: null,
    klasse: null,
    einheit: 'mg/dL',
    messungen: [],
    aktuell: undefined as never,
    bereich: null,
    lage: 'im_bereich',
    optimal: null,
    optimalText: null,
    optimalLage: 'unbekannt',
    trendProzent: null,
    ...teil,
  } as MarkerReihe
}

test('die Gewichte der Spec ergeben 1,00', () => {
  const summe = SYSTEME.reduce((s, k) => s + GEWICHT[k], 0)
  assert.equal(Math.round(summe * 100) / 100, 1)
})

test('ausserhalb des Laborbereichs wiegt schwerer als ausserhalb des Optimalbands', () => {
  assert.equal(punkteFuer(reihe({ name: 'a', lage: 'darueber' })), PUNKTE.ausserhalb)
  assert.equal(punkteFuer(reihe({ name: 'b', lage: 'darunter' })), PUNKTE.ausserhalb)
  assert.equal(
    punkteFuer(reihe({ name: 'c', lage: 'im_bereich', optimalLage: 'darueber' })),
    PUNKTE.normal)
  assert.equal(
    punkteFuer(reihe({ name: 'd', lage: 'im_bereich', optimalLage: 'im_bereich' })),
    PUNKTE.optimal)
})

test('ohne Laborbereich gibt es keinen Punktwert — er wird nicht erfunden', () => {
  assert.equal(punkteFuer(reihe({ name: 'x', lage: 'unbekannt' })), null)
})

test('ein Marker ohne Optimalband ist normal, nicht optimal', () => {
  // Sonst stuende ein Marker ohne hinterlegtes Band besser da als
  // einer, der eines hat und darin liegt.
  assert.equal(
    punkteFuer(reihe({ name: 'ohne Band', lage: 'im_bereich', optimalLage: 'unbekannt' })),
    PUNKTE.normal)
})

test('cardiovascular ergibt 90 — die gemessenen fuenf Marker', () => {
  const s = rechneSystem('cardiovascular', [
    reihe({ name: 'HDL Cholesterol', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'hs-CRP', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'Triglycerides', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'Homocysteine', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'LDL Cholesterol', lage: 'im_bereich', optimalLage: 'darueber' }),
  ], 7)

  assert.equal(s.score, 90)
  assert.equal(s.marker_count, 5)
  assert.equal(s.erwartet, 7)
  assert.equal(s.missing, 2, 'sieben zugeordnete Marker, fuenf gemessen')
})

test('liver ergibt 92 — der Schnitt wird gerundet, nicht abgeschnitten', () => {
  const s = rechneSystem('liver', [
    reihe({ name: 'AST', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'GGT', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'ALT', lage: 'im_bereich', optimalLage: 'darueber' }),
  ], 6)
  // 100 + 100 + 75 = 275 / 3 = 91,666… → 92
  assert.equal(s.score, 92)
  assert.equal(s.missing, 3)
})

test('ein System ohne Marker liefert null, nicht null Punkte', () => {
  const s = rechneSystem('kidney', [], 4)
  assert.equal(s.score, null, 'null heisst „nichts erfasst", 0 hiesse „schlecht"')
  assert.equal(s.marker_count, 0)
  assert.equal(s.missing, 4)
})

test('Marker ohne Bereich zaehlen als fehlend, nicht als schlecht', () => {
  const s = rechneSystem('kidney', [
    reihe({ name: 'Creatinine', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'BUN ohne Bereich', lage: 'unbekannt' }),
  ], 4)
  assert.equal(s.score, 75, 'nur der bewertbare Marker geht ein')
  assert.equal(s.marker_count, 1)
  assert.equal(s.ohne_bereich, 1)
})

test('der Gesamtwert ist 88 bei allen fuenf Systemen', () => {
  const g = rechneGesamt([
    { system: 'cardiovascular', score: 90, marker_count: 5, missing: 2, erwartet: 7, ohne_bereich: 0, namen: [] },
    { system: 'metabolic', score: 83, marker_count: 3, missing: 1, erwartet: 4, ohne_bereich: 0, namen: [] },
    { system: 'hormonal', score: 100, marker_count: 6, missing: 0, erwartet: 6, ohne_bereich: 0, namen: [] },
    { system: 'liver', score: 92, marker_count: 3, missing: 3, erwartet: 6, ohne_bereich: 0, namen: [] },
    { system: 'kidney', score: 75, marker_count: 1, missing: 3, erwartet: 4, ohne_bereich: 0, namen: [] },
  ])
  assert.equal(g.score, 88)
  assert.equal(g.gewicht_erfasst, 1)
  assert.equal(g.systeme_mit_wert, 5)
})

test('fehlt ein System, verteilt sich sein Gewicht auf die uebrigen', () => {
  // Nur cardiovascular (0,25) und metabolic (0,25) haben Werte.
  // Ohne Normalisierung waere es (90+80)*0,25 = 42,5 — eine Zahl,
  // die niemand erwartet. Mit `totalW` sind es 85.
  const g = rechneGesamt([
    { system: 'cardiovascular', score: 90, marker_count: 1, missing: 6, erwartet: 7, ohne_bereich: 0, namen: [] },
    { system: 'metabolic', score: 80, marker_count: 1, missing: 3, erwartet: 4, ohne_bereich: 0, namen: [] },
    { system: 'hormonal', score: null, marker_count: 0, missing: 6, erwartet: 6, ohne_bereich: 0, namen: [] },
    { system: 'liver', score: null, marker_count: 0, missing: 6, erwartet: 6, ohne_bereich: 0, namen: [] },
    { system: 'kidney', score: null, marker_count: 0, missing: 4, erwartet: 4, ohne_bereich: 0, namen: [] },
  ])
  assert.equal(g.score, 85)
  assert.equal(g.gewicht_erfasst, 0.5, 'die Haelfte des Gewichts fehlt — und das steht daneben')
  assert.equal(g.systeme_mit_wert, 2)
})

test('ohne jeden Wert bleibt der Gesamtwert null', () => {
  const g = rechneGesamt(SYSTEME.map(system => ({
    system, score: null, marker_count: 0, missing: 0, erwartet: 0,
    ohne_bereich: 0, namen: [],
  })))
  // Die Spec liefert hier 0. Null waere eine Aussage, keine Leerstelle.
  assert.equal(g.score, null)
  assert.equal(g.gewicht_erfasst, 0)
})

test('ein Marker in zwei Systemen zaehlt in beiden', () => {
  const gruppen = new Map<string, System[]>([
    ['2093-3', ['cardiovascular', 'metabolic']],
  ])
  const g = rechneScores(
    [reihe({ name: 'Total Cholesterol', loinc_code: '2093-3', lage: 'im_bereich', optimalLage: 'im_bereich' })],
    gruppen,
    new Map<System, number>([['cardiovascular', 7], ['metabolic', 4]]),
  )
  const cv = g.systeme.find(s => s.system === 'cardiovascular')
  const mb = g.systeme.find(s => s.system === 'metabolic')
  assert.equal(cv?.marker_count, 1)
  assert.equal(mb?.marker_count, 1)
})

test('Reihen ohne LOINC gehen in kein System ein', () => {
  const g = rechneScores(
    [reihe({ name: 'Unbekannter Marker X', loinc_code: null, lage: 'im_bereich' })],
    new Map(), new Map())
  assert.equal(g.score, null)
  assert.equal(g.systeme.length, 5, 'alle fuenf werden gezeigt, auch die leeren')
})
