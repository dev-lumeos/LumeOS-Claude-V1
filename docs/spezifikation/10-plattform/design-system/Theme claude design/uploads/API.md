# Goals Module — API

## Base URL
`http://goals:5900`

## Route-Mounting

```typescript
app.route('/api/goals/goals',          goalsRouter)
app.route('/api/goals/phases',         phasesRouter)
app.route('/api/goals/tdee',           tdeeRouter)
app.route('/api/goals/progress',       progressRouter)
app.route('/api/goals/contributions',  contributionsRouter)
app.route('/api/goals/milestones',     milestonesRouter)
app.route('/api/goals/predictions',    predictionsRouter)
app.route('/api/goals/measurements',   measurementsRouter)
app.route('/api/goals/circumferences', circumferencesRouter)
app.route('/api/goals/photos',         photosRouter)
app.route('/api/goals/adjustments',    adjustmentsRouter)
app.route('/api/goals/weekly-report',  weeklyReportRouter)
app.route('/api/goals/for-ai',         forAiRouter)
app.route('/api/goals/for-coach',      forCoachRouter)
app.route('/api/goals/targets',        targetsRouter)  // Alias für goals (backward compat)
app.route('/api/goals/targets/today',  targetsTodayRouter)
```

---

## 1. Goals CRUD

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/goals` | Alle Ziele (filter: status) |
| GET | `/api/goals/goals/active` | Nur aktive Ziele |
| POST | `/api/goals/goals` | Neues Ziel erstellen |
| GET | `/api/goals/goals/:id` | Detail + Progress + Milestones |
| PUT | `/api/goals/goals/:id` | Updaten |
| DELETE | `/api/goals/goals/:id` | Deaktivieren (soft delete) |
| GET | `/api/goals/goals/:id/progress` | Cross-Module Progress |

**Active Goals Response:**
```json
{
  "goals": [
    {
      "id": "uuid", "title": "8kg Muskelaufbau", "goal_type": "body_composition",
      "target_value": 80.0, "current_value": 75.5, "target_unit": "kg",
      "target_date": "2026-10-01", "progress_pct": 45.8,
      "achievement_probability": 78, "is_primary": true,
      "current_phase": "lean_bulk",
      "contributions": {
        "nutrition": 88, "training": 82, "recovery": 74, "supplements": 90
      }
    }
  ]
}
```

---

## 2. Phase Management

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/phases/active` | Aktuelle Phase |
| POST | `/api/goals/phases` | Neue Phase starten |
| PUT | `/api/goals/phases/active` | Parameter updaten |
| POST | `/api/goals/phases/transition` | Phase wechseln |
| GET | `/api/goals/phases/recommendation` | Empfohlener nächster Phasenwechsel |

**Active Phase Response:**
```json
{
  "phase_type": "lean_bulk",
  "variant": "moderate",
  "start_date": "2026-02-01",
  "projected_end_date": "2026-09-01",
  "parameters": {
    "calorie_target": 3200, "calorie_surplus": 350,
    "protein_g": 185, "carbs_g": 380, "fat_g": 95,
    "rate_target_kg_month": 0.5
  },
  "phase_progress": {
    "weeks_elapsed": 11,
    "weight_gained_kg": 1.8,
    "on_track": true
  }
}
```

---

## 3. Adaptive TDEE

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/tdee` | Aktuelle TDEE-Settings |
| PUT | `/api/goals/tdee` | Manual Override |
| POST | `/api/goals/tdee/recalculate` | TDEE neu berechnen (wöchentlich) |
| GET | `/api/goals/tdee/history` | TDEE-Verlauf |

**TDEE Response:**
```json
{
  "tdee_formula": 2847,
  "tdee_adaptive": 2923,
  "tdee_active": 2923,
  "calorie_target": 3150,
  "phase_modifier": "+227 (lean bulk surplus)",
  "weight_7d_avg": 76.8,
  "weight_trend": "gaining_on_track",
  "last_adjustment": { "date": "2026-04-14", "change": "+100 kcal", "reason": "Unzureichende Zunahme" }
}
```

---

## 4. Cross-Module Progress

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/progress` | Gesamt-Progress aller aktiven Ziele |
| GET | `/api/goals/progress/:goal_id` | Progress eines Ziels |
| GET | `/api/goals/progress/bottleneck` | Welches Modul limitiert am meisten? |

**Progress Response:**
```json
{
  "goal_id": "uuid",
  "overall_progress_pct": 45.8,
  "on_track": true,
  "modules": {
    "nutrition":   { "score": 88, "weight": 0.30, "contribution": 26.4, "trend": "up" },
    "training":    { "score": 82, "weight": 0.35, "contribution": 28.7, "trend": "stable" },
    "recovery":    { "score": 74, "weight": 0.20, "contribution": 14.8, "trend": "down" },
    "supplements": { "score": 90, "weight": 0.10, "contribution": 9.0,  "trend": "stable" },
    "medical":     { "score": 72, "weight": 0.05, "contribution": 3.6,  "trend": "stable" }
  },
  "bottleneck": {
    "module": "recovery",
    "reason": "Schlaf 6.2h durchschnittlich — limitiert Training-Adaptation",
    "improvement_potential": "+8% Goal Progress"
  }
}
```

---

## 5. Contributions (Eingehend von Modulen)

### `POST /api/goals/contributions` — von anderen Modulen aufgerufen

```json
{
  "module": "nutrition",
  "date": "2026-04-17",
  "compliance_score": 88,
  "details": {
    "protein_g": 182,
    "calories": 3175,
    "protein_adherence_pct": 98.4,
    "calorie_adherence_pct": 100.8
  }
}
```

### `GET /api/goals/targets/today` — von anderen Modulen abgefragt

```json
{
  "calorie_target": 3150,
  "protein_g": 185,
  "carbs_g": 380,
  "fat_g": 95,
  "goal_phase": "lean_bulk",
  "goal_type": "muscle_gain",
  "training_recommended": true,
  "recovery_recommendation": "normal"
}
```

---

## 6. Milestones

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/milestones` | Alle Milestones (filter: goal_id, achieved) |
| POST | `/api/goals/milestones/:id/celebrate` | Als gefeiert markieren |

---

## 7. Predictions

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/predictions/:goal_id` | Achievement-Probability + Timeline |
| GET | `/api/goals/predictions/:goal_id/scenarios` | "Was-wenn" Szenarien |

**Prediction Response:**
```json
{
  "achievement_probability": 78,
  "projected_achievement_date": "2026-10-15",
  "current_trajectory_weeks": 26,
  "scenarios": [
    { "change": "Schlaf auf 7.5h verbessern", "impact_weeks": -3, "probability_boost": +8 },
    { "change": "Protein auf 200g erhöhen", "impact_weeks": -1, "probability_boost": +3 }
  ]
}
```

---

## 8. Body Composition

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/measurements` | Letzte + History (days=90) |
| POST | `/api/goals/measurements` | Neue Messung |
| GET | `/api/goals/measurements/latest` | Aktuellste Werte + Deltas |
| GET | `/api/goals/circumferences` | Letzte Umfänge |
| GET | `/api/goals/circumferences/ratios` | V-Taper, Symmetrie, etc. |
| POST | `/api/goals/circumferences` | Neue Umfänge |

**Ratios Response:**
```json
{
  "shoulder_waist_ratio": 1.58,
  "shoulder_waist_target": 1.618,
  "arm_symmetry_pct": 97.2,
  "leg_symmetry_pct": 98.5,
  "v_taper_score": 74,
  "ffmi": 23.1,
  "ffmi_natural_max": 25
}
```

---

## 9. Progress Photos

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/goals/photos/session` | Neue Foto-Session starten |
| POST | `/api/goals/photos/upload` | Einzelnes Foto hochladen |
| POST | `/api/goals/photos/:id/analyze` | Claude Vision Analyse |
| GET | `/api/goals/photos` | Alle Fotos (filter: pose, date) |
| GET | `/api/goals/photos/compare` | Two-Photo Vergleich |

---

## 10. Cross-Module

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/goals/for-ai` | Buddy Kontext (Ziel, Phase, Progress) |
| GET | `/api/goals/for-coach` | Coach Kontext (detailliert) |
| GET | `/api/goals/weekly-report` | Wöchentlicher Report |

**For-AI Response:**
```json
{
  "primary_goal": "8kg Muskelaufbau bis Oktober",
  "goal_phase": "lean_bulk",
  "progress_pct": 45.8,
  "on_track": true,
  "calorie_target": 3150,
  "protein_target": 185,
  "bottleneck": "recovery (Schlaf 6.2h avg)",
  "recommendations": [
    "Schlaf auf >7h priorisieren",
    "Protein heute noch 12g unter Ziel"
  ],
  "next_milestone": { "pct": 50, "estimated_in_weeks": 3 }
}
```
