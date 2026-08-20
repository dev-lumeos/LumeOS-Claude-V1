// Die Lagezaehlung im Medical-Kopf — geprueft (G-84).
//
// `[read]` Warum hier und nicht im Browser: `zaehleLagen` ist eine
// reine Rechnung ueber `MarkerReihe[]`, ohne Datenbank und ohne React.
// Dieselbe Begruendung wie bei `reihe.test.ts`.
//
// `[cmd]` DER FALL STAMMT AUS DEN ECHTEN DATEN, gemessen am
// 2026-08-20 gegen die laufende Instanz, Konto `dev@lumeos.app`:
//
//   ueber Laborbereich          Glucose (fasting)  102 mg/dL bei 70–99
//   ueber Laborbereich          Glucose [Mass/volume] …  102 mg/dL
//   nur ausserhalb Optimalband  ALT, Creatinine, Homocysteine,
//                               Insulin (fasting)
//
// **2 + 4 = 6** — und 6 ist genau die Zahl, die der Filter
// „Non-optimal only" in der Markerliste anzeigt. Dass die zwei
// Glukosezeilen dieselbe Messung sind, steht im Bericht
// (docs/ssot/134-medical-score.md); es ist ein Datenbefund, keine
// Sache dieser Rechnung.
import test from 'node:test'
import assert from 'node:assert/strict'

import { zaehleLagen, pruefeGruppierbarkeit } from '../lagezaehlung'
import type { MarkerReihe } from '../reihe'

/** Eine Reihe, wie `zuReihen` sie liefert — nur die Felder der Zaehlung. */
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

test('die zwei Zahlen bleiben getrennt und ergeben zusammen den Filter', () => {
  const z = zaehleLagen([
    reihe({ name: 'Glucose (fasting)', lage: 'darueber' }),
    reihe({ name: 'Glucose [Mass/volume]', lage: 'darueber' }),
    reihe({ name: 'ALT', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'Creatinine', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'Homocysteine', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'Insulin (fasting)', lage: 'im_bereich', optimalLage: 'darueber' }),
    reihe({ name: 'HbA1c', lage: 'im_bereich', optimalLage: 'im_bereich' }),
    reihe({ name: 'Marker ohne Bereich', lage: 'unbekannt' }),
  ])

  assert.equal(z.ausserhalb_bereich, 2)
  assert.equal(z.ausserhalb_optimal, 4)
  assert.equal(z.auffaellig, 6, 'muss der Zahl im Filter „Non-optimal only" entsprechen')
  assert.equal(z.ohne_bereich, 1)
  assert.equal(z.marker, 8)
})

test('wer schon ausserhalb des Laborbereichs liegt, wird nicht zweimal gezaehlt', () => {
  // `[read]` Sonst waere die Summe groesser als die Zahl der Marker —
  // und der Kopf zeigte mehr Auffaellige, als es Marker gibt.
  const z = zaehleLagen([
    reihe({ name: 'doppelt auffaellig', lage: 'darueber', optimalLage: 'darueber' }),
  ])

  assert.equal(z.ausserhalb_bereich, 1)
  assert.equal(z.ausserhalb_optimal, 0, 'nicht noch einmal im Optimalband gezaehlt')
  assert.equal(z.auffaellig, 1)
})

test('darunter zaehlt so wie darueber — beides ist ausserhalb', () => {
  const z = zaehleLagen([
    reihe({ name: 'zu hoch', lage: 'darueber' }),
    reihe({ name: 'zu niedrig', lage: 'darunter' }),
  ])

  assert.equal(z.ueber_bereich, 1)
  assert.equal(z.unter_bereich, 1)
  assert.equal(z.ausserhalb_bereich, 2)
})

test('ohne Marker bleibt jede Zahl null — kein Kopf ohne Daten', () => {
  const z = zaehleLagen([])
  assert.equal(z.auffaellig, 0)
  assert.equal(z.marker, 0)
})

test('die Gruppierbarkeit zaehlt, was der Katalog traegt', () => {
  // `[cmd]` Gemessen: 23 von 37 zuordenbar. Hier im Kleinen geprueft,
  // dass ein fehlender Code als Luecke gezaehlt wird und nicht als Null.
  const g = pruefeGruppierbarkeit([
    reihe({ name: 'HDL', loinc_code: '2085-9' }),
    reihe({ name: 'Triglyceride', loinc_code: '2571-8' }),
    reihe({ name: 'ApoB', loinc_code: '1884-6' }),
    reihe({ name: 'Rohmarker ohne Code', loinc_code: null }),
  ], new Map([['2085-9', 'lipid'], ['2571-8', 'lipid']]))

  assert.equal(g.zugeordnet, 2)
  assert.equal(g.offen, 2)
  assert.equal(g.abdeckung_pct, 50)
  assert.deepEqual(g.gruppen, [{ gruppe: 'lipid', marker: 2 }])
  assert.deepEqual(g.ohne_gruppe, ['ApoB', 'Rohmarker ohne Code'])
})
