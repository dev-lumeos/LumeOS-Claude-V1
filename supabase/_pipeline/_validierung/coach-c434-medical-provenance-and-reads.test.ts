// C-434/E-74: Medical-Freigabe ist nur bei full lesbar; Originale bleiben privat.
// Ausschliesslich gegen eine explizite Wegwerf-Datenbank ausfuehren.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C434_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-434-Test braucht LUMEOS_C434_DATABASE als explizite Wegwerf-Datenbank, nie postgres.')

const CLIENT = 'c434f000-0000-0000-0000-000000000001'
const FULL_COACH = 'c434f000-0000-0000-0000-000000000002'
const SUMMARY_COACH = 'c434f000-0000-0000-0000-000000000003'
const REPORT = 'c434f000-0000-0000-0000-000000000011'
const APPOINTMENT = 'c434f000-0000-0000-0000-000000000021'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function asUser<T>(userId: string, statement: string): T {
  return sql<T>(`BEGIN; SET LOCAL ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${userId}', true); ${statement}; COMMIT;`)
}

test('C-434: full sieht neue Medical-Zeilen, summary und Storage bleiben gesperrt', () => {
  const columnsBeforeFixture = sql<{ medications: number; conditions: number; appointments: number }>(`
    SELECT json_build_object(
      'medications', (SELECT count(*)::integer FROM information_schema.columns
                      WHERE table_schema = 'medical' AND table_name = 'user_medications'
                        AND column_name IN ('source_kind', 'source_actor', 'source_recorded_at', 'source_lab_report_id')),
      'conditions', (SELECT count(*)::integer FROM information_schema.columns
                     WHERE table_schema = 'medical' AND table_name = 'user_conditions'
                       AND column_name IN ('source_kind', 'source_actor', 'source_recorded_at', 'source_lab_report_id')),
      'appointments', (SELECT count(*)::integer FROM information_schema.columns
                       WHERE table_schema = 'medical' AND table_name = 'appointments'
                         AND column_name IN ('source_kind', 'source_actor', 'source_recorded_at', 'source_lab_report_id'))
    );
  `)

  assert.deepEqual(columnsBeforeFixture, { medications: 4, conditions: 4, appointments: 4 })

  sql(`
    DELETE FROM medical.appointments WHERE id = '${APPOINTMENT}'::uuid;
    DELETE FROM medical.health_events WHERE user_id = '${CLIENT}'::uuid;
    DELETE FROM medical.user_medications WHERE user_id = '${CLIENT}'::uuid;
    DELETE FROM medical.user_conditions WHERE user_id = '${CLIENT}'::uuid;
    DELETE FROM medical.lab_reports WHERE id = '${REPORT}'::uuid;
    DELETE FROM storage.objects WHERE bucket_id = 'medical-originals' AND name = '${CLIENT}/${REPORT}.pdf';
    ALTER TABLE coach.client_permissions DISABLE TRIGGER client_permissions_change_log;
    DELETE FROM coach.client_permissions WHERE coach_id IN ('${FULL_COACH}'::uuid, '${SUMMARY_COACH}'::uuid);
    DELETE FROM auth.users WHERE id IN ('${CLIENT}'::uuid, '${FULL_COACH}'::uuid, '${SUMMARY_COACH}'::uuid);

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${CLIENT}'::uuid, 'c434-client@example.test', '{}'::jsonb, now()),
      ('${FULL_COACH}'::uuid, 'c434-full@example.test', '{}'::jsonb, now()),
      ('${SUMMARY_COACH}'::uuid, 'c434-summary@example.test', '{}'::jsonb, now());
    INSERT INTO coach.client_permissions (coach_id, client_id, medical_visibility) VALUES
      ('${FULL_COACH}'::uuid, '${CLIENT}'::uuid, 'full'),
      ('${SUMMARY_COACH}'::uuid, '${CLIENT}'::uuid, 'summary');
    ALTER TABLE coach.client_permissions ENABLE TRIGGER client_permissions_change_log;
    INSERT INTO medical.lab_reports (id, user_id, report_date, title, source, source_detail)
    VALUES ('${REPORT}'::uuid, '${CLIENT}'::uuid, DATE '2099-01-15',
            'C434 source report', 'seed', 'C434 fixture');
    INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
    VALUES ('medical-originals', '${CLIENT}/${REPORT}.pdf', '${CLIENT}',
            '{"size":128,"mimetype":"application/pdf"}'::jsonb);
    SELECT json_build_object('prepared', true);
  `)

  sql(`
    INSERT INTO medical.appointments (
      id, user_id, appointment_type, starts_at, time_zone, status, lab_report_id,
      source_kind, source_actor, source_recorded_at, source_lab_report_id
    ) VALUES (
      '${APPOINTMENT}'::uuid, '${CLIENT}'::uuid, 'doctor',
      '2099-01-16 09:00:00+00'::timestamptz, 'UTC', 'scheduled', '${REPORT}'::uuid,
      'seed', 'C434 fixture', '2099-01-15 09:00:00+00'::timestamptz, '${REPORT}'::uuid
    );
    INSERT INTO medical.health_events (
      user_id, event_type, occurred_on, title, source_kind, source_actor, source_recorded_at, source_lab_report_id
    ) VALUES ('${CLIENT}'::uuid, 'treatment', DATE '2099-01-15', 'C434 cited event',
              'document', 'C434 fixture', '2099-01-15 09:00:00+00', '${REPORT}'::uuid);
    INSERT INTO medical.user_medications (
      user_id, name, start_date, measurement_source, source_detail,
      source_kind, source_actor, source_recorded_at, source_lab_report_id
    ) VALUES ('${CLIENT}'::uuid, 'C434 fixture medication', DATE '2099-01-15', 'seed', 'C434 fixture',
              'seed', 'C434 fixture', '2099-01-15 09:00:00+00', '${REPORT}'::uuid);
    INSERT INTO medical.user_conditions (
      user_id, condition_code, measurement_source, source_detail,
      source_kind, source_actor, source_recorded_at, source_lab_report_id
    ) VALUES ('${CLIENT}'::uuid, 'hypertension', 'seed', 'C434 fixture',
              'seed', 'C434 fixture', '2099-01-15 09:00:00+00', '${REPORT}'::uuid);
    SELECT json_build_object('fixture', true);
  `)

  const full = asUser<{ appointments: number; events: number; timeline: number; originals: number }>(FULL_COACH, `
    SELECT json_build_object(
      'appointments', (SELECT count(*)::integer FROM medical.appointments WHERE user_id = '${CLIENT}'::uuid),
      'events', (SELECT count(*)::integer FROM medical.health_events WHERE user_id = '${CLIENT}'::uuid),
      'timeline', (SELECT count(*)::integer FROM medical.health_timeline WHERE user_id = '${CLIENT}'::uuid),
      -- Der lokale Storage-Stub enthaelt ausschliesslich Metadaten: keine
      -- sichtbare Objektzeile bedeutet damit auch keinen autorisierten Bytepfad.
      'originals', (SELECT count(*)::integer FROM storage.objects
                    WHERE bucket_id = 'medical-originals' AND name = '${CLIENT}/${REPORT}.pdf')
    );
  `)
  const summary = asUser<{ appointments: number; events: number; timeline: number; originals: number }>(SUMMARY_COACH, `
    SELECT json_build_object(
      'appointments', (SELECT count(*)::integer FROM medical.appointments WHERE user_id = '${CLIENT}'::uuid),
      'events', (SELECT count(*)::integer FROM medical.health_events WHERE user_id = '${CLIENT}'::uuid),
      'timeline', (SELECT count(*)::integer FROM medical.health_timeline WHERE user_id = '${CLIENT}'::uuid),
      'originals', (SELECT count(*)::integer FROM storage.objects
                    WHERE bucket_id = 'medical-originals' AND name = '${CLIENT}/${REPORT}.pdf')
    );
  `)

  const provenance = sql<{ complete: number }>(`
    SELECT json_build_object('complete', count(*)::integer)
    FROM (
      SELECT source_kind, source_actor, source_recorded_at, source_lab_report_id
      FROM medical.user_medications WHERE user_id = '${CLIENT}'::uuid
      UNION ALL
      SELECT source_kind, source_actor, source_recorded_at, source_lab_report_id
      FROM medical.user_conditions WHERE user_id = '${CLIENT}'::uuid
      UNION ALL
      SELECT source_kind, source_actor, source_recorded_at, source_lab_report_id
      FROM medical.appointments WHERE id = '${APPOINTMENT}'::uuid
    ) p
    WHERE source_kind IS NOT NULL AND btrim(source_actor) <> ''
      AND source_recorded_at IS NOT NULL AND source_lab_report_id IS NOT NULL;
  `)

  assert.deepEqual(full, { appointments: 1, events: 1, timeline: 2, originals: 0 })
  assert.deepEqual(summary, { appointments: 0, events: 0, timeline: 0, originals: 0 })
  assert.equal(provenance.complete, 3)
})
