// G-191: die Dosisfelder sind Objekte, keine Texte.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { dosisFeld, dosisFelder, grundAufDeutsch } from '../dosis-feld'

test('G-191: value null ergibt KEINEN Wert, sondern den Grund', () => {
  // `[cmd]` Das Objekt von Astaxanthin, woertlich aus der Datenbank.
  const f = dosisFeld({
    value: null,
    source_ids: [],
    missing_reason: 'No validated clinical guideline dose (no position '
      + 'stand/clinical practice guideline with a specific supplemental dose)',
    provenance_type: 'CLINICAL_GUIDELINE',
  })
  assert.equal(f.wert, null, 'Ein Grund darf nie als Menge erscheinen.')
  assert.equal(f.grund, 'Keine Leitlinie nennt eine Dosis.')
})

test('G-191: der Statuscode taucht nirgends auf', () => {
  // `[read]` Der eigentliche Befund: `provenance_type` stand in der
  // Kachel, weil die alte Fassung alle Objektwerte verkettete.
  const f = dosisFeld({
    value: null, missing_reason: 'NO_RELIABLE_EVIDENCE: no reliable human '
      + 'dose-finding/clinical trial dosing located in this crawl',
    provenance_type: 'TRIAL_EXPOSURE',
  })
  assert.equal(f.wert, null)
  assert.equal(/TRIAL_EXPOSURE|NO_RELIABLE_EVIDENCE/.test(f.grund ?? ''), false,
    'Ein Statuscode gehoert nicht vor den Nutzer.')
  assert.equal(f.grund, 'Keine belastbare Studie zur Dosierung gefunden.')
})

test('G-191: ein echter Wert kommt durch', () => {
  const f = dosisFeld({ value: '3–5 g/day', missing_reason: null })
  assert.equal(f.wert, '3–5 g/day')
  assert.equal(f.grund, null)
})

test('G-191: strukturierte Spannen werden nicht flachgeklopft', () => {
  // `[cmd]` **Der zweite Fehler.** Aus Beta-Carotin machte die alte
  // Fassung „50 · 15 · mg/day · years (ATBC 20 mg; …)" — zusammenhanglose
  // Zahlen aus `min`, `max`, `units` UND `duration`.
  const f = dosisFeld({
    value: [{
      min: 20, max: 30, units: 'mg/day', duration: 'years',
      population: 'adults, incl. smokers', route_form: 'oral',
      source_ids: [{ pmid: '123' }], provenance_type: 'TRIAL_EXPOSURE',
    }],
    missing_reason: null,
  })
  assert.equal(f.wert, '20–30 mg/day')
})

test('G-191: min gleich max ergibt eine Zahl, keine Spanne', () => {
  const f = dosisFeld({ value: [{ min: 0.03, max: 0.03, units: 'mg/kg' }] })
  assert.equal(f.wert, '0.03 mg/kg')
})

test('G-191: hoechstens zwei Spannen', () => {
  const f = dosisFeld({
    value: [
      { min: 1, max: 2, units: 'mg' },
      { min: 3, max: 4, units: 'mg' },
      { min: 5, max: 6, units: 'mg' },
    ],
  })
  assert.equal(f.wert, '1–2 mg · 3–4 mg', 'Drei Spannen sprengen die Kachel.')
})

test('G-191: ein leeres Array ergibt nichts', () => {
  // `[cmd]` **276 von 482** `studied_dose_ranges` sind `[]`.
  assert.deepEqual(dosisFeld([]), { wert: null, grund: null })
  assert.deepEqual(dosisFeld(null), { wert: null, grund: null })
})

test('G-191: substanzeigene Gruende bleiben stehen', () => {
  // `[read]` **21 der 857 Belege sind eigene Saetze.** Sie werden
  // NICHT abgebildet — sie tragen echte Information, und eine
  // ausgedachte Ersatzformel waere schlechter als ein englischer Satz.
  const eigen = 'No IOM/EFSA UL; historical EMS outbreak linked to '
    + 'contaminated tryptophan (1989), not dose-based UL'
  assert.equal(grundAufDeutsch(eigen), eigen)
})

test('G-191: studiert schlaegt Leitlinie, Grund nur ohne jeden Wert', () => {
  const mitWert = dosisFelder({
    studied_dose_ranges: { value: [{ min: 3, max: 5, units: 'g/day' }] },
    guideline_dose: { value: null, missing_reason: 'NO_RELIABLE_EVIDENCE: x' },
  })
  assert.equal(mitWert.menge.wert, '3–5 g/day')
  assert.equal(mitWert.menge.grund, null,
    'Neben einem Wert darf kein Grund stehen — das war die Vermischung.')

  const ohne = dosisFelder({
    studied_dose_ranges: [],
    guideline_dose: {
      value: null,
      missing_reason: 'No validated clinical guideline dose (x)',
    },
  })
  assert.equal(ohne.menge.wert, null)
  assert.equal(ohne.menge.grund, 'Keine Leitlinie nennt eine Dosis.')
})

test('G-191: Testosterone Enanthate bleibt leer', () => {
  // `[cmd]` Beide Felder sind dort NULL. Der Auftrag: **darf sich
  // nicht aendern.**
  const f = dosisFelder({
    studied_dose_ranges: [], guideline_dose: null, upper_limit: null,
  })
  assert.deepEqual(f.menge, { wert: null, grund: null })
  assert.deepEqual(f.obergrenze, { wert: null, grund: null })
})

test('G-191: die Anzeige ist mit der Lesefunktion verdrahtet', () => {
  // `[read]` **Die Funktion allein genuegt nicht** — sie muss auch
  // aufgerufen werden. Derselbe blinde Fleck wie in G-186/G-187.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')

  const tafel = roh('src/app/v2/supplements/substanz-tafel.tsx')
  assert.match(tafel, /dosisFelder\s*\(/,
    'Die Tafel liest die Dosisfelder nicht ueber `dosisFelder` (G-191).')
  assert.equal(/Object\.values\(o\)\.map\(jsonWert\)/.test(tafel), false,
    'Der alte Rueckfall auf alle Objektwerte ist zurueck — er hat den '
    + 'Grund in die Kachel geschrieben (G-191).')

  const abschnitte = roh('src/app/v2/supplements/substanz-abschnitte.tsx')
  assert.match(abschnitte, /grund/,
    'Die Kachel zeigt den Grund nicht (G-191, Punkt 2).')
})
