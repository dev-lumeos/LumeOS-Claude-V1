// G-486 — erfuellte Ghosts bleiben stehen, und ein leerer Tag sagt warum.
//
// **Tom, 2026-09-20, zum VIERTEN Mal:** *„die ghostentries sind schon
// wieder verschwunden"* — *„zuerst mal: das haben wir heute schonmal
// messen und beheben lassen!!"*
//
// `[read]` **Dreimal derselbe Eindruck, dreimal ein anderer Grund:**
// falsch gemessen (G-482), der Plan begann erst morgen (E-83), alle
// erfuellt (hier). **Keiner davon stand am Schirm.**
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  planLeerGrund, planLeerSatz, type PlanFenster,
} from '../plan-eintrag-lage'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const FENSTER: PlanFenster = {
  name: 'Aufbau-Wochenplan', von: '2026-09-19', bis: '2026-10-23',
}

test('G-486/A1: ein erfuellter Ghost faellt NICHT aus der Liste', () => {
  // `[cmd]` **Hier stand `filter(g => g.status === 'pending')`** —
  // und nach vier Bestaetigungen zeigte der Schirm 0 Karten, obwohl
  // die Route 4 Eintraege lieferte (gemessen 2026-09-20).
  const q = ohneKommentare(lies('app/v2/nutrition/mahlzeiten.tsx'))
  assert.match(q, /status === 'confirmed'/,
    'bestaetigte Ghosts werden wieder weggefiltert')
  assert.match(q, /status === 'deviated'/,
    'abweichend bestaetigte Ghosts fallen weg')
  // `[read]` **`skipped` bleibt weg** — ausgelassen heisst
  // entschieden UND nicht gegessen.
  assert.doesNotMatch(q, /status === 'skipped'/,
    'ausgelassene Ghosts stehen wieder da — sie sind nicht erfuellt')
})

test('G-486/A1: erfuellt traegt Rahmen, Haken und Satz', () => {
  const q = ohneKommentare(lies('app/v2/nutrition/ghost-eintrag.tsx'))
  assert.match(q, /v2-ghost-erfuellt/,
    'die Karte unterscheidet den Zustand nicht')
  assert.match(q, /1px solid var\(--pos\)/,
    'kein gruener, durchgezogener Rahmen (Toms Entscheidung)')
  assert.match(q, /data-probe="ghost-haken"/,
    'kein Haken — abgehakt war die Vorgabe')
  assert.match(q, /ghost-erfuellt-satz/,
    'der Satz fehlt, der sagt wo die Mahlzeit steht')
})

test('G-486/A2: erfuellt und offen sehen verschieden aus', () => {
  const q = ohneKommentare(lies('app/v2/nutrition/ghost-eintrag.tsx'))
  // `[read]` **Gestrichelt heisst *noch nicht*** — das stimmt beim
  // erfuellten nicht mehr.
  assert.match(q, /1px dashed var\(--fg-dim\)/,
    'der offene Ghost hat seinen gestrichelten Rahmen verloren')
  // `[read]` **Und die Knoepfe fallen weg** — „Bestaetigen" an etwas
  // Erfuelltem ist eine Einladung zum Doppelten.
  assert.match(q, /erledigt \?/,
    'die Karte verzweigt nicht nach dem Zustand')
})

test('G-486/A3: erkannt wird am LOG, nicht an der Mahlzeit', () => {
  // `[cmd]` **GEMESSEN am 2026-09-20:** vier Mahlzeiten erfasst,
  // `meal_plan_logs` LEER — und alle vier Ghosts standen da.
  // `[read]` **Eine erfasste Mahlzeit erfuellt einen Plan NICHT.**
  const q = ohneKommentare(lies('app/v2/nutrition/mahlzeiten.tsx'))
  // `[cmd]` **Nur der Filterausdruck selbst** — die Zeile darunter
  // (`ghostTypen`) darf `mahlzeiten` nennen, sie unterdrueckt die
  // leere Karte. `[read]` **Ein zu weites Fenster prueft die falsche
  // Zeile mit** (G-483).
  const i = q.indexOf('const sichtbareGhosts')
  const block = q.slice(i, q.indexOf('\n', q.indexOf('status ===', i)) + 120)
  assert.doesNotMatch(block, /belegteTypen|mahlzeiten\.some|meal_type\)\)/,
    'der Filter schliesst von erfassten Mahlzeiten auf erfuellt — '
    + 'gemessen ist das falsch')
})

test('G-486/A4: jeder Grund hat einen eigenen Satz', () => {
  assert.equal(planLeerGrund('2026-09-18', FENSTER), 'beginnt_spaeter')
  assert.equal(planLeerGrund('2026-10-24', FENSTER), 'beendet')
  assert.equal(planLeerGrund('2026-09-20', FENSTER), 'kein_eintrag')
  assert.equal(planLeerGrund('2026-09-20',
    { name: null, von: null, bis: null }), 'kein_plan')

  // `[read]` **Der Satz nennt das DATUM** — „beginnt spaeter" ohne
  // Tag laesst den Nutzer weitersuchen. **Genau das war G-482.**
  assert.match(planLeerSatz('beginnt_spaeter', FENSTER), /2026-09-19/)
  assert.match(planLeerSatz('beendet', FENSTER), /2026-10-23/)
  // `[read]` **Und er nennt den Plan** — bei mehreren Plaenen ist
  // sonst unklar, welcher gemeint ist.
  assert.match(planLeerSatz('beendet', FENSTER), /Aufbau-Wochenplan/)
})

test('G-486/A4: der Satz steht am Schirm', () => {
  const q = ohneKommentare(lies('app/v2/nutrition/mahlzeiten.tsx'))
  assert.match(q, /data-probe="plan-leer-grund"/,
    'der Grund ist am Schirm nicht auffindbar')
  assert.match(q, /planLeerSatz\(planLeerGrund\(/,
    'der Satz wird nicht aus der Regel gebildet')
  assert.doesNotMatch(q, /endete am|beginnt erst am/,
    'der Satz steht abgeschrieben in der Kachel')
})
