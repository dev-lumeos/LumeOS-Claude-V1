# Medical Module — Features

## Implementierte Features

### 1. Biomarker Tracking (100+ Marker)

Kuratierte Datenbank mit 100+ Biomarkern in 9 Kategorien.

- Dual-Range System: Lab Range (klinisch normal) + Optimal Range (performanz-optimal)
- Alter/Geschlecht-spezifische Ranges (biomarker_reference_ranges Tabelle)
- LOINC-Code je Biomarker
- Ampel-Farbcoding: optimal (grün) / normal (gelb) / auffällig (orange) / kritisch (rot)
- Trend-Anzeige: rising/stable/falling Symbol per Marker

Code: `routes/biomarkers.ts` · `medical.biomarkers` · `BiomarkerCard.tsx` · `useBiomarkerCatalog.ts`

---

### 2. Lab Report OCR Import (Claude Vision)

- Formate: PDF, Foto, Fax-Scans, mehrseitig, handgeschrieben
- Extrahiert: Biomarker-Werte, Einheiten, Referenzbereiche, Labor-Info, Datum
- Confidence Scoring: 0–100 pro Wert
- User Validation: "Stimmen diese Werte?" nach Extraktion
- Duplicate Detection: Verhindert doppelte Einträge
- Manueller Review-Flag für unsichere Werte (entry_confidence < 0.8)
- Plausibilitätsprüfung: biologisch plausible Bereiche

Code: `routes/lab-results.ts` · `medical.lab_reports` · `LabImport.tsx` · `useLabImport.ts`

---

### 3. Manuelle Lab-Eingabe

Alternative zu OCR — direkte Eingabe von Biomarker-Werten.

- Biomarker aus Katalog suchen
- Datum + Labor + Notizen
- Wert + Einheit + Lab-Range aus Dokument
- Sofortige Flag-Berechnung

Code: `routes/lab-results.ts` · `ManualLabEntry.tsx`

---

### 4. System Scores (5 × 0–100)

Gewichtete Scores pro Körpersystem aus den neuesten Biomarker-Werten.

| System | Marker |
|---|---|
| Liver | ALT, AST, GGT, Bilirubin, Albumin |
| Cardio | LDL, HDL, Triglycerides, hs-CRP, Homocysteine |
| Kidney | Creatinine, BUN, eGFR, Uric Acid |
| Hormone | Testosterone, Estradiol, Cortisol, TSH, Free T3/T4 |
| Metabolic | HbA1c, Fasting Glucose, Insulin, HOMA-IR |

Trigger: Täglich via Cron neu berechnet wenn neue Lab-Ergebnisse vorliegen.

Code: `routes/health-metrics.ts` · `medical.user_health_metrics` · `SystemScoreCard.tsx`

---

### 5. Medical Alerts

Automatische Warnungen bei kritischen oder auffälligen Werten.

- Alert-Typen: out_of_range, critical_high, critical_low, trending_bad, monitoring_overdue
- Severity: info, warning, critical
- Critical → sofortige prominente Anzeige + Arzt-Hinweis
- Integration in Buddy (erklärt Alert, gibt Kontext — KEIN Diagnose)

Code: `routes/alerts.ts` · `medical.medical_alerts` · `MedicalAlerts.tsx`

---

### 6. Symptom Tracking

- Symptom-Name, Kategorie, Severity (1–10), Zeitstempel
- Dauer, Triggering-Faktoren, Reliefing-Faktoren
- Verbindung zu gleichzeitigen Biomarkern (biomarkers_around_time)
- Photo-Dokumentation für sichtbare Symptome
- Impact-Assessment: Arbeit, Schlaf, Stimmung

Code: `routes/symptoms.ts` · `medical.user_symptoms` · `SymptomLogger.tsx`

---

### 7. Medication Tracking

- Medikamente: Rx + OTC + Supplements
- Dosierung, Frequenz, Timing (with_food / empty stomach)
- Start/End-Datum, Indikation, Verschreibender Arzt
- Adherence Tracking (%)
- Side Effect Logging
- Monitoring-Anforderungen: requires_blood_monitoring → automatischer nächster Test-Reminder
- Drug-Drug + Drug-Supplement Interaktionen (via OpenFDA)

Code: `routes/medications.ts` · `medical.user_medications` · `MedicationTracker.tsx`

---

### 8. Trend Analyse (Statistisch)

- Lineare Regression für einfache Trends
- Change-Point-Detection: Signifikante Trendänderungen erkennen
- Outlier-Detection: Ausreißer flaggen
- Projektionen: zukünftige Wert-Schätzungen
- Optimal Testing Schedule: Wann nächster Test empfohlen (je nach Variabilität)

Code: `routes/trends.ts` · `BiomarkerChart.tsx` · `useBiomarkerTrend.ts`

---

### 9. Cross-Module Correlation Engine

Verbindet Biomarker-Veränderungen mit Daten anderer Module.

Beispiele:
- "CRP steigt wenn Trainingsvolumen >20 Sets/Woche" (Training-Korrelation)
- "Ferritin-Abfall korreliert mit Schlaf-Score -15" (Recovery-Korrelation)
- "Vitamin D Anstieg nach 3 Monaten Supplementierung: 18→52 ng/mL" (Supplements-Effektivität)
- "HbA1c Verbesserung bei Tagen mit >80% Nutrition Compliance" (Nutrition-Korrelation)

Code: `routes/insights.ts` · `CorrelationView.tsx`

---

### 10. Doctor Export (Report Generator)

PDF-Bericht für Arztbesuche im Pro-Tier.

- Executive Summary (aktueller Gesundheitsstatus)
- Biomarker-Tabelle (Wert + Lab Range + Optimal Range + Flag + Trend)
- Trend Charts (Zeitverlauf wichtigster Marker)
- Korrelations-Insights
- Symptom-Zusammenfassung
- Medikamenten-Übersicht
- Selektiv: User wählt welche Kategorien enthalten sind

Code: `routes/reports.ts` · `ReportGenerator.tsx`

---

### 11. Population Benchmarking

- Percentile-Ranking vs. Altersgruppe + Geschlecht
- Biologisches Alter (Health Age vs. Chronologisches Alter)
- Vergleich mit Athlete-Population

Code: `medical.biomarker_population_statistics`

---

### 12. i18n

280+ Übersetzungs-Keys in DE/EN/TH. TH initial NULL.

---

## Geplante Features

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Doctor Integration | Datensharing mit Arzt (FHIR Export, Provider Portal) |
| CGM Integration | Continuous Glucose Monitor Real-Time-Daten |
| Lab Integration APIs | LabCorp, Quest Diagnostics Direct |
| Correlation Engine vollständig | Alle Cross-Module Korrelationen |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Lab Test Partnerships | Affiliate mit Quest/LetsGetChecked |
| E2E Encryption vollständig | User-held Keys, Local-First SQLite |
| Genomic Integration | Genetic data integration |
| Smart Health Reports | Automatisch quartalsweise generiert |
