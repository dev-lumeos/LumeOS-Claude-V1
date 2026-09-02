-- C-385 / E-57: Injektionsstellen modellieren belegte Rotation und
-- Gewebezustand getrennt. Fuer IM wird bewusst keine Ruhezeit in Tagen gesetzt.
BEGIN;

CREATE TABLE medical.injection_sites (
  id TEXT PRIMARY KEY CHECK (btrim(id) <> ''),
  route TEXT NOT NULL CHECK (route IN ('im', 'sc')),
  display_name TEXT NOT NULL CHECK (btrim(display_name) <> ''),
  minimum_rest_days INTEGER,
  minimum_rest_days_reason TEXT NOT NULL CHECK (btrim(minimum_rest_days_reason) <> ''),
  rotation_required BOOLEAN NOT NULL DEFAULT true,
  rotation_distance_mm INTEGER,
  rotation_quadrant_interval_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (minimum_rest_days IS NULL),
  CHECK (
    (route = 'im' AND rotation_distance_mm IS NULL AND rotation_quadrant_interval_days IS NULL)
    OR (route = 'sc' AND rotation_distance_mm = 10 AND rotation_quadrant_interval_days = 7)
  )
);

CREATE TABLE medical.injection_needle_recommendations (
  source_key TEXT PRIMARY KEY CHECK (btrim(source_key) <> ''),
  source_citation TEXT NOT NULL CHECK (btrim(source_citation) <> ''),
  route TEXT NOT NULL CHECK (route IN ('im', 'sc')),
  site TEXT NOT NULL CHECK (btrim(site) <> ''),
  medication_viscosity TEXT NOT NULL CHECK (btrim(medication_viscosity) <> ''),
  gauge_range TEXT NOT NULL CHECK (btrim(gauge_range) <> ''),
  length_range TEXT NOT NULL CHECK (btrim(length_range) <> ''),
  body_size_modifier TEXT NOT NULL CHECK (btrim(body_size_modifier) <> ''),
  applicability JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(applicability) = 'object'),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('guideline', 'study', 'practice_rule', 'product_label')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medical.injection_tissue_condition_guidance (
  condition_code TEXT PRIMARY KEY CHECK (condition_code IN ('lipohypertrophy')),
  source_citation TEXT NOT NULL CHECK (btrim(source_citation) <> ''),
  avoidance_min_months SMALLINT NOT NULL CHECK (avoidance_min_months = 3),
  avoidance_max_months SMALLINT NOT NULL CHECK (avoidance_max_months = 6),
  rationale TEXT NOT NULL CHECK (btrim(rationale) <> ''),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('guideline', 'study', 'practice_rule', 'product_label')),
  CHECK (avoidance_min_months <= avoidance_max_months)
);

CREATE TABLE medical.injection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  injection_site_id TEXT NOT NULL REFERENCES medical.injection_sites(id) ON DELETE RESTRICT,
  injected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX injection_logs_user_site_injected_at_idx
  ON medical.injection_logs(user_id, injection_site_id, injected_at DESC);

CREATE TABLE medical.injection_site_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  injection_site_id TEXT NOT NULL REFERENCES medical.injection_sites(id) ON DELETE RESTRICT,
  condition_code TEXT NOT NULL REFERENCES medical.injection_tissue_condition_guidance(condition_code) ON DELETE RESTRICT,
  detected_at DATE NOT NULL DEFAULT CURRENT_DATE,
  avoidance_months SMALLINT NOT NULL CHECK (avoidance_months BETWEEN 3 AND 6),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  resolved_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((status = 'active' AND resolved_at IS NULL) OR (status = 'resolved' AND resolved_at IS NOT NULL AND resolved_at >= detected_at))
);

CREATE INDEX injection_site_conditions_user_active_idx
  ON medical.injection_site_conditions(user_id, injection_site_id, detected_at DESC)
  WHERE status = 'active';

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
    FROM goals.body_measurements
    WHERE user_id = p_user_id
  ), latest AS (
    SELECT measurement_date, weight_kg, body_fat_pct, height_cm_snapshot, bmi
    FROM goals.body_measurements
    WHERE user_id = p_user_id
    ORDER BY measurement_date DESC, measurement_time DESC, created_at DESC, id DESC
    LIMIT 1
  ), profile AS (
    SELECT biological_sex, body_weight_kg, height_cm
    FROM public.profiles
    WHERE id = p_user_id
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

CREATE OR REPLACE FUNCTION medical.injection_needle_suggestions(
  p_site TEXT,
  p_route TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  source_key TEXT,
  source_citation TEXT,
  medication_viscosity TEXT,
  gauge_range TEXT,
  length_range TEXT,
  body_size_modifier TEXT,
  evidence_type TEXT,
  body_measurement_count INTEGER,
  body_measurement_date DATE,
  body_measurement_source TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH body AS (
    SELECT * FROM medical.injection_body_measurement_context(p_user_id)
  )
  SELECT
    r.source_key,
    r.source_citation,
    r.medication_viscosity,
    r.gauge_range,
    r.length_range,
    r.body_size_modifier,
    r.evidence_type,
    body.body_measurement_count,
    body.measurement_date,
    body.source
  FROM medical.injection_needle_recommendations r
  CROSS JOIN body
  WHERE r.site = p_site
    AND r.route = p_route
    AND (
      COALESCE((r.applicability->>'all')::BOOLEAN, false)
      OR (
        (NOT (r.applicability ? 'bmi_min') OR body.bmi >= (r.applicability->>'bmi_min')::NUMERIC)
        AND (NOT (r.applicability ? 'bmi_max') OR body.bmi <= (r.applicability->>'bmi_max')::NUMERIC)
        AND (NOT (r.applicability ? 'bmi_max_exclusive') OR body.bmi < (r.applicability->>'bmi_max_exclusive')::NUMERIC)
      )
    )
  ORDER BY r.source_key;
$$;

CREATE TRIGGER injection_sites_touch_updated_at
  BEFORE UPDATE ON medical.injection_sites
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();
CREATE TRIGGER injection_needle_recommendations_touch_updated_at
  BEFORE UPDATE ON medical.injection_needle_recommendations
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();
CREATE TRIGGER injection_logs_touch_updated_at
  BEFORE UPDATE ON medical.injection_logs
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();
CREATE TRIGGER injection_site_conditions_touch_updated_at
  BEFORE UPDATE ON medical.injection_site_conditions
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

ALTER TABLE medical.injection_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.injection_needle_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.injection_tissue_condition_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.injection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.injection_site_conditions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE medical.injection_sites, medical.injection_needle_recommendations,
  medical.injection_tissue_condition_guidance, medical.injection_logs,
  medical.injection_site_conditions FROM anon, authenticated;

GRANT SELECT ON medical.injection_sites, medical.injection_needle_recommendations,
  medical.injection_tissue_condition_guidance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.injection_logs,
  medical.injection_site_conditions TO authenticated;
GRANT ALL ON TABLE medical.injection_sites, medical.injection_needle_recommendations,
  medical.injection_tissue_condition_guidance, medical.injection_logs,
  medical.injection_site_conditions TO service_role;
GRANT EXECUTE ON FUNCTION medical.injection_body_measurement_context(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION medical.injection_needle_suggestions(TEXT, TEXT, UUID) TO authenticated, service_role;

CREATE POLICY injection_sites_select ON medical.injection_sites
  FOR SELECT TO authenticated USING (true);
CREATE POLICY injection_needle_recommendations_select ON medical.injection_needle_recommendations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY injection_tissue_condition_guidance_select ON medical.injection_tissue_condition_guidance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY injection_logs_select ON medical.injection_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_logs_insert ON medical.injection_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_logs_update ON medical.injection_logs
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_logs_delete ON medical.injection_logs
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_site_conditions_select ON medical.injection_site_conditions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_site_conditions_insert ON medical.injection_site_conditions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_site_conditions_update ON medical.injection_site_conditions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY injection_site_conditions_delete ON medical.injection_site_conditions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE medical.injection_sites IS
  'C-385/E-57: Orte mit Rotationsregel; minimum_rest_days bleibt bewusst NULL.';
COMMENT ON TABLE medical.injection_needle_recommendations IS
  'C-385/E-57: Eine Quellenvariante je Zeile, ohne Rangfolge.';
COMMENT ON TABLE medical.injection_site_conditions IS
  'C-385/E-57: Gewebezustand ist eine eigene Sperre, keine verlaengerte Ruhezeit.';

COMMIT;
