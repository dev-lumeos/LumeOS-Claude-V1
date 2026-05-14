import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { NutritionNutrientPreviewRow } from '../local-schema-debug'
import { filterNutrientPreviewRows, hasNutrientRdaValue } from '../nutrient-preview-filter'

function buildRow(
  code: string,
  rda_male: string | null,
  rda_female: string | null,
  group_de = 'Vitamine',
  group_en = 'Vitamins',
): NutritionNutrientPreviewRow {
  return {
    code,
    name_de: code,
    name_en: code,
    name_th: '',
    unit: 'mg',
    group_de,
    group_en,
    group_th: '',
    sort_index: 1,
    display_tier: 1,
    is_always_computed: false,
    is_partly_computed: false,
    formula: null,
    rda_male,
    rda_female,
    rda_unit: rda_male || rda_female ? 'mg' : null,
  }
}

const rows = [
  buildRow('M_AND_F', '10', '8'),
  buildRow('MALE_ONLY', '12', null, 'Mineralstoffe', 'Minerals'),
  buildRow('FEMALE_ONLY', null, '9'),
  buildRow('EMPTY_STRINGS', '', '   '),
  buildRow('NO_RDA', null, null),
]

describe('RDA availability filter', () => {
  it('treats a row as RDA-available when male or female RDA has a non-empty value', () => {
    assert.equal(hasNutrientRdaValue(buildRow('MALE', '1', null)), true)
    assert.equal(hasNutrientRdaValue(buildRow('FEMALE', null, '1')), true)
    assert.equal(hasNutrientRdaValue(buildRow('EMPTY', '', '   ')), false)
    assert.equal(hasNutrientRdaValue(buildRow('NULLS', null, null)), false)
  })

  it('returns all nutrients when the availability mode is all', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: '', group: '', rdaAvailability: 'all' }).map(row => row.code),
      ['M_AND_F', 'MALE_ONLY', 'FEMALE_ONLY', 'EMPTY_STRINGS', 'NO_RDA'],
    )
  })

  it('filters nutrients with any male or female RDA value', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: '', group: '', rdaAvailability: 'with-rda' }).map(row => row.code),
      ['M_AND_F', 'MALE_ONLY', 'FEMALE_ONLY'],
    )
  })

  it('filters nutrients without male or female RDA values', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, { query: '', group: '', rdaAvailability: 'without-rda' }).map(row => row.code),
      ['EMPTY_STRINGS', 'NO_RDA'],
    )
  })

  it('combines RDA availability with search and group filters', () => {
    assert.deepEqual(
      filterNutrientPreviewRows(rows, {
        query: 'male',
        group: 'Mineralstoffe::Minerals',
        rdaAvailability: 'with-rda',
      }).map(row => row.code),
      ['MALE_ONLY'],
    )
    assert.deepEqual(
      filterNutrientPreviewRows(rows, {
        query: 'male',
        group: 'Mineralstoffe::Minerals',
        rdaAvailability: 'without-rda',
      }),
      [],
    )
  })
})
