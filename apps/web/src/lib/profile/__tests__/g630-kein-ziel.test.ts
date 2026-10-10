/**
 * G-630 — die Warnung ohne aktives Ziel
 *
 * `[cmd]` **Datenseite G-622** (`622_goal_free_maintenance.sql`): ohne
 * aktive Phase traegt `zielwerte_am.herkunft` das Hindernis aus
 * `berechne_zielwerte` — `kein_aktives_ziel` oder
 * `erhaltung_nicht_berechenbar`. Bis G-630 glaettete der Leseweg beides
 * auf `formel`. Geprueft wird bis ins gerenderte Markup.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { alsHerkunft, hindernisSatz, ohneZiel, ohneZielSatz } from '../zielwerte-hindernis'
import { STATUS_LABEL } from '../../goals/ziel-regeln'
import { ABSCHLUSS } from '../../goals/reiter'
import { KeinZielWarnung } from '../../../app/v2/kein-ziel-warnung'
import { Zielhinweis } from '../../../app/v2/nutrition/zielhinweis'
import type { Zielwerte } from '../zielwerte-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')
const WURZEL = join(SRC, '..', '..', '..')
const SQL = readFileSync(join(WURZEL, 'supabase', '_pipeline', '11_goals', '622_goal_free_maintenance.sql'), 'utf8')
const lies = (p: string) => readFileSync(join(SRC, p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

const ZW = (o: Partial<Zielwerte>): Zielwerte => ({
  gueltig_ab: '2026-10-08', kcal: 2753.6, protein_g: 162.8, carbs_g: null, fat_g: null, fiber_g: null,
  linoleic_acid_g: null, alpha_linolenic_acid_g: null, herkunft: 'kein_aktives_ziel', tdee: 2753.6,
  nutrition_goal: 'maintain', ruhendes_ziel: null, luecke: null, eingefroren: null, ...o,
})

describe('G-630 — gegen die Kette', () => {
  it('jede Hindernis-Herkunft aus G-622 kommt ungeglaettet durch und gilt als „ohne Ziel"', () => {
    const block = SQL.slice(SQL.indexOf('AS hindernis') - 200, SQL.indexOf('AS hindernis'))
    const werte = Array.from(block.matchAll(/'([a-z_]+)'::text/g)).map(m => m[1]!)
    assert.deepEqual(werte.sort(), ['erhaltung_nicht_berechenbar', 'kein_aktives_ziel'])
    for (const w of werte) {
      assert.equal(alsHerkunft(w), w, `${w} wird geglaettet`)
      assert.equal(ohneZiel(alsHerkunft(w)), true)
      assert.match(ohneZielSatz(alsHerkunft(w))!, /^Kein aktives Ziel/)
    }
    assert.match(SQL, /z\.hindernis, z\.tdee, z\.nutrition_goal/, 'zielwerte_am reicht hindernis als herkunft')
  })
  it('gespeicherte Herkunft bleibt, wie sie ist — ohne Warnung', () => {
    for (const w of ['formel', 'manuell'] as const) {
      assert.equal(alsHerkunft(w), w)
      assert.equal(ohneZiel(w), false)
      assert.equal(ohneZielSatz(w), null)
    }
  })
  it('der Hindernissatz kennt beide', () => {
    assert.match(hindernisSatz('kein_aktives_ziel'), /du läufst auf Erhaltung/)
    assert.match(hindernisSatz('erhaltung_nicht_berechenbar'), /nicht berechnen/)
  })
})

describe('G-630 — der Leseweg', () => {
  const read = lies('lib/profile/zielwerte-read.ts')
  it('herkunft wird nicht mehr auf formel geglaettet', () => {
    assert.match(read, /const herkunft = alsHerkunft\(r\.herkunft\)/)
    assert.ok(!/herkunft: r\.herkunft === 'manuell' \? 'manuell' : 'formel'/.test(read))
  })
  it('das Hindernis aus berechne_zielwerte kommt mit', () => {
    assert.match(read, /\|\| h === 'kein_aktives_ziel' \|\| h === 'erhaltung_nicht_berechenbar'/)
  })
  it('das ruhende Ziel umfasst den Status, den „pausieren" im Dialog schreibt', () => {
    const dialog = lies('app/v2/goals/ziel-setzen.tsx')
    const pause = /status: wahl === 'pausieren' \? '([a-z_]+)'/.exec(dialog)![1]!
    const liste = /\.in\('status', \[([^\]]+)\]\)/.exec(read)![1]!
    assert.ok(liste.includes(`'${pause}'`), `„pausieren" schreibt ${pause}, gelesen wird ${liste}`)
    assert.match(read, /\.eq\('goal_role', 'controlling'\)/)
  })
})

describe('G-630 — bis in die Anzeige', () => {
  const html = (e: React.ReactElement) => renderToStaticMarkup(e)
  it('die Warnung: Satz, Erhaltungswert, Weg zu „Ziel setzen"', () => {
    const h = html(React.createElement(KeinZielWarnung, { herkunft: 'kein_aktives_ziel', kcal: 2753.6, protein: 162.8, ruhend: null }))
    assert.match(h, /data-kein-ziel="kein_aktives_ziel"/)
    assert.match(h, /Kein aktives Ziel – du läufst auf Erhaltung\./)
    assert.match(h, /2\.754/)
    assert.match(h, /href="\/v2\/goals"[^>]*>Ziel setzen</)
  })
  it('mit ruhendem Ziel: Fortsetzen', () => {
    const h = html(React.createElement(KeinZielWarnung, { herkunft: 'kein_aktives_ziel', kcal: 2753.6, protein: null, ruhend: { title: 'G-559 Abbauziel' } }))
    assert.match(h, /„G-559 Abbauziel“ fortsetzen/)
  })
  it('mit Ziel: nichts', () => {
    assert.equal(html(React.createElement(KeinZielWarnung, { herkunft: 'formel', kcal: 2400, protein: 160, ruhend: null })), '')
  })
  it('Nutrition: der Zielhinweis warnt statt „aus dem Profil geschaetzt"', () => {
    const ohne = html(React.createElement(Zielhinweis, { ziele: ZW({}), vorschlag: null }))
    assert.match(ohne, /Kein aktives Ziel – du läufst auf Erhaltung/)
    assert.ok(!/aus dem Profil geschaetzt/.test(ohne))
    const mit = html(React.createElement(Zielhinweis, { ziele: ZW({ herkunft: 'formel' }), vorschlag: null }))
    assert.ok(!/Kein aktives Ziel/.test(mit))
    assert.match(mit, /aus dem Profil geschaetzt/)
  })
  it('Today und Goals reichen Herkunft und ruhendes Ziel an die Warnung', () => {
    const lesen = lies('lib/dashboard/lesen.ts')
    assert.match(lesen, /herkunft: ziele\.herkunft,\s*ruhend: ziele\.ruhendes_ziel,/)
    const dash = lies('app/v2/dashboard/dashboard-echt.tsx')
    assert.match(dash, /<KeinZielWarnung herkunft=\{d\.nutrition\.ziele\.herkunft\}/)
    // G-618: die Karte sitzt jetzt in der Steuerung des Reiters — die Kette
    // ansicht → ReiterGoals → Steuerung → SteuerungOhneZiel reicht `zielwerte` durch.
    const goals = lies('app/v2/goals/ansicht.tsx')
    assert.match(goals, /zielwerte=\{echt\.zielwerte\}/)
    const reiter = lies('app/v2/goals/reiter-goals.tsx')
    assert.match(reiter, /<SteuerungOhneZiel zielwerte=\{zielwerte\}/)
    const karte = lies('app/v2/goals/steuerung-ohne-ziel.tsx')
    assert.match(karte, /zielSpeichern\(ruhend\.goal_id, \{ status: 'active' \}\)/)
    assert.match(karte, /<KeinZielWarnung herkunft=\{zielwerte\.herkunft\}/)
  })
})

describe('G-630 — „beendet" statt „abgebrochen" (Tom 15:57)', () => {
  it('der Statusname', () => {
    assert.equal(STATUS_LABEL.abandoned, 'beendet')
    // G-618: „Abgeschlossen" steht im Reiter (`ABSCHLUSS` aus lib/goals/reiter.ts).
    assert.equal(ABSCHLUSS.abandoned, 'beendet')
    assert.ok(!/abgebrochen/.test(lies('app/v2/goals/reiter-goals.tsx')))
  })
})
