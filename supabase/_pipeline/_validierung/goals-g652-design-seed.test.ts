import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-652 braucht eine Wegwerf-Datenbank.')
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
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-652: vier Messziele lesen Istwerte aus Trainingssaetzen und Navy-Messung', () => {
  const got = read(`
    'goals', (SELECT json_object_agg(g.title,json_build_object(
      'start',g.start_value,'current',p.current_value,
      'source',p.current_source,'target',g.target_value,
      'deadline',g.target_date))
      FROM goals.user_goals g
      JOIN LATERAL goals.goal_progress_at(g.id,CURRENT_DATE) p ON true
      WHERE g.user_id=auth.uid() AND g.title IN
        ('Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5',
         'Körperfett 14 %','Training 4× pro Woche')),
    'sessions', (SELECT count(*) FROM training.workout_sessions
      WHERE user_id=auth.uid() AND notes='G-652 Entwurfsverlauf'),
    'navy', (SELECT body_fat_pct FROM goals.body_composition_navy(
      auth.uid(),CURRENT_DATE))`)
  const goals = got.goals as Record<string, {
    start: number; current: number; source: string;
    target: number; deadline: string | null
  }>
  assert.equal(Object.keys(goals).length, 4)
  assert.equal(goals['Kniebeuge 1RM 160 kg']?.current, 140)
  assert.equal(goals['Kniebeuge 1RM 160 kg']?.source,
    'training.workout_sets.estimated_1rm')
  assert.equal(goals['Kniebeuge 1RM 160 kg']?.deadline, '2027-03-31')
  assert.equal(goals['Kreuzheben 150 kg × 5']?.current, 140)
  assert.equal(goals['Kreuzheben 150 kg × 5']?.source,
    'training.workout_sets.weight_kg')
  assert.equal(goals['Kreuzheben 150 kg × 5']?.deadline, null)
  assert.equal(Math.round((goals['Körperfett 14 %']?.current ?? 0) * 10) / 10, 16.2)
  assert.equal(goals['Körperfett 14 %']?.source,
    'goals.body_measurements.body_fat_pct')
  assert.equal(goals['Körperfett 14 %']?.deadline, '2027-03-01')
  assert.equal(goals['Training 4× pro Woche']?.current, 3)
  assert.equal(got.sessions, 15)
  assert.equal(Math.round(Number(got.navy) * 10) / 10, 16.2)
})

test('G-652: Wochenserie und vier Planbeispiele haben echte Positionen und Termine', () => {
  const got = read(`
    'weeks', (SELECT json_agg(json_build_object('value',w.observed_value,
      'streak',w.streak_weeks) ORDER BY w.week_start)
      FROM goals.user_goals g
      JOIN LATERAL goals.measurement_weeks(g.id,CURRENT_DATE) w ON true
      WHERE g.user_id=auth.uid() AND g.title='Training 4× pro Woche'),
    'plans', (SELECT json_object_agg(p.name,json_build_object(
      'status',p.status,
      'positions',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=p.id),
      'events',(SELECT count(*) FROM goals.goal_program_events
        WHERE program_id=p.id),
      'custom',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=p.id AND eigene_werte IS NOT NULL)))
      FROM goals.goal_programs p WHERE p.user_id=auth.uid()
        AND p.name IN ('Contest Prep 2027','Off-Season 2027',
          'Frühjahrs-Cut 2026','Contest Prep 2025')),
    'prep_events', (SELECT string_agg(e.kind||':'||e.name||':'||
      e.event_date::text,'|' ORDER BY e.kind)
      FROM goals.goal_program_events e
      JOIN goals.goal_programs p ON p.id=e.program_id
      WHERE p.user_id=auth.uid() AND p.name='Contest Prep 2027')`)
  const weeks = got.weeks as Array<{ value: number; streak: number }>
  assert.deepEqual(weeks.map(w => w.value), [4, 4, 4, 3])
  assert.deepEqual(weeks.map(w => w.streak), [1, 2, 3, 0])
  const plans = got.plans as Record<string, {
    status: string; positions: number; events: number; custom: number
  }>
  assert.equal(Object.keys(plans).length, 4)
  assert.deepEqual(plans['Contest Prep 2027'],
    { status: 'entwurf', positions: 4, events: 3, custom: 0 })
  assert.deepEqual(plans['Off-Season 2027'],
    { status: 'entwurf', positions: 6, events: 0, custom: 1 })
  assert.deepEqual(plans['Frühjahrs-Cut 2026'],
    { status: 'abgeschlossen', positions: 1, events: 1, custom: 0 })
  assert.deepEqual(plans['Contest Prep 2025'],
    { status: 'abgeschlossen', positions: 4, events: 1, custom: 0 })
  assert.match(String(got.prep_events), /A:NPC Classic Bangkok:2027-02-04/)
  assert.match(String(got.prep_events), /B:Samui Open:2027-03-04/)
  assert.match(String(got.prep_events), /S:Urlaub Familie:2026-12-20/)
})

test('G-652: Fruehjahrs-Cut wird als echtes UTF-8 gespeichert', () => {
  const got = read(`
    'hex', (SELECT encode(convert_to(name,'UTF8'),'hex')
      FROM goals.goal_programs WHERE user_id=auth.uid()
        AND name='Frühjahrs-Cut 2026')`)
  assert.match(String(got.hex), /^4672c3bc686a61687273/)
})
