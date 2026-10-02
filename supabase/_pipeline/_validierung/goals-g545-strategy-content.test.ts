// G-545: Nur Werte mit Fundstelle aus SSOT 131 werden in den Katalog
// uebernommen. Die Probe laeuft als eigener Kettenschritt gegen den Neubau.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-545 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

function failure(sql: string): string {
  try {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
      '-U', 'postgres', '-d', db, '-c', sql,
    ], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string }
    return `${failed.stdout ?? ''}\n${failed.stderr ?? ''}`
  }
  throw new Error('SQL sollte scheitern, war aber erfolgreich.')
}

function strategyProbe(code: string, values: string): string {
  return `
    BEGIN;
    INSERT INTO goals.goal_strategies (
      code, label, description, icon, category, tier,
      tdee_modifier, protein_per_kg, fat_percent, max_duration_weeks
    ) VALUES (
      '${code}', 'Probe', 'Probe', 'Probe', 'hybrid', 'advanced',
      ${values}
    );
    COMMIT;
  `
}

test('G-545 A1: Contest Prep traegt die drei belegten Stufen aus SSOT 131', () => {
  const result = one<{ stages: unknown[] }>(`
    SELECT json_build_object('stages', sub_phases)
    FROM goals.goal_strategies
    WHERE code = 'contest_prep';
  `)

  assert.deepEqual(result.stages, [
    {
      name: 'early', tdee_multiplier: 0.85, protein_g_per_kg: 2.2,
      // A-87: G-560 speichert die editierbare Programmdauer als Verhaeltnis.
      duration_ratio_pct: 22,
      fat_g_per_kg: 0.8, fat_minimum_g_per_kg: 0.6,
      cardio: { sessions_per_week: [3, 4], minutes: [30, 40], type: 'LISS' },
    },
    {
      name: 'mid', tdee_multiplier: 0.78, protein_g_per_kg: 2.4,
      duration_ratio_pct: 44,
      fat_g_per_kg: 0.7, fat_minimum_g_per_kg: 0.5,
      cardio: { sessions_per_week: [4, 6], minutes: [40, 40], type: 'LISS/MISS' },
    },
    {
      name: 'late', tdee_multiplier: 0.7, protein_g_per_kg: 2.6,
      duration_ratio_pct: 33,
      fat_g_per_kg: 0.6, fat_minimum_g_per_kg: 0.5,
      cardio: { sessions_per_week: [5, 7], minutes: [40, 45], type: 'LISS + HIIT' },
    },
  ])
})

test('G-545 A2: alle zehn leeren Strategien bekommen relative, nicht absolute Waechter', () => {
  const result = one<{
    withGuards: number
    newlyCovered: string[]
    relativeLossGuard: number
    absoluteLossGuard: number
  }>(`
    SELECT json_build_object(
      'withGuards', count(*) FILTER (WHERE cardinality(guards) > 0),
      'newlyCovered', coalesce(json_agg(code ORDER BY code) FILTER (
        WHERE code = ANY (ARRAY[
          'aggressive_bulk', 'body_recomp', 'clean_bulk', 'custom',
          'expert_bb_annual', 'gain', 'maintain', 'maintenance_diet_break',
          'mini_cut', 'peak_week'
        ]::text[]) AND cardinality(guards) > 0
      ), '[]'::json),
      'relativeLossGuard', count(*) FILTER (
        WHERE guards @> ARRAY['Gewichtsverlust > 2 %/Woche -> warning']::text[]
      ),
      'absoluteLossGuard', count(*) FILTER (
        WHERE code = ANY (ARRAY[
          'aggressive_bulk', 'body_recomp', 'clean_bulk', 'custom',
          'expert_bb_annual', 'gain', 'maintain', 'maintenance_diet_break',
          'mini_cut', 'peak_week'
        ]::text[])
          AND array_to_string(guards, ' ') ~* '[0-9]+([,.][0-9]+)? ?kg'
      )
    )
    FROM goals.goal_strategies;
  `)

  assert.equal(result.withGuards, 17)
  assert.deepEqual(result.newlyCovered, [
    'aggressive_bulk', 'body_recomp', 'clean_bulk', 'custom',
    'expert_bb_annual', 'gain', 'maintain', 'maintenance_diet_break',
    'mini_cut', 'peak_week',
  ])
  assert.equal(result.relativeLossGuard, 10)
  assert.equal(result.absoluteLossGuard, 0)
})

test('G-545 A3/A5/A6: offene Entscheidungen und ausgeschlossene Inhalte bleiben unangetastet', () => {
  const result = one<{
    requirementsRows: number
    contestDuration: number
    forbiddenRows: number
    highBodyFatCalorieAssumptionRows: number
  }>(`
    SELECT json_build_object(
      'requirementsRows', count(*) FILTER (WHERE requirements <> '{}'::jsonb),
      'contestDuration', max(max_duration_weeks) FILTER (WHERE code = 'contest_prep'),
      'forbiddenRows', count(*) FILTER (
        WHERE concat_ws(' ', description, array_to_string(warnings, ' '),
          array_to_string(guards, ' '), requirements::text, sub_phases::text,
          array_to_string(exits, ' '), array_to_string(success, ' '))
          ~* '(BPC-157|TB-500|CJC-1295|Ipamorelin|GHRP|IGF-1|MGF|Melanotan|PT-141|Blutdruck|Kreatinin|eGFR|H[äa]matokrit|H[äa]moglobin|ALT/AST)'
      ),
      'highBodyFatCalorieAssumptionRows', count(*) FILTER (
        WHERE requirements::text ~* '(high|very_high).*(calorie|kalorien)'
      )
    )
    FROM goals.goal_strategies;
  `)

  assert.deepEqual(result, {
    requirementsRows: 4,
    contestDuration: 16,
    forbiddenRows: 0,
    highBodyFatCalorieAssumptionRows: 0,
  })
})

test('G-545 A4: nur direkt belegte Ausgaenge werden ergaenzt; Erfolg wird nicht geraten', () => {
  const result = one<{
    exitRows: number
    successRows: number
    reverseExit: boolean
    contestExit: boolean
    fatLossExitRows: number
  }>(`
    SELECT json_build_object(
      'exitRows', count(*) FILTER (WHERE cardinality(exits) > 0),
      'successRows', count(*) FILTER (WHERE cardinality(success) > 0),
      'reverseExit', bool_or(
        code = 'reverse_diet'
        AND exits @> ARRAY['Kalorienfaktor 1,0 erreicht']::text[]
      ),
      'contestExit', bool_or(
        code = 'contest_prep'
        AND exits @> ARRAY['7-10 Tage vor der Show -> Peak Week']::text[]
      ),
      'fatLossExitRows', count(*) FILTER (
        WHERE category = 'fat_loss'
          AND exits @> ARRAY[
            'Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep'
          ]::text[]
      )
    )
    FROM goals.goal_strategies;
  `)

  assert.deepEqual(result, {
    exitRows: 7,
    successRows: 1,
    reverseExit: true,
    contestExit: true,
    fatLossExitRows: 5,
  })
})

test('G-545: der Katalog ist fuer test-user lesbar und G-536-Grenzen halten', () => {
  const result = one<{ rows: number; stages: number }>(`
    BEGIN;
    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'rows', count(*),
      'stages', max(jsonb_array_length(sub_phases))
    )
    FROM goals.goal_strategies;
    ROLLBACK;
  `)

  assert.deepEqual(result, { rows: 17, stages: 3 })

  const boundaries = one<{ rows: number }>(`
    BEGIN;
    INSERT INTO goals.goal_strategies (
      code, label, description, icon, category, tier,
      tdee_modifier, protein_per_kg, fat_percent, max_duration_weeks
    ) VALUES
      ('g545_low', 'Probe', 'Probe', 'Probe', 'hybrid', 'advanced',
       -0.40, 1.2, 0.15, 1),
      ('g545_high', 'Probe', 'Probe', 'Probe', 'hybrid', 'advanced',
       0.25, 3.5, 0.40, 1);
    SELECT json_build_object('rows', count(*))
    FROM goals.goal_strategies WHERE code LIKE 'g545_%';
    ROLLBACK;
  `)
  assert.deepEqual(boundaries, { rows: 2 })

  assert.match(
    failure(strategyProbe('g545_tdee_low', '-0.401, 2.0, 0.25, 1')),
    /goal_strategies_tdee_modifier_check/,
  )
  assert.match(
    failure(strategyProbe('g545_tdee_high', '0.251, 2.0, 0.25, 1')),
    /goal_strategies_tdee_modifier_check/,
  )
  assert.match(
    failure(strategyProbe('g545_protein_low', '0, 1.19, 0.25, 1')),
    /goal_strategies_protein_check/,
  )
  assert.match(
    failure(strategyProbe('g545_protein_high', '0, 3.51, 0.25, 1')),
    /goal_strategies_protein_check/,
  )
  assert.match(
    failure(strategyProbe('g545_fat_low', '0, 2.0, 0.149, 1')),
    /goal_strategies_fat_check/,
  )
  assert.match(
    failure(strategyProbe('g545_fat_high', '0, 2.0, 0.401, 1')),
    /goal_strategies_fat_check/,
  )
  assert.match(
    failure(strategyProbe('g545_duration_low', '0, 2.0, 0.25, 0')),
    /goal_strategies_duration_check/,
  )
})
