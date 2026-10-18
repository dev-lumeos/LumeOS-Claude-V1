import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('Goals-Abnahme braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const dev = '20000000-0000-0000-0000-000000000901'

function read(body: string): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
      BEGIN;
      SELECT set_config('request.jwt.claim.sub','${dev}',true);
      SET LOCAL ROLE authenticated;
      ${body}
      ROLLBACK;
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  const line = output.split(/\r?\n/).find(x => x.startsWith('{'))
  if (!line) throw new Error(`Keine JSON-Probe: ${output}`)
  return JSON.parse(line)
}

test('G-667: zwei Sätze bleiben ein bestes Ergebnis der Einheit', () => {
  const got = read(`
    CREATE TEMP TABLE chosen AS
    SELECT s.id AS session_id,we.id AS exercise_id,g.id AS goal_id
    FROM goals.user_goals g
    JOIN training.workout_sessions s ON s.user_id=g.user_id
    JOIN training.workout_exercises we ON we.workout_session_id=s.id
      AND we.exercise_id=g.exercise_id
    WHERE g.user_id=auth.uid() AND g.title='Kniebeuge 1RM 160 kg'
      AND s.status='completed'
    ORDER BY s.session_date DESC,s.id DESC LIMIT 1;
    INSERT INTO training.workout_sets
      (workout_exercise_id,set_number,reps,weight_kg,set_type)
    SELECT exercise_id,91,1,142,'working' FROM chosen;
    INSERT INTO training.workout_sets
      (workout_exercise_id,set_number,reps,weight_kg,set_type)
    SELECT exercise_id,92,1,143,'working' FROM chosen;
    SELECT json_build_object('count',count(*),'best',max(p.value),
      'source',min(p.source_name),'session',min(p.source_id::text))
    FROM chosen c JOIN LATERAL goals.measurement_points(c.goal_id,CURRENT_DATE) p
      ON p.source_id=c.session_id;
  `)
  if (process.env.G667_SABOTAGE === '1') got.count = 2
  assert.equal(got.count, 1)
  assert.equal(got.best, 143)
  assert.equal(got.source, 'training.workout_sessions')
  assert.equal(typeof got.session, 'string')
})

test('G-668: historische Deckelung und künftige Wochenrate sind benannt', () => {
  const got = read(`
    SET LOCAL ROLE postgres;
    SET LOCAL session_replication_role=replica;
    UPDATE goals.user_goals SET target_unit='kg',start_value=85,
      target_value=88 WHERE user_id='${dev}' AND title='G-559 Abbauziel';
    UPDATE goals.goal_program_positions SET zielrate_pct_kg_woche=0.25,
      duration_weeks=24,projected_end_date=CURRENT_DATE+14
    WHERE program_id=(SELECT p.id FROM goals.goal_programs p
      JOIN goals.user_goals g ON g.id=p.goal_id
      WHERE g.user_id='${dev}' AND p.status='aktiv');
    SET LOCAL session_replication_role=origin;
    SET LOCAL ROLE authenticated;
    SELECT goals.planlinien_am(g.id,CURRENT_DATE+7)
    FROM goals.user_goals g
    WHERE g.user_id=auth.uid() AND g.title='G-559 Abbauziel';
  `) as Record<string, unknown>
  if (process.env.G668_SABOTAGE === '1') got.vorwaerts_kg = got.historisch_kg
  assert.ok(Number(got.historisch_kg) <= 88)
  assert.ok(Number(got.vorwaerts_kg) < 88)
  assert.ok(Number(got.vorwaerts_kg) > 75)
  assert.equal(got.rate_pct_woche, 0.25)
  assert.match(String(got.historisch_bedeutung), /Lage/)
  assert.match(String(got.vorwaerts_bedeutung), /Trend/)
  assert.notEqual(got.vorwaerts_kg, got.historisch_kg)
})

test('G-669: Empfehlung nur mit gespeicherter Regel und Dauer', () => {
  const got = read(`
    CREATE TEMP TABLE phase AS
    SELECT ph.id,g.id AS goal_id FROM goals.goal_phases ph
    JOIN goals.user_goals g ON g.id=ph.goal_id
    WHERE g.user_id=auth.uid() AND g.title='G-559 Abbauziel'
      AND ph.actual_end_date IS NULL ORDER BY ph.gueltig_ab DESC LIMIT 1;
    CREATE TEMP TABLE before_rule AS
      SELECT goals.goal_als_naechstes(goal_id,CURRENT_DATE) AS value FROM phase;
    SET LOCAL ROLE postgres;
    SET LOCAL session_replication_role=replica;
    UPDATE goals.goal_phases SET recommended_next='mini_cut',
      transition_reason='Gespeicherte Übergangsregel',
      projected_end_date=DATE '2026-11-01'
    WHERE id=(SELECT id FROM phase);
    SET LOCAL session_replication_role=origin;
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'recommendation',(SELECT goals.goal_als_naechstes(goal_id,CURRENT_DATE)
        FROM phase),
      'missing',(SELECT value FROM before_rule));
  `)
  const next = got.recommendation as Record<string, unknown>
  if (process.env.G669_SABOTAGE === '1') next.dauer_wochen = 5
  assert.equal(next.programm, 'mini_cut')
  assert.equal(next.dauer_wochen, 4)
  assert.equal(next.startdatum, '2026-11-02')
  assert.equal(next.grund, 'Gespeicherte Übergangsregel')
  assert.equal(got.missing, null)
})

test('G-670: Halteposition, Modulbezüge und zwölf Gewohnheitswochen', () => {
  const got = read(`
    SELECT json_build_object(
      'positions',(SELECT json_agg(json_build_object('code',pos.strategie_code,
        'from',pos.gueltig_ab,'to',pos.projected_end_date)
        ORDER BY pos.position) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs p ON p.id=pos.program_id
        WHERE p.user_id=auth.uid()
          AND p.status='aktiv'),
      'modules',(SELECT json_object_agg(title,linked_modules)
        FROM goals.user_goals WHERE user_id=auth.uid()
          AND title IN ('Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5',
            'Körperfett 14 %','Training 4× pro Woche')),
      'weeks',(SELECT json_agg(json_build_object('value',w.observed_value,
        'streak',w.streak_weeks) ORDER BY w.week_start)
        FROM goals.user_goals g
        JOIN LATERAL goals.measurement_weeks(g.id,CURRENT_DATE) w ON true
        WHERE g.user_id=auth.uid() AND g.title='Training 4× pro Woche'));
  `)
  const positions = got.positions as Array<{code: string; from: string; to: string}>
  const modules = got.modules as Record<string, string[]>
  const weeks = got.weeks as Array<{value: number; streak: number}>
  if (process.env.G670_SABOTAGE === '1') positions[0].code = 'gap'
  assert.ok(positions.length === 1 || positions.length === 4)
  if (positions.length === 4) {
    assert.equal(positions[2].code, 'maintain')
    assert.equal(positions[2].from, '2026-07-19')
    assert.equal(positions[2].to, '2026-10-09')
  } else {
    assert.equal(positions[0].code, 'moderate_cut')
    assert.equal(positions[0].to, null)
  }
  assert.deepEqual(modules['Kniebeuge 1RM 160 kg'],
    ['training','nutrition','recovery'])
  assert.deepEqual(modules['Kreuzheben 150 kg × 5'],['training','recovery'])
  assert.deepEqual(modules['Körperfett 14 %'],['measurements','nutrition'])
  assert.equal(weeks.length, 12)
  assert.equal(weeks.at(-1)?.streak, 6)
})

test('G-646: Vorschau und Snapshot beziehen Gewicht aus dem Trend', () => {
  const got = read(`
    SELECT json_build_object('trend',t.wert,'value',p.wert,
      'source',p.quelle,'date',p.datum,'last',t.letzte_messung_am)
    FROM goals.trendgewicht_am(auth.uid(),CURRENT_DATE) t
    CROSS JOIN LATERAL goals.measurement_goal_start_preview(
      'body_weight',CURRENT_DATE,NULL,NULL,NULL,NULL) p;
  `)
  if (process.env.G646_SABOTAGE === '1') got.value = -1
  assert.equal(got.value, got.trend)
  assert.equal(got.date, got.last)
  assert.match(String(got.source), /^goals\.trendgewicht_am:/)
})

test('G-525: vier neue Schwellen; ein EMA-Schritt trifft 25, nicht 50', () => {
  const got = read(`
    SET LOCAL ROLE postgres;
    INSERT INTO auth.users(id,email,raw_app_meta_data,created_at)
    VALUES ('52500000-0000-0000-0000-000000000001',
      'g525@example.test','{}',now());
    SELECT set_config('request.jwt.claim.sub',
      '52500000-0000-0000-0000-000000000001',true);
    SET LOCAL ROLE authenticated;
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,measurement_source)
    SELECT auth.uid(),CURRENT_DATE-n,time '08:00',80,'manual'
    FROM generate_series(0,3) n;
    CREATE TEMP TABLE g525_goal AS
    SELECT goals.measurement_goal_create(
      p_measurement_type=>'body_weight',p_title=>'G-525 Gewicht',
      p_target_value=>82,p_target_unit=>'kg') AS id;
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg,measurement_source)
    VALUES (auth.uid(),CURRENT_DATE,time '23:59',83,'manual');
    SELECT json_build_object('count',count(*),
      'thresholds',array_agg(m.threshold_pct ORDER BY m.threshold_pct),
      'achieved',array_agg(m.threshold_pct ORDER BY m.threshold_pct)
        FILTER (WHERE m.status='achieved'),
      'progress',max(s.progress_pct),
      'source',max(s.current_source))
    FROM g525_goal g
    JOIN goals.goal_milestones m ON m.goal_id=g.id AND m.source='derived'
    JOIN LATERAL goals.goal_milestone_status(m.id,CURRENT_DATE) s ON true;
  `)
  if (process.env.G525_SABOTAGE === '1') got.count = 3
  assert.equal(got.count, 4)
  assert.deepEqual(got.thresholds,[25,50,75,100])
  assert.deepEqual(got.achieved,[25])
  assert.ok(Number(got.progress) >= 25 && Number(got.progress) < 50)
  assert.match(String(got.source), /^goals\.trendgewicht_am:/)
})
