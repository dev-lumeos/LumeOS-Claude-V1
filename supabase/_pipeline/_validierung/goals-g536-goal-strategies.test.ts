import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

// Bewusst nutzerweit: Pro abgefragtem Stichtag ist genau eine Testphase aktiv;
// geprueft werden Katalogdefaults und Overrides, nicht die Zielauswahl.
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G536_DATABASE
if (!db || db === 'postgres') throw new Error('G-536 braucht eine Wegwerf-Datenbank, nie postgres.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function failure(sql: string): string {
  try {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
      '-c', sql,
    ], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string }
    return `${failed.stdout ?? ''}\n${failed.stderr ?? ''}`
  }
  throw new Error('SQL sollte scheitern, war aber erfolgreich.')
}

const testUser = `(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')`

function strategyInsert(overrides: string): string {
  return `
    BEGIN;
    INSERT INTO goals.goal_strategies (
      code, label, description, icon, category, tier,
      tdee_modifier, protein_per_kg, fat_percent
    ) VALUES (
      'g536_probe', 'Probe', 'Probe', 'Probe', 'hybrid', 'advanced',
      0, 1.2, 0.15
    );
    UPDATE goals.goal_strategies SET ${overrides} WHERE code = 'g536_probe';
    COMMIT;
  `
}

test('G-536 A1: der Katalog hat 17 quellgetreue Strategien und keine erfundene profile-Zeile', () => {
  const result = one<{
    rows: number
    codes: string[]
    calculationReady: number
    annualRows: number
  }>(`
    SELECT json_build_object(
      'rows', count(*),
      'codes', json_agg(code ORDER BY code),
      'calculationReady', count(*) FILTER (
        WHERE tdee_modifier IS NOT NULL
          AND protein_per_kg IS NOT NULL
          AND fat_percent IS NOT NULL
      ),
      'annualRows', count(*) FILTER (
        WHERE code = 'expert_bb_annual'
          AND jsonb_array_length(annual) = 5
          AND requirements ->> 'min_experience' = 'advanced'
      )
    )
    FROM goals.goal_strategies;
  `)

  assert.equal(result.rows, 17)
  assert.equal(result.calculationReady, 16)
  assert.equal(result.annualRows, 1)
  assert.deepEqual(result.codes, [
    'aggressive_bulk', 'aggressive_cut', 'body_recomp', 'clean_bulk',
    'conservative_cut', 'contest_prep', 'custom', 'expert_bb_annual',
    'gain', 'lean_bulk', 'lose', 'maintain', 'maintenance_diet_break',
    'mini_cut', 'moderate_cut', 'peak_week', 'reverse_diet',
  ])
})

test('G-536 A1: Pflichtfelder und Vorschaufelder sind typisiert', () => {
  const result = one<{
    missingRequired: number
    badArrays: number
    badJson: number
    previewSources: Record<string, boolean>
  }>(`
    SELECT json_build_object(
      'missingRequired', count(*) FILTER (
        WHERE code IS NULL OR label IS NULL OR description IS NULL OR icon IS NULL
          OR category IS NULL OR tier IS NULL
      ),
      'badArrays', count(*) FILTER (
        WHERE guards IS NULL OR next_codes IS NULL OR exits IS NULL OR success IS NULL
          OR best_for IS NULL OR purpose IS NULL OR warnings IS NULL OR editor_modes IS NULL
      ),
      'badJson', count(*) FILTER (
        WHERE jsonb_typeof(requirements) <> 'object'
          OR jsonb_typeof(sub_phases) <> 'array'
          OR jsonb_typeof(annual) <> 'array'
      ),
      'previewSources', json_build_object(
        'subPhases', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE jsonb_array_length(sub_phases) > 0),
        'guards', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE cardinality(guards) > 0),
        'exits', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE cardinality(exits) > 0),
        'success', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE cardinality(success) > 0),
        'annual', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE jsonb_array_length(annual) > 0),
        'bestFor', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE cardinality(best_for) > 0),
        'purpose', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE cardinality(purpose) > 0),
        'refeeds', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE refeeds IS NOT NULL),
        'peakWeek', EXISTS (SELECT 1 FROM goals.goal_strategies WHERE peak_week_details IS NOT NULL)
      )
    )
    FROM goals.goal_strategies;
  `)

  assert.equal(result.missingRequired, 0)
  assert.equal(result.badArrays, 0)
  assert.equal(result.badJson, 0)
  assert.deepEqual(result.previewSources, {
    subPhases: true, guards: true, exits: true, success: true,
    annual: true, bestFor: true, purpose: true, refeeds: true, peakWeek: true,
  })
})

test('G-536 A1: Wertelisten und JSON-Objekt-CHECK akzeptieren gueltig und weisen ungueltig ab', () => {
  const accepted = one<{ rows: number }>(`
    BEGIN;
    INSERT INTO goals.goal_strategies (
      code, label, description, icon, category, tier,
      tdee_modifier, protein_per_kg, fat_percent, requirements
    ) VALUES (
      'g536_valid', 'Probe', 'Probe', 'Probe', 'fat_loss', 'simple',
      0, 1.2, 0.15, '{}'::jsonb
    );
    SELECT json_build_object('rows', count(*))
    FROM goals.goal_strategies WHERE code = 'g536_valid';
    ROLLBACK;
  `)
  assert.deepEqual(accepted, { rows: 1 })

  assert.match(failure(strategyInsert("category = 'unknown'")), /goal_strategies_category_check/)
  assert.match(failure(strategyInsert("tier = 'unknown'")), /goal_strategies_tier_check/)
  assert.match(failure(strategyInsert("code = 'Nicht_Kanonisch'")), /goal_strategies_code_format/)
  assert.match(failure(strategyInsert("requirements = '[]'::jsonb")), /goal_strategies_requirements_object/)
  assert.match(failure(strategyInsert("sub_phases = '{}'::jsonb")), /goal_strategies_sub_phases_array/)
  assert.match(failure(strategyInsert("annual = '{}'::jsonb")), /goal_strategies_annual_array/)
  assert.match(failure(strategyInsert("refeeds = '[]'::jsonb")), /goal_strategies_refeeds_object/)
  assert.match(failure(strategyInsert("peak_week_details = '[]'::jsonb")), /goal_strategies_peak_week_details_object/)
  assert.match(failure(strategyInsert("editor_modes = ARRAY['unknown']::text[]")), /goal_strategies_editor_modes_check/)
})

test('G-536 A1: alle numerischen CHECKs lassen beide Raender zu und sperren ausserhalb', () => {
  const accepted = one<{ rows: number }>(`
    BEGIN;
    INSERT INTO goals.goal_strategies (
      code, label, description, icon, category, tier,
      tdee_modifier, weight_change_target_percent, max_duration_weeks,
      protein_per_kg, fat_percent
    ) VALUES
      ('g536_low', 'Low', 'Low', 'Low', 'fat_loss', 'advanced', -0.40, -2.5, 1, 1.2, 0.15),
      ('g536_high', 'High', 'High', 'High', 'muscle_gain', 'advanced', 0.25, 1.5, 1, 3.5, 0.40);
    SELECT json_build_object('rows', count(*))
    FROM goals.goal_strategies WHERE code LIKE 'g536_%';
    ROLLBACK;
  `)
  assert.deepEqual(accepted, { rows: 2 })

  assert.match(failure(strategyInsert('tdee_modifier = -0.401')), /goal_strategies_tdee_modifier_check/)
  assert.match(failure(strategyInsert('tdee_modifier = 0.251')), /goal_strategies_tdee_modifier_check/)
  assert.match(failure(strategyInsert('weight_change_target_percent = -2.501')), /goal_strategies_weight_change_check/)
  assert.match(failure(strategyInsert('weight_change_target_percent = 1.501')), /goal_strategies_weight_change_check/)
  assert.match(failure(strategyInsert('protein_per_kg = 1.19')), /goal_strategies_protein_check/)
  assert.match(failure(strategyInsert('protein_per_kg = 3.51')), /goal_strategies_protein_check/)
  assert.match(failure(strategyInsert('fat_percent = 0.149')), /goal_strategies_fat_check/)
  assert.match(failure(strategyInsert('fat_percent = 0.401')), /goal_strategies_fat_check/)
  assert.match(failure(strategyInsert('max_duration_weeks = 0')), /goal_strategies_duration_check/)
})

test('G-536 A1/A2: Rechte, RLS und Fremdschluessel halten den Katalog read-only', () => {
  const result = one<{
    rls: boolean
    authSelect: boolean
    authInsert: boolean
    serviceDml: boolean
    phaseColumn: boolean
    fk: boolean
  }>(`
    SELECT json_build_object(
      'rls', c.relrowsecurity,
      'authSelect', has_table_privilege('authenticated', 'goals.goal_strategies', 'SELECT'),
      'authInsert', has_table_privilege('authenticated', 'goals.goal_strategies', 'INSERT'),
      'serviceDml', has_table_privilege('service_role', 'goals.goal_strategies', 'SELECT,INSERT,UPDATE,DELETE'),
      'phaseColumn', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'goal_phases'
          AND column_name = 'strategie_code'
      ),
      'fk', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_strategie_code_fkey'
      )
    )
    FROM pg_class c
    WHERE c.oid = 'goals.goal_strategies'::regclass;
  `)

  assert.deepEqual(result, {
    rls: true, authSelect: true, authInsert: false,
    serviceDml: true, phaseColumn: true, fk: true,
  })
  assert.match(failure(`
    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date, strategie_code
    ) VALUES (${testUser}, 'maintenance', DATE '2099-06-01', DATE '2099-06-01', 'missing');
  `), /goal_phases_strategie_code_fkey/)
})

test('G-536 A3: Katalogwerte sind Defaults; persoenliche JSON-Overrides gewinnen ohne den Katalog zu aendern', () => {
  const result = one<{
    tdee: number
    kcal: number
    protein: number
    fat: number
    factor: number
    rate: number
    rateKcal: number
    jsonFactorKcal: number
    catalogFactor: number
    hindernis: string | null
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (${testUser}, DATE '2099-07-01', TIME '08:00', 81.4);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date, strategie_code,
      zielrate_pct_kg_woche, parameters
    ) VALUES (
      ${testUser}, 'lean_bulk', DATE '2099-07-01', DATE '2099-07-31', 'gain',
      NULL, '{"tdee_modifier":0.20,"protein_per_kg":3.0,"fat_percent":0.40}'::jsonb
    );
    SELECT json_build_object(
      'tdee', tdee,
      'kcal', kcal,
      'protein', protein_g,
      'fat', fat_g,
      'factor', kalorienfaktor,
      'rate', zielrate_pct_kg_woche,
      'rateKcal', round(tdee + goals.kcal_delta_aus_zielrate(
        zielrate_pct_kg_woche, body_weight_kg
      ), 1),
      'jsonFactorKcal', round(tdee * 1.20, 1),
      'catalogFactor', (SELECT tdee_modifier FROM goals.goal_strategies WHERE code = 'gain'),
      'hindernis', hindernis
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2099-07-15');
    ROLLBACK;
  `)

  assert.equal(result.kcal, result.rateKcal)
  assert.notEqual(result.kcal, result.jsonFactorKcal)
  assert.equal(result.protein, 244.2)
  assert.equal(result.fat, Math.round((result.kcal * 0.40 / 9) * 10) / 10)
  assert.equal(result.factor, 0.2)
  assert.equal(result.rate, 0.3)
  assert.equal(result.catalogFactor, 0.1)
  assert.equal(result.hindernis, null)
})

test('G-536 A3: Instanzrate ueberschreibt die Katalograte, fehlende Strategie bleibt sichtbar', () => {
  const result = one<{
    overrideRate: number
    missingKcal: number | null
    missingObstacle: string
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES
      (${testUser}, DATE '2099-08-01', TIME '08:00', 81.4),
      (${testUser}, DATE '2099-08-16', TIME '08:00', 81.4);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date, strategie_code,
      zielrate_pct_kg_woche
    ) VALUES (
      ${testUser}, 'lean_bulk', DATE '2099-08-01', DATE '2099-08-15', 'gain', 0.444
    );
    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date, strategie_code,
      zielrate_pct_kg_woche
    ) VALUES (
      ${testUser}, 'maintenance', DATE '2099-08-16', DATE '2099-08-31', NULL, NULL
    );
    SELECT json_build_object(
      'overrideRate', (
        SELECT zielrate_pct_kg_woche FROM goals.berechne_zielwerte(${testUser}, DATE '2099-08-10')
      ),
      'missingKcal', (
        SELECT kcal FROM goals.berechne_zielwerte(${testUser}, DATE '2099-08-20')
      ),
      'missingObstacle', (
        SELECT hindernis FROM goals.berechne_zielwerte(${testUser}, DATE '2099-08-20')
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    overrideRate: 0.444,
    missingKcal: null,
    missingObstacle: 'phasenparameter_fehlt',
  })
})

test('G-536 A5: phase_rate_rules bleibt leer', () => {
  assert.deepEqual(one<{ rows: number }>(`
    SELECT json_build_object('rows', count(*)) FROM goals.phase_rate_rules;
  `), { rows: 0 })
})
