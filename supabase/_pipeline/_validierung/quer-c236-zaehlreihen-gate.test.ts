import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const seed = readFileSync('supabase/_pipeline/_testdaten/testdaten-einspielen.ts', 'utf8')
const start = seed.indexOf('-- ── C-236: das Zaehlreihen-Gate')
const firstDo = seed.indexOf('DO $$', start)
const gate = seed.slice(start, seed.indexOf('\nDO $$', firstDo + 1))

test('C-236: Zaehlreihen pruefen longitudinale Recovery-Messwerte, nicht Wiederholungen innerhalb eines Trainingssatzes', () => {
  assert.match(gate, /FROM recovery\.checkins/, 'die longitudinalen Recovery-Reihen bleiben geprueft')
  assert.doesNotMatch(gate, /training\.workout_sets/, 'konstante Arbeitssatzlasten sind keine Messwert-Zaehlreihe')
})
