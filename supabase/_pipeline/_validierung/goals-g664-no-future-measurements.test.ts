import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-664 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

function sql(query: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', query],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

function lastJson(query: string): any {
  const output = sql(query)
  const line = output.split(/\r?\n/).findLast(value => value.startsWith('{'))
  assert.ok(line, output)
  return JSON.parse(line)
}

test('G-664: Zukunftswiegung aendert weder Profil noch Leser', () => {
  const result = lastJson(`BEGIN;
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,
        measurement_source,source_detail)
    VALUES ('${user}',CURRENT_DATE+2,time '23:59',160,'admin',
      'G-664 Zukunftssabotage');
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'today',CURRENT_DATE,
      'latest',(SELECT weight_kg FROM goals.body_measurements
        WHERE user_id='${user}' AND measurement_date<=CURRENT_DATE
        ORDER BY measurement_date DESC,measurement_time DESC,created_at DESC LIMIT 1),
      'profile',(SELECT body_weight_kg FROM public.profiles WHERE id='${user}'),
      'trend_date',(SELECT letzte_messung_am FROM goals.trendgewicht_am(
        '${user}',CURRENT_DATE+3)),
      'point_date',(SELECT max(measured_on) FROM goals.measurement_points(
        '${goal}',CURRENT_DATE+3)),
      'preview_date',(SELECT datum FROM goals.measurement_goal_start_preview(
        'body_weight',CURRENT_DATE+3)),
      'phase_date',(SELECT measurement_date FROM goals.phase_start_weight_selection(
        '${user}',CURRENT_DATE+3)),
      'outlook_date',(goals.controlling_goal_outlook(
        '${goal}',CURRENT_DATE+3)->>'stichtag'));
    ROLLBACK;`)
  assert.equal(result.profile, result.latest) // Zukunfts-Sabotage: altes Profil waere 160.
  for (const field of ['trend_date', 'point_date', 'preview_date',
    'phase_date', 'outlook_date']) {
    assert.ok(result[field] <= result.today, `${field}: ${result[field]}`)
  }
})

test('G-664: Beitragslauf schreibt keinen Tag nach heute', () => {
  const result = lastJson(`BEGIN;
    SELECT goals.refresh_goal_contributions(CURRENT_DATE+1,CURRENT_DATE+2,
      CURRENT_DATE+2,'${user}');
    SELECT json_build_object('future_rows',count(*))
    FROM goals.goal_contributions
    WHERE user_id='${user}' AND contribution_date>CURRENT_DATE;
    ROLLBACK;`)
  assert.equal(result.future_rows, 0)
})

test('G-664: taegliche Seed-Kopie begrenzt beide Koerpertabellen', () => {
  const source = readFileSync('supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql', 'utf8')
  assert.match(source,
    /FROM goals\.body_measurements\s+WHERE user_id = :'quelle'::uuid\s+AND measurement_date <= CURRENT_DATE;/)
  assert.match(source,
    /FROM goals\.body_circumferences\s+WHERE user_id = :'quelle'::uuid\s+AND measurement_date <= CURRENT_DATE;/)
})
