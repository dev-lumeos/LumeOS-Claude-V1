# Buddy / AI Coach Module — API Specification (Spec)
> Spec Phase 7 | Alle Endpoints mit Request/Response

---

## Übersicht

**Base URL:** `http://coach:5500`
**Auth:** JWT via `Authorization: Bearer <token>`
**Format:** `{ ok: boolean, data?: T, error?: string }`

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
  "ok": true,
  "data": {
    "intent": "weekly_review",
    "speech_text": "Alter, 4 von 5 geplanten Workouts — das ist stark! Bench Press +2.5kg Neuer PR!",
    "ui_cards": [
      {
        "type": "stat",
        "title": "Trainingswoche",
        "data": { "workouts_done": 4, "workouts_planned": 5, "prs": 1 },
        "priority": "high"
      }
    ],
    "actions": [],
    "safety_flags": [],
    "evidence": [],
    "expects_input": false,
    "conversation_id": "uuid",
    "model_used": "glm-4.7-flash",
    "tokens_used": 847
  }
}
```

### `POST /api/coach/chat/stream`
Server-Sent Events (SSE). Nur für **plus+** Tier.
```
data: {"type": "chunk", "content": "Alter, 4 von"}
data: {"type": "chunk", "content": " 5 geplanten Workouts"}
data: {"type": "ui_card", "card": {"type": "stat", ...}}
data: {"type": "done", "conversation_id": "uuid", "tokens_used": 847}
```

**Feature Gate:** `requireFeature('chat_unlimited')` für Streaming ohne Limit.

---

## 2. Buddy Dashboard

### `GET /api/coach/buddy/health`
```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "database": "connected",
    "llm_provider": "ready",
    "event_pipeline": "active",
    "cron_scheduler": "running",
    "rule_engine": "operational"
  }
}
```

### `GET /api/coach/buddy/dashboard`
```json
{
  "ok": true,
  "data": {
    "daily_state": {
      "date": "2026-04-17",
      "module_scores": {
        "nutrition": 85.2,
        "training": 92.1,
        "recovery": 78.5,
        "supplements": 90.0
      },
      "overall_score": 86.5,
      "trend_direction": "improving"
    },
    "active_alerts": 1,
    "upcoming_checkpoints": [
      { "id": "evening", "time": "21:00", "persona": "best_friend" }
    ],
    "bss": { "bss_total": 71, "bss_trend": "improving" },
    "compliance_rate": 0.87
  }
}
```

### `GET /api/coach/buddy/trends`
**Query:** `days=7` (max 30), `modules=nutrition,training,recovery`
```json
{
  "ok": true,
  "data": {
    "period": { "start_date": "2026-04-10", "end_date": "2026-04-17", "days": 7 },
    "trends": {
      "nutrition": { "average_score": 83.4, "trend": "improving", "key_insights": [...] },
      "training":  { "average_score": 89.2, "trend": "stable",    "key_insights": [...] }
    },
    "cross_module_insights": [
      "Schlechter Schlaf korreliert mit fehlendem Frühstück",
      "Trainingstage zeigen bessere Nutrition-Adherence"
    ]
  }
}
```

---

## 3. Action Executor (App Butler)

Erfordert `requireFeature('action_execution')` (Pro+).

### `POST /api/coach/actions/meal/preview`
```json
{ "foods": [{ "name": "Hähnchenbrust", "amount_g": 200 }, { "name": "Jasminreis", "amount_g": 150 }] }
```
**Response:**
```json
{
  "ok": true,
  "data": {
    "preview": {
      "total_calories": 490, "protein_g": 52, "carbs_g": 57, "fat_g": 6,
      "foods_summary": "200g Hähnchenbrust + 150g Jasminreis"
    },
    "confirmation_token": "preview_abc123"
  }
}
```

### `POST /api/coach/actions/meal/confirm`
```json
{ "confirmation_token": "preview_abc123" }
```

### `POST /api/coach/actions/meal/log`
```json
{
  "meal_type": "lunch",
  "foods": [{ "food_id": "f001", "quantity_g": 200 }],
  "meal_time": "2026-04-17T12:00:00Z"
}
```

### `POST /api/coach/actions/water/log`
```json
{ "amount_ml": 500 }
```

### `POST /api/coach/actions/weight/log`
```json
{ "weight_kg": 85.2, "measurement_time": "2026-04-17T06:00:00Z" }
```

### `POST /api/coach/actions/supplements/log`
```json
{ "supplement_id": "uuid", "time_taken": "2026-04-17T08:00:00Z" }
```

### `POST /api/coach/actions/recovery/checkin`
```json
{
  "sleep_hours": 7.5, "sleep_quality": 8,
  "mood": "good", "energy_level": 7,
  "soreness": { "legs": 2, "shoulders": 1 }
}
```

### `POST /api/coach/actions/workout/log-set`
```json
{
  "exercise_id": "uuid", "set_number": 2,
  "weight_kg": 26, "reps": 10, "rpe": 8
}
```

### `POST /api/coach/actions/intent`
Generischer Intent-Parser für App Butler.
```json
{ "message": "Hab 200g Hähnchen mit Reis gegessen und 500ml Wasser getrunken" }
```
**Response:**
```json
{
  "ok": true,
  "data": {
    "intents": [
      { "type": "log_meal", "confidence": 0.94, "entities": { "foods": [...] } },
      { "type": "log_water", "confidence": 0.97, "entities": { "amount_ml": 500 } }
    ],
    "require_confirmation": true
  }
}
```

---

## 4. Memory

### `GET /api/coach/memory`
**Query:** `type=preference|pattern|milestone|coaching_outcome`, `category`, `limit=20`
```json
{
  "ok": true,
  "data": {
    "memories": [
      {
        "id": "uuid",
        "memory_type": "preference",
        "category": "nutrition",
        "content": "Bevorzugt Proteinshakes für das Frühstück",
        "confidence": 0.95,
        "last_accessed": "2026-04-17T06:30:00Z"
      }
    ],
    "total": 42
  }
}
```

### `POST /api/coach/memory`
```json
{
  "memory_type": "preference",
  "category": "training",
  "content": "Bevorzugt Morgentraining um 6 Uhr",
  "confidence": 0.9
}
```

### `DELETE /api/coach/memory/:id`
User kann eigene Memories löschen (Transparenz/Privacy).

---

## 5. Knowledge Base (RAG)

### `GET /api/coach/knowledge/search`
**Query:** `q`, `category=nutrition|training|recovery|supplements|medical`, `limit=5`
```json
{
  "ok": true,
  "data": {
    "results": [
      {
        "id": "kb_001",
        "title": "Progressive Overload Principles",
        "summary": "...",
        "category": "training",
        "evidence_level": "A",
        "relevance_score": 0.92
      }
    ]
  }
}
```

### `POST /api/coach/knowledge` — Admin only
```json
{
  "title": "Protein Synthesis Timing",
  "content": "...",
  "category": "nutrition",
  "evidence_level": "A",
  "tags": ["protein", "muscle_growth", "timing"]
}
```

---

## 6. Coaching Suggestions

### `GET /api/coach/coaching/suggestions/meal`
**Query:** `meal_type=breakfast|lunch|dinner|snack`, `calories_target`, `protein_target`
```json
{
  "ok": true,
  "data": {
    "suggestions": [
      {
        "name": "High-Protein Frühstücksbowl",
        "calories": 420, "protein_g": 35,
        "prep_time_min": 10,
        "ingredients": ["Griechischer Joghurt", "Beeren", "Whey Protein", "Mandeln"],
        "why": "Trifft dein Protein-Ziel und passt zu deinem zeitknappen Morgen"
      }
    ]
  }
}
```

### `GET /api/coach/coaching/suggestions/workout`
**Query:** `available_time_min`, `equipment`, `muscle_focus`

### `GET /api/coach/coaching/weekly-report`
Erfordert `requireFeature('weekly_deep_report')` für tiefe Analyse (Elite).
```json
{
  "ok": true,
  "data": {
    "week_summary": {
      "period": "2026-04-10 to 2026-04-17",
      "overall_score": 86.5,
      "goals_achieved": 4,
      "goals_missed": 1,
      "streak_days": 6,
      "prs_set": 2
    },
    "module_performance": {
      "nutrition": { "score": 85, "highlights": ["Konsistentes Protein"], "improvements": ["Wochenend-Meal-Prep"] },
      "training":  { "score": 92, "highlights": ["2 PRs", "4/5 Workouts"] }
    },
    "bss_update": { "bss_total": 71, "delta": 4 },
    "recommendations": ["Mahlzeiten am Wochenende vorplanen", "Schlaf diese Woche priorisieren"]
  }
}
```

---

## 7. Automations & Rules

### `GET /api/coach/automations`
```json
{
  "ok": true,
  "data": {
    "system_rules": [...],
    "user_rules": [...],
    "coach_rules": [...]
  }
}
```

### `POST /api/coach/automations`
```json
{
  "rule_name": "Pre-Workout Supplement Reminder",
  "category": "supplements",
  "trigger_event": "before_workout",
  "conditions": [{ "field": "supplements.pending_pre_workout", "operator": ">", "value": 0 }],
  "action_definition": { "type": "alert", "severity": "info", "template": "supplement_reminder" },
  "cooldown_hours": 12
}
```

### `PUT /api/coach/automations/:id/toggle`
```json
{ "is_active": false }
```

---

## 8. Profile & Preferences

### `GET /api/coach/profile`
```json
{
  "ok": true,
  "data": {
    "coach_name": "Buddy",
    "coach_personality": "motivator",
    "autonomy_level": 3,
    "intervention_threshold": "medium",
    "feature_tier": "pro",
    "module_access": { "nutrition": true, "training": true, "medical": false },
    "communication_style": { "humor": true, "directness": 3, "language": "de" },
    "coaching_objectives": ["Muskelaufbau", "Konsistenz"],
    "quiet_hours": { "start": "23:00", "end": "07:00" }
  }
}
```

### `PUT /api/coach/profile`
Partielles Update aller Felder.

---

## 9. Journey / Heartbeat

### `GET /api/coach/journey`
Aktuelle Heartbeat-Konfiguration.
```json
{
  "ok": true,
  "data": {
    "checkpoints": [
      {
        "id": "morning", "time": "07:00", "enabled": true,
        "persona": "drill_sergeant",
        "modules": ["recovery", "nutrition", "supplements"],
        "push": true, "active_days": [1,2,3,4,5]
      },
      {
        "id": "evening", "time": "21:00", "enabled": true,
        "persona": "best_friend",
        "modules": ["nutrition", "goals"],
        "push": false, "active_days": [1,2,3,4,5,6,0]
      }
    ],
    "timezone": "Asia/Bangkok"
  }
}
```

### `PUT /api/coach/journey`
Vollständige Konfiguration speichern. Erfordert `requireFeature('journey_heartbeat')`.

### `POST /api/coach/journey/trigger/:checkpoint_id`
Checkpoint manuell triggern (Test-Funktion).

---

## 10. Proaktiver Wächter (Alerts)

### `GET /api/coach/alerts`
**Query:** `level=critical|warning|info`, `dismissed=false`, `limit=20`
```json
{
  "ok": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "level": "warning",
        "category": "recovery",
        "message": "Recovery Score seit 4 Tagen unter 50 — Ø Schlaf 5.9h",
        "dismissed": false,
        "created_at": "2026-04-17T02:00:00Z"
      }
    ],
    "total_active": 1
  }
}
```

### `PUT /api/coach/alerts/:id/dismiss`
Smart Mute: 3× dismisst → level wird automatisch heruntergestuft.

### `PUT /api/coach/alerts/bulk-dismiss`
```json
{ "ids": ["uuid1", "uuid2"] }
```

---

## 11. Gym Finder

### `GET /api/coach/gym-finder`
Erfordert `requireFeature('gym_finder')` (Pro+).

**Query:** `lat`, `lng`, `radius_km=5`, `filters=24h,sauna,barbell`, `limit=10`
```json
{
  "ok": true,
  "data": {
    "gyms": [
      {
        "name": "Iron Paradise Gym",
        "address": "123 Fitness St, Bangkok",
        "distance_km": 1.2,
        "rating": 4.7,
        "review_count": 847,
        "ai_review_summary": "78% loben Freihantelbereich und Sauberkeit. 10% bemängeln Parkplatz.",
        "opening_hours": "05:00–23:00",
        "tags": ["24h", "barbell", "sauna", "personal_trainer"],
        "maps_url": "https://maps.google.com/?q=..."
      }
    ],
    "total": 8
  }
}
```

---

## 12. Intervention Engine

### `GET /api/coach/intervention/context-vector`
Aktueller Context Vector (für Debug/Transparenz).

### `GET /api/coach/intervention/history`
**Query:** `limit=20`, `type=confrontation|encouragement`

### `POST /api/coach/intervention/outcome/:id`
Outcome einer Intervention zurückmelden (nach 24h).
```json
{
  "observed_outcome": "accepted",
  "session_within_24h": true,
  "behavior_shift": true
}
```

---

## 13. BSS (Behavior Stability Score)

### `GET /api/coach/bss`
```json
{
  "ok": true,
  "data": {
    "bss_total": 71,
    "bss_trend": "improving",
    "bss_delta_vs_prior": 4,
    "period": "rolling_90d",
    "stability": {
      "training_consistency": 78,
      "nutrition_adherence_stability": 68,
      "recovery_stability": 55,
      "dropout_resilience": 70,
      "bounceback_time": 82,
      "stability_score": 71
    },
    "goal_alignment": {
      "training": 84, "nutrition": 72, "body_composition": 80,
      "alignment_score": 72
    }
  }
}
```

### `GET /api/coach/bss/history`
**Query:** `limit=12` (Snapshots)

---

## 14. AI Clone (Coach B2B)

### `GET /api/coach/clone/config` — Coach only
### `PUT /api/coach/clone/config` — Coach only
```json
{
  "methodology": "Progressive Overload Focused, High Protein First",
  "style_prompt": "Direkter, datengetriebener Coaching-Stil. Keine Ausreden akzeptieren.",
  "boundaries": {
    "can_answer": ["nutrition", "training", "recovery", "supplements"],
    "escalate_to_coach": ["medical", "injury", "contest_prep"]
  },
  "escalation_rules": [
    { "trigger": "pain_mentioned", "action": "escalate_immediately" },
    { "trigger": "medical_question", "action": "refer_to_doctor" }
  ]
}
```

### `POST /api/coach/clone/chat` — Client interagiert mit Clone
Gleiche Response-Struktur wie `/api/coach/chat`, aber LLM ist mit Coach-Methodik trainiert.

---

## 15. Human Coach Integration

### `GET /api/coach/for-human-coach`
Alle Buddy-Daten für Human Coach Dashboard.
```json
{
  "ok": true,
  "data": {
    "buddy_state": { ... },
    "active_interventions": [...],
    "recent_alerts": [...],
    "bss_summary": { ... },
    "compliance_7d": 0.85,
    "flagged_for_coach": true,
    "flag_reason": "Recovery decline 4 days"
  }
}
```

### `GET /api/coach/buddy-data/complete`
Für Floating Widget — aggregierte Tages-Daten.
```json
{
  "ok": true,
  "data": {
    "nutrition": { "calories_today": 2840, "protein_today": 162, "protein_target": 185, "score": 85.2 },
    "training":  { "workout_today": false, "streak": 6, "score": 92.1 },
    "recovery":  { "score": 74, "sleep_last_night": 7.2, "heavy_day_today": false },
    "supplements": { "pending_today": 2, "compliance_today": 0.75, "score": 90.0 },
    "goal":      { "phase": "lean_bulk", "progress_pct": 45.8 }
  }
}
```

---

## Rate Limits

| Endpoint-Gruppe | Free | Plus | Pro | Elite |
|---|---|---|---|---|
| `POST /chat` | 5/Tag | 60/Min | 60/Min | 120/Min |
| `GET /buddy/*` | 10/Min | 30/Min | 60/Min | 120/Min |
| `POST /actions/*` | — | — | 120/Min | 120/Min |
| `GET /knowledge/search` | 5/Min | 30/Min | 30/Min | 60/Min |
| `GET /coaching/*` | 2/Tag | 10/Min | 30/Min | 60/Min |

---

## Error Codes

| Code | Beschreibung |
|---|---|
| `feature_locked` | Feature erfordert höheren Tier |
| `coach_unavailable` | AI-Service temporär nicht verfügbar |
| `memory_limit_exceeded` | User Memory-Limit erreicht |
| `policy_gate_blocked` | Antwort von Safety Gate blockiert |
| `invalid_persona` | Angegebene Persona nicht verfügbar |
| `action_confirmation_required` | Aktion braucht Bestätigung |
| `rate_limit_exceeded` | Zu viele Requests |
