import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const database = process.env.PGDATABASE
if (!database || database === 'postgres') throw new Error('G-675 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const dev = '20000000-0000-0000-0000-000000000901'
const tom = '10000000-0000-0000-0000-000000000101'

function read(body: string, userId = dev): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-t', '-A', '-c', `
      BEGIN;
      SELECT set_config('request.jwt.claim.sub','${userId}',true);
      SET LOCAL ROLE authenticated;
      ${body}
      ROLLBACK;
    `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  const line = output.split(/\r?\n/).find(x => x.startsWith('{'))
  if (!line) throw new Error(`Keine JSON-Probe: ${output}`)
  return JSON.parse(line)
}

test('G-675: Vorschau vergleicht ein bestehendes Ziel ohne Schreibwirkung', () => {
  const got = read(`
    CREATE TEMP TABLE g675_active AS
    SELECT g.id AS goal_id,p.id AS plan_id,pos.id AS position_id,
      pos.duration_weeks,pos.strategie_code,pos.eigene_werte,
      greatest(coalesce(pos.duration_weeks,0)+1,
        ceil((CURRENT_DATE-ph.gueltig_ab+1)::numeric/7)+1)::smallint
        AS new_weeks
    FROM goals.user_goals g JOIN goals.goal_programs p ON p.goal_id=g.id
    JOIN goals.goal_program_positions pos ON pos.program_id=p.id
    JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
    WHERE g.user_id=auth.uid() AND g.goal_role='controlling'
      AND g.status='active' AND p.status='aktiv'
      AND ph.gueltig_ab<=CURRENT_DATE AND ph.actual_end_date IS NULL
    ORDER BY ph.gueltig_ab DESC LIMIT 1;
    SELECT json_build_object(
      'rows',(SELECT count(*) FROM g675_active),
      'new_weeks',(SELECT new_weeks FROM g675_active),
      'result',(SELECT goals.controlling_goal_edit_preview(goal_id,
        strategie_code,eigene_werte,NULL,new_weeks,
        NULL,NULL,CURRENT_DATE) FROM g675_active),
      'blocked',(SELECT goals.controlling_goal_edit_preview(goal_id,
        strategie_code,eigene_werte,3.0::numeric,new_weeks,
        NULL,NULL,CURRENT_DATE) FROM g675_active),
      'unchanged',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN g675_active a ON a.position_id=pos.id
        WHERE pos.duration_weeks IS NOT DISTINCT FROM a.duration_weeks));
  `)
  assert.equal(got.rows, 1)
  const result = got.result as Record<string, unknown>
  const before = result.bisher as Record<string, unknown>
  const after = result.neu as Record<string, unknown>
  if (process.env.G675_SABOTAGE_PREVIEW === '1') after.phasenlaenge_wochen = before.phasenlaenge_wochen
  assert.equal(Number(after.phasenlaenge_wochen), Number(got.new_weeks))
  assert.equal(got.unchanged, 1)
  assert.equal(typeof result.rate_innerhalb_grenzen, 'boolean')
  const blocked = got.blocked as Record<string, unknown>
  assert.equal(blocked.rate_innerhalb_grenzen, false)
  assert.ok((blocked.rate_hinweise as Array<unknown>).length > 0)
  assert.equal(blocked.speichern_erlaubt, false)
  assert.ok((blocked.befunde as Array<{ art: string }>).some(f => f.art === 'sperre'))
  assert.ok('kcal' in before && 'protein_g' in before && 'nach_plan_erreicht' in before)
  assert.ok('kcal' in after && 'protein_g' in after && 'nach_plan_erreicht' in after)
})

test('G-675: vergangene und laufende Phase sind gegen Inhaltsänderung gesperrt', () => {
  const past = read(`
    CREATE TEMP TABLE g675_phase AS SELECT id FROM goals.goal_phases
      WHERE user_id=auth.uid() AND actual_end_date<CURRENT_DATE
      ORDER BY actual_end_date DESC LIMIT 1;
    CREATE TEMP TABLE g675_block(message text);
    DO $probe$
    DECLARE v_message text;
    BEGIN
      BEGIN
        UPDATE goals.goal_phases SET transition_reason='unzulässig'
        WHERE id=(SELECT id FROM g675_phase);
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
      END;
      INSERT INTO g675_block VALUES (v_message);
    END $probe$;
    SELECT json_build_object('id',(SELECT id FROM g675_phase),
      'message',(SELECT message FROM g675_block));
  `, tom)
  const running = read(`
    CREATE TEMP TABLE g675_phase AS
    SELECT ph.id FROM goals.goal_phases ph
      JOIN goals.goal_program_positions pos ON pos.goal_phase_id=ph.id
      JOIN goals.goal_programs p ON p.id=pos.program_id
      WHERE ph.user_id=auth.uid() AND p.status='aktiv'
        AND ph.gueltig_ab<=CURRENT_DATE AND ph.actual_end_date IS NULL
      ORDER BY ph.gueltig_ab DESC LIMIT 1;
    CREATE TEMP TABLE g675_block(message text);
    DO $probe$ DECLARE v_message text;
    BEGIN
      BEGIN
        UPDATE goals.goal_phases SET transition_reason='unzulässig'
        WHERE id=(SELECT id FROM g675_phase);
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_message=MESSAGE_TEXT;
      END;
      INSERT INTO g675_block VALUES (v_message);
    END $probe$;
    SELECT json_build_object('id',(SELECT id FROM g675_phase),
      'message',(SELECT message FROM g675_block));
  `)
  if (process.env.G675_SABOTAGE_PHASE === '1') past.message = null
  assert.equal(typeof past.id, 'string')
  assert.equal(typeof running.id, 'string')
  assert.match(String(past.message), /^G675_BLOCK:phase_verlauf/)
  assert.match(String(running.message), /^G675_BLOCK:laufend_nur_laenge/)
})

test('G-675: Länge wird gemeinsam geändert und Hier beenden setzt heute', () => {
  const got = read(`
    CREATE TEMP TABLE g675_running AS
    SELECT pos.id AS position_id,ph.id AS phase_id,pos.strategie_code,
      pos.eigene_werte,pos.sub_phase_code,pos.zielrate_pct_kg_woche,
      greatest(coalesce(pos.duration_weeks,0)+1,
        ceil((CURRENT_DATE-ph.gueltig_ab+1)::numeric/7)+1)::smallint
        AS new_weeks
    FROM goals.goal_program_positions pos
    JOIN goals.goal_phases ph ON ph.id=pos.goal_phase_id
    JOIN goals.goal_programs p ON p.id=pos.program_id
    WHERE p.user_id=auth.uid() AND p.status='aktiv'
      AND ph.gueltig_ab<=CURRENT_DATE AND ph.actual_end_date IS NULL
    LIMIT 1;
    SELECT goals.goal_plan_position_revise(position_id,
      strategie_code,eigene_werte,new_weeks,
      '["diaetdauer","programm_dauer"]'::jsonb,CURRENT_DATE,
      sub_phase_code,zielrate_pct_kg_woche) FROM g675_running;
    CREATE TEMP TABLE g675_revised AS SELECT ph.projected_end_date AS phase_end,
      pos.projected_end_date AS position_end,pos.duration_weeks
    FROM goals.goal_phases ph JOIN goals.goal_program_positions pos
      ON pos.goal_phase_id=ph.id
    JOIN g675_running r ON r.phase_id=ph.id;
    SELECT goals.goal_phase_end(phase_id,'G675 Probe',CURRENT_DATE)
    FROM g675_running;
    SELECT json_build_object(
      'equal',(SELECT phase_end=position_end FROM g675_revised),
      'weeks',(SELECT duration_weeks FROM g675_revised),
      'expected',(SELECT new_weeks FROM g675_running),
      'closed',(SELECT ph.actual_end_date FROM goals.goal_phases ph
        JOIN g675_running r ON r.phase_id=ph.id),
      'today',CURRENT_DATE);
  `)
  assert.equal(got.equal, true)
  assert.equal(got.weeks, got.expected)
  assert.equal(got.closed, got.today)
})

test('G-675: eine geplante Position bleibt editierbar', () => {
  const got = read(`
    CREATE TEMP TABLE g675_planned AS SELECT pos.id,pos.duration_weeks
    FROM goals.goal_program_positions pos
    JOIN goals.goal_programs p ON p.id=pos.program_id
    WHERE p.user_id=auth.uid() AND p.status='entwurf'
      AND pos.goal_phase_id IS NULL AND pos.gueltig_ab>CURRENT_DATE
      AND pos.duration_weeks IS NOT NULL LIMIT 1;
    UPDATE goals.goal_program_positions SET duration_weeks=duration_weeks+1
    WHERE id=(SELECT id FROM g675_planned);
    SELECT json_build_object('rows',(SELECT count(*) FROM g675_planned),
      'before',(SELECT duration_weeks FROM g675_planned),
      'after',(SELECT pos.duration_weeks FROM goals.goal_program_positions pos
        JOIN g675_planned p ON p.id=pos.id));
  `)
  assert.equal(got.rows, 1)
  assert.equal(Number(got.after), Number(got.before) + 1)
})

test('G-675: aktiven Plan ablegen ergibt gekennzeichnete Erhaltung und Entwurf beim Wiederherstellen', () => {
  const got = read(`
    CREATE TEMP TABLE g675_active AS SELECT g.id AS goal_id,p.id AS plan_id
    FROM goals.user_goals g JOIN goals.goal_programs p ON p.goal_id=g.id
    WHERE g.user_id=auth.uid() AND g.status='active' AND p.status='aktiv'
    LIMIT 1;
    CREATE TEMP TABLE g675_linked AS SELECT pos.goal_phase_id
    FROM goals.goal_program_positions pos JOIN g675_active a ON a.plan_id=pos.program_id
    WHERE pos.goal_phase_id IS NOT NULL;
    SELECT goals.goal_plan_trash(plan_id) FROM g675_active;
    CREATE TEMP TABLE g675_observed AS SELECT
      (SELECT count(*) FROM goals.goal_programs p JOIN g675_active a ON a.plan_id=p.id) AS direct_count,
      (SELECT count(*) FROM goals.goal_program_positions pos
        JOIN g675_active a ON a.plan_id=pos.program_id) AS position_count,
      (SELECT count(*) FROM goals.goal_phases ph
        JOIN g675_linked l ON l.goal_phase_id=ph.id) AS direct_phase_count,
      (SELECT count(*) FROM goals.phase_am(auth.uid(),CURRENT_DATE)) AS phase_count,
      (SELECT hindernis FROM goals.berechne_zielwerte(auth.uid(),CURRENT_DATE)) AS hindernis,
      (SELECT kcal FROM goals.berechne_zielwerte(auth.uid(),CURRENT_DATE)) AS kcal,
      (SELECT count(*) FROM nutrition.daily_reference_assessment(
        auth.uid(),CURRENT_DATE) WHERE reference_basis='maintenance_plan_in_trash')
        AS marked_references;
    SELECT goals.goal_plan_restore(plan_id) FROM g675_active;
    SELECT json_build_object('direct',(SELECT direct_count FROM g675_observed),
      'positions',(SELECT position_count FROM g675_observed),
      'direct_phases',(SELECT direct_phase_count FROM g675_observed),
      'phases',(SELECT phase_count FROM g675_observed),
      'hindernis',(SELECT hindernis FROM g675_observed),
      'kcal',(SELECT kcal FROM g675_observed),
      'marked_references',(SELECT marked_references FROM g675_observed),
      'restored',(SELECT p.status FROM goals.goal_programs p
        JOIN g675_active a ON a.plan_id=p.id));
  `)
  if (process.env.G675_SABOTAGE_TRASH === '1') got.direct = 1
  assert.equal(got.direct, 0)
  assert.equal(got.positions, 0)
  assert.equal(got.direct_phases, 0)
  assert.equal(got.phases, 0)
  assert.equal(got.hindernis, 'plan_im_papierkorb')
  assert.ok(Number(got.kcal) > 0)
  assert.ok(Number(got.marked_references) > 0)
  assert.equal(got.restored, 'entwurf')
})

test('G-675: Ziel und seine Kinder bleiben unsichtbar, Rückkehr pausiert; Purge entfernt Kinder', () => {
  const got = read(`
    CREATE TEMP TABLE g675_active AS SELECT g.id AS goal_id,p.id AS plan_id
    FROM goals.user_goals g JOIN goals.goal_programs p ON p.goal_id=g.id
    WHERE g.user_id=auth.uid() AND g.status='active' AND p.status='aktiv'
    LIMIT 1;
    SELECT goals.goal_trash(goal_id) FROM g675_active;
    CREATE TEMP TABLE g675_observed AS SELECT
      (SELECT count(*) FROM goals.user_goals g JOIN g675_active a ON a.goal_id=g.id) AS direct_count,
      (SELECT count(*) FROM goals.goal_list_at(auth.uid(),CURRENT_DATE) l
        JOIN g675_active a ON a.goal_id=l.goal_id) AS list_count,
      (SELECT goals.controlling_goal_outlook(goal_id,CURRENT_DATE)
        FROM g675_active) AS outlook,
      (SELECT goal_id FROM goals.berechne_zielwerte(
        auth.uid(),CURRENT_DATE)) AS daily_goal,
      (SELECT goals.goal_module_cards_at(goal_id,CURRENT_DATE)
        FROM g675_active) AS module_cards,
      (SELECT count(*) FROM goals.measurement_points(
        (SELECT goal_id FROM g675_active),CURRENT_DATE)) AS point_count,
      (SELECT count(*) FROM goals.phase_am(auth.uid(),CURRENT_DATE)) AS phase_count,
      (SELECT count(*) FROM goals.goal_trash_list() t JOIN g675_active a
        ON a.goal_id=t.object_id) AS trash_count;
    SELECT goals.goal_restore(goal_id) FROM g675_active;
    CREATE TEMP TABLE g675_child AS SELECT g.id AS goal_id,
      NULL::uuid AS plan_id
    FROM goals.user_goals g WHERE g.user_id=auth.uid()
      AND g.goal_role='measurement' AND g.status='active' LIMIT 1;
    UPDATE goals.user_goals SET status='paused'
    WHERE id=(SELECT goal_id FROM g675_child);
    UPDATE g675_child SET plan_id=goals.goal_plan_create(goal_id,'Purge-Probe');
    SELECT goals.goal_plan_event_save(plan_id,NULL,'Purge-Kind','X',CURRENT_DATE)
    FROM g675_child;
    SELECT goals.goal_trash(goal_id) FROM g675_child;
    SELECT goals.goal_purge(goal_id,true) FROM g675_child;
    RESET ROLE;
    SELECT json_build_object(
      'direct',(SELECT direct_count FROM g675_observed),
      'list',(SELECT list_count FROM g675_observed),
      'outlook',(SELECT outlook FROM g675_observed),
      'daily_goal',(SELECT daily_goal FROM g675_observed),
      'module_cards',(SELECT module_cards FROM g675_observed),
      'trashed_goal',(SELECT goal_id FROM g675_active),
      'points',(SELECT point_count FROM g675_observed),
      'phases',(SELECT phase_count FROM g675_observed),
      'trash',(SELECT trash_count FROM g675_observed),
      'restored_status',(SELECT g.status FROM goals.user_goals g
        JOIN g675_active a ON a.goal_id=g.id),
      'restored_plan',(SELECT p.status FROM goals.goal_programs p
        JOIN g675_active a ON a.plan_id=p.id),
      'child',(SELECT count(*) FROM goals.goal_program_events e
        JOIN g675_child c ON c.plan_id=e.program_id));
  `)
  if (process.env.G675_SABOTAGE_CHILD === '1') got.child = 1
  assert.equal(got.direct, 0)
  assert.equal(got.list, 0)
  assert.equal(got.outlook, null)
  assert.notEqual(got.daily_goal, got.trashed_goal)
  assert.equal(got.module_cards, null)
  assert.equal(got.points, 0)
  assert.equal(got.phases, 0)
  assert.equal(got.trash, 1)
  assert.equal(got.restored_status, 'paused')
  assert.equal(got.restored_plan, 'entwurf')
  assert.equal(got.child, 0)
})

test('G-675: Katalogwächter findet alle registrierten Schutzwege', () => {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', database, '-t', '-A',
    '-c', 'SELECT count(*) FROM goals.trash_contract_check()'],
  { encoding: 'utf8' }).trim()
  assert.equal(Number(output), 0)
})

test('G-675: Planwiederherstellung holt ein gelöschtes Ziel pausiert mit zurück', () => {
  const got = read(`
    CREATE TEMP TABLE g675_pair AS SELECT g.id AS goal_id,p.id AS plan_id
    FROM goals.user_goals g JOIN goals.goal_programs p ON p.goal_id=g.id
    WHERE g.user_id=auth.uid() AND g.status='active' AND p.status='aktiv'
    LIMIT 1;
    SELECT goals.goal_trash(goal_id) FROM g675_pair;
    SELECT goals.goal_plan_trash(plan_id) FROM g675_pair;
    SELECT goals.goal_plan_restore(plan_id) FROM g675_pair;
    SELECT json_build_object(
      'goal_status',(SELECT g.status FROM goals.user_goals g
        JOIN g675_pair x ON x.goal_id=g.id),
      'plan_status',(SELECT p.status FROM goals.goal_programs p
        JOIN g675_pair x ON x.plan_id=p.id),
      'goal_deleted',(SELECT g.deleted_at FROM goals.user_goals g
        JOIN g675_pair x ON x.goal_id=g.id),
      'plan_deleted',(SELECT p.deleted_at FROM goals.goal_programs p
        JOIN g675_pair x ON x.plan_id=p.id));
  `)
  assert.equal(got.goal_status, 'paused')
  assert.equal(got.plan_status, 'entwurf')
  assert.equal(got.goal_deleted, null)
  assert.equal(got.plan_deleted, null)
})

test('G-675: ein Messziel nutzt denselben Papierkorb und kehrt pausiert zurück', () => {
  const got = read(`
    CREATE TEMP TABLE g675_measurement AS SELECT id FROM goals.user_goals
    WHERE user_id=auth.uid() AND goal_role='measurement' AND status='active'
    LIMIT 1;
    SELECT goals.goal_trash(id) FROM g675_measurement;
    CREATE TEMP TABLE g675_hidden AS SELECT
      (SELECT count(*) FROM goals.user_goals g
        JOIN g675_measurement m ON m.id=g.id) AS direct_count,
      (SELECT count(*) FROM goals.goal_trash_list() t
        JOIN g675_measurement m ON m.id=t.object_id) AS trash_count;
    SELECT goals.goal_restore(id) FROM g675_measurement;
    SELECT json_build_object('direct',(SELECT direct_count FROM g675_hidden),
      'trash',(SELECT trash_count FROM g675_hidden),
      'status',(SELECT g.status FROM goals.user_goals g
        JOIN g675_measurement m ON m.id=g.id));
  `)
  assert.equal(got.direct, 0)
  assert.equal(got.trash, 1)
  assert.equal(got.status, 'paused')
})

test('G-675: Plan-Purge entfernt Positionen und verknüpfte Phasen', () => {
  const got = read(`
    CREATE TEMP TABLE g675_plan AS SELECT p.id AS plan_id
    FROM goals.goal_programs p WHERE p.user_id=auth.uid()
      AND p.status='aktiv' LIMIT 1;
    CREATE TEMP TABLE g675_children AS
    SELECT pos.id AS position_id,pos.goal_phase_id
    FROM goals.goal_program_positions pos
    JOIN g675_plan p ON p.plan_id=pos.program_id;
    SELECT goals.goal_plan_trash(plan_id) FROM g675_plan;
    SELECT goals.goal_plan_purge(plan_id,true) FROM g675_plan;
    RESET ROLE;
    SELECT json_build_object(
      'plan',(SELECT count(*) FROM goals.goal_programs p
        JOIN g675_plan x ON x.plan_id=p.id),
      'positions',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN g675_children x ON x.position_id=pos.id),
      'phases',(SELECT count(*) FROM goals.goal_phases ph
        JOIN g675_children x ON x.goal_phase_id=ph.id));
  `)
  assert.equal(got.plan, 0)
  assert.equal(got.positions, 0)
  assert.equal(got.phases, 0)
})

test('G-675: Termin kann verborgen, zurückgeholt und endgültig gelöscht werden', () => {
  const got = read(`
    CREATE TEMP TABLE g675_event AS
    SELECT goals.goal_plan_event_save(p.id,NULL::uuid,
      'G675 Probe Termin','X',CURRENT_DATE) AS event_id
    FROM goals.goal_programs p WHERE p.user_id=auth.uid()
      AND p.status='aktiv' LIMIT 1;
    SELECT goals.goal_plan_event_trash(event_id) FROM g675_event;
    CREATE TEMP TABLE g675_counts(hidden integer,restored integer,purged integer);
    DO $probe$ DECLARE v_hidden integer; v_restored integer; v_purged integer;
    BEGIN
      SELECT count(*) INTO v_hidden FROM goals.goal_program_events e
      JOIN g675_event t ON t.event_id=e.id;
      PERFORM goals.goal_plan_event_restore(event_id) FROM g675_event;
      SELECT count(*) INTO v_restored FROM goals.goal_program_events e
      JOIN g675_event t ON t.event_id=e.id;
      PERFORM goals.goal_plan_event_trash(event_id) FROM g675_event;
      PERFORM goals.goal_plan_event_purge(event_id,true) FROM g675_event;
      SELECT count(*) INTO v_purged FROM goals.goal_program_events e
      JOIN g675_event t ON t.event_id=e.id;
      INSERT INTO g675_counts VALUES (v_hidden,v_restored,v_purged);
    END $probe$;
    SELECT json_build_object('hidden',hidden,'restored',restored,'purged',purged)
    FROM g675_counts;
  `)
  assert.equal(got.hidden, 0)
  assert.equal(got.restored, 1)
  assert.equal(got.purged, 0)
})

test('G-675: der Tageslauf schreibt für ein Ziel im Papierkorb nichts nach', () => {
  const got = read(`
    SELECT goals.goal_trash(g.id) FROM goals.user_goals g
    WHERE g.user_id=auth.uid() AND g.status='active'
      AND g.goal_role='controlling' LIMIT 1;
    RESET ROLE;
    SET LOCAL ROLE service_role;
    DELETE FROM goals.goal_contributions c WHERE c.goal_id=(
      SELECT g.id FROM goals.user_goals g
      WHERE g.user_id='${dev}' AND g.deleted_at IS NOT NULL
      ORDER BY g.deleted_at DESC LIMIT 1)
      AND c.contribution_date=CURRENT_DATE;
    DO $probe$ BEGIN
      PERFORM goals.refresh_goal_contributions(
        CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,'${dev}'::uuid);
    END $probe$;
    SELECT json_build_object(
      'state',(SELECT count(*) FROM goals.user_goals g
        CROSS JOIN LATERAL goals.goal_state_at(g.id,CURRENT_DATE) s
        WHERE g.user_id='${dev}' AND g.deleted_at IS NOT NULL),
      'written',(SELECT count(*) FROM goals.goal_contributions c
        JOIN goals.user_goals g ON g.id=c.goal_id
        WHERE g.user_id='${dev}' AND g.deleted_at IS NOT NULL
          AND c.contribution_date=CURRENT_DATE));
  `)
  assert.equal(got.state, 0)
  assert.equal(got.written, 0)
})
