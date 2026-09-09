// C-440: Ein angemeldeter Nutzer legt sein Coach-Profil bewusst vor der
// ersten Einladung an. Die Probe verlangt eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C440_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-440-Test braucht LUMEOS_C440_DATABASE als Wegwerf-Datenbank, nie postgres.')

const COACH = 'c4400000-0000-0000-0000-000000000001'
const ACTIVE_CLIENT_A = 'c4400000-0000-0000-0000-000000000002'
const ACTIVE_CLIENT_B = 'c4400000-0000-0000-0000-000000000003'
const INVITED_CLIENT = 'c4400000-0000-0000-0000-000000000004'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-440: bewusstes Coach-Onboarding oeffnet erst danach den Invite-Weg', () => {
  const result = sql<{
    onboardingFunction: boolean
    profilesBefore: number
    profilesAfter: number
    profileBoundToCaller: boolean
    profileUsesAuthEmail: boolean
    pendingInviteCreated: boolean
    oneNamedOpenInvite: number
    twoHistoricalSnapshotsEmpty: number
    historicNameCounterprobeRejected: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${COACH}'::uuid, 'c440-coach@example.test', '{"provider":"email"}'::jsonb, now()),
      ('${ACTIVE_CLIENT_A}'::uuid, 'c440-client-a@example.test', '{"provider":"email"}'::jsonb, now()),
      ('${ACTIVE_CLIENT_B}'::uuid, 'c440-client-b@example.test', '{"provider":"email"}'::jsonb, now()),
      ('${INVITED_CLIENT}'::uuid, 'c440-client-invited@example.test', '{"provider":"email"}'::jsonb, now());
    CREATE TEMP TABLE c440_before AS
      SELECT count(*)::integer AS profiles
      FROM coach.coach_profiles
      WHERE user_id = '${COACH}'::uuid;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${COACH}', true);
    CREATE TEMP TABLE c440_profile AS
      SELECT (coach.onboard_coach('  C440 Coach  ')).*;
    RESET ROLE;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${COACH}', true);
    CREATE TEMP TABLE c440_invite AS
      SELECT * FROM coach.create_pending_invite('c440-client@example.test', now() + interval '7 days');
    RESET ROLE;

    INSERT INTO coach.relationships (
      coach_id, client_id, status, invited_by, coach_display_name, started_at
    ) VALUES
      ('${COACH}'::uuid, '${ACTIVE_CLIENT_A}'::uuid, 'active', '${COACH}'::uuid, NULL, now() - interval '120 days'),
      ('${COACH}'::uuid, '${ACTIVE_CLIENT_B}'::uuid, 'active', '${COACH}'::uuid, NULL, now() - interval '45 days'),
      ('${COACH}'::uuid, '${INVITED_CLIENT}'::uuid, 'invited', '${COACH}'::uuid, 'C440 Coach', NULL);

    CREATE TEMP TABLE c440_counterprobe AS SELECT false::boolean AS rejected;
    DO \$\$
    BEGIN
      UPDATE coach.relationships
      SET coach_display_name = 'erfundener historischer Name'
      WHERE coach_id = '${COACH}'::uuid
        AND status = 'active'
        AND started_at <= now() - interval '100 days';
      IF EXISTS (
        SELECT 1 FROM coach.relationships
        WHERE coach_id = '${COACH}'::uuid
          AND status = 'active'
          AND started_at IS NOT NULL
          AND coach_display_name IS NOT NULL
      ) THEN
        RAISE EXCEPTION 'C-440: historischer Seed-Snapshot ist nicht ehrlich leer';
      END IF;
    EXCEPTION WHEN raise_exception THEN
      UPDATE c440_counterprobe SET rejected = true;
    END \$\$;

    SELECT json_build_object(
      'onboardingFunction', to_regprocedure('coach.onboard_coach(text)') IS NOT NULL,
      'profilesBefore', (SELECT profiles FROM c440_before),
      'profilesAfter', (SELECT count(*)::integer FROM coach.coach_profiles WHERE user_id = '${COACH}'::uuid),
      'profileBoundToCaller', (SELECT user_id = '${COACH}'::uuid AND display_name = 'C440 Coach' FROM c440_profile),
      'profileUsesAuthEmail', (SELECT email = 'c440-coach@example.test' FROM c440_profile),
      'pendingInviteCreated', (SELECT count(*)::integer FROM c440_invite) = 1,
      'oneNamedOpenInvite', (SELECT count(*)::integer FROM coach.relationships WHERE coach_id = '${COACH}'::uuid AND status = 'invited' AND coach_display_name IS NOT NULL),
      'twoHistoricalSnapshotsEmpty', (SELECT count(*)::integer FROM coach.relationships WHERE coach_id = '${COACH}'::uuid AND status = 'active' AND started_at IS NOT NULL AND coach_display_name IS NULL),
      'historicNameCounterprobeRejected', (SELECT rejected FROM c440_counterprobe)
    );
    ROLLBACK;
  `)

  assert.equal(result.onboardingFunction, true)
  assert.equal(result.profilesBefore, 0)
  assert.equal(result.profilesAfter, 1)
  assert.equal(result.profileBoundToCaller, true)
  assert.equal(result.profileUsesAuthEmail, true)
  assert.equal(result.pendingInviteCreated, true)
  assert.equal(result.oneNamedOpenInvite, 1)
  assert.equal(result.twoHistoricalSnapshotsEmpty, 2)
  assert.equal(result.historicNameCounterprobeRejected, true)
})
