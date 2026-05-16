# Human Coach Module - Database Schema

Das Human Coach Module benötigt ein komplexes Schema zur Verwaltung von Coach-Client-Beziehungen, Alert-System, Regel-Engine und Analytics.

## 🗄️ Tables Overview

```sql
-- Coach-Client Relationships
coach_profiles
coach_clients
coach_client_assignments

-- Alert Management System
coach_alerts
coach_alert_settings
coach_alert_history

-- Rule Engine
coach_rules
coach_rule_conditions
coach_rule_actions
coach_rule_triggers
coach_rule_templates

-- Autonomy Management
client_autonomy_levels
client_autonomy_history
autonomy_assessments

-- Adherence Analytics
client_adherence_summary
adherence_trend_analysis
adherence_predictions

-- Dashboard & Performance
coach_dashboard_cache
coach_performance_metrics
coach_activity_log
```

## 👥 Coach-Client Relationship Tables

### `coach_profiles`

Erweiterte Informationen über Human Coaches.

```sql
CREATE TABLE coach_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Professional Information
  display_name VARCHAR(200) NOT NULL,
  title VARCHAR(100),                          -- "Senior Coach", "Head of Nutrition", etc.
  bio TEXT,
  avatar VARCHAR(500),                         -- Profile image URL
  
  -- Credentials & Specializations
  certifications VARCHAR[],                    -- ["NASM-CPT", "ISSN", "Precision Nutrition"]
  specializations VARCHAR[],                   -- ["weight_loss", "strength", "nutrition"]
  years_experience INTEGER,
  
  -- Contact & Availability
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Coach Settings
  role coach_role NOT NULL DEFAULT 'coach',
  max_clients INTEGER DEFAULT 50,
  current_client_count INTEGER DEFAULT 0,
  
  -- Working Hours (JSON format for flexibility)
  working_hours JSONB DEFAULT '{}',           -- {"monday": {"start": "09:00", "end": "17:00"}}
  notification_preferences JSONB DEFAULT '{}', -- Email, SMS, Slack settings
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_accepting_clients BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach role enum
CREATE TYPE coach_role AS ENUM (
  'trainee_coach',    -- Limited permissions, supervised
  'coach',           -- Standard coaching permissions
  'senior_coach',    -- Advanced features, team oversight
  'head_coach'       -- Full admin access
);

-- Indexes for coach management
CREATE INDEX idx_coach_profiles_user ON coach_profiles(user_id);
CREATE INDEX idx_coach_profiles_active ON coach_profiles(is_active, is_accepting_clients);
CREATE INDEX idx_coach_profiles_specialization ON coach_profiles USING GIN (specializations);
CREATE INDEX idx_coach_profiles_role ON coach_profiles(role, is_active);
```

### `coach_clients`

Mapping zwischen Coaches und ihren Clients.

```sql
CREATE TABLE coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Assignment Details
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES coach_profiles(id),    -- Who made the assignment
  assignment_type VARCHAR(50) DEFAULT 'primary',      -- 'primary', 'secondary', 'temporary'
  
  -- Client Status
  is_active BOOLEAN DEFAULT true,
  paused_at TIMESTAMP WITH TIME ZONE,
  paused_reason TEXT,
  
  -- Coach-Client Relationship
  coaching_style VARCHAR(50),                         -- 'hands_on', 'collaborative', 'consultative'
  communication_frequency VARCHAR(50),                -- 'daily', 'weekly', 'bi_weekly', 'monthly'
  last_contact_at TIMESTAMP WITH TIME ZONE,
  
  -- Contract & Billing
  start_date DATE NOT NULL,
  end_date DATE,
  billing_cycle VARCHAR(20),                          -- 'monthly', 'quarterly', 'yearly'
  hourly_rate DECIMAL(10,2),
  
  -- Client-Specific Settings
  autonomy_level INTEGER DEFAULT 2 CHECK (autonomy_level BETWEEN 1 AND 5),
  intervention_threshold VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  alert_preferences JSONB DEFAULT '{}',
  
  -- Notes & Tags
  coach_notes TEXT,
  tags VARCHAR[],                                     -- ['high_maintenance', 'motivated', 'athlete']
  
  -- Performance Tracking
  satisfaction_rating DECIMAL(3,2),                   -- Client's rating of coach (1-5)
  goal_completion_rate DECIMAL(3,2),                  -- % of goals achieved
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(coach_id, client_id, assignment_type)
);

-- Indexes for client management
CREATE INDEX idx_coach_clients_coach ON coach_clients(coach_id, is_active);
CREATE INDEX idx_coach_clients_client ON coach_clients(client_id, is_active);
CREATE INDEX idx_coach_clients_active ON coach_clients(is_active, assigned_at DESC);
CREATE INDEX idx_coach_clients_tags ON coach_clients USING GIN (tags);
CREATE INDEX idx_coach_clients_autonomy ON coach_clients(autonomy_level, is_active);
```

## 🚨 Alert System Tables

### `coach_alerts`

Zentrale Alert-Verwaltung für Human Coaches.

```sql
CREATE TABLE coach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Alert Classification
  type VARCHAR(50) NOT NULL,                          -- 'adherence_drop', 'recovery_issues', etc.
  category VARCHAR(50),                               -- 'nutrition', 'training', 'recovery', 'general'
  priority INTEGER CHECK (priority BETWEEN 1 AND 5), -- 1=Critical, 5=Info
  severity VARCHAR(20),                               -- 'critical', 'high', 'medium', 'low', 'info'
  
  -- Alert Content
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  context TEXT,                                       -- Additional background information
  
  -- Supporting Data
  trigger_data JSONB,                                -- Data that triggered the alert
  client_snapshot JSONB,                             -- Client state at time of alert
  recommended_actions VARCHAR[],                      -- Suggested next steps
  
  -- Rule Association
  rule_id UUID REFERENCES coach_rules(id) ON DELETE SET NULL,
  rule_name VARCHAR(200),                            -- Cached rule name for history
  
  -- Alert Lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES coach_profiles(id),
  coach_note TEXT,                                   -- Coach's note when acknowledging
  dismissed_at TIMESTAMP WITH TIME ZONE,
  dismissed_by UUID REFERENCES coach_profiles(id),
  dismissal_reason VARCHAR(100),
  
  -- Auto-expiry
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  
  -- Alert Effectiveness Tracking
  action_taken BOOLEAN DEFAULT false,
  action_type VARCHAR(50),                           -- 'call', 'message', 'plan_adjustment'
  action_timestamp TIMESTAMP WITH TIME ZONE,
  outcome VARCHAR(50),                               -- 'resolved', 'escalated', 'no_response'
  
  -- Metrics
  false_positive BOOLEAN,                            -- Coach marked as false positive
  confidence DECIMAL(3,2),                           -- Algorithm confidence (0-1)
  response_time_hours INTEGER,                       -- Time from creation to acknowledgment
  
  -- Constraints
  CHECK (read_at IS NULL OR read_at >= created_at),
  CHECK (acknowledged_at IS NULL OR acknowledged_at >= COALESCE(read_at, created_at)),
  CHECK (dismissed_at IS NULL OR dismissed_at >= created_at)
);

-- Indexes for alert management
CREATE INDEX idx_coach_alerts_coach_active ON coach_alerts(coach_id, dismissed_at) WHERE dismissed_at IS NULL;
CREATE INDEX idx_coach_alerts_priority ON coach_alerts(coach_id, priority, created_at DESC);
CREATE INDEX idx_coach_alerts_client ON coach_alerts(client_id, created_at DESC);
CREATE INDEX idx_coach_alerts_type_category ON coach_alerts(type, category);
CREATE INDEX idx_coach_alerts_unread ON coach_alerts(coach_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_coach_alerts_expires ON coach_alerts(expires_at) WHERE dismissed_at IS NULL;
```

### `coach_alert_settings`

Coach-spezifische Alert-Einstellungen und Präferenzen.

```sql
CREATE TABLE coach_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification Channels
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  slack_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Channel-specific Settings
  email_address VARCHAR(320),
  sms_number VARCHAR(20),
  slack_webhook VARCHAR(500),
  slack_channel VARCHAR(100),
  
  -- Alert Filtering
  min_priority INTEGER DEFAULT 3,                    -- Only alerts >= this priority
  max_alerts_per_hour INTEGER DEFAULT 10,           -- Rate limiting
  batch_notifications BOOLEAN DEFAULT false,         -- Group alerts into batches
  batch_interval_minutes INTEGER DEFAULT 60,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT true,
  quiet_start TIME DEFAULT '22:00',
  quiet_end TIME DEFAULT '07:00',
  quiet_timezone VARCHAR(50),
  weekend_quiet BOOLEAN DEFAULT false,
  
  -- Alert Type Preferences
  alert_type_preferences JSONB DEFAULT '{}',        -- Per-type notification settings
  
  -- Smart Filtering
  auto_dismiss_low_confidence BOOLEAN DEFAULT false,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.70,
  duplicate_suppression_minutes INTEGER DEFAULT 60,
  
  -- Escalation Rules
  escalation_enabled BOOLEAN DEFAULT false,
  escalate_after_hours INTEGER DEFAULT 24,
  escalate_to UUID REFERENCES coach_profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ⚙️ Rule Engine Tables

### `coach_rules`

Konfigurierbare Regeln für automatische Alert-Generierung.

```sql
CREATE TABLE coach_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  
  -- Rule Identity
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),                              -- 'nutrition', 'training', 'recovery', 'general'
  
  -- Rule Logic
  logic_operator VARCHAR(10) DEFAULT 'AND',         -- 'AND', 'OR'
  conditions JSONB NOT NULL,                         -- Complex condition definitions
  actions JSONB NOT NULL,                           -- Actions to take when triggered
  
  -- Rule Status
  is_enabled BOOLEAN DEFAULT true,
  is_system_rule BOOLEAN DEFAULT false,             -- System-created vs user-created
  
  -- Client Filtering
  applies_to_all_clients BOOLEAN DEFAULT true,
  client_filter JSONB,                             -- Specific clients or criteria
  
  -- Timing & Throttling
  cooldown_minutes INTEGER DEFAULT 60,              -- Min time between triggers
  max_triggers_per_day INTEGER DEFAULT 5,
  
  -- Rule Performance
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  false_positive_count INTEGER DEFAULT 0,
  effectiveness_score DECIMAL(3,2),                 -- ML-calculated effectiveness
  
  -- Version Control
  version INTEGER DEFAULT 1,
  created_from_template UUID,                       -- Reference to template if applicable
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CHECK (logic_operator IN ('AND', 'OR')),
  CHECK (effectiveness_score IS NULL OR effectiveness_score BETWEEN 0 AND 1)
);

-- Indexes for rule processing
CREATE INDEX idx_coach_rules_coach_enabled ON coach_rules(coach_id, is_enabled);
CREATE INDEX idx_coach_rules_category ON coach_rules(category, is_enabled);
CREATE INDEX idx_coach_rules_execution ON coach_rules(last_executed_at) WHERE is_enabled = true;
CREATE INDEX idx_coach_rules_performance ON coach_rules(effectiveness_score DESC, trigger_count DESC);
```

### `coach_rule_templates`

Vordefinierte Regel-Templates für einfache Regel-Erstellung.

```sql
CREATE TABLE coach_rule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Identity
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'beginner',         -- 'beginner', 'intermediate', 'advanced'
  
  -- Template Definition
  conditions_template JSONB NOT NULL,               -- Condition template with parameters
  actions_template JSONB NOT NULL,                  -- Action template with parameters
  default_parameters JSONB DEFAULT '{}',            -- Default parameter values
  
  -- Customization
  customizable_parameters JSONB DEFAULT '[]',       -- Which parameters can be customized
  validation_rules JSONB DEFAULT '{}',              -- Parameter validation rules
  
  -- Metadata
  author VARCHAR(100),
  version VARCHAR(20) DEFAULT '1.0',
  tags VARCHAR[],
  use_case_description TEXT,
  
  -- Usage Statistics
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2),
  avg_effectiveness DECIMAL(3,2),
  
  -- Template Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for template discovery
CREATE INDEX idx_coach_rule_templates_category ON coach_rule_templates(category, is_active);
CREATE INDEX idx_coach_rule_templates_difficulty ON coach_rule_templates(difficulty, is_active);
CREATE INDEX idx_coach_rule_templates_featured ON coach_rule_templates(is_featured, usage_count DESC);
CREATE INDEX idx_coach_rule_templates_tags ON coach_rule_templates USING GIN (tags);
```

## 🎯 Autonomy Management Tables

### `client_autonomy_levels`

Aktuelle Autonomie-Level der Clients.

```sql
CREATE TABLE client_autonomy_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  
  -- Current Autonomy Status
  current_level INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
  level_name VARCHAR(50) NOT NULL,                   -- 'Novice', 'Beginner', etc.
  
  -- Assessment Scores (0-1 scale)
  consistency_score DECIMAL(3,2),
  knowledge_score DECIMAL(3,2),
  self_correction_score DECIMAL(3,2),
  communication_score DECIMAL(3,2),
  overall_score DECIMAL(3,2),
  
  -- Coaching Configuration
  check_in_frequency VARCHAR(20),                    -- 'daily', 'weekly', 'bi_weekly', 'monthly'
  intervention_threshold VARCHAR(20),                -- 'any_deviation', 'significant_trends', 'safety_only'
  plan_flexibility VARCHAR(20),                      -- 'strict', 'guided', 'flexible', 'autonomous'
  
  -- Level Management
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES coach_profiles(id),
  assignment_reason TEXT,
  next_assessment_date DATE,
  
  -- Performance Tracking
  time_at_current_level INTERVAL,
  progression_rate DECIMAL(3,2),                     -- Rate of improvement
  regression_risk DECIMAL(3,2),                      -- Risk of needing lower level
  
  -- Constraints
  UNIQUE(client_id, coach_id),
  CHECK (overall_score IS NULL OR overall_score BETWEEN 0 AND 1)
);

-- Indexes for autonomy management
CREATE INDEX idx_client_autonomy_client ON client_autonomy_levels(client_id);
CREATE INDEX idx_client_autonomy_coach ON client_autonomy_levels(coach_id, current_level);
CREATE INDEX idx_client_autonomy_assessment ON client_autonomy_levels(next_assessment_date) WHERE next_assessment_date IS NOT NULL;
CREATE INDEX idx_client_autonomy_level_distribution ON client_autonomy_levels(current_level, assigned_at);
```

### `client_autonomy_history`

Historische Autonomie-Level-Änderungen für Trend-Analyse.

```sql
CREATE TABLE client_autonomy_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  
  -- Level Change Details
  previous_level INTEGER,
  new_level INTEGER NOT NULL CHECK (new_level BETWEEN 1 AND 5),
  change_type VARCHAR(20) NOT NULL,                  -- 'promotion', 'demotion', 'lateral', 'initial'
  
  -- Assessment Data at Time of Change
  assessment_scores JSONB,                          -- Snapshot of all scores
  change_reasoning TEXT,
  supporting_evidence TEXT,
  
  -- Change Context
  changed_by UUID REFERENCES coach_profiles(id),
  change_trigger VARCHAR(50),                       -- 'scheduled_review', 'performance_based', 'manual'
  
  -- Outcome Tracking
  adaptation_period_days INTEGER,                   -- How long to adapt to new level
  success_indicators JSONB,                        -- Metrics showing successful adaptation
  
  -- Timestamps
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (change_type IN ('promotion', 'demotion', 'lateral', 'initial'))
);

-- Indexes for autonomy analytics
CREATE INDEX idx_autonomy_history_client ON client_autonomy_history(client_id, changed_at DESC);
CREATE INDEX idx_autonomy_history_coach ON client_autonomy_history(coach_id, changed_at DESC);
CREATE INDEX idx_autonomy_history_changes ON client_autonomy_history(change_type, new_level);
```

## 📈 Adherence Analytics Tables

### `client_adherence_summary`

Tägliche Adherence-Zusammenfassungen für Analytics.

```sql
CREATE TABLE client_adherence_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Overall Adherence
  overall_adherence DECIMAL(4,3) CHECK (overall_adherence BETWEEN 0 AND 1),
  weighted_adherence DECIMAL(4,3) CHECK (weighted_adherence BETWEEN 0 AND 1),
  
  -- Dimension-Specific Adherence
  nutrition_adherence DECIMAL(4,3),
  training_adherence DECIMAL(4,3),
  recovery_adherence DECIMAL(4,3),
  supplement_adherence DECIMAL(4,3),
  
  -- Sub-Dimension Breakdown (JSONB for flexibility)
  nutrition_breakdown JSONB,                        -- calories, macros, timing, quality
  training_breakdown JSONB,                         -- frequency, intensity, volume, progression
  recovery_breakdown JSONB,                         -- sleep, check-ins, modalities
  supplement_breakdown JSONB,                       -- timing, dosage, consistency
  
  -- Contextual Factors
  external_factors JSONB,                          -- travel, stress, illness, etc.
  goal_alignment DECIMAL(4,3),                     -- How well actions align with goals
  motivation_score INTEGER CHECK (motivation_score BETWEEN 1 AND 10),
  
  -- Data Quality Indicators
  data_completeness DECIMAL(4,3),                  -- How much expected data was logged
  confidence_score DECIMAL(4,3),                   -- Confidence in adherence calculation
  
  -- Trends (calculated from recent history)
  trend_direction VARCHAR(20),                      -- 'improving', 'declining', 'stable'
  trend_strength DECIMAL(4,3),                     -- How strong the trend is
  volatility DECIMAL(4,3),                         -- How much adherence varies day-to-day
  
  -- Generated Insights
  insights JSONB,                                  -- AI-generated insights for the day
  recommendations JSONB,                           -- Specific recommendations
  
  -- Computation Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_version VARCHAR(10) DEFAULT '1.0',
  
  -- Constraints
  UNIQUE(client_id, date)
);

-- Indexes for adherence analysis
CREATE INDEX idx_adherence_summary_client_date ON client_adherence_summary(client_id, date DESC);
CREATE INDEX idx_adherence_summary_coach ON client_adherence_summary(coach_id, date DESC);
CREATE INDEX idx_adherence_summary_overall ON client_adherence_summary(overall_adherence, date DESC);
CREATE INDEX idx_adherence_summary_trends ON client_adherence_summary(trend_direction, trend_strength DESC);
```

### `adherence_predictions`

ML-basierte Adherence-Vorhersagen für proaktives Coaching.

```sql
CREATE TABLE adherence_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  
  -- Prediction Details
  prediction_date DATE NOT NULL,                    -- Date the prediction was made
  target_date DATE NOT NULL,                       -- Date being predicted
  prediction_horizon INTEGER,                      -- Days into future (target - prediction)
  
  -- Predicted Values
  predicted_overall_adherence DECIMAL(4,3),
  predicted_nutrition DECIMAL(4,3),
  predicted_training DECIMAL(4,3),
  predicted_recovery DECIMAL(4,3),
  predicted_supplements DECIMAL(4,3),
  
  -- Confidence & Risk Assessment
  confidence DECIMAL(4,3),                         -- Model confidence (0-1)
  risk_level VARCHAR(20),                          -- 'low', 'medium', 'high', 'critical'
  risk_factors JSONB,                             -- Identified risk factors
  
  -- Supporting Data
  historical_pattern JSONB,                       -- Pattern used for prediction
  external_factors JSONB,                         -- Known factors affecting prediction
  model_features JSONB,                           -- Features used by ML model
  
  -- Model Information
  model_name VARCHAR(100),
  model_version VARCHAR(20),
  algorithm VARCHAR(50),                          -- 'linear_regression', 'random_forest', etc.
  
  -- Intervention Recommendations
  recommended_interventions JSONB,                -- Suggested preventive actions
  intervention_timing JSONB,                      -- When to implement interventions
  expected_impact JSONB,                          -- Expected impact of interventions
  
  -- Validation (filled in retrospectively)
  actual_adherence DECIMAL(4,3),                  -- Actual adherence when available
  prediction_error DECIMAL(4,3),                  -- |predicted - actual|
  accuracy_bucket VARCHAR(20),                    -- 'excellent', 'good', 'fair', 'poor'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CHECK (prediction_horizon > 0),
  CHECK (confidence BETWEEN 0 AND 1),
  UNIQUE(client_id, prediction_date, target_date)
);

-- Indexes for predictions
CREATE INDEX idx_adherence_predictions_client ON adherence_predictions(client_id, prediction_date DESC);
CREATE INDEX idx_adherence_predictions_target ON adherence_predictions(target_date, risk_level);
CREATE INDEX idx_adherence_predictions_validation ON adherence_predictions(validated_at) WHERE actual_adherence IS NOT NULL;
CREATE INDEX idx_adherence_predictions_accuracy ON adherence_predictions(accuracy_bucket, model_name);
```

## 🏆 Performance & Analytics Tables

### `coach_performance_metrics`

Coach-Performance-Tracking für KPIs und Benchmarking.

```sql
CREATE TABLE coach_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  
  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL,                 -- 'weekly', 'monthly', 'quarterly'
  
  -- Client Metrics
  total_clients INTEGER,
  active_clients INTEGER,
  new_clients INTEGER,
  churned_clients INTEGER,
  client_retention_rate DECIMAL(4,3),
  
  -- Engagement Metrics
  avg_response_time_hours DECIMAL(6,2),
  messages_sent INTEGER,
  calls_completed INTEGER,
  plan_adjustments INTEGER,
  
  -- Goal Achievement
  total_goals_set INTEGER,
  goals_achieved INTEGER,
  goals_on_track INTEGER,
  goal_completion_rate DECIMAL(4,3),
  
  -- Adherence Impact
  avg_client_adherence_start DECIMAL(4,3),         -- Adherence when client started
  avg_client_adherence_current DECIMAL(4,3),       -- Current average adherence
  adherence_improvement DECIMAL(4,3),               -- Improvement achieved
  
  -- Alert Management
  alerts_generated INTEGER,
  alerts_acknowledged INTEGER,
  avg_alert_response_time_hours DECIMAL(6,2),
  false_positive_rate DECIMAL(4,3),
  
  -- Client Satisfaction
  satisfaction_responses INTEGER,
  avg_satisfaction_rating DECIMAL(3,2),
  nps_score INTEGER,                                -- Net Promoter Score
  
  -- Business Metrics
  revenue_generated DECIMAL(12,2),
  avg_revenue_per_client DECIMAL(10,2),
  client_lifetime_value DECIMAL(10,2),
  
  -- Autonomy Progression
  clients_promoted INTEGER,                         -- Clients moved to higher autonomy
  clients_demoted INTEGER,                          -- Clients moved to lower autonomy
  avg_autonomy_level DECIMAL(3,2),
  
  -- Efficiency Indicators
  hours_logged DECIMAL(6,2),
  clients_per_hour DECIMAL(4,2),
  revenue_per_hour DECIMAL(8,2),
  
  -- Quality Indicators
  plan_adherence_rate DECIMAL(4,3),               -- How well clients follow plans
  intervention_success_rate DECIMAL(4,3),          -- Success rate of interventions
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (period_start <= period_end),
  UNIQUE(coach_id, period_start, period_end, period_type)
);

-- Indexes for performance analytics
CREATE INDEX idx_coach_performance_coach_period ON coach_performance_metrics(coach_id, period_end DESC);
CREATE INDEX idx_coach_performance_type ON coach_performance_metrics(period_type, period_end DESC);
CREATE INDEX idx_coach_performance_retention ON coach_performance_metrics(client_retention_rate DESC, period_end);
CREATE INDEX idx_coach_performance_satisfaction ON coach_performance_metrics(avg_satisfaction_rating DESC, period_end);
```

## 🔍 Analytics Views

### Coach Dashboard Summary View
```sql
CREATE VIEW coach_dashboard_summary AS
SELECT 
  cp.id as coach_id,
  cp.display_name,
  
  -- Client counts
  COUNT(cc.*) as total_clients,
  COUNT(cc.*) FILTER (WHERE cc.is_active = true) as active_clients,
  COUNT(cc.*) FILTER (WHERE cc.assigned_at >= CURRENT_DATE - INTERVAL '7 days') as new_clients_week,
  
  -- Alert summary
  COUNT(ca.*) FILTER (WHERE ca.dismissed_at IS NULL AND ca.priority <= 2) as critical_high_alerts,
  COUNT(ca.*) FILTER (WHERE ca.read_at IS NULL) as unread_alerts,
  
  -- Performance indicators
  AVG(cc.satisfaction_rating) as avg_satisfaction,
  AVG(cal.overall_score) as avg_autonomy_score,
  AVG(cas.overall_adherence) as avg_adherence_week,
  
  -- Activity indicators
  COUNT(DISTINCT cas.date) FILTER (WHERE cas.date >= CURRENT_DATE - INTERVAL '7 days') as active_days_week,
  MAX(cp.last_active_at) as last_active
  
FROM coach_profiles cp
LEFT JOIN coach_clients cc ON cp.id = cc.coach_id
LEFT JOIN coach_alerts ca ON cp.id = ca.coach_id
LEFT JOIN client_autonomy_levels cal ON cp.id = cal.coach_id
LEFT JOIN client_adherence_summary cas ON cp.id = cas.coach_id AND cas.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE cp.is_active = true
GROUP BY cp.id, cp.display_name;
```

### Client Risk Assessment View
```sql
CREATE VIEW client_risk_assessment AS
WITH recent_adherence AS (
  SELECT 
    client_id,
    AVG(overall_adherence) as avg_adherence_7d,
    MIN(overall_adherence) as min_adherence_7d,
    STDDEV(overall_adherence) as adherence_volatility
  FROM client_adherence_summary
  WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY client_id
),
alert_counts AS (
  SELECT 
    client_id,
    COUNT(*) FILTER (WHERE priority <= 2 AND created_at >= CURRENT_DATE - INTERVAL '7 days') as high_priority_alerts,
    COUNT(*) FILTER (WHERE dismissed_at IS NULL) as open_alerts
  FROM coach_alerts
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY client_id
)
SELECT 
  cc.client_id,
  cc.coach_id,
  u.display_name as client_name,
  cal.current_level as autonomy_level,
  
  -- Risk factors
  ra.avg_adherence_7d,
  ra.min_adherence_7d,
  ra.adherence_volatility,
  ac.high_priority_alerts,
  ac.open_alerts,
  
  -- Risk calculation
  CASE 
    WHEN ra.avg_adherence_7d < 0.5 OR ac.high_priority_alerts >= 3 THEN 'critical'
    WHEN ra.avg_adherence_7d < 0.7 OR ac.high_priority_alerts >= 2 OR ra.adherence_volatility > 0.3 THEN 'high'
    WHEN ra.avg_adherence_7d < 0.8 OR ac.high_priority_alerts >= 1 THEN 'medium'
    ELSE 'low'
  END as risk_level,
  
  -- Recommendations
  CASE 
    WHEN ra.avg_adherence_7d < 0.5 THEN 'Immediate intervention required'
    WHEN ac.high_priority_alerts >= 2 THEN 'Address outstanding alerts'
    WHEN ra.adherence_volatility > 0.3 THEN 'Focus on consistency'
    ELSE 'Monitor regularly'
  END as recommendation

FROM coach_clients cc
JOIN users u ON cc.client_id = u.id
LEFT JOIN client_autonomy_levels cal ON cc.client_id = cal.client_id
LEFT JOIN recent_adherence ra ON cc.client_id = ra.client_id
LEFT JOIN alert_counts ac ON cc.client_id = ac.client_id
WHERE cc.is_active = true;
```

## 🧹 Maintenance Procedures

### Daily Cleanup Tasks
```sql
-- Clean up expired alerts
DELETE FROM coach_alerts 
WHERE expires_at < CURRENT_DATE - INTERVAL '7 days'
AND dismissed_at IS NULL;

-- Archive old performance metrics (keep last 2 years)
DELETE FROM coach_performance_metrics 
WHERE period_end < CURRENT_DATE - INTERVAL '2 years';

-- Update coach client counts
UPDATE coach_profiles 
SET current_client_count = (
  SELECT COUNT(*) FROM coach_clients 
  WHERE coach_id = coach_profiles.id AND is_active = true
);
```

### Weekly Maintenance
```sql
-- Recalculate coach effectiveness scores
UPDATE coach_rules 
SET effectiveness_score = (
  SELECT 
    CASE 
      WHEN trigger_count = 0 THEN NULL
      ELSE (trigger_count - false_positive_count)::decimal / trigger_count
    END
  FROM coach_alerts 
  WHERE rule_id = coach_rules.id
);

-- Update adherence trend analysis
INSERT INTO adherence_trend_analysis (client_id, analysis_date, trend_data)
SELECT 
  client_id,
  CURRENT_DATE,
  jsonb_build_object(
    'weekly_avg', AVG(overall_adherence),
    'trend_slope', regr_slope(overall_adherence, extract(epoch from date)),
    'volatility', STDDEV(overall_adherence)
  )
FROM client_adherence_summary
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY client_id
ON CONFLICT (client_id, analysis_date) DO UPDATE SET
  trend_data = EXCLUDED.trend_data,
  updated_at = NOW();
```

### Performance Optimization
```sql
-- Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW coach_dashboard_cache AS
SELECT 
  coach_id,
  jsonb_build_object(
    'summary', (SELECT row_to_json(s) FROM coach_dashboard_summary s WHERE s.coach_id = cp.id),
    'alerts', (SELECT array_agg(row_to_json(a)) FROM coach_alerts a WHERE a.coach_id = cp.id AND a.dismissed_at IS NULL),
    'top_clients', (SELECT array_agg(row_to_json(c)) FROM client_risk_assessment c WHERE c.coach_id = cp.id ORDER BY risk_level DESC LIMIT 5)
  ) as cached_data,
  NOW() as cached_at
FROM coach_profiles cp
WHERE cp.is_active = true;

-- Refresh cache every 5 minutes
CREATE OR REPLACE FUNCTION refresh_coach_dashboard_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY coach_dashboard_cache;
END;
$$ LANGUAGE plpgsql;
```