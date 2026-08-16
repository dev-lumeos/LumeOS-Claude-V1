-- =============================================================
-- 056a - Hydration-Status je Tag (C-55)
-- Zweck: nutrition.hydration_day(user_id, date) ergaenzt die Rohsicht
--        hydration_summary um Tagesziel, Glaszaehler und 14-Tage-Vergleich.
--
-- Laeuft NACH 056 und 090. Die Sicht 056 bleibt die Quelle fuer getrunkenes
-- Wasser plus Wasser aus Nahrung; 090 liefert Profilwerte fuer das Tagesziel.
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
    p.body_weight_kg,
    p.activity_level,
    CASE p.activity_level
      WHEN 'sedentary' THEN 1.0000::numeric
      WHEN 'light' THEN 1.0833::numeric
      WHEN 'moderate' THEN 1.1667::numeric
      WHEN 'active' THEN 1.2500::numeric
      WHEN 'very_active' THEN 1.3333::numeric
      ELSE NULL::numeric
    END AS activity_factor,
    1.0000::numeric AS climate_factor,
    0::numeric AS training_bonus_ml,
    CASE
      WHEN p.pregnancy_started_on IS NOT NULL
       AND p.pregnancy_started_on <= p_entry_date
       AND (p.pregnancy_ended_on IS NULL OR p.pregnancy_ended_on >= p_entry_date)
        THEN 300::numeric
      ELSE 0::numeric
    END AS pregnancy_bonus_ml,
    CASE
      WHEN p.lactation_started_on IS NOT NULL
       AND p.lactation_started_on <= p_entry_date
       AND (p.lactation_ended_on IS NULL OR p.lactation_ended_on >= p_entry_date)
        THEN 1100::numeric
      ELSE 0::numeric
    END AS lactation_bonus_ml
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
      WHEN p.activity_factor IS NULL THEN NULL
      ELSE ROUND(
        (p.body_weight_kg * 30 * p.activity_factor * p.climate_factor)
        + p.training_bonus_ml
        + p.pregnancy_bonus_ml
        + p.lactation_bonus_ml
      )
    END AS target_ml,
    CASE
      WHEN p.body_weight_kg IS NULL THEN 'missing_body_weight'
      WHEN p.activity_factor IS NULL THEN 'missing_activity_level'
      ELSE concat(
        'profile_body_weight_activity_formula(',
        'base_30_ml_per_kg',
        '*activity_factor_', trim(to_char(p.activity_factor, 'FM999999990.0000')),
        '*climate_factor_', trim(to_char(p.climate_factor, 'FM999999990.0000')),
        '+training_bonus_', trim(to_char(p.training_bonus_ml, 'FM999999990')), '_ml',
        '+pregnancy_bonus_', trim(to_char(p.pregnancy_bonus_ml, 'FM999999990')), '_ml',
        '+lactation_bonus_', trim(to_char(p.lactation_bonus_ml, 'FM999999990')), '_ml',
        ')'
      )
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
  'als Rohquelle, berechnet Ziel als body_weight_kg * 30 ml * Aktivitaetsfaktor '
  '* Klimafaktor plus Trainings-/Schwangerschafts-/Stillzeitbonus, liefert '
  'Glaszaehler zu 250 ml und Vergleich gegen die vorherigen 14 Kalendertage. '
  'Klima steht bis zur Orts-/Gym-Anbindung auf 1.0, Trainingsbonus bis zu '
  'Trainingseinheiten auf 0 ml. Kein Maximum; progress_pct darf ueber 100 liegen.';

REVOKE ALL ON FUNCTION nutrition.hydration_day(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.hydration_day(UUID, DATE)
  TO authenticated, service_role;

COMMIT;
