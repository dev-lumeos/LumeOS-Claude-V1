// G-614: Zielrichtung, Mindestgrad und drei eindeutige Erstwahlen im Katalog.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-614 braucht eine Wegwerf-Datenbank, nie postgres.')

function query<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function failure(sql: string): string {
  try {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
      '-U', 'postgres', '-d', db, '-c', `BEGIN; ${sql}; ROLLBACK;`,
    ], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string }
    return `${failed.stdout ?? ''}\n${failed.stderr ?? ''}`
  }
  throw new Error('G-614: ungueltige Aenderung wurde akzeptiert.')
}

test('G-614: drei neue Pflichtfelder mit Domain-CHECKs und eindeutiger Erstwahl', () => {
  const result = query<{ columns: string[]; constraints: string[]; uniqueIndex: boolean }>(`
    SELECT json_build_object(
      'columns', coalesce((SELECT json_agg(column_name || ':' || data_type || ':' || is_nullable ORDER BY column_name)
        FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'goal_strategies'
          AND column_name IN ('auswahl_gruppe', 'min_erfahrung', 'standard')), '[]'::json),
      'constraints', coalesce((SELECT json_agg(conname ORDER BY conname)
        FROM pg_constraint
        WHERE conrelid = 'goals.goal_strategies'::regclass
          AND conname LIKE 'goal_strategies_g614_%'), '[]'::json),
      'uniqueIndex', EXISTS (SELECT 1 FROM pg_indexes
        WHERE schemaname = 'goals' AND tablename = 'goal_strategies'
          AND indexname = 'goal_strategies_g614_one_standard_per_group')
    );
  `)
  assert.deepEqual(result, {
    columns: ['auswahl_gruppe:text:NO', 'min_erfahrung:text:NO', 'standard:boolean:NO'],
    constraints: [
      'goal_strategies_g614_auswahl_gruppe_check',
      'goal_strategies_g614_min_erfahrung_check',
      'goal_strategies_g614_standard_check',
    ],
    uniqueIndex: true,
  })
})

test('G-614: alle 17 Strategien sind zugeordnet und jede Zielrichtung hat genau eine Beginner-Erstwahl', () => {
  const rows = query<Array<[string, string, string, boolean]>>(`
    SELECT coalesce(json_agg(json_build_array(code, auswahl_gruppe, min_erfahrung, standard)
      ORDER BY code), '[]'::json)
    FROM goals.goal_strategies;
  `)
  assert.deepEqual(rows, [
    ['aggressive_bulk', 'aufbauen', 'pro', false],
    ['aggressive_cut', 'abnehmen', 'pro', false],
    ['body_recomp', 'halten', 'advanced', false],
    ['clean_bulk', 'aufbauen', 'advanced', false],
    ['conservative_cut', 'abnehmen', 'advanced', false],
    ['contest_prep', 'plan', 'pro', false],
    ['custom', 'plan', 'pro', false],
    ['expert_bb_annual', 'plan', 'pro', false],
    ['gain', 'aufbauen', 'beginner', true],
    ['lean_bulk', 'aufbauen', 'advanced', false],
    ['lose', 'abnehmen', 'beginner', true],
    ['maintain', 'halten', 'beginner', true],
    ['maintenance_diet_break', 'halten', 'pro', false],
    ['mini_cut', 'abnehmen', 'advanced', false],
    ['moderate_cut', 'abnehmen', 'advanced', false],
    ['peak_week', 'plan', 'pro', false],
    ['reverse_diet', 'uebergang', 'advanced', false],
  ])
  for (const group of ['abnehmen', 'halten', 'aufbauen']) {
    assert.equal(rows.filter(row => row[1] === group && row[3] && row[2] === 'beginner').length, 1)
  }
})

test('G-614: ungueltige Gruppen, Grade und Standards werden abgewiesen', () => {
  assert.match(failure("UPDATE goals.goal_strategies SET auswahl_gruppe = 'falsch' WHERE code = 'lose'"),
    /goal_strategies_g614_auswahl_gruppe_check/)
  assert.match(failure("UPDATE goals.goal_strategies SET min_erfahrung = 'falsch' WHERE code = 'lose'"),
    /goal_strategies_g614_min_erfahrung_check/)
  assert.match(failure("UPDATE goals.goal_strategies SET standard = NULL WHERE code = 'lose'"),
    /null value in column "standard"/)
  assert.match(failure("UPDATE goals.goal_strategies SET standard = true WHERE code = 'reverse_diet'"),
    /goal_strategies_g614_standard_check/)
  assert.match(failure("UPDATE goals.goal_strategies SET min_erfahrung = 'beginner', standard = true WHERE code = 'moderate_cut'"),
    /goal_strategies_g614_one_standard_per_group/)
})
