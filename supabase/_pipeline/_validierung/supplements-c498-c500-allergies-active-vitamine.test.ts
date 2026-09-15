import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C498_DATABASE
if (!db || db === 'postgres') throw new Error('C-498 bis C-500 brauchen LUMEOS_C498_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-498: globale Allergien haben eigene Coach-Freigabe, Log und alle Magnesiumstearat-Aliase', () => {
  const result = one<{
    table: boolean
    oldColumn: boolean
    coachPermission: boolean
    log: boolean
    matcher: boolean
    aliasNames: string[]
  }>(`
    SELECT json_build_object(
      'table', to_regclass('public.user_allergies') IS NOT NULL,
      'oldColumn', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'nutrition' AND table_name = 'food_preferences' AND column_name = 'allergies'),
      'coachPermission', to_regclass('coach.allergy_permissions') IS NOT NULL,
      'log', to_regclass('coach.allergy_permission_change_log') IS NOT NULL,
      'matcher', to_regprocedure('public.supplier_product_allergy_matches(uuid)') IS NOT NULL,
      'aliasNames', COALESCE((SELECT json_agg(alias_text ORDER BY alias_text) FROM public.allergen_aliases WHERE stoff_code = 'magnesium_stearate'), '[]'::json)
    );
  `)

  assert.equal(result.table, true)
  assert.equal(result.oldColumn, false)
  assert.equal(result.coachPermission, true)
  assert.equal(result.log, true)
  assert.equal(result.matcher, true)
  assert.deepEqual(result.aliasNames, [
    'Magnesium Stearate',
    'Magnesium Stearate (Mg Stearate)',
    'Vegetable Magnesium Stearate',
  ])
})

test('C-499: Off-Market-Produkte bleiben als Detail erhalten, kommen aber nie aus der Suche', () => {
  const result = one<{ inactive: number; searchHits: number; detailExists: boolean }>(`
    SELECT json_build_object(
      'inactive', (SELECT count(*) FROM supplements.supplier_products WHERE market_status = 'Off Market' AND is_active = false),
      'searchHits', (SELECT count(*) FROM supplements.search_supplier_products('whey', NULL, NULL, 100) s JOIN supplements.supplier_products p ON p.id = s.id WHERE p.market_status = 'Off Market'),
      'detailExists', EXISTS (
        SELECT 1 FROM supplements.supplier_products p
        WHERE p.market_status = 'Off Market'
          AND supplements.supplier_product_detail(p.id) IS NOT NULL
      )
    );
  `)

  assert.equal(result.inactive, 92821)
  assert.equal(result.searchHits, 0)
  assert.equal(result.detailExists, true)
})

test('C-498: nur der Nutzer oder sein eigens freigegebener Coach sieht Allergien und Alias-Treffer', () => {
  const result = one<{ ownMatches: number; coachMatches: number; otherMatches: number; permissionLogs: number }>(`
    BEGIN;
    INSERT INTO auth.users (id, email) VALUES
      ('00000000-0000-0000-0000-000000000498', 'c498-client@lumeos.local'),
      ('00000000-0000-0000-0000-000000000499', 'c498-coach@lumeos.local'),
      ('00000000-0000-0000-0000-000000000500', 'c498-other@lumeos.local');
    CREATE TEMP TABLE c498_result (key text PRIMARY KEY, value integer NOT NULL) ON COMMIT DROP;
    GRANT SELECT, INSERT ON c498_result TO authenticated;

    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000498', true);
    INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle)
    VALUES ('00000000-0000-0000-0000-000000000498', 'magnesium_stearate', 'Magnesium Stearate', 'supplement', 'allergie', 'test');
    INSERT INTO coach.allergy_permissions (coach_id, client_id, visibility)
    VALUES ('00000000-0000-0000-0000-000000000499', '00000000-0000-0000-0000-000000000498', 'full');
    INSERT INTO c498_result SELECT 'own', count(*)::integer FROM public.supplier_product_allergy_matches('00000000-0000-0000-0000-000000000498');

    RESET ROLE;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000499', true);
    INSERT INTO c498_result SELECT 'coach', count(*)::integer FROM public.supplier_product_allergy_matches('00000000-0000-0000-0000-000000000498');

    RESET ROLE;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000500', true);
    INSERT INTO c498_result SELECT 'other', count(*)::integer FROM public.supplier_product_allergy_matches('00000000-0000-0000-0000-000000000498');

    RESET ROLE;
    SELECT json_build_object(
      'ownMatches', (SELECT value FROM c498_result WHERE key = 'own'),
      'coachMatches', (SELECT value FROM c498_result WHERE key = 'coach'),
      'otherMatches', (SELECT value FROM c498_result WHERE key = 'other'),
      'permissionLogs', (SELECT count(*) FROM coach.allergy_permission_change_log WHERE client_id = '00000000-0000-0000-0000-000000000498')
    );
    ROLLBACK;
  `)

  assert.ok(result.ownMatches >= 56903)
  assert.equal(result.coachMatches, result.ownMatches)
  assert.equal(result.otherMatches, 0)
  assert.equal(result.permissionLogs, 1)
})

test('C-500: belegte Vitamin-E-Formen werden umgerechnet, unbekannte bleiben als Luecke sichtbar', () => {
  const result = one<{
    evidenceTable: boolean
    resolved: number
    converted: number
    stillOpen: number
  }>(`
    SELECT json_build_object(
      'evidenceTable', to_regclass('supplements.supplier_product_vitamin_e_forms') IS NOT NULL,
      'resolved', CASE WHEN to_regclass('supplements.supplier_product_vitamin_e_forms') IS NULL THEN 0 ELSE (SELECT count(*) FROM supplements.supplier_product_vitamin_e_forms WHERE vitamin_e_form IN ('natuerlich', 'synthetisch')) END,
      'converted', CASE WHEN to_regclass('supplements.supplier_product_vitamin_e_forms') IS NULL THEN 0 ELSE (SELECT count(*) FROM supplements.supplier_product_nutrients WHERE vite_mg IS NOT NULL AND luecken::text NOT LIKE '%vitamin_e_iu_form_unknown%') END,
      'stillOpen', CASE WHEN to_regclass('supplements.supplier_product_vitamin_e_forms') IS NULL THEN 0 ELSE (SELECT count(*) FROM supplements.supplier_product_nutrients WHERE luecken::text LIKE '%vitamin_e_iu_form_unknown%') END
    );
  `)

  assert.equal(result.evidenceTable, true)
  assert.ok(result.resolved > 0)
  assert.ok(result.converted > 0)
  assert.ok(result.stillOpen > 0)
})
