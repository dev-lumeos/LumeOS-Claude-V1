import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-611 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

const user = '10000000-0000-0000-0000-000000000101'
const goal = '30000000-0000-0000-0000-000000000101'

test('G-611: Frist friert Leser und Tageswerte ein; Archiv blendet nur Liste aus', () => {
  const result = JSON.parse(sql(`
    SELECT json_build_object(
      'state',(SELECT state FROM goals.goal_state_at('${goal}',DATE '2026-12-17')),
      'reason',(SELECT reason FROM goals.goal_state_at('${goal}',DATE '2026-12-17')),
      'phase',(SELECT count(*) FROM goals.phase_am('${user}',DATE '2026-12-17')),
      'obstacle',(SELECT hindernis FROM goals.berechne_zielwerte('${user}',DATE '2026-12-17')),
      'kcal',(SELECT kcal FROM goals.berechne_zielwerte('${user}',DATE '2026-12-17')),
      'progress',(SELECT progress_status FROM goals.goal_progress_at('${goal}',DATE '2026-12-17')),
      'list',(SELECT count(*) FROM goals.goal_list_at('${user}',DATE '2026-12-17')
        WHERE goal_id='${goal}')
    );
  `))
  assert.equal(result.state, 'eingefroren')
  assert.equal(result.reason, 'frist_abgelaufen')
  assert.equal(result.phase, 0)
  assert.equal(result.obstacle, 'ziel_eingefroren')
  assert.ok(result.kcal > 0)
  assert.equal(result.progress, 'frozen')
  assert.equal(result.list, 1)
})

test('G-611: fremde Aktion und unbestätigtes Löschen scheitern; Bestätigung entfernt Verlauf', () => {
  assert.throws(() => sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.goal_delete('${goal}');
    ROLLBACK;
  `), /G611_CONFIRM:beenden_statt_loeschen/)
  assert.throws(() => sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub',
      '20000000-0000-0000-0000-000000000901',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.goal_delete('${goal}',true);
    ROLLBACK;
  `), /G611_BLOCK:ziel_fremd/)
  assert.throws(() => sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    DELETE FROM goals.user_goals WHERE id='${goal}';
    ROLLBACK;
  `), /permission denied/)
  const result = JSON.parse(sql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    DO $probe$ BEGIN
      PERFORM set_config('request.jwt.claim.sub','${user}',true);
      PERFORM goals.goal_delete('${goal}',true);
    END $probe$;
    SELECT json_build_object('after',(SELECT count(*) FROM goals.user_goals
      WHERE id='${goal}'),'phases',(SELECT count(*) FROM goals.goal_phases
      WHERE goal_id='${goal}'),'plans',(SELECT count(*) FROM goals.goal_programs
      WHERE goal_id='${goal}'),
      'positions',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='${goal}'),
      'milestones',(SELECT count(*) FROM goals.goal_milestones
        WHERE goal_id='${goal}'));
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.equal(result.after, 0)
  assert.equal(result.phases, 0)
  assert.equal(result.plans, 0)
  assert.equal(result.positions, 0)
  assert.equal(result.milestones, 0)
})

test('G-611: erreichter Kraftwert friert am ersten Treffer ein', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    UPDATE goals.user_goals SET target_value=97
      WHERE id='30000000-0000-0000-0000-000000000102';
    SELECT row_to_json(s) FROM goals.goal_state_at(
      '30000000-0000-0000-0000-000000000102',DATE '2026-08-18') s;
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.equal(result.state, 'eingefroren')
  assert.equal(result.reason, 'erreicht')
  assert.ok(result.frozen_on <= '2026-08-18')
})

test('G-611: erreichter Steuerplan liefert markierte Erhaltung auch in Tagesreferenzen', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${goal}';
    SELECT json_build_object(
      'obstacle',(SELECT hindernis FROM goals.berechne_zielwerte(
        '${user}',DATE '2026-10-09')),
      'source',(SELECT herkunft FROM goals.zielwerte_am(
        '${user}',DATE '2026-10-09')),
      'fatRefs',(SELECT count(*) FROM nutrition.daily_reference_assessment(
        '${user}',DATE '2026-10-09')
        WHERE nutrient_code IN ('F18:2CN6','F18:3CN3')
          AND reference_basis='maintenance_frozen_goal'));
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.equal(result.obstacle, 'ziel_eingefroren')
  assert.equal(result.source, 'ziel_eingefroren')
  assert.equal(result.fatRefs, 2)
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${goal}';
    INSERT INTO goals.goal_phases(user_id,goal_id,phase_type,gueltig_ab)
    VALUES ('${user}','${goal}','maintenance',CURRENT_DATE);
    ROLLBACK;
  `), /G611_BLOCK:ziel_eingefroren/)
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${goal}';
    UPDATE goals.goal_programs SET status='aktiv' WHERE goal_id='${goal}';
    ROLLBACK;
  `), /G611_BLOCK:ziel_eingefroren/)
})

test('G-611: Archiv blendet ab; Neustart kopiert Ziel und Entwurfsplan', () => {
  assert.throws(() => sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    UPDATE goals.user_goals SET archived_at=now() WHERE id='${goal}';
    ROLLBACK;
  `), /G611_BLOCK:archiv_nur_funktion/)
  const result = JSON.parse(sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${goal}';
    CREATE TEMP TABLE g611_new(id uuid) ON COMMIT DROP;
    GRANT SELECT,INSERT ON g611_new TO authenticated;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    INSERT INTO g611_new SELECT goals.goal_restart('${goal}',CURRENT_DATE,CURRENT_DATE+60);
    SELECT goals.goal_archive('${goal}');
    SELECT json_build_object(
      'listed',(SELECT count(*) FROM goals.goal_list_at('${user}',CURRENT_DATE)
        WHERE goal_id='${goal}'),
      'history',(SELECT count(*) FROM goals.goal_phases WHERE goal_id='${goal}'),
      'newStatus',(SELECT status FROM goals.user_goals WHERE id=(SELECT id FROM g611_new)),
      'newPlan',(SELECT status FROM goals.goal_programs
        WHERE goal_id=(SELECT id FROM g611_new)),
      'newPositions',(SELECT count(*) FROM goals.goal_program_positions p
        JOIN goals.goal_programs plan ON plan.id=p.program_id
        WHERE plan.goal_id=(SELECT id FROM g611_new)));
    ROLLBACK;
  `).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.equal(result.listed, 0)
  assert.ok(result.history > 0)
  assert.equal(result.newStatus, 'on_hold')
  assert.equal(result.newPlan, 'entwurf')
  assert.equal(result.newPositions, 1)
})
