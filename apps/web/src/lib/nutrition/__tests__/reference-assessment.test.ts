// C-48-Regeln, an der Schnittstelle zur Oberflaeche festgehalten.
//
// [read] Die vier Regeln aus C-48 sind bindend. Drei davon lassen sich
// hier pruefen, ohne eine Datenbank zu brauchen — die vierte
// ("100 % heisst nicht genug fuer dich") ist eine Aussage im Text, kein
// Rechenweg.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseAssessmentRows } from '../reference-assessment-read'
import { bewerte } from '@lumeos/ui'

// --- Regel 1: Fehlzaehler duerfen nicht zu Nullen werden ----------

test('ein fehlender Prozentwert bleibt null und wird nicht 0', () => {
  const [zeile] = parseAssessmentRows([{
    nutrient_code: 'VITA',
    nutrient_name_de: 'Vitamin A',
    nutrient_unit: 'ug',
    actual_value: '420',
    missing_count: 2,
    value_complete: false,
    reference_pct: null,
    reference_status: 'incomplete',
  }])

  assert.equal(zeile.reference_pct, null,
    'null darf nicht zu 0 werden — sonst liest sich "unvollstaendig" wie "nichts gegessen"')
  assert.equal(zeile.missing_count, 2)
  assert.equal(zeile.value_complete, false)
  assert.equal(zeile.reference_status, 'incomplete')
})

test('actual_value null bleibt null', () => {
  const [zeile] = parseAssessmentRows([{
    nutrient_code: 'VITD',
    actual_value: null,
    missing_count: 0,
    reference_status: 'no_value',
  }])
  assert.equal(zeile.actual_value, null, 'nichts gemessen ist nicht null Mikrogramm')
})

test('numeric als String kommt als Zahl an', () => {
  // PostgREST liefert numeric als String, damit keine Praezision
  // verloren geht. Ein String im Prozentfeld wuerde in der Anzeige
  // stumm zu NaN.
  const [zeile] = parseAssessmentRows([{
    nutrient_code: 'FE',
    actual_value: '12.5',
    reference_pct: '83.3',
    missing_count: 0,
    reference_status: 'complete',
  }])
  assert.equal(zeile.actual_value, 12.5)
  assert.equal(zeile.reference_pct, 83.3)
})

// --- Regel 2: Die Wertart entscheidet die Leserichtung ------------

test('80 % eines Ziels ist zu wenig, 80 % einer Obergrenze ist gut', () => {
  const ziel = bewerte('target', 80)
  const grenze = bewerte('upper_limit', 80)

  assert.equal(ziel.ton, 'warn', '80 % eines PRI sind noch nicht erreicht')
  assert.equal(grenze.ton, 'pos', '80 % eines UL sind unbedenklich')
  assert.notEqual(ziel.ton, grenze.ton,
    'Dieselbe Zahl darf bei Ziel und Obergrenze nicht gleich gelesen werden')
})

test('ueber der Obergrenze ist ein Warnzeichen, ueber dem Ziel nicht', () => {
  assert.equal(bewerte('upper_limit', 110).ton, 'neg')
  assert.equal(bewerte('target', 110).ton, 'pos')
})

// --- Regel 3: kein Referenzwert ist kein "0 %" --------------------

test('ohne Prozentwert gibt es keine Bewertung', () => {
  for (const richtung of ['target', 'upper_limit', 'range', 'not_applicable'] as const) {
    const r = bewerte(richtung, null)
    assert.equal(r.ton, 'neutral', `${richtung} ohne Wert darf nicht bewertet werden`)
    assert.equal(r.text, '')
  }
})

test('not_applicable wird nie eingefaerbt', () => {
  // [cmd] 57 Naehrstoffe gehen in einem Sammelwert auf, 21 haben keinen
  // Referenzwert. Ein gruener oder roter Balken waere dort erfunden.
  assert.equal(bewerte('not_applicable', 95).ton, 'neutral')
})

test('unbekannte Status kommen nicht als leerer String durch', () => {
  const [zeile] = parseAssessmentRows([{ nutrient_code: 'X', reference_status: '' }])
  assert.equal(zeile.reference_status, 'no_applicable_reference',
    'ein leerer Status wuerde in der Anzeige zu einer leeren Zelle')
})

test('Zeilen ohne Naehrstoffcode fallen raus', () => {
  const zeilen = parseAssessmentRows([{ nutrient_code: '' }, null, 'kaputt', { nutrient_code: 'FE' }])
  assert.equal(zeilen.length, 1)
  assert.equal(zeilen[0].nutrient_code, 'FE')
})

// --- Gegen echte Zeilen ------------------------------------------
// `[cmd]` Diese Werte stammen aus einem Lauf gegen die
// Wegwerf-Datenbank `lumeos_g03` (Kette von leer, zwei Positionen: eine
// vollstaendig, eine ohne Eisen). Sie sind abgeschrieben, nicht
// erfunden — damit der Test an dem haengt, was die Datenbank wirklich
// liefert, und nicht an meiner Vorstellung davon.
test('gemessene Zeilen aus lumeos_g03 werden richtig gelesen', () => {
  const zeilen = parseAssessmentRows([
    // VITC einmal als Ziel, einmal als Obergrenze — dieselbe Menge.
    { nutrient_code: 'VITC', actual_value: '120', missing_count: 0,
      reference_kind: 'PRI', reference_direction: 'target',
      reference_pct: '109.1', reference_status: 'complete' },
    { nutrient_code: 'VITC', actual_value: '120', missing_count: 0,
      reference_kind: 'UL', reference_direction: 'upper_limit',
      reference_pct: '6.0', reference_status: 'complete' },
    // FE: eine Position ohne Wert -> kein Prozentwert.
    { nutrient_code: 'FE', actual_value: '14.0', missing_count: 1,
      reference_kind: 'PRI', reference_direction: 'target',
      reference_pct: null, reference_status: 'incomplete' },
    // ENERCC: vollstaendig, aber FORMULA -> trotzdem kein Prozentwert.
    { nutrient_code: 'ENERCC', actual_value: '500.0000', missing_count: 0,
      reference_kind: 'FORMULA', reference_direction: 'target',
      reference_pct: null, reference_status: 'complete' },
  ])

  const [zielC, grenzeC, eisen, energie] = zeilen

  // Regel 2 an echten Zahlen: dieselben 120 mg, zwei Lesarten.
  assert.equal(zielC.actual_value, grenzeC.actual_value)
  assert.equal(bewerte('target', zielC.reference_pct).ton, 'pos', '109 % des PRI ist erreicht')
  assert.equal(bewerte('upper_limit', grenzeC.reference_pct).ton, 'pos', '6 % des UL ist unbedenklich')

  // Regel 1: Eisen hat einen Wert, aber keinen Prozentwert.
  assert.equal(eisen.actual_value, 14)
  assert.equal(eisen.reference_pct, null)
  assert.equal(eisen.missing_count, 1)
  assert.equal(bewerte('target', eisen.reference_pct).ton, 'neutral',
    'ohne Prozentwert darf nichts eingefaerbt werden')

  // Regel 3: vollstaendig, aber ohne Referenz -> ebenfalls kein Prozent.
  assert.equal(energie.reference_status, 'complete')
  assert.equal(energie.reference_pct, null)
})


// --- GO-00 Teil 2: fremde Bezugsgroessen ---------------------------
// `[cmd]` 16 der 109 Referenzzeilen stehen nicht je Tag. Vorher hat die
// Funktion sie behandelt, als staenden sie es — Protein zeigte 1.593 %.

test('ein Wert je Kilogramm liefert einen absoluten Referenzwert', () => {
  // `[cmd]` Gemessen: PROT625 hat 0,83 g/kg, das Profil 78,4 kg.
  // 0,83 x 78,4 = 65,072 g/Tag; 20,66 g davon sind 31,7 %.
  const [z] = parseAssessmentRows([{
    nutrient_code: 'PROT625',
    actual_value: '20.66',
    reference_value_min: '65.072',
    reference_unit: 'g',
    reference_pct: '31.7',
    reference_status: 'complete',
    missing_count: 0,
  }])
  assert.equal(z.reference_value_min, 65.072,
    'Der Referenzwert muss aufgeloest ankommen, nicht als 0,83')
  assert.equal(z.reference_pct, 31.7)
  assert.equal(bewerte('target', z.reference_pct).ton, 'neg',
    '31,7 % eines Ziels sind deutlich darunter')
})

test('ohne Gewicht gibt es keinen Prozentwert und keinen Ersatz', () => {
  // `[read]` Kein Standardgewicht. Ein erfundener Nenner waere
  // schlimmer als keine Zahl — er sieht aus wie eine Messung.
  const [z] = parseAssessmentRows([{
    nutrient_code: 'PROT625',
    actual_value: '20.66',
    reference_value_min: null,
    reference_pct: null,
    reference_status: 'missing_weight',
    missing_count: 0,
  }])
  assert.equal(z.reference_pct, null)
  assert.equal(z.reference_value_min, null,
    'Auch der Referenzwert bleibt leer — 0,83 waere hier irrefuehrend')
  assert.equal(z.reference_status, 'missing_weight')
  assert.equal(bewerte('target', z.reference_pct).ton, 'neutral')
})

test('ein Energieanteil wird nicht als Deckungsgrad gezeigt', () => {
  // `[read]` E% ist eine Aussage ueber die Energieverteilung, keine
  // Naehrstoffmenge. GO-02 rechnet das beim Zielwert.
  for (const code of ['FAT', 'CHO']) {
    const [z] = parseAssessmentRows([{
      nutrient_code: code,
      actual_value: '36.46',
      reference_pct: null,
      reference_status: 'energy_share',
      missing_count: 0,
    }])
    assert.equal(z.reference_pct, null, `${code} darf keinen Prozentwert haben`)
    assert.equal(z.reference_status, 'energy_share')
  }
})

test('eine Naehrstoffdichte wird nicht als Deckungsgrad gezeigt', () => {
  const [z] = parseAssessmentRows([{
    nutrient_code: 'THIA',
    actual_value: '0.6172',
    reference_pct: null,
    reference_status: 'nutrient_density',
    missing_count: 0,
  }])
  assert.equal(z.reference_pct, null)
  assert.equal(z.reference_status, 'nutrient_density')
})

test('die drei neuen Zustaende faerben nichts ein', () => {
  // Sie stehen fuer "kein Prozentwert moeglich", nicht fuer "schlecht".
  for (const s of ['missing_weight', 'energy_share', 'nutrient_density'] as const) {
    const [z] = parseAssessmentRows([{
      nutrient_code: 'X', reference_status: s, reference_pct: null,
    }])
    assert.equal(z.reference_status, s)
    assert.equal(bewerte('target', z.reference_pct).ton, 'neutral')
  }
})
