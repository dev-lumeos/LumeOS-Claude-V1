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
  },
  {
    code: 'CHO',
    name_de: 'Kohlenhydrate, verfügbar',
    name_en: 'Carbohydrate, available',
    name_th: '',
    unit: 'g',
    group_de: 'Makronährstoffe',
    group_en: 'Proximate',
    group_th: '',
  },
  {
    code: 'AAE9',
    name_de: 'Aminosäuren, unentbehrlich, gesamt',
    name_en: 'Amino acids, essential, total',
    name_th: '',
    unit: 'g',
    group_de: 'Aminosäuren',
    group_en: 'Amino acids',
    group_th: '',
  },
]

describe('filterNutrientPreviewRows', () => {
  it('filters by code, name, group, and unit text', () => {
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'cho', group: '' }).map(row => row.code), ['CHO'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'verfügbar', group: '' }).map(row => row.code), ['CHO'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'amino acids', group: '' }).map(row => row.code), ['AAE9'])
    assert.deepEqual(filterNutrientPreviewRows(rows, { query: 'kj', group: '' }).map(row => row.code), ['ENERCJ'])
  })

  it('filters by exact German and English group pair', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: '', group: 'Aminosäuren::Amino acids' }).map(row => row.code),
      ['AAE9'],
    )
  })

  it('combines text and group filters', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: 'g', group: 'Makronährstoffe::Proximate' }).map(row => row.code),
      ['CHO'],
    )
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: 'energy', group: 'Makronährstoffe::Proximate' }),
      [],
    )
  })
})
