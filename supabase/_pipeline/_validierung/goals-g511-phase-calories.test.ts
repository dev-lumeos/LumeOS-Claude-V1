import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

// Bewusst nutzerweit: Die Faelle pruefen keinen Zielvergleich, sondern jeweils
// keinen oder genau einen gueltigen Phasenbezug am abgefragten Stichtag.
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-511 braucht eine Wegwerf-Datenbank, nie postgres.')

const NO_PHASE_USER = '51100000-0000-0000-0000-000000000001'
const BULK_USER = '51100000-0000-0000-0000-000000000002'
const ENDED_USER = '51100000-0000-0000-0000-000000000003'
const FORMULA_USER = '51100000-0000-0000-0000-000000000004'

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

function profile(userId: string, email: string, nutritionGoal: string): string {
  return `
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${userId}'::uuid, '${email}', '{}'::jsonb, now());
    UPDATE public.profiles
    SET birth_date = DATE '1990-01-01', biological_sex = 'male', height_cm = 180,
        body_weight_kg = 80, activity_level = 'moderate', nutrition_goal = '${nutritionGoal}'
    WHERE id = '${userId}'::uuid;
  `
}

function goal(userId: string, goalId: string, date: string): string {
  return `
    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES (
      '${goalId}'::uuid, '${userId}'::uuid, 'body_composition',
      'G-511 Testziel', DATE '${date}', 1
    );
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (
      '${userId}'::uuid, DATE '${date}', TIME '08:00', 80
    );
  `
}

test('G-511: ohne aktive Phase gibt es keine Zielkalorien und ein ausdrueckliches Hindernis', () => {
  const result = one<{ kcal: number | null; hindernis: string | null }>(`
    BEGIN;
    ${profile(NO_PHASE_USER, 'g511-no-phase@example.test', 'performance')}
    SELECT json_build_object('kcal', kcal, 'hindernis', hindernis)
    FROM goals.berechne_zielwerte('${NO_PHASE_USER}'::uuid, DATE '2030-01-05');
    ROLLBACK;
  `)

  assert.deepEqual(result, { kcal: null, hindernis: 'keine_aktive_phase' })
})

test('G-511 A1: 11 x Rate x Gewicht gilt an den Gewichtsraendern in beide Richtungen', () => {
  const result = one<{
    loss45: number
    loss45Back: number
    gain120: number
    gain120Back: number
  }>(`
    WITH values_at_edges AS (
      SELECT
        goals.kcal_delta_aus_zielrate(-1.5, 45) AS loss45,
        goals.kcal_delta_aus_zielrate(1.5, 120) AS gain120
    )
    SELECT json_build_object(
      'loss45', loss45,
      'loss45Back', round(loss45 / (11 * 45), 3),
      'gain120', gain120,
      'gain120Back', round(gain120 / (11 * 120), 3)
    )
    FROM values_at_edges;
  `)

  assert.deepEqual(result, {
    loss45: -742.5,
    loss45Back: -1.5,
    gain120: 1980,
    gain120Back: 1.5,
  })
})

test('G-511 A1/A4: lean_bulk rechnet die Rate statt eines gespeicherten Kaloriendeltas', () => {
  const result = one<{
    tdee: number
    kcal: number
    rate: number
    weight: number
    nutritionGoal: string | null
    hindernis: string | null
  }>(`
    BEGIN;
    ${profile(BULK_USER, 'g511-bulk@example.test', 'lose_weight')}
    ${goal(BULK_USER, '51120000-0000-0000-0000-000000000002', '2030-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche,
      parameters, gueltig_ab, strategie_code
    ) VALUES (
      '51110000-0000-0000-0000-000000000002', '${BULK_USER}',
      '51120000-0000-0000-0000-000000000002', 'lean_bulk',
      0.5, '{"source":"G-511 test"}'::jsonb, DATE '2030-01-01', 'lean_bulk'
    );
    SELECT json_build_object(
      'tdee', tdee,
      'kcal', kcal,
      'rate', zielrate_pct_kg_woche,
      'weight', body_weight_kg,
      'nutritionGoal', nutrition_goal,
      'hindernis', hindernis
    )
    FROM goals.berechne_zielwerte('${BULK_USER}'::uuid, DATE '2030-01-05');
    ROLLBACK;
  `)

  assert.equal(result.kcal, result.tdee + 440)
  assert.equal(result.rate, 0.5)
  assert.equal(result.weight, 80)
  assert.equal(result.nutritionGoal, 'gain_muscle')
  assert.equal(result.hindernis, null)
})

test('G-511 A2: verlaessliche Reihe gewinnt, ohne Reihe gilt Formel-TDEE', () => {
  const result = one<{
    devSource: string
    devHistoryId: string
    devTdee: number
    devHistoryTdee: number
    testSource: string
    testHistoryId: string | null
  }>(`
    BEGIN;
    ${profile(BULK_USER, 'g511-adaptive@example.test', 'gain_muscle')}
    ${goal(BULK_USER, '51120000-0000-0000-0000-000000000102', '2030-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche,
      parameters, gueltig_ab, strategie_code
    ) VALUES (
      '51110000-0000-0000-0000-000000000102', '${BULK_USER}',
      '51120000-0000-0000-0000-000000000102', 'lean_bulk',
      0.267, '{}'::jsonb, DATE '2030-01-01', 'lean_bulk'
    );
    INSERT INTO goals.tdee_history (
      id, user_id, stichtag, window_days, complete_intake_days,
      weight_measurement_count, weight_start_kg, weight_end_kg,
      weight_delta_kg, measurement_span_days, avg_intake_kcal,
      formula_tdee_kcal, raw_tdee_kcal, previous_tdee_kcal,
      previous_source, adaptive_tdee_kcal, delta_to_formula_kcal,
      alpha, confidence, reliable, status, method
    ) VALUES (
      '51130000-0000-0000-0000-000000000102', '${BULK_USER}',
      DATE '2030-01-04', 14, 14, 2, 80, 80.2, 0.2, 13, 2500,
      2400, 2500, 2400, 'formula_seed', 2430, 30,
      0.3, 'high', true, 'complete', 'G-511 Testreihe'
    );

    ${profile(FORMULA_USER, 'g511-formula@example.test', 'gain_muscle')}
    ${goal(FORMULA_USER, '51120000-0000-0000-0000-000000000104', '2030-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche,
      parameters, gueltig_ab, strategie_code
    ) VALUES (
      '51110000-0000-0000-0000-000000000104', '${FORMULA_USER}',
      '51120000-0000-0000-0000-000000000104', 'lean_bulk',
      0.267, '{}'::jsonb, DATE '2030-01-01', 'lean_bulk'
    );

    WITH dev AS (
      SELECT *
      FROM goals.berechne_zielwerte(
        '${BULK_USER}'::uuid,
        '51120000-0000-0000-0000-000000000102'::uuid,
        DATE '2030-01-05'
      )
    ), test_user AS (
      SELECT *
      FROM goals.berechne_zielwerte(
        '${FORMULA_USER}'::uuid,
        '51120000-0000-0000-0000-000000000104'::uuid,
        DATE '2030-01-05'
      )
    )
    SELECT json_build_object(
      'devSource', dev.tdee_herkunft,
      'devHistoryId', dev.tdee_history_id,
      'devTdee', dev.tdee,
      'devHistoryTdee', h.adaptive_tdee_kcal,
      'testSource', test_user.tdee_herkunft,
      'testHistoryId', test_user.tdee_history_id
    )
    FROM dev
    JOIN goals.tdee_history h ON h.id = dev.tdee_history_id
    CROSS JOIN test_user;
    ROLLBACK;
  `)

  assert.equal(result.devSource, 'adaptive')
  assert.equal(result.devTdee, result.devHistoryTdee)
  assert.ok(result.devHistoryId)
  assert.equal(result.testSource, 'formula')
  assert.equal(result.testHistoryId, null)
})

test('G-511 A3: eine Formel-Zielzeile friert Rate, Gewicht und TDEE-Herkunft ein', () => {
  const result = one<{
    source: string
    historyId: string | null
    rateBefore: number
    rateAfter: number
    weight: number
  }>(`
    BEGIN;
    ${profile(BULK_USER, 'g511-snapshot@example.test', 'lose_weight')}
    ${goal(BULK_USER, '51120000-0000-0000-0000-000000000012', '2031-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche,
      parameters, gueltig_ab, strategie_code
    ) VALUES (
      '51110000-0000-0000-0000-000000000012', '${BULK_USER}',
      '51120000-0000-0000-0000-000000000012', 'lean_bulk',
      0.5, '{"source":"G-511 test"}'::jsonb, DATE '2031-01-01', 'lean_bulk'
    );

    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, fiber_g,
      linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee, nutrition_goal
    )
    SELECT
      '${BULK_USER}', DATE '2031-01-01', kcal, protein_g, carbs_g, fat_g, fiber_g,
      linoleic_acid_g, alpha_linolenic_acid_g, 'formel', tdee, nutrition_goal
    FROM goals.berechne_zielwerte('${BULK_USER}'::uuid, DATE '2031-01-01');

    UPDATE goals.goal_phases
    SET zielrate_pct_kg_woche = 0.8
    WHERE id = '51110000-0000-0000-0000-000000000012';

    SELECT json_build_object(
      'source', nt.tdee_herkunft,
      'historyId', nt.tdee_history_id,
      'rateBefore', nt.zielrate_pct_kg_woche,
      'rateAfter', gp.zielrate_pct_kg_woche,
      'weight', nt.body_weight_kg
    )
    FROM goals.nutrition_targets nt
    JOIN goals.goal_phases gp ON gp.id = nt.phase_id
    WHERE nt.user_id = '${BULK_USER}'::uuid
      AND nt.gueltig_ab = DATE '2031-01-01';
    ROLLBACK;
  `)

  assert.deepEqual(result, {
    source: 'formula',
    historyId: null,
    rateBefore: 0.5,
    rateAfter: 0.8,
    weight: 80,
  })
})

test('G-511 A4: fehlende Rate behaelt den Hindernisnamen phasenparameter_fehlt', () => {
  const result = one<{ kcal: number | null; hindernis: string }>(`
    BEGIN;
    ${profile(BULK_USER, 'g511-no-rate@example.test', 'gain_muscle')}
    ${goal(BULK_USER, '51120000-0000-0000-0000-000000000022', '2032-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab
    ) VALUES (
      '51110000-0000-0000-0000-000000000022', '${BULK_USER}',
      '51120000-0000-0000-0000-000000000022', 'maintenance',
      NULL, '{}'::jsonb, DATE '2032-01-01'
    );
    SELECT json_build_object('kcal', kcal, 'hindernis', hindernis)
    FROM goals.berechne_zielwerte('${BULK_USER}'::uuid, DATE '2032-01-01');
    ROLLBACK;
  `)

  assert.deepEqual(result, { kcal: null, hindernis: 'phasenparameter_fehlt' })
})

test('G-511: eine Zielzeile gilt nur waehrend ihrer zugeordneten Phase', () => {
  const result = one<{ waehrend: number; danach: number }>(`
    BEGIN;
    ${profile(ENDED_USER, 'g511-ended@example.test', 'gain_muscle')}
    ${goal(ENDED_USER, '51120000-0000-0000-0000-000000000003', '2030-01-01')}
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, zielrate_pct_kg_woche,
      parameters, gueltig_ab, actual_end_date
    ) VALUES (
      '51110000-0000-0000-0000-000000000003', '${ENDED_USER}',
      '51120000-0000-0000-0000-000000000003', 'maintenance',
      0, '{}'::jsonb, DATE '2030-01-01', DATE '2030-01-10'
    );
    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee
    ) VALUES (
      '${ENDED_USER}', DATE '2030-01-05', 2400, 160, 280, 70, 'manuell', 2400
    );
    SELECT json_build_object(
      'waehrend', (SELECT count(*) FROM goals.zielwerte_am('${ENDED_USER}'::uuid, DATE '2030-01-08')),
      'danach', (SELECT count(*) FROM goals.zielwerte_am('${ENDED_USER}'::uuid, DATE '2030-01-11'))
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, { waehrend: 1, danach: 0 })
})

test('G-511: eine neue Zielzeile ohne Phase wird abgewiesen', () => {
  const message = failure(`
    BEGIN;
    ${profile(NO_PHASE_USER, 'g511-no-target@example.test', 'maintain')}
    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee
    ) VALUES (
      '${NO_PHASE_USER}', DATE '2030-01-05', 2400, 160, 280, 70, 'formel', 2400
    );
    ROLLBACK;
  `)

  assert.match(message, /keine aktive Phase/)
})
