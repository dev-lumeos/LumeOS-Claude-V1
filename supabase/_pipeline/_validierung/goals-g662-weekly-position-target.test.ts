import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-662 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

function sql(body: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', body],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

function json(body: string): any {
  const output = sql(body)
  const line = output.split(/\r?\n/).findLast(value => value.startsWith('{'))
  assert.ok(line, output)
  return JSON.parse(line)
}

test('G-662: Wochensoll folgt der Positionsrate auch bei gedeckelter Linie', () => {
  const result = json(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT json_build_object('week',w.value,
      'rate',(SELECT rate_pct FROM goals.plan_soll_am('${goal}',DATE '2026-10-09')))
    FROM jsonb_array_elements(goals.controlling_goal_outlook(
      '${goal}',DATE '2026-10-09')->'wochen') w
    WHERE w.value->>'woche_ab'='2026-10-05';
    ROLLBACK;`)
  const week = result.week
  assert.match(week.soll_delta_quelle, /^plan_position:/)
  assert.equal(week.soll_delta_kg,
    Math.round(week.trend_kg * result.rate * 10) / 1000)

  const changed = json(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    UPDATE goals.goal_program_positions SET zielrate_pct_kg_woche=2
    WHERE id=split_part((SELECT quelle FROM goals.plan_soll_am(
      '${goal}',DATE '2026-10-09')),':',2)::uuid;
    SELECT w.value FROM jsonb_array_elements(goals.controlling_goal_outlook(
      '${goal}',DATE '2026-10-09')->'wochen') w
    WHERE w.value->>'woche_ab'='2026-10-05';
    ROLLBACK;`)
  assert.ok(changed.soll_delta_kg > week.soll_delta_kg,
    'Sabotage an der Positionsrate muss das Wochensoll aendern')
})

test('G-662: Erhaltung ist 0, Richtung und fehlende Daten sind eindeutig', () => {
  const sides = sql(`SELECT array_to_string(ARRAY[
    goals.weekly_delta_side(0.1,0.21,1),
    goals.weekly_delta_side(-0.1,-0.21,-1),
    goals.weekly_delta_side(0.3,0.21,1),
    goals.weekly_delta_side(-0.3,-0.21,-1),
    coalesce(goals.weekly_delta_side(NULL,0.21,1),'offen'),
    coalesce(goals.weekly_delta_side(0.1,0.21,0),'offen')],',')`)
  assert.equal(sides,
    'hinterher,hinterher,voraus,voraus,offen,offen')
  const maintenance = json(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    UPDATE goals.goal_program_positions SET zielrate_pct_kg_woche=0
    WHERE id=split_part((SELECT quelle FROM goals.plan_soll_am(
      '${goal}',DATE '2026-10-09')),':',2)::uuid;
    SET LOCAL ROLE authenticated;
    SELECT w.value FROM jsonb_array_elements(goals.controlling_goal_outlook(
      '${goal}',DATE '2026-10-09')->'wochen') w
    WHERE w.value->>'woche_ab'='2026-10-05';
    ROLLBACK;`)
  assert.equal(maintenance.soll_delta_kg, 0)
})

test('G-662: Dienstwache liest drei Wochenbewegungen; Wiederholung schreibt 0', () => {
  const result = json(`BEGIN;
    SET LOCAL ROLE service_role;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SELECT goals.record_weekly_adjustments(DATE '2026-10-09',ARRAY['${user}'::uuid]);
    SELECT json_build_object('written',
      (goals.record_weekly_adjustments(DATE '2026-10-09',ARRAY['${user}'::uuid]))->>'geschriebene_wochen',
      'bad',count(*) FILTER (WHERE a.source_data->>'three_week'<>
        'goals.weekly_delta_side:3_vollstaendige_wochen'))
    FROM goals.goal_weekly_adjustments a WHERE a.user_id='${user}';
    ROLLBACK;`)
  assert.equal(result.written, '0')
  assert.equal(result.bad, 0)
})
