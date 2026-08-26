BEGIN;

CREATE TABLE IF NOT EXISTS medical.medication_reproductive_evidence (
  active_substance_id TEXT PRIMARY KEY REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  pregnancy JSONB,
  lactation JSONB,
  fertility JSONB,
  missing_pregnancy_lactation JSONB NOT NULL DEFAULT '{}'::jsonb,
  missing_fertility_sex JSONB NOT NULL DEFAULT '{}'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (pregnancy IS NULL OR jsonb_typeof(pregnancy) = 'object'),
  CHECK (lactation IS NULL OR jsonb_typeof(lactation) = 'object'),
  CHECK (fertility IS NULL OR jsonb_typeof(fertility) = 'object'),
  CHECK (jsonb_typeof(missing_pregnancy_lactation) = 'object'),
  CHECK (jsonb_typeof(missing_fertility_sex) = 'object'),
  CHECK (jsonb_typeof(sources) = 'array')
);

CREATE TABLE IF NOT EXISTS medical.medication_pk_evidence (
  active_substance_id TEXT PRIMARY KEY REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  pk_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_metabolites JSONB,
  missing JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw JSONB NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(pk_fields) = 'object'),
  CHECK (jsonb_typeof(missing) = 'object')
);

CREATE TABLE IF NOT EXISTS medical.medication_renal_hepatic_evidence (
  active_substance_id TEXT PRIMARY KEY REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  renal JSONB,
  missing_renal JSONB NOT NULL DEFAULT '{}'::jsonb,
  hepatic JSONB,
  missing_hepatic JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw JSONB NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (renal IS NULL OR jsonb_typeof(renal) = 'object'),
  CHECK (hepatic IS NULL OR jsonb_typeof(hepatic) = 'object'),
  CHECK (jsonb_typeof(missing_renal) = 'object'),
  CHECK (jsonb_typeof(missing_hepatic) = 'object')
);

CREATE TABLE IF NOT EXISTS medical.medication_clinical_context_evidence (
  active_substance_id TEXT PRIMARY KEY REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE IF NOT EXISTS medical.medication_thailand_regulatory_evidence (
  record_key TEXT PRIMARY KEY,
  active_substance_id TEXT REFERENCES medical.medication_active_substances(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(payload) = 'object')
);

GRANT SELECT ON medical.medication_reproductive_evidence TO authenticated;
GRANT SELECT ON medical.medication_pk_evidence TO authenticated;
GRANT SELECT ON medical.medication_renal_hepatic_evidence TO authenticated;
GRANT SELECT ON medical.medication_clinical_context_evidence TO authenticated;
GRANT SELECT ON medical.medication_thailand_regulatory_evidence TO authenticated;
GRANT ALL ON medical.medication_reproductive_evidence TO service_role;
GRANT ALL ON medical.medication_pk_evidence TO service_role;
GRANT ALL ON medical.medication_renal_hepatic_evidence TO service_role;
GRANT ALL ON medical.medication_clinical_context_evidence TO service_role;
GRANT ALL ON medical.medication_thailand_regulatory_evidence TO service_role;

ALTER TABLE medical.medication_reproductive_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_pk_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_renal_hepatic_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_clinical_context_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medication_thailand_regulatory_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medication_reproductive_evidence_select ON medical.medication_reproductive_evidence;
DROP POLICY IF EXISTS medication_pk_evidence_select ON medical.medication_pk_evidence;
DROP POLICY IF EXISTS medication_renal_hepatic_evidence_select ON medical.medication_renal_hepatic_evidence;
DROP POLICY IF EXISTS medication_clinical_context_evidence_select ON medical.medication_clinical_context_evidence;
DROP POLICY IF EXISTS medication_thailand_regulatory_evidence_select ON medical.medication_thailand_regulatory_evidence;

CREATE POLICY medication_reproductive_evidence_select ON medical.medication_reproductive_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_pk_evidence_select ON medical.medication_pk_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_renal_hepatic_evidence_select ON medical.medication_renal_hepatic_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_clinical_context_evidence_select ON medical.medication_clinical_context_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY medication_thailand_regulatory_evidence_select ON medical.medication_thailand_regulatory_evidence FOR SELECT TO authenticated USING (true);

COMMIT;
