-- =============================================================
-- 145 -- Medical-Medikamente und Conditions (C-130)
-- Datum: 2026-08-20
-- Zweck: Medikamentenkatalog aus Kimi-Bestand vorbereiten und
--        Nutzermedikationen/Conditions als sensible Medical-Daten erfassen.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Zuschnitt:
--   [read] C-130 baut Katalog und Erfassung, aber keine Regeln,
--          Wechselwirkungsbewertung oder Dosierungsempfehlung.
--   [cmd]  Vor diesem Schritt fuehrt medical Befunde, aber keine
--          Medikamente und keine Conditions.
--   [read] lab_reports/lab_result_values schuetzen Gesundheitsdaten
--          ueber eigene_zeilen mit auth.uid(); dieselbe Form gilt hier.
--
-- Entscheidungen:
--   1. medication_active_substances, medication_formulations und
--      medication_products sind Stammdaten: authenticated darf lesen.
--   2. user_medications und user_conditions sind Gesundheitsdaten:
--      DML nur auf eigene Zeilen.
--   3. drug_class und cyp_profile liegen am Katalog UND als Snapshot
--      an der Nutzermedikation. Spaetere Katalogkorrekturen verschieben
--      alte Nutzerangaben dadurch nicht.
--   4. Herkunft folgt A-17 fuer Mess-/Zustandsdaten:
--      measurement_source + source_detail, erlaubt sind manual, device,
--      import, admin, seed.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS medical;

CREATE TABLE IF NOT EXISTS medical.medication_active_substances (
  id                    TEXT PRIMARY KEY,
  canonical_name        TEXT NOT NULL CHECK (btrim(canonical_name) <> ''),
  generic_names         TEXT[] NOT NULL DEFAULT '{}',
  synonyms              TEXT[] NOT NULL DEFAULT '{}',
  atc_code              TEXT,
  cas_number            TEXT,
  rxnorm_code           TEXT,
  unii_code             TEXT,
  drug_class            TEXT[] NOT NULL DEFAULT '{}',
  raw_drug_class        TEXT[] NOT NULL DEFAULT '{}',
  cyp_profile           TEXT[] NOT NULL DEFAULT '{}',
  cyp_raw               JSONB NOT NULL DEFAULT '{}'::jsonb,
  routes                TEXT[] NOT NULL DEFAULT '{}',
  dosage_forms          TEXT[] NOT NULL DEFAULT '{}',
  risk_flags            JSONB NOT NULL DEFAULT '{}'::jsonb,
  lab_effects           JSONB NOT NULL DEFAULT '[]'::jsonb,
  contraindications     JSONB NOT NULL DEFAULT '[]'::jsonb,
  precautions           JSONB NOT NULL DEFAULT '[]'::jsonb,
  regulatory_state      JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources               JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw                   JSONB NOT NULL,
  source                TEXT NOT NULL DEFAULT 'kimi_medications_2026_08_19',
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (jsonb_typeof(cyp_raw) = 'object'),
  CHECK (jsonb_typeof(risk_flags) = 'object'),
  CHECK (jsonb_typeof(lab_effects) = 'array'),
  CHECK (jsonb_typeof(contraindications) = 'array'),
  CHECK (jsonb_typeof(precautions) = 'array'),
  CHECK (jsonb_typeof(regulatory_state) = 'array'),
  CHECK (jsonb_typeof(sources) = 'array')
);

CREATE INDEX IF NOT EXISTS medication_active_substances_name_idx
  ON medical.medication_active_substances(canonical_name);
CREATE INDEX IF NOT EXISTS medication_active_substances_drug_class_idx
  ON medical.medication_active_substances USING gin(drug_class);
CREATE INDEX IF NOT EXISTS medication_active_substances_cyp_profile_idx
  ON medical.medication_active_substances USING gin(cyp_profile);

CREATE TABLE IF NOT EXISTS medical.medication_formulations (
  id                    TEXT PRIMARY KEY,
  active_substance_id   TEXT NOT NULL
    REFERENCES medical.medication_active_substances(id) ON DELETE RESTRICT,
  strength_value        NUMERIC(14,4),
  strength_unit         TEXT,
  dosage_form           TEXT,
  route                 TEXT,
  salt_or_ester         TEXT,
  release               TEXT,
  indication            TEXT,
  raw                   JSONB NOT NULL,
  source                TEXT NOT NULL DEFAULT 'kimi_medications_2026_08_19',
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (strength_value IS NULL OR strength_value > 0)
);

CREATE INDEX IF NOT EXISTS medication_formulations_substance_idx
  ON medical.medication_formulations(active_substance_id);

CREATE TABLE IF NOT EXISTS medical.medication_products (
  id                    TEXT PRIMARY KEY,
  formulation_id        TEXT NOT NULL
    REFERENCES medical.medication_formulations(id) ON DELETE RESTRICT,
  brand_name            TEXT NOT NULL CHECK (btrim(brand_name) <> ''),
  manufacturer          TEXT,
  jurisdictions         TEXT[] NOT NULL DEFAULT '{}',
  identifiers           JSONB NOT NULL DEFAULT '{}'::jsonb,
  packaging             TEXT,
  raw                   JSONB NOT NULL,
  source                TEXT NOT NULL DEFAULT 'kimi_medications_2026_08_19',
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (jsonb_typeof(identifiers) = 'object')
);

CREATE INDEX IF NOT EXISTS medication_products_formulation_idx
  ON medical.medication_products(formulation_id);
CREATE INDEX IF NOT EXISTS medication_products_brand_idx
  ON medical.medication_products(brand_name);

CREATE TABLE IF NOT EXISTS medical.user_medications (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_substance_id      TEXT REFERENCES medical.medication_active_substances(id) ON DELETE RESTRICT,
  product_id               TEXT REFERENCES medical.medication_products(id) ON DELETE SET NULL,
  name                     TEXT NOT NULL CHECK (btrim(name) <> ''),
  drug_class               TEXT[] NOT NULL DEFAULT '{}',
  cyp_profile              TEXT[] NOT NULL DEFAULT '{}',
  dose_amount              NUMERIC(14,4) CHECK (dose_amount IS NULL OR dose_amount > 0),
  dose_unit                TEXT,
  doses_per_day            NUMERIC(8,3) CHECK (doses_per_day IS NULL OR doses_per_day > 0),
  route                    TEXT,
  start_date               DATE NOT NULL,
  end_date                 DATE,
  is_active                BOOLEAN NOT NULL DEFAULT true,
  indication               TEXT,
  notes                    TEXT,
  measurement_source       TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed')),
  source_detail            TEXT,
  frozen_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS user_medications_user_active_idx
  ON medical.user_medications(user_id, is_active, start_date DESC);
CREATE INDEX IF NOT EXISTS user_medications_substance_idx
  ON medical.user_medications(active_substance_id)
  WHERE active_substance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_medications_drug_class_idx
  ON medical.user_medications USING gin(drug_class);
CREATE INDEX IF NOT EXISTS user_medications_cyp_profile_idx
  ON medical.user_medications USING gin(cyp_profile);

CREATE TABLE IF NOT EXISTS medical.user_conditions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_code           TEXT NOT NULL CHECK (condition_code IN (
    'hypertension',
    'CKD',
    'diabetes',
    'pregnancy',
    'pregnancy_planned',
    'liver_disease',
    'anxiety',
    'arrhythmia',
    'hemochromatosis',
    'hormone_sensitive_cancer',
    'kidney_stones',
    'autoimmune_thyroiditis',
    'transplant',
    'HIV',
    'epilepsy'
  )),
  status                   TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'planned', 'unknown')),
  start_date               DATE,
  end_date                 DATE,
  notes                    TEXT,
  measurement_source       TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed')),
  source_detail            TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_conditions_one_open
  ON medical.user_conditions(user_id, condition_code)
  WHERE status IN ('active', 'planned', 'unknown') AND end_date IS NULL;
CREATE INDEX IF NOT EXISTS user_conditions_user_status_idx
  ON medical.user_conditions(user_id, status, condition_code);

DROP TRIGGER IF EXISTS medication_active_substances_touch_updated_at
  ON medical.medication_active_substances;
CREATE TRIGGER medication_active_substances_touch_updated_at
  BEFORE UPDATE ON medical.medication_active_substances
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS medication_formulations_touch_updated_at
  ON medical.medication_formulations;
CREATE TRIGGER medication_formulations_touch_updated_at
  BEFORE UPDATE ON medical.medication_formulations
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS medication_products_touch_updated_at
  ON medical.medication_products;
CREATE TRIGGER medication_products_touch_updated_at
  BEFORE UPDATE ON medical.medication_products
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS user_medications_touch_updated_at
  ON medical.user_medications;
CREATE TRIGGER user_medications_touch_updated_at
  BEFORE UPDATE ON medical.user_medications
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

DROP TRIGGER IF EXISTS user_conditions_touch_updated_at
  ON medical.user_conditions;
CREATE TRIGGER user_conditions_touch_updated_at
  BEFORE UPDATE ON medical.user_conditions
  FOR EACH ROW EXECUTE FUNCTION medical.touch_updated_at();

GRANT USAGE ON SCHEMA medical TO authenticated, service_role;

GRANT SELECT ON medical.medication_active_substances TO authenticated;
GRANT SELECT ON medical.medication_formulations TO authenticated;
GRANT SELECT ON medical.medication_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.user_medications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON medical.user_conditions TO authenticated;

GRANT ALL ON medical.medication_active_substances TO service_role;
GRANT ALL ON medical.medication_formulations TO service_role;
GRANT ALL ON medical.medication_products TO service_role;
GRANT ALL ON medical.user_medications TO service_role;
GRANT ALL ON medical.user_conditions TO service_role;

ALTER TABLE medical.medication_active_substances ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.user_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.user_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medication_active_substances_select
  ON medical.medication_active_substances;
DROP POLICY IF EXISTS medication_formulations_select
  ON medical.medication_formulations;
DROP POLICY IF EXISTS medication_products_select
  ON medical.medication_products;
DROP POLICY IF EXISTS user_medications_select ON medical.user_medications;
DROP POLICY IF EXISTS user_medications_insert ON medical.user_medications;
DROP POLICY IF EXISTS user_medications_update ON medical.user_medications;
DROP POLICY IF EXISTS user_medications_delete ON medical.user_medications;
DROP POLICY IF EXISTS user_conditions_select ON medical.user_conditions;
DROP POLICY IF EXISTS user_conditions_insert ON medical.user_conditions;
DROP POLICY IF EXISTS user_conditions_update ON medical.user_conditions;
DROP POLICY IF EXISTS user_conditions_delete ON medical.user_conditions;

CREATE POLICY medication_active_substances_select
  ON medical.medication_active_substances
  FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_formulations_select
  ON medical.medication_formulations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_products_select
  ON medical.medication_products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY user_medications_select ON medical.user_medications
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_medications_insert ON medical.user_medications
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_medications_update ON medical.user_medications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_medications_delete ON medical.user_medications
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY user_conditions_select ON medical.user_conditions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_conditions_insert ON medical.user_conditions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_conditions_update ON medical.user_conditions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_conditions_delete ON medical.user_conditions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DO $$
DECLARE
  v_public_policies integer;
  v_private_policies integer;
BEGIN
  SELECT count(*) INTO v_public_policies
  FROM pg_policies
  WHERE schemaname = 'medical'
    AND tablename IN (
      'medication_active_substances',
      'medication_formulations',
      'medication_products'
    );

  SELECT count(*) INTO v_private_policies
  FROM pg_policies
  WHERE schemaname = 'medical'
    AND tablename IN ('user_medications', 'user_conditions');

  IF v_public_policies <> 3 THEN
    RAISE EXCEPTION 'C-130: % Stammdaten-Policies, erwartet 3', v_public_policies;
  END IF;
  IF v_private_policies <> 8 THEN
    RAISE EXCEPTION 'C-130: % Nutzer-Policies, erwartet 8', v_private_policies;
  END IF;

  RAISE NOTICE 'OK C-130 Schema: 3 Katalogtabellen und 2 Nutzertabellen mit RLS';
END $$;

COMMIT;
