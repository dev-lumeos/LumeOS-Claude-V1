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
  unassigned_examples: CurationUnassignedFood[]
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
  }
  curation_policy: {
    ui_mode: 'read_only'
    display_names: 'source_backed_provisional_only'
    aliases: 'source_label_normalized_variants_only'
    writes_enabled: false
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
  }
}

export function buildNutritionCurationSql(): string {
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
unassigned AS (
  SELECT
    f.id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    COALESCE(alias.alias_count, 0)::int AS alias_count,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    m.enercc::text,
    m.prot625::text,
    m.fat::text,
    m.cho::text
  FROM nutrition.foods f
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
  WHERE f.category_id IS NULL
  ORDER BY f.bls_code
  LIMIT 25
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
  'unassigned_examples', COALESCE((SELECT json_agg(json_build_object(
    'id', id,
    'bls_code', bls_code,
    'source_label', source_label,
    'alias_count', alias_count,
    'tags', tags,
    'enercc', enercc,
    'prot625', prot625,
    'fat', fat,
    'cho', cho
  )) FROM unassigned), '[]'::json)
)::text AS payload;
`
}

export async function getNutritionCurationData(): Promise<NutritionCurationPayload> {
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
    buildNutritionCurationSql(),
  ], { maxBuffer: 1024 * 1024 * 10 })
  const parsed = JSON.parse(stdout.trim()) as Record<string, unknown>
  const catalog = getNutritionPreferenceCatalog()
  const summary = summarizePreferenceCatalog(catalog)
  const unresolvedGroups = catalog.food_preference_groups.filter(group => group.mapping_status !== 'mapped')
  const unresolvedExclusions = catalog.general_exclusions.filter(item => item.mapping_status !== 'mapped')

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
    unassigned_examples: Array.isArray(parsed.unassigned_examples)
      ? parsed.unassigned_examples.flatMap(item => parseUnassignedFood(item) ?? [])
      : [],
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
    },
    curation_policy: {
      ui_mode: 'read_only',
      display_names: 'source_backed_provisional_only',
      aliases: 'source_label_normalized_variants_only',
      writes_enabled: false,
    },
  }
}
