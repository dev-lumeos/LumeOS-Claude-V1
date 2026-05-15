import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'
const LABEL_POLICY = 'bls_source_label_not_final_display_name'
const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100
const FOOD_SEARCH_SORTS = ['relevance', 'protein_desc', 'kcal_asc', 'name_asc'] as const

export type FoodSearchSort = typeof FOOD_SEARCH_SORTS[number]

export type NutritionFoodSearchRow = {
  id: string
  bls_code: string
  source_label: string
  source_label_marker: typeof LABEL_POLICY
  name_display: string
  name_display_en: string
  name_display_th: string
  name_de: string
  name_en: string
  name_th: string
  category_id: string
  category_slug: string
  category_name_de: string
  sort_weight: number
  enercc: string
  prot625: string
  fat: string
  cho: string
  tags: string[]
}

export type NutritionFoodNutrientRow = {
  nutrient_code: string
  name_de: string
  name_en: string
  unit: string
  value: string
  data_source: string
}

export type NutritionFoodCategoryFacet = {
  slug: string
  name_de: string
  level: number
  count: number
}

export type NutritionFoodTagFacet = {
  code: string
  name_de: string
  count: number
}

export type NutritionFoodSearchPayload = {
  checkedAt: string
  environment: 'local'
  container: string
  query: string
  normalized_query: string
  category: string
  category_id: string
  tag: string
  sort: FoodSearchSort
  limit: number
  offset: number
  total: number
  label_policy: typeof LABEL_POLICY
  result_count: number
  foods: NutritionFoodSearchRow[]
  selected_food: NutritionFoodSearchRow | null
  nutrients: NutritionFoodNutrientRow[]
  categories: NutritionFoodCategoryFacet[]
  tags: NutritionFoodTagFacet[]
}

export type FoodSearchFilterState = {
  query?: string
  category?: string
  tag?: string
  food?: string
  sort?: FoodSearchSort | string
  offset?: number
}

export type NutritionFoodCategoryTreeNode = {
  id: string
  slug: string
  name_de: string
  name_en: string
  name_th: string
  level: number
  sort_order: number
  count: number
  children: NutritionFoodCategoryTreeNode[]
}

export class LocalFoodSearchError extends Error {
  readonly code: 'LOCAL_DB_UNAVAILABLE' | 'LOCAL_FOOD_QUERY_FAILED' | 'INVALID_FOOD_SEARCH_PAYLOAD'

  constructor(code: LocalFoodSearchError['code'], message: string) {
    super(message)
    this.name = 'LocalFoodSearchError'
    this.code = code
  }
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''")
}

export function normalizeFoodSearchText(value: string): string {
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

function normalizeSlug(value: string): string {
  return normalizeFoodSearchText(value).replace(/\s+/g, '-')
}

export function normalizeFoodSearchSort(value: string | null | undefined): FoodSearchSort {
  return FOOD_SEARCH_SORTS.includes(value as FoodSearchSort) ? value as FoodSearchSort : 'relevance'
}

export function clampFoodSearchLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT)
}

export function clampFoodSearchOffset(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(Math.trunc(value), 0)
}

export function buildFoodSearchFilterHref(
  current: FoodSearchFilterState,
  next: Partial<Record<keyof FoodSearchFilterState, string | null>> = {},
): string {
  const params = new URLSearchParams()
  const merged: FoodSearchFilterState = { ...current }

  for (const [key, value] of Object.entries(next) as Array<[keyof FoodSearchFilterState, string | null]>) {
    if (value === null) {
      delete merged[key]
    } else if (value !== undefined) {
      merged[key] = value
    }
  }

  if (merged.query?.trim()) params.set('q', merged.query.trim())
  if (merged.category?.trim()) params.set('category', merged.category.trim())
  if (merged.tag?.trim()) params.set('tag', merged.tag.trim())
  if (merged.food?.trim()) params.set('food', merged.food.trim())
  if (merged.sort?.trim() && normalizeFoodSearchSort(merged.sort) !== 'relevance') params.set('sort', normalizeFoodSearchSort(merged.sort))
  if (typeof merged.offset === 'number' && merged.offset > 0) params.set('offset', String(clampFoodSearchOffset(merged.offset)))
  const query = params.toString()
  return query ? `/nutrition?${query}` : '/nutrition'
}

export function buildFoodSearchWhereClause(query: string): { sql: string; tokens: string[] } {
  const tokens = normalizeFoodSearchText(query)
    .split(' ')
    .map(token => token.trim())
    .filter(Boolean)
    .slice(0, 6)

  if (tokens.length === 0) {
    return { sql: 'TRUE', tokens }
  }

  const foodSearchBlob = `
    replace(replace(replace(replace(
      lower(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)),
      'ä', 'ae'
    ), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')
  `
  return {
    sql: tokens.map(token => `(
      ${foodSearchBlob} LIKE '%${escapeSqlLiteral(token)}%'
      OR EXISTS (
        SELECT 1
        FROM nutrition.food_aliases fa
        WHERE fa.food_id = f.id
          AND replace(replace(replace(replace(lower(fa.alias), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss') LIKE '%${escapeSqlLiteral(token)}%'
      )
    )`).join(' AND '),
    tokens,
  }
}

function normalizeText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function normalizeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeFoodRow(value: unknown): NutritionFoodSearchRow | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const id = normalizeText(record.id)
  const blsCode = normalizeText(record.bls_code)
  if (!id || !blsCode) return null
  const nameDe = normalizeText(record.name_de)
  return {
    id,
    bls_code: blsCode,
    source_label: normalizeText(record.source_label) || nameDe,
    source_label_marker: LABEL_POLICY,
    name_display: normalizeText(record.name_display),
    name_display_en: normalizeText(record.name_display_en),
    name_display_th: normalizeText(record.name_display_th),
    name_de: nameDe,
    name_en: normalizeText(record.name_en),
    name_th: normalizeText(record.name_th),
    category_id: normalizeText(record.category_id),
    category_slug: normalizeText(record.category_slug),
    category_name_de: normalizeText(record.category_name_de),
    sort_weight: normalizeCount(record.sort_weight),
    enercc: normalizeText(record.enercc),
    prot625: normalizeText(record.prot625),
    fat: normalizeText(record.fat),
    cho: normalizeText(record.cho),
    tags: Array.isArray(record.tags) ? record.tags.map(normalizeText).filter(Boolean) : [],
  }
}

function normalizeNutrientRow(value: unknown): NutritionFoodNutrientRow | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const nutrientCode = normalizeText(record.nutrient_code)
  if (!nutrientCode) return null
  return {
    nutrient_code: nutrientCode,
    name_de: normalizeText(record.name_de),
    name_en: normalizeText(record.name_en),
    unit: normalizeText(record.unit),
    value: normalizeText(record.value),
    data_source: normalizeText(record.data_source) || 'BLS',
  }
}

function normalizeCategoryFacet(value: unknown): NutritionFoodCategoryFacet | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const slug = normalizeText(record.slug)
  if (!slug) return null
  return {
    slug,
    name_de: normalizeText(record.name_de),
    level: normalizeCount(record.level),
    count: normalizeCount(record.count),
  }
}

function normalizeTagFacet(value: unknown): NutritionFoodTagFacet | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const code = normalizeText(record.code)
  if (!code) return null
  return {
    code,
    name_de: normalizeText(record.name_de),
    count: normalizeCount(record.count),
  }
}

export function parseFoodSearchPayload(stdout: string): NutritionFoodSearchPayload {
  const raw = stdout.trim()
  if (!raw) {
    throw new LocalFoodSearchError('INVALID_FOOD_SEARCH_PAYLOAD', 'Local food search command returned no output.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new LocalFoodSearchError(
      'INVALID_FOOD_SEARCH_PAYLOAD',
      `Local food search output was not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new LocalFoodSearchError('INVALID_FOOD_SEARCH_PAYLOAD', 'Local food search payload is not an object.')
  }

  const record = parsed as Record<string, unknown>
  const foods = Array.isArray(record.foods) ? record.foods.flatMap(item => normalizeFoodRow(item) ?? []) : []
  const nutrients = Array.isArray(record.nutrients)
    ? record.nutrients.flatMap(item => normalizeNutrientRow(item) ?? [])
    : []
  const categories = Array.isArray(record.categories)
    ? record.categories.flatMap(item => normalizeCategoryFacet(item) ?? [])
    : []
  const tags = Array.isArray(record.tags) ? record.tags.flatMap(item => normalizeTagFacet(item) ?? []) : []

  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: LOCAL_DB_CONTAINER,
    query: normalizeText(record.query),
    normalized_query: normalizeText(record.normalized_query),
    category: normalizeText(record.category),
    category_id: normalizeText(record.category_id),
    tag: normalizeText(record.tag),
    sort: normalizeFoodSearchSort(normalizeText(record.sort)),
    limit: normalizeCount(record.limit),
    offset: normalizeCount(record.offset),
    total: normalizeCount(record.total),
    label_policy: LABEL_POLICY,
    result_count: typeof record.result_count === 'number' && Number.isFinite(record.result_count)
      ? record.result_count
      : foods.length,
    foods,
    selected_food: normalizeFoodRow(record.selected_food),
    nutrients,
    categories,
    tags,
  }
}

export function buildLocalFoodSearchSql(
  query: string,
  selectedFoodId?: string,
  options: { limit?: number; offset?: number; category?: string; categoryId?: string; tag?: string; sort?: string } = {},
): string {
  const normalizedQuery = normalizeFoodSearchText(query)
  const where = buildFoodSearchWhereClause(query)
  const safeLimit = clampFoodSearchLimit(options.limit ?? DEFAULT_LIMIT)
  const safeOffset = clampFoodSearchOffset(options.offset ?? 0)
  const selectedId = selectedFoodId ? `'${escapeSqlLiteral(selectedFoodId)}'::uuid` : 'NULL::uuid'
  const categorySlug = normalizeSlug(options.category ?? '')
  const categoryId = options.categoryId?.trim() ?? ''
  const tagCode = normalizeFoodSearchText(options.tag ?? '').replace(/\s+/g, '_')
  const sort = normalizeFoodSearchSort(options.sort)
  const categorySelector = categoryId
    ? `selected_category.id = '${escapeSqlLiteral(categoryId)}'::uuid`
    : `selected_category.slug = '${escapeSqlLiteral(categorySlug)}'`
  const categoryPredicate = categorySlug || categoryId
    ? `AND EXISTS (
      SELECT 1
      FROM nutrition.food_categories selected_category
      JOIN nutrition.food_categories assigned_category ON assigned_category.id = f.category_id
      WHERE ${categorySelector}
        AND (
          assigned_category.slug = selected_category.slug
          OR assigned_category.parent_id = selected_category.id
          OR assigned_category.parent_id IN (
            SELECT child.id FROM nutrition.food_categories child WHERE child.parent_id = selected_category.id
          )
          OR assigned_category.parent_id IN (
            SELECT grandchild.id
            FROM nutrition.food_categories child
            JOIN nutrition.food_categories grandchild ON grandchild.parent_id = child.id
            WHERE child.parent_id = selected_category.id
          )
        )
    )`
    : ''
  const tagPredicate = tagCode
    ? `AND EXISTS (
      SELECT 1 FROM nutrition.food_tags selected_tag
      WHERE selected_tag.food_id = f.id
        AND selected_tag.tag_code = '${escapeSqlLiteral(tagCode)}'
    )`
    : ''

  const orderBy = sort === 'protein_desc'
    ? 'COALESCE(m.prot625, 0) DESC, f.sort_weight DESC NULLS LAST, source_label ASC, f.bls_code ASC'
    : sort === 'kcal_asc'
      ? 'COALESCE(m.enercc, 999999) ASC, source_label ASC, f.bls_code ASC'
      : sort === 'name_asc'
        ? 'source_label ASC, f.bls_code ASC'
        : 'text_rank DESC, f.sort_weight DESC NULLS LAST, source_label ASC, f.bls_code ASC'

  return `
WITH matching_foods AS (
  SELECT
    f.id,
    f.bls_code,
    f.name_de,
    f.name_en,
    f.name_th,
    f.name_display,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    CASE WHEN ${where.tokens.length === 0 ? 'FALSE' : 'TRUE'} THEN (
      CASE
        WHEN lower(COALESCE(f.name_de, '')) = lower('${escapeSqlLiteral(query)}') THEN 1.0
        WHEN lower(COALESCE(f.name_de, '')) LIKE lower('${escapeSqlLiteral(query)}') || '%' THEN 0.85
        WHEN ${where.sql} THEN 0.65
        ELSE 0
      END
    ) ELSE 0.5 END AS text_rank,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn
    WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY td.sort_order, ft.tag_code) AS tags
    FROM nutrition.food_tags ft
    JOIN nutrition.tag_definitions td ON td.code = ft.tag_code
    WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE ${where.sql}
    ${categoryPredicate}
    ${tagPredicate}
  ORDER BY ${orderBy}
  LIMIT ${safeLimit}
  OFFSET ${safeOffset}
),
all_matching_food_ids AS (
  SELECT f.id
  FROM nutrition.foods f
  WHERE ${where.sql}
    ${categoryPredicate}
    ${tagPredicate}
),
selected_food AS (
  SELECT
    f.id,
    f.bls_code,
    f.name_de,
    f.name_en,
    f.name_th,
    f.name_display,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn
    WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY td.sort_order, ft.tag_code) AS tags
    FROM nutrition.food_tags ft
    JOIN nutrition.tag_definitions td ON td.code = ft.tag_code
    WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE f.id = COALESCE(${selectedId}, (SELECT id FROM matching_foods LIMIT 1))
  LIMIT 1
),
selected_food_json AS (
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM selected_food) THEN (
      SELECT json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'source_label_marker', '${LABEL_POLICY}',
        'name_display', name_display,
        'name_display_en', name_display_en,
        'name_display_th', name_display_th,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_id', category_id,
        'category_slug', category_slug,
        'category_name_de', category_name_de,
        'sort_weight', sort_weight,
        'enercc', enercc::text,
        'prot625', prot625::text,
        'fat', fat::text,
        'cho', cho::text,
        'tags', tags
      )
      FROM selected_food
    )
    ELSE NULL::json
  END AS value
),
nutrients_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'nutrient_code', fn.nutrient_code,
        'name_de', nd.name_de,
        'name_en', nd.name_en,
        'unit', nd.unit,
        'value', fn.value::text,
        'data_source', COALESCE(fn.data_source, 'BLS')
      )
      ORDER BY
        CASE fn.nutrient_code
          WHEN 'ENERCJ' THEN 1
          WHEN 'ENERCC' THEN 2
          WHEN 'PROT625' THEN 3
          WHEN 'FAT' THEN 4
          WHEN 'CHO' THEN 5
          WHEN 'FIBT' THEN 6
          WHEN 'SUGAR' THEN 7
          WHEN 'NA' THEN 8
          ELSE 50
        END,
        nd.sort_index,
        fn.nutrient_code
    ),
    '[]'::json
  ) AS value
  FROM selected_food sf
  JOIN nutrition.food_nutrients fn ON fn.food_id = sf.id
  JOIN nutrition.nutrient_defs nd ON nd.code = fn.nutrient_code
),
categories_json AS (
  SELECT COALESCE(json_agg(json_build_object(
    'slug', slug,
    'name_de', name_de,
    'level', level,
    'count', food_count
  ) ORDER BY level, sort_order, name_de), '[]'::json) AS value
  FROM (
    SELECT fc.slug, fc.name_de, fc.level, fc.sort_order, COUNT(f.id)::int AS food_count
    FROM nutrition.food_categories fc
    JOIN nutrition.foods f ON f.category_id = fc.id
    WHERE fc.level IN (1,2)
    GROUP BY fc.slug, fc.name_de, fc.level, fc.sort_order
    ORDER BY fc.level, fc.sort_order
    LIMIT 40
  ) category_counts
),
tags_json AS (
  SELECT COALESCE(json_agg(json_build_object(
    'code', code,
    'name_de', name_de,
    'count', food_count
  ) ORDER BY sort_order, name_de), '[]'::json) AS value
  FROM (
    SELECT td.code, td.name_de, td.sort_order, COUNT(ft.food_id)::int AS food_count
    FROM nutrition.tag_definitions td
    JOIN nutrition.food_tags ft ON ft.tag_code = td.code
    GROUP BY td.code, td.name_de, td.sort_order
    ORDER BY td.sort_order
  ) tag_counts
)
SELECT json_build_object(
  'query', '${escapeSqlLiteral(query)}',
  'normalized_query', '${escapeSqlLiteral(normalizedQuery)}',
  'category', '${escapeSqlLiteral(categorySlug)}',
  'category_id', '${escapeSqlLiteral(categoryId)}',
  'tag', '${escapeSqlLiteral(tagCode)}',
  'sort', '${sort}',
  'limit', ${safeLimit},
  'offset', ${safeOffset},
  'total', (SELECT COUNT(*)::int FROM all_matching_food_ids),
  'result_count', (SELECT COUNT(*)::int FROM matching_foods),
  'foods', COALESCE((
    SELECT json_agg(
      json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'source_label_marker', '${LABEL_POLICY}',
        'name_display', name_display,
        'name_display_en', name_display_en,
        'name_display_th', name_display_th,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_id', category_id,
        'category_slug', category_slug,
        'category_name_de', category_name_de,
        'sort_weight', sort_weight,
        'enercc', enercc::text,
        'prot625', prot625::text,
        'fat', fat::text,
        'cho', cho::text,
        'tags', tags
      )
    )
    FROM matching_foods
  ), '[]'::json),
  'selected_food', (SELECT value FROM selected_food_json),
  'nutrients', (SELECT value FROM nutrients_json),
  'categories', (SELECT value FROM categories_json),
  'tags', (SELECT value FROM tags_json)
);
`
}

export async function getLocalFoodSearch(
  query: string,
  selectedFoodId?: string,
  options: { category?: string; categoryId?: string; tag?: string; limit?: number; offset?: number; sort?: string } = {},
): Promise<NutritionFoodSearchPayload> {
  const sql = buildLocalFoodSearchSql(query, selectedFoodId, options)

  try {
    const { stdout } = await execFileAsync(
      'docker',
      ['exec', LOCAL_DB_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', sql],
      { maxBuffer: 1024 * 1024 * 10 },
    )
    return parseFoodSearchPayload(stdout)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const code = /No such container|Cannot connect|not found/i.test(message)
      ? 'LOCAL_DB_UNAVAILABLE'
      : 'LOCAL_FOOD_QUERY_FAILED'
    throw new LocalFoodSearchError(code, message)
  }
}

function parseCategoryTreePayload(stdout: string): NutritionFoodCategoryTreeNode[] {
  const parsed = JSON.parse(stdout.trim() || '[]') as unknown
  if (!Array.isArray(parsed)) return []
  return parsed.map(item => normalizeCategoryTreeNode(item)).filter((item): item is NutritionFoodCategoryTreeNode => item !== null)
}

function normalizeCategoryTreeNode(value: unknown): NutritionFoodCategoryTreeNode | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const id = normalizeText(record.id)
  const slug = normalizeText(record.slug)
  if (!id || !slug) return null
  return {
    id,
    slug,
    name_de: normalizeText(record.name_de),
    name_en: normalizeText(record.name_en),
    name_th: normalizeText(record.name_th),
    level: normalizeCount(record.level),
    sort_order: normalizeCount(record.sort_order),
    count: normalizeCount(record.count),
    children: Array.isArray(record.children)
      ? record.children.map(item => normalizeCategoryTreeNode(item)).filter((item): item is NutritionFoodCategoryTreeNode => item !== null)
      : [],
  }
}

export function buildLocalFoodCategoriesSql(): string {
  return `
WITH category_counts AS (
  SELECT category_id, COUNT(*)::int AS food_count
  FROM nutrition.foods
  WHERE category_id IS NOT NULL
  GROUP BY category_id
),
nodes AS (
  SELECT
    fc.id,
    fc.slug,
    fc.name_de,
    fc.name_en,
    COALESCE(fc.name_th, '') AS name_th,
    fc.parent_id,
    fc.level,
    fc.sort_order,
    COALESCE(cc.food_count, 0) AS direct_count
  FROM nutrition.food_categories fc
  LEFT JOIN category_counts cc ON cc.category_id = fc.id
),
level4 AS (
  SELECT n.*, '[]'::json AS children, n.direct_count AS subtree_count
  FROM nodes n
  WHERE n.level = 4
),
level3 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level4 c ON c.parent_id = n.id
  WHERE n.level = 3
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
),
level2 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level3 c ON c.parent_id = n.id
  WHERE n.level = 2
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
),
level1 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level2 c ON c.parent_id = n.id
  WHERE n.level = 1
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
)
SELECT COALESCE(json_agg(json_build_object(
  'id', id,
  'slug', slug,
  'name_de', name_de,
  'name_en', name_en,
  'name_th', name_th,
  'level', level,
  'sort_order', sort_order,
  'count', subtree_count,
  'children', children
) ORDER BY sort_order, name_de), '[]'::json)
FROM level1;
`
}

export async function getLocalFoodCategories(): Promise<NutritionFoodCategoryTreeNode[]> {
  try {
    const { stdout } = await execFileAsync(
      'docker',
      ['exec', LOCAL_DB_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-c', buildLocalFoodCategoriesSql()],
      { maxBuffer: 1024 * 1024 * 10 },
    )
    return parseCategoryTreePayload(stdout)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const code = /No such container|Cannot connect|not found/i.test(message)
      ? 'LOCAL_DB_UNAVAILABLE'
      : 'LOCAL_FOOD_QUERY_FAILED'
    throw new LocalFoodSearchError(code, message)
  }
}
