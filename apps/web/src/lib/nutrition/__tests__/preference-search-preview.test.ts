import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPreferencePreviewRpcArgs, deterministicExclusionOptions, resolveDeterministicExclusions } from '../preference-search-preview'

test('resolves only deterministic general exclusion mappings', () => {
  const result = resolveDeterministicExclusions(['no_offal', 'no_gluten', 'unknown_code'])

  assert.deepEqual(result.categorySlugs, ['innereien'])
  assert.equal(result.applied.length, 1)
  assert.equal(result.applied[0]?.effect, 'hard_exclude')
  assert.deepEqual(result.unresolved.map(item => item.code), ['no_gluten', 'unknown_code'])
})

test('builds read-only preference preview rpc arguments', () => {
  const args = buildPreferencePreviewRpcArgs({
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

  assert.equal(args.p_query, 'kürbis')
  assert.equal(args.p_normalized_query, 'kuerbis')
  assert.deepEqual(args.p_tokens, ['kuerbis'])
  assert.deepEqual(args.p_excluded_category_slugs, ['innereien'])
  assert.deepEqual(args.p_liked_category_slugs, ['gemuese'])
  assert.deepEqual(args.p_disliked_category_slugs, ['wurstwaren-aufschnitt'])
  assert.deepEqual(args.p_liked_tags, ['high_fiber'])
  assert.deepEqual(args.p_disliked_tags, ['processed_food'])
  assert.equal(args.p_sort, 'relevance')
  assert.equal(args.p_limit, 25)
  assert.equal(args.p_offset, 0)
})

test('normalizes tag codes and clamps paging in preview rpc arguments', () => {
  const args = buildPreferencePreviewRpcArgs({
    query: '',
    exclusions: [],
    likedCategories: ['Gemüse & Salat'],
    dislikedCategories: [],
    likedTags: ['High Fiber'],
    dislikedTags: [],
    limit: 500,
    offset: -3,
    sort: 'name_asc',
  })

  assert.deepEqual(args.p_liked_category_slugs, ['gemuese-salat'])
  assert.deepEqual(args.p_liked_tags, ['high_fiber'])
  assert.deepEqual(args.p_tokens, [])
  assert.equal(args.p_limit, 100)
  assert.equal(args.p_offset, 0)
})

test('exposes unresolved exclusion options for UI transparency', () => {
  const options = deterministicExclusionOptions()
  const unresolved = options.filter(item => item.mapping_status !== 'mapped').map(item => item.code)

  assert.deepEqual(unresolved.sort(), ['no_gluten', 'no_raw_fish'])
})
