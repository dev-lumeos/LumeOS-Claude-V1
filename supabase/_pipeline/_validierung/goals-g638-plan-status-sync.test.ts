import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-638 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'
const cut = '30000000-0000-0000-0000-000000000901'
const bulk = '30000000-0000-0000-0000-000000000902'
const strength = '30000000-0000-0000-0000-000000000102'
const tom = '10000000-0000-0000-0000-000000000101'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

function json(query: string): Record<string, unknown> {
  return JSON.parse(sql(query).split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
}

test('G-638: Pausieren, Fortsetzen und erneutes Pausieren synchronisieren beide Pläne', () => {
  const result = json(`
    BEGIN;
    UPDATE goals.user_goals SET status='on_hold' WHERE id='${cut}';
    UPDATE goals.user_goals SET status='active' WHERE id='${bulk}';
    CREATE TEMP TABLE g638_seen(step text,cut_status text,bulk_status text);
    INSERT INTO g638_seen SELECT 'bulk_aktiv',
      (SELECT status FROM goals.goal_programs WHERE goal_id='${cut}'),
      (SELECT status FROM goals.goal_programs WHERE goal_id='${bulk}');
    UPDATE goals.user_goals SET status='on_hold' WHERE id='${bulk}';
    UPDATE goals.user_goals SET status='active' WHERE id='${cut}';
    SELECT json_build_object(
      'first',(SELECT json_build_object('cut',cut_status,'bulk',bulk_status)
        FROM g638_seen),
      'second',(SELECT json_build_object('cut',
        (SELECT status FROM goals.goal_programs WHERE goal_id='${cut}'),
        'bulk',(SELECT status FROM goals.goal_programs WHERE goal_id='${bulk}'))),
      'oneActive',(SELECT count(*) FROM goals.goal_programs
        WHERE user_id='${user}' AND status='aktiv'));
    ROLLBACK;
  `)
  assert.deepEqual(result.first, { cut: 'pausiert', bulk: 'aktiv' })
  assert.deepEqual(result.second, { cut: 'aktiv', bulk: 'pausiert' })
  assert.equal(result.oneActive, 1)
})

test('G-638: anderer aktiver Plan liefert eigenes Präfix und ganzen Satz', () => {
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='active' WHERE id='${bulk}';
    ROLLBACK;
  `), /G638_BLOCK:anderer_aktiver_plan: Ein anderer Plan dieses Nutzers ist bereits aktiv\./)
})

test('G-638: auch paused wird beim Fortsetzen wieder aktiv', () => {
  const result = json(`
    BEGIN;
    UPDATE goals.user_goals SET status='paused' WHERE id='${cut}';
    CREATE TEMP TABLE g638_paused(status text);
    INSERT INTO g638_paused SELECT status FROM goals.goal_programs
      WHERE goal_id='${cut}';
    UPDATE goals.user_goals SET status='active' WHERE id='${cut}';
    SELECT json_build_object('during',(SELECT status FROM g638_paused),
      'after',(SELECT status FROM goals.goal_programs WHERE goal_id='${cut}'));
    ROLLBACK;
  `)
  assert.equal(result.during, 'pausiert')
  assert.equal(result.after, 'aktiv')
})

test('G-638: erreicht, verfehlt und beendet schließen auch einen pausierten Plan', () => {
  for (const status of ['achieved', 'missed', 'abandoned']) {
    const result = json(`
      BEGIN;
      UPDATE goals.user_goals SET status='on_hold' WHERE id='${cut}';
      UPDATE goals.user_goals SET status='${status}' WHERE id='${cut}';
      SELECT json_build_object('goal',(SELECT status FROM goals.user_goals
        WHERE id='${cut}'),'plan',(SELECT status FROM goals.goal_programs
        WHERE goal_id='${cut}'));
      ROLLBACK;
    `)
    assert.equal(result.goal, status)
    assert.equal(result.plan, 'abgeschlossen')
  }
})

test('G-638/G-611: eingefrorenes oder archiviertes Ziel aktiviert keinen Plan', () => {
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='on_hold' WHERE id='${strength}';
    INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
    VALUES ('${strength}','${tom}','Abgelaufener Plan','pausiert');
    UPDATE goals.user_goals SET status='active' WHERE id='${strength}';
    ROLLBACK;
  `), /G638_BLOCK:ziel_eingefroren_oder_archiviert:/)
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${cut}';
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SELECT goals.goal_archive('${cut}');
    UPDATE goals.user_goals SET status='active' WHERE id='${cut}';
    ROLLBACK;
  `), /G638_BLOCK:ziel_eingefroren_oder_archiviert:/)
  assert.throws(() => sql(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved' WHERE id='${cut}';
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SELECT goals.goal_archive('${cut}');
    UPDATE goals.user_goals SET status='on_hold' WHERE id='${cut}';
    UPDATE goals.user_goals SET status='active' WHERE id='${cut}';
    ROLLBACK;
  `), /G638_BLOCK:ziel_eingefroren_oder_archiviert:/)
})

test('G-638/G-611: Neustart lässt den neuen Plan im Entwurf', () => {
  const result = json(`
    BEGIN;
    UPDATE goals.user_goals SET status='achieved'
      WHERE id='30000000-0000-0000-0000-000000000101';
    SELECT set_config('request.jwt.claim.sub','${tom}',true);
    CREATE TEMP TABLE g638_new(id uuid) ON COMMIT DROP;
    INSERT INTO g638_new SELECT goals.goal_restart(
      '30000000-0000-0000-0000-000000000101',CURRENT_DATE,CURRENT_DATE+60);
    SELECT json_build_object('goal',(SELECT status FROM goals.user_goals
      WHERE id=(SELECT id FROM g638_new)),
      'plan',(SELECT status FROM goals.goal_programs
      WHERE goal_id=(SELECT id FROM g638_new)));
    ROLLBACK;
  `)
  assert.equal(result.goal, 'on_hold')
  assert.equal(result.plan, 'entwurf')
})
