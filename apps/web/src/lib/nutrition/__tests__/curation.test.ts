import assert from 'node:assert/strict'
import test from 'node:test'

import { buildNutritionCurationSql } from '../curation'

test('builds a read-only local curation SQL query', () => {
  const sql = buildNutritionCurationSql()

  assert.match(sql, /nutrition\.food_categories/)
  assert.match(sql, /nutrition\.tag_definitions/)
  assert.match(sql, /nutrition\.food_aliases/)
  assert.match(sql, /WHERE f\.category_id IS NULL/)
  assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i)
})
