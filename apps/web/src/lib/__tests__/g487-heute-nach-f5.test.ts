// G-487 — der Tageswechsler startet nach F5 auf heute.
//
// **Tom, 2026-09-21:** *„der daychooser war auf 18.9. und nicht heute,
// sprich das ist eine boesartige falle"*
//
// `[cmd]` **Die Falle, gemessen:** am 18.09. hat der aktive Plan null
// Eintraege, am 21.09. vier. **Tom sah ,,kein Eintrag" und hielt es
// fuer einen Fehler** — er stand auf dem falschen Tag.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import { heute, springtAufHeute } from '../datum'

const SRC = path.resolve(__dirname, '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const ALT = '2026-09-18'

test('G-487/A1: nach einem Neuladen wird gesprungen', () => {
  assert.equal(springtAufHeute('reload', false, ALT), true)
})

test('G-487: steht schon heute da, passiert nichts', () => {
  // `[read]` **Ein Sprung auf denselben Tag waere eine unnoetige
  // Navigation** — und im Zweifel ein Flackern.
  assert.equal(springtAufHeute('reload', false, heute()), false)
})

test('G-487: ein geteilter Link bleibt stehen', () => {
  // `[read]` **`navigate` ist eine ABSICHT** — wer `?datum=2026-09-18`
  // oeffnet, will genau diesen Tag sehen. **Ihn auf heute umzuleiten
  // waere dieselbe Falle, nur andersherum.**
  assert.equal(springtAufHeute('navigate', false, ALT), false)
  assert.equal(springtAufHeute('back_forward', false, ALT), false)
  assert.equal(springtAufHeute(null, false, ALT), false)
})

test('G-487: nach der ersten Pruefung nie wieder', () => {
  // ══ DIE GEGENPROBE, DIE DEN AUFTRAG RETTET ══════════════════════
  //
  // `[cmd]` **GEMESSEN:** der Navigationstyp bleibt nach einem
  // `router.push` auf `reload` stehen. `[read]` **Ohne diesen Riegel
  // spraenge die Regel bei JEDEM Tageswechsel zurueck auf heute** —
  // **der Nutzer koennte keinen anderen Tag mehr ansehen.**
  assert.equal(springtAufHeute('reload', true, ALT), false)
})

test('G-487/A2: EIN Wechsler, und er traegt die Regel', () => {
  // `[cmd]` **GEMESSEN am 2026-09-21:** `v2-datumsnav` steht an zwei
  // Stellen — `tageswechsler.tsx` (in `shell.tsx` gerendert) und
  // `nutrition/datumsnavigation.tsx`, **die seit G-376 keinen
  // Aufrufer mehr hat.**
  //
  // `[read]` **Die Regel gehoert in den, der laeuft.**
  const w = ohneKommentare(lies('app/v2/tageswechsler.tsx'))
  assert.match(w, /useHeuteNachF5\(/,
    'der Tageswechsler der Schale traegt die Regel nicht')
  // `[cmd]` **VOR dem fruehen Ausstieg** — ein Hook nach
  // `if (!platz) return null` liefe nie, und React verlangt dieselbe
  // Reihenfolge bei jedem Rendern.
  assert.ok(w.indexOf('useHeuteNachF5(') < w.indexOf('if (!platz) return null'),
    'der Hook steht hinter dem fruehen Ausstieg — dann laeuft er nicht')
})

test('G-487/A3: der Merker ueberlebt das Neuladen NICHT', () => {
  // `[cmd]` **Ein erster Entwurf nahm `sessionStorage`.** `[cmd]`
  // **GEMESSEN: der Merker stand schon VOR dem F5 auf `1`** — gesetzt
  // vom ersten Aufruf. **Die Regel las ,,schon geprueft" und tat
  // nichts.**
  //
  // `[read]` **`sessionStorage` ueberlebt genau das Ereignis, das
  // unterschieden werden soll** — er ist das falsche Gedaechtnis.
  const h = ohneKommentare(lies('lib/heute-nach-f5.ts'))
  assert.doesNotMatch(h, /sessionStorage|localStorage/,
    'der Merker liegt in einem Speicher, der das Neuladen ueberlebt — '
    + 'dann feuert die Regel nie')
  assert.match(h, /let schonGeprueft = false/,
    'es gibt keinen Merker je Dokument')
})

test('G-487: der Sprung behaelt die uebrigen Parameter', () => {
  // `[cmd]` **G-117:** ein Tagwechsel, der `?tab=` wegwirft, landet
  // auf Diary. `[read]` **Dieselbe Falle gilt fuer den Sprung.**
  const h = ohneKommentare(lies('lib/heute-nach-f5.ts'))
  assert.match(h, /new URLSearchParams\(suche\?\.toString\(\) \?\? ''\)/,
    'der Sprung baut die Adresse neu und verliert ?tab=')
  // `[read]` **`replace`, nicht `push`** — der alte Tag gehoert nicht
  // in die Zurueck-Liste, sonst fuehrt der Zurueck-Knopf in die Falle.
  assert.match(h, /router\.replace\(/,
    'der Sprung legt einen Eintrag in der Verlaufsliste an')
})
