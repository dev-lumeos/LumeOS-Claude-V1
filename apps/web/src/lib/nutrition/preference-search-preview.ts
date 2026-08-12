// Präferenz-gewichtete Such-Preview über supabase-js rpc() — die Abfrage
// liegt als Postgres-Funktion nutrition.preference_search_preview in
// supabase/_pipeline/07_lesefunktionen/070_lesefunktionen.sql.
// Hier verbleiben: Katalog-Auflösung (deterministische Exclusions),
// Normalisierung der Codes/Slugs/Tokens und der Payload-Zusammenbau.

import { GENERAL_EXCLUSIONS, getNutritionPreferenceCatalog } from '@lumeos/shared/nutrition/preferences-catalog'
import { NUTRITION_DB_SOURCE, isDbUnavailableMessage, nutritionRpc } from '@lumeos/shared/nutrition/db'
import { summarizeFoodPreferenceItems, type StoredFoodPreferenceItem } from './preferences-model'

const LABEL_POLICY = 'preference_preview_local_only_not_production_smart_search'

type PreviewSort = 'relevance' | 'protein_desc' | 'kcal_asc' | 'name_asc'

export type PreferencePreviewFood = {
  id: string
  bls_code: string
  source_label: string
  category_slug: string
  category_name_de: string
  enercc: string
  prot625: string
  fat: string
  cho: string
  tags: string[]
  preference_score: number
  preference_notes: string[]
  preference_reasons: string[]
}

export type PreferencePreviewPayload = {
  checkedAt: string
  environment: 'local'
  container: string
  preview_policy: typeof LABEL_POLICY
  query: string
  exclusions: string[]
  liked_categories: string[]
  disliked_categories: string[]
  liked_tags: string[]
  disliked_tags: string[]
  unresolved_preferences: Array<{ code: string; reason: string }>
  applied_preferences: Array<{ code: string; effect: string; target: string }>
  excluded_count: number
  boosted_count: number
  suppressed_count: number
  total: number
  result_count: number
  foods: PreferencePreviewFood[]
}

export type PreferencePreviewRpcArgs = {
  p_query: string
  p_normalized_query: string
  p_tokens: string[]
  p_excluded_category_slugs: string[]
  p_liked_category_slugs: string[]
  p_disliked_category_slugs: string[]
  p_liked_tags: string[]
  p_disliked_tags: string[]
  p_sort: PreviewSort
  p_limit: number
  p_offset: number
  p_liked_food_ids: string[]
  p_disliked_food_ids: string[]
  p_excluded_food_ids: string[]
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFC')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(value: string): string {
  return normalize(value).replace(/\s+/g, '-')
}

function code(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

export function resolveDeterministicExclusions(codes: string[]) {
  const catalog = getNutritionPreferenceCatalog()
  const byCode = new Map(catalog.general_exclusions.map(item => [item.code, item]))
  const applied: Array<{ code: string; effect: string; target: string }> = []
  const unresolved: Array<{ code: string; reason: string }> = []
  const categorySlugs: string[] = []

  for (const code of codes) {
    const preset = byCode.get(code)
    if (!preset) {
      unresolved.push({ code, reason: 'Unknown exclusion preset.' })
      continue
    }
    if (preset.mapping_status !== 'mapped' || preset.mapped_target_type !== 'category' || !preset.mapped_codes?.length) {
      unresolved.push({ code, reason: preset.mapping_note ?? 'No deterministic category/tag mapping exists yet.' })
      continue
    }
    categorySlugs.push(...preset.mapped_codes)
    applied.push({ code, effect: 'hard_exclude', target: `category:${preset.mapped_codes.join('|')}` })
  }

  return { applied, unresolved, categorySlugs: Array.from(new Set(categorySlugs)) }
}

/** Baut die rpc()-Argumente für nutrition.preference_search_preview — testbar ohne Datenbank. */
export function buildPreferencePreviewRpcArgs(params: {
  query: string
  exclusions: string[]
  likedCategories: string[]
  dislikedCategories: string[]
  likedTags: string[]
  dislikedTags: string[]
  likedFoodIds?: string[]
  dislikedFoodIds?: string[]
  excludedFoodIds?: string[]
  limit: number
  offset: number
  sort: PreviewSort
}): PreferencePreviewRpcArgs {
  const exclusion = resolveDeterministicExclusions(params.exclusions)
  return {
    p_query: params.query,
    p_normalized_query: normalize(params.query),
    p_tokens: normalize(params.query).split(' ').filter(Boolean).slice(0, 6),
    p_excluded_category_slugs: exclusion.categorySlugs,
    p_liked_category_slugs: params.likedCategories.map(slug).filter(Boolean),
    p_disliked_category_slugs: params.dislikedCategories.map(slug).filter(Boolean),
    p_liked_tags: params.likedTags.map(code).filter(Boolean),
    p_disliked_tags: params.dislikedTags.map(code).filter(Boolean),
    p_sort: params.sort,
    p_limit: Math.min(Math.max(Math.trunc(params.limit) || 25, 1), 100),
    p_offset: Math.max(Math.trunc(params.offset) || 0, 0),
    p_liked_food_ids: params.likedFoodIds ?? [],
    p_disliked_food_ids: params.dislikedFoodIds ?? [],
    p_excluded_food_ids: params.excludedFoodIds ?? [],
  }
}

function parseFood(value: unknown): PreferencePreviewFood | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.bls_code !== 'string') return null
  return {
    id: record.id,
    bls_code: record.bls_code,
    source_label: typeof record.source_label === 'string' ? record.source_label : '',
    category_slug: typeof record.category_slug === 'string' ? record.category_slug : '',
    category_name_de: typeof record.category_name_de === 'string' ? record.category_name_de : '',
    enercc: typeof record.enercc === 'string' ? record.enercc : '',
    prot625: typeof record.prot625 === 'string' ? record.prot625 : '',
    fat: typeof record.fat === 'string' ? record.fat : '',
    cho: typeof record.cho === 'string' ? record.cho : '',
    tags: Array.isArray(record.tags) ? record.tags.filter((item): item is string => typeof item === 'string') : [],
    preference_score: typeof record.preference_score === 'number' ? record.preference_score : 0,
    preference_notes: Array.isArray(record.preference_notes)
      ? record.preference_notes.filter((item): item is string => typeof item === 'string')
      : [],
    preference_reasons: Array.isArray(record.preference_reasons)
      ? record.preference_reasons.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

/**
 * Gespeicherte Preferences der angemeldeten Nutzerin laden (RLS begrenzt
 * beide Selects auf eigene Zeilen). Ersetzt seit C-02 die frühere Quelle
 * (URL-Parameter): die Preview spiegelt jetzt den Datenbankzustand.
 */
async function loadStoredPreferenceInputs() {
  const nutrition = nutritionRpc()
  const [prefsResult, itemsResult] = await Promise.all([
    nutrition.from('food_preferences').select('general_exclusions'),
    nutrition
      .from('food_preference_items')
      .select('id, food_id, preference, target_type, tag_code, category_id, exclusion_preset_code'),
  ])
  for (const result of [prefsResult, itemsResult]) {
    if (result.error) {
      throw new Error(
        isDbUnavailableMessage(result.error.message)
          ? `Nutrition database unavailable: ${result.error.message}`
          : `Preference read failed: ${result.error.message}`,
      )
    }
  }

  const rows = Array.isArray(itemsResult.data) ? itemsResult.data : []
  const foodItems: StoredFoodPreferenceItem[] = []
  const likedTags: string[] = []
  const dislikedTags: string[] = []
  const likedCategoryIds: string[] = []
  const dislikedCategoryIds: string[] = []
  const itemExclusionCodes: string[] = []
  for (const row of rows) {
    const record = row as Record<string, unknown>
    const preference = record.preference
    if (preference !== 'liked' && preference !== 'disliked' && preference !== 'hard_exclude') continue
    if (record.target_type === 'food' && typeof record.food_id === 'string' && typeof record.id === 'string') {
      foodItems.push({ id: record.id, food_id: record.food_id, preference })
    } else if (record.target_type === 'tag' && typeof record.tag_code === 'string') {
      if (preference === 'liked') likedTags.push(record.tag_code)
      else dislikedTags.push(record.tag_code)
    } else if (record.target_type === 'category' && typeof record.category_id === 'string') {
      if (preference === 'liked') likedCategoryIds.push(record.category_id)
      else dislikedCategoryIds.push(record.category_id)
    } else if (record.target_type === 'exclusion_preset' && typeof record.exclusion_preset_code === 'string') {
      itemExclusionCodes.push(record.exclusion_preset_code)
    }
  }

  const generalExclusions = Array.isArray(prefsResult.data?.[0]?.general_exclusions)
    ? (prefsResult.data[0].general_exclusions as unknown[]).filter(
        (value): value is string => typeof value === 'string',
      )
    : []

  const categoryIds = [...likedCategoryIds, ...dislikedCategoryIds]
  const slugById = new Map<string, string>()
  if (categoryIds.length > 0) {
    const { data, error } = await nutrition.from('food_categories').select('id, slug').in('id', categoryIds)
    if (error) {
      throw new Error(`Preference read failed: ${error.message}`)
    }
    for (const row of data ?? []) {
      if (typeof row.id === 'string' && typeof row.slug === 'string') slugById.set(row.id, row.slug)
    }
  }

  const foods = summarizeFoodPreferenceItems(foodItems)
  return {
    exclusionCodes: Array.from(new Set([...generalExclusions, ...itemExclusionCodes])).slice(0, 20),
    likedCategorySlugs: likedCategoryIds.flatMap(id => slugById.get(id) ?? []),
    dislikedCategorySlugs: dislikedCategoryIds.flatMap(id => slugById.get(id) ?? []),
    likedTags,
    dislikedTags,
    ...foods,
  }
}

export async function getPreferenceSearchPreview(params: {
  query: string
  limit?: number
  offset?: number
  sort?: string
}): Promise<PreferencePreviewPayload> {
  const stored = await loadStoredPreferenceInputs()
  const exclusionCodes = stored.exclusionCodes
  const exclusion = resolveDeterministicExclusions(exclusionCodes)
  const likedCategories = stored.likedCategorySlugs
  const dislikedCategories = stored.dislikedCategorySlugs
  const likedTags = stored.likedTags
  const dislikedTags = stored.dislikedTags
  const sort = ['relevance', 'protein_desc', 'kcal_asc', 'name_asc'].includes(params.sort ?? '')
    ? params.sort as PreviewSort
    : 'relevance'
  const args = buildPreferencePreviewRpcArgs({
    query: params.query,
    exclusions: exclusionCodes,
    likedCategories,
    dislikedCategories,
    likedTags,
    dislikedTags,
    likedFoodIds: stored.likedFoodIds,
    dislikedFoodIds: stored.dislikedFoodIds,
    excludedFoodIds: stored.excludedFoodIds,
    limit: params.limit ?? 25,
    offset: params.offset ?? 0,
    sort,
  })

  const { data, error } = await nutritionRpc().rpc('preference_search_preview', args)
  if (error) {
    throw new Error(
      isDbUnavailableMessage(error.message)
        ? `Nutrition database unavailable: ${error.message}`
        : `Preference preview query failed: ${error.message}`,
    )
  }

  const parsed = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const foods = Array.isArray(parsed.foods) ? parsed.foods.flatMap(item => parseFood(item) ?? []) : []
  const applied = [
    ...exclusion.applied,
    ...stored.likedFoodIds.map(id => ({ code: id, effect: 'like', target: `food:${id}` })),
    ...stored.dislikedFoodIds.map(id => ({ code: id, effect: 'soft_dislike', target: `food:${id}` })),
    ...stored.excludedFoodIds.map(id => ({ code: id, effect: 'hard_exclude', target: `food:${id}` })),
    ...likedCategories.map(code => ({ code, effect: 'like', target: `category:${code}` })),
    ...dislikedCategories.map(code => ({ code, effect: 'soft_dislike', target: `category:${code}` })),
    ...likedTags.map(code => ({ code, effect: 'like', target: `tag:${code}` })),
    ...dislikedTags.map(code => ({ code, effect: 'soft_dislike', target: `tag:${code}` })),
  ]
  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: NUTRITION_DB_SOURCE,
    preview_policy: LABEL_POLICY,
    query: params.query,
    exclusions: exclusionCodes,
    liked_categories: likedCategories,
    disliked_categories: dislikedCategories,
    liked_tags: likedTags,
    disliked_tags: dislikedTags,
    unresolved_preferences: exclusion.unresolved,
    applied_preferences: applied,
    excluded_count: typeof parsed.excluded_count === 'number' ? parsed.excluded_count : 0,
    boosted_count: typeof parsed.boosted_count === 'number' ? parsed.boosted_count : 0,
    suppressed_count: typeof parsed.suppressed_count === 'number' ? parsed.suppressed_count : 0,
    total: typeof parsed.total === 'number' ? parsed.total : 0,
    result_count: foods.length,
    foods,
  }
}

export function deterministicExclusionOptions() {
  return GENERAL_EXCLUSIONS.map(item => ({
    code: item.code,
    label_de: item.label_de,
    mapping_status: item.mapping_status ?? 'unresolved',
    mapped_codes: item.mapped_codes ?? [],
    mapping_note: item.mapping_note ?? '',
  }))
}
