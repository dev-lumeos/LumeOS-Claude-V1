export type SafeCategoryRuleCandidate = {
  rule: string
  evidence: string
  estimatedCoverage: number
  action: 'report_only' | 'safe_for_future_apply'
  reason: string
}

export type AliasCoverageSummary = {
  foods: number
  aliases: number
  zeroAliasFoods: number
  oneAliasFoods: number
  multiAliasFoods: number
  foodsWithGermanUmlauts: number
  foodsWithEnglishSourceLabels: number
}

export function buildCategoryCoverageAnalysisSql(): string {
  return `
WITH unassigned AS (
  SELECT
    f.id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    f.sort_weight,
    LEFT(f.bls_code, 1) AS prefix_1,
    LEFT(f.bls_code, 2) AS prefix_2
  FROM nutrition.foods f
  WHERE f.category_id IS NULL
),
prefix_1 AS (
  SELECT prefix_1, COUNT(*)::int AS food_count
  FROM unassigned
  GROUP BY prefix_1
  ORDER BY food_count DESC, prefix_1
),
prefix_2 AS (
  SELECT prefix_2, COUNT(*)::int AS food_count,
    array_agg(bls_code || ' ' || source_label ORDER BY sort_weight DESC, source_label ASC)[:5] AS examples
  FROM unassigned
  GROUP BY prefix_2
  ORDER BY food_count DESC, prefix_2
  LIMIT 30
),
label_patterns AS (
  SELECT lower(split_part(source_label, ' ', 1)) AS pattern, COUNT(*)::int AS food_count
  FROM unassigned
  GROUP BY pattern
  HAVING COUNT(*) >= 10
  ORDER BY food_count DESC, pattern
  LIMIT 30
)
SELECT json_build_object(
  'counts', json_build_object(
    'foods', (SELECT COUNT(*)::int FROM nutrition.foods),
    'categorized_foods', (SELECT COUNT(*)::int FROM nutrition.foods WHERE category_id IS NOT NULL),
    'unassigned_foods', (SELECT COUNT(*)::int FROM nutrition.foods WHERE category_id IS NULL)
  ),
  'category_levels', (
    SELECT COALESCE(json_agg(json_build_object('level', level, 'count', count) ORDER BY level), '[]'::json)
    FROM (
      SELECT level, COUNT(*)::int AS count
      FROM nutrition.food_categories
      GROUP BY level
    ) levels
  ),
  'unassigned_by_prefix_1', COALESCE((SELECT json_agg(json_build_object('prefix', prefix_1, 'food_count', food_count)) FROM prefix_1), '[]'::json),
  'top_unassigned_prefix_2', COALESCE((SELECT json_agg(json_build_object('prefix', prefix_2, 'food_count', food_count, 'examples', examples)) FROM prefix_2), '[]'::json),
  'top_label_patterns', COALESCE((SELECT json_agg(json_build_object('pattern', pattern, 'food_count', food_count)) FROM label_patterns), '[]'::json)
)::text AS payload;
`
}

export function buildAliasCoverageAnalysisSql(): string {
  return `
WITH alias_counts AS (
  SELECT f.id, COUNT(fa.alias)::int AS alias_count
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_aliases fa ON fa.food_id = f.id
  GROUP BY f.id
),
alias_source_counts AS (
  SELECT source, COUNT(*)::int AS alias_count
  FROM nutrition.food_aliases
  GROUP BY source
  ORDER BY source
),
alias_locale_counts AS (
  SELECT locale, COUNT(*)::int AS alias_count
  FROM nutrition.food_aliases
  GROUP BY locale
  ORDER BY locale
)
SELECT json_build_object(
  'counts', json_build_object(
    'foods', (SELECT COUNT(*)::int FROM nutrition.foods),
    'aliases', (SELECT COUNT(*)::int FROM nutrition.food_aliases),
    'zero_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count = 0),
    'one_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count = 1),
    'multi_alias_foods', (SELECT COUNT(*)::int FROM alias_counts WHERE alias_count > 1),
    'foods_with_german_umlauts', (SELECT COUNT(*)::int FROM nutrition.foods WHERE name_de ~ '[äöüÄÖÜß]'),
    'foods_with_english_source_labels', (SELECT COUNT(*)::int FROM nutrition.foods WHERE COALESCE(NULLIF(name_en, ''), '') <> '')
  ),
  'alias_sources', COALESCE((SELECT json_agg(json_build_object('source', source, 'alias_count', alias_count)) FROM alias_source_counts), '[]'::json),
  'alias_locales', COALESCE((SELECT json_agg(json_build_object('locale', locale, 'alias_count', alias_count)) FROM alias_locale_counts), '[]'::json)
)::text AS payload;
`
}

export function candidateCategoryRules(): SafeCategoryRuleCandidate[] {
  return [
    {
      rule: 'V2xxxx -> Wild/game meat category',
      evidence: 'SPEC_05 lists game meat under the meat hierarchy and associates Wild with V2 BLS code patterns.',
      estimatedCoverage: 49,
      action: 'safe_for_future_apply',
      reason: 'The prefix is source-backed, but this analysis batch does not mutate category_id. Apply in a separate governed mapping batch after target slug verification.',
    },
    {
      rule: 'X/Y prepared dish prefixes -> prepared-dish subcategories',
      evidence: 'SPEC_05 identifies prepared dishes as Human Layer categories, but prepared X/Y rows require BLS name, code, and category context.',
      estimatedCoverage: 2050,
      action: 'report_only',
      reason: 'Prepared dish mapping is not a single deterministic prefix rule; automatic assignment would risk source-unbacked category guesses.',
    },
  ]
}

export function summarizeAliasCoverage(summary: AliasCoverageSummary): {
  canApplySafeExpansion: boolean
  reason: string
} {
  if (summary.zeroAliasFoods > 0 || summary.oneAliasFoods > 0) {
    return {
      canApplySafeExpansion: true,
      reason: 'Some foods lack the current source-backed alias baseline and can be reviewed for deterministic variants.',
    }
  }

  return {
    canApplySafeExpansion: false,
    reason: 'Every food already has multiple source-backed aliases; further synonyms or common names require human curation.',
  }
}
