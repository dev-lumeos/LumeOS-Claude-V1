// G-601: „leer" und „nicht geladen" sind zwei Zustaende — gerendert.
//
// `[read]` **Die echte Ansicht und die echten Reiter**, nicht die Hilfs-
// kachel allein: die Zusage betrifft, was an DIESEN vier Stellen steht.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {
  PathnameContext, SearchParamsContext,
} from 'next/dist/shared/lib/hooks-client-context.shared-runtime'

import { RecoveryAnsicht } from '../ansicht'
import { RecHRV, RecSleep } from '../tab-messwerte'
import type { ScoreStand, ModalitaetenStand } from '../../../../lib/recovery/scores-read'
import type { CheckinStand } from '../../../../lib/recovery/checkin-read'

const router = {
  back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
} as unknown as React.ContextType<typeof AppRouterContext>

const FEHLER = 'permission denied for schema recovery'
const SCORES_LEER: ScoreStand = { neuster: null, verlauf: [], gesamt: 0, fehler: null }
const SCORES_FEHLER: ScoreStand = { ...SCORES_LEER, fehler: FEHLER }
const MOD_LEER: ModalitaetenStand = { heute: [], zeilen: [], gesamt: 0, jeArt: [], fehler: null }
const MOD_FEHLER: ModalitaetenStand = { ...MOD_LEER, fehler: FEHLER }
const CHECK_LEER: CheckinStand = { zeilen: [], neuster: null, mitHrv: 0, fehler: null }
const CHECK_FEHLER: CheckinStand = { ...CHECK_LEER, fehler: FEHLER }

function heute(scores?: ScoreStand, modalitaeten?: ModalitaetenStand): string {
  return renderToStaticMarkup(
    React.createElement(AppRouterContext.Provider, { value: router },
      React.createElement(PathnameContext.Provider, { value: '/v2/recovery' },
        React.createElement(SearchParamsContext.Provider,
          { value: new URLSearchParams('tab=today') as never },
          React.createElement(RecoveryAnsicht, {
            scores, modalitaeten, checkins: CHECK_LEER,
          })))))
}
/** Der Rumpf der Kachel mit diesem Titel. */
function kachel(html: string, titel: string): string {
  const ab = html.indexOf(`>${titel}<`)
  assert.ok(ab >= 0, `Kachel „${titel}" nicht gerendert`)
  return html.slice(ab, ab + 700)
}
const zustand = (k: string) => /data-ladezustand="(\w+)"/.exec(k)?.[1] ?? null

// ── Erholungswert und Today's modalities (ansicht.tsx) ───────────

test('G-601: Erholungswert — leer heisst leer, nicht „Nicht geladen"', () => {
  const k = kachel(heute(SCORES_LEER, MOD_LEER), 'Erholungswert')
  assert.equal(zustand(k), 'leer')
  assert.match(k, /Noch kein Erholungswert/)
  assert.doesNotMatch(k, /Nicht geladen/)
})

test('G-601: Erholungswert — ein Ladefehler bleibt ein Ladefehler', () => {
  const k = kachel(heute(SCORES_FEHLER, MOD_LEER), 'Erholungswert')
  assert.equal(zustand(k), 'fehler')
  assert.match(k, /Nicht geladen/)
  assert.ok(k.includes(`recovery.scores meldet: ${FEHLER}`))
})

test("G-601: Today's modalities — leer und Fehler getrennt", () => {
  const leer = kachel(heute(SCORES_LEER, MOD_LEER), "Today&#x27;s modalities")
  assert.equal(zustand(leer), 'leer')
  assert.match(leer, /Noch keine Modalität/)
  assert.doesNotMatch(leer, /Nicht geladen/)
  const kaputt = kachel(heute(SCORES_LEER, MOD_FEHLER), "Today&#x27;s modalities")
  assert.equal(zustand(kaputt), 'fehler')
  assert.ok(kaputt.includes(`recovery.modality_log meldet: ${FEHLER}`))
})

test('G-601: ohne Stand ist es ein Ladefehler, kein Leerzustand (wie G-598)', () => {
  const html = heute(undefined, undefined)
  assert.equal(zustand(kachel(html, 'Erholungswert')), 'fehler')
  assert.equal(zustand(kachel(html, "Today&#x27;s modalities")), 'fehler')
})

// ── HRV und Sleep (tab-messwerte.tsx) ────────────────────────────

test('G-601: HRV und Sleep — leer heisst leer, Fehler heisst Fehler', () => {
  for (const [name, Reiter] of [['HRV', RecHRV], ['Sleep', RecSleep]] as const) {
    const leer = renderToStaticMarkup(React.createElement(Reiter, { stand: CHECK_LEER }))
    assert.equal(zustand(leer), 'leer', `${name} leer`)
    assert.match(leer, /Noch kein Check-in/, name)
    assert.doesNotMatch(leer, /Nicht geladen/, `${name}: leer als Ladefehler`)
    const kaputt = renderToStaticMarkup(React.createElement(Reiter, { stand: CHECK_FEHLER }))
    assert.equal(zustand(kaputt), 'fehler', `${name} Fehler`)
    assert.ok(kaputt.includes(`recovery.checkins meldet: ${FEHLER}`), name)
  }
})

// ── Kein weiterer Ort ────────────────────────────────────────────

test('G-601: „Nicht geladen" steht in v2/recovery nur noch hinter einem Fehler', () => {
  // `[read]` **Je Fundstelle gezaehlt**, ohne Kommentare. Jede Zeile
  // mit dem Wort muss im selben Ausdruck einen Fehler pruefen —
  // `fehler`, `.fehler` oder `!stand`/`!protokolle`.
  const dir = path.join(process.cwd(), 'src/app/v2/recovery')
  const funde: string[] = []
  for (const d of fs.readdirSync(dir).filter(f => f.endsWith('.tsx'))) {
    const zeilen = fs.readFileSync(path.join(dir, d), 'utf8')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, m => m.replace(/[^\n]/g, ' '))
      .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
      .split(/\r?\n/)
    zeilen.forEach((z, i) => {
      if (/^\s*\/\//.test(z) || !/Nicht geladen/.test(z)) return
      // Die Bedingung steht in der Zeile selbst oder bis zu zwei davor.
      const umfeld = zeilen.slice(Math.max(0, i - 2), i + 1).join(' ')
      if (!/fehler|!stand|!protokolle/.test(umfeld)) funde.push(`${d}:${i + 1}`)
    })
  }
  assert.deepEqual(funde, [], 'ein „Nicht geladen" ohne Fehlerbedingung')
})
