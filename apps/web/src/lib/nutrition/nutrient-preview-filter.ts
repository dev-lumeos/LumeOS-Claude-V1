import type { NutritionNutrientPreviewRow } from './local-schema-debug'

export type NutrientPreviewFilter = {
  query: string
  group: string
  rdaAvailability?: NutrientRdaAvailabilityFilter
}

export type NutrientRdaAvailabilityFilter = 'all' | 'with-rda' | 'without-rda'

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function hasNutrientRdaValue(row: NutritionNutrientPreviewRow): boolean {
  return Boolean(row.rda_male?.trim() || row.rda_female?.trim())
}

export function filterNutrientPreviewRows(
  rows: NutritionNutrientPreviewRow[],
  filter: NutrientPreviewFilter,
): NutritionNutrientPreviewRow[] {
  const query = normalize(filter.query)
  const group = filter.group
  const rdaAvailability = filter.rdaAvailability ?? 'all'

  return rows.filter((row) => {
    const matchesGroup = group === '' || `${row.group_de}::${row.group_en}` === group
    if (!matchesGroup) return false

    const hasRda = hasNutrientRdaValue(row)
    if (rdaAvailability === 'with-rda' && !hasRda) return false
    if (rdaAvailability === 'without-rda' && hasRda) return false

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
