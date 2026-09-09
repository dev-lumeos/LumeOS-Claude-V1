// C-453: Der Planner bekommt pro Peptid genau den kanonischen SubQ-Weg.
// Mehrwegequellen (z.B. BPC-157 und Selank) erhalten keine zweite Skalarspalte;
// die bewusst offene Mehrwege-Modellierung wird hier deshalb nicht vorgetaeuscht.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.LUMEOS_C453_DATABASE
if (!DB || DB === 'postgres') throw new Error('C-453-Test braucht LUMEOS_C453_DATABASE als Wegwerf-Datenbank, nie postgres.')

function sql<T>(statement: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', statement,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-453: Route ist skalar, spec-konform und alle 93 Peptide sind SubQ', () => {
  const result = sql<{
    distribution: Record<string, number>
    peptideTotal: number
    peptideSubq: number
    peptideOtherOrNull: number
    semaglutideAndTirzepatide: Array<{ name: string; route: string }>
    constraintPresent: boolean
    invalidValueRejected: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c453_probe (invalid_value_rejected boolean NOT NULL DEFAULT false);
    INSERT INTO c453_probe DEFAULT VALUES;
    DO \$\$
    BEGIN
      BEGIN
        UPDATE supplements.supplement_pharmacology
        SET route = 'intravenous'
        WHERE supplement_id = (
          SELECT supplement_id FROM supplements.supplement_pharmacology
          ORDER BY supplement_id LIMIT 1
        );
      EXCEPTION WHEN check_violation THEN
        UPDATE c453_probe SET invalid_value_rejected = true;
      END;
    END \$\$;
    SELECT json_build_object(
      'distribution', (
        SELECT json_object_agg(route_key, route_count)
        FROM (
          SELECT coalesce(p.route, '<NULL>') AS route_key, count(*)::integer AS route_count
          FROM supplements.supplements s
          LEFT JOIN supplements.supplement_pharmacology p ON p.supplement_id = s.id
          GROUP BY p.route
          ORDER BY route_key
        ) routes
      ),
      'peptideTotal', (
        SELECT count(*)::integer
        FROM supplements.supplements s
        JOIN supplements.supplement_groups g ON g.id = s.group_id
        WHERE g.code = 'peptide'
      ),
      'peptideSubq', (
        SELECT count(*)::integer
        FROM supplements.supplements s
        JOIN supplements.supplement_groups g ON g.id = s.group_id
        JOIN supplements.supplement_pharmacology p ON p.supplement_id = s.id
        WHERE g.code = 'peptide' AND p.route = 'injection_subq'
      ),
      'peptideOtherOrNull', (
        SELECT count(*)::integer
        FROM supplements.supplements s
        JOIN supplements.supplement_groups g ON g.id = s.group_id
        LEFT JOIN supplements.supplement_pharmacology p ON p.supplement_id = s.id
        WHERE g.code = 'peptide' AND p.route IS DISTINCT FROM 'injection_subq'
      ),
      'semaglutideAndTirzepatide', (
        SELECT json_agg(json_build_object('name', s.name_en, 'route', p.route) ORDER BY s.name_en)
        FROM supplements.supplements s
        JOIN supplements.supplement_pharmacology p ON p.supplement_id = s.id
        WHERE s.name_en IN ('Semaglutide', 'Tirzepatide')
      ),
      'constraintPresent', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'supplements.supplement_pharmacology'::regclass
          AND conname = 'supplement_pharmacology_route_check'
      ),
      'invalidValueRejected', (SELECT invalid_value_rejected FROM c453_probe)
    );
    ROLLBACK;
  `)

  assert.deepEqual(result.distribution, {
    '<NULL>': 289,
    injection_im: 10,
    injection_subq: 93,
    oral: 204,
  })
  assert.equal(result.peptideTotal, 93)
  assert.equal(result.peptideSubq, 93)
  assert.equal(result.peptideOtherOrNull, 0)
  assert.deepEqual(result.semaglutideAndTirzepatide, [
    { name: 'Semaglutide', route: 'injection_subq' },
    { name: 'Tirzepatide', route: 'injection_subq' },
  ])
  assert.equal(result.constraintPresent, true)
  assert.equal(result.invalidValueRejected, true)
})
