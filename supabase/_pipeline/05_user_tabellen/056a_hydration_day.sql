-- =============================================================
-- 056a - Hydration-Status je Tag (C-55)
-- Zweck: nutrition.hydration_day(user_id, date) ergaenzt die Rohsicht
--        hydration_summary um Tagesziel, Glaszaehler und 14-Tage-Vergleich.
--
-- Laeuft NACH 056 und 090. Die Sicht 056 bleibt die Quelle fuer getrunkenes
-- Wasser plus Wasser aus Nahrung; 090 liefert public.profiles.body_weight_kg
-- fuer das Tagesziel.
-- =============================================================

BEGIN;

DROP FUNCTION IF EXISTS nutrition.hydration_day(UUID, DATE);

CREATE OR REPLACE FUNCTION nutrition.hydration_day(
  p_user_id UUID,
  p_entry_date DATE
)
RETURNS TABLE (
  user_id UUID,
  entry_date DATE,
  logged_ml NUMERIC,
  log_count INTEGER,
  food_ml NUMERIC,
  food_ml_missing INTEGER,
  total_ml NUMERIC,
  total_complete BOOLEAN,
  target_ml NUMERIC,
  target_source TEXT,
  target_available BOOLEAN,
  progress_pct NUMERIC,
  glass_size_ml INTEGER,
  glasses_total INTEGER,
  glasses_target INTEGER,
  avg_14d_total_ml NUMERIC,
  avg_14d_days INTEGER,
  delta_vs_14d_ml NUMERIC,
  behind_14d_avg_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH profile AS (
  SELECT
    p.id AS user_id,
    p.body_weight_kg
  FROM public.profiles p
  WHERE p.id = p_user_id
),
today AS (
  SELECT
    p.user_id,
    p_entry_date AS entry_date,
    h.logged_ml,
    h.log_count,
    h.food_ml,
    h.food_ml_missing,
    h.total_ml,
    h.total_complete,
    CASE
      WHEN p.body_weight_kg IS NULL THEN NULL
      ELSE ROUND(p.body_weight_kg * 35)
    END AS target_ml,
    CASE
      WHEN p.body_weight_kg IS NULL THEN 'missing_body_weight'
      ELSE 'profile_body_weight_35_ml_per_kg'
    END AS target_source
  FROM profile p
  LEFT JOIN nutrition.hydration_summary h
    ON h.user_id = p.user_id
   AND h.entry_date = p_entry_date
),
history_days AS (
  SELECT generate_series(p_entry_date - INTERVAL '14 days', p_entry_date - INTERVAL '1 day', INTERVAL '1 day')::date AS entry_date
),
history AS (
  SELECT
    ROUND(AVG(COALESCE(h.total_ml, 0)), 1) AS avg_14d_total_ml,
    COUNT(*)::INTEGER AS avg_14d_days
  FROM history_days d
  LEFT JOIN nutrition.hydration_summary h
    ON h.user_id = p_user_id
   AND h.entry_date = d.entry_date
)
SELECT
  t.user_id,
  t.entry_date,
  COALESCE(t.logged_ml, 0) AS logged_ml,
  COALESCE(t.log_count, 0)::INTEGER AS log_count,
  t.food_ml,
  COALESCE(t.food_ml_missing, 0)::INTEGER AS food_ml_missing,
  COALESCE(t.total_ml, 0) AS total_ml,
  COALESCE(t.total_complete, true) AS total_complete,
  t.target_ml,
  t.target_source,
  (t.target_ml IS NOT NULL) AS target_available,
  CASE
    WHEN t.target_ml IS NULL OR t.target_ml = 0 THEN NULL
    ELSE ROUND(COALESCE(t.total_ml, 0) / t.target_ml * 100, 1)
  END AS progress_pct,
  250 AS glass_size_ml,
  FLOOR(COALESCE(t.total_ml, 0) / 250)::INTEGER AS glasses_total,
  CASE
    WHEN t.target_ml IS NULL THEN NULL
    ELSE CEIL(t.target_ml / 250)::INTEGER
  END AS glasses_target,
  h.avg_14d_total_ml,
  h.avg_14d_days,
  ROUND(COALESCE(t.total_ml, 0) - h.avg_14d_total_ml, 1) AS delta_vs_14d_ml,
  CASE
    WHEN h.avg_14d_total_ml IS NULL OR h.avg_14d_total_ml = 0 THEN NULL
    WHEN COALESCE(t.total_ml, 0) >= h.avg_14d_total_ml THEN 0
    ELSE ROUND((h.avg_14d_total_ml - COALESCE(t.total_ml, 0)) / h.avg_14d_total_ml * 100, 1)
  END AS behind_14d_avg_pct
FROM today t
CROSS JOIN history h;
$$;

COMMENT ON FUNCTION nutrition.hydration_day(UUID, DATE) IS
  'C-55: Lesefunktion fuer Hydration-Seitenleiste. Nutzt hydration_summary '
  'als Rohquelle, berechnet Ziel als body_weight_kg * 35 ml nach Vorgaengerrepo '
  'WaterTracker, liefert Glaszaehler zu 250 ml und Vergleich gegen die '
  'vorherigen 14 Kalendertage. Kein eigenes Zielmodell; ein historisiertes '
  'Wasserziel gehoert spaeter zu Goals.';

REVOKE ALL ON FUNCTION nutrition.hydration_day(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.hydration_day(UUID, DATE)
  TO authenticated, service_role;

COMMIT;
