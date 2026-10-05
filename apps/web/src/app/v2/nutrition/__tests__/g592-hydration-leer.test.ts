// G-592: kein Eintrag ist nicht „0 getrunken" — am LEBENDEN Weg.
//
// `[read]` **Die Regeln stammen aus dem zweiten Leseweg**
// (`getHydrationSummary`, gefallen mit diesem Punkt). Sie werden hier
// an `parseHydrationDay` und der Kachel bewacht, damit sie nicht mit
// ihm verschwinden.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { parseHydrationDay } from '../../../../lib/nutrition/hydration-day-read'
import { HydrationKachel } from '../hydration'

// `[cmd]` **Woertlich aus `nutrition.hydration_day`**, gemessen
// 2026-10-04 nach G-603: test-user, ein Tag ohne jeden Eintrag.
const LEER_ROH = {
  entry_date: '2026-10-04', logged_ml: null, log_count: 0, food_ml: null,
  food_ml_missing: 0, total_ml: null, total_complete: false, target_ml: 2849,
  target_source: 'profile', target_available: true, progress_pct: null,
  glass_size_ml: 250, glasses_total: 0, glasses_target: 12,
  avg_14d_total_ml: '0.0', avg_14d_days: 14, delta_vs_14d_ml: '0.0', behind_14d_avg_pct: null,
}
// `[cmd]` dev@lumeos.app, 2026-10-03: zwei Eintraege und Essen.
const VOLL_ROH = {
  ...LEER_ROH, entry_date: '2026-10-03', logged_ml: '1750.00', log_count: 2,
  food_ml: '1416.4041', total_ml: '3166.4041', total_complete: true,
  target_ml: 3188, progress_pct: '99.3', glasses_total: 12, glasses_target: 13,
}

test('G-592: ein leerer Tag bleibt null, nicht eine Zeile aus Nullen', () => {
  const t = parseHydrationDay([LEER_ROH], '2026-10-04')!
  assert.equal(t.logged_ml, null)
  assert.equal(t.food_ml, null)
  assert.equal(t.total_ml, null)
  assert.equal(t.total_complete, false)
  assert.equal(t.progress_pct, null)
  assert.equal(t.target_ml, 2849, 'das Ziel bleibt — es haengt nicht am Eintrag')
})

test('G-592: ein Tag mit Daten bleibt, wie er ist', () => {
  const t = parseHydrationDay([VOLL_ROH], '2026-10-03')!
  assert.equal(t.logged_ml, 1750)
  assert.equal(t.food_ml, 1416.4041)
  assert.equal(t.total_ml, 3166.4041)
  assert.equal(t.total_complete, true)
})

test('G-592: vollstaendig nur, wenn die Datenbank es sagt UND nichts fehlt', () => {
  // Aus `parseHydrationSummaries` uebernommen: ein fehlendes Feld ist
  // nicht „vollstaendig", und ein Widerspruch gilt als „nicht".
  const { total_complete: _weg, ...ohne } = VOLL_ROH
  assert.equal(parseHydrationDay([ohne], 'x')!.total_complete, false)
  assert.equal(parseHydrationDay([{ ...VOLL_ROH, food_ml_missing: 2 }], 'x')!.total_complete, false)
})

test('G-592: getrunken ohne Essensdaten — Essen ist „—", nicht 0', () => {
  const t = parseHydrationDay([{ ...VOLL_ROH, food_ml: null, total_ml: '1750' }], 'x')!
  assert.equal(t.food_ml, null)
  assert.equal(t.logged_ml, 1750)
})

// ── Die Kachel ───────────────────────────────────────────────────

const kachel = (roh: object) => renderToStaticMarkup(React.createElement(HydrationKachel, {
  tag: parseHydrationDay([roh], '2026-10-04'), datum: '2026-10-04',
}))

test('G-592: die Kachel sagt am leeren Tag „nichts erfasst", nicht „0 ml"', () => {
  const h = kachel(LEER_ROH)
  assert.match(h, /data-hydration-leer/)
  assert.match(h, /nichts erfasst/)
  // `[read]` Je Fundstelle: getrunken, aus Lebensmitteln, Glaeser.
  assert.doesNotMatch(h, /getrunken <span[^>]*>0 ml/, 'getrunken 0 ml')
  assert.doesNotMatch(h, /Lebensmitteln <span[^>]*>0 ml/, 'aus Lebensmitteln 0 ml')
  assert.doesNotMatch(h, />0 of \d+ glasses</, '0 of 12 glasses')
  assert.doesNotMatch(h, /\d+%</, 'ein Prozentwert am leeren Tag')
})

test('G-592: mit Daten zeigt die Kachel die Mengen', () => {
  const h = kachel(VOLL_ROH)
  assert.doesNotMatch(h, /data-hydration-leer/)
  assert.match(h, /1\.750 ml/)
  assert.match(h, /1\.416,4 ml/)
  assert.match(h, /12 of 13 glasses/)
})

// ── Der zweite Leseweg ist weg ───────────────────────────────────

test('G-592: getHydrationSummary und seine Model-Haelfte gibt es nicht mehr', () => {
  const src = path.join(process.cwd(), 'src')
  const funde: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (e.name !== '__tests__') geh(p) }
      else if (/\.tsx?$/.test(e.name)) {
        const s = fs.readFileSync(p, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
        for (const n of ['getHydrationSummary', 'parseHydrationSummaries',
          'emptyHydrationSummary', 'hydrationPercent', "from('hydration_summary')"]) {
          if (s.includes(n)) funde.push(`${path.relative(src, p)}: ${n}`)
        }
      }
    }
  }
  geh(src)
  assert.deepEqual(funde, [], 'ein zweiter Leseweg auf dieselbe Tatsache')
})
