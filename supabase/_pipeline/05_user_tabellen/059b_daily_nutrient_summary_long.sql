-- =============================================================
-- 059b — Tagesbilanz lang (C-157)
-- Datum: 2026-08-20
-- Zweck: nutrition.daily_nutrient_summary_long — eine Zeile je
--        Nutzer, Tag und Naehrstoff, fuer alle 138 nutrient_defs.
--
-- Laeuft NACH 053 (daily_summary) und 015 (nutrient_defs).
-- daily_summary bleibt als breite Kompatibilitaetssicht erhalten.
-- =============================================================

BEGIN;

-- C-157: Der Bewertungshorizont ist eine fachliche Eigenschaft des
-- Naehrstoffs, aber ohne Recherche nicht belastbar zu fuellen. Die
-- Spalten werden bewusst leer angelegt, damit A-22 sie quellenbasiert
-- fuellen kann.
ALTER TABLE nutrition.nutrient_defs
  ADD COLUMN IF NOT EXISTS assessment_horizon_days INTEGER,
  ADD COLUMN IF NOT EXISTS assessment_horizon_source TEXT,
  ADD COLUMN IF NOT EXISTS assessment_horizon_notes TEXT;

COMMENT ON COLUMN nutrition.nutrient_defs.assessment_horizon_days IS
  'C-157: Bewertungshorizont in Tagen. Leer, bis A-22 ihn quellenbasiert fuellt; keine geratenen Tages-/Wochenwerte.';
COMMENT ON COLUMN nutrition.nutrient_defs.assessment_horizon_source IS
  'Quelle fuer assessment_horizon_days. Leer, solange keine belastbare Quelle eingetragen ist.';
COMMENT ON COLUMN nutrition.nutrient_defs.assessment_horizon_notes IS
  'Begruendung oder Einschraenkung zum Bewertungshorizont; keine Bewertung und kein medizinisches Urteil.';

-- -------------------------------------------------------------
-- Lange Tagessicht.
-- security_invoker ist Pflicht: die Sicht liest meals und meal_items,
-- deren RLS-Policies die Nutzerzeilen schuetzen.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW nutrition.daily_nutrient_summary_long
WITH (security_invoker = true) AS
WITH day_base AS (
  SELECT
    m.user_id,
    m.entry_date,
    COUNT(DISTINCT m.id)::INTEGER AS meal_count,
    COUNT(mi.id)::INTEGER AS item_count
  FROM nutrition.meals m
  LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
  GROUP BY m.user_id, m.entry_date
),
item_base AS (
  SELECT
    m.user_id,
    m.entry_date,
    mi.id AS item_id,
    mi.enercc,
    mi.prot625,
    mi.fat,
    mi.cho,
    mi.fibt,
    mi.sugar,
    mi.fasat,
    mi.nacl,
    mi.water_g,
    mi.nutrients
  FROM nutrition.meals m
  JOIN nutrition.meal_items mi ON mi.meal_id = m.id
),
item_values AS (
  SELECT
    ib.user_id,
    ib.entry_date,
    ib.item_id,
    v.nutrient_code,
    v.value
  FROM item_base ib
  CROSS JOIN LATERAL (VALUES
    ('ENERCC', ib.enercc),
    ('PROT625', ib.prot625),
    ('FAT', ib.fat),
    ('CHO', ib.cho),
    ('FIBT', ib.fibt),
    ('SUGAR', ib.sugar),
    ('FASAT', ib.fasat),
    ('NACL', ib.nacl),
    ('WATER', ib.water_g)
  ) AS v(nutrient_code, value)
  WHERE v.value IS NOT NULL

  UNION ALL

  SELECT
    ib.user_id,
    ib.entry_date,
    ib.item_id,
    kv.key AS nutrient_code,
    kv.value::NUMERIC AS value
  FROM item_base ib
  CROSS JOIN LATERAL jsonb_each_text(ib.nutrients) AS kv(key, value)
  WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER')
    AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
),
agg AS (
  SELECT
    user_id,
    entry_date,
    nutrient_code,
    COUNT(*)::INTEGER AS value_count,
    SUM(value) AS total_value
  FROM item_values
  GROUP BY user_id, entry_date, nutrient_code
)
SELECT
  db.user_id,
  db.entry_date,
  nd.code AS nutrient_code,
  nd.name_de AS nutrient_name_de,
  nd.unit AS nutrient_unit,
  nd.group_de,
  nd.display_tier,
  nd.sort_index,
  db.meal_count,
  db.item_count,
  COALESCE(a.value_count, 0)::INTEGER AS value_count,
  (db.item_count - COALESCE(a.value_count, 0))::INTEGER AS missing_count,
  a.total_value,
  (db.item_count > 0 AND db.item_count = COALESCE(a.value_count, 0)) AS value_complete
FROM day_base db
CROSS JOIN nutrition.nutrient_defs nd
LEFT JOIN agg a
  ON a.user_id = db.user_id
 AND a.entry_date = db.entry_date
 AND a.nutrient_code = nd.code;

COMMENT ON VIEW nutrition.daily_nutrient_summary_long IS
  'C-157: Lange Tagesbilanz fuer alle 138 nutrient_defs. Eine Zeile je Nutzer, Tag und Naehrstoff; '
  'total_value plus value_count/missing_count statt breiter Spaltenpaare. '
  'Liest eingefrorene meal_items-Spalten fuer Schnellmakros und mi.nutrients fuer alle weiteren Codes. '
  'security_invoker=true, damit RLS von meals/meal_items greift. Keine Bewertung.';

GRANT SELECT ON nutrition.daily_nutrient_summary_long TO authenticated, service_role;

-- -------------------------------------------------------------
-- Zeitfenster: dieselbe lange Form ueber 1/7/14/30/45/60/90 Tage.
-- Summe und Schnitt werden getrennt ausgegeben.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION nutrition.nutrient_summary_window(
  p_user_id UUID,
  p_end_date DATE,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  user_id UUID,
  window_start DATE,
  window_end DATE,
  window_days INTEGER,
  nutrient_code TEXT,
  nutrient_name_de TEXT,
  nutrient_unit TEXT,
  group_de TEXT,
  display_tier INTEGER,
  sort_index INTEGER,
  logged_day_count INTEGER,
  days_with_value INTEGER,
  complete_day_count INTEGER,
  item_count INTEGER,
  value_count INTEGER,
  missing_count INTEGER,
  total_value NUMERIC,
  avg_per_calendar_day NUMERIC,
  avg_per_logged_day NUMERIC,
  avg_per_value_day NUMERIC
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH params AS (
  SELECT
    p_user_id AS user_id,
    (p_end_date - (GREATEST(p_days, 1) - 1))::DATE AS window_start,
    p_end_date AS window_end,
    GREATEST(p_days, 1)::INTEGER AS window_days
),
days AS (
  SELECT gs::DATE AS entry_date
  FROM params p
  CROSS JOIN generate_series(p.window_start, p.window_end, INTERVAL '1 day') AS gs
),
day_base AS (
  SELECT
    d.entry_date,
    COUNT(DISTINCT m.id)::INTEGER AS meal_count,
    COUNT(mi.id)::INTEGER AS item_count,
    (COUNT(DISTINCT m.id) > 0) AS day_logged
  FROM params p
  CROSS JOIN days d
  LEFT JOIN nutrition.meals m
    ON m.user_id = p.user_id
   AND m.entry_date = d.entry_date
  LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
  GROUP BY d.entry_date
),
item_base AS (
  SELECT
    m.entry_date,
    mi.id AS item_id,
    mi.enercc,
    mi.prot625,
    mi.fat,
    mi.cho,
    mi.fibt,
    mi.sugar,
    mi.fasat,
    mi.nacl,
    mi.water_g,
    mi.nutrients
  FROM params p
  JOIN nutrition.meals m
    ON m.user_id = p.user_id
   AND m.entry_date BETWEEN p.window_start AND p.window_end
  JOIN nutrition.meal_items mi ON mi.meal_id = m.id
),
item_values AS (
  SELECT
    ib.entry_date,
    ib.item_id,
    v.nutrient_code,
    v.value
  FROM item_base ib
  CROSS JOIN LATERAL (VALUES
    ('ENERCC', ib.enercc),
    ('PROT625', ib.prot625),
    ('FAT', ib.fat),
    ('CHO', ib.cho),
    ('FIBT', ib.fibt),
    ('SUGAR', ib.sugar),
    ('FASAT', ib.fasat),
    ('NACL', ib.nacl),
    ('WATER', ib.water_g)
  ) AS v(nutrient_code, value)
  WHERE v.value IS NOT NULL

  UNION ALL

  SELECT
    ib.entry_date,
    ib.item_id,
    kv.key AS nutrient_code,
    kv.value::NUMERIC AS value
  FROM item_base ib
  CROSS JOIN LATERAL jsonb_each_text(ib.nutrients) AS kv(key, value)
  WHERE kv.key NOT IN ('ENERCC','PROT625','FAT','CHO','FIBT','SUGAR','FASAT','NACL','WATER')
    AND kv.value ~ '^-?[0-9]+([.][0-9]+)?$'
),
agg AS (
  SELECT
    entry_date,
    nutrient_code,
    COUNT(*)::INTEGER AS value_count,
    SUM(value) AS total_value
  FROM item_values
  GROUP BY entry_date, nutrient_code
),
daily_values AS (
  SELECT
    db.entry_date,
    nd.code AS nutrient_code,
    nd.name_de AS nutrient_name_de,
    nd.unit AS nutrient_unit,
    nd.group_de,
    nd.display_tier,
    nd.sort_index,
    db.item_count,
    COALESCE(a.value_count, 0)::INTEGER AS value_count,
    (db.item_count - COALESCE(a.value_count, 0))::INTEGER AS missing_count,
    a.total_value,
    (db.item_count > 0 AND db.item_count = COALESCE(a.value_count, 0)) AS value_complete,
    db.day_logged
  FROM day_base db
  CROSS JOIN nutrition.nutrient_defs nd
  LEFT JOIN agg a
    ON a.entry_date = db.entry_date
   AND a.nutrient_code = nd.code
)
SELECT
  p.user_id,
  p.window_start,
  p.window_end,
  p.window_days,
  nd.code AS nutrient_code,
  nd.name_de AS nutrient_name_de,
  nd.unit AS nutrient_unit,
  nd.group_de,
  nd.display_tier,
  nd.sort_index,
  COUNT(*) FILTER (WHERE dv.day_logged)::INTEGER AS logged_day_count,
  COUNT(*) FILTER (WHERE dv.total_value IS NOT NULL)::INTEGER AS days_with_value,
  COUNT(*) FILTER (WHERE dv.value_complete)::INTEGER AS complete_day_count,
  COALESCE(SUM(dv.item_count), 0)::INTEGER AS item_count,
  COALESCE(SUM(dv.value_count), 0)::INTEGER AS value_count,
  COALESCE(SUM(dv.missing_count), 0)::INTEGER AS missing_count,
  SUM(dv.total_value) AS total_value,
  CASE
    WHEN SUM(dv.total_value) IS NULL THEN NULL
    ELSE ROUND(SUM(dv.total_value) / p.window_days, 3)
  END AS avg_per_calendar_day,
  CASE
    WHEN COUNT(*) FILTER (WHERE dv.day_logged) = 0
      OR SUM(dv.total_value) IS NULL THEN NULL
    ELSE ROUND(
      SUM(dv.total_value)
      / (COUNT(*) FILTER (WHERE dv.day_logged))::NUMERIC,
      3
    )
  END AS avg_per_logged_day,
  CASE
    WHEN COUNT(*) FILTER (WHERE dv.total_value IS NOT NULL) = 0
      OR SUM(dv.total_value) IS NULL THEN NULL
    ELSE ROUND(
      SUM(dv.total_value)
      / (COUNT(*) FILTER (WHERE dv.total_value IS NOT NULL))::NUMERIC,
      3
    )
  END AS avg_per_value_day
FROM params p
CROSS JOIN nutrition.nutrient_defs nd
JOIN daily_values dv ON dv.nutrient_code = nd.code
GROUP BY
  p.user_id,
  p.window_start,
  p.window_end,
  p.window_days,
  nd.code,
  nd.name_de,
  nd.unit,
  nd.group_de,
  nd.display_tier,
  nd.sort_index
ORDER BY nd.display_tier, nd.sort_index, nd.code;
$$;

COMMENT ON FUNCTION nutrition.nutrient_summary_window(UUID, DATE, INTEGER) IS
  'C-157: Lange Naehrstoffbilanz fuer Zeitfenster 1/7/14/30/45/60/90 Tage. '
  'Gibt Summe, Kalendertagsschnitt, Schnitt je protokolliertem Tag und Vollstaendigkeit aus; keine Bewertung.';

GRANT EXECUTE ON FUNCTION nutrition.nutrient_summary_window(UUID, DATE, INTEGER)
  TO authenticated, service_role;

DO $$
DECLARE
  v_codes INTEGER;
  v_cols INTEGER;
BEGIN
  SELECT count(*) INTO v_codes FROM nutrition.nutrient_defs;
  IF v_codes <> 138 THEN
    RAISE EXCEPTION 'daily_nutrient_summary_long: % nutrient_defs, erwartet 138', v_codes;
  END IF;

  SELECT count(*) INTO v_cols
  FROM information_schema.columns
  WHERE table_schema = 'nutrition'
    AND table_name = 'nutrient_defs'
    AND column_name IN (
      'assessment_horizon_days',
      'assessment_horizon_source',
      'assessment_horizon_notes'
    );
  IF v_cols <> 3 THEN
    RAISE EXCEPTION 'nutrient_defs: Bewertungshorizont-Spalten fehlen (%/3)', v_cols;
  END IF;
END $$;

COMMIT;
