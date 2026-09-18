import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C514_DATABASE
if (!db || db === 'postgres') throw new Error('C-514 braucht LUMEOS_C514_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-514: nur Glycerin wird als eindeutige bestehende Katalogidentitaet rueckverknuepft', () => {
  const result = one<{
    glycerinTargets: number
    glycerinOpen: number
    gelatinOpen: number
    caffeineOpen: number
    seleniumOpen: number
  }>(`
    WITH catalog_names AS (
      SELECT s.id, nutrition.search_fold(s.name_en) AS folded
      FROM supplements.supplements s
      UNION ALL
      SELECT a.supplement_id, nutrition.search_fold(a.alias)
      FROM supplements.supplement_aliases a
    )
    SELECT json_build_object(
      'glycerinTargets', (
        SELECT count(DISTINCT id) FROM catalog_names WHERE folded = nutrition.search_fold('Glycerin')
      ),
      'glycerinOpen', (
        SELECT count(*) FROM supplements.product_contents
        WHERE source = 'dsld' AND supplement_id IS NULL
          AND nutrition.search_fold(ingredient_name) = nutrition.search_fold('Glycerin')
      ),
      'gelatinOpen', (
        SELECT count(*) FROM supplements.product_contents
        WHERE source = 'dsld' AND supplement_id IS NULL
          AND nutrition.search_fold(ingredient_name) = nutrition.search_fold('Gelatin')
      ),
      'caffeineOpen', (
        SELECT count(*) FROM supplements.product_contents
        WHERE source = 'dsld' AND supplement_id IS NULL
          AND nutrition.search_fold(ingredient_name) = nutrition.search_fold('Caffeine')
      ),
      'seleniumOpen', (
        SELECT count(*) FROM supplements.product_contents
        WHERE source = 'dsld' AND supplement_id IS NULL
          AND nutrition.search_fold(ingredient_name) = nutrition.search_fold('Selenium')
      )
    );
  `)

  assert.equal(result.glycerinTargets, 1)
  assert.equal(result.glycerinOpen, 0)
  assert.ok(result.gelatinOpen > 0)
  assert.equal(result.caffeineOpen, 0)
  assert.equal(result.seleniumOpen, 0)
})
