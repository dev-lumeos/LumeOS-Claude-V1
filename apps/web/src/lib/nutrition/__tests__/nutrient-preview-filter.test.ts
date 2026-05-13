import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { NutritionNutrientPreviewRow } from '../local-schema-debug'
import { filterNutrientPreviewRows } from '../nutrient-preview-filter'

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
    formula: null,
    rda_male: '130',
    rda_female: '130',
    rda_unit: 'g',
  },
  {
    code: 'AAE9',
    name_de: 'Aminosaeuren, unentbehrlich, gesamt',
    name_en: 'Amino acids, essential, total',
    name_th: '',
    unit: 'g',
    group_de: 'Aminosaeuren',
    group_en: 'Amino acids',
    group_th: '',
    sort_index: 30,
    display_tier: 2,
    is_always_computed: false,
    is_partly_computed: true,
    formula: null,
    rda_male: null,
    rda_female: null,
    rda_unit: null,
  },
]

describe('filterNutrientPreviewRows', () => {
  it('filters by code, name, group, and unit text', () => {
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'cho', group: '' }).map(row => row.code), ['CHO'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'verfuegbar', group: '' }).map(row => row.code), ['CHO'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'amino acids', group: '' }).map(row => row.code), ['AAE9'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'kj', group: '' }).map(row => row.code), ['ENERCJ'])
  })

  it('filters by exact German and English group pair', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: '', group: 'Aminosaeuren::Amino acids' }).map(row => row.code),
      ['AAE9'],
    )
  })

  it('combines text and group filters', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: 'g', group: 'Makronaehrstoffe::Proximate' }).map(row => row.code),
      ['CHO'],
    )
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: 'energy', group: 'Makronaehrstoffe::Proximate' }),
      [],
    )
  })
})
