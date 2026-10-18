/**
 * G-666 (Tom 18.10.) — unter der Phase Engine fallen „Weekly auto-adjustment", die Kennzahlen
 * Weight trend / Strength / Body fat / Adherence und „Expert BB annual" weg: nicht in
 * `PhaseEngine.dc.html`, die Inhalte stehen echt an den Entwurfsstellen (Wochentabelle, Wachen,
 * Modul-Kachel, Vorlage). Gezeichnet, nicht im Quelltext gesucht.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GoalsPhaseView } from '../tab-phase'
import * as Fehlende from '../fehlende-kacheln'
import { PHASE_STATE } from '../daten'

const WEG = ['Weekly auto-adjustment', 'Expert BB annual', 'Weight trend', 'Strength', 'Body fat', 'Adherence', 'No change this week', 'Active guards']

test('G-666: die Referenz unter der Linie zeigt die drei Abschnitte nicht mehr', () => {
  const h = renderToStaticMarkup(React.createElement(GoalsPhaseView)).replace(/<[^>]+>/g, '|')
  for (const w of WEG) assert.ok(!h.includes(w), `„${w}" steht noch unter der Phase Engine`)
  // was bleibt, bleibt: die Phase (Kopf), der Zustandsautomat und die Parameter
  for (const w of ['Phase state machine', 'Phase parameters']) assert.ok(h.includes(w), `„${w}" fehlt — zu viel entfernt`)
})

test('G-666: der Einschub oberhalb der Linie ist weg, seine Daten auch', () => {
  assert.ok(!('FehlendePhaseKacheln' in Fehlende), 'FehlendePhaseKacheln wird noch exportiert')
  for (const k of ['weightTrend', 'strengthTrend', 'bfTrend', 'recommendation']) assert.ok(!(k in PHASE_STATE), `PHASE_STATE.${k} ohne Leser`)
})
