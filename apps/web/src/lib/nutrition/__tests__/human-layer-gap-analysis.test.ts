import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAliasCoverageAnalysisSql,
  buildCategoryCoverageAnalysisSql,
  candidateCategoryRules,
  summarizeAliasCoverage,
} from '../human-layer-gap-analysis'

test('builds read-only category coverage analysis SQL', () => {
  const sql = buildCategoryCoverageAnalysisSql()

  assert.match(sql, /nutrition\.foods/)
  assert.match(sql, /nutrition\.food_categories/)
  assert.match(sql, /unassigned_by_prefix_1/)
  assert.match(sql, /top_unassigned_prefix_2/)
  assert.match(sql, /top_label_patterns/)
  assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i)
})

test('builds read-only alias coverage analysis SQL', () => {
  const sql = buildAliasCoverageAnalysisSql()

  assert.match(sql, /nutrition\.food_aliases/)
  assert.match(sql, /zero_alias_foods/)
  assert.match(sql, /foods_with_german_umlauts/)
  assert.match(sql, /foods_with_english_source_labels/)
  assert.doesNotMatch(sql, /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/i)
})

test('marks category rules as candidates instead of applying ambiguous mappings', () => {
  const rules = candidateCategoryRules()

  assert.equal(rules.some(rule => rule.action === 'report_only'), true)
  assert.equal(rules.some(rule => rule.rule.includes('X/Y prepared dish')), true)
  assert.equal(rules.every(rule => rule.reason.length > 30), true)
})

test('does not recommend alias expansion when baseline coverage is complete', () => {
  const result = summarizeAliasCoverage({
    foods: 7140,
    aliases: 21420,
    zeroAliasFoods: 0,
    oneAliasFoods: 0,
    multiAliasFoods: 7140,
    foodsWithGermanUmlauts: 3248,
    foodsWithEnglishSourceLabels: 7140,
  })

  assert.equal(result.canApplySafeExpansion, false)
  assert.match(result.reason, /human curation/)
})
