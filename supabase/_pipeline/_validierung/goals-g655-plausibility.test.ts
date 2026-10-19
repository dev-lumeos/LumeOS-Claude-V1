import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-655 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function read(sql: string, mutation = ''): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    ${mutation}
    SELECT json_build_object(${sql});
    ROLLBACK;
  `], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-655: Körperfett sinkt, Kniebeuge ist nicht hinterher; Kreuzheben bleibt ohne Frist offen', () => {
  const got = read(`'goals', (SELECT json_object_agg(g.title,json_build_object(
    'pace',(w->>'tempo_pro_woche')::numeric,'lage',p.lage,
    'start',g.start_value,'start_source',g.start_source))
    FROM goals.user_goals g
    JOIN LATERAL goals.measurement_goal_week_at(g.id,CURRENT_DATE) w ON true
    JOIN LATERAL goals.goal_progress_at(g.id,CURRENT_DATE) p ON true
    WHERE g.user_id=auth.uid() AND g.title IN
      ('Körperfett 14 %','Kniebeuge 1RM 160 kg','Kreuzheben 150 kg × 5'))`)
  const goals = got.goals as Record<string, {
    pace: number; lage: string | null; start: number; start_source: string
  }>
  assert.ok(goals['Körperfett 14 %'].pace < 0)
  assert.ok(Math.abs(goals['Körperfett 14 %'].pace + 0.3) < 0.08)
  assert.ok(Math.abs(goals['Körperfett 14 %'].start - 16.3) < 0.1)
  assert.equal(goals['Körperfett 14 %'].start_source,
    'goals.body_measurements.body_fat_pct')
  assert.equal(goals['Körperfett 14 %'].lage, 'im_plan')
  assert.ok(['voraus', 'im_plan'].includes(goals['Kniebeuge 1RM 160 kg'].lage ?? ''))
  assert.equal(goals['Kreuzheben 150 kg × 5'].lage, 'offen')
})

test('G-655: acht markierte Navy-Wochen ohne kopierte taegliche KFA', () => {
  const got = read(`'weekly',(SELECT count(*) FROM goals.body_measurements
      WHERE user_id=auth.uid() AND source_detail='G-655 Navy-Wochentestdaten'),
    'copied_fat',(SELECT count(*) FROM goals.body_measurements
      WHERE user_id=auth.uid() AND source_detail='Kopie aus tom.seed@example.com'
        AND body_fat_pct IS NOT NULL),
    'seed_weekly',(SELECT count(*) FROM goals.body_measurements
      WHERE user_id=auth.uid() AND source_detail='G-652 Navy-Verlauf'
        AND measurement_date IN (CURRENT_DATE-7,CURRENT_DATE)),
    'first_days_ago',(SELECT CURRENT_DATE-min(measurement_date) FROM goals.body_measurements
      WHERE user_id=auth.uid() AND source_detail='G-655 Navy-Wochentestdaten'),
    'last_days_ago',(SELECT CURRENT_DATE-max(measurement_date) FROM goals.body_measurements
      WHERE user_id=auth.uid() AND source_detail='G-655 Navy-Wochentestdaten')`)
  assert.equal(got.weekly, 6)
  assert.equal(got.seed_weekly, 2)
  assert.equal(got.copied_fat, 0)
  assert.equal(got.first_days_ago, 49)
  assert.equal(got.last_days_ago, 14)
})

test('G-655: verstellter KFA-Istwert kippt Tempo und Lage, Rollback stellt sie wieder her', () => {
  const values = `'pace',(SELECT (goals.measurement_goal_week_at(g.id,CURRENT_DATE)->>'tempo_pro_woche')::numeric
      FROM goals.user_goals g WHERE g.user_id=auth.uid() AND g.title='Körperfett 14 %'),
    'lage',(SELECT p.lage FROM goals.user_goals g
      JOIN LATERAL goals.goal_progress_at(g.id,CURRENT_DATE) p ON true
      WHERE g.user_id=auth.uid() AND g.title='Körperfett 14 %')`
  const before = read(values)
  const sabotaged = read(values, `UPDATE goals.body_measurements SET body_fat_pct=15.2
    WHERE user_id=auth.uid() AND measurement_date=CURRENT_DATE
      AND source_detail='G-652 Navy-Verlauf';`)
  const after = read(values)
  assert.ok(Number(before.pace) > -0.38 && Number(before.pace) < -0.22)
  assert.equal(before.lage, 'im_plan')
  assert.ok(Number(sabotaged.pace) < -0.4)
  assert.equal(sabotaged.lage, 'voraus')
  assert.deepEqual(after, before)
})

test('G-655: Einnahmen tragen die App-Namen der vorhandenen Stack-Eintraege', () => {
  const got = read(`'logs',(SELECT count(*) FROM supplements.intake_logs
      WHERE user_id=auth.uid() AND source_detail='G-652 Einnahmeverlauf'),
    'named_items',(SELECT count(*) FROM supplements.stack_items si
      JOIN supplements.user_stacks st ON st.id=si.stack_id
      LEFT JOIN supplements.supplements s ON s.id=si.supplement_id
      WHERE st.user_id=auth.uid() AND si.is_active
        AND coalesce(nullif(btrim(si.custom_name),''),nullif(btrim(s.name_de),''),
          nullif(btrim(s.name_en),'')) IS NOT NULL),
    'wrong_names',(SELECT count(*) FROM supplements.intake_logs l
      JOIN supplements.stack_items si ON si.id=l.stack_item_id
      LEFT JOIN supplements.supplements s ON s.id=si.supplement_id
      WHERE l.user_id=auth.uid() AND l.source_detail='G-652 Einnahmeverlauf'
        AND l.supplement_name_snapshot IS DISTINCT FROM
          coalesce(nullif(btrim(si.custom_name),''),nullif(btrim(s.name_de),''),
            nullif(btrim(s.name_en),''))),
    'taken',(SELECT count(*) FROM supplements.intake_logs
      WHERE user_id=auth.uid() AND source_detail='G-652 Einnahmeverlauf'
        AND status='taken'),
    'compliance',(SELECT round(avg(compliance_pct),1)
      FROM supplements.daily_intake_summary
      WHERE user_id=auth.uid() AND intake_date BETWEEN CURRENT_DATE-6 AND CURRENT_DATE)`)
  assert.ok(Number(got.named_items) > 0)
  assert.equal(got.logs, Number(got.named_items) * 7)
  assert.equal(got.wrong_names, 0)
  assert.equal(got.taken, Number(got.logs) - (Number(got.named_items) === 6 ? 5 : 0))
  assert.ok(Number(got.compliance) > 0 && Number(got.compliance) <= 100)
})

test('G-655: Gewohnheiten haben Wochenstand und Serie ohne Tempo oder Prognose', () => {
  const got = read(`'weekday', extract(isodow FROM CURRENT_DATE)::integer,
    'week', (SELECT goals.measurement_goal_week_at(g.id,CURRENT_DATE)
    FROM goals.user_goals g WHERE g.user_id=auth.uid()
      AND g.title='Training 4× pro Woche')`)
  const week = got.week as Record<string, unknown>
  assert.equal(week.tempo_pro_woche, null)
  assert.equal(week.prognose_datum, null)
  assert.equal(week.prognose_status, null)
  assert.equal(week.wochenstand, Math.min(3, Number(got.weekday)))
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
