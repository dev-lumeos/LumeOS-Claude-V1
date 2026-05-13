import type { NutritionNutrientPreviewRow } from './local-schema-debug'

export type NutrientPreviewFilter = {
  query: string
  group: string
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function filterNutrientPreviewRows(
  rows: NutritionNutrientPreviewRow[],
  filter: NutrientPreviewFilter,
): NutritionNutrientPreviewRow[] {
  const query = normalize(filter.query)
  const group = filter.group

  return rows.filter((row) => {
    const matchesGroup = group === '' || `${row.group_de}::${row.group_en}` === group
    if (!matchesGroup) return false
    if (!query) return true

    return [
      row.code,
      row.name_de,
      row.name_en,
      row.name_th,
      row.unit,
      row.group_de,
      row.group_en,
      row.group_th,
    ].some((value) => normalize(value).includes(query))
  })
}
