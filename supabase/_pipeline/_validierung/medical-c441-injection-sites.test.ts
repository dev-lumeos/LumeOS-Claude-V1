// C-441: Der Injektionskatalog folgt den sechzehn IDs der Planner-Spec.
// Die Probe verlangt eine explizite Wegwerf-Datenbank und rollt alle Logs zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C441_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-441-Test braucht LUMEOS_C441_DATABASE als Wegwerf-Datenbank, nie postgres.')

const OWNER = 'c4410000-0000-0000-0000-000000000001'
const OTHER = 'c4410000-0000-0000-0000-000000000002'
const IDS = [
  'abd_l', 'abd_r', 'delt_l', 'delt_r', 'glute_l', 'glute_r', 'lat_l', 'lat_r',
  'quad_l', 'quad_r', 'sq_delt_l', 'sq_delt_r', 'thigh_sq_l', 'thigh_sq_r', 'vglute_l', 'vglute_r',
]

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-441: sechzehn seitige Spec-IDs ersetzen die vier unspezifischen Orte', () => {
  const result = sql<{
    ids: string[]
    total: number
    imCount: number
    scCount: number
    legacyCount: number
    siteIdType: string
    logSiteIdType: string
    logSiteIdHasFk: boolean
  }>(`
    SELECT json_build_object(
      'ids', (SELECT json_agg(id ORDER BY id) FROM medical.injection_sites),
      'total', (SELECT count(*)::integer FROM medical.injection_sites),
      'imCount', (SELECT count(*)::integer FROM medical.injection_sites WHERE route = 'im'),
      'scCount', (SELECT count(*)::integer FROM medical.injection_sites WHERE route = 'sc'),
      'legacyCount', (SELECT count(*)::integer FROM medical.injection_sites WHERE id IN ('deltoid', 'vastus_lateralis', 'ventrogluteal', 'subcutaneous')),
      'siteIdType', (SELECT data_type FROM information_schema.columns WHERE table_schema = 'medical' AND table_name = 'injection_sites' AND column_name = 'id'),
      'logSiteIdType', (SELECT data_type FROM information_schema.columns WHERE table_schema = 'medical' AND table_name = 'injection_logs' AND column_name = 'injection_site_id'),
      'logSiteIdHasFk', EXISTS (
        SELECT 1 FROM pg_constraint AS c
        WHERE c.conrelid = 'medical.injection_logs'::regclass
          AND c.contype = 'f'
          AND c.confrelid = 'medical.injection_sites'::regclass
          AND c.conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'medical.injection_logs'::regclass AND attname = 'injection_site_id')]
      )
    );
  `)

  assert.deepEqual(result.ids, IDS)
  assert.equal(result.total, 16)
  assert.equal(result.imCount, 10)
  assert.equal(result.scCount, 6)
  assert.equal(result.legacyCount, 0)
  assert.equal(result.siteIdType, 'text')
  assert.equal(result.logSiteIdType, 'text')
  assert.equal(result.logSiteIdHasFk, true)
})

test('C-441: Katalog-RLS bleibt lesbar, Injektionslogs bleiben eigene Zeilen', () => {
  const result = sql<{
    catalogRls: boolean
    catalogPolicies: string[]
    authenticatedCatalogRows: number
    ownLogs: number
    foreignLogsVisible: number
    anonCatalogReadDenied: boolean
    foreignLogInsertDenied: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'c441-owner@example.test', '{"provider":"email"}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c441-other@example.test', '{"provider":"email"}'::jsonb, now());

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at)
    VALUES ('${OWNER}'::uuid, 'delt_l', now());
    CREATE TEMP TABLE c441_rls AS
      SELECT count(*)::integer AS authenticated_catalog_rows FROM medical.injection_sites;
    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c441_foreign AS
      SELECT count(*)::integer AS foreign_logs_visible
      FROM medical.injection_logs WHERE user_id = '${OWNER}'::uuid;
    RESET ROLE;

    CREATE TEMP TABLE c441_refusals (
      anon_catalog_read_denied boolean NOT NULL DEFAULT false,
      foreign_log_insert_denied boolean NOT NULL DEFAULT false
    );
    INSERT INTO c441_refusals DEFAULT VALUES;
    DO \$\$
    BEGIN
      SET LOCAL ROLE anon;
      BEGIN
        PERFORM 1 FROM medical.injection_sites;
      EXCEPTION WHEN insufficient_privilege THEN
        RESET ROLE;
        UPDATE c441_refusals SET anon_catalog_read_denied = true;
      END;
      RESET ROLE;

      SET LOCAL ROLE authenticated;
      PERFORM set_config('request.jwt.claim.sub', '${OTHER}', true);
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at)
        VALUES ('${OWNER}'::uuid, 'delt_l', now());
      EXCEPTION WHEN insufficient_privilege THEN
        RESET ROLE;
        UPDATE c441_refusals SET foreign_log_insert_denied = true;
      END;
      RESET ROLE;
    END \$\$;

    SELECT json_build_object(
      'catalogRls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'medical.injection_sites'::regclass),
      'catalogPolicies', (SELECT json_agg(policyname ORDER BY policyname) FROM pg_policies WHERE schemaname = 'medical' AND tablename = 'injection_sites'),
      'authenticatedCatalogRows', (SELECT authenticated_catalog_rows FROM c441_rls),
      'ownLogs', (SELECT count(*)::integer FROM medical.injection_logs WHERE user_id = '${OWNER}'::uuid),
      'foreignLogsVisible', (SELECT foreign_logs_visible FROM c441_foreign),
      'anonCatalogReadDenied', (SELECT anon_catalog_read_denied FROM c441_refusals),
      'foreignLogInsertDenied', (SELECT foreign_log_insert_denied FROM c441_refusals)
    );
    ROLLBACK;
  `)

  assert.equal(result.catalogRls, true)
  assert.deepEqual(result.catalogPolicies, ['injection_sites_select'])
  assert.equal(result.authenticatedCatalogRows, 16)
  assert.equal(result.ownLogs, 1)
  assert.equal(result.foreignLogsVisible, 0)
  assert.equal(result.anonCatalogReadDenied, true)
  assert.equal(result.foreignLogInsertDenied, true)
})
