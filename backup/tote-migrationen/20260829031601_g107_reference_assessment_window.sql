-- G-107: Zeitraum-Bewertung fuer Mikronaehrstoffe.
--
-- Die Tagesfunktion bleibt die alleinige Quelle fuer Profil-, Goal- und
-- Referenzauswahl. Diese Funktion reduziert nur die RPC-Aufrufe: Sie holt
-- die Tageswerte im Zeitraum im Datenbankprozess, mittelt Menge und
-- aufgeloeste Referenz getrennt und bewertet erst danach (E-24).

CREATE OR REPLACE FUNCTION nutrition.reference_assessment_window(
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
  nutrient_display_tier INTEGER,
  logged_day_count INTEGER,
  days_with_value INTEGER,
  complete_day_count INTEGER,
  actual_value NUMERIC,
  actual_value_min NUMERIC,
  actual_value_max NUMERIC,
  missing_count INTEGER,
  value_complete BOOLEAN,
  reference_kind TEXT,
  reference_direction TEXT,
  reference_value_min NUMERIC,
  reference_value_max NUMERIC,
  reference_unit TEXT,
  reference_basis TEXT,
  reference_pct NUMERIC,
  reference_pct_min NUMERIC,
  reference_pct_max NUMERIC,
  reference_status TEXT,
  daily_assessments JSONB,
  profile_age_years_min INTEGER,
  profile_age_years_max INTEGER,
  profile_biological_sex TEXT,
  profile_is_pregnant BOOLEAN,
  profile_pregnant_day_count INTEGER,
  profile_is_lactating BOOLEAN,
  profile_lactating_day_count INTEGER,
  source TEXT,
  source_locator TEXT,
  notes TEXT
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
daily AS (
  SELECT a.*
  FROM params p
  JOIN days d ON true
  CROSS JOIN LATERAL nutrition.daily_reference_assessment(p.user_id, d.entry_date) a
),
aggregated AS (
  SELECT
    nutrient_code,
    nutrient_name_de,
    nutrient_unit,
    nutrient_display_tier,
    reference_kind,
    MIN(reference_direction) AS reference_direction,
    MIN(reference_unit) AS reference_unit,
    MIN(reference_basis) AS reference_basis,
    COUNT(*)::INTEGER AS logged_day_count,
    COUNT(*) FILTER (WHERE actual_value IS NOT NULL)::INTEGER AS days_with_value,
    COUNT(*) FILTER (WHERE value_complete)::INTEGER AS complete_day_count,
    AVG(actual_value) AS actual_value,
    MIN(actual_value) AS actual_value_min,
    MAX(actual_value) AS actual_value_max,
    COALESCE(SUM(missing_count), 0)::INTEGER AS missing_count,
    BOOL_AND(value_complete) AS value_complete,
    ROUND(AVG(reference_value_min), 3) AS reference_value_min,
    ROUND(AVG(reference_value_max), 3) AS reference_value_max,
    CASE
      WHEN BOOL_OR(reference_status = 'missing_profile') THEN 'missing_profile'
      WHEN BOOL_OR(reference_status = 'no_applicable_reference') THEN 'no_applicable_reference'
      WHEN BOOL_OR(reference_status = 'incomplete') THEN 'incomplete'
      WHEN BOOL_OR(reference_status = 'no_value') THEN 'no_value'
      WHEN BOOL_OR(reference_status = 'not_applicable') THEN 'not_applicable'
      WHEN BOOL_OR(reference_status = 'missing_weight') THEN 'missing_weight'
      WHEN BOOL_OR(reference_status = 'missing_goal') THEN 'missing_goal'
      WHEN BOOL_OR(reference_status = 'energy_share') THEN 'energy_share'
      WHEN BOOL_OR(reference_status = 'nutrient_density') THEN 'nutrient_density'
      WHEN BOOL_AND(reference_status = 'complete') THEN 'complete'
      ELSE 'mixed'
    END AS reference_status,
    jsonb_agg(
      jsonb_build_object(
        'entry_date', entry_date,
        'actual_value', actual_value,
        'missing_count', missing_count,
        'value_complete', value_complete,
        'reference_value_min', reference_value_min,
        'reference_value_max', reference_value_max,
        'reference_pct', reference_pct,
        'reference_pct_min', reference_pct_min,
        'reference_pct_max', reference_pct_max,
        'reference_status', reference_status,
        'profile_age_years', profile_age_years,
        'profile_is_pregnant', profile_is_pregnant,
        'profile_is_lactating', profile_is_lactating,
        'source', source,
        'source_locator', source_locator,
        'notes', notes
      )
      ORDER BY entry_date
    ) AS daily_assessments,
    MIN(profile_age_years) AS profile_age_years_min,
    MAX(profile_age_years) AS profile_age_years_max,
    MIN(profile_biological_sex) AS profile_biological_sex,
    BOOL_AND(profile_is_pregnant) AS profile_is_pregnant,
    COUNT(*) FILTER (WHERE profile_is_pregnant)::INTEGER AS profile_pregnant_day_count,
    BOOL_AND(profile_is_lactating) AS profile_is_lactating,
    COUNT(*) FILTER (WHERE profile_is_lactating)::INTEGER AS profile_lactating_day_count,
    string_agg(DISTINCT source, ' | ' ORDER BY source) AS source,
    string_agg(DISTINCT source_locator, ' | ' ORDER BY source_locator) AS source_locator,
    string_agg(DISTINCT notes, ' | ' ORDER BY notes) AS notes
  FROM daily
  GROUP BY
    nutrient_code,
    nutrient_name_de,
    nutrient_unit,
    nutrient_display_tier,
    reference_kind
)
SELECT
  p.user_id,
  p.window_start,
  p.window_end,
  p.window_days,
  a.nutrient_code,
  a.nutrient_name_de,
  a.nutrient_unit,
  a.nutrient_display_tier,
  a.logged_day_count,
  a.days_with_value,
  a.complete_day_count,
  a.actual_value,
  a.actual_value_min,
  a.actual_value_max,
  a.missing_count,
  a.value_complete,
  a.reference_kind,
  a.reference_direction,
  a.reference_value_min,
  a.reference_value_max,
  a.reference_unit,
  a.reference_basis,
  CASE
    WHEN a.reference_status <> 'complete' THEN NULL
    WHEN COALESCE(a.reference_value_min, a.reference_value_max) IS NULL
      OR COALESCE(a.reference_value_min, a.reference_value_max) = 0 THEN NULL
    ELSE ROUND(a.actual_value / COALESCE(a.reference_value_min, a.reference_value_max) * 100, 1)
  END AS reference_pct,
  CASE
    WHEN a.reference_status <> 'complete'
      OR a.reference_value_min IS NULL OR a.reference_value_min = 0 THEN NULL
    ELSE ROUND(a.actual_value / a.reference_value_min * 100, 1)
  END AS reference_pct_min,
  CASE
    WHEN a.reference_status <> 'complete'
      OR a.reference_value_max IS NULL OR a.reference_value_max = 0 THEN NULL
    ELSE ROUND(a.actual_value / a.reference_value_max * 100, 1)
  END AS reference_pct_max,
  a.reference_status,
  a.daily_assessments,
  a.profile_age_years_min,
  a.profile_age_years_max,
  a.profile_biological_sex,
  a.profile_is_pregnant,
  a.profile_pregnant_day_count,
  a.profile_is_lactating,
  a.profile_lactating_day_count,
  a.source,
  a.source_locator,
  a.notes
FROM params p
JOIN aggregated a ON true
ORDER BY a.nutrient_display_tier, a.nutrient_code, a.reference_kind NULLS LAST;
$$;

COMMENT ON FUNCTION nutrition.reference_assessment_window(UUID, DATE, INTEGER) IS
  'G-107: Zeitraum-Bewertung fuer 1/7/14/30/45/60/90 Tage. Liest daily_reference_assessment je Kalendertag, liefert die geordnete Tagesreihe und mittelt Mengen und aufgeloeste Referenzen getrennt vor der Bewertung (E-24). Die Tagesfunktion bleibt bestehen.';

GRANT EXECUTE ON FUNCTION nutrition.reference_assessment_window(UUID, DATE, INTEGER)
  TO authenticated, service_role;
