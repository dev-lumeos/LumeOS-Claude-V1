/**
 * G-615 — der Reiter Phase engine wird der Planer
 *
 * **Tom, 2026-10-07:** *„reiter phase engine ist doch genau der planner"*.
 * `[cmd]` **Fixture = Live-Zeile `contest_prep` 2026-10-08:** 16 Wochen,
 * Teilphasen early/mid/late mit `dauer_anteil` 4/8/6, `tdee_multiplier`
 * 0.85/0.78/0.70 und `cardio`-Objekt.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { planvorschau } from '../planer'
import { teilphasen, type Strategie } from '../strategie-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

const plan = (p: Partial<Strategie>) => ({
  code: 'x', label: 'X', sub_phases: [], max_duration_weeks: null, ...p,
}) as unknown as Strategie
const CONTEST = plan({
  code: 'contest_prep', label: 'Contest Prep', max_duration_weeks: 16,
  sub_phases: teilphasen([
    { name: 'early', dauer_anteil: 4, tdee_multiplier: 0.85,
      cardio: { type: 'LISS', minutes: [30, 40], sessions_per_week: [3, 4] } },
    { name: 'mid', dauer_anteil: 8, tdee_multiplier: 0.78,
      cardio: { type: 'LISS/MISS', minutes: [40, 40], sessions_per_week: [4, 6] } },
    { name: 'late', dauer_anteil: 6, tdee_multiplier: 0.70,
      cardio: { type: 'LISS + HIIT', minutes: [40, 45], sessions_per_week: [5, 7] } },
  ]),
})

describe('G-615 — vom Termin rueckwaerts', () => {
  it('16 Wochen vor dem 2027-03-01: 4/7/5, Weeks out 16/12/5, Defizit und Cardio', () => {
    const v = planvorschau(CONTEST, '2027-03-01', '2026-10-08')
    assert.ok(v.ok)
    assert.deepEqual(v.stufen.map(s => [s.name, s.wochen, s.wochenVorher, s.beginn, s.defizitPct]), [
      ['early', 4, 16, '2026-11-09', 15],
      ['mid', 7, 12, '2026-12-07', 22],
      ['late', 5, 5, '2027-01-25', 30],
    ])
    assert.equal(v.stufen[0]!.cardio, 'LISS · 30–40 min · 3–4×/Wo')
    assert.equal(v.ende, '2027-03-01')
    assert.equal(v.verschoben, false)
  })

  it('reicht die Zeit nicht, beginnt der Plan heute und das Ende verschiebt sich', () => {
    // 2027-01-27 − 16 Wochen = 2026-10-07, einen Tag VOR heute.
    const v = planvorschau(CONTEST, '2027-01-27', '2026-10-08')
    assert.ok(v.ok)
    assert.equal(v.verschoben, true)
    assert.equal(v.ende, '2027-01-28')
    assert.equal(v.stufen[0]!.beginn, '2026-10-08')
  })

  it('ein Plan ohne Teilphasen ist eine Stufe ueber seine Dauer (Peak Week)', () => {
    const v = planvorschau(plan({ code: 'peak_week', label: 'Peak Week', max_duration_weeks: 1 }),
      '2027-03-01', '2026-10-08')
    assert.ok(v.ok)
    assert.deepEqual(v.stufen.map(s => [s.name, s.wochen, s.beginn]), [['Peak Week', 1, '2027-02-22']])
  })

  it('ohne Dauer, ohne Termin oder mit Termin in der Vergangenheit: keine Vorschau', () => {
    assert.equal(planvorschau(plan({ label: 'Custom' }), '2027-03-01', '2026-10-08').ok, false)
    assert.equal(planvorschau(CONTEST, '', '2026-10-08').ok, false)
    assert.equal(planvorschau(CONTEST, '2026-10-01', '2026-10-08').ok, false)
  })
})

describe('G-615 — der Reiter', () => {
  const A = () => lies(join(GOALS, 'ansicht.tsx'))
  it('Strategie-Reiter und Phasenarten-Auswahl sind weg', () => {
    assert.ok(!/<StrategieWahl|<PhaseBeginnen|<PhaseWechseln/.test(A()))
  })
  it('der Planer und die Zustandsanzeige stehen im Reiter', () => {
    assert.match(A(), /<Planer strategien=\{echt\.strategien\}/)
    assert.match(A(), /<PhasenZustand ziele=\{echt\.ziele\}/)
  })
  it('die Attrappe „Phase state machine" ist gefallen', () => {
    assert.ok(!/title="Phase state machine"/.test(lies(join(GOALS, 'fehlende-kacheln.tsx'))))
  })
  it('der Planer rechnet ueber planvorschau und legt ueber den gemeinsamen Weg an', () => {
    const q = lies(join(GOALS, 'planer.tsx'))
    assert.match(q, /planvorschau\(plan, termin, heute\)/)
    assert.match(q, /phasenzielAnlegenAktion\(\{/)
    assert.match(q, /strategie_code: plan\.code/)
  })
  it('ein Plan ueber dem Grad ist gesperrt — mit der Regel aus zielwahl.ts', () => {
    // Sabotage 2026-10-08: `disabled` entfernt und eine eigene Gradregel
    // eingesetzt — die Importprobe in g541 blieb gruen. Deshalb die
    // Verdrahtung selbst: die Sperre kommt aus `gesperrt` und sitzt am Knopf.
    const q = lies(join(GOALS, 'planer.tsx'))
    assert.match(q, /const zu = gesperrt\(p, erfahrung\)\r?\n/)
    assert.match(q, /data-plan=\{p\.code\} disabled=\{zu\}/)
    assert.match(q, /\{zu && <span data-plan-sperre/)
  })
  it('die Zustandsanzeige liest das aktive steuernde Ziel und next_codes', () => {
    // `[cmd]` **G-618: steuernd heisst `goal_role`, nicht `is_primary`**
    // (G-617, `uq_user_goals_one_active_controlling`).
    const q = lies(join(GOALS, 'planer.tsx'))
    assert.match(q, /const ziel = steuerziel\(ziele\)/)
    assert.match(q, /naechsteNamen\(s, strategien\)/)
  })
})
