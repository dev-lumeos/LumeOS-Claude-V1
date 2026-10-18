/**
 * G-666/G-671 (Tom 18.10.) — unter der Phase Engine steht keine Mockup-Referenz mehr: erst fielen
 * „Weekly auto-adjustment", die Kennzahlen und „Expert BB annual" (G-666), dann der Phasenkopf
 * „Recomposition", „Phase state machine" und „Phase parameters" (G-671). Nichts davon steht in
 * `PhaseEngine.dc.html`.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as Phase from '../tab-phase'
import * as Fehlende from '../fehlende-kacheln'
import * as Daten from '../daten'

test('G-671: die Phase-engine-Referenz und ihr Zustand sind weg', () => {
  assert.ok(!('GoalsPhaseView' in Phase), 'GoalsPhaseView wird noch exportiert')
  assert.ok(!('PHASE_STATE' in Daten), 'PHASE_STATE ohne Leser')
  assert.ok(!('GOAL_PHASES' in Daten), 'GOAL_PHASES ohne Leser (phase-editor.tsx ist geloescht)')
  assert.ok(!('FehlendePhaseKacheln' in Fehlende), 'FehlendePhaseKacheln wird noch exportiert')
  // was daneben bleibt, bleibt
  for (const v of ['GoalsTDEEView', 'GoalsCrossModuleView']) assert.ok(v in Phase, `${v} fehlt — zu viel entfernt`)
})

test('G-671: im Reiter Phase engine steht unter dem Planer keine Trennlinie und keine Referenz', () => {
  const t = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'ansicht.tsx'), 'utf8')
  const i = t.indexOf("tab === 'phase'")
  assert.ok(i > 0, 'der Zweig fuer `phase` fehlt')
  const naechster = t.indexOf("tab === '", i + 10)
  const block = t.slice(i, naechster).replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  assert.ok(block.includes('<PlanSeite'), 'der Planer fehlt — falscher Block')
  for (const w of ['<ReferenzTrenner', '<GoalsPhaseView']) assert.ok(!block.includes(w), `${w} steht noch im Reiter`)
})
