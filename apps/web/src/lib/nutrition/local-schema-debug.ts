import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'

export type NutritionSchemaColumn = {
  name: string
  data_type: string
  is_nullable: boolean
}

export type NutritionSchemaIndex = {
  name: string
  definition: string
}

export type NutritionSchemaConstraint = {
  name: string
  definition: string
}

export type NutritionGroupCount = {
  group_de: string
  group_en: string
  row_count: number
}

export type NutritionNutrientPreviewRow = {
  code: string
  name_de: string
  name_en: string
  name_th: string
  unit: string
  group_de: string
  group_en: string
  group_th: string
  sort_index: number
  display_tier: number
  is_always_computed: boolean
  is_partly_computed: boolean
  formula: string | null
  rda_male: string | null
  rda_female: string | null
  rda_unit: string | null
}

export type NutritionRdaSummary = {
  rda_male_populated: number
  rda_female_populated: number
  rda_unit_populated: number
}

export type NutritionFoodFoundationStatus = {
  foods_table_exists: boolean
  food_nutrients_table_exists: boolean
  foods_row_count: number
  food_nutrients_row_count: number
  food_nutrients_nutrient_fk_exists: boolean
}

export type NutritionSchemaDebugSnapshot = {
  checkedAt: string
  environment: 'local'
  container: string
  schema_exists: boolean
  table_exists: boolean
  row_count: number
  columns: NutritionSchemaColumn[]
  indexes: NutritionSchemaIndex[]
  constraints: NutritionSchemaConstraint[]
  group_counts: NutritionGroupCount[]
  nutrient_preview: NutritionNutrientPreviewRow[]
  rda_summary: NutritionRdaSummary
  food_foundation: NutritionFoodFoundationStatus
}

export class LocalSchemaDebugError extends Error {
  readonly code: 'LOCAL_DB_UNAVAILABLE' | 'LOCAL_SCHEMA_QUERY_FAILED' | 'INVALID_DEBUG_PAYLOAD'

  constructor(code: LocalSchemaDebugError['code'], message: string) {
    super(message)
    this.name = 'LocalSchemaDebugError'
    this.code = code
  }
}

const LOCAL_SCHEMA_SQL = `
WITH table_state AS (
  SELECT
    EXISTS (
      SELECT 1
      FROM information_schema.schemata
      WHERE schema_name = 'nutrition'
    ) AS schema_exists,
    to_regclass('nutrition.nutrient_defs') IS NOT NULL AS table_exists
),
row_state AS (
  SELECT CASE
    WHEN (SELECT table_exists FROM table_state)
      THEN (SELECT COUNT(*)::int FROM nutrition.nutrient_defs)
    ELSE 0
  END AS row_count
),
columns_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable = 'YES'
      )
      ORDER BY ordinal_position
    ),
    '[]'::json
  ) AS value
  FROM information_schema.columns
  WHERE table_schema = 'nutrition'
    AND table_name = 'nutrient_defs'
),
indexes_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', indexname,
        'definition', indexdef
      )
      ORDER BY indexname
    ),
    '[]'::json
  ) AS value
  FROM pg_indexes
  WHERE schemaname = 'nutrition'
    AND tablename = 'nutrient_defs'
),
constraints_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', conname,
        'definition', pg_get_constraintdef(c.oid)
      )
      ORDER BY conname
    ),
    '[]'::json
  ) AS value
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'nutrition'
    AND t.relname = 'nutrient_defs'
),
group_counts_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'group_de', group_de,
        'group_en', group_en,
        'row_count', row_count
      )
      ORDER BY row_count DESC, group_de
    ),
    '[]'::json
  ) AS value
  FROM (
    SELECT
      group_de,
      group_en,
      COUNT(*)::int AS row_count
    FROM nutrition.nutrient_defs
    GROUP BY group_de, group_en
  ) grouped
),
nutrient_preview_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'code', code,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'unit', unit,
        'group_de', group_de,
        'group_en', group_en,
        'group_th', group_th,
        'sort_index', sort_index,
        'display_tier', display_tier,
        'is_always_computed', is_always_computed,
        'is_partly_computed', is_partly_computed,
        'formula', formula,
        'rda_male', rda_male,
        'rda_female', rda_female,
        'rda_unit', rda_unit
      )
      ORDER BY sort_index, code
    ),
    '[]'::json
  ) AS value
  FROM (
    SELECT
      code,
      name_de,
      name_en,
      name_th,
      unit,
      group_de,
      group_en,
      group_th,
      sort_index,
      display_tier,
      is_always_computed,
      is_partly_computed,
      formula,
      rda_male,
      rda_female,
      rda_unit
    FROM nutrition.nutrient_defs
    ORDER BY sort_index, code
    LIMIT 138
  ) preview
),
rda_summary_json AS (
  SELECT json_build_object(
    'rda_male_populated', COUNT(*) FILTER (WHERE rda_male IS NOT NULL)::int,
    'rda_female_populated', COUNT(*) FILTER (WHERE rda_female IS NOT NULL)::int,
    'rda_unit_populated', COUNT(*) FILTER (WHERE rda_unit IS NOT NULL AND rda_unit <> '')::int
  ) AS value
  FROM nutrition.nutrient_defs
),
food_foundation_json AS (
  SELECT json_build_object(
    'foods_table_exists', to_regclass('nutrition.foods') IS NOT NULL,
    'food_nutrients_table_exists', to_regclass('nutrition.food_nutrients') IS NOT NULL,
    'foods_row_count', CASE
      WHEN to_regclass('nutrition.foods') IS NULL THEN 0
      ELSE (SELECT GREATEST(c.reltuples::int, 0) FROM pg_class c WHERE c.oid = to_regclass('nutrition.foods'))
    END,
    'food_nutrients_row_count', CASE
      WHEN to_regclass('nutrition.food_nutrients') IS NULL THEN 0
      ELSE (SELECT GREATEST(c.reltuples::int, 0) FROM pg_class c WHERE c.oid = to_regclass('nutrition.food_nutrients'))
    END,
    'food_nutrients_nutrient_fk_exists', EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class source_table ON source_table.oid = c.conrelid
      JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
      JOIN pg_class target_table ON target_table.oid = c.confrelid
      JOIN pg_namespace target_ns ON target_ns.oid = target_table.relnamespace
      JOIN unnest(c.conkey) WITH ORDINALITY source_key(attnum, ordinality) ON true
      JOIN pg_attribute source_attribute
        ON source_attribute.attrelid = source_table.oid
       AND source_attribute.attnum = source_key.attnum
      JOIN unnest(c.confkey) WITH ORDINALITY target_key(attnum, ordinality)
        ON target_key.ordinality = source_key.ordinality
      JOIN pg_attribute target_attribute
        ON target_attribute.attrelid = target_table.oid
       AND target_attribute.attnum = target_key.attnum
      WHERE c.contype = 'f'
        AND source_ns.nspname = 'nutrition'
        AND source_table.relname = 'food_nutrients'
        AND source_attribute.attname = 'nutrient_code'
        AND target_ns.nspname = 'nutrition'
        AND target_table.relname = 'nutrient_defs'
        AND target_attribute.attname = 'code'
    )
  ) AS value
)
SELECT json_build_object(
  'schema_exists', (SELECT schema_exists FROM table_state),
  'table_exists', (SELECT table_exists FROM table_state),
  'row_count', (SELECT row_count FROM row_state),
  'columns', (SELECT value FROM columns_json),
  'indexes', (SELECT value FROM indexes_json),
  'constraints', (SELECT value FROM constraints_json),
  'group_counts', (SELECT value FROM group_counts_json),
  'nutrient_preview', (SELECT value FROM nutrient_preview_json),
  'rda_summary', (SELECT value FROM rda_summary_json),
  'food_foundation', (SELECT value FROM food_foundation_json)
)::text;
`.trim()

function normalizeBoolean(value: unknown): boolean {
  return value === true
}

function normalizeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeNullableText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return null
}

function normalizeColumns(value: unknown): NutritionSchemaColumn[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    return [{
      name: typeof record.name === 'string' ? record.name : '',
      data_type: typeof record.data_type === 'string' ? record.data_type : '',
      is_nullable: normalizeBoolean(record.is_nullable),
    }]
  })
}

function normalizeNamedDefinitions<T extends NutritionSchemaIndex | NutritionSchemaConstraint>(
  value: unknown,
): T[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    if (typeof record.name !== 'string' || typeof record.definition !== 'string') return []
    return [{ name: record.name, definition: record.definition } as T]
  })
}

function normalizeGroupCounts(value: unknown): NutritionGroupCount[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    return [{
      group_de: typeof record.group_de === 'string' ? record.group_de : '',
      group_en: typeof record.group_en === 'string' ? record.group_en : '',
      row_count: normalizeNumber(record.row_count),
    }]
  })
}

function normalizeNutrientPreview(value: unknown): NutritionNutrientPreviewRow[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    return [{
      code: typeof record.code === 'string' ? record.code : '',
      name_de: typeof record.name_de === 'string' ? record.name_de : '',
      name_en: typeof record.name_en === 'string' ? record.name_en : '',
      name_th: typeof record.name_th === 'string' ? record.name_th : '',
      unit: typeof record.unit === 'string' ? record.unit : '',
      group_de: typeof record.group_de === 'string' ? record.group_de : '',
      group_en: typeof record.group_en === 'string' ? record.group_en : '',
      group_th: typeof record.group_th === 'string' ? record.group_th : '',
      sort_index: normalizeNumber(record.sort_index),
      display_tier: normalizeNumber(record.display_tier),
      is_always_computed: normalizeBoolean(record.is_always_computed),
      is_partly_computed: normalizeBoolean(record.is_partly_computed),
      formula: normalizeNullableText(record.formula),
      rda_male: normalizeNullableText(record.rda_male),
      rda_female: normalizeNullableText(record.rda_female),
      rda_unit: normalizeNullableText(record.rda_unit),
    }]
  })
}

function normalizeRdaSummary(value: unknown): NutritionRdaSummary {
  if (!value || typeof value !== 'object') {
    return {
      rda_male_populated: 0,
      rda_female_populated: 0,
      rda_unit_populated: 0,
    }
  }
  const record = value as Record<string, unknown>
  return {
    rda_male_populated: normalizeNumber(record.rda_male_populated),
    rda_female_populated: normalizeNumber(record.rda_female_populated),
    rda_unit_populated: normalizeNumber(record.rda_unit_populated),
  }
}

function normalizeFoodFoundationStatus(value: unknown): NutritionFoodFoundationStatus {
  if (!value || typeof value !== 'object') {
    return {
      foods_table_exists: false,
      food_nutrients_table_exists: false,
      foods_row_count: 0,
      food_nutrients_row_count: 0,
      food_nutrients_nutrient_fk_exists: false,
    }
  }
  const record = value as Record<string, unknown>
  return {
    foods_table_exists: normalizeBoolean(record.foods_table_exists),
    food_nutrients_table_exists: normalizeBoolean(record.food_nutrients_table_exists),
    foods_row_count: normalizeNumber(record.foods_row_count),
    food_nutrients_row_count: normalizeNumber(record.food_nutrients_row_count),
    food_nutrients_nutrient_fk_exists: normalizeBoolean(record.food_nutrients_nutrient_fk_exists),
  }
}

export function parseNutritionSchemaDebug(stdout: string): NutritionSchemaDebugSnapshot {
  const raw = stdout.trim()
  if (!raw) {
    throw new LocalSchemaDebugError('INVALID_DEBUG_PAYLOAD', 'Local schema debug command returned no output.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new LocalSchemaDebugError(
      'INVALID_DEBUG_PAYLOAD',
      `Local schema debug output was not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new LocalSchemaDebugError('INVALID_DEBUG_PAYLOAD', 'Local schema debug payload is not an object.')
  }

  const record = parsed as Record<string, unknown>
  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: LOCAL_DB_CONTAINER,
    schema_exists: normalizeBoolean(record.schema_exists),
    table_exists: normalizeBoolean(record.table_exists),
    row_count: normalizeNumber(record.row_count),
    columns: normalizeColumns(record.columns),
    indexes: normalizeNamedDefinitions<NutritionSchemaIndex>(record.indexes),
    constraints: normalizeNamedDefinitions<NutritionSchemaConstraint>(record.constraints),
    group_counts: normalizeGroupCounts(record.group_counts),
    nutrient_preview: normalizeNutrientPreview(record.nutrient_preview),
    rda_summary: normalizeRdaSummary(record.rda_summary),
    food_foundation: normalizeFoodFoundationStatus(record.food_foundation),
  }
}

export async function getLocalNutritionSchemaDebug(): Promise<NutritionSchemaDebugSnapshot> {
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
      LOCAL_SCHEMA_SQL,
    ], {
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    })

    return parseNutritionSchemaDebug(stdout)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/docker/i.test(message) || /OCI runtime exec failed/i.test(message) || /No such container/i.test(message)) {
      throw new LocalSchemaDebugError(
        'LOCAL_DB_UNAVAILABLE',
        `Local Supabase DB container is unavailable: ${message}`,
      )
    }

    throw new LocalSchemaDebugError(
      'LOCAL_SCHEMA_QUERY_FAILED',
      `Local nutrition schema debug query failed: ${message}`,
    )
  }
}
