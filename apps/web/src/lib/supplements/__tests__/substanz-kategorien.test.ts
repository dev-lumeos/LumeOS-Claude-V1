// C-227: Waechter ueber Kategorienfilter und Farben — in BEIDE
// Richtungen.
//
// Richtung 1: der Filter zaehlt und filtert richtig (Fixtures, weil
// die Live-Spalte bis C-226 leer ist). Richtung 2: keine Farbe ist
// hartkodiert (nur `--kat-*`-Variablen, und jede davon steht in
// supplements.css), und keine Kategorie kommt ohne Textkennzeichnung
// aus.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  KATEGORIE_FARBEN, KAT_WEITERE_VAR, UNZUGEORDNET_ID, UNZUGEORDNET_TEXT,
  filtereGruppe, filtereKategorien, gruppeGesperrt, gruppeVon,
  kategorieFarbe, kategorieLabel, kategorieVon,
  zaehleGruppen, zaehleKategorien,
} from '../substanz-kategorien'
import { startOffen } from '../substanz-anzeige'

const CSS = path.join(process.cwd(), 'src/app/v2/supplements/supplements.css')
const DETAIL = path.join(process.cwd(), 'src/app/v2/supplements/substanz-detail.tsx')
const MODALE = path.join(process.cwd(), 'src/app/v2/supplements/modale.tsx')

// ── Richtung 1: der Filter ───────────────────────────────────────

/** Fixture in den Groessenverhaeltnissen der C-197-Zaehlung. */
const FIXTURE = [
  ...Array.from({ length: 3 }, () => ({ canonical_category: 'peptide' })),
  ...Array.from({ length: 2 }, () => ({ canonical_category: 'aas' })),
  { canonical_category: 'sarm' },           // kleine Kategorie -> Sammelfarbe
  { canonical_category: null },             // LumeOS-Eintrag ohne Kimi-Satz
  { canonical_category: '' },               // leer zaehlt wie null
]

test('die Zaehler sind gezaehlt: gross zuerst, unzugeordnet am Ende', () => {
  assert.deepEqual(zaehleKategorien(FIXTURE), [
    ['peptide', 3], ['aas', 2], ['sarm', 1], [UNZUGEORDNET_ID, 2],
  ])
})

test('Mehrfachauswahl vereinigt: Peptide UND SARMs zugleich', () => {
  assert.equal(filtereKategorien(FIXTURE, new Set(['peptide', 'sarm'])).length, 4)
  assert.equal(filtereKategorien(FIXTURE, new Set(['aas'])).length, 2)
  // Leere Auswahl heisst alle — nicht keiner.
  assert.equal(filtereKategorien(FIXTURE, new Set()).length, FIXTURE.length)
})

test('null ist unzugeordnet — ein eigener Zustand, keine Restklasse', () => {
  assert.equal(kategorieVon({ canonical_category: null }), UNZUGEORDNET_ID)
  assert.equal(filtereKategorien(FIXTURE, new Set([UNZUGEORDNET_ID])).length, 2)
  assert.match(UNZUGEORDNET_TEXT, /F-05/, 'Der Text sagt, WAS unzugeordnet heisst.')
  assert.match(UNZUGEORDNET_TEXT, /nicht .sonstige./)
})

// ── Richtung 2: Farben und Textpflicht ───────────────────────────

test('jede Farbe ist eine CSS-Variable, keine ist hartkodiert', () => {
  for (const [kat, cssVar] of Object.entries(KATEGORIE_FARBEN)) {
    assert.match(cssVar, /^--kat-[a-z]+$/, `${kat}: ${cssVar}`)
    assert.equal(kategorieFarbe(kat), `var(${cssVar})`)
  }
  // Unbekannte Kategorie: Sammelfarbe, aber ihr EIGENES Label.
  assert.equal(kategorieFarbe('dopamine_agonist'), `var(${KAT_WEITERE_VAR})`)
  assert.equal(kategorieLabel('dopamine_agonist'), 'dopamine agonist')
})

test('jede benutzte Variable steht in supplements.css — hell UND dunkel', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const variablen = Object.values(KATEGORIE_FARBEN).concat(KAT_WEITERE_VAR)
  for (const v of variablen) {
    const definitionen = css.split('\n').filter(z => z.trim().startsWith(`${v}:`)).length
    assert.equal(definitionen, 2,
      `${v}: ${definitionen} Definition(en) — erwartet 2 (Basis + data-theme="light").`)
  }
  // Und umgekehrt: keine --kat-Variable im CSS, die der Code nicht kennt.
  const imCss = Array.from(new Set(css.match(/--kat-[a-z]+(?=:)/g) ?? []))
  for (const v of imCss) {
    assert.ok(variablen.includes(v), `${v} steht im CSS, aber der Code kennt sie nicht.`)
  }
})

test('die Komponente traegt keine hartkodierte Kategoriefarbe und immer Text', () => {
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  // Kein Hex, kein oklch/rgb-Literal in der Komponente — Farben kommen
  // aus kategorieFarbe() und den Modul-Variablen.
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(quelle),
    'Hex-Farbe in substanz-detail.tsx — Kategorien nur ueber var(--kat-…).')
  assert.ok(!/oklch\(|rgb\(/.test(quelle),
    'Farb-Literal in substanz-detail.tsx — gehoert nach supplements.css.')
  // Die Kennzeichnung rendert das Label — Farbe ist nie allein.
  assert.ok(/kategorieLabel\(/.test(quelle), 'Die Textkennzeichnung fehlt.')
  assert.ok(/KategoriePill/.test(quelle))
})

// ── C-229: Gruppen, Klapp-Start, description, Add mit Stackwahl ──

test('C-229: die drei Gruppen zaehlen und filtern, das Gate sperrt', () => {
  // [cmd] C-228-Erwartung: supplement 307 · peptide 82 · enhanced 177.
  // Fixture in denselben Verhaeltnissen, klein.
  const liste = [
    ...Array.from({ length: 3 }, () => ({ gruppe: 'supplement' })),
    { gruppe: 'peptide' },
    ...Array.from({ length: 2 }, () => ({ gruppe: 'enhanced' })),
    { gruppe: null },   // noch ohne C-228-Lauf
  ]
  assert.deepEqual(zaehleGruppen(liste), { supplement: 3, peptide: 1, enhanced: 2 })
  assert.equal(gruppeVon({ gruppe: 'erfunden' }), null, 'Keine Gruppe wird erfunden.')
  // Gate zu (unter pro/elite): peptide/enhanced gesperrt, und der
  // Gesamtblick zeigt nur supplement + ungruppiert.
  assert.ok(gruppeGesperrt('peptide', false) && gruppeGesperrt('enhanced', false))
  assert.ok(!gruppeGesperrt('supplement', false))
  assert.equal(filtereGruppe(liste, null, false).length, 4)
  // Gate offen: alles; eine gewaehlte Gruppe: nur sie.
  assert.equal(filtereGruppe(liste, null, true).length, 7)
  assert.equal(filtereGruppe(liste, 'enhanced', true).length, 2)
})

test('C-229: jeder Block startet ZU', () => {
  assert.equal(startOffen().size, 0,
    'startOffen() muss leer sein — Tom: Zusatzinfos nur auf Wunsch.')
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  assert.ok(/useState<Set<string>>\(startOffen\)/.test(quelle),
    'Das Detail muss seinen Klappzustand aus startOffen() beziehen.')
  assert.ok(/<Klappe/.test(quelle) && !/aria-expanded/.test(quelle),
    'Das Klappen kommt aus packages/ui (Klappe), nicht selbstgebaut.')
})

test('C-229: das Detail zeigt die description VOR den Bloecken', () => {
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  const beschreibung = quelle.indexOf('satz.description')
  const bloecke = quelle.indexOf('<Klappe')
  assert.ok(beschreibung > -1, 'Das Detail rendert keine description.')
  assert.ok(bloecke > -1)
  assert.ok(beschreibung < bloecke,
    'Erst was es ist (description), DANN die Zusatzbloecke.')
})

test('C-229: der Add-Dialog sendet stack_id und zeigt die Stackwahl', () => {
  const quelle = fs.readFileSync(MODALE, 'utf8')
  const senden = quelle.indexOf("intake?was=position")
  const rumpfEnde = quelle.indexOf('})', senden)
  const rumpf = quelle.slice(senden, rumpfEnde + 400)
  assert.ok(/stack_id:/.test(rumpf),
    'Add sendet keine stack_id — der Dialog schriebe wieder stumm in den aktiven Stack.')
  assert.ok(/aria-label="Stack"/.test(quelle), 'Die Stackwahl fehlt im Dialog.')
})

test('die Erwartung der grossen Kategorien traegt eigene Farben', () => {
  // [cmd] Die acht grossen aus der C-197-Zaehlung (peptide 60, aas 31,
  // botanical 26, sports_ingredient 24, mineral 23, vitamin 19,
  // performance 19, protein_amino_acid 16) plus unzugeordnet.
  for (const k of ['peptide', 'aas', 'botanical', 'sports_ingredient',
    'mineral', 'vitamin', 'performance', 'protein_amino_acid', UNZUGEORDNET_ID]) {
    assert.ok(KATEGORIE_FARBEN[k], `${k} hat keine eigene Farbvariable.`)
  }
})
