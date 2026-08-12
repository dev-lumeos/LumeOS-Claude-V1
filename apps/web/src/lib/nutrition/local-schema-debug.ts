// Schema-Debug über supabase-js rpc() — die Introspektion liegt als
// Postgres-Funktion nutrition.schema_debug in
// supabase/_pipeline/07_lesefunktionen/070_lesefunktionen.sql.
// Hier verbleibt die Payload-Validierung.

import { NUTRITION_DB_SOURCE, isDbUnavailableMessage, nutritionRpc } from '@lumeos/shared/nutrition/db'

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

/** Akzeptiert das rpc()-Ergebnis (Objekt) oder einen JSON-String (Tests). */
export function parseNutritionSchemaDebug(input: unknown): NutritionSchemaDebugSnapshot {
  let parsed: unknown = input
  if (typeof input === 'string') {
    const raw = input.trim()
    if (!raw) {
      throw new LocalSchemaDebugError('INVALID_DEBUG_PAYLOAD', 'Schema debug returned no output.')
    }
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      throw new LocalSchemaDebugError(
        'INVALID_DEBUG_PAYLOAD',
        `Schema debug output was not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new LocalSchemaDebugError('INVALID_DEBUG_PAYLOAD', 'Schema debug payload is not an object.')
  }

  const record = parsed as Record<string, unknown>
  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: NUTRITION_DB_SOURCE,
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
    const { data, error } = await nutritionRpc().rpc('schema_debug')
    if (error) {
      throw new LocalSchemaDebugError(
        isDbUnavailableMessage(error.message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_SCHEMA_QUERY_FAILED',
        error.message,
      )
    }
    return parseNutritionSchemaDebug(data)
  } catch (error) {
    if (error instanceof LocalSchemaDebugError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new LocalSchemaDebugError(
      isDbUnavailableMessage(message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_SCHEMA_QUERY_FAILED',
      message,
    )
  }
}
