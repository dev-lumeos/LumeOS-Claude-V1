// C-457: OCR-Rohresultat bleibt am eigenen Laborbericht; es erzeugt keine
// medizinischen Ergebniswerte ohne ausdrueckliche Nutzerbestaetigung.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C457_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-457-Test braucht LUMEOS_C457_DATABASE als Wegwerf-Datenbank, nie postgres.')

const USER = 'c4570000-0000-0000-0000-000000000001'
const OTHER = 'c4570000-0000-0000-0000-000000000002'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  const start = output.indexOf('{')
  return JSON.parse(start >= 0 ? output.slice(start) : output) as T
}

test('C-457: OCR bleibt privat am Bericht, markiert Review und schreibt keine Werte automatisch', () => {
  const result = sql<{
    ocrColumns: string[]
    status: string
    reviewRequired: boolean
    totalMarkersFound: number
    markersNeedsReview: number
    rawResult: { model: string }
    extractedValues: Array<{ biomarker_name: string }>
    valuesWritten: number
    foreignVisible: number
    foreignMutationDenied: boolean
    anonFunctionExecutes: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${USER}'::uuid, 'c457-user@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c457-other@example.test', '{}'::jsonb, now());
    CREATE TEMP TABLE c457_refusal (foreign_mutation_denied boolean NOT NULL DEFAULT false);
    INSERT INTO c457_refusal DEFAULT VALUES;
    GRANT SELECT, UPDATE ON c457_refusal TO authenticated;
    CREATE TEMP TABLE c457_result (
      ocr_columns jsonb, status text, review_required boolean, total_markers_found integer,
      markers_needs_review integer, raw_result jsonb, extracted_values jsonb, values_written integer,
      foreign_visible integer, foreign_mutation_denied boolean, anon_function_executes integer
    );
    GRANT SELECT, INSERT ON c457_result TO authenticated;
    INSERT INTO medical.lab_reports (id, user_id, report_date, source, file_ref)
    VALUES ('c4570000-0000-0000-0000-000000000010'::uuid, '${USER}'::uuid, current_date, 'pdf_upload', 'c457/original.pdf');

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${USER}', true);
    SELECT * FROM medical.start_lab_report_ocr('c4570000-0000-0000-0000-000000000010'::uuid);
    SELECT * FROM medical.store_lab_report_ocr_result(
      'c4570000-0000-0000-0000-000000000010'::uuid,
      '{"model":"vision-test"}'::jsonb,
      '[
        {"biomarker_name":"Cholesterol, Total","value":175,"unit":"mg/dL","confidence":0.97,"needs_review":false},
        {"biomarker_name":"Unknown Marker XYZ","value":42,"unit":"?","confidence":0.45,"needs_review":true}
      ]'::jsonb
    );
    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c457_foreign AS
      SELECT count(*)::integer AS n FROM medical.lab_reports
      WHERE id = 'c4570000-0000-0000-0000-000000000010'::uuid;
    DO \$\$
    BEGIN
      BEGIN
        PERFORM medical.start_lab_report_ocr('c4570000-0000-0000-0000-000000000010'::uuid);
      EXCEPTION WHEN no_data_found THEN
        UPDATE c457_refusal SET foreign_mutation_denied = true;
      END;
    END \$\$;
    SELECT set_config('request.jwt.claim.sub', '${USER}', true);
    INSERT INTO c457_result
    SELECT
      (SELECT json_agg(column_name ORDER BY column_name)
       FROM information_schema.columns
       WHERE table_schema = 'medical' AND table_name = 'lab_reports'
         AND column_name IN ('ocr_status','ocr_results','extracted_values','review_required','total_markers_found','markers_needs_review')),
      r.ocr_status, r.review_required, r.total_markers_found, r.markers_needs_review,
      r.ocr_results, r.extracted_values,
      (SELECT count(*)::integer FROM medical.lab_result_values WHERE report_id = r.id),
      (SELECT n FROM c457_foreign),
      (SELECT foreign_mutation_denied FROM c457_refusal),
      (SELECT count(*)::integer
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'medical'
         AND p.proname IN ('start_lab_report_ocr','store_lab_report_ocr_result')
         AND has_function_privilege('anon', p.oid, 'EXECUTE'))
    FROM medical.lab_reports r
    WHERE r.id = 'c4570000-0000-0000-0000-000000000010'::uuid;
    RESET ROLE;
    SELECT json_build_object(
      'ocrColumns', ocr_columns, 'status', status, 'reviewRequired', review_required,
      'totalMarkersFound', total_markers_found, 'markersNeedsReview', markers_needs_review,
      'rawResult', raw_result, 'extractedValues', extracted_values, 'valuesWritten', values_written,
      'foreignVisible', foreign_visible, 'foreignMutationDenied', foreign_mutation_denied,
      'anonFunctionExecutes', anon_function_executes
    ) FROM c457_result;
    ROLLBACK;
  `)

  assert.deepEqual(result.ocrColumns, ['extracted_values', 'markers_needs_review', 'ocr_results', 'ocr_status', 'review_required', 'total_markers_found'])
  assert.equal(result.status, 'needs_review')
  assert.equal(result.reviewRequired, true)
  assert.equal(result.totalMarkersFound, 2)
  assert.equal(result.markersNeedsReview, 1)
  assert.deepEqual(result.rawResult, { model: 'vision-test' })
  assert.equal(result.extractedValues.length, 2)
  assert.equal(result.valuesWritten, 0)
  assert.equal(result.foreignVisible, 0)
  assert.equal(result.foreignMutationDenied, true)
  assert.equal(result.anonFunctionExecutes, 0)
})
