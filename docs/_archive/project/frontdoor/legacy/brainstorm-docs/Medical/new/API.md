# Medical Module — API

## Base URL
`http://medical:5800`

## Route-Mounting

```typescript
app.route('/api/medical/biomarkers',     biomarkersRouter)
app.route('/api/medical/lab-results',    labResultsRouter)
app.route('/api/medical/health-metrics', healthMetricsRouter)
app.route('/api/medical/symptoms',       symptomsRouter)
app.route('/api/medical/medications',    medicationsRouter)
app.route('/api/medical/alerts',         alertsRouter)
app.route('/api/medical/insights',       insightsRouter)
app.route('/api/medical/trends',         trendsRouter)
app.route('/api/medical/reports',        reportsRouter)
app.route('/api/medical/for-ai',         forAiRouter)
app.route('/api/medical/for-goals',      forGoalsRouter)
app.route('/api/medical/pending-actions',pendingActionsRouter)
```

---

## Biomarkers

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/biomarkers` | Katalog (filter: category, group, q) |
| GET | `/api/medical/biomarkers/:id` | Detail mit Ranges + User History |
| GET | `/api/medical/biomarkers/:id/history` | Historische Werte des Users |

**Catalog Response:**
```json
{
  "id": "uuid", "loinc_code": "2093-3",
  "name": "Cholesterol, Total", "name_de": "Gesamtcholesterin",
  "category": "lipid", "unit": "mg/dL",
  "lab_range_min": 100, "lab_range_max": 200,
  "optimal_range_min": 150, "optimal_range_max": 180,
  "critical_low_value": 100, "critical_high_value": 300,
  "user_latest": {"value": 175, "test_date": "2026-01-15", "flag": "optimal"},
  "trend": "stable"
}
```

---

## Lab Results

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/lab-results` | Alle Lab-Ergebnisse des Users |
| POST | `/api/medical/lab-results` | Manuell eingegebene Werte |
| DELETE | `/api/medical/lab-results/:id` | Löschen |
| POST | `/api/medical/lab-results/import` | OCR Upload (PDF/Foto) |
| GET | `/api/medical/lab-results/import/:id` | OCR Status + Extracted Values |
| POST | `/api/medical/lab-results/import/:id/confirm` | User bestätigt OCR-Werte |

**Manual POST Body:**
```json
{
  "test_date": "2026-01-15",
  "lab_name": "LabCorp",
  "values": [
    {"biomarker_id": "uuid", "value": 175, "unit": "mg/dL", "lab_range_min": 100, "lab_range_max": 200}
  ]
}
```

**OCR Upload:** multipart/form-data mit `file` (PDF oder Bild)

**OCR Confirm Body:**
```json
{
  "values": [
    {"biomarker_id": "uuid", "value": 175, "unit": "mg/dL", "confirmed": true},
    {"biomarker_id": "uuid", "value": 999, "confirmed": false}
  ]
}
```

---

## Health Metrics (System Scores)

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/health-metrics` | Aktuellste System Scores |
| GET | `/api/medical/health-metrics/history` | Score-Verlauf (days=90) |
| POST | `/api/medical/health-metrics/recalculate` | Neu berechnen (nach neuen Lab-Daten) |

**Response:**
```json
{
  "calculation_date": "2026-04-17",
  "overall_health_score": 78,
  "liver_score": 85,
  "cardiovascular_score": 72,
  "kidney_score": 90,
  "hormonal_score": 68,
  "metabolic_score": 75,
  "health_trajectory": "stable",
  "data_completeness_score": 0.73,
  "missing_key_biomarkers": ["ApoB", "hs-CRP"]
}
```

---

## Symptoms

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/symptoms` | Symptom-Liste (active, period=30d) |
| POST | `/api/medical/symptoms` | Symptom loggen |
| PUT | `/api/medical/symptoms/:id` | Symptom updaten (z.B. Resolution) |
| GET | `/api/medical/symptoms/correlations` | Symptom ↔ Biomarker Korrelationen |

---

## Medications

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/medications` | Alle Medikamente (status=active) |
| POST | `/api/medical/medications` | Medikament hinzufügen |
| PUT | `/api/medical/medications/:id` | Updaten (Dosis, Status) |
| GET | `/api/medical/medications/interactions` | Drug-Drug + Drug-Supplement Interaktionen |
| GET | `/api/medical/medications/monitoring-due` | Überfällige Bluttests |

---

## Alerts

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/alerts` | Aktive Alerts |
| PUT | `/api/medical/alerts/:id/acknowledge` | Bestätigen |

---

## Insights (Korrelationen)

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/insights` | AI-Insights (aktuell, nicht dismissed) |
| GET | `/api/medical/insights/system-scores` | Score-Übersicht + Trend |
| GET | `/api/medical/insights/correlations` | Cross-Module Korrelationen |
| GET | `/api/medical/insights/supplement-effectiveness` | Supplement ↔ Biomarker Trend |

**Supplement Effectiveness Response:**
```json
{
  "supplement": "Vitamin D3",
  "biomarker": "Vitamin D (25-OH)",
  "start_date": "2025-10-01",
  "first_value": 18,
  "latest_value": 52,
  "change_pct": 188,
  "status": "effective",
  "optimal_range": {"min": 40, "max": 60},
  "current_flag": "optimal"
}
```

---

## Trends

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/trends/:biomarker_id` | Trend-Analyse (months=6) |
| GET | `/api/medical/trends/population` | User vs. Population Percentile |

---

## Reports (Doctor Export)

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/medical/reports/generate` | PDF Report erstellen |
| GET | `/api/medical/reports` | Alle generierten Reports |
| GET | `/api/medical/reports/:id/download` | PDF herunterladen |

---

## Cross-Module

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/for-ai` | Buddy Kontext (Alerts, Scores, Trends) |
| GET | `/api/medical/for-goals` | System Scores → Goal Progress |
| GET | `/api/medical/pending-actions` | Offene Actions (Bluttest fällig, Alert unbestätigt) |

**For-AI Response:**
```json
{
  "health_status": "Cardio: 72 | Metabolic: 75 | Hormonal: 68",
  "active_alerts": [
    {"severity": "warning", "message": "LDL 145 mg/dL — über optimal (100)", "biomarker": "LDL"}
  ],
  "key_insights": ["Vitamin D: 18→52 ng/mL nach Supplementierung ✅"],
  "next_recommended_test": "Quarterly Bloodwork (fällig in 47 Tagen)",
  "supplement_effectiveness": ["Vitamin D3 wirkt — Wert jetzt optimal"],
  "training_restrictions": ["CRP 2.8 mg/L — Trainingsvolumen moderat halten"]
}
```
