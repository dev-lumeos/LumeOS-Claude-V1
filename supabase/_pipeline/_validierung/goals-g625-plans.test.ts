import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-625 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-625: jedes bestehende Steuerziel hat genau einen Plan', () => {
  const result = sql(`
    SELECT count(*) || '/' || count(DISTINCT p.goal_id) || '/' ||
      (SELECT count(*) FROM goals.user_goals WHERE goal_role='controlling')
    FROM goals.goal_programs p;
  `)
  assert.equal(result, '3/3/3')
  assert.equal(sql(`SELECT count(*) FROM goals.goal_program_positions
    WHERE position=1 AND goal_phase_id IS NOT NULL`), '3')
})

test('G-625: Planstatus, Termine und Eigenwerte sind im Schema', () => {
  assert.equal(sql(`SELECT count(*) FROM information_schema.columns
    WHERE table_schema='goals' AND table_name='goal_programs'
      AND column_name IN ('user_id','status')`), '2')
  assert.equal(sql(`SELECT count(*) FROM information_schema.columns
    WHERE table_schema='goals' AND table_name='goal_program_positions'
      AND column_name IN ('eigene_werte','richtung','phase_type')`), '3')
  assert.equal(sql(`SELECT count(*) FROM information_schema.columns
    WHERE table_schema='goals' AND table_name='goal_program_events'`), '7')
})

test('G-625: der Katalog bietet Eigene Werte in jeder Auswahlgruppe', () => {
  assert.equal(sql(`SELECT count(*) FROM goals.goal_strategies
    WHERE code LIKE 'eigene_werte_%' AND min_erfahrung='pro'`), '5')
  assert.equal(sql(`SELECT count(*) FROM information_schema.columns
    WHERE table_schema='goals' AND table_name='goal_strategies'
      AND column_name IN ('fett_g_kg','cardio_pro_woche','refeed_pro_woche')`), '3')
  assert.equal(sql(`SELECT count(*) FROM goals.goal_strategies
    WHERE requirements ? 'min_experience'`), '0')
})

test('G-625: G-626 prueft Planprogramme und eigene Maximaldauer', () => {
  assert.equal(sql(`SELECT count(*) FROM goals.ziel_grenzen_pruefen(
    'pro','abnehmen',81.4,80.5,DATE '2026-10-08',DATE '2026-10-29',
    'contest_prep',NULL,'male',182,2753.6,-0.5)
    WHERE schluessel='programm_richtung'`), '0')
  assert.equal(sql(`SELECT count(*) FROM goals.ziel_grenzen_pruefen(
    'pro','abnehmen',81.4,79,DATE '2026-10-08',DATE '2026-10-29',
    NULL,'{"tempo_pct_kg_woche":1.2,"protein_g_kg":2.2,
      "fett_g_kg":0.8,"max_duration_weeks":2}'::jsonb,
    'male',182,2753.6)
    WHERE schluessel='eigene_werte_dauer' AND art='warnung'`), '1')
})

test('G-625: Plan-, Positions- und Terminaktionen sind vorhanden', () => {
  const signatures = [
    'goals.goal_plan_create(uuid,text)',
    'goals.goal_plan_activate(uuid)',
    'goals.goal_plan_pause(uuid)',
    'goals.goal_plan_complete(uuid)',
    'goals.goal_plan_delete(uuid)',
    'goals.goal_plan_position_save(uuid,uuid,smallint,text,jsonb,text,text,smallint,date,date,jsonb,text,numeric)',
    'goals.goal_plan_position_move(uuid,smallint)',
    'goals.goal_plan_position_start(uuid)',
    'goals.goal_plan_event_save(uuid,uuid,text,text,date)',
    'goals.goal_plan_event_delete(uuid)',
  ]
  for (const signature of signatures) {
    assert.equal(sql(`SELECT to_regprocedure('${signature}') IS NOT NULL`), 't', signature)
  }
})

test('G-625: eigene Werte laufen durch G-626 und in die Tagesreferenz', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    CREATE TEMP TABLE g625_probe_event(message text) ON COMMIT DROP;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000111';
      v_plan uuid := '62500000-0000-0000-0000-000000000112';
      v_position uuid;
      v_warn jsonb;
      v_message text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','G-625 Probe',
        79,'kg',81.4,DATE '2026-10-08',DATE '2026-10-29','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'G-625 Probe','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,NULL,
        '{"tempo_pct_kg_woche":1.2,"protein_g_kg":2.2,"fett_g_kg":0.3,
          "cardio_pro_woche":2,"refeed_pro_woche":1}'::jsonb,
        'abnehmen','fat_loss',3::smallint,DATE '2026-10-08',DATE '2026-10-29');
      BEGIN
        PERFORM goals.goal_plan_position_start(v_position);
        RAISE EXCEPTION 'G-625: unbestaetigte Warnung wurde angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_CONFIRM:%' THEN RAISE; END IF;
        INSERT INTO g625_probe_event VALUES (v_message);
      END;
      SELECT jsonb_agg(schluessel ORDER BY schluessel) INTO v_warn
      FROM goals.ziel_grenzen_pruefen('pro','abnehmen',81.4,79,
        DATE '2026-10-08',DATE '2026-10-29',NULL,
        '{"tempo_pct_kg_woche":1.2,"protein_g_kg":2.2,
          "fett_g_kg":0.3,"kcal":1679.1}'::jsonb,
        'male',182,2753.6) WHERE art='warnung';
      UPDATE goals.goal_program_positions
      SET confirmed_warnings=v_warn WHERE id=v_position;
      PERFORM goals.goal_plan_position_start(v_position);
    END $probe$;
    SELECT json_build_object(
      'confirmation',(SELECT message FROM g625_probe_event),
      'position_linked',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id='62500000-0000-0000-0000-000000000112'
          AND goal_phase_id IS NOT NULL),
      'kcal',(SELECT kcal FROM goals.berechne_zielwerte(
        '20000000-0000-0000-0000-000000000901',
        '62500000-0000-0000-0000-000000000111',DATE '2026-10-08')),
      'fat',(SELECT fat_g FROM goals.berechne_zielwerte(
        '20000000-0000-0000-0000-000000000901',
        '62500000-0000-0000-0000-000000000111',DATE '2026-10-08')),
      'daily',(SELECT count(*) FROM nutrition.daily_reference_assessment(
        '20000000-0000-0000-0000-000000000901',DATE '2026-10-08')
        WHERE nutrient_code='F18:2CN6' AND reference_kind='AI'
          AND reference_value_min IS NOT NULL)
    );
    ROLLBACK;
  `))
  assert.match(result.confirmation, /^G626_CONFIRM:/)
  assert.equal(result.position_linked, 1)
  assert.equal(result.kcal, 1679.1)
  assert.equal(result.fat, 24.4)
  assert.equal(result.daily, 1)
})

test('G-625: Aktivslot, Grad und genau eine Positionsquelle sind gesperrt', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    CREATE TEMP TABLE g625_blocks(name text,result text) ON COMMIT DROP;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_plan uuid := '62500000-0000-0000-0000-000000000901';
      v_own jsonb := '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,
        "fett_g_kg":0.8,"cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb;
      v_message text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE public.profiles SET experience_level='advanced' WHERE id=v_user;
      BEGIN
        INSERT INTO goals.goal_program_positions(
          program_id,position,eigene_werte,richtung,phase_type)
        VALUES (v_plan,2,v_own,'abnehmen','fat_loss');
        RAISE EXCEPTION 'G-625: Advanced durfte eigene Werte';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G625_BLOCK:eigene_werte_grad%' THEN RAISE; END IF;
        INSERT INTO g625_blocks VALUES ('advanced',v_message);
      END;
      UPDATE public.profiles SET experience_level='pro' WHERE id=v_user;
      INSERT INTO goals.goal_program_positions(
        program_id,position,eigene_werte,richtung,phase_type)
      VALUES (v_plan,2,v_own,'abnehmen','fat_loss');
      INSERT INTO g625_blocks VALUES ('pro','angenommen');
      BEGIN
        INSERT INTO goals.goal_program_positions(
          program_id,position,strategie_code,eigene_werte,richtung,phase_type)
        VALUES (v_plan,3,'lose',v_own,'abnehmen','fat_loss');
        RAISE EXCEPTION 'G-625: doppelte Quelle angenommen';
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g625_blocks VALUES ('beide','abgewiesen');
      END;
      BEGIN
        INSERT INTO goals.goal_program_positions(
          program_id,position,eigene_werte,richtung,phase_type)
        VALUES (v_plan,4,
          '{"kcal_pct_erhaltung":10,"protein_g_kg":2.2,
            "fett_g_kg":0.8,"cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb,
          'abnehmen','fat_loss');
        RAISE EXCEPTION 'G-625: falsches kcal-Vorzeichen angenommen';
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g625_blocks VALUES ('kcal_richtung','abgewiesen');
      END;
      INSERT INTO goals.user_goals(
        id,user_id,goal_type,subtype,title,gueltig_ab,status,priority)
      VALUES ('62500000-0000-0000-0000-000000000121',v_user,
        'body_composition','cut','Zweiter Plan',DATE '2026-10-08','active',1);
      BEGIN
        INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
        VALUES ('62500000-0000-0000-0000-000000000121',
          v_user,'Zweiter Plan','aktiv');
        RAISE EXCEPTION 'G-625: zweiter aktiver Plan angenommen';
      EXCEPTION WHEN unique_violation THEN
        INSERT INTO g625_blocks VALUES ('zweiter_plan','abgewiesen');
      END;
    END $probe$;
    SELECT json_object_agg(name,result) FROM g625_blocks;
    ROLLBACK;
  `))
  assert.match(result.advanced, /^G625_BLOCK:eigene_werte_grad/)
  assert.equal(result.pro, 'angenommen')
  assert.equal(result.beide, 'abgewiesen')
  assert.equal(result.kcal_richtung, 'abgewiesen')
  assert.equal(result.zweiter_plan, 'abgewiesen')
})

test('G-625: Aktivieren wechselt Ziel und startet die erste Planposition', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000131';
      v_plan uuid;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Neuer Cut',
        79,'kg',81.4,DATE '2026-10-08',DATE '2026-12-31','on_hold',1);
      v_plan := goals.goal_plan_create(v_goal,'Neuer Cut');
      PERFORM goals.goal_plan_position_save(v_plan,NULL,1::smallint,
        'lose',NULL,'abnehmen','fat_loss',12::smallint,
        DATE '2026-10-08',DATE '2026-12-31');
      PERFORM goals.goal_plan_activate(v_plan);
    END $probe$;
    SELECT json_build_object(
      'old_plan',(SELECT status FROM goals.goal_programs
        WHERE id='62500000-0000-0000-0000-000000000901'),
      'old_goal',(SELECT status FROM goals.user_goals
        WHERE id='30000000-0000-0000-0000-000000000901'),
      'new_plan',(SELECT status FROM goals.goal_programs
        WHERE goal_id='62500000-0000-0000-0000-000000000131'),
      'new_goal',(SELECT status FROM goals.user_goals
        WHERE id='62500000-0000-0000-0000-000000000131'),
      'started',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='62500000-0000-0000-0000-000000000131'
          AND pos.position=1 AND pos.goal_phase_id IS NOT NULL)
    );
    ROLLBACK;
  `))
  assert.equal(result.old_plan, 'pausiert')
  assert.equal(result.old_goal, 'on_hold')
  assert.equal(result.new_plan, 'aktiv')
  assert.equal(result.new_goal, 'active')
  assert.equal(result.started, 1)
})

test('G-625: ein direkter Phasenstart legt den Einphasenplan an', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    DO $probe$
    DECLARE v_user uuid := '20000000-0000-0000-0000-000000000901';
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        gueltig_ab,status,priority)
      VALUES ('62500000-0000-0000-0000-000000000141',v_user,
        'body_composition','maintenance','Halten',DATE '2026-10-08','active',1);
      PERFORM goals.goal_phase_start('maintenance',
        '62500000-0000-0000-0000-000000000141',
        DATE '2026-10-08',DATE '2026-10-22',NULL,'{}'::jsonb,NULL,NULL);
    END $probe$;
    SELECT json_build_object(
      'plans',(SELECT count(*) FROM goals.goal_programs
        WHERE goal_id='62500000-0000-0000-0000-000000000141'),
      'positions',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='62500000-0000-0000-0000-000000000141'
          AND pos.position=1 AND pos.goal_phase_id IS NOT NULL),
      'role',(SELECT goal_role FROM goals.user_goals
        WHERE id='62500000-0000-0000-0000-000000000141'),
      'strategy',(SELECT strategie_code FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='62500000-0000-0000-0000-000000000141')
    );
    ROLLBACK;
  `))
  assert.deepEqual(result, {
    plans: 1, positions: 1, role: 'controlling', strategy: 'maintain',
  })
})

test('G-625: Positionen verschieben und Termine pflegen', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    DO $probe$
    DECLARE
      v_plan uuid := '62500000-0000-0000-0000-000000000901';
      v_second uuid;
      v_third uuid;
      v_event uuid;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',
        '20000000-0000-0000-0000-000000000901',true);
      v_second := goals.goal_plan_position_save(v_plan,NULL,2::smallint,
        'maintain',NULL,'halten','maintenance',2::smallint,
        DATE '2026-11-01',DATE '2026-11-15');
      v_third := goals.goal_plan_position_save(v_plan,NULL,3::smallint,
        'gain',NULL,'aufbauen','lean_bulk',4::smallint,
        DATE '2026-11-16',DATE '2026-12-14');
      PERFORM goals.goal_plan_position_move(v_third,1::smallint);
      v_event := goals.goal_plan_event_save(v_plan,NULL,'Wettkampf','A',
        DATE '2026-12-20');
      PERFORM goals.goal_plan_event_save(v_plan,v_event,'Hauptwettkampf','A',
        DATE '2026-12-21');
      PERFORM goals.goal_plan_event_delete(v_event);
    END $probe$;
    SELECT json_build_object(
      'order',(SELECT string_agg(strategie_code,',' ORDER BY position)
        FROM goals.goal_program_positions
        WHERE program_id='62500000-0000-0000-0000-000000000901'),
      'events',(SELECT count(*) FROM goals.goal_program_events
        WHERE program_id='62500000-0000-0000-0000-000000000901')
    );
    ROLLBACK;
  `))
  assert.deepEqual(result, { order: 'gain,moderate_cut,maintain', events: 0 })
})

test('G-625: eine Planphase mit eigenen Werten durchlaeuft G-626', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    CREATE TEMP TABLE g625_plan_warning(message text) ON COMMIT DROP;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000151';
      v_plan uuid := '62500000-0000-0000-0000-000000000152';
      v_position uuid;
      v_message text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Planphase',
        79,'kg',81.4,DATE '2026-10-08',DATE '2026-10-29','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Planphase','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,NULL,
        '{"tempo_pct_kg_woche":1.2,"protein_g_kg":2.2,"fett_g_kg":0.8,
          "cardio_pro_woche":2,"refeed_pro_woche":1}'::jsonb,
        'abnehmen','contest_prep',3::smallint,
        DATE '2026-10-08',DATE '2026-10-29');
      BEGIN
        PERFORM goals.goal_plan_position_start(v_position);
        RAISE EXCEPTION 'G-625: Planphase ohne Warnung angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_CONFIRM:%' THEN RAISE; END IF;
        INSERT INTO g625_plan_warning VALUES (v_message);
      END;
    END $probe$;
    SELECT json_build_object('warning',
      (SELECT message FROM g625_plan_warning));
    ROLLBACK;
  `))
  assert.match(result.warning, /^G626_CONFIRM:.*tempo/)
})

test('G-625: Contest-Prep-Katalogposition nutzt Unterphase und G-626', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    CREATE TEMP TABLE g625_catalog_warning(message text) ON COMMIT DROP;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000161';
      v_plan uuid := '62500000-0000-0000-0000-000000000162';
      v_position uuid;
      v_message text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Contest Prep',
        80.5,'kg',81.4,DATE '2026-10-08',DATE '2026-10-29','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Contest Prep','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,
        'contest_prep',NULL,'abnehmen','contest_prep',3::smallint,
        DATE '2026-10-08',DATE '2026-10-29','[]'::jsonb,'early',NULL);
      BEGIN
        PERFORM goals.goal_plan_position_start(v_position);
        RAISE EXCEPTION 'G-625: Contest Prep ohne Warnung angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_CONFIRM:%' THEN RAISE; END IF;
        INSERT INTO g625_catalog_warning VALUES (v_message);
      END;
    END $probe$;
    SELECT json_build_object('warning',
      (SELECT message FROM g625_catalog_warning));
    ROLLBACK;
  `))
  assert.match(result.warning, /^G626_CONFIRM:.*programm_warnung_/)
})

test('G-625: Zielaenderung einer aktiven Planphase bleibt unter G-626', () => {
  const result = sql(`
    BEGIN;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000171';
      v_plan uuid := '62500000-0000-0000-0000-000000000172';
      v_position uuid;
      v_message text;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Planphase',
        80.5,'kg',81.4,DATE '2026-10-08',DATE '2026-10-29','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Planphase','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,NULL,
        '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,"fett_g_kg":0.8,
          "cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb,
        'abnehmen','contest_prep',3::smallint,
        DATE '2026-10-08',DATE '2026-10-29');
      PERFORM goals.goal_plan_position_start(v_position);
      BEGIN
        UPDATE goals.user_goals SET target_value=90 WHERE id=v_goal;
        RAISE EXCEPTION 'G-625: Planziel wurde gegen die Richtung geaendert';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_BLOCK:%' THEN RAISE; END IF;
        RAISE NOTICE 'G625_ZIEL_GESCHUETZT:%',v_message;
      END;
    END $probe$;
    SELECT target_value FROM goals.user_goals
    WHERE id='62500000-0000-0000-0000-000000000171';
    ROLLBACK;
  `)
  assert.equal(Number(result), 80.5)
})

test('G-625: eigene Planphase liefert Tagesreferenz aus ihren Werten', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    DO $probe$
    DECLARE
      v_user uuid := '20000000-0000-0000-0000-000000000901';
      v_goal uuid := '62500000-0000-0000-0000-000000000181';
      v_plan uuid := '62500000-0000-0000-0000-000000000182';
      v_position uuid;
    BEGIN
      PERFORM set_config('request.jwt.claim.sub',v_user::text,true);
      UPDATE goals.user_goals SET status='on_hold'
      WHERE id='30000000-0000-0000-0000-000000000901';
      INSERT INTO goals.user_goals(id,user_id,goal_type,subtype,title,
        target_value,target_unit,start_value,gueltig_ab,target_date,status,priority)
      VALUES (v_goal,v_user,'body_composition','cut','Planphase',
        80.5,'kg',81.4,DATE '2026-10-08',DATE '2026-10-29','active',1);
      INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
      VALUES (v_plan,v_goal,v_user,'Planphase','aktiv');
      v_position := goals.goal_plan_position_save(v_plan,NULL,1::smallint,NULL,
        '{"tempo_pct_kg_woche":0.5,"protein_g_kg":2.2,"fett_g_kg":0.8,
          "cardio_pro_woche":2,"refeed_pro_woche":0}'::jsonb,
        'abnehmen','contest_prep',3::smallint,
        DATE '2026-10-08',DATE '2026-10-29');
      PERFORM goals.goal_plan_position_start(v_position);
    END $probe$;
    SELECT json_build_object(
      'kcal',(SELECT kcal FROM goals.zielwerte_am(
        '20000000-0000-0000-0000-000000000901',DATE '2026-10-08')),
      'fat',(SELECT fat_g FROM goals.zielwerte_am(
        '20000000-0000-0000-0000-000000000901',DATE '2026-10-08')),
      'daily',(SELECT count(*) FROM nutrition.daily_reference_assessment(
        '20000000-0000-0000-0000-000000000901',DATE '2026-10-08')
        WHERE nutrient_code='F18:2CN6' AND reference_value_min IS NOT NULL)
    );
    ROLLBACK;
  `))
  assert.ok(result.kcal > 0, JSON.stringify(result))
  assert.equal(result.fat, 65.1)
  assert.equal(result.daily, 1)
})
