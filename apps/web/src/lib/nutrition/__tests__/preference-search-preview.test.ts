import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPreferencePreviewSql, deterministicExclusionOptions, resolveDeterministicExclusions } from '../preference-search-preview'

test('resolves only deterministic general exclusion mappings', () => {
  const result = resolveDeterministicExclusions(['no_offal', 'no_gluten', 'unknown_code'])

  assert.deepEqual(result.categorySlugs, ['innereien'])
  assert.equal(result.applied.length, 1)
  assert.equal(result.applied[0]?.effect, 'hard_exclude')
  assert.deepEqual(result.unresolved.map(item => item.code), ['no_gluten', 'unknown_code'])
})

test('builds a read-only preference preview SQL query', () => {
  const sql = buildPreferencePreviewSql({
    query: 'kürbis',
    exclusions: ['no_offal'],
    likedCategories: ['gemuese'],
    dislikedCategories: ['wurstwaren-aufschnitt'],
    likedTags: ['high_fiber'],
    dislikedTags: ['processed_food'],
    limit: 25,
    offset: 0,
    sort: 'relevance',
  })

  assert.match(sql, /WITH RECURSIVE excluded_categories/)
  assert.match(sql, /nutrition\.food_aliases/)
  assert.match(sql, /nutrition\.food_nutrients/)
  assert.match(sql, /nutrition\.food_tags/)
  assert.match(sql, /'high_fiber'/)
  assert.doesNotMatch(sql, /'high-fiber'/)
  assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i)
})

test('exposes unresolved exclusion options for UI transparency', () => {
  const options = deterministicExclusionOptions()
  const unresolved = options.filter(item => item.mapping_status !== 'mapped').map(item => item.code)

  assert.deepEqual(unresolved.sort(), ['no_gluten', 'no_raw_fish'])
})
