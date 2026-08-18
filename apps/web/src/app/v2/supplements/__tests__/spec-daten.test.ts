// Die uebernommenen Daten der Spec-Tabs (G-45).
//
// WARUM: `[cmd]` 226 Zeilen mechanisch uebernommen. Wenn beim
// Uebernehmen ein Eintrag verlorengeht, faellt das am Bildschirm nicht
// auf — eine Tabelle mit 43 statt 44 Zeilen sieht vollstaendig aus.
// Dieselbe Klasse Fehler wie beim Naehrstoffbaum (G-12) und beim
// STACK (G-33).
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  CATALOG, EVIDENCE_GRADES, EVIDENCE_WEIGHT, gradeMeta,
  INTERACTION_DB, INVENTORY, BLOODWORK_PANEL, STACK_TEMPLATES,
  USER_STACKS, FREQUENCY_OPTIONS, ENHANCED_CATEGORIES,
} from '../spec-daten'

test('der Katalog der Vorlage ist vollstaendig uebernommen', () => {
  // `[cmd]` module-supplements-spec.jsx:17-174 fuehrt **34** Eintraege.
  //
  // NICHT 44: Der Auftrag nennt „44 Katalogeintraege" — die stehen in
  // der DATENBANK (Schema seit C-68), nicht in der Vorlage. Die erste
  // Fassung dieses Tests hat die 44 ungeprueft uebernommen und schlug
  // fehl; nachgezaehlt sind es in der Vorlage 34, und genau 34 sind
  // uebernommen. **Die Zahl im Auftragstext war kein Sollwert fuer das
  // Mockup.**
  assert.equal(CATALOG.length, 34,
    `${CATALOG.length} Katalogeintraege statt 34. Beim Uebernehmen verloren?`)
  // Jeder Eintrag braucht die Felder, nach denen die Tabs filtern.
  for (const c of CATALOG) {
    assert.ok(c.id, 'Eintrag ohne id')
    assert.ok(c.name, `${c.id}: kein name`)
    assert.ok(c.mode === 'standard' || c.mode === 'enhanced', `${c.id}: mode "${c.mode}"`)
    assert.ok(c.grade, `${c.id}: keine Evidenzstufe`)
  }
})

test('beide Modi sind im Katalog vertreten', () => {
  // [cmd] Der Catalog-Tab filtert auf `standard` / `enhanced`. Faellt
  // eine Haelfte weg, ist ein Filter leer — und das sieht aus wie
  // „nichts gefunden", nicht wie ein Datenverlust.
  const std = CATALOG.filter(c => c.mode === 'standard').length
  const enh = CATALOG.filter(c => c.mode === 'enhanced').length
  assert.ok(std > 0, 'keine Standard-Eintraege')
  assert.ok(enh > 0, 'keine Enhanced-Eintraege')
  assert.equal(std + enh, 34, `${std} + ${enh} ergibt nicht 34`)
})

test('die sechs Evidenzstufen und ihre Gewichte', () => {
  // [cmd] module-supplements-spec.jsx:5-12.
  assert.deepEqual(EVIDENCE_GRADES.map(e => e.g), ['S', 'A', 'B', 'C', 'D', 'F'])
  assert.equal(EVIDENCE_WEIGHT.S, 1.0)
  assert.equal(EVIDENCE_WEIGHT.F, 0.0)
  // Der Rueckfall der Vorlage: unbekannte Stufe -> Index 3 (`C`).
  assert.equal(gradeMeta('gibtsnicht').g, 'C',
    'Der Rueckfall der Vorlage (EVIDENCE_GRADES[3]) hat sich geaendert.')
})

test('jede Katalogstufe gibt es auch in der Stufenliste', () => {
  // [cmd] Ein Eintrag mit einer Stufe, die es nicht gibt, faellt beim
  // Filtern still durch — `gradeMeta` gibt dann „C" zurueck und die
  // Zeile behauptet eine Evidenz, die sie nicht hat.
  const bekannt = new Set(EVIDENCE_GRADES.map(e => e.g))
  const unbekannt = CATALOG.filter(c => !bekannt.has(String(c.grade)))
  assert.deepEqual(unbekannt.map(c => `${c.id}:${c.grade}`), [],
    'Katalogeintraege mit unbekannter Evidenzstufe.')
})

test('die uebrigen Datenbloecke sind da', () => {
  // [cmd] Sie tragen die vier Spec-Tabs. Eine leere Liste sieht am
  // Bildschirm aus wie „noch nichts erfasst".
  assert.ok(INTERACTION_DB.length > 0, 'INTERACTION_DB leer')
  assert.ok(INVENTORY.length > 0, 'INVENTORY leer')
  assert.ok(BLOODWORK_PANEL.length > 0, 'BLOODWORK_PANEL leer')
  assert.ok(STACK_TEMPLATES.length > 0, 'STACK_TEMPLATES leer')
  assert.ok(USER_STACKS.length > 0, 'USER_STACKS leer')
  assert.ok(FREQUENCY_OPTIONS.length > 0, 'FREQUENCY_OPTIONS leer')
  assert.ok(ENHANCED_CATEGORIES.length > 0, 'ENHANCED_CATEGORIES leer')
})
