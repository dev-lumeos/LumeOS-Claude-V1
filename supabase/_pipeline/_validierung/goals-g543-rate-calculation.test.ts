import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

// Bewusst nutzerweit: Jede Rechnung hat am jeweiligen Stichtag hoechstens
// eine aktive Phase; genau dieser Einziel-/Kein-Ziel-Vertrag wird hier geprueft.
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-543 braucht eine Wegwerf-Datenbank, nie postgres.')

const testUser = `(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')`

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-543 A1/A4: gleiche Faktor- und Ratenrechnung bleibt gleich', () => {
  const result = one<{
    kcal: number
    factorTarget: number
    rateTarget: number
    rate: number
    weight: number
    factor: number
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (${testUser}, DATE '2099-01-01', TIME '08:00', 83.74);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date,
      strategie_code, zielrate_pct_kg_woche, parameters
    )
    SELECT
      ${testUser}, 'lean_bulk', DATE '2099-01-01', DATE '2099-01-31',
      'lean_bulk', 0.25,
      jsonb_build_object(
        'tdee_modifier', goals.kcal_delta_aus_zielrate(0.25, 83.74) / tdee
      )
    FROM goals.tdee_basis_am(${testUser}, DATE '2099-01-15');

    SELECT json_build_object(
      'kcal', z.kcal,
      'factorTarget', round(z.tdee * (1 + z.kalorienfaktor), 1),
      'rateTarget', round(z.tdee + goals.kcal_delta_aus_zielrate(
        z.zielrate_pct_kg_woche, z.body_weight_kg
      ), 1),
      'rate', z.zielrate_pct_kg_woche,
      'weight', z.body_weight_kg,
      'factor', z.kalorienfaktor
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2099-01-15') z;
    ROLLBACK;
  `)

  assert.equal(result.kcal, result.factorTarget)
  assert.equal(result.kcal, result.rateTarget)
  assert.equal(result.rate, 0.25)
  assert.equal(result.weight, 83.74)
  assert.ok(result.factor > 0)
})

test('G-543 A1/A4: lean_bulk bei 83,74 kg folgt 0,25 Prozent pro Woche, nicht zehn Prozent TDEE', () => {
  const result = one<{
    tdee: number
    kcal: number
    rateDelta: number
    rateTarget: number
    factorTarget: number
    rate: number
    weight: number
    hindernis: string | null
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (${testUser}, DATE '2099-02-01', TIME '08:00', 83.74);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date,
      strategie_code, zielrate_pct_kg_woche
    ) VALUES (
      ${testUser}, 'lean_bulk', DATE '2099-02-01', DATE '2099-02-28',
      'lean_bulk', 0.25
    );

    SELECT json_build_object(
      'tdee', z.tdee,
      'kcal', z.kcal,
      'rateDelta', goals.kcal_delta_aus_zielrate(
        z.zielrate_pct_kg_woche, z.body_weight_kg
      ),
      'rateTarget', round(z.tdee + 230.3, 1),
      'factorTarget', round(z.tdee * 1.10, 1),
      'rate', z.zielrate_pct_kg_woche,
      'weight', z.body_weight_kg,
      'hindernis', z.hindernis
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2099-02-15') z;
    ROLLBACK;
  `)

  assert.equal(result.rateDelta, 230.3)
  assert.equal(result.kcal, result.rateTarget)
  assert.notEqual(result.kcal, result.factorTarget)
  assert.equal(result.rate, 0.25)
  assert.equal(result.weight, 83.74)
  assert.equal(result.hindernis, null)
})

test('G-543 A1/A4: Instanzrate und JSON-Makros schlagen den Katalog, der JSON-Faktor steuert nicht mehr', () => {
  const result = one<{
    kcal: number
    rateTarget: number
    jsonFactorTarget: number
    protein: number
    profileProtein: number
    fat: number
    expectedFat: number
    rate: number
    factor: number
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (${testUser}, DATE '2099-03-01', TIME '08:00', 83.74);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date, strategie_code,
      zielrate_pct_kg_woche, parameters
    ) VALUES (
      ${testUser}, 'lean_bulk', DATE '2099-03-01', DATE '2099-03-31', 'lean_bulk',
      0.40, '{"tdee_modifier":0.20,"protein_per_kg":3.0,"fat_percent":0.40}'::jsonb
    );

    SELECT json_build_object(
      'kcal', z.kcal,
      'rateTarget', round(z.tdee + goals.kcal_delta_aus_zielrate(0.40, 83.74), 1),
      'jsonFactorTarget', round(z.tdee * 1.20, 1),
      'protein', z.protein_g,
      'profileProtein', round(p.body_weight_kg * 3.0, 1),
      'fat', z.fat_g,
      'expectedFat', round(z.kcal * 0.40 / 9, 1),
      'rate', z.zielrate_pct_kg_woche,
      'factor', z.kalorienfaktor
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2099-03-15') z
    CROSS JOIN public.profiles p
    WHERE p.id = ${testUser};
    ROLLBACK;
  `)

  assert.equal(result.kcal, result.rateTarget)
  assert.notEqual(result.kcal, result.jsonFactorTarget)
  assert.equal(result.protein, result.profileProtein)
  assert.equal(result.fat, result.expectedFat)
  assert.equal(result.rate, 0.4)
  assert.equal(result.factor, 0.2)
})

test('G-543 A3: kein oder mehrdeutiges Gewicht am Phasenstart wird nicht geraten', () => {
  const result = one<{
    missingKcal: number | null
    missingObstacle: string
    missingFields: string[]
    duplicateKcal: number | null
    duplicateObstacle: string
    duplicateFields: string[]
  }>(`
    BEGIN;
    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date,
      strategie_code, zielrate_pct_kg_woche
    ) VALUES
      (${testUser}, 'lean_bulk', DATE '2088-01-01', DATE '2088-01-31', 'lean_bulk', 0.25),
      (${testUser}, 'lean_bulk', DATE '2099-06-01', DATE '2099-06-30', 'lean_bulk', 0.25);

    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES
      (${testUser}, DATE '2099-06-01', TIME '08:00', 83.74),
      (${testUser}, DATE '2099-06-01', TIME '20:00', 83.60);

    SELECT json_build_object(
      'missingKcal', missing.kcal,
      'missingObstacle', missing.hindernis,
      'missingFields', missing.fehlende_felder,
      'duplicateKcal', duplicate.kcal,
      'duplicateObstacle', duplicate.hindernis,
      'duplicateFields', duplicate.fehlende_felder
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2088-01-15') missing
    CROSS JOIN goals.berechne_zielwerte(${testUser}, DATE '2099-06-15') duplicate;
    ROLLBACK;
  `)

  assert.equal(result.missingKcal, null)
  assert.equal(result.missingObstacle, 'profil_unvollstaendig')
  assert.ok(result.missingFields.includes('body_measurement_weight_kg'))
  assert.equal(result.duplicateKcal, null)
  assert.equal(result.duplicateObstacle, 'profil_unvollstaendig')
  assert.ok(result.duplicateFields.includes('body_measurement_weight_kg'))
})

test('G-543: keine Phase und fehlende Rate behalten ihre Hindernisnamen', () => {
  const result = one<{
    noPhaseKcal: number | null
    noPhaseObstacle: string
    noRateKcal: number | null
    noRateObstacle: string
  }>(`
    BEGIN;
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (${testUser}, DATE '2099-04-01', TIME '08:00', 83.74);

    INSERT INTO goals.goal_phases (
      user_id, phase_type, gueltig_ab, actual_end_date,
      strategie_code, zielrate_pct_kg_woche
    ) VALUES (
      ${testUser}, 'maintenance', DATE '2099-04-01', DATE '2099-04-30',
      'maintain', NULL
    );

    SELECT json_build_object(
      'noPhaseKcal', no_phase.kcal,
      'noPhaseObstacle', no_phase.hindernis,
      'noRateKcal', no_rate.kcal,
      'noRateObstacle', no_rate.hindernis
    )
    FROM goals.berechne_zielwerte(${testUser}, DATE '2087-01-01') no_phase
    CROSS JOIN goals.berechne_zielwerte(${testUser}, DATE '2099-04-15') no_rate;
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    noPhaseKcal: null,
    noPhaseObstacle: 'keine_aktive_phase',
    noRateKcal: null,
    noRateObstacle: 'phasenparameter_fehlt',
  })
})
