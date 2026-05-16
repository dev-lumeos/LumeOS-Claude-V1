# Buddy / AI Coach Module — Database Schema (Spec)
> Spec Phase 6 | Vollständiges SQL

---

```sql
CREATE SCHEMA IF NOT EXISTS buddy;
SET search_path = buddy, public;
-- Für pgvector (Knowledge Base Embeddings):
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 1. buddy.user_coach_profile

```sql
CREATE TABLE buddy.user_coach_profile (
  user_id               UUID PRIMARY KEY,
  coach_name            TEXT DEFAULT 'Buddy',
  coach_personality     TEXT DEFAULT 'motivator'
    CHECK (coach_personality IN
      ('scientist','motivator','drill_sergeant','best_friend','zen_master')),
  communication_style   JSONB DEFAULT
    '{"humor": true, "directness": 3, "detail_level": 3, "language": "de"}',
  wake_word             TEXT,
  autonomy_level        INTEGER DEFAULT 3
    CHECK (autonomy_level BETWEEN 1 AND 5),
  intervention_threshold TEXT DEFAULT 'medium'
    CHECK (intervention_threshold IN ('low','medium','high','urgent_only')),
  feature_tier          TEXT DEFAULT 'free'
    CHECK (feature_tier IN ('free','plus','pro','elite','coach_b2b')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buddy.user_coach_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ucp_owner" ON buddy.user_coach_profile FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 2. buddy.user_preferences

```sql
CREATE TABLE buddy.user_preferences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  category     TEXT NOT NULL
    CHECK (category IN ('food_like','food_dislike','food_allergy','food_intolerance',
                        'exercise_like','exercise_dislike','supplement_pref',
                        'schedule','motivation','communication')),
  key          TEXT NOT NULL,
  value        TEXT NOT NULL,
  learned_at   TIMESTAMPTZ DEFAULT now(),
  source       TEXT DEFAULT 'behavior'
    CHECK (source IN ('onboarding','conversation','behavior','explicit')),
  confidence   NUMERIC(3,2) DEFAULT 0.80
    CHECK (confidence BETWEEN 0 AND 1),
  UNIQUE (user_id, category, key)
);

CREATE INDEX idx_uprefs_user_cat ON buddy.user_preferences(user_id, category);

ALTER TABLE buddy.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uprefs_owner" ON buddy.user_preferences FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 3. buddy.user_milestones

```sql
CREATE TABLE buddy.user_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  type         TEXT NOT NULL
    CHECK (type IN ('pr','streak','body','habit','social','bss','custom')),
  title        TEXT NOT NULL,
  description  TEXT,
  achieved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  celebrated   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_umilestone_user ON buddy.user_milestones(user_id, achieved_at DESC);

ALTER TABLE buddy.user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "umilestone_owner" ON buddy.user_milestones FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 4. buddy.buddy_state (1:1 pro User)

```sql
CREATE TABLE buddy.buddy_state (
  user_id               UUID PRIMARY KEY,
  training_score        NUMERIC(5,2),
  nutrition_score       NUMERIC(5,2),
  recovery_score        NUMERIC(5,2),
  adherence_score       NUMERIC(5,2),
  risk_score            NUMERIC(5,2),
  training_state        JSONB DEFAULT '{}',
  nutrition_state       JSONB DEFAULT '{}',
  recovery_state        JSONB DEFAULT '{}',
  body_state            JSONB DEFAULT '{}',
  behavior_state        JSONB DEFAULT '{}',
  safety_state          JSONB DEFAULT '{}',
  behavioral_signature  JSONB DEFAULT '{}',
  context_vector        JSONB DEFAULT '{}',
  snapshot_json         JSONB DEFAULT '{}',
  algorithm_version     TEXT DEFAULT 'v1.0',
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buddy.buddy_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bstate_owner" ON buddy.buddy_state FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 5. buddy.buddy_events (append-only)

```sql
CREATE TABLE buddy.buddy_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  event_type        TEXT NOT NULL,
  source_engine     TEXT,
  payload_json      JSONB NOT NULL DEFAULT '{}',
  event_timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at      TIMESTAMPTZ,
  sync_status       TEXT DEFAULT 'synced'
    CHECK (sync_status IN ('local_only','pending_sync','synced','failed','superseded')),
  source            TEXT,
  idempotency_key   TEXT UNIQUE
);

CREATE INDEX idx_bevents_user_type ON buddy.buddy_events(user_id, event_type, event_timestamp DESC);
CREATE INDEX idx_bevents_user_date ON buddy.buddy_events(user_id, event_timestamp DESC);

ALTER TABLE buddy.buddy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bevents_owner" ON buddy.buddy_events FOR SELECT
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "bevents_insert" ON buddy.buddy_events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);
-- Kein UPDATE/DELETE (append-only)
```

---

## 6. buddy.buddy_decisions

```sql
CREATE TABLE buddy.buddy_decisions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  event_id      UUID REFERENCES buddy.buddy_events(id),
  rule_id       TEXT,
  decision_type TEXT NOT NULL,
  confidence    NUMERIC(3,2),
  explanation   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bdecisions_user ON buddy.buddy_decisions(user_id, created_at DESC);

ALTER TABLE buddy.buddy_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bdecisions_owner" ON buddy.buddy_decisions FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

---

## 7. buddy.buddy_actions

```sql
CREATE TABLE buddy.buddy_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id   UUID REFERENCES buddy.buddy_decisions(id),
  user_id       UUID NOT NULL,
  action_type   TEXT NOT NULL,
  payload_json  JSONB DEFAULT '{}',
  status        TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','applied','rejected','noop','failed')),
  executed_at   TIMESTAMPTZ
);

CREATE INDEX idx_bactions_user ON buddy.buddy_actions(user_id, executed_at DESC);
```

---

## 8. buddy.buddy_rules (konfigurierbar)

```sql
CREATE TABLE buddy.buddy_rules (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID,   -- NULL = System-Regel (global)
  coach_id                 UUID,   -- NULL = nicht Coach-spezifisch
  rule_name                TEXT NOT NULL,
  rule_type                TEXT,
  category                 TEXT
    CHECK (category IN ('nutrition','training','recovery',
                        'supplements','medical','general',NULL)),
  trigger_event            TEXT,
  conditions               JSONB NOT NULL DEFAULT '[]',
  action_definition        JSONB NOT NULL DEFAULT '{}',
  priority                 INTEGER DEFAULT 5,
  cooldown_hours           INTEGER DEFAULT 24,
  max_activations_per_day  INTEGER DEFAULT 3,
  is_active                BOOLEAN DEFAULT true,
  is_system_rule           BOOLEAN DEFAULT false,
  activation_count         INTEGER DEFAULT 0,
  last_activated           TIMESTAMPTZ,
  success_rate             NUMERIC(5,4),
  created_by               TEXT DEFAULT 'system'
    CHECK (created_by IN ('system','user','coach')),
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brules_user_active  ON buddy.buddy_rules(user_id, is_active);
CREATE INDEX idx_brules_coach        ON buddy.buddy_rules(coach_id, is_active);
CREATE INDEX idx_brules_system       ON buddy.buddy_rules(is_system_rule, is_active);
```

---

## 9. buddy.bss_snapshots

```sql
CREATE TABLE buddy.bss_snapshots (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  period             TEXT DEFAULT 'rolling_90d',
  stability          JSONB NOT NULL DEFAULT '{}',
  goal_alignment     JSONB NOT NULL DEFAULT '{}',
  bss_total          INTEGER NOT NULL,
  bss_formula        TEXT,
  bss_trend          TEXT CHECK (bss_trend IN ('improving','stable','declining',NULL)),
  bss_delta_vs_prior INTEGER
);

CREATE INDEX idx_bss_user ON buddy.bss_snapshots(user_id, computed_at DESC);

ALTER TABLE buddy.bss_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bss_owner" ON buddy.bss_snapshots FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

---

## 10. buddy.intervention_log

```sql
CREATE TABLE buddy.intervention_log (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  context_vector_id    UUID,
  intervention_type    TEXT NOT NULL
    CHECK (intervention_type IN
      ('confrontation','encouragement','adjustment','redirect','silence')),
  tone_variant         TEXT
    CHECK (tone_variant IN ('direct','soft','humorous','analytical','tough_love')),
  bucket               TEXT,
  content_summary      TEXT,
  selection            JSONB DEFAULT '{}',
  expected_outcome     TEXT,
  observed_outcome     TEXT
    CHECK (observed_outcome IN ('accepted','rejected','ignored','engaged',NULL)),
  effectiveness_score  NUMERIC(3,2),
  cooldown_until       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_intlog_user ON buddy.intervention_log(user_id, created_at DESC);

ALTER TABLE buddy.intervention_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intlog_owner" ON buddy.intervention_log FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

---

## 11. buddy.coach_conversations

```sql
CREATE TABLE buddy.coach_conversations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL,
  started_at               TIMESTAMPTZ DEFAULT now(),
  last_message_at          TIMESTAMPTZ DEFAULT now(),
  status                   TEXT DEFAULT 'active'
    CHECK (status IN ('active','archived','paused')),
  persona_id               TEXT DEFAULT 'motivator',
  context_window_size      INTEGER DEFAULT 20,
  coaching_style           TEXT DEFAULT 'balanced',
  message_count            INTEGER DEFAULT 0,
  user_satisfaction_rating NUMERIC(3,2)
);

CREATE INDEX idx_cconvs_user ON buddy.coach_conversations(user_id, last_message_at DESC);

ALTER TABLE buddy.coach_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cconvs_owner" ON buddy.coach_conversations FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 12. buddy.coach_messages

```sql
CREATE TABLE buddy.coach_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL
    REFERENCES buddy.coach_conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content           TEXT NOT NULL,
  message_index     INTEGER NOT NULL,
  timestamp_utc     TIMESTAMPTZ DEFAULT now(),
  model_used        TEXT,
  tokens_used       INTEGER,
  intent_detected   TEXT,
  sentiment_score   NUMERIC(4,3),
  user_feedback     TEXT
    CHECK (user_feedback IN ('helpful','not_helpful','irrelevant',NULL)),
  UNIQUE (conversation_id, message_index)
);

CREATE INDEX idx_cmsgs_conv ON buddy.coach_messages(conversation_id, timestamp_utc DESC);
```

---

## 13. buddy.knowledge_base (RAG)

```sql
CREATE TABLE buddy.knowledge_base (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  summary          TEXT,
  category         TEXT
    CHECK (category IN ('nutrition','training','recovery',
                        'supplements','medical','psychology')),
  tags             TEXT[] DEFAULT '{}',
  content_type     TEXT,
  source           TEXT,
  evidence_level   TEXT
    CHECK (evidence_level IN ('A+','A','B','C','D',NULL)),
  peer_reviewed    BOOLEAN DEFAULT false,
  embedding_vector VECTOR(1536),
  access_count     INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active'
    CHECK (status IN ('active','deprecated','under_review')),
  language         TEXT DEFAULT 'en',
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_category ON buddy.knowledge_base(category, status);
CREATE INDEX idx_kb_tags     ON buddy.knowledge_base USING GIN(tags);
-- Vector Similarity Search Index:
CREATE INDEX idx_kb_embedding ON buddy.knowledge_base
  USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
```

---

## 14. buddy.coach_journey (Heartbeat)

```sql
CREATE TABLE buddy.coach_journey (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE,
  checkpoints  JSONB NOT NULL DEFAULT '[]',
  active_days  INTEGER[] DEFAULT '{1,2,3,4,5,6,0}',
  timezone     TEXT DEFAULT 'UTC',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buddy.coach_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_owner" ON buddy.coach_journey FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 15. buddy.coach_alerts (Wächter-Outputs)

```sql
CREATE TABLE buddy.coach_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  level         TEXT NOT NULL
    CHECK (level IN ('critical','warning','info')),
  category      TEXT NOT NULL,
  message       TEXT NOT NULL,
  data          JSONB DEFAULT '{}',
  dismissed     BOOLEAN DEFAULT false,
  dismiss_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ DEFAULT now() + INTERVAL '48 hours'
);

CREATE INDEX idx_calerts_user_active ON buddy.coach_alerts(user_id, dismissed)
  WHERE dismissed = false;

ALTER TABLE buddy.coach_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calerts_owner" ON buddy.coach_alerts FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## 16. buddy.coach_profiles (Feature Tier + Präferenzen)

```sql
CREATE TABLE buddy.coach_profiles (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL UNIQUE,
  preferred_persona             TEXT DEFAULT 'motivator',
  communication_style           TEXT DEFAULT 'balanced',
  motivation_style              TEXT DEFAULT 'encouraging',
  reminder_frequency            TEXT DEFAULT 'moderate'
    CHECK (reminder_frequency IN ('low','moderate','high')),
  autonomy_level                TEXT DEFAULT 'collaborative'
    CHECK (autonomy_level IN ('passive','collaborative','active')),
  intervention_threshold        TEXT DEFAULT 'medium'
    CHECK (intervention_threshold IN ('low','medium','high','urgent_only')),
  preferred_communication_times JSONB DEFAULT '{}',
  quiet_hours_start             TIME,
  quiet_hours_end               TIME,
  timezone                      TEXT DEFAULT 'UTC',
  coaching_objectives           TEXT[] DEFAULT '{}',
  avoid_topics                  TEXT[] DEFAULT '{}',
  health_conditions             TEXT[] DEFAULT '{}',
  life_constraints              TEXT[] DEFAULT '{}',
  module_access                 JSONB DEFAULT '{
    "nutrition": true, "training": true, "recovery": true,
    "supplements": true, "medical": false, "goals": true
  }',
  feature_tier                  TEXT DEFAULT 'free',
  created_at                    TIMESTAMPTZ DEFAULT now(),
  updated_at                    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buddy.coach_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpro_owner" ON buddy.coach_profiles FOR ALL
  USING (auth.uid()::text = user_id::text);
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA buddy TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA buddy TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA buddy TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA buddy TO authenticated, service_role;
```
