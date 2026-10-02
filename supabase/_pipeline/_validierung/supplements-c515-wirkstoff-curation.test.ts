import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-515 braucht PGDATABASE als Wegwerf-Datenbank.')

const curated = [
  ['pantothenic-acid', 'Pantothenic Acid'],
  ['selenium', 'Selenium'],
  ['chromium', 'Chromium'],
  ['inositol', 'Inositol'],
  ['docosahexaenoic-acid', 'Docosahexaenoic Acid'],
  ['eicosapentaenoic-acid', 'Eicosapentaenoic Acid'],
  ['bromelain', 'Bromelain'],
  ['lutein', 'Lutein'],
  ['vanadium', 'Vanadium'],
  ['papain', 'Papain'],
  ['ginger', 'Ginger'],
  ['alpha-lipoic-acid', 'Alpha Lipoic Acid'],
  ['l-valine', 'L-Valine'],
  ['l-isoleucine', 'L-Isoleucine'],
  ['lactase', 'Lactase'],
  ['rutin', 'Rutin'],
  ['lactobacillus-acidophilus', 'Lactobacillus acidophilus'],
  ['coenzyme-q10', 'Coenzyme Q10'],
  ['paba', 'PABA'],
  ['turmeric', 'Turmeric'],
  ['zeaxanthin', 'Zeaxanthin'],
] as const

const expectedTargets = [...curated, ['caffeine', 'Caffeine'], ['caffeine', 'Caffeine Anhydrous']] as const

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-515: nur kuratierte, exakt belegte Wirkstoffe werden als Katalogwurzeln und Produktinhalte verknuepft', () => {
  const values = expectedTargets.map(([slug, ingredient]) => `('${slug}', '${ingredient.replaceAll("'", "''")}')`).join(',\n')
  const result = one<{
    newRoots: number
    targetCount: number
    catalogRoots: number
    exactLinks: boolean
    foreignLinks: number
    identitySources: number
    clinicalGrades: number
    specializedChildren: number
    excipientRoots: number
    allergyMatches: number
  }>(`
    WITH expected(slug, ingredient_name) AS (VALUES ${values}),
    c515_targets AS (
      SELECT s.id, s.slug, s.name_en, s.evidence_grade, s.im_katalog, s.parent_id
      FROM supplements.supplements s
      WHERE s.source = 'c515_dsld_label_curation'
    )
    SELECT json_build_object(
      'newRoots', (SELECT count(*) FROM c515_targets),
      'targetCount', (SELECT count(DISTINCT s.slug) FROM expected e JOIN supplements.supplements s ON s.slug = e.slug),
      'catalogRoots', (
        SELECT count(*)
        FROM c515_targets
        WHERE im_katalog AND parent_id IS NULL
      ),
      'exactLinks', NOT EXISTS (
        SELECT 1
        FROM supplements.product_contents pc
        JOIN supplements.supplements s ON s.id = pc.supplement_id
        JOIN c515_targets ct ON ct.id = s.id
        WHERE NOT EXISTS (
          SELECT 1
          FROM expected e
          WHERE e.slug = s.slug
            AND nutrition.search_fold(e.ingredient_name) = nutrition.search_fold(pc.ingredient_name)
        )
      ),
      'foreignLinks', (
        SELECT count(*)
        FROM supplements.product_contents pc
        JOIN c515_targets s ON s.id = pc.supplement_id
        LEFT JOIN expected e ON e.slug = s.slug
          AND nutrition.search_fold(e.ingredient_name) = nutrition.search_fold(pc.ingredient_name)
        WHERE e.slug IS NULL
      ),
      'identitySources', (
        SELECT count(*)
        FROM supplements.supplement_field_sources fs
        JOIN expected e ON true
        JOIN supplements.supplements s ON s.slug = e.slug AND s.id = fs.supplement_id
        WHERE fs.source = 'c515_dsld_label_curation'
          AND fs.field_name = 'identity.c515_dsld_label'
          AND fs.source_id = 'dsld_product_contents:exact_label:' || nutrition.search_fold(e.ingredient_name)
          AND fs.status = 'bekannt'
          AND fs.evidence_class = 'A'
      ),
      'clinicalGrades', (
        SELECT count(*)
        FROM c515_targets
        WHERE evidence_grade IS NOT NULL
      ),
      'specializedChildren', (
        SELECT count(*)
        FROM (VALUES
          ('sub_b7423d9551', 'chromium'),
          ('sub_807cf36d76', 'coenzyme-q10'),
          ('sub_c747ba99bc', 'selenium')
        ) AS expected_child(slug, parent_slug)
        JOIN supplements.supplements child ON child.slug = expected_child.slug
        JOIN supplements.supplements parent ON parent.slug = expected_child.parent_slug
        WHERE child.parent_id = parent.id
          AND NOT child.im_katalog
      ),
      'excipientRoots', (
        SELECT count(*)
        FROM c515_targets
        WHERE nutrition.search_fold(name_en) IN (
          'magnesium stearate', 'silica', 'silicon dioxide', 'cellulose',
          'microcrystalline cellulose', 'sucralose', 'soy lecithin'
        )
      ),
      'allergyMatches', (
        SELECT count(DISTINCT product_id)
        FROM supplements.product_contents pc
        JOIN public.allergen_aliases aa
          ON nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold(aa.alias_text)
        WHERE aa.stoff_code = 'supplements:magnesium_stearate'
      )
    );
  `)

  assert.equal(result.newRoots, curated.length)
  assert.equal(result.targetCount, curated.length + 1)
  assert.equal(result.catalogRoots, curated.length)
  assert.equal(result.exactLinks, true)
  assert.equal(result.foreignLinks, 0)
  assert.equal(result.identitySources, expectedTargets.length)
  assert.equal(result.clinicalGrades, 0)
  assert.equal(result.specializedChildren, 3)
  assert.equal(result.excipientRoots, 0)
  assert.ok(result.allergyMatches > 0)
})
