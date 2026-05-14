import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
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

  it('builds a source-label search clause for umlaut variants without invented aliases', () => {
    const clause = buildFoodSearchWhereClause('kuerbis oel')

    assert.match(clause.sql, /LIKE '%kuerbis%'/)
    assert.match(clause.sql, /LIKE '%oel%'/)
    assert.match(clause.sql, /name_de/)
    assert.match(clause.sql, /name_en/)
    assert.deepEqual(clause.tokens, ['kuerbis', 'oel'])
    assert.doesNotMatch(clause.sql, /alias/i)
    assert.doesNotMatch(clause.sql, /display_name/i)
  })

  it('parses food search payload with technical BLS label metadata', () => {
    const payload: NutritionFoodSearchPayload = parseFoodSearchPayload(JSON.stringify({
      query: 'brot',
      normalized_query: 'brot',
      result_count: 1,
      foods: [{
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
      }],
      selected_food: {
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
      },
      nutrients: [{
        nutrient_code: 'ENERCJ',
        name_de: 'Energie',
        name_en: 'Energy',
        unit: 'kJ',
        value: '1089.00000',
      }],
    }))

    assert.equal(payload.foods[0]?.source_label, 'Vollkornbrot mit Kürbiskernen')
    assert.equal(payload.label_policy, 'bls_source_label_not_final_display_name')
    assert.equal(payload.nutrients[0]?.nutrient_code, 'ENERCJ')
    assert.equal(payload.nutrients[0]?.value, '1089.00000')
  })
})
