/**
 * G-607 — der Ankerplan rechnet aus dem Dauer-Anteil
 *
 * `[cmd]` **Seit G-562 traegt `goal_strategies.sub_phases` fuer
 * `contest_prep` je Stufe `dauer_anteil` 4 / 8 / 6, kein `weeks`.**
 * Tom, E-85: *„ein user erwartet einen vorschlag, der soll aber
 * individuell von ihm editiert werden koennen"*.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ankerplan, gesamtdauer, gesamtWochen, stufenwochen, teilphasenAusAnteil,
} from '../anker'
import { teilphasen } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// Die Zeile, wie G-562 sie schreibt (`562_goal_subphase_duration_ratio.sql`).
const CONTEST_PREP = [
  { name: 'early', dauer_anteil: 4, tdee_multiplier: 0.85 },
  { name: 'mid', dauer_anteil: 8, tdee_multiplier: 0.78 },
  { name: 'late', dauer_anteil: 6, tdee_multiplier: 0.70 },
]
const ANTEILE = [4, 8, 6]

describe('G-607 — Gesamtwochen und Anteile → Wochen je Stufe', () => {
  it('16 → 4/7/5 und 20 → 4/9/7 (E-85)', () => {
    assert.deepEqual(stufenwochen(16, ANTEILE), [4, 7, 5])
    assert.deepEqual(stufenwochen(20, ANTEILE), [4, 9, 7])
  })

  it('17 → Summe 17, nicht 18 wie beim reinen Runden', () => {
    // `[cmd]` **Math.round gaebe 4 / 8 / 6 = 18.** Groesster Rest:
    // 3.78 / 7.56 / 5.67 → 3 / 7 / 5, zwei Wochen an .78 und .67.
    const w = stufenwochen(17, ANTEILE)
    assert.deepEqual(w, [4, 7, 6])
    assert.equal(w!.reduce((s, x) => s + x, 0), 17)
  })

  it('die Summe stimmt fuer jede Dauer, jede Stufe ≥ 1', () => {
    for (const anteile of [ANTEILE, [1, 1, 1], [1, 100, 1], [3, 1], [5]]) {
      for (let g = anteile.length; g <= 60; g++) {
        const w = stufenwochen(g, anteile)
        assert.ok(w, `${g} / ${anteile}: keine Antwort`)
        assert.equal(w.reduce((s, x) => s + x, 0), g, `${g} / ${anteile}: Summe`)
        assert.ok(w.every(x => x >= 1), `${g} / ${anteile}: eine Stufe < 1 → ${w}`)
      }
    }
  })

  it('eine Stufe, die auf 0 fiele, bekommt eine Woche von der groessten', () => {
    // 3 Wochen bei 1:100:1 → genau 0.03 / 2.94 / 0.03.
    assert.deepEqual(stufenwochen(3, [1, 100, 1]), [1, 1, 1])
    assert.deepEqual(stufenwochen(4, [1, 100, 1]), [1, 2, 1])
  })

  it('keine ehrliche Antwort → null', () => {
    assert.equal(stufenwochen(2, ANTEILE), null, 'weniger Wochen als Stufen')
    assert.equal(stufenwochen(16.5, ANTEILE), null, 'halbe Wochen')
    assert.equal(stufenwochen(16, []), null, 'keine Stufen')
    assert.equal(stufenwochen(16, [4, NaN, 6]), null, 'fehlender Anteil')
    assert.equal(stufenwochen(16, [4, 0, 6]), null, 'Anteil null')
  })
})

describe('G-607 — vom Katalog zum Plan', () => {
  it('der Lesepfad traegt dauer_anteil, nicht weeks', () => {
    const t = teilphasen(CONTEST_PREP)
    assert.deepEqual(t.map(x => x.dauer_anteil), [4, 8, 6])
    assert.ok(t.every(x => !('weeks' in x)), 'weeks ist zurueck')
    assert.deepEqual(teilphasen([{ name: 'alt', weeks: '24–16' }])
      .map(x => x.dauer_anteil), [null], 'die alte Form erfindet einen Anteil')
  })

  it('16 Wochen vor dem 2026-11-14: early 16, mid 12, late 5 Wochen davor', () => {
    const plan = ankerplan('2026-11-14',
      teilphasenAusAnteil(teilphasen(CONTEST_PREP), 16), 'Show')
    assert.deepEqual(plan.map(z => [z.name, z.wochenVorher, z.datum]), [
      ['early', 16, '2026-07-25'],
      ['mid', 12, '2026-08-22'],
      ['late', 5, '2026-10-10'],
      ['Show', 0, '2026-11-14'],
    ])
    assert.equal(gesamtWochen(plan), 16)
  })

  it('ohne Gesamtdauer oder ohne Anteil: nur der Anker, kein erfundenes Datum', () => {
    assert.deepEqual(teilphasenAusAnteil(teilphasen(CONTEST_PREP), null), [])
    // So steht es live, solange G-562 nicht eingespielt ist.
    const ohne = CONTEST_PREP.map(({ dauer_anteil: _, ...r }) => r)
    assert.deepEqual(teilphasenAusAnteil(teilphasen(ohne), 16), [])
  })

  it('das Override des Nutzers geht vor dem Katalog', () => {
    assert.equal(gesamtdauer(20, 16), 20)
    assert.equal(gesamtdauer(undefined, 16), 16)
    assert.equal(gesamtdauer('20', 16), 16, 'Text ist kein Override')
    assert.equal(gesamtdauer(null, null), null)
  })
})

describe('G-607 — alle drei Leser rechnen aus dem Anteil', () => {
  for (const [datei, aufruf] of [
    // G-608: ueber `stufenplan` — Programm vor Vorschlag, der Vorschlag aus dem Anteil.
    ['phasen-editor-echt.tsx', /stufenplan\(strategie\.sub_phases, gesamt, zahlen\)/],
    ['phasen-zeitachse.tsx', /stufenplan\(z\.strategie\.sub_phases, gesamtdauer\(/],
    ['strategie-vorschau.tsx', /stufenwochen\(s\.max_duration_weeks/],
  ] as const) {
    it(datei, () => {
      const q = lies(join(GOALS, datei))
      assert.match(q, aufruf, `${datei} rechnet nicht aus dem Anteil`)
      assert.ok(!/\.weeks\b/.test(q), `${datei} liest noch weeks`)
    })
  }

  it('Editor und Zeitachse nehmen dieselbe Gesamtdauer', () => {
    assert.match(lies(join(GOALS, 'phasen-editor-echt.tsx')),
      /gesamtdauer\(entwurf\.max_duration_weeks, strategie\.max_duration_weeks\)/)
    assert.match(lies(join(GOALS, 'phasen-zeitachse.tsx')),
      /gesamtdauer\(\s*z\.phase\?\.parameters\.max_duration_weeks, z\.strategie\.max_duration_weeks\)/)
  })
})
