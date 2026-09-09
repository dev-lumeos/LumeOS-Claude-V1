// C-428: Unregistrierte E-Mail-Einladungen sind keine Beziehungen. Alle
// Nachweise laufen in einer einzigen ROLLBACK-Transaktion und hinterlassen
// weder Nutzer noch Einladungen in der expliziten Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C428_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-428-Test braucht LUMEOS_C428_DATABASE als explizite Wegwerf-Datenbank, nie postgres.')

const COACH = 'c4280000-0000-0000-0000-000000000001'
const FOREIGN_COACH = 'c4280000-0000-0000-0000-000000000002'
const CLIENT = 'c4280000-0000-0000-0000-000000000003'
const FAILED_CLIENT = 'c4280000-0000-0000-0000-000000000004'
const CLIENT_EMAIL = 'new.client@example.test'
const FAILED_EMAIL = 'failure.client@example.test'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-428: Hash-Invite wird atomar zu Beziehung, Rechten und Autonomy', () => {
  const result = sql<{
    tableExists: boolean
    functionsExist: boolean
    accountBeforeInvite: number
    pendingBefore: number
    pendingAfter: number
    normalizedEmail: boolean
    tokenOnlyHashed: boolean
    medicalDefaultNone: boolean
    foreignCanRead: number
    relationshipCreated: boolean
    permissionsCopied: boolean
    autonomyCopied: boolean
    tokenInvalidated: boolean
    failedAcceptance: boolean
    failedRelationshipCount: number
    failedInviteRemainsPending: boolean
    failedPermissionCount: number
    failedAutonomyCount: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${COACH}'::uuid, 'c428-coach@example.test', '{}'::jsonb, now()),
      ('${FOREIGN_COACH}'::uuid, 'c428-foreign@example.test', '{}'::jsonb, now());
    INSERT INTO coach.coach_profiles (user_id, display_name, email) VALUES
      ('${COACH}'::uuid, 'C428 Coach', 'c428-coach@example.test'),
      ('${FOREIGN_COACH}'::uuid, 'C428 Foreign', 'c428-foreign@example.test');
    CREATE TEMP TABLE c428_before AS
      SELECT count(*)::integer AS users
      FROM auth.users WHERE lower(email) = '${CLIENT_EMAIL}';
    CREATE TEMP TABLE c428_count_before AS
      SELECT count(*)::integer AS invites FROM coach.pending_invites;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${COACH}', true);
    CREATE TEMP TABLE c428_invite AS
      SELECT * FROM coach.create_pending_invite(
        '  New.Client@Example.Test  ', now() + interval '7 days'
      );
    CREATE TEMP TABLE c428_pre_accept AS
      SELECT
        pi.email_normalized = '${CLIENT_EMAIL}' AS normalized_email,
        pi.token_hash IS NOT NULL
          AND pi.token_hash <> ci.token
          AND length(pi.token_hash) = 64 AS token_only_hashed,
        pi.permission_draft->>'medical_visibility' = 'none' AS medical_default_none
      FROM coach.pending_invites pi
      JOIN c428_invite ci ON ci.invite_id = pi.id;

    SELECT set_config('request.jwt.claim.sub', '${FOREIGN_COACH}', true);
    CREATE TEMP TABLE c428_foreign AS
      SELECT count(*)::integer AS visible
      FROM coach.pending_invites
      WHERE id = (SELECT invite_id FROM c428_invite);
    RESET ROLE;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${CLIENT}'::uuid, '${CLIENT_EMAIL}', '{}'::jsonb, now());
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${CLIENT}', true);
    CREATE TEMP TABLE c428_accepted AS
      SELECT coach.accept_pending_invite((SELECT token FROM c428_invite)) AS relationship_id;
    RESET ROLE;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${COACH}', true);
    CREATE TEMP TABLE c428_failed_invite AS
      SELECT * FROM coach.create_pending_invite(
        '${FAILED_EMAIL}', now() + interval '7 days'
      );
    RESET ROLE;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${FAILED_CLIENT}'::uuid, '${FAILED_EMAIL}', '{}'::jsonb, now());
    -- Der vorhandene Permission-Datensatz erzwingt den Fehler erst NACH dem
    -- Beziehungs-INSERT. Dadurch beweist die Probe, dass die ganze Annahme
    -- inklusive Beziehung und Tokenstatus gemeinsam zurueckrollt.
    INSERT INTO coach.client_permissions (coach_id, client_id)
    VALUES ('${COACH}'::uuid, '${FAILED_CLIENT}'::uuid);
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${FAILED_CLIENT}', true);
    CREATE TEMP TABLE c428_failure AS
      SELECT false AS raised;
    DO \$\$
    BEGIN
      PERFORM coach.accept_pending_invite((SELECT token FROM c428_failed_invite));
      UPDATE c428_failure SET raised = false;
    EXCEPTION WHEN unique_violation THEN
      UPDATE c428_failure SET raised = true;
    END \$\$;
    RESET ROLE;

    SELECT json_build_object(
      'tableExists', to_regclass('coach.pending_invites') IS NOT NULL,
      'functionsExist', to_regprocedure('coach.create_pending_invite(text,timestamp with time zone,smallint)') IS NOT NULL
        AND to_regprocedure('coach.accept_pending_invite(text)') IS NOT NULL,
      'accountBeforeInvite', (SELECT users FROM c428_before),
      'pendingBefore', (SELECT invites FROM c428_count_before),
      'pendingAfter', (SELECT count(*)::integer FROM coach.pending_invites
                       WHERE id = (SELECT invite_id FROM c428_invite)),
      'normalizedEmail', (SELECT normalized_email FROM c428_pre_accept),
      'tokenOnlyHashed', (SELECT token_only_hashed FROM c428_pre_accept),
      'medicalDefaultNone', (SELECT medical_default_none FROM c428_pre_accept),
      'foreignCanRead', (SELECT visible FROM c428_foreign),
      'relationshipCreated', EXISTS (
        SELECT 1 FROM coach.relationships r JOIN c428_accepted a ON a.relationship_id = r.id
        WHERE r.coach_id = '${COACH}'::uuid AND r.client_id = '${CLIENT}'::uuid AND r.status = 'active'
      ),
      'permissionsCopied', EXISTS (
        SELECT 1 FROM coach.client_permissions p
        WHERE p.coach_id = '${COACH}'::uuid AND p.client_id = '${CLIENT}'::uuid
          AND p.nutrition_visibility = 'full' AND p.training_visibility = 'full'
          AND p.recovery_visibility = 'summary' AND p.goals_visibility = 'full'
          AND p.supplements_visibility = 'full' AND p.medical_visibility = 'none'
          AND p.buddy_visibility = 'summary' AND NOT p.medical_auto_apply
      ),
      'autonomyCopied', EXISTS (
        SELECT 1 FROM coach.client_autonomy a
        WHERE a.coach_id = '${COACH}'::uuid AND a.client_id = '${CLIENT}'::uuid
          AND a.nutrition_level = 2 AND a.training_level = 2 AND a.recovery_level = 2
          AND a.goals_level = 2 AND a.supplements_level = 2 AND a.medical_level = 2
          AND a.buddy_level = 2 AND a.safety_level = 1
      ),
      'tokenInvalidated', EXISTS (
        SELECT 1 FROM coach.pending_invites pi
        WHERE pi.id = (SELECT invite_id FROM c428_invite)
          AND pi.status = 'accepted' AND pi.token_hash IS NULL
          AND pi.accepted_by = '${CLIENT}'::uuid AND pi.accepted_at IS NOT NULL
          AND pi.accepted_relationship_id = (SELECT relationship_id FROM c428_accepted)
      ),
      'failedAcceptance', (SELECT raised FROM c428_failure),
      'failedRelationshipCount', (SELECT count(*)::integer FROM coach.relationships
        WHERE coach_id = '${COACH}'::uuid AND client_id = '${FAILED_CLIENT}'::uuid),
      'failedInviteRemainsPending', EXISTS (
        SELECT 1 FROM coach.pending_invites
        WHERE id = (SELECT invite_id FROM c428_failed_invite)
          AND status = 'pending' AND token_hash IS NOT NULL
      ),
      'failedPermissionCount', (SELECT count(*)::integer FROM coach.client_permissions
        WHERE coach_id = '${COACH}'::uuid AND client_id = '${FAILED_CLIENT}'::uuid),
      'failedAutonomyCount', (SELECT count(*)::integer FROM coach.client_autonomy
        WHERE coach_id = '${COACH}'::uuid AND client_id = '${FAILED_CLIENT}'::uuid)
    );
    ROLLBACK;
  `)

  assert.equal(result.tableExists, true)
  assert.equal(result.functionsExist, true)
  assert.equal(result.accountBeforeInvite, 0)
  assert.equal(result.pendingBefore, 0)
  assert.equal(result.pendingAfter, 1)
  assert.equal(result.normalizedEmail, true)
  assert.equal(result.tokenOnlyHashed, true)
  assert.equal(result.medicalDefaultNone, true)
  assert.equal(result.foreignCanRead, 0)
  assert.equal(result.relationshipCreated, true)
  assert.equal(result.permissionsCopied, true)
  assert.equal(result.autonomyCopied, true)
  assert.equal(result.tokenInvalidated, true)
  assert.equal(result.failedAcceptance, true)
  assert.equal(result.failedRelationshipCount, 0)
  assert.equal(result.failedInviteRemainsPending, true)
  assert.equal(result.failedPermissionCount, 1)
  assert.equal(result.failedAutonomyCount, 0)
})
