import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildFoodSearchFilterHref,
  buildFoodSearchRpcArgs,
  buildFoodSearchTokens,
  clampFoodSearchLimit,
  normalizeFoodSearchSort,
  normalizeFoodSearchText,
  parseFoodSearchPayload,
  type NutritionFoodSearchPayload,
} from '../food-search'

describe('local Nutrition food search helpers', () => {
  it('normalizes German umlauts for practical BLS source-label search', () => {
    assert.equal(normalizeFoodSearchText('Kürbiskern Öl süß'), 'kuerbiskern oel suess')
    assert.equal(normalizeFoodSearchText('Apfelmus'), 'apfelmus')
  })

  it('tokenizes queries for the rpc food_search parameters without invented synonyms', () => {
    assert.deepEqual(buildFoodSearchTokens('kuerbis oel'), ['kuerbis', 'oel'])
    assert.deepEqual(buildFoodSearchTokens('Kürbis-Öl'), ['kuerbis', 'oel'])
    assert.deepEqual(buildFoodSearchTokens(''), [])
    assert.equal(buildFoodSearchTokens('a b c d e f g h').length, 6)
  })

  it('builds rpc arguments with normalized slug, tag and clamped paging', () => {
    const args = buildFoodSearchRpcArgs('Kürbis', 'food-1', {
      category: 'Brot & Gebäck',
      tag: 'High Fiber',
      sort: 'protein_desc',
      limit: 200,
      offset: -5,
    })

    assert.equal(args.p_query, 'Kürbis')
    assert.equal(args.p_normalized_query, 'kuerbis')
    assert.deepEqual(args.p_tokens, ['kuerbis'])
    assert.equal(args.p_selected_food_id, 'food-1')
    assert.equal(args.p_category_slug, 'brot-gebaeck')
    assert.equal(args.p_tag_code, 'high_fiber')
    assert.equal(args.p_sort, 'protein_desc')
    assert.equal(args.p_limit, 100)
    assert.equal(args.p_offset, 0)
    assert.equal(args.p_category_id, null)
  })

  it('builds stable filter hrefs for category and tag chips', () => {
    assert.equal(
      buildFoodSearchFilterHref({ query: 'kuerbis', category: 'brot', tag: 'high_fiber', sort: 'protein_desc' }),
      '/nutrition?q=kuerbis&category=brot&tag=high_fiber&sort=protein_desc',
    )
    assert.equal(
      buildFoodSearchFilterHref({ query: 'kuerbis', category: 'brot', tag: 'high_fiber' }, { tag: null }),
      '/nutrition?q=kuerbis&category=brot',
    )
  })

  it('traegt Zubereitung und Warengruppe als wiederholte Parameter in die Adresse', () => {
    // Mehrfachauswahl: ?prep=roh&prep=gegrillt. Sortiert, damit dieselbe
    // Auswahl immer dieselbe Adresse ergibt — sonst waeren zwei
    // gleichwertige Links verschieden und der Cache doppelt belegt.
    assert.equal(
      buildFoodSearchFilterHref({ query: 'lachs', preparations: ['gegrillt', 'roh'] }),
      '/nutrition?q=lachs&prep=gegrillt&prep=roh',
    )
    assert.equal(
      buildFoodSearchFilterHref({ query: 'lachs', groups: ['T', 'V'], basicsOnly: true }),
      '/nutrition?q=lachs&group=T&group=V&basics=1',
    )
  })

  it('schaltet einen gesetzten Filter beim zweiten Klick wieder ab', () => {
    // Ein Klick auf eine aktive Zubereitung nimmt sie weg — sonst
    // braeuchte jede Ankreuzung zwei verschiedene Links.
    assert.equal(
      buildFoodSearchFilterHref({ preparations: ['roh', 'gegrillt'] }, { preparations: 'roh' }),
      '/nutrition?prep=gegrillt',
    )
    assert.equal(
      buildFoodSearchFilterHref({ preparations: ['roh'] }, { preparations: 'gegrillt' }),
      '/nutrition?prep=gegrillt&prep=roh',
    )
  })

  it('reicht die neuen Filter als Felder an die Datenbankfunktion', () => {
    const args = buildFoodSearchRpcArgs('', undefined, {
      preparations: [' roh ', '', 'gegrillt'],
      groups: ['t', 'v'],
      basicsOnly: true,
    })
    assert.deepEqual(args.p_preparations, ['roh', 'gegrillt'])
    // Warengruppen sind Grossbuchstaben im BLS-Code.
    assert.deepEqual(args.p_groups, ['T', 'V'])
    assert.equal(args.p_basics_only, true)
  })

  it('laesst die neuen Filter weg, wenn nichts gesetzt ist', () => {
    const args = buildFoodSearchRpcArgs('apfel')
    assert.deepEqual(args.p_preparations, [])
    assert.deepEqual(args.p_groups, [])
    assert.equal(args.p_basics_only, false)
    // Rueckfallschutz: die Adresse ohne Filter bleibt unveraendert.
    assert.equal(buildFoodSearchFilterHref({ query: 'apfel' }), '/nutrition?q=apfel')
  })

  it('normalizes pagination and sort inputs to the SPEC_07 local subset', () => {
    assert.equal(normalizeFoodSearchSort('protein_desc'), 'protein_desc')
    assert.equal(normalizeFoodSearchSort('kcal_asc'), 'kcal_asc')
    assert.equal(normalizeFoodSearchSort('unknown'), 'relevance')
    assert.equal(clampFoodSearchLimit(200), 100)
    assert.equal(clampFoodSearchLimit(-1), 1)
  })

  it('parses food search payload with technical BLS label and Human Layer metadata', () => {
    const payload: NutritionFoodSearchPayload = parseFoodSearchPayload(JSON.stringify({
      query: 'brot',
      normalized_query: 'brot',
      category: 'brot',
      tag: 'high_fiber',
      sort: 'protein_desc',
      limit: 20,
      offset: 40,
      total: 99,
      result_count: 1,
      foods: [{
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
        category_slug: 'brot',
        category_name_de: 'Brot',
        sort_weight: 720,
        enercc: '250.00000',
        prot625: '9.10000',
        fat: '4.20000',
        cho: '38.00000',
        tags: ['high_fiber'],
      }],
      selected_food: {
        id: 'food-1',
        bls_code: 'B106700',
        source_label: 'Vollkornbrot mit Kürbiskernen',
        name_de: 'Vollkornbrot mit Kürbiskernen',
        name_en: 'Wholemeal bread with pumpkin seeds',
        name_th: '',
        category_slug: 'brot',
        category_name_de: 'Brot',
        sort_weight: 720,
        enercc: '250.00000',
        prot625: '9.10000',
        fat: '4.20000',
        cho: '38.00000',
        tags: ['high_fiber'],
      },
      nutrients: [{
        nutrient_code: 'ENERCJ',
        name_de: 'Energie',
        name_en: 'Energy',
        unit: 'kJ',
        value: '1089.00000',
      }],
      categories: [{
        slug: 'brot',
        name_de: 'Brot',
        level: 2,
        count: 12,
      }],
      tags: [{
        code: 'high_fiber',
        name_de: 'Ballaststoffreich',
        count: 3,
      }],
    }))

    assert.equal(payload.foods[0]?.source_label, 'Vollkornbrot mit Kürbiskernen')
    assert.equal(payload.label_policy, 'bls_source_label_not_final_display_name')
    assert.equal(payload.sort, 'protein_desc')
    assert.equal(payload.limit, 20)
    assert.equal(payload.offset, 40)
    assert.equal(payload.total, 99)
    assert.equal(payload.foods[0]?.tags[0], 'high_fiber')
    assert.equal(payload.foods[0]?.prot625, '9.10000')
    assert.equal(payload.nutrients[0]?.nutrient_code, 'ENERCJ')
    assert.equal(payload.nutrients[0]?.value, '1089.00000')
    assert.equal(payload.selected_food?.category_slug, 'brot')
    assert.equal(payload.categories[0]?.slug, 'brot')
    assert.equal(payload.tags[0]?.code, 'high_fiber')
  })

  it('parses the rpc payload also when it arrives as an object (supabase-js path)', () => {
    const payload = parseFoodSearchPayload({
      query: 'brot',
      normalized_query: 'brot',
      category: '',
      category_id: '',
      tag: '',
      sort: 'relevance',
      limit: 25,
      offset: 0,
      total: 2,
      result_count: 0,
      foods: [],
      selected_food: null,
      nutrients: [],
      categories: [],
      tags: [],
    })

    assert.equal(payload.total, 2)
    assert.equal(payload.result_count, 0)
    assert.equal(payload.selected_food, null)
  })
})
