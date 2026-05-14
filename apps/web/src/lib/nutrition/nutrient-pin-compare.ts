import type { NutritionNutrientPreviewRow } from './local-schema-debug'

type NutrientPinCompareValue = string | number | boolean | null | undefined

type NutrientPinCompareKey =
  | 'code'
  | 'name_de'
  | 'name_en'
  | 'name_th'
  | 'unit'
  | 'group_de'
  | 'group_en'
  | 'group_th'
  | 'display_tier'
  | 'is_always_computed'
  | 'is_partly_computed'
  | 'formula'
  | 'rda_male'
  | 'rda_female'
  | 'rda_unit'

export type NutrientPinCompareRow = {
  key: NutrientPinCompareKey
  label: string
  selected: string
  pinned: string
  matches: boolean
}

const COMPARE_FIELDS: { key: NutrientPinCompareKey; label: string }[] = [
  { key: 'code', label: 'code' },
  { key: 'name_de', label: 'name_de' },
  { key: 'name_en', label: 'name_en' },
  { key: 'name_th', label: 'name_th' },
  { key: 'unit', label: 'unit' },
  { key: 'group_de', label: 'group_de' },
  { key: 'group_en', label: 'group_en' },
  { key: 'group_th', label: 'group_th' },
  { key: 'display_tier', label: 'display_tier' },
  { key: 'is_always_computed', label: 'is_always_computed' },
  { key: 'is_partly_computed', label: 'is_partly_computed' },
  { key: 'formula', label: 'formula' },
  { key: 'rda_male', label: 'rda_male' },
  { key: 'rda_female', label: 'rda_female' },
  { key: 'rda_unit', label: 'rda_unit' },
]

export function formatNutrientPinCompareValue(value: NutrientPinCompareValue): string {
  if (value === null || value === undefined) return 'NULL'
  if (value === '') return "''"
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

export function resolvePinnedNutrientRow(
  rows: NutritionNutrientPreviewRow[],
  pinnedCode: string | null | undefined,
): NutritionNutrientPreviewRow | null {
  if (!pinnedCode) return null
  return rows.find((row) => row.code === pinnedCode) ?? null
}

export function buildNutrientPinUrl(pathname: string, currentSearch: string, code: string): string {
  const params = new URLSearchParams(currentSearch)
  params.set('pinned', code)
  return `${pathname}?${params.toString()}`
}

export function clearNutrientPinUrl(pathname: string, currentSearch: string): string {
  const params = new URLSearchParams(currentSearch)
  params.delete('pinned')
  const next = params.toString()
  return next ? `${pathname}?${next}` : pathname
}

export function buildNutrientPinCompareRows(
  selected: NutritionNutrientPreviewRow | null,
  pinned: NutritionNutrientPreviewRow | null,
): NutrientPinCompareRow[] {
  if (!selected || !pinned) return []

  return COMPARE_FIELDS.map(({ key, label }) => {
    const selectedValue = selected[key]
    const pinnedValue = pinned[key]

    return {
      key,
      label,
      selected: formatNutrientPinCompareValue(selectedValue),
      pinned: formatNutrientPinCompareValue(pinnedValue),
      matches: selectedValue === pinnedValue,
    }
  })
}
