import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { NutritionNutrientPreviewRow } from '../local-schema-debug'
import {
  buildNutrientPinCompareRows,
  buildNutrientPinUrl,
  clearNutrientPinUrl,
  formatNutrientPinCompareValue,
  resolvePinnedNutrientRow,
} from '../nutrient-pin-compare'

const selected: NutritionNutrientPreviewRow = {
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
  formula: null,
  rda_male: '130',
  rda_female: '130',
  rda_unit: 'g',
}

const pinned: NutritionNutrientPreviewRow = {
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
  formula: 'protein * 17 + fat * 37 + carbohydrate * 17',
  rda_male: null,
  rda_female: null,
  rda_unit: null,
}

describe('formatNutrientPinCompareValue', () => {
  it('keeps empty strings and nullable values explicit', () => {
    assert.equal(formatNutrientPinCompareValue(''), "''")
    assert.equal(formatNutrientPinCompareValue(null), 'NULL')
    assert.equal(formatNutrientPinCompareValue(undefined), 'NULL')
  })

  it('formats scalar values without inference', () => {
    assert.equal(formatNutrientPinCompareValue(false), 'false')
    assert.equal(formatNutrientPinCompareValue(true), 'true')
    assert.equal(formatNutrientPinCompareValue(1), '1')
    assert.equal(formatNutrientPinCompareValue('g'), 'g')
  })
})

describe('resolvePinnedNutrientRow', () => {
  it('resolves a pinned nutrient by code from the visible rows', () => {
    assert.equal(resolvePinnedNutrientRow([selected, pinned], 'ENERCJ')?.code, 'ENERCJ')
  })

  it('returns null when the pinned nutrient is missing or unset', () => {
    assert.equal(resolvePinnedNutrientRow([selected], 'ENERCJ'), null)
    assert.equal(resolvePinnedNutrientRow([selected], null), null)
  })
})

describe('nutrient pin URLs', () => {
  it('sets the pinned nutrient while preserving the selected nutrient', () => {
    assert.equal(
      buildNutrientPinUrl('/nutrition/local-schema', 'nutrient=CHO&query=energy', 'ENERCJ'),
      '/nutrition/local-schema?nutrient=CHO&query=energy&pinned=ENERCJ',
    )
  })

  it('clears the pinned nutrient without dropping other filters', () => {
    assert.equal(
      clearNutrientPinUrl('/nutrition/local-schema', 'nutrient=CHO&pinned=ENERCJ&query=energy'),
      '/nutrition/local-schema?nutrient=CHO&query=energy',
    )
  })
})

describe('buildNutrientPinCompareRows', () => {
  it('compares selected and pinned nutrient fields with explicit display values', () => {
    const rows = buildNutrientPinCompareRows(selected, pinned)

    assert.deepEqual(
      rows.map((row) => row.key),
      [
        'code',
        'name_de',
        'name_en',
        'name_th',
        'unit',
        'group_de',
        'group_en',
        'group_th',
        'display_tier',
        'is_always_computed',
        'is_partly_computed',
        'formula',
        'rda_male',
        'rda_female',
        'rda_unit',
      ],
    )
    assert.deepEqual(rows.find((row) => row.key === 'name_th'), {
      key: 'name_th',
      label: 'name_th',
      selected: "''",
      pinned: "''",
      matches: true,
    })
    assert.deepEqual(rows.find((row) => row.key === 'rda_male'), {
      key: 'rda_male',
      label: 'rda_male',
      selected: '130',
      pinned: 'NULL',
      matches: false,
    })
  })

  it('returns an empty compare set when either side is unavailable', () => {
    assert.deepEqual(buildNutrientPinCompareRows(selected, null), [])
    assert.deepEqual(buildNutrientPinCompareRows(null, pinned), [])
  })
})
