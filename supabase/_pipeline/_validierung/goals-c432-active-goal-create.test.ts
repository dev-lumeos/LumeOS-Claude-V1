// C-432: Ein neues aktives Ziel bekommt seinen Platz atomar in der Datenbank.
// Dieser Test laeuft ausschliesslich gegen eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-432-Test braucht eine Wegwerf-Datenbank, nie postgres.')

const OWNER = 'c432f000-0000-0000-0000-000000000001'
const OTHER = 'c432f000-0000-0000-0000-000000000002'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function asUser(userId: string, sql: string): string {
  return `BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${userId}', true); ${sql}; COMMIT;`
}

function createSql(title: string): string {
  return `SELECT goals.active_goal_create('health', '${title}', DATE '2099-01-15') AS result`
}

function concurrentCreate(userId: string, title: string): Promise<unknown> {
  const sql = asUser(userId, createSql(title))
  return new Promise((resolve, reject) => {
    const child = spawn('docker', [
      'exec', '-i', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
      '-t', '-A', '-c', sql,
    ], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += String(chunk) })
    child.stderr.on('data', chunk => { stderr += String(chunk) })
    child.on('error', reject)
    child.on('close', code => {
      if (code !== 0) reject(new Error(stderr))
      else resolve(JSON.parse(stdout.trim().split(/\r?\n/).at(-1) ?? 'null'))
    })
  })
}

test('C-432: Freiplatzsuche, Vollbelegung, Primary und Owner-RLS', async () => {
  one(`
    DELETE FROM goals.user_goals
    WHERE user_id IN ('${OWNER}'::uuid, '${OTHER}'::uuid, 'c432f000-0000-0000-0000-000000000003'::uuid);
    DELETE FROM auth.users
    WHERE id IN ('${OWNER}'::uuid, '${OTHER}'::uuid, 'c432f000-0000-0000-0000-000000000003'::uuid);
    SELECT json_build_object('clean', true);
  `)
  const setup = one<{ policyCount: number }>(`
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'c432-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c432-other@example.test', '{}'::jsonb, now());
    SELECT json_build_object(
      'policyCount', (SELECT count(*)::integer FROM pg_policies
                      WHERE schemaname = 'goals' AND tablename = 'user_goals')
    );
  `)
  assert.ok(setup.policyCount >= 4)

  const first = one<{ ok: boolean; goal: { priority: number } }>(asUser(OWNER, createSql('C432 erster Platz')))
  assert.equal(first.ok, true)
  assert.equal(first.goal.priority, 1)

  const second = one<{ ok: boolean; goal: { priority: number } }>(asUser(OWNER, createSql('C432 zweiter Platz')))
  const third = one<{ ok: boolean; goal: { priority: number } }>(asUser(OWNER, createSql('C432 dritter Platz')))
  assert.deepEqual([second.goal.priority, third.goal.priority], [2, 3])

  const full = one<{
    ok: boolean
    code: string
    message: string
    active_goals: Array<{ title: string; priority: number }>
  }>(asUser(OWNER, createSql('C432 vierter Platz')))
  assert.equal(full.ok, false)
  assert.equal(full.code, 'ACTIVE_SLOTS_FULL')
  assert.equal(full.message, 'Drei aktive Ziele belegen die Plaetze 1-3. Waehle ein Ziel zum Pausieren, Abschliessen oder Umpriorisieren.')
  assert.deepEqual(full.active_goals.map(goal => goal.priority), [1, 2, 3])
  assert.deepEqual(full.active_goals.map(goal => goal.title), [
    'C432 erster Platz', 'C432 zweiter Platz', 'C432 dritter Platz',
  ])

  const primary = one<{ secondPrimaryState: string; activePrimaryAfterPause: number; pausedStillPrimary: boolean }>(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    UPDATE goals.user_goals SET is_primary = true
    WHERE user_id = '${OWNER}'::uuid AND title = 'C432 erster Platz';
    CREATE TEMP TABLE c432_primary_result(state text NOT NULL) ON COMMIT DROP;
    DO $$
    BEGIN
      BEGIN
        UPDATE goals.user_goals SET is_primary = true
        WHERE user_id = '${OWNER}'::uuid AND title = 'C432 zweiter Platz';
        INSERT INTO c432_primary_result VALUES ('unexpected_success');
      EXCEPTION WHEN unique_violation THEN
        INSERT INTO c432_primary_result VALUES (SQLSTATE);
      END;
    END $$;
    UPDATE goals.user_goals SET status = 'paused'
    WHERE user_id = '${OWNER}'::uuid AND title = 'C432 erster Platz';
    SELECT json_build_object(
      'secondPrimaryState', (SELECT state FROM c432_primary_result),
      'activePrimaryAfterPause', (SELECT count(*)::integer FROM goals.user_goals
        WHERE user_id = '${OWNER}'::uuid AND status = 'active' AND is_primary),
      'pausedStillPrimary', (SELECT is_primary FROM goals.user_goals
        WHERE user_id = '${OWNER}'::uuid AND title = 'C432 erster Platz')
    );
    COMMIT;
  `)
  assert.equal(primary.secondPrimaryState, '23505')
  assert.equal(primary.activePrimaryAfterPause, 0)
  assert.equal(primary.pausedStillPrimary, true)

  const foreign = one<{ visible: number; writeDenied: boolean; policyCount: number }>(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c432_foreign_result(write_denied boolean NOT NULL) ON COMMIT DROP;
    DO $$
    BEGIN
      BEGIN
        INSERT INTO goals.user_goals (user_id, goal_type, title, gueltig_ab, priority)
        VALUES ('${OWNER}'::uuid, 'health', 'C432 fremd', DATE '2099-01-15', 1);
        INSERT INTO c432_foreign_result VALUES (false);
      EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO c432_foreign_result VALUES (true);
      END;
    END $$;
    SELECT json_build_object(
      'visible', (SELECT count(*)::integer FROM goals.user_goals WHERE user_id = '${OWNER}'::uuid),
      'writeDenied', (SELECT write_denied FROM c432_foreign_result),
      'policyCount', (SELECT count(*)::integer FROM pg_policies
                      WHERE schemaname = 'goals' AND tablename = 'user_goals')
    );
    COMMIT;
  `)
  assert.equal(foreign.visible, 0)
  assert.equal(foreign.writeDenied, true)
  assert.equal(foreign.policyCount, setup.policyCount)

  // Zwei Sitzungen teilen sich denselben Nutzer-Lock: beide bekommen einen
  // anderen freien Slot statt mit uq_user_goals_active_slot zu kollidieren.
  const parallelOwner = 'c432f000-0000-0000-0000-000000000003'
  one(`INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
       VALUES ('${parallelOwner}'::uuid, 'c432-parallel@example.test', '{}'::jsonb, now());
       SELECT json_build_object('created', true);`)
  const [parallelOne, parallelTwo] = await Promise.all([
    concurrentCreate(parallelOwner, 'C432 parallel eins'),
    concurrentCreate(parallelOwner, 'C432 parallel zwei'),
  ]) as Array<{ ok: boolean; goal: { priority: number } }>
  assert.deepEqual([parallelOne.goal.priority, parallelTwo.goal.priority].sort(), [1, 2])
})
