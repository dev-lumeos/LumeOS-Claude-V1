-- C-455 / E-79: Der Katalog beschreibt fachliche Standardorte; die spaetere
-- Nutzerauswahl bleibt eine eigene Ebene (C-454). Keine Rotation wird gespeichert.
BEGIN;

ALTER TABLE medical.injection_sites
  ADD COLUMN IF NOT EXISTS max_volume_ml numeric(4,2),
  ADD COLUMN IF NOT EXISTS rest_days smallint,
  ADD COLUMN IF NOT EXISTS body_view text,
  ADD COLUMN IF NOT EXISTS x_pct smallint,
  ADD COLUMN IF NOT EXISTS y_pct smallint,
  ADD COLUMN IF NOT EXISTS needle_gauge text,
  ADD COLUMN IF NOT EXISTS needle_length_in numeric(4,2),
  ADD COLUMN IF NOT EXISTS landmark_note text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS body_area_code text;

ALTER TABLE medical.injection_sites
  DROP CONSTRAINT IF EXISTS injection_sites_max_volume_ml_check,
  DROP CONSTRAINT IF EXISTS injection_sites_rest_days_check,
  DROP CONSTRAINT IF EXISTS injection_sites_body_view_check,
  DROP CONSTRAINT IF EXISTS injection_sites_x_pct_check,
  DROP CONSTRAINT IF EXISTS injection_sites_y_pct_check,
  DROP CONSTRAINT IF EXISTS injection_sites_needle_gauge_check,
  DROP CONSTRAINT IF EXISTS injection_sites_needle_length_in_check,
  DROP CONSTRAINT IF EXISTS injection_sites_landmark_note_check,
  DROP CONSTRAINT IF EXISTS injection_sites_difficulty_check,
  DROP CONSTRAINT IF EXISTS injection_sites_body_area_code_check;
ALTER TABLE medical.injection_sites
  ADD CONSTRAINT injection_sites_max_volume_ml_check CHECK (max_volume_ml IS NULL OR max_volume_ml > 0),
  ADD CONSTRAINT injection_sites_rest_days_check CHECK (rest_days IS NULL OR rest_days > 0),
  ADD CONSTRAINT injection_sites_body_view_check CHECK (body_view IS NULL OR body_view IN ('front', 'back')),
  ADD CONSTRAINT injection_sites_x_pct_check CHECK (x_pct IS NULL OR x_pct BETWEEN 0 AND 100),
  ADD CONSTRAINT injection_sites_y_pct_check CHECK (y_pct IS NULL OR y_pct BETWEEN 0 AND 100),
  ADD CONSTRAINT injection_sites_needle_gauge_check CHECK (needle_gauge IS NULL OR btrim(needle_gauge) <> ''),
  ADD CONSTRAINT injection_sites_needle_length_in_check CHECK (needle_length_in IS NULL OR needle_length_in > 0),
  ADD CONSTRAINT injection_sites_landmark_note_check CHECK (landmark_note IS NULL OR btrim(landmark_note) <> ''),
  ADD CONSTRAINT injection_sites_difficulty_check CHECK (difficulty IS NULL OR difficulty IN ('standard', 'advanced')),
  ADD CONSTRAINT injection_sites_body_area_code_check CHECK (body_area_code IS NULL OR btrim(body_area_code) <> '');

-- E-57 bleibt unveraendert: minimum_rest_days ist absichtlich NULL, waehrend
-- rest_days nur die aus dem Planner uebernommene Katalogkonfiguration ist.
COMMENT ON COLUMN medical.injection_sites.rest_days IS
  'C-455 Planner-Konfiguration je Katalogort; nicht die klinische Mindest-Ruhezeit. medical.injection_sites.minimum_rest_days bleibt gemaess E-57 begruendet NULL.';
COMMENT ON COLUMN medical.injection_sites.body_area_code IS
  'C-455/E-79: Zuordnung des Katalogorts zu einer Muskelflaeche; die Nutzerwahl je Flaeche entsteht erst in C-454.';
COMMENT ON COLUMN medical.injection_sites.needle_gauge IS
  'C-455: Planner-Default, keine Ersatzempfehlung fuer medical.injection_needle_recommendations mit Quellenbezug.';

ALTER TABLE medical.injection_logs
  ADD COLUMN IF NOT EXISTS substance_id uuid REFERENCES supplements.supplements(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS dose_amount numeric(12,4),
  ADD COLUMN IF NOT EXISTS dose_unit text,
  ADD COLUMN IF NOT EXISTS needle_gauge text,
  ADD COLUMN IF NOT EXISTS needle_length_in numeric(4,2),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS stack_item_id uuid REFERENCES supplements.stack_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS body_area_code text;

ALTER TABLE medical.injection_logs
  ALTER COLUMN injection_site_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS injection_logs_dose_amount_check,
  DROP CONSTRAINT IF EXISTS injection_logs_dose_unit_check,
  DROP CONSTRAINT IF EXISTS injection_logs_needle_gauge_check,
  DROP CONSTRAINT IF EXISTS injection_logs_needle_length_in_check,
  DROP CONSTRAINT IF EXISTS injection_logs_body_area_code_check;
ALTER TABLE medical.injection_logs
  ADD CONSTRAINT injection_logs_dose_amount_check CHECK (dose_amount IS NULL OR dose_amount > 0),
  ADD CONSTRAINT injection_logs_dose_unit_check CHECK (dose_unit IS NULL OR btrim(dose_unit) <> ''),
  ADD CONSTRAINT injection_logs_needle_gauge_check CHECK (needle_gauge IS NULL OR btrim(needle_gauge) <> ''),
  ADD CONSTRAINT injection_logs_needle_length_in_check CHECK (needle_length_in IS NULL OR needle_length_in > 0),
  ADD CONSTRAINT injection_logs_body_area_code_check CHECK (btrim(body_area_code) <> '');
ALTER TABLE medical.injection_logs ALTER COLUMN body_area_code SET NOT NULL;

CREATE INDEX IF NOT EXISTS injection_logs_user_injected_at_idx
  ON medical.injection_logs (user_id, injected_at DESC);

CREATE OR REPLACE FUNCTION medical.validate_injection_log_links()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_site_area text;
BEGIN
  IF NEW.stack_item_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM supplements.stack_items AS item
    JOIN supplements.user_stacks AS stack ON stack.id = item.stack_id
    WHERE item.id = NEW.stack_item_id AND stack.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'injection_logs.stack_item_id muss zu einem eigenen Stack gehoeren'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.injection_site_id IS NOT NULL THEN
    SELECT site.body_area_code INTO v_site_area
    FROM medical.injection_sites AS site
    WHERE site.id = NEW.injection_site_id;
    IF v_site_area IS NULL OR v_site_area <> NEW.body_area_code THEN
      RAISE EXCEPTION 'injection_logs.body_area_code muss zur Katalogort-Zuordnung passen'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS injection_logs_validate_links ON medical.injection_logs;
CREATE TRIGGER injection_logs_validate_links
  BEFORE INSERT OR UPDATE OF user_id, injection_site_id, body_area_code, stack_item_id
  ON medical.injection_logs
  FOR EACH ROW EXECUTE FUNCTION medical.validate_injection_log_links();
REVOKE ALL ON FUNCTION medical.validate_injection_log_links() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS medical.injection_site_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id text NOT NULL REFERENCES medical.injection_sites(id) ON DELETE RESTRICT,
  max_volume_ml numeric(4,2),
  rest_days smallint,
  physician_note text NOT NULL CHECK (btrim(physician_note) <> ''),
  set_by_coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT injection_site_overrides_max_volume_ml_check CHECK (max_volume_ml IS NULL OR max_volume_ml > 0),
  CONSTRAINT injection_site_overrides_rest_days_check CHECK (rest_days IS NULL OR rest_days > 0),
  CONSTRAINT injection_site_overrides_value_check CHECK (max_volume_ml IS NOT NULL OR rest_days IS NOT NULL),
  CONSTRAINT injection_site_overrides_user_site_key UNIQUE (user_id, site_id)
);

CREATE OR REPLACE FUNCTION medical.log_injection_site_override()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO coach.action_log (
    coach_id, client_id, module, action_type, payload_snapshot, executed_by
  ) VALUES (
    NEW.set_by_coach_id, NEW.user_id, 'medical', 'injection_site_override',
    jsonb_build_object(
      'override_id', NEW.id, 'site_id', NEW.site_id,
      'max_volume_ml', NEW.max_volume_ml, 'rest_days', NEW.rest_days,
      'physician_note', NEW.physician_note, 'change_kind', TG_OP
    ),
    NEW.set_by_coach_id
  );
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION medical.log_injection_site_override() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS injection_site_overrides_touch_updated_at ON medical.injection_site_overrides;
CREATE TRIGGER injection_site_overrides_touch_updated_at
  BEFORE UPDATE ON medical.injection_site_overrides
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();
DROP TRIGGER IF EXISTS injection_site_overrides_audit ON medical.injection_site_overrides;
CREATE TRIGGER injection_site_overrides_audit
  AFTER INSERT OR UPDATE ON medical.injection_site_overrides
  FOR EACH ROW EXECUTE FUNCTION medical.log_injection_site_override();

ALTER TABLE medical.injection_site_overrides ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE medical.injection_site_overrides FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON medical.injection_site_overrides TO authenticated;
GRANT ALL ON TABLE medical.injection_site_overrides TO service_role;

DROP POLICY IF EXISTS injection_site_overrides_select ON medical.injection_site_overrides;
CREATE POLICY injection_site_overrides_select ON medical.injection_site_overrides
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (
      EXISTS (
        SELECT 1 FROM coach.relationships AS relationship
        WHERE relationship.coach_id = (SELECT auth.uid())
          AND relationship.client_id = injection_site_overrides.user_id
          AND relationship.status = 'active'
      )
      AND coach.hat_sicht(user_id, 'medical', 'full')
    )
  );
DROP POLICY IF EXISTS injection_site_overrides_insert ON medical.injection_site_overrides;
CREATE POLICY injection_site_overrides_insert ON medical.injection_site_overrides
  FOR INSERT TO authenticated
  WITH CHECK (
    set_by_coach_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM coach.relationships AS relationship
      WHERE relationship.coach_id = (SELECT auth.uid())
        AND relationship.client_id = injection_site_overrides.user_id
        AND relationship.status = 'active'
    )
    AND coach.hat_sicht(user_id, 'medical', 'full')
  );
DROP POLICY IF EXISTS injection_site_overrides_update ON medical.injection_site_overrides;
CREATE POLICY injection_site_overrides_update ON medical.injection_site_overrides
  FOR UPDATE TO authenticated
  USING (
    set_by_coach_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM coach.relationships AS relationship
      WHERE relationship.coach_id = (SELECT auth.uid())
        AND relationship.client_id = injection_site_overrides.user_id
          AND relationship.status = 'active'
    )
    AND coach.hat_sicht(user_id, 'medical', 'full')
  )
  WITH CHECK (
    set_by_coach_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM coach.relationships AS relationship
      WHERE relationship.coach_id = (SELECT auth.uid())
        AND relationship.client_id = injection_site_overrides.user_id
          AND relationship.status = 'active'
    )
    AND coach.hat_sicht(user_id, 'medical', 'full')
  );

COMMENT ON TABLE medical.injection_sites IS
  'C-385/E-57/C-441/C-455: fachlicher Katalog mit seitigen Planner-Defaults; minimum_rest_days bleibt bewusst NULL, die Nutzerauswahl entsteht getrennt in C-454.';
COMMENT ON TABLE medical.injection_logs IS
  'C-445/C-455/E-79: beobachtete Injektion mit Flaeche und optionalem Katalogort; die Flaeche ist fuer kuenftige nutzergewaehlte Orte massgeblich.';
COMMENT ON TABLE medical.injection_site_overrides IS
  'C-455: begruendete Coach-Override-Konfiguration, nur bei aktiver Medical-full-Beziehung; jede Aenderung schreibt das bestehende Coach-Ausfuehrungsprotokoll.';

COMMIT;
