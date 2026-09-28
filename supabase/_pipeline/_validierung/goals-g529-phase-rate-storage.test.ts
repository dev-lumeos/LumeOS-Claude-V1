import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G529_DATABASE
if (!db || db === 'postgres') throw new Error('G-529 braucht eine Wegwerf-Datenbank, nie postgres.')

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

const userId = `(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')`

function phaseInsert(phaseType: string, rate: string): string {
  return `
    INSERT INTO goals.goal_phases (
      user_id, phase_type, zielrate_pct_kg_woche, gueltig_ab, actual_end_date
    ) VALUES (
      ${userId}, '${phaseType}', ${rate}, DATE '2099-01-01', DATE '2099-01-01'
    );
  `
}

test('G-529 A5: Zielrate ist nullable numeric(5,3) mit Aussen- und Artgrenze', () => {
  const result = one<{
    dataType: string
    precision: number
    scale: number
    nullable: string
    constraints: string[]
  }>(`
    SELECT json_build_object(
      'dataType', data_type,
      'precision', numeric_precision,
      'scale', numeric_scale,
      'nullable', is_nullable,
      'constraints', (
        SELECT json_agg(conname ORDER BY conname)
        FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname IN (
            'goal_phases_zielrate_aussengrenze',
            'goal_phases_zielrate_passt_zur_art'
          )
      )
    )
    FROM information_schema.columns
    WHERE table_schema = 'goals'
      AND table_name = 'goal_phases'
      AND column_name = 'zielrate_pct_kg_woche';
  `)

  assert.deepEqual(result, {
    dataType: 'numeric',
    precision: 5,
    scale: 3,
    nullable: 'YES',
    constraints: [
      'goal_phases_zielrate_aussengrenze',
      'goal_phases_zielrate_passt_zur_art',
    ],
  })

  assert.match(failure(phaseInsert('fat_loss', 'NULL')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('fat_loss', '0.5')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('lean_bulk', '-0.2')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('maintenance', '0.101')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('peak_week', '0.1')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('fat_loss', '-2.501')), /goal_phases_zielrate_aussengrenze/)
  assert.match(failure(phaseInsert('lean_bulk', '1.501')), /goal_phases_zielrate_aussengrenze/)
})

test('G-528 A1 / G-529 B2-B3: Testphasen sind bereinigt, zwei Bulks tragen Rate und der CHECK ist VALID', () => {
  const result = one<{
    rows: number
    variants: number
    bulkRows: number
    bulkWithRate: number
    oldDeltaKeys: number
    validated: boolean
  }>(`
    SELECT json_build_object(
      'rows', count(*),
      'variants', count(*) FILTER (WHERE variant IS NOT NULL),
      'bulkRows', count(*) FILTER (WHERE phase_type = 'lean_bulk'),
      'bulkWithRate', count(*) FILTER (
        WHERE phase_type = 'lean_bulk' AND zielrate_pct_kg_woche IS NOT NULL
      ),
      'oldDeltaKeys', count(*) FILTER (
        WHERE parameters ?| ARRAY['calorie_surplus', 'calorie_surplus_kcal', 'calorie_deficit']
      ),
      'validated', (
        SELECT convalidated
        FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_zielrate_passt_zur_art'
      )
    )
    FROM goals.goal_phases
    WHERE parameters ->> 'source' = 'GO-07 testdata';
  `)

  assert.deepEqual(result, {
    rows: 5,
    variants: 0,
    bulkRows: 2,
    bulkWithRate: 2,
    oldDeltaKeys: 0,
    validated: true,
  })
})

test('G-529 A9: contest_prep akzeptiert NULL und weist beide Vorzeichen ab', () => {
  const result = one<{ accepted: number }>(`
    BEGIN;
    ${phaseInsert('contest_prep', 'NULL')}
    SELECT json_build_object('accepted', count(*))
    FROM goals.goal_phases
    WHERE user_id = ${userId}
      AND gueltig_ab = DATE '2099-01-01'
      AND phase_type = 'contest_prep'
      AND zielrate_pct_kg_woche IS NULL;
    ROLLBACK;
  `)

  assert.deepEqual(result, { accepted: 1 })
  assert.match(failure(phaseInsert('contest_prep', '-0.5')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('contest_prep', '0.5')), /goal_phases_zielrate_passt_zur_art/)
})

test('G-529 A9: reverse_diet akzeptiert NULL und weist beide Vorzeichen ab', () => {
  const result = one<{ accepted: number }>(`
    BEGIN;
    ${phaseInsert('reverse_diet', 'NULL')}
    SELECT json_build_object('accepted', count(*))
    FROM goals.goal_phases
    WHERE user_id = ${userId}
      AND gueltig_ab = DATE '2099-01-01'
      AND phase_type = 'reverse_diet'
      AND zielrate_pct_kg_woche IS NULL;
    ROLLBACK;
  `)

  assert.deepEqual(result, { accepted: 1 })
  assert.match(failure(phaseInsert('reverse_diet', '-0.5')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('reverse_diet', '0.5')), /goal_phases_zielrate_passt_zur_art/)
})

test('G-529 A9: recomp akzeptiert NULL und weist beide Vorzeichen ab', () => {
  const result = one<{ accepted: number }>(`
    BEGIN;
    ${phaseInsert('recomp', 'NULL')}
    SELECT json_build_object('accepted', count(*))
    FROM goals.goal_phases
    WHERE user_id = ${userId}
      AND gueltig_ab = DATE '2099-01-01'
      AND phase_type = 'recomp'
      AND zielrate_pct_kg_woche IS NULL;
    ROLLBACK;
  `)

  assert.deepEqual(result, { accepted: 1 })
  assert.match(failure(phaseInsert('recomp', '-0.5')), /goal_phases_zielrate_passt_zur_art/)
  assert.match(failure(phaseInsert('recomp', '0.5')), /goal_phases_zielrate_passt_zur_art/)
})

test('G-529 A7: offene Ratenregeln tragen keine Zahl, belegte brauchen Quelle und Fundstelle', () => {
  const initial = one<{ rows: number; hasExperienceLevel: boolean }>(`
    SELECT json_build_object(
      'rows', (SELECT count(*) FROM goals.phase_rate_rules),
      'hasExperienceLevel', EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'goals'
          AND table_name = 'phase_rate_rules'
          AND column_name = 'experience_level'
      )
    );
  `)
  assert.deepEqual(initial, { rows: 0, hasExperienceLevel: true })

  assert.match(failure(`
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status
    ) VALUES ('invented', 'fat_loss', -1.0, -0.5, 'open');
  `), /phase_rate_rules_open_has_no_values/)

  assert.match(failure(`
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status
    ) VALUES ('unlocated', 'fat_loss', -1.0, -0.5, 'sourced');
  `), /phase_rate_rules_source_complete/)
})

test('G-529 A8: ohne belegte Regel greift nur die Aussengrenze', () => {
  const result = one<{ accepted: number }>(`
    BEGIN;
    ${phaseInsert('fat_loss', '-2.4')}
    SELECT json_build_object('accepted', count(*))
    FROM goals.goal_phases
    WHERE user_id = ${userId}
      AND phase_type = 'fat_loss'
      AND gueltig_ab = DATE '2099-01-01'
      AND zielrate_pct_kg_woche = -2.4;
    ROLLBACK;
  `)

  assert.deepEqual(result, { accepted: 1 })
})

test('G-529 A8: eine belegte Spanne begrenzt neue Phasenzeilen in beide Richtungen', () => {
  const tooLow = failure(`
    BEGIN;
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status,
      source_id, source_locator
    ) VALUES (
      'fat-loss-proof', 'fat_loss', -1.0, -0.5, 'sourced',
      'example-source', 'table 1'
    );
    ${phaseInsert('fat_loss', '-1.001')}
    COMMIT;
  `)
  assert.match(tooLow, /goal_phase_rate_outside_sourced_range/)

  const tooHigh = failure(`
    BEGIN;
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status,
      source_id, source_locator
    ) VALUES (
      'fat-loss-proof', 'fat_loss', -1.0, -0.5, 'sourced',
      'example-source', 'table 1'
    );
    ${phaseInsert('fat_loss', '-0.499')}
    COMMIT;
  `)
  assert.match(tooHigh, /goal_phase_rate_outside_sourced_range/)

  const inside = one<{ accepted: number }>(`
    BEGIN;
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status,
      source_id, source_locator
    ) VALUES (
      'fat-loss-proof', 'fat_loss', -1.0, -0.5, 'sourced',
      'example-source', 'table 1'
    );
    ${phaseInsert('fat_loss', '-0.75')}
    SELECT json_build_object('accepted', count(*))
    FROM goals.goal_phases
    WHERE user_id = ${userId}
      AND gueltig_ab = DATE '2099-01-01'
      AND zielrate_pct_kg_woche = -0.75;
    ROLLBACK;
  `)
  assert.deepEqual(inside, { accepted: 1 })
})

test('G-529 A8: eine neue belegte Regel darf vorhandene Phasen nicht nachtraeglich brechen', () => {
  const message = failure(`
    BEGIN;
    ${phaseInsert('fat_loss', '-2.4')}
    INSERT INTO goals.phase_rate_rules (
      code, phase_type, lower_value, upper_value, evidence_status,
      source_id, source_locator
    ) VALUES (
      'fat-loss-proof', 'fat_loss', -1.0, -0.5, 'sourced',
      'example-source', 'table 1'
    );
    COMMIT;
  `)

  assert.match(message, /phase_rate_rule_conflicts_with_goal_phases/)
})

test('G-529 A7: Ratenregeln sind lesbar, aber nicht clientseitig schreibbar', () => {
  const result = one<{
    anonSelect: boolean
    authenticatedSelect: boolean
    authenticatedInsert: boolean
    serviceRoleDml: boolean
  }>(`
    SELECT json_build_object(
      'anonSelect', has_table_privilege('anon', 'goals.phase_rate_rules', 'SELECT'),
      'authenticatedSelect', has_table_privilege('authenticated', 'goals.phase_rate_rules', 'SELECT'),
      'authenticatedInsert', has_table_privilege('authenticated', 'goals.phase_rate_rules', 'INSERT'),
      'serviceRoleDml', has_table_privilege(
        'service_role', 'goals.phase_rate_rules', 'SELECT,INSERT,UPDATE,DELETE'
      )
    );
  `)

  assert.deepEqual(result, {
    anonSelect: false,
    authenticatedSelect: true,
    authenticatedInsert: false,
    serviceRoleDml: true,
  })
})
