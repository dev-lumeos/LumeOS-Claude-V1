BEGIN;

ALTER TABLE medical.medication_active_substances
  ADD COLUMN IF NOT EXISTS pharmacology JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dosage_models JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS food_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_provenance JSONB NOT NULL DEFAULT '{}'::jsonb;

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
