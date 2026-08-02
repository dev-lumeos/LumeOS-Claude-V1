# Recovery Module — API Specification
> Spec Phase 7 | Alle Endpoints

---

## Übersicht

**Base URL:** `http://recovery:5400`
**Auth:** JWT
**Format:** `{ ok: boolean, data?: T, error?: string }`

## Route-Mounting

```typescript
app.route('/api/recovery/checkin',          checkinRouter)
app.route('/api/recovery/score',            scoreRouter)
app.route('/api/recovery/muscle-map',       muscleMapRouter)
app.route('/api/recovery/hrv',              hrvRouter)
app.route('/api/recovery/sleep',            sleepRouter)
app.route('/api/recovery/modalities',       modalitiesRouter)
app.route('/api/recovery/insights',         insightsRouter)
app.route('/api/recovery/alerts',           alertsRouter)
app.route('/api/recovery/protocols',        protocolsRouter)
app.route('/api/recovery/training-load',    trainingLoadRouter)
app.route('/api/recovery/readiness',        readinessRouter)
app.route('/api/recovery/for-ai',           forAiRouter)
app.route('/api/recovery/for-goals',        forGoalsRouter)
app.route('/api/recovery/pending-actions',  pendingActionsRouter)
```

---

## 1. Check-in — `/api/recovery/checkin`

### `GET /api/recovery/checkin`

**Query:** `date` (default: heute)

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "date": "2026-04-15",
    "sleep_hours": 7.5, "sleep_quality": 8,
    "subjective_feeling": 7, "mood": "good",
    "energy_level": 7, "motivation": 8,
    "soreness": { "quadriceps": 2, "chest": 1 },
    "stress_level": 4,
    "hrv_rmssd": null,
    "notes": null,
    "recovery_score": 78
  }
}
```

---

### `POST /api/recovery/checkin`

UPSERT — erstellt oder überschreibt.

**Body:**
```json
{
  "date": "2026-04-15",
  "sleep_hours": 7.5,
  "sleep_quality": 8,
  "subjective_feeling": 7,
  "mood": "good",
  "energy_level": 7,
  "soreness": { "quadriceps": 2, "chest": 1 },
  "stress_level": 4,
  "notes": "Legs still sore from Monday"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "checkin_id": "uuid",
    "recovery_score": 78,
    "readiness_level": "good",
    "intensity_recommendation": "moderate",
    "muscle_map_updated": true
  }
}
```

---

## 2. Score — `/api/recovery/score`

### `GET /api/recovery/score`

**Query:** `date` (default: heute)

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "recovery_score": 78,
    "readiness_level": "good",
    "intensity_recommendation": "Normales Training — ideal für Push Day",
    "mode": "manual",
    "components": {
      "sleep_quality_score":   80,
      "sleep_duration_score":  93.8,
      "subjective_score":      70,
      "soreness_score":        78,
      "training_load_score":   85,
      "nutrition_score":       70,
      "mood_score":            80,
      "modality_bonus":        2.0
    }
  }
}
```

---

### `GET /api/recovery/score/trend`

**Query:** `days` (default: 7, max: 90)

**Response:**
```json
{
  "ok": true,
  "data": {
    "scores": [
      { "date": "2026-04-15", "score": 78, "readiness_level": "good" },
      { "date": "2026-04-14", "score": 82, "readiness_level": "good" }
    ],
    "avg_score": 79.5,
    "trend_direction": "stable",
    "checkin_rate": 85.7
  }
}
```

---

## 3. Muscle Map — `/api/recovery/muscle-map`

### `GET /api/recovery/muscle-map`

Aktuelle Recovery % pro Muskelgruppe.

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "muscles": [
      {
        "muscle_group": "Pectoralis Major",
        "slug": "chest",
        "recovery_pct": 92,
        "status": "ready",
        "hours_since_trained": 72,
        "estimated_ready_in_hours": 0,
        "last_trained": "2026-04-12",
        "soreness_level": 1
      },
      {
        "muscle_group": "Quadriceps",
        "slug": "quadriceps",
        "recovery_pct": 47,
        "status": "not_ready",
        "hours_since_trained": 28,
        "estimated_ready_in_hours": 20,
        "last_trained": "2026-04-14",
        "soreness_level": 2
      }
    ],
    "training_recommendation": {
      "today": "Push Day ideal",
      "ready_muscles": ["chest", "front_deltoids", "triceps", "biceps"],
      "avoid_muscles": ["quadriceps", "hamstring", "gluteal"]
    }
  }
}
```

---

## 4. HRV — `/api/recovery/hrv`

### `GET /api/recovery/hrv`

**Query:** `date` (default: heute), `days` (für Trend)

**Response:**
```json
{
  "ok": true,
  "data": {
    "latest": {
      "rmssd": 42.3,
      "pnn50": 18.5,
      "heart_rate": 56,
      "hrv_score": 78,
      "measured_at": "2026-04-15T06:30:00Z",
      "device_source": "apple_health",
      "measurement_quality": "good"
    },
    "baseline": {
      "avg_rmssd": 38.5,
      "stddev_rmssd": 4.2,
      "data_points": 22
    },
    "vs_baseline": {
      "deviation_pct": 9.9,
      "z_score": 0.90,
      "status": "above_baseline"
    },
    "trend": [
      { "date": "2026-04-15", "rmssd": 42.3 },
      { "date": "2026-04-14", "rmssd": 36.1 }
    ]
  }
}
```

---

### `POST /api/recovery/hrv`

**Body:**
```json
{
  "rmssd": 42.3,
  "pnn50": 18.5,
  "heart_rate": 56,
  "device_source": "phone_camera",
  "measurement_quality": "good",
  "measured_at": "2026-04-15T06:30:00Z"
}
```

---

## 5. Sleep — `/api/recovery/sleep`

### `GET /api/recovery/sleep`

**Query:** `date` (default: heute)

**Response:** Vollständige SleepData + Scores für heutige Nacht.

---

### `POST /api/recovery/sleep`

Manuelle Schlaf-Eingabe oder Wearable-Import.

---

## 6. Modalities — `/api/recovery/modalities`

### `GET /api/recovery/modalities`

**Query:** `date` (default: heute)

---

### `POST /api/recovery/modalities`

**Body:**
```json
{
  "modality_type": "sauna",
  "duration_minutes": 20,
  "temperature_c": 80,
  "intensity": "moderate",
  "location": "gym",
  "immediate_effect": 8,
  "notes": "Felt great, very relaxed"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "modality_bonus_added": 2.0,
    "new_recovery_score": 80.0
  }
}
```

---

### `PUT /api/recovery/modalities/:id`

Next-Day-Bewertung hinzufügen.

**Body:** `{ "next_day_effect": 9 }`

---

## 7. Insights — `/api/recovery/insights`

### `GET /api/recovery/insights/patterns`

Erkannte Muster der letzten 30 Tage.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sleep_sweet_spot": {
      "optimal_hours": 7.5,
      "score_improvement": "+12 Punkte vs. weniger Schlaf"
    },
    "best_day": "Tuesday",
    "worst_day": "Monday",
    "top_modality": {
      "type": "massage",
      "avg_score_delta": 3.2
    },
    "nutrition_correlation": {
      "high_protein_days": { "avg_score": 82, "vs_low_protein": "+11" }
    },
    "training_correlation": {
      "day_after_heavy_session": { "avg_score": 65, "typical_soreness": ["legs", "back"] }
    }
  }
}
```

---

### `GET /api/recovery/insights/7d`

7-Tage Zusammenfassung.

---

### `GET /api/recovery/insights/30d`

30-Tage Zusammenfassung.

---

## 8. Alerts — `/api/recovery/alerts`

### `GET /api/recovery/alerts`

**Query:** `status` (active|acknowledged|resolved)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "alert_date": "2026-04-15",
      "severity": "moderate",
      "alert_type": "declining_recovery",
      "signals_count": 4,
      "signals": [
        { "id": "score_low", "value": 52, "threshold": 60, "days": 3 },
        { "id": "sleep_poor", "value": 5.5, "threshold": 6.5, "days": 3 }
      ],
      "recommended_action": "Deload-Woche einlegen",
      "rest_days_suggested": 2,
      "training_modifications": ["Volumen -30%", "Intensität -20%"],
      "status": "active"
    }
  ]
}
```

---

### `PUT /api/recovery/alerts/:id/acknowledge`

Alert bestätigen.

---

### `PUT /api/recovery/alerts/:id/resolve`

Alert als gelöst markieren.

---

## 9. Training Load — `/api/recovery/training-load`

### `POST /api/recovery/training-load`

Eingehend vom Training-Modul nach Session-Abschluss.

**Body:**
```json
{
  "session_id": "uuid",
  "date": "2026-04-15",
  "volume_kg": 4200,
  "intensity_avg_rpe": 7.8,
  "session_duration_min": 52,
  "muscles_worked": {
    "Pectoralis Major": { "sets": 12, "volume_kg": 1800 },
    "Triceps Brachii":  { "sets": 9,  "volume_kg": 720 },
    "Anterior Deltoid": { "sets": 6,  "volume_kg": 480 }
  }
}
```

---

## 10. Readiness — `/api/recovery/readiness`

### `GET /api/recovery/readiness`

Ausgehend ans Training-Modul (vor Session).

**Response:**
```json
{
  "ok": true,
  "data": {
    "readiness_score": 78,
    "readiness_level": "good",
    "recommendation": "train_normal",
    "muscle_readiness": {
      "Pectoralis Major": 92,
      "Latissimus Dorsi": 65,
      "Quadriceps":       47,
      "Hamstrings":       52,
      "Gluteus Maximus":  58,
      "Triceps Brachii":  88,
      "Biceps Brachii":   94
    },
    "hrv_status": "above_baseline",
    "overtraining_risk": "low",
    "suggested_split": "push"
  }
}
```

---

## 11. For-AI — `/api/recovery/for-ai`

```json
{
  "ok": true,
  "data": {
    "recovery_status": "78/100 (Gut) · Schlaf 7.5h Q8 · HRV +10% Baseline",
    "readiness": "good",
    "checkin_done_today": true,
    "muscle_ready": ["Chest 92%", "Shoulders 88%", "Triceps 91%"],
    "muscle_not_ready": ["Quads 47%", "Hamstrings 52%"],
    "training_recommendation": "Push Day heute ideal — Beine noch nicht erholt",
    "overtraining_risk": "low",
    "active_alerts": 0,
    "flags": [],
    "recommendations": [
      "Heute: Push Day (Chest/Shoulders/Triceps alle >85%)",
      "Beine noch 47% — morgen/übermorgen Leg Day"
    ]
  }
}
```

---

## 12. For-Goals — `/api/recovery/for-goals`

```json
{
  "ok": true,
  "data": {
    "module": "recovery",
    "date": "2026-04-15",
    "compliance_score": 78,
    "details": {
      "recovery_score": 78,
      "readiness_level": "good",
      "sleep_hours": 7.5,
      "sleep_quality": 8,
      "checkin_completed": true,
      "overtraining_risk": "low",
      "active_alerts": 0,
      "checkin_streak": 12
    }
  }
}
```

---

## 13. Pending Actions

```json
{
  "ok": true,
  "data": {
    "pending": [
      {
        "type": "morning_checkin",
        "priority": "high",
        "label": "Morning Check-in noch ausstehend",
        "action_url": "/recovery/checkin"
      }
    ]
  }
}
```

---

## 14. Protocols

### `GET /api/recovery/protocols`

System-Protokoll-Vorlagen.

### `POST /api/recovery/protocols/assign`

Protokoll einem User zuweisen.

**Body:** `{ "protocol_id": "uuid", "assigned_by": "ai_coach" }`

### `GET /api/recovery/protocols/active`

Aktives Protokoll des Users + heutige Tasks.
