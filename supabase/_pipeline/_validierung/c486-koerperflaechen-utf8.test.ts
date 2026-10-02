import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const database = process.env.PGDATABASE
if (!database || database === 'postgres') throw new Error('A-88: c486-koerperflaechen-utf8.test.ts braucht PGDATABASE als Wegwerf-Datenbank, nie postgres.')

function scalar(sql: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
}

test('C-486: deutsche Muskelkartenamen enthalten kein verlorenes Fragezeichen', () => {
  const affected = scalar(`
    SELECT count(*)
    FROM public.koerperflaechen
    WHERE art = 'muskel' AND name_de LIKE '%?%';
  `)
  assert.equal(affected, '0', `C-486: ${affected} deutscher Muskelname(n) enthalten ein Fragezeichen`)
})
