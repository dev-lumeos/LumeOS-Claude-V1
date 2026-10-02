import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-511 braucht eine Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-511: eigene Supplement-Vorlieben liefern Defaults, Lieblingsmarken zuerst und nur Supplement-Allergien', () => {
  const result = one<{
    defaults: { preferred_brands: string[]; only_on_market: boolean }
    written: { preferred_brands: string[]; supplement_allergies: Array<{ art: string; stoff_code: string }> }
    afterSecondSurface: { preferred_brands: string[]; preferred_forms: string[]; note: string }
    firstBrands: string[]
    foreignReadIsNull: boolean
    hasAllergyColumn: boolean
    fieldSources: Record<string, string>
    anonReadExecute: boolean
    authenticatedReadExecute: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('c5110000-0000-0000-0000-000000000001', 'c511-owner@example.test', '{}'::jsonb, now()),
      ('c5110000-0000-0000-0000-000000000002', 'c511-other@example.test', '{}'::jsonb, now());
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle) VALUES
      ('c5110000-0000-0000-0000-000000000001', 'supplements:magnesium_stearate', 'Magnesium Stearate', 'supplement', 'allergie', 'c511-test'),
      ('c5110000-0000-0000-0000-000000000001', 'nutrition:contains_lactose', 'Lactose', 'nahrung', 'allergie', 'c511-test');
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', 'c5110000-0000-0000-0000-000000000001', true);
    CREATE TEMP TABLE c511_defaults ON COMMIT DROP AS
      SELECT supplements.supplement_preferences_read('c5110000-0000-0000-0000-000000000001') AS value;
    CREATE TEMP TABLE c511_written ON COMMIT DROP AS
      SELECT supplements.supplement_preferences_write(
        'c5110000-0000-0000-0000-000000000001',
        'supplement_preferences',
        '{"preferred_brands":["NOW","BulkSupplements.com"],"avoided_ingredients":["Sucralose"],"only_on_market":true,"preferred_forms":["capsule"],"preferred_intake_times":["08:00","20:00"],"note":"C-511 test"}'::jsonb
      ) AS value;
    CREATE TEMP TABLE c511_second_surface ON COMMIT DROP AS
      SELECT supplements.supplement_preferences_write(
        'c5110000-0000-0000-0000-000000000001',
        'settings',
        '{"note":"Settings note"}'::jsonb
      ) AS value;
    CREATE TEMP TABLE c511_preferences_resave ON COMMIT DROP AS
      SELECT supplements.supplement_preferences_write(
        'c5110000-0000-0000-0000-000000000001',
        'supplement_preferences',
        '{"preferred_forms":["powder"]}'::jsonb
      ) AS value;
    CREATE TEMP TABLE c511_brands ON COMMIT DROP AS
      SELECT * FROM supplements.supplement_brand_options('c5110000-0000-0000-0000-000000000001', NULL, 25);
    SELECT set_config('request.jwt.claim.sub', 'c5110000-0000-0000-0000-000000000002', true);
    CREATE TEMP TABLE c511_foreign ON COMMIT DROP AS
      SELECT supplements.supplement_preferences_read('c5110000-0000-0000-0000-000000000001') AS value;
    RESET ROLE;
    SELECT json_build_object(
      'defaults', (SELECT value FROM c511_defaults),
      'written', (SELECT value FROM c511_written),
      'afterSecondSurface', (SELECT value FROM c511_preferences_resave),
      'firstBrands', (SELECT array_agg(marke ORDER BY sort_position) FROM c511_brands WHERE is_preferred),
      'foreignReadIsNull', (SELECT value IS NULL FROM c511_foreign),
      'hasAllergyColumn', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'supplements' AND table_name = 'supplement_preferences' AND column_name ILIKE '%allerg%'
      ),
      'fieldSources', (SELECT field_sources FROM supplements.supplement_preferences
        WHERE user_id = 'c5110000-0000-0000-0000-000000000001'),
      'anonReadExecute', has_function_privilege('anon', 'supplements.supplement_preferences_read(uuid)', 'EXECUTE'),
      'authenticatedReadExecute', has_function_privilege('authenticated', 'supplements.supplement_preferences_read(uuid)', 'EXECUTE')
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.defaults.preferred_brands, [])
  assert.equal(result.defaults.only_on_market, true)
  assert.deepEqual(result.written.preferred_brands, ['BulkSupplements.com', 'NOW'])
  assert.deepEqual(result.written.supplement_allergies.map(item => item.art), ['supplement'])
  assert.deepEqual(result.firstBrands, ['BulkSupplements.com', 'NOW'])
  assert.deepEqual(result.afterSecondSurface.preferred_brands, ['BulkSupplements.com', 'NOW'])
  assert.deepEqual(result.afterSecondSurface.preferred_forms, ['powder'])
  assert.equal(result.afterSecondSurface.note, 'Settings note')
  assert.equal(result.fieldSources.preferred_brands, 'supplement_preferences')
  assert.equal(result.fieldSources.preferred_forms, 'supplement_preferences')
  assert.equal(result.fieldSources.note, 'settings')
  assert.equal(result.foreignReadIsNull, true)
  assert.equal(result.hasAllergyColumn, false)
  assert.equal(result.anonReadExecute, false)
  assert.equal(result.authenticatedReadExecute, true)
})
