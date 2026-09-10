-- C-454 / E-79: Der Nutzer waehlt Flaechen je injizierbarer Substanz.
-- Der 16er-Katalog bleibt Fachwissen; er ist keine Erlaubnisliste.
BEGIN;

CREATE TABLE medical.user_injection_site_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  substance_id uuid NOT NULL REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  route text NOT NULL CHECK (route IN ('injection_im', 'injection_subq')),
  body_area_code text NOT NULL CHECK (body_area_code IN (
    'chest', 'abs', 'obliques', 'biceps', 'quadriceps', 'knees', 'tibialis',
    'gluteal', 'hamstring', 'triceps', 'deltoids', 'trapezius', 'neck',
    'forearm', 'adductors', 'calves', 'head', 'hands', 'ankles', 'feet', 'latissimus'
  )),
  needle_gauge text CHECK (needle_gauge IS NULL OR btrim(needle_gauge) <> ''),
  needle_length_in numeric(4,2) CHECK (needle_length_in IS NULL OR needle_length_in > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_injection_site_selections_unique UNIQUE (user_id, substance_id, route, body_area_code)
);

CREATE INDEX user_injection_site_selections_lookup_idx
  ON medical.user_injection_site_selections (user_id, substance_id, route);

CREATE OR REPLACE FUNCTION medical.validate_injection_site_selection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM supplements.supplement_pharmacology AS pharmacology
    WHERE pharmacology.supplement_id = NEW.substance_id
      AND pharmacology.route = NEW.route
  ) THEN
    RAISE EXCEPTION 'Die Auswahl braucht eine im Katalog belegte Injektionsroute'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION medical.validate_injection_site_selection() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER user_injection_site_selections_validate
  BEFORE INSERT OR UPDATE OF substance_id, route
  ON medical.user_injection_site_selections
  FOR EACH ROW EXECUTE FUNCTION medical.validate_injection_site_selection();
CREATE TRIGGER user_injection_site_selections_touch_updated_at
  BEFORE UPDATE ON medical.user_injection_site_selections
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

ALTER TABLE medical.user_injection_site_selections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE medical.user_injection_site_selections FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.user_injection_site_selections TO authenticated;
GRANT ALL ON TABLE medical.user_injection_site_selections TO service_role;

CREATE POLICY user_injection_site_selections_select
  ON medical.user_injection_site_selections FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_injection_site_selections_insert
  ON medical.user_injection_site_selections FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_injection_site_selections_update
  ON medical.user_injection_site_selections FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_injection_site_selections_delete
  ON medical.user_injection_site_selections FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION medical.configured_injection_areas(
  p_substance_id uuid,
  p_route text
)
RETURNS TABLE (
  body_area_code text,
  needle_gauge text,
  needle_length_in numeric,
  has_catalog_knowledge boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    selection.body_area_code,
    selection.needle_gauge,
    selection.needle_length_in,
    EXISTS (
      SELECT 1
      FROM medical.injection_sites AS site
      WHERE site.body_area_code = selection.body_area_code
        AND ((p_route = 'injection_im' AND site.route = 'im')
          OR (p_route = 'injection_subq' AND site.route = 'sc'))
        AND site.is_active
    ) AS has_catalog_knowledge
  FROM medical.user_injection_site_selections AS selection
  WHERE selection.user_id = (SELECT auth.uid())
    AND selection.substance_id = p_substance_id
    AND selection.route = p_route
  ORDER BY selection.body_area_code;
$$;

CREATE OR REPLACE FUNCTION medical.suggest_configured_injection_area(
  p_substance_id uuid,
  p_route text
)
RETURNS TABLE (
  body_area_code text,
  suggestion_reason text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH selected AS (
    SELECT selection.body_area_code
    FROM medical.user_injection_site_selections AS selection
    WHERE selection.user_id = (SELECT auth.uid())
      AND selection.substance_id = p_substance_id
      AND selection.route = p_route
  ), ranked AS (
    SELECT
      selected.body_area_code,
      max(log.injected_at) AS last_injected_at
    FROM selected
    LEFT JOIN medical.injection_logs AS log
      ON log.user_id = (SELECT auth.uid())
      AND log.substance_id = p_substance_id
      AND log.body_area_code = selected.body_area_code
    GROUP BY selected.body_area_code
  )
  SELECT ranked.body_area_code, 'configured_longest_rested'::text
  FROM ranked
  WHERE (SELECT count(*) FROM selected) > 1
  ORDER BY ranked.last_injected_at ASC NULLS FIRST, ranked.body_area_code
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION medical.configured_injection_areas(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION medical.suggest_configured_injection_area(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION medical.configured_injection_areas(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION medical.suggest_configured_injection_area(uuid, text) TO authenticated, service_role;

COMMENT ON TABLE medical.user_injection_site_selections IS
  'C-454/E-79: eigene Auswahl aus den 21 Kartenflaechen je injizierbarer Substanz und Route. Keine freie Koordinate, kein Katalogzwang; unbekannte Flaechen bleiben als fehlendes Fachwissen benannt.';
COMMENT ON FUNCTION medical.suggest_configured_injection_area(uuid, text) IS
  'C-454/E-79: waehlt ausschliesslich aus eigenen konfigurierten Flaechen nach der laengsten Pause; bei null oder einer Flaeche keine Suggestion. Kein gespeicherter injection_schedule.';

COMMIT;
