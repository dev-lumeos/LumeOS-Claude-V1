import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { NutritionNutrientPreviewRow } from '../local-schema-debug'
import { formatNutrientDetailValue, selectNutrientDetailRow } from '../nutrient-detail-selection'

const rows: NutritionNutrientPreviewRow[] = [
  {
    code: 'ENERCJ',
    name_de: 'Energie (Kilojoule)',
    name_en: 'Energy (kilojoule)',
    name_th: '',
    unit: 'kJ',
    group_de: 'Energie',
    group_en: 'Energy',
    group_th: '',
    sort_index: 10,
    display_tier: 1,
    is_always_computed: true,
    is_partly_computed: false,
    formula: null,
    rda_male: null,
    rda_female: null,
    rda_unit: null,
  },
  {
    code: 'CHO',
    name_de: 'Kohlenhydrate, verfuegbar',
    name_en: 'Carbohydrate, available',
    name_th: '',
    unit: 'g',
    group_de: 'Makronaehrstoffe',
    group_en: 'Proximate',
    group_th: '',
    sort_index: 20,
    display_tier: 1,
    is_always_computed: false,
    is_partly_computed: false,
    formula: 'sum',
    rda_male: '130',
    rda_female: '130',
    rda_unit: 'g',
  },
]

describe('selectNutrientDetailRow', () => {
  it('selects a matching nutrient row by code', () => {
    assert.equal(selectNutrientDetailRow(rows, 'CHO')?.code, 'CHO')
  })

  it('falls back to the first row when the selected code is not visible', () => {
    assert.equal(selectNutrientDetailRow(rows, 'MISSING')?.code, 'ENERCJ')
  })

  it('returns null for an empty row set', () => {
    assert.equal(selectNutrientDetailRow([], 'CHO'), null)
  })
})

describe('formatNutrientDetailValue', () => {
  it('formats empty and nullable values explicitly', () => {
    assert.equal(formatNutrientDetailValue(''), "''")
    assert.equal(formatNutrientDetailValue(null), 'NULL')
    assert.equal(formatNutrientDetailValue(undefined), 'NULL')
  })

  it('formats scalar detail values for display', () => {
    assert.equal(formatNutrientDetailValue(true), 'true')
    assert.equal(formatNutrientDetailValue(false), 'false')
    assert.equal(formatNutrientDetailValue(12), '12')
    assert.equal(formatNutrientDetailValue('mg'), 'mg')
  })
})
