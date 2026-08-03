// Kurations-Übersicht über supabase-js rpc() — die Abfrage liegt als
// Postgres-Funktion nutrition.curation_overview in
// supabase/_pipeline/07_lesefunktionen/070_lesefunktionen.sql.
// Hier verbleiben: Options-Normalisierung, Payload-Validierung und der
// Katalog-Abgleich (preferences-catalog ist ein Code-Literal).

import { getNutritionPreferenceCatalog, summarizePreferenceCatalog } from './preferences-catalog'
import { NUTRITION_DB_SOURCE, isDbUnavailableMessage, nutritionRpc } from './nutrition-db'

export type CurationUnassignedFood = {
  id: string
  bls_code: string
  source_label: string
  alias_count: number
  tags: string[]
  enercc: string
  prot625: string
  fat: string
  cho: string
  current_category_slug: string
  current_category_name_de: string
  sort_weight: number
  curation_status: 'needs_curation' | 'categorized'
  unresolved_reason: string
}

export type NutritionCurationOptions = {
  unassignedOnly?: boolean
  category?: string
  tag?: string
  aliasState?: 'has' | 'missing' | ''
  sort?: 'sort_weight_desc' | 'name_asc' | 'macro_relevance' | 'category_missing_first'
}

export type CurationRpcArgs = {
  p_unassigned_only: boolean
  p_category: string
  p_tag: string
  p_alias_state: '' | 'has' | 'missing'
  p_sort: Required<NutritionCurationOptions>['sort']
}

export type NutritionCurationPayload = {
  checkedAt: string
  environment: 'local'
  container: string
  counts: {
    foods: number
    food_nutrients: number
    assigned_foods: number
    unassigned_foods: number
    tag_definitions: number
    food_tags: number
    food_aliases: number
  }
  category_levels: Array<{ level: number; count: number }>
  tag_coverage: Array<{ code: string; name_de: string; food_count: number }>
  low_coverage_tags: Array<{ code: string; name_de: string; food_count: number }>
  alias_coverage: {
    zero_alias_foods: number
    one_alias_foods: number
    multi_alias_foods: number
    german_umlaut_foods: number
    foods_with_en_source_label: number
  }
  unassigned_examples: CurationUnassignedFood[]
  candidate_tables: {
    candidates_table_exists: boolean
    decisions_table_exists: boolean
    candidates: number
    pending_candidates: number
    decisions: number
  }
  preference_mapping: {
    general_exclusions: {
      mapped: number
      unresolved: number
      unresolved_codes: string[]
    }
    food_preference_groups: {
      mapped: number
      unresolved: number
      unresolved_codes: string[]
    }
    food_preference_items: {
      total: number
      unresolved: number
    }
    groups: Array<{
      code: string
      label_de: string
      mapping_status: string
      target_type: string
      mapped_target_type: string
      mapped_codes: string[]
      mapping_note: string
      unresolved_items: number
    }>
    unresolved_items: Array<{
      group_code: string
      code: string
      label_de: string
      target_type: string
      mapping_note: string
    }>
  }
  curation_policy: {
    ui_mode: 'read_only'
    display_names: 'source_backed_provisional_only'
    aliases: 'source_label_normalized_variants_only'
    writes_enabled: false
  }
}

function normalizeOptions(options: NutritionCurationOptions = {}): Required<NutritionCurationOptions> {
  const sort = ['sort_weight_desc', 'name_asc', 'macro_relevance', 'category_missing_first'].includes(options.sort ?? '')
    ? options.sort as Required<NutritionCurationOptions>['sort']
    : 'category_missing_first'
  const aliasState = options.aliasState === 'has' || options.aliasState === 'missing' ? options.aliasState : ''
  return {
    unassignedOnly: options.unassignedOnly ?? true,
    category: options.category ?? '',
    tag: options.tag ?? '',
    aliasState,
    sort,
  }
}

/** Baut die rpc()-Argumente für nutrition.curation_overview — testbar ohne Datenbank. */
export function buildCurationRpcArgs(options: NutritionCurationOptions = {}): CurationRpcArgs {
  const normalized = normalizeOptions(options)
  return {
    p_unassigned_only: normalized.unassignedOnly,
    p_category: normalized.category,
    p_tag: normalized.tag,
    p_alias_state: normalized.aliasState,
    p_sort: normalized.sort,
  }
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseInt(value, 10) || 0
  return 0
}

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function parseUnassignedFood(value: unknown): CurationUnassignedFood | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.bls_code !== 'string') return null
  return {
    id: record.id,
    bls_code: record.bls_code,
    source_label: typeof record.source_label === 'string' ? record.source_label : '',
    alias_count: parseNumber(record.alias_count),
    tags: parseStringArray(record.tags),
    enercc: typeof record.enercc === 'string' ? record.enercc : '',
    prot625: typeof record.prot625 === 'string' ? record.prot625 : '',
    fat: typeof record.fat === 'string' ? record.fat : '',
    cho: typeof record.cho === 'string' ? record.cho : '',
    current_category_slug: typeof record.current_category_slug === 'string' ? record.current_category_slug : '',
    current_category_name_de: typeof record.current_category_name_de === 'string' ? record.current_category_name_de : '',
    sort_weight: parseNumber(record.sort_weight),
    curation_status: record.curation_status === 'categorized' ? 'categorized' : 'needs_curation',
    unresolved_reason: typeof record.unresolved_reason === 'string' ? record.unresolved_reason : '',
  }
}

// Historisches DDL der Kurationstabellen. Wird nur vom Unit-Test referenziert;
// die reale Quelle ist supabase/_pipeline/05_user_tabellen/051_curation_persistence.sql.
export function buildNutritionCurationPersistenceSql(): string {
  return `
CREATE TABLE IF NOT EXISTS nutrition.food_curation_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('category_assignment', 'display_name', 'alias', 'preference_item_mapping')),
  target_field text NOT NULL,
  proposed_value text NOT NULL DEFAULT '',
  proposed_value_id uuid NULL,
  source text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL DEFAULT 'local_curation_foundation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS food_curation_candidates_food_idx
  ON nutrition.food_curation_candidates(food_id);

CREATE INDEX IF NOT EXISTS food_curation_candidates_status_idx
  ON nutrition.food_curation_candidates(status);

CREATE TABLE IF NOT EXISTS nutrition.food_curation_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES nutrition.food_curation_candidates(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected', 'superseded')),
  reviewer text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS food_curation_decisions_candidate_idx
  ON nutrition.food_curation_decisions(candidate_id);
`
}

export async function getNutritionCurationData(options: NutritionCurationOptions = {}): Promise<NutritionCurationPayload> {
  const args = buildCurationRpcArgs(options)
  const { data, error } = await nutritionRpc().rpc('curation_overview', args)
  if (error) {
    throw new Error(
      isDbUnavailableMessage(error.message)
        ? `Nutrition database unavailable: ${error.message}`
        : `Curation overview query failed: ${error.message}`,
    )
  }

  const parsed = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const catalog = getNutritionPreferenceCatalog()
  const summary = summarizePreferenceCatalog(catalog)
  const unresolvedGroups = catalog.food_preference_groups.filter(group => group.mapping_status !== 'mapped')
  const unresolvedExclusions = catalog.general_exclusions.filter(item => item.mapping_status !== 'mapped')
  const unresolvedItems = catalog.food_preference_groups.flatMap(group =>
    group.items
      .filter(item => item.mapping_status !== 'mapped')
      .map(item => ({
        group_code: group.code,
        code: item.code,
        label_de: item.label_de,
        target_type: item.target_type,
        mapping_note: item.mapping_note,
      })),
  )

  return {
    checkedAt: new Date().toISOString(),
    environment: 'local',
    container: NUTRITION_DB_SOURCE,
    counts: {
      foods: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.foods),
      food_nutrients: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.food_nutrients),
      assigned_foods: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.assigned_foods),
      unassigned_foods: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.unassigned_foods),
      tag_definitions: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.tag_definitions),
      food_tags: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.food_tags),
      food_aliases: parseNumber((parsed.counts as Record<string, unknown> | undefined)?.food_aliases),
    },
    category_levels: Array.isArray(parsed.category_levels)
      ? parsed.category_levels.map(item => item as { level: number; count: number })
      : [],
    tag_coverage: Array.isArray(parsed.tag_coverage)
      ? parsed.tag_coverage.map(item => item as { code: string; name_de: string; food_count: number })
      : [],
    low_coverage_tags: Array.isArray(parsed.low_coverage_tags)
      ? parsed.low_coverage_tags.map(item => item as { code: string; name_de: string; food_count: number })
      : [],
    alias_coverage: {
      zero_alias_foods: parseNumber((parsed.alias_coverage as Record<string, unknown> | undefined)?.zero_alias_foods),
      one_alias_foods: parseNumber((parsed.alias_coverage as Record<string, unknown> | undefined)?.one_alias_foods),
      multi_alias_foods: parseNumber((parsed.alias_coverage as Record<string, unknown> | undefined)?.multi_alias_foods),
      german_umlaut_foods: parseNumber((parsed.alias_coverage as Record<string, unknown> | undefined)?.german_umlaut_foods),
      foods_with_en_source_label: parseNumber((parsed.alias_coverage as Record<string, unknown> | undefined)?.foods_with_en_source_label),
    },
    unassigned_examples: Array.isArray(parsed.unassigned_examples)
      ? parsed.unassigned_examples.flatMap(item => parseUnassignedFood(item) ?? [])
      : [],
    candidate_tables: {
      candidates_table_exists: (parsed.candidate_tables as Record<string, unknown> | undefined)?.candidates_table_exists === true,
      decisions_table_exists: (parsed.candidate_tables as Record<string, unknown> | undefined)?.decisions_table_exists === true,
      candidates: parseNumber((parsed.candidate_tables as Record<string, unknown> | undefined)?.candidates),
      pending_candidates: parseNumber((parsed.candidate_tables as Record<string, unknown> | undefined)?.pending_candidates),
      decisions: parseNumber((parsed.candidate_tables as Record<string, unknown> | undefined)?.decisions),
    },
    preference_mapping: {
      general_exclusions: {
        mapped: summary.mapped_general_exclusions,
        unresolved: summary.unresolved_general_exclusions,
        unresolved_codes: unresolvedExclusions.map(item => item.code),
      },
      food_preference_groups: {
        mapped: summary.mapped_food_preference_groups,
        unresolved: summary.unresolved_food_preference_groups,
        unresolved_codes: unresolvedGroups.map(group => group.code),
      },
      food_preference_items: {
        total: summary.food_preference_items,
        unresolved: summary.food_preference_items,
      },
      groups: catalog.food_preference_groups.map(group => ({
        code: group.code,
        label_de: group.label_de,
        mapping_status: group.mapping_status,
        target_type: group.target_type,
        mapped_target_type: group.mapped_target_type ?? '',
        mapped_codes: group.mapped_codes ?? [],
        mapping_note: group.mapping_note,
        unresolved_items: group.items.filter(item => item.mapping_status !== 'mapped').length,
      })),
      unresolved_items: unresolvedItems,
    },
    curation_policy: {
      ui_mode: 'read_only',
      display_names: 'source_backed_provisional_only',
      aliases: 'source_label_normalized_variants_only',
      writes_enabled: false,
    },
  }
}
