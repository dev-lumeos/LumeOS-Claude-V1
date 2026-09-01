// C-381/G-151: Bestaetigungen laufen ausschliesslich ueber den atomaren
// Ausfuehrer. Der Test legt nur transaktionale Probedaten an und rollt sie
// vollstaendig zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const CLIENT_ID = '10000000-0000-0000-0000-000000000101'
const FOREIGN_CLIENT_ID = 'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'
const COACH_ID = '10000000-0000-0000-0000-000000000901'
const VALID_ACTION_ID = 'c3810000-0000-0000-0000-000000000001'
const EXPIRED_ACTION_ID = 'c3810000-0000-0000-0000-000000000002'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

function counts(): { pending: number; logged: number } {
  return one(`
    SELECT json_build_object(
      'pending', count(*) FILTER (WHERE pa.id IN ('${VALID_ACTION_ID}'::uuid, '${EXPIRED_ACTION_ID}'::uuid)),
      'logged', count(*) FILTER (WHERE pending_action_id IN ('${VALID_ACTION_ID}'::uuid, '${EXPIRED_ACTION_ID}'::uuid))
    )
    FROM coach.pending_actions pa
    LEFT JOIN coach.action_log al ON al.pending_action_id = pa.id;
  `)
}

test('C-381/G-151: nur der angemeldete Klient kann eine gueltige Aktion atomar ausfuehren', () => {
  const before = counts()
  const result = one<{
    functionExists: boolean
    pendingUpdate: boolean
    actionLogWrite: boolean
    foreignRejected: boolean
    expiredRejected: boolean
    directUpdateRejected: boolean
    proteinBefore: number
    proteinAfter: number
    status: string
    confirmedBy: string
    logCount: number
    loggedBy: string
    targetRowsToday: number
  }>(`
    BEGIN;
    CREATE TEMP TABLE c381_result (
      foreign_rejected boolean NOT NULL DEFAULT false,
      expired_rejected boolean NOT NULL DEFAULT false,
      direct_update_rejected boolean NOT NULL DEFAULT false
    );
    INSERT INTO c381_result DEFAULT VALUES;
    GRANT SELECT, UPDATE ON c381_result TO authenticated;

    INSERT INTO coach.pending_actions (
      id, coach_id, client_id, module, action_type, preview, payload, expires_at, created_by
    ) VALUES
      ('${VALID_ACTION_ID}'::uuid, '${COACH_ID}'::uuid, '${CLIENT_ID}'::uuid,
       'nutrition', 'adjust_macro_targets', '{}'::jsonb,
       '{"protein_g_delta": 10, "reason": "C-381 transaktionaler Nachweis"}'::jsonb,
       now() + interval '1 hour', '${COACH_ID}'::uuid),
      ('${EXPIRED_ACTION_ID}'::uuid, '${COACH_ID}'::uuid, '${CLIENT_ID}'::uuid,
       'nutrition', 'adjust_macro_targets', '{}'::jsonb,
       '{"protein_g_delta": 10, "reason": "C-381 Ablaufnachweis"}'::jsonb,
       now() - interval '1 second', '${COACH_ID}'::uuid);

    SET LOCAL ROLE authenticated;
    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${FOREIGN_CLIENT_ID}', true); END $$;
    DO $$
    BEGIN
      BEGIN
        PERFORM coach.bestaetige_aktion('${VALID_ACTION_ID}'::uuid);
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c381_result SET foreign_rejected = true;
      END;
    END $$;

    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${CLIENT_ID}', true); END $$;
    DO $$
    BEGIN
      BEGIN
        PERFORM coach.bestaetige_aktion('${EXPIRED_ACTION_ID}'::uuid);
      EXCEPTION WHEN raise_exception THEN
        UPDATE c381_result SET expired_rejected = true;
      END;
      BEGIN
        UPDATE coach.pending_actions SET status = 'cancelled' WHERE id = '${VALID_ACTION_ID}'::uuid;
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c381_result SET direct_update_rejected = true;
      END;
    END $$;

    CREATE TEMP TABLE c381_target_before AS
      SELECT protein_g FROM goals.zielwerte_am('${CLIENT_ID}'::uuid, current_date);
    DO $$ BEGIN PERFORM coach.bestaetige_aktion('${VALID_ACTION_ID}'::uuid); END $$;

    SELECT json_build_object(
      'functionExists', to_regprocedure('coach.bestaetige_aktion(uuid)') IS NOT NULL,
      'pendingUpdate', has_table_privilege('authenticated', 'coach.pending_actions', 'update'),
      'actionLogWrite', has_table_privilege('authenticated', 'coach.action_log', 'insert')
        OR has_table_privilege('authenticated', 'coach.action_log', 'update'),
      'foreignRejected', (SELECT foreign_rejected FROM c381_result),
      'expiredRejected', (SELECT expired_rejected FROM c381_result),
      'directUpdateRejected', (SELECT direct_update_rejected FROM c381_result),
      'proteinBefore', (SELECT protein_g FROM c381_target_before),
      'proteinAfter', (SELECT protein_g FROM goals.zielwerte_am('${CLIENT_ID}'::uuid, current_date)),
      'status', (SELECT status FROM coach.pending_actions WHERE id = '${VALID_ACTION_ID}'::uuid),
      'confirmedBy', (SELECT confirmed_by::text FROM coach.pending_actions WHERE id = '${VALID_ACTION_ID}'::uuid),
      'logCount', (SELECT count(*) FROM coach.action_log WHERE pending_action_id = '${VALID_ACTION_ID}'::uuid),
      'loggedBy', (SELECT executed_by::text FROM coach.action_log WHERE pending_action_id = '${VALID_ACTION_ID}'::uuid),
      'targetRowsToday', (SELECT count(*) FROM goals.nutrition_targets
                           WHERE user_id = '${CLIENT_ID}'::uuid AND gueltig_ab = current_date)
    );
    ROLLBACK;
  `)
  const after = counts()

  assert.equal(result.functionExists, true)
  assert.equal(result.pendingUpdate, false)
  assert.equal(result.actionLogWrite, false)
  assert.equal(result.foreignRejected, true)
  assert.equal(result.expiredRejected, true)
  assert.equal(result.directUpdateRejected, true)
  assert.equal(result.proteinAfter, result.proteinBefore + 10)
  assert.equal(result.status, 'confirmed')
  assert.equal(result.confirmedBy, CLIENT_ID)
  assert.equal(result.logCount, 1)
  assert.equal(result.loggedBy, CLIENT_ID)
  assert.equal(result.targetRowsToday, 1)
  assert.deepEqual(after, before)
})
