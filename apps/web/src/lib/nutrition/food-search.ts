import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'
const LABEL_POLICY = 'bls_source_label_not_final_display_name'
const DEFAULT_LIMIT = 25

export type NutritionFoodSearchRow = {
  id: string
  bls_code: string
  source_label: string
  name_de: string
  name_en: string
  name_th: string
  category_slug: string
  category_name_de: string
}

export type NutritionFoodNutrientRow = {
  nutrient_code: string
  name_de: string
  name_en: string
  unit: string
  value: string
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
  tag: string
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
    name_de: nameDe,
    name_en: normalizeText(record.name_en),
    name_th: normalizeText(record.name_th),
    category_slug: normalizeText(record.category_slug),
    category_name_de: normalizeText(record.category_name_de),
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
    tag: normalizeText(record.tag),
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
  limit = DEFAULT_LIMIT,
  category = '',
  tag = '',
): string {
  const normalizedQuery = normalizeFoodSearchText(query)
  const where = buildFoodSearchWhereClause(query)
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50)
  const selectedId = selectedFoodId ? `'${escapeSqlLiteral(selectedFoodId)}'::uuid` : 'NULL::uuid'
  const categorySlug = normalizeSlug(category)
  const tagCode = normalizeFoodSearchText(tag).replace(/\s+/g, '_')
  const categoryPredicate = categorySlug
    ? `AND EXISTS (
      SELECT 1
      FROM nutrition.food_categories selected_category
      JOIN nutrition.food_categories assigned_category ON assigned_category.id = f.category_id
      WHERE selected_category.slug = '${escapeSqlLiteral(categorySlug)}'
        AND (
          assigned_category.slug = selected_category.slug
          OR assigned_category.parent_id = selected_category.id
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

  return `
WITH matching_foods AS (
  SELECT
    f.id,
    f.bls_code,
    f.name_de,
    f.name_en,
    f.name_th,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  WHERE ${where.sql}
    ${categoryPredicate}
    ${tagPredicate}
  ORDER BY f.bls_code
  LIMIT ${safeLimit}
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
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
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
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_slug', category_slug,
        'category_name_de', category_name_de
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
        'value', fn.value::text
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
  'tag', '${escapeSqlLiteral(tagCode)}',
  'result_count', (SELECT COUNT(*)::int FROM matching_foods),
  'foods', COALESCE((
    SELECT json_agg(
      json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_slug', category_slug,
        'category_name_de', category_name_de
      )
      ORDER BY bls_code
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
  options: { category?: string; tag?: string; limit?: number } = {},
): Promise<NutritionFoodSearchPayload> {
  const sql = buildLocalFoodSearchSql(query, selectedFoodId, options.limit ?? DEFAULT_LIMIT, options.category ?? '', options.tag ?? '')

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
