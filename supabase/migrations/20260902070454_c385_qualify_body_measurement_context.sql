-- C-385: Rueckgabespalten einer PL/pgSQL-Tabelle muessen von Quellspalten
-- qualifiziert werden, damit der Kontext gegen die Live-Tabellen lesbar ist.
CREATE OR REPLACE FUNCTION medical.injection_body_measurement_context(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  body_measurement_count INTEGER,
  measurement_date DATE,
  biological_sex TEXT,
  weight_kg NUMERIC,
  body_fat_pct NUMERIC,
  height_cm NUMERIC,
  bmi NUMERIC,
  source TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'injection_body_measurement_context braucht user_id oder auth.uid()';
  END IF;
  IF v_auth_uid IS NOT NULL AND v_auth_uid <> p_user_id THEN
    RAISE EXCEPTION 'injection_body_measurement_context darf nur eigene Koerperwerte lesen';
  END IF;

  RETURN QUERY
  WITH measurement_count AS (
    SELECT count(*)::INTEGER AS value
    FROM goals.body_measurements AS bm_count
    WHERE bm_count.user_id = p_user_id
  ), latest AS (
    SELECT bm_latest.measurement_date, bm_latest.weight_kg, bm_latest.body_fat_pct,
      bm_latest.height_cm_snapshot, bm_latest.bmi
    FROM goals.body_measurements AS bm_latest
    WHERE bm_latest.user_id = p_user_id
    ORDER BY bm_latest.measurement_date DESC, bm_latest.measurement_time DESC,
      bm_latest.created_at DESC, bm_latest.id DESC
    LIMIT 1
  ), profile AS (
    SELECT p.biological_sex, p.body_weight_kg, p.height_cm
    FROM public.profiles AS p
    WHERE p.id = p_user_id
  )
  SELECT
    measurement_count.value,
    latest.measurement_date,
    profile.biological_sex,
    COALESCE(latest.weight_kg, profile.body_weight_kg),
    latest.body_fat_pct,
    COALESCE(latest.height_cm_snapshot, profile.height_cm),
    COALESCE(
      latest.bmi,
      round(profile.body_weight_kg / NULLIF((profile.height_cm / 100) ^ 2, 0), 2)
    ),
    CASE WHEN latest.measurement_date IS NULL THEN 'profiles' ELSE 'body_measurements' END
  FROM measurement_count
  CROSS JOIN profile
  LEFT JOIN latest ON true;
END;
$$;
