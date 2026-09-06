import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-414/G-152: activity_stream ist als Querschnittssicht in public und vereinigt sechs Quellen', () => {
  const result = one<{
    viewExists: boolean
    legacyNutritionViewAbsent: boolean
    securityInvoker: boolean
    authenticatedSelect: boolean
    eventTypes: string[]
    missingSummaries: number
    sourceRows: Record<string, number>
    streamRows: Record<string, number>
  }>(`
    WITH source_rows AS (
      SELECT 'meal' AS event_type, count(*)::integer AS rows FROM nutrition.meals
      UNION ALL SELECT 'water', count(*)::integer FROM nutrition.water_logs
      UNION ALL SELECT 'supplement_intake', count(*)::integer FROM supplements.intake_logs
      UNION ALL SELECT 'workout_session', count(*)::integer FROM training.workout_sessions
      UNION ALL SELECT 'recovery_checkin', count(*)::integer FROM recovery.checkins
      UNION ALL SELECT 'lab_report', count(*)::integer FROM medical.lab_reports
    ), stream_rows AS (
      SELECT event_type, count(*)::integer AS rows
      FROM public.activity_stream
      GROUP BY event_type
    )
    SELECT json_build_object(
      'viewExists', to_regclass('public.activity_stream') IS NOT NULL,
      'legacyNutritionViewAbsent', to_regclass('nutrition.activity_stream') IS NULL,
      'securityInvoker', (
        SELECT 'security_invoker=true' = ANY(c.reloptions)
        FROM pg_class c
        WHERE c.oid = 'public.activity_stream'::regclass
      ),
      'authenticatedSelect', has_table_privilege('authenticated', 'public.activity_stream', 'SELECT'),
      'eventTypes', (
        SELECT json_agg(event_type ORDER BY event_type) FROM stream_rows
      ),
      'missingSummaries', (
        SELECT count(*)::integer FROM public.activity_stream
        WHERE btrim(summary_de) = ''
      ),
      'sourceRows', (SELECT json_object_agg(event_type, rows) FROM source_rows),
      'streamRows', (SELECT json_object_agg(event_type, rows) FROM stream_rows)
    );
  `)

  assert.equal(result.viewExists, true)
  assert.equal(result.legacyNutritionViewAbsent, true)
  assert.equal(result.securityInvoker, true)
  assert.equal(result.authenticatedSelect, true)
  assert.deepEqual(result.eventTypes, [
    'lab_report',
    'meal',
    'recovery_checkin',
    'supplement_intake',
    'water',
    'workout_session',
  ])
  assert.equal(result.missingSummaries, 0)
  assert.deepEqual(result.streamRows, result.sourceRows)
})

test('C-412: der Strom macht die veraltete Supplement-Historie sichtbar statt sie als Einnahme zu deuten', () => {
  const result = one<{
    streamLatest: string
    sourceLatest: string
    streamLastSevenDays: number
    sourceLastSevenDays: number
  }>(`
    SELECT json_build_object(
      'streamLatest', (
        SELECT max(event_date)::text FROM public.activity_stream
        WHERE event_type = 'supplement_intake'
      ),
      'sourceLatest', (SELECT max(intake_date)::text FROM supplements.intake_logs),
      'streamLastSevenDays', (
        SELECT count(*)::integer FROM public.activity_stream
        WHERE event_type = 'supplement_intake'
          AND event_date >= current_date - 6
      ),
      'sourceLastSevenDays', (
        SELECT count(*)::integer FROM supplements.intake_logs
        WHERE intake_date >= current_date - 6
      )
    );
  `)

  assert.equal(result.streamLatest, result.sourceLatest)
  assert.equal(result.streamLastSevenDays, result.sourceLastSevenDays)
})

test('G-152: die Sicht bleibt fuer eine authentifizierte Sitzung auf deren eigene Zeilen beschraenkt', () => {
  const result = one<{
    onlyOwnRows: boolean
    streamRows: number
    sourceRows: number
  }>(`
    BEGIN;
    SET LOCAL request.jwt.claims =
      '{"sub":"10000000-0000-0000-0000-000000000101","role":"authenticated"}';
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'onlyOwnRows', NOT EXISTS (
        SELECT 1 FROM public.activity_stream WHERE user_id <> auth.uid()
      ),
      'streamRows', (SELECT count(*)::integer FROM public.activity_stream),
      'sourceRows', (
        (SELECT count(*)::integer FROM nutrition.meals)
        + (SELECT count(*)::integer FROM nutrition.water_logs)
        + (SELECT count(*)::integer FROM supplements.intake_logs)
        + (SELECT count(*)::integer FROM training.workout_sessions)
        + (SELECT count(*)::integer FROM recovery.checkins)
        + (SELECT count(*)::integer FROM medical.lab_reports)
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.onlyOwnRows, true)
  assert.equal(result.streamRows, result.sourceRows)
})
