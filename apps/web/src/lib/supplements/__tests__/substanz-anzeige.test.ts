// C-224: Waechter ueber die Substanz-Detailansicht — in BEIDE
// Richtungen.
//
// Richtung 1: jedes angezeigte Feld traegt seinen Herkunftsvermerk aus
// `evidence_provenance`. Richtung 2: ein Wert OHNE Vermerk wird
// gemeldet (`ohneHerkunft`), nicht still angezeigt — und Leeres
// erzeugt gar kein Feld, keinen Platzhalter, keinen Strich.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  baueBloecke, benannteLuecken, herkunftFuer, ohneHerkunft,
} from '../substanz-anzeige'
import type { SubstanzSatz } from '../substanz-read'

/** Eine Substanz in der Form der Kimi-Saetze (crawl 024B). */
function satz(teil: Partial<SubstanzSatz> = {}): SubstanzSatz {
  return {
    id: 'sub_test',
    canonical_name: 'Testin',
    domain: 'kimi_supplement',
    compound_type: 'vitamin',
    category: null,
    subcategory: null,
    chemical_form: null,
    aliases: [],
    cas_number: '50-00-0',
    external_ids: { UNII: 'X1', PubChem_CID: 1234 },
    evidence: { overall_grade: 'A', summary: 'gut belegt' },
    dosing: null,
    pharmacology: { half_life: '3 h', bioavailability: 'hoch' },
    half_life: null,
    half_life_status: null,
    cyp: null,
    safety: {
      contraindications: ['Nierenerkrankung'],
      common_side_effects: [],  // leer -> darf NICHT erscheinen
      pregnancy: null,          // null -> darf NICHT erscheinen
    },
    warning_triggers: {
      dose_ceiling: '40 IU/day (legal ceiling, DE)',  // Freitext, roh
    },
    evidence_provenance: {
      'safety.contraindications': { source_id: 'src_a', evidence_class: 'B', as_of: '2026-08-20' },
      pharmacology: { source_id: 'src_b', evidence_class: 'C', as_of: '2026-08-20' },
      'external_ids.UNII': { source_id: 'src_c', evidence_class: 'B', as_of: '2026-08-20' },
      'external_ids.PubChem_CID': { source_id: 'src_c', evidence_class: 'B', as_of: '2026-08-20' },
      cas_number: { source_id: 'src_c', evidence_class: 'B', as_of: '2026-08-20' },
      'warning_triggers.dose_ceiling': { source_id: 'src_d', evidence_class: 'D', as_of: '2026-08-20' },
      evidence: { source_id: 'src_e', evidence_class: 'A', as_of: '2026-08-20' },
    },
    missing_reason: { interactions: 'not_researched_in_crawl_024B' },
    ...teil,
  }
}

test('jedes angezeigte Feld traegt seinen Herkunftsvermerk', () => {
  const bloecke = baueBloecke(satz())
  assert.ok(bloecke.length >= 4, 'Sicherheit, Pharmakokinetik, Warnschwellen, Kennungen, Evidenz')
  assert.deepEqual(ohneHerkunft(bloecke), [],
    'Kein Feld darf ohne evidence_provenance-Vermerk stehen.')
  // Der Vermerk ist der echte, nicht ein erfundener.
  const sicher = bloecke.find(b => b.titel === 'Sicherheit')!
  assert.equal(sicher.felder[0].herkunft?.source_id, 'src_a')
  assert.equal(sicher.felder[0].herkunft?.evidence_class, 'B')
})

test('ein Wert ohne Herkunft wird gemeldet, nicht still gezeigt', () => {
  // Dieselbe Substanz, aber die Registry kennt die Kontraindikationen
  // nicht — genau der Fall, den der Auftrag rot sehen will.
  const kaputt = satz()
  delete kaputt.evidence_provenance!['safety.contraindications']
  const offen = ohneHerkunft(baueBloecke(kaputt))
  assert.deepEqual(offen, ['safety.contraindications'])
})

test('Leeres erzeugt kein Feld — kein Platzhalter, kein Strich', () => {
  const bloecke = baueBloecke(satz())
  const sicher = bloecke.find(b => b.titel === 'Sicherheit')!
  // `common_side_effects: []` und `pregnancy: null` fehlen ganz.
  assert.deepEqual(sicher.felder.map(f => f.pfad), ['safety.contraindications'])
  for (const b of bloecke) {
    for (const f of b.felder) {
      assert.ok(f.zeilen.length > 0, `${f.pfad} ohne Zeilen`)
      assert.ok(!f.zeilen.some(z => z === '—' || z === 'null' || z === ''),
        `${f.pfad} traegt einen Platzhalter`)
    }
  }
})

test('fehlt der ganze Block (31-Spalten-Stand), entsteht er nicht', () => {
  // So sieht der Satz aus, solange der Pipeline-Lauf c9c741f nicht
  // live ist: safety/interactions/regulatory/quality fehlen als
  // Spalten, `select('*')` liefert sie als undefined.
  const alt = satz({
    safety: undefined, warning_triggers: undefined,
    evidence_provenance: undefined, missing_reason: undefined,
  })
  const titel = baueBloecke(alt).map(b => b.titel)
  assert.ok(!titel.includes('Sicherheit'))
  assert.ok(!titel.includes('Warnschwellen'))
  assert.ok(titel.includes('Pharmakokinetik'), 'Was da ist, erscheint weiter.')
})

test('dose_ceiling bleibt Freitext, wie er dasteht', () => {
  const warn = baueBloecke(satz()).find(b => b.titel === 'Warnschwellen')!
  assert.deepEqual(warn.felder[0].zeilen, ['40 IU/day (legal ceiling, DE)'])
})

test('missing_reason wird als benannte Luecke gefuehrt', () => {
  assert.deepEqual(benannteLuecken(satz()),
    [{ feld: 'interactions', grund: 'not_researched_in_crawl_024B' }])
})

test('die Blocksuche findet erst den Pfad, dann den Block, sonst nichts', () => {
  const prov = {
    'a.b': { source_id: 's1', evidence_class: 'A', as_of: 'x' },
    a: { source_id: 's2', evidence_class: 'B', as_of: 'x' },
  }
  assert.equal(herkunftFuer(prov, 'a.b')?.source_id, 's1')
  assert.equal(herkunftFuer(prov, 'a.c')?.source_id, 's2')
  assert.equal(herkunftFuer(prov, 'z.y'), null)
  assert.equal(herkunftFuer(null, 'a.b'), null)
})
