import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const database = process.env.PGDATABASE
if (!database || database === 'postgres') throw new Error('A-88: quer-c501-seed-leere-module.test.ts braucht PGDATABASE als Wegwerf-Datenbank, nie postgres.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output) as T
}

test('C-501: der Medikamenten-Seed gehoert nur dev und deckt aktiv, Monitoring und abgesetzt ab', () => {
  const result = one<{
    c501: number
    foreign: number
    active: number
    monitored: number
    inactive: number
  }>(`
    SELECT json_build_object(
      'c501', (SELECT count(*)::integer FROM medical.user_medications
               WHERE source_detail = 'C-501 dev UI seed'),
      'foreign', (SELECT count(*)::integer FROM medical.user_medications um
                  JOIN auth.users u ON u.id = um.user_id
                  WHERE um.source_detail = 'C-501 dev UI seed'
                    AND u.email <> 'dev@lumeos.app'),
      'active', (SELECT count(*)::integer FROM medical.user_medications
                 WHERE source_detail = 'C-501 dev UI seed' AND is_active),
      'monitored', (SELECT count(*)::integer FROM medical.user_medications
                    WHERE source_detail = 'C-501 dev UI seed' AND monitoring),
      'inactive', (SELECT count(*)::integer FROM medical.user_medications
                   WHERE source_detail = 'C-501 dev UI seed' AND NOT is_active AND end_date IS NOT NULL)
    );
  `)

  assert.deepEqual(result, {
    c501: 3,
    foreign: 0,
    active: 2,
    monitored: 2,
    inactive: 1,
  })
})
