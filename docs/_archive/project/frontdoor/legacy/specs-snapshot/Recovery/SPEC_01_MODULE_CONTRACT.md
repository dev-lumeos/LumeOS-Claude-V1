# Recovery Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Das Recovery-Modul monitort Erholung und Schlafqualität und gibt datenbasierte
Empfehlungen für optimale Trainingsperformance. Es schützt den User vor Übertraining
und maximiert Adaptation durch evidenzbasiertes Recovery-Management.

**Kern-Feature:** Muscle-Specific Recovery Map — kein Competitor bietet das.

---

## 2. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Self-Report First** | Morning Check-in in <30 Sekunden ohne Wearable |
| **Wearable-Enhanced** | Wearable-Daten verbessern Score, sind aber nicht Pflicht |
| **Deterministisch** | Recovery Score = Pure Function, kein AI |
| **Muscle-Specific** | Recovery nicht global, sondern pro Muskelgruppe |
| **Cross-Module** | Training + Nutrition + Bloodwork beeinflussen Score |
| **Schema-Isolation** | Alle Tabellen im Schema `recovery` |
| **3-sprachig** | DE/EN/TH — TH initial NULL |

---

## 3. Inputs

### 3.1 Von Training — Training Load (täglich)
```
POST http://recovery:5400/api/recovery/training-load
```
```json
{
  "session_id": "uuid",
  "date": "2026-04-15",
  "volume_kg": 4200,
  "intensity_avg_rpe": 7.8,
  "session_duration_min": 52,
  "muscles_worked": [
    { "muscle": "Pectoralis Major", "sets": 12, "volume_kg": 1800 }
  ]
}
```

### 3.2 Von Nutrition — Nutrition Compliance Score
```
GET http://nutrition:5100/api/nutrition/for-goals?date=yesterday
```
| Feld | Verwendung |
|---|---|
| `compliance_score` | Training-Load-Modifier im Recovery Score |
| `protein_adherence_pct` | Protein-Modifier für Muscle Recovery Map |
| `calorie_adherence_pct` | Kalorien-Modifier |

### 3.3 Von Medical — Biomarker (optional, High-Value)
| Marker | Recovery-Einfluss |
|---|---|
| CRP erhöht | Recovery Score Modifier ↓ |
| Cortisol > 25 µg/dL | Score ↓, Overtraining Alert |
| Testosteron −20% Baseline | Recovery Kapazität ↓ |
| Hematocrit > 50% | Kardiovaskulärer Stress |

---

## 4. Outputs

### 4.1 → Goals: Recovery Compliance
```
POST http://goals:5900/api/goals/contributions
```
```json
{
  "module": "recovery",
  "date": "2026-04-15",
  "compliance_score": 78,
  "details": {
    "recovery_score": 78,
    "readiness_level": "good",
    "sleep_hours": 7.5,
    "sleep_quality": 8,
    "checkin_completed": true,
    "overtraining_risk": "low"
  }
}
```

### 4.2 → Training: Readiness Score (vor Session)
```
GET http://recovery:5400/api/recovery/readiness?user_id=:uid
```
```json
{
  "readiness_score": 78,
  "readiness_level": "good",
  "muscle_readiness": {
    "Pectoralis Major": 92,
    "Latissimus Dorsi": 65,
    "Quadriceps": 48
  },
  "hrv_status": "normal",
  "recommendation": "train_normal"
}
```

### 4.3 → Buddy: Recovery Kontext
```
GET /api/recovery/for-ai
```
```json
{
  "recovery_status": "78/100 (Gut) · Schlaf 7.5h · HRV normal",
  "readiness": "good",
  "soreness_hotspots": ["Quadriceps (47%)", "Latissimus (65%)"],
  "muscle_ready": ["Chest (92%)", "Shoulders (88%)", "Biceps (94%)"],
  "recommendations": [
    "Heute ideal: Push Day (Chest/Shoulders/Triceps vollständig erholt)",
    "Beine noch 48% — keine Leg-Day heute"
  ],
  "overtraining_risk": "low",
  "flags": []
}
```

---

## 5. Modul-Grenzen

### Recovery BESITZT:
- Morning Check-in System
- Recovery Score Berechnung
- Muscle Recovery Map
- HRV Logging + Baseline-Berechnung
- Sleep Data (manuell + Wearable-Import)
- Recovery Modality Logging
- Übertraining Detection + Alerts
- Recovery Protocols / Deload-Empfehlungen
- Recovery Trends (7d/30d)

### Recovery BESITZT NICHT:
| Was | Wer |
|---|---|
| Biomarker interpretieren | Medical Modul |
| Trainingsplan anpassen | Training Modul |
| Supplement-Empfehlungen | Supplements Modul |
| Payments | Marketplace Modul |
| Training PLANEN | Training Modul |

---

## 6. API-Übersicht

```
http://recovery:5400
  /api/recovery/checkin              Morning Check-in (UPSERT)
  /api/recovery/score                Recovery Score (berechnet + gecacht)
  /api/recovery/muscle-map           Muscle Recovery Map
  /api/recovery/hrv                  HRV Logging + Baseline
  /api/recovery/sleep                Sleep Data
  /api/recovery/modalities           Recovery Modality Logging
  /api/recovery/insights             Trends, Patterns, Overtraining
  /api/recovery/protocols            Recovery Protokoll-Vorlagen
  /api/recovery/training-load        Eingehend vom Training-Modul
  /api/recovery/readiness            Ausgehend ans Training-Modul
  /api/recovery/for-ai               Buddy Context
  /api/recovery/for-goals            Compliance Export
  /api/recovery/pending-actions      Offene User-Actions
```

---

## 7. Wearable-Integration (MVP)

**Tier 1 (MVP):** Apple HealthKit + Google Health Connect
→ deckt ~90% aller Wearable-User mit 2 Integrations

**Tier 2 (Phase 2):** WHOOP API, Oura API, Garmin Connect API

**Tier 3 (Phase 3):** Phone Camera HRV (gescaffolded, noch nicht implementiert)

**Kein Wearable nötig:** Full Score via Self-Report + Cross-Module Daten
