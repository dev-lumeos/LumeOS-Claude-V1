import assert from 'node:assert/strict'
import fs from 'node:fs'
import { describe, it } from 'node:test'

import { guardMigrationContent } from '../../../agent-registry/authorize-tool-call'

const MIGRATION_PATH = 'supabase/migrations/20260514_001_nutrition_food_foundation_slice.sql'

function readMigration(): string {
  return fs.readFileSync(MIGRATION_PATH, 'utf8')
}

describe('P1-005 local food foundation schema slice', () => {
  it('is accepted by the migration guard', () => {
    const result = guardMigrationContent(readMigration(), 'db-migration-agent')

    assert.equal(result.allowed, true, result.reason ?? 'migration guard rejected local food foundation slice')
  })

  it('creates only the minimum local food foundation tables', () => {
    const sql = readMigration()

    assert.match(sql, /create\s+table\s+nutrition\.foods/i)
    assert.match(sql, /create\s+table\s+nutrition\.food_nutrients/i)
    assert.doesNotMatch(sql, /create\s+table\s+nutrition\.food_categories/i)
    assert.doesNotMatch(sql, /create\s+table\s+nutrition\.food_aliases/i)
    assert.doesNotMatch(sql, /create\s+table\s+nutrition\.food_tags/i)
    assert.doesNotMatch(sql, /create\s+table\s+nutrition\.tag_definitions/i)
  })

  it('references nutrient_defs by code and inserts no food or nutrient values', () => {
    const sql = readMigration()

    assert.match(sql, /nutrient_code\s+text\s+not\s+null\s+references\s+nutrition\.nutrient_defs\(code\)/i)
    assert.doesNotMatch(sql, /insert\s+into\s+nutrition\.foods/i)
    assert.doesNotMatch(sql, /insert\s+into\s+nutrition\.food_nutrients/i)
    assert.doesNotMatch(sql, /copy\s+nutrition\.foods/i)
    assert.doesNotMatch(sql, /copy\s+nutrition\.food_nutrients/i)
  })

  it('preserves the local-only boundary in the migration header', () => {
    const sql = readMigration()

    assert.match(sql, /Local Supabase\/Test DB only after gates pass/i)
    assert.match(sql, /No DEV\/LIVE/i)
    assert.match(sql, /No BLS import/i)
    assert.match(sql, /No raw BLS commit/i)
    assert.match(sql, /No seed\/import rows/i)
    assert.match(sql, /No food search\/UI/i)
  })
})
