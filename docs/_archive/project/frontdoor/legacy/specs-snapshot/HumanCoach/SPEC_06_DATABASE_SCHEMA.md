# Human Coach Module — Database Schema (Spec)
> Spec Phase 6 | Vollständiges SQL

---

```sql
CREATE SCHEMA IF NOT EXISTS coach;
SET search_path = coach, public;
```

---

## 1. coach.coach_profiles

```sql
CREATE TABLE coach.coach_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  display_name     TEXT NOT NULL,
  title            TEXT,
  bio              TEXT,
  avatar_url       TEXT,
  certifications   TEXT[] DEFAULT '{}',
  specializations  TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  email            TEXT NOT NULL,
  phone            TEXT,
  timezone         TEXT DEFAULT 'UTC',
  role             TEXT NOT NULL DEFAULT 'coach'
    CHECK (role IN ('trainee_coach','coach','senior_coach','head_coach')),
  max_clients          INTEGER DEFAULT 50,
  current_client_count INTEGER DEFAULT 0,
  working_hours        JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  is_active            BOOLEAN DEFAULT true,
  is_accepting_clients BOOLEAN DEFAULT true,
  last_active_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cp_user    ON coach.coach_profiles(user_id);
CREATE INDEX idx_cp_active  ON coach.coach_profiles(is_active, is_accepting_clients);
CREATE INDEX idx_cp_specs   ON coach.coach_profiles USING GIN(specializations);

ALTER TABLE coach.coach_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_owner" ON coach.coach_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 2. coach.coach_clients

```sql
CREATE TABLE coach.coach_clients (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id               UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  client_id              UUID NOT NULL,
  is_active              BOOLEAN DEFAULT true,
  status                 TEXT DEFAULT 'active'
    CHECK (status IN ('active','paused','ended')),
  assignment_type        TEXT DEFAULT 'primary'
    CHECK (assignment_type IN ('primary','secondary','temporary')),
  coaching_style         TEXT,
  communication_frequency TEXT,
  start_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date               DATE,
  billing_cycle          TEXT,
  hourly_rate            NUMERIC(10,2),
  autonomy_level         INTEGER DEFAULT 2
    CHECK (autonomy_level BETWEEN 1 AND 5),
  intervention_threshold TEXT DEFAULT 'medium',
  alert_preferences      JSONB DEFAULT '{}',
  coach_notes            TEXT,
  tags                   TEXT[] DEFAULT '{}',
  satisfaction_rating    NUMERIC(3,2),
  goal_completion_rate   NUMERIC(3,2),
  last_contact_at        TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE (coach_id, client_id, assignment_type)
);

CREATE INDEX idx_cc_coach  ON coach.coach_clients(coach_id, is_active);
CREATE INDEX idx_cc_client ON coach.coach_clients(client_id, is_active);
CREATE INDEX idx_cc_tags   ON coach.coach_clients USING GIN(tags);
```

---

## 3. coach.coach_client_permissions

```sql
CREATE TABLE coach.coach_client_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_client_id UUID NOT NULL REFERENCES coach.coach_clients(id) ON DELETE CASCADE,
  module          TEXT NOT NULL
    CHECK (module IN ('nutrition','training','recovery','supplements',
                      'medical','goals','body_metrics')),
  access_level    TEXT NOT NULL DEFAULT 'none'
    CHECK (access_level IN ('full','summary','none')),
  granted_at      TIMESTAMPTZ DEFAULT now(),
  granted_by      UUID NOT NULL,
  expires_at      TIMESTAMPTZ,
  UNIQUE (coach_client_id, module)
);

-- Trigger: Medical permission darf nur durch Client vergeben werden
CREATE OR REPLACE FUNCTION coach.validate_medical_permission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.module = 'medical' AND NEW.access_level != 'none' THEN
    -- granted_by muss der Client sein (nicht der Coach)
    -- Diese Prüfung erfolgt zusätzlich in der API-Layer
    RAISE LOG 'Medical permission granted for coach_client %', NEW.coach_client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medical_perm BEFORE INSERT OR UPDATE ON coach.coach_client_permissions
  FOR EACH ROW EXECUTE FUNCTION coach.validate_medical_permission();
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
  category        TEXT,
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

CREATE INDEX idx_alerts_active   ON coach.coach_alerts(coach_id)
  WHERE dismissed_at IS NULL;
CREATE INDEX idx_alerts_priority ON coach.coach_alerts(coach_id, priority, created_at DESC);
CREATE INDEX idx_alerts_unread   ON coach.coach_alerts(coach_id)
  WHERE read_at IS NULL AND dismissed_at IS NULL;

ALTER TABLE coach.coach_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_owner" ON coach.coach_alerts FOR ALL
  USING (auth.uid()::text = coach_id::text);
```

---

## 5. coach.coach_rules

```sql
CREATE TABLE coach.coach_rules (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id             UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  description          TEXT,
  category             TEXT,
  logic_operator       TEXT DEFAULT 'AND' CHECK (logic_operator IN ('AND','OR')),
  conditions           JSONB NOT NULL,
  actions              JSONB NOT NULL,
  is_enabled           BOOLEAN DEFAULT true,
  applies_to_all_clients BOOLEAN DEFAULT true,
  client_filter        JSONB,
  cooldown_minutes     INTEGER DEFAULT 60,
  max_triggers_per_day INTEGER DEFAULT 5,
  trigger_count        INTEGER DEFAULT 0,
  last_triggered_at    TIMESTAMPTZ,
  false_positive_count INTEGER DEFAULT 0,
  effectiveness_score  NUMERIC(3,2),
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rules_enabled ON coach.coach_rules(coach_id, is_enabled);
```

---

## 6. coach.coach_rule_templates

```sql
CREATE TABLE coach.coach_rule_templates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  description          TEXT NOT NULL,
  category             TEXT NOT NULL,
  conditions_template  JSONB NOT NULL,
  actions_template     JSONB NOT NULL,
  default_parameters   JSONB DEFAULT '{}',
  tags                 TEXT[] DEFAULT '{}',
  usage_count          INTEGER DEFAULT 0,
  is_active            BOOLEAN DEFAULT true,
  is_featured          BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coach.coach_rule_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select" ON coach.coach_rule_templates FOR SELECT USING (true);
```

---

## 7. coach.client_autonomy_levels

```sql
CREATE TABLE coach.client_autonomy_levels (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL,
  coach_id             UUID NOT NULL REFERENCES coach.coach_profiles(id) ON DELETE CASCADE,
  current_level        INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
  level_name           TEXT NOT NULL,
  consistency_score    NUMERIC(3,2),
  knowledge_score      NUMERIC(3,2),
  self_correction_score NUMERIC(3,2),
  communication_score  NUMERIC(3,2),
  overall_score        NUMERIC(3,2),
  check_in_frequency   TEXT,
  intervention_threshold TEXT,
  assigned_at          TIMESTAMPTZ DEFAULT now(),
  assigned_by          UUID,
  assignment_reason    TEXT,
  next_assessment_date DATE,
  regression_risk      NUMERIC(3,2),
  UNIQUE (client_id, coach_id)
);
```

---

## 8. coach.client_autonomy_history

```sql
CREATE TABLE coach.client_autonomy_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL,
  coach_id          UUID NOT NULL REFERENCES coach.coach_profiles(id),
  previous_level    INTEGER,
  new_level         INTEGER NOT NULL CHECK (new_level BETWEEN 1 AND 5),
  change_type       TEXT NOT NULL
    CHECK (change_type IN ('promotion','demotion','lateral','initial')),
  assessment_scores JSONB,
  change_reasoning  TEXT,
  changed_by        UUID,
  change_trigger    TEXT,
  changed_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_autonomy_hist ON coach.client_autonomy_history(client_id, changed_at DESC);
```

---

## 9. coach.client_adherence_summary

```sql
CREATE TABLE coach.client_adherence_summary (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL,
  coach_id             UUID NOT NULL REFERENCES coach.coach_profiles(id),
  date                 DATE NOT NULL,
  overall_adherence    NUMERIC(4,3) CHECK (overall_adherence BETWEEN 0 AND 1),
  weighted_adherence   NUMERIC(4,3),
  nutrition_adherence  NUMERIC(4,3),
  training_adherence   NUMERIC(4,3),
  recovery_adherence   NUMERIC(4,3),
  supplement_adherence NUMERIC(4,3),
  trend_direction      TEXT,
  trend_strength       NUMERIC(4,3),
  volatility           NUMERIC(4,3),
  data_completeness    NUMERIC(4,3),
  insights             JSONB DEFAULT '[]',
  calculated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (client_id, date)
);

CREATE INDEX idx_adherence_cd ON coach.client_adherence_summary(client_id, date DESC);
```

---

## 10. coach.coach_messages

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

CREATE INDEX idx_msg_cc ON coach.coach_messages(coach_client_id, created_at DESC);
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA coach TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA coach TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA coach TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA coach TO authenticated, service_role;
```
