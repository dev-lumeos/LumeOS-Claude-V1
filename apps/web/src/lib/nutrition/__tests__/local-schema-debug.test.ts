import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  LocalSchemaDebugError,
  parseNutritionSchemaDebug,
} from '../local-schema-debug'

describe('parseNutritionSchemaDebug', () => {
  it('parses a valid local schema payload', () => {
    const snapshot = parseNutritionSchemaDebug(JSON.stringify({
      schema_exists: true,
      table_exists: true,
      row_count: 0,
      columns: [
        { name: 'code', data_type: 'text', is_nullable: false },
        { name: 'name_de', data_type: 'text', is_nullable: false },
        { name: 'name_en', data_type: 'text', is_nullable: false },
        { name: 'name_th', data_type: 'text', is_nullable: false },
        { name: 'group_de', data_type: 'text', is_nullable: false },
        { name: 'group_en', data_type: 'text', is_nullable: false },
        { name: 'group_th', data_type: 'text', is_nullable: false },
      ],
      indexes: [
        { name: 'nutrient_defs_pkey', definition: 'CREATE UNIQUE INDEX nutrient_defs_pkey ON nutrition.nutrient_defs USING btree (code)' },
      ],
      constraints: [
        { name: 'nutrient_defs_pkey', definition: 'PRIMARY KEY (code)' },
      ],
    }))

    assert.equal(snapshot.environment, 'local')
    assert.equal(snapshot.schema_exists, true)
    assert.equal(snapshot.table_exists, true)
    assert.equal(snapshot.row_count, 0)
    assert.equal(snapshot.columns.length, 7)
    assert.equal(snapshot.columns[0]?.name, 'code')
    assert.equal(snapshot.columns[3]?.name, 'name_th')
    assert.equal(snapshot.indexes[0]?.name, 'nutrient_defs_pkey')
    assert.equal(snapshot.constraints[0]?.definition, 'PRIMARY KEY (code)')
  })

  it('normalizes missing arrays to empty lists', () => {
    const snapshot = parseNutritionSchemaDebug(JSON.stringify({
      schema_exists: false,
      table_exists: false,
      row_count: 0,
    }))

    assert.deepEqual(snapshot.columns, [])
    assert.deepEqual(snapshot.indexes, [])
    assert.deepEqual(snapshot.constraints, [])
  })

  it('throws for empty output', () => {
    assert.throws(
      () => parseNutritionSchemaDebug(''),
      (error: unknown) => error instanceof LocalSchemaDebugError && error.code === 'INVALID_DEBUG_PAYLOAD',
    )
  })

  it('throws for non-json output', () => {
    assert.throws(
      () => parseNutritionSchemaDebug('not-json'),
      (error: unknown) => error instanceof LocalSchemaDebugError && error.code === 'INVALID_DEBUG_PAYLOAD',
    )
  })
})
