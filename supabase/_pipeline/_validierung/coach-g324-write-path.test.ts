// G-324/C-269: Alle Proben laufen in einer Transaktion und rollen zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const CLIENT_ID = '10000000-0000-0000-0000-000000000101'
const COACH_ID = '10000000-0000-0000-0000-000000000901'
const FOREIGN_ID = 'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'
const OUTSIDER_ID = 'b3240000-0000-0000-0000-000000000003'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('G-324/C-269: sicher ablehnen und Einladung als withdrawn protokollieren', () => {
  const result = one<{
    rejectFunction: boolean
    rejected: boolean
    clientCanReadPending: boolean
    outsiderCannotReadPending: boolean
    foreignCannotWithdraw: boolean
    coachCanReadRelationship: boolean
    outsiderCannotReadRelationship: boolean
    withdrawn: boolean
    logAdded: boolean
    coachCanReadLog: boolean
    outsiderCannotReadLog: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${CLIENT_ID}'::uuid, 'g324-client@example.test', '{"full_name":"G324 Client"}'::jsonb, now()),
      ('${COACH_ID}'::uuid, 'g324-coach@example.test', '{"full_name":"G324 Coach"}'::jsonb, now()),
      ('${FOREIGN_ID}'::uuid, 'g324-foreign@example.test', '{"full_name":"G324 Fremd"}'::jsonb, now()),
      ('${OUTSIDER_ID}'::uuid, 'g324-outsider@example.test', '{"full_name":"G324 Fremd"}'::jsonb, now());
    INSERT INTO coach.pending_actions (
      id, coach_id, client_id, module, action_type, preview, payload, expires_at, created_by
    ) VALUES (
      '03240000-0000-0000-0000-000000000001'::uuid, '${COACH_ID}'::uuid, '${CLIENT_ID}'::uuid,
      'nutrition', 'adjust_macro_targets', '{}'::jsonb, '{}'::jsonb, now() + interval '1 hour', '${COACH_ID}'::uuid
    );
    INSERT INTO coach.coach_profiles (user_id, display_name, email)
    VALUES ('${COACH_ID}'::uuid, 'G324 Coach', 'g324-coach@example.test');
    INSERT INTO coach.relationships (
      id, coach_id, client_id, status, invited_by, invite_note, coach_display_name
    ) VALUES (
      '03240000-0000-0000-0000-000000000002'::uuid, '${COACH_ID}'::uuid, '${FOREIGN_ID}'::uuid,
      'invited', '${COACH_ID}'::uuid, 'G-324 Rollback-Nachweis', 'G324 Coach'
    );

    SET LOCAL ROLE authenticated;
    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${CLIENT_ID}', true); END $$;
    CREATE TEMP TABLE g324_client AS
      SELECT exists(SELECT 1 FROM coach.pending_actions WHERE id = '03240000-0000-0000-0000-000000000001'::uuid) AS can_read_pending;
    CREATE TEMP TABLE g324_reject AS
      SELECT coach.lehne_aktion_ab('03240000-0000-0000-0000-000000000001'::uuid);

    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${FOREIGN_ID}', true); END $$;
    CREATE TEMP TABLE g324_foreign AS
      SELECT coach.withdraw_relationship_invite('03240000-0000-0000-0000-000000000002'::uuid, 'nicht mein Invite') AS changed;

    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${OUTSIDER_ID}', true); END $$;
    CREATE TEMP TABLE g324_outsider AS
      SELECT
        exists(SELECT 1 FROM coach.pending_actions WHERE id = '03240000-0000-0000-0000-000000000001'::uuid) AS can_read_pending,
        exists(SELECT 1 FROM coach.relationships WHERE id = '03240000-0000-0000-0000-000000000002'::uuid) AS can_read_relationship,
        exists(SELECT 1 FROM coach.relationship_change_log WHERE relationship_id = '03240000-0000-0000-0000-000000000002'::uuid) AS can_read_log;

    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${COACH_ID}', true); END $$;
    CREATE TEMP TABLE g324_coach AS
      SELECT exists(SELECT 1 FROM coach.relationships WHERE id = '03240000-0000-0000-0000-000000000002'::uuid) AS can_read_relationship;
    CREATE TEMP TABLE g324_log_before AS
      SELECT count(*) AS n FROM coach.relationship_change_log
      WHERE relationship_id = '03240000-0000-0000-0000-000000000002'::uuid;
    CREATE TEMP TABLE g324_withdraw AS
      SELECT coach.withdraw_relationship_invite('03240000-0000-0000-0000-000000000002'::uuid, 'Plan geaendert') AS changed;

    SELECT json_build_object(
      'rejectFunction', to_regprocedure('coach.lehne_aktion_ab(uuid)') IS NOT NULL,
      'rejected', (SELECT status = 'rejected' FROM coach.pending_actions WHERE id = '03240000-0000-0000-0000-000000000001'::uuid),
      'clientCanReadPending', (SELECT can_read_pending FROM g324_client),
      'outsiderCannotReadPending', NOT (SELECT can_read_pending FROM g324_outsider),
      'foreignCannotWithdraw', NOT (SELECT changed FROM g324_foreign),
      'coachCanReadRelationship', (SELECT can_read_relationship FROM g324_coach),
      'outsiderCannotReadRelationship', NOT (SELECT can_read_relationship FROM g324_outsider),
      'withdrawn', (SELECT changed FROM g324_withdraw)
        AND (SELECT status = 'withdrawn' AND withdrawn_by = '${COACH_ID}'::uuid AND withdrawn_at IS NOT NULL
             FROM coach.relationships WHERE id = '03240000-0000-0000-0000-000000000002'::uuid),
      'logAdded', (SELECT count(*) FROM coach.relationship_change_log WHERE relationship_id = '03240000-0000-0000-0000-000000000002'::uuid)
        = (SELECT n + 1 FROM g324_log_before),
      'coachCanReadLog', exists(SELECT 1 FROM coach.relationship_change_log WHERE relationship_id = '03240000-0000-0000-0000-000000000002'::uuid),
      'outsiderCannotReadLog', NOT (SELECT can_read_log FROM g324_outsider)
    );
    ROLLBACK;
  `)

  assert.equal(result.rejectFunction, true)
  assert.equal(result.rejected, true)
  assert.equal(result.clientCanReadPending, true)
  assert.equal(result.outsiderCannotReadPending, true)
  assert.equal(result.foreignCannotWithdraw, true)
  assert.equal(result.coachCanReadRelationship, true)
  assert.equal(result.outsiderCannotReadRelationship, true)
  assert.equal(result.withdrawn, true)
  assert.equal(result.logAdded, true)
  assert.equal(result.coachCanReadLog, true)
  assert.equal(result.outsiderCannotReadLog, true)
})
