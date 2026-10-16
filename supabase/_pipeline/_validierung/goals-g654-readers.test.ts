import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-654 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function read(sql: string, setup = '', beforeRole = ''): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
      BEGIN;
      SELECT set_config('request.jwt.claim.sub','${user}',true);
      ${beforeRole}
      SET LOCAL ROLE authenticated;
      ${setup}
      SELECT json_build_object(${sql});
      ROLLBACK;
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-654: Lage und Wochenwerte haben Quellen und benannte Toleranz', () => {
  const got = read(`
    'control', (SELECT goals.controlling_goal_lage_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.goal_role='controlling' AND g.status='active'),
    'squat', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.title='Kniebeuge 1RM 160 kg'),
    'deadlift', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.title LIKE 'Kreuzheben 150 kg%'),
    'habit', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.title LIKE 'Training 4% pro Woche')`)
  const control = got.control as Record<string, unknown>
  const squat = got.squat as Record<string, unknown>
  const deadlift = got.deadlift as Record<string, unknown>
  const habit = got.habit as Record<string, unknown>
  assert.equal(control.lage, null)
  assert.equal(control.toleranz_anteil, 0.1)
  assert.match(String(control.trend_quelle), /goals.trendgewicht_am/)
  assert.equal(control.soll_quelle, null)
  assert.equal(squat.delta_woche, 3)
  assert.equal(squat.delta_quelle, 'goals.goal_progress_at')
  assert.ok(Number(squat.soll_delta_woche) > 0)
  assert.equal(squat.prognose_status, 'datum')
  assert.ok(String(squat.prognose_datum) >= '2026-10-16')
  assert.equal(deadlift.soll_delta_woche, null)
  assert.equal(deadlift.prognose_quelle, 'goals.measurement_points:28_tage')
  assert.equal(habit.prognose_datum, null)
  assert.equal(habit.tempo_quelle, 'goals.measurement_weeks:vorwoche')
})

test('G-654: mit EMA wird die Lage gegen die Planlinie gewertet', () => {
  const got = read(`
    'lage',goals.controlling_goal_lage_at(
      '30000000-0000-0000-0000-000000000901',CURRENT_DATE)`, '', `
    UPDATE goals.user_goals SET start_value=85,target_value=80,target_unit='kg'
    WHERE id='30000000-0000-0000-0000-000000000901';
    INSERT INTO goals.body_measurements(
      user_id,measurement_date,measurement_time,weight_kg,measurement_source)
    SELECT '${user}',CURRENT_DATE-d,time '07:00',85,'admin'
    FROM (VALUES(13),(9),(5),(1)) v(d);
  `)
  const lage = got.lage as Record<string, unknown>
  assert.ok(['hinterher', 'im_plan', 'voraus'].includes(String(lage.lage)))
  assert.equal(lage.toleranz_kg, 0.5)
  assert.match(String(lage.soll_quelle), /plan_position:/)
})

test('G-654: umgekehrtes Tempo hat kein Prognosedatum', () => {
  const got = read(`
    'body_fat', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
      FROM goals.user_goals g WHERE g.user_id=auth.uid()
        AND g.title LIKE 'Körperfett 14%')`, `
    INSERT INTO goals.body_measurements(
      user_id,measurement_date,measurement_time,weight_kg,body_fat_pct,
      bf_method,measurement_source,source_detail)
    SELECT auth.uid(),CURRENT_DATE,time '23:59',bm.weight_kg,20,
      'manual','manual','G654 Gegenprobe'
    FROM goals.body_measurements bm WHERE bm.user_id=auth.uid()
      AND bm.measurement_date<=CURRENT_DATE
    ORDER BY bm.measurement_date DESC,bm.measurement_time DESC LIMIT 1;
  `)
  const fat = got.body_fat as Record<string, unknown>
  assert.equal(fat.prognose_status, 'nicht_absehbar')
  assert.equal(fat.prognose_datum, null)
})
