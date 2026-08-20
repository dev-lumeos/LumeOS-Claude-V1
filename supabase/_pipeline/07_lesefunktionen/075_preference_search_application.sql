-- =============================================================
-- 073 — Suchfilter: Zubereitung und Warengruppe
-- Datum: 2026-08-14 · Laeuft NACH 072 und NACH 023. Idempotent.
-- =============================================================
--
-- ANLASS: Der BLS-Code traegt Warengruppe (erster Buchstabe) und
-- Zubereitung (Stellen 5-7). Beides war bisher nicht filterbar.
--
-- BAUART: dieselbe wie `p_category_slug` und `p_tag_code` — Parameter
-- an derselben Funktion, Bedingung im selben WHERE, Wert in der Antwort
-- gespiegelt. Kein zweiter Einstiegspunkt.
--
-- ERWEITERT STATT ERSETZT, und zwar mit DEFAULT-Werten am Ende:
-- `[cmd]` Es gibt heute genau EINE Signatur von `food_search`. Eine
-- zweite hat am 2026-08-04 PostgREST verwirrt (D-17-Vorgeschichte).
-- Neue Parameter mit `DEFAULT` am Ende halten die Aufrufe der
-- Anwendung gueltig, ohne eine Overload zu erzeugen — die alte
-- Parameterliste bleibt eine Teilmenge der neuen.
--
-- WARUM ZUBEREITUNG UEBER CODE **ODER** WORT:
-- `[cmd]` Fuer "roh" tragen 509 Lebensmittel beides, 338 nur den Code
-- 100, 153 nur das Wort im Namen. Ein Filter auf nur eine der beiden
-- Quellen liesse je nach Richtung 338 oder 153 Eintraege fallen.
-- Die Zuordnung steht in `nutrition.preparation_kinds` (Schritt 023),
-- jede Zeile mit ihrer Herkunft.
--
-- Erzeugt aus der Definition vom 2026-08-14; ausser Signatur, den drei
-- Filterbedingungen und der Antwort-Spiegelung ist alles unveraendert.
--
-- =============================================================
-- DIE ALTE SIGNATUR MUSS WEG — sonst entsteht genau die Overload
-- =============================================================
-- `[cmd]` 2026-08-14 gemessen: `CREATE OR REPLACE FUNCTION` mit
-- geaenderter Parameterliste ERSETZT nicht, es legt eine ZWEITE
-- Funktion an. Nach dem ersten Lauf standen zwei Signaturen da — genau
-- der Zustand, der am 2026-08-04 PostgREST verwirrt hat.
-- Deshalb wird die 10-Parameter-Fassung ausdruecklich entfernt. Der
-- DROP steht VOR dem CREATE und nennt die Signatur vollstaendig, damit
-- er nicht versehentlich die neue trifft.
-- `[cmd]` Eine Hilfsfunktion nutrition.such_gruppe(jsonb,integer), die
-- die Gruppen in sechs feste text[]-Slots aufloest, wurde gebaut und
-- wieder verworfen: sie war langsamer als die jsonb-Fassung
-- (704 ms gegen 562 ms). Begruendung an der Bedingung selbst.
-- Der DROP raeumt sie weg, falls sie irgendwo schon angelegt wurde.
DROP FUNCTION IF EXISTS nutrition.such_gruppe(jsonb, integer);

-- =============================================================
-- BLOCK 32 — C-25: Zubereitung in die Sortierung
-- =============================================================
-- Die eine Ursache hinter den meisten Fehlplatzierungen: `[cmd]`
-- "Banane roh" (F503100) und "Banane getrocknet" (F503400) haben BEIDE
-- sort_weight 660, also entscheidet das Alphabet — "getrocknet" vor
-- "roh". Der Zubereitungscode steht an fester Stelle im BLS-Code
-- (Stellen 5-7) und wurde bisher nur als FILTER benutzt, nie zum
-- Sortieren.
--
-- WARUM 000 UND 100 GLEICHAUF, statt nur 100 zu bevorzugen:
-- `[cmd]` Nur 847 von 7.140 Eintraegen tragen 100 (11,9 %), aber 984
-- tragen 000. Eine Regel, die allein 100 belohnt, wuerde die groessere
-- Gruppe schlechter stellen. `[cmd]` Von den 984 haben 888 ein
-- sort_weight > 0 und 658 sind die EINZIGE Form ihres Stammes (kein
-- Geschwistereintrag mit anderer Zubereitung) — sie haben keine
-- Rohform, sie SIND die Form: Hafer Flocken (C133000), Skyr, Mozzarella,
-- Olivenoel, Reis poliert roh (C352000).
-- `[cmd]` Die 96 Eintraege mit 000 UND sort_weight = 0 sind die
-- Gerichte (Kartoffelsouffle mit Bacon); die faengt sort_weight schon
-- ab, das ist die naechste Sortierstufe.
CREATE OR REPLACE FUNCTION nutrition.such_rang_zubereitung(p_bls_code text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $function$
  SELECT CASE WHEN substr(COALESCE(p_bls_code, ''), 5, 3) IN ('100', '000')
              THEN 1 ELSE 0 END;
$function$;

COMMENT ON FUNCTION nutrition.such_rang_zubereitung(text) IS
  'C-25: 1 fuer unzubereitete Formen (Zubereitungscode 100 = roh oder '
  '000 = einzige Form), sonst 0. Wer eine Zutat sucht, will die Rohform.';

-- =============================================================
-- BLOCK 32 — C-20: Wortgrenze vor Wortmitte
-- =============================================================
-- `[cmd]` "lachs" lieferte "Alaska-Pollack/Alaska-Seelachs", "tomaten"
-- lieferte "Heringsfilet in Tomatencreme". Die Bedingung vergleicht mit
-- LIKE '%tok%', ein Treffer INNERHALB eines laengeren Wortes zaehlt
-- also genauso viel wie das ganze Wort.
--
-- DREI STUFEN: 3 = der Name IST das Wort, 2 = Treffer an einer
-- Wortgrenze, 0 = nur Wortmitte.
--
-- WARUM WORTANFANG UND GANZES WORT GLEICHAUF (beide 2):
-- `[cmd]` Mit einer eigenen, niedrigeren Stufe fuer den Wortanfang
-- faellt "Haehnchen Brustfilet, roh" (V416100) hinter "Haehnchen Brust,
-- ohne Haut, gegrillt" zurueck — denn "brust" ist dort nur ein
-- Wortanfang. Das ist der Fall, der HEUTE schon richtig steht; die
-- Regel haette ihn kaputtgemacht. Genau davor hat Tom gewarnt: ein
-- Treffer auf ein zerlegtes Teil ist ein Wort-Treffer.
CREATE OR REPLACE FUNCTION nutrition.such_rang_wortgrenze(p_name text, p_groups jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $function$
  -- Je Gruppe die BESTE Alternative (GREATEST/max), ueber alle Gruppen
  -- die SCHLECHTESTE (LEAST/min): jede Gruppe muss gut sitzen, sonst
  -- traegt der Treffer nicht. Bei "haehnchenbrust" sind das
  -- [haehnchen|huhn] und [brust] — beide muessen Woerter treffen.
  SELECT CASE
    WHEN p_groups IS NULL OR jsonb_typeof(p_groups) <> 'array'
      OR jsonb_array_length(p_groups) = 0 THEN 0
    ELSE COALESCE((
      SELECT min(g.beste)
      FROM (
        SELECT grp.nr,
               COALESCE(max(CASE
                 WHEN nutrition.search_fold(COALESCE(p_name,'')) = a.alt THEN 3
                 WHEN nutrition.search_fold(COALESCE(p_name,'')) ~ ('\m' || a.alt) THEN 2
                 ELSE 0 END), 0) AS beste
        -- Gruppiert wird ueber die POSITION, nicht ueber den Inhalt:
        -- zwei gleiche Gruppen duerfen nicht zu einer verschmelzen.
        FROM jsonb_array_elements(p_groups) WITH ORDINALITY AS grp(gruppe, nr),
             LATERAL jsonb_array_elements_text(grp.gruppe) AS a(alt)
        GROUP BY grp.nr
      ) g
    ), 0)
  END;
$function$;

COMMENT ON FUNCTION nutrition.such_rang_wortgrenze(text, jsonb) IS
  'C-20: 3 = Name ist das Wort, 2 = Treffer an einer Wortgrenze, '
  '0 = nur Wortmitte. Max je Gruppe, Min ueber die Gruppen.';

-- =============================================================
-- C-17: Alias-Treffer je Gruppe, EINMAL statt je Zeile
-- =============================================================
-- `[cmd]` 2026-08-15 gemessen. Der Ausfuehrungsplan der alten Bedingung
-- zeigte fuer "huehnerbrust":
--   Seq Scan on foods            818 Buffer
--   Index Only Scan food_aliases 43.347 Buffer, loops=14212
-- Die Alias-Pruefung lief also je Lebensmittel UND je Alternative.
-- Sie war 98 % der Arbeit; der viel zitierte "fehlende Index auf
-- search_fold(name_de)" war es NICHT.
--
-- WARUM DYNAMISCHES SQL, und das ist kein Selbstzweck:
-- `[cmd]` Steht die Alternative als `a.alt` aus einem jsonb im
-- Ausdruck, kann Postgres den Trigramm-Index nicht nutzen — derselbe
-- Test lief mit **2.120.811** Buffern. Als Literal
-- (`LIKE '%huehner%'`) greift idx_food_aliases_fold_trgm sofort:
-- Bitmap Heap Scan, 248 Buffer, 5 ms.
-- quote_literal() schuetzt dabei gegen Einschleusung; die Werte kommen
-- ohnehin aus der Zerlegung der App, nicht ungeprueft vom Nutzer.
CREATE OR REPLACE FUNCTION nutrition.such_alias_treffer(p_groups jsonb)
RETURNS TABLE (nr integer, food_id uuid)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $function$
DECLARE
  v_gruppe jsonb;
  v_nr integer := 0;
  v_bed text;
BEGIN
  IF p_groups IS NULL OR jsonb_typeof(p_groups) <> 'array' THEN RETURN; END IF;
  FOR v_gruppe IN SELECT * FROM jsonb_array_elements(p_groups) LOOP
    v_nr := v_nr + 1;
    SELECT string_agg(
             'nutrition.search_fold(alias) LIKE ' || quote_literal('%' || a || '%'),
             ' OR ')
      INTO v_bed
      FROM jsonb_array_elements_text(v_gruppe) AS t(a)
      WHERE a <> '';
    CONTINUE WHEN v_bed IS NULL;
    RETURN QUERY EXECUTE
      'SELECT DISTINCT ' || v_nr || '::integer, fa.food_id
       FROM nutrition.food_aliases fa WHERE ' || v_bed;
  END LOOP;
END;
$function$;

COMMENT ON FUNCTION nutrition.such_alias_treffer(jsonb) IS
  'C-17: Food-IDs je Suchgruppe ueber die Aliase, einmal ermittelt '
  'statt je Zeile. Dynamisches SQL, damit der Trigramm-Index greift.';

DROP FUNCTION IF EXISTS nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer);
-- Dasselbe fuer die 13-Parameter-Fassung aus Block 29: p_token_groups
-- kommt hinzu, also entsteht sonst erneut eine zweite Signatur.
DROP FUNCTION IF EXISTS nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer,
  text[], text[], boolean);
DROP FUNCTION IF EXISTS nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer,
  text[], text[], boolean, jsonb);
-- =============================================================

CREATE OR REPLACE FUNCTION nutrition.food_search(p_query text, p_normalized_query text, p_tokens text[], p_selected_food_id uuid, p_category_slug text, p_category_id uuid, p_tag_code text, p_sort text, p_limit integer, p_offset integer, p_preparations text[] DEFAULT NULL, p_groups text[] DEFAULT NULL, p_basics_only boolean DEFAULT false, p_token_groups jsonb DEFAULT NULL, p_user_id uuid DEFAULT NULL)
 RETURNS json
 LANGUAGE sql
 STABLE
AS $function$
WITH RECURSIVE params AS (
  SELECT
    LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100) AS lim,
    GREATEST(COALESCE(p_offset, 0), 0) AS off,
    CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc','name_asc') THEN p_sort ELSE 'relevance' END AS sort
),
user_preference AS (
  SELECT
    fp.user_id,
    COALESCE(fp.diet_type, 'omnivore') AS diet_type,
    COALESCE(fp.allergies, '{}'::text[]) AS allergies,
    COALESCE(fp.intolerances, '{}'::text[]) AS intolerances,
    COALESCE(fp.general_exclusions, '{}'::text[]) AS general_exclusions
  FROM nutrition.food_preferences fp
  WHERE p_user_id IS NOT NULL
    AND fp.user_id = p_user_id
),
preference_items AS MATERIALIZED (
  SELECT
    fpi.id,
    fpi.user_id,
    fpi.preference,
    fpi.strength,
    fpi.target_type,
    fpi.food_id,
    fpi.category_id,
    fpi.tag_code,
    fpi.cuisine_code,
    fpi.exclusion_preset_code,
    CASE
      WHEN fpi.preference = 'hard_exclude'
        OR fpi.strength = 'hard_exclude' THEN 'hard'
      WHEN fpi.strength = 'strong_avoid' THEN 'strong'
      WHEN fpi.preference = 'disliked'
        OR fpi.strength = 'soft_dislike' THEN 'soft'
      WHEN fpi.preference = 'liked'
        OR fpi.strength IN ('like', 'boost') THEN 'boost'
      ELSE 'neutral'
    END AS constraint_level
  FROM nutrition.food_preference_items fpi
  WHERE p_user_id IS NOT NULL
    AND fpi.user_id = p_user_id
),
preference_category_tree AS (
  SELECT pi.id AS item_id, pi.category_id
  FROM preference_items pi
  WHERE pi.target_type = 'category'
    AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT pct.item_id, fc.id
  FROM preference_category_tree pct
  JOIN nutrition.food_categories fc ON fc.parent_id = pct.category_id
),
preference_category_ancestors AS (
  SELECT pi.id AS item_id, pi.category_id
  FROM preference_items pi
  WHERE pi.target_type = 'category'
    AND pi.category_id IS NOT NULL
  UNION ALL
  SELECT pca.item_id, fc.parent_id
  FROM preference_category_ancestors pca
  JOIN nutrition.food_categories fc ON fc.id = pca.category_id
  WHERE fc.parent_id IS NOT NULL
),
allergy_tag_map AS (
  SELECT * FROM (VALUES
    ('gluten_wheat', 'contains_gluten'),
    ('gluten', 'contains_gluten'),
    ('tree_nuts', 'contains_nuts'),
    ('peanuts', 'contains_nuts'),
    ('nuts', 'contains_nuts'),
    ('lactose', 'contains_lactose'),
    ('milk_protein', 'contains_lactose')
  ) AS m(source_code, tag_code)
),
preference_targets AS MATERIALIZED (
  SELECT
    pi.food_id,
    pi.constraint_level,
    'food'::text AS match_type,
    CASE
      WHEN pi.constraint_level = 'boost' THEN 100
      WHEN pi.constraint_level = 'soft' THEN -100
      WHEN pi.constraint_level = 'strong' THEN -75
      ELSE 0
    END AS score,
    30 AS specificity
  FROM preference_items pi
  WHERE pi.target_type = 'food'
    AND pi.food_id IS NOT NULL
    AND pi.constraint_level <> 'neutral'

  UNION ALL

  SELECT
    f.id,
    pi.constraint_level,
    'category'::text,
    CASE
      WHEN pi.constraint_level = 'boost' THEN 50
      WHEN pi.constraint_level = 'soft' THEN -50
      WHEN pi.constraint_level = 'strong' THEN -40
      ELSE 0
    END,
    20
  FROM preference_items pi
  JOIN (
    SELECT item_id, category_id FROM preference_category_tree
    UNION
    SELECT item_id, category_id FROM preference_category_ancestors
  ) pct ON pct.item_id = pi.id
  JOIN nutrition.foods f ON f.category_id = pct.category_id
  WHERE pi.constraint_level <> 'neutral'

  UNION ALL

  SELECT
    ft.food_id,
    pi.constraint_level,
    'tag'::text,
    CASE
      WHEN pi.constraint_level = 'boost' THEN 30
      WHEN pi.constraint_level = 'soft' THEN -30
      WHEN pi.constraint_level = 'strong' THEN -25
      ELSE 0
    END,
    10
  FROM preference_items pi
  JOIN nutrition.food_tags ft ON ft.tag_code = pi.tag_code
  WHERE pi.target_type = 'tag'
    AND pi.tag_code IS NOT NULL
    AND pi.constraint_level <> 'neutral'

  UNION ALL

  SELECT
    epm.food_id,
    pi.constraint_level,
    'exclusion_preset'::text,
    CASE
      WHEN pi.constraint_level = 'boost' THEN 30
      WHEN pi.constraint_level = 'soft' THEN -30
      WHEN pi.constraint_level = 'strong' THEN -25
      ELSE 0
    END,
    10
  FROM preference_items pi
  JOIN nutrition.exclusion_preset_matches epm
    ON epm.preset_code = pi.exclusion_preset_code
  WHERE pi.target_type = 'exclusion_preset'
    AND pi.exclusion_preset_code IS NOT NULL
    AND pi.constraint_level <> 'neutral'

  UNION ALL

  SELECT
    ft.food_id,
    'hard'::text,
    'allergy'::text,
    0,
    100
  FROM user_preference up
  JOIN allergy_tag_map m ON m.source_code = ANY(up.allergies)
  JOIN nutrition.food_tags ft ON ft.tag_code = m.tag_code

  UNION ALL

  SELECT
    ft.food_id,
    'strong'::text,
    'intolerance'::text,
    -25,
    90
  FROM user_preference up
  JOIN allergy_tag_map m ON m.source_code = ANY(up.intolerances)
  JOIN nutrition.food_tags ft ON ft.tag_code = m.tag_code

  UNION ALL

  SELECT
    ft.food_id,
    'hard'::text,
    'general_tag'::text,
    0,
    80
  FROM user_preference up
  JOIN nutrition.tag_definitions td ON td.code = ANY(up.general_exclusions)
  JOIN nutrition.food_tags ft ON ft.tag_code = td.code

  UNION ALL

  SELECT
    epm.food_id,
    'hard'::text,
    'general_preset'::text,
    0,
    80
  FROM user_preference up
  JOIN nutrition.exclusion_presets ep ON ep.code = ANY(up.general_exclusions)
  JOIN nutrition.exclusion_preset_matches epm ON epm.preset_code = ep.code

  UNION ALL

  SELECT
    f.id,
    'hard'::text,
    'diet_type'::text,
    0,
    70
  FROM user_preference up
  JOIN nutrition.foods f ON TRUE
  WHERE up.diet_type = 'vegan'
    AND NOT EXISTS (
      SELECT 1 FROM nutrition.food_tags ft
      WHERE ft.food_id = f.id AND ft.tag_code = 'vegan'
    )

  UNION ALL

  SELECT
    f.id,
    'hard'::text,
    'diet_type'::text,
    0,
    70
  FROM user_preference up
  JOIN nutrition.foods f ON TRUE
  WHERE up.diet_type = 'vegetarian'
    AND NOT EXISTS (
      SELECT 1 FROM nutrition.food_tags ft
      WHERE ft.food_id = f.id AND ft.tag_code = 'vegetarian'
    )

  UNION ALL

  SELECT
    f.id,
    'hard'::text,
    'diet_type'::text,
    0,
    70
  FROM user_preference up
  JOIN nutrition.foods f ON TRUE
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  WHERE up.diet_type = 'pescatarian'
    AND COALESCE(fc.food_group_code, substring(f.bls_code, 1, 1)) IN ('U', 'V', 'W')
),
preference_scores AS MATERIALIZED (
  SELECT
    food_id,
    bool_or(constraint_level = 'hard')
      OR (bool_or(constraint_level = 'strong')
          AND COALESCE(p_normalized_query, '') = '') AS preference_excluded,
    COALESCE((array_agg(score ORDER BY specificity DESC, abs(score) DESC))[1], 0) AS preference_score,
    (array_agg(constraint_level ORDER BY specificity DESC, abs(score) DESC))[1] AS preference_level,
    (array_agg(match_type ORDER BY specificity DESC, abs(score) DESC))[1] AS preference_match_type,
    COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
      'level', constraint_level,
      'type', match_type,
      'score', score
    )), '[]'::jsonb) AS preference_matches
  FROM preference_targets
  GROUP BY food_id
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
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    COALESCE(ps.preference_score, 0) AS preference_score,
    COALESCE(ps.preference_level, 'neutral') AS preference_level,
    COALESCE(ps.preference_match_type, '') AS preference_match_type,
    COALESCE(ps.preference_matches, '[]'::jsonb) AS preference_matches
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN preference_scores ps ON ps.food_id = f.id
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
    NOT COALESCE(ps.preference_excluded, false)
    AND
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
        -- C-17 (2026-08-15): Die Alias-Pruefung lief je Zeile UND je
        -- Alternative. `[cmd]` Der Plan zeigte fuer "huehnerbrust"
        -- einen Index Only Scan auf food_aliases mit loops=14212 und
        -- 43.347 von 44.165 Buffern (98 %) — der Seq Scan auf foods
        -- kostete nur 818. Der Engpass war NICHT der fehlende Index
        -- auf foods, sondern die korrelierte Unterabfrage.
        --
        -- Jetzt liefert nutrition.such_alias_treffer() die Food-IDs je
        -- Gruppe EINMAL. Sie baut ihre Bedingung dynamisch, damit die
        -- Alternativen als Literale im Plan stehen — nur dann nutzt
        -- Postgres idx_food_aliases_fold_trgm.
        -- `[cmd]` 43.316 -> 1.025 Buffer, 260 -> 93 ms, Trefferzahl
        -- unveraendert 31.
        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_token_groups) WITH ORDINALITY AS g(gruppe, nr)
          WHERE NOT (
            EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(g.gruppe) AS a(alt)
              WHERE nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || a.alt || '%'
            )
            OR (g.nr::integer, f.id) IN (
              SELECT t.nr, t.food_id
              FROM nutrition.such_alias_treffer(p_token_groups) t
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
    -- Warengruppe: C-99 nutzt die Bruecke food_categories -> food_groups.
    -- Der Praefix bleibt Rueckfall fuer Kategorien ohne eindeutige
    -- Gruppe, z.B. X/Y unter der gemischten Fertiggerichte-Wurzel.
    AND (
      p_groups IS NULL OR cardinality(p_groups) = 0
      OR EXISTS (
        SELECT 1
        FROM nutrition.food_categories fcg
        WHERE fcg.id = f.category_id
          AND fcg.food_group_code = ANY(p_groups)
      )
      OR (
        NOT EXISTS (
          SELECT 1
          FROM nutrition.food_categories fcg
          WHERE fcg.id = f.category_id
            AND fcg.food_group_code IS NOT NULL
        )
        AND substr(f.bls_code, 1, 1) = ANY(p_groups)
      )
    )
    -- Nur Grundnahrungsmittel: [cmd] X und Y sind zusammengesetzte
    -- Gerichte (2.050 Eintraege, sort_weight durchgaengig 0).
    AND (
      NOT COALESCE(p_basics_only, false)
      OR NOT EXISTS (
        SELECT 1 FROM nutrition.food_groups fg
        WHERE fg.code = COALESCE(
            (SELECT fcg.food_group_code
             FROM nutrition.food_categories fcg
             WHERE fcg.id = f.category_id),
            substr(f.bls_code, 1, 1)
          )
          AND fg.ist_gericht
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
    CASE WHEN (SELECT sort FROM params) = 'relevance'
         THEN COALESCE(ps.preference_score, 0) END DESC,
    -- BLOCK 32, die Reihenfolge der drei neuen Stufen ist GEMESSEN,
    -- nicht gewaehlt. `[cmd]` Gegen die 37 MealCam-Zutaten:
    --   ohne Regel                      12 von 37 auf Platz 1
    --   nur Wortgrenze (C-20)           12   — allein bringt sie nichts,
    --                                        weil danach das Alphabet
    --                                        entscheidet: alle sieben
    --                                        "Tomate …" stehen gleich
    --   nur Zubereitung (C-25)          23
    --   beide, Wortgrenze zuerst        23
    --   beide, Zubereitung zuerst       24
    --   + Namenskuerze                  29
    -- C-20 traegt also nur ZUSAMMEN mit C-25: sie holt die Tomate-Gruppe
    -- vor die Heringsfilets, und C-25 entscheidet dann innerhalb.
    CASE WHEN (SELECT sort FROM params) = 'relevance'
         THEN nutrition.such_rang_zubereitung(f.bls_code) END DESC,
    CASE WHEN (SELECT sort FROM params) = 'relevance'
         THEN nutrition.such_rang_wortgrenze(f.name_de, p_token_groups) END DESC,
    CASE WHEN (SELECT sort FROM params) IN ('relevance', 'protein_desc') THEN f.sort_weight END DESC NULLS LAST,
    -- Namenskuerze als STICHENTSCHEID, nach sort_weight.
    -- `[cmd]` Die Stufe vor sort_weight zu ziehen wurde gemessen und
    -- verworfen: sie holt zwar lachs, kartoffeln und spinat nach vorn,
    -- zerstoert dafuer aber reis (auf Platz 6, hinter "Reis Mehl"),
    -- mozzarella und mandeln (hinter "Mandeloel") — kurze Namen
    -- gewinnen dann unabhaengig davon, ob sie die Zutat sind.
    -- Unterm Strich beides 31 von 37, aber die spaetere Stellung haelt
    -- 35 statt 34 in den ersten drei. sort_weight leistet dort echte
    -- Arbeit; die Kuerze entscheidet nur, was es gleich gewichtet.
    CASE WHEN (SELECT sort FROM params) = 'relevance'
         THEN length(COALESCE(f.name_de, '')) END ASC,
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de, f.name_en, f.bls_code) ASC,
    f.bls_code ASC
  LIMIT (SELECT lim FROM params)
  OFFSET (SELECT off FROM params)
),
all_matching_food_ids AS (
  SELECT f.id
  FROM nutrition.foods f
  LEFT JOIN preference_scores ps ON ps.food_id = f.id
  WHERE
    NOT COALESCE(ps.preference_excluded, false)
    AND
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
        -- C-17 (2026-08-15): Die Alias-Pruefung lief je Zeile UND je
        -- Alternative. `[cmd]` Der Plan zeigte fuer "huehnerbrust"
        -- einen Index Only Scan auf food_aliases mit loops=14212 und
        -- 43.347 von 44.165 Buffern (98 %) — der Seq Scan auf foods
        -- kostete nur 818. Der Engpass war NICHT der fehlende Index
        -- auf foods, sondern die korrelierte Unterabfrage.
        --
        -- Jetzt liefert nutrition.such_alias_treffer() die Food-IDs je
        -- Gruppe EINMAL. Sie baut ihre Bedingung dynamisch, damit die
        -- Alternativen als Literale im Plan stehen — nur dann nutzt
        -- Postgres idx_food_aliases_fold_trgm.
        -- `[cmd]` 43.316 -> 1.025 Buffer, 260 -> 93 ms, Trefferzahl
        -- unveraendert 31.
        NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_token_groups) WITH ORDINALITY AS g(gruppe, nr)
          WHERE NOT (
            EXISTS (
              SELECT 1
              FROM jsonb_array_elements_text(g.gruppe) AS a(alt)
              WHERE nutrition.search_fold(concat_ws(' ', f.bls_code, f.name_de, f.name_en, f.name_th)) LIKE '%' || a.alt || '%'
            )
            OR (g.nr::integer, f.id) IN (
              SELECT t.nr, t.food_id
              FROM nutrition.such_alias_treffer(p_token_groups) t
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
      OR EXISTS (
        SELECT 1
        FROM nutrition.food_categories fcg
        WHERE fcg.id = f.category_id
          AND fcg.food_group_code = ANY(p_groups)
      )
      OR (
        NOT EXISTS (
          SELECT 1
          FROM nutrition.food_categories fcg
          WHERE fcg.id = f.category_id
            AND fcg.food_group_code IS NOT NULL
        )
        AND substr(f.bls_code, 1, 1) = ANY(p_groups)
      )
    )
    AND (
      NOT COALESCE(p_basics_only, false)
      OR NOT EXISTS (
        SELECT 1 FROM nutrition.food_groups fg
        WHERE fg.code = COALESCE(
            (SELECT fcg.food_group_code
             FROM nutrition.food_categories fcg
             WHERE fcg.id = f.category_id),
            substr(f.bls_code, 1, 1)
          )
          AND fg.ist_gericht
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
    COALESCE(tags.tags, ARRAY[]::text[]) AS tags,
    COALESCE(ps.preference_score, 0) AS preference_score,
    COALESCE(ps.preference_level, 'neutral') AS preference_level,
    COALESCE(ps.preference_match_type, '') AS preference_match_type,
    COALESCE(ps.preference_matches, '[]'::jsonb) AS preference_matches
  FROM nutrition.foods f
  LEFT JOIN nutrition.food_categories fc ON fc.id = f.category_id
  LEFT JOIN preference_scores ps ON ps.food_id = f.id
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
    AND NOT COALESCE(ps.preference_excluded, false)
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
        'tags', tags,
        'preference_score', preference_score,
        'preference_level', preference_level,
        'preference_match_type', preference_match_type,
        'preference_matches', preference_matches
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
        'tags', tags,
        'preference_score', preference_score,
        'preference_level', preference_level,
        'preference_match_type', preference_match_type,
        'preference_matches', preference_matches
      )
    )
    FROM matching_foods
  ), '[]'::json),
  'selected_food', (SELECT value FROM selected_food_json),
  'nutrients', (SELECT value FROM nutrients_json),
  'categories', (SELECT value FROM categories_json),
  'tags', (SELECT value FROM tags_json)
)
$function$;

COMMENT ON FUNCTION nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer,
  text[], text[], boolean, jsonb, uuid
) IS
  'C-94: Lebensmittelsuche mit optionaler Preference-Anwendung. '
  'p_user_id NULL behaelt die ungefilterte Suche; mit Nutzer greifen '
  'hard/strong/soft/boost aus food_preferences_read().';

REVOKE ALL ON FUNCTION nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer,
  text[], text[], boolean, jsonb, uuid
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION nutrition.food_search(
  text, text, text[], uuid, text, uuid, text, text, integer, integer,
  text[], text[], boolean, jsonb, uuid
) TO authenticated, service_role;
