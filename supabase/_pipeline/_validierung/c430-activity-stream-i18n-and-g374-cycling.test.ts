// C-430/G-374: Die Querschnittssicht liefert alle drei UI-Sprachen; ein
// vorhandenes cycling-Objekt ist nur mit seinem Beginn vollstaendig.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-430/G-374-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

const USER = 'c4300000-0000-0000-0000-000000000001'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-430/G-374: Activity Stream ist dreisprachig, Cycling vollstaendig und NULL bleibt erlaubt', () => {
  const result = one<{
    languages: string[]
    eventTypes: number
    trilingualTypes: number
    cyclingStartedOn: string | null
    cyclingWithoutStartDenied: boolean
    nullCyclingStillAllowed: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${USER}'::uuid, 'c430-owner@example.test', '{}'::jsonb, now());

    -- Ereignisarten und Sprachvollstaendigkeit sind Eigenschaften der
    -- Sichtdefinition bzw. des Seedbestands. Unter Benutzer-RLS waere diese
    -- neue Testidentitaet korrekt auf null eigene Ereignisse eingeschraenkt.
    CREATE TEMP TABLE c430_activity AS
    SELECT
      count(DISTINCT event_type)::integer AS event_types,
      count(DISTINCT event_type) FILTER (
        WHERE btrim(summary_de) <> '' AND btrim(summary_en) <> '' AND btrim(summary_th) <> ''
      )::integer AS trilingual_types
    FROM public.activity_stream;
    GRANT SELECT ON c430_activity TO authenticated;

    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claim.sub" = '${USER}';

    CREATE TEMP TABLE c430_stack AS
    WITH inserted AS (
      INSERT INTO supplements.user_stacks (user_id, name, goal, source)
      VALUES ('${USER}'::uuid, 'C430 Cycling', 'health', 'user')
      RETURNING id
    ) SELECT id FROM inserted;

    CREATE TEMP TABLE c430_item AS
    WITH inserted AS (
      INSERT INTO supplements.stack_items (
        stack_id, supplement_id, dose, dose_unit, timing, frequency, cycling
      )
      SELECT id, (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1),
             1, 'mg', 'morning', 'cycling',
             '{"on_weeks":8,"off_weeks":4,"started_on":"2026-09-08"}'::jsonb
      FROM c430_stack
      RETURNING id
    ) SELECT id FROM inserted;

    CREATE TEMP TABLE c430_null_item AS
    WITH inserted AS (
      INSERT INTO supplements.stack_items (stack_id, supplement_id, dose, dose_unit, timing, frequency, cycling)
      SELECT id, (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1),
             2, 'mg', 'evening', 'daily', NULL
      FROM c430_stack
      RETURNING id
    ) SELECT id FROM inserted;

    CREATE TEMP TABLE c430_probe (cycling_without_start_denied boolean NOT NULL);
    DO $$
    DECLARE denied boolean := false;
    BEGIN
      BEGIN
        INSERT INTO supplements.stack_items (
          stack_id, supplement_id, dose, dose_unit, timing, frequency, cycling
        )
        SELECT id, (SELECT id FROM supplements.supplements WHERE is_active ORDER BY id LIMIT 1),
               1, 'mg', 'morning', 'cycling', '{"on_weeks":8,"off_weeks":4}'::jsonb
        FROM c430_stack;
      EXCEPTION WHEN check_violation THEN denied := true;
      END;
      INSERT INTO c430_probe VALUES (denied);
    END $$;

    SELECT json_build_object(
      'languages', (
        SELECT json_agg(column_name ORDER BY column_name)
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'activity_stream'
          AND column_name IN ('summary_de', 'summary_en', 'summary_th')
      ),
      'eventTypes', (SELECT event_types FROM c430_activity),
      'trilingualTypes', (SELECT trilingual_types FROM c430_activity),
      'cyclingStartedOn', (SELECT cycling ->> 'started_on' FROM supplements.stack_items WHERE id = (SELECT id FROM c430_item)),
      'cyclingWithoutStartDenied', (SELECT cycling_without_start_denied FROM c430_probe),
      'nullCyclingStillAllowed', EXISTS (
        SELECT 1 FROM supplements.stack_items
        WHERE id = (SELECT id FROM c430_null_item) AND cycling IS NULL
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.languages, ['summary_de', 'summary_en', 'summary_th'])
  assert.equal(result.eventTypes, 6)
  assert.equal(result.trilingualTypes, 6)
  assert.equal(result.cyclingStartedOn, '2026-09-08')
  assert.equal(result.cyclingWithoutStartDenied, true)
  assert.equal(result.nullCyclingStillAllowed, true)
})
