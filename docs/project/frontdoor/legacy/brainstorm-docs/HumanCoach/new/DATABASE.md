# Human Coach Module — Database Schema

## Schema & Übersicht

Coach-Daten im Schema `coach`. Client-Daten bleiben in ihren jeweiligen Schemas.
Coach liest Client-Daten niemals direkt — immer via Permission-API.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `coach.coach_profiles` | Coach-Profil (Zertifikate, Role, Kapazität) |
| `coach.coach_clients` | Coach-Client-Mapping (Autonomy, Status, Billing) |
| `coach.coach_client_permissions` | Granulare Permissions pro Modul |
| `coach.coach_alerts` | Alert-Lifecycle |
| `coach.coach_alert_settings` | Coach Notification Preferences |
| `coach.coach_rules` | Automatische Alert-Regeln |
| `coach.coach_rule_templates` | System-Templates für Regeln |
| `coach.client_autonomy_levels` | Aktueller Autonomy-Level |
| `coach.client_autonomy_history` | Level-Änderungen |
| `coach.client_adherence_summary` | Tägliche Adherence per Dimension |
| `coach.adherence_predictions` | ML-basierte Vorhersagen |
| `coach.coach_messages` | In-App Chat |
| `coach.coach_checkin_templates` | Check-in Vorlagen |
| `coach.coach_performance_metrics` | Coach KPIs |

---

## 1. coach.coach_profiles

```sql
CREATE TABLE coach.coach_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE,

  display_name    TEXT NOT NULL,
  title           TEXT,
  bio             TEXT,
  avatar_url      TEXT,

  certifications  TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  years_experience INTEGER,

  email           TEXT NOT NULL,
  phone           TEXT,
  timezone        TEXT DEFAULT 'UTC',

  role            TEXT NOT NULL DEFAULT 'coach'
    CHECK (role IN ('trainee_coach','coach','senior_coach','head_coach')),
  max_clients     INTEGER DEFAULT 50,
  current_client_count INTEGER DEFAULT 0,

  working_hours   JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',

  is_active       BOOLEAN DEFAULT true,
  is_accepting_clients BOOLEAN DEFAULT true,
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coach_profiles_user    ON coach.coach_profiles(user_id);
CREATE INDEX idx_coach_profiles_active  ON coach.coach_profiles(is_active, is_accepting_clients);
CREATE INDEX idx_coach_profiles_specs   ON coach.coach_profiles USING GIN(specializations);

ALTER TABLE coach.coach_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach_owner" ON coach.coach_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 2. coach.coach_clients

```sql
CREATE TABLE coach.coach_clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL,

  is_active       BOOLEAN DEFAULT true,
  status          TEXT DEFAULT 'active'
    CHECK (status IN ('active','paused','ended')),

  assignment_type TEXT DEFAULT 'primary'
    CHECK (assignment_type IN ('primary','secondary','temporary')),
  coaching_style  TEXT
    CHECK (coaching_style IN ('hands_on','collaborative','consultative',NULL)),
  communication_frequency TEXT
    CHECK (communication_frequency IN ('daily','weekly','bi_weekly','monthly',NULL)),

  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  billing_cycle   TEXT CHECK (billing_cycle IN ('monthly','quarterly','yearly',NULL)),
  hourly_rate     NUMERIC(10,2),

  autonomy_level  INTEGER DEFAULT 2 CHECK (autonomy_level BETWEEN 1 AND 5),
  intervention_threshold TEXT DEFAULT 'medium'
    CHECK (intervention_threshold IN ('low','medium','high')),

  alert_preferences  JSONB DEFAULT '{}',
  coach_notes        TEXT,
  tags               TEXT[] DEFAULT '{}',

  satisfaction_rating   NUMERIC(3,2),
  goal_completion_rate  NUMERIC(3,2),

  last_contact_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE (coach_id, client_id, assignment_type)
);

CREATE INDEX idx_coach_clients_coach  ON coach.coach_clients(coach_id, is_active);
CREATE INDEX idx_coach_clients_client ON coach.coach_clients(client_id, is_active);
CREATE INDEX idx_coach_clients_tags   ON coach.coach_clients USING GIN(tags);
```

---

## 3. coach.coach_client_permissions

```sql
CREATE TABLE coach.coach_client_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_client_id UUID NOT NULL REFERENCES coach.coach_clients(id) ON DELETE CASCADE,
  module          TEXT NOT NULL
    CHECK (module IN ('nutrition','training','recovery','supplements','medical',
                      'goals','body_metrics')),
  access_level    TEXT NOT NULL DEFAULT 'none'
    CHECK (access_level IN ('full','summary','none')),
  granted_at      TIMESTAMPTZ DEFAULT now(),
  granted_by      UUID NOT NULL,    -- client_id
  expires_at      TIMESTAMPTZ,

  UNIQUE (coach_client_id, module)
);
```

---

## 4. coach.coach_alerts

```sql
CREATE TABLE coach.coach_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL,

  type            TEXT NOT NULL
    CHECK (type IN ('adherence_drop','missed_goals','recovery_issues',
                    'nutrition_concerns','supplement_interactions','medical_concern',
                    'streak_achievement','goal_reached','overtraining')),
  category        TEXT
    CHECK (category IN ('nutrition','training','recovery','supplements','medical','general',NULL)),
  priority        INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  severity        TEXT NOT NULL
    CHECK (severity IN ('critical','high','medium','low','info')),

  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  context_data    JSONB DEFAULT '{}',
  recommended_actions TEXT[] DEFAULT '{}',

  rule_id         UUID REFERENCES coach.coach_rules(id) ON DELETE SET NULL,
  rule_name       TEXT,

  status          TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','read','acknowledged','resolved','dismissed')),
  read_at         TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  coach_note      TEXT,
  dismissed_at    TIMESTAMPTZ,
  dismissal_reason TEXT,

  expires_at      TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  action_taken    BOOLEAN DEFAULT false,
  false_positive  BOOLEAN,
  confidence      NUMERIC(3,2),

  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_coach_active  ON coach.coach_alerts(coach_id)
  WHERE dismissed_at IS NULL;
CREATE INDEX idx_alerts_priority      ON coach.coach_alerts(coach_id, priority, created_at DESC);
CREATE INDEX idx_alerts_client        ON coach.coach_alerts(client_id, created_at DESC);
CREATE INDEX idx_alerts_unread        ON coach.coach_alerts(coach_id, read_at)
  WHERE read_at IS NULL;
```

---

## 5. coach.coach_rules

```sql
CREATE TABLE coach.coach_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,

  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,

  logic_operator  TEXT DEFAULT 'AND' CHECK (logic_operator IN ('AND','OR')),
  conditions      JSONB NOT NULL,
  -- [{module, metric, operator, value, timeframe_days}]
  actions         JSONB NOT NULL,
  -- {type: 'alert'|'message'|'plan_adjustment', severity?, template?}

  is_enabled      BOOLEAN DEFAULT true,
  applies_to_all_clients BOOLEAN DEFAULT true,
  client_filter   JSONB,

  cooldown_minutes    INTEGER DEFAULT 60,
  max_triggers_per_day INTEGER DEFAULT 5,

  trigger_count   INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  false_positive_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC(3,2),

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rules_coach_enabled ON coach.coach_rules(coach_id, is_enabled);
```

---

## 6. coach.client_autonomy_levels

```sql
CREATE TABLE coach.client_autonomy_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL,
  coach_id        UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,

  current_level   INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
  level_name      TEXT NOT NULL,

  consistency_score      NUMERIC(3,2),
  knowledge_score        NUMERIC(3,2),
  self_correction_score  NUMERIC(3,2),
  communication_score    NUMERIC(3,2),
  overall_score          NUMERIC(3,2),

  check_in_frequency     TEXT,
  intervention_threshold TEXT,

  assigned_at     TIMESTAMPTZ DEFAULT now(),
  assigned_by     UUID,
  assignment_reason TEXT,
  next_assessment_date DATE,

  regression_risk NUMERIC(3,2),

  UNIQUE (client_id, coach_id)
);
```

---

## 7. coach.client_adherence_summary

```sql
CREATE TABLE coach.client_adherence_summary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL,
  coach_id        UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL,

  overall_adherence    NUMERIC(4,3) CHECK (overall_adherence BETWEEN 0 AND 1),
  weighted_adherence   NUMERIC(4,3),

  nutrition_adherence  NUMERIC(4,3),
  training_adherence   NUMERIC(4,3),
  recovery_adherence   NUMERIC(4,3),
  supplement_adherence NUMERIC(4,3),

  trend_direction      TEXT CHECK (trend_direction IN ('improving','declining','stable',NULL)),
  trend_strength       NUMERIC(4,3),
  volatility           NUMERIC(4,3),

  data_completeness    NUMERIC(4,3),
  insights             JSONB DEFAULT '[]',

  calculated_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE (client_id, date)
);

CREATE INDEX idx_adherence_client_date ON coach.client_adherence_summary(client_id, date DESC);
CREATE INDEX idx_adherence_coach_date  ON coach.client_adherence_summary(coach_id, date DESC);
```

---

## 8. coach.coach_messages

```sql
CREATE TABLE coach.coach_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_client_id UUID NOT NULL REFERENCES coach.coach_clients(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL,
  content         TEXT NOT NULL,
  message_type    TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','note','task','plan_update','check_in')),
  attachment_url  TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_cc ON coach.coach_messages(coach_client_id, created_at DESC);
```

---

## Views

### coach_dashboard_summary

```sql
CREATE VIEW coach.coach_dashboard_summary AS
SELECT
  cp.id AS coach_id,
  cp.display_name,
  COUNT(cc.id)                                               AS total_clients,
  COUNT(cc.id) FILTER (WHERE cc.is_active = true)            AS active_clients,
  COUNT(ca.id) FILTER (WHERE ca.priority <= 2 AND ca.dismissed_at IS NULL) AS critical_alerts,
  COUNT(ca.id) FILTER (WHERE ca.read_at IS NULL AND ca.dismissed_at IS NULL) AS unread_alerts,
  ROUND(AVG(cal.current_level), 1)                           AS avg_autonomy_level,
  ROUND(AVG(cas.overall_adherence) * 100, 1)                AS avg_adherence_pct
FROM coach.coach_profiles cp
LEFT JOIN coach.coach_clients cc         ON cc.coach_id = cp.id
LEFT JOIN coach.coach_alerts ca          ON ca.coach_id = cp.id
LEFT JOIN coach.client_autonomy_levels cal ON cal.coach_id = cp.id
LEFT JOIN coach.client_adherence_summary cas ON cas.coach_id = cp.id
  AND cas.date >= CURRENT_DATE - 7
GROUP BY cp.id, cp.display_name;
```

### client_risk_assessment

```sql
CREATE VIEW coach.client_risk_assessment AS
WITH recent AS (
  SELECT client_id,
    AVG(overall_adherence)  AS avg_7d,
    STDDEV(overall_adherence) AS volatility
  FROM coach.client_adherence_summary
  WHERE date >= CURRENT_DATE - 7
  GROUP BY client_id
),
alerts AS (
  SELECT client_id,
    COUNT(*) FILTER (WHERE priority <= 2) AS high_prio
  FROM coach.coach_alerts
  WHERE created_at >= CURRENT_DATE - 7 AND dismissed_at IS NULL
  GROUP BY client_id
)
SELECT cc.client_id, cc.coach_id, cc.autonomy_level,
  r.avg_7d, r.volatility, a.high_prio,
  CASE
    WHEN r.avg_7d < 0.5 OR a.high_prio >= 3 THEN 'critical'
    WHEN r.avg_7d < 0.7 OR a.high_prio >= 2 THEN 'high'
    WHEN r.avg_7d < 0.8 OR a.high_prio >= 1 THEN 'medium'
    ELSE 'low'
  END AS risk_level
FROM coach.coach_clients cc
LEFT JOIN recent r  ON r.client_id = cc.client_id
LEFT JOIN alerts a  ON a.client_id = cc.client_id
WHERE cc.is_active = true;
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA coach TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA coach TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA coach TO service_role;
```
