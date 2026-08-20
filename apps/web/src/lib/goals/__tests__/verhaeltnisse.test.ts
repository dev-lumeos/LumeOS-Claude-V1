// Die Verhältnisse aus den Körperumfängen — geprüft (G-87).
//
// `[read]` Warum hier und nicht im Browser: `rechneVerhaeltnisse` und
// `vergleicheStellen` sind reine Rechnungen ohne Datenbank und ohne
// React. Dieselbe Begründung wie bei `medical/reihe.test.ts`.
//
// `[cmd]` DER FALL STAMMT AUS DEN ECHTEN DATEN, gemessen am
// 2026-08-20 gegen die laufende Instanz, Konto `dev@lumeos.app`:
// der jüngste Umfangssatz bis heute ist der **2026-08-19**, mit
// Taille 83,0 · Hüfte 96,5 · Schulter 123,8 · Brust 107,7 cm.
//
// Gegengerechnet in SQL (`round(waist_cm/hip_cm, 3)` usw.):
//   Taille : Hüfte      0,860
//   Schulter : Taille   1,492
//   Arm : Oberschenkel  0,649
import test from 'node:test'
import assert from 'node:assert/strict'

import { rechneVerhaeltnisse, vergleicheStellen } from '../verhaeltnisse'
import type { Umfangssatz } from '../lesen'

function satz(teil: Partial<Umfangssatz> & { measurement_date: string }): Umfangssatz {
  return {
    neck_cm: null, shoulders_cm: null, chest_cm: null,
    upper_arm_left_cm: null, upper_arm_right_cm: null,
    forearm_left_cm: null, forearm_right_cm: null,
    waist_cm: null, hip_cm: null,
    thigh_left_cm: null, thigh_right_cm: null,
    calf_left_cm: null, calf_right_cm: null,
    ...teil,
  }
}

/** Der echte Satz vom 2026-08-19. */
const ECHT = satz({
  measurement_date: '2026-08-19',
  neck_cm: 40.9, shoulders_cm: 123.8, chest_cm: 107.7,
  upper_arm_left_cm: 38.7, upper_arm_right_cm: 39.2,
  forearm_left_cm: 31.9, forearm_right_cm: 32.1,
  waist_cm: 83.0, hip_cm: 96.5,
  thigh_left_cm: 59.8, thigh_right_cm: 60.3,
  calf_left_cm: 38.9, calf_right_cm: 39.4,
})

test('die Quotienten stimmen mit der SQL-Gegenrechnung überein', () => {
  const v = rechneVerhaeltnisse([ECHT])
  assert.ok(v)
  assert.equal(v.stichtag, '2026-08-19')
  assert.equal(v.taille_huefte.wert, 0.86)
  assert.equal(v.schulter_taille.wert, 1.492)
  assert.equal(v.arm_bein.wert, 0.649)
  assert.equal(v.belegte_stellen, 13)
})

test('die Zutaten stehen mit im Ergebnis — der Quotient bleibt nachrechenbar', () => {
  const v = rechneVerhaeltnisse([ECHT])
  assert.equal(v?.taille_huefte.zaehler, 83.0)
  assert.equal(v?.taille_huefte.nenner, 96.5)
})

test('die Symmetrie ist die kleinere Seite am Mittel, mit Vorzeichen', () => {
  const v = rechneVerhaeltnisse([ECHT])
  // min 38,7 / Mittel 38,95 = 99,358… -> 99,4
  assert.equal(v?.arm_symmetrie.prozent, 99.4)
  assert.equal(v?.arm_symmetrie.differenz_cm, 0.5)
  assert.equal(v?.bein_symmetrie.differenz_cm, 0.5)
})

test('gleich lange Seiten ergeben genau 100 Prozent', () => {
  const v = rechneVerhaeltnisse([satz({
    measurement_date: '2026-08-19',
    upper_arm_left_cm: 40, upper_arm_right_cm: 40,
  })])
  assert.equal(v?.arm_symmetrie.prozent, 100)
  assert.equal(v?.arm_symmetrie.differenz_cm, 0)
})

test('eine fehlende Stelle ergibt null, nicht null Komma null', () => {
  // `[read]` Der Unterschied zaehlt: 0,000 saehe aus wie ein
  // gemessenes Verhaeltnis. Nicht gemessen ist nicht null.
  const v = rechneVerhaeltnisse([satz({
    measurement_date: '2026-08-19', waist_cm: 83.0, hip_cm: null,
  })])
  assert.equal(v?.taille_huefte.wert, null)
  assert.equal(v?.taille_huefte.zaehler, 83.0)
  assert.equal(v?.belegte_stellen, 1)
})

test('gerechnet wird über den jüngsten Satz, nicht über den ersten', () => {
  // `ladeUmfaenge` sortiert aufsteigend — der letzte ist der jüngste.
  const v = rechneVerhaeltnisse([
    satz({ measurement_date: '2026-05-20', waist_cm: 90, hip_cm: 100 }),
    ECHT,
  ])
  assert.equal(v?.stichtag, '2026-08-19')
  assert.equal(v?.taille_huefte.wert, 0.86)
})

test('ohne Satz gibt es kein Ergebnis — und keine erfundene Null', () => {
  assert.equal(rechneVerhaeltnisse([]), null)
  assert.deepEqual(vergleicheStellen([]), [])
})

test('der Stellenvergleich nimmt die zwei jüngsten Sätze', () => {
  const vorher = satz({
    measurement_date: '2026-08-12', waist_cm: 83.4, shoulders_cm: 123.6,
  })
  const stellen = vergleicheStellen([vorher, ECHT])
  const taille = stellen.find(s => s.schluessel === 'waist_cm')
  assert.equal(taille?.jetzt, 83.0)
  assert.equal(taille?.vorher, 83.4)
  assert.equal(taille?.differenz, -0.4)

  const schulter = stellen.find(s => s.schluessel === 'shoulders_cm')
  assert.equal(schulter?.differenz, 0.2)
})

test('ohne Vorwert bleibt die Differenz leer, statt auf den Wert zu fallen', () => {
  const stellen = vergleicheStellen([ECHT])
  const taille = stellen.find(s => s.schluessel === 'waist_cm')
  assert.equal(taille?.jetzt, 83.0)
  assert.equal(taille?.vorher, null)
  assert.equal(taille?.differenz, null)
})

test('alle 13 Stellen stehen in der Tabelle, auch die ungemessenen', () => {
  // Die Vorlage zeigt 13 Zeilen; eine fehlende Messung darf keine
  // Zeile verschlucken, sonst zaehlt der Nutzer falsch.
  assert.equal(vergleicheStellen([ECHT]).length, 13)
  assert.equal(vergleicheStellen([satz({ measurement_date: '2026-08-19' })]).length, 13)
})
