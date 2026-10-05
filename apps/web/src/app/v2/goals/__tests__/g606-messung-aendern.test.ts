// G-606: eine Messung laesst sich aendern — Griff, Modal, Feldfehler.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import {
  messungAlsEingabe, doppelterZeitpunkt,
} from '../../../../lib/goals/koerpermass-rechnung'
import type { Koerpermessung } from '../../../../lib/goals/lesen'
import { KoerperMetriken } from '../tab-koerper'
import { GoalsModale } from '../modale'
import { GoalsKontext, type ModalZustand } from '../kontext'

// `[cmd]` Die eine Messung von test-user, gemessen 2026-10-05.
const M: Koerpermessung = {
  id: '1c7c7234-a96e-4fb6-8710-e9e132dd5309', measurement_date: '2026-05-19',
  measurement_time: '08:00:00', weight_kg: 81.4, body_fat_pct: null, bf_method: null,
  notes: 'A-95: Zielraten-Gegenprobe', height_cm_snapshot: 182, lean_mass_kg: null,
  fat_mass_kg: null, bmi: 24.57, ffmi: null,
}

// ── Die reinen Funktionen ────────────────────────────────────────

test('G-606: die Vorbefuellung — Uhrzeit ohne Sekunden, Leeres bleibt leer', () => {
  assert.deepEqual(messungAlsEingabe(M), {
    measurement_date: '2026-05-19', measurement_time: '08:00', weight_kg: '81.4',
    body_fat_pct: '', bf_method: '', notes: 'A-95: Zielraten-Gegenprobe',
  })
})

test('G-606: ein belegter Zeitpunkt wird ein Feldfehler an der Uhrzeit', () => {
  const f = doppelterZeitpunkt('23505',
    'duplicate key value violates unique constraint "body_measurements_user_date_time_uq"')
  assert.equal(f?.feld, 'measurement_time')
  assert.equal(doppelterZeitpunkt('23505', 'andere eindeutige Regel'), null)
  assert.equal(doppelterZeitpunkt('23514', 'user_date_time_uq'), null)
})

// ── Der Aufrufer ─────────────────────────────────────────────────

test('G-606: messungAendernAktion hat genau einen Aufrufer — das Modal', () => {
  const src = path.join(process.cwd(), 'src')
  const funde: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (e.name !== '__tests__') geh(p) }
      else if (/\.tsx?$/.test(e.name) && !p.endsWith('koerpermass-aktionen.ts')) {
        const s = fs.readFileSync(p, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
        for (const _ of s.match(/\bmessungAendernAktion\(/g) ?? []) funde.push(path.basename(p))
      }
    }
  }
  geh(src)
  assert.deepEqual(funde, ['modale.tsx'])
})

// ── Gerendert ────────────────────────────────────────────────────

test('G-606: je Messung ein Griff, der das Modal MIT der Messung oeffnet', () => {
  const geoeffnet: ModalZustand[] = []
  const zweite: Koerpermessung = { ...M, id: 'zwei', measurement_time: '19:00:00', weight_kg: 82 }
  const html = renderToStaticMarkup(React.createElement(GoalsKontext.Provider,
    { value: { open: (m: ModalZustand) => { geoeffnet.push(m) }, close: () => {} } },
    React.createElement(KoerperMetriken, { messungen: [M, zweite], zukunft: 0, stichtag: '2026-10-05' })))
  const griffe = html.match(/data-messung-aendern="[^"]+"/g) ?? []
  assert.deepEqual(griffe, ['data-messung-aendern="zwei"', `data-messung-aendern="${M.id}"`],
    'je Zeile ein Griff mit ihrer Kennung (juengste zuerst)')
  // Der Klick selbst laeuft im Browser — hier: der Griff ruft open mit
  // der Messung (Quelltext der einen Stelle).
  const quelle = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/goals/tab-koerper.tsx'), 'utf8')
  assert.match(quelle, /onClick=\{\(\) => open\(\{ typ: 'logWeight', messung: m \}\)\}/)
  assert.equal(geoeffnet.length, 0, 'beim Rendern oeffnet nichts von selbst')
})

const router = {
  back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
} as unknown as React.ContextType<typeof AppRouterContext>
const modal = (m: ModalZustand) => renderToStaticMarkup(
  React.createElement(AppRouterContext.Provider, { value: router },
    React.createElement(GoalsModale, { modal: m, onClose: () => {} })))

test('G-606: im Aendern-Modus ist das Modal vorbefuellt', () => {
  const h = modal({ typ: 'logWeight', messung: M })
  assert.match(h, /Edit measurement/)
  assert.match(h, /value="2026-05-19"/)
  assert.match(h, /value="08:00"/)
  assert.match(h, /value="81\.4"/)
  assert.match(h, /value="A-95: Zielraten-Gegenprobe"/)
  assert.match(h, />Save</)
})

test('G-606: ohne Messung bleibt es das Anlegen-Modal', () => {
  const h = modal({ typ: 'logWeight' })
  assert.match(h, /Log weight/)
  assert.doesNotMatch(h, /Edit measurement/)
  assert.doesNotMatch(h, /value="81\.4"/)
})

test('G-606: Feldfehler stehen am Feld, keine Sammelliste', () => {
  const s = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/goals/modale.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
  const ab = s.indexOf('function LogWeightModal(')
  const rumpf = s.slice(ab, s.indexOf('\nfunction ', ab + 1))
  for (const f of ['measurement_date', 'measurement_time', 'weight_kg', 'body_fat_pct', 'bf_method']) {
    assert.match(rumpf, new RegExp(`fehler=\\{feldFehler\\('${f}'\\)\\}`), `${f} hat keinen Fehlerplatz`)
  }
  assert.doesNotMatch(rumpf, /\{f\.feld\}: \{f\.text\}/, 'die Sammelliste ist zurueck')
})
