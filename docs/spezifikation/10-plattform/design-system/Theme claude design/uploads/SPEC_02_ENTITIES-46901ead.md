# Medical Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
STAMMDATEN (System/kuratiert, read-only)
──────────────────────────────────────────
Biomarker (100+ Marker, LOINC-Code)
  └── BiomarkerReferenceRange (Alter/Geschlecht-spezifisch)
BiomarkerPopulationStatistics

USER DATA
──────────────────────────────────────────────
LabReport (OCR-Container)
  └── UserBiomarkerResult (Einzel-Wert)
UserHealthMetrics (computed, täglich)
UserSymptom
UserMedication
MedicalAlert (auto-generated)
UserMedicalInsight (AI-generated)
UserHealthReport (Doctor Export PDF)

VIEWs (Materialized):
  user_latest_biomarkers
  user_health_dashboard_summary
```

---

## 1. Biomarker (Stammdaten)

```
id                       UUID PK
loinc_code               TEXT UNIQUE
name                     TEXT NOT NULL
name_de                  TEXT
common_name              TEXT
abbreviations            TEXT[]

-- Klassifikation
category                 TEXT NOT NULL
  cbc | metabolic | lipid | liver | thyroid | hormone | inflammation | vitamins_minerals | cancer_screening
subcategory              TEXT
biomarker_group          TEXT        lipid_panel | liver_panel | thyroid_panel | etc.

-- Messung
unit                     TEXT NOT NULL
alternative_units        JSONB       {mmol_L: {factor: 0.026, offset: 0}}
precision_decimal_places INTEGER DEFAULT 1

-- Ranges
lab_range_min            NUMERIC(12,3)
lab_range_max            NUMERIC(12,3)
optimal_range_min        NUMERIC(12,3)
optimal_range_max        NUMERIC(12,3)
critical_low_value       NUMERIC(12,3)
critical_high_value      NUMERIC(12,3)
gender_specific_ranges   JSONB       {male: {optimal_min, optimal_max}, female: {...}}
age_specific_ranges      JSONB       [{age_min: 18, age_max: 30, optimal_min, optimal_max}]

-- Klinische Info
description              TEXT
description_de           TEXT
clinical_significance    TEXT
affected_by_factors      TEXT[]
testing_requirements     TEXT[]      fasting | time_of_day | no_exercise_24h
sample_type              TEXT        serum | plasma | whole_blood | urine
supplement_effects       JSONB       {Vitamin D3: {direction: "increases", strength: "strong"}}

-- Monitoring
measurement_frequency_recommended TEXT   annually | quarterly | monthly | weekly
evidence_level           TEXT        A+ | A | B | C
sort_order               INTEGER
display_priority         INTEGER
```

---

## 2. BiomarkerReferenceRange

```
id               UUID PK
biomarker_id     UUID FK → Biomarker
range_type       TEXT     lab_standard | optimal | athlete | longevity
range_name       TEXT     "Adult Male 18-65", "Post-menopausal Female"
gender           TEXT     male | female | all
age_min          INTEGER
age_max          INTEGER
population       TEXT     general | athlete | longevity | disease_specific

min_value        NUMERIC(12,3)
max_value        NUMERIC(12,3)
unit             TEXT

evidence_level   TEXT     A+ | A | B | C
source_study     TEXT
is_active        BOOLEAN DEFAULT true
```

---

## 3. UserBiomarkerResult

Einzel-Messwert. Basis aller System Scores.

```
id                   UUID PK
user_id              UUID NOT NULL
biomarker_id         UUID FK → Biomarker
value                NUMERIC(12,3) NOT NULL
unit                 TEXT NOT NULL
test_date            DATE NOT NULL
test_time            TIME
lab_name             TEXT
lab_range_min        NUMERIC(12,3)   Lab-eigene Range
lab_range_max        NUMERIC(12,3)
lab_interpretation   TEXT            normal | high | low | critical
fasting_status       TEXT            fasting | non_fasting | unknown

-- Import
data_source          TEXT DEFAULT 'manual'   manual | ocr_upload | lab_integration
entry_confidence     NUMERIC(3,2) DEFAULT 1.0
needs_verification   BOOLEAN DEFAULT false

-- Flags (auto-berechnet)
critical_flag        BOOLEAN DEFAULT false
current_flag         TEXT            optimal | normal | low | high | critical_low | critical_high
trend_significance   TEXT            significant_improvement | significant_decline | stable

-- Kontext
user_notes           TEXT
symptoms_at_time     TEXT[]
medications_at_time  TEXT[]
lab_report_url       TEXT

UNIQUE (user_id, biomarker_id, test_date, lab_name)
```

---

## 4. LabReport (OCR-Container)

```
id               UUID PK
user_id          UUID NOT NULL
report_date      DATE
lab_name         TEXT
file_url         TEXT              Supabase Storage
ocr_status       TEXT              pending | processing | completed | failed | needs_review
ocr_results      JSONB             Raw Claude Vision Output
extracted_values JSONB             [{biomarker_name, value, unit, confidence}]
review_required  BOOLEAN DEFAULT false
total_markers_found    INTEGER
markers_needs_review   INTEGER
```

---

## 5. UserHealthMetrics (täglich computed)

```
id                        UUID PK
user_id                   UUID NOT NULL
calculation_date          DATE NOT NULL
UNIQUE (user_id, calculation_date)

overall_health_score      NUMERIC(5,2)
liver_score               NUMERIC(5,2)
cardiovascular_score      NUMERIC(5,2)
kidney_score              NUMERIC(5,2)
hormonal_score            NUMERIC(5,2)
metabolic_score           NUMERIC(5,2)

health_trajectory         TEXT      improving | stable | declining
data_completeness_score   NUMERIC(3,2)
biomarkers_included       UUID[]
missing_key_biomarkers    UUID[]
```

---

## 6. UserSymptom

```
id                       UUID PK
user_id                  UUID NOT NULL
symptom_name             TEXT NOT NULL
symptom_category         TEXT      physical | mental | digestive | sleep | skin | respiratory
severity                 INTEGER   1–10
onset_datetime           TIMESTAMPTZ NOT NULL
resolution_datetime      TIMESTAMPTZ
potential_triggers       TEXT[]
relieving_factors        TEXT[]
biomarkers_around_time   UUID[]    Gleichzeitige Tests
associated_medications   TEXT[]
impact_on_daily_life     INTEGER   1–10
photo_urls               TEXT[]
```

---

## 7. UserMedication

```
id                       UUID PK
user_id                  UUID NOT NULL
medication_name          TEXT NOT NULL
medication_type          TEXT      prescription | otc | supplement | herb
dosage                   TEXT      "500mg", "2 Tabletten"
frequency                TEXT      daily | twice_daily | as_needed | weekly
start_date               DATE NOT NULL
end_date                 DATE
indication               TEXT
requires_blood_monitoring BOOLEAN DEFAULT false
monitoring_frequency     TEXT      weekly | monthly | quarterly
next_monitoring_due      DATE
status                   TEXT DEFAULT 'active'   active | discontinued | paused
target_biomarkers        UUID[]
side_effects             TEXT[]
known_drug_interactions  TEXT[]
```

---

## 8. MedicalAlert

```
id               UUID PK
user_id          UUID NOT NULL
biomarker_id     UUID FK
alert_type       TEXT   out_of_range | critical_high | critical_low | trending_bad | monitoring_overdue
severity         TEXT   info | warning | critical
triggered_value  NUMERIC
triggered_at     TIMESTAMPTZ
acknowledged_at  TIMESTAMPTZ
```

---

## 9. UserMedicalInsight

AI-generierte Insights — nicht-diagnostisch, keine Therapieempfehlungen.

```
id                   UUID PK
user_id              UUID NOT NULL
insight_type         TEXT   biomarker_analysis | trend_detection | risk_assessment | correlation
insight_category     TEXT   cardiovascular | metabolic | hormonal | inflammation
insight_priority     TEXT DEFAULT 'medium'   low | medium | high | critical
title                TEXT NOT NULL
description          TEXT NOT NULL
key_findings         TEXT[]
recommended_actions  TEXT[]
medical_follow_up_recommended BOOLEAN DEFAULT false
is_current           BOOLEAN DEFAULT true
user_acknowledged    BOOLEAN DEFAULT false
```

---

## 10. UserHealthReport

```
id                UUID PK
user_id           UUID NOT NULL
report_type       TEXT    comprehensive | focused | progress | provider_summary
report_name       TEXT
time_period_start DATE
time_period_end   DATE
biomarker_categories TEXT[]
report_file_url   TEXT
report_format     TEXT DEFAULT 'pdf'
sharing_permissions JSONB
shared_with_providers UUID[]
access_expires_at TIMESTAMPTZ
status            TEXT DEFAULT 'active'
```
