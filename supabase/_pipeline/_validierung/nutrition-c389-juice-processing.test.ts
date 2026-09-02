// C-389: Nur drei konkret gemessene Obstfamilien erhalten eine Saft-/Nektar-Korrektur.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

type Probe = {
  levels: Record<string, string>
  smoothieLevels: Record<string, string>
  apricotJuice: { position: number; reason: Record<string, string> } | null
  withoutMinimalProcessing: string[]
}

test('C-389: Saft und Nektar nur in F201, F603 und F310 sind nicht raw', () => {
  const result = one<Probe>(`
    WITH apricot AS (
      SELECT nutrition.food_search(
        'Aprikose', 'aprikose', ARRAY['aprikose'], NULL, '', NULL, '',
        'relevance', 100, 0, NULL, NULL, false, NULL, NULL, '{}'::jsonb
      )::jsonb AS value
    ), without_minimal_processing AS (
      SELECT nutrition.food_search(
        'Aprikose', 'aprikose', ARRAY['aprikose'], NULL, '', NULL, '',
        'relevance', 100, 0, NULL, NULL, false, NULL, NULL,
        '{"exclude_processing_levels": ["minimally_processed"]}'::jsonb
      )::jsonb AS value
    )
    SELECT json_build_object(
      'levels', (
        SELECT json_object_agg(bls_code, processing_level ORDER BY bls_code)
        FROM nutrition.foods
        WHERE bls_code IN ('F201100', 'F201600', 'F603100', 'F603600', 'F603700', 'F310100', 'F310600')
      ),
      'smoothieLevels', (
        SELECT json_object_agg(bls_code, processing_level ORDER BY bls_code)
        FROM nutrition.foods
        WHERE bls_code IN ('F032600', 'F033600', 'F034600')
      ),
      'apricotJuice', (
        SELECT json_build_object(
          'position', position,
          'reason', food->'match_reason'
        )
        FROM apricot
        CROSS JOIN LATERAL jsonb_array_elements(value->'foods') WITH ORDINALITY AS item(food, position)
        WHERE food->>'bls_code' = 'F201600'
      ),
      'withoutMinimalProcessing', (
        SELECT coalesce(json_agg(food->>'bls_code' ORDER BY position), '[]'::json)
        FROM without_minimal_processing
        CROSS JOIN LATERAL jsonb_array_elements(value->'foods') WITH ORDINALITY AS item(food, position)
      )
    );
  `)

  assert.deepEqual(result.levels, {
    F201100: 'raw',
    F201600: 'minimally_processed',
    F310100: 'raw',
    F310600: 'minimally_processed',
    F603100: 'raw',
    F603600: 'minimally_processed',
    F603700: 'minimally_processed',
  })
  assert.deepEqual(result.smoothieLevels, {
    F032600: 'raw',
    F033600: 'raw',
    F034600: 'raw',
  })
  assert.deepEqual(result.apricotJuice, {
    position: 6,
    reason: { kind: 'name_prefix' },
  })
  assert.ok(!result.withoutMinimalProcessing.includes('F201600'), 'Verarbeitungsfilter blendet Aprikosensaft aus')
})
