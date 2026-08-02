# Recovery Database Schema

## Core Recovery Tables

### recovery_checkins
Daily recovery assessment data.

```sql
CREATE TABLE recovery_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date and timing
  date DATE NOT NULL,
  checkin_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sleep metrics
  sleep_hours NUMERIC(3,1), -- Hours of sleep (e.g., 7.5)
  sleep_quality INTEGER, -- 1-10 subjective sleep quality
  sleep_start_time TIME, -- Bedtime
  sleep_end_time TIME, -- Wake time
  
  -- Subjective assessments
  subjective_feeling INTEGER, -- 1-10 overall feeling
  mood VARCHAR(20), -- motivated, good, neutral, tired, sick
  energy_level INTEGER, -- 1-10 energy level
  motivation INTEGER, -- 1-10 motivation to train
  
  -- Physical state
  soreness JSONB DEFAULT '{}', -- {"chest": 1, "legs": 2} (0-3 scale)
  pain_areas TEXT[], -- ["lower_back", "right_knee"]
  resting_hr INTEGER, -- Resting heart rate
  hrv_score NUMERIC(5,2), -- Heart rate variability score
  
  -- Environmental factors
  stress_level INTEGER, -- 1-10 perceived stress
  work_stress INTEGER, -- 1-10 work-related stress
  life_stress INTEGER, -- 1-10 personal stress
  
  -- Habits and behaviors
  alcohol_units NUMERIC(3,1), -- Standard alcohol units consumed
  caffeine_intake INTEGER, -- mg of caffeine
  screen_time_hours NUMERIC(3,1), -- Hours of screen time before bed
  
  -- Notes and observations
  notes TEXT,
  mood_notes TEXT,
  sleep_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);
```

**Indexes:**
- `idx_recovery_checkins_user_date` on `(user_id, date)`
- `idx_recovery_checkins_date` on `date`

### recovery_scores
Calculated daily recovery scores.

```sql
CREATE TABLE recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Overall score
  recovery_score NUMERIC(5,2) NOT NULL, -- 0-100 calculated score
  
  -- Score components (0-100 each)
  sleep_quality_score NUMERIC(5,2),
  sleep_duration_score NUMERIC(5,2),
  subjective_feeling_score NUMERIC(5,2),
  soreness_score NUMERIC(5,2),
  training_load_score NUMERIC(5,2),
  nutrition_score NUMERIC(5,2),
  mood_score NUMERIC(5,2),
  hrv_score NUMERIC(5,2),
  stress_score NUMERIC(5,2),
  
  -- Modality bonus points
  modality_bonus NUMERIC(4,2), -- 0-5 bonus points
  
  -- Calculation metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  algorithm_version VARCHAR(10) DEFAULT 'v1.0',
  
  -- Training readiness recommendations
  readiness_level VARCHAR(20), -- excellent, good, moderate, poor, rest
  intensity_recommendation VARCHAR(50), -- "high intensity", "moderate", "light", "rest"
  
  UNIQUE(user_id, date)
);
```

**Indexes:**
- `idx_recovery_scores_user_date` on `(user_id, date)`
- `idx_recovery_scores_score` on `recovery_score`

### recovery_modalities
Recovery activities and treatments logged by users.

```sql
CREATE TABLE recovery_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Modality details
  modality_type VARCHAR(50) NOT NULL, -- sauna, cold_plunge, massage, etc.
  date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Intensity and settings
  intensity VARCHAR(20), -- light, moderate, intense, therapeutic
  temperature NUMERIC(4,1), -- For sauna/cold plunge (°C)
  pressure_level VARCHAR(20), -- For massage (light, medium, deep)
  
  -- Location and provider
  location VARCHAR(100), -- home, gym, spa, clinic
  provider VARCHAR(100), -- massage therapist, facility name
  cost NUMERIC(8,2), -- Cost of treatment
  
  -- Effectiveness tracking
  immediate_effect INTEGER, -- 1-10 immediate feeling improvement
  next_day_effect INTEGER, -- 1-10 next day recovery improvement
  
  -- Notes
  notes TEXT,
  technique_notes TEXT, -- Specific techniques used
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_recovery_modalities_user_date` on `(user_id, date)`
- `idx_recovery_modalities_type` on `modality_type`

## HRV and Biometric Tables

### hrv_measurements
Heart Rate Variability measurements from devices.

```sql
CREATE TABLE hrv_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Measurement timing
  measured_at TIMESTAMPTZ NOT NULL,
  measurement_date DATE NOT NULL,
  
  -- HRV metrics
  rmssd NUMERIC(6,2), -- Root Mean Square of Successive Differences (ms)
  pnn50 NUMERIC(5,2), -- Percentage of successive RR intervals > 50ms
  heart_rate NUMERIC(5,1), -- Average heart rate during measurement
  hrv_score NUMERIC(5,2), -- Normalized HRV score (0-100)
  
  -- Device and context
  device_source VARCHAR(50), -- "hrv4training", "oura", "whoop", "elite_hrv"
  measurement_position VARCHAR(20), -- standing, sitting, lying
  measurement_duration INTEGER, -- Duration in seconds
  
  -- Quality indicators
  measurement_quality VARCHAR(20), -- excellent, good, fair, poor
  artifacts_detected INTEGER, -- Number of measurement artifacts
  
  -- Raw data (optional)
  raw_rr_intervals JSONB, -- Array of RR intervals for advanced analysis
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_hrv_measurements_user_date` on `(user_id, measurement_date)`
- `idx_hrv_measurements_source` on `device_source`

### sleep_data
Detailed sleep tracking data from devices and manual input.

```sql
CREATE TABLE sleep_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Sleep period
  sleep_date DATE NOT NULL,
  bedtime TIMESTAMPTZ,
  sleep_start TIMESTAMPTZ, -- When sleep actually began
  wake_time TIMESTAMPTZ,
  time_in_bed_minutes INTEGER,
  total_sleep_minutes INTEGER,
  
  -- Sleep stages (in minutes)
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  
  -- Sleep quality metrics
  sleep_efficiency NUMERIC(5,2), -- (Total sleep / Time in bed) × 100
  sleep_latency_minutes INTEGER, -- Time to fall asleep
  wake_frequency INTEGER, -- Number of awakenings
  
  -- Subjective ratings
  sleep_quality_rating INTEGER, -- 1-10 subjective quality
  grogginess_rating INTEGER, -- 1-10 morning grogginess
  
  -- Device and source
  data_source VARCHAR(50), -- "oura", "whoop", "apple_health", "manual"
  device_confidence NUMERIC(3,2), -- Device confidence in data (0-1)
  
  -- Environmental factors
  room_temperature NUMERIC(4,1),
  humidity NUMERIC(4,1),
  noise_level VARCHAR(20), -- quiet, moderate, noisy
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, sleep_date)
);
```

**Indexes:**
- `idx_sleep_data_user_date` on `(user_id, sleep_date)`
- `idx_sleep_data_source` on `data_source`

## Analytics and Aggregation Tables

### recovery_trends
Pre-calculated recovery trends for performance optimization.

```sql
CREATE TABLE recovery_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Time period
  period_type VARCHAR(20), -- weekly, monthly, quarterly
  period_start DATE,
  period_end DATE,
  
  -- Average metrics
  avg_recovery_score NUMERIC(5,2),
  avg_sleep_hours NUMERIC(3,1),
  avg_sleep_quality NUMERIC(3,1),
  avg_hrv_score NUMERIC(5,2),
  avg_stress_level NUMERIC(3,1),
  
  -- Trend analysis
  score_trend VARCHAR(20), -- improving, declining, stable
  sleep_trend VARCHAR(20),
  consistency_score NUMERIC(5,2), -- How consistent user's recovery is
  
  -- Patterns identified
  best_recovery_day VARCHAR(10), -- Monday, Tuesday, etc.
  worst_recovery_day VARCHAR(10),
  modality_effectiveness JSONB, -- {"sauna": 8.5, "massage": 9.2}
  
  -- Recommendations generated
  primary_recommendation TEXT,
  secondary_recommendations TEXT[],
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_type, period_start)
);
```

### overtraining_alerts
Automated overtraining detection and alerts.

```sql
CREATE TABLE overtraining_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_date DATE NOT NULL,
  alert_type VARCHAR(30), -- declining_recovery, high_fatigue, poor_sleep
  severity VARCHAR(20), -- low, moderate, high, critical
  
  -- Trigger conditions
  trigger_metric VARCHAR(30), -- recovery_score, sleep_quality, hrv_decline
  threshold_value NUMERIC(8,2),
  actual_value NUMERIC(8,2),
  days_exceeded INTEGER, -- How many days threshold was exceeded
  
  -- Recommendations
  recommended_action TEXT,
  rest_days_suggested INTEGER,
  training_modifications TEXT[],
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_overtraining_alerts_user_date` on `(user_id, alert_date)`
- `idx_overtraining_alerts_status` on `status`

## Recovery Protocol Tables

### recovery_protocols
Structured recovery protocols and recommendations.

```sql
CREATE TABLE recovery_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Protocol classification
  protocol_type VARCHAR(30), -- active, passive, therapeutic, preventive
  target_condition VARCHAR(50), -- general, overreaching, injury, illness
  duration_days INTEGER,
  
  -- Protocol steps
  daily_activities JSONB, -- Structured daily activities
  modalities_recommended TEXT[],
  training_modifications TEXT[],
  nutrition_guidelines TEXT[],
  
  -- Evidence and effectiveness
  evidence_level VARCHAR(10), -- A+, A, B, C, D
  success_rate NUMERIC(5,2), -- Percentage of successful outcomes
  
  -- Metadata
  created_by VARCHAR(50), -- system, coach, research
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### user_protocol_assignments
User-specific protocol assignments and progress.

```sql
CREATE TABLE user_protocol_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES recovery_protocols(id),
  
  -- Assignment details
  assigned_date DATE NOT NULL,
  target_end_date DATE,
  assigned_by VARCHAR(50), -- ai_coach, human_coach, self
  
  -- Progress tracking
  days_completed INTEGER DEFAULT 0,
  compliance_rate NUMERIC(5,2), -- Percentage of protocol followed
  effectiveness_rating INTEGER, -- 1-10 user rating of effectiveness
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, completed, discontinued
  completion_date DATE,
  discontinue_reason TEXT,
  
  -- Notes
  progress_notes TEXT,
  user_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Views and Computed Columns

### recovery_dashboard_view
Optimized view for dashboard queries.

```sql
CREATE VIEW recovery_dashboard_view AS
SELECT 
  u.id as user_id,
  rc.date,
  rc.sleep_hours,
  rc.sleep_quality,
  rc.subjective_feeling,
  rc.mood,
  rs.recovery_score,
  rs.readiness_level,
  rs.intensity_recommendation,
  
  -- 7-day averages
  AVG(rs_7d.recovery_score) OVER (
    PARTITION BY u.id 
    ORDER BY rc.date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as avg_7d_score,
  
  -- HRV data
  hrv.hrv_score,
  hrv.heart_rate,
  
  -- Training load (from training module)
  tl.training_load,
  tl.fatigue_score,
  
  -- Alerts
  CASE 
    WHEN rs.recovery_score < 60 THEN 'poor_recovery'
    WHEN hrv.hrv_score < (SELECT avg_hrv - 2*stddev_hrv FROM user_hrv_baselines WHERE user_id = u.id) 
         THEN 'hrv_decline'
    ELSE null 
  END as alert_type

FROM users u
LEFT JOIN recovery_checkins rc ON u.id = rc.user_id
LEFT JOIN recovery_scores rs ON u.id = rs.user_id AND rc.date = rs.date
LEFT JOIN recovery_scores rs_7d ON u.id = rs_7d.user_id 
  AND rs_7d.date BETWEEN rc.date - INTERVAL '6 days' AND rc.date
LEFT JOIN hrv_measurements hrv ON u.id = hrv.user_id 
  AND hrv.measurement_date = rc.date
LEFT JOIN training_load_daily tl ON u.id = tl.user_id AND tl.date = rc.date;
```

## Performance Optimizations

### Partitioning Strategy
```sql
-- Partition recovery_checkins by date for better performance
CREATE TABLE recovery_checkins_y2026 PARTITION OF recovery_checkins
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE recovery_checkins_y2027 PARTITION OF recovery_checkins  
FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
```

### Materialized Views
```sql
-- Pre-aggregate weekly recovery stats
CREATE MATERIALIZED VIEW weekly_recovery_stats AS
SELECT 
  user_id,
  DATE_TRUNC('week', date) as week_start,
  AVG(recovery_score) as avg_score,
  AVG(sleep_hours) as avg_sleep,
  COUNT(*) as checkin_days,
  STDDEV(recovery_score) as score_variability
FROM recovery_scores
GROUP BY user_id, DATE_TRUNC('week', date);

-- Refresh weekly (can be automated)
REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_recovery_stats;
```

### Row Level Security
```sql
-- Users can only access their own recovery data
ALTER TABLE recovery_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY recovery_checkins_policy ON recovery_checkins
FOR ALL TO authenticated 
USING (user_id = auth.uid());

ALTER TABLE recovery_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY recovery_scores_policy ON recovery_scores
FOR ALL TO authenticated
USING (user_id = auth.uid());
```

## Data Retention and Archival

### Automated Cleanup
```sql
-- Archive old HRV measurements (keep 2 years, archive rest)
CREATE TABLE hrv_measurements_archive (LIKE hrv_measurements);

-- Function to archive old data
CREATE OR REPLACE FUNCTION archive_old_hrv_data() 
RETURNS INTEGER AS $$
DECLARE
  rows_moved INTEGER;
BEGIN
  WITH moved_rows AS (
    DELETE FROM hrv_measurements 
    WHERE measured_at < NOW() - INTERVAL '2 years'
    RETURNING *
  )
  INSERT INTO hrv_measurements_archive 
  SELECT * FROM moved_rows;
  
  GET DIAGNOSTICS rows_moved = ROW_COUNT;
  RETURN rows_moved;
END;
$$ LANGUAGE plpgsql;
```

## Analytics Queries

### Recovery Pattern Analysis
```sql
-- Identify user's optimal sleep duration
SELECT 
  user_id,
  FLOOR(sleep_hours) as sleep_bucket,
  AVG(recovery_score) as avg_recovery,
  COUNT(*) as days
FROM recovery_checkins rc
JOIN recovery_scores rs USING (user_id, date)
WHERE sleep_hours BETWEEN 6 AND 10
GROUP BY user_id, FLOOR(sleep_hours)
ORDER BY user_id, avg_recovery DESC;
```

### Modality Effectiveness
```sql
-- Calculate effectiveness of different recovery modalities
SELECT 
  rm.modality_type,
  AVG(rm.next_day_effect) as avg_effectiveness,
  AVG(rs_after.recovery_score - rs_before.recovery_score) as score_improvement,
  COUNT(*) as usage_count
FROM recovery_modalities rm
JOIN recovery_scores rs_before ON rm.user_id = rs_before.user_id 
  AND rm.date = rs_before.date
JOIN recovery_scores rs_after ON rm.user_id = rs_after.user_id 
  AND rm.date + INTERVAL '1 day' = rs_after.date
GROUP BY rm.modality_type
HAVING COUNT(*) >= 10
ORDER BY score_improvement DESC;
```