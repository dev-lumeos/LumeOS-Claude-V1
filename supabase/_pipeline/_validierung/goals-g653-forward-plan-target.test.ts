import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-653 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

function query(body: string): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
      BEGIN;
      SELECT set_config('request.jwt.claim.sub','${user}',true);
      SET LOCAL ROLE authenticated;
      ${body}
      ROLLBACK;
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-653: ein historisch erreichter Wert erzeugt kein vergangenes Prognosedatum', () => {
  const result = query(`
    SELECT json_build_object(
      'today', CURRENT_DATE,
      'date', goals.plan_zieldatum('${goal}'),
      'status', goals.controlling_goal_outlook('${goal}')
        ->'prognose'->>'plan_status',
      'historical', (SELECT wert FROM goals.plan_soll_am(
        '${goal}', DATE '2026-09-03'))
    );`)
  assert.ok(result.historical)
  assert.equal(result.date, null)
  assert.equal(result.status, 'nicht_im_plan')
})

test('G-653: eine verlaengerte Planposition ergibt ein Datum ab heute', () => {
  const result = query(`
    UPDATE goals.goal_program_positions
      SET projected_end_date=CURRENT_DATE+300
      WHERE program_id=(SELECT id FROM goals.goal_programs
        WHERE goal_id='${goal}' AND status='aktiv')
        AND position=(SELECT max(position) FROM goals.goal_program_positions
          WHERE program_id=(SELECT id FROM goals.goal_programs
            WHERE goal_id='${goal}' AND status='aktiv'));
    SELECT json_build_object(
      'today', CURRENT_DATE,
      'date', goals.plan_zieldatum('${goal}'),
      'status', goals.controlling_goal_outlook('${goal}')
        ->'prognose'->>'plan_status'
    );`)
  assert.match(String(result.date), /^\d{4}-\d{2}-\d{2}$/)
  assert.ok(String(result.date) >= String(result.today))
  assert.equal(result.status, 'datum')
})
