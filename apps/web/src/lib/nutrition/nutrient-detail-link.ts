const LOCAL_SCHEMA_PATH = '/nutrition/local-schema'

export function buildNutrientDetailLink(
  currentSearch: string,
  selectedCode: string,
  pinnedCode: string | null | undefined,
): string {
  const params = new URLSearchParams(currentSearch)
  params.set('nutrient', selectedCode)

  if (pinnedCode) {
    params.set('pinned', pinnedCode)
  } else {
    params.delete('pinned')
  }

  return `${LOCAL_SCHEMA_PATH}?${params.toString()}`
}
