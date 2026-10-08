// G-622: Gegenproben nur in einer Wegwerf-Datenbank; alle Aenderungen rollen zurueck.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-622 braucht eine Wegwerf-Datenbank.')

const max = `(SELECT id FROM auth.users WHERE email = 'max.seed@example.com')`
const user = `(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')`
const cut = `'30000000-0000-0000-0000-000000000901'::uuid`

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  const jsonStart = output.indexOf('{')
  if (jsonStart < 0) throw new Error(`G-622 Probe ohne JSON: ${output}`)
  return JSON.parse(output.slice(jsonStart)) as T
}

test('G-622: Max ohne aktive Phase liest Erhaltung aus TDEE und maintain-Makroregel', () => {
  const got = one<{
    phaseCount: number; kcal: number; tdee: number; basisTdee: number
    protein: number; fat: number; carbs: number; fiber: number
    goal: string | null; obstacle: string; source: string; targetKcal: number
    targetProtein: number; targetFat: number; targetCarbs: number; faMarked: number
  }>(`
    SELECT json_build_object(
      'phaseCount', (SELECT count(*) FROM goals.phase_am(${max}, CURRENT_DATE)),
      'kcal', z.kcal, 'tdee', z.tdee,
      'basisTdee', (SELECT tdee FROM goals.tdee_basis_am(${max}, CURRENT_DATE)),
      'protein', z.protein_g, 'fat', z.fat_g, 'carbs', z.carbs_g,
      'fiber', z.fiber_g, 'goal', z.goal_id, 'obstacle', z.hindernis,
      'source', t.herkunft, 'targetKcal', t.kcal,
      'targetProtein', t.protein_g, 'targetFat', t.fat_g,
      'targetCarbs', t.carbs_g,
      'faMarked', (SELECT count(*) FROM nutrition.daily_reference_assessment(${max}, CURRENT_DATE)
        WHERE nutrient_code IN ('F18:2CN6', 'F18:3CN3')
          AND reference_kind = 'AI' AND reference_basis = 'maintenance_no_active_goal'
          AND reference_value_min IS NOT NULL)
    ) FROM goals.berechne_zielwerte(${max}, CURRENT_DATE) z
    CROSS JOIN goals.zielwerte_am(${max}, CURRENT_DATE) t;
  `)
  assert.equal(got.phaseCount, 0)
  assert.equal(got.kcal, Math.round(got.basisTdee * 10) / 10)
  assert.equal(got.tdee, got.basisTdee)
  assert.equal(got.protein, 156) // Max 78 kg, maintain: 2 g/kg
  assert.equal(got.fat, Math.round(got.kcal * 0.28 / 9 * 10) / 10)
  assert.ok(Math.abs(got.carbs - Math.max(got.kcal - got.protein * 4 - got.fat * 9, 0) / 4) < 0.1)
  assert.equal(got.fiber, 30)
  assert.equal(got.goal, null)
  assert.equal(got.obstacle, 'kein_aktives_ziel')
  assert.equal(got.source, 'kein_aktives_ziel')
  assert.deepEqual([got.targetKcal, got.targetProtein, got.targetFat, got.targetCarbs],
    [got.kcal, got.protein, got.fat, got.carbs])
  assert.equal(got.faMarked, 2)
})

test('G-622: Pausieren zeigt markierte Erhaltung, Reaktivieren wieder Phasenziel', () => {
  const got = one<{ rows: Array<{ state: string; phaseCount: number; obstacle: string | null; goal: string | null; source: string }> }>(`
    BEGIN;
    CREATE TEMP TABLE g622_states (state text, phase_count integer, obstacle text, goal uuid, source text) ON COMMIT DROP;
    INSERT INTO g622_states
      SELECT 'active', (SELECT count(*) FROM goals.phase_am(${user}, CURRENT_DATE)),
             z.hindernis, z.goal_id,
             (SELECT COALESCE((SELECT herkunft FROM goals.zielwerte_am(${user}, CURRENT_DATE)), 'keine_gespeicherte_zeile'))
      FROM goals.berechne_zielwerte(${user}, CURRENT_DATE) z;
    UPDATE goals.user_goals SET status = 'on_hold' WHERE id = ${cut};
    INSERT INTO g622_states
      SELECT 'paused', (SELECT count(*) FROM goals.phase_am(${user}, CURRENT_DATE)),
             z.hindernis, z.goal_id,
             (SELECT herkunft FROM goals.zielwerte_am(${user}, CURRENT_DATE))
      FROM goals.berechne_zielwerte(${user}, CURRENT_DATE) z;
    UPDATE goals.user_goals SET status = 'active' WHERE id = ${cut};
    INSERT INTO g622_states
      SELECT 'resumed', (SELECT count(*) FROM goals.phase_am(${user}, CURRENT_DATE)),
             z.hindernis, z.goal_id,
             (SELECT COALESCE((SELECT herkunft FROM goals.zielwerte_am(${user}, CURRENT_DATE)), 'keine_gespeicherte_zeile'))
      FROM goals.berechne_zielwerte(${user}, CURRENT_DATE) z;
    SELECT json_build_object('rows', json_agg(json_build_object(
      'state', state, 'phaseCount', phase_count, 'obstacle', obstacle,
      'goal', goal, 'source', source) ORDER BY CASE state
      WHEN 'active' THEN 1 WHEN 'paused' THEN 2 ELSE 3 END)) FROM g622_states;
    ROLLBACK;
  `)
  assert.equal(got.rows.length, 3)
  assert.equal(got.rows[0].phaseCount, 1)
  assert.equal(got.rows[0].goal, '30000000-0000-0000-0000-000000000901')
  assert.notEqual(got.rows[0].obstacle, 'kein_aktives_ziel')
  assert.equal(got.rows[1].phaseCount, 0)
  assert.equal(got.rows[1].goal, null)
  assert.equal(got.rows[1].obstacle, 'kein_aktives_ziel')
  assert.equal(got.rows[1].source, 'kein_aktives_ziel')
  assert.deepEqual(got.rows[2], got.rows[0].state === 'active'
    ? { ...got.rows[0], state: 'resumed' } : got.rows[0])
})

test('G-622: Ohne Gewicht gibt es keine geratenen Erhaltungswerte', () => {
  const got = one<{
    kcal: number | null; protein: number | null; fat: number | null
    obstacle: string; missing: string[]; source: string; targetKcal: number | null
    faUnavailable: number
  }>(`
    BEGIN;
    UPDATE public.profiles SET body_weight_kg = NULL WHERE id = ${max};
    SELECT json_build_object(
      'kcal', z.kcal, 'protein', z.protein_g, 'fat', z.fat_g,
      'obstacle', z.hindernis, 'missing', z.fehlende_felder,
      'source', t.herkunft, 'targetKcal', t.kcal,
      'faUnavailable', (SELECT count(*) FROM nutrition.daily_reference_assessment(${max}, CURRENT_DATE)
        WHERE nutrient_code IN ('F18:2CN6', 'F18:3CN3')
          AND reference_kind = 'AI' AND reference_status = 'maintenance_unavailable'
          AND reference_value_min IS NULL)
    ) FROM goals.berechne_zielwerte(${max}, CURRENT_DATE) z
    CROSS JOIN goals.zielwerte_am(${max}, CURRENT_DATE) t;
    ROLLBACK;
  `)
  assert.equal(got.kcal, null)
  assert.equal(got.protein, null)
  assert.equal(got.fat, null)
  assert.equal(got.obstacle, 'erhaltung_nicht_berechenbar')
  assert.ok(got.missing.includes('body_weight_kg'))
  assert.equal(got.source, 'erhaltung_nicht_berechenbar')
  assert.equal(got.targetKcal, null)
  assert.equal(got.faUnavailable, 2)
})

test('G-622: Mit Gewicht, aber ohne TDEE bleibt Erhaltung ebenfalls leer', () => {
  const got = one<{
    weight: number; tdee: number | null; kcal: number | null; obstacle: string
    missing: string[]; source: string; faUnavailable: number
  }>(`
    BEGIN;
    UPDATE public.profiles SET activity_level = NULL WHERE id = ${max};
    SELECT json_build_object(
      'weight', z.body_weight_kg, 'tdee', z.tdee, 'kcal', z.kcal,
      'obstacle', z.hindernis, 'missing', z.fehlende_felder,
      'source', t.herkunft,
      'faUnavailable', (SELECT count(*) FROM nutrition.daily_reference_assessment(${max}, CURRENT_DATE)
        WHERE nutrient_code IN ('F18:2CN6', 'F18:3CN3')
          AND reference_kind = 'AI' AND reference_status = 'maintenance_unavailable'
          AND reference_value_min IS NULL)
    ) FROM goals.berechne_zielwerte(${max}, CURRENT_DATE) z
    CROSS JOIN goals.zielwerte_am(${max}, CURRENT_DATE) t;
    ROLLBACK;
  `)
  assert.equal(got.weight, 78)
  assert.equal(got.tdee, null)
  assert.equal(got.kcal, null)
  assert.equal(got.obstacle, 'erhaltung_nicht_berechenbar')
  assert.ok(got.missing.includes('tdee'))
  assert.equal(got.source, 'erhaltung_nicht_berechenbar')
  assert.equal(got.faUnavailable, 2)
})
