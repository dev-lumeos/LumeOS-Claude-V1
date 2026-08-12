import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCurationRpcArgs, buildNutritionCurationPersistenceSql } from '../curation'

test('builds read-only curation rpc arguments with normalized defaults', () => {
  const defaults = buildCurationRpcArgs()

  assert.equal(defaults.p_unassigned_only, true)
  assert.equal(defaults.p_category, '')
  assert.equal(defaults.p_tag, '')
  assert.equal(defaults.p_alias_state, '')
  assert.equal(defaults.p_sort, 'category_missing_first')

  const custom = buildCurationRpcArgs({
    unassignedOnly: false,
    category: 'brot',
    tag: 'high_fiber',
    aliasState: 'missing',
    sort: 'macro_relevance',
  })

  assert.equal(custom.p_unassigned_only, false)
  assert.equal(custom.p_category, 'brot')
  assert.equal(custom.p_tag, 'high_fiber')
  assert.equal(custom.p_alias_state, 'missing')
  assert.equal(custom.p_sort, 'macro_relevance')

  // Unbekannte Werte fallen deterministisch auf die Defaults zurück.
  const fallback = buildCurationRpcArgs({ sort: 'evil' as never, aliasState: 'x' as never })
  assert.equal(fallback.p_sort, 'category_missing_first')
  assert.equal(fallback.p_alias_state, '')
})

test('builds local-only curation persistence tables without mutating foods', () => {
  const sql = buildNutritionCurationPersistenceSql()

  assert.match(sql, /CREATE TABLE IF NOT EXISTS nutrition\.food_curation_candidates/)
  assert.match(sql, /CREATE TABLE IF NOT EXISTS nutrition\.food_curation_decisions/)
  assert.match(sql, /target_type IN \('category_assignment', 'display_name', 'alias', 'preference_item_mapping'\)/)
  assert.match(sql, /status IN \('pending', 'accepted', 'rejected', 'superseded'\)/)
  assert.doesNotMatch(sql, /\bUPDATE\s+nutrition\.foods\b/i)
  assert.doesNotMatch(sql, /\bINSERT\s+INTO\s+nutrition\.foods\b/i)
})
