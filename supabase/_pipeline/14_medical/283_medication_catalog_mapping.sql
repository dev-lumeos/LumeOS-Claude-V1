BEGIN;

ALTER TABLE medical.medication_active_substances
  ADD COLUMN IF NOT EXISTS pharmacology JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dosage_models JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS food_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE medical.medication_active_substances
SET
  atc_code = COALESCE(NULLIF(btrim(raw ->> 'ATC'), ''), NULLIF(btrim(raw ->> 'atc_code'), '')),
  cas_number = COALESCE(NULLIF(btrim(raw ->> 'CAS'), ''), NULLIF(btrim(raw ->> 'cas_number'), '')),
  rxnorm_code = COALESCE(
    NULLIF(btrim(raw ->> 'RxNorm_salt_rxcui'), ''),
    NULLIF(btrim(raw -> 'external_ids' ->> 'RxNorm_salt_rxcui'), ''),
    NULLIF(btrim(raw -> 'external_ids' ->> 'RxNorm'), ''),
    NULLIF(btrim(raw ->> 'rxnorm_code'), '')
  ),
  unii_code = COALESCE(
    NULLIF(btrim(raw ->> 'UNII'), ''),
    NULLIF(btrim(raw -> 'external_ids' ->> 'UNII'), ''),
    NULLIF(btrim(raw ->> 'unii_code'), '')
  ),
  raw_drug_class = COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(raw -> 'drug_class', '[]'::jsonb))),
    '{}'
  ),
  routes = COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(raw -> 'routes_of_administration', raw -> 'routes', '[]'::jsonb))),
    '{}'
  ),
  pharmacology = COALESCE(raw -> 'pharmacology', '{}'::jsonb),
  dosage_models = COALESCE(raw -> 'dosage_models', '[]'::jsonb),
  food_interactions = COALESCE(raw -> 'food_interactions', '[]'::jsonb),
  evidence_provenance = COALESCE(raw -> 'evidence_provenance', '{}'::jsonb),
  updated_at = now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.medication_active_substances'::regclass
      AND conname = 'medication_active_substances_pharmacology_check'
  ) THEN
    ALTER TABLE medical.medication_active_substances
      ADD CONSTRAINT medication_active_substances_pharmacology_check
      CHECK (jsonb_typeof(pharmacology) = 'object');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.medication_active_substances'::regclass
      AND conname = 'medication_active_substances_dosage_models_check'
  ) THEN
    ALTER TABLE medical.medication_active_substances
      ADD CONSTRAINT medication_active_substances_dosage_models_check
      CHECK (jsonb_typeof(dosage_models) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.medication_active_substances'::regclass
      AND conname = 'medication_active_substances_food_interactions_check'
  ) THEN
    ALTER TABLE medical.medication_active_substances
      ADD CONSTRAINT medication_active_substances_food_interactions_check
      CHECK (jsonb_typeof(food_interactions) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'medical.medication_active_substances'::regclass
      AND conname = 'medication_active_substances_evidence_provenance_check'
  ) THEN
    ALTER TABLE medical.medication_active_substances
      ADD CONSTRAINT medication_active_substances_evidence_provenance_check
      CHECK (jsonb_typeof(evidence_provenance) = 'object');
  END IF;
END $$;

COMMIT;
