import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { getNutritionPreferenceCatalog, summarizePreferenceCatalog } from './preferences-catalog'

const execFileAsync = promisify(execFile)
const LOCAL_DB_CONTAINER = 'supabase_db_LumeOS-Claude-V1'

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

function escapeSql(value: string): string {
  return value.replace(/'/g, "''")
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

export function buildNutritionCurationSql(options: NutritionCurationOptions = {}): string {
  const normalized = normalizeOptions(options)
  const filters = [
    normalized.unassignedOnly ? 'f.category_id IS NULL' : 'TRUE',
    normalized.category ? `fc.slug = '${escapeSql(normalized.category)}'` : 'TRUE',
    normalized.tag ? `EXISTS (SELECT 1 FROM nutrition.food_tags ft_filter WHERE ft_filter.food_id = f.id AND ft_filter.tag_code = '${escapeSql(normalized.tag)}')` : 'TRUE',
    normalized.aliasState === 'has' ? 'COALESCE(alias.alias_count, 0) > 0' : normalized.aliasState === 'missing' ? 'COALESCE(alias.alias_count, 0) = 0' : 'TRUE',
  ].join('\n    AND ')
  const orderBy = normalized.sort === 'sort_weight_desc'
    ? 'f.sort_weight DESC NULLS LAST, source_label ASC'
    : normalized.sort === 'name_asc'
      ? 'source_label ASC'
      : normalized.sort === 'macro_relevance'
        ? 'COALESCE(m.prot625, 0) DESC, COALESCE(m.enercc, 0) DESC, source_label ASC'
        : 'CASE WHEN f.category_id IS NULL THEN 0 ELSE 1 END, f.sort_weight DESC NULLS LAST, source_label ASC'

  return `
WITH category_levels AS (
  SELECT level, COUNT(*)::int AS count
  FROM nutrition.food_categories
  GROUP BY level
  ORDER BY level
),
tag_coverage AS (
  SELECT td.code, td.name_de, COUNT(ft.food_id)::int AS food_count
  FROM nutrition.tag_definitions td
  LEFT JOIN nutrition.food_tags ft ON ft.tag_code = td.code
  GROUP BY td.code, td.name_de
  ORDER BY food_count DESC, td.code
),
alias_counts AS (
  SELECT f.id, COUNT(fa.alias)::int AS alias_count
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_aliases fa ON fa.food_id = f.id
  GROUP BY f.id
),
unassigned AS (
  SELECT
    f.id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    fc.slug AS current_category_slug,
    fc.name_de AS current_category_name_de,
    f.sort_weight,
    COALESCE(alias.alias_count, 0)::int AS alias_count,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    m.enercc::text,
    m.prot625::text,
    m.fat::text,
    m.cho::text
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS alias_count FROM nutrition.food_aliases fa WHERE fa.food_id = f.id
  ) alias ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY ft.tag_code) AS tags FROM nutrition.food_tags ft WHERE ft.food_id = f.id
  ) tags ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn WHERE fn.food_id = f.id
  ) m ON TRUE
  WHERE ${filters}
  ORDER BY ${orderBy}
  LIMIT 50
)
SELECT json_build_object(
  'counts', json_build_object(
    'foods', (SELECT COUNT(*)::int FROM nutrition.foods),
    'food_nutrients', (SELECT COUNT(*)::int FROM nutrition.food_nutrients),
    'assigned_foods', (SELECT COUNT(*)::int FROM nutrition.foods WHERE category_id IS NOT NULL),
    'unassigned_foods', (SELECT COUNT(*)::int FROM nutrition.foods WHERE category_id IS NULL),
    'tag_definitions', (SELECT COUNT(*)::int FROM nutrition.tag_definitions),
    'food_tags', (SELECT COUNT(*)::int FROM nutrition.food_tags),
    'food_aliases', (SELECT COUNT(*)::int FROM nutrition.food_aliases)
  ),
  'category_levels', COALESCE((SELECT json_agg(json_build_object('level', level, 'count', count)) FROM category_levels), '[]'::json),
  'tag_coverage', COALESCE((SELECT json_agg(json_build_object('code', code, 'name_de', name_de, 'food_count', food_count)) FROM tag_coverage), '[]'::json),
  'low_coverage_tags', COALESCE((SELECT json_agg(json_build_object('code', code, 'name_de', name_de, 'food_count', food_count)) FROM tag_coverage WHERE food_count <= 5), '[]'::json),
  'alias_coverage', json_build_object(
    'zero_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count = 0),
    'one_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count = 1),
    'multi_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count > 1),
    'german_umlaut_foods', (SELECT COUNT(*)::int FROM nutrition.foods WHERE name_de ~ '[äöüÄÖÜß]'),
    'foods_with_en_source_label', (SELECT COUNT(*)::int FROM nutrition.foods WHERE COALESCE(NULLIF(name_en, ''), '') <> '')
  ),
  'candidate_tables', json_build_object(
    'candidates_table_exists', to_regclass('nutrition.food_curation_candidates') IS NOT NULL,
    'decisions_table_exists', to_regclass('nutrition.food_curation_decisions') IS NOT NULL,
    'candidates', CASE WHEN to_regclass('nutrition.food_curation_candidates') IS NULL THEN 0 ELSE (SELECT COUNT(*)::int FROM nutrition.food_curation_candidates) END,
    'pending_candidates', CASE WHEN to_regclass('nutrition.food_curation_candidates') IS NULL THEN 0 ELSE (SELECT COUNT(*)::int FROM nutrition.food_curation_candidates WHERE status = 'pending') END,
    'decisions', CASE WHEN to_regclass('nutrition.food_curation_decisions') IS NULL THEN 0 ELSE (SELECT COUNT(*)::int FROM nutrition.food_curation_decisions) END
  ),
  'unassigned_examples', COALESCE((SELECT json_agg(json_build_object(
    'id', id,
    'bls_code', bls_code,
    'source_label', source_label,
    'current_category_slug', COALESCE(current_category_slug, ''),
    'current_category_name_de', COALESCE(current_category_name_de, ''),
    'sort_weight', COALESCE(sort_weight, 0),
    'alias_count', alias_count,
    'tags', tags,
    'enercc', enercc,
    'prot625', prot625,
    'fat', fat,
    'cho', cho,
    'curation_status', CASE WHEN current_category_slug IS NULL THEN 'needs_curation' ELSE 'categorized' END,
    'unresolved_reason', CASE WHEN current_category_slug IS NULL THEN 'No deterministic category_id is assigned yet.' ELSE '' END
  )) FROM unassigned), '[]'::json)
)::text AS payload;
`
}

export async function getNutritionCurationData(options: NutritionCurationOptions = {}): Promise<NutritionCurationPayload> {
  const { stdout } = await execFileAsync('docker', [
    'exec',
    LOCAL_DB_CONTAINER,
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-At',
    '-c',
    buildNutritionCurationSql(options),
  ], { maxBuffer: 1024 * 1024 * 10 })
  const parsed = JSON.parse(stdout.trim()) as Record<string, unknown>
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
    container: LOCAL_DB_CONTAINER,
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
