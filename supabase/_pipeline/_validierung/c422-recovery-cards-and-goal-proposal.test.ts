import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-422-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

function json<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', ['exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql], { encoding: 'utf8' }).trim()) as T
}

test('C-422: elf Recovery-Kacheln lesen Testdaten und leere Kacheln liefern einen Namen', () => {
  const result = json<{ bound: number, populated: number, namedEmpty: boolean }>(`
    WITH cards AS (
      SELECT * FROM recovery.card_read_all('20000000-0000-0000-0000-000000000901'::uuid)
    ), empty_cards AS (
      SELECT * FROM recovery.card_read_all('20000000-0000-0000-0000-000000000902'::uuid)
    ) SELECT json_build_object(
      'bound', (SELECT count(*) FROM cards),
      'populated', (SELECT count(*) FROM cards WHERE has_data),
      'namedEmpty', (SELECT bool_and(NOT has_data AND empty_hint IS NOT NULL AND length(empty_hint) > 0) FROM empty_cards)
    );
  `)
  assert.deepEqual(result, { bound: 11, populated: 11, namedEmpty: true })
})

// Der frühere direkte Phasen-Seed für G-363 ist seit G-625/G-626 ungültig.
// Phasenvorschläge und Bestätigung prüfen die aktuellen Goals-Proben.
