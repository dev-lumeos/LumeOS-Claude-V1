# Medical Module — Konsolidiertes Wissen
> Konsolidiert aus 13 Alt-Dokumenten | 2026-04-17
> Quellen: 06_MODULE_MEDICAL.md, lumeos-medical-strategy.md, biomarker-categories.md,
> medical_DATABASE.md, medical_FEATURES.md, medical_API.md, medical_COMPONENTS.md,
> medical_README.md, medical_RESEARCH.md, medical_MIGRATION.md,
> medmod_PRD.md, medmod_TODO.md, micronutrient-reference.md

---

## 1. Zweck & Status

Port 5800. Regelbasiertes Monitoring-System für Gesundheitsmarker, Blutwerte und Biomarker.
**Medical ist KEIN Arzt** — keine Diagnosen, keine Therapiepläne, keine Medikamenten-Dosierungen.
Tracking + Alerting + Korrelation + Arzt-Verweis.

**Status (2026-04-14):** 90% komplett.

---

## 2. Safety Rules (absolut, unveränderlich)

- ❌ Keine Diagnose
- ❌ Keine Therapieempfehlungen
- ❌ Keine Medikamenten-Dosierungsempfehlungen
- ❌ Keine "Dein Arzt ist falsch"-Aussagen
- ✅ Werte zeigen + Referenzbereiche (Lab + Optimal)
- ✅ Trends und Veränderungen aufzeigen
- ✅ "Das solltest du mit deinem Arzt besprechen"
- ✅ Supplement-Timing-Informationen (bei Evidence-Grundlage)

---

## 3. Biomarker-Kategorien (9 Kategorien, 100+ Marker)

| Kategorie | Anzahl Marker | Kern-Marker |
|---|---|---|
| CBC (Complete Blood Count) | ~15 | WBC, RBC, Hemoglobin, Hematocrit, Platelets |
| Metabolic Panel | ~15 | Glucose, HbA1c, Insulin, BUN, Creatinine, eGFR |
| Lipid Panel | ~8 | Total Chol, LDL, HDL, Triglycerides, ApoB, Lp(a) |
| Liver Panel | ~7 | ALT, AST, GGT, ALP, Bilirubin, Albumin |
| Thyroid | ~8 | TSH, Free T3, Free T4, Reverse T3, TPO-Ab |
| Hormones | ~15 | Total T, Free T, SHBG, E2, Cortisol, DHEA-S, LH, FSH, IGF-1 |
| Inflammation | ~6 | hs-CRP, Homocysteine, ESR, Ferritin, IL-6 |
| Vitamins & Minerals | ~12 | Vitamin D, B12, Folate, Iron, Ferritin, Magnesium (RBC), Zinc |
| Cancer Screening | ~5 | PSA, CEA, CA-125, AFP |

**Dual-Range System:** Lab Range (klinisch normal) + Optimal Range (performanz-optimal).
Beispiel Ferritin: Lab Normal 12–300 ng/mL → Optimal Athlete 80–150 ng/mL.

---

## 4. System Scores (5 × 0–100)

| System | Marker |
|---|---|
| **Liver** | ALT, AST, GGT, Bilirubin, Albumin |
| **Cardio** | LDL, HDL, Triglycerides, hs-CRP, Homocysteine |
| **Kidney** | Creatinine, BUN, eGFR, Uric Acid |
| **Hormone** | Testosterone, Estradiol, Cortisol, TSH, T3, T4 |
| **Metabolic** | HbA1c, Fasting Glucose, Insulin, HOMA-IR |

Score 100 = alle Marker optimal | 70 = alle im Lab-Normal | 30 = an kritischer Grenze | 0 = kritisch

---

## 5. OCR Import Pipeline (Claude Vision)

PDF/Foto → Text-Extraktion → NLP Entity Recognition →
Biomarker Name Matching (LOINC) → Value Extraktion → Unit Normalization →
Plausibilitätsprüfung → User Validation ("Stimmen diese Werte?") → Speicherung

Formate: PDF, Foto, Fax-Scans, mehrseitig
Confidence Scoring: 0–100 pro Wert
Duplicate Detection: Verhindert doppelte Einträge

---

## 6. Datenbank-Kern

| Tabelle | Beschreibung |
|---|---|
| `biomarkers` | Katalog 100+ Biomarker mit Ranges (LOINC-Code) |
| `biomarker_reference_ranges` | Alter/Geschlecht/Population-spezifische Ranges |
| `user_biomarker_results` | Einzel-Ergebnisse (manual/ocr/lab_integration) |
| `lab_reports` | OCR-Import Container (PDF-URL, OCR-Status) |
| `user_health_metrics` | Berechnete System Scores (Cardio, Metabolic...) |
| `user_symptoms` | Symptom-Tracking mit Korrelations-Links |
| `user_medications` | Medikamente (Rx + OTC) + Monitoring |
| `user_medical_insights` | AI-generierte Insights (non-diagnostic) |
| `user_health_reports` | Doctor Export PDF |
| `biomarker_population_statistics` | Population Benchmarking |

**Materialized VIEWs:** `user_latest_biomarkers` · `user_health_dashboard_summary`

---

## 7. Cross-Module Verbindungen

| Modul | Medical gibt | Medical empfängt |
|---|---|---|
| **Nutrition** | Deficiency Alerts (Ferritin → Eisen-reiche Foods) | — |
| **Supplements** | Biomarker → Supplement Effectiveness Tracking | — |
| **Training** | CRP erhöht → Training-Warnung | Training Load → Übertraining-Detection |
| **Recovery** | Cortisol, CRP → Recovery Score Modifier | — |
| **Goals** | System Scores → Goal Progress | — |
| **Buddy** | Biomarker-Kontext für evidenzbasierte Erklärungen | — |
| **Enhanced Supps** | Pflicht-Bloodwork-Panel monitoring | — |

---

## 8. Standards (alle kostenlos)

LOINC (90K+ Lab Codes) · RxNorm (Medikamente) · ICD-10 · SNOMED CT · FHIR R4 · OpenFDA

---

## 9. Privacy-Architektur

Tier 1 (Default): Local-First, kein Cloud-Sync, Zero-Knowledge
Tier 2 (Opt-in): E2E Encrypted Cloud, User hält Schlüssel
Tier 3 (Opt-in): Selektives Sharing mit Arzt/Coach (zeitbegrenzte Tokens)

---

## 10. Biomarker Seed-Daten (Auszug Optimal Ranges)

| Marker | Lab Normal | Optimal Athlete | Kritisch |
|---|---|---|---|
| Vitamin D (25-OH) | 30–100 ng/mL | 40–60 ng/mL | <20 |
| Ferritin | 12–300 ng/mL | 80–150 ng/mL (Athlete) | <12 |
| Total Testosterone | 300–1000 ng/dL | 500–900 ng/dL | <200 |
| hs-CRP | <3.0 mg/L | <1.0 mg/L | >10 |
| HbA1c | <6.5% | <5.4% | >8% |
| TSH | 0.4–4.0 mIU/L | 0.5–2.5 mIU/L | >10 |
| Magnesium (RBC) | 4.2–6.8 mg/dL | 5.0–6.5 mg/dL | <4.0 |
| HDL | >40 mg/dL | >50 mg/dL | <35 |
| LDL | <130 mg/dL | <100 mg/dL | >190 |
| ApoB | <130 mg/dL | <90 mg/dL | >150 |
