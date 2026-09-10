# Medical Module — API Specification
> Spec Phase 7 | Alle Endpoints mit Request/Response

---

## Übersicht

**Base URL:** `http://medical:5800`
**Auth:** JWT via `Authorization: Bearer <token>`
**Format:** `{ ok: boolean, data?: T, error?: string }`

---

## 1. Biomarkers — `/api/medical/biomarkers`

### `GET /api/medical/biomarkers`

**Query:** `category`, `group`, `q` (Suche), `limit=50`, `offset=0`

**Response:**
```json
{
  "ok": true,
  "data": {
    "biomarkers": [
      {
        "id": "uuid", "loinc_code": "2093-3",
        "name": "Cholesterol, Total", "name_de": "Gesamtcholesterin",
        "category": "lipid", "biomarker_group": "lipid_panel",
        "unit": "mg/dL",
        "lab_range_min": 100, "lab_range_max": 200,
        "optimal_range_min": 150, "optimal_range_max": 180,
        "critical_low_value": null, "critical_high_value": 300,
        "display_priority": 90,
        "user_latest": {
          "value": 175, "test_date": "2026-01-15",
          "current_flag": "optimal", "trend_significance": "stable"
        }
      }
    ],
    "total": 47
  }
}
```

---

### `GET /api/medical/biomarkers/:id`

Detail mit User History + Supplement-Wirkung.

**Response:**
```json
{
  "id": "uuid", "loinc_code": "2276-4",
  "name": "Ferritin", "name_de": "Ferritin",
  "category": "inflammation",
  "unit": "ng/mL",
  "lab_range_min": 12, "lab_range_max": 300,
  "optimal_range_min": 80, "optimal_range_max": 150,
  "critical_low_value": 12,
  "description_de": "Ferritin ist der wichtigste Eisenspeicher...",
  "affected_by_factors": ["diet", "exercise", "inflammation", "supplements"],
  "testing_requirements": ["fasting"],
  "supplement_effects": {"Iron Bisglycinate": {"direction": "increases", "strength": "strong"}},
  "user_history": [
    {"value": 28, "test_date": "2025-07-10", "current_flag": "low"},
    {"value": 45, "test_date": "2025-10-15", "current_flag": "low"},
    {"value": 78, "test_date": "2026-01-15", "current_flag": "normal"}
  ],
  "trend": {"direction": "rising", "strength": "significant", "change_pct": 178}
}
```

---

### `GET /api/medical/biomarkers/:id/history`

**Query:** `months=12`

---

## 2. Lab Results — `/api/medical/lab-results`

### `GET /api/medical/lab-results`

**Query:** `from`, `to`, `limit=20`, `offset=0`

---

### `POST /api/medical/lab-results` — Manuelle Eingabe

**Body:**
```json
{
  "test_date": "2026-01-15",
  "lab_name": "LabCorp",
  "fasting_status": "fasting",
  "values": [
    {
      "biomarker_id": "uuid",
      "value": 175, "unit": "mg/dL",
      "lab_range_min": 100, "lab_range_max": 200
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "inserted_count": 5,
    "alerts_triggered": [
      {"biomarker": "LDL", "severity": "warning", "flag": "high", "value": 145}
    ],
    "health_metrics_updated": true
  }
}
```

---

### `POST /api/medical/lab-results/import` — OCR Upload

`multipart/form-data` mit `file` (PDF oder Bild, max 20 MB)

**Response (Processing gestartet):**
```json
{
  "ok": true,
  "data": {
    "report_id": "uuid",
    "ocr_status": "processing",
    "poll_url": "/api/medical/lab-results/import/uuid/status"
  }
}
```

---

### `GET /api/medical/lab-results/import/:id/status`

**Response (fertig):**
```json
{
  "ok": true,
  "data": {
    "ocr_status": "needs_review",
    "total_markers_found": 12,
    "markers_needs_review": 2,
    "extracted_values": [
      {
        "biomarker_name": "Cholesterol, Total",
        "biomarker_id": "uuid",
        "value": 175, "unit": "mg/dL",
        "lab_range_raw": "100-200 mg/dL",
        "confidence": 0.97, "needs_review": false
      },
      {
        "biomarker_name": "Unknown Marker XYZ",
        "biomarker_id": null,
        "value": 42, "unit": "?",
        "confidence": 0.45, "needs_review": true,
        "review_reason": "Biomarker nicht im Katalog gefunden"
      }
    ]
  }
}
```

---

### `POST /api/medical/lab-results/import/:id/confirm`

User bestätigt OCR-Werte nach Review.

**Body:**
```json
{
  "report_date": "2026-01-15",
  "lab_name": "MVZ Labor",
  "values": [
    {"biomarker_id": "uuid", "value": 175, "unit": "mg/dL", "confirmed": true},
    {"biomarker_id": null, "value": 42, "confirmed": false}
  ]
}
```

---

## 3. Health Metrics — `/api/medical/health-metrics`

### `GET /api/medical/health-metrics`

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
  "missing_key_biomarkers": [
    {"name": "ApoB", "category": "lipid"},
    {"name": "hs-CRP", "category": "inflammation"}
  ]
}
```

### `GET /api/medical/health-metrics/history`

**Query:** `days=90`

### `POST /api/medical/health-metrics/recalculate`

Scores neu berechnen nach neuen Lab-Daten.

---

## 4. Symptoms — `/api/medical/symptoms`

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/symptoms` | Liste (active_only, period=30d) |
| POST | `/api/medical/symptoms` | Symptom loggen |
| PUT | `/api/medical/symptoms/:id` | Updaten (z.B. resolution) |
| GET | `/api/medical/symptoms/correlations` | Symptom ↔ Biomarker Korrelationen |

---

## 5. Medications — `/api/medical/medications`

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/medications` | Alle (status=active) |
| POST | `/api/medical/medications` | Hinzufügen |
| PUT | `/api/medical/medications/:id` | Updaten |
| DELETE | `/api/medical/medications/:id` | Deaktivieren (soft delete) |
| GET | `/api/medical/medications/monitoring-due` | Überfällige Bluttests |
| GET | `/api/medical/medications/interactions` | Drug-Drug + Drug-Supplement |

---

## 6. Alerts — `/api/medical/alerts`

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/alerts` | Aktive Alerts (severity, type filter) |
| PUT | `/api/medical/alerts/:id/acknowledge` | Bestätigen |

---

## 7. Insights — `/api/medical/insights`

### `GET /api/medical/insights`

Aktuelle AI-Insights (nicht dismissed).

```json
{
  "insights": [
    {
      "id": "uuid",
      "insight_type": "trend_detection",
      "insight_priority": "high",
      "title": "Ferritin normalisiert sich",
      "description": "Dein Ferritin ist von 28 auf 78 ng/mL gestiegen (3 Monate). Immer noch unter optimal (80-150), aber guter Trend.",
      "recommended_actions": ["Weiter Iron Bisglycinate nehmen", "Nächster Test in 3 Monaten"],
      "medical_follow_up_recommended": false
    }
  ]
}
```

### `GET /api/medical/insights/supplement-effectiveness`

```json
{
  "supplements": [
    {
      "supplement_name": "Vitamin D3",
      "biomarker": "Vitamin D, 25-OH",
      "supplement_start": "2025-10-01",
      "baseline_value": 18, "latest_value": 52,
      "change_pct": 188,
      "current_flag": "optimal",
      "status": "effective"
    }
  ]
}
```

### `GET /api/medical/insights/system-scores`

Score-Übersicht aller 5 Systeme + Trend.

### `GET /api/medical/insights/correlations`

Cross-Module Korrelationen.

---

## 8. Trends — `/api/medical/trends`

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/trends/:biomarker_id` | Statistik-Analyse (months=6) |
| GET | `/api/medical/trends/population` | User vs. Population Percentile |

**Trend Response:**
```json
{
  "biomarker_id": "uuid",
  "biomarker_name": "LDL Cholesterol",
  "data_points": 4,
  "months_analyzed": 12,
  "trend_direction": "stable",
  "trend_strength": "negligible",
  "change_pct": -4.6,
  "first_value": {"value": 152, "date": "2025-01-15"},
  "latest_value": {"value": 145, "date": "2026-01-15"},
  "projected_next_value": 141,
  "projected_next_date": "2026-07-15",
  "statistical_significance": 0.34
}
```

---

## 9. Reports — `/api/medical/reports`

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/medical/reports/generate` | PDF Report erstellen |
| GET | `/api/medical/reports` | Alle Reports |
| GET | `/api/medical/reports/:id/download` | PDF herunterladen |

**Generate Body:**
```json
{
  "report_type": "provider_summary",
  "time_period_start": "2025-01-01",
  "time_period_end": "2026-01-31",
  "biomarker_categories": ["lipid", "metabolic", "hormone"],
  "include_supplements": true,
  "include_symptoms": true
}
```

---

## 10. Cross-Module Endpoints

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/medical/for-ai` | Buddy Kontext |
| GET | `/api/medical/for-goals` | System Scores für Goal Progress |
| GET | `/api/medical/for-training` | Training Restrictions (CRP, Ferritin) |
| GET | `/api/medical/recovery-biomarkers` | Cortisol + CRP für Recovery Score |
| GET | `/api/medical/pending-actions` | Offene Actions |

**For-AI Response:**
```json
{
  "health_status": "Gesamt: 78/100 · Cardio: 72 · Metabolic: 75 · Hormonal: 68",
  "active_critical_alerts": [],
  "active_warnings": [
    {"biomarker": "LDL", "value": 145, "optimal_max": 100, "message": "LDL über optimal"}
  ],
  "supplement_effectiveness": [
    "Vitamin D3: 18→52 ng/mL ✅ jetzt optimal"
  ],
  "training_restrictions": [],
  "next_recommended_tests": ["Ferritin (empfohlen in 6 Wochen)"],
  "trajectory": "stable"
}
```
