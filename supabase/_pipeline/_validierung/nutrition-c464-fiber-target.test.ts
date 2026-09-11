// C-464: Fiber ist ein expliziter, formelbasiert gespeicherter Tageszielwert.
// Der Test nutzt ausschliesslich eine explizite Wegwerf-Datenbank und rollt
// seine Fixture vollstaendig zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C464_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-464-Test braucht eine Wegwerf-Datenbank, nie postgres.')

const USER = 'c464f000-0000-0000-0000-000000000001'

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-464: Formel, Zielwert-Leser und Fortschreibung tragen Fiber', () => {
  const result = one<{
    hasFiberColumn: boolean
    calculatedFiber: number | null
    storedFiber: number | null
    readFiber: number | null
    copiedFiber: number | null
    formulaTargets: number
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('${USER}'::uuid, 'c464-owner@example.test', '{}'::jsonb, now());
    UPDATE public.profiles
    SET birth_date = DATE '1990-01-01', biological_sex = 'male', height_cm = 180,
        body_weight_kg = 80, activity_level = 'moderate', nutrition_goal = 'maintain'
    WHERE id = '${USER}'::uuid;

    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, fiber_g,
      linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee, nutrition_goal
    )
    SELECT '${USER}'::uuid, DATE '2030-01-01', kcal, protein_g, carbs_g, fat_g, fiber_g,
           linoleic_acid_g, alpha_linolenic_acid_g, 'formel', tdee, nutrition_goal
    FROM goals.berechne_zielwerte('${USER}'::uuid, DATE '2030-01-01');

    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, fiber_g,
      linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee, nutrition_goal
    )
    SELECT user_id, DATE '2030-01-02', kcal, protein_g, carbs_g, fat_g, fiber_g,
           linoleic_acid_g, alpha_linolenic_acid_g, 'manuell', tdee, nutrition_goal
    FROM goals.nutrition_targets
    WHERE user_id = '${USER}'::uuid AND gueltig_ab = DATE '2030-01-01';

    SELECT json_build_object(
      'hasFiberColumn', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'nutrition_targets' AND column_name = 'fiber_g'
      ),
      'calculatedFiber', (SELECT fiber_g FROM goals.berechne_zielwerte('${USER}'::uuid, DATE '2030-01-01')),
      'storedFiber', (SELECT fiber_g FROM goals.nutrition_targets
                       WHERE user_id = '${USER}'::uuid AND gueltig_ab = DATE '2030-01-01'),
      'readFiber', (SELECT fiber_g FROM goals.zielwerte_am('${USER}'::uuid, DATE '2030-01-01')),
      'copiedFiber', (SELECT fiber_g FROM goals.zielwerte_am('${USER}'::uuid, DATE '2030-01-02')),
      'formulaTargets', (SELECT count(*)::integer FROM goals.nutrition_targets
                         WHERE user_id = '${USER}'::uuid AND fiber_g = 30)
    ) AS result;
    ROLLBACK;
  `)

  assert.equal(result.hasFiberColumn, true)
  assert.equal(result.calculatedFiber, 30)
  assert.equal(result.storedFiber, 30)
  assert.equal(result.readFiber, 30)
  assert.equal(result.copiedFiber, 30)
  assert.equal(result.formulaTargets, 2)
})
