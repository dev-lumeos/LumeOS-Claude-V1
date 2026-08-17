-- =============================================================
-- 130 -- Supplements-Schema (C-68)
-- Datum: 2026-08-17
-- Zweck: Katalog, Nutzer-Stack, Stack-Items, Einnahmeprotokoll und
--        Interaction-Struktur fuer das Supplements-Modul.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Zuschnitt:
--   [read] SPEC_06 beschreibt zehn Tabellen. C-68 baut nur den Katalog
--          und den Stack-Pfad, damit /v2/supplements echte Daten lesen
--          kann.
--   [read] Der Injection Planner Change Request ist juenger als SPEC_06,
--          bleibt aber eigener Scope: keine injection_logs/cycle_plans.
--   [cmd]  Vor diesem Schritt existiert kein Schema supplements.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS supplements;

CREATE OR REPLACE FUNCTION supplements.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS supplements.supplement_catalog (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL UNIQUE,
  name                    TEXT NOT NULL,
  name_de                 TEXT,
  name_en                 TEXT,
  name_th                 TEXT,
  category                TEXT NOT NULL
    CHECK (category IN ('Vitamins','Minerals','Performance','Recovery','Adaptogens',
                        'Sleep','Gut Health','Longevity','Amino Acids','Hormones','Other')),
  subcategory             TEXT,
  form                    TEXT
    CHECK (form IS NULL OR form IN ('capsule','tablet','powder','liquid','softgel','gummy','other')),
  evidence_grade          TEXT NOT NULL DEFAULT 'C'
    CHECK (evidence_grade IN ('S','A','B','C','D','F')),
  evidence_summary        TEXT,
  evidence_sources        JSONB NOT NULL DEFAULT '[]'::jsonb,
  benefits                TEXT[] NOT NULL DEFAULT '{}',
  side_effects            TEXT[] NOT NULL DEFAULT '{}',
  contraindications       TEXT[] NOT NULL DEFAULT '{}',
  allergy_flags           TEXT[] NOT NULL DEFAULT '{}',
  typical_dose_min        NUMERIC(10,3),
  typical_dose_max        NUMERIC(10,3),
  dose_unit               TEXT,
  serving_size            NUMERIC(10,3),
  serving_unit            TEXT,
  timing_default          TEXT NOT NULL DEFAULT 'morning'
    CHECK (timing_default IN ('morning','midday','evening','pre_workout',
                              'post_workout','bedtime','with_meal','any')),
  absorption_notes        TEXT,
  requires_food           BOOLEAN NOT NULL DEFAULT false,
  requires_empty_stomach  BOOLEAN NOT NULL DEFAULT false,
  requires_cycling        BOOLEAN NOT NULL DEFAULT false,
  cycling_protocol        JSONB,
  half_life_hours         NUMERIC(8,2),
  nutrients_provided      JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority                TEXT NOT NULL DEFAULT 'nice_to_have'
    CHECK (priority IN ('essential','top_needed','nice_to_have','avoid')),
  cost_per_serving        NUMERIC(8,3),
  source                  TEXT NOT NULL DEFAULT 'legacy_seed'
    CHECK (source IN ('legacy_seed','curated','import')),
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (jsonb_typeof(evidence_sources) = 'array'),
  CHECK (jsonb_typeof(nutrients_provided) = 'object'),
  CHECK (cycling_protocol IS NULL OR jsonb_typeof(cycling_protocol) = 'object'),
  CHECK (typical_dose_min IS NULL OR typical_dose_min >= 0),
  CHECK (typical_dose_max IS NULL OR typical_dose_max >= 0),
  CHECK (typical_dose_min IS NULL OR typical_dose_max IS NULL OR typical_dose_max >= typical_dose_min),
  CHECK (serving_size IS NULL OR serving_size > 0)
);

CREATE INDEX IF NOT EXISTS idx_supplement_catalog_category
  ON supplements.supplement_catalog(category);
CREATE INDEX IF NOT EXISTS idx_supplement_catalog_evidence
  ON supplements.supplement_catalog(evidence_grade);
CREATE INDEX IF NOT EXISTS idx_supplement_catalog_active
  ON supplements.supplement_catalog(is_active)
  WHERE is_active;

DROP TRIGGER IF EXISTS supplement_catalog_touch_updated_at ON supplements.supplement_catalog;
CREATE TRIGGER supplement_catalog_touch_updated_at
  BEFORE UPDATE ON supplements.supplement_catalog
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE TABLE IF NOT EXISTS supplements.supplement_interactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement1_id          UUID REFERENCES supplements.supplement_catalog(id) ON DELETE CASCADE,
  supplement1_name        TEXT,
  supplement2_id          UUID REFERENCES supplements.supplement_catalog(id) ON DELETE CASCADE,
  supplement2_name        TEXT,
  interaction_type        TEXT NOT NULL
    CHECK (interaction_type IN ('synergy','absorption','conflict','timing','contraindication')),
  severity                TEXT NOT NULL
    CHECK (severity IN ('info','caution','warning','critical')),
  description_de          TEXT,
  description_en          TEXT,
  recommendation_de       TEXT,
  recommendation_en       TEXT,
  timing_recommendation   TEXT
    CHECK (timing_recommendation IS NULL OR timing_recommendation IN ('separate_2h','separate_4h','separate_8h','take_together','avoid')),
  evidence_level          TEXT
    CHECK (evidence_level IS NULL OR evidence_level IN ('low','moderate','high')),
  evidence_sources        TEXT[] NOT NULL DEFAULT '{}',
  blocks_intake           BOOLEAN NOT NULL DEFAULT false,
  requires_confirmation   BOOLEAN NOT NULL DEFAULT false,
  source                  TEXT NOT NULL DEFAULT 'curated'
    CHECK (source IN ('curated','import','legacy_seed')),
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK ((supplement1_id IS NOT NULL OR supplement1_name IS NOT NULL)
     AND (supplement2_id IS NOT NULL OR supplement2_name IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_supplement_interactions_s1
  ON supplements.supplement_interactions(supplement1_id);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_s2
  ON supplements.supplement_interactions(supplement2_id);
CREATE INDEX IF NOT EXISTS idx_supplement_interactions_severity
  ON supplements.supplement_interactions(severity);

DROP TRIGGER IF EXISTS supplement_interactions_touch_updated_at ON supplements.supplement_interactions;
CREATE TRIGGER supplement_interactions_touch_updated_at
  BEFORE UPDATE ON supplements.supplement_interactions
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE TABLE IF NOT EXISTS supplements.user_stacks (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL CHECK (btrim(name) <> ''),
  description             TEXT,
  goal                    TEXT NOT NULL DEFAULT 'custom'
    CHECK (goal IN ('muscle_building','fat_loss','recovery_sleep','health',
                    'longevity','performance','custom')),
  source                  TEXT NOT NULL DEFAULT 'user'
    CHECK (source IN ('user','coach','marketplace','template')),
  source_ref_id           UUID,
  is_active               BOOLEAN NOT NULL DEFAULT false,
  total_monthly_cost      NUMERIC(8,2),
  item_count              INTEGER NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_stacks_user
  ON supplements.user_stacks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stacks_user_active
  ON supplements.user_stacks(user_id, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_stacks_one_active
  ON supplements.user_stacks(user_id)
  WHERE is_active;

DROP TRIGGER IF EXISTS user_stacks_touch_updated_at ON supplements.user_stacks;
CREATE TRIGGER user_stacks_touch_updated_at
  BEFORE UPDATE ON supplements.user_stacks
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE TABLE IF NOT EXISTS supplements.stack_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id                UUID NOT NULL REFERENCES supplements.user_stacks(id) ON DELETE CASCADE,
  supplement_id           UUID REFERENCES supplements.supplement_catalog(id),
  custom_name             TEXT,
  notes                   TEXT,
  dose                    NUMERIC(10,3) NOT NULL CHECK (dose > 0),
  dose_unit               TEXT NOT NULL CHECK (btrim(dose_unit) <> ''),
  frequency               TEXT NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily','weekdays','training_days','custom','cycling')),
  timing                  TEXT NOT NULL DEFAULT 'morning'
    CHECK (timing IN ('morning','midday','evening','pre_workout',
                      'post_workout','bedtime','with_meal','any')),
  cycling                 JSONB,
  stock_remaining         NUMERIC(10,2) CHECK (stock_remaining IS NULL OR stock_remaining >= 0),
  stock_unit              TEXT,
  low_stock_threshold     NUMERIC(10,2) CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0),
  sort_order              INTEGER NOT NULL DEFAULT 0,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  added_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (supplement_id IS NOT NULL OR custom_name IS NOT NULL),
  CHECK (cycling IS NULL OR jsonb_typeof(cycling) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_stack_items_stack
  ON supplements.stack_items(stack_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_stack_items_supplement
  ON supplements.stack_items(supplement_id)
  WHERE supplement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stack_items_low_stock
  ON supplements.stack_items(stack_id)
  WHERE stock_remaining IS NOT NULL
    AND low_stock_threshold IS NOT NULL
    AND stock_remaining <= low_stock_threshold;

DROP TRIGGER IF EXISTS stack_items_touch_updated_at ON supplements.stack_items;
CREATE TRIGGER stack_items_touch_updated_at
  BEFORE UPDATE ON supplements.stack_items
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE OR REPLACE FUNCTION supplements.refresh_stack_item_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_stack_id UUID;
BEGIN
  v_stack_id := COALESCE(NEW.stack_id, OLD.stack_id);
  UPDATE supplements.user_stacks us
  SET item_count = (
        SELECT count(*)::integer
        FROM supplements.stack_items si
        WHERE si.stack_id = v_stack_id
          AND si.is_active
      ),
      updated_at = now()
  WHERE us.id = v_stack_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS stack_items_refresh_count ON supplements.stack_items;
CREATE TRIGGER stack_items_refresh_count
  AFTER INSERT OR UPDATE OF is_active, stack_id OR DELETE ON supplements.stack_items
  FOR EACH ROW EXECUTE FUNCTION supplements.refresh_stack_item_count();

CREATE TABLE IF NOT EXISTS supplements.intake_logs (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_item_id               UUID REFERENCES supplements.stack_items(id) ON DELETE SET NULL,
  intake_date                 DATE NOT NULL,
  intake_time                 TIME,
  status                      TEXT NOT NULL DEFAULT 'taken'
    CHECK (status IN ('planned','taken','skipped','snoozed')),
  supplement_name_snapshot    TEXT NOT NULL CHECK (btrim(supplement_name_snapshot) <> ''),
  dose_snapshot               NUMERIC(10,3) NOT NULL CHECK (dose_snapshot > 0),
  dose_unit_snapshot          TEXT NOT NULL CHECK (btrim(dose_unit_snapshot) <> ''),
  actual_dose                 NUMERIC(10,3) CHECK (actual_dose IS NULL OR actual_dose > 0),
  actual_dose_unit            TEXT,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (intake_time IS NULL OR EXTRACT(SECOND FROM intake_time) = 0)
);

CREATE INDEX IF NOT EXISTS idx_intake_logs_user_date
  ON supplements.intake_logs(user_id, intake_date DESC, intake_time);
CREATE INDEX IF NOT EXISTS idx_intake_logs_stack_item
  ON supplements.intake_logs(stack_item_id)
  WHERE stack_item_id IS NOT NULL;

DROP TRIGGER IF EXISTS intake_logs_touch_updated_at ON supplements.intake_logs;
CREATE TRIGGER intake_logs_touch_updated_at
  BEFORE UPDATE ON supplements.intake_logs
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE OR REPLACE VIEW supplements.daily_intake_summary
WITH (security_invoker = true)
AS
SELECT
  il.user_id,
  il.intake_date,
  count(*) AS total_logged,
  count(*) FILTER (WHERE il.status = 'taken') AS total_taken,
  count(*) FILTER (WHERE il.status = 'skipped') AS total_skipped,
  count(*) FILTER (WHERE il.status = 'snoozed') AS total_snoozed,
  count(*) FILTER (WHERE il.status = 'planned') AS total_planned,
  CASE
    WHEN count(*) FILTER (WHERE il.status IN ('taken','skipped')) > 0
    THEN round(
      count(*) FILTER (WHERE il.status = 'taken')::numeric
      / count(*) FILTER (WHERE il.status IN ('taken','skipped')) * 100,
      1
    )
    ELSE NULL
  END AS compliance_pct
FROM supplements.intake_logs il
GROUP BY il.user_id, il.intake_date;

GRANT USAGE ON SCHEMA supplements TO authenticated, service_role;

GRANT SELECT ON supplements.supplement_catalog TO authenticated;
GRANT SELECT ON supplements.supplement_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplements.user_stacks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplements.stack_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplements.intake_logs TO authenticated;
GRANT SELECT ON supplements.daily_intake_summary TO authenticated;

GRANT ALL ON supplements.supplement_catalog TO service_role;
GRANT ALL ON supplements.supplement_interactions TO service_role;
GRANT ALL ON supplements.user_stacks TO service_role;
GRANT ALL ON supplements.stack_items TO service_role;
GRANT ALL ON supplements.intake_logs TO service_role;
GRANT ALL ON supplements.daily_intake_summary TO service_role;

ALTER TABLE supplements.supplement_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.supplement_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.user_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.stack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.intake_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supplement_catalog_select ON supplements.supplement_catalog;
DROP POLICY IF EXISTS supplement_interactions_select ON supplements.supplement_interactions;
DROP POLICY IF EXISTS user_stacks_select ON supplements.user_stacks;
DROP POLICY IF EXISTS user_stacks_insert ON supplements.user_stacks;
DROP POLICY IF EXISTS user_stacks_update ON supplements.user_stacks;
DROP POLICY IF EXISTS user_stacks_delete ON supplements.user_stacks;
DROP POLICY IF EXISTS stack_items_select ON supplements.stack_items;
DROP POLICY IF EXISTS stack_items_insert ON supplements.stack_items;
DROP POLICY IF EXISTS stack_items_update ON supplements.stack_items;
DROP POLICY IF EXISTS stack_items_delete ON supplements.stack_items;
DROP POLICY IF EXISTS intake_logs_select ON supplements.intake_logs;
DROP POLICY IF EXISTS intake_logs_insert ON supplements.intake_logs;
DROP POLICY IF EXISTS intake_logs_update ON supplements.intake_logs;
DROP POLICY IF EXISTS intake_logs_delete ON supplements.intake_logs;

CREATE POLICY supplement_catalog_select ON supplements.supplement_catalog
  FOR SELECT TO authenticated USING (is_active);

CREATE POLICY supplement_interactions_select ON supplements.supplement_interactions
  FOR SELECT TO authenticated USING (is_active);

CREATE POLICY user_stacks_select ON supplements.user_stacks
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_stacks_insert ON supplements.user_stacks
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_stacks_update ON supplements.user_stacks
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_stacks_delete ON supplements.user_stacks
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY stack_items_select ON supplements.stack_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM supplements.user_stacks us
      WHERE us.id = stack_items.stack_id
        AND us.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY stack_items_insert ON supplements.stack_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM supplements.user_stacks us
      WHERE us.id = stack_items.stack_id
        AND us.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY stack_items_update ON supplements.stack_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM supplements.user_stacks us
      WHERE us.id = stack_items.stack_id
        AND us.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM supplements.user_stacks us
      WHERE us.id = stack_items.stack_id
        AND us.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY stack_items_delete ON supplements.stack_items
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM supplements.user_stacks us
      WHERE us.id = stack_items.stack_id
        AND us.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY intake_logs_select ON supplements.intake_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_logs_insert ON supplements.intake_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_logs_update ON supplements.intake_logs
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY intake_logs_delete ON supplements.intake_logs
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMENT ON SCHEMA supplements IS 'Supplements-Modul: kuratierter Katalog und nutzerbezogene Stacks/Einnahmen.';
COMMENT ON TABLE supplements.supplement_catalog IS 'C-68: Kuratierter Standard-Supplement-Katalog. Enhanced Substances und Injection Planner sind bewusst nicht enthalten.';
COMMENT ON TABLE supplements.supplement_interactions IS 'C-68: Struktur fuer kuratierte Interaktionen. Keine automatische medizinische Bewertung.';
COMMENT ON TABLE supplements.user_stacks IS 'C-68: Supplement-Stack eines Nutzers. Maximal ein aktiver Stack je Nutzer.';
COMMENT ON TABLE supplements.stack_items IS 'C-68: Supplement im Nutzer-Stack, inklusive Dosis und einfachem Lagerbestand fuer Refill-Anzeigen.';
COMMENT ON TABLE supplements.intake_logs IS 'C-68: Einnahmeprotokoll mit Snapshot von Name und Dosis. Lokaler Tag und lokale Uhrzeit wie bei meals.';
COMMENT ON COLUMN supplements.intake_logs.supplement_name_snapshot IS 'Eingefrorener Name zum Zeitpunkt der Einnahme; Katalogkorrekturen aendern alte Logs nicht.';
COMMENT ON COLUMN supplements.intake_logs.dose_snapshot IS 'Eingefrorene geplante Dosis zum Zeitpunkt der Einnahme; spaetere Stack-Aenderungen verschieben alte Logs nicht.';

DO $$
DECLARE
  v_catalog_policies INTEGER;
  v_interaction_policies INTEGER;
  v_stack_policies INTEGER;
  v_item_policies INTEGER;
  v_log_policies INTEGER;
BEGIN
  SELECT count(*) INTO v_catalog_policies
  FROM pg_policies WHERE schemaname = 'supplements' AND tablename = 'supplement_catalog';
  SELECT count(*) INTO v_interaction_policies
  FROM pg_policies WHERE schemaname = 'supplements' AND tablename = 'supplement_interactions';
  SELECT count(*) INTO v_stack_policies
  FROM pg_policies WHERE schemaname = 'supplements' AND tablename = 'user_stacks';
  SELECT count(*) INTO v_item_policies
  FROM pg_policies WHERE schemaname = 'supplements' AND tablename = 'stack_items';
  SELECT count(*) INTO v_log_policies
  FROM pg_policies WHERE schemaname = 'supplements' AND tablename = 'intake_logs';

  IF v_catalog_policies <> 1 THEN
    RAISE EXCEPTION 'supplement_catalog: % Policies statt 1', v_catalog_policies;
  END IF;
  IF v_interaction_policies <> 1 THEN
    RAISE EXCEPTION 'supplement_interactions: % Policies statt 1', v_interaction_policies;
  END IF;
  IF v_stack_policies <> 4 THEN
    RAISE EXCEPTION 'user_stacks: % Policies statt 4', v_stack_policies;
  END IF;
  IF v_item_policies <> 4 THEN
    RAISE EXCEPTION 'stack_items: % Policies statt 4', v_item_policies;
  END IF;
  IF v_log_policies <> 4 THEN
    RAISE EXCEPTION 'intake_logs: % Policies statt 4', v_log_policies;
  END IF;

  RAISE NOTICE 'OK: supplements schema mit Katalog, Stack, Items, Logs und Interaktionsstruktur';
END $$;

COMMIT;

