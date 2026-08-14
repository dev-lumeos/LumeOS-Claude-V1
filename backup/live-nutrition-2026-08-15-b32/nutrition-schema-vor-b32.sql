--
-- PostgreSQL database dump
--

\restrict jDW5zI4CgrFWA3Td7wCeLdrMlFT5W2yUiB4ifucahZNA5i7xVNXi6B3DgpRv8yC

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: nutrition; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA nutrition;


--
-- Name: curation_overview(boolean, text, text, text, text); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.curation_overview(p_unassigned_only boolean, p_category text, p_tag text, p_alias_state text, p_sort text) RETURNS json
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: food_categories_tree(); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.food_categories_tree() RETURNS json
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: food_search(text, text, text[], uuid, text, uuid, text, text, integer, integer, text[], text[], boolean, jsonb); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.food_search(p_query text, p_normalized_query text, p_tokens text[], p_selected_food_id uuid, p_category_slug text, p_category_id uuid, p_tag_code text, p_sort text, p_limit integer, p_offset integer, p_preparations text[] DEFAULT NULL::text[], p_groups text[] DEFAULT NULL::text[], p_basics_only boolean DEFAULT false, p_token_groups jsonb DEFAULT NULL::jsonb) RETURNS json
    LANGUAGE sql STABLE
    AS $$
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
    -- ACHTUNG: Diese Bedingung steht ZWEIMAL in dieser Funktion
    -- (matching_foods und all_matching_food_ids). Wer eine aendert,
    -- muss die andere mitaendern — sonst weicht `total` von der Liste
    -- ab, wie am 2026-08-14 geschehen.
    --
    -- Zwei Faelle:
    --   p_token_groups gesetzt -> ODER innerhalb einer Gruppe,
    --     UND zwischen den Gruppen. Eine Gruppe traegt ein Wort samt
    --     Zerlegungsteil und Synonymen.
    --   sonst -> die alte Tokenlogik, unveraendert. Sie bleibt die
    --     Rueckfallebene fuer Aufrufer ohne Gruppen.
    (CASE
      WHEN p_token_groups IS NOT NULL AND jsonb_array_length(p_token_groups) > 0 THEN
        -- WARUM jsonb UND NICHT SECHS FESTE text[]-SLOTS:
        -- `[cmd]` Beides gemessen. Die Slot-Fassung sollte den
        -- Trigramm-Index nutzbar machen und war LANGSAMER: 704 ms
        -- gegen 562 ms, weil jeder der sechs Slots einen eigenen
        -- Durchlauf ueber nutrition.foods ausloest — auch die fuenf
        -- leeren einer einwortigen Anfrage.
        --
        -- Der Index greift hier ohnehin nicht, und zwar unabhaengig
        -- von den Gruppen: die Bedingung faltet
        -- concat_ws(bls_code, name_de, name_en, name_th), waehrend
        -- idx_foods_fold_trgm auf search_fold(name_de) liegt. Zwei
        -- verschiedene Ausdruecke, also Seq Scan. Das war schon vor
        -- Block 31 so und ist als Aufgabe notiert, nicht hier geloest.
        --
        -- `[cmd]` Grundkosten der Funktion ohne jede Gruppe: 178 ms
        -- bei leerer Anfrage, 288 ms bei einem Wort. Die Gruppen
        -- kosten zusaetzlich rund 275 ms.
        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_token_groups) AS g(gruppe)
          WHERE NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(g.gruppe) AS a(alt)
            WHERE nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || a.alt || '%'
               OR EXISTS (
                 SELECT 1 FROM nutrition.food_aliases fa
                 WHERE fa.food_id = f.id
                   AND nutrition.search_fold(fa.alias) LIKE '%' || a.alt || '%'
               )
          )
        )
      ELSE
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
    END)
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
    -- Zubereitung: Code ODER Wort im Namen. [cmd] Fuer "roh" tragen
    -- 509 Lebensmittel beides, 338 nur den Code, 153 nur das Wort —
    -- eines allein liesse je nach Richtung Hunderte fallen.
    AND (
      p_preparations IS NULL OR cardinality(p_preparations) = 0
      OR EXISTS (
        SELECT 1 FROM nutrition.preparation_kinds pk
        WHERE pk.code = ANY(p_preparations)
          AND (
            nutrition.search_fold(f.name_de) ~ pk.name_pattern
            OR (pk.bls_codes IS NOT NULL
                AND substr(f.bls_code, 5, 3) = ANY(pk.bls_codes))
          )
      )
    )
    -- Warengruppe: erster Buchstabe des BLS-Codes.
    AND (
      p_groups IS NULL OR cardinality(p_groups) = 0
      OR substr(f.bls_code, 1, 1) = ANY(p_groups)
    )
    -- Nur Grundnahrungsmittel: [cmd] X und Y sind zusammengesetzte
    -- Gerichte (2.050 Eintraege, sort_weight durchgaengig 0).
    AND (
      NOT COALESCE(p_basics_only, false)
      OR NOT EXISTS (
        SELECT 1 FROM nutrition.food_groups fg
        WHERE fg.code = substr(f.bls_code, 1, 1) AND fg.ist_gericht
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
    COALESCE(NULLIF(f.name_display, ''), f.name_de, f.name_en, f.bls_code) ASC,
    f.bls_code ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params)
),
all_matching_food_ids AS (
  SELECT f.id
  FROM nutrition.foods f
  WHERE
    -- ACHTUNG: Diese Bedingung steht ZWEIMAL in dieser Funktion
    -- (matching_foods und all_matching_food_ids). Wer eine aendert,
    -- muss die andere mitaendern — sonst weicht `total` von der Liste
    -- ab, wie am 2026-08-14 geschehen.
    --
    -- Zwei Faelle:
    --   p_token_groups gesetzt -> ODER innerhalb einer Gruppe,
    --     UND zwischen den Gruppen. Eine Gruppe traegt ein Wort samt
    --     Zerlegungsteil und Synonymen.
    --   sonst -> die alte Tokenlogik, unveraendert. Sie bleibt die
    --     Rueckfallebene fuer Aufrufer ohne Gruppen.
    (CASE
      WHEN p_token_groups IS NOT NULL AND jsonb_array_length(p_token_groups) > 0 THEN
        -- WARUM jsonb UND NICHT SECHS FESTE text[]-SLOTS:
        -- `[cmd]` Beides gemessen. Die Slot-Fassung sollte den
        -- Trigramm-Index nutzbar machen und war LANGSAMER: 704 ms
        -- gegen 562 ms, weil jeder der sechs Slots einen eigenen
        -- Durchlauf ueber nutrition.foods ausloest — auch die fuenf
        -- leeren einer einwortigen Anfrage.
        --
        -- Der Index greift hier ohnehin nicht, und zwar unabhaengig
        -- von den Gruppen: die Bedingung faltet
        -- concat_ws(bls_code, name_de, name_en, name_th), waehrend
        -- idx_foods_fold_trgm auf search_fold(name_de) liegt. Zwei
        -- verschiedene Ausdruecke, also Seq Scan. Das war schon vor
        -- Block 31 so und ist als Aufgabe notiert, nicht hier geloest.
        --
        -- `[cmd]` Grundkosten der Funktion ohne jede Gruppe: 178 ms
        -- bei leerer Anfrage, 288 ms bei einem Wort. Die Gruppen
        -- kosten zusaetzlich rund 275 ms.
        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_token_groups) AS g(gruppe)
          WHERE NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(g.gruppe) AS a(alt)
            WHERE nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || a.alt || '%'
               OR EXISTS (
                 SELECT 1 FROM nutrition.food_aliases fa
                 WHERE fa.food_id = f.id
                   AND nutrition.search_fold(fa.alias) LIKE '%' || a.alt || '%'
               )
          )
        )
      ELSE
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
    END)
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
    -- ACHTUNG: Diese Bedingungen stehen ABSICHTLICH zweimal — einmal in
    -- `matching_foods` (die angezeigte Seite) und hier in
    -- `all_matching_food_ids` (die Gesamtzahl). `[cmd]` 2026-08-14: beim
    -- ersten Anlauf war nur die erste Stelle gepatcht, worauf jeder
    -- Filter 7.140 zurueckgab — die Trefferliste war gefiltert, die Zahl
    -- darueber nicht. Wer eine Bedingung aendert, aendert BEIDE.
    AND (
      p_preparations IS NULL OR cardinality(p_preparations) = 0
      OR EXISTS (
        SELECT 1 FROM nutrition.preparation_kinds pk
        WHERE pk.code = ANY(p_preparations)
          AND (
            nutrition.search_fold(f.name_de) ~ pk.name_pattern
            OR (pk.bls_codes IS NOT NULL
                AND substr(f.bls_code, 5, 3) = ANY(pk.bls_codes))
          )
      )
    )
    AND (
      p_groups IS NULL OR cardinality(p_groups) = 0
      OR substr(f.bls_code, 1, 1) = ANY(p_groups)
    )
    AND (
      NOT COALESCE(p_basics_only, false)
      OR NOT EXISTS (
        SELECT 1 FROM nutrition.food_groups fg
        WHERE fg.code = substr(f.bls_code, 1, 1) AND fg.ist_gericht
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
  -- Die gesetzten Filter zurueckspiegeln, wie category und tag es tun —
  -- die Oberflaeche baut daraus ihre Ankreuzliste und die Adresse.
  'preparations', COALESCE(to_json(p_preparations), 'null'::json),
  'groups', COALESCE(to_json(p_groups), 'null'::json),
  'basics_only', COALESCE(p_basics_only, false),
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
$$;


--
-- Name: meal_items_owner_guard(); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.meal_items_owner_guard() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  owner UUID;
BEGIN
  SELECT m.user_id INTO owner FROM nutrition.meals m WHERE m.id = NEW.meal_id;
  IF owner IS NULL THEN
    RAISE EXCEPTION 'meal_items.meal_id % existiert nicht', NEW.meal_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> owner THEN
    RAISE EXCEPTION
      'meal_items.user_id (%) weicht von meals.user_id (%) ab', NEW.user_id, owner
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: preference_search_preview(text, text, text[], text[], text[], text[], text[], text[], text, integer, integer, uuid[], uuid[], uuid[]); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.preference_search_preview(p_query text, p_normalized_query text, p_tokens text[], p_excluded_category_slugs text[], p_liked_category_slugs text[], p_disliked_category_slugs text[], p_liked_tags text[], p_disliked_tags text[], p_sort text, p_limit integer, p_offset integer, p_liked_food_ids uuid[] DEFAULT ARRAY[]::uuid[], p_disliked_food_ids uuid[] DEFAULT ARRAY[]::uuid[], p_excluded_food_ids uuid[] DEFAULT ARRAY[]::uuid[]) RETURNS json
    LANGUAGE sql STABLE
    AS $$
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
    CASE WHEN f.id = ANY(COALESCE(p_liked_food_ids, ARRAY[]::uuid[])) THEN 80 ELSE 0 END
      + CASE WHEN f.id = ANY(COALESCE(p_disliked_food_ids, ARRAY[]::uuid[])) THEN -80 ELSE 0 END
      + CASE WHEN lc.id IS NOT NULL THEN 50 ELSE 0 END
      + CASE WHEN dc.id IS NOT NULL THEN -50 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_liked_tags, ARRAY[]::text[]) THEN 30 ELSE 0 END
      + CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_disliked_tags, ARRAY[]::text[]) THEN -30 ELSE 0 END AS preference_score,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN f.id = ANY(COALESCE(p_liked_food_ids, ARRAY[]::uuid[])) THEN 'liked_food' END,
      CASE WHEN f.id = ANY(COALESCE(p_disliked_food_ids, ARRAY[]::uuid[])) THEN 'disliked_food' END,
      CASE WHEN lc.id IS NOT NULL THEN 'liked_category' END,
      CASE WHEN dc.id IS NOT NULL THEN 'disliked_category' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_liked_tags, ARRAY[]::text[]) THEN 'liked_tag' END,
      CASE WHEN COALESCE(tags.tags, ARRAY[]::text[]) && COALESCE(p_disliked_tags, ARRAY[]::text[]) THEN 'disliked_tag' END
    ], NULL) AS preference_notes,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN f.id = ANY(COALESCE(p_liked_food_ids, ARRAY[]::uuid[])) THEN 'boosted because this food is marked as favorite' END,
      CASE WHEN f.id = ANY(COALESCE(p_disliked_food_ids, ARRAY[]::uuid[])) THEN 'suppressed because this food is marked as disliked' END,
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
    AND NOT (f.id = ANY(COALESCE(p_excluded_food_ids, ARRAY[]::uuid[])))
),
excluded_count AS (
  SELECT COUNT(*) AS count
  FROM nutrition.foods f
  LEFT JOIN excluded_categories ec ON ec.id = f.category_id
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
    AND (ec.id IS NOT NULL OR f.id = ANY(COALESCE(p_excluded_food_ids, ARRAY[]::uuid[])))
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
$$;


--
-- Name: pruef_objektliste(); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.pruef_objektliste() RETURNS TABLE(objekt text, art text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT c.relname::text AS objekt,
         CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' ELSE 'OTHER' END AS art
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'nutrition'
    AND c.relkind IN ('r', 'v')
  ORDER BY 1;
$$;


--
-- Name: FUNCTION pruef_objektliste(); Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON FUNCTION nutrition.pruef_objektliste() IS 'Objektliste des Schemas nutrition fuer die Rechtepruefung (B-22, 2026-08-06). SECURITY DEFINER mit Absicht: die Pruefung muss auch Objekte kennen, die die aufrufende Rolle NICHT lesen darf — sonst hat sie einen blinden Fleck genau dort, wo sie hinsehen soll. Gibt nur Namen und Art zurueck, niemals Inhalte.';


--
-- Name: schema_debug(); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.schema_debug() RETURNS json
    LANGUAGE sql STABLE
    AS $$
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
$$;


--
-- Name: search_fold(text); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.search_fold(t text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
  SELECT btrim(regexp_replace(
           regexp_replace(
             replace(replace(replace(replace(
               lower(coalesce(t, '')),
               'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'),
             '[^a-z0-9]+', ' ', 'g'),
           '\s+', ' ', 'g'))
$$;


--
-- Name: FUNCTION search_fold(t text); Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON FUNCTION nutrition.search_fold(t text) IS 'Einzige Faltungsregel der Suche. Muss Zeichen fuer Zeichen normalizeFoodSearchText in apps/web/src/lib/nutrition/food-search.ts entsprechen. Die Gegenprobe steht in supabase/_pipeline/_validierung/v072_normalisierung.sql — laufen die beiden auseinander, bricht die Suche STILL.';


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: nutrition; Owner: -
--

CREATE FUNCTION nutrition.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: meal_items; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.meal_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_id uuid NOT NULL,
    user_id uuid NOT NULL,
    food_id uuid,
    food_source text DEFAULT 'bls'::text NOT NULL,
    food_name text NOT NULL,
    amount_g numeric(10,2) NOT NULL,
    enercc numeric(12,4),
    prot625 numeric(12,4),
    fat numeric(12,4),
    cho numeric(12,4),
    fibt numeric(12,4),
    sugar numeric(12,4),
    fasat numeric(12,4),
    nacl numeric(12,4),
    water_g numeric(12,4),
    nutrients jsonb DEFAULT '{}'::jsonb NOT NULL,
    frozen_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meal_items_amount_g_check CHECK ((amount_g > (0)::numeric)),
    CONSTRAINT meal_items_food_source_check CHECK ((food_source = ANY (ARRAY['bls'::text, 'manual'::text]))),
    CONSTRAINT meal_items_source_target_check CHECK ((((food_source = 'bls'::text) AND (food_id IS NOT NULL)) OR ((food_source = 'manual'::text) AND (food_id IS NULL))))
);


--
-- Name: meals; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entry_date date NOT NULL,
    meal_type text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meals_meal_type_check CHECK ((meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'pre_workout'::text, 'post_workout'::text, 'other'::text])))
);


--
-- Name: daily_summary; Type: VIEW; Schema: nutrition; Owner: -
--

CREATE VIEW nutrition.daily_summary WITH (security_invoker='true') AS
 SELECT m.user_id,
    m.entry_date,
    count(DISTINCT m.id) AS meal_count,
    count(mi.id) AS item_count,
    sum(mi.enercc) AS enercc,
    sum(mi.prot625) AS prot625,
    sum(mi.fat) AS fat,
    sum(mi.cho) AS cho,
    sum(mi.fibt) AS fibt,
    sum(mi.sugar) AS sugar,
    sum(mi.fasat) AS fasat,
    sum(mi.nacl) AS nacl,
    sum(mi.water_g) AS water_g,
    (count(mi.id) - count(mi.enercc)) AS enercc_missing,
    (count(mi.id) - count(mi.prot625)) AS prot625_missing,
    (count(mi.id) - count(mi.fat)) AS fat_missing,
    (count(mi.id) - count(mi.cho)) AS cho_missing,
    (count(mi.id) - count(mi.fibt)) AS fibt_missing,
    (count(mi.id) - count(mi.sugar)) AS sugar_missing,
    (count(mi.id) - count(mi.fasat)) AS fasat_missing,
    (count(mi.id) - count(mi.nacl)) AS nacl_missing,
    (count(mi.id) - count(mi.water_g)) AS water_g_missing
   FROM (nutrition.meals m
     LEFT JOIN nutrition.meal_items mi ON ((mi.meal_id = m.id)))
  GROUP BY m.user_id, m.entry_date;


--
-- Name: VIEW daily_summary; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON VIEW nutrition.daily_summary IS 'Tagessummen aus den eingefrorenen Werten in meal_items (C-04, 2026-08-06). security_invoker=true, damit die RLS-Policies von meals/meal_items greifen. Je Makro zusaetzlich <makro>_missing: Zahl der Positionen ohne Wert — ist sie > 0, ist die Summe eine Untergrenze. Keine Summe ueber den JSONB-Schnappschuss, nur ueber die neun Schnell-Makros.';


--
-- Name: food_aliases; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_aliases (
    food_id uuid NOT NULL,
    alias text NOT NULL,
    locale text DEFAULT 'de'::text NOT NULL,
    source text DEFAULT 'editorial'::text NOT NULL,
    CONSTRAINT food_aliases_source_check CHECK ((source = ANY (ARRAY['editorial'::text, 'ai_generated'::text, 'user'::text, 'derived'::text])))
);


--
-- Name: COLUMN food_aliases.source; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON COLUMN nutrition.food_aliases.source IS 'editorial = von Hand gepflegt · ai_generated = von einem Modell vorgeschlagen · user = aus Nutzereingabe · derived = mechanisch aus dem Bestandsnamen abgeleitet (Kettenschritt 022), reproduzierbar und nicht pflegebeduerftig.';


--
-- Name: food_categories; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name_de text NOT NULL,
    name_en text DEFAULT ''::text NOT NULL,
    name_th text,
    parent_id uuid,
    level integer NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    bls_hint text,
    CONSTRAINT food_categories_level_check CHECK ((level = ANY (ARRAY[1, 2, 3, 4])))
);


--
-- Name: food_curation_candidates; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_curation_candidates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    target_type text NOT NULL,
    target_field text NOT NULL,
    proposed_value text DEFAULT ''::text NOT NULL,
    proposed_value_id uuid,
    source text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer text DEFAULT 'local_curation_foundation'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_candidates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text]))),
    CONSTRAINT food_curation_candidates_target_type_check CHECK ((target_type = ANY (ARRAY['category_assignment'::text, 'display_name'::text, 'alias'::text, 'preference_item_mapping'::text])))
);


--
-- Name: food_curation_decisions; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_curation_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    candidate_id uuid NOT NULL,
    decision text NOT NULL,
    reviewer text NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT food_curation_decisions_decision_check CHECK ((decision = ANY (ARRAY['accepted'::text, 'rejected'::text, 'superseded'::text])))
);


--
-- Name: food_groups; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_groups (
    code text NOT NULL,
    label_de text,
    ist_gericht boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    herkunft text NOT NULL
);


--
-- Name: TABLE food_groups; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON TABLE nutrition.food_groups IS 'Warengruppen = erster Buchstabe des BLS-Codes. `label_de` ist NULL, wo sich keine eindeutige Bezeichnung belegen laesst — solche Gruppen werden im Filter nicht angeboten.';


--
-- Name: food_nutrients; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_nutrients (
    food_id uuid NOT NULL,
    nutrient_code text NOT NULL,
    value numeric(12,5) NOT NULL,
    data_source text DEFAULT 'bls_4_0'::text NOT NULL
);


--
-- Name: food_preference_items; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_preference_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    preference text NOT NULL,
    strength text DEFAULT 'neutral'::text NOT NULL,
    target_type text NOT NULL,
    food_id uuid,
    category_id uuid,
    tag_code text,
    cuisine_code text,
    exclusion_preset_code text,
    catalog_item_code text,
    source text DEFAULT 'user'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT food_preference_items_exactly_one_target CHECK (((((((((food_id IS NOT NULL))::integer + ((category_id IS NOT NULL))::integer) + ((tag_code IS NOT NULL))::integer) + ((NULLIF(cuisine_code, ''::text) IS NOT NULL))::integer) + ((NULLIF(exclusion_preset_code, ''::text) IS NOT NULL))::integer) + ((NULLIF(catalog_item_code, ''::text) IS NOT NULL))::integer) = 1)),
    CONSTRAINT food_preference_items_preference_check CHECK ((preference = ANY (ARRAY['liked'::text, 'disliked'::text, 'hard_exclude'::text]))),
    CONSTRAINT food_preference_items_strength_check CHECK ((strength = ANY (ARRAY['hard_exclude'::text, 'strong_avoid'::text, 'soft_dislike'::text, 'neutral'::text, 'like'::text, 'boost'::text]))),
    CONSTRAINT food_preference_items_target_type_check CHECK ((target_type = ANY (ARRAY['food'::text, 'category'::text, 'tag'::text, 'cuisine'::text, 'exclusion_preset'::text, 'catalog_item'::text])))
);


--
-- Name: food_preferences; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_preferences (
    user_id uuid NOT NULL,
    diet_type text DEFAULT 'omnivore'::text,
    allergies text[] DEFAULT '{}'::text[],
    intolerances text[] DEFAULT '{}'::text[],
    general_exclusions text[] DEFAULT '{}'::text[],
    preferred_cuisines text[] DEFAULT '{}'::text[],
    meals_per_day integer DEFAULT 3,
    snacks_per_day integer DEFAULT 1,
    cooking_skill text DEFAULT 'intermediate'::text,
    prep_time_max_min integer DEFAULT 30,
    budget_level text DEFAULT 'medium'::text,
    meal_prep_ok boolean DEFAULT false,
    planner_notes text DEFAULT ''::text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT food_preferences_budget_level_check CHECK ((budget_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'no_limit'::text]))),
    CONSTRAINT food_preferences_cooking_skill_check CHECK ((cooking_skill = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT food_preferences_diet_type_check CHECK ((diet_type = ANY (ARRAY['omnivore'::text, 'pescatarian'::text, 'vegetarian'::text, 'vegan'::text, 'keto'::text, 'paleo'::text, 'mediterranean'::text, 'custom'::text]))),
    CONSTRAINT food_preferences_meals_per_day_check CHECK ((meals_per_day = ANY (ARRAY[2, 3, 4, 5, 6]))),
    CONSTRAINT food_preferences_prep_time_max_min_check CHECK ((prep_time_max_min = ANY (ARRAY[15, 20, 30, 45, 60]))),
    CONSTRAINT food_preferences_snacks_per_day_check CHECK ((snacks_per_day = ANY (ARRAY[0, 1, 2, 3])))
);


--
-- Name: food_tags; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.food_tags (
    food_id uuid NOT NULL,
    tag_code text NOT NULL,
    confidence numeric(3,2) DEFAULT 1.0 NOT NULL,
    CONSTRAINT food_tags_confidence_check CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric)))
);


--
-- Name: foods; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bls_code text NOT NULL,
    name_de text NOT NULL,
    name_en text,
    name_th text DEFAULT ''::text NOT NULL,
    name_display text,
    sort_weight integer DEFAULT 500 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    name_display_en text,
    name_display_th text,
    category_id uuid,
    processing_level text DEFAULT 'raw'::text,
    is_prepared_dish boolean DEFAULT false NOT NULL,
    CONSTRAINT foods_processing_level_check CHECK ((processing_level = ANY (ARRAY['raw'::text, 'minimally_processed'::text, 'processed'::text, 'ultra_processed'::text, 'cooked'::text, 'fermented'::text, 'smoked'::text, 'dried'::text, 'canned'::text, 'fortified'::text]))),
    CONSTRAINT foods_sort_weight_check CHECK (((sort_weight >= 0) AND (sort_weight <= 1000)))
);


--
-- Name: water_logs; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.water_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entry_date date NOT NULL,
    amount_ml numeric(8,2) NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT water_logs_amount_ml_check CHECK ((amount_ml > (0)::numeric)),
    CONSTRAINT water_logs_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'quick_add'::text])))
);


--
-- Name: hydration_summary; Type: VIEW; Schema: nutrition; Owner: -
--

CREATE VIEW nutrition.hydration_summary WITH (security_invoker='true') AS
 WITH getrunken AS (
         SELECT w.user_id,
            w.entry_date,
            sum(w.amount_ml) AS logged_ml,
            count(*) AS log_count
           FROM nutrition.water_logs w
          GROUP BY w.user_id, w.entry_date
        ), aus_nahrung AS (
         SELECT d.user_id,
            d.entry_date,
            d.water_g AS food_ml,
            d.water_g_missing AS food_ml_missing,
            d.item_count
           FROM nutrition.daily_summary d
        )
 SELECT COALESCE(g.user_id, n.user_id) AS user_id,
    COALESCE(g.entry_date, n.entry_date) AS entry_date,
    g.logged_ml,
    COALESCE(g.log_count, (0)::bigint) AS log_count,
    n.food_ml,
    COALESCE(n.food_ml_missing, (0)::bigint) AS food_ml_missing,
        CASE
            WHEN ((g.logged_ml IS NULL) AND (n.food_ml IS NULL)) THEN NULL::numeric
            ELSE (COALESCE(g.logged_ml, (0)::numeric) + COALESCE(n.food_ml, (0)::numeric))
        END AS total_ml,
    (COALESCE(n.food_ml_missing, (0)::bigint) = 0) AS total_complete
   FROM (getrunken g
     FULL JOIN aus_nahrung n ON (((n.user_id = g.user_id) AND (n.entry_date = g.entry_date))));


--
-- Name: VIEW hydration_summary; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON VIEW nutrition.hydration_summary IS 'Gesamt-Hydration je Nutzerin und Tag (C-05, 2026-08-06): getrunkenes Wasser aus water_logs plus Wasser aus Nahrung aus daily_summary.water_g. 1 g Wasser = 1 ml. security_invoker=true, damit die RLS-Policies von water_logs/meals/meal_items greifen. total_complete sagt, ob die Gesamtsumme belastbar ist; food_ml_missing > 0 macht sie zur Untergrenze. Das Tagesziel steht NICHT hier — es kommt laut ADR_WATER_TOTAL_HYDRATION aus nutrition_targets (Goals, C-06), und diese Tabelle existiert noch nicht.';


--
-- Name: nutrient_defs; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.nutrient_defs (
    code text NOT NULL,
    name_de text NOT NULL,
    name_en text NOT NULL,
    unit text NOT NULL,
    group_de text NOT NULL,
    group_en text NOT NULL,
    sort_index integer NOT NULL,
    display_tier integer DEFAULT 2 NOT NULL,
    is_always_computed boolean DEFAULT false NOT NULL,
    is_partly_computed boolean DEFAULT false NOT NULL,
    formula text,
    rda_male numeric(10,3),
    rda_female numeric(10,3),
    rda_unit text,
    name_th text DEFAULT ''::text NOT NULL,
    group_th text DEFAULT ''::text NOT NULL,
    CONSTRAINT nutrient_defs_display_tier_check CHECK ((display_tier = ANY (ARRAY[1, 2, 3])))
);


--
-- Name: preparation_kinds; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.preparation_kinds (
    code text NOT NULL,
    label_de text NOT NULL,
    name_pattern text,
    bls_codes text[],
    sort_order integer DEFAULT 0 NOT NULL,
    herkunft text NOT NULL
);


--
-- Name: TABLE preparation_kinds; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON TABLE nutrition.preparation_kinds IS 'Zubereitungsarten fuer den Suchfilter. ABGELEITET aus den Namen des Bestands, nicht aus einer offiziellen BLS-Schluesseltabelle — eine solche liegt nicht vor. Jede Zeile traegt in `herkunft`, worauf sie sich stuetzt.';


--
-- Name: search_synonyms; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.search_synonyms (
    term text NOT NULL,
    targets text[] NOT NULL,
    source text NOT NULL,
    grund text NOT NULL,
    CONSTRAINT search_synonyms_source_check CHECK ((source = ANY (ARRAY['openthesaurus'::text, 'handarbeit'::text])))
);


--
-- Name: TABLE search_synonyms; Type: COMMENT; Schema: nutrition; Owner: -
--

COMMENT ON TABLE nutrition.search_synonyms IS 'Gerichtete Suchsynonyme: term (was der Nutzer tippt) -> targets (Woerter, die im Bestand vorkommen). Alle Werte gefaltet wie nutrition.search_fold. Erzeugt von Kettenschritt 024.';


--
-- Name: tag_definitions; Type: TABLE; Schema: nutrition; Owner: -
--

CREATE TABLE nutrition.tag_definitions (
    code text NOT NULL,
    name_de text NOT NULL,
    name_en text NOT NULL,
    tag_type text NOT NULL,
    is_exclusion_relevant boolean DEFAULT false NOT NULL,
    icon text,
    sort_order integer DEFAULT 0,
    requires_macro_check boolean DEFAULT false,
    macro_rule jsonb,
    CONSTRAINT tag_definitions_tag_type_check CHECK ((tag_type = ANY (ARRAY['ingredient'::text, 'diet'::text, 'allergen'::text, 'fitness'::text, 'gym'::text, 'processing'::text])))
);


--
-- Name: food_aliases food_aliases_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_aliases
    ADD CONSTRAINT food_aliases_pkey PRIMARY KEY (food_id, alias, locale);


--
-- Name: food_categories food_categories_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_pkey PRIMARY KEY (id);


--
-- Name: food_categories food_categories_slug_key; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_slug_key UNIQUE (slug);


--
-- Name: food_curation_candidates food_curation_candidates_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_curation_candidates
    ADD CONSTRAINT food_curation_candidates_pkey PRIMARY KEY (id);


--
-- Name: food_curation_decisions food_curation_decisions_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_curation_decisions
    ADD CONSTRAINT food_curation_decisions_pkey PRIMARY KEY (id);


--
-- Name: food_groups food_groups_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_groups
    ADD CONSTRAINT food_groups_pkey PRIMARY KEY (code);


--
-- Name: food_nutrients food_nutrients_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_pkey PRIMARY KEY (food_id, nutrient_code);


--
-- Name: food_preference_items food_preference_items_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_pkey PRIMARY KEY (id);


--
-- Name: food_preferences food_preferences_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_preferences
    ADD CONSTRAINT food_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: food_tags food_tags_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_pkey PRIMARY KEY (food_id, tag_code);


--
-- Name: foods foods_bls_code_key; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_bls_code_key UNIQUE (bls_code);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: meal_items meal_items_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.meal_items
    ADD CONSTRAINT meal_items_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: nutrient_defs nutrient_defs_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.nutrient_defs
    ADD CONSTRAINT nutrient_defs_pkey PRIMARY KEY (code);


--
-- Name: preparation_kinds preparation_kinds_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.preparation_kinds
    ADD CONSTRAINT preparation_kinds_pkey PRIMARY KEY (code);


--
-- Name: search_synonyms search_synonyms_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.search_synonyms
    ADD CONSTRAINT search_synonyms_pkey PRIMARY KEY (term);


--
-- Name: tag_definitions tag_definitions_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.tag_definitions
    ADD CONSTRAINT tag_definitions_pkey PRIMARY KEY (code);


--
-- Name: water_logs water_logs_pkey; Type: CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.water_logs
    ADD CONSTRAINT water_logs_pkey PRIMARY KEY (id);


--
-- Name: food_curation_candidates_food_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX food_curation_candidates_food_idx ON nutrition.food_curation_candidates USING btree (food_id);


--
-- Name: food_curation_candidates_status_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX food_curation_candidates_status_idx ON nutrition.food_curation_candidates USING btree (status);


--
-- Name: food_curation_decisions_candidate_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX food_curation_decisions_candidate_idx ON nutrition.food_curation_decisions USING btree (candidate_id);


--
-- Name: food_nutrients_food_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX food_nutrients_food_idx ON nutrition.food_nutrients USING btree (food_id);


--
-- Name: food_nutrients_nutrient_code_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX food_nutrients_nutrient_code_idx ON nutrition.food_nutrients USING btree (nutrient_code);


--
-- Name: foods_bls_code_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX foods_bls_code_idx ON nutrition.foods USING btree (bls_code);


--
-- Name: foods_sort_weight_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX foods_sort_weight_idx ON nutrition.foods USING btree (sort_weight DESC);


--
-- Name: idx_food_aliases_alias_trgm; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_aliases_alias_trgm ON nutrition.food_aliases USING gin (alias public.gin_trgm_ops);


--
-- Name: idx_food_aliases_fold_trgm; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_aliases_fold_trgm ON nutrition.food_aliases USING gin (nutrition.search_fold(alias) public.gin_trgm_ops);


--
-- Name: idx_food_aliases_food; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_aliases_food ON nutrition.food_aliases USING btree (food_id);


--
-- Name: idx_food_categories_level; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_categories_level ON nutrition.food_categories USING btree (level);


--
-- Name: idx_food_categories_parent; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_categories_parent ON nutrition.food_categories USING btree (parent_id);


--
-- Name: idx_food_pref_items_category; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_pref_items_category ON nutrition.food_preference_items USING btree (category_id);


--
-- Name: idx_food_pref_items_tag; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_pref_items_tag ON nutrition.food_preference_items USING btree (tag_code);


--
-- Name: idx_food_pref_items_user; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_pref_items_user ON nutrition.food_preference_items USING btree (user_id);


--
-- Name: idx_food_tags_code; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_tags_code ON nutrition.food_tags USING btree (tag_code);


--
-- Name: idx_food_tags_food; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_food_tags_food ON nutrition.food_tags USING btree (food_id);


--
-- Name: idx_foods_category; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_foods_category ON nutrition.foods USING btree (category_id);


--
-- Name: idx_foods_name_display; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_foods_name_display ON nutrition.foods USING gin (name_display public.gin_trgm_ops);


--
-- Name: idx_foods_sort_weight; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_foods_sort_weight ON nutrition.foods USING btree (sort_weight DESC);


--
-- Name: idx_meal_items_meal; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_meal_items_meal ON nutrition.meal_items USING btree (meal_id);


--
-- Name: idx_meal_items_user; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_meal_items_user ON nutrition.meal_items USING btree (user_id);


--
-- Name: idx_meals_user_date; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_meals_user_date ON nutrition.meals USING btree (user_id, entry_date);


--
-- Name: idx_search_synonyms_term; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_search_synonyms_term ON nutrition.search_synonyms USING btree (term);


--
-- Name: idx_water_logs_user_date; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX idx_water_logs_user_date ON nutrition.water_logs USING btree (user_id, entry_date);


--
-- Name: nutrient_defs_group_sort_idx; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE INDEX nutrient_defs_group_sort_idx ON nutrition.nutrient_defs USING btree (group_en, sort_index);


--
-- Name: uq_food_pref_items_user_catalog_item; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_catalog_item ON nutrition.food_preference_items USING btree (user_id, catalog_item_code) WHERE (NULLIF(catalog_item_code, ''::text) IS NOT NULL);


--
-- Name: uq_food_pref_items_user_category; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_category ON nutrition.food_preference_items USING btree (user_id, category_id) WHERE (category_id IS NOT NULL);


--
-- Name: uq_food_pref_items_user_cuisine; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_cuisine ON nutrition.food_preference_items USING btree (user_id, cuisine_code) WHERE (NULLIF(cuisine_code, ''::text) IS NOT NULL);


--
-- Name: uq_food_pref_items_user_exclusion_preset; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_exclusion_preset ON nutrition.food_preference_items USING btree (user_id, exclusion_preset_code) WHERE (NULLIF(exclusion_preset_code, ''::text) IS NOT NULL);


--
-- Name: uq_food_pref_items_user_food; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_food ON nutrition.food_preference_items USING btree (user_id, food_id) WHERE (food_id IS NOT NULL);


--
-- Name: uq_food_pref_items_user_tag; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_food_pref_items_user_tag ON nutrition.food_preference_items USING btree (user_id, tag_code) WHERE (tag_code IS NOT NULL);


--
-- Name: uq_meals_user_date_type; Type: INDEX; Schema: nutrition; Owner: -
--

CREATE UNIQUE INDEX uq_meals_user_date_type ON nutrition.meals USING btree (user_id, entry_date, meal_type);


--
-- Name: meal_items meal_items_owner_guard_trg; Type: TRIGGER; Schema: nutrition; Owner: -
--

CREATE TRIGGER meal_items_owner_guard_trg BEFORE INSERT OR UPDATE OF user_id, meal_id ON nutrition.meal_items FOR EACH ROW EXECUTE FUNCTION nutrition.meal_items_owner_guard();


--
-- Name: meal_items meal_items_touch_updated_at; Type: TRIGGER; Schema: nutrition; Owner: -
--

CREATE TRIGGER meal_items_touch_updated_at BEFORE UPDATE ON nutrition.meal_items FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();


--
-- Name: meals meals_touch_updated_at; Type: TRIGGER; Schema: nutrition; Owner: -
--

CREATE TRIGGER meals_touch_updated_at BEFORE UPDATE ON nutrition.meals FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();


--
-- Name: water_logs water_logs_touch_updated_at; Type: TRIGGER; Schema: nutrition; Owner: -
--

CREATE TRIGGER water_logs_touch_updated_at BEFORE UPDATE ON nutrition.water_logs FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();


--
-- Name: food_aliases food_aliases_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_aliases
    ADD CONSTRAINT food_aliases_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_categories food_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_categories
    ADD CONSTRAINT food_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES nutrition.food_categories(id);


--
-- Name: food_curation_candidates food_curation_candidates_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_curation_candidates
    ADD CONSTRAINT food_curation_candidates_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_curation_decisions food_curation_decisions_candidate_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_curation_decisions
    ADD CONSTRAINT food_curation_decisions_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES nutrition.food_curation_candidates(id) ON DELETE CASCADE;


--
-- Name: food_nutrients food_nutrients_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_nutrients food_nutrients_nutrient_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_nutrients
    ADD CONSTRAINT food_nutrients_nutrient_code_fkey FOREIGN KEY (nutrient_code) REFERENCES nutrition.nutrient_defs(code);


--
-- Name: food_preference_items food_preference_items_category_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES nutrition.food_categories(id);


--
-- Name: food_preference_items food_preference_items_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id);


--
-- Name: food_preference_items food_preference_items_tag_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_preference_items
    ADD CONSTRAINT food_preference_items_tag_code_fkey FOREIGN KEY (tag_code) REFERENCES nutrition.tag_definitions(code);


--
-- Name: food_tags food_tags_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE CASCADE;


--
-- Name: food_tags food_tags_tag_code_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.food_tags
    ADD CONSTRAINT food_tags_tag_code_fkey FOREIGN KEY (tag_code) REFERENCES nutrition.tag_definitions(code);


--
-- Name: foods foods_category_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.foods
    ADD CONSTRAINT foods_category_id_fkey FOREIGN KEY (category_id) REFERENCES nutrition.food_categories(id);


--
-- Name: meal_items meal_items_food_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.meal_items
    ADD CONSTRAINT meal_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES nutrition.foods(id) ON DELETE RESTRICT;


--
-- Name: meal_items meal_items_meal_id_fkey; Type: FK CONSTRAINT; Schema: nutrition; Owner: -
--

ALTER TABLE ONLY nutrition.meal_items
    ADD CONSTRAINT meal_items_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES nutrition.meals(id) ON DELETE CASCADE;


--
-- Name: food_aliases; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_aliases ENABLE ROW LEVEL SECURITY;

--
-- Name: food_aliases food_aliases_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_aliases_select ON nutrition.food_aliases FOR SELECT TO authenticated USING (true);


--
-- Name: food_categories; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: food_categories food_categories_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_categories_select ON nutrition.food_categories FOR SELECT TO authenticated USING (true);


--
-- Name: food_curation_candidates; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_curation_candidates ENABLE ROW LEVEL SECURITY;

--
-- Name: food_curation_candidates food_curation_candidates_select_admin; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_curation_candidates_select_admin ON nutrition.food_curation_candidates FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: food_curation_decisions; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_curation_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: food_curation_decisions food_curation_decisions_select_admin; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_curation_decisions_select_admin ON nutrition.food_curation_decisions FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: food_groups; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: food_groups food_groups_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_groups_select ON nutrition.food_groups FOR SELECT TO authenticated USING (true);


--
-- Name: food_nutrients; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_nutrients ENABLE ROW LEVEL SECURITY;

--
-- Name: food_nutrients food_nutrients_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_nutrients_select ON nutrition.food_nutrients FOR SELECT TO authenticated USING (true);


--
-- Name: food_preference_items; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preference_items food_preference_items_delete; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preference_items_delete ON nutrition.food_preference_items FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_insert; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preference_items_insert ON nutrition.food_preference_items FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preference_items_select ON nutrition.food_preference_items FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preference_items food_preference_items_update; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preference_items_update ON nutrition.food_preference_items FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preferences; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preferences food_preferences_delete; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preferences_delete ON nutrition.food_preferences FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_insert; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preferences_insert ON nutrition.food_preferences FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preferences_select ON nutrition.food_preferences FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: food_preferences food_preferences_update; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_preferences_update ON nutrition.food_preferences FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_tags; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.food_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: food_tags food_tags_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY food_tags_select ON nutrition.food_tags FOR SELECT TO authenticated USING (true);


--
-- Name: foods; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.foods ENABLE ROW LEVEL SECURITY;

--
-- Name: foods foods_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY foods_select ON nutrition.foods FOR SELECT TO authenticated USING (true);


--
-- Name: meal_items; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.meal_items ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_items meal_items_delete; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meal_items_delete ON nutrition.meal_items FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: meal_items meal_items_insert; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meal_items_insert ON nutrition.meal_items FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: meal_items meal_items_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meal_items_select ON nutrition.meal_items FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: meal_items meal_items_update; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meal_items_update ON nutrition.meal_items FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: meals; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.meals ENABLE ROW LEVEL SECURITY;

--
-- Name: meals meals_delete; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meals_delete ON nutrition.meals FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: meals meals_insert; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meals_insert ON nutrition.meals FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: meals meals_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meals_select ON nutrition.meals FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: meals meals_update; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY meals_update ON nutrition.meals FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: nutrient_defs; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.nutrient_defs ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrient_defs nutrient_defs_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY nutrient_defs_select ON nutrition.nutrient_defs FOR SELECT TO authenticated USING (true);


--
-- Name: preparation_kinds; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.preparation_kinds ENABLE ROW LEVEL SECURITY;

--
-- Name: preparation_kinds preparation_kinds_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY preparation_kinds_select ON nutrition.preparation_kinds FOR SELECT TO authenticated USING (true);


--
-- Name: search_synonyms; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.search_synonyms ENABLE ROW LEVEL SECURITY;

--
-- Name: search_synonyms search_synonyms_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY search_synonyms_select ON nutrition.search_synonyms FOR SELECT TO authenticated USING (true);


--
-- Name: tag_definitions; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.tag_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_definitions tag_definitions_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY tag_definitions_select ON nutrition.tag_definitions FOR SELECT TO authenticated USING (true);


--
-- Name: water_logs; Type: ROW SECURITY; Schema: nutrition; Owner: -
--

ALTER TABLE nutrition.water_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: water_logs water_logs_delete; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY water_logs_delete ON nutrition.water_logs FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: water_logs water_logs_insert; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY water_logs_insert ON nutrition.water_logs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: water_logs water_logs_select; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY water_logs_select ON nutrition.water_logs FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: water_logs water_logs_update; Type: POLICY; Schema: nutrition; Owner: -
--

CREATE POLICY water_logs_update ON nutrition.water_logs FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- PostgreSQL database dump complete
--

\unrestrict jDW5zI4CgrFWA3Td7wCeLdrMlFT5W2yUiB4ifucahZNA5i7xVNXi6B3DgpRv8yC

