import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-661 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
function sql(body: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', body],
  { encoding: 'utf8' }).trim()
}

test('G-661: zwei Wiegungen am Phasenstart behalten kcal und melden die Spannweite', () => {
  const result = sql(`BEGIN; DO $probe$
  DECLARE v_user uuid; v_goal uuid; v_day date; v_base numeric;
    v_time time; v_after numeric; v_diag record;
  BEGIN
    SELECT p.user_id,p.goal_id,p.gueltig_ab,b.weight_kg,b.measurement_time
    INTO v_user,v_goal,v_day,v_base,v_time
    FROM goals.goal_phases p
    JOIN goals.user_goals g ON g.id=p.goal_id AND g.status='active'
    JOIN goals.body_measurements b ON b.user_id=p.user_id
      AND b.measurement_date=p.gueltig_ab
    WHERE p.actual_end_date IS NULL AND p.gueltig_ab<=CURRENT_DATE
    ORDER BY p.gueltig_ab DESC LIMIT 1;
    IF v_user IS NULL THEN RAISE EXCEPTION 'G661_TEST_NO_PHASE'; END IF;
    INSERT INTO goals.body_measurements(user_id,measurement_date,
      measurement_time,weight_kg,measurement_source,source_detail)
    VALUES(v_user,v_day,time '23:59:59',v_base+0.20,'admin','G-661 Probe');
    SELECT * INTO v_diag FROM goals.phase_start_weight_selection(v_user,v_day);
    IF v_diag.measurement_count<2 OR v_diag.weight_kg<>v_base+0.20
      OR v_diag.spread_kg<0.20 THEN
      RAISE EXCEPTION 'G661_TEST_SELECTION:%',row_to_json(v_diag);
    END IF;
    SELECT kcal INTO v_after FROM goals.berechne_zielwerte(
      v_user,v_goal,CURRENT_DATE);
    IF v_after IS NULL THEN RAISE EXCEPTION 'G661_TEST_KCAL_EMPTY'; END IF;
    RAISE NOTICE 'G661_OK count=% spread=% kcal=%',
      v_diag.measurement_count,v_diag.spread_kg,v_after;
  END $probe$; SELECT 'G661_OK'; ROLLBACK;`)
  assert.match(result, /G661_OK/)
})
