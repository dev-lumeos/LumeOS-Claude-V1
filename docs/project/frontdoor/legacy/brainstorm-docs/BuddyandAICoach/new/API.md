# Buddy / AI Coach Module — API

## Base URL
`http://coach:5500`

## Auth: JWT via `Authorization: Bearer <token>`

---

## 1. Chat

### `POST /api/coach/chat`
```json
{
  "message": "Wie war mein Training diese Woche?",
  "persona": "motivator",
  "include_context": true,
  "stream": false
}
```
**Response:**
```json
{
  "response": "Alter, 4 von 5 geplanten Workouts — das ist stark! Bench Press +2.5kg ...",
  "persona_used": "motivator",
  "intent": "weekly_review",
  "memory_updated": true,
  "conversation_id": "uuid",
  "output_contract": { ... }
}
```

### `POST /api/coach/chat/stream`
Server-Sent Events (SSE).
```
data: {"type": "chunk", "content": "Alter, 4 von"}
data: {"type": "chunk", "content": " 5 geplanten"}
data: {"type": "done", "conversation_id": "uuid"}
```

---

## 2. Buddy System

### `GET /api/coach/buddy/health`
System Health Status.

### `GET /api/coach/buddy/dashboard`
Daily Command Center.
```json
{
  "daily_state": {
    "date": "2026-04-17",
    "module_scores": { "nutrition": 85.2, "training": 92.1, "recovery": 78.5, "supplements": 90.0 },
    "overall_score": 86.5,
    "trend_direction": "improving"
  },
  "decisions": [...],
  "active_interventions": 2,
  "compliance_rate": 0.87
}
```

### `GET /api/coach/buddy/trends`
**Query:** `days=7`, `modules=nutrition,training`

---

## 3. Action Executor (App Butler)

### `POST /api/coach/actions/meal/log`
### `POST /api/coach/actions/meal/preview`
### `POST /api/coach/actions/meal/confirm`
### `POST /api/coach/actions/weight/log`
### `POST /api/coach/actions/supplements/log`
### `POST /api/coach/actions/recovery/checkin`

**Generisches Action-Format:**
```json
{
  "action_type": "log_meal",
  "payload": { "foods": [...], "meal_time": "2026-04-17T12:00:00Z" }
}
```

---

## 4. Memory

### `GET /api/coach/memory`
**Query:** `type=preference|pattern|milestone`, `category`, `limit=20`

### `POST /api/coach/memory`
```json
{
  "memory_type": "preference",
  "category": "nutrition",
  "content": "User bevorzugt Proteinshakes für das Frühstück",
  "confidence": 0.9
}
```

### `DELETE /api/coach/memory/:id`

---

## 5. Knowledge Base (RAG)

### `GET /api/coach/knowledge/search`
**Query:** `q`, `category`, `limit=5`

### `POST /api/coach/knowledge` — Admin only

---

## 6. Coaching Suggestions

### `GET /api/coach/coaching/suggestions/meal`
**Query:** `meal_type`, `calories_target`, `dietary_preferences`

### `GET /api/coach/coaching/suggestions/workout`
**Query:** `available_time`, `equipment`, `muscle_focus`

### `GET /api/coach/coaching/weekly-report`
```json
{
  "week_summary": { "overall_score": 86.5, "goals_achieved": 4, "streak_days": 6 },
  "module_performance": { "nutrition": { "score": 85, "highlights": [...] } },
  "recommendations": [...]
}
```

---

## 7. Automations & Rules

### `GET /api/coach/automations`
### `POST /api/coach/automations`
```json
{
  "name": "Pre-Workout Supplement Reminder",
  "trigger": "before_workout",
  "trigger_timing": 30,
  "condition": "supplements_not_taken",
  "action": "suggest_supplement"
}
```

---

## 8. Profile & Preferences

### `GET /api/coach/profile`
```json
{
  "coach_preferences": { "communication_style": "motivator", "reminder_frequency": "moderate" },
  "personalization": { "preferred_meal_times": ["07:00","12:00","19:00"], "coaching_persona": "motivator" },
  "feature_tier": "pro",
  "autonomy_level": 3,
  "module_access": { "nutrition": true, "medical": false, ... }
}
```

### `PUT /api/coach/profile`

---

## 9. Journey / Heartbeat

### `GET /api/coach/journey`
Aktuelle Heartbeat-Konfiguration des Users.

### `PUT /api/coach/journey`
```json
{
  "checkpoints": [
    {
      "id": "morning",
      "time": "07:00",
      "enabled": true,
      "persona": "drill_sergeant",
      "modules": ["recovery", "nutrition", "supplements"],
      "push": true,
      "active_days": [1,2,3,4,5]
    },
    {
      "id": "evening",
      "time": "21:00",
      "enabled": true,
      "persona": "best_friend",
      "modules": ["nutrition", "goals"],
      "push": false
    }
  ],
  "timezone": "Asia/Bangkok"
}
```

### `POST /api/coach/journey/trigger/:checkpoint_id`
Manuell einen Checkpoint-Briefing triggern.

---

## 10. Proaktiver Wächter (Alerts)

### `GET /api/coach/alerts`
**Query:** `level=critical|warning|info`, `dismissed=false`

### `PUT /api/coach/alerts/:id/dismiss`
### `PUT /api/coach/alerts/bulk-dismiss`

---

## 11. Gym Finder

### `GET /api/coach/gym-finder`
**Query:** `lat`, `lng`, `radius_km=5`, `filters=24h,sauna,barbell`

```json
{
  "gyms": [
    {
      "name": "Iron Paradise Gym",
      "address": "...",
      "distance_km": 1.2,
      "rating": 4.7,
      "review_summary": "78% loben Freihantelbereich, 10% bemängeln Klimaanlage",
      "opening_hours": "05:00–23:00",
      "tags": ["24h", "barbell", "sauna"],
      "maps_url": "https://maps.google.com/..."
    }
  ]
}
```

---

## 12. Intervention Engine

### `GET /api/coach/intervention/context-vector`
Aktueller Context Vector des Users.

### `POST /api/coach/intervention/outcome/:id`
Outcome einer Intervention zurückmelden.
```json
{ "observed_outcome": "accepted", "session_within_24h": true }
```

---

## 13. BSS (Behavior Stability Score)

### `GET /api/coach/bss`
```json
{
  "bss_total": 71,
  "bss_trend": "improving",
  "bss_delta_vs_prior": 4,
  "stability": { "training_consistency": 78, "nutrition_stability": 68, "bounceback_time": 82, "stability_score": 71 },
  "goal_alignment": { "training": 84, "nutrition": 72, "alignment_score": 72 }
}
```

---

## 14. AI Clone (Coach B2B)

### `GET /api/coach/clone/config` — Coach only
### `PUT /api/coach/clone/config` — Coach only
### `POST /api/coach/clone/chat` — Client interagiert mit Clone

---

## 15. Cross-Module Endpoints

### `GET /api/coach/for-human-coach`
Vollständiger Buddy-Kontext für Human Coach Dashboard.

### `GET /api/coach/buddy-data/complete`
Aggregated Data für Floating Widget.
```json
{
  "nutrition": { "calories_today": 2840, "protein_today": 162, "protein_target": 185 },
  "training":  { "workout_today": false, "streak": 6 },
  "recovery":  { "score": 74, "sleep_last_night": 7.2 },
  "supplements": { "pending_today": 2 },
  "goal": { "phase": "lean_bulk", "progress_pct": 45.8 }
}
```
