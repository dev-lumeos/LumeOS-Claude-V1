# Recovery Module — Database Schema
> Spec Phase 6 | Vollständiges SQL-Schema

---

```sql
CREATE SCHEMA IF NOT EXISTS recovery;
SET search_path = recovery, public;
```

---

## 1. recovery.recovery_checkins

```sql
CREATE TABLE recovery.recovery_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  date            DATE NOT NULL,
  checkin_time    TIMESTAMPTZ DEFAULT now(),

  sleep_hours         NUMERIC(3,1),
  sleep_quality       SMALLINT CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_start_time    TIME,
  sleep_end_time      TIME,

  subjective_feeling  SMALLINT CHECK (subjective_feeling BETWEEN 1 AND 10),
  mood                TEXT DEFAULT 'neutral'
    CHECK (mood IN ('motivated','good','neutral','tired','sick')),
  energy_level        SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
  motivation          SMALLINT CHECK (motivation BETWEEN 1 AND 10),

  soreness            JSONB DEFAULT '{}',
  pain_areas          TEXT[] DEFAULT '{}',

  stress_level        SMALLINT CHECK (stress_level BETWEEN 1 AND 10),
  work_stress         SMALLINT CHECK (work_stress BETWEEN 1 AND 10),
  life_stress         SMALLINT CHECK (life_stress BETWEEN 1 AND 10),

  alcohol_units       NUMERIC(3,1),
  caffeine_mg         INTEGER,
  screen_time_hours   NUMERIC(3,1),

  resting_hr          INTEGER,
  hrv_rmssd           NUMERIC(6,2),
  spo2_pct            NUMERIC(4,1),
  respiratory_rate    NUMERIC(4,1),

  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, date)
);

CREATE INDEX idx_checkins_user_date ON recovery.recovery_checkins(user_id, date DESC);

ALTER TABLE recovery.recovery_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkins_owner" ON recovery.recovery_checkins
  USING (auth.uid()::text = user_id::text);
```

---

## 2. recovery.recovery_scores

```sql
CREATE TABLE recovery.recovery_scores (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL,
  date                      DATE NOT NULL,

  recovery_score            NUMERIC(5,2) NOT NULL CHECK (recovery_score BETWEEN 0 AND 100),

  sleep_quality_score       NUMERIC(5,2),
  sleep_duration_score      NUMERIC(5,2),
  subjective_feeling_score  NUMERIC(5,2),
  soreness_score            NUMERIC(5,2),
  hrv_score                 NUMERIC(5,2),
  stress_score              NUMERIC(5,2),
  training_load_score       NUMERIC(5,2),
  nutrition_score           NUMERIC(5,2),
  mood_score                NUMERIC(5,2),
  modality_bonus            NUMERIC(4,2) DEFAULT 0,

  readiness_level           TEXT
    CHECK (readiness_level IN ('excellent','good','moderate','poor','rest')),
  intensity_recommendation  TEXT,
  mode                      TEXT DEFAULT 'manual'
    CHECK (mode IN ('manual','hrv','wearable')),

  training_load_used        NUMERIC(8,2),
  nutrition_compliance_used NUMERIC(5,2),
  hrv_baseline_used         NUMERIC(6,2),
  acwr_used                 NUMERIC(5,3),

  algorithm_version         TEXT DEFAULT 'v1.0',
  calculated_at             TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, date)
);

CREATE INDEX idx_scores_user_date  ON recovery.recovery_scores(user_id, date DESC);
CREATE INDEX idx_scores_score      ON recovery.recovery_scores(user_id, recovery_score);

ALTER TABLE recovery.recovery_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scores_owner" ON recovery.recovery_scores
  USING (auth.uid()::text = user_id::text);
```

### Trigger: Score nach Checkin berechnen

```sql
CREATE OR REPLACE FUNCTION recovery.compute_recovery_score_after_checkin()
RETURNS TRIGGER AS $$
DECLARE
  v_training_load NUMERIC;
  v_nutrition     NUMERIC;
  v_acwr          NUMERIC;
  v_score         NUMERIC;
  v_readiness     TEXT;
BEGIN
  -- Training Load aus training_load_logs abrufen
  SELECT COALESCE(AVG(volume_kg), 0) INTO v_training_load
  FROM recovery.training_load_logs
  WHERE user_id = NEW.user_id
    AND date >= (NEW.date - INTERVAL '7 days')
    AND date < NEW.date;

  -- Nutrition Score via Stored Function (Cross-Schema Call)
  -- In Produktion: via API oder shared view
  v_nutrition := 70;  -- Fallback

  -- Einfache Score-Berechnung (vollständige Implementierung in packages/scoring)
  v_score := GREATEST(0, LEAST(100,
    COALESCE((NEW.sleep_quality::NUMERIC / 10) * 30, 20) +
    COALESCE((LEAST(COALESCE(NEW.sleep_hours, 7), 8) / 8.0) * 15, 10) +
    COALESCE((NEW.subjective_feeling::NUMERIC / 10) * 15, 10) +
    COALESCE((1 - (SELECT COALESCE(AVG(value::NUMERIC), 1)
                   FROM jsonb_each_text(NEW.soreness) s(key, value)) / 3) * 10, 10) +
    (v_training_load / GREATEST(v_training_load + 1, 1)) * 15 +
    (v_nutrition / 100.0) * 10 +
    (CASE NEW.mood
       WHEN 'motivated' THEN 5.0
       WHEN 'good'      THEN 4.0
       WHEN 'neutral'   THEN 3.0
       WHEN 'tired'     THEN 1.5
       WHEN 'sick'      THEN 0.5
       ELSE 3.0
     END)
  ));

  v_readiness := CASE
    WHEN v_score >= 90 THEN 'excellent'
    WHEN v_score >= 80 THEN 'good'
    WHEN v_score >= 70 THEN 'moderate'
    WHEN v_score >= 60 THEN 'poor'
    ELSE 'rest'
  END;

  INSERT INTO recovery.recovery_scores
    (user_id, date, recovery_score, readiness_level,
     sleep_quality_score, sleep_duration_score, subjective_feeling_score,
     training_load_used, nutrition_compliance_used)
  VALUES
    (NEW.user_id, NEW.date, v_score, v_readiness,
     COALESCE((NEW.sleep_quality::NUMERIC / 10) * 100, NULL),
     COALESCE((LEAST(COALESCE(NEW.sleep_hours, 7), 8) / 8.0) * 100, NULL),
     COALESCE((NEW.subjective_feeling::NUMERIC / 10) * 100, NULL),
     v_training_load, v_nutrition)
  ON CONFLICT (user_id, date) DO UPDATE SET
    recovery_score            = EXCLUDED.recovery_score,
    readiness_level           = EXCLUDED.readiness_level,
    sleep_quality_score       = EXCLUDED.sleep_quality_score,
    sleep_duration_score      = EXCLUDED.sleep_duration_score,
    subjective_feeling_score  = EXCLUDED.subjective_feeling_score,
    training_load_used        = EXCLUDED.training_load_used,
    calculated_at             = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_recovery_score
  AFTER INSERT OR UPDATE ON recovery.recovery_checkins
  FOR EACH ROW EXECUTE FUNCTION recovery.compute_recovery_score_after_checkin();
```

---

## 3. recovery.hrv_measurements

```sql
CREATE TABLE recovery.hrv_measurements (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  measured_at          TIMESTAMPTZ NOT NULL,
  measurement_date     DATE NOT NULL,

  rmssd                NUMERIC(6,2),
  pnn50                NUMERIC(5,2),
  heart_rate           NUMERIC(5,1),
  hrv_score            NUMERIC(5,2),

  device_source        TEXT
    CHECK (device_source IN ('hrv4training','oura','whoop','garmin','elite_hrv',
                              'apple_health','google_health','phone_camera','manual')),
  measurement_position TEXT DEFAULT 'lying',
  measurement_duration INTEGER DEFAULT 60,
  measurement_quality  TEXT CHECK (measurement_quality IN ('excellent','good','fair','poor')),
  artifacts_detected   INTEGER DEFAULT 0
);

CREATE INDEX idx_hrv_user_date ON recovery.hrv_measurements(user_id, measurement_date DESC);

ALTER TABLE recovery.hrv_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hrv_owner" ON recovery.hrv_measurements
  USING (auth.uid()::text = user_id::text);
```

---

## 4. recovery.hrv_baselines

```sql
CREATE TABLE recovery.hrv_baselines (
  user_id       UUID PRIMARY KEY,
  avg_rmssd     NUMERIC(6,2) NOT NULL,
  stddev_rmssd  NUMERIC(6,2) NOT NULL,
  min_rmssd     NUMERIC(6,2),
  max_rmssd     NUMERIC(6,2),
  data_points   INTEGER NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE recovery.hrv_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hrv_baseline_owner" ON recovery.hrv_baselines
  USING (auth.uid()::text = user_id::text);
```

---

## 5. recovery.sleep_data

```sql
CREATE TABLE recovery.sleep_data (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  sleep_date           DATE NOT NULL,

  bedtime              TIMESTAMPTZ,
  sleep_start          TIMESTAMPTZ,
  wake_time            TIMESTAMPTZ,
  time_in_bed_minutes  INTEGER,
  total_sleep_minutes  INTEGER,

  deep_sleep_minutes   INTEGER,
  rem_sleep_minutes    INTEGER,
  light_sleep_minutes  INTEGER,
  awake_minutes        INTEGER,

  sleep_efficiency     NUMERIC(5,2),
  sleep_latency_minutes INTEGER,
  wake_frequency       INTEGER,

  sleep_quality_rating SMALLINT,
  grogginess_rating    SMALLINT,

  data_source          TEXT
    CHECK (data_source IN ('oura','whoop','apple_health','google_health',
                            'garmin','eight_sleep','manual')),
  device_confidence    NUMERIC(3,2) DEFAULT 1.0,

  created_at           TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, sleep_date)
);

CREATE INDEX idx_sleep_user_date ON recovery.sleep_data(user_id, sleep_date DESC);

ALTER TABLE recovery.sleep_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sleep_owner" ON recovery.sleep_data
  USING (auth.uid()::text = user_id::text);
```

---

## 6. recovery.recovery_modalities

```sql
CREATE TABLE recovery.recovery_modalities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  date                 DATE NOT NULL,
  modality_type        TEXT NOT NULL
    CHECK (modality_type IN ('sauna','cold_plunge','contrast_therapy','massage',
                              'foam_rolling','stretching','yoga','meditation',
                              'breathwork','nap','active_recovery','other')),

  duration_minutes     INTEGER,
  temperature_c        NUMERIC(4,1),
  intensity            TEXT CHECK (intensity IN ('light','moderate','deep','therapeutic')),
  pressure_level       TEXT,
  location             TEXT CHECK (location IN ('home','gym','spa','clinic','other')),
  provider             TEXT,
  cost_eur             NUMERIC(8,2),

  immediate_effect     SMALLINT CHECK (immediate_effect BETWEEN 1 AND 10),
  next_day_effect      SMALLINT CHECK (next_day_effect BETWEEN 1 AND 10),
  next_day_score_delta NUMERIC(5,2),

  notes                TEXT,
  logged_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_modalities_user_date ON recovery.recovery_modalities(user_id, date DESC);
CREATE INDEX idx_modalities_type      ON recovery.recovery_modalities(user_id, modality_type);

ALTER TABLE recovery.recovery_modalities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modalities_owner" ON recovery.recovery_modalities
  USING (auth.uid()::text = user_id::text);
```

---

## 7. recovery.training_load_logs

```sql
CREATE TABLE recovery.training_load_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  date                 DATE NOT NULL,
  session_id           UUID,

  volume_kg            NUMERIC(10,2),
  intensity_avg_rpe    NUMERIC(3,1),
  session_duration_min INTEGER,

  muscles_worked       JSONB DEFAULT '{}',

  acute_load           NUMERIC(8,2),
  chronic_load         NUMERIC(8,2),
  acwr                 NUMERIC(5,3),

  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_training_load_user_date ON recovery.training_load_logs(user_id, date DESC);

ALTER TABLE recovery.training_load_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "training_load_owner" ON recovery.training_load_logs
  USING (auth.uid()::text = user_id::text);
```

---

## 8. recovery.overtraining_alerts

```sql
CREATE TABLE recovery.overtraining_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  alert_date       DATE NOT NULL,
  alert_type       TEXT,
  severity         TEXT NOT NULL
    CHECK (severity IN ('low','moderate','high','critical')),

  signals_count    INTEGER,
  signals          JSONB DEFAULT '[]',
  days_exceeded    INTEGER,

  recommended_action     TEXT,
  rest_days_suggested    INTEGER,
  training_modifications TEXT[] DEFAULT '{}',
  recovery_protocols     TEXT[] DEFAULT '{}',

  status           TEXT DEFAULT 'active'
    CHECK (status IN ('active','acknowledged','resolved')),
  acknowledged_at  TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_user ON recovery.overtraining_alerts(user_id, alert_date DESC);
CREATE INDEX idx_alerts_status ON recovery.overtraining_alerts(user_id, status);

ALTER TABLE recovery.overtraining_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_owner" ON recovery.overtraining_alerts
  USING (auth.uid()::text = user_id::text);
```

---

## 9. recovery.recovery_protocols + user_protocol_assignments

```sql
CREATE TABLE recovery.recovery_protocols (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  name_de                TEXT,
  description            TEXT,
  protocol_type          TEXT CHECK (protocol_type IN ('active','passive','therapeutic','preventive')),
  target_condition       TEXT,
  duration_days          INTEGER,
  daily_activities       JSONB DEFAULT '{}',
  modalities_recommended TEXT[] DEFAULT '{}',
  training_modifications TEXT[] DEFAULT '{}',
  nutrition_guidelines   TEXT[] DEFAULT '{}',
  evidence_level         TEXT CHECK (evidence_level IN ('S','A','B','C')),
  is_active              BOOLEAN DEFAULT true,
  created_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recovery.user_protocol_assignments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  protocol_id          UUID NOT NULL REFERENCES recovery.recovery_protocols(id),
  assigned_date        DATE NOT NULL,
  target_end_date      DATE,
  assigned_by          TEXT CHECK (assigned_by IN ('ai_coach','human_coach','self')),
  days_completed       INTEGER DEFAULT 0,
  compliance_rate      NUMERIC(5,2),
  effectiveness_rating SMALLINT CHECK (effectiveness_rating BETWEEN 1 AND 10),
  status               TEXT DEFAULT 'active'
    CHECK (status IN ('active','completed','discontinued')),
  progress_notes       TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE recovery.user_protocol_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_owner" ON recovery.user_protocol_assignments
  USING (auth.uid()::text = user_id::text);
```

---

## 10. VIEWs

### weekly_recovery_stats (Materialized)

```sql
CREATE MATERIALIZED VIEW recovery.weekly_recovery_stats AS
SELECT
  rs.user_id,
  DATE_TRUNC('week', rs.date)::DATE AS week_start,
  AVG(rs.recovery_score)            AS avg_score,
  AVG(rc.sleep_hours)               AS avg_sleep_hours,
  AVG(rc.sleep_quality)             AS avg_sleep_quality,
  AVG(hrv.rmssd)                    AS avg_hrv_rmssd,
  COUNT(DISTINCT rs.date)           AS checkin_days,
  STDDEV(rs.recovery_score)         AS score_variability,
  CASE
    WHEN AVG(rs.recovery_score) > LAG(AVG(rs.recovery_score))
         OVER (PARTITION BY rs.user_id ORDER BY DATE_TRUNC('week', rs.date))
    THEN 'improving'
    WHEN AVG(rs.recovery_score) < LAG(AVG(rs.recovery_score))
         OVER (PARTITION BY rs.user_id ORDER BY DATE_TRUNC('week', rs.date))
    THEN 'declining'
    ELSE 'stable'
  END AS trend_direction
FROM recovery.recovery_scores rs
LEFT JOIN recovery.recovery_checkins rc ON rc.user_id = rs.user_id AND rc.date = rs.date
LEFT JOIN recovery.hrv_measurements hrv ON hrv.user_id = rs.user_id
  AND hrv.measurement_date = rs.date
GROUP BY rs.user_id, DATE_TRUNC('week', rs.date);

CREATE INDEX idx_weekly_stats_user ON recovery.weekly_recovery_stats(user_id, week_start DESC);
```

### muscle_readiness VIEW

```sql
CREATE OR REPLACE VIEW recovery.muscle_readiness AS
SELECT
  tl.user_id,
  muscle_data.key                    AS muscle_group,
  MAX(tl.date)                       AS last_trained_date,
  EXTRACT(EPOCH FROM (now() - MAX(tl.date::TIMESTAMPTZ))) / 3600 AS hours_since_trained,
  SUM((muscle_data.value->>'sets')::INTEGER)   AS total_sets,
  SUM((muscle_data.value->>'volume_kg')::NUMERIC) AS total_volume
FROM recovery.training_load_logs tl,
     LATERAL jsonb_each(tl.muscles_worked) AS muscle_data
WHERE tl.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY tl.user_id, muscle_data.key;
```

### modality_effectiveness VIEW

```sql
CREATE OR REPLACE VIEW recovery.modality_effectiveness AS
SELECT
  rm.user_id,
  rm.modality_type,
  AVG(rm.immediate_effect)                             AS avg_immediate,
  AVG(rm.next_day_effect)                              AS avg_next_day,
  AVG(rm.next_day_score_delta)                         AS avg_score_delta,
  COUNT(*)                                             AS usage_count,
  AVG(rm.cost_eur)                                     AS avg_cost,
  CASE WHEN AVG(rm.cost_eur) > 0
    THEN AVG(rm.next_day_score_delta) / AVG(rm.cost_eur)
    ELSE NULL
  END                                                  AS roi_per_euro
FROM recovery.recovery_modalities rm
WHERE rm.next_day_score_delta IS NOT NULL
GROUP BY rm.user_id, rm.modality_type
HAVING COUNT(*) >= 3;
```

---

## 11. Grants

```sql
GRANT USAGE ON SCHEMA recovery TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA recovery TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA recovery TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA recovery TO authenticated, service_role;

-- Recovery Protocols: read-only für User
REVOKE INSERT, UPDATE, DELETE ON recovery.recovery_protocols FROM authenticated;
CREATE POLICY "protocols_select" ON recovery.recovery_protocols FOR SELECT USING (is_active = true);
```
