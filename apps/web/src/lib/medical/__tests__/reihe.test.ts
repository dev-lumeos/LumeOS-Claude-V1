// Die Faltung von 140 flachen Werten zu 35 Markerreihen — geprueft.
//
// `[read]` Warum hier und nicht im Browser: `zuReihen`, `trendProzent`
// und `balkenSkala` sind reine Rechnungen ohne Datenbank und ohne
// React. Genau wie `befund.ts` sind sie deshalb an dieser Stelle
// pruefbar, und ein Fehler faellt auf, bevor er als falsche Zahl in
// einer Tabelle steht.
//
// `[cmd]` Die Faelle stammen aus den echten Testdaten (gemessen am
// 2026-08-18 gegen die laufende Instanz):
//   Glukose  88 → 94 → 99 → 102 mg/dL, Laborbereich 70–99
//   HbA1c   5,2 → 5,3 → 5,4 → 5,4 %
//   „Unbekannter Marker X"  42 U/L, ohne LOINC, ohne Bereich
import test from 'node:test'
import assert from 'node:assert/strict'

import { balkenSkala, trendProzent, zuReihen, type Messung } from '../reihe'
import type { BefundWert } from '../lesen'

/** Eine Befundzeile, wie `lab_result_values_read` sie liefert. */
function wert(teil: Partial<BefundWert> & { id: string; report_date: string }): BefundWert {
  return {
    report_id: `r-${teil.report_date}`,
    report_time: null,
    lab_name: 'LumeOS Testlabor',
    loinc_code: null,
    marker_name: 'Marker',
    unit: 'mg/dL',
    value_numeric: null,
    value_text: null,
    value_operator: '=',
    reference_low: null,
    reference_high: null,
    reference_text: null,
    reference_unit: null,
    reference_source: 'none',
    reference_range_id: null,
    source: 'seed',
    frozen_at: '2026-08-18T00:00:00Z',
    ...teil,
  } as BefundWert
}

const messung = (wert: number | null, datum: string): Messung => ({
  id: `m-${datum}`, datum, wert, wertText: null, operator: '=', reportId: `r-${datum}`,
  // G-80: die vier Felder gehoeren seither zur Messung. Fuer die
  // Trendrechnung sind sie ohne Belang — sie stehen hier, damit der
  // Typ vollstaendig ist.
  reference_source: 'lab_report', lab_name: null, report_time: null,
  fasting_status: null,
})

test('vier Messungen eines Markers werden EINE Reihe', () => {
  // `[cmd]` Der belegte Fall: Glukose, vier Befunde, ein Marker.
  const werte = ['2026-02-18', '2026-04-18', '2026-06-18', '2026-08-18']
    .map((d, i) => wert({
      id: `g${i}`, report_date: d, loinc_code: '1558-6',
      marker_name: 'Glucose (fasting)',
      value_numeric: [88, 94, 99, 102][i],
      reference_low: 70, reference_high: 99, reference_source: 'lab_report',
    }))

  const reihen = zuReihen(werte)
  assert.equal(reihen.length, 1, 'Vier Messungen eines Markers sind eine Reihe.')
  assert.equal(reihen[0].messungen.length, 4)

  // ALT → NEU: die Sparkline und die Trendrechnung lesen aufsteigend.
  assert.deepEqual(reihen[0].messungen.map(m => m.wert), [88, 94, 99, 102])
  // Die juengste Messung traegt die Zeile.
  assert.equal(reihen[0].aktuell.wert, 102)
  assert.equal(reihen[0].aktuell.datum, '2026-08-18')
  // 102 liegt ueber 99 — eine Ortsangabe, kein Urteil.
  assert.equal(reihen[0].lage, 'darueber')
})

test('ein Marker ohne LOINC faellt nicht mit einem anderen zusammen', () => {
  // `[cmd]` DER FALL, DER DEN RUECKFALL NOETIG MACHT: zwei der 140
  // Werte haben keinen Code (`ambiguous` und `unknown`). Ohne Rueckfall
  // auf den Namen lagen sie in einem gemeinsamen `null`-Topf und
  // erschienen als EIN Marker mit zwei Namen — ein Datenverlust, den
  // niemand bemerkt.
  const reihen = zuReihen([
    wert({ id: 'a', report_date: '2026-08-19', marker_name: 'Glucose [Mass/volume] in Serum or Plasma', value_numeric: 102 }),
    wert({ id: 'b', report_date: '2026-08-19', marker_name: 'Unbekannter Marker X', value_numeric: 42, unit: 'U/L' }),
  ])
  assert.equal(reihen.length, 2, 'Zwei codelose Marker sind zwei Reihen, nicht eine.')
  // `[read]` Tom: „Wenn Daten importiert werden und wir die nicht in
  // der DB haben, kommt nichts." — der Marker steht trotzdem da.
  assert.ok(reihen.some(r => r.name === 'Unbekannter Marker X'))
  // Ohne Bereich ist die Lage `unbekannt`, nicht `im_bereich`.
  assert.equal(reihen.find(r => r.name === 'Unbekannter Marker X')!.lage, 'unbekannt')
})

test('der Trend rechnet erste gegen letzte Messung', () => {
  // 88 → 102 sind +15,9 %.
  assert.equal(trendProzent([
    messung(88, '2026-02-18'), messung(94, '2026-04-18'),
    messung(99, '2026-06-18'), messung(102, '2026-08-18'),
  ]), 15.9)

  // Fallend: 5,4 → 5,2 sind −3,7 %.
  assert.equal(trendProzent([messung(5.4, 'a'), messung(5.2, 'b')]), -3.7)

  // Ein einzelner Punkt ist kein Trend.
  assert.equal(trendProzent([messung(42, 'a')]), null)
  // Und `null`-Werte zaehlen nicht mit.
  assert.equal(trendProzent([messung(null, 'a'), messung(7, 'b')]), null)
  // Ausgangswert 0: die relative Aenderung ist nicht definiert —
  // `null` statt Unendlich.
  assert.equal(trendProzent([messung(0, 'a'), messung(5, 'b')]), null)
})

test('der Bereichsbalken schliesst den eigenen Wert immer ein', () => {
  // `[cmd]` Die Attrappe spannt von `critical_low` bis `critical_high`;
  // diese Spalten gibt es in `lab_result_values` nicht. Gespannt wird
  // ueber Bereich UND Wert — ein Wert ausserhalb des Laborbereichs
  // muss trotzdem im Balken sichtbar sein, sonst zeigt der Balken
  // ausgerechnet den auffaelligen Fall nicht.
  const reihen = zuReihen([wert({
    id: 'g', report_date: '2026-08-18', loinc_code: '1558-6',
    marker_name: 'Glucose (fasting)', value_numeric: 102,
    reference_low: 70, reference_high: 99, reference_source: 'lab_report',
  })])
  const s = balkenSkala(reihen[0])
  assert.ok(s, 'Ohne Skala kein Balken.')
  assert.ok(s!.von < 70 && s!.bis > 102,
    `Der Balken (${s!.von}–${s!.bis}) schliesst 102 nicht ein.`)
  assert.deepEqual(s!.lab, [70, 99])
  assert.equal(s!.wert, 102)

  // Ohne Wert kein Balken — ein Textwert hat keine Position.
  const ohneZahl = zuReihen([wert({
    id: 't', report_date: '2026-08-18', marker_name: 'Befund', value_text: 'negativ',
  })])
  assert.equal(balkenSkala(ohneZahl[0]), null)
})

test('eine offene Grenze laeuft bis an den Rand, nicht bis 0', () => {
  // `[cmd]` 410 der 464 Bereichszeilen tragen nur Text, darunter
  // Formen wie „<5.7%" und „>40 mg/dL". Ein Band mit nur `high` sagt
  // ueber unten NICHTS — es darf deshalb nicht bei 0 anfangen und so
  // eine Untergrenze behaupten, die niemand gemessen hat.
  const reihen = zuReihen([wert({
    id: 'h', report_date: '2026-08-18', loinc_code: '4548-4',
    marker_name: 'HbA1c', unit: '%', value_numeric: 5.4,
    reference_text: '<5.7', reference_source: 'lab_report',
  })])
  const s = balkenSkala(reihen[0])
  assert.ok(s, 'Ohne Skala kein Balken.')
  assert.equal(s!.lab![0], s!.von, 'Das offene Band faengt nicht am Balkenanfang an.')
  assert.equal(s!.lab![1], 5.7)
})
