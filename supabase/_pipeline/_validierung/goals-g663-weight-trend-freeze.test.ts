import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-663 braucht eine Wegwerf-Datenbank.')
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

test('G-663: einzelner Rohwert ueber 88 kg friert das Steuerziel nicht ein', () => {
  const result = lastJson(`BEGIN;
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,
        measurement_source,source_detail)
    VALUES ('${user}',CURRENT_DATE,time '23:59',88.5,'admin','G-663 Ausreisser');
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'raw',(SELECT max(weight_kg) FROM goals.body_measurements
        WHERE user_id='${user}' AND measurement_date=CURRENT_DATE),
      'trend',(SELECT wert FROM goals.trendgewicht_am('${user}',CURRENT_DATE)),
      'state',(SELECT state FROM goals.goal_state_at('${goal}',CURRENT_DATE))) ;
    ROLLBACK;`)
  assert.ok(result.raw >= 88)
  assert.ok(result.trend < 88)
  assert.equal(result.state, 'active') // Rohwert-Sabotage: alte Freeze-Regel waere rot.
})

test('G-663: wiederholt hohe Messungen frieren am ersten Trendtreffer ein', () => {
  const result = lastJson(`BEGIN;
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,
        measurement_source,source_detail)
    SELECT '${user}',CURRENT_DATE-d,time '23:59',100,'admin',
      'G-663 Trendprobe' FROM generate_series(3,0,-1) d;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT json_build_object('state',s.state,'reason',s.reason,
      'frozen_on',s.frozen_on,'today',CURRENT_DATE)
    FROM goals.goal_state_at('${goal}',CURRENT_DATE) s;
    ROLLBACK;`)
  assert.equal(result.state, 'eingefroren')
  assert.equal(result.reason, 'erreicht')
  assert.ok(result.frozen_on <= result.today)
})

test('G-663: Kraft-Messziel bleibt am Rohpunkt messbar', () => {
  const result = lastJson(`BEGIN;
    UPDATE goals.user_goals SET target_value=97
      WHERE id='30000000-0000-0000-0000-000000000102';
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT row_to_json(s) FROM goals.goal_state_at(
      '30000000-0000-0000-0000-000000000102',DATE '2026-08-18') s;
    ROLLBACK;`)
  assert.equal(result.reason, 'erreicht')
})
