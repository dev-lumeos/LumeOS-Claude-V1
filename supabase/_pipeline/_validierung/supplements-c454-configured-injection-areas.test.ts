// C-454 / E-79: Die Nutzerauswahl ist je Substanz und Flaeche getrennt vom
// Fachkatalog. Nur mehr als eine konfigurierte Flaeche darf eine Rotation ergeben.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C454_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-454-Test braucht LUMEOS_C454_DATABASE als Wegwerf-Datenbank, nie postgres.')

const CLIENT = 'c4540000-0000-0000-0000-000000000001'
const OTHER = 'c4540000-0000-0000-0000-000000000002'

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  const start = output.indexOf('{')
  return JSON.parse(start >= 0 ? output.slice(start) : output) as T
}

test('C-454: Auswahl erlaubt E-79-Trizeps, bleibt privat und suggeriert bei nur einer Flaeche nichts', () => {
  const result = sql<{
    columns: string[]
    ownRows: number
    foreignRows: number
    tricepsHasCatalogKnowledge: boolean
    oneAreaSuggestions: number
    twoAreaSuggestions: string[]
    foreignInsertDenied: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('${CLIENT}'::uuid, 'c454-client@example.test', '{}'::jsonb, now()),
      ('${OTHER}'::uuid, 'c454-other@example.test', '{}'::jsonb, now());
    CREATE TEMP TABLE c454_refusal (foreign_insert_denied boolean NOT NULL DEFAULT false);
    INSERT INTO c454_refusal DEFAULT VALUES;
    GRANT SELECT, UPDATE ON c454_refusal TO authenticated;
    CREATE TEMP TABLE c454_result (
      columns jsonb, own_rows integer, foreign_rows integer, triceps_has_catalog_knowledge boolean,
      one_area_suggestions integer, two_area_suggestions jsonb, foreign_insert_denied boolean
    );
    GRANT SELECT, INSERT ON c454_result TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '${CLIENT}', true);
    INSERT INTO medical.user_injection_site_selections (
      user_id, substance_id, route, body_area_code, needle_gauge, needle_length_in
    ) VALUES (
      '${CLIENT}'::uuid,
      (SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route = 'injection_subq' ORDER BY supplement_id LIMIT 1),
      'injection_subq', 'triceps', '29G', 0.50
    );
    CREATE TEMP TABLE c454_one AS
      SELECT * FROM medical.suggest_configured_injection_area(
        (SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route = 'injection_subq' ORDER BY supplement_id LIMIT 1),
        'injection_subq'
      );
    INSERT INTO medical.user_injection_site_selections (
      user_id, substance_id, route, body_area_code
    ) VALUES (
      '${CLIENT}'::uuid,
      (SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route = 'injection_subq' ORDER BY supplement_id LIMIT 1),
      'injection_subq', 'abs'
    );
    CREATE TEMP TABLE c454_two AS
      SELECT * FROM medical.suggest_configured_injection_area(
        (SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route = 'injection_subq' ORDER BY supplement_id LIMIT 1),
        'injection_subq'
      );
    SELECT set_config('request.jwt.claim.sub', '${OTHER}', true);
    CREATE TEMP TABLE c454_foreign AS SELECT count(*)::integer AS n FROM medical.user_injection_site_selections WHERE user_id = '${CLIENT}'::uuid;
    DO \$\$
    BEGIN
      BEGIN
        INSERT INTO medical.user_injection_site_selections (user_id, substance_id, route, body_area_code)
        VALUES ('${CLIENT}'::uuid, (SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route = 'injection_subq' ORDER BY supplement_id LIMIT 1), 'injection_subq', 'abs');
      EXCEPTION WHEN insufficient_privilege THEN
        UPDATE c454_refusal SET foreign_insert_denied = true;
      END;
    END \$\$;
    SELECT set_config('request.jwt.claim.sub', '${CLIENT}', true);
    INSERT INTO c454_result
    SELECT
      (SELECT json_agg(column_name ORDER BY column_name) FROM information_schema.columns WHERE table_schema='medical' AND table_name='user_injection_site_selections'),
      (SELECT count(*)::integer FROM medical.user_injection_site_selections WHERE user_id='${CLIENT}'::uuid),
      (SELECT n FROM c454_foreign),
      (SELECT NOT has_catalog_knowledge FROM medical.configured_injection_areas((SELECT supplement_id FROM supplements.supplement_pharmacology WHERE route='injection_subq' ORDER BY supplement_id LIMIT 1), 'injection_subq') WHERE body_area_code='triceps'),
      (SELECT count(*)::integer FROM c454_one),
      (SELECT json_agg(body_area_code ORDER BY body_area_code) FROM c454_two),
      (SELECT foreign_insert_denied FROM c454_refusal);
    RESET ROLE;
    SELECT json_build_object(
      'columns', columns, 'ownRows', own_rows, 'foreignRows', foreign_rows,
      'tricepsHasCatalogKnowledge', triceps_has_catalog_knowledge,
      'oneAreaSuggestions', one_area_suggestions, 'twoAreaSuggestions', two_area_suggestions,
      'foreignInsertDenied', foreign_insert_denied
    ) FROM c454_result;
    ROLLBACK;
  `)

  assert.deepEqual(result.columns, ['body_area_code', 'created_at', 'id', 'needle_gauge', 'needle_length_in', 'route', 'substance_id', 'updated_at', 'user_id'])
  assert.equal(result.ownRows, 2)
  assert.equal(result.foreignRows, 0)
  assert.equal(result.tricepsHasCatalogKnowledge, true)
  assert.equal(result.oneAreaSuggestions, 0)
  assert.deepEqual(result.twoAreaSuggestions, ['abs'])
  assert.equal(result.foreignInsertDenied, true)
})
