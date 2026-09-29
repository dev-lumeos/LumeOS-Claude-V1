// G-531: goal_phase_start nimmt die Zielrate atomar mit der Phase entgegen.
// Alle Schreibproben laufen als angemeldeter Nutzer und werden zurueckgerollt.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-531 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-531 A1/A1b/A2: auth.uid liest die Sitzung und der Startvertrag reicht die Rate an den Tabellen-CHECK durch', () => {
  const result = one<{
    newSignature: boolean
    oldSignature: boolean
    rateArgumentCount: number
    storedRate: number
    fatLossMissing: string
    leanBulkWrongSign: string
    peakWeekWithRate: string
    secondActivePhase: string
    unauthenticatedStart: string
    unauthenticatedEnd: string
    unauthenticatedResponse: string
    acceptedResponse: string
    foreignResponse: string
    directLegacyClaimReads: number
    authUidReaders: number
  }>(`
    BEGIN;
    SET LOCAL session_replication_role = replica;
    INSERT INTO auth.users (id, email) VALUES
      ('53100000-0000-0000-0000-000000000001', 'g531-probe@lumeos.local'),
      ('53100000-0000-0000-0000-000000000002', 'g531-foreign@lumeos.local');
    SET LOCAL session_replication_role = origin;

    CREATE TEMP TABLE g531_result (
      fall text PRIMARY KEY,
      sqlstate text,
      constraint_name text,
      message text
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g531_result TO authenticated;

    CREATE TEMP TABLE g531_foreign_phase ON COMMIT DROP AS
    WITH inserted AS (
      INSERT INTO goals.goal_phases (
        user_id, phase_type, gueltig_ab, parameters
      ) VALUES (
        '53100000-0000-0000-0000-000000000002',
        'maintenance',
        DATE '2099-05-30',
        jsonb_build_object('source', 'G-531 Fremdprobe')
      )
      RETURNING id
    )
    SELECT id FROM inserted;
    GRANT SELECT ON g531_foreign_phase TO authenticated;

    DO $unauthenticated$
    DECLARE
      v_message text;
    BEGIN
      BEGIN
        PERFORM goals.goal_phase_start('maintenance', DATE '2099-05-30');
        RAISE EXCEPTION 'goal_phase_start nahm eine Sitzung ohne Nutzer an';
      EXCEPTION WHEN insufficient_privilege THEN
        GET STACKED DIAGNOSTICS v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES ('unauthenticated_start', SQLSTATE, NULL, v_message);
      END;

      BEGIN
        PERFORM goals.goal_phase_end(
          '00000000-0000-0000-0000-000000000000',
          'G-531 Abmeldeprobe',
          DATE '2099-05-30'
        );
        RAISE EXCEPTION 'goal_phase_end nahm eine Sitzung ohne Nutzer an';
      EXCEPTION WHEN insufficient_privilege THEN
        GET STACKED DIAGNOSTICS v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES ('unauthenticated_end', SQLSTATE, NULL, v_message);
      END;

      BEGIN
        PERFORM goals.phase_transition_respond(
          (SELECT id FROM g531_foreign_phase),
          'accepted',
          'G-531 Abmeldeprobe'
        );
        RAISE EXCEPTION 'phase_transition_respond nahm eine Sitzung ohne Nutzer an';
      EXCEPTION WHEN raise_exception THEN
        GET STACKED DIAGNOSTICS v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES ('unauthenticated_response', SQLSTATE, NULL, v_message);
      END;
    END
    $unauthenticated$;

    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', '53100000-0000-0000-0000-000000000001',
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;

    DO $probe$
    DECLARE
      v_phase_id uuid;
      v_constraint text;
      v_message text;
    BEGIN
      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'fat_loss',
          p_gueltig_ab := DATE '2099-05-31'
        );
        RAISE EXCEPTION 'fat_loss ohne Rate wurde angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS
          v_constraint = CONSTRAINT_NAME,
          v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES (
          'fat_loss_missing', SQLSTATE, v_constraint, v_message
        );
      END;

      v_phase_id := goals.goal_phase_start(
        p_phase_type := 'fat_loss',
        p_gueltig_ab := DATE '2099-06-01',
        p_zielrate_pct_kg_woche := -0.500
      );
      INSERT INTO g531_result VALUES ('fat_loss_valid', '00000', NULL, v_phase_id::text);

      PERFORM goals.goal_phase_end(
        v_phase_id,
        'G-531 Gegenprobe beendet',
        DATE '2099-06-01'
      );

      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'lean_bulk',
          p_gueltig_ab := DATE '2099-06-02',
          p_zielrate_pct_kg_woche := -0.500
        );
        RAISE EXCEPTION 'lean_bulk mit negativer Rate wurde angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS
          v_constraint = CONSTRAINT_NAME,
          v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES (
          'lean_bulk_wrong_sign', SQLSTATE, v_constraint, v_message
        );
      END;

      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'peak_week',
          p_gueltig_ab := DATE '2099-06-03',
          p_zielrate_pct_kg_woche := 0.500
        );
        RAISE EXCEPTION 'peak_week mit Rate wurde angenommen';
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS
          v_constraint = CONSTRAINT_NAME,
          v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES (
          'peak_week_with_rate', SQLSTATE, v_constraint, v_message
        );
      END;

      v_phase_id := goals.goal_phase_start(
        p_phase_type := 'maintenance',
        p_gueltig_ab := DATE '2099-06-04',
        p_zielrate_pct_kg_woche := 0.000
      );
      INSERT INTO g531_result VALUES ('maintenance_zero', '00000', NULL, v_phase_id::text);

      INSERT INTO g531_result VALUES (
        'accepted_response',
        '00000',
        NULL,
        goals.phase_transition_respond(
          v_phase_id,
          'accepted',
          'G-531 angemeldete Gegenprobe'
        )
      );

      BEGIN
        PERFORM goals.phase_transition_respond(
          (SELECT id FROM g531_foreign_phase),
          'accepted',
          'G-531 Fremdprobe'
        );
        RAISE EXCEPTION 'fremde Phase wurde beantwortet';
      EXCEPTION WHEN raise_exception THEN
        GET STACKED DIAGNOSTICS v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES (
          'foreign_response', SQLSTATE, NULL, v_message
        );
      END;

      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'fat_loss',
          p_gueltig_ab := DATE '2099-06-05',
          p_zielrate_pct_kg_woche := -0.500
        );
        RAISE EXCEPTION 'zweite aktive Phase wurde angenommen';
      EXCEPTION WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_message = MESSAGE_TEXT;
        INSERT INTO g531_result VALUES (
          'second_active_phase', SQLSTATE, NULL, v_message
        );
      END;
    END
    $probe$;

    RESET ROLE;

    SELECT json_build_object(
      'newSignature', to_regprocedure(
        'goals.goal_phase_start(text,date,uuid,date,text,jsonb,numeric)'
      ) IS NOT NULL,
      'oldSignature', to_regprocedure(
        'goals.goal_phase_start(text,date,uuid,date,text,jsonb)'
      ) IS NOT NULL,
      'rateArgumentCount', (
        SELECT count(*)::integer
        FROM pg_proc p
        CROSS JOIN LATERAL unnest(p.proargnames) AS argument_name
        WHERE p.oid = 'goals.goal_phase_start(text,date,uuid,date,text,jsonb,numeric)'::regprocedure
          AND argument_name = 'p_zielrate_pct_kg_woche'
      ),
      'storedRate', (
        SELECT zielrate_pct_kg_woche
        FROM goals.goal_phases
        WHERE id = (SELECT message::uuid FROM g531_result WHERE fall = 'fat_loss_valid')
      ),
      'fatLossMissing', (
        SELECT sqlstate || ':' || constraint_name
        FROM g531_result WHERE fall = 'fat_loss_missing'
      ),
      'leanBulkWrongSign', (
        SELECT sqlstate || ':' || constraint_name
        FROM g531_result WHERE fall = 'lean_bulk_wrong_sign'
      ),
      'peakWeekWithRate', (
        SELECT sqlstate || ':' || constraint_name
        FROM g531_result WHERE fall = 'peak_week_with_rate'
      ),
      'secondActivePhase', (
        SELECT sqlstate || ':' || message
        FROM g531_result WHERE fall = 'second_active_phase'
      ),
      'unauthenticatedStart', (
        SELECT sqlstate || ':' || message
        FROM g531_result WHERE fall = 'unauthenticated_start'
      ),
      'unauthenticatedEnd', (
        SELECT sqlstate || ':' || message
        FROM g531_result WHERE fall = 'unauthenticated_end'
      ),
      'unauthenticatedResponse', (
        SELECT sqlstate || ':' || message
        FROM g531_result WHERE fall = 'unauthenticated_response'
      ),
      'acceptedResponse', (
        SELECT message FROM g531_result WHERE fall = 'accepted_response'
      ),
      'foreignResponse', (
        SELECT sqlstate || ':' || message
        FROM g531_result WHERE fall = 'foreign_response'
      ),
      'directLegacyClaimReads', (
        SELECT count(*)::integer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'goals'
          AND p.proname IN (
            'goal_phase_start', 'goal_phase_end', 'phase_transition_respond'
          )
          AND p.prosrc LIKE '%request.jwt.claim.sub%'
      ),
      'authUidReaders', (
        SELECT count(*)::integer
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'goals'
          AND p.proname IN (
            'goal_phase_start', 'goal_phase_end', 'phase_transition_respond'
          )
          AND p.prosrc LIKE '%auth.uid()%'
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.newSignature, true)
  assert.equal(result.oldSignature, false)
  assert.equal(result.rateArgumentCount, 1)
  assert.equal(result.storedRate, -0.5)
  assert.equal(
    result.fatLossMissing,
    '23514:goal_phases_zielrate_passt_zur_art',
  )
  assert.equal(
    result.leanBulkWrongSign,
    '23514:goal_phases_zielrate_passt_zur_art',
  )
  assert.equal(
    result.peakWeekWithRate,
    '23514:goal_phases_zielrate_passt_zur_art',
  )
  assert.match(result.secondActivePhase, /^23505:goal_phase_start: zuerst die laufende Phase beenden$/)
  assert.equal(result.unauthenticatedStart, '42501:goal_phase_start: Anmeldung erforderlich')
  assert.equal(result.unauthenticatedEnd, '42501:goal_phase_end: Anmeldung erforderlich')
  assert.equal(
    result.unauthenticatedResponse,
    'P0001:phase_transition_respond: Anmeldung erforderlich',
  )
  assert.equal(result.acceptedResponse, 'accepted')
  assert.equal(
    result.foreignResponse,
    'P0001:phase_transition_respond: eigene Phase nicht gefunden',
  )
  assert.equal(result.directLegacyClaimReads, 0)
  assert.equal(result.authUidReaders, 3)
})
