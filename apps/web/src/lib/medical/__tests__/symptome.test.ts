// G-207: Symptome, Zuordnungen — und die Luecken, die sichtbar
// bleiben muessen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { zuordnungenAus, fuerSymptom, LEERER_STAND } from '../symptome'

const MARKER = new Map([
  ['lab_ferritin', { analyte: 'Ferritin', kategorie: 'blood' }],
  ['lab_tsh', { analyte: 'TSH', kategorie: 'hormones' }],
])
const SYMPTOME = new Set(['sym_fatigue'])

test('G-207: eine gueltige Zuordnung wird aufgeloest', () => {
  const { zuordnungen, befunde } = zuordnungenAus([{
    symptom_id: 'sym_fatigue', marker_id: 'lab_ferritin',
    biomarker_loinc_code: '2276-4', relation_type: 'DIFFERENTIAL_RELEVANCE',
    specificity: 'MODERATE', reason_de: 'Latenter Eisenmangel.',
  }], MARKER, SYMPTOME)

  assert.equal(zuordnungen.length, 1)
  assert.equal(zuordnungen[0].analyte, 'Ferritin')
  assert.equal(zuordnungen[0].markerUnbekannt, false)
  assert.equal(zuordnungen[0].grund, 'Latenter Eisenmangel.')
  assert.deepEqual(befunde, [])
})

test('G-207: ein unbekannter Marker wird BENANNT, nicht verschluckt', () => {
  // ══ DIE KERNZUSAGE DES AUFTRAGS ═════════════════════════════════
  //
  // **Auftrag:** *„Eine Zuordnung auf einen Biomarker, den der
  // Katalog nicht kennt … in der Konstante faellt sie nie auf."*
  //
  // `[cmd]` **So war es:** `tab-tracking.tsx:114` loeste gegen
  // `BIOMARKERS` auf und warf mit `.filter(Boolean)` weg, was nicht
  // passte. **Eine falsche Zuordnung sah aus wie gar keine.**
  const { zuordnungen, befunde } = zuordnungenAus([{
    symptom_id: 'sym_fatigue', marker_id: 'lab_erfunden',
    biomarker_loinc_code: '1-1', specificity: 'HIGH', reason_de: 'x',
  }], MARKER, SYMPTOME)

  assert.equal(zuordnungen.length, 1,
    'Die Zeile darf nicht verschwinden — sie ist der Befund.')
  assert.equal(zuordnungen[0].markerUnbekannt, true)
  assert.equal(zuordnungen[0].analyte, null)
  assert.deepEqual(befunde, [{
    art: 'marker_unbekannt', symptom_id: 'sym_fatigue',
    marker_id: 'lab_erfunden',
  }])
})

test('G-207: ein unbekanntes Symptom ebenso', () => {
  // `[cmd]` **49 der 102 Zeilen tragen
  // `symptom_match_status = symptom_not_in_catalog`** — die Tabelle
  // weiss es selbst. Der Leseweg zaehlt es mit.
  const { zuordnungen, befunde } = zuordnungenAus([{
    symptom_id: 'sym_gibtsnicht', marker_id: 'lab_tsh',
    biomarker_loinc_code: '3016-3',
  }], MARKER, SYMPTOME)

  assert.equal(zuordnungen[0].symptomUnbekannt, true)
  assert.equal(befunde.some(b => b.art === 'symptom_unbekannt'), true)
})

test('G-207: eine fehlende LOINC-Kennung ist ein Befund', () => {
  // `[cmd]` 6 von 102 tragen keine.
  const { befunde } = zuordnungenAus([{
    symptom_id: 'sym_fatigue', marker_id: 'lab_tsh',
    biomarker_loinc_code: '  ',
  }], MARKER, SYMPTOME)
  assert.equal(befunde.some(b => b.art === 'ohne_loinc'), true)
})

test('G-207: HIGH steht vor MODERATE vor LOW', () => {
  // `[read]` Wer auf ein Symptom klickt, will die aussagekraeftigste
  // Messung zuerst — nicht die alphabetisch erste.
  const { zuordnungen } = zuordnungenAus([
    { symptom_id: 's', marker_id: 'lab_tsh', specificity: 'LOW' },
    { symptom_id: 's', marker_id: 'lab_ferritin', specificity: 'HIGH' },
  ], MARKER, new Set(['s']))
  const sortiert = fuerSymptom(
    { ...LEERER_STAND, zuordnungen }, 's')
  assert.deepEqual(sortiert.map(z => z.spezifitaet), ['HIGH', 'LOW'])
})

test('G-207: Zeilen ohne Kennung werden uebergangen', () => {
  const { zuordnungen } = zuordnungenAus(
    [{ symptom_id: null, marker_id: 'lab_tsh' },
     { symptom_id: 'sym_fatigue', marker_id: '' }],
    MARKER, SYMPTOME)
  assert.equal(zuordnungen.length, 0)
})

test('G-207: der Leseweg ist verdrahtet', () => {
  // `[read]` **Siebter Fall derselben Pruefung** (G-184/186/187/191/
  // 196/199): eine Funktion, die niemand aufruft, besteht jeden
  // Funktionstest.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const lesen = roh('src/lib/medical/lesen.ts')

  assert.match(lesen, /zuordnungenAus\(/,
    'Der Leseweg ruft die Aufloesung nicht auf (G-207).')
  for (const t of ['symptoms', 'symptom_biomarker_map', 'lab_marker_catalog']) {
    assert.ok(new RegExp(`\\.from\\('${t}'\\)`).test(lesen),
      `Der Leseweg liest \`${t}\` nicht (G-207).`)
  }
})
