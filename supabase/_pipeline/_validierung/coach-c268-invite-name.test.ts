// C-268: Eine Einladung traegt den aus dem Coach-Profil genommenen Namen.
// Alle Daten bleiben innerhalb der Testtransaktion.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const CLIENT_ID = 'c2680000-0000-0000-0000-000000000001'
const COACH_ID = 'c2680000-0000-0000-0000-000000000002'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-268: Invite-Zeile speichert den Coach-Namen aus coach_profiles', () => {
  const result = one<{
    profileExists: boolean
    inviteFunction: boolean
    inviteCount: number
    coachName: string | null
    clientCanRead: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${CLIENT_ID}'::uuid, 'c268-client@example.test', '{}'::jsonb, now()),
      ('${COACH_ID}'::uuid, 'c268-coach@example.test', '{}'::jsonb, now());
    INSERT INTO coach.coach_profiles (user_id, display_name, email)
    VALUES ('${COACH_ID}'::uuid, 'Dr. Anna Keller', 'c268-coach@example.test');

    SET LOCAL ROLE authenticated;
    DO $$ BEGIN PERFORM set_config('request.jwt.claim.sub', '${CLIENT_ID}', true); END $$;
    CREATE TEMP TABLE c268_invite AS
      SELECT coach.create_relationship_invite(
        '${COACH_ID}'::uuid, 'C-268 Rollback-Einladung'
      ) AS relationship_id;

    SELECT json_build_object(
      'profileExists', to_regclass('coach.coach_profiles') IS NOT NULL,
      'inviteFunction', to_regprocedure('coach.create_relationship_invite(uuid,text)') IS NOT NULL,
      'inviteCount', (SELECT count(*) FROM c268_invite),
      'coachName', (SELECT coach_display_name FROM coach.relationships
                    WHERE id = (SELECT relationship_id FROM c268_invite)),
      'clientCanRead', exists(SELECT 1 FROM coach.relationships
                    WHERE id = (SELECT relationship_id FROM c268_invite))
    );
    ROLLBACK;
  `)

  assert.equal(result.profileExists, true)
  assert.equal(result.inviteFunction, true)
  assert.equal(result.inviteCount, 1)
  assert.equal(result.coachName, 'Dr. Anna Keller')
  assert.equal(result.clientCanRead, true)
})
