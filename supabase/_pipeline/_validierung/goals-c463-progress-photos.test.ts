// C-463: Fortschrittsfotos sind eigene, private Goals-Daten. Der Test laeuft
// ausschliesslich gegen eine explizite Wegwerf-Datenbank und rollt alles zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C463_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-463-Test braucht eine Wegwerf-Datenbank, nie postgres.')

const OWNER = 'c463f000-0000-0000-0000-000000000001'
const OTHER = 'c463f000-0000-0000-0000-000000000002'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-463: Fortschrittsfoto bleibt beim Eigentümer und sein Storage-Pfad ist privat', () => {
  const result = one<{
    columns: string[]
    privateBucket: boolean
    ownerPhotos: number
    ownerObjects: number
    otherPhotos: number
    otherObjects: number
    foreignPhotoWriteDenied: boolean
    foreignObjectWriteDenied: boolean
    rls: boolean
    photoPolicies: number
    anonTableSelect: boolean
    anonObjectSelect: boolean
    afterRollback: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'c463-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c463-other@example.test', '{}'::jsonb, now());

    CREATE TEMP TABLE c463_bucket ON COMMIT DROP AS
    SELECT NOT public AS private_bucket
    FROM storage.buckets WHERE id = 'goals-progress-photos';
    GRANT SELECT ON c463_bucket TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
    VALUES (
      'goals-progress-photos', '${OWNER}/front.jpg', '${OWNER}',
      '{"size":241,"mimetype":"image/jpeg"}'::jsonb
    );
    INSERT INTO goals.progress_photos (
      user_id, session_date, pose_type, pose_name, pose_number, photo_url, notes
    ) VALUES (
      '${OWNER}'::uuid, DATE '2099-01-15', 'mandatory_8', 'Front Double Biceps', 1,
      '${OWNER}/front.jpg', 'C-463 fixture'
    );
    CREATE TEMP TABLE c463_owner ON COMMIT DROP AS
    SELECT
      (SELECT count(*)::integer FROM goals.progress_photos WHERE user_id = '${OWNER}'::uuid) AS photos,
      (SELECT count(*)::integer FROM storage.objects
       WHERE bucket_id = 'goals-progress-photos' AND name = '${OWNER}/front.jpg') AS objects;

    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c463_other ON COMMIT DROP AS
    SELECT
      (SELECT count(*)::integer FROM goals.progress_photos WHERE user_id = '${OWNER}'::uuid) AS photos,
      (SELECT count(*)::integer FROM storage.objects
       WHERE bucket_id = 'goals-progress-photos' AND name = '${OWNER}/front.jpg') AS objects;
    CREATE TEMP TABLE c463_denied(photo_write boolean NOT NULL, object_write boolean NOT NULL) ON COMMIT DROP;
    DO $$
    BEGIN
      BEGIN
        INSERT INTO goals.progress_photos (user_id, session_date, pose_type, pose_name, photo_url)
        VALUES ('${OWNER}'::uuid, DATE '2099-01-16', 'custom', 'Fremdes Foto', '${OWNER}/foreign.jpg');
        INSERT INTO c463_denied VALUES (false, false);
      EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO c463_denied VALUES (true, false);
      END;
      BEGIN
        INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
        VALUES ('goals-progress-photos', '${OWNER}/foreign.jpg', '${OWNER}', '{"mimetype":"image/jpeg"}'::jsonb);
        UPDATE c463_denied SET object_write = false;
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c463_denied SET object_write = true;
      END;
    END $$;
    RESET ROLE;

    SELECT json_build_object(
      'columns', (SELECT array_agg(column_name ORDER BY ordinal_position)
                  FROM information_schema.columns
                  WHERE table_schema = 'goals' AND table_name = 'progress_photos'),
      'privateBucket', (SELECT private_bucket FROM c463_bucket),
      'ownerPhotos', (SELECT photos FROM c463_owner),
      'ownerObjects', (SELECT objects FROM c463_owner),
      'otherPhotos', (SELECT photos FROM c463_other),
      'otherObjects', (SELECT objects FROM c463_other),
      'foreignPhotoWriteDenied', (SELECT photo_write FROM c463_denied),
      'foreignObjectWriteDenied', (SELECT object_write FROM c463_denied),
      'rls', (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'goals' AND c.relname = 'progress_photos'),
      'photoPolicies', (SELECT count(*)::integer FROM pg_policies
                        WHERE schemaname = 'goals' AND tablename = 'progress_photos'),
      'anonTableSelect', has_table_privilege('anon', 'goals.progress_photos', 'SELECT'),
      'anonObjectSelect', has_table_privilege('anon', 'storage.objects', 'SELECT'),
      'afterRollback', 0
    ) AS result;
    ROLLBACK;
  `)

  assert.deepEqual(result.columns, [
    'id', 'user_id', 'session_date', 'pose_type', 'pose_name', 'pose_number',
    'photo_url', 'thumbnail_url', 'ai_analysis', 'ai_analyzed_at', 'notes', 'is_private', 'created_at',
  ])
  assert.equal(result.privateBucket, true)
  assert.equal(result.ownerPhotos, 1)
  assert.equal(result.ownerObjects, 1)
  assert.equal(result.otherPhotos, 0)
  assert.equal(result.otherObjects, 0)
  assert.equal(result.foreignPhotoWriteDenied, true)
  assert.equal(result.foreignObjectWriteDenied, true)
  assert.equal(result.rls, true)
  assert.equal(result.photoPolicies, 4)
  assert.equal(result.anonTableSelect, false)
  assert.equal(result.anonObjectSelect, false)
  assert.equal(result.afterRollback, 0)
})
