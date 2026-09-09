// C-445: Ein Protokoll bewahrt die beobachteten Werte und eine begruendete
// Block-Übersteuerung. Die Probe laeuft nur gegen eine Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C445_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-445-Test braucht LUMEOS_C445_DATABASE als Wegwerf-Datenbank, nie postgres.')

const OWNER = 'c4450000-0000-0000-0000-000000000001'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-445: Injektionsprotokoll hat sechs speckonforme Wert- und Übersteuerungsspalten', () => {
  const result = sql<{
    columns: Array<{ name: string; type: string; nullable: string }>
    rls: boolean
    policies: string[]
  }>(`
    SELECT json_build_object(
      'columns', (
        SELECT json_agg(json_build_object(
          'name', column_name,
          'type', CASE WHEN data_type = 'ARRAY' THEN udt_name ELSE data_type END,
          'nullable', is_nullable
        ) ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'medical' AND table_name = 'injection_logs'
          AND column_name IN ('volume_ml', 'pain_score', 'complication', 'substance_name', 'route', 'override_reason')
      ),
      'rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'medical.injection_logs'::regclass),
      'policies', (SELECT json_agg(policyname ORDER BY policyname)
                   FROM pg_policies WHERE schemaname = 'medical' AND tablename = 'injection_logs')
    );
  `)

  assert.deepEqual(result.columns, [
    { name: 'volume_ml', type: 'numeric', nullable: 'YES' },
    { name: 'substance_name', type: 'text', nullable: 'YES' },
    { name: 'route', type: 'text', nullable: 'YES' },
    { name: 'pain_score', type: 'smallint', nullable: 'YES' },
    { name: 'complication', type: '_text', nullable: 'YES' },
    { name: 'override_reason', type: 'text', nullable: 'YES' },
  ])
  assert.equal(result.rls, true)
  assert.deepEqual(result.policies, [
    'injection_logs_delete', 'injection_logs_insert', 'injection_logs_select', 'injection_logs_update',
  ])
})

test('C-445: ein vollstaendiges eigenes Protokoll akzeptiert nur gueltige Skalen und Komplikationswerte', () => {
  const result = sql<{
    validLogCount: number
    invalidVolumeDenied: boolean
    invalidPainDenied: boolean
    invalidComplicationDenied: boolean
    blankOverrideDenied: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${OWNER}'::uuid, 'c445-owner@example.test', '{"provider":"email"}'::jsonb, now());
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${OWNER}', true);
    INSERT INTO medical.injection_logs (
      user_id, injection_site_id, injected_at, volume_ml, substance_name, route,
      pain_score, complication, override_reason
    ) VALUES (
      '${OWNER}'::uuid, 'delt_l', now(), 1.00, 'Fixture substance', 'im',
      2, ARRAY['bleeding', 'swelling']::text[], 'volume_limit confirmed by clinician'
    );
    RESET ROLE;

    CREATE TEMP TABLE c445_refusals (
      invalid_volume_denied boolean NOT NULL DEFAULT false,
      invalid_pain_denied boolean NOT NULL DEFAULT false,
      invalid_complication_denied boolean NOT NULL DEFAULT false,
      blank_override_denied boolean NOT NULL DEFAULT false
    );
    INSERT INTO c445_refusals DEFAULT VALUES;
    DO \$\$
    BEGIN
      SET LOCAL ROLE authenticated;
      PERFORM set_config('request.jwt.claim.sub', '${OWNER}', true);
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at, volume_ml)
        VALUES ('${OWNER}'::uuid, 'delt_l', now(), 0);
      EXCEPTION WHEN check_violation THEN
        RESET ROLE;
        UPDATE c445_refusals SET invalid_volume_denied = true;
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', '${OWNER}', true);
      END;
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at, pain_score)
        VALUES ('${OWNER}'::uuid, 'delt_l', now(), 4);
      EXCEPTION WHEN check_violation THEN
        RESET ROLE;
        UPDATE c445_refusals SET invalid_pain_denied = true;
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', '${OWNER}', true);
      END;
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at, complication)
        VALUES ('${OWNER}'::uuid, 'delt_l', now(), ARRAY['not_listed']::text[]);
      EXCEPTION WHEN check_violation THEN
        RESET ROLE;
        UPDATE c445_refusals SET invalid_complication_denied = true;
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', '${OWNER}', true);
      END;
      BEGIN
        INSERT INTO medical.injection_logs (user_id, injection_site_id, injected_at, override_reason)
        VALUES ('${OWNER}'::uuid, 'delt_l', now(), '   ');
      EXCEPTION WHEN check_violation THEN
        RESET ROLE;
        UPDATE c445_refusals SET blank_override_denied = true;
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', '${OWNER}', true);
      END;
      RESET ROLE;
    END \$\$;

    SELECT json_build_object(
      'validLogCount', (SELECT count(*)::integer FROM medical.injection_logs WHERE user_id = '${OWNER}'::uuid),
      'invalidVolumeDenied', (SELECT invalid_volume_denied FROM c445_refusals),
      'invalidPainDenied', (SELECT invalid_pain_denied FROM c445_refusals),
      'invalidComplicationDenied', (SELECT invalid_complication_denied FROM c445_refusals),
      'blankOverrideDenied', (SELECT blank_override_denied FROM c445_refusals)
    );
    ROLLBACK;
  `)

  assert.equal(result.validLogCount, 1)
  assert.equal(result.invalidVolumeDenied, true)
  assert.equal(result.invalidPainDenied, true)
  assert.equal(result.invalidComplicationDenied, true)
  assert.equal(result.blankOverrideDenied, true)
})
