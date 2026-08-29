-- C-348: Netzantwort fuer den Nutrients-Reiter. Diese Funktion berechnet
-- keine Referenzwerte neu, sondern verdichtet ausschliesslich die bereits
-- von reference_assessment_window gelieferten Tagesbewertungen zu genau den
-- Kandidaten, die der bisherige Client aus daily_assessments ableitet.

CREATE OR REPLACE FUNCTION nutrition.reference_assessment_window_flags(
  p_user_id UUID,
  p_end_date DATE,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  nutrient_code TEXT,
  nutrient_name_de TEXT,
  reference_direction TEXT,
  triggered_day_count INTEGER,
  assessed_day_count INTEGER,
  incomplete_day_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $flags$
  WITH rules AS (
    SELECT 80::numeric AS covered_at_pct, 4::integer AS min_assessed_days,
           0.5::numeric AS pattern_share
  ), daily AS (
    SELECT
      w.nutrient_code,
      w.nutrient_name_de,
      w.reference_direction,
      d.reference_pct,
      d.reference_status
    FROM nutrition.reference_assessment_window(p_user_id, p_end_date, p_days) w
    CROSS JOIN LATERAL jsonb_to_recordset(w.daily_assessments) AS d(
      reference_pct numeric,
      reference_status text
    )
    WHERE w.reference_direction IN ('target', 'upper_limit')
  ), counts AS (
    SELECT
      nutrient_code,
      nutrient_name_de,
      reference_direction,
      count(*) FILTER (
        WHERE reference_status = 'complete' AND reference_pct IS NOT NULL
          AND (
            (reference_direction = 'upper_limit' AND reference_pct > 100)
            OR (reference_direction = 'target' AND reference_pct < 80)
          )
      )::integer AS triggered_day_count,
      count(*) FILTER (
        WHERE reference_status = 'complete' AND reference_pct IS NOT NULL
      )::integer AS assessed_day_count,
      count(*) FILTER (WHERE reference_status = 'incomplete')::integer AS incomplete_day_count
    FROM daily
    GROUP BY nutrient_code, nutrient_name_de, reference_direction
  )
  SELECT
    c.nutrient_code,
    c.nutrient_name_de,
    c.reference_direction,
    c.triggered_day_count,
    c.assessed_day_count,
    c.incomplete_day_count
  FROM counts c
  CROSS JOIN rules r
  WHERE c.assessed_day_count >= r.min_assessed_days
    AND c.triggered_day_count >= c.assessed_day_count * r.pattern_share
  ORDER BY c.nutrient_code, c.reference_direction;
$flags$;

COMMENT ON FUNCTION nutrition.reference_assessment_window_flags(UUID, DATE, INTEGER) IS
  'C-348: Verdichtet die vorhandene reference_assessment_window-Auswertung zu Flag-Kandidaten; keine zweite Referenzrechnung und kein daily_assessments-jsonb in der Antwort.';

REVOKE ALL ON FUNCTION nutrition.reference_assessment_window_flags(UUID, DATE, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.reference_assessment_window_flags(UUID, DATE, INTEGER)
  TO authenticated, service_role;
