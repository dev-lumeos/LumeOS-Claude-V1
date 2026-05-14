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
}

export type NutritionFoodNutrientRow = {
  nutrient_code: string
  name_de: string
  name_en: string
  unit: string
  value: string
}

export type NutritionFoodSearchPayload = {
  checkedAt: string
  environment: 'local'
  container: string
  query: string
  normalized_query: string
  label_policy: typeof LABEL_POLICY
  result_count: number
  foods: NutritionFoodSearchRow[]
  selected_food: NutritionFoodSearchRow | null
  nutrients: NutritionFoodNutrientRow[]
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
    .replace(/\s+/g, ' ')
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

  const searchBlob = `
    replace(replace(replace(replace(
      lower(concat_ws(' ', bls_code, name_de, name_en, name_th, name_display)),
      'ä', 'ae'
    ), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')
  `
  return {
    sql: tokens.map(token => `${searchBlob} LIKE '%${escapeSqlLiteral(token)}%'`).join(' AND '),
    tokens,
  }
}

function normalizeText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
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

  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: LOCAL_DB_CONTAINER,
    query: normalizeText(record.query),
    normalized_query: normalizeText(record.normalized_query),
    label_policy: LABEL_POLICY,
    result_count: typeof record.result_count === 'number' && Number.isFinite(record.result_count)
      ? record.result_count
      : foods.length,
    foods,
    selected_food: normalizeFoodRow(record.selected_food),
    nutrients,
  }
}

export function buildLocalFoodSearchSql(query: string, selectedFoodId?: string, limit = DEFAULT_LIMIT): string {
  const normalizedQuery = normalizeFoodSearchText(query)
  const where = buildFoodSearchWhereClause(query)
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50)
  const selectedId = selectedFoodId ? `'${escapeSqlLiteral(selectedFoodId)}'::uuid` : 'NULL::uuid'

  return `
WITH matching_foods AS (
  SELECT
    id,
    bls_code,
    name_de,
    name_en,
    name_th,
    COALESCE(NULLIF(name_display, ''), name_de, name_en, bls_code) AS source_label
  FROM nutrition.foods
  WHERE ${where.sql}
  ORDER BY bls_code
  LIMIT ${safeLimit}
),
selected_food AS (
  SELECT *
  FROM nutrition.foods
  WHERE id = COALESCE(${selectedId}, (SELECT id FROM matching_foods LIMIT 1))
  LIMIT 1
),
selected_food_json AS (
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM selected_food) THEN (
      SELECT json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', COALESCE(NULLIF(name_display, ''), name_de, name_en, bls_code),
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th
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
          WHEN 'FIBC' THEN 6
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
)
SELECT json_build_object(
  'query', '${escapeSqlLiteral(query)}',
  'normalized_query', '${escapeSqlLiteral(normalizedQuery)}',
  'result_count', (SELECT COUNT(*)::int FROM matching_foods),
  'foods', COALESCE((
    SELECT json_agg(
      json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th
      )
      ORDER BY bls_code
    )
    FROM matching_foods
  ), '[]'::json),
  'selected_food', (SELECT value FROM selected_food_json),
  'nutrients', (SELECT value FROM nutrients_json)
)::text;
`.trim()
}

export async function getLocalFoodSearch(query: string, selectedFoodId?: string): Promise<NutritionFoodSearchPayload> {
  const sql = buildLocalFoodSearchSql(query, selectedFoodId)

  try {
    const { stdout } = await execFileAsync('docker', [
      'exec',
      LOCAL_DB_CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-X',
      '-A',
      '-t',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      sql,
    ], {
      maxBuffer: 1024 * 1024 * 4,
      windowsHide: true,
    })

    return parseFoodSearchPayload(stdout)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/docker/i.test(message) || /OCI runtime exec failed/i.test(message) || /No such container/i.test(message)) {
      throw new LocalFoodSearchError(
        'LOCAL_DB_UNAVAILABLE',
        `Local Supabase DB container is unavailable: ${message}`,
      )
    }

    throw new LocalFoodSearchError(
      'LOCAL_FOOD_QUERY_FAILED',
      `Local nutrition food search query failed: ${message}`,
    )
  }
}
