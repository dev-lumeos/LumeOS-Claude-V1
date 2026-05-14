import type { NutritionNutrientPreviewRow } from './local-schema-debug'

export function selectNutrientDetailRow(
  rows: NutritionNutrientPreviewRow[],
  selectedCode: string,
): NutritionNutrientPreviewRow | null {
  if (rows.length === 0) return null
  return rows.find((row) => row.code === selectedCode) ?? rows[0] ?? null
}

export function resolveNutrientDetailCode(
  rows: NutritionNutrientPreviewRow[],
  requestedCode: string | null | undefined,
): string {
  if (rows.length === 0) return ''
  const normalizedCode = requestedCode?.trim() ?? ''
  return rows.some((row) => row.code === normalizedCode) ? normalizedCode : rows[0]?.code ?? ''
}

export function buildNutrientDetailUrl(pathname: string, search: string, code: string): string {
  const params = new URLSearchParams(search)
  params.set('nutrient', code)
  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export function formatNutrientDetailValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return 'NULL'
  if (value === '') return "''"
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}
