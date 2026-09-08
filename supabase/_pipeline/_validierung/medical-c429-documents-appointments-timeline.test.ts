// C-429/E-74: Originale bleiben private Storage-Objekte; Termine und
// Nutzerzitate sind eigene Daten. Der Test laeuft nur auf Wegwerf-Datenbanken.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-429-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

// eigener Testnamensraum; c4290000-* gehoert dem persistenten Seedbestand.
const OWNER = 'c429f000-0000-0000-0000-000000000001'
const OTHER = 'c429f000-0000-0000-0000-000000000002'
const REPORT = 'c429f000-0000-0000-0000-000000000011'
const APPOINTMENT = 'c429f000-0000-0000-0000-000000000021'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-429: Original, Termine und zitierte Medical-Ereignisse sind privat und vollstaendig', () => {
  const result = one<{
    privateBucket: boolean
    originalBytes: number | null
    linkedOriginal: string | null
    appointmentRowsOwner: number
    appointmentRowsOther: number
    eventRowsOwner: number
    eventRowsOther: number
    foreignAppointmentWriteDenied: boolean
    foreignEventWriteDenied: boolean
    provenanceComplete: number
    timelineRows: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${OWNER}'::uuid, 'c429-owner@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c429-other@example.test', '{}'::jsonb, now());

    -- Bucket-Konfiguration ist Verwaltungsdaten und absichtlich nicht an
    -- authenticated vergeben. Die Eigenschaft wird daher vor dem Rollenwechsel
    -- ermittelt; Objektzugriff und RLS folgen als Nutzer.
    CREATE TEMP TABLE c429_bucket AS
      SELECT NOT public AS private_bucket
      FROM storage.buckets WHERE id = 'medical-originals';
    GRANT SELECT ON c429_bucket TO authenticated;

    SET LOCAL ROLE authenticated;
    SET LOCAL "request.jwt.claim.sub" = '${OWNER}';

    INSERT INTO medical.lab_reports (id, user_id, report_date, title, source, source_detail)
    VALUES ('${REPORT}'::uuid, '${OWNER}'::uuid, DATE '2026-09-08',
            'C-429 Originalbefund', 'pdf_upload', 'Vom Nutzer hochgeladen');

    INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
    VALUES (
      'medical-originals',
      '${OWNER}/${REPORT}/c429-originalbefund.pdf',
      '${OWNER}',
      '{"size":241,"mimetype":"application/pdf"}'::jsonb
    );

    SELECT medical.attach_lab_report_original(
      '${REPORT}'::uuid,
      '${OWNER}/${REPORT}/c429-originalbefund.pdf'
    );

    INSERT INTO medical.appointments (
      id, user_id, appointment_type, starts_at, time_zone, status, lab_report_id
    ) VALUES (
      '${APPOINTMENT}'::uuid, '${OWNER}'::uuid, 'labor',
      '2026-09-12 09:30:00+07'::timestamptz, 'Asia/Bangkok', 'scheduled', '${REPORT}'::uuid
    );

    INSERT INTO medical.health_events (
      user_id, event_type, occurred_on, title, source_kind, source_actor,
      source_recorded_at, source_lab_report_id
    ) VALUES
      ('${OWNER}'::uuid, 'diagnosis', DATE '2021-04-15', 'Arztzitat: Kniearthrose', 'clinician', 'Dr. Beispiel', '2021-04-15 10:00:00+07', '${REPORT}'::uuid),
      ('${OWNER}'::uuid, 'treatment', DATE '2021-05-02', 'Arztzitat: Physiotherapie verordnet', 'clinician', 'Dr. Beispiel', '2021-05-02 10:00:00+07', '${REPORT}'::uuid),
      ('${OWNER}'::uuid, 'operation', DATE '2022-01-20', 'Arztzitat: Knieoperation dokumentiert', 'document', 'OP-Bericht', '2022-01-20 10:00:00+07', '${REPORT}'::uuid);

    CREATE TEMP TABLE c429_owner AS
    SELECT
      (SELECT count(*)::integer FROM medical.appointments) AS appointment_rows,
      (SELECT count(*)::integer FROM medical.health_events) AS event_rows,
      (SELECT count(*)::integer FROM medical.health_timeline) AS timeline_rows,
      (SELECT count(*)::integer FROM medical.health_events
       WHERE source_kind IS NOT NULL AND btrim(source_actor) <> ''
         AND source_recorded_at IS NOT NULL AND source_lab_report_id IS NOT NULL) AS provenance_complete,
      (SELECT private_bucket FROM c429_bucket) AS private_bucket,
      (SELECT file_ref FROM medical.lab_reports WHERE id = '${REPORT}'::uuid) AS linked_original,
      (SELECT (metadata ->> 'size')::integer FROM storage.objects
       WHERE bucket_id = 'medical-originals'
         AND name = '${OWNER}/${REPORT}/c429-originalbefund.pdf') AS original_bytes;

    SET LOCAL "request.jwt.claim.sub" = '${OTHER}';
    CREATE TEMP TABLE c429_other AS
    SELECT
      (SELECT count(*)::integer FROM medical.appointments WHERE user_id = '${OWNER}'::uuid) AS appointment_rows,
      (SELECT count(*)::integer FROM medical.health_events WHERE user_id = '${OWNER}'::uuid) AS event_rows;

    CREATE TEMP TABLE c429_denied (appointment_write boolean NOT NULL, event_write boolean NOT NULL);
    DO $$
    DECLARE
      appointment_denied boolean := false;
      event_denied boolean := false;
    BEGIN
      BEGIN
        INSERT INTO medical.appointments (user_id, appointment_type, starts_at, time_zone, status)
        VALUES ('${OWNER}'::uuid, 'doctor', now(), 'UTC', 'scheduled');
      EXCEPTION WHEN insufficient_privilege THEN appointment_denied := true;
      END;
      BEGIN
        INSERT INTO medical.health_events (
          user_id, event_type, occurred_on, title, source_kind, source_actor, source_recorded_at
        ) VALUES ('${OWNER}'::uuid, 'diagnosis', CURRENT_DATE, 'fremd', 'user', 'Fremdkonto', now());
      EXCEPTION WHEN insufficient_privilege THEN event_denied := true;
      END;
      INSERT INTO c429_denied VALUES (appointment_denied, event_denied);
    END $$;

    SELECT json_build_object(
      'privateBucket', (SELECT private_bucket FROM c429_owner),
      'originalBytes', (SELECT original_bytes FROM c429_owner),
      'linkedOriginal', (SELECT linked_original FROM c429_owner),
      'appointmentRowsOwner', (SELECT appointment_rows FROM c429_owner),
      'appointmentRowsOther', (SELECT appointment_rows FROM c429_other),
      'eventRowsOwner', (SELECT event_rows FROM c429_owner),
      'eventRowsOther', (SELECT event_rows FROM c429_other),
      'foreignAppointmentWriteDenied', (SELECT appointment_write FROM c429_denied),
      'foreignEventWriteDenied', (SELECT event_write FROM c429_denied),
      'provenanceComplete', (SELECT provenance_complete FROM c429_owner),
      'timelineRows', (SELECT timeline_rows FROM c429_owner)
    );
    ROLLBACK;
  `)

  assert.equal(result.privateBucket, true)
  assert.equal(result.originalBytes, 241)
  assert.equal(result.linkedOriginal, `${OWNER}/${REPORT}/c429-originalbefund.pdf`)
  assert.equal(result.appointmentRowsOwner, 1)
  assert.equal(result.appointmentRowsOther, 0)
  assert.equal(result.eventRowsOwner, 3)
  assert.equal(result.eventRowsOther, 0)
  assert.equal(result.foreignAppointmentWriteDenied, true)
  assert.equal(result.foreignEventWriteDenied, true)
  assert.equal(result.provenanceComplete, 3)
  assert.equal(result.timelineRows, 4) // drei Zitate plus der verknuepfte Laborbefund
})
