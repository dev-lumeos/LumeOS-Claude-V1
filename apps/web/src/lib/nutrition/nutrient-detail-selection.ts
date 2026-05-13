import type { NutritionNutrientPreviewRow } from './local-schema-debug'

export function selectNutrientDetailRow(
  rows: NutritionNutrientPreviewRow[],
  selectedCode: string,
): NutritionNutrientPreviewRow | null {
  if (rows.length === 0) return null
  return rows.find((row) => row.code === selectedCode) ?? rows[0] ?? null
}

export function formatNutrientDetailValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return 'NULL'
  if (value === '') return "''"
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}
