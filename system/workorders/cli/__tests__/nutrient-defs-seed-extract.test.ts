import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'

import {
  NUTRIENT_DEFS_SEED_COLUMNS,
  buildSeedCandidateMarkdown,
  extractNutrientDefsSeedCandidate,
  validateNutrientDefsSeedCandidate,
} from '../nutrient-defs-seed-extract'

const SPEC_PATH = 'docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md'

describe('nutrient_defs seed extraction', () => {
  it('extracts the complete SPEC_06 nutrient_defs seed set without invented rows', () => {
    const source = fs.readFileSync(SPEC_PATH, 'utf8')
    const candidate = extractNutrientDefsSeedCandidate(source, SPEC_PATH)

    assert.equal(candidate.rows.length, 138)
    assert.deepEqual(candidate.columns, NUTRIENT_DEFS_SEED_COLUMNS)
    assert.equal(new Set(candidate.rows.map(row => row.code)).size, 138)

    const enercj = candidate.rows.find(row => row.code === 'ENERCJ')
    assert.ok(enercj)
    assert.equal(enercj.name_de, 'Energie (Kilojoule)')
    assert.equal(enercj.name_en, 'Energy (kilojoule)')
    assert.equal(enercj.name_th, '')
    assert.equal(enercj.unit, 'kJ')
    assert.equal(enercj.group_de, 'Energie')
    assert.equal(enercj.group_en, 'Energy')
    assert.equal(enercj.group_th, '')
    assert.equal(enercj.sort_index, 1)
    assert.equal(enercj.display_tier, 1)
    assert.equal(enercj.is_always_computed, true)
    assert.equal(enercj.is_partly_computed, false)
    assert.equal(enercj.formula, 'PROT625*17 + (CHO-POLYL)*17 + FAT*37 + ALC*29 + OA*13 + POLYL*10 + OLSAC*8 + FIBT*8')
    assert.equal(enercj.source_ref, `${SPEC_PATH}:67-256`)

    const prot = candidate.rows.find(row => row.code === 'PROT625')
    assert.ok(prot)
    assert.equal(prot.formula, 'PROT625=NT*6.25')
    assert.equal(prot.rda_male, '56')
    assert.equal(prot.rda_female, '46')
    assert.equal(prot.rda_unit, 'g')

    const water = candidate.rows.find(row => row.code === 'WATER')
    assert.ok(water)
    assert.equal(water.formula, null)
    assert.equal(water.rda_male, '')
    assert.equal(water.rda_female, '')
    assert.equal(water.rda_unit, '')

    const nt = candidate.rows.at(-1)
    assert.ok(nt)
    assert.equal(nt.code, 'NT')
  })

  it('validates the generated markdown as a 16-column review-only candidate', () => {
    const source = fs.readFileSync(SPEC_PATH, 'utf8')
    const candidate = extractNutrientDefsSeedCandidate(source, SPEC_PATH)
    const markdown = buildSeedCandidateMarkdown(candidate)
    const validation = validateNutrientDefsSeedCandidate(markdown, candidate)

    assert.equal(validation.valid, true)
    assert.deepEqual(validation.errors, [])
    assert.match(markdown, /Status: REVIEW_ONLY_SEED_CANDIDATE/)
    assert.match(markdown, /Expected row count: 138/)
    assert.match(markdown, /name_th/)
    assert.match(markdown, /group_th/)
    assert.match(markdown, /No seed execution is authorized/)
  })
})
