import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-644 Teil 2 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function run(sql: string, beforeRole = ''): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
      BEGIN;
      SELECT set_config('request.jwt.claim.sub','${user}',true);
      ${beforeRole}
      SET LOCAL ROLE authenticated;
      ${sql}
      ROLLBACK;
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-644 Teil 2: Herkunft und drei Wachen sind lesbar', () => {
  const got = run(`SELECT json_build_object(
    'prep',(SELECT goals.goal_plan_type_at(id)->>'code' FROM goals.goal_programs
      WHERE user_id=auth.uid() AND name='Contest Prep 2027'),
    'annual',(SELECT goals.goal_plan_type_at(id)->>'code' FROM goals.goal_programs
      WHERE user_id=auth.uid() AND name='Off-Season 2027'),
    'simple',(SELECT goals.goal_plan_type_at(id)->>'code' FROM goals.goal_programs
      WHERE user_id=auth.uid() AND status='aktiv'),
    'guards',(SELECT goals.goal_phase_guards_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.goal_role='controlling' AND g.status='active'))`)
  assert.equal(got.prep, 'prep')
  assert.equal(got.annual, 'annual')
  assert.equal(got.simple, 'einfach')
  const guards = got.guards as Array<Record<string, unknown>>
  assert.deepEqual(guards.map(g => g.key),
    ['kraftverlust_4w', 'trend_3w', 'koerperfett_grenze'])
  for (const guard of guards) {
    assert.ok(['ok', 'ausgeloest', 'keine_daten', 'nicht_anwendbar']
      .includes(String(guard.status)))
    assert.ok(guard.quelle)
    assert.ok(guard.stand_am)
  }
})

test('G-644 Teil 2: Programmwechsel und Wochenänderung rechnen A-Anker neu', () => {
  const got = run(`SELECT goals.goal_plan_position_recalculate(
      (SELECT pos.id FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.user_id=auth.uid() AND plan.name='Contest Prep 2027'
          AND pos.position=2),
      'mini_cut',NULL::jsonb,8::smallint);
    SELECT json_build_object(
      'first_after',(SELECT min(gueltig_ab) FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM goals.goal_programs
          WHERE user_id=auth.uid() AND name='Contest Prep 2027')),
      'last_end',(SELECT max(projected_end_date) FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM goals.goal_programs
          WHERE user_id=auth.uid() AND name='Contest Prep 2027')),
      'code',(SELECT strategie_code FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM goals.goal_programs
          WHERE user_id=auth.uid() AND name='Contest Prep 2027')
          AND position=2),
      'weeks',(SELECT duration_weeks FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM goals.goal_programs
          WHERE user_id=auth.uid() AND name='Contest Prep 2027')
          AND position=2))`)
  assert.equal(got.code, 'mini_cut')
  assert.equal(got.weeks, 8)
  assert.equal(got.last_end, '2027-02-03')
  assert.equal(got.first_after, '2026-10-08')
})

test('G-644 Teil 2: abgeschlossener Plan startet als Entwurf und Löschen braucht Bestätigung', () => {
  const got = run(`SELECT goals.goal_plan_restart(
      (SELECT id FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Contest Prep 2025'),
      'Contest Prep Neustart',date '2027-03-01');
    SELECT json_build_object(
      'new_status',(SELECT status FROM goals.goal_programs
        WHERE user_id=auth.uid() AND name='Contest Prep Neustart'),
      'new_positions',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM goals.goal_programs
          WHERE user_id=auth.uid() AND name='Contest Prep Neustart')),
      'old_id',(SELECT id FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Contest Prep 2025'),
      'new_id',(SELECT id FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Contest Prep Neustart'))`)
  assert.equal(got.new_status, 'entwurf')
  assert.equal(got.new_positions, 4)
  assert.notEqual(got.old_id, got.new_id)
  const deleted = run(`SELECT goals.goal_plan_delete_completed(
      (SELECT id FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Contest Prep 2025'),true);
    SELECT json_build_object('left',(SELECT count(*) FROM goals.goal_programs
      WHERE user_id=auth.uid() AND name='Contest Prep 2025'))`)
  assert.equal(deleted.left, 0)
  assert.throws(() => run(`SELECT goals.goal_plan_delete_completed(
      (SELECT id FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Contest Prep 2025'),false);
    SELECT json_build_object('ok',true)`), /G644_CONFIRM/)
})

test('G-644 Teil 2: neuer Vorlagenplan behält seinen Typ', () => {
  const got = run(`SELECT goals.goal_plan_create(
      (SELECT id FROM goals.user_goals WHERE user_id=auth.uid()
        AND goal_role='controlling' AND status='active'),
      'G644 Typ-Probe','mini',CURRENT_DATE);
    SELECT json_build_object('typ',(
      SELECT goals.goal_plan_type_at(id) FROM goals.goal_programs
      WHERE user_id=auth.uid() AND name='G644 Typ-Probe'))`)
  const typ = got.typ as Record<string, unknown>
  assert.equal(typ.code, 'mini')
  assert.equal(typ.quelle, 'lumeos')
})

test('G-644 Teil 2: die historische Soll-Linie endet exakt am Zielwert', () => {
  const got = run(`SELECT json_build_object(
    'soll',(SELECT wert FROM goals.plan_soll_am(
      '30000000-0000-0000-0000-000000000901',CURRENT_DATE)),
    'rate',(SELECT rate_pct FROM goals.plan_soll_am(
      '30000000-0000-0000-0000-000000000901',CURRENT_DATE)))`, `
    UPDATE goals.user_goals SET start_value=85,target_value=80,target_unit='kg'
    WHERE id='30000000-0000-0000-0000-000000000901';
  `)
  assert.equal(got.soll, 80)
  assert.equal(got.rate, -0.4)
})
