# Coach Database Schema

## Core Coach System Tables

### coach_conversations
Main conversation threads between users and AI coach.

```sql
CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conversation metadata
  conversation_title TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- active, archived, paused
  
  -- AI configuration
  persona_id VARCHAR(50) DEFAULT 'buddy', -- buddy, professional, motivational
  context_window_size INTEGER DEFAULT 10, -- Number of messages to include in context
  
  -- Conversation settings
  auto_summarize BOOLEAN DEFAULT true,
  include_cross_module_data BOOLEAN DEFAULT true,
  coaching_style VARCHAR(30) DEFAULT 'balanced', -- supportive, direct, motivational
  
  -- Performance tracking
  message_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  user_satisfaction_rating NUMERIC(3,2), -- 1.00-5.00 average rating
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_coach_conversations_user` on `user_id`
- `idx_coach_conversations_status` on `status`
- `idx_coach_conversations_last_message` on `last_message_at`

### coach_messages
Individual messages within conversations.

```sql
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role VARCHAR(10) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  raw_content TEXT, -- Original user input before processing
  
  -- Message metadata
  message_index INTEGER NOT NULL, -- Sequential order within conversation
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  
  -- AI processing details
  model_used VARCHAR(50), -- claude-sonnet-4, glm-4.7-flash
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  context_tokens INTEGER,
  
  -- Message features
  intent_detected VARCHAR(50), -- question, command, feedback, chat
  entities_extracted JSONB, -- Named entities found in message
  sentiment_score NUMERIC(4,3), -- -1.000 to 1.000
  
  -- Conversation flow
  parent_message_id UUID REFERENCES coach_messages(id),
  requires_followup BOOLEAN DEFAULT false,
  action_triggered BOOLEAN DEFAULT false,
  
  -- User interaction
  user_feedback VARCHAR(20), -- helpful, not_helpful, irrelevant
  user_rating INTEGER, -- 1-5 star rating for this response
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, message_index)
);
```

**Indexes:**
- `idx_coach_messages_conversation` on `conversation_id`
- `idx_coach_messages_timestamp` on `timestamp_utc`
- `idx_coach_messages_role` on `role`
- `idx_coach_messages_intent` on `intent_detected`

## Buddy Autonomous System Tables

### buddy_daily_state
Daily state aggregation for Buddy decision-making.

```sql
CREATE TABLE buddy_daily_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Module scores (0-100)
  nutrition_score NUMERIC(5,2),
  training_score NUMERIC(5,2),
  recovery_score NUMERIC(5,2),
  supplements_score NUMERIC(5,2),
  goals_score NUMERIC(5,2),
  
  -- Overall metrics
  overall_score NUMERIC(5,2), -- Weighted average of module scores
  compliance_rate NUMERIC(5,4), -- 0.0000-1.0000
  streak_days INTEGER DEFAULT 0,
  
  -- Trend analysis
  trend_direction VARCHAR(20), -- improving, declining, stable
  trend_strength NUMERIC(3,2), -- 0.00-1.00
  pattern_detected VARCHAR(100), -- "poor_weekend_nutrition", "excellent_training_consistency"
  
  -- Decision context
  active_interventions INTEGER DEFAULT 0,
  intervention_load NUMERIC(5,2), -- How much coaching user is receiving
  last_major_decision TIMESTAMPTZ,
  decision_fatigue_score NUMERIC(3,2), -- 0.00-1.00
  
  -- State metadata
  data_completeness NUMERIC(3,2), -- 0.00-1.00 how much data we have
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  algorithm_version VARCHAR(10) DEFAULT 'v1.0',
  
  UNIQUE(user_id, date)
);
```

**Indexes:**
- `idx_buddy_daily_state_user_date` on `(user_id, date)`
- `idx_buddy_daily_state_overall_score` on `overall_score`

### buddy_decisions
Autonomous decisions made by Buddy system.

```sql
CREATE TABLE buddy_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Decision classification
  decision_type VARCHAR(50) NOT NULL, -- nutrition_reminder, workout_suggestion, recovery_alert
  category VARCHAR(30), -- reminder, suggestion, intervention, celebration
  priority VARCHAR(20), -- low, medium, high, urgent
  
  -- Decision logic
  trigger_condition TEXT, -- Human-readable condition that triggered this
  reasoning TEXT, -- AI explanation of why this decision was made
  confidence NUMERIC(3,2), -- 0.00-1.00 confidence in decision
  
  -- Decision content
  action_type VARCHAR(50), -- send_notification, suggest_action, log_data, schedule_reminder
  action_payload JSONB, -- Specific action parameters
  message_content TEXT, -- Message to display to user
  
  -- Execution tracking
  action_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, executed, failed
  scheduled_for TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  user_response VARCHAR(20), -- approved, dismissed, snoozed, acted_upon
  
  -- Impact assessment
  predicted_impact VARCHAR(20), -- positive, neutral, negative
  actual_impact VARCHAR(20), -- measured after execution
  impact_score NUMERIC(4,2), -- -10.00 to 10.00
  
  -- Learning feedback
  user_feedback TEXT,
  effectiveness_rating INTEGER, -- 1-5 how effective was this decision
  would_repeat BOOLEAN, -- Should similar decisions be made in future
  
  -- Context preservation
  decision_context JSONB, -- Snapshot of data used to make decision
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_buddy_decisions_user_type` on `(user_id, decision_type)`
- `idx_buddy_decisions_status` on `action_status`
- `idx_buddy_decisions_priority` on `priority`
- `idx_buddy_decisions_scheduled` on `scheduled_for`

### buddy_rules
Configurable rules for Buddy decision-making.

```sql
CREATE TABLE buddy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = global rule
  
  -- Rule identification
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(30), -- trigger, condition, action, constraint
  category VARCHAR(30), -- nutrition, training, recovery, general
  
  -- Rule definition
  trigger_event VARCHAR(50), -- meal_missed, workout_skipped, poor_recovery
  conditions JSONB, -- Complex conditions for rule activation
  action_definition JSONB, -- What to do when rule activates
  
  -- Rule parameters
  priority INTEGER DEFAULT 5, -- 1-10 priority for rule evaluation
  cooldown_hours INTEGER DEFAULT 24, -- Minimum time between activations
  max_activations_per_day INTEGER DEFAULT 3,
  
  -- Rule status
  is_active BOOLEAN DEFAULT true,
  activation_count INTEGER DEFAULT 0,
  last_activated TIMESTAMPTZ,
  success_rate NUMERIC(5,4), -- 0.0000-1.0000
  
  -- Rule metadata
  created_by VARCHAR(50) DEFAULT 'system', -- system, user, coach
  evidence_based BOOLEAN DEFAULT false, -- Based on scientific evidence
  personalized BOOLEAN DEFAULT false, -- Customized for this user
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_buddy_rules_user_type` on `(user_id, rule_type)`
- `idx_buddy_rules_category` on `category`
- `idx_buddy_rules_active` on `is_active`

## Memory and Learning Tables

### coach_memory
Long-term memory system for personalized coaching.

```sql
CREATE TABLE coach_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Memory classification
  memory_type VARCHAR(30), -- preference, pattern, goal, concern, success
  category VARCHAR(30), -- nutrition, training, recovery, lifestyle, psychology
  subcategory VARCHAR(50), -- food_preferences, workout_timing, sleep_patterns
  
  -- Memory content
  content TEXT NOT NULL, -- Human-readable memory content
  structured_data JSONB, -- Machine-readable structured version
  evidence JSONB, -- Supporting data/examples for this memory
  
  -- Memory metadata
  confidence NUMERIC(3,2), -- 0.00-1.00 confidence in this memory
  importance NUMERIC(3,2), -- 0.00-1.00 importance for coaching
  recency_weight NUMERIC(3,2), -- 0.00-1.00 how recent/relevant
  
  -- Usage tracking
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Memory lifecycle
  expiry_date DATE, -- When this memory should be reconsidered
  auto_decay BOOLEAN DEFAULT true, -- Should confidence decay over time
  validation_required BOOLEAN DEFAULT false, -- Needs user confirmation
  
  -- Relationships
  related_memories UUID[], -- Array of related memory IDs
  contradicts_memories UUID[], -- Memories this contradicts
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_coach_memory_user_type` on `(user_id, memory_type)`
- `idx_coach_memory_category` on `category`
- `idx_coach_memory_confidence` on `confidence`
- `idx_coach_memory_last_accessed` on `last_accessed`

### knowledge_base
RAG knowledge base for evidence-based coaching.

```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Brief summary for quick reference
  
  -- Content classification
  category VARCHAR(50), -- nutrition, training, recovery, psychology, medical
  tags TEXT[], -- Searchable tags
  content_type VARCHAR(30), -- research, guideline, tip, fact, protocol
  
  -- Source and credibility
  source VARCHAR(200), -- Journal, book, organization, expert
  author VARCHAR(200),
  publication_date DATE,
  evidence_level VARCHAR(10), -- A+, A, B, C, D (evidence quality)
  peer_reviewed BOOLEAN DEFAULT false,
  
  -- Search and retrieval
  embedding_vector VECTOR(1536), -- OpenAI embeddings for RAG
  keywords TEXT[], -- Key terms for search
  search_weight NUMERIC(3,2) DEFAULT 1.00, -- Search result weighting
  
  -- Usage analytics
  access_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  user_rating NUMERIC(3,2), -- Average user rating
  
  -- Content management
  status VARCHAR(20) DEFAULT 'active', -- active, deprecated, under_review
  version INTEGER DEFAULT 1,
  language VARCHAR(5) DEFAULT 'en',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_knowledge_base_category` on `category`
- `idx_knowledge_base_tags` on `tags` (GIN index)
- `idx_knowledge_base_evidence_level` on `evidence_level`
- `idx_knowledge_base_status` on `status`

## Coach Performance and Analytics Tables

### coaching_sessions
Structured coaching sessions and their outcomes.

```sql
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES coach_conversations(id),
  
  -- Session definition
  session_type VARCHAR(30), -- goal_setting, progress_review, problem_solving, motivation
  focus_area VARCHAR(30), -- nutrition, training, recovery, mindset
  
  -- Session timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Session content
  objectives TEXT[], -- What the session aimed to achieve
  topics_covered TEXT[], -- Main topics discussed
  key_insights TEXT[], -- Important insights discovered
  action_items TEXT[], -- Specific actions agreed upon
  
  -- Session outcomes
  user_satisfaction INTEGER, -- 1-5 rating
  coach_effectiveness INTEGER, -- 1-5 self-assessment by AI
  objectives_met INTEGER, -- How many objectives were achieved
  followup_needed BOOLEAN DEFAULT false,
  
  -- Progress tracking
  baseline_metrics JSONB, -- Metrics at start of session
  target_metrics JSONB, -- Target metrics set during session
  progress_measured JSONB, -- Actual progress achieved
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### coach_interventions
Specific interventions and their effectiveness.

```sql
CREATE TABLE coach_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES buddy_decisions(id),
  
  -- Intervention details
  intervention_type VARCHAR(50), -- reminder, suggestion, correction, motivation, emergency
  target_behavior VARCHAR(50), -- meal_timing, workout_consistency, sleep_schedule
  
  -- Intervention timing
  triggered_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  user_response_at TIMESTAMPTZ,
  
  -- Intervention content
  message_delivered TEXT,
  action_suggested TEXT,
  reasoning_provided TEXT,
  
  -- User response
  user_action VARCHAR(30), -- ignored, acknowledged, acted_upon, dismissed
  user_feedback TEXT,
  behavioral_change BOOLEAN, -- Did behavior actually change
  
  -- Effectiveness measurement
  immediate_impact NUMERIC(4,2), -- -5.00 to 5.00
  short_term_impact NUMERIC(4,2), -- Impact after 24 hours
  long_term_impact NUMERIC(4,2), -- Impact after 1 week
  
  -- Learning data
  context_factors JSONB, -- What factors may have influenced effectiveness
  similar_interventions UUID[], -- Related interventions for comparison
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Coach Configuration Tables

### coach_profiles
User-specific coach configuration and preferences.

```sql
CREATE TABLE coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Coach personality
  preferred_persona VARCHAR(30) DEFAULT 'buddy', -- buddy, professional, motivational, zen
  communication_style VARCHAR(30) DEFAULT 'balanced', -- supportive, direct, casual, formal
  motivation_style VARCHAR(30) DEFAULT 'encouraging', -- encouraging, challenging, educational
  
  -- Interaction preferences
  reminder_frequency VARCHAR(20) DEFAULT 'moderate', -- low, moderate, high
  intervention_threshold VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent_only
  autonomy_level VARCHAR(20) DEFAULT 'collaborative', -- passive, collaborative, active
  
  -- Focus areas
  primary_focus VARCHAR(30), -- nutrition, training, recovery, mindset
  secondary_focus VARCHAR(30),
  avoid_topics TEXT[], -- Topics user doesn't want coaching on
  
  -- Communication timing
  preferred_communication_times JSONB, -- When user prefers to receive messages
  quiet_hours_start TIME, -- Don't send non-urgent messages during this time
  quiet_hours_end TIME,
  timezone VARCHAR(50),
  
  -- Coaching goals
  coaching_objectives TEXT[], -- What user wants to achieve through coaching
  success_metrics TEXT[], -- How to measure coaching success
  
  -- Personalization data
  learning_style VARCHAR(30), -- visual, auditory, kinesthetic, reading
  personality_traits JSONB, -- Big 5 personality assessment results
  cognitive_biases JSONB, -- Known biases to account for in coaching
  
  -- Constraints and boundaries
  health_conditions TEXT[], -- Conditions that affect coaching approach
  medications TEXT[], -- Medications that may affect recommendations
  life_constraints TEXT[], -- Time, budget, family constraints
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

## Views and Analytics

### coach_effectiveness_view
Aggregated coaching effectiveness metrics.

```sql
CREATE VIEW coach_effectiveness_view AS
SELECT 
  u.id as user_id,
  cp.preferred_persona,
  
  -- Conversation metrics
  COUNT(DISTINCT cc.id) as total_conversations,
  AVG(cc.user_satisfaction_rating) as avg_conversation_rating,
  AVG(cc.avg_response_time_ms) as avg_response_time,
  
  -- Decision metrics
  COUNT(DISTINCT bd.id) as total_decisions,
  AVG(bd.effectiveness_rating) as avg_decision_effectiveness,
  SUM(CASE WHEN bd.action_status = 'executed' THEN 1 ELSE 0 END)::FLOAT / COUNT(bd.id) as execution_rate,
  
  -- Intervention metrics
  COUNT(DISTINCT ci.id) as total_interventions,
  AVG(ci.immediate_impact) as avg_immediate_impact,
  AVG(ci.long_term_impact) as avg_long_term_impact,
  SUM(CASE WHEN ci.behavioral_change THEN 1 ELSE 0 END)::FLOAT / COUNT(ci.id) as behavior_change_rate,
  
  -- Recent activity
  MAX(cc.last_message_at) as last_conversation,
  MAX(bd.created_at) as last_decision,
  MAX(ci.triggered_at) as last_intervention

FROM users u
LEFT JOIN coach_profiles cp ON u.id = cp.user_id
LEFT JOIN coach_conversations cc ON u.id = cc.user_id
LEFT JOIN buddy_decisions bd ON u.id = bd.user_id
LEFT JOIN coach_interventions ci ON u.id = ci.user_id
GROUP BY u.id, cp.preferred_persona;
```

## Performance Optimizations

### Partitioning for Scale
```sql
-- Partition coach_messages by month for large datasets
CREATE TABLE coach_messages_y2026m01 PARTITION OF coach_messages
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE coach_messages_y2026m02 PARTITION OF coach_messages
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

### Automated Cleanup
```sql
-- Archive old conversations after 2 years
CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS INTEGER AS $$
DECLARE
  rows_archived INTEGER;
BEGIN
  WITH archived_conversations AS (
    DELETE FROM coach_conversations 
    WHERE last_message_at < NOW() - INTERVAL '2 years'
    AND status = 'archived'
    RETURNING *
  )
  INSERT INTO coach_conversations_archive 
  SELECT * FROM archived_conversations;
  
  GET DIAGNOSTICS rows_archived = ROW_COUNT;
  RETURN rows_archived;
END;
$$ LANGUAGE plpgsql;
```

### Materialized Views for Analytics
```sql
-- Pre-calculate daily coaching metrics
CREATE MATERIALIZED VIEW daily_coaching_metrics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  AVG(tokens_used) as avg_tokens,
  AVG(processing_time_ms) as avg_processing_time,
  COUNT(DISTINCT conversation_id) as active_conversations,
  SUM(CASE WHEN user_feedback = 'helpful' THEN 1 ELSE 0 END) as helpful_responses
FROM coach_messages
WHERE role = 'assistant'
GROUP BY DATE(created_at);

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_coaching_metrics;
```

## Row Level Security

```sql
-- Users can only access their own coach data
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY coach_conversations_policy ON coach_conversations
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE coach_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY coach_memory_policy ON coach_memory
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE buddy_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY buddy_decisions_policy ON buddy_decisions
FOR ALL TO authenticated
USING (user_id = auth.uid());
```