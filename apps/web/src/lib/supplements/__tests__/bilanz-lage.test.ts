// G-275: die Tagesbilanz und ihre Beleglage.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  lageVon, LAGE_TEXT, LAGE_FARBE, zeigtMenge, herkunftSatz,
  ueberblickVon, datenlageSatz, KEINE_EINNAHMEN_SATZ,
  type BilanzZeile,
} from '../bilanz-lage'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const z = (p: Partial<BilanzZeile> = {}): BilanzZeile => ({
  nutrient_code: 'FAPUN3', nutrient_unit: 'g', total_amount: 2,
  taken_log_count: 4, skipped_log_count: 0,
  mapped_taken_log_count: 1, unmapped_taken_log_count: 3, ...p,
})

// ── Die Trennung, um die es geht ─────────────────────────────────

test('G-275: der gemessene Fall ist eine Untergrenze', () => {
  // `[cmd]` **Nachweistag aus dem Auftrag, gegengeprobt am
  // 2026-08-30:** `supplement_nutrient_intake_for_day(dev,
  // 2026-08-19)` liefert **FAPUN3 = 2,000 g bei 4 Einnahmen — 1
  // belegt, 3 unbekannt.**
  //
  // `[read]` **Ohne diese Einordnung sieht „2 g" aus wie das
  // Ergebnis von vier Einnahmen.**
  const zeile = z()
  assert.equal(lageVon(zeile), 'untergrenze')
  assert.match(herkunftSatz(zeile), /aus 1 von 4 Einnahmen/)
  assert.match(herkunftSatz(zeile), /für 3 ist keine Menge hinterlegt/)
})

test('G-275: alles belegt heisst belegt', () => {
  assert.equal(lageVon(z({ mapped_taken_log_count: 4, unmapped_taken_log_count: 0 })),
    'belegt')
  assert.match(
    herkunftSatz(z({ mapped_taken_log_count: 4, unmapped_taken_log_count: 0 })),
    /aus 4 belegten Einnahmen/)
})

test('G-275: nichts belegt ist nicht null', () => {
  // `[read]` **Die wichtigste Zeile des Auftrags:** die 564
  // unbelegten Einnahmen duerfen nicht als 0 gelten.
  const keine = z({ mapped_taken_log_count: 0, unmapped_taken_log_count: 4, total_amount: 0 })
  assert.equal(lageVon(keine), 'unbekannt')
  assert.equal(zeigtMenge('unbekannt'), false,
    'Bei unbekannter Menge darf keine Zahl stehen — auch keine 0.')
  assert.match(herkunftSatz(keine), /keine Nährstoffmenge hinterlegt/)
})

test('G-275: die Untergrenze ist nicht rot', () => {
  // `[read]` **Sie ist keine Warnung, sondern eine unvollstaendige
  // Messung** — grau wie `unvollstaendig` in G-249.
  assert.equal(LAGE_FARBE.untergrenze, 'var(--fg-dim)')
  assert.equal(LAGE_FARBE.belegt, 'var(--pos)')
  assert.equal(LAGE_TEXT.untergrenze, 'Untergrenze')
})

test('G-275: eine einzelne Einnahme wird richtig benannt', () => {
  assert.match(
    herkunftSatz(z({ taken_log_count: 1, mapped_taken_log_count: 0, unmapped_taken_log_count: 1 })),
    /^1 Einnahme,/)
  assert.match(
    herkunftSatz(z({ taken_log_count: 1, mapped_taken_log_count: 1, unmapped_taken_log_count: 0 })),
    /aus 1 belegten Einnahme$/)
})

// ── Der Ueberblick zaehlt Zeilen, nicht Mengen ───────────────────

test('G-275: der Ueberblick zaehlt je Lage', () => {
  const u = ueberblickVon([
    z(),
    z({ nutrient_code: 'MG', mapped_taken_log_count: 2, unmapped_taken_log_count: 0 }),
    z({ nutrient_code: 'ZN', mapped_taken_log_count: 0, unmapped_taken_log_count: 5 }),
  ])
  assert.equal(u.naehrstoffe, 3)
  assert.equal(u.belegt, 1)
  assert.equal(u.untergrenze, 1)
  assert.equal(u.unbekannt, 1)
  assert.equal(u.offeneEinnahmen, 8, '3 + 0 + 5 offene Einnahmen.')
})

test('G-275: die Datenlage wird benannt, nicht verschwiegen', () => {
  // **Der Auftrag:** *„17 Substanzen — das ist wenig, und die
  // Anzeige muss es sagen, statt eine leere Tabelle zu zeigen."*
  const s = datenlageSatz(17, 3)
  assert.match(s, /17 Substanzen/)
  assert.match(s, /zählen nicht als null/)
  // Ohne offene Einnahmen braucht es den Satz nicht.
  assert.equal(datenlageSatz(17, 0), '')
  // Und ohne jede belegte Substanz sagt er das.
  assert.match(datenlageSatz(0, 0), /keine deiner Substanzen/)
})

test('G-275: kein Tag ist etwas anderes als keine Menge', () => {
  assert.match(KEINE_EINNAHMEN_SATZ, /keine Einnahme protokolliert/)
  assert.doesNotMatch(KEINE_EINNAHMEN_SATZ, /Menge/)
})

// ── E-35 und die Doppelung ───────────────────────────────────────

const TAB = 'src/app/v2/supplements/tab-bilanz.tsx'

test('G-275: E-35 — keine Summierung mit Nutrition', () => {
  // `[cmd]` **Die ersetzte Attrappe addierte `FOOD` + `SUPPS` zu
  // `TOTAL` und verglich mit der RDA.** `[read]` **Genau das
  // verbietet E-35** — jedes Modul rechnet seine eigene Bilanz.
  const s = ohneKommentare(TAB)
  assert.doesNotMatch(s, /daily_summary|nutrition\./,
    'Die Bilanz greift nach Nutrition — E-35 (G-275).')
  assert.match(s, /Nur der Anteil aus Präparaten/,
    'Der Geltungsbereich steht nicht am Schirm (G-275).')
})

test('G-275: die Attrappe ist ersetzt, nicht ergaenzt', () => {
  // `[cmd]` **Doppelungspruefung vor dem Bau (G-253):** der
  // `intel`-Reiter zeigte „Gap analysis" mit derselben Form und
  // erfundenen Zahlen. **7 Attrappen vorher, 6 nachher.**
  const s = ohneKommentare('src/app/v2/supplements/tab-spec.tsx')
  assert.doesNotMatch(s, /title="Gap analysis"/,
    'Die alte Attrappe steht noch da — dann zeigt der Reiter es zweimal (G-275).')
  assert.match(s, /<SuppTagesbilanz/,
    'Die Bilanz ist nicht eingehaengt (G-275).')
})

test('G-275: die Anzeige fragt die Belegpruefung', () => {
  // `[read]` **Wirkung, nicht Wort.** Eine Sabotage ersetzte
  // `{zeigtMenge(l)` durch `{true` — die Funktion blieb importiert,
  // wurde aber nie gefragt, und bei unbekannter Menge stuende
  // wieder eine 0 da.
  const s = ohneKommentare(TAB)
  assert.match(s, /\{zeigtMenge\(l\)/,
    'Die Menge wird ohne Belegpruefung gezeigt (G-275).')
  assert.doesNotMatch(s, /\{true\s*$/m,
    'Die Belegpruefung ist ueberbrueckt (G-275).')
  // Und die Untergrenze wird als solche markiert.
  assert.match(s, /'≥ '/,
    'Eine Untergrenze steht ohne Zeichen da — sie sieht aus wie eine Menge (G-275).')
})

test('G-275: die Menge kommt aus der Funktion, nicht aus einer Schaetzung', () => {
  const s = ohneKommentare('src/lib/supplements/stack-read.ts')
  assert.match(s, /supplement_nutrient_intake_for_day/,
    'Die Bilanzfunktion wird nicht gerufen (G-275).')
  assert.doesNotMatch(s, /dose_snapshot \* /,
    'Die Menge wird gerechnet statt gelesen (G-275).')
})
