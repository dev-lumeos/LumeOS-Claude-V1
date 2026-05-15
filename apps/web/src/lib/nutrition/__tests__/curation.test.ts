import assert from 'node:assert/strict'
import test from 'node:test'

import { buildNutritionCurationSql, buildNutritionCurationPersistenceSql } from '../curation'

test('builds a read-only local curation SQL query', () => {
  const sql = buildNutritionCurationSql()

  assert.match(sql, /nutrition\.food_categories/)
  assert.match(sql, /nutrition\.tag_definitions/)
  assert.match(sql, /nutrition\.food_aliases/)
  assert.match(sql, /alias_coverage/)
  assert.match(sql, /zero_alias_foods/)
  assert.match(sql, /WHERE f\.category_id IS NULL/)
  assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i)
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
