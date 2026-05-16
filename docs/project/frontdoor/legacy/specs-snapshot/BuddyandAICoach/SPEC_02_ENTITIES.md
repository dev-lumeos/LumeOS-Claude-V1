# Buddy / AI Coach Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
PROFILE & CONFIG
UserCoachProfile (1:1 pro User) ← Persona, Autonomy, Tier
UserPreferences (1:N)           ← Food/Exercise/Schedule Präferenzen
UserMilestones (1:N)            ← PRs, Streaks, Achievements
CoachProfile (1:1)              ← Feature-Tier, Module Access, Quiet Hours
CoachJourney (1:1)              ← Heartbeat Konfiguration

STATE & INTELLIGENCE
BuddyState (1:1)                ← Tagesscores, Behavioral Signature
BuddyEvents (N, append-only)    ← Alle User-Actions
BuddyDecisions (N)              ← Rule-Engine Entscheidungen
BuddyActions (N)                ← Ausgeführte Aktionen
BuddyRules (N)                  ← System + User + Coach Custom Rules
InterventionLog (N)             ← Adaptive Intervention History
BSSSnapshots (N)                ← Behavior Stability Score (Rolling 90d)

MEMORY
CoachMemory (N, RAG)            ← Preferences, Patterns, Outcomes
KnowledgeBase (N, RAG)          ← Wissenschaftliche Wissensbasis

CHAT
CoachConversations (N)          ← Gesprächs-Threads
CoachMessages (N)               ← Einzelne Nachrichten

ALERTS & AUTOMATION
CoachAlerts (N)                 ← Proaktiver Wächter (Wächter-Outputs)
```

---

## 1. UserCoachProfile

```
user_id              UUID PK (FK)
coach_name           TEXT DEFAULT 'Buddy'
coach_personality    TEXT DEFAULT 'motivator'
  scientist | motivator | drill_sergeant | best_friend | zen_master
communication_style  JSONB DEFAULT
  { humor: true, directness: 3, detail_level: 3, language: 'de' }
wake_word            TEXT       (optional, z.B. "Hey Buddy")
autonomy_level       INTEGER DEFAULT 3   CHECK (1–5)
intervention_threshold TEXT DEFAULT 'medium'
  low | medium | high | urgent_only
feature_tier         TEXT DEFAULT 'free'
  free | plus | pro | elite
```

---

## 2. UserPreferences

```
id           UUID PK
user_id      UUID NOT NULL
category     TEXT NOT NULL
  food_like | food_dislike | food_allergy | food_intolerance |
  exercise_like | exercise_dislike | supplement_pref |
  schedule | motivation | communication
key          TEXT NOT NULL
value        TEXT NOT NULL
learned_at   TIMESTAMPTZ DEFAULT now()
source       TEXT   onboarding | conversation | behavior | explicit
confidence   NUMERIC(3,2) DEFAULT 0.80
```

**Beispiele:**
```
category=food_dislike, key=fish, value=true, source=conversation
category=schedule, key=no_evening_training, value=true, source=behavior
category=communication, key=humor, value=true, source=onboarding
```

---

## 3. BuddyState (1:1 pro User)

```
user_id              UUID PK
training_score       NUMERIC(5,2)    0–100
nutrition_score      NUMERIC(5,2)
recovery_score       NUMERIC(5,2)
adherence_score      NUMERIC(5,2)
risk_score           NUMERIC(5,2)

training_state       JSONB   { sessions_7d, volume_week, streak, missed_workouts_7d, ... }
nutrition_state      JSONB   { calories_today, protein_today, protein_target, gaps, ... }
recovery_state       JSONB   { sleep_hours, sleep_score, hrv_score, fatigue_score, ... }
body_state           JSONB   { bodyweight, weight_trend_7d, rapid_change_flag, ... }
behavior_state       JSONB   { logging_consistency, plan_rejection_rate, adherence, ... }
safety_state         JSONB   { pain_flags, dizziness, medical_flags, escalation_required, ... }

behavioral_signature JSONB   {
  stress_pattern: { detected, pattern, confidence, sample_size },
  motivation_type: { detected, pattern, confidence },
  dropout_risk:    { detected, day, time, confidence },
  protein_collapse: { detected, threshold_g, confidence }
}

context_vector       JSONB   (für Intervention Engine)
snapshot_json        JSONB
algorithm_version    TEXT DEFAULT 'v1.0'
updated_at           TIMESTAMPTZ
```

---

## 4. BuddyEvents (append-only)

```
id                UUID PK
user_id           UUID NOT NULL
event_type        TEXT NOT NULL
  meal_logged | workout_started | workout_completed | set_logged |
  supplement_taken | sleep_logged | bodyweight_logged | blood_test_imported |
  recovery_checkin | note_added | wearable_sync | check_in
source_engine     TEXT
payload_json      JSONB NOT NULL
event_timestamp   TIMESTAMPTZ NOT NULL
created_at        TIMESTAMPTZ NOT NULL
processed_at      TIMESTAMPTZ
sync_status       TEXT   local_only | pending_sync | synced | failed | superseded
idempotency_key   TEXT UNIQUE
```

**Rebuild Capability:** User State muss aus Event History vollständig rekonstruierbar sein.

---

## 5. BuddyDecisions

```
id            UUID PK
user_id       UUID NOT NULL
event_id      UUID FK → BuddyEvents
rule_id       TEXT       (welche Rule hat gefeuert)
decision_type TEXT NOT NULL
  nutrition_reminder | workout_suggestion | recovery_alert |
  supplement_reminder | motivation | safety_escalation | ...
confidence    NUMERIC(3,2)
explanation   JSONB   { short, detail, engine_data }
created_at    TIMESTAMPTZ
```

---

## 6. BuddyRules

```
id                      UUID PK
user_id                 UUID   (NULL = System-Regel)
coach_id                UUID   (NULL = nicht Coach-spezifisch)
rule_name               TEXT NOT NULL
category                TEXT   nutrition | training | recovery | supplements | medical | general
trigger_event           TEXT
conditions              JSONB NOT NULL
  [{field, operator, value, timeframe_days?}]
action_definition       JSONB NOT NULL
  {type: alert|message|plan_adjustment, severity?, template?}
priority                INTEGER DEFAULT 5
cooldown_hours          INTEGER DEFAULT 24
max_activations_per_day INTEGER DEFAULT 3
is_active               BOOLEAN DEFAULT true
is_system_rule          BOOLEAN DEFAULT false
activation_count        INTEGER DEFAULT 0
last_activated          TIMESTAMPTZ
success_rate            NUMERIC(5,4)
created_by              TEXT   system | user | coach
```

---

## 7. InterventionLog

```
id                   UUID PK
user_id              UUID NOT NULL
context_vector_id    UUID
intervention_type    TEXT
  confrontation | encouragement | adjustment | redirect | silence
tone_variant         TEXT
  direct | soft | humorous | analytical | tough_love
bucket               TEXT       (z.B. "high_stress__missed_workout")
content_summary      TEXT
selection            JSONB   {
  bucket, candidates_scored, selected, backup, selection_reason
}
expected_outcome     TEXT
observed_outcome     TEXT
  accepted | rejected | ignored | engaged
effectiveness_score  NUMERIC(3,2)
cooldown_until       TIMESTAMPTZ
created_at           TIMESTAMPTZ
```

---

## 8. BSSSnapshot (Rolling 90d)

```
id            UUID PK
user_id       UUID NOT NULL
computed_at   TIMESTAMPTZ NOT NULL
period        TEXT DEFAULT 'rolling_90d'

stability     JSONB   {
  training_consistency: {score: N},
  nutrition_adherence_stability: {score: N},
  recovery_stability: {score: N},
  dropout_events: {count: N, score: N},
  bounceback_time: {avg_days: N, score: N},
  stability_score: N
}

goal_alignment JSONB   {
  training: {target_per_week: N, actual_avg: N, alignment: N},
  nutrition: {protein_target_hit_rate: N, calorie_target_hit_rate: N},
  body_composition: {goal, on_track: bool},
  alignment_score: N
}

bss_total             INTEGER NOT NULL
bss_formula           TEXT
bss_trend             TEXT   improving | stable | declining
bss_delta_vs_prior    INTEGER
```

---

## 9. CoachMemory (RAG)

```
id               UUID PK
user_id          UUID NOT NULL
memory_type      TEXT   preference | pattern | goal | concern | success | milestone | context_note
category         TEXT   nutrition | training | recovery | lifestyle | psychology
content          TEXT NOT NULL
structured_data  JSONB
confidence       NUMERIC(3,2)
importance       NUMERIC(3,2)
access_count     INTEGER DEFAULT 0
last_accessed    TIMESTAMPTZ
evidence         JSONB
auto_decay       BOOLEAN DEFAULT true
validation_required BOOLEAN DEFAULT false
created_at       TIMESTAMPTZ
```

---

## 10. CoachJourney (Heartbeat)

```
id           UUID PK
user_id      UUID NOT NULL UNIQUE
checkpoints  JSONB NOT NULL DEFAULT '[]'
  [{
    id:          "morning",
    time:        "07:00",
    enabled:     true,
    persona:     "drill_sergeant",
    modules:     ["recovery", "nutrition", "supplements"],
    push:        true,
    active_days: [1,2,3,4,5],   -- 0=Sonntag
    content_config: {
      show_recovery:     true,
      show_macros:       true,
      show_supplements:  true,
      show_goals:        true
    }
  }]
active_days  INTEGER[]   -- Globaler Override
timezone     TEXT DEFAULT 'UTC'
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

---

## 11. CoachAlerts (Wächter-Outputs)

```
id            UUID PK
user_id       UUID NOT NULL
level         TEXT NOT NULL   critical | warning | info
category      TEXT NOT NULL   nutrition | supplements | recovery | training | cross_module
message       TEXT NOT NULL
data          JSONB
dismissed     BOOLEAN DEFAULT false
dismiss_count INTEGER DEFAULT 0   (3× dismisst → level downgrade)
created_at    TIMESTAMPTZ
expires_at    TIMESTAMPTZ DEFAULT now() + 48h
```

---

## 12. CoachConversation + CoachMessage

```
CoachConversation:
  id, user_id, started_at, last_message_at
  status: active | archived | paused
  persona_id, context_window_size, coaching_style
  message_count, user_satisfaction_rating

CoachMessage:
  id, conversation_id, role (user|assistant|system)
  content, message_index (UNIQUE per conversation)
  timestamp_utc, model_used, tokens_used
  intent_detected, sentiment_score
  user_feedback: helpful | not_helpful | irrelevant
```
