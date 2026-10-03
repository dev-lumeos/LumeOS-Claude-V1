// G-598: Reiterkacheln und Modal lesen `recovery.recovery_protocols`.
//
// `[read]` **Gerendert, nicht im Quelltext gesucht** — die Zusagen
// betreffen, was am Schirm steht. Als `.test.ts` mit `createElement`:
// `"test"` in `package.json` sammelt nur `*.test.ts`.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { RecProtocols } from '../tab-protokolle'
import { RecoveryModale } from '../modale'
import { RecoveryKontext, type RecoveryKontextWert } from '../kontext'
import { RECOVERY_PROTOCOLS } from '../motor'
import type { ProtokollStand, ProtokollZeile } from '../../../../lib/recovery/protokoll-read'

const LAUF: ProtokollZeile = {
  id: 'p1', protocol_key: 'active_recovery_week', name: 'Active Recovery Week',
  target_condition: 'general_recovery', started_on: '2026-09-12', duration_days: 7,
  daily_activities: ['Light cardio 25 min', 'Mobility flow'], status: 'active', completed_days: 3,
}
const MIT: ProtokollStand = { zeilen: [LAUF], aktiv: [LAUF], fehler: null }
const LEER: ProtokollStand = { zeilen: [], aktiv: [], fehler: null }
const KAPUTT: ProtokollStand = { zeilen: [], aktiv: [], fehler: 'permission denied for table recovery_protocols' }

const router = {
  back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
} as unknown as React.ContextType<typeof AppRouterContext>
const kontext = { open: () => {} } as unknown as RecoveryKontextWert

function reiter(stand?: ProtokollStand) {
  return renderToStaticMarkup(React.createElement(RecoveryKontext.Provider, { value: kontext },
    React.createElement(RecProtocols, { stand })))
}
function modal(key: string, protokolle?: ProtokollStand) {
  const p = RECOVERY_PROTOCOLS.find(x => x.id === key)!
  return renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router },
    React.createElement(RecoveryModale, {
      modal: { typ: 'protocol', protokoll: p }, onClose: () => {}, tag: '2026-10-03', protokolle,
    })))
}
// Den Rumpf EINER Kachel, an ihrem Titel.
function kachel(html: string, titel: string): string {
  const ab = html.indexOf(titel)
  assert.ok(ab >= 0, `Kachel „${titel}" nicht gerendert`)
  return html.slice(ab, ab + 4000)
}

// ── A1: die zwei Reiterkacheln ───────────────────────────────────

test('G-598/A1: `Active · …` zeigt die Zeile aus der Tabelle, nicht den Entwurf', () => {
  const k = kachel(reiter(MIT), 'Active · Active Recovery Week')
  assert.match(k, /3 of 7 days done · started 2026-09-12/)
  assert.match(k, /Light cardio 25 min/)
  // `[cmd]` Der Entwurf: `day 3 of 7 · started 2026-08-13`.
  assert.doesNotMatch(k, /2026-08-13/, 'das Entwurfsdatum steht wieder da')
})

test('G-598/A1: ohne aktives Protokoll ein benannter Leerhinweis', () => {
  const k = kachel(reiter(LEER), 'Active protocol')
  assert.match(k, /Kein Protokoll aktiv/)
  assert.doesNotMatch(k, /End protocol/, 'End ohne Lauf')
})

test('G-598/A1: die Bibliothek markiert, was die Tabelle aktiv nennt', () => {
  const zaehle = (h: string) => (h.match(/>active</g) ?? []).length
  assert.equal(zaehle(kachel(reiter(MIT), 'Protocol library')), 1)
  assert.equal(zaehle(kachel(reiter(LEER), 'Protocol library')), 0,
    'die Bibliothek zeigt „active" ohne Zeile — dann kommt es aus dem Entwurf')
})

test('G-598/A1: beide Kacheln tragen keine Attrappenmarke mehr', () => {
  const html = reiter(MIT)
  for (const t of ['Active · Active Recovery Week', 'Protocol library']) {
    const k = kachel(html, t).slice(0, 600)
    assert.doesNotMatch(k, /Attrappe|Aus dem Entwurf/, `${t} ist wieder Attrappe`)
  }
})

// ── A2: Ladefehler ist ein eigener Zustand ───────────────────────

test('G-598/A2: bei Ladefehler sagen Modal und Kachel dasselbe', () => {
  const satz = 'Nicht geladen: permission denied for table recovery_protocols'
  const m = modal('passive_deload', KAPUTT)
  assert.ok(m.includes(satz), 'das Modal nennt den Ladefehler nicht')
  assert.doesNotMatch(m, /data-probe="protokoll-starten"/,
    'das Modal bietet Activate an, obwohl unbekannt ist, was laeuft')
  assert.ok(kachel(reiter(KAPUTT), 'Active protocol').includes(satz),
    'die Reiterkachel nennt den Ladefehler nicht')
})

test('G-598/A2: ohne Ladefehler bleibt Activate', () => {
  assert.match(modal('passive_deload', LEER), /data-probe="protokoll-starten"/)
})

// ── A3: kein Entwurfszweig ───────────────────────────────────────

test('G-598/A3: ohne Stand kein Entwurf, sondern der Ladefehler', () => {
  // `[cmd]` Vorher: `protokolle ? … : p.id === ACTIVE_PROTOCOL.id` —
  // ohne Stand galt `active_recovery_week` als aktiv, Tag 3 von 7.
  const m = modal('active_recovery_week', undefined)
  assert.match(m, /Nicht geladen\./)
  assert.doesNotMatch(m, /Day 3 of 7|2026-08-13/, 'der Entwurfszweig ist zurueck')
})

test('G-598/A3: `ACTIVE_PROTOCOL` steht in Modal und Reiter nur in Kommentaren', () => {
  const ohne = (p: string) => fs.readFileSync(path.join(process.cwd(), 'src/app/v2/recovery', p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
  for (const d of ['modale.tsx', 'tab-protokolle.tsx']) {
    assert.equal((ohne(d).match(/\bACTIVE_PROTOCOL\b/g) ?? []).length, 0, d)
  }
})

// ── End protocol bleibt Attrappe ─────────────────────────────────

test('G-598: `End protocol` bleibt Attrappe — die Regel fehlt (00-FRAGEN)', () => {
  // `[read]` Ob „End" `discontinued` oder `completed` setzt, ist nicht
  // entschieden. **Wer ihn anbindet, ohne die Antwort, faellt hier.**
  const endKnopf = /<button[^>]*>[^<]*End protocol/
  const reiterHtml = kachel(reiter(MIT), 'Active · Active Recovery Week')
  const modalHtml = modal('active_recovery_week', MIT)
  for (const [ort, h] of [['Reiter', reiterHtml], ['Modal', modalHtml]] as const) {
    assert.match(h, /End protocol/, `${ort}: End protocol fehlt`)
    assert.doesNotMatch(h, /data-probe="protokoll-beenden"/, `${ort}: End protocol ist angebunden`)
    assert.ok(endKnopf.test(h), `${ort}: End protocol ist kein Knopf`)
  }
  const quelle = (p: string) => fs.readFileSync(path.join(process.cwd(), 'src/app/v2/recovery', p), 'utf8')
  assert.equal((quelle('tab-protokolle.tsx').match(/<InEntwicklungKnopf titel="End protocol"/g) ?? []).length, 1)
  assert.equal((quelle('modale.tsx').match(/<InEntwicklungKnopf titel="End protocol"/g) ?? []).length, 1)
})
