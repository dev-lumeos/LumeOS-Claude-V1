# Medical Module — Frontend Components

## Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/medical` | 5-Tab Layout |

## Tabs

| Tab | Component | Beschreibung |
|---|---|---|
| Dashboard | `HealthDashboard` | System Scores + Alerts + Key Marker |
| Blutwerte | `BiomarkerView` | Alle Biomarker mit Verlauf |
| Import | `LabImportView` | OCR Upload + Manuelle Eingabe |
| Tracking | `TrackingView` | Symptome + Medikamente |
| Insights | `InsightsView` | Korrelationen + Doctor Export |

---

## Dashboard Components (6)

| Component | Beschreibung |
|---|---|
| `HealthDashboard` | Hauptansicht: System Scores Ring-Chart + Alert-Banner + Quick Actions |
| `SystemScoreCard` | Score-Karte: Name, Score-Ring (0–100), Farbcoding, Trend-Pfeil |
| `SystemScoreBreakdown` | Aufklappbare Marker-Liste pro System |
| `MedicalAlerts` | Alert-Banner sortiert nach Severity (critical oben) |
| `AlertCard` | Einzelner Alert: Biomarker, Wert, Schwere, Arzt-Hinweis |
| `HealthDashboardSummary` | Kurzfassung: biomarkers_tracked, last_test_date, pending_insights |

---

## Biomarker Components (8)

| Component | Beschreibung |
|---|---|
| `BiomarkerView` | Gefilterte Biomarker-Liste nach Kategorie |
| `BiomarkerCategoryTabs` | CBC / Metabolic / Lipid / Liver / Thyroid / Hormone / Inflammation / Vitamins |
| `BiomarkerCard` | Karte: Name, Wert, Einheit, Flag-Ampel, Trend-Symbol |
| `BiomarkerDetail` | Vollansicht: Lab Range, Optimal Range, Erklärungs-Text, History |
| `BiomarkerChart` | Linien-Chart: Verlauf eines Markers über Zeit |
| `RangeIndicator` | Visueller Range-Balken: optimal (grün) / normal (gelb) / auffällig (orange) / kritisch (rot) |
| `BiomarkerSearch` | Suche über alle 100+ Marker |
| `TrendBadge` | ↑ rising / → stable / ↓ falling (statistisch signifikant) |

---

## Lab Import Components (6)

| Component | Beschreibung |
|---|---|
| `LabImportView` | Upload + Manuelle Eingabe Tabs |
| `OCRUploader` | Drag & Drop / Kamera / Datei-Auswahl für PDF/Foto |
| `OCRProcessingStatus` | Fortschrittsanzeige während Claude Vision analysiert |
| `OCRReviewTable` | "Stimmen diese Werte?" — Tabelle mit Checkbox per Wert |
| `ManualLabEntry` | Biomarker aus Katalog suchen + Wert + Einheit eingeben |
| `LabReportHistory` | Liste vergangener Imports mit Status |

---

## Symptom + Medication Components (7)

| Component | Beschreibung |
|---|---|
| `TrackingView` | Symptome + Medikamente Sub-Tabs |
| `SymptomLogger` | Neues Symptom loggen: Name, Severity-Slider, Trigger, Zeitstempel |
| `SymptomList` | Aktive + gelöste Symptome mit Timeline |
| `SymptomCard` | Severity-Balken, Trigger, Verlinkung zu gleichzeitigen Blutwerten |
| `MedicationTracker` | Medikamenten-Liste + Reminder + Adherence |
| `MedicationCard` | Name, Dosis, Nächste Einnahme, Adherence-%, Monitoring-Status |
| `MonitoringDueAlert` | "Bluttest für [Medikament] überfällig" Banner |

---

## Insights Components (5)

| Component | Beschreibung |
|---|---|
| `InsightsView` | Korrelationen + Supplement-Effectiveness + Report-Generator |
| `CorrelationView` | Biomarker ↔ Lifestyle Korrelations-Charts |
| `SupplementEffectivenessCard` | "Vitamin D: 18 → 52 ng/mL ✅" Karte |
| `PopulationBenchmark` | "Dein LDL ist besser als 73% der Männer deines Alters" |
| `ReportGenerator` | Doctor Export: Kategorien wählen → PDF generieren |

---

## Custom Hooks (16)

| Hook | Beschreibung |
|---|---|
| `useBiomarkerCatalog(category?)` | Biomarker-Katalog gefiltert |
| `useBiomarkerDetail(id)` | Detail + User History |
| `useUserLatestBiomarkers()` | Neueste Werte aller Marker |
| `useBiomarkerTrend(id, months)` | Trend-Analyse |
| `useHealthMetrics()` | System Scores + Trajectory |
| `useHealthMetricsHistory(days)` | Score-Verlauf |
| `useMedicalAlerts()` | Aktive Alerts |
| `useLabImport()` | OCR Upload State + Progress |
| `useLabHistory()` | Import-Historie |
| `useManualLabEntry()` | Manuelle Eingabe Form State |
| `useSymptoms(period?)` | Symptom-Liste |
| `useSymptomActions()` | create, update, resolve |
| `useMedications()` | Aktive Medikamente + Monitoring |
| `useMedicationActions()` | create, update, discontinue |
| `useInsights()` | Insights + Korrelationen |
| `useSupplementEffectiveness()` | Supplement ↔ Biomarker |

---

## Stores (2)

| Store | State | Actions |
|---|---|---|
| `medicalUIStore` | activeTab, selectedCategory, selectedBiomarkerId | setActiveTab, setCategory, selectBiomarker |
| `labImportStore` | uploadStatus, ocrProgress, extractedValues, reviewMode | setUploadStatus, setExtracted, confirmValues |

---

## Shared Contracts

```
packages/contracts/src/medical/
  biomarker.ts       Biomarker, BiomarkerRange, BiomarkerFlag
  lab-result.ts      LabResult, LabValue, LabReport
  health-metrics.ts  HealthMetrics, SystemScore
  symptom.ts         Symptom, SymptomSeverity
  medication.ts      Medication, MedicationStatus
  alert.ts           MedicalAlert, AlertSeverity
  insight.ts         MedicalInsight, CorrelationResult
  report.ts          HealthReport
  for-ai.ts          MedicalBuddyContext
  for-goals.ts       MedicalGoalsContribution
```
