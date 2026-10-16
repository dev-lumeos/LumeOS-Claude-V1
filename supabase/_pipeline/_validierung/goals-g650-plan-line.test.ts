import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-650 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

function sql(query: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', query],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-650: Wochen-Soll und Soll/Woche folgen der laufenden Planposition', () => {
  const result = JSON.parse(sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.controlling_goal_outlook('${goal}',DATE '2026-10-09');
    ROLLBACK;`).split(/\r?\n/).find(line => line.startsWith('{'))!)
  const last = result.wochen.at(-1)
  assert.equal(result.kennzahlen.soll_kg_pro_woche, 0.226)
  assert.match(result.kennzahlen.soll_quelle, /^plan_position:/)
  assert.match(result.kennzahlen.soll_quelle, /trendgewicht_am:trend_ema$/)
  assert.match(last.soll_quelle, /^plan_position:/)
  assert.match(last.soll_delta_quelle, /^plan_position:/)
  assert.notEqual(last.soll_kg, 87.024)
  assert.equal(result.prognose.plan_datum, '2026-09-03')
  assert.match(result.prognose.plan_quelle, /^plan_position:/)
  assert.equal(result.prognose.datum, '2028-10-16')
})

test('G-650: Halteposition hat Rate null und keine Zielwertsteigerung', () => {
  const result = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT rate_pct || '/' || wert FROM goals.plan_soll_am(
      '${goal}',DATE '2026-05-25');
    ROLLBACK;`).split(/\r?\n/).find(line => /^0(?:\.0+)?\//.test(line))
  assert.match(result ?? '', /^0(?:\.0+)?\//)
})

test('G-650: fremde Planlinie bleibt unsichtbar', () => {
  const result = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub',
      '20000000-0000-0000-0000-000000000901',true);
    SET LOCAL ROLE authenticated;
    SELECT count(*) FROM goals.plan_soll_am('${goal}',DATE '2026-10-09');
    ROLLBACK;`)
  assert.ok(result.split(/\r?\n/).includes('0'))
})

test('G-650: Lücke nach einer beendeten Position bleibt als Erhaltung markiert', () => {
  const result = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    UPDATE goals.goal_phases SET actual_end_date=DATE '2026-07-18'
      WHERE id='31000000-0000-0000-0000-000000000102';
    SELECT rate_pct || '/' || quelle FROM goals.plan_soll_am(
      '${goal}',DATE '2026-10-09');
    ROLLBACK;`)
  assert.ok(result.split(/\r?\n/).includes('0/plan_luecke:erhaltung'))
})
