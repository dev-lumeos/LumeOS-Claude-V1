import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

// Kein Rechenaufruf: Der einzelne Treffer liest bewusst den Kommentar des
// nutzerweiten Altvertrags, an dem die bestehende Faser-Annahme dokumentiert ist.
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_G526_DATABASE
if (!db || db === 'postgres') throw new Error('G-526 braucht eine Wegwerf-Datenbank, nie postgres.')

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

test('G-526: die Regelstruktur ist leer und kann alle neun Phasen getrennt aufnehmen', () => {
  const result = one<{ existing: number; accepted: number }>(`
    BEGIN;
    INSERT INTO goals.nutrition_macro_rules (
      code, nutrient, rule_kind, basis, unit, phase_type, evidence_status
    )
    SELECT
      'open-' || replace(phase_type, '_', '-'),
      'protein',
      'target_range',
      'lean_mass_kg',
      'g_per_kg',
      phase_type,
      'open'
    FROM unnest(ARRAY[
      'fat_loss', 'lean_bulk', 'maintenance', 'recomp', 'contest_prep',
      'reverse_diet', 'expert_bb_annual', 'mini_cut', 'peak_week'
    ]) AS phase_type;
    SELECT json_build_object(
      'existing', (SELECT count(*) FROM goals.nutrition_macro_rules WHERE code NOT LIKE 'open-%'),
      'accepted', (SELECT count(*) FROM goals.nutrition_macro_rules WHERE code LIKE 'open-%')
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, { existing: 0, accepted: 9 })
})

test('G-526: offene Regeln duerfen keine erfundenen Werte tragen', () => {
  const message = failure(`
    INSERT INTO goals.nutrition_macro_rules (
      code, nutrient, rule_kind, basis, unit, phase_type,
      lower_value, upper_value, evidence_status
    ) VALUES (
      'invented-protein', 'protein', 'target_range', 'lean_mass_kg', 'g_per_kg',
      'fat_loss', 2.3, 3.1, 'open'
    );
  `)

  assert.match(message, /nutrition_macro_rules_open_has_no_values/)
})

test('G-526: belegte Regeln brauchen eine konkrete Fundstelle', () => {
  const message = failure(`
    INSERT INTO goals.nutrition_macro_rules (
      code, nutrient, rule_kind, basis, unit, lower_value, evidence_status
    ) VALUES (
      'fat-floor', 'fat', 'hard_minimum', 'body_weight_kg', 'g_per_kg', 0.5, 'sourced'
    );
  `)

  assert.match(message, /nutrition_macro_rules_source_complete/)
})

test('G-526: Band, Untergrenze und Festwert haben verschiedene Formen', () => {
  const result = one<{ rows: number }>(`
    BEGIN;
    INSERT INTO goals.nutrition_macro_rules (
      code, nutrient, rule_kind, basis, unit, lower_value, upper_value,
      evidence_status, source_id, source_locator
    ) VALUES
      ('protein-band', 'protein', 'target_range', 'lean_mass_kg', 'g_per_kg', 1.8, 2.4,
       'sourced', 'example', 'table 1'),
      ('fat-floor', 'fat', 'hard_minimum', 'body_weight_kg', 'g_per_kg', 0.5, NULL,
       'sourced', 'example', 'page 2'),
      ('fiber-target', 'fiber', 'fixed_target', 'per_day', 'g_per_day', 30, 30,
       'assumption', NULL, NULL);
    SELECT json_build_object('rows', count(*))
    FROM goals.nutrition_macro_rules;
    ROLLBACK;
  `)

  assert.deepEqual(result, { rows: 3 })
})

test('G-526: Katalogregeln sind lesbar, aber nicht clientseitig schreibbar', () => {
  const result = one<{
    anonSelect: boolean
    authenticatedSelect: boolean
    authenticatedInsert: boolean
    serviceRoleAll: boolean
  }>(`
    SELECT json_build_object(
      'anonSelect', has_table_privilege('anon', 'goals.nutrition_macro_rules', 'SELECT'),
      'authenticatedSelect', has_table_privilege('authenticated', 'goals.nutrition_macro_rules', 'SELECT'),
      'authenticatedInsert', has_table_privilege('authenticated', 'goals.nutrition_macro_rules', 'INSERT'),
      'serviceRoleAll', has_table_privilege('service_role', 'goals.nutrition_macro_rules', 'SELECT,INSERT,UPDATE,DELETE')
    );
  `)

  assert.deepEqual(result, {
    anonSelect: false,
    authenticatedSelect: true,
    authenticatedInsert: false,
    serviceRoleAll: true,
  })
})

test('G-526: die bestehende Faser-30 ist sichtbar als Annahme markiert', () => {
  const result = one<{ comment: string }>(`
    SELECT json_build_object(
      'comment', obj_description('goals.berechne_zielwerte(uuid,date)'::regprocedure)
    );
  `)

  assert.match(result.comment, /Faser 30 g\/Tag ist \[annahme\]/)
})

test('G-526 A11: updated_at folgt einer Aenderung und bleibt nicht auf dem Default stehen', () => {
  const result = one<{ before: string; after: string }>(`
    BEGIN;
    INSERT INTO goals.nutrition_macro_rules (
      code, nutrient, rule_kind, basis, unit, evidence_status, notes,
      created_at, updated_at
    ) VALUES (
      'touch-proof', 'fiber', 'fixed_target', 'per_day', 'g_per_day',
      'open', 'vorher', '2020-01-01 00:00:00+00', '2020-01-01 00:00:00+00'
    );
    WITH before_update AS (
      SELECT updated_at AS value
      FROM goals.nutrition_macro_rules
      WHERE code = 'touch-proof'
    ), changed AS (
      UPDATE goals.nutrition_macro_rules
      SET notes = 'nachher'
      WHERE code = 'touch-proof'
      RETURNING updated_at
    )
    SELECT json_build_object(
      'before', (SELECT value FROM before_update),
      'after', (SELECT updated_at FROM changed)
    );
    ROLLBACK;
  `)

  assert.equal(result.before, '2020-01-01T00:00:00+00:00')
  assert.notEqual(result.after, result.before)
})
