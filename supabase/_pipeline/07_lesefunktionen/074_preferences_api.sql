-- =============================================================
-- 074 - Preferences API fuer Nutrition Search (G-11a)
-- Datum: 2026-08-17
-- Laeuft NACH 054 und NACH 060. Idempotent.
-- =============================================================
--
-- Zweck:
--   * food_preferences und food_preference_items sind seit 050/054 da,
--     aber leer und ohne RPC-Schicht.
--   * Diese Datei macht sie fuer die Anwendung les- und schreibbar,
--     ohne nutrition.food_search umzubauen.
--
-- Sicherheit:
--   SECURITY INVOKER ist Absicht. Die Funktionen nutzen die Tabellenrechte
--   und RLS-Policies des Aufrufers; sie umgehen keine Nutzergrenzen.
--
-- Was diese Datei NICHT tut:
--   * kein Ranking-Abzug/-Bonus in food_search
--   * kein hard-Ausschluss aus Suchergebnissen
--   * keine Kataloge fuer Allergie-/Cuisine-Codes
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION nutrition.food_preferences_read(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $function$
WITH prefs AS (
  SELECT
    fp.user_id,
    fp.diet_type,
    COALESCE(fp.allergies, '{}'::text[]) AS allergies,
    COALESCE(fp.intolerances, '{}'::text[]) AS intolerances,
    COALESCE(fp.general_exclusions, '{}'::text[]) AS general_exclusions,
    COALESCE(fp.preferred_cuisines, '{}'::text[]) AS preferred_cuisines,
    fp.meals_per_day,
    fp.snacks_per_day,
    fp.cooking_skill,
    fp.prep_time_max_min,
    fp.budget_level,
    fp.meal_prep_ok,
    fp.planner_notes,
    fp.updated_at
  FROM nutrition.food_preferences fp
  WHERE fp.user_id = p_user_id
),
items AS (
  SELECT
    fpi.id,
    fpi.user_id,
    fpi.preference,
    fpi.strength,
    fpi.target_type,
    fpi.food_id,
    f.bls_code,
    COALESCE(NULLIF(f.name_display_de, ''), f.name_de, f.bls_code) AS food_name,
    fpi.category_id,
    fc.slug AS category_slug,
    fc.name_de AS category_name_de,
    fpi.tag_code,
    td.name_de AS tag_name_de,
    fpi.cuisine_code,
    fpi.exclusion_preset_code,
    fpi.catalog_item_code,
    fpi.source,
    fpi.created_at,
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
  LEFT JOIN nutrition.foods f ON f.id = fpi.food_id
  LEFT JOIN nutrition.food_categories fc ON fc.id = fpi.category_id
  LEFT JOIN nutrition.tag_definitions td ON td.code = fpi.tag_code
  WHERE fpi.user_id = p_user_id
),
item_json AS (
  SELECT COALESCE(jsonb_agg(
    jsonb_strip_nulls(jsonb_build_object(
      'id', id,
      'preference', preference,
      'strength', strength,
      'constraint_level', constraint_level,
      'target_type', target_type,
      'food_id', food_id,
      'bls_code', bls_code,
      'food_name', food_name,
      'category_id', category_id,
      'category_slug', category_slug,
      'category_name_de', category_name_de,
      'tag_code', tag_code,
      'tag_name_de', tag_name_de,
      'cuisine_code', cuisine_code,
      'exclusion_preset_code', exclusion_preset_code,
      'catalog_item_code', catalog_item_code,
      'source', source,
      'created_at', created_at
    ))
    ORDER BY constraint_level, target_type, food_name, category_name_de, tag_code, cuisine_code
  ), '[]'::jsonb) AS value
  FROM items
),
search_levels AS (
  SELECT
    COALESCE(jsonb_agg(to_jsonb(i) - 'constraint_level') FILTER (WHERE constraint_level = 'hard'), '[]'::jsonb) AS hard,
    COALESCE(jsonb_agg(to_jsonb(i) - 'constraint_level') FILTER (WHERE constraint_level = 'strong'), '[]'::jsonb) AS strong,
    COALESCE(jsonb_agg(to_jsonb(i) - 'constraint_level') FILTER (WHERE constraint_level = 'soft'), '[]'::jsonb) AS soft,
    COALESCE(jsonb_agg(to_jsonb(i) - 'constraint_level') FILTER (WHERE constraint_level = 'boost'), '[]'::jsonb) AS boost
  FROM (
    SELECT
      constraint_level,
      target_type,
      food_id,
      category_id,
      tag_code,
      cuisine_code,
      exclusion_preset_code,
      catalog_item_code,
      preference,
      strength
    FROM items
    WHERE constraint_level <> 'neutral'
    ORDER BY constraint_level, target_type
  ) i
)
SELECT jsonb_build_object(
  'user_id', p_user_id,
  'preferences', COALESCE((
    SELECT jsonb_build_object(
      'diet_type', diet_type,
      'allergies', allergies,
      'intolerances', intolerances,
      'general_exclusions', general_exclusions,
      'preferred_cuisines', preferred_cuisines,
      'meals_per_day', meals_per_day,
      'snacks_per_day', snacks_per_day,
      'cooking_skill', cooking_skill,
      'prep_time_max_min', prep_time_max_min,
      'budget_level', budget_level,
      'meal_prep_ok', meal_prep_ok,
      'planner_notes', planner_notes,
      'updated_at', updated_at
    )
    FROM prefs
  ), jsonb_build_object(
    'diet_type', 'omnivore',
    'allergies', '[]'::jsonb,
    'intolerances', '[]'::jsonb,
    'general_exclusions', '[]'::jsonb,
    'preferred_cuisines', '[]'::jsonb,
    'meals_per_day', 3,
    'snacks_per_day', 1,
    'cooking_skill', 'intermediate',
    'prep_time_max_min', 30,
    'budget_level', 'medium',
    'meal_prep_ok', false,
    'planner_notes', '',
    'updated_at', NULL
  )),
  'items', (SELECT value FROM item_json),
  'search_application', jsonb_build_object(
    'hard', (SELECT hard FROM search_levels),
    'strong', (SELECT strong FROM search_levels),
    'soft', (SELECT soft FROM search_levels),
    'boost', (SELECT boost FROM search_levels)
  )
)
$function$;

COMMENT ON FUNCTION nutrition.food_preferences_read(uuid) IS
  'G-11a: liest die Nutrition-Praeferenzen eines Nutzers und bereitet '
  'die vier Suchstufen hard/strong/soft/boost vor. SECURITY INVOKER: '
  'RLS der Tabellen bleibt wirksam.';

CREATE OR REPLACE FUNCTION nutrition.food_preferences_write(
  p_user_id uuid,
  p_preferences jsonb,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
AS $function$
DECLARE
  v_items jsonb := COALESCE(p_items, '[]'::jsonb);
  v_preference_rows integer;
  v_item_count integer;
  v_touched_items integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'food_preferences_write: p_user_id is required';
  END IF;
  IF COALESCE(jsonb_typeof(p_preferences), 'object') <> 'object' THEN
    RAISE EXCEPTION 'food_preferences_write: p_preferences must be an object';
  END IF;
  IF jsonb_typeof(v_items) <> 'array' THEN
    RAISE EXCEPTION 'food_preferences_write: p_items must be an array';
  END IF;

  INSERT INTO nutrition.food_preferences (
    user_id,
    diet_type,
    allergies,
    intolerances,
    general_exclusions,
    preferred_cuisines,
    meals_per_day,
    snacks_per_day,
    cooking_skill,
    prep_time_max_min,
    budget_level,
    meal_prep_ok,
    planner_notes,
    updated_at
  )
  VALUES (
    p_user_id,
    COALESCE(NULLIF(p_preferences->>'diet_type', ''), 'omnivore'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_preferences->'allergies', '[]'::jsonb))), '{}'::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_preferences->'intolerances', '[]'::jsonb))), '{}'::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_preferences->'general_exclusions', '[]'::jsonb))), '{}'::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_preferences->'preferred_cuisines', '[]'::jsonb))), '{}'::text[]),
    COALESCE((p_preferences->>'meals_per_day')::integer, 3),
    COALESCE((p_preferences->>'snacks_per_day')::integer, 1),
    COALESCE(NULLIF(p_preferences->>'cooking_skill', ''), 'intermediate'),
    COALESCE((p_preferences->>'prep_time_max_min')::integer, 30),
    COALESCE(NULLIF(p_preferences->>'budget_level', ''), 'medium'),
    COALESCE((p_preferences->>'meal_prep_ok')::boolean, false),
    COALESCE(p_preferences->>'planner_notes', ''),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    diet_type = EXCLUDED.diet_type,
    allergies = EXCLUDED.allergies,
    intolerances = EXCLUDED.intolerances,
    general_exclusions = EXCLUDED.general_exclusions,
    preferred_cuisines = EXCLUDED.preferred_cuisines,
    meals_per_day = EXCLUDED.meals_per_day,
    snacks_per_day = EXCLUDED.snacks_per_day,
    cooking_skill = EXCLUDED.cooking_skill,
    prep_time_max_min = EXCLUDED.prep_time_max_min,
    budget_level = EXCLUDED.budget_level,
    meal_prep_ok = EXCLUDED.meal_prep_ok,
    planner_notes = EXCLUDED.planner_notes,
    updated_at = now();

  GET DIAGNOSTICS v_preference_rows = ROW_COUNT;
  IF v_preference_rows <> 1 THEN
    RAISE EXCEPTION 'food_preferences_write: no preference row written for %', p_user_id;
  END IF;

  IF to_regclass('pg_temp.food_preferences_write_items') IS NOT NULL THEN
    DROP TABLE pg_temp.food_preferences_write_items;
  END IF;
  CREATE TEMP TABLE food_preferences_write_items ON COMMIT DROP AS
  SELECT
    row_number() OVER () AS item_no,
    x.preference,
    COALESCE(x.strength, 'neutral') AS strength,
    x.target_type,
    x.food_id,
    x.category_id,
    NULLIF(x.tag_code, '') AS tag_code,
    NULLIF(x.cuisine_code, '') AS cuisine_code,
    NULLIF(x.exclusion_preset_code, '') AS exclusion_preset_code,
    NULLIF(x.catalog_item_code, '') AS catalog_item_code,
    COALESCE(NULLIF(x.source, ''), 'user') AS source,
    concat_ws(':',
      x.target_type,
      COALESCE(x.food_id::text, x.category_id::text, NULLIF(x.tag_code, ''),
        NULLIF(x.cuisine_code, ''), NULLIF(x.exclusion_preset_code, ''),
        NULLIF(x.catalog_item_code, ''))
    ) AS item_key
  FROM jsonb_to_recordset(v_items) AS x(
    preference text,
    strength text,
    target_type text,
    food_id uuid,
    category_id uuid,
    tag_code text,
    cuisine_code text,
    exclusion_preset_code text,
    catalog_item_code text,
    source text
  );

  SELECT COUNT(*) INTO v_item_count FROM pg_temp.food_preferences_write_items;
  IF EXISTS (
    SELECT 1
    FROM pg_temp.food_preferences_write_items
    GROUP BY item_key
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'food_preferences_write: duplicate preference item in payload';
  END IF;

  -- C-156: Einstellungen ersetzen nur Einstellungen. Ein Daumen- oder
  -- Suchtreffer-Eintrag, den die Oberflaeche nicht mitsendet, darf nicht
  -- durch einen Kachel-Speicherlauf verschwinden.
  DELETE FROM nutrition.food_preference_items existing
  WHERE existing.user_id = p_user_id
    AND existing.source = 'settings'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_temp.food_preferences_write_items incoming
      WHERE incoming.target_type = existing.target_type
        AND COALESCE(incoming.food_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(existing.food_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND COALESCE(incoming.category_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(existing.category_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND COALESCE(incoming.tag_code, '') = COALESCE(existing.tag_code, '')
        AND COALESCE(incoming.cuisine_code, '') = COALESCE(existing.cuisine_code, '')
        AND COALESCE(incoming.exclusion_preset_code, '') = COALESCE(existing.exclusion_preset_code, '')
        AND COALESCE(incoming.catalog_item_code, '') = COALESCE(existing.catalog_item_code, '')
    );

  WITH updated AS (
    UPDATE nutrition.food_preference_items existing
       SET preference = incoming.preference,
           strength = incoming.strength,
           source = COALESCE(NULLIF(existing.source, ''), incoming.source)
      FROM pg_temp.food_preferences_write_items incoming
     WHERE existing.user_id = p_user_id
       AND incoming.target_type = existing.target_type
       AND COALESCE(incoming.food_id, '00000000-0000-0000-0000-000000000000'::uuid)
         = COALESCE(existing.food_id, '00000000-0000-0000-0000-000000000000'::uuid)
       AND COALESCE(incoming.category_id, '00000000-0000-0000-0000-000000000000'::uuid)
         = COALESCE(existing.category_id, '00000000-0000-0000-0000-000000000000'::uuid)
       AND COALESCE(incoming.tag_code, '') = COALESCE(existing.tag_code, '')
       AND COALESCE(incoming.cuisine_code, '') = COALESCE(existing.cuisine_code, '')
       AND COALESCE(incoming.exclusion_preset_code, '') = COALESCE(existing.exclusion_preset_code, '')
       AND COALESCE(incoming.catalog_item_code, '') = COALESCE(existing.catalog_item_code, '')
    RETURNING incoming.item_no
  ), inserted AS (
    INSERT INTO nutrition.food_preference_items (
      user_id,
      preference,
      strength,
      target_type,
      food_id,
      category_id,
      tag_code,
      cuisine_code,
      exclusion_preset_code,
      catalog_item_code,
      source
    )
    SELECT
      p_user_id,
      incoming.preference,
      incoming.strength,
      incoming.target_type,
      incoming.food_id,
      incoming.category_id,
      incoming.tag_code,
      incoming.cuisine_code,
      incoming.exclusion_preset_code,
      incoming.catalog_item_code,
      incoming.source
    FROM pg_temp.food_preferences_write_items incoming
    WHERE NOT EXISTS (
      SELECT 1
      FROM updated u
      WHERE u.item_no = incoming.item_no
    )
    RETURNING 1
  )
  SELECT (SELECT COUNT(*) FROM updated) + (SELECT COUNT(*) FROM inserted)
    INTO v_touched_items;

  IF v_touched_items <> v_item_count THEN
    RAISE EXCEPTION 'food_preferences_write: wrote % of % preference items',
      v_touched_items, v_item_count;
  END IF;

  RETURN nutrition.food_preferences_read(p_user_id);
END;
$function$;

COMMENT ON FUNCTION nutrition.food_preferences_write(uuid, jsonb, jsonb) IS
  'C-156: schreibt Basis-Praeferenzen und fuehrt Preference-Items '
  'key-basiert zusammen. Nur source=settings wird durch die Einstellungsseite '
  'ersetzt; search_thumb und andere Herkuenfte bleiben erhalten. '
  'SECURITY INVOKER: Tabellenrechte, Checks, FKs und RLS bleiben die Zugriffskontrolle.';

REVOKE ALL ON FUNCTION nutrition.food_preferences_read(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.food_preferences_write(uuid, jsonb, jsonb) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION nutrition.food_preferences_read(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.food_preferences_write(uuid, jsonb, jsonb) TO authenticated, service_role;

COMMIT;
