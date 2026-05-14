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
      group_counts: [
        { group_de: 'Aminosäuren', group_en: 'Amino acids', row_count: 19 },
      ],
      nutrient_preview: [
        {
          code: 'AAE9',
          name_de: 'Aminosäuren, unentbehrlich, gesamt',
          name_en: 'Amino acids, essential, total',
          name_th: '',
          unit: 'g',
          group_de: 'Aminosäuren',
          group_en: 'Amino acids',
          group_th: '',
          sort_index: 30,
          display_tier: 1,
          is_always_computed: false,
          is_partly_computed: true,
          formula: null,
          rda_male: 12,
          rda_female: 10,
          rda_unit: 'g',
        },
      ],
      rda_summary: {
        rda_male_populated: 26,
        rda_female_populated: 26,
        rda_unit_populated: 26,
      },
      food_foundation: {
        foods_table_exists: true,
        food_nutrients_table_exists: true,
        foods_row_count: 0,
        food_nutrients_row_count: 0,
        food_nutrients_nutrient_fk_exists: true,
      },
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
    assert.equal(snapshot.group_counts[0]?.group_de, 'Aminosäuren')
    assert.equal(snapshot.group_counts[0]?.row_count, 19)
    assert.equal(snapshot.nutrient_preview[0]?.code, 'AAE9')
    assert.equal(snapshot.nutrient_preview[0]?.name_de, 'Aminosäuren, unentbehrlich, gesamt')
    assert.equal(snapshot.nutrient_preview[0]?.name_th, '')
    assert.equal(snapshot.nutrient_preview[0]?.sort_index, 30)
    assert.equal(snapshot.nutrient_preview[0]?.display_tier, 1)
    assert.equal(snapshot.nutrient_preview[0]?.is_partly_computed, true)
    assert.equal(snapshot.nutrient_preview[0]?.formula, null)
    assert.equal(snapshot.nutrient_preview[0]?.rda_male, '12')
    assert.equal(snapshot.nutrient_preview[0]?.rda_female, '10')
    assert.equal(snapshot.nutrient_preview[0]?.rda_unit, 'g')
    assert.equal(snapshot.rda_summary.rda_male_populated, 26)
    assert.equal(snapshot.food_foundation.foods_table_exists, true)
    assert.equal(snapshot.food_foundation.food_nutrients_table_exists, true)
    assert.equal(snapshot.food_foundation.foods_row_count, 0)
    assert.equal(snapshot.food_foundation.food_nutrients_row_count, 0)
    assert.equal(snapshot.food_foundation.food_nutrients_nutrient_fk_exists, true)
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
    assert.deepEqual(snapshot.group_counts, [])
    assert.deepEqual(snapshot.nutrient_preview, [])
    assert.deepEqual(snapshot.rda_summary, {
      rda_male_populated: 0,
      rda_female_populated: 0,
      rda_unit_populated: 0,
    })
    assert.deepEqual(snapshot.food_foundation, {
      foods_table_exists: false,
      food_nutrients_table_exists: false,
      foods_row_count: 0,
      food_nutrients_row_count: 0,
      food_nutrients_nutrient_fk_exists: false,
    })
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
