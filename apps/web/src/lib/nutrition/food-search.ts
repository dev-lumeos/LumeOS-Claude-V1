// Food-Suche über supabase-js rpc() — die Suchlogik selbst liegt als
// Postgres-Funktion in supabase/_pipeline/07_lesefunktionen/070_lesefunktionen.sql
// (nutrition.food_search, nutrition.food_categories_tree).
// Hier verbleiben: Normalisierung/Tokenisierung (eine Quelle), Argument-Bau,
// Payload-Validierung und die URL-Helfer der Foods-Seite.

import { NUTRITION_DB_SOURCE, isDbUnavailableMessage, nutritionRpc } from '@lumeos/shared/nutrition/db'
import { buildFoodSearchTokenGroups } from './such-zerlegung'

const LABEL_POLICY = 'bls_source_label_not_final_display_name'
const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100
const MAX_TOKENS = 6
const FOOD_SEARCH_SORTS = ['relevance', 'protein_desc', 'kcal_asc', 'name_asc'] as const

export type FoodSearchSort = typeof FOOD_SEARCH_SORTS[number]

export type NutritionFoodSearchRow = {
  id: string
  bls_code: string
  source_label: string
  source_label_marker: typeof LABEL_POLICY
  name_display_de: string
  name_display_en: string
  name_display_th: string
  name_de: string
  name_en: string
  name_th: string
  category_id: string
  category_slug: string
  category_name_de: string
  sort_weight: number
  enercc: string
  prot625: string
  fat: string
  cho: string
  tags: string[]
}

export type NutritionFoodNutrientRow = {
  nutrient_code: string
  name_de: string
  name_en: string
  unit: string
  value: string
  data_source: string
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
  category_id: string
  tag: string
  sort: FoodSearchSort
  limit: number
  offset: number
  total: number
  label_policy: typeof LABEL_POLICY
  result_count: number
  foods: NutritionFoodSearchRow[]
  selected_food: NutritionFoodSearchRow | null
  nutrients: NutritionFoodNutrientRow[]
  categories: NutritionFoodCategoryFacet[]
  tags: NutritionFoodTagFacet[]
}

export const NUTRITION_SEARCH_SESSION_COOKIE = 'lumeos-nutrition-search-session'

export type FoodSearchEventInput = {
  sessionId: string | undefined
  query: string
  normalizedQuery: string
  resultCount: number
  selectedFoodId?: string | null
  selectedBlsCode?: string | null
  selectedRank?: number | null
}

export type FoodSearchFilterState = {
  query?: string
  category?: string
  tag?: string
  food?: string
  sort?: FoodSearchSort | string
  offset?: number
  /** Zubereitungsarten, Mehrfachauswahl — "roh oder gegrillt" ist eine echte Frage. */
  preparations?: string[]
  /** Warengruppen (erster Buchstabe des BLS-Codes), Mehrfachauswahl. */
  groups?: string[]
  /** Gerichte der Gruppen X und Y ausblenden. */
  basicsOnly?: boolean
}

/** Eine Zubereitungsart, wie sie `nutrition.preparation_kinds` führt. */
export type NutritionPreparationFacet = {
  code: string
  label_de: string
  count: number
}

/** Eine Warengruppe, wie sie `nutrition.food_groups` führt. */
export type NutritionFoodGroupFacet = {
  code: string
  label_de: string
  ist_gericht: boolean
  count: number
}

export type NutritionFoodCategoryTreeNode = {
  id: string
  slug: string
  name_de: string
  name_en: string
  name_th: string
  level: number
  sort_order: number
  count: number
  children: NutritionFoodCategoryTreeNode[]
}

export type FoodSearchRpcArgs = {
  p_query: string
  p_normalized_query: string
  p_tokens: string[]
  /**
   * Suchgruppen aus Zerlegung und Synonymen. ODER innerhalb einer
   * Gruppe, UND zwischen den Gruppen. Als jsonb, weil die Gruppen
   * unterschiedlich lang sind und Postgres kein zerklueftetes
   * text[][] kennt.
   *
   * p_tokens bleibt daneben bestehen: es traegt die Anfrage so, wie
   * der Nutzer sie getippt hat, und ist die Rueckfallebene, wenn die
   * Gruppen leer sind.
   */
  p_token_groups: string[][]
  p_selected_food_id: string | null
  p_category_slug: string
  p_category_id: string | null
  p_tag_code: string
  p_sort: FoodSearchSort
  p_limit: number
  p_offset: number
  /** Leeres Array statt null: die Funktion behandelt beides gleich, aber
   *  ein Array ist im Aufruf eindeutiger als ein fehlender Wert. */
  p_preparations: string[]
  p_groups: string[]
  p_basics_only: boolean
}

export class LocalFoodSearchError extends Error {
  readonly code: 'LOCAL_DB_UNAVAILABLE' | 'LOCAL_FOOD_QUERY_FAILED' | 'INVALID_FOOD_SEARCH_PAYLOAD'

  constructor(code: LocalFoodSearchError['code'], message: string) {
    super(message)
    this.name = 'LocalFoodSearchError'
    this.code = code
  }
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
    .replace(/[^a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeSlug(value: string): string {
  return normalizeFoodSearchText(value).replace(/\s+/g, '-')
}

export function normalizeFoodSearchSort(value: string | null | undefined): FoodSearchSort {
  return FOOD_SEARCH_SORTS.includes(value as FoodSearchSort) ? value as FoodSearchSort : 'relevance'
}

export function clampFoodSearchLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT)
}

export function clampFoodSearchOffset(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(Math.trunc(value), 0)
}

/** Tokenisierung der Suche — einzige Quelle, wird als Parameter an die DB-Funktion gereicht. */
export function buildFoodSearchTokens(query: string): string[] {
  return normalizeFoodSearchText(query)
    .split(' ')
    .map(token => token.trim())
    .filter(Boolean)
    .slice(0, MAX_TOKENS)
}

/**
 * Suchgruppen: Zerlegung von Komposita plus Synonyme.
 *
 * Innerhalb einer Gruppe gilt ODER, zwischen den Gruppen UND. Die
 * Faltung passiert VOR der Zerlegung, weil der Wortschatz gefaltet
 * erzeugt wird — Begruendung und Messung in such-zerlegung.ts.
 *
 * `[cmd]` Ohne diese Gruppen liefert "huehnerbrust" 0 Treffer, mit
 * ihnen 31, angefuehrt von "Hähnchen Brustfilet, roh".
 */
export function buildFoodSearchGroups(query: string): string[][] {
  return buildFoodSearchTokenGroups(normalizeFoodSearchText(query))
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
      switch (key) {
        case 'query':
        case 'category':
        case 'tag':
        case 'food':
        case 'sort':
          merged[key] = value
          break
        case 'offset':
          merged.offset = Number(value)
          break
        // Mehrfachauswahl: der Wert ist ein Code, der umgeschaltet wird.
        // Ein Klick auf eine gesetzte Zubereitung nimmt sie wieder weg —
        // sonst braeuchte jede Ankreuzung zwei verschiedene Links.
        case 'preparations':
        case 'groups': {
          const bisher = merged[key] ?? []
          merged[key] = bisher.includes(value)
            ? bisher.filter(v => v !== value)
            : [...bisher, value]
          break
        }
        case 'basicsOnly':
          merged.basicsOnly = value === 'true' || value === '1'
          break
      }
    }
  }

  if (merged.query?.trim()) params.set('q', merged.query.trim())
  if (merged.category?.trim()) params.set('category', merged.category.trim())
  if (merged.tag?.trim()) params.set('tag', merged.tag.trim())
  if (merged.food?.trim()) params.set('food', merged.food.trim())
  if (merged.sort?.trim() && normalizeFoodSearchSort(merged.sort) !== 'relevance') params.set('sort', normalizeFoodSearchSort(merged.sort))
  // Mehrfachauswahl als wiederholter Parameter (?prep=roh&prep=gegrillt).
  // Sortiert, damit dieselbe Auswahl immer dieselbe Adresse ergibt —
  // sonst waeren zwei gleichwertige Links verschieden.
  for (const code of [...(merged.preparations ?? [])].sort()) {
    if (code.trim()) params.append('prep', code.trim())
  }
  for (const code of [...(merged.groups ?? [])].sort()) {
    if (code.trim()) params.append('group', code.trim())
  }
  if (merged.basicsOnly) params.set('basics', '1')
  if (typeof merged.offset === 'number' && merged.offset > 0) params.set('offset', String(clampFoodSearchOffset(merged.offset)))
  const query = params.toString()
  return query ? `/nutrition?${query}` : '/nutrition'
}

/** Baut die rpc()-Argumente für nutrition.food_search — testbar ohne Datenbank. */
export function buildFoodSearchRpcArgs(
  query: string,
  selectedFoodId?: string,
  options: {
    limit?: number
    offset?: number
    category?: string
    categoryId?: string
    tag?: string
    sort?: string
    preparations?: string[]
    groups?: string[]
    basicsOnly?: boolean
  } = {},
): FoodSearchRpcArgs {
  return {
    p_query: query,
    p_normalized_query: normalizeFoodSearchText(query),
    p_tokens: buildFoodSearchTokens(query),
    p_token_groups: buildFoodSearchGroups(query),
    p_selected_food_id: selectedFoodId?.trim() ? selectedFoodId.trim() : null,
    p_category_slug: normalizeSlug(options.category ?? ''),
    p_category_id: options.categoryId?.trim() ? options.categoryId.trim() : null,
    p_tag_code: normalizeFoodSearchText(options.tag ?? '').replace(/\s+/g, '_'),
    p_sort: normalizeFoodSearchSort(options.sort),
    p_limit: clampFoodSearchLimit(options.limit ?? DEFAULT_LIMIT),
    p_offset: clampFoodSearchOffset(options.offset ?? 0),
    // Codes kommen aus der Adresse und damit vom Nutzer. Sie werden nur
    // getrimmt und auf Leeres geprueft — die Datenbank vergleicht sie
    // gegen preparation_kinds.code bzw. food_groups.code, ein
    // unbekannter Code liefert also schlicht keinen Treffer.
    p_preparations: (options.preparations ?? []).map(c => c.trim()).filter(Boolean),
    p_groups: (options.groups ?? []).map(c => c.trim().toUpperCase()).filter(Boolean),
    p_basics_only: options.basicsOnly === true,
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
    source_label_marker: LABEL_POLICY,
    name_display_de: normalizeText(record.name_display_de),
    name_display_en: normalizeText(record.name_display_en),
    name_display_th: normalizeText(record.name_display_th),
    name_de: nameDe,
    name_en: normalizeText(record.name_en),
    name_th: normalizeText(record.name_th),
    category_id: normalizeText(record.category_id),
    category_slug: normalizeText(record.category_slug),
    category_name_de: normalizeText(record.category_name_de),
    sort_weight: normalizeCount(record.sort_weight),
    enercc: normalizeText(record.enercc),
    prot625: normalizeText(record.prot625),
    fat: normalizeText(record.fat),
    cho: normalizeText(record.cho),
    tags: Array.isArray(record.tags) ? record.tags.map(normalizeText).filter(Boolean) : [],
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
    data_source: normalizeText(record.data_source) || 'BLS',
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

/** Akzeptiert das rpc()-Ergebnis (Objekt) oder einen JSON-String (Tests, Altpfad). */
export function parseFoodSearchPayload(input: unknown): NutritionFoodSearchPayload {
  let parsed: unknown = input
  if (typeof input === 'string') {
    const raw = input.trim()
    if (!raw) {
      throw new LocalFoodSearchError('INVALID_FOOD_SEARCH_PAYLOAD', 'Food search returned no output.')
    }
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      throw new LocalFoodSearchError(
        'INVALID_FOOD_SEARCH_PAYLOAD',
        `Food search output was not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new LocalFoodSearchError('INVALID_FOOD_SEARCH_PAYLOAD', 'Food search payload is not an object.')
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
    container: NUTRITION_DB_SOURCE,
    query: normalizeText(record.query),
    normalized_query: normalizeText(record.normalized_query),
    category: normalizeText(record.category),
    category_id: normalizeText(record.category_id),
    tag: normalizeText(record.tag),
    sort: normalizeFoodSearchSort(normalizeText(record.sort)),
    limit: normalizeCount(record.limit),
    offset: normalizeCount(record.offset),
    total: normalizeCount(record.total),
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

/**
 * Zubereitungsarten für die Ankreuzliste.
 *
 * Liest `nutrition.preparation_kinds` DIREKT — die Tabelle ist für
 * `authenticated` lesbar (Kettenschritt 023), es braucht dafür keine
 * eigene Funktion und damit keine Datenbankänderung.
 *
 * Die Reihenfolge kommt aus `sort_order`, die Beschriftung aus
 * `label_de` — nicht aus dem Code. Wer eine Art umbenennt, ändert die
 * Tabelle, nicht diese Datei.
 *
 * ZUR TREFFERZAHL: Sie wird hier NICHT mitgeliefert. `[cmd]` Die
 * Suchfunktion gibt die gesetzten Filter zurück, aber keine Facetten mit
 * Zählern; eine Zahl je Art bräuchte entweder eine neue Funktion in der
 * Datenbank oder elf zusätzliche Abfragen je Seitenaufruf. Beides ist
 * mehr, als der Nutzen rechtfertigt — und die Prüfung „bietet keinen
 * leeren Filter an" leistet bereits die Selbstkontrolle in 023, die
 * abbricht, sobald eine Art ohne Treffer entsteht.
 */
export async function getPreparationFacets(): Promise<NutritionPreparationFacet[]> {
  try {
    const { data, error } = await nutritionRpc()
      .from('preparation_kinds')
      .select('code,label_de,sort_order')
      .order('sort_order', { ascending: true })
    if (error) return []
    const rows = Array.isArray(data) ? data : []
    return rows
      .map(row => ({
        code: normalizeText((row as Record<string, unknown>).code),
        label_de: normalizeText((row as Record<string, unknown>).label_de),
        count: 0,
      }))
      .filter(row => row.code && row.label_de)
  } catch {
    return []
  }
}

/**
 * Warengruppen für die Ankreuzliste.
 *
 * `label_de` ist in `nutrition.food_groups` bewusst NULL, wo sich keine
 * eindeutige Bezeichnung belegen liess — solche Gruppen werden hier
 * herausgefiltert und damit nicht angeboten. Ein Filter ohne Namen wäre
 * eine Zumutung, ein geratener Name wäre schlimmer.
 */
export async function getFoodGroupFacets(): Promise<NutritionFoodGroupFacet[]> {
  try {
    const { data, error } = await nutritionRpc()
      .from('food_groups')
      .select('code,label_de,ist_gericht,sort_order')
      .order('sort_order', { ascending: true })
    if (error) return []
    const rows = Array.isArray(data) ? data : []
    return rows
      .map(row => ({
        code: normalizeText((row as Record<string, unknown>).code),
        label_de: normalizeText((row as Record<string, unknown>).label_de),
        ist_gericht: (row as Record<string, unknown>).ist_gericht === true,
        count: 0,
      }))
      .filter(row => row.code && row.label_de)
  } catch {
    return []
  }
}

export async function getLocalFoodSearch(
  query: string,
  selectedFoodId?: string,
  options: {
    category?: string
    categoryId?: string
    tag?: string
    limit?: number
    offset?: number
    sort?: string
    preparations?: string[]
    groups?: string[]
    basicsOnly?: boolean
  } = {},
): Promise<NutritionFoodSearchPayload> {
  const args = buildFoodSearchRpcArgs(query, selectedFoodId, options)

  try {
    const { data, error } = await nutritionRpc().rpc('food_search', args)
    if (error) {
      throw new LocalFoodSearchError(
        isDbUnavailableMessage(error.message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_FOOD_QUERY_FAILED',
        error.message,
      )
    }
    return parseFoodSearchPayload(data)
  } catch (error) {
    if (error instanceof LocalFoodSearchError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new LocalFoodSearchError(
      isDbUnavailableMessage(message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_FOOD_QUERY_FAILED',
      message,
    )
  }
}

export async function recordFoodSearchEvent(input: FoodSearchEventInput): Promise<void> {
  const sessionId = input.sessionId?.trim()
  if (!sessionId) return

  const row = {
    session_id: sessionId,
    query: input.query,
    normalized_query: input.normalizedQuery,
    result_count: Math.max(0, Math.trunc(input.resultCount)),
    selected_food_id: input.selectedFoodId?.trim() || null,
    selected_bls_code: input.selectedBlsCode?.trim() || null,
    selected_rank: typeof input.selectedRank === 'number' && Number.isFinite(input.selectedRank)
      ? Math.max(1, Math.trunc(input.selectedRank))
      : null,
  }

  try {
    const { error } = await nutritionRpc().from('search_events').insert(row)
    if (error) {
      console.warn(`Search event logging failed: ${error.message}`)
    }
  } catch (error) {
    console.warn(`Search event logging failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function normalizeCategoryTreeNode(value: unknown): NutritionFoodCategoryTreeNode | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const id = normalizeText(record.id)
  const slug = normalizeText(record.slug)
  if (!id || !slug) return null
  return {
    id,
    slug,
    name_de: normalizeText(record.name_de),
    name_en: normalizeText(record.name_en),
    name_th: normalizeText(record.name_th),
    level: normalizeCount(record.level),
    sort_order: normalizeCount(record.sort_order),
    count: normalizeCount(record.count),
    children: Array.isArray(record.children)
      ? record.children.map(item => normalizeCategoryTreeNode(item)).filter((item): item is NutritionFoodCategoryTreeNode => item !== null)
      : [],
  }
}

/** Akzeptiert das rpc()-Ergebnis (Array) oder einen JSON-String. */
export function parseCategoryTreePayload(input: unknown): NutritionFoodCategoryTreeNode[] {
  const parsed: unknown = typeof input === 'string' ? JSON.parse(input.trim() || '[]') : input
  if (!Array.isArray(parsed)) return []
  return parsed.map(item => normalizeCategoryTreeNode(item)).filter((item): item is NutritionFoodCategoryTreeNode => item !== null)
}

export async function getLocalFoodCategories(): Promise<NutritionFoodCategoryTreeNode[]> {
  try {
    const { data, error } = await nutritionRpc().rpc('food_categories_tree')
    if (error) {
      throw new LocalFoodSearchError(
        isDbUnavailableMessage(error.message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_FOOD_QUERY_FAILED',
        error.message,
      )
    }
    return parseCategoryTreePayload(data)
  } catch (error) {
    if (error instanceof LocalFoodSearchError) throw error
    const message = error instanceof Error ? error.message : String(error)
    throw new LocalFoodSearchError(
      isDbUnavailableMessage(message) ? 'LOCAL_DB_UNAVAILABLE' : 'LOCAL_FOOD_QUERY_FAILED',
      message,
    )
  }
}
