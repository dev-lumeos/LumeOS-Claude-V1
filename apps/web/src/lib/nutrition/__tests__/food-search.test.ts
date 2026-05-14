import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildFoodSearchFilterHref,
  buildFoodSearchWhereClause,
  normalizeFoodSearchText,
  parseFoodSearchPayload,
  type NutritionFoodSearchPayload,
} from '../food-search'

describe('local Nutrition food search helpers', () => {
  it('normalizes German umlauts for practical BLS source-label search', () => {
    assert.equal(normalizeFoodSearchText('Kürbiskern Öl süß'), 'kuerbiskern oel suess')
    assert.equal(normalizeFoodSearchText('Apfelmus'), 'apfelmus')
  })

  it('builds a source-label and alias search clause for umlaut variants without invented synonyms', () => {
    const clause = buildFoodSearchWhereClause('kuerbis oel')

    assert.match(clause.sql, /LIKE '%kuerbis%'/)
    assert.match(clause.sql, /LIKE '%oel%'/)
    assert.match(clause.sql, /name_de/)
    assert.match(clause.sql, /name_en/)
    assert.match(clause.sql, /food_aliases/)
    assert.deepEqual(clause.tokens, ['kuerbis', 'oel'])
    assert.doesNotMatch(clause.sql, /display_name/i)
  })

  it('builds stable filter hrefs for category and tag chips', () => {
    assert.equal(
      buildFoodSearchFilterHref({ query: 'kuerbis', category: 'brot', tag: 'high_fiber' }),
      '/nutrition?q=kuerbis&category=brot&tag=high_fiber',
    )
    assert.equal(
      buildFoodSearchFilterHref({ query: 'kuerbis', category: 'brot', tag: 'high_fiber' }, { tag: null }),
      '/nutrition?q=kuerbis&category=brot',
    )
  })

  it('parses food search payload with technical BLS label and Human Layer metadata', () => {
    const payload: NutritionFoodSearchPayload = parseFoodSearchPayload(JSON.stringify({
      query: 'brot',
      normalized_query: 'brot',
      category: 'brot',
      tag: 'high_fiber',
      result_count: 1,
      foods: [{
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
        category_slug: 'brot',
        category_name_de: 'Brot',
      }],
      selected_food: {
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
        category_slug: 'brot',
        category_name_de: 'Brot',
      },
      nutrients: [{
        nutrient_code: 'ENERCJ',
        name_de: 'Energie',
        name_en: 'Energy',
        unit: 'kJ',
        value: '1089.00000',
      }],
      categories: [{
        slug: 'brot',
        name_de: 'Brot',
        level: 2,
        count: 12,
      }],
      tags: [{
        code: 'high_fiber',
        name_de: 'Ballaststoffreich',
        count: 3,
      }],
    }))

    assert.equal(payload.foods[0]?.source_label, 'Vollkornbrot mit Kürbiskernen')
    assert.equal(payload.label_policy, 'bls_source_label_not_final_display_name')
    assert.equal(payload.nutrients[0]?.nutrient_code, 'ENERCJ')
    assert.equal(payload.nutrients[0]?.value, '1089.00000')
    assert.equal(payload.selected_food?.category_slug, 'brot')
    assert.equal(payload.categories[0]?.slug, 'brot')
    assert.equal(payload.tags[0]?.code, 'high_fiber')
  })
})
