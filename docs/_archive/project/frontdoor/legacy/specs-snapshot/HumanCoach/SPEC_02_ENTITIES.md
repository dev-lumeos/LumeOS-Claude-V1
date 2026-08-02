# Human Coach Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
COACH
──────────────────────────────────────────────────────
CoachProfile (1 pro Coach-User)
  └── CoachClient (N Clients pro Coach)
       └── CoachClientPermission (7 Module)
       └── ClientAutonomyLevel (aktuell)
            └── ClientAutonomyHistory (Änderungen)
       └── ClientAdherenceSummary (täglich)
       └── CoachMessage (Chat)

ALERTS
CoachAlert (N pro Coach×Client)
CoachAlertSettings (1 pro Coach)

RULES
CoachRule (N pro Coach)
CoachRuleTemplate (System-Templates)

ANALYTICS
CoachPerformanceMetrics (periodisch)
```

---

## 1. CoachProfile

```
id                   UUID PK
user_id              UUID NOT NULL UNIQUE

display_name         TEXT NOT NULL
title                TEXT
bio                  TEXT
avatar_url           TEXT

certifications       TEXT[]    ['NASM-CPT', 'ISSN', 'PN1']
specializations      TEXT[]    ['weight_loss', 'strength', 'nutrition']
years_experience     INTEGER

email                TEXT NOT NULL
phone                TEXT
timezone             TEXT DEFAULT 'UTC'

role                 TEXT NOT NULL DEFAULT 'coach'
  trainee_coach | coach | senior_coach | head_coach
max_clients          INTEGER DEFAULT 50
current_client_count INTEGER DEFAULT 0   (via Trigger/Cron)

working_hours        JSONB    {"monday": {"start": "09:00", "end": "17:00"}}
notification_preferences JSONB

is_active            BOOLEAN DEFAULT true
is_accepting_clients BOOLEAN DEFAULT true
last_active_at       TIMESTAMPTZ
```

---

## 2. CoachClient

```
id              UUID PK
coach_id        UUID FK → CoachProfile CASCADE
client_id       UUID NOT NULL

is_active       BOOLEAN DEFAULT true
status          TEXT     active | paused | ended

assignment_type TEXT     primary | secondary | temporary
coaching_style  TEXT     hands_on | collaborative | consultative
communication_frequency TEXT   daily | weekly | bi_weekly | monthly

start_date      DATE NOT NULL DEFAULT today
end_date        DATE
billing_cycle   TEXT     monthly | quarterly | yearly
hourly_rate     NUMERIC(10,2)

autonomy_level  INTEGER DEFAULT 2   CHECK (1–5)
intervention_threshold TEXT DEFAULT 'medium'   low | medium | high

alert_preferences JSONB DEFAULT '{}'
coach_notes       TEXT      (privat, Client sieht nicht)
tags              TEXT[]    ['high_maintenance', 'motivated', 'athlete']

satisfaction_rating   NUMERIC(3,2)   1–5, Client-Rating des Coaches
goal_completion_rate  NUMERIC(3,2)   % erreichte Goals

last_contact_at TIMESTAMPTZ

UNIQUE (coach_id, client_id, assignment_type)
```

---

## 3. CoachClientPermission

```
id              UUID PK
coach_client_id UUID FK → CoachClient CASCADE
module          TEXT NOT NULL
  nutrition | training | recovery | supplements |
  medical | goals | body_metrics
access_level    TEXT NOT NULL DEFAULT 'none'
  full | summary | none
granted_at      TIMESTAMPTZ DEFAULT now()
granted_by      UUID NOT NULL    -- MUSS client_id sein (Client-Kontrolle)
expires_at      TIMESTAMPTZ      -- Optional: zeitbegrenzter Zugriff

UNIQUE (coach_client_id, module)
```

---

## 4. CoachAlert

```
id              UUID PK
coach_id        UUID FK → CoachProfile CASCADE
client_id       UUID NOT NULL

type            TEXT NOT NULL
  adherence_drop | missed_goals | recovery_issues |
  nutrition_concerns | supplement_interactions |
  medical_concern | streak_achievement | goal_reached | overtraining
category        TEXT   nutrition | training | recovery | supplements | medical | general
priority        INTEGER   1–5 (1=Critical, 5=Info)
severity        TEXT      critical | high | medium | low | info

title           TEXT NOT NULL
message         TEXT NOT NULL
context_data    JSONB DEFAULT '{}'
recommended_actions TEXT[] DEFAULT '{}'

rule_id         UUID FK → CoachRule   (wenn durch Regel generiert)
rule_name       TEXT   (Snapshot)

status          TEXT DEFAULT 'open'
  open | read | acknowledged | resolved | dismissed
read_at         TIMESTAMPTZ
acknowledged_at TIMESTAMPTZ
acknowledged_by UUID
coach_note      TEXT
dismissed_at    TIMESTAMPTZ
dismissal_reason TEXT

expires_at      TIMESTAMPTZ DEFAULT now() + 7 days
action_taken    BOOLEAN DEFAULT false
false_positive  BOOLEAN
confidence      NUMERIC(3,2)

created_at      TIMESTAMPTZ DEFAULT now()
```

---

## 5. CoachRule

```
id              UUID PK
coach_id        UUID FK → CoachProfile CASCADE

name            TEXT NOT NULL
description     TEXT
category        TEXT

logic_operator  TEXT DEFAULT 'AND'   AND | OR
conditions      JSONB NOT NULL
-- [{module, metric, operator, value, timeframe_days}]
actions         JSONB NOT NULL
-- {type: 'alert'|'message'|'plan_adjustment', severity?, template?}

is_enabled      BOOLEAN DEFAULT true
applies_to_all_clients BOOLEAN DEFAULT true
client_filter   JSONB     (optional: nur für bestimmte Clients)

cooldown_minutes    INTEGER DEFAULT 60
max_triggers_per_day INTEGER DEFAULT 5

trigger_count       INTEGER DEFAULT 0
last_triggered_at   TIMESTAMPTZ
false_positive_count INTEGER DEFAULT 0
effectiveness_score NUMERIC(3,2)   0–1
```

---

## 6. ClientAutonomyLevel

```
id              UUID PK
client_id       UUID NOT NULL
coach_id        UUID FK → CoachProfile CASCADE

current_level   INTEGER NOT NULL   CHECK (1–5)
level_name      TEXT NOT NULL   Novice | Developing | Intermediate | Advanced | Expert

-- Assessment Scores (0–1)
consistency_score      NUMERIC(3,2)
knowledge_score        NUMERIC(3,2)
self_correction_score  NUMERIC(3,2)
communication_score    NUMERIC(3,2)
overall_score          NUMERIC(3,2)

check_in_frequency     TEXT   daily | weekly | bi_weekly | monthly
intervention_threshold TEXT   any_deviation | significant_trends | safety_only
plan_flexibility       TEXT   strict | guided | flexible | autonomous

assigned_at     TIMESTAMPTZ DEFAULT now()
assigned_by     UUID
assignment_reason TEXT
next_assessment_date DATE

regression_risk NUMERIC(3,2)

UNIQUE (client_id, coach_id)
```

---

## 7. ClientAutonomyHistory

```
id              UUID PK
client_id       UUID NOT NULL
coach_id        UUID FK → CoachProfile CASCADE

previous_level  INTEGER
new_level       INTEGER NOT NULL   CHECK (1–5)
change_type     TEXT     promotion | demotion | lateral | initial

assessment_scores JSONB   (Snapshot zum Zeitpunkt der Änderung)
change_reasoning  TEXT
changed_by        UUID
change_trigger    TEXT   scheduled_review | performance_based | manual

changed_at      TIMESTAMPTZ DEFAULT now()
```

---

## 8. ClientAdherenceSummary

```
id              UUID PK
client_id       UUID NOT NULL
coach_id        UUID FK → CoachProfile CASCADE
date            DATE NOT NULL

overall_adherence    NUMERIC(4,3)   CHECK (0–1)
weighted_adherence   NUMERIC(4,3)

nutrition_adherence  NUMERIC(4,3)
training_adherence   NUMERIC(4,3)
recovery_adherence   NUMERIC(4,3)
supplement_adherence NUMERIC(4,3)

trend_direction      TEXT   improving | declining | stable
trend_strength       NUMERIC(4,3)
volatility           NUMERIC(4,3)

data_completeness    NUMERIC(4,3)
insights             JSONB DEFAULT '[]'

calculated_at        TIMESTAMPTZ DEFAULT now()

UNIQUE (client_id, date)
```

---

## 9. CoachMessage

```
id              UUID PK
coach_client_id UUID FK → CoachClient CASCADE
sender_id       UUID NOT NULL   (coach_id oder client_id)
content         TEXT NOT NULL
message_type    TEXT DEFAULT 'text'
  text | note | task | plan_update | check_in
attachment_url  TEXT
read_at         TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT now()
```

---

## 10. CoachPerformanceMetrics

```
id              UUID PK
coach_id        UUID FK → CoachProfile CASCADE
period_start    DATE NOT NULL
period_end      DATE NOT NULL
period_type     TEXT   weekly | monthly | quarterly

total_clients           INTEGER
active_clients          INTEGER
client_retention_rate   NUMERIC(4,3)

avg_response_time_hours NUMERIC(6,2)
goal_completion_rate    NUMERIC(4,3)
avg_satisfaction        NUMERIC(3,2)   1–5
adherence_improvement   NUMERIC(4,3)   Delta start → current

alerts_generated        INTEGER
false_positive_rate     NUMERIC(4,3)

avg_autonomy_level      NUMERIC(3,2)
clients_promoted        INTEGER
clients_demoted         INTEGER

revenue_generated       NUMERIC(12,2)
avg_revenue_per_client  NUMERIC(10,2)

UNIQUE (coach_id, period_start, period_end, period_type)
```
