import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-644 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

function sql(query: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', query],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

function json(query: string): any {
  const line = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    ${query}
    ROLLBACK;`).split(/\r?\n/).find(x => x.startsWith('{'))
  assert.ok(line)
  return JSON.parse(line)
}

test('G-644: vier Katalogvorlagen haben die freigegebenen Blöcke', () => {
  const rows = JSON.parse(sql(`SELECT json_agg(json_build_object(
    'code',code,'quelle',quelle,'anker',anker_art,
    'dauer',(SELECT sum((p->>'dauer_wochen')::integer)
      FROM jsonb_array_elements(positionen) p),
    'anzahl',jsonb_array_length(positionen)) ORDER BY code)
    FROM goals.goal_plan_templates WHERE quelle='lumeos';`))
  assert.deepEqual(rows, [
    { code: 'annual', quelle: 'lumeos', anker: 'start', dauer: 52, anzahl: 5 },
    { code: 'leer', quelle: 'lumeos', anker: 'start', dauer: 4, anzahl: 1 },
    { code: 'mini', quelle: 'lumeos', anker: 'start', dauer: 4, anzahl: 1 },
    { code: 'prep', quelle: 'lumeos', anker: 'A', dauer: 16, anzahl: 4 },
  ])
  const annual = JSON.parse(sql(`SELECT positionen FROM goals.goal_plan_templates
    WHERE code='annual'`))
  assert.deepEqual(annual.map((p: any) => [p.strategie_code, p.dauer_wochen]), [
    ['reverse_diet', 8], ['lean_bulk', 20], ['mini_cut', 4],
    ['lean_bulk', 12], ['maintain', 8],
  ])
})

test('G-644: zweiter Plan am Ziel ist Entwurf; A-Termin plant 16 Wochen rückwärts', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Wettkampf 2027','prep',DATE '2027-02-04');
    SELECT json_build_object(
      'status',(SELECT status FROM goals.goal_programs WHERE id=neu.id),
      'anzahl',(SELECT count(*) FROM goals.goal_programs WHERE goal_id='${goal}'),
      'aktiv',(SELECT count(*) FROM goals.goal_programs
        WHERE user_id='${user}' AND status='aktiv'),
      'positionen',(SELECT string_agg(position||':'||strategie_code||':'||
        coalesce(sub_phase_code,'-')||':'||duration_weeks,',' ORDER BY position)
        FROM goals.goal_program_positions WHERE program_id=neu.id),
      'von',(SELECT min(gueltig_ab) FROM goals.goal_program_positions
        WHERE program_id=neu.id),
      'bis',(SELECT max(projected_end_date) FROM goals.goal_program_positions
        WHERE program_id=neu.id),
      'termin',(SELECT event_date FROM goals.goal_program_events
        WHERE program_id=neu.id AND kind='A')) FROM g644_plan neu;`)
  assert.equal(result.status, 'entwurf')
  assert.equal(result.anzahl, 2)
  assert.equal(result.aktiv, 1)
  assert.equal(result.positionen,
    '1:contest_prep:early:6,2:contest_prep:mid:7,3:contest_prep:late:2,4:peak_week:-:1')
  assert.equal(result.von, '2026-10-15')
  assert.equal(result.bis, '2027-02-03')
  assert.equal(result.termin, '2027-02-04')
})

test('G-644: eigener Katalogplan wird Vorlage und geplante Position wird gelöscht', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    CREATE TEMP TABLE g644_vorlage(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Mini','mini',DATE '2026-11-01');
    INSERT INTO g644_vorlage SELECT goals.goal_plan_save_as_template(
      (SELECT id FROM g644_plan),'Mein Mini Cut');
    CREATE TEMP TABLE g644_kopie(id uuid) ON COMMIT DROP;
    INSERT INTO g644_kopie SELECT goals.goal_plan_create(
      '${goal}','Mini Kopie',(SELECT id::text FROM g644_vorlage),
      DATE '2026-12-01');
    SELECT goals.goal_plan_position_delete(pos.id)
      FROM g644_plan plan JOIN goals.goal_program_positions pos
        ON pos.program_id=plan.id;
    SELECT json_build_object(
      'quelle',(SELECT quelle FROM goals.goal_plan_templates
        WHERE id=vorlage.id),
      'vorlagenpositionen',(SELECT jsonb_array_length(positionen)
        FROM goals.goal_plan_templates WHERE id=vorlage.id),
      'kopiepositionen',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM g644_kopie)),
      'positionen',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=plan.id)) FROM g644_vorlage vorlage,g644_plan plan;`)
  assert.equal(result.quelle, 'eigen')
  assert.equal(result.vorlagenpositionen, 1)
  assert.equal(result.kopiepositionen, 1)
  assert.equal(result.positionen, 0)
})

test('G-644: gestartete Position bleibt geschützt', () => {
  const result = json(`DO $probe$ BEGIN
      BEGIN
        PERFORM goals.goal_plan_position_delete(
          (SELECT id FROM goals.goal_program_positions
           WHERE program_id='62500000-0000-0000-0000-000000000101'
             AND goal_phase_id IS NOT NULL LIMIT 1));
        RAISE EXCEPTION 'erwartete Sperre fehlt';
      EXCEPTION WHEN check_violation THEN
        IF SQLERRM NOT LIKE 'G644_BLOCK:nur_geplante_position%' THEN RAISE; END IF;
      END;
    END $probe$;
    SELECT json_build_object('gesperrt',true);`)
  assert.equal(result.gesperrt, true)
})

test('G-644: Aktivierung prüft G-626 erst nach dem Entwurf', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Mini','mini',DATE '2026-11-01');
    DO $probe$ DECLARE v_message text; BEGIN
      BEGIN
        PERFORM goals.goal_plan_activate((SELECT id FROM g644_plan));
        RAISE EXCEPTION 'erwartete G-626-Sperre fehlt';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_BLOCK:%' THEN RAISE; END IF;
      END;
    END $probe$;
    SELECT json_build_object('status',(SELECT status
      FROM goals.goal_programs WHERE id=(SELECT id FROM g644_plan)),
      'aktiv',(SELECT count(*) FROM goals.goal_programs
        WHERE user_id='${user}' AND status='aktiv'));`)
  assert.equal(result.status, 'entwurf')
  assert.equal(result.aktiv, 1)
})

test('G-644: Datenbank lässt keinen zweiten aktiven Plan zu', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Erhaltung','leer',DATE '2026-11-01');
    DO $probe$ BEGIN
      BEGIN
        UPDATE goals.goal_programs SET status='aktiv'
        WHERE id=(SELECT id FROM g644_plan);
        RAISE EXCEPTION 'zweiter aktiver Plan angenommen';
      EXCEPTION WHEN unique_violation THEN NULL;
      END;
    END $probe$;
    SELECT json_build_object('aktiv',(SELECT count(*) FROM goals.goal_programs
      WHERE user_id='${user}' AND status='aktiv'));`)
  assert.equal(result.aktiv, 1)
})

test('G-644: direkter Statuswrite umgeht G-626 nicht', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Mini','mini',DATE '2026-11-01');
    DO $probe$ DECLARE v_message text; BEGIN
      BEGIN
        UPDATE goals.goal_programs SET status='aktiv'
        WHERE id=(SELECT id FROM g644_plan);
        RAISE EXCEPTION 'G-626 wurde umgangen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_BLOCK:%' THEN RAISE; END IF;
      END;
    END $probe$;
    SELECT json_build_object('status',(SELECT status
      FROM goals.goal_programs WHERE id=(SELECT id FROM g644_plan)));`)
  assert.equal(result.status, 'entwurf')
})

test('G-644: Pro sieht G-626-Warnungen vor der Aktivierung', () => {
  const proUser = '20000000-0000-0000-0000-000000000901'
  const output = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${proUser}',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '30000000-0000-0000-0000-000000000901',
      'Mini Cut','mini',CURRENT_DATE+1);
    DO $probe$ DECLARE v_message text; BEGIN
      BEGIN
        PERFORM goals.goal_plan_activate((SELECT id FROM g644_plan));
        RAISE EXCEPTION 'erwartete Warnung fehlt';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
        IF v_message NOT LIKE 'G626_CONFIRM:%' THEN RAISE; END IF;
      END;
    END $probe$;
    SELECT json_build_object('status',(SELECT status
      FROM goals.goal_programs WHERE id=(SELECT id FROM g644_plan)));
    ROLLBACK;`)
  const row = output.split(/\r?\n/).find(x => x.startsWith('{'))
  assert.ok(row)
  assert.equal(JSON.parse(row).status, 'entwurf')
})

test('G-644: ausgewählter Entwurf aktiviert genau einen Plan am selben Ziel', () => {
  const otherUser = '20000000-0000-0000-0000-000000000901'
  const output = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${otherUser}',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '30000000-0000-0000-0000-000000000901','Neuer Halt','leer',CURRENT_DATE);
    SELECT goals.goal_plan_activate(id) FROM g644_plan;
    SELECT json_build_object(
      'neu',(SELECT status FROM goals.goal_programs
        WHERE id=(SELECT id FROM g644_plan)),
      'aktiv',(SELECT count(*) FROM goals.goal_programs
        WHERE user_id='${otherUser}' AND status='aktiv'),
      'gestartet',(SELECT count(*) FROM goals.goal_program_positions
        WHERE program_id=(SELECT id FROM g644_plan)
          AND goal_phase_id IS NOT NULL));
    ROLLBACK;`)
  const row = output.split(/\r?\n/).find(x => x.startsWith('{'))
  assert.ok(row)
  assert.deepEqual(JSON.parse(row), { neu: 'aktiv', aktiv: 1, gestartet: 1 })
})

test('G-644: historische Positionsraten stimmen mit den Phasen überein', () => {
  assert.equal(sql(`SELECT count(*) FROM goals.goal_program_positions pos
    JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
    WHERE pos.eigene_werte IS NULL
      AND pos.zielrate_pct_kg_woche IS DISTINCT FROM ph.zielrate_pct_kg_woche`), '0')
})

test('G-644: Halten im Aufbauplan prüft das lokale Phasenziel', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Erhaltung','leer',CURRENT_DATE);
    SELECT goals.goal_plan_activate(id) FROM g644_plan;
    SELECT json_build_object(
      'status',(SELECT status FROM goals.goal_programs
        WHERE id=(SELECT id FROM g644_plan)),
      'phase',(SELECT phase_type FROM goals.goal_phases
        WHERE id=(SELECT goal_phase_id FROM goals.goal_program_positions
          WHERE program_id=(SELECT id FROM g644_plan) AND position=1)));
  `)
  assert.deepEqual(result, { status: 'aktiv', phase: 'maintenance' })
})

test('G-644: neuer aktiver Plan verankert seine Soll-Linie am Starttrend', () => {
  const result = json(`CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '${goal}','Neuer Halt','leer',CURRENT_DATE);
    SELECT goals.goal_plan_activate(id) FROM g644_plan;
    SELECT json_build_object(
      'plan',(SELECT wert FROM goals.plan_soll_am('${goal}',CURRENT_DATE)),
      'trend',(SELECT wert FROM goals.trendgewicht_am('${user}',CURRENT_DATE)),
      'alter_start',(SELECT start_value FROM goals.user_goals WHERE id='${goal}'));`)
  assert.equal(result.plan, result.trend)
  assert.notEqual(result.plan, result.alter_start)
})

test('G-644: Neustart kopiert den letzten gelaufenen Plan statt eines Entwurfs', () => {
  const result = json(`CREATE TEMP TABLE g644_entwurf(id uuid) ON COMMIT DROP;
    INSERT INTO g644_entwurf SELECT goals.goal_plan_create(
      '${goal}','Nur Entwurf','mini',CURRENT_DATE+30);
    UPDATE goals.user_goals SET status='achieved' WHERE id='${goal}';
    CREATE TEMP TABLE g644_neustart(id uuid) ON COMMIT DROP;
    INSERT INTO g644_neustart SELECT goals.goal_restart(
      '${goal}',CURRENT_DATE,CURRENT_DATE+60);
    SELECT json_build_object('code',(
      SELECT pos.strategie_code FROM goals.goal_program_positions pos
      JOIN goals.goal_programs plan ON plan.id=pos.program_id
      WHERE plan.goal_id=(SELECT id FROM g644_neustart)
      ORDER BY pos.position LIMIT 1));`)
  assert.equal(result.code, 'lean_bulk')
})

test('G-644: eigene Phasenwerte bleiben in einer eigenen Vorlage erhalten', () => {
  const proUser = '20000000-0000-0000-0000-000000000901'
  const output = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${proUser}',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    CREATE TEMP TABLE g644_template(id uuid) ON COMMIT DROP;
    CREATE TEMP TABLE g644_copy(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '30000000-0000-0000-0000-000000000901','Eigene Werte');
    SELECT goals.goal_plan_position_save((SELECT id FROM g644_plan),
      NULL,1::smallint,NULL,
      '{"tempo_pct_kg_woche":1,"protein_g_kg":2,
        "fett_g_kg":0.8,"cardio_pro_woche":0,"refeed_pro_woche":0}'::jsonb,
      'abnehmen','fat_loss',4::smallint,DATE '2026-11-01',
      DATE '2026-11-28');
    INSERT INTO g644_template SELECT goals.goal_plan_save_as_template(
      (SELECT id FROM g644_plan),'Eigener Cut');
    INSERT INTO g644_copy SELECT goals.goal_plan_create(
      '30000000-0000-0000-0000-000000000901','Kopie',
      (SELECT id::text FROM g644_template),DATE '2026-12-01');
    SELECT json_build_object('quelle',(
      SELECT quelle FROM goals.goal_plan_templates
      WHERE id=(SELECT id FROM g644_template)),
      'tempo',(
      SELECT eigene_werte->>'tempo_pct_kg_woche'
      FROM goals.goal_program_positions
      WHERE program_id=(SELECT id FROM g644_copy)));
    ROLLBACK;`)
  const row = output.split(/\r?\n/).find(x => x.startsWith('{'))
  assert.ok(row)
  assert.deepEqual(JSON.parse(row), { quelle: 'eigen', tempo: '1' })
})

test('G-644: kcal-Prozent eigener Werte durchläuft dieselbe Aktivierungsprüfung', () => {
  const proUser = '20000000-0000-0000-0000-000000000901'
  const output = sql(`BEGIN;
    SELECT set_config('request.jwt.claim.sub','${proUser}',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE g644_plan(id uuid) ON COMMIT DROP;
    INSERT INTO g644_plan SELECT goals.goal_plan_create(
      '30000000-0000-0000-0000-000000000901','Kcal Plan');
    SELECT goals.goal_plan_position_save((SELECT id FROM g644_plan),
      NULL,1::smallint,NULL,
      '{"kcal_pct_erhaltung":5,"protein_g_kg":2,"fett_g_kg":0.8,
        "cardio_pro_woche":0,"refeed_pro_woche":0}'::jsonb,
      'aufbauen','lean_bulk',4::smallint,CURRENT_DATE+1,CURRENT_DATE+28);
    SELECT goals.g644_plan_activation_check((SELECT id FROM g644_plan));
    SELECT json_build_object('geprueft',true);
    ROLLBACK;`)
  const row = output.split(/\r?\n/).find(x => x.startsWith('{'))
  assert.ok(row)
  assert.equal(JSON.parse(row).geprueft, true)
})
