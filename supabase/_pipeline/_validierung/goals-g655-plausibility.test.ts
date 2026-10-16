import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-655 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function read(sql: string): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(${sql});
    ROLLBACK;
  `], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-655: Körperfett sinkt, Kniebeuge liegt voraus; Kreuzheben bleibt ohne Frist offen', () => {
  const got = read(`'goals', (SELECT json_object_agg(g.title,json_build_object(
    'pace',(w->>'tempo_pro_woche')::numeric,'lage',p.lage))
    FROM goals.user_goals g
    JOIN LATERAL goals.measurement_goal_week_at(g.id,CURRENT_DATE) w ON true
    JOIN LATERAL goals.goal_progress_at(g.id,CURRENT_DATE) p ON true
    WHERE g.user_id=auth.uid() AND g.title IN
      ('Körperfett 14 %','Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5'))`)
  const goals = got.goals as Record<string, { pace: number; lage: string | null }>
  assert.ok(goals['Körperfett 14 %'].pace < 0)
  assert.ok(Math.abs(goals['Körperfett 14 %'].pace + 0.3) < 0.08)
  assert.equal(goals['Kniebeuge 1RM 160 kg'].lage, 'voraus')
  assert.equal(goals['Kreuzheben 150 kg × 5'].lage, 'offen')
})

test('G-655: Gewohnheiten haben Wochenstand und Serie ohne Tempo oder Prognose', () => {
  const got = read(`'week', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
    FROM goals.user_goals g WHERE g.user_id=auth.uid()
      AND g.title='Training 4× pro Woche')`)
  const week = got.week as Record<string, unknown>
  assert.equal(week.tempo_pro_woche, null)
  assert.equal(week.prognose_datum, null)
  assert.equal(week.prognose_status, null)
  assert.equal(week.wochenstand, 3)
  assert.equal(week.wochenziel, 4)
  assert.equal(week.serie, 0)
})

test('G-655: abgeschlossene Pläne haben ein gespeichertes Ergebnis', () => {
  const got = read(`'plans', (SELECT json_object_agg(p.name,
      goals.goal_plan_result_at(p.id))
    FROM goals.goal_programs p WHERE p.user_id=auth.uid()
      AND p.name IN ('Frühjahrs-Cut 2026','Contest Prep 2025'))`)
  const plans = got.plans as Record<string, { ergebnis: string; status: string }>
  assert.equal(plans['Frühjahrs-Cut 2026'].status, 'abgeschlossen')
  assert.equal(plans['Frühjahrs-Cut 2026'].ergebnis, 'erreicht')
  assert.equal(plans['Contest Prep 2025'].ergebnis, 'termin_gehalten')
})
