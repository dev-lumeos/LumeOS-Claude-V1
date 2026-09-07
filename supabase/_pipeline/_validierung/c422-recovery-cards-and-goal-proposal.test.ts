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

test('G-363: eine ueberfaellige Phase mit Messreihe erzeugt einen begruendeten Vorschlag und akzeptiert Widerspruch', () => {
  const result = json<{ next: string, reason: string, response: string }>(`
    WITH chosen AS (
      SELECT gp.id, gp.user_id FROM goals.goal_phases gp
      WHERE gp.actual_end_date IS NULL AND (SELECT count(*) FROM goals.body_measurements bm WHERE bm.user_id=gp.user_id) >= 2 LIMIT 1
    ), prepared AS (
      UPDATE goals.goal_phases SET projected_end_date=CURRENT_DATE-1 WHERE id=(SELECT id FROM chosen) RETURNING id,user_id
    ), claim AS (
      SELECT set_config('request.jwt.claim.sub',(SELECT user_id::text FROM prepared),false)
    ), proposal AS (
      SELECT * FROM goals.phase_transition_recommendation((SELECT user_id FROM prepared), CURRENT_DATE)
    ), objection AS (
      SELECT goals.phase_transition_respond((SELECT phase_id FROM proposal), 'rejected', 'Ich moechte die Phase fortsetzen.') AS response FROM claim
    ) SELECT json_build_object(
      'next', (SELECT recommended_next FROM proposal),
      'reason', (SELECT transition_reason FROM proposal),
      'response', (SELECT response FROM objection)
    );
  `)
  assert.equal(result.next.length > 0, true)
  assert.equal(result.reason.length > 0, true)
  assert.equal(result.response, 'rejected')
})
