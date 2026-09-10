// C-455: Katalogwissen, beobachtete Injektion und Medical-Coach-Override
// bleiben getrennt. Diese Probe laeuft ausschliesslich gegen eine explizite
// Wegwerf-Datenbank und rollt die gesamte Fixture-Transaktion zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C455_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-455-Test braucht LUMEOS_C455_DATABASE als Wegwerf-Datenbank, nie postgres.')

const CLIENT = 'c4550000-0000-0000-0000-000000000001'
const FULL_COACH = 'c4550000-0000-0000-0000-000000000002'
const SUMMARY_COACH = 'c4550000-0000-0000-0000-000000000003'
const FOREIGN_COACH = 'c4550000-0000-0000-0000-000000000004'
const OTHER_OWNER = 'c4550000-0000-0000-0000-000000000005'

const SITES = [
  ['abd_l', 'abs'], ['abd_r', 'abs'], ['delt_l', 'deltoids'], ['delt_r', 'deltoids'],
  ['glute_l', 'gluteal'], ['glute_r', 'gluteal'], ['lat_l', 'latissimus'], ['lat_r', 'latissimus'],
  ['quad_l', 'quadriceps'], ['quad_r', 'quadriceps'], ['sq_delt_l', 'deltoids'], ['sq_delt_r', 'deltoids'],
  ['thigh_sq_l', 'quadriceps'], ['thigh_sq_r', 'quadriceps'], ['vglute_l', 'gluteal'], ['vglute_r', 'gluteal'],
]

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  // psql umbrechen JSON-Arrays ab einer bestimmten Breite in mehrere Zeilen.
  // Die Fixture gibt davor bewusst set_config()-Ergebnisse aus; der letzte
  // JSON-Wert beginnt daher am ersten Objektzeichen und kann mehrzeilig sein.
  const jsonStart = output.indexOf('{')
  return JSON.parse(jsonStart >= 0 ? output.slice(jsonStart) : output) as T
}

test('C-455: sechzehn Katalogorte tragen Planner-Konfiguration und Flächenzuordnung, ohne E-57 umzudeuten', () => {
  const result = sql<{
    siteColumns: string[]
    allConfigured: number
    minimumRestStillNull: number
    mappings: string[][]
    logColumns: string[]
    injectionSiteNullable: string
    logIndices: string[]
    noStoredSchedule: boolean
    fks: string[]
  }>(`
    SELECT json_build_object(
      'siteColumns', (SELECT json_agg(column_name ORDER BY column_name)
        FROM information_schema.columns WHERE table_schema = 'medical' AND table_name = 'injection_sites'
          AND column_name IN ('max_volume_ml', 'rest_days', 'body_view', 'x_pct', 'y_pct', 'needle_gauge', 'needle_length_in', 'landmark_note', 'difficulty', 'is_active', 'body_area_code')),
      'allConfigured', (SELECT count(*)::integer FROM medical.injection_sites
        WHERE max_volume_ml IS NOT NULL AND rest_days IS NOT NULL AND body_view IS NOT NULL
          AND x_pct IS NOT NULL AND y_pct IS NOT NULL AND needle_gauge IS NOT NULL
          AND needle_length_in IS NOT NULL AND landmark_note IS NOT NULL AND difficulty IS NOT NULL AND is_active),
      'minimumRestStillNull', (SELECT count(*)::integer FROM medical.injection_sites WHERE minimum_rest_days IS NULL),
      'mappings', (SELECT json_agg(ARRAY[id, body_area_code] ORDER BY id) FROM medical.injection_sites),
      'logColumns', (SELECT json_agg(column_name ORDER BY column_name)
        FROM information_schema.columns WHERE table_schema = 'medical' AND table_name = 'injection_logs'
          AND column_name IN ('substance_id', 'dose_amount', 'dose_unit', 'needle_gauge', 'needle_length_in', 'notes', 'stack_item_id', 'body_area_code')),
      'injectionSiteNullable', (SELECT is_nullable FROM information_schema.columns
        WHERE table_schema = 'medical' AND table_name = 'injection_logs' AND column_name = 'injection_site_id'),
      'logIndices', (SELECT json_agg(indexname ORDER BY indexname) FROM pg_indexes
        WHERE schemaname = 'medical' AND tablename = 'injection_logs'),
      'noStoredSchedule', to_regclass('medical.injection_schedule') IS NULL,
      'fks', (SELECT json_agg(confrelid::regclass::text ORDER BY confrelid::regclass::text)
        FROM pg_constraint WHERE conrelid = 'medical.injection_logs'::regclass AND contype = 'f')
    );
  `)

  assert.deepEqual(result.siteColumns, ['body_area_code', 'body_view', 'difficulty', 'is_active', 'landmark_note', 'max_volume_ml', 'needle_gauge', 'needle_length_in', 'rest_days', 'x_pct', 'y_pct'])
  assert.equal(result.allConfigured, 16)
  assert.equal(result.minimumRestStillNull, 16)
  assert.deepEqual(result.mappings, SITES)
  assert.deepEqual(result.logColumns, ['body_area_code', 'dose_amount', 'dose_unit', 'needle_gauge', 'needle_length_in', 'notes', 'stack_item_id', 'substance_id'])
  assert.equal(result.injectionSiteNullable, 'YES')
  assert.deepEqual(result.logIndices, [
    'injection_logs_pkey', 'injection_logs_user_injected_at_idx',
    'injection_logs_user_site_injected_at_idx',
  ])
  assert.equal(result.noStoredSchedule, true)
  assert.deepEqual(result.fks, ['auth.users', 'medical.injection_sites', 'supplements.stack_items', 'supplements.supplements'])
})

test('C-455: Log bindet nur den eigenen Stack; Coach-Override erfordert aktive Medical-full-Sicht und schreibt Audit', () => {
  const result = sql<{
    ownLogCount: number
    foreignStackDenied: boolean
    fullCoachOverrideCount: number
    fullCoachAuditCount: number
    clientVisible: number
    summaryVisible: number
    foreignVisible: number
    summaryInsertDenied: boolean
    inactiveFullInsertDenied: boolean
    anonReadDenied: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${CLIENT}'::uuid, 'c455-client@example.test', '{}'::jsonb, now()),
      ('${FULL_COACH}'::uuid, 'c455-full@example.test', '{}'::jsonb, now()),
      ('${SUMMARY_COACH}'::uuid, 'c455-summary@example.test', '{}'::jsonb, now()),
      ('${FOREIGN_COACH}'::uuid, 'c455-foreign@example.test', '{}'::jsonb, now()),
      ('${OTHER_OWNER}'::uuid, 'c455-other@example.test', '{}'::jsonb, now());
    INSERT INTO coach.relationships (coach_id, client_id, status, invited_by, started_at, coach_display_name) VALUES
      ('${FULL_COACH}'::uuid, '${CLIENT}'::uuid, 'active', '${FULL_COACH}'::uuid, now(), NULL),
      ('${SUMMARY_COACH}'::uuid, '${CLIENT}'::uuid, 'active', '${SUMMARY_COACH}'::uuid, now(), NULL),
      ('${FOREIGN_COACH}'::uuid, '${CLIENT}'::uuid, 'invited', '${FOREIGN_COACH}'::uuid, NULL, 'C455 Inactive Coach');
    INSERT INTO coach.client_permissions (coach_id, client_id, medical_visibility) VALUES
      ('${FULL_COACH}'::uuid, '${CLIENT}'::uuid, 'full'),
      ('${SUMMARY_COACH}'::uuid, '${CLIENT}'::uuid, 'summary'),
      ('${FOREIGN_COACH}'::uuid, '${CLIENT}'::uuid, 'full');
    INSERT INTO supplements.user_stacks (id, user_id, name, is_active) VALUES
      ('45550000-0000-0000-0000-000000000001'::uuid, '${CLIENT}'::uuid, 'C455 Client Stack', true),
      ('45550000-0000-0000-0000-000000000002'::uuid, '${OTHER_OWNER}'::uuid, 'C455 Foreign Stack', true);
    INSERT INTO supplements.stack_items (id, stack_id, supplement_id, dose, dose_unit, frequency, timing) VALUES
      ('45550000-0000-0000-0000-000000000011'::uuid, '45550000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM supplements.supplements ORDER BY id LIMIT 1), 1, 'mg', 'daily', 'morning'),
      ('45550000-0000-0000-0000-000000000012'::uuid, '45550000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM supplements.supplements ORDER BY id LIMIT 1), 1, 'mg', 'daily', 'morning');

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${CLIENT}', true);
    INSERT INTO medical.injection_logs (user_id, injection_site_id, body_area_code, injected_at, substance_id, dose_amount, dose_unit, needle_gauge, needle_length_in, notes, stack_item_id)
    VALUES ('${CLIENT}'::uuid, 'abd_l', 'abs', now(), (SELECT id FROM supplements.supplements ORDER BY id LIMIT 1), 0.25, 'mg', '29G', 0.50, 'fixture', '45550000-0000-0000-0000-000000000011'::uuid);
    CREATE TEMP TABLE c455_refusals (foreign_stack_denied boolean NOT NULL DEFAULT false, summary_insert_denied boolean NOT NULL DEFAULT false, inactive_full_insert_denied boolean NOT NULL DEFAULT false, anon_read_denied boolean NOT NULL DEFAULT false);
    INSERT INTO c455_refusals DEFAULT VALUES;
    DO \$\$
    BEGIN
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, body_area_code, injected_at, stack_item_id)
        VALUES ('${CLIENT}'::uuid, 'abd_l', 'abs', now(), '45550000-0000-0000-0000-000000000012'::uuid);
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c455_refusals SET foreign_stack_denied = true;
      END;
    END \$\$;
    SELECT set_config('request.jwt.claim.sub', '${FULL_COACH}', true);
    INSERT INTO medical.injection_site_overrides (user_id, site_id, max_volume_ml, rest_days, physician_note, set_by_coach_id)
    VALUES ('${CLIENT}'::uuid, 'abd_l', 1.25, 4, 'C455 fixture: documented clinician override', '${FULL_COACH}'::uuid);
    SELECT set_config('request.jwt.claim.sub', '${SUMMARY_COACH}', true);
    CREATE TEMP TABLE c455_summary AS SELECT count(*)::integer AS visible FROM medical.injection_site_overrides WHERE user_id = '${CLIENT}'::uuid;
    DO \$\$
    BEGIN
      BEGIN
        INSERT INTO medical.injection_site_overrides (user_id, site_id, rest_days, physician_note, set_by_coach_id)
        VALUES ('${CLIENT}'::uuid, 'abd_r', 4, 'C455 summary must not write', '${SUMMARY_COACH}'::uuid);
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c455_refusals SET summary_insert_denied = true;
      END;
    END \$\$;
    SELECT set_config('request.jwt.claim.sub', '${FOREIGN_COACH}', true);
    CREATE TEMP TABLE c455_foreign AS SELECT count(*)::integer AS visible FROM medical.injection_site_overrides WHERE user_id = '${CLIENT}'::uuid;
    DO \$\$
    BEGIN
      BEGIN
        INSERT INTO medical.injection_site_overrides (user_id, site_id, rest_days, physician_note, set_by_coach_id)
        VALUES ('${CLIENT}'::uuid, 'abd_r', 4, 'C455 inactive relation must not write', '${FOREIGN_COACH}'::uuid);
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c455_refusals SET inactive_full_insert_denied = true;
      END;
    END \$\$;
    RESET ROLE;
    SET LOCAL ROLE anon;
    DO \$\$
    BEGIN
      BEGIN
        PERFORM 1 FROM medical.injection_site_overrides;
      EXCEPTION WHEN insufficient_privilege THEN
        RESET ROLE;
        UPDATE c455_refusals SET anon_read_denied = true;
      END;
    END \$\$;
    RESET ROLE;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${CLIENT}', true);
    CREATE TEMP TABLE c455_client AS SELECT count(*)::integer AS visible FROM medical.injection_site_overrides WHERE user_id = '${CLIENT}'::uuid;
    RESET ROLE;
    SELECT json_build_object(
      'ownLogCount', (SELECT count(*)::integer FROM medical.injection_logs WHERE user_id = '${CLIENT}'::uuid),
      'foreignStackDenied', (SELECT foreign_stack_denied FROM c455_refusals),
      'fullCoachOverrideCount', (SELECT count(*)::integer FROM medical.injection_site_overrides WHERE user_id = '${CLIENT}'::uuid AND set_by_coach_id = '${FULL_COACH}'::uuid),
      'fullCoachAuditCount', (SELECT count(*)::integer FROM coach.action_log WHERE coach_id = '${FULL_COACH}'::uuid AND client_id = '${CLIENT}'::uuid AND module = 'medical' AND action_type = 'injection_site_override'),
      'clientVisible', (SELECT visible FROM c455_client),
      'summaryVisible', (SELECT visible FROM c455_summary),
      'foreignVisible', (SELECT visible FROM c455_foreign),
      'summaryInsertDenied', (SELECT summary_insert_denied FROM c455_refusals),
      'inactiveFullInsertDenied', (SELECT inactive_full_insert_denied FROM c455_refusals),
      'anonReadDenied', (SELECT anon_read_denied FROM c455_refusals)
    );
    ROLLBACK;
  `)

  assert.equal(result.ownLogCount, 1)
  assert.equal(result.foreignStackDenied, true)
  assert.equal(result.fullCoachOverrideCount, 1)
  assert.equal(result.fullCoachAuditCount, 1)
  assert.equal(result.clientVisible, 1)
  assert.equal(result.summaryVisible, 0)
  assert.equal(result.foreignVisible, 0)
  assert.equal(result.summaryInsertDenied, true)
  assert.equal(result.inactiveFullInsertDenied, true)
  assert.equal(result.anonReadDenied, true)
})
