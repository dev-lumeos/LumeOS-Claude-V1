import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  V1_TAG_DEFINITIONS,
  buildHumanLayerSql,
  extractCategorySeeds,
  normalizeSourceAlias,
  slugifyCategoryName,
} from '../nutrition-human-layer'

const spec = fs.readFileSync('docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md', 'utf8')

test('extracts all spec-backed L1 categories and enough L2 categories without invented names', () => {
  const categories = extractCategorySeeds(spec)
  assert.equal(categories.filter(row => row.level === 1).length, 13)
  assert.ok(categories.filter(row => row.level === 2).length >= 60)
  assert.ok(categories.some(row => row.slug === 'fleisch-gefluegel' && row.name_de === 'FLEISCH & GEFLÜGEL'))
  assert.ok(categories.some(row => row.slug === 'fetter-seefisch' && row.parent_slug === 'fisch-meeresfruechte'))
  assert.ok(categories.some(row => row.slug === 'kartoffeln' && row.parent_slug === 'gemuese'))
})

test('extracts deterministic L3 and L4 category rows from nested spec bullets', () => {
  const categories = extractCategorySeeds(spec)
  assert.ok(categories.filter(row => row.level === 3).length >= 150)
  assert.ok(categories.filter(row => row.level === 4).length >= 20)
  assert.ok(categories.some(row => row.slug === 'gefluegel-haehnchen' && row.parent_slug === 'gefluegel'))
  assert.ok(categories.some(row => row.slug === 'gefluegel-haehnchen-haehnchenbrust-filet' && row.parent_slug === 'gefluegel-haehnchen'))
  assert.ok(categories.every(row => row.slug === row.slug.toLowerCase() && !/[^\x00-\x7F]/.test(row.slug)))
})

test('defines exactly the V1 visible tags requested by the specs', () => {
  assert.deepEqual(V1_TAG_DEFINITIONS.map(row => row.code), [
    'high_protein',
    'low_carb',
    'low_fat',
    'high_fiber',
    'vegan',
    'vegetarian',
    'gluten_free',
    'lactose_free',
    'nut_free',
    'halal',
    'kosher',
    'spicy',
    'thai_food',
    'mediterranean',
    'processed_food',
    'ultra_processed',
  ])
  assert.equal(V1_TAG_DEFINITIONS.find(row => row.code === 'high_protein')?.macro_rule?.nutrient_code, 'PROT625')
  assert.equal(V1_TAG_DEFINITIONS.find(row => row.code === 'thai_food')?.macro_rule, null)
})

test('normalizes source aliases without adding synonyms', () => {
  assert.equal(normalizeSourceAlias('Vollkornbrot mit Kürbiskernen'), 'vollkornbrot mit kuerbiskernen')
  assert.equal(normalizeSourceAlias('Öl, süß-sauer'), 'oel suess sauer')
})

test('generated SQL is local-only and includes deterministic schema, mapping, tag, and alias sections', () => {
  const sql = buildHumanLayerSql(extractCategorySeeds(spec))
  assert.match(sql, /LOCAL ONLY/)
  assert.match(sql, /CREATE TABLE IF NOT EXISTS nutrition\.food_categories/)
  assert.match(sql, /ALTER TABLE nutrition\.foods ADD COLUMN IF NOT EXISTS category_id/)
  assert.match(sql, /INSERT INTO nutrition\.tag_definitions/)
  assert.match(sql, /INSERT INTO nutrition\.food_tags/)
  assert.match(sql, /INSERT INTO nutrition\.food_aliases/)
  assert.match(sql, /slug='fetter-seefisch'/)
  assert.match(sql, /slug='gefluegel-haehnchen'/)
  assert.match(sql, /bls_code LIKE 'D%'/)
  assert.match(sql, /sort_weight = LEAST\(1000, GREATEST\(0,/)
  assert.doesNotMatch(sql, /DEV\/LIVE apply/)
})

test('category slugs are deterministic ASCII identifiers', () => {
  assert.equal(slugifyCategoryName('FLEISCH & GEFLÜGEL'), 'fleisch-gefluegel')
  assert.equal(slugifyCategoryName('Käse — Frischkäse'), 'kaese-frischkaese')
})
