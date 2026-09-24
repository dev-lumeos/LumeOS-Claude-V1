// C-538: MealCam speichert ein privates Bild, das rohe Visionsergebnis und
// die erklaerte Katalogportion. Der Test braucht eine Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C538_DATABASE
if (!db || db === 'postgres') {
  throw new Error('C-538 braucht LUMEOS_C538_DATABASE als Wegwerf-Datenbank.')
}

const OWNER = 'c5380000-0000-0000-0000-000000000001'
const OTHER = 'c5380000-0000-0000-0000-000000000002'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-538: ein MealCam-Scan bleibt privat und speichert nur Bild, Rohresultat und Deklaration', () => {
  const result = one<{
    columns: string[]
    privateBucket: boolean
    ownerScans: number
    ownerObjects: number
    otherScans: number
    otherObjects: number
    foreignScanWriteDenied: boolean
    foreignObjectWriteDenied: boolean
    fuzzySameDish: number
    fuzzyDifferentDish: number
    rawVisionOnly: boolean
    rls: boolean
    scanPolicies: number
    storagePolicies: number
    anonTableSelect: boolean
    anonStorageSelect: boolean
    objectSurvivesMetadataDeletion: number
    deletedByOwner: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'c538-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c538-other@example.test', '{}'::jsonb, now());

    CREATE TEMP TABLE c538_food ON COMMIT DROP AS
    SELECT id FROM nutrition.foods ORDER BY id LIMIT 1;
    GRANT SELECT ON c538_food TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
    VALUES (
      'nutrition-mealcam-images', '${OWNER}/scan-001.jpg', '${OWNER}',
      '{"size":241,"mimetype":"image/jpeg"}'::jsonb
    );
    INSERT INTO nutrition.mealcam_scans (
      user_id, image_path, image_sha256, vision_result, food_id, food_name_snapshot,
      portion_amount, portion_unit
    )
    SELECT
      '${OWNER}'::uuid,
      '${OWNER}/scan-001.jpg',
      repeat('a', 64),
      '{"provider":"fixture","labels":["chicken"]}'::jsonb,
      id,
      'Haehnchenbrust gegrillt',
      180,
      'g'
    FROM c538_food;
    CREATE TEMP TABLE c538_owner ON COMMIT DROP AS
    SELECT
      (SELECT count(*)::integer FROM nutrition.mealcam_scans WHERE user_id = '${OWNER}'::uuid) AS scans,
      (SELECT count(*)::integer FROM storage.objects
       WHERE bucket_id = 'nutrition-mealcam-images' AND name = '${OWNER}/scan-001.jpg') AS objects,
      (SELECT nutrition.mealcam_scan_declaration_similarity(id, 'gegrillte Huehnerbrust')
       FROM nutrition.mealcam_scans WHERE user_id = '${OWNER}'::uuid) AS fuzzy_same,
      (SELECT nutrition.mealcam_scan_declaration_similarity(id, 'Vollmilch frisch')
       FROM nutrition.mealcam_scans WHERE user_id = '${OWNER}'::uuid) AS fuzzy_different;

    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c538_other ON COMMIT DROP AS
    SELECT
      (SELECT count(*)::integer FROM nutrition.mealcam_scans WHERE user_id = '${OWNER}'::uuid) AS scans,
      (SELECT count(*)::integer FROM storage.objects
       WHERE bucket_id = 'nutrition-mealcam-images' AND name = '${OWNER}/scan-001.jpg') AS objects;
    CREATE TEMP TABLE c538_denied(scan_write boolean NOT NULL, object_write boolean NOT NULL) ON COMMIT DROP;
    DO $$
    BEGIN
      BEGIN
        INSERT INTO nutrition.mealcam_scans (
          user_id, image_path, image_sha256, vision_result, food_id, food_name_snapshot,
          portion_amount, portion_unit
        )
        SELECT '${OWNER}'::uuid, '${OWNER}/foreign.jpg', repeat('b', 64), '{}'::jsonb,
               id, 'Fremde Deklaration', 1, 'g'
        FROM c538_food;
        INSERT INTO c538_denied VALUES (false, false);
      EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO c538_denied VALUES (true, false);
      END;
      BEGIN
        INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
        VALUES ('nutrition-mealcam-images', '${OWNER}/foreign.jpg', '${OWNER}',
                '{"mimetype":"image/jpeg"}'::jsonb);
        UPDATE c538_denied SET object_write = false;
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c538_denied SET object_write = true;
      END;
    END $$;

    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    DELETE FROM nutrition.mealcam_scans WHERE user_id = '${OWNER}'::uuid;
    CREATE TEMP TABLE c538_delete ON COMMIT DROP AS
    SELECT
      (SELECT count(*)::integer FROM storage.objects
       WHERE bucket_id = 'nutrition-mealcam-images' AND name = '${OWNER}/scan-001.jpg') AS object_after_metadata_delete;
    DELETE FROM storage.objects
    WHERE bucket_id = 'nutrition-mealcam-images' AND name = '${OWNER}/scan-001.jpg';
    RESET ROLE;

    SELECT json_build_object(
      'columns', (SELECT array_agg(column_name ORDER BY ordinal_position)
                  FROM information_schema.columns
                  WHERE table_schema = 'nutrition' AND table_name = 'mealcam_scans'),
      'privateBucket', (SELECT NOT public FROM storage.buckets WHERE id = 'nutrition-mealcam-images'),
      'ownerScans', (SELECT scans FROM c538_owner),
      'ownerObjects', (SELECT objects FROM c538_owner),
      'otherScans', (SELECT scans FROM c538_other),
      'otherObjects', (SELECT objects FROM c538_other),
      'foreignScanWriteDenied', (SELECT scan_write FROM c538_denied),
      'foreignObjectWriteDenied', (SELECT object_write FROM c538_denied),
      'fuzzySameDish', (SELECT fuzzy_same FROM c538_owner),
      'fuzzyDifferentDish', (SELECT fuzzy_different FROM c538_owner),
      'rawVisionOnly', NOT EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'nutrition' AND p.proname LIKE 'mealcam%'
          AND pg_get_functiondef(p.oid) ~* '(order by|suggest|learn|from[[:space:]]+nutrition\\.foods)'
      ),
      'rls', (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = 'nutrition' AND c.relname = 'mealcam_scans'),
      'scanPolicies', (SELECT count(*)::integer FROM pg_policies
                       WHERE schemaname = 'nutrition' AND tablename = 'mealcam_scans'),
      'storagePolicies', (SELECT count(*)::integer FROM pg_policies
                          WHERE schemaname = 'storage' AND tablename = 'objects'
                            AND policyname LIKE 'nutrition_mealcam_images_%'),
      'anonTableSelect', has_table_privilege('anon', 'nutrition.mealcam_scans', 'SELECT'),
      'anonStorageSelect', has_table_privilege('anon', 'storage.objects', 'SELECT'),
      'objectSurvivesMetadataDeletion', (SELECT object_after_metadata_delete FROM c538_delete),
      'deletedByOwner', NOT EXISTS (
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'nutrition-mealcam-images' AND name = '${OWNER}/scan-001.jpg'
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.columns, [
    'id', 'user_id', 'image_path', 'image_sha256', 'vision_result', 'food_id',
    'food_name_snapshot', 'portion_amount', 'portion_unit', 'created_at', 'updated_at',
  ])
  assert.equal(result.privateBucket, true)
  assert.equal(result.ownerScans, 1)
  assert.equal(result.ownerObjects, 1)
  assert.equal(result.otherScans, 0)
  assert.equal(result.otherObjects, 0)
  assert.equal(result.foreignScanWriteDenied, true)
  assert.equal(result.foreignObjectWriteDenied, true)
  assert.ok(result.fuzzySameDish >= 0.4)
  assert.ok(result.fuzzyDifferentDish < 0.4)
  assert.equal(result.rawVisionOnly, true)
  assert.equal(result.rls, true)
  assert.equal(result.scanPolicies, 4)
  assert.equal(result.storagePolicies, 4)
  assert.equal(result.anonTableSelect, false)
  assert.equal(result.anonStorageSelect, false)
  assert.equal(result.objectSurvivesMetadataDeletion, 1)
  assert.equal(result.deletedByOwner, true)
})
