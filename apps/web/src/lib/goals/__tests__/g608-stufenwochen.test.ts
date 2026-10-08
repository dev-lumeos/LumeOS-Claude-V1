/**
 * G-608 — die Stufenwochen sind im Programm editierbar
 *
 * **Tom, E-85:** *„ein user erwartet einen vorschlag, der soll aber
 * individuell von ihm editiert werden koennen"* — der Vorschlag aus
 * `stufenwochen` (G-607), die editierten Wochen in
 * `goals.goal_program_positions.duration_weeks`.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ankerplan, stufenplan, teilphasenAusWochen } from '../anker'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// Live seit A-105: contest_prep traegt 4 / 8 / 6.
const CP = [
  { name: 'early', dauer_anteil: 4 },
  { name: 'mid', dauer_anteil: 8 },
  { name: 'late', dauer_anteil: 6 },
]

describe('G-608 — Programm vor Vorschlag', () => {
  it('ohne Programm: der Vorschlag, keine Abweichung', () => {
    const s = stufenplan(CP, 16, {})
    assert.deepEqual(s.wochen, [4, 7, 5])
    assert.deepEqual(s.gespeichert, [false, false, false])
    assert.equal(s.abweichung, 0)
  })

  it('je Stufe die gespeicherte Woche, sonst der Vorschlag', () => {
    const s = stufenplan(CP, 16, { mid: 8 })
    assert.deepEqual(s.wochen, [4, 8, 5])
    assert.deepEqual(s.gespeichert, [false, true, false])
  })

  it('weicht die Summe ab, steht die Differenz da — nicht still korrigiert', () => {
    const s = stufenplan(CP, 16, { mid: 8 })
    assert.equal(s.summe, 17)
    assert.equal(s.abweichung, 1)
    assert.equal(stufenplan(CP, 16, { early: 2 }).abweichung, -2)
  })

  it('der Plan rechnet mit den eingetragenen Wochen', () => {
    const s = stufenplan(CP, 16, { mid: 8 })
    const plan = ankerplan('2026-11-14', teilphasenAusWochen(s.namen, s.wochen!), 'Show')
    assert.deepEqual(plan.map(z => [z.name, z.wochenVorher]),
      [['early', 17], ['mid', 13], ['late', 5], ['Show', 0]])
  })

  it('unbrauchbare gespeicherte Zahlen zaehlen nicht', () => {
    for (const w of [0, -1, 2.5, NaN]) {
      assert.deepEqual(stufenplan(CP, 16, { mid: w }).gespeichert, [false, false, false], String(w))
    }
  })

  it('ohne Gesamtdauer: nur, was gespeichert ist — sonst kein Plan', () => {
    assert.equal(stufenplan(CP, null, { mid: 8 }).wochen, null)
    assert.deepEqual(stufenplan(CP, null, { early: 4, mid: 8, late: 6 }).wochen, [4, 8, 6])
    assert.equal(stufenplan(CP, null, { early: 4, mid: 8, late: 6 }).abweichung, null)
  })
})

describe('G-608 — Lese- und Schreibweg', () => {
  const W = () => lies(join(HIER, '..', 'programm-write.ts'))

  it('speichert je Stufe nach goal_program_positions.duration_weeks', () => {
    const q = W()
    assert.match(q, /\.from\('goal_program_positions'\)\s*\.upsert\(/)
    assert.match(q, /onConflict: 'program_id,position'/)
    assert.match(q, /duration_weeks: s\.duration_weeks/)
  })

  it('zaehlt die geschriebenen Zeilen (G-79)', () => {
    assert.match(W(), /zeilen !== stufen\.length/)
  })

  it('setzt goal_phase_id nicht — es ist UNIQUE, die Stufen teilen eine Phase', () => {
    assert.ok(!/goal_phase_id\s*:/.test(W()))
  })

  it('zuruecksetzen loescht das Programm des Ziels', () => {
    assert.match(W(), /\.from\('goal_programs'\)\.delete\(\)\.eq\('goal_id', goalId\)/)
  })

  it('die Seite laedt die Programme und reicht sie bis zur Zeitachse', () => {
    assert.match(lies(join(GOALS, 'page.tsx')), /ladeProgrammwochen\(\)/)
    assert.match(lies(join(GOALS, 'ansicht.tsx')), /programme=\{echt\.programme\}/)
  })

  it('ein Programm einer anderen Strategie wird nicht angewandt', () => {
    assert.match(lies(join(GOALS, 'phasen-zeitachse.tsx')),
      /pr && s && pr\.strategie_code === s\.code \? pr\.wochen : \{\}/)
  })

  it('Zeitachse und Editor sagen die Abweichung an', () => {
    // G-610: die Zeitachse reicht zusaetzlich das verschobene Ende mit.
    assert.match(lies(join(GOALS, 'phasen-zeitachse.tsx')), /<Abweichung stufen=\{stufen\}[^>]*\/>/)
    assert.match(lies(join(GOALS, 'phasen-editor-echt.tsx')), /<Abweichung stufen=\{stufen\} \/>/)
  })
})
