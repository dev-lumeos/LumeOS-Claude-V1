# Medical Module — Database Schema

## Schema & Übersicht

Alle Medical-Tabellen im Schema `medical`. Privacy-First: RLS auf allen User-Tabellen.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `medical.biomarkers` | Katalog 100+ Biomarker mit LOINC-Codes + Ranges |
| `medical.biomarker_reference_ranges` | Alter/Geschlecht/Population-spezifische Ranges |
| `medical.user_biomarker_results` | Einzel-Ergebnisse (manual/ocr/lab_integration) |
| `medical.lab_reports` | OCR-Import Container (PDF, OCR-Status) |
| `medical.user_health_metrics` | Berechnete System Scores (täglich) |
| `medical.user_symptoms` | Symptom-Tracking mit Korrelations-Links |
| `medical.user_medications` | Medikamente + Monitoring-Anforderungen |
| `medical.medical_alerts` | Automatische Warnungen |
| `medical.user_medical_insights` | AI-generierte Insights (non-diagnostic) |
| `medical.user_health_reports` | Doctor Export PDF Metadaten |

**VIEWs:**
- `medical.user_latest_biomarkers` (Materialized)
- `medical.user_health_dashboard_summary` (Materialized)

---

## Kern-Tabellen Detail

### `medical.biomarkers`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `loinc_code` | TEXT UNIQUE | LOINC-Standard-Code (z.B. "2093-3" = Cholesterol) |
| `name` | TEXT NOT NULL | Canonical EN Name |
| `name_de` | TEXT | Deutsch |
| `common_name` | TEXT | Gebräuchlicher Name |
| `abbreviations` | TEXT[] | ['ALT', 'SGPT'] |
| `category` | TEXT NOT NULL | cbc / metabolic / lipid / liver / thyroid / hormone / inflammation / vitamins_minerals / cancer_screening |
| `subcategory` | TEXT | |
| `biomarker_group` | TEXT | lipid_panel / liver_panel / thyroid_panel / etc. |
| `unit` | TEXT NOT NULL | mg/dL / nmol/L / IU/L / ng/mL / % |
| `lab_range_min` / `lab_range_max` | NUMERIC(12,3) | Klinischer Normal-Bereich |
| `optimal_range_min` / `optimal_range_max` | NUMERIC(12,3) | Performanz-optimaler Bereich |
| `critical_low_value` / `critical_high_value` | NUMERIC(12,3) | Sofort-Arzt Werte |
| `gender_specific_ranges` | JSONB | {male: {min, max}, female: {min, max}} |
| `age_specific_ranges` | JSONB | [{age_min: 18, age_max: 30, min, max}] |
| `description` | TEXT | |
| `description_de` | TEXT | |
| `clinical_significance` | TEXT | |
| `affected_by_factors` | TEXT[] | diet / exercise / stress / medications / supplements |
| `testing_requirements` | TEXT[] | fasting / time_of_day / special_prep |
| `supplement_effects` | JSONB | {Vitamin D3: {direction: "increases", strength: "strong"}} |
| `measurement_frequency_recommended` | TEXT | annually / quarterly / monthly |
| `evidence_level` | TEXT | A+ / A / B / C |
| `sort_order` | INTEGER | |
| `display_priority` | INTEGER | |

**Indexes:** GIN auf name (pg_trgm), btree auf category, display_priority DESC

---

### `medical.user_biomarker_results`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `biomarker_id` | UUID FK | |
| `value` | NUMERIC(12,3) NOT NULL | |
| `unit` | TEXT NOT NULL | |
| `test_date` | DATE NOT NULL | |
| `lab_name` | TEXT | |
| `lab_range_min` / `lab_range_max` | NUMERIC | Labor-eigene Range |
| `lab_interpretation` | TEXT | normal / high / low / critical (vom Labor) |
| `fasting_status` | TEXT | fasting / non_fasting / unknown |
| `data_source` | TEXT DEFAULT 'manual' | manual / ocr_upload / lab_integration |
| `entry_confidence` | NUMERIC(3,2) DEFAULT 1.0 | 0–1 (OCR: 0–1 je nach Confidence) |
| `needs_verification` | BOOLEAN DEFAULT false | OCR unsicher → User Review |
| `critical_flag` | BOOLEAN DEFAULT false | Auto-gesetzt wenn < critical_low oder > critical_high |
| `trend_significance` | TEXT | significant_improvement / significant_decline / stable |
| `lab_report_url` | TEXT | Link zum Original-PDF |

**UNIQUE Constraint:** kein Duplikat (user_id, biomarker_id, test_date, lab_name)

---

### `medical.lab_reports`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `report_date` | DATE | |
| `lab_name` | TEXT | |
| `file_url` | TEXT | Supabase Storage |
| `ocr_status` | TEXT | pending / processing / completed / failed / needs_review |
| `ocr_results` | JSONB | Raw Claude Vision Output |
| `extracted_values` | JSONB | Parsed Biomarker-Werte mit Confidence |
| `review_required` | BOOLEAN DEFAULT false | Wenn Confidence < Threshold |
| `total_markers_found` | INTEGER | |
| `markers_needs_review` | INTEGER | |

---

### `medical.user_health_metrics`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` / `calculation_date` | | UNIQUE |
| `overall_health_score` | NUMERIC(5,2) | 0–100 Composite |
| `liver_score` | NUMERIC(5,2) | ALT, AST, GGT, Bilirubin, Albumin |
| `cardiovascular_score` | NUMERIC(5,2) | LDL, HDL, Triglycerides, CRP, Homocysteine |
| `kidney_score` | NUMERIC(5,2) | Creatinine, BUN, eGFR, Uric Acid |
| `hormonal_score` | NUMERIC(5,2) | Testosterone, E2, Cortisol, TSH, T3/T4 |
| `metabolic_score` | NUMERIC(5,2) | HbA1c, Glucose, Insulin, HOMA-IR |
| `health_trajectory` | TEXT | improving / stable / declining |
| `data_completeness_score` | NUMERIC(3,2) | Wieviele Marker vorhanden 0–1 |
| `biomarkers_included` | UUID[] | Welche Marker beigetragen haben |
| `missing_key_biomarkers` | UUID[] | Wichtige fehlende Marker |

---

### `medical.user_symptoms`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `symptom_name` | TEXT NOT NULL | |
| `symptom_category` | TEXT | physical / mental / digestive / sleep / skin |
| `severity` | INTEGER | 1–10 |
| `onset_datetime` | TIMESTAMPTZ NOT NULL | |
| `resolution_datetime` | TIMESTAMPTZ | Wenn gelöst |
| `potential_triggers` | TEXT[] | |
| `relieving_factors` | TEXT[] | |
| `biomarkers_around_time` | UUID[] | Gleichzeitige Biomarker-Tests |
| `associated_medications` | TEXT[] | |
| `impact_on_daily_life` | INTEGER | 1–10 |
| `photo_urls` | TEXT[] | Sichtbare Symptome |

---

### `medical.user_medications`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `medication_name` | TEXT NOT NULL | |
| `medication_type` | TEXT | prescription / otc / supplement / herb |
| `dosage` | TEXT | "500mg", "2 Tabletten" |
| `frequency` | TEXT | daily / twice_daily / as_needed / weekly |
| `start_date` | DATE NOT NULL | |
| `end_date` | DATE | NULL = aktuell aktiv |
| `indication` | TEXT | Warum verschrieben |
| `requires_blood_monitoring` | BOOLEAN DEFAULT false | |
| `monitoring_frequency` | TEXT | weekly / monthly / quarterly |
| `next_monitoring_due` | DATE | Alert-Basis |
| `status` | TEXT DEFAULT 'active' | active / discontinued / paused |
| `target_biomarkers` | UUID[] | Welche Biomarker dieses Medikament beeinflusst |
| `side_effects` | TEXT[] | |
| `known_drug_interactions` | TEXT[] | |

---

### `medical.medical_alerts`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID | |
| `biomarker_id` | UUID FK | |
| `alert_type` | TEXT | out_of_range / critical_high / critical_low / trending_bad / monitoring_overdue |
| `severity` | TEXT | info / warning / critical |
| `triggered_value` | NUMERIC | Der Auslöser-Wert |
| `triggered_at` | TIMESTAMPTZ | |
| `acknowledged_at` | TIMESTAMPTZ | |

---

## Views

### `user_latest_biomarkers` (Materialized)

```sql
-- user_id, biomarker_id, value, unit, test_date,
-- lab_interpretation, critical_flag, trend_significance
-- DISTINCT ON (user_id, biomarker_id) ORDER BY test_date DESC
```

### `user_health_dashboard_summary` (Materialized)

```sql
-- user_id, overall_health_score, cardiovascular_score, metabolic_score,
-- biomarkers_tracked, critical_biomarkers, latest_test_date,
-- active_medications, recent_symptoms, pending_insights
```

---

## Funktionen

### `calculate_user_health_scores()`

Berechnet alle System Scores aus `user_latest_biomarkers`.
Scoring: Optimal = 100 | Lab Normal = 75 | Auffällig = 50 | Kritisch = 25

### `analyze_biomarker_trends(user_id, biomarker_id, months)`

Lineare Regression für Trend-Richtung + Projektionen.
Gibt zurück: trend_direction, trend_strength, statistical_significance, projected_next_value

### `generate_medical_alerts()`

Scannt neue Lab-Ergebnisse → erstellt Alerts für critical_flag, monitoring_overdue, concerning_trends.

---

## RLS-Policies

Alle User-Tabellen: `auth.uid()::text = user_id::text`

Zusätzlich: Provider-Access-Policy für selektives Sharing mit Arzt (zeitbegrenzte Tokens).

---

## Schema-Entscheidungen

**Warum separates `medical` Schema?** Medizinische Daten = sensibelste Kategorie, maximale Isolation.

**Warum Materialized Views für Dashboard?** Aggregation über viele Lab-Ergebnisse kostet Zeit. Daily Refresh reicht.

**Warum LOINC-Code?** Multi-Lab Vergleichbarkeit — ohne Standard ist "Cholesterol" von Lab A ≠ Lab B.

**Warum Dual-Range (lab_range + optimal_range)?** "Normal" ≠ "Optimal" — zentraler Differenzierungsvorteil.
