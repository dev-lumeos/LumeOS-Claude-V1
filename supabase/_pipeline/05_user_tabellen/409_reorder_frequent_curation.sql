-- 409 -- Nutrition-Nachbestellung, haeufig erfasste Positionen und Tag-Kuration
--
-- C-409: `nutrition_reorder` ist in beiden Listen-CHECKs erlaubt.
-- G-279/E-56: eine haeufige Position zaehlt Tage je Mahlzeitart, nicht Items.
-- C-31/E-55: nur eine explizite Admin-RPC darf das kuratierte Tag-Overlay schreiben.

\set ON_ERROR_STOP on

BEGIN;

-- G-279: Der Zeitraum entspricht den Insights (heute und 29 Tage
-- davor). Eine Position ist BLS- oder Custom-Food per ID; bei manuell
-- erfassten Items ist ihr Name der stabile, nicht wegzulassende Schluessel.
-- `days_used` zaehlt deshalb eine Position an einem Kalendertag nur
-- einmal, auch wenn sie mehrfach in der Mahlzeit vorkommt.
CREATE OR REPLACE VIEW nutrition.frequent_food_positions
WITH (security_invoker = true) AS
WITH window_items AS (
  SELECT
    mi.user_id,
    m.meal_type,
    mi.food_source,
    mi.food_id,
    mi.custom_food_id,
    mi.food_name,
    m.entry_date,
    mi.id,
    CASE
      WHEN mi.food_source = 'bls' THEN 'bls:' || mi.food_id::text
      WHEN mi.food_source = 'custom' THEN 'custom:' || mi.custom_food_id::text
      ELSE 'manual:' || lower(btrim(mi.food_name))
    END AS position_key
  FROM nutrition.meals m
  JOIN nutrition.meal_items mi ON mi.meal_id = m.id
  WHERE m.entry_date BETWEEN CURRENT_DATE - 29 AND CURRENT_DATE
), meal_type_days AS (
  SELECT
    user_id,
    meal_type,
    count(DISTINCT entry_date)::integer AS days_with_meal_type
  FROM window_items
  GROUP BY user_id, meal_type
), positions AS (
  SELECT
    user_id,
    meal_type,
    position_key,
    min(food_source) AS food_source,
    (array_agg(food_id))[1] AS food_id,
    (array_agg(custom_food_id))[1] AS custom_food_id,
    (array_agg(food_name ORDER BY entry_date DESC, id DESC))[1] AS food_name,
    count(DISTINCT entry_date)::integer AS days_used,
    count(*)::integer AS entry_count,
    max(entry_date) AS last_logged_on
  FROM window_items
  GROUP BY user_id, meal_type, position_key
), ranked AS (
  SELECT
    p.*,
    d.days_with_meal_type,
    row_number() OVER (
      PARTITION BY p.user_id, p.meal_type
      ORDER BY p.days_used DESC, p.last_logged_on DESC, p.position_key
    ) AS position_rank
  FROM positions p
  JOIN meal_type_days d USING (user_id, meal_type)
)
SELECT
  user_id,
  meal_type,
  food_source,
  food_id,
  custom_food_id,
  food_name,
  days_used,
  days_with_meal_type,
  entry_count,
  last_logged_on
FROM ranked
WHERE position_rank = 1;

GRANT SELECT ON nutrition.frequent_food_positions TO authenticated, service_role;

-- C-31: Die Tabelle bleibt ohne authenticated-INSERT/UPDATE-Grants.
-- SECURITY DEFINER ist hier nur der enge, serverseitige Schreibkanal;
-- die Berechtigung wird vor dem Upsert ausschliesslich gegen den
-- app_metadata-Claim in public.is_admin() entschieden.
CREATE OR REPLACE FUNCTION nutrition.curate_food_tag(
  p_food_id UUID,
  p_tag_code TEXT,
  p_action TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'curate_food_tag: Adminrolle erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF p_action IS NULL OR p_action NOT IN ('set', 'removed') THEN
    RAISE EXCEPTION 'curate_food_tag: ungueltige Aktion %', p_action
      USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM nutrition.foods WHERE id = p_food_id) THEN
    RAISE EXCEPTION 'curate_food_tag: Lebensmittel % nicht gefunden', p_food_id
      USING ERRCODE = 'P0002';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM nutrition.tag_definitions WHERE code = p_tag_code) THEN
    RAISE EXCEPTION 'curate_food_tag: Tag % nicht definiert', p_tag_code
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO nutrition.food_tags_kuriert (food_id, tag_code, action)
  VALUES (p_food_id, p_tag_code, p_action)
  ON CONFLICT (food_id, tag_code) DO UPDATE
    SET action = EXCLUDED.action;
END;
$function$;

REVOKE ALL ON FUNCTION nutrition.curate_food_tag(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.curate_food_tag(UUID, TEXT, TEXT)
  TO authenticated, service_role;

COMMENT ON VIEW nutrition.frequent_food_positions IS
  'G-279/E-56: je Nutzer und Mahlzeitart die haeufigste Position der letzten 30 Tage; days_used zaehlt Kalendertage, nicht Eintraege. Manuelle Positionen bleiben ueber food_name erhalten.';
COMMENT ON FUNCTION nutrition.curate_food_tag(UUID, TEXT, TEXT) IS
  'C-31/E-55: ausschliesslich admin-autorisierter serverseitiger Upsert fuer food_tags_kuriert; direkte authenticated-Schreibrechte bleiben entzogen.';

COMMIT;
