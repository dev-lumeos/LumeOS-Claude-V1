# Training Module — API Specification
> Spec Phase 7 | Alle Endpoints

---

## Übersicht

**Base URL:** `http://training:5200`
**Auth:** JWT via `Authorization: Bearer <token>`
**Format:** `{ ok: boolean, data?: T, error?: string }`

## Route-Mounting Reihenfolge

```typescript
app.route('/api/training/exercises/search',      exerciseSearchRouter)
app.route('/api/training/exercises',             exercisesRouter)
app.route('/api/training/muscle-groups',         muscleGroupsRouter)
app.route('/api/training/equipment',             equipmentRouter)
app.route('/api/training/routines',              routinesRouter)
app.route('/api/training/sessions/live',         liveSessionRouter)
app.route('/api/training/sessions',              sessionsRouter)
app.route('/api/training/sets',                  setsRouter)
app.route('/api/training/records',               recordsRouter)
app.route('/api/training/progression',           progressionRouter)
app.route('/api/training/schedule',              scheduleRouter)
app.route('/api/training/analytics',             analyticsRouter)
app.route('/api/training/feedback',              feedbackRouter)
app.route('/api/training/landmarks',             landmarksRouter)
app.route('/api/training/for-ai',                forAiRouter)
app.route('/api/training/for-goals',             forGoalsRouter)
app.route('/api/training/for-recovery',          forRecoveryRouter)
app.route('/api/training/pending-actions',       pendingActionsRouter)
app.route('/api/training/health',                healthRouter)
```

---

## 1. Exercises — `/api/training/exercises`

### `GET /api/training/exercises`

Übungen suchen und filtern.

**Query-Parameter:**

| Param | Typ | Default | Beschreibung |
|---|---|---|---|
| `q` | string | `''` | Suchbegriff (Name, Alias, Muskel) |
| `category` | string | — | Bodyweight \| Free Weights \| Resistance \| Cardio \| Stretching |
| `muscle_group_id` | uuid | — | Primärmuskel-Filter |
| `body_region` | string | — | chest \| back \| shoulders \| arms \| core \| legs |
| `equipment_id` | uuid | — | Equipment-Filter |
| `tracking_type` | string | — | weight_reps \| reps_only \| duration \| distance_duration |
| `difficulty` | string | — | beginner \| intermediate \| advanced |
| `sort` | string | `relevance` | relevance \| evaluation_desc \| name_asc \| popularity |
| `limit` | integer | 30 | Max. Ergebnisse |
| `offset` | integer | 0 | Paginierung |

**Response:**
```json
{
  "ok": true,
  "data": {
    "hits": [
      {
        "id": "uuid",
        "name": "Barbell Bench Press",
        "name_de": "Bankdrücken (Langhantel)",
        "category": "Free Weights",
        "tracking_type": "weight_reps",
        "difficulty": "intermediate",
        "evaluation_score": 85,
        "sort_weight": 930,
        "equipment": { "id": "uuid", "name": "Barbell", "name_de": "Langhantel" },
        "primary_muscles": [
          { "id": "uuid", "name": "Pectoralis Major", "name_de": "Großer Brustmuskel" }
        ],
        "secondary_muscles": [
          { "name": "Triceps Brachii" }, { "name": "Anterior Deltoid" }
        ],
        "image_male_start": "https://r2.../bench_m_start.jpg",
        "image_female_start": "https://r2.../bench_f_start.jpg",
        "video_url": null
      }
    ],
    "total": 84,
    "limit": 30,
    "offset": 0
  }
}
```

---

### `GET /api/training/exercises/:id`

Einzelne Übung mit allen Details.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "Barbell Bench Press",
    "name_de": "Bankdrücken (Langhantel)",
    "name_th": "เบนช์เพรส (บาร์เบล)",
    "category": "Free Weights",
    "tracking_type": "weight_reps",
    "movement_pattern": "push",
    "discipline": "general",
    "difficulty": "intermediate",
    "evaluation_score": 85,
    "sfr_rating": 0.72,
    "stretch_position": false,
    "mechanical_tension": "high",
    "equipment": { "id": "uuid", "name": "Barbell", "name_de": "Langhantel" },
    "primary_muscles": [...],
    "secondary_muscles": [...],
    "images": {
      "male_start": "url", "male_end": "url",
      "female_start": "url", "female_end": "url"
    },
    "video_url": "url",
    "instructions": "1. Lie on a flat bench...",
    "instructions_de": "1. Lege dich auf eine flache Bank...",
    "tips": ["Keep shoulder blades pinched"],
    "tips_de": ["Schulterblätter zusammenziehen"],
    "common_mistakes": ["Too wide grip", "Bouncing off chest"],
    "aliases": ["Bench Press", "Flat Bench", "Bankdrücken"],
    "user_history": {
      "best_estimated_1rm": 117.5,
      "best_weight_kg": 100,
      "last_session": { "date": "2026-04-10", "weight_kg": 95, "reps": 7 }
    }
  }
}
```

---

### `GET /api/training/muscle-groups`

Alle Muskelgruppen als Baum.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "Pectoralis Major",
      "name_de": "Großer Brustmuskel",
      "body_region": "chest",
      "children": [
        { "id": "uuid", "name": "Upper Chest", "name_de": "Obere Brust" }
      ]
    }
  ]
}
```

---

### `GET /api/training/equipment`

Alle Equipment-Typen.

---

## 2. Routines — `/api/training/routines`

### `GET /api/training/routines`

Alle Routinen des Users.

**Query:** `active_only` (boolean, default true), `creator_type` (user|coach|marketplace|buddy)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "Push Day",
      "creator_type": "user",
      "category": "hypertrophy",
      "tags": ["push", "upper"],
      "days_per_week": 2,
      "estimated_duration_min": 47,
      "exercise_count": 6,
      "times_used": 14,
      "last_used_at": "2026-04-13T18:00:00Z",
      "primary_muscles": ["Pectoralis Major", "Anterior Deltoid", "Triceps Brachii"]
    }
  ]
}
```

---

### `POST /api/training/routines`

Routine erstellen.

**Body:**
```json
{
  "name": "Push Day",
  "category": "hypertrophy",
  "tags": ["push", "upper"],
  "exercises": [
    {
      "exercise_id": "uuid",
      "exercise_order": 1,
      "target_sets": 4,
      "target_reps": "8-10",
      "rest_seconds": 120,
      "progression_model": "double"
    },
    {
      "exercise_id": "uuid",
      "exercise_order": 2,
      "superset_group": 1,
      "target_sets": 3,
      "target_reps": "12-15",
      "rest_seconds": 0
    }
  ]
}
```

---

### `GET /api/training/routines/:id`

Routine-Detail mit allen Exercises.

---

### `PUT /api/training/routines/:id`

Routine updaten (Name, Tags, Exercises).

---

### `DELETE /api/training/routines/:id`

Routine deaktivieren (soft delete: `is_active = false`).

---

### `POST /api/training/routines/:id/duplicate`

Routine kopieren.

**Body:** `{ "name": "Push Day (Kopie)" }`

---

## 3. Live Session — `/api/training/sessions/live`

### `POST /api/training/sessions/live/start`

Workout starten.

**Body:**
```json
{
  "routine_id": "uuid",
  "name": "Push Day",
  "energy_level": 4
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "session_id": "uuid",
    "exercises": [
      {
        "workout_exercise_id": "uuid",
        "exercise_id": "uuid",
        "name_de": "Bankdrücken",
        "exercise_order": 1,
        "superset_group": null,
        "planned_sets": 4,
        "planned_reps": "8-10",
        "rest_seconds": 120,
        "previous_performance": {
          "date": "2026-04-10",
          "sets": [
            { "set_number": 1, "weight_kg": 90, "reps": 8 },
            { "set_number": 2, "weight_kg": 90, "reps": 8 }
          ]
        },
        "progression_suggestion": {
          "weight_kg": 92.5,
          "reps": "8-10",
          "model": "double",
          "reason": "Letztes Mal alle Sets bei Reps-Maximum"
        }
      }
    ]
  }
}
```

---

### `POST /api/training/sessions/live/:sessionId/sets`

Set loggen.

**Body:**
```json
{
  "workout_exercise_id": "uuid",
  "set_number": 1,
  "weight_kg": 92.5,
  "reps": 8,
  "rpe": 7.5,
  "set_type": "working",
  "rest_seconds": 120
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "set_id": "uuid",
    "estimated_1rm": 119.2,
    "volume_kg": 740,
    "is_pr": true,
    "pr_type": "estimated_1rm",
    "previous_pr": 117.5,
    "session_totals": { "total_sets": 1, "total_volume_kg": 740 }
  }
}
```

---

### `POST /api/training/sessions/live/:sessionId/complete`

Workout abschliessen.

**Body:**
```json
{
  "mood_after": "energized",
  "overall_rpe": 7,
  "notes": "Felt strong today"
}
```

**Response:** Vollständige WorkoutSession + berechnete Summary.

---

### `DELETE /api/training/sessions/live/:sessionId`

Workout abbrechen.

---

## 4. Sessions History — `/api/training/sessions`

### `GET /api/training/sessions`

**Query:** `from` (date), `to` (date), `limit`, `offset`

---

### `GET /api/training/sessions/:id`

Session-Detail mit allen Exercises und Sets.

---

## 5. Progression — `/api/training/progression`

### `GET /api/training/progression/:exerciseId/suggestion`

Nächste Satz-Empfehlung basierend auf Progression Model.

**Response:**
```json
{
  "ok": true,
  "data": {
    "exercise_id": "uuid",
    "model": "double",
    "suggestion": {
      "weight_kg": 92.5,
      "reps": "8-10",
      "sets": 4,
      "rpe_target": null
    },
    "reason": "Letztes Mal: 90kg × 10 reps (Max erreicht) → Gewicht steigern",
    "last_session": { "weight_kg": 90, "reps": 10 },
    "deload_warning": false
  }
}
```

---

### `GET /api/training/progression/:exerciseId/config`

Aktuelle Progression-Konfiguration.

---

### `PUT /api/training/progression/:exerciseId/config`

Progression-Konfiguration updaten.

**Body:**
```json
{
  "progression_model": "double",
  "rep_range_min": 8,
  "rep_range_max": 12,
  "weight_increment": 2.5,
  "deload_threshold": 3
}
```

---

## 6. Personal Records — `/api/training/records`

### `GET /api/training/records`

Alle PRs des Users.

**Query:** `exercise_id` (optional), `pr_type` (optional)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "exercise_id": "uuid",
      "exercise_name_de": "Bankdrücken",
      "pr_type": "estimated_1rm",
      "value": 117.5,
      "reps": 7,
      "weight_kg": 95,
      "achieved_at": "2026-04-15T18:45:00Z"
    }
  ]
}
```

---

### `GET /api/training/records/:exerciseId/history`

PR-Verlauf für eine Übung (für Chart).

**Response:** Array von `{ achieved_at, value, pr_type }`

---

## 7. Analytics — `/api/training/analytics`

### `GET /api/training/analytics/summary`

Training-Übersicht.

**Query:** `period` (week|month|3months|year)

**Response:**
```json
{
  "ok": true,
  "data": {
    "period": "month",
    "sessions_completed": 12,
    "total_volume_kg": 68500,
    "avg_duration_min": 52,
    "muscle_volume": {
      "Pectoralis Major": 12500,
      "Latissimus Dorsi": 15200,
      "Quadriceps": 28400
    },
    "push_pull_ratio": 1.1,
    "push_pull_status": "balanced",
    "weekly_sessions": [4, 3, 5, 4],
    "streak_weeks": 6
  }
}
```

---

### `GET /api/training/analytics/volume`

Wöchentliches Volumen (aus weekly_volume_summary View).

**Query:** `weeks` (default: 8), `muscle_group_id` (optional)

---

### `GET /api/training/analytics/strength`

Stärke-Progression pro Übung.

**Query:** `exercise_id`, `weeks` (default: 12)

**Response:** `{ dates: [], values: [] }` (für 1RM Chart)

---

### `GET /api/training/analytics/balance`

Push/Pull/Legs Balance Check.

**Response:**
```json
{
  "push_sets_week": 28,
  "pull_sets_week": 22,
  "legs_sets_week": 24,
  "push_pull_ratio": 1.27,
  "balance_status": "too_much_push",
  "recommendation": "Mehr Pull-Exercises (Rudern, Klimmzüge) empfohlen"
}
```

---

### `GET /api/training/analytics/landmarks`

Volume Landmarks mit aktuellem Status.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "muscle_group": "Pectoralis Major",
      "muscle_group_de": "Großer Brustmuskel",
      "mv": 8, "mev": 10, "mav": 16, "mrv": 22,
      "personal_mav": 18,
      "current_sets": 14,
      "status": "optimal",
      "effective_mav": 18
    },
    {
      "muscle_group": "Latissimus Dorsi",
      "current_sets": 6,
      "mev": 10,
      "status": "below_mev",
      "recommendation": "Mehr Pull-Training (Klimmzüge, Lat-Zug)"
    }
  ]
}
```

---

## 8. Feedback — `/api/training/feedback`

### `POST /api/training/feedback`

Post-Workout Feedback speichern.

**Body:**
```json
{
  "session_id": "uuid",
  "pump": {
    "Pectoralis Major": 3,
    "Triceps Brachii": 2,
    "Anterior Deltoid": 1
  },
  "soreness": {
    "Pectoralis Major": 2,
    "Triceps Brachii": 1
  },
  "performance_rating": 1
}
```

---

## 9. Schedule — `/api/training/schedule`

### `GET /api/training/schedule`

Aktueller Wochenplan des Users.

**Response:**
```json
{
  "ok": true,
  "data": {
    "schedule": [
      { "day_of_week": 0, "day_name": "Montag", "routine": { "id": "uuid", "name": "Push Day" } },
      { "day_of_week": 1, "day_name": "Dienstag", "routine": null },
      { "day_of_week": 2, "day_name": "Mittwoch", "routine": { "id": "uuid", "name": "Pull Day" } }
    ],
    "next_workout": {
      "date": "2026-04-16",
      "day_name": "Mittwoch",
      "routine": { "id": "uuid", "name": "Pull Day" }
    },
    "streak_weeks": 6
  }
}
```

---

### `PUT /api/training/schedule`

Wochenplan aktualisieren.

**Body:**
```json
{
  "schedule": [
    { "day_of_week": 0, "routine_id": "uuid" },
    { "day_of_week": 2, "routine_id": "uuid" },
    { "day_of_week": 4, "routine_id": "uuid" }
  ]
}
```

---

## 10. For-AI — `/api/training/for-ai`

### `GET /api/training/for-ai`

Kompakter Buddy-Kontext.

**Response:**
```json
{
  "ok": true,
  "data": {
    "training_status": "4/5 Sessions diese Woche · 18.500 kg Volume",
    "last_workout": "vor 1 Tag (Push Day, 52 min)",
    "next_scheduled": "Heute: Pull Day um 18:00",
    "strength_trends": {
      "bench_press": "+2.5kg vs. letzte Woche",
      "squat": "+5kg vs. vor 2 Wochen"
    },
    "volume_vs_landmarks": {
      "chest": { "current": 14, "mav": 16, "status": "optimal" },
      "back": { "current": 6, "mev": 10, "status": "below_mev" }
    },
    "flags": ["back_below_mev"],
    "recommendations": [
      "Rücken diese Woche unter MEV (6/10 Sätze) — mehr Pull-Training empfohlen",
      "Deload in ~2 Wochen (aktuell Woche 5 von 6)"
    ],
    "pending_actions": [
      { "type": "log_workout", "label": "Pull Day heute geplant" }
    ]
  }
}
```

---

## 11. For-Goals — `/api/training/for-goals`

### `GET /api/training/for-goals`

**Query:** `date` (default: heute)

**Response:**
```json
{
  "ok": true,
  "data": {
    "module": "training",
    "compliance_score": 85,
    "details": {
      "sessions_completed": 4,
      "sessions_planned": 5,
      "session_adherence_pct": 80,
      "total_volume_kg": 18500,
      "strength_progress_pct": 2.1,
      "muscle_balance_score": 78,
      "prs_this_week": 2,
      "deload_needed": false
    }
  }
}
```

---

## 12. For-Recovery — `/api/training/for-recovery`

### `POST /api/training/for-recovery`

Training Load nach Session an Recovery senden.

**Body:**
```json
{
  "session_id": "uuid",
  "date": "2026-04-15",
  "volume_kg": 4200,
  "intensity_avg_rpe": 7.8,
  "session_duration_min": 52,
  "muscles_worked": [
    { "muscle": "Pectoralis Major", "sets": 12, "volume_kg": 1800 },
    { "muscle": "Triceps Brachii", "sets": 9, "volume_kg": 720 }
  ]
}
```

---

## 13. Pending Actions — `/api/training/pending-actions`

### `GET /api/training/pending-actions`

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "pending": [
      {
        "id": "schedule-pull",
        "type": "log_workout",
        "priority": "normal",
        "label": "Pull Day heute geplant",
        "routine_id": "uuid",
        "routine_name": "Pull Day",
        "scheduled_time": "18:00",
        "action_url": "/training?start=uuid"
      },
      {
        "id": "feedback-yesterday",
        "type": "post_feedback",
        "priority": "normal",
        "label": "Feedback für gestrigen Push Day ausstehend",
        "session_id": "uuid",
        "action_url": "/training/sessions/uuid/feedback"
      }
    ],
    "count": 2
  }
}
```

---

## Error Format

```json
{ "ok": false, "error": "Human readable message", "code": "ERROR_CODE" }
```

Status Codes: 400 · 401 · 403 · 404 · 409 · 500
