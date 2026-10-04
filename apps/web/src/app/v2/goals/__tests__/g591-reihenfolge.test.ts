// G-591: die Reihenfolge der aktiven Ziele wird gespeichert — atomar.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  tauschePlatz, pruefeReihenfolge, reihenfolgeFehler, reihenfolgeArgumente,
  PRIO_MAX_AKTIV, type Platz,
} from '../../../../lib/goals/ziel-regeln'
import { ZielKarten } from '../ziel-karten'
import type { ZielFortschritt } from '../../../../lib/goals/lesen'

const DREI: Platz[] = [
  { id: 'a', priority: 1 }, { id: 'b', priority: 2 }, { id: 'c', priority: 3 },
]

// ── Der Tausch ───────────────────────────────────────────────────

test('G-591: hoch und runter tauschen mit dem Nachbarn — ALLE aktiven gesendet', () => {
  const r = tauschePlatz(DREI, 'b', -1)!
  assert.equal(r.length, 3, 'der Vertrag verlangt alle aktiven Ziele')
  assert.deepEqual(Object.fromEntries(r.map(p => [p.id, p.priority])), { a: 2, b: 1, c: 3 })
  const s = tauschePlatz(DREI, 'b', 1)!
  assert.deepEqual(Object.fromEntries(s.map(p => [p.id, p.priority])), { a: 1, b: 3, c: 2 })
})

test('G-591: am Rand gibt es keinen Platz — nie einen vierten', () => {
  assert.equal(tauschePlatz(DREI, 'a', -1), null)
  assert.equal(tauschePlatz(DREI, 'c', 1), null, 'Platz 3 nach unten hiesse Platz 4')
  // Luecken bleiben Luecken: 1 und 3 tauschen, 2 entsteht nicht.
  const r = tauschePlatz([{ id: 'x', priority: 1 }, { id: 'y', priority: 3 }], 'y', -1)!
  assert.deepEqual(r.map(p => p.priority).sort(), [1, 3])
})

test('G-591: ein vierter Platz wird vor dem Aufruf abgewiesen', () => {
  // `[cmd]` `user_goals_check1`: `status <> 'active' OR priority BETWEEN
  // 1 AND 3` (gemessen 2026-10-04). Die Vorpruefung sagt es als Satz.
  assert.equal(PRIO_MAX_AKTIV, 3)
  assert.match(pruefeReihenfolge([...DREI.slice(0, 2), { id: 'c', priority: 4 }])!, /1 bis 3/)
  assert.match(pruefeReihenfolge([...DREI, { id: 'd', priority: 1 }])!, /höchstens 3/)
  assert.match(pruefeReihenfolge([{ id: 'a', priority: 1 }, { id: 'b', priority: 1 }])!, /einmal/)
  assert.equal(pruefeReihenfolge(DREI), null)
})

test('G-591: die Argumente folgen dem Vertrag aus G-602', () => {
  assert.deepEqual(reihenfolgeArgumente([{ id: 'a', priority: 2 }]),
    { p_reihenfolge: [{ goal_id: 'a', priority: 2 }] })
})

test('G-591: die Fehler der Funktion werden Saetze', () => {
  assert.match(reihenfolgeFehler('42501', 'x'), /gehört nicht zu dir|nicht mehr aktiv/)
  assert.match(reihenfolgeFehler('23514', 'x'), /alle aktiven Ziele/)
  // `[read]` Solange G-602 nicht eingespielt ist: der Satz aus G-570.
  assert.match(reihenfolgeFehler('PGRST202',
    'Could not find the function goals.ziel_reihenfolge_setzen(p_reihenfolge) in the schema cache'),
  /Schema-Cache/)
  assert.equal(reihenfolgeFehler('XX000', 'etwas anderes'), 'etwas anderes')
})

// ── Der Schreibweg ruft die Funktion, nicht die Schleife ─────────

const ohne = (p: string) => fs.readFileSync(path.join(process.cwd(), 'src', p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')

test('G-591: reihenfolgeSetzen ruft ziel_reihenfolge_setzen — keine Zeile-fuer-Zeile-Schleife', () => {
  const s = ohne('lib/goals/schreiben.ts')
  const ab = s.indexOf('export async function reihenfolgeSetzen(')
  const rumpf = s.slice(ab, s.indexOf('\n}\n', ab))
  assert.ok(ab > 0)
  assert.equal((rumpf.match(/\.rpc\('ziel_reihenfolge_setzen'/g) ?? []).length, 1)
  assert.doesNotMatch(rumpf, /zielAendern\(/, 'die Schleife ueber zielAendern ist zurueck — sie scheitert an 23505')
})

test('G-591: prioritaetenSpeichern hat genau einen Aufrufer — die Zielkarten', () => {
  const funde: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (e.name !== '__tests__') geh(p) }
      else if (/\.tsx?$/.test(e.name) && !p.endsWith('ziel-aktionen.ts')) {
        const n = (ohne(path.relative(path.join(process.cwd(), 'src'), p)).match(/\bprioritaetenSpeichern\(/g) ?? []).length
        for (let i = 0; i < n; i++) funde.push(path.basename(p))
      }
    }
  }
  geh(path.join(process.cwd(), 'src'))
  assert.deepEqual(funde, ['ziel-karten.tsx'])
})

// ── Gerendert: der Griff nur an aktiven Zielen ───────────────────

function ziel(id: string, priority: number, status = 'active'): ZielFortschritt {
  return {
    goal_id: id, goal_type: 'body_composition', subtype: null, title: `Ziel ${id}`,
    target_value: null, target_unit: null, start_value: null, current_value: null,
    current_source: null, progress_pct: null, progress_status: null, measured_at: null,
    target_date: null, gueltig_ab: '2026-09-01', linked_modules: [], status,
    is_primary: false, priority,
  }
}
const karten = (ziele: ZielFortschritt[]) => renderToStaticMarkup(
  React.createElement(ZielKarten, { ziele, meilensteine: [], stichtag: '2026-10-04' }))
const knopf = (html: string, art: 'hoch' | 'runter', id: string) => {
  const m = new RegExp(`<button[^>]*data-ziel-${art}="${id}"[^>]*>`).exec(html)
  return m ? m[0] : null
}

test('G-591: zwei aktive Ziele — oben kein Hoch, unten kein Runter', () => {
  const h = karten([ziel('a', 1), ziel('b', 2)])
  assert.match(knopf(h, 'hoch', 'a')!, /disabled/)
  assert.doesNotMatch(knopf(h, 'runter', 'a')!, /disabled/)
  assert.doesNotMatch(knopf(h, 'hoch', 'b')!, /disabled/)
  assert.match(knopf(h, 'runter', 'b')!, /disabled/, 'Platz 2 nach unten bei zwei Zielen')
})

test('G-591: pausierte Ziele und ein einzelnes aktives haben keinen Griff', () => {
  const h = karten([ziel('a', 1), ziel('p', 5, 'paused')])
  assert.equal(knopf(h, 'hoch', 'p'), null, 'ein pausiertes Ziel hat keinen Platz')
  assert.equal(knopf(h, 'hoch', 'a'), null, 'ein einzelnes aktives Ziel hat nichts zu tauschen')
})
