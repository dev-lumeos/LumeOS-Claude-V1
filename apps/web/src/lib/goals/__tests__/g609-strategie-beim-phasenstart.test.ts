/**
 * G-609 — der Phasenstart speichert die gewaehlte Strategie
 *
 * `[cmd]` **Gemessen 2026-10-07:** `goals.goal_phase_start` hat acht
 * Parameter, der achte ist `p_strategie_code text` (A-105/G-558). Die
 * App reichte ihn nicht durch und meldete die Strategie „offen".
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

describe('G-609 — vom Modal bis in die Phase', () => {
  it('das Modal gibt die gewaehlte Strategie mit', () => {
    // G-628: „Ziel setzen" ersetzt das alte Modal.
    assert.match(lies(join(GOALS, 'ziel-setzen.tsx')), /strategie_code: p\.code,/)
  })

  it('phasenzielAnlegen reicht sie an phaseStarten', () => {
    const q = lies(join(HIER, '..', 'phasenziel-write.ts'))
    const i = q.indexOf('await phaseStarten({')
    assert.ok(i > 0)
    assert.match(q.slice(i, i + 400), /strategie_code: n\.phase\.strategie_code,/)
  })

  it('phaseStarten schickt sie als p_strategie_code', () => {
    const q = lies(join(HIER, '..', 'phase-write.ts'))
    const i = q.indexOf(".rpc('goal_phase_start', {")
    assert.ok(i > 0)
    assert.match(q.slice(i, i + 500), /p_strategie_code: e\.strategie_code \?\? null,/)
  })

  it('Phasenstart kennt das Feld', () => {
    assert.match(lies(join(HIER, '..', 'phase-regeln.ts')),
      /export type Phasenstart = \{[\s\S]*?strategie_code\?: string \| null[\s\S]*?\n\}/)
  })

  it('keine Stelle behauptet mehr, goal_phase_start nehme den Code nicht', () => {
    // G-615: strategie-wahl.tsx ist geloescht.
    for (const f of ['modale.tsx', 'strategie-vorschau.tsx']) {
      const roh = readFileSync(join(GOALS, f), 'utf8')
      assert.ok(!/goal_phase_start` nimmt (den Strategiecode|`?strategie_code`?|ihn) (heute )?nicht/.test(roh), f)
      assert.ok(!/goal_phase_start` hat keinen\s*\/\/\s*Parameter/.test(roh), f)
    }
    assert.ok(!/NICHT entgegen/.test(readFileSync(join(HIER, '..', 'phasenziel-write.ts'), 'utf8')))
  })
})
