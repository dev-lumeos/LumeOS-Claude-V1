import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-625 Teil 2 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-625: laufende Position und Phase wechseln atomar ab Stichtag', () => {
  const today = sql('SELECT CURRENT_DATE')
  const yesterday = sql('SELECT CURRENT_DATE-1')
  const got = JSON.parse(sql(`
    BEGIN;
    CREATE TEMP TABLE g625_revision_probe(
      old_phase uuid,new_phase uuid,new_position uuid,
      before_kcal numeric,before_fat numeric,
      block_message text,foreign_message text
    ) ON COMMIT DROP;
    GRANT SELECT,INSERT ON g625_revision_probe TO authenticated;
    SET LOCAL ROLE authenticated;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62520000-0000-0000-0000-000000000001';
      v_plan uuid := '62520000-0000-0000-0000-000000000002';
      v_old_position uuid;
      v_old_phase uuid;
      v_new_position uuid;
      v_new_phase uuid;
      v_other uuid;
      v_before_kcal numeric;
      v_before_fat numeric;
      v_message text;
      v_block text;
      v_foreign text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Revision',
        79,'kg',81.4,DATE '2026-10-01',DATE '2026-11-30','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Revision','aktiv');
      v_old_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,
        'lose',NULL,'abnehmen','fat_loss',9::smallint,
        DATE '2026-10-01',DATE '2026-12-02');
      v_old_phase := goals.goal_plan_position_start(v_old_position);
      SELECT kcal,fat_g INTO v_before_kcal,v_before_fat
      FROM goals.berechne_zielwerte(v_user,v_goal,DATE '2026-10-07');
      v_new_position := goals.goal_plan_position_revise(
        v_old_position,NULL,
        '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,"fett_g_kg":0.8,
          "cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb,
        8::smallint,'[]'::jsonb,CURRENT_DATE);
      SELECT goal_phase_id INTO v_new_phase
      FROM goals.goal_program_positions WHERE id=v_new_position;
      BEGIN
        PERFORM goals.goal_plan_position_revise(
          v_new_position,'gain',NULL,8::smallint,
          '[]'::jsonb,CURRENT_DATE+1);
        RAISE EXCEPTION 'G-625: falsche Richtung angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_BLOCK:%' THEN RAISE; END IF;
        v_block := v_message;
      END;
      SELECT pos.id INTO v_other FROM goals.goal_program_positions pos
      JOIN goals.goal_programs plan ON plan.id=pos.program_id
      WHERE plan.goal_id='30000000-0000-0000-0000-000000000101';
      BEGIN
        PERFORM goals.goal_plan_position_revise(
          v_other,'maintain',NULL,4::smallint,
          '[]'::jsonb,CURRENT_DATE+1);
        RAISE EXCEPTION 'G-625: fremde Position angenommen';
      EXCEPTION WHEN insufficient_privilege THEN
        GET STACKED DIAGNOSTICS v_foreign=MESSAGE_TEXT;
      END;
      INSERT INTO g625_revision_probe VALUES (
        v_old_phase,v_new_phase,v_new_position,
        v_before_kcal,v_before_fat,v_block,v_foreign);
    END $probe$;
    SELECT json_build_object(
      'old_end',(SELECT actual_end_date FROM goals.goal_phases
        WHERE id=(SELECT old_phase FROM g625_revision_probe)),
      'old_day',(SELECT phase_id FROM goals.phase_am(
        '20000000-0000-0000-0000-000000000901',DATE '2026-10-07')),
      'old_id',(SELECT old_phase FROM g625_revision_probe),
      'new_day',(SELECT phase_id FROM goals.phase_am(
        '20000000-0000-0000-0000-000000000901',CURRENT_DATE)),
      'new_id',(SELECT new_phase FROM g625_revision_probe),
      'new_start',(SELECT gueltig_ab FROM goals.goal_phases
        WHERE id=(SELECT new_phase FROM g625_revision_probe)),
      'new_end_phase',(SELECT projected_end_date FROM goals.goal_phases
        WHERE id=(SELECT new_phase FROM g625_revision_probe)),
      'new_end_position',(SELECT projected_end_date
        FROM goals.goal_program_positions
        WHERE id=(SELECT new_position FROM g625_revision_probe)),
      'new_strategy',(SELECT strategie_code FROM goals.goal_phases
        WHERE id=(SELECT new_phase FROM g625_revision_probe)),
      'new_fat',(SELECT parameters->'g626_eigene_werte'->>'fett_g_kg'
        FROM goals.goal_phases
        WHERE id=(SELECT new_phase FROM g625_revision_probe)),
      'position_fat',(SELECT eigene_werte->>'fett_g_kg'
        FROM goals.goal_program_positions
        WHERE id=(SELECT new_position FROM g625_revision_probe)),
      'duration',(SELECT duration_weeks FROM goals.goal_program_positions
        WHERE id=(SELECT new_position FROM g625_revision_probe)),
      'position_count',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id='62520000-0000-0000-0000-000000000002'),
      'past_kcal',(SELECT kcal FROM goals.berechne_zielwerte(
        '20000000-0000-0000-0000-000000000901',
        '62520000-0000-0000-0000-000000000001',DATE '2026-10-07')),
      'before_kcal',(SELECT before_kcal FROM g625_revision_probe),
      'past_fat',(SELECT fat_g FROM goals.berechne_zielwerte(
        '20000000-0000-0000-0000-000000000901',
        '62520000-0000-0000-0000-000000000001',DATE '2026-10-07')),
      'before_fat',(SELECT before_fat FROM g625_revision_probe),
      'new_daily_fat',(SELECT fat_g FROM goals.berechne_zielwerte(
        '20000000-0000-0000-0000-000000000901',
        '62520000-0000-0000-0000-000000000001',CURRENT_DATE)),
      'catalog_fat',(SELECT round(
        (SELECT before_kcal FROM g625_revision_probe)*fat_percent/9,1)
        FROM goals.goal_strategies WHERE code='lose'),
      'catalog_fat_g_kg',(SELECT fett_g_kg FROM goals.goal_strategies
        WHERE code='lose'),
      'block',(SELECT block_message FROM g625_revision_probe),
      'foreign',(SELECT foreign_message FROM g625_revision_probe));
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.equal(got.old_end, yesterday)
  assert.equal(got.old_day, got.old_id)
  assert.equal(got.new_day, got.new_id)
  assert.equal(got.new_start, today)
  assert.equal(got.new_end_phase, got.new_end_position)
  assert.equal(got.new_strategy, 'custom')
  assert.equal(got.new_fat, got.position_fat)
  assert.equal(got.duration, 8)
  assert.equal(got.position_count, 2)
  assert.equal(got.past_kcal, got.before_kcal)
  assert.equal(got.past_fat, got.before_fat)
  assert.equal(got.past_fat, got.catalog_fat)
  assert.ok(got.new_daily_fat > 0)
  assert.equal(got.catalog_fat_g_kg, null)
  assert.match(got.block, /^G626_BLOCK:/)
  assert.match(got.foreign, /^G625_BLOCK:position_fremd/)
})

test('G-625: Aenderung am Starttag ersetzt die noch geschichtslose Phase', () => {
  const got = JSON.parse(sql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62520000-0000-0000-0000-000000000011';
      v_plan uuid := '62520000-0000-0000-0000-000000000012';
      v_position uuid;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Starttag',
        79,'kg',81.4,CURRENT_DATE,DATE '2026-11-30','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Starttag','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,
        'lose',NULL,'abnehmen','fat_loss',8::smallint,
        CURRENT_DATE,DATE '2026-12-02');
      PERFORM goals.goal_plan_position_start(v_position);
      PERFORM goals.goal_plan_position_revise(v_position,NULL,
        '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,"fett_g_kg":0.8,
          "cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb,
        8::smallint,'[]'::jsonb,CURRENT_DATE);
    END $probe$;
    SELECT json_build_object(
      'positions',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id='62520000-0000-0000-0000-000000000012'),
      'phases',(SELECT count(*) FROM goals.goal_phases
        WHERE goal_id='62520000-0000-0000-0000-000000000011'),
      'source',(SELECT strategie_code FROM goals.goal_phases
        WHERE goal_id='62520000-0000-0000-0000-000000000011'));
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.deepEqual(got, { positions: 1, phases: 1, source: 'custom' })
})
