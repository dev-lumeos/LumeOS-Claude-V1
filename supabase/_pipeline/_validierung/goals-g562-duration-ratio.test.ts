// G-562/E-85: Teilphasen tragen ein exaktes Dauerverhaeltnis ohne Wochen.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-562 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function readStages(): Array<{
  code: string
  max_duration_weeks: number | null
  stages: Array<Record<string, unknown>>
}> {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
      SELECT coalesce(json_agg(json_build_object(
        'code', code,
        'max_duration_weeks', max_duration_weeks,
        'stages', sub_phases
      ) ORDER BY code), '[]'::json)
      FROM goals.goal_strategies
      WHERE jsonb_array_length(sub_phases) > 0;
    `,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '')
}

test('G-562: jede Teilphase hat einen Anteil und alle Anteile ergeben 18', () => {
  const strategies = readStages()
  assert.deepEqual(strategies.map(s => [s.code, s.stages.length, s.max_duration_weeks]), [
    ['contest_prep', 3, 16],
  ])
  for (const strategy of strategies) {
    assert.ok(strategy.stages.every(s => Number.isInteger(s.dauer_anteil)))
    assert.equal(strategy.stages.reduce((sum, s) => sum + Number(s.dauer_anteil), 0), 18)
    assert.ok(
      strategy.stages.every(s => !('weeks' in s) && !('duration_ratio_pct' in s)),
      'Katalog-Teilphasen enthalten weder feste Wochen noch gerundete Prozente',
    )
  }
  assert.deepEqual(strategies[0].stages.map(s => [s.name, s.dauer_anteil]), [
    ['early', 4], ['mid', 8], ['late', 6],
  ])
  for (const [total, expected] of [[16, [4, 7, 5]], [20, [4, 9, 7]]] as const) {
    assert.deepEqual(
      strategies[0].stages.map(s => Math.round(total * Number(s.dauer_anteil) / 18)),
      expected,
    )
  }
})
