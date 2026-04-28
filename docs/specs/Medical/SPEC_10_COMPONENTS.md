# Medical Module — Frontend Components
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/medical` | 5-Tab Layout |

## Tabs

| Tab | Component | Beschreibung |
|---|---|---|
| Dashboard | `HealthDashboard` | System Scores + Alerts + Quick Actions |
| Blutwerte | `BiomarkerView` | Alle 100+ Marker gefiltert nach Kategorie |
| Import | `LabImportView` | OCR Upload + Manuelle Eingabe |
| Tracking | `TrackingView` | Symptome + Medikamente |
| Insights | `InsightsView` | Korrelationen + Effectiveness + Doctor Export |

---

## Dashboard Components (7)

| Component | Beschreibung |
|---|---|
| `HealthDashboard` | Haupt-Layout: Scores + Alerts + Quick Actions |
| `HealthScoreRing` | Gesamt-Score als animierter SVG-Ring (0–100) |
| `SystemScoreCard` | Karte pro System: Ring + Zahl + Trend-Pfeil + Farbcoding |
| `SystemScoreBreakdown` | Aufklappbare Marker-Liste mit Flags |
| `MedicalAlerts` | Alert-Banner sortiert nach Severity |
| `AlertCard` | Einzelner Alert: Biomarker, Wert, Schwere, Arzt-Hinweis |
| `HealthDashboardSummary` | Kompakt: Tracker-Anzahl, letzter Test, pending Insights |

---

## Biomarker Components (8)

| Component | Beschreibung |
|---|---|
| `BiomarkerView` | Gefilterte Liste nach Kategorie-Tabs |
| `BiomarkerCategoryTabs` | CBC/Metabolic/Lipid/Liver/Thyroid/Hormone/Inflammation/Vitamins |
| `BiomarkerCard` | Name, Wert, Einheit, Flag-Ampel, Trend-Symbol, Optimal Range |
| `BiomarkerDetail` | Vollansicht: beide Ranges, Beschreibung, History-Chart, Supplement-Wirkung |
| `BiomarkerChart` | Linien-Chart: Wert-Verlauf + Lab Range + Optimal Range Bänder |
| `RangeIndicator` | Visueller Range-Balken: optimal (grün) / normal (gelb) / auffällig (orange) / kritisch (rot) |
| `BiomarkerSearch` | Volltext-Suche über alle 100+ Marker |
| `TrendBadge` | ↑ rising / → stable / ↓ falling (statistisch significant) |

---

## Lab Import Components (6)

| Component | Beschreibung |
|---|---|
| `LabImportView` | Upload + Manuelle Eingabe in zwei Sub-Tabs |
| `OCRUploader` | Drag & Drop / Kamera / Datei für PDF/Bild (max 20 MB) |
| `OCRProcessingStatus` | Fortschrittsanzeige + "Claude analysiert..." Animation |
| `OCRReviewTable` | Extrahierte Werte mit Confidence — User bestätigt/korrigiert |
| `ManualLabEntry` | Biomarker-Suche → Wert + Einheit + Datum eingeben |
| `LabReportHistory` | Vergangene Imports mit OCR-Status + Marker-Anzahl |

---

## Symptom + Medication Components (8)

| Component | Beschreibung |
|---|---|
| `TrackingView` | Symptome + Medikamente in Sub-Tabs |
| `SymptomLogger` | Neues Symptom: Name, Severity-Slider, Trigger, Zeitstempel, Foto |
| `SymptomList` | Aktive + gelöste Symptome |
| `SymptomCard` | Severity, Dauer, Trigger, verknüpfte Biomarker |
| `MedicationTracker` | Medikamenten-Liste + Monitoring-Status |
| `MedicationCard` | Name, Dosis, Nächste Einnahme, Adherence, Monitoring-Badge |
| `MonitoringDueAlert` | "Bluttest für [Medikament] fällig" Banner |
| `DrugInteractionAlert` | Wechselwirkung beim Hinzufügen eines neuen Medikaments |

---

## Insights Components (5)

| Component | Beschreibung |
|---|---|
| `InsightsView` | Korrelationen + Supplement-Effectiveness + Report Generator |
| `CorrelationView` | Biomarker ↔ Lifestyle Korrelations-Charts |
| `SupplementEffectivenessCard` | "Vitamin D: 18→52 ng/mL ✅" mit Flag-Vergleich |
| `PopulationBenchmark` | "Dein LDL ist besser als 73% der Männer 35–45" |
| `ReportGenerator` | Kategorien wählen, Zeitraum, Zielgruppe → PDF generieren |

---

## Custom Hooks (16)

| Hook | Beschreibung |
|---|---|
| `useBiomarkerCatalog(category?)` | Katalog gefiltert + User Latest Values |
| `useBiomarkerDetail(id)` | Detail + History + Trend |
| `useUserLatestBiomarkers()` | Aktuellste Werte aller Marker (aus Materialized View) |
| `useBiomarkerTrend(id, months)` | Trend-Analyse |
| `useBiomarkerSearch(q)` | Volltext-Suche |
| `useHealthMetrics()` | System Scores + Trajectory |
| `useHealthMetricsHistory(days)` | Score-Verlauf |
| `useMedicalAlerts()` | Aktive Alerts |
| `useMedicalAlertActions()` | acknowledge, resolve |
| `useLabImport()` | OCR Upload State + Polling |
| `useLabHistory()` | Import-Historie |
| `useSymptoms(options)` | Symptom-Liste + Korrelationen |
| `useSymptomActions()` | create, update, resolve |
| `useMedications()` | Aktive Medikamente + Monitoring-Status |
| `useMedicationActions()` | create, update, discontinue |
| `useInsights()` | AI-Insights + Supplement-Effectiveness |

---

## Stores (2)

| Store | State | Actions |
|---|---|---|
| `medicalUIStore` | activeTab, selectedCategory, selectedBiomarkerId, chartRange | setActiveTab, setCategory, selectBiomarker, setChartRange |
| `labImportStore` | uploadFile, ocrStatus, extractedValues, reviewConfirmed | setUploadFile, setExtracted, confirmValue, rejectValue, resetImport |

---

## i18n — 280+ Keys

```
Namespace: 'medical'

medical.dashboard.title            = "Gesundheit"
medical.dashboard.overall_score    = "Gesamtscore"
medical.dashboard.no_data          = "Noch keine Blutwerte · Ersten Test importieren"
medical.system.liver               = "Leber"
medical.system.cardiovascular      = "Herz-Kreislauf"
medical.system.kidney              = "Niere"
medical.system.hormonal            = "Hormone"
medical.system.metabolic           = "Stoffwechsel"
medical.flag.optimal               = "Optimal ✅"
medical.flag.normal                = "Normal 🟡"
medical.flag.low                   = "Zu niedrig 🟠"
medical.flag.high                  = "Zu hoch 🟠"
medical.flag.critical_low          = "Kritisch niedrig 🔴"
medical.flag.critical_high         = "Kritisch hoch 🔴"
medical.range.lab_range            = "Labor-Normal"
medical.range.optimal_range        = "Optimal"
medical.alert.critical_action      = "Sofort Arzt kontaktieren"
medical.alert.warning_action       = "Mit Arzt besprechen"
medical.import.ocr_processing      = "Claude analysiert deinen Bluttest..."
medical.import.review_prompt       = "Bitte überprüfe diese Werte"
medical.import.confirm             = "Bestätigen + Speichern"
medical.safety.disclaimer          = "LumeOS stellt keine medizinischen Diagnosen."
medical.trend.rising               = "Steigend ↑"
medical.trend.stable               = "Stabil →"
medical.trend.falling              = "Fallend ↓"
medical.supplement.effective       = "{supplement} zeigt Wirkung ✅"
medical.supplement.no_change       = "Keine Veränderung messbar"
```

---

## Shared Contracts

```
packages/contracts/src/medical/
  biomarker.ts        Biomarker, BiomarkerFlag, BiomarkerRanges
  lab-result.ts       LabResult, LabValue, LabReport
  health-metrics.ts   UserHealthMetrics, SystemScore
  symptom.ts          UserSymptom
  medication.ts       UserMedication
  alert.ts            MedicalAlert, AlertSeverity
  insight.ts          MedicalInsight, SupplementEffectiveness
  report.ts           UserHealthReport
  scoring.ts          SystemScore, OverallScore, TrendResult
  for-ai.ts           MedicalBuddyContext
  for-goals.ts        MedicalGoalsContribution
  for-training.ts     MedicalTrainingRestriction
```
