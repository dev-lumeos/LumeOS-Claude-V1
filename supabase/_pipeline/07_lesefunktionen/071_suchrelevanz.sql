-- =============================================================
-- 071 — Suchrelevanz an die Aliase anbinden
-- Datum: 2026-08-13 · Laeuft NACH 070 und NACH 022. Idempotent
-- (CREATE OR REPLACE). Grundlage: docs/ssot/41-lebensmittelsuche-wortschatz.md
-- =============================================================
--
-- ANLASS: `[cmd]` Bisher las die Relevanz AUSSCHLIESSLICH `name_de`:
--   1.00 exakt · 0.85 beginnt mit · 0.65 alles andere.
-- Ein Treffer, der nur ueber einen Alias zustande kam, bekam
-- zwangslaeufig 0.65 und landete hinter jedem beliebigen Namenstreffer.
-- Ohne diese Aenderung waeren die 11.102 abgeleiteten Aliase aus 022
-- zwar auffindbar, aber unsortierbar — sie lieferten Treffer und
-- stellten das Gesuchte nicht nach vorn.
--
-- DIE NEUE STUFENLEITER, kleinste Aenderung die reicht:
--   1.00  Bestandsname exakt        (unveraendert)
--   0.95  Alias exakt               NEU
--   0.85  Bestandsname beginnt mit  (unveraendert)
--   0.80  Alias beginnt mit         NEU
--   0.75  Treffer am WORTANFANG     NEU
--   0.65  Treffer irgendwo          (unveraendert)
--
-- WARUM 0.95 UND NICHT 1.00: Der Bestandsname ist die genauere Angabe.
-- Wer exakt "Haehnchen Brustfilet, roh" tippt, soll diese Zeile vor
-- einer bekommen, die denselben Text nur als Alias traegt.
--
-- WARUM DIE STUFE 0.75: `[cmd]` "huhn" trifft heute 31 Zeilen —
-- Suppenhuhn, Rebhuhn, Perlhuhn — und das gesuchte Haehnchen ist NICHT
-- darunter. Der Teilstring passt mitten im Wort. Ein Treffer, der ein
-- WORT BEGINNT, ist fast immer der gemeinte. Bewusst als zusaetzliche
-- Stufe und NICHT als Filter: sonst verlöre man Zusammensetzungen wie
-- "Haehnchenbrustfilet", bei denen der Treffer legitim im Wortinneren
-- steht.
--
-- WAS NICHT GEAENDERT WIRD: `sort_weight`. `[cmd]` Die Werte tragen
-- bereits die richtige Vorliebe — "Haehnchen Brustfilet, roh" hat 730,
-- die gegrillte Variante 570, "mit Haut" 530. Das Grundprodukt steht
-- oben. Eine zweite Gewichtung danebenzubauen haette ein
-- funktionierendes Signal verwaessert.
--
-- Erzeugt aus der Definition vom 2026-08-13; ausser dem Relevanz-
-- ausdruck (an beiden Stellen: SELECT-Liste und ORDER BY) ist alles
-- unveraendert.
-- =============================================================

CREATE OR REPLACE FUNCTION nutrition.food_search(p_query text, p_normalized_query text, p_tokens text[], p_selected_food_id uuid, p_category_slug text, p_category_id uuid, p_tag_code text, p_sort text, p_limit integer, p_offset integer)
 RETURNS json
 LANGUAGE sql
 STABLE
AS $function$
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
    f.name_display_de,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
    CASE
      WHEN p_tokens IS NULL OR cardinality(p_tokens) = 0 THEN 0.5
      -- 1.00  Bestandsname exakt
      WHEN lower(COALESCE(f.name_de, '')) = lower(p_query) THEN 1.0
      -- 0.95  Alias exakt: der Nutzer hat den Begriff genau getroffen,
      --       nur nicht in der Schreibweise des Bestands. Knapp unter
      --       dem Namenstreffer, weil der Bestandsname die genauere
      --       Angabe ist.
      WHEN EXISTS (SELECT 1 FROM nutrition.food_aliases fa
                    WHERE fa.food_id = f.id
                      AND nutrition.search_fold(fa.alias) = p_normalized_query)
        THEN 0.95
      -- 0.85  Bestandsname beginnt mit der Anfrage
      WHEN lower(COALESCE(f.name_de, '')) LIKE lower(p_query) || '%' THEN 0.85
      -- 0.80  Alias beginnt mit der Anfrage
      WHEN EXISTS (SELECT 1 FROM nutrition.food_aliases fa
                    WHERE fa.food_id = f.id
                      AND nutrition.search_fold(fa.alias) LIKE p_normalized_query || '%')
        THEN 0.80
      -- 0.75  Treffer am WORTANFANG im Bestandsnamen. Das ist der
      --       huhn/Suppenhuhn-Fall: "huhn" steckt mitten in
      --       "Suppenhuhn" und traf bisher gleichwertig. Ein Treffer,
      --       der ein Wort beginnt, ist fast immer der gemeinte.
      WHEN nutrition.search_fold(COALESCE(f.name_de,'')) LIKE p_normalized_query || '%'
        OR nutrition.search_fold(COALESCE(f.name_de,'')) LIKE '% ' || p_normalized_query || '%'
        THEN 0.75
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
        WHEN EXISTS (SELECT 1 FROM nutrition.food_aliases fa
                      WHERE fa.food_id = f.id
                        AND nutrition.search_fold(fa.alias) = p_normalized_query)
          THEN 0.95
        WHEN lower(COALESCE(f.name_de, '')) LIKE lower(p_query) || '%' THEN 0.85
        WHEN EXISTS (SELECT 1 FROM nutrition.food_aliases fa
                      WHERE fa.food_id = f.id
                        AND nutrition.search_fold(fa.alias) LIKE p_normalized_query || '%')
          THEN 0.80
        WHEN nutrition.search_fold(COALESCE(f.name_de,'')) LIKE p_normalized_query || '%'
          OR nutrition.search_fold(COALESCE(f.name_de,'')) LIKE '% ' || p_normalized_query || '%'
          THEN 0.75
        ELSE 0.65
      END
    END DESC,
    CASE WHEN (SELECT sort FROM params) IN ('relevance', 'protein_desc') THEN f.sort_weight END DESC NULLS LAST,
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de, f.name_en, f.bls_code) ASC,
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
    f.name_display_de,
    f.name_display_en,
    f.name_display_th,
    f.category_id,
    f.sort_weight,
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de, f.name_en, f.bls_code) AS source_label,
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
        'name_display_de', name_display_de,
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
        'name_display_de', name_display_de,
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
$function$
