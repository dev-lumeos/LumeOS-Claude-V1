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

test('G-511: lean_bulk rechnet den exakten Phasenparameter statt des Profilziels', () => {
  const result = one<{
    tdee: number
    kcal: number
    nutritionGoal: string | null
    hindernis: string | null
  }>(`
    BEGIN;
    ${profile(BULK_USER, 'g511-bulk@example.test', 'lose_weight')}
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, parameters, gueltig_ab
    ) VALUES (
      '51110000-0000-0000-0000-000000000002', '${BULK_USER}', 'lean_bulk',
      '{"calorie_surplus":250}'::jsonb, DATE '2030-01-01'
    );
    SELECT json_build_object(
      'tdee', tdee,
      'kcal', kcal,
      'nutritionGoal', nutrition_goal,
      'hindernis', hindernis
    )
    FROM goals.berechne_zielwerte('${BULK_USER}'::uuid, DATE '2030-01-05');
    ROLLBACK;
  `)

  assert.equal(result.kcal, result.tdee + 250)
  assert.equal(result.nutritionGoal, 'gain_muscle')
  assert.equal(result.hindernis, null)
})

test('G-511: eine Zielzeile gilt nur waehrend ihrer zugeordneten Phase', () => {
  const result = one<{ waehrend: number; danach: number }>(`
    BEGIN;
    ${profile(ENDED_USER, 'g511-ended@example.test', 'gain_muscle')}
    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, parameters, gueltig_ab, actual_end_date
    ) VALUES (
      '51110000-0000-0000-0000-000000000003', '${ENDED_USER}', 'maintenance',
      '{}'::jsonb, DATE '2030-01-01', DATE '2030-01-10'
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
