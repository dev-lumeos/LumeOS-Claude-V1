import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildNutrientDetailLink } from '../nutrient-detail-link'

describe('buildNutrientDetailLink', () => {
  it('builds a local schema deep link for the selected nutrient', () => {
    assert.equal(
      buildNutrientDetailLink('', 'CHO', null),
      '/nutrition/local-schema?nutrient=CHO',
    )
  })

  it('includes a valid pinned nutrient in the exposed link', () => {
    assert.equal(
      buildNutrientDetailLink('', 'CHO', 'ENERCJ'),
      '/nutrition/local-schema?nutrient=CHO&pinned=ENERCJ',
    )
  })

  it('preserves unrelated query state while replacing nutrient and stale pinned state', () => {
    assert.equal(
      buildNutrientDetailLink('group=macro&nutrient=ENERCJ&pinned=MISSING', 'CHO', null),
      '/nutrition/local-schema?group=macro&nutrient=CHO',
    )
  })
})
