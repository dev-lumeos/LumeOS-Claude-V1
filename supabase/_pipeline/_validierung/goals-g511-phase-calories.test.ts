import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G511_DATABASE
if (!db || db === 'postgres') throw new Error('G-511 braucht eine Wegwerf-Datenbank, nie postgres.')

const NO_PHASE_USER = '51100000-0000-0000-0000-000000000001'
const BULK_USER = '51100000-0000-0000-0000-000000000002'
const ENDED_USER = '51100000-0000-0000-0000-000000000003'

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
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab
    ) VALUES (
      '51110000-0000-0000-0000-000000000002', '${BULK_USER}', 'lean_bulk',
      0.5, '{"source":"G-511 test"}'::jsonb, DATE '2030-01-01'
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

test('G-511 A2: verlaessliche Reihe gewinnt, test-user faellt auf Formel-TDEE zurueck', () => {
  const result = one<{
    devSource: string
    devHistoryId: string
    devTdee: number
    devHistoryTdee: number
    testSource: string
    testHistoryId: string | null
  }>(`
    BEGIN;
    UPDATE goals.goal_phases
    SET zielrate_pct_kg_woche = 0.267
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app')
      AND phase_type = 'lean_bulk'
      AND actual_end_date IS NULL;

    INSERT INTO goals.goal_phases (
      user_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab
    ) VALUES (
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      'lean_bulk', 0.267, '{"source":"G-511 test"}'::jsonb, CURRENT_DATE
    );

    WITH dev AS (
      SELECT *
      FROM goals.berechne_zielwerte(
        (SELECT id FROM auth.users WHERE email = 'dev@lumeos.app'),
        CURRENT_DATE
      )
    ), test_user AS (
      SELECT *
      FROM goals.berechne_zielwerte(
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        CURRENT_DATE
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
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab
    ) VALUES (
      '51110000-0000-0000-0000-000000000012', '${BULK_USER}', 'lean_bulk',
      0.5, '{"source":"G-511 test"}'::jsonb, DATE '2031-01-01'
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
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab
    ) VALUES (
      '51110000-0000-0000-0000-000000000022', '${BULK_USER}', 'maintenance',
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
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, zielrate_pct_kg_woche, parameters, gueltig_ab, actual_end_date
    ) VALUES (
      '51110000-0000-0000-0000-000000000003', '${ENDED_USER}', 'maintenance',
      0, '{}'::jsonb, DATE '2030-01-01', DATE '2030-01-10'
    );
    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee
    ) VALUES (
      '${ENDED_USER}', DATE '2030-01-05', 2400, 160, 280, 70, 'formel', 2400
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
