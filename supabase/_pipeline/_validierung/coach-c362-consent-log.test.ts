// C-362/E-20: Einwilligungen sind zweck- und empfaengerbezogene Ereignisse,
// nicht die technische OAuth-Anmeldung und nicht die Aenderungshistorie.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'
const CLIENT_ID = '10000000-0000-0000-0000-000000000101'
const COACH_ID = '10000000-0000-0000-0000-000000000901'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-362/E-20: Consent-Log trennt zwei Zwecke und haelt Widerruf als Ereignis fest', () => {
  const exists = one<{ exists: boolean }>(`
    SELECT json_build_object('exists', to_regclass('coach.client_consent_log') IS NOT NULL);
  `)
  assert.equal(exists.exists, true)

  const result = one<{
    columns: string[]
    eventCheck: string | null
    recipientCheck: string | null
    rls: boolean
    policies: string[]
    authenticated: { select: boolean; insert: boolean; update: boolean; delete: boolean }
    serviceRole: { select: boolean; insert: boolean; update: boolean; delete: boolean }
    events: Array<{ purpose: string; eventKind: string; recipientType: string; revokes: boolean }>
  }>(`
    BEGIN;
    WITH analysis AS (
      INSERT INTO coach.client_consent_log (
        client_id, recipient_type, recipient_id, purpose_code, policy_version, event_kind
      ) VALUES (
        '${CLIENT_ID}'::uuid, 'lumeos', NULL, 'mealcam_analysis', 'mealcam-v1', 'granted'
      ) RETURNING id, purpose_code, event_kind, recipient_type, revokes_consent_id
    ), improvement AS (
      INSERT INTO coach.client_consent_log (
        client_id, recipient_type, recipient_id, purpose_code, policy_version, event_kind
      ) VALUES (
        '${CLIENT_ID}'::uuid, 'lumeos', NULL, 'mealcam_model_improvement', 'mealcam-v1', 'granted'
      ) RETURNING id, purpose_code, event_kind, recipient_type, revokes_consent_id
    ), withdrawal AS (
      INSERT INTO coach.client_consent_log (
        client_id, recipient_type, recipient_id, purpose_code, policy_version, event_kind, revokes_consent_id
      ) SELECT '${CLIENT_ID}'::uuid, 'lumeos', NULL, 'mealcam_model_improvement', 'mealcam-v1', 'revoked', id
      FROM improvement
      RETURNING id, purpose_code, event_kind, recipient_type, revokes_consent_id
    ), coach_grant AS (
      INSERT INTO coach.client_consent_log (
        client_id, recipient_type, recipient_id, purpose_code, policy_version, event_kind
      ) VALUES (
        '${CLIENT_ID}'::uuid, 'coach', '${COACH_ID}'::uuid, 'coach_data_access', 'coach-v1', 'granted'
      ) RETURNING id, purpose_code, event_kind, recipient_type, revokes_consent_id
    ), event_rows AS (
      SELECT purpose_code, event_kind, recipient_type, revokes_consent_id FROM analysis
      UNION ALL SELECT purpose_code, event_kind, recipient_type, revokes_consent_id FROM improvement
      UNION ALL SELECT purpose_code, event_kind, recipient_type, revokes_consent_id FROM withdrawal
      UNION ALL SELECT purpose_code, event_kind, recipient_type, revokes_consent_id FROM coach_grant
    )
    SELECT json_build_object(
      'columns', (SELECT COALESCE(json_agg(column_name ORDER BY column_name), '[]'::json)
                  FROM information_schema.columns
                  WHERE table_schema = 'coach' AND table_name = 'client_consent_log'),
      'eventCheck', (SELECT pg_get_constraintdef(oid) FROM pg_constraint
                     WHERE conrelid = 'coach.client_consent_log'::regclass
                       AND conname = 'client_consent_log_event_check'),
      'recipientCheck', (SELECT pg_get_constraintdef(oid) FROM pg_constraint
                         WHERE conrelid = 'coach.client_consent_log'::regclass
                           AND conname = 'client_consent_log_recipient_check'),
      'rls', (SELECT relrowsecurity FROM pg_class WHERE oid = 'coach.client_consent_log'::regclass),
      'policies', (SELECT COALESCE(json_agg(policyname ORDER BY policyname), '[]'::json)
                   FROM pg_policies WHERE schemaname = 'coach' AND tablename = 'client_consent_log'),
      'authenticated', json_build_object(
        'select', has_table_privilege('authenticated', 'coach.client_consent_log', 'select'),
        'insert', has_table_privilege('authenticated', 'coach.client_consent_log', 'insert'),
        'update', has_table_privilege('authenticated', 'coach.client_consent_log', 'update'),
        'delete', has_table_privilege('authenticated', 'coach.client_consent_log', 'delete')
      ),
      'serviceRole', json_build_object(
        'select', has_table_privilege('service_role', 'coach.client_consent_log', 'select'),
        'insert', has_table_privilege('service_role', 'coach.client_consent_log', 'insert'),
        'update', has_table_privilege('service_role', 'coach.client_consent_log', 'update'),
        'delete', has_table_privilege('service_role', 'coach.client_consent_log', 'delete')
      ),
      'events', (SELECT COALESCE(json_agg(json_build_object(
          'purpose', purpose_code, 'eventKind', event_kind,
          'recipientType', recipient_type, 'revokes', revokes_consent_id IS NOT NULL
        ) ORDER BY purpose_code, event_kind), '[]'::json)
        FROM event_rows)
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.columns, [
    'client_id', 'event_kind', 'id', 'policy_version', 'purpose_code',
    'recipient_id', 'recipient_type', 'recorded_at', 'revokes_consent_id',
  ])
  assert.match(result.eventCheck ?? '', /granted.*revoked/)
  assert.match(result.recipientCheck ?? '', /coach/)
  assert.match(result.recipientCheck ?? '', /lumeos/)
  assert.equal(result.rls, true)
  assert.deepEqual(result.policies, [
    'client_consent_log_client_select',
    'client_consent_log_coach_select',
  ])
  assert.deepEqual(result.authenticated, { select: true, insert: false, update: false, delete: false })
  assert.deepEqual(result.serviceRole, { select: true, insert: true, update: false, delete: false })
  assert.deepEqual(result.events.map(event => ({ ...event })), [
    { purpose: 'coach_data_access', eventKind: 'granted', recipientType: 'coach', revokes: false },
    { purpose: 'mealcam_analysis', eventKind: 'granted', recipientType: 'lumeos', revokes: false },
    { purpose: 'mealcam_model_improvement', eventKind: 'granted', recipientType: 'lumeos', revokes: false },
    { purpose: 'mealcam_model_improvement', eventKind: 'revoked', recipientType: 'lumeos', revokes: true },
  ])
})
