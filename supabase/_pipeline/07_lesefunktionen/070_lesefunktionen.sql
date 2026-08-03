-- =============================================================
-- 070 — Lesefunktionen für apps/web (M1 Teil C)
-- Datum: 2026-08-03 · Anker: e61f201
-- Zweck: Die vier gewachsenen Lese-Abfragen aus
--        apps/web/src/lib/nutrition/ (Food-Suche, Kategoriebaum,
--        Präferenz-Preview, Kurations-Übersicht, Schema-Debug) als
--        Postgres-Funktionen, gerufen per PostgREST rpc().
--        Fachlogik gehört in den Kettenschritt, nicht in den
--        Anwendungscode (docs/spezifikation/10-plattform/datenzugriff §8).
-- Herkunft: 1:1-Port der SQL-Builder aus
--        food-search.ts (buildLocalFoodSearchSql, buildLocalFoodCategoriesSql),
--        preference-search-preview.ts (buildPreferencePreviewSql),
--        curation.ts (buildNutritionCurationSql),
--        local-schema-debug.ts (LOCAL_SCHEMA_SQL) — Stand e61f201.
--        String-Interpolation wurde durch Parameter ersetzt; Tokenisierung
--        und Katalog-Auflösung bleiben im TypeScript (eine Quelle je Regel).
-- Idempotent: CREATE OR REPLACE; Grants wiederholbar. Läuft NACH 060.
-- Sicherheit: SECURITY INVOKER (Default) — Rechte und RLS des Aufrufers
--        gelten. EXECUTE nur für authenticated und service_role;
--        PUBLIC wird ausdrücklich entzogen (anon scheitert ohnehin am
--        fehlenden USAGE auf dem Schema).
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 0. Faltungs-Helfer — identisch zur Blob-Faltung der TS-Builder
--    (nur Umlaute/ß; die volle Normalisierung der Suchtokens
--    passiert weiterhin im TypeScript).
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.search_fold(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(replace(replace(replace(lower(coalesce(t, '')), 'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss')
$$;

-- -------------------------------------------------------------
-- 1. food_search — Port von buildLocalFoodSearchSql().
--    p_tokens: bereits normalisierte Suchtokens (max. 6, aus TS).
--    Rückgabe: das identische JSON-Payload wie bisher.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.food_search(
  p_query text,
  p_normalized_query text,
  p_tokens text[],
  p_selected_food_id uuid,
  p_category_slug text,
  p_category_id uuid,
  p_tag_code text,
  p_sort text,
  p_limit integer,
  p_offset integer
)
RETURNS json
LANGUAGE sql
STABLE
AS $fn$
WITH params AS (
  SELECT
    LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100) AS lim,
    GREATEST(COALESCE(p_offset, 0), 0) AS off,
    CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc','name_asc') THEN p_sort ELSE 'relevance' END AS sort
),
matching_foods AS (
  SELECT
    f.id,
    f.bls_code,
    f.name_de,
    f.name_en,
    f.name_th,
    f.name_display,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    CASE
      WHEN p_tokens IS NULL OR cardinality(p_tokens) = 0 THEN 0.5
      WHEN lower(COALESCE(f.name_de, '')) = lower(p_query) THEN 1.0
      WHEN lower(COALESCE(f.name_de, '')) LIKE lower(p_query) || '%' THEN 0.85
      ELSE 0.65
    END AS text_rank,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn
    WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY td.sort_order, ft.tag_code) AS tags
    FROM nutrition.food_tags ft
    JOIN nutrition.tag_definitions td ON td.code = ft.tag_code
    WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE
    (p_tokens IS NULL OR cardinality(p_tokens) = 0 OR NOT EXISTS (
      SELECT 1 FROM unnest(p_tokens) AS t(tok)
      WHERE NOT (
        nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || tok || '%'
        OR EXISTS (
          SELECT 1 FROM nutrition.food_aliases fa
          WHERE fa.food_id = f.id
            AND nutrition.search_fold(fa.alias) LIKE '%' || tok || '%'
        )
      )
    ))
    AND (
      (COALESCE(p_category_slug, '') = '' AND p_category_id IS NULL)
      OR EXISTS (
        SELECT 1
        FROM nutrition.food_categories selected_category
        JOIN nutrition.food_categories assigned_category ON assigned_category.id = f.category_id
        WHERE (CASE
                 WHEN p_category_id IS NOT NULL THEN selected_category.id = p_category_id
                 ELSE selected_category.slug = p_category_slug
               END)
          AND (
            assigned_category.slug = selected_category.slug
            OR assigned_category.parent_id = selected_category.id
            OR assigned_category.parent_id IN (
              SELECT child.id FROM nutrition.food_categories child WHERE child.parent_id = selected_category.id
            )
            OR assigned_category.parent_id IN (
              SELECT grandchild.id
              FROM nutrition.food_categories child
              JOIN nutrition.food_categories grandchild ON grandchild.parent_id = child.id
              WHERE child.parent_id = selected_category.id
            )
          )
      )
    )
    AND (
      COALESCE(p_tag_code, '') = ''
      OR EXISTS (
        SELECT 1 FROM nutrition.food_tags selected_tag
        WHERE selected_tag.food_id = f.id
          AND selected_tag.tag_code = p_tag_code
      )
    )
  ORDER BY
    CASE WHEN (SELECT sort FROM params) = 'protein_desc' THEN COALESCE(m.prot625, 0) END DESC,
    CASE WHEN (SELECT sort FROM params) = 'kcal_asc' THEN COALESCE(m.enercc, 999999) END ASC,
    CASE WHEN (SELECT sort FROM params) = 'relevance' THEN
      CASE
        WHEN p_tokens IS NULL OR cardinality(p_tokens) = 0 THEN 0.5
        WHEN lower(COALESCE(f.name_de, '')) = lower(p_query) THEN 1.0
        WHEN lower(COALESCE(f.name_de, '')) LIKE lower(p_query) || '%' THEN 0.85
        ELSE 0.65
      END
    END DESC,
    CASE WHEN (SELECT sort FROM params) IN ('relevance', 'protein_desc') THEN f.sort_weight END DESC NULLS LAST,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) ASC,
    f.bls_code ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params)
),
all_matching_food_ids AS (
  SELECT f.id
  FROM nutrition.foods f
  WHERE
    (p_tokens IS NULL OR cardinality(p_tokens) = 0 OR NOT EXISTS (
      SELECT 1 FROM unnest(p_tokens) AS t(tok)
      WHERE NOT (
        nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || tok || '%'
        OR EXISTS (
          SELECT 1 FROM nutrition.food_aliases fa
          WHERE fa.food_id = f.id
            AND nutrition.search_fold(fa.alias) LIKE '%' || tok || '%'
        )
      )
    ))
    AND (
      (COALESCE(p_category_slug, '') = '' AND p_category_id IS NULL)
      OR EXISTS (
        SELECT 1
        FROM nutrition.food_categories selected_category
        JOIN nutrition.food_categories assigned_category ON assigned_category.id = f.category_id
        WHERE (CASE
                 WHEN p_category_id IS NOT NULL THEN selected_category.id = p_category_id
                 ELSE selected_category.slug = p_category_slug
               END)
          AND (
            assigned_category.slug = selected_category.slug
            OR assigned_category.parent_id = selected_category.id
            OR assigned_category.parent_id IN (
              SELECT child.id FROM nutrition.food_categories child WHERE child.parent_id = selected_category.id
            )
            OR assigned_category.parent_id IN (
              SELECT grandchild.id
              FROM nutrition.food_categories child
              JOIN nutrition.food_categories grandchild ON grandchild.parent_id = child.id
              WHERE child.parent_id = selected_category.id
            )
          )
      )
    )
    AND (
      COALESCE(p_tag_code, '') = ''
      OR EXISTS (
        SELECT 1 FROM nutrition.food_tags selected_tag
        WHERE selected_tag.food_id = f.id
          AND selected_tag.tag_code = p_tag_code
      )
    )
),
selected_food AS (
  SELECT
    f.id,
    f.bls_code,
    f.name_de,
    f.name_en,
    f.name_th,
    f.name_display,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn
    WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY td.sort_order, ft.tag_code) AS tags
    FROM nutrition.food_tags ft
    JOIN nutrition.tag_definitions td ON td.code = ft.tag_code
    WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE f.id = COALESCE(p_selected_food_id, (SELECT id FROM matching_foods LIMIT 1))
  LIMIT 1
),
selected_food_json AS (
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM selected_food) THEN (
      SELECT json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'source_label_marker', 'bls_source_label_not_final_display_name',
        'name_display', name_display,
        'name_display_en', name_display_en,
        'name_display_th', name_display_th,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_id', category_id,
        'category_slug', category_slug,
        'category_name_de', category_name_de,
        'sort_weight', sort_weight,
        'enercc', enercc::text,
        'prot625', prot625::text,
        'fat', fat::text,
        'cho', cho::text,
        'tags', tags
      )
      FROM selected_food
    )
    ELSE NULL::json
  END AS value
),
nutrients_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'nutrient_code', fn.nutrient_code,
        'name_de', nd.name_de,
        'name_en', nd.name_en,
        'unit', nd.unit,
        'value', fn.value::text,
        'data_source', COALESCE(fn.data_source, 'BLS')
      )
      ORDER BY
        CASE fn.nutrient_code
          WHEN 'ENERCJ' THEN 1
          WHEN 'ENERCC' THEN 2
          WHEN 'PROT625' THEN 3
          WHEN 'FAT' THEN 4
          WHEN 'CHO' THEN 5
          WHEN 'FIBT' THEN 6
          WHEN 'SUGAR' THEN 7
          WHEN 'NA' THEN 8
          ELSE 50
        END,
        nd.sort_index,
        fn.nutrient_code
    ),
    '[]'::json
  ) AS value
  FROM selected_food sf
  JOIN nutrition.food_nutrients fn ON fn.food_id = sf.id
  JOIN nutrition.nutrient_defs nd ON nd.code = fn.nutrient_code
),
categories_json AS (
  SELECT COALESCE(json_agg(json_build_object(
    'slug', slug,
    'name_de', name_de,
    'level', level,
    'count', food_count
  ) ORDER BY level, sort_order, name_de), '[]'::json) AS value
  FROM (
    SELECT fc.slug, fc.name_de, fc.level, fc.sort_order, COUNT(f.id)::int AS food_count
    FROM nutrition.food_categories fc
    JOIN nutrition.foods f ON f.category_id = fc.id
    WHERE fc.level IN (1,2)
    GROUP BY fc.slug, fc.name_de, fc.level, fc.sort_order
    ORDER BY fc.level, fc.sort_order
    LIMIT 40
  ) category_counts
),
tags_json AS (
  SELECT COALESCE(json_agg(json_build_object(
    'code', code,
    'name_de', name_de,
    'count', food_count
  ) ORDER BY sort_order, name_de), '[]'::json) AS value
  FROM (
    SELECT td.code, td.name_de, td.sort_order, COUNT(ft.food_id)::int AS food_count
    FROM nutrition.tag_definitions td
    JOIN nutrition.food_tags ft ON ft.tag_code = td.code
    GROUP BY td.code, td.name_de, td.sort_order
    ORDER BY td.sort_order
  ) tag_counts
)
SELECT json_build_object(
  'query', COALESCE(p_query, ''),
  'normalized_query', COALESCE(p_normalized_query, ''),
  'category', COALESCE(p_category_slug, ''),
  'category_id', COALESCE(p_category_id::text, ''),
  'tag', COALESCE(p_tag_code, ''),
  'sort', (SELECT sort FROM params),
  'limit', (SELECT lim FROM params),
  'offset', (SELECT off FROM params),
  'total', (SELECT COUNT(*)::int FROM all_matching_food_ids),
  'result_count', (SELECT COUNT(*)::int FROM matching_foods),
  'foods', COALESCE((
    SELECT json_agg(
      json_build_object(
        'id', id,
        'bls_code', bls_code,
        'source_label', source_label,
        'source_label_marker', 'bls_source_label_not_final_display_name',
        'name_display', name_display,
        'name_display_en', name_display_en,
        'name_display_th', name_display_th,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'category_id', category_id,
        'category_slug', category_slug,
        'category_name_de', category_name_de,
        'sort_weight', sort_weight,
        'enercc', enercc::text,
        'prot625', prot625::text,
        'fat', fat::text,
        'cho', cho::text,
        'tags', tags
      )
    )
    FROM matching_foods
  ), '[]'::json),
  'selected_food', (SELECT value FROM selected_food_json),
  'nutrients', (SELECT value FROM nutrients_json),
  'categories', (SELECT value FROM categories_json),
  'tags', (SELECT value FROM tags_json)
)
$fn$;

-- -------------------------------------------------------------
-- 2. food_categories_tree — Port von buildLocalFoodCategoriesSql().
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.food_categories_tree()
RETURNS json
LANGUAGE sql
STABLE
AS $fn$
WITH category_counts AS (
  SELECT category_id, COUNT(*)::int AS food_count
  FROM nutrition.foods
  WHERE category_id IS NOT NULL
  GROUP BY category_id
),
nodes AS (
  SELECT
    fc.id,
    fc.slug,
    fc.name_de,
    fc.name_en,
    COALESCE(fc.name_th, '') AS name_th,
    fc.parent_id,
    fc.level,
    fc.sort_order,
    COALESCE(cc.food_count, 0) AS direct_count
  FROM nutrition.food_categories fc
  LEFT JOIN category_counts cc ON cc.category_id = fc.id
),
level4 AS (
  SELECT n.*, '[]'::json AS children, n.direct_count AS subtree_count
  FROM nodes n
  WHERE n.level = 4
),
level3 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level4 c ON c.parent_id = n.id
  WHERE n.level = 3
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
),
level2 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level3 c ON c.parent_id = n.id
  WHERE n.level = 2
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
),
level1 AS (
  SELECT
    n.*,
    COALESCE(json_agg(json_build_object(
      'id', c.id,
      'slug', c.slug,
      'name_de', c.name_de,
      'name_en', c.name_en,
      'name_th', c.name_th,
      'level', c.level,
      'sort_order', c.sort_order,
      'count', c.subtree_count,
      'children', c.children
    ) ORDER BY c.sort_order, c.name_de) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
    n.direct_count + COALESCE(SUM(c.subtree_count), 0)::int AS subtree_count
  FROM nodes n
  LEFT JOIN level2 c ON c.parent_id = n.id
  WHERE n.level = 1
  GROUP BY n.id, n.slug, n.name_de, n.name_en, n.name_th, n.parent_id, n.level, n.sort_order, n.direct_count
)
SELECT COALESCE(json_agg(json_build_object(
  'id', id,
  'slug', slug,
  'name_de', name_de,
  'name_en', name_en,
  'name_th', name_th,
  'level', level,
  'sort_order', sort_order,
  'count', subtree_count,
  'children', children
) ORDER BY sort_order, name_de), '[]'::json)
FROM level1
$fn$;

-- -------------------------------------------------------------
-- 3. preference_search_preview — Port von buildPreferencePreviewSql().
--    Katalog-Auflösung (Exclusion-Presets → Kategorie-Slugs) bleibt im
--    TypeScript; die Funktion erhält fertige Slug-/Tag-Arrays.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.preference_search_preview(
  p_query text,
  p_normalized_query text,
  p_tokens text[],
  p_excluded_category_slugs text[],
  p_liked_category_slugs text[],
  p_disliked_category_slugs text[],
  p_liked_tags text[],
  p_disliked_tags text[],
  p_sort text,
  p_limit integer,
  p_offset integer
)
RETURNS json
LANGUAGE sql
STABLE
AS $fn$
WITH RECURSIVE excluded_categories AS (
  SELECT id, slug FROM nutrition.food_categories
  WHERE slug = ANY(COALESCE(p_excluded_category_slugs, ARRAY[]::text[]))
  UNION ALL
  SELECT child.id, child.slug
  FROM nutrition.food_categories child
  JOIN excluded_categories parent ON child.parent_id = parent.id
),
liked_categories AS (
  SELECT id, slug FROM nutrition.food_categories
  WHERE slug = ANY(COALESCE(p_liked_category_slugs, ARRAY[]::text[]))
  UNION ALL
  SELECT child.id, child.slug FROM nutrition.food_categories child JOIN liked_categories parent ON child.parent_id = parent.id
),
disliked_categories AS (
  SELECT id, slug FROM nutrition.food_categories
  WHERE slug = ANY(COALESCE(p_disliked_category_slugs, ARRAY[]::text[]))
  UNION ALL
  SELECT child.id, child.slug FROM nutrition.food_categories child JOIN disliked_categories parent ON child.parent_id = parent.id
),
base AS (
  SELECT
    f.id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    f.sort_weight,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    m.enercc,
    m.prot625,
    m.fat,
    m.cho,
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    1 AS text_rank,
    CASE WHEN lc.id IS NOT NULL THEN 50 ELSE 0 END
      + CASE WHEN dc.id IS NOT NULL THEN -50 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_liked_tags, ARRAY[]::text[]) THEN 30 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_disliked_tags, ARRAY[]::text[]) THEN -30 ELSE 0 END AS preference_score,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN lc.id IS NOT NULL THEN 'liked_category' END,
      CASE WHEN dc.id IS NOT NULL THEN 'disliked_category' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_liked_tags, ARRAY[]::text[]) THEN 'liked_tag' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_disliked_tags, ARRAY[]::text[]) THEN 'disliked_tag' END
    ], NULL) AS preference_notes,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN lc.id IS NOT NULL THEN 'boosted because selected liked category includes this food category' END,
      CASE WHEN dc.id IS NOT NULL THEN 'suppressed because selected disliked category includes this food category' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_liked_tags, ARRAY[]::text[]) THEN 'boosted because food has a selected liked tag' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_disliked_tags, ARRAY[]::text[]) THEN 'suppressed because food has a selected disliked tag' END
    ], NULL) AS preference_reasons
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN excluded_categories ec ON ec.id = f.category_id
  LEFT JOIN liked_categories lc ON lc.id = f.category_id
  LEFT JOIN disliked_categories dc ON dc.id = f.category_id
  LEFT JOIN LATERAL (
    SELECT
      MAX(value) FILTER (WHERE nutrient_code='ENERCC') AS enercc,
      MAX(value) FILTER (WHERE nutrient_code='PROT625') AS prot625,
      MAX(value) FILTER (WHERE nutrient_code='FAT') AS fat,
      MAX(value) FILTER (WHERE nutrient_code='CHO') AS cho
    FROM nutrition.food_nutrients fn WHERE fn.food_id = f.id
  ) m ON TRUE
  LEFT JOIN LATERAL (
    SELECT array_agg(ft.tag_code ORDER BY ft.tag_code) AS tags
    FROM nutrition.food_tags ft WHERE ft.food_id = f.id
  ) tags ON TRUE
  WHERE
    (p_tokens IS NULL OR cardinality(p_tokens) = 0 OR NOT EXISTS (
      SELECT 1 FROM unnest(p_tokens) AS t(tok)
      WHERE NOT (
        nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || tok || '%'
        OR EXISTS (
          SELECT 1 FROM nutrition.food_aliases fa
          WHERE fa.food_id = f.id
            AND nutrition.search_fold(fa.alias) LIKE '%' || tok || '%'
        )
      )
    ))
    AND ec.id IS NULL
),
excluded_count AS (
  SELECT COUNT(*) AS count
  FROM nutrition.foods f
  JOIN excluded_categories ec ON ec.id = f.category_id
  WHERE
    (p_tokens IS NULL OR cardinality(p_tokens) = 0 OR NOT EXISTS (
      SELECT 1 FROM unnest(p_tokens) AS t(tok)
      WHERE NOT (
        nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || tok || '%'
        OR EXISTS (
          SELECT 1 FROM nutrition.food_aliases fa
          WHERE fa.food_id = f.id
            AND nutrition.search_fold(fa.alias) LIKE '%' || tok || '%'
        )
      )
    ))
),
ranked AS (
  SELECT * FROM base
  ORDER BY
    CASE WHEN COALESCE(p_sort, 'relevance') = 'protein_desc' THEN COALESCE(prot625, 0) END DESC,
    CASE WHEN COALESCE(p_sort, 'relevance') = 'kcal_asc' THEN COALESCE(enercc, 999999) END ASC,
    CASE WHEN COALESCE(p_sort, 'relevance') = 'relevance' THEN text_rank END DESC,
    CASE WHEN COALESCE(p_sort, 'relevance') IN ('relevance', 'protein_desc', 'kcal_asc') THEN preference_score END DESC,
    CASE WHEN COALESCE(p_sort, 'relevance') = 'relevance' THEN sort_weight END DESC NULLS LAST,
    source_label ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0)
)
SELECT json_build_object(
  'query', COALESCE(p_query, ''),
  'normalized_query', COALESCE(p_normalized_query, ''),
  'total', (SELECT COUNT(*) FROM base),
  'excluded_count', (SELECT count FROM excluded_count),
  'boosted_count', (SELECT COUNT(*) FROM base WHERE preference_score > 0),
  'suppressed_count', (SELECT COUNT(*) FROM base WHERE preference_score < 0),
  'foods', COALESCE((SELECT json_agg(json_build_object(
    'id', id,
    'bls_code', bls_code,
    'source_label', source_label,
    'category_slug', category_slug,
    'category_name_de', category_name_de,
    'enercc', enercc::text,
    'prot625', prot625::text,
    'fat', fat::text,
    'cho', cho::text,
    'tags', tags,
    'preference_score', preference_score,
    'preference_notes', preference_notes,
    'preference_reasons', preference_reasons
  )) FROM ranked), '[]'::json)
)
$fn$;

-- -------------------------------------------------------------
-- 4. curation_overview — Port von buildNutritionCurationSql().
--    LIMIT 50 für unassigned_examples bleibt fest (wie bisher).
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.curation_overview(
  p_unassigned_only boolean,
  p_category text,
  p_tag text,
  p_alias_state text,
  p_sort text
)
RETURNS json
LANGUAGE sql
STABLE
AS $fn$
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
  WHERE
    (NOT COALESCE(p_unassigned_only, TRUE) OR f.category_id IS NULL)
    AND (COALESCE(p_category, '') = '' OR fc.slug = p_category)
    AND (COALESCE(p_tag, '') = '' OR EXISTS (
      SELECT 1 FROM nutrition.food_tags ft_filter
      WHERE ft_filter.food_id = f.id AND ft_filter.tag_code = p_tag
    ))
    AND (
      COALESCE(p_alias_state, '') NOT IN ('has', 'missing')
      OR (p_alias_state = 'has' AND COALESCE(alias.alias_count, 0) > 0)
      OR (p_alias_state = 'missing' AND COALESCE(alias.alias_count, 0) = 0)
    )
  ORDER BY
    CASE WHEN COALESCE(p_sort, 'category_missing_first') NOT IN ('sort_weight_desc','name_asc','macro_relevance')
         THEN CASE WHEN f.category_id IS NULL THEN 0 ELSE 1 END END ASC,
    CASE WHEN p_sort = 'macro_relevance' THEN COALESCE(m.prot625, 0) END DESC,
    CASE WHEN p_sort = 'macro_relevance' THEN COALESCE(m.enercc, 0) END DESC,
    CASE WHEN p_sort = 'sort_weight_desc'
           OR COALESCE(p_sort, 'category_missing_first') NOT IN ('sort_weight_desc','name_asc','macro_relevance')
         THEN f.sort_weight END DESC NULLS LAST,
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) ASC
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
)
$fn$;

-- -------------------------------------------------------------
-- 5. schema_debug — Port von LOCAL_SCHEMA_SQL (local-schema-debug.ts).
--    Hinweis: Läuft mit den Rechten des Aufrufers; information_schema
--    zeigt authenticated nur Tabellen, auf die Rechte bestehen —
--    nach 060 sind das alle nutrition-Tabellen.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.schema_debug()
RETURNS json
LANGUAGE sql
STABLE
AS $fn$
WITH table_state AS (
  SELECT
    EXISTS (
      SELECT 1
      FROM information_schema.schemata
      WHERE schema_name = 'nutrition'
    ) AS schema_exists,
    to_regclass('nutrition.nutrient_defs') IS NOT NULL AS table_exists
),
row_state AS (
  SELECT CASE
    WHEN (SELECT table_exists FROM table_state)
      THEN (SELECT COUNT(*)::int FROM nutrition.nutrient_defs)
    ELSE 0
  END AS row_count
),
columns_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable = 'YES'
      )
      ORDER BY ordinal_position
    ),
    '[]'::json
  ) AS value
  FROM information_schema.columns
  WHERE table_schema = 'nutrition'
    AND table_name = 'nutrient_defs'
),
indexes_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', indexname,
        'definition', indexdef
      )
      ORDER BY indexname
    ),
    '[]'::json
  ) AS value
  FROM pg_indexes
  WHERE schemaname = 'nutrition'
    AND tablename = 'nutrient_defs'
),
constraints_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'name', conname,
        'definition', pg_get_constraintdef(c.oid)
      )
      ORDER BY conname
    ),
    '[]'::json
  ) AS value
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'nutrition'
    AND t.relname = 'nutrient_defs'
),
group_counts_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'group_de', group_de,
        'group_en', group_en,
        'row_count', row_count
      )
      ORDER BY row_count DESC, group_de
    ),
    '[]'::json
  ) AS value
  FROM (
    SELECT
      group_de,
      group_en,
      COUNT(*)::int AS row_count
    FROM nutrition.nutrient_defs
    GROUP BY group_de, group_en
  ) grouped
),
nutrient_preview_json AS (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'code', code,
        'name_de', name_de,
        'name_en', name_en,
        'name_th', name_th,
        'unit', unit,
        'group_de', group_de,
        'group_en', group_en,
        'group_th', group_th,
        'sort_index', sort_index,
        'display_tier', display_tier,
        'is_always_computed', is_always_computed,
        'is_partly_computed', is_partly_computed,
        'formula', formula,
        'rda_male', rda_male,
        'rda_female', rda_female,
        'rda_unit', rda_unit
      )
      ORDER BY sort_index, code
    ),
    '[]'::json
  ) AS value
  FROM (
    SELECT
      code,
      name_de,
      name_en,
      name_th,
      unit,
      group_de,
      group_en,
      group_th,
      sort_index,
      display_tier,
      is_always_computed,
      is_partly_computed,
      formula,
      rda_male,
      rda_female,
      rda_unit
    FROM nutrition.nutrient_defs
    ORDER BY sort_index, code
    LIMIT 138
  ) preview
),
rda_summary_json AS (
  SELECT json_build_object(
    'rda_male_populated', COUNT(*) FILTER (WHERE rda_male IS NOT NULL)::int,
    'rda_female_populated', COUNT(*) FILTER (WHERE rda_female IS NOT NULL)::int,
    'rda_unit_populated', COUNT(*) FILTER (WHERE rda_unit IS NOT NULL AND rda_unit <> '')::int
  ) AS value
  FROM nutrition.nutrient_defs
),
food_foundation_json AS (
  SELECT json_build_object(
    'foods_table_exists', to_regclass('nutrition.foods') IS NOT NULL,
    'food_nutrients_table_exists', to_regclass('nutrition.food_nutrients') IS NOT NULL,
    'foods_row_count', CASE
      WHEN to_regclass('nutrition.foods') IS NULL THEN 0
      ELSE (SELECT GREATEST(c.reltuples::int, 0) FROM pg_class c WHERE c.oid = to_regclass('nutrition.foods'))
    END,
    'food_nutrients_row_count', CASE
      WHEN to_regclass('nutrition.food_nutrients') IS NULL THEN 0
      ELSE (SELECT GREATEST(c.reltuples::int, 0) FROM pg_class c WHERE c.oid = to_regclass('nutrition.food_nutrients'))
    END,
    'food_nutrients_nutrient_fk_exists', EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class source_table ON source_table.oid = c.conrelid
      JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
      JOIN pg_class target_table ON target_table.oid = c.confrelid
      JOIN pg_namespace target_ns ON target_ns.oid = target_table.relnamespace
      JOIN unnest(c.conkey) WITH ORDINALITY source_key(attnum, ordinality) ON true
      JOIN pg_attribute source_attribute
        ON source_attribute.attrelid = source_table.oid
       AND source_attribute.attnum = source_key.attnum
      JOIN unnest(c.confkey) WITH ORDINALITY target_key(attnum, ordinality)
        ON target_key.ordinality = source_key.ordinality
      JOIN pg_attribute target_attribute
        ON target_attribute.attrelid = target_table.oid
       AND target_attribute.attnum = target_key.attnum
      WHERE c.contype = 'f'
        AND source_ns.nspname = 'nutrition'
        AND source_table.relname = 'food_nutrients'
        AND source_attribute.attname = 'nutrient_code'
        AND target_ns.nspname = 'nutrition'
        AND target_table.relname = 'nutrient_defs'
        AND target_attribute.attname = 'code'
    )
  ) AS value
)
SELECT json_build_object(
  'schema_exists', (SELECT schema_exists FROM table_state),
  'table_exists', (SELECT table_exists FROM table_state),
  'row_count', (SELECT row_count FROM row_state),
  'columns', (SELECT value FROM columns_json),
  'indexes', (SELECT value FROM indexes_json),
  'constraints', (SELECT value FROM constraints_json),
  'group_counts', (SELECT value FROM group_counts_json),
  'nutrient_preview', (SELECT value FROM nutrient_preview_json),
  'rda_summary', (SELECT value FROM rda_summary_json),
  'food_foundation', (SELECT value FROM food_foundation_json)
)
$fn$;

-- -------------------------------------------------------------
-- 6. Rechte: EXECUTE nur für authenticated und service_role.
-- -------------------------------------------------------------
REVOKE ALL ON FUNCTION nutrition.search_fold(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION nutrition.food_search(text, text, text[], uuid, text, uuid, text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION nutrition.food_categories_tree() FROM PUBLIC;
REVOKE ALL ON FUNCTION nutrition.preference_search_preview(text, text, text[], text[], text[], text[], text[], text[], text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION nutrition.curation_overview(boolean, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION nutrition.schema_debug() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION nutrition.search_fold(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.food_search(text, text, text[], uuid, text, uuid, text, text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.food_categories_tree() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.preference_search_preview(text, text, text[], text[], text[], text[], text[], text[], text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.curation_overview(boolean, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.schema_debug() TO authenticated, service_role;

COMMIT;
