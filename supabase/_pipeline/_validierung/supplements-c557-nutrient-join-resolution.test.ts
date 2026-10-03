import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-557 braucht PGDATABASE als Wegwerf-Datenbank.')

const input = 'supabase/_pipeline/daten/supplement-naehrstoffcodes.json'
const data = JSON.parse(fs.readFileSync(input, 'utf8')) as {
  mappings: Array<{
    supplement_slug: string
    substance_id: string
    nutrient_code: string
  }>
}

function literal(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-557: alle kuratierten Naehrstoffzeilen bestehen jeden der drei Katalogverbunde', () => {
  const values = data.mappings.map(row => `(
    ${literal(row.supplement_slug)},
    ${literal(row.substance_id)},
    ${literal(row.nutrient_code)}
  )`).join(',\n')
  const result = one<{
    total: number
    supplementSlugs: number
    substanceIds: number
    nutrientCodes: number
    missingSupplementSlugs: string[]
    missingSubstanceIds: string[]
    missingNutrientCodes: string[]
  }>(`
    WITH wanted(supplement_slug, substance_id, nutrient_code) AS (
      VALUES ${values}
    )
    SELECT json_build_object(
      'total', count(*),
      'supplementSlugs', count(sc.id),
      'substanceIds', count(s.id),
      'nutrientCodes', count(nd.code),
      'missingSupplementSlugs', coalesce(
        json_agg(w.supplement_slug ORDER BY w.supplement_slug)
          FILTER (WHERE sc.id IS NULL),
        '[]'::json
      ),
      'missingSubstanceIds', coalesce(
        json_agg(w.substance_id ORDER BY w.substance_id)
          FILTER (WHERE s.id IS NULL),
        '[]'::json
      ),
      'missingNutrientCodes', coalesce(
        json_agg(w.nutrient_code ORDER BY w.nutrient_code)
          FILTER (WHERE nd.code IS NULL),
        '[]'::json
      )
    )
    FROM wanted w
    LEFT JOIN supplements.supplement_catalog sc ON sc.slug = w.supplement_slug
    LEFT JOIN supplements.substance_catalog s ON s.id = w.substance_id
    LEFT JOIN nutrition.nutrient_defs nd ON nd.code = w.nutrient_code;
  `)

  assert.equal(data.mappings.length, 17)
  assert.equal(result.total, data.mappings.length)
  assert.equal(
    result.supplementSlugs,
    data.mappings.length,
    `fehlende supplement_slug: ${result.missingSupplementSlugs.join(', ')}`,
  )
  assert.equal(
    result.substanceIds,
    data.mappings.length,
    `fehlende substance_id: ${result.missingSubstanceIds.join(', ')}`,
  )
  assert.equal(
    result.nutrientCodes,
    data.mappings.length,
    `fehlende nutrient_code: ${result.missingNutrientCodes.join(', ')}`,
  )
})
