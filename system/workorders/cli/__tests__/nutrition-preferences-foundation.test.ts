import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildPreferencesFoundationSql,
  buildPreferencesReport,
  buildPreferencesValidationSql,
} from '../nutrition-preferences-foundation'

test('preferences foundation SQL is local schema only and includes screenshot-backed fields', () => {
  const sql = buildPreferencesFoundationSql()

  assert.match(sql, /LOCAL ONLY/)
  assert.match(sql, /CREATE TABLE IF NOT EXISTS nutrition\.food_preferences/)
  assert.match(sql, /CREATE TABLE IF NOT EXISTS nutrition\.food_preference_items/)
  assert.match(sql, /meal_prep_ok BOOLEAN DEFAULT false/)
  assert.match(sql, /planner_notes TEXT DEFAULT ''/)
  assert.match(sql, /general_exclusions TEXT\[\] DEFAULT '\{\}'/)
  assert.match(sql, /target_type IN \('food','category','tag','cuisine','exclusion_preset','catalog_item'\)/)
  assert.doesNotMatch(sql, /INSERT INTO nutrition\.food_preferences/)
  assert.doesNotMatch(sql, /INSERT INTO nutrition\.food_preference_items/)
})

test('preferences validation SQL reports catalog and FK safety checks', () => {
  const sql = buildPreferencesValidationSql()

  assert.match(sql, /food_preferences_exists/)
  assert.match(sql, /preference_catalog_food_items/)
  assert.match(sql, /orphan_preference_categories/)
  assert.match(sql, /orphan_preference_tags/)
})

test('preferences report documents smart search boundary and unresolved mappings', () => {
  const report = buildPreferencesReport()

  assert.match(report, /Screenshot Requirements Coverage/)
  assert.match(report, /no_gluten/)
  assert.match(report, /Smart Search Boundary/)
  assert.match(report, /No rows are inserted for real users/)
})
