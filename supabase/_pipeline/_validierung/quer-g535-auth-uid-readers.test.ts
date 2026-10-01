// G-535: Anwendungsfunktionen lesen die Sitzung ueber Supabases auth.uid().
// Nur auth.uid selbst darf den alten Singular-GUC als Kompatibilitaetsweg
// enthalten; diese Freistellung gilt am Namen, nicht fuer das Textmuster.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-535 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

const targetFunctions = [
  'coach.raise_alert',
  'goals.body_circumference_write',
  'medical.import_lab_report_rows',
  'medical.start_lab_report_ocr',
  'medical.store_lab_report_ocr_result',
  'nutrition.meal_plan_set_next_plan',
]

const targetFunctionsSql = `ARRAY[${targetFunctions.map((name) => `'${name}'`).join(', ')}]::text[]`

test('G-535 A2-A5: sechs Leser nutzen auth.uid, Singular bleibt nur im Supabase-Helper', () => {
  const result = one<{
    signatures: string[]
    targetLegacyReaders: string[]
    targetAuthUidReaders: string[]
    forbiddenLegacyReaders: string[]
    authUidCompatibilityHelpers: string[]
    authUidDefinitions: number
  }>(`
    WITH functions AS (
      SELECT
        p.oid,
        n.nspname AS schema_name,
        p.proname,
        n.nspname || '.' || p.proname AS qualified_name,
        pg_get_function_identity_arguments(p.oid) AS identity_arguments,
        pg_get_functiondef(p.oid) AS definition
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.prokind = 'f'
    )
    SELECT json_build_object(
      'signatures', (
        SELECT json_agg(
          qualified_name || '(' || identity_arguments || ')'
          ORDER BY qualified_name
        )
        FROM functions
        WHERE qualified_name = ANY (${targetFunctionsSql})
      ),
      'targetLegacyReaders', (
        SELECT coalesce(json_agg(qualified_name ORDER BY qualified_name), '[]'::json)
        FROM functions
        WHERE qualified_name = ANY (${targetFunctionsSql})
          AND definition LIKE '%request.jwt.claim.sub%'
      ),
      'targetAuthUidReaders', (
        SELECT coalesce(json_agg(qualified_name ORDER BY qualified_name), '[]'::json)
        FROM functions
        WHERE qualified_name = ANY (${targetFunctionsSql})
          AND definition LIKE '%auth.uid(%'
      ),
      'forbiddenLegacyReaders', (
        SELECT coalesce(json_agg(qualified_name ORDER BY qualified_name), '[]'::json)
        FROM functions
        WHERE definition LIKE '%request.jwt.claim.sub%'
          -- Supabases auth.uid ist der kanonische Kompatibilitaets-Helper:
          -- nur er darf Singular und Plural zusammenfuehren.
          AND NOT (schema_name = 'auth' AND proname = 'uid')
      ),
      'authUidCompatibilityHelpers', (
        SELECT coalesce(json_agg(qualified_name ORDER BY qualified_name), '[]'::json)
        FROM functions
        WHERE definition LIKE '%request.jwt.claim.sub%'
          AND schema_name = 'auth' AND proname = 'uid'
          AND definition LIKE '%request.jwt.claims%'
      ),
      'authUidDefinitions', count(*) FILTER (WHERE definition LIKE '%auth.uid(%')
    )
    FROM functions;
  `)

  assert.equal(result.signatures.length, 6)
  assert.deepEqual(result.targetLegacyReaders, [])
  assert.deepEqual(result.targetAuthUidReaders, targetFunctions)
  assert.deepEqual(result.forbiddenLegacyReaders, [])
  assert.deepEqual(result.authUidCompatibilityHelpers, ['auth.uid'])
  // Neue Fachfunktionen duerfen auth.uid spaeter ebenfalls verwenden; der
  // dauerhafte Waechter verbietet nur neue direkte Leser des alten GUC.
  assert.ok(result.authUidDefinitions >= targetFunctions.length)
})

test('G-535 A1/A2: alle sechs Funktionen erreichen mit pluralem Claim ihren Fachpfad', () => {
  const result = one<{
    outcomes: Record<string, { ok: boolean; state: string | null; message: string | null }>
    nullUserRows: number
    ownAlerts: number
    ownCircumferences: number
    ownLabReports: number
    linkedMealPlans: number
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('53500000-0000-4000-8000-000000000001', 'test-user@lumeos.local', '{}'::jsonb, now()),
      ('53500000-0000-4000-8000-000000000002', 'g535-client@lumeos.local', '{}'::jsonb, now()),
      ('53500000-0000-4000-8000-000000000003', 'g535-other@lumeos.local', '{}'::jsonb, now());

    INSERT INTO coach.relationships (
      coach_id, client_id, status, started_at, changed_by
    ) VALUES (
      '53500000-0000-4000-8000-000000000001',
      '53500000-0000-4000-8000-000000000002',
      'active', now(), '53500000-0000-4000-8000-000000000001'
    );

    INSERT INTO medical.lab_reports (
      id, user_id, report_date, source, file_ref
    ) VALUES (
      '53500000-0000-4000-8000-000000000010',
      '53500000-0000-4000-8000-000000000001',
      current_date, 'pdf_upload', 'g535/original.pdf'
    );

    INSERT INTO nutrition.meal_plans (id, user_id, name) VALUES
      ('53500000-0000-4000-8000-000000000020',
       '53500000-0000-4000-8000-000000000001', 'G535 Quelle'),
      ('53500000-0000-4000-8000-000000000021',
       '53500000-0000-4000-8000-000000000001', 'G535 Folgeplan');

    CREATE TEMP TABLE g535_outcome (
      name text PRIMARY KEY,
      ok boolean NOT NULL,
      state text,
      message text
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g535_outcome TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config(
      'request.jwt.claims',
      '{"sub":"53500000-0000-4000-8000-000000000001","role":"authenticated"}',
      true
    );

    DO $block$
    BEGIN
      BEGIN
        PERFORM coach.raise_alert(
          '53500000-0000-4000-8000-000000000002', 'checkin_overdue',
          'medium', 'G535', 'Pluraler Claim', '{}'::jsonb
        );
        INSERT INTO g535_outcome VALUES ('coach.raise_alert', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES ('coach.raise_alert', false, SQLSTATE, SQLERRM);
      END;

      BEGIN
        PERFORM goals.body_circumference_write(
          p_measurement_date := current_date,
          p_measurement_time := TIME '07:35',
          p_waist_cm := 82
        );
        INSERT INTO g535_outcome VALUES ('goals.body_circumference_write', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES ('goals.body_circumference_write', false, SQLSTATE, SQLERRM);
      END;

      BEGIN
        PERFORM * FROM medical.import_lab_report_rows(
          '53500000-0000-4000-8000-000000000001', current_date, NULL,
          'G535 Labor', 'Pluraler Claim', 'lab_import', '[]'::jsonb
        );
        INSERT INTO g535_outcome VALUES ('medical.import_lab_report_rows', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES ('medical.import_lab_report_rows', false, SQLSTATE, SQLERRM);
      END;

      BEGIN
        PERFORM * FROM medical.import_lab_report_rows(
          '53500000-0000-4000-8000-000000000003', current_date, NULL,
          'G535 Fremdlabor', 'Fremder Nutzer', 'lab_import', '[]'::jsonb
        );
        INSERT INTO g535_outcome VALUES ('medical.import_lab_report_rows.foreign', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES (
          'medical.import_lab_report_rows.foreign', false, SQLSTATE, SQLERRM
        );
      END;

      BEGIN
        PERFORM * FROM medical.start_lab_report_ocr(
          '53500000-0000-4000-8000-000000000010'
        );
        INSERT INTO g535_outcome VALUES ('medical.start_lab_report_ocr', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES ('medical.start_lab_report_ocr', false, SQLSTATE, SQLERRM);
      END;

      BEGIN
        PERFORM * FROM medical.store_lab_report_ocr_result(
          '53500000-0000-4000-8000-000000000010',
          '{"model":"g535"}'::jsonb,
          '[{"biomarker_name":"G535","unit":"mg/dL","confidence":0.95}]'::jsonb
        );
        INSERT INTO g535_outcome VALUES ('medical.store_lab_report_ocr_result', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES (
          'medical.store_lab_report_ocr_result', false, SQLSTATE, SQLERRM
        );
      END;

      BEGIN
        PERFORM nutrition.meal_plan_set_next_plan(
          '53500000-0000-4000-8000-000000000020',
          '53500000-0000-4000-8000-000000000021'
        );
        INSERT INTO g535_outcome VALUES ('nutrition.meal_plan_set_next_plan', true, NULL, NULL);
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_outcome VALUES (
          'nutrition.meal_plan_set_next_plan', false, SQLSTATE, SQLERRM
        );
      END;
    END
    $block$;

    RESET ROLE;
    SELECT json_build_object(
      'outcomes', (
        SELECT json_object_agg(
          name, json_build_object('ok', ok, 'state', state, 'message', message)
          ORDER BY name
        )
        FROM g535_outcome
      ),
      'nullUserRows',
        (SELECT count(*) FROM coach.alerts WHERE coach_id IS NULL OR created_by IS NULL)
        + (SELECT count(*) FROM goals.body_circumferences WHERE user_id IS NULL)
        + (SELECT count(*) FROM medical.lab_reports WHERE user_id IS NULL)
        + (SELECT count(*) FROM medical.lab_result_values WHERE user_id IS NULL)
        + (SELECT count(*) FROM nutrition.meal_plans WHERE user_id IS NULL),
      'ownAlerts', (
        SELECT count(*) FROM coach.alerts
        WHERE coach_id = '53500000-0000-4000-8000-000000000001'
      ),
      'ownCircumferences', (
        SELECT count(*) FROM goals.body_circumferences
        WHERE user_id = '53500000-0000-4000-8000-000000000001'
          AND measurement_time = TIME '07:35'
      ),
      'ownLabReports', (
        SELECT count(*) FROM medical.lab_reports
        WHERE user_id = '53500000-0000-4000-8000-000000000001'
      ),
      'linkedMealPlans', (
        SELECT count(*) FROM nutrition.meal_plans
        WHERE id = '53500000-0000-4000-8000-000000000020'
          AND next_plan_id = '53500000-0000-4000-8000-000000000021'
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.outcomes, {
    'coach.raise_alert': { ok: true, state: null, message: null },
    'goals.body_circumference_write': { ok: true, state: null, message: null },
    'medical.import_lab_report_rows': { ok: true, state: null, message: null },
    'medical.import_lab_report_rows.foreign': {
      ok: false,
      state: 'P0001',
      message: 'medical import: user mismatch',
    },
    'medical.start_lab_report_ocr': { ok: true, state: null, message: null },
    'medical.store_lab_report_ocr_result': { ok: true, state: null, message: null },
    'nutrition.meal_plan_set_next_plan': { ok: true, state: null, message: null },
  })
  assert.equal(result.nullUserRows, 0)
  assert.equal(result.ownAlerts, 1)
  assert.equal(result.ownCircumferences, 1)
  assert.equal(result.ownLabReports, 2)
  assert.equal(result.linkedMealPlans, 1)
})

test('G-535 A2: ohne Sitzung bleiben die fuenf ausdruecklichen Auth-Fehler gleich', () => {
  const result = one<Record<string, { state: string; message: string }>>(`
    BEGIN;
    CREATE TEMP TABLE g535_unauth (
      name text PRIMARY KEY,
      state text NOT NULL,
      message text NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g535_unauth TO authenticated;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claims', '', true);

    DO $block$
    BEGIN
      BEGIN
        PERFORM coach.raise_alert(
          '53500000-0000-4000-8000-000000000002', 'checkin_overdue',
          'medium', 'G535', 'Ohne Sitzung', '{}'::jsonb
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_unauth VALUES ('coach.raise_alert', SQLSTATE, SQLERRM);
      END;
      BEGIN
        PERFORM goals.body_circumference_write(
          p_measurement_date := current_date,
          p_measurement_time := TIME '07:35',
          p_waist_cm := 82
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_unauth VALUES ('goals.body_circumference_write', SQLSTATE, SQLERRM);
      END;
      BEGIN
        PERFORM * FROM medical.start_lab_report_ocr(
          '53500000-0000-4000-8000-000000000010'
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_unauth VALUES ('medical.start_lab_report_ocr', SQLSTATE, SQLERRM);
      END;
      BEGIN
        PERFORM * FROM medical.store_lab_report_ocr_result(
          '53500000-0000-4000-8000-000000000010', '{}'::jsonb, '[]'::jsonb
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_unauth VALUES (
          'medical.store_lab_report_ocr_result', SQLSTATE, SQLERRM
        );
      END;
      BEGIN
        PERFORM nutrition.meal_plan_set_next_plan(
          '53500000-0000-4000-8000-000000000020',
          '53500000-0000-4000-8000-000000000021'
        );
      EXCEPTION WHEN OTHERS THEN
        INSERT INTO g535_unauth VALUES (
          'nutrition.meal_plan_set_next_plan', SQLSTATE, SQLERRM
        );
      END;
    END
    $block$;

    RESET ROLE;
    SELECT json_object_agg(
      name, json_build_object('state', state, 'message', message)
      ORDER BY name
    ) FROM g535_unauth;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    'coach.raise_alert': {
      state: '42501', message: 'active own relationship required',
    },
    'goals.body_circumference_write': {
      state: '42501', message: 'body_circumference_write: Anmeldung erforderlich',
    },
    'medical.start_lab_report_ocr': {
      state: '28000', message: 'medical OCR: authentication required',
    },
    'medical.store_lab_report_ocr_result': {
      state: '28000', message: 'medical OCR: authentication required',
    },
    'nutrition.meal_plan_set_next_plan': {
      state: '42501', message: 'meal_plan_set_next_plan: Anmeldung erforderlich',
    },
  })
})
