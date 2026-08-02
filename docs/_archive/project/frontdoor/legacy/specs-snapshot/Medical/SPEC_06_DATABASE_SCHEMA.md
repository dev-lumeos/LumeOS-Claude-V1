# Medical Module — Database Schema
> Spec Phase 6 | Vollständiges SQL-Schema

---

```sql
CREATE SCHEMA IF NOT EXISTS medical;
SET search_path = medical, public;
```

---

## 1. medical.biomarkers

```sql
CREATE TABLE medical.biomarkers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loinc_code           TEXT UNIQUE,
  name                 TEXT NOT NULL,
  name_de              TEXT,
  common_name          TEXT,
  abbreviations        TEXT[] DEFAULT '{}',
  alternative_names    TEXT[] DEFAULT '{}',

  category             TEXT NOT NULL
    CHECK (category IN ('cbc','metabolic','lipid','liver','thyroid','hormone',
                        'inflammation','vitamins_minerals','cancer_screening')),
  subcategory          TEXT,
  biomarker_group      TEXT,

  unit                 TEXT NOT NULL,
  alternative_units    JSONB DEFAULT '{}',
  precision_decimal_places INTEGER DEFAULT 1,

  lab_range_min        NUMERIC(12,3),
  lab_range_max        NUMERIC(12,3),
  optimal_range_min    NUMERIC(12,3),
  optimal_range_max    NUMERIC(12,3),
  critical_low_value   NUMERIC(12,3),
  critical_high_value  NUMERIC(12,3),
  gender_specific_ranges JSONB DEFAULT '{}',
  age_specific_ranges  JSONB DEFAULT '[]',

  description          TEXT,
  description_de       TEXT,
  clinical_significance TEXT,
  affected_by_factors  TEXT[] DEFAULT '{}',
  testing_requirements TEXT[] DEFAULT '{}',
  sample_type          TEXT DEFAULT 'serum',
  supplement_effects   JSONB DEFAULT '{}',

  measurement_frequency_recommended TEXT DEFAULT 'annually',
  evidence_level       TEXT DEFAULT 'A'
    CHECK (evidence_level IN ('A+','A','B','C')),
  sort_order           INTEGER DEFAULT 0,
  display_priority     INTEGER DEFAULT 0,

  CONSTRAINT valid_ranges CHECK (
    (lab_range_min IS NULL OR lab_range_max IS NULL OR lab_range_min <= lab_range_max) AND
    (optimal_range_min IS NULL OR optimal_range_max IS NULL OR optimal_range_min <= optimal_range_max)
  )
);

CREATE INDEX idx_biomarkers_category    ON medical.biomarkers(category);
CREATE INDEX idx_biomarkers_group       ON medical.biomarkers(biomarker_group);
CREATE INDEX idx_biomarkers_priority    ON medical.biomarkers(display_priority DESC);
CREATE INDEX idx_biomarkers_name_trgm   ON medical.biomarkers USING GIN (name gin_trgm_ops);
CREATE INDEX idx_biomarkers_name_de_trgm ON medical.biomarkers USING GIN (name_de gin_trgm_ops);
CREATE INDEX idx_biomarkers_abbrev      ON medical.biomarkers USING GIN (abbreviations);

ALTER TABLE medical.biomarkers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biomarkers_select" ON medical.biomarkers FOR SELECT USING (true);
```

---

## 2. medical.biomarker_reference_ranges

```sql
CREATE TABLE medical.biomarker_reference_ranges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biomarker_id   UUID NOT NULL REFERENCES medical.biomarkers(id) ON DELETE CASCADE,
  range_type     TEXT NOT NULL
    CHECK (range_type IN ('lab_standard','optimal','athlete','longevity','disease_specific')),
  range_name     TEXT,
  gender         TEXT DEFAULT 'all'
    CHECK (gender IN ('male','female','all')),
  age_min        INTEGER,
  age_max        INTEGER,
  population     TEXT DEFAULT 'general'
    CHECK (population IN ('general','athlete','longevity','disease_specific','pregnant')),
  min_value      NUMERIC(12,3),
  max_value      NUMERIC(12,3),
  unit           TEXT,
  evidence_level TEXT DEFAULT 'A',
  source_study   TEXT,
  is_active      BOOLEAN DEFAULT true,

  CONSTRAINT valid_age    CHECK (age_min IS NULL OR age_max IS NULL OR age_min <= age_max),
  CONSTRAINT valid_values CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

CREATE INDEX idx_bioref_biomarker ON medical.biomarker_reference_ranges(biomarker_id);
CREATE INDEX idx_bioref_type      ON medical.biomarker_reference_ranges(range_type);
```

---

## 3. medical.lab_reports

```sql
CREATE TABLE medical.lab_reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  report_date          DATE,
  lab_name             TEXT,
  file_url             TEXT,
  file_type            TEXT DEFAULT 'pdf'
    CHECK (file_type IN ('pdf','image','manual')),
  ocr_status           TEXT DEFAULT 'pending'
    CHECK (ocr_status IN ('pending','processing','completed','failed','needs_review')),
  ocr_results          JSONB DEFAULT '{}',
  extracted_values     JSONB DEFAULT '[]',
  review_required      BOOLEAN DEFAULT false,
  total_markers_found  INTEGER DEFAULT 0,
  markers_needs_review INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lab_reports_user   ON medical.lab_reports(user_id, report_date DESC);
CREATE INDEX idx_lab_reports_status ON medical.lab_reports(ocr_status)
  WHERE ocr_status IN ('pending','needs_review');

ALTER TABLE medical.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab_reports_owner" ON medical.lab_reports
  USING (auth.uid()::text = user_id::text);
```

---

## 4. medical.user_biomarker_results

```sql
CREATE TABLE medical.user_biomarker_results (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  biomarker_id         UUID NOT NULL REFERENCES medical.biomarkers(id) ON DELETE RESTRICT,
  value                NUMERIC(12,3) NOT NULL,
  unit                 TEXT NOT NULL,
  test_date            DATE NOT NULL,
  test_time            TIME,
  lab_name             TEXT,
  lab_report_id        UUID REFERENCES medical.lab_reports(id),
  lab_range_min        NUMERIC(12,3),
  lab_range_max        NUMERIC(12,3),
  lab_interpretation   TEXT
    CHECK (lab_interpretation IN ('normal','high','low','critical',NULL)),
  fasting_status       TEXT DEFAULT 'unknown'
    CHECK (fasting_status IN ('fasting','non_fasting','unknown')),
  data_source          TEXT DEFAULT 'manual'
    CHECK (data_source IN ('manual','ocr_upload','lab_integration','wearable')),
  entry_confidence     NUMERIC(3,2) DEFAULT 1.0
    CHECK (entry_confidence >= 0 AND entry_confidence <= 1),
  needs_verification   BOOLEAN DEFAULT false,
  current_flag         TEXT
    CHECK (current_flag IN ('optimal','normal','low','high','critical_low','critical_high',NULL)),
  critical_flag        BOOLEAN DEFAULT false,
  trend_significance   TEXT
    CHECK (trend_significance IN ('significant_improvement','significant_decline','stable',NULL)),
  user_notes           TEXT,
  symptoms_at_time     TEXT[] DEFAULT '{}',
  medications_at_time  TEXT[] DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_value     CHECK (value >= 0),
  CONSTRAINT valid_test_date CHECK (test_date <= CURRENT_DATE)
);

CREATE INDEX idx_ubr_user_biomarker ON medical.user_biomarker_results(user_id, biomarker_id);
CREATE INDEX idx_ubr_user_date      ON medical.user_biomarker_results(user_id, test_date DESC);
CREATE INDEX idx_ubr_critical       ON medical.user_biomarker_results(user_id)
  WHERE critical_flag = true;
CREATE INDEX idx_ubr_verification   ON medical.user_biomarker_results(user_id)
  WHERE needs_verification = true;

ALTER TABLE medical.user_biomarker_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ubr_owner" ON medical.user_biomarker_results
  USING (auth.uid()::text = user_id::text);
```

### Trigger: Flag nach Insert/Update berechnen

```sql
CREATE OR REPLACE FUNCTION medical.calc_biomarker_flag()
RETURNS TRIGGER AS $$
DECLARE
  bio RECORD;
BEGIN
  SELECT lab_range_min, lab_range_max, optimal_range_min, optimal_range_max,
         critical_low_value, critical_high_value
  INTO bio FROM medical.biomarkers WHERE id = NEW.biomarker_id;

  NEW.critical_flag = (
    (bio.critical_low_value  IS NOT NULL AND NEW.value <= bio.critical_low_value) OR
    (bio.critical_high_value IS NOT NULL AND NEW.value >= bio.critical_high_value)
  );

  NEW.current_flag = CASE
    WHEN bio.critical_low_value  IS NOT NULL AND NEW.value <= bio.critical_low_value  THEN 'critical_low'
    WHEN bio.critical_high_value IS NOT NULL AND NEW.value >= bio.critical_high_value THEN 'critical_high'
    WHEN bio.optimal_range_min   IS NOT NULL AND bio.optimal_range_max IS NOT NULL
         AND NEW.value >= bio.optimal_range_min AND NEW.value <= bio.optimal_range_max THEN 'optimal'
    WHEN bio.lab_range_min IS NOT NULL AND NEW.value >= bio.lab_range_min
         AND bio.lab_range_max IS NOT NULL AND NEW.value <= bio.lab_range_max THEN 'normal'
    WHEN bio.lab_range_min IS NOT NULL AND NEW.value < bio.lab_range_min THEN 'low'
    ELSE 'high'
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_biomarker_flag
  BEFORE INSERT OR UPDATE ON medical.user_biomarker_results
  FOR EACH ROW EXECUTE FUNCTION medical.calc_biomarker_flag();
```

---

## 5. medical.user_health_metrics

```sql
CREATE TABLE medical.user_health_metrics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL,
  calculation_date          DATE NOT NULL,
  overall_health_score      NUMERIC(5,2),
  liver_score               NUMERIC(5,2),
  cardiovascular_score      NUMERIC(5,2),
  kidney_score              NUMERIC(5,2),
  hormonal_score            NUMERIC(5,2),
  metabolic_score           NUMERIC(5,2),
  health_trajectory         TEXT
    CHECK (health_trajectory IN ('improving','stable','declining',NULL)),
  data_completeness_score   NUMERIC(3,2),
  biomarkers_included       UUID[] DEFAULT '{}',
  missing_key_biomarkers    UUID[] DEFAULT '{}',
  algorithm_version         TEXT DEFAULT 'v1.0',
  calculated_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, calculation_date)
);

CREATE INDEX idx_uhm_user_date ON medical.user_health_metrics(user_id, calculation_date DESC);

ALTER TABLE medical.user_health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uhm_owner" ON medical.user_health_metrics
  USING (auth.uid()::text = user_id::text);
```

---

## 6. medical.user_symptoms

```sql
CREATE TABLE medical.user_symptoms (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  symptom_name          TEXT NOT NULL,
  symptom_category      TEXT
    CHECK (symptom_category IN ('physical','mental','digestive','sleep','skin','respiratory','other',NULL)),
  severity              INTEGER NOT NULL
    CHECK (severity BETWEEN 1 AND 10),
  onset_datetime        TIMESTAMPTZ NOT NULL,
  resolution_datetime   TIMESTAMPTZ,
  potential_triggers    TEXT[] DEFAULT '{}',
  relieving_factors     TEXT[] DEFAULT '{}',
  biomarkers_around_time UUID[] DEFAULT '{}',
  associated_medications TEXT[] DEFAULT '{}',
  impact_on_daily_life  INTEGER
    CHECK (impact_on_daily_life BETWEEN 1 AND 10),
  photo_urls            TEXT[] DEFAULT '{}',
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_symptoms_user ON medical.user_symptoms(user_id, onset_datetime DESC);
CREATE INDEX idx_symptoms_active ON medical.user_symptoms(user_id)
  WHERE resolution_datetime IS NULL;

ALTER TABLE medical.user_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symptoms_owner" ON medical.user_symptoms
  USING (auth.uid()::text = user_id::text);
```

---

## 7. medical.user_medications

```sql
CREATE TABLE medical.user_medications (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL,
  medication_name           TEXT NOT NULL,
  medication_type           TEXT DEFAULT 'prescription'
    CHECK (medication_type IN ('prescription','otc','supplement','herb')),
  dosage                    TEXT,
  frequency                 TEXT,
  start_date                DATE NOT NULL,
  end_date                  DATE,
  indication                TEXT,
  requires_blood_monitoring BOOLEAN DEFAULT false,
  monitoring_frequency      TEXT
    CHECK (monitoring_frequency IN ('weekly','monthly','quarterly','annually',NULL)),
  last_monitoring_date      DATE,
  next_monitoring_due       DATE,
  status                    TEXT DEFAULT 'active'
    CHECK (status IN ('active','discontinued','paused','completed')),
  target_biomarkers         UUID[] DEFAULT '{}',
  side_effects              TEXT[] DEFAULT '{}',
  known_drug_interactions   TEXT[] DEFAULT '{}',
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meds_user_active ON medical.user_medications(user_id)
  WHERE status = 'active';
CREATE INDEX idx_meds_monitoring   ON medical.user_medications(next_monitoring_due)
  WHERE requires_blood_monitoring = true AND status = 'active';

ALTER TABLE medical.user_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meds_owner" ON medical.user_medications
  USING (auth.uid()::text = user_id::text);
```

---

## 8. medical.medical_alerts

```sql
CREATE TABLE medical.medical_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  biomarker_id     UUID REFERENCES medical.biomarkers(id),
  medication_id    UUID REFERENCES medical.user_medications(id),
  alert_type       TEXT NOT NULL
    CHECK (alert_type IN ('critical_high','critical_low','out_of_range',
                          'trending_bad','monitoring_overdue','ocr_review')),
  severity         TEXT NOT NULL
    CHECK (severity IN ('info','warning','critical')),
  triggered_value  NUMERIC(12,3),
  triggered_at     TIMESTAMPTZ DEFAULT now(),
  acknowledged_at  TIMESTAMPTZ,
  status           TEXT DEFAULT 'active'
    CHECK (status IN ('active','acknowledged','resolved'))
);

CREATE INDEX idx_alerts_user_active ON medical.medical_alerts(user_id)
  WHERE status = 'active';

ALTER TABLE medical.medical_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_owner" ON medical.medical_alerts
  USING (auth.uid()::text = user_id::text);
```

---

## 9. Views

### user_latest_biomarkers (Materialized)

```sql
CREATE MATERIALIZED VIEW medical.user_latest_biomarkers AS
SELECT DISTINCT ON (user_id, biomarker_id)
  user_id, biomarker_id, value, unit, test_date,
  current_flag, critical_flag, trend_significance, lab_name
FROM medical.user_biomarker_results
WHERE needs_verification = false
ORDER BY user_id, biomarker_id, test_date DESC;

CREATE UNIQUE INDEX ON medical.user_latest_biomarkers(user_id, biomarker_id);
CREATE INDEX ON medical.user_latest_biomarkers(user_id);
```

---

## 10. Grants

```sql
GRANT USAGE ON SCHEMA medical TO authenticated, service_role;
GRANT SELECT ON medical.biomarkers, medical.biomarker_reference_ranges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  medical.lab_reports, medical.user_biomarker_results,
  medical.user_health_metrics, medical.user_symptoms,
  medical.user_medications, medical.medical_alerts TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA medical TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA medical TO authenticated, service_role;
```
