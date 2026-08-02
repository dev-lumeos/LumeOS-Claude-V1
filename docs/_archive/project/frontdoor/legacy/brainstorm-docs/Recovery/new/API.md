# Recovery Module — API

## Base URL
`http://recovery:5400`

## Route-Mounting

```typescript
app.route('/api/recovery/checkin',         checkinRouter)
app.route('/api/recovery/score',           scoreRouter)
app.route('/api/recovery/muscle-map',      muscleMapRouter)
app.route('/api/recovery/hrv',             hrvRouter)
app.route('/api/recovery/sleep',           sleepRouter)
app.route('/api/recovery/modalities',      modalitiesRouter)
app.route('/api/recovery/insights',        insightsRouter)
app.route('/api/recovery/alerts',          alertsRouter)
app.route('/api/recovery/protocols',       protocolsRouter)
app.route('/api/recovery/training-load',   trainingLoadRouter)
app.route('/api/recovery/readiness',       readinessRouter)
app.route('/api/recovery/for-ai',          forAiRouter)
app.route('/api/recovery/for-goals',       forGoalsRouter)
app.route('/api/recovery/pending-actions', pendingActionsRouter)
```

---

## Check-in

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/checkin` | Checkin für ?date= (default: heute) |
| POST | `/api/recovery/checkin` | UPSERT — erstellt oder überschreibt |

**POST Body:**
```json
{
  "date": "2026-04-17",
  "sleep_hours": 7.5, "sleep_quality": 8,
  "subjective_feeling": 7, "mood": "good",
  "soreness": {"quadriceps": 2, "chest": 1},
  "stress_level": 4
}
```

**POST Response:** `{ checkin_id, recovery_score, readiness_level, intensity_recommendation }`

---

## Recovery Score

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/score` | Score für ?date= inkl. Komponenten |
| GET | `/api/recovery/score/trend` | Trend (days=7, max=90) |

---

## Muscle Map

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/muscle-map` | Recovery % pro Muskelgruppe + Training-Empfehlung |

**Response:**
```json
{
  "muscles": [
    {"muscle_group": "Pectoralis Major", "slug": "chest", "recovery_pct": 92, "status": "ready"},
    {"muscle_group": "Quadriceps", "slug": "quadriceps", "recovery_pct": 47, "status": "not_ready", "estimated_ready_in_hours": 20}
  ],
  "training_recommendation": {"today": "Push Day ideal", "ready_muscles": ["chest", "front_deltoids"], "avoid_muscles": ["quadriceps"]}
}
```

---

## HRV

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/hrv` | Letzte Messung + Baseline + Trend |
| POST | `/api/recovery/hrv` | Messung loggen |

---

## Sleep

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/sleep` | Schlafdaten für ?date= |
| POST | `/api/recovery/sleep` | Manuell oder Wearable-Import |

---

## Modalities

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/modalities` | Heute geloggte Aktivitäten |
| POST | `/api/recovery/modalities` | Aktivität loggen |
| PUT | `/api/recovery/modalities/:id` | Next-Day Rating hinzufügen |

---

## Insights

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/insights/7d` | 7-Tage Zusammenfassung |
| GET | `/api/recovery/insights/30d` | 30-Tage Zusammenfassung |
| GET | `/api/recovery/insights/patterns` | Erkannte Muster (Sauna → +X Punkte) |

---

## Alerts & Protocols

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/recovery/alerts` | Active/acknowledged/resolved |
| PUT | `/api/recovery/alerts/:id/acknowledge` | Bestätigen |
| PUT | `/api/recovery/alerts/:id/resolve` | Lösen |
| GET | `/api/recovery/protocols` | System-Vorlagen |
| POST | `/api/recovery/protocols/assign` | Protokoll zuweisen |
| GET | `/api/recovery/protocols/active` | Aktives Protokoll + heutige Tasks |

---

## Cross-Module

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/recovery/training-load` | Training-Daten empfangen (vom Training-Modul) |
| GET | `/api/recovery/readiness` | Readiness + Muscle Map ausgeben (ans Training-Modul) |
| GET | `/api/recovery/for-ai` | Buddy Context |
| GET | `/api/recovery/for-goals` | Compliance Score Export |
| GET | `/api/recovery/pending-actions` | Offene User-Actions |

**Readiness Response:**
```json
{
  "readiness_score": 78, "readiness_level": "good",
  "muscle_readiness": {"Pectoralis Major": 92, "Quadriceps": 47},
  "hrv_status": "above_baseline",
  "suggested_split": "push"
}
```
