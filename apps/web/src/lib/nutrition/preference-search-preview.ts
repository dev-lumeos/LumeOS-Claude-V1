import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { GENERAL_EXCLUSIONS, getNutritionPreferenceCatalog } from './preferences-catalog'

const execFileAsync = promisify(execFile)
const LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'
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

function escapeSql(value: string): string {
  return value.replace(/'/g, "''")
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
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(value: string): string {
  return normalize(value).replace(/\s+/g, '-')
}

function code(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

function splitCodes(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 20)
}

function sqlArray(values: string[]): string {
  return `ARRAY[${values.map(value => `'${escapeSql(value)}'`).join(',')}]::text[]`
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

  return { applied, unresolved, categorySlugs: [...new Set(categorySlugs)] }
}

function buildTextPredicate(query: string): string {
  const tokens = normalize(query).split(' ').filter(Boolean).slice(0, 6)
  if (tokens.length === 0) return 'TRUE'
  const blob = `replace(replace(replace(replace(lower(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')`
  return tokens.map(token => `(${blob} LIKE '%${escapeSql(token)}%' OR EXISTS (
    SELECT 1 FROM nutrition.food_aliases fa
    WHERE fa.food_id = f.id
      AND replace(replace(replace(replace(lower(fa.alias), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss') LIKE '%${escapeSql(token)}%'
  ))`).join(' AND ')
}

export function buildPreferencePreviewSql(params: {
  query: string
  exclusions: string[]
  likedCategories: string[]
  dislikedCategories: string[]
  likedTags: string[]
  dislikedTags: string[]
  limit: number
  offset: number
  sort: PreviewSort
}): string {
  const textPredicate = buildTextPredicate(params.query)
  const exclusion = resolveDeterministicExclusions(params.exclusions)
  const excludedSlugs = exclusion.categorySlugs
  const likedCategorySlugs = params.likedCategories.map(slug).filter(Boolean)
  const dislikedCategorySlugs = params.dislikedCategories.map(slug).filter(Boolean)
  const likedTags = params.likedTags.map(code).filter(Boolean)
  const dislikedTags = params.dislikedTags.map(code).filter(Boolean)
  const limit = Math.min(Math.max(Math.trunc(params.limit) || 25, 1), 100)
  const offset = Math.max(Math.trunc(params.offset) || 0, 0)
  const orderBy = params.sort === 'protein_desc'
    ? 'COALESCE(prot625, 0) DESC, preference_score DESC, source_label ASC'
    : params.sort === 'kcal_asc'
      ? 'COALESCE(enercc, 999999) ASC, preference_score DESC, source_label ASC'
      : params.sort === 'name_asc'
        ? 'source_label ASC'
        : 'text_rank DESC, preference_score DESC, sort_weight DESC NULLS LAST, source_label ASC'

  return `
WITH RECURSIVE excluded_categories AS (
  SELECT id, slug FROM nutrition.food_categories WHERE slug = ANY(${sqlArray(excludedSlugs)})
  UNION ALL
  SELECT child.id, child.slug
  FROM nutrition.food_categories child
  JOIN excluded_categories parent ON child.parent_id = parent.id
),
liked_categories AS (
  SELECT id, slug FROM nutrition.food_categories WHERE slug = ANY(${sqlArray(likedCategorySlugs)})
  UNION ALL
  SELECT child.id, child.slug FROM nutrition.food_categories child JOIN liked_categories parent ON child.parent_id = parent.id
),
disliked_categories AS (
  SELECT id, slug FROM nutrition.food_categories WHERE slug = ANY(${sqlArray(dislikedCategorySlugs)})
  UNION ALL
  SELECT child.id, child.slug FROM nutrition.food_categories child JOIN disliked_categories parent ON child.parent_id = parent.id
),
base AS (
  SELECT
    f.id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    f.sort_weight,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    CASE WHEN ${textPredicate} THEN 1 ELSE 0 END AS text_rank,
    CASE WHEN lc.id IS NOT NULL THEN 50 ELSE 0 END
      + CASE WHEN dc.id IS NOT NULL THEN -50 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(likedTags)} THEN 30 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(dislikedTags)} THEN -30 ELSE 0 END AS preference_score,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN lc.id IS NOT NULL THEN 'liked_category' END,
      CASE WHEN dc.id IS NOT NULL THEN 'disliked_category' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(likedTags)} THEN 'liked_tag' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(dislikedTags)} THEN 'disliked_tag' END
    ], NULL) AS preference_notes,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN lc.id IS NOT NULL THEN 'boosted because selected liked category includes this food category' END,
      CASE WHEN dc.id IS NOT NULL THEN 'suppressed because selected disliked category includes this food category' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(likedTags)} THEN 'boosted because food has a selected liked tag' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && ${sqlArray(dislikedTags)} THEN 'suppressed because food has a selected disliked tag' END
    ], NULL) AS preference_reasons
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN excluded_categories ec ON ec.id = f.category_id
  LEFT JOIN liked_categories lc ON lc.id = f.category_id
  LEFT JOIN disliked_categories dc ON dc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY ft.tag_code) AS tags
    FROM nutrition.food_tags ft WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE ${textPredicate}
    AND ec.id IS NULL
),
excluded_count AS (
  SELECT COUNT(*) AS count
  FROM nutrition.foods f
  JOIN excluded_categories ec ON ec.id = f.category_id
  WHERE ${textPredicate}
),
ranked AS (
  SELECT * FROM base ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}
)
SELECT json_build_object(
  'query', ${sqlLiteral(params.query)},
  'normalized_query', ${sqlLiteral(normalize(params.query))},
  'total', (SELECT COUNT(*) FROM base),
  'excluded_count', (SELECT count FROM excluded_count),
  'boosted_count', (SELECT COUNT(*) FROM base WHERE preference_score > 0),
  'suppressed_count', (SELECT COUNT(*) FROM base WHERE preference_score < 0),
  'foods', COALESCE((SELECT json_agg(json_build_object(
    'id', id,
    'bls_code', bls_code,
    'source_label', source_label,
    'category_slug', category_slug,
    'category_name_de', category_name_de,
    'enercc', enercc::text,
    'prot625', prot625::text,
    'fat', fat::text,
    'cho', cho::text,
    'tags', tags,
    'preference_score', preference_score,
    'preference_notes', preference_notes,
    'preference_reasons', preference_reasons
  )) FROM ranked), '[]'::json)
)::text AS payload;
`
}

function sqlLiteral(value: string): string {
  return `'${escapeSql(value)}'`
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

export async function getPreferenceSearchPreview(params: {
  query: string
  exclusions?: string
  likedCategories?: string
  dislikedCategories?: string
  likedTags?: string
  dislikedTags?: string
  limit?: number
  offset?: number
  sort?: string
}): Promise<PreferencePreviewPayload> {
  const exclusionCodes = splitCodes(params.exclusions)
  const exclusion = resolveDeterministicExclusions(exclusionCodes)
  const likedCategories = splitCodes(params.likedCategories)
  const dislikedCategories = splitCodes(params.dislikedCategories)
  const likedTags = splitCodes(params.likedTags)
  const dislikedTags = splitCodes(params.dislikedTags)
  const sort = ['relevance', 'protein_desc', 'kcal_asc', 'name_asc'].includes(params.sort ?? '')
    ? params.sort as PreviewSort
    : 'relevance'
  const sql = buildPreferencePreviewSql({
    query: params.query,
    exclusions: exclusionCodes,
    likedCategories,
    dislikedCategories,
    likedTags,
    dislikedTags,
    limit: params.limit ?? 25,
    offset: params.offset ?? 0,
    sort,
  })
  const { stdout } = await execFileAsync('docker', [
    'exec',
    LOCAL_DB_CONTAINER,
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-At',
    '-c',
    sql,
  ], { maxBuffer: 1024 * 1024 * 10 })
  const parsed = JSON.parse(stdout.trim()) as Record<string, unknown>
  const foods = Array.isArray(parsed.foods) ? parsed.foods.flatMap(item => parseFood(item) ?? []) : []
  const applied = [
    ...exclusion.applied,
    ...likedCategories.map(code => ({ code, effect: 'like', target: `category:${code}` })),
    ...dislikedCategories.map(code => ({ code, effect: 'soft_dislike', target: `category:${code}` })),
    ...likedTags.map(code => ({ code, effect: 'like', target: `tag:${code}` })),
    ...dislikedTags.map(code => ({ code, effect: 'soft_dislike', target: `tag:${code}` })),
  ]
  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: LOCAL_DB_CONTAINER,
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
