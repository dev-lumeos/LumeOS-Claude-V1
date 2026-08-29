// G-253: die vier Stacks-Kacheln und ihre Zustaende.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  vorlagenLageVon, VORLAGEN_LEER_SATZ, stackListeSatz, frequenzSatz,
  NAME_LUECKE_SATZ,
} from '../stack-lage'
import type { EigenerStack } from '../substanz-read'

const z = (p: Partial<EigenerStack> = {}): EigenerStack => ({
  id: 'a', name: 'Muskelaufbau Basics', goal: null, is_active: true,
  posten: 4, seit: '2026-08-23', quelle: 'custom', ...p,
})

// ── System templates: Tabelle da, Inhalt fehlt ───────────────────

test('G-253: eine leere Tabelle ist nicht dasselbe wie keine', () => {
  // `[cmd]` **Gemessen 2026-08-29:** `stack_templates` existiert mit
  // **0 Zeilen**, `stack_template_items` mit 0. `[read]` Dieselbe
  // Unterscheidung wie G-208 und G-239.
  assert.equal(vorlagenLageVon(0), 'tabelle_leer')
  assert.equal(vorlagenLageVon(5), 'vorlagen_da')
})

test('G-253: der Satz sagt, dass es kein Anzeigefehler ist', () => {
  // `[read]` Sonst sucht der naechste den Fehler in der Oberflaeche.
  assert.match(VORLAGEN_LEER_SATZ, /kein Fehler in der Anzeige/)
  assert.match(VORLAGEN_LEER_SATZ, /noch nichts hinterlegt/)
})

// ── My stacks ────────────────────────────────────────────────────

test('G-253: ohne Stack steht da, was ein Stack ist', () => {
  // `[read]` Ein Nutzer ohne Stack ist etwas anderes als ein
  // Ladefehler — die leere Flaeche muss erklaeren.
  const s = stackListeSatz([])
  assert.match(s, /Noch kein Stack/)
  assert.match(s, /regelmäßig/)
})

test('G-253: Stacks ohne aktiven nennen die Folge', () => {
  // `[cmd]` Ohne aktiven Stack entstehen keine Einnahme-Eintraege —
  // das steht so im Bestand (`uq_user_stacks_one_active`).
  const s = stackListeSatz([z({ is_active: false }), z({ id: 'b', is_active: false })])
  assert.match(s, /2 Stacks, keiner aktiv/)
  assert.match(s, /keine Einnahme-Einträge/)
})

test('G-253: mit aktivem Stack kein Hinweis', () => {
  assert.equal(stackListeSatz([z()]), '')
})

// ── Frequency options ────────────────────────────────────────────

test('G-253: nur belegte Frequenzen behaupten', () => {
  // `[cmd]` **Gemessen: ein einziger Wert, `daily`, elfmal.**
  // `[read]` Sieben Auswahlmoeglichkeiten anzuzeigen, von denen
  // sechs nie vorkommen, behauptet eine Vielfalt, die die Daten
  // nicht hergeben.
  const s = frequenzSatz([{ wert: 'daily', anzahl: 11 }])
  assert.match(s, /Alle 11 Einträge nutzen „daily"/)
  assert.match(s, /nicht belegt/)
  // `[read]` **Der Satz behauptet nicht „im Bestand"** — gezaehlt
  // sind die Posten des aktiven Stacks, nicht das ganze Repo.
  assert.doesNotMatch(s, /Bestand/)
})

test('G-253: ohne Frequenz kein erfundener Wert', () => {
  assert.match(frequenzSatz([]), /Noch keine Einnahmefrequenz/)
})

test('G-253: bei mehreren Frequenzen kein Sondersatz', () => {
  assert.equal(frequenzSatz([
    { wert: 'daily', anzahl: 11 }, { wert: 'weekly', anzahl: 2 },
  ]), '')
})

// ── Die Namensluecke ─────────────────────────────────────────────

test('G-253: die Namensluecke wird benannt, nicht gefuellt', () => {
  // `[cmd]` **Zwei der vier Posten von dev tragen kein `name_de`** —
  // der Name steht nur in `name_en`. `[read]` Der Leseweg faellt
  // bereits zurueck; die Luecke steht in den Daten.
  assert.match(NAME_LUECKE_SATZ, /englische/)
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-253: der Stacks-Reiter liest echte Daten', () => {
  const s = ohneKommentare('src/app/v2/supplements/tab-spec.tsx')
  assert.match(s, /stackListeSatz\(/,
    'Die Stack-Liste wird nicht benutzt (G-253).')
  assert.match(s, /vorlagenLageVon\(/,
    'Der Vorlagenzustand wird nicht geprueft (G-253).')
})

test('G-253: keine zweite Compliance-Ansicht', () => {
  // `[cmd]` **Der Reiter zeigt bereits `ComplianceEcht`** — Heatmap,
  // 30 Tage, je Praeparat, mit der Unterscheidung „nichts erfasst"
  // gegen „nichts genommen". `[read]` **Eine zweite daneben waere
  // die vierte Doppelung nach G-249 und G-11.**
  const s = ohneKommentare('src/app/v2/supplements/ansicht.tsx')
  const zweig = /tab === 'compliance' &&[\s\S]{0,300}?\n {10}\)/.exec(s)
  assert.ok(zweig, 'Der compliance-Zweig wurde nicht gefunden (G-253).')
  const komponenten = zweig[0].match(/<[A-Z][A-Za-z]+/g) ?? []
  assert.deepEqual(komponenten, ['<ComplianceEcht', '<SuppCompliance'],
    `Der Zweig rendert ${komponenten.length} Ansichten: ${komponenten.join(', ')} (G-253).`)
})
