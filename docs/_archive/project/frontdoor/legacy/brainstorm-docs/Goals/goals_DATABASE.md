# Goals Database Schema

## Core Goal Management Tables

### body_goals
Central goal definition and tracking table for all body composition objectives.

```sql
CREATE TABLE body_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal classification
  goal_type VARCHAR(50) NOT NULL, -- weight, body_fat, muscle_mass, circumference, visual, performance
  target_metric VARCHAR(100), -- Specific metric for circumference goals (e.g., 'waist_cm', 'bicep_left_cm')
  
  -- Goal targets and current status
  target_value NUMERIC(8,3) NOT NULL,
  target_unit VARCHAR(20),
  current_value NUMERIC(8,3),
  baseline_value NUMERIC(8,3), -- Starting value when goal was created
  
  -- Timeline and scheduling
  start_date DATE DEFAULT CURRENT_DATE,
  deadline DATE,
  target_timeline_weeks INTEGER, -- Preferred timeline in weeks
  
  -- Goal priority and importance
  priority INTEGER DEFAULT 5, -- 1-10 priority scale
  importance_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  is_primary_goal BOOLEAN DEFAULT false, -- Only one primary goal allowed per user
  
  -- Progress tracking
  progress_percentage NUMERIC(5,2) DEFAULT 0, -- 0-100% completion
  last_measurement_date DATE,
  last_progress_update TIMESTAMPTZ,
  
  -- Goal status and lifecycle
  status VARCHAR(20) DEFAULT 'active', -- active, paused, achieved, abandoned, on_hold
  achievement_date DATE,
  achievement_notes TEXT,
  
  -- Motivation and context
  motivation_reason TEXT, -- Why this goal matters to the user
  reward_planned TEXT, -- What user will do/get when goal is achieved
  accountability_method TEXT, -- How user plans to stay accountable
  
  -- Difficulty and realism assessment
  difficulty_level VARCHAR(20), -- easy, moderate, challenging, aggressive, unrealistic
  realism_score NUMERIC(3,2), -- 0-1 how realistic the goal is based on user profile
  confidence_level NUMERIC(3,2), -- 0-1 user's confidence in achieving goal
  
  -- Historical tracking
  previous_attempts INTEGER DEFAULT 0, -- How many times user has tried this goal type
  best_previous_result NUMERIC(8,3), -- Best previous achievement in this category
  
  -- Integration and automation
  auto_update_from_measurements BOOLEAN DEFAULT true,
  celebration_enabled BOOLEAN DEFAULT true,
  milestone_notifications BOOLEAN DEFAULT true,
  
  -- AI and optimization
  ai_optimized BOOLEAN DEFAULT false, -- Whether AI has optimized this goal
  optimization_version INTEGER DEFAULT 1,
  last_ai_review TIMESTAMPTZ,
  ai_confidence NUMERIC(3,2), -- AI confidence in goal achievability
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 10),
  CONSTRAINT valid_scores CHECK (
    (realism_score IS NULL OR (realism_score >= 0 AND realism_score <= 1)) AND
    (confidence_level IS NULL OR (confidence_level >= 0 AND confidence_level <= 1)) AND
    (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1))
  ),
  CONSTRAINT valid_timeline CHECK (
    deadline IS NULL OR 
    target_timeline_weeks IS NULL OR 
    deadline >= start_date + (target_timeline_weeks || ' weeks')::INTERVAL
  )
);
```

**Indexes:**
- `idx_body_goals_user_status` on `(user_id, status)`
- `idx_body_goals_user_primary` on `user_id` WHERE `is_primary_goal = true`
- `idx_body_goals_type_status` on `(goal_type, status)`
- `idx_body_goals_deadline` on `deadline` WHERE `status = 'active'`
- `idx_body_goals_priority` on `priority DESC`

### goal_milestones
Milestone tracking for incremental goal achievement celebration.

```sql
CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES body_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Milestone definition
  milestone_type VARCHAR(30) NOT NULL, -- percentage, absolute_value, time_based, behavioral
  milestone_name VARCHAR(200),
  milestone_description TEXT,
  
  -- Milestone criteria
  percentage_threshold NUMERIC(5,2), -- For percentage-based milestones (0-100)
  absolute_value NUMERIC(8,3), -- For value-based milestones
  target_date DATE, -- For time-based milestones
  behavioral_criteria TEXT, -- For habit/behavior milestones
  
  -- Achievement tracking
  is_achieved BOOLEAN DEFAULT false,
  achieved_date TIMESTAMPTZ,
  achieved_value NUMERIC(8,3), -- Value when milestone was achieved
  
  -- Celebration and rewards
  celebration_message TEXT,
  reward_earned TEXT,
  shared_publicly BOOLEAN DEFAULT false,
  celebration_completed BOOLEAN DEFAULT false,
  
  -- Milestone importance
  importance_score INTEGER DEFAULT 5, -- 1-10 how important this milestone is
  motivation_boost INTEGER DEFAULT 5, -- 1-10 how motivating achieving this is
  
  -- Automation
  auto_generated BOOLEAN DEFAULT false, -- System-generated vs. user-defined
  notification_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_percentage CHECK (
    percentage_threshold IS NULL OR 
    (percentage_threshold >= 0 AND percentage_threshold <= 100)
  ),
  CONSTRAINT valid_importance CHECK (
    importance_score >= 1 AND importance_score <= 10 AND
    motivation_boost >= 1 AND motivation_boost <= 10
  )
);
```

**Indexes:**
- `idx_goal_milestones_goal` on `goal_id`
- `idx_goal_milestones_user_achieved` on `(user_id, is_achieved)`
- `idx_goal_milestones_target_date` on `target_date` WHERE `target_date IS NOT NULL`

## Body Measurement Tables

### body_measurements
Comprehensive body composition measurements supporting all goal types.

```sql
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Measurement timing
  measurement_date DATE NOT NULL,
  measurement_time TIME,
  measurement_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Basic body metrics
  weight_kg NUMERIC(6,3),
  height_cm NUMERIC(6,2),
  
  -- Body composition (requires specialized equipment)
  body_fat_pct NUMERIC(5,2),
  muscle_mass_kg NUMERIC(6,3),
  lean_mass_kg NUMERIC(6,3),
  bone_mass_kg NUMERIC(5,3),
  water_pct NUMERIC(5,2),
  visceral_fat_rating INTEGER,
  
  -- Advanced metrics
  metabolic_age INTEGER,
  basal_metabolic_rate INTEGER,
  muscle_quality_score NUMERIC(5,2),
  
  -- Measurement method and conditions
  measurement_method VARCHAR(50), -- bioelectrical_impedance, dexa_scan, bodpod, hydrostatic, calipers, visual_estimate
  measurement_device VARCHAR(100), -- Specific device/brand used
  measurement_location VARCHAR(100), -- Home, gym, clinic, etc.
  
  -- Measurement conditions
  time_since_eating_hours NUMERIC(4,2), -- Hours since last meal
  time_since_exercise_hours NUMERIC(4,2), -- Hours since last workout
  hydration_status VARCHAR(20), -- well_hydrated, dehydrated, over_hydrated, unknown
  clothing_worn VARCHAR(50), -- minimal, workout_clothes, normal_clothes
  bathroom_before BOOLEAN, -- Whether user used bathroom before measurement
  
  -- Data quality and validation
  measurement_confidence INTEGER DEFAULT 5, -- 1-10 confidence in accuracy
  outlier_flag BOOLEAN DEFAULT false, -- Flagged as statistical outlier
  validated_by_user BOOLEAN DEFAULT false, -- User confirmed accuracy
  data_source VARCHAR(30) DEFAULT 'manual', -- manual, device_sync, api_import
  
  -- User context
  user_notes TEXT,
  feeling_rating INTEGER, -- 1-10 how user felt during measurement
  stress_level INTEGER, -- 1-10 stress level at time of measurement
  sleep_quality_previous NUMERIC(3,1), -- Sleep quality night before (1-10)
  
  -- Photo documentation
  progress_photo_urls TEXT[], -- URLs to progress photos taken same day
  measurement_photo_url TEXT, -- Photo of measurement device/reading
  
  -- Goal correlation
  related_goals UUID[], -- Goals this measurement applies to
  goal_progress_impact JSONB, -- How this measurement affects goal progress
  
  -- Menstrual cycle context (for female users)
  cycle_day INTEGER, -- Day of menstrual cycle
  cycle_phase VARCHAR(20), -- follicular, ovulatory, luteal, menstrual
  
  -- Integration metadata
  synced_from_device BOOLEAN DEFAULT false,
  device_sync_id VARCHAR(100), -- ID from synced device
  import_source VARCHAR(50), -- Which app/service imported this
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_percentages CHECK (
    (body_fat_pct IS NULL OR (body_fat_pct >= 3 AND body_fat_pct <= 60)) AND
    (water_pct IS NULL OR (water_pct >= 30 AND water_pct <= 80))
  ),
  CONSTRAINT valid_ratings CHECK (
    (measurement_confidence >= 1 AND measurement_confidence <= 10) AND
    (feeling_rating IS NULL OR (feeling_rating >= 1 AND feeling_rating <= 10)) AND
    (stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 10))
  ),
  CONSTRAINT valid_mass_relationships CHECK (
    (weight_kg IS NULL OR muscle_mass_kg IS NULL OR muscle_mass_kg <= weight_kg) AND
    (weight_kg IS NULL OR lean_mass_kg IS NULL OR lean_mass_kg <= weight_kg)
  )
);
```

**Indexes:**
- `idx_body_measurements_user_date` on `(user_id, measurement_date DESC)`
- `idx_body_measurements_date` on `measurement_date DESC`
- `idx_body_measurements_method` on `measurement_method`
- `idx_body_measurements_outliers` on `outlier_flag` WHERE `outlier_flag = true`
- `idx_body_measurements_goals` on `related_goals` (GIN index)

### body_circumferences
Detailed body circumference measurements for shape-based goals.

```sql
CREATE TABLE body_circumferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Measurement timing
  measurement_date DATE NOT NULL,
  measurement_time TIME,
  
  -- Upper body measurements (cm)
  neck_cm NUMERIC(5,2),
  chest_cm NUMERIC(5,2),
  bust_cm NUMERIC(5,2), -- For female users
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  
  -- Arm measurements (cm)
  bicep_left_cm NUMERIC(5,2),
  bicep_right_cm NUMERIC(5,2),
  forearm_left_cm NUMERIC(5,2),
  forearm_right_cm NUMERIC(5,2),
  wrist_left_cm NUMERIC(5,2),
  wrist_right_cm NUMERIC(5,2),
  
  -- Leg measurements (cm)
  thigh_left_cm NUMERIC(5,2),
  thigh_right_cm NUMERIC(5,2),
  calf_left_cm NUMERIC(5,2),
  calf_right_cm NUMERIC(5,2),
  ankle_left_cm NUMERIC(5,2),
  ankle_right_cm NUMERIC(5,2),
  
  -- Additional measurements
  shoulder_width_cm NUMERIC(5,2),
  back_width_cm NUMERIC(5,2),
  
  -- Measurement conditions and methodology
  measurement_conditions VARCHAR(50), -- relaxed, flexed, pumped, cold
  measurement_technique VARCHAR(50), -- standing, lying, specific_position
  measuring_tape_type VARCHAR(50), -- fabric, metal, digital
  measurement_location VARCHAR(100),
  
  -- Data quality
  measurement_confidence INTEGER DEFAULT 5, -- 1-10 confidence in accuracy
  measured_by VARCHAR(50), -- self, trainer, partner, healthcare_provider
  measurement_protocol TEXT, -- Specific protocol followed
  
  -- Calculated ratios and derived metrics
  waist_to_hip_ratio NUMERIC(4,3),
  waist_to_height_ratio NUMERIC(4,3),
  chest_to_waist_ratio NUMERIC(4,3),
  
  -- User context
  user_notes TEXT,
  body_position_notes TEXT, -- Notes about positioning during measurement
  
  -- Photo documentation
  measurement_photos TEXT[], -- Photos showing measurement technique
  
  -- Goal relationship
  related_goals UUID[], -- Circumference goals this measurement applies to
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_measurements CHECK (
    (neck_cm IS NULL OR (neck_cm >= 20 AND neck_cm <= 70)) AND
    (chest_cm IS NULL OR (chest_cm >= 50 AND chest_cm <= 200)) AND
    (waist_cm IS NULL OR (waist_cm >= 40 AND waist_cm <= 200)) AND
    (thigh_left_cm IS NULL OR (thigh_left_cm >= 30 AND thigh_left_cm <= 100))
  ),
  CONSTRAINT valid_confidence CHECK (measurement_confidence >= 1 AND measurement_confidence <= 10)
);
```

**Indexes:**
- `idx_body_circumferences_user_date` on `(user_id, measurement_date DESC)`
- `idx_body_circumferences_waist_date` on `(waist_cm, measurement_date)` WHERE `waist_cm IS NOT NULL`
- `idx_body_circumferences_goals` on `related_goals` (GIN index)

## Nutrition Goal Integration

### nutrition_goal_targets
Dynamic nutrition targets derived from body composition goals.

```sql
CREATE TABLE nutrition_goal_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body_goal_id UUID REFERENCES body_goals(id) ON DELETE CASCADE,
  
  -- Target period
  effective_date DATE NOT NULL,
  end_date DATE,
  target_type VARCHAR(30) DEFAULT 'daily', -- daily, weekly, monthly
  
  -- Caloric targets
  target_calories INTEGER,
  maintenance_calories INTEGER, -- Calculated maintenance for reference
  caloric_surplus_deficit INTEGER, -- +/- from maintenance
  
  -- Macronutrient targets (grams)
  target_protein_g NUMERIC(6,2),
  target_carbs_g NUMERIC(6,2),
  target_fat_g NUMERIC(6,2),
  target_fiber_g NUMERIC(5,2),
  
  -- Macronutrient percentages
  protein_percentage NUMERIC(5,2),
  carbs_percentage NUMERIC(5,2),
  fat_percentage NUMERIC(5,2),
  
  -- Timing considerations
  pre_workout_carbs_g NUMERIC(5,2),
  post_workout_protein_g NUMERIC(5,2),
  pre_sleep_protein_g NUMERIC(5,2),
  
  -- Advanced targets
  target_water_ml INTEGER,
  target_sodium_mg INTEGER,
  target_sugar_g NUMERIC(5,2),
  
  -- Goal achievement strategy
  strategy_type VARCHAR(50), -- deficit, surplus, recomp, maintenance
  strategy_aggressiveness NUMERIC(3,2), -- 0-1 how aggressive the approach
  weekly_rate_target NUMERIC(5,3), -- kg/week target rate
  
  -- Calculation metadata
  calculation_method VARCHAR(50), -- harris_benedict, mifflin_st_jeor, katch_mcardle
  activity_multiplier NUMERIC(3,2), -- Activity level multiplier used
  lean_mass_factor NUMERIC(3,2), -- Lean mass consideration in calculations
  
  -- Adaptation and flexibility
  adaptive_targets BOOLEAN DEFAULT true, -- Whether targets adapt based on progress
  tolerance_range_pct NUMERIC(5,2) DEFAULT 10, -- +/- percentage tolerance
  minimum_calories INTEGER, -- Safety minimum calories
  maximum_deficit INTEGER, -- Maximum safe deficit
  
  -- Integration with other systems
  auto_generated BOOLEAN DEFAULT true, -- System-generated vs manually set
  override_by_user BOOLEAN DEFAULT false,
  approved_by_professional BOOLEAN DEFAULT false,
  
  -- Performance tracking
  adherence_rate NUMERIC(5,4), -- 0-1 adherence rate to these targets
  effectiveness_score NUMERIC(5,2), -- How effective these targets are proving
  last_evaluation_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, effective_date, target_type),
  
  CONSTRAINT valid_percentages CHECK (
    protein_percentage + carbs_percentage + fat_percentage = 100
  ),
  CONSTRAINT valid_calories CHECK (
    target_calories >= 1000 AND target_calories <= 5000
  ),
  CONSTRAINT valid_rates CHECK (
    strategy_aggressiveness >= 0 AND strategy_aggressiveness <= 1
  )
);
```

**Indexes:**
- `idx_nutrition_goal_targets_user_date` on `(user_id, effective_date DESC)`
- `idx_nutrition_goal_targets_body_goal` on `body_goal_id`
- `idx_nutrition_goal_targets_active` on `user_id` WHERE `end_date IS NULL OR end_date > CURRENT_DATE`

## Goal Intelligence and Analytics

### goal_progress_predictions
AI-generated predictions for goal achievement timelines and success probability.

```sql
CREATE TABLE goal_progress_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES body_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Prediction metadata
  prediction_date TIMESTAMPTZ DEFAULT NOW(),
  prediction_horizon_weeks INTEGER NOT NULL, -- How far ahead this predicts
  model_version VARCHAR(50), -- AI model version used
  confidence_level NUMERIC(3,2), -- 0-1 confidence in prediction accuracy
  
  -- Success probability predictions
  achievement_probability NUMERIC(3,2), -- 0-1 probability of achieving goal
  on_time_probability NUMERIC(3,2), -- 0-1 probability of achieving on deadline
  partial_achievement_probability NUMERIC(3,2), -- 0-1 probability of >50% achievement
  
  -- Timeline predictions
  predicted_completion_date DATE,
  earliest_possible_completion DATE,
  latest_likely_completion DATE,
  current_trajectory_completion DATE, -- If current rate continues
  
  -- Value predictions
  predicted_final_value NUMERIC(8,3),
  confidence_interval_lower NUMERIC(8,3), -- 95% confidence interval lower bound
  confidence_interval_upper NUMERIC(8,3), -- 95% confidence interval upper bound
  
  -- Scenario analysis
  best_case_scenario JSONB, -- Optimistic outcome prediction
  worst_case_scenario JSONB, -- Pessimistic outcome prediction
  most_likely_scenario JSONB, -- Most probable outcome
  
  -- Factor analysis
  key_success_factors TEXT[], -- What factors most predict success
  key_risk_factors TEXT[], -- What factors most predict failure
  controllable_factors JSONB, -- Factors user can control and their impact
  uncontrollable_factors JSONB, -- External factors and their impact
  
  -- Intervention recommendations
  recommended_interventions JSONB, -- What changes would improve success probability
  intervention_impact_estimates JSONB, -- Estimated impact of each intervention
  priority_interventions TEXT[], -- Most important interventions to focus on
  
  -- Historical accuracy tracking
  prediction_accuracy NUMERIC(3,2), -- How accurate previous predictions were (0-1)
  actual_vs_predicted_variance NUMERIC(8,3), -- Difference from previous predictions
  model_performance_rating NUMERIC(3,2), -- 0-1 how well model is performing for this user
  
  -- Data quality indicators
  data_sufficiency_score NUMERIC(3,2), -- 0-1 how much data available for prediction
  data_freshness_days INTEGER, -- Days since most recent data point
  data_consistency_score NUMERIC(3,2), -- 0-1 how consistent the data trends are
  
  -- User context
  lifestyle_stability_score NUMERIC(3,2), -- 0-1 how stable user's lifestyle is
  motivation_level_estimate NUMERIC(3,2), -- 0-1 estimated motivation level
  external_support_level NUMERIC(3,2), -- 0-1 level of external support
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_probabilities CHECK (
    achievement_probability >= 0 AND achievement_probability <= 1 AND
    on_time_probability >= 0 AND on_time_probability <= 1 AND
    confidence_level >= 0 AND confidence_level <= 1
  ),
  CONSTRAINT valid_data_scores CHECK (
    data_sufficiency_score >= 0 AND data_sufficiency_score <= 1 AND
    data_consistency_score >= 0 AND data_consistency_score <= 1
  )
);
```

**Indexes:**
- `idx_goal_predictions_goal_date` on `(goal_id, prediction_date DESC)`
- `idx_goal_predictions_user` on `user_id`
- `idx_goal_predictions_confidence` on `confidence_level DESC`

### goal_optimization_recommendations
AI-generated optimization suggestions for improving goal achievement probability.

```sql
CREATE TABLE goal_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES body_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Recommendation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  recommendation_type VARCHAR(50), -- nutrition, training, recovery, lifestyle, mindset
  priority_level VARCHAR(20), -- low, medium, high, critical
  urgency VARCHAR(20), -- routine, prompt, immediate
  
  -- Recommendation content
  recommendation_title VARCHAR(200) NOT NULL,
  recommendation_description TEXT NOT NULL,
  specific_actions TEXT[], -- Specific actionable steps
  
  -- Impact analysis
  estimated_impact_magnitude NUMERIC(3,2), -- 0-1 how much this could help
  confidence_in_impact NUMERIC(3,2), -- 0-1 confidence in impact estimate
  time_to_impact_weeks INTEGER, -- How long before effects are seen
  
  -- Implementation details
  implementation_difficulty VARCHAR(20), -- easy, moderate, hard, very_hard
  time_commitment_hours_week NUMERIC(4,1), -- Hours per week required
  cost_estimate_category VARCHAR(20), -- free, low, moderate, high, expensive
  prerequisites TEXT[], -- What's needed before implementing
  
  -- Success metrics
  success_metrics TEXT[], -- How to measure if recommendation is working
  tracking_frequency VARCHAR(30), -- daily, weekly, biweekly, monthly
  expected_timeline_weeks INTEGER, -- How long to try before evaluating
  
  -- Personalization factors
  user_preference_alignment NUMERIC(3,2), -- 0-1 how well this fits user preferences
  lifestyle_compatibility NUMERIC(3,2), -- 0-1 how compatible with current lifestyle
  past_success_likelihood NUMERIC(3,2), -- 0-1 based on user's past patterns
  
  -- Evidence and supporting data
  evidence_level VARCHAR(20), -- high, moderate, low, anecdotal
  supporting_studies TEXT[], -- References to supporting research
  supporting_user_data JSONB, -- User's data that supports this recommendation
  
  -- User interaction
  user_response VARCHAR(30), -- viewed, dismissed, accepted, implemented, completed
  response_timestamp TIMESTAMPTZ,
  user_feedback_rating INTEGER, -- 1-10 how helpful user found this
  user_feedback_text TEXT,
  implementation_notes TEXT, -- User's notes about implementing
  
  -- Effectiveness tracking
  implemented_successfully BOOLEAN DEFAULT false,
  measured_impact NUMERIC(4,2), -- Actual measured impact (-1 to 1)
  side_effects_noted TEXT[],
  would_recommend_to_similar_users BOOLEAN,
  
  -- AI model information
  model_version VARCHAR(50),
  recommendation_algorithm VARCHAR(50),
  similar_user_success_rate NUMERIC(3,2), -- Success rate for similar users
  
  -- Status and lifecycle
  status VARCHAR(20) DEFAULT 'active', -- active, implemented, dismissed, expired
  expires_at TIMESTAMPTZ,
  superseded_by UUID REFERENCES goal_optimization_recommendations(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_scores CHECK (
    estimated_impact_magnitude >= 0 AND estimated_impact_magnitude <= 1 AND
    confidence_in_impact >= 0 AND confidence_in_impact <= 1 AND
    user_preference_alignment >= 0 AND user_preference_alignment <= 1
  ),
  CONSTRAINT valid_feedback CHECK (
    user_feedback_rating IS NULL OR 
    (user_feedback_rating >= 1 AND user_feedback_rating <= 10)
  )
);
```

**Indexes:**
- `idx_optimization_recs_goal` on `goal_id`
- `idx_optimization_recs_user_status` on `(user_id, status)`
- `idx_optimization_recs_priority` on `priority_level`
- `idx_optimization_recs_type` on `recommendation_type`

## Cross-Module Integration Tables

### goal_module_contributions
Track how each Lumeos module contributes to goal achievement.

```sql
CREATE TABLE goal_module_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES body_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Analysis period
  analysis_date DATE NOT NULL,
  analysis_period_days INTEGER DEFAULT 7, -- How many days this analysis covers
  
  -- Module contribution scores (0-100)
  nutrition_contribution NUMERIC(5,2),
  training_contribution NUMERIC(5,2),
  recovery_contribution NUMERIC(5,2),
  supplements_contribution NUMERIC(5,2),
  lifestyle_contribution NUMERIC(5,2),
  
  -- Specific metric contributions
  nutrition_metrics JSONB, -- Specific nutrition metrics and their goal impact
  training_metrics JSONB, -- Training metrics and impact
  recovery_metrics JSONB, -- Recovery metrics and impact
  supplement_metrics JSONB, -- Supplement effectiveness metrics
  
  -- Overall analysis
  total_contribution_score NUMERIC(5,2), -- Overall progress score
  primary_contributor VARCHAR(50), -- Which module contributed most
  limiting_factor VARCHAR(50), -- Which module is holding back progress
  
  -- Correlation analysis
  correlation_strength JSONB, -- Correlation between modules and goal progress
  interaction_effects JSONB, -- How modules interact to affect goals
  
  -- Recommendations
  optimization_opportunities TEXT[], -- Areas with potential for improvement
  resource_reallocation_suggestions JSONB, -- How to better allocate effort
  
  -- Data quality
  confidence_score NUMERIC(3,2), -- 0-1 confidence in this analysis
  data_completeness NUMERIC(3,2), -- 0-1 how complete the underlying data is
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(goal_id, analysis_date),
  
  CONSTRAINT valid_contributions CHECK (
    nutrition_contribution >= 0 AND nutrition_contribution <= 100 AND
    training_contribution >= 0 AND training_contribution <= 100 AND
    recovery_contribution >= 0 AND recovery_contribution <= 100
  )
);
```

**Indexes:**
- `idx_module_contributions_goal_date` on `(goal_id, analysis_date DESC)`
- `idx_module_contributions_user` on `user_id`

## Performance and Analytics Views

### user_goal_dashboard
Materialized view for rapid goal dashboard loading.

```sql
CREATE MATERIALIZED VIEW user_goal_dashboard AS
SELECT 
  u.id as user_id,
  
  -- Goal summary statistics
  COUNT(bg.*) as total_goals,
  COUNT(*) FILTER (WHERE bg.status = 'active') as active_goals,
  COUNT(*) FILTER (WHERE bg.status = 'achieved') as achieved_goals,
  COUNT(*) FILTER (WHERE bg.is_primary_goal = true) as primary_goals,
  
  -- Progress statistics
  AVG(bg.progress_percentage) FILTER (WHERE bg.status = 'active') as avg_progress,
  MAX(bg.progress_percentage) FILTER (WHERE bg.status = 'active') as best_progress,
  COUNT(*) FILTER (WHERE bg.progress_percentage >= 75 AND bg.status = 'active') as nearly_complete_goals,
  
  -- Timeline analysis
  COUNT(*) FILTER (WHERE bg.deadline < CURRENT_DATE + INTERVAL '30 days' AND bg.status = 'active') as goals_due_soon,
  COUNT(*) FILTER (WHERE bg.deadline < CURRENT_DATE AND bg.status = 'active') as overdue_goals,
  
  -- Recent activity
  MAX(bg.last_progress_update) as last_progress_update,
  COUNT(*) FILTER (WHERE bg.updated_at > CURRENT_DATE - INTERVAL '7 days') as goals_updated_recently,
  
  -- Measurement activity
  COUNT(DISTINCT bm.measurement_date) FILTER (WHERE bm.measurement_date > CURRENT_DATE - INTERVAL '30 days') as recent_measurement_days,
  MAX(bm.measurement_date) as last_measurement_date

FROM users u
LEFT JOIN body_goals bg ON u.id = bg.user_id
LEFT JOIN body_measurements bm ON u.id = bm.user_id
GROUP BY u.id;

-- Indexes
CREATE UNIQUE INDEX idx_user_goal_dashboard_user ON user_goal_dashboard(user_id);
CREATE INDEX idx_user_goal_dashboard_active ON user_goal_dashboard(active_goals DESC);
```

### goal_progress_trends
Materialized view for trend analysis across all goals.

```sql
CREATE MATERIALIZED VIEW goal_progress_trends AS
WITH weekly_progress AS (
  SELECT 
    bg.id as goal_id,
    bg.user_id,
    bg.goal_type,
    DATE_TRUNC('week', bm.measurement_date) as week,
    AVG(
      CASE 
        WHEN bg.goal_type = 'weight' THEN bm.weight_kg
        WHEN bg.goal_type = 'body_fat' THEN bm.body_fat_pct
        WHEN bg.goal_type = 'muscle_mass' THEN bm.muscle_mass_kg
      END
    ) as avg_value,
    COUNT(*) as measurement_count
  FROM body_goals bg
  JOIN body_measurements bm ON bg.user_id = bm.user_id
  WHERE bg.status = 'active' 
    AND bm.measurement_date >= bg.start_date
  GROUP BY bg.id, bg.user_id, bg.goal_type, DATE_TRUNC('week', bm.measurement_date)
)
SELECT 
  goal_id,
  user_id,
  goal_type,
  
  -- Trend analysis
  COUNT(*) as weeks_of_data,
  COALESCE(
    REGR_SLOPE(avg_value, EXTRACT(EPOCH FROM week)) * 7 * 24 * 3600, 
    0
  ) as weekly_change_rate,
  
  -- Recent vs. older comparison
  AVG(avg_value) FILTER (WHERE week >= CURRENT_DATE - INTERVAL '4 weeks') as recent_4week_avg,
  AVG(avg_value) FILTER (WHERE week < CURRENT_DATE - INTERVAL '4 weeks') as older_avg,
  
  -- Consistency measures
  STDDEV(avg_value) as value_variability,
  AVG(measurement_count) as avg_measurements_per_week

FROM weekly_progress
GROUP BY goal_id, user_id, goal_type
HAVING COUNT(*) >= 3; -- At least 3 weeks of data

-- Indexes
CREATE INDEX idx_goal_progress_trends_goal ON goal_progress_trends(goal_id);
CREATE INDEX idx_goal_progress_trends_user_type ON goal_progress_trends(user_id, goal_type);
```

## Automated Functions and Triggers

### Goal Progress Update Function
```sql
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  related_goal RECORD;
  current_value NUMERIC(8,3);
  progress_pct NUMERIC(5,2);
BEGIN
  -- Update progress for related goals when new measurements are added
  FOR related_goal IN 
    SELECT * FROM body_goals 
    WHERE user_id = NEW.user_id 
      AND status = 'active'
      AND (
        (goal_type = 'weight' AND NEW.weight_kg IS NOT NULL) OR
        (goal_type = 'body_fat' AND NEW.body_fat_pct IS NOT NULL) OR
        (goal_type = 'muscle_mass' AND NEW.muscle_mass_kg IS NOT NULL)
      )
  LOOP
    -- Get current value based on goal type
    current_value := CASE 
      WHEN related_goal.goal_type = 'weight' THEN NEW.weight_kg
      WHEN related_goal.goal_type = 'body_fat' THEN NEW.body_fat_pct
      WHEN related_goal.goal_type = 'muscle_mass' THEN NEW.muscle_mass_kg
    END;
    
    -- Calculate progress percentage
    IF current_value IS NOT NULL AND related_goal.target_value IS NOT NULL THEN
      IF related_goal.goal_type IN ('weight', 'body_fat') THEN
        -- For weight/body fat, lower is better
        progress_pct := GREATEST(0, LEAST(100, 
          (1 - (current_value - related_goal.target_value) / 
           NULLIF(COALESCE(related_goal.baseline_value, current_value) - related_goal.target_value, 0)) * 100
        ));
      ELSE
        -- For muscle mass, higher is better
        progress_pct := GREATEST(0, LEAST(100, 
          (current_value / related_goal.target_value) * 100
        ));
      END IF;
      
      -- Update the goal
      UPDATE body_goals SET 
        current_value = current_value,
        progress_percentage = ROUND(progress_pct, 2),
        last_measurement_date = NEW.measurement_date,
        last_progress_update = NOW(),
        updated_at = NOW()
      WHERE id = related_goal.id;
      
      -- Check if goal is achieved
      IF progress_pct >= 100 AND related_goal.status = 'active' THEN
        UPDATE body_goals SET 
          status = 'achieved',
          achievement_date = NEW.measurement_date,
          achievement_notes = 'Goal achieved through measurement update'
        WHERE id = related_goal.id;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update goal progress
CREATE TRIGGER update_goal_progress_trigger
  AFTER INSERT OR UPDATE ON body_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();
```

### Goal Milestone Check Function
```sql
CREATE OR REPLACE FUNCTION check_goal_milestones()
RETURNS TRIGGER AS $$
DECLARE
  milestone_record RECORD;
BEGIN
  -- Check for milestone achievements when goal progress updates
  FOR milestone_record IN 
    SELECT * FROM goal_milestones gm
    WHERE gm.goal_id = NEW.id 
      AND gm.is_achieved = false
      AND (
        (gm.milestone_type = 'percentage' AND NEW.progress_percentage >= gm.percentage_threshold) OR
        (gm.milestone_type = 'absolute_value' AND 
         ((NEW.goal_type IN ('weight', 'body_fat') AND NEW.current_value <= gm.absolute_value) OR
          (NEW.goal_type = 'muscle_mass' AND NEW.current_value >= gm.absolute_value)))
      )
  LOOP
    -- Mark milestone as achieved
    UPDATE goal_milestones SET 
      is_achieved = true,
      achieved_date = NOW(),
      achieved_value = NEW.current_value,
      updated_at = NOW()
    WHERE id = milestone_record.id;
    
    -- Could add notification logic here
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for milestone checking
CREATE TRIGGER check_goal_milestones_trigger
  AFTER UPDATE ON body_goals
  FOR EACH ROW
  WHEN (OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage)
  EXECUTE FUNCTION check_goal_milestones();
```

## Row Level Security

```sql
-- Users can only access their own goals and measurements
ALTER TABLE body_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY body_goals_policy ON body_goals
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY body_measurements_policy ON body_measurements
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE body_circumferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY body_circumferences_policy ON body_circumferences
FOR ALL TO authenticated
USING (user_id = auth.uid());

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY goal_milestones_policy ON goal_milestones
FOR ALL TO authenticated
USING (user_id = auth.uid());
```

## Performance Monitoring and Optimization

```sql
-- Monitor goal system performance
CREATE OR REPLACE FUNCTION goal_system_health_check()
RETURNS TABLE(
  metric_name TEXT,
  metric_value NUMERIC,
  status TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  
  -- Check goal progress update frequency
  SELECT 
    'goal_updates_last_7_days'::TEXT,
    COUNT(*)::NUMERIC,
    CASE WHEN COUNT(*) > 100 THEN 'healthy' ELSE 'low_activity' END,
    CASE WHEN COUNT(*) <= 100 THEN 'Encourage more frequent progress tracking' ELSE 'Good update frequency' END
  FROM body_goals
  WHERE updated_at > NOW() - INTERVAL '7 days'
  
  UNION ALL
  
  -- Check measurement consistency
  SELECT 
    'users_with_recent_measurements'::TEXT,
    COUNT(DISTINCT user_id)::NUMERIC,
    'info',
    'Users with measurements in last 14 days'
  FROM body_measurements
  WHERE measurement_date > CURRENT_DATE - INTERVAL '14 days'
  
  UNION ALL
  
  -- Check goal achievement rate
  SELECT 
    'goal_achievement_rate_90_days'::TEXT,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'achieved')::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ),
    CASE WHEN ROUND(COUNT(*) FILTER (WHERE status = 'achieved')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) > 20 
         THEN 'healthy' ELSE 'needs_attention' END,
    'Goals achieved in last 90 days'
  FROM body_goals
  WHERE created_at > NOW() - INTERVAL '90 days';
  
END;
$$ LANGUAGE plpgsql;
```