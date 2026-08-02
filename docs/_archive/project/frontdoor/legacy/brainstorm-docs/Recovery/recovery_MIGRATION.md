# Recovery Module Migration Documentation

## Legacy System Migration

### Migration Overview
The Recovery module consolidates data and functionality from multiple legacy systems and integrates with existing Lumeos modules to provide comprehensive recovery tracking and analysis.

### Data Sources Migrated

#### From Legacy Training Apps
- Sleep duration and quality logs
- Subjective recovery ratings
- Training load and fatigue data
- Rest day tracking

#### From Wearable Devices
- HRV measurements from various sources
- Sleep stage data
- Resting heart rate trends
- Activity and stress metrics

#### From Manual Tracking Systems
- Recovery modality logs (sauna, massage, etc.)
- Soreness and pain tracking
- Mood and energy assessments
- Supplement and nutrition impacts

## Database Schema Evolution

### Migration Scripts

#### Initial Schema Creation
```sql
-- Migration: 001_create_recovery_tables.sql
CREATE TABLE recovery_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER,
  subjective_feeling INTEGER,
  mood VARCHAR(20),
  soreness JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  recovery_score NUMERIC(5,2) NOT NULL,
  sleep_quality_score NUMERIC(5,2),
  sleep_duration_score NUMERIC(5,2),
  subjective_feeling_score NUMERIC(5,2),
  soreness_score NUMERIC(5,2),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_recovery_checkins_user_date ON recovery_checkins(user_id, date);
CREATE INDEX idx_recovery_scores_user_date ON recovery_scores(user_id, date);
```

#### Adding HRV Support
```sql
-- Migration: 002_add_hrv_tracking.sql
CREATE TABLE hrv_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL,
  measurement_date DATE NOT NULL,
  rmssd NUMERIC(6,2),
  heart_rate NUMERIC(5,1),
  hrv_score NUMERIC(5,2),
  device_source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add HRV component to recovery scores
ALTER TABLE recovery_scores ADD COLUMN hrv_score NUMERIC(5,2);

CREATE INDEX idx_hrv_measurements_user_date ON hrv_measurements(user_id, measurement_date);
```

#### Recovery Modalities Support
```sql
-- Migration: 003_add_recovery_modalities.sql
CREATE TABLE recovery_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modality_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  duration_minutes INTEGER,
  intensity VARCHAR(20),
  immediate_effect INTEGER,
  next_day_effect INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add modality bonus to recovery scores
ALTER TABLE recovery_scores ADD COLUMN modality_bonus NUMERIC(4,2);

CREATE INDEX idx_recovery_modalities_user_date ON recovery_modalities(user_id, date);
```

#### Enhanced Sleep Tracking
```sql
-- Migration: 004_enhance_sleep_tracking.sql
CREATE TABLE sleep_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  total_sleep_minutes INTEGER,
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  sleep_efficiency NUMERIC(5,2),
  data_source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sleep_date)
);

-- Enhanced checkins table
ALTER TABLE recovery_checkins 
ADD COLUMN sleep_start_time TIME,
ADD COLUMN sleep_end_time TIME,
ADD COLUMN energy_level INTEGER,
ADD COLUMN stress_level INTEGER;
```

#### Overtraining Detection
```sql
-- Migration: 005_overtraining_alerts.sql
CREATE TABLE overtraining_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_date DATE NOT NULL,
  alert_type VARCHAR(30),
  severity VARCHAR(20),
  trigger_metric VARCHAR(30),
  actual_value NUMERIC(8,2),
  recommended_action TEXT,
  status VARCHAR(20) DEFAULT 'active',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overtraining_alerts_user_date ON overtraining_alerts(user_id, alert_date);
```

## API Endpoint Migration

### Legacy Endpoint Mapping

#### Old Recovery API → New Recovery API
```
Legacy: /api/v1/recovery/daily/{date}
New:    /api/recovery/checkin?date={date}
Method: GET → GET (unchanged)
```

#### Endpoint Consolidation
```
Legacy: /api/v1/sleep/{date}
Legacy: /api/v1/mood/{date}  
Legacy: /api/v1/soreness/{date}
New:    /api/recovery/checkin (consolidated)
Method: Multiple GET → Single POST (upsert)
```

#### Score Calculation Migration
```
Legacy: /api/v1/recovery/score/{date}
New:    /api/recovery/score?date={date}
Changes: Enhanced algorithm with more components
```

### Breaking Changes

#### Response Format Updates
```json
// Legacy format
{
  "sleep_quality": 8,
  "recovery_rating": 75
}

// New format  
{
  "ok": true,
  "data": {
    "sleep_quality": 8,
    "recovery_score": 78.5,
    "components": {
      "sleep_quality_score": 24.0,
      "sleep_duration_score": 14.1,
      "total": 78.5
    }
  }
}
```

#### Error Handling Standardization
```json
// Legacy errors (inconsistent)
{ "error": "Not found" }
{ "message": "Invalid date" }

// New standardized format
{
  "ok": false,
  "error": "Recovery check-in not found for date",
  "code": "RECOVERY_NOT_FOUND"
}
```

## Data Migration Procedures

### User Data Migration
```sql
-- Migrate legacy recovery data
INSERT INTO recovery_checkins (
  user_id, date, sleep_hours, sleep_quality, 
  subjective_feeling, mood, notes
)
SELECT 
  user_id,
  log_date,
  sleep_duration,
  sleep_rating,
  energy_rating,
  CASE mood_score 
    WHEN 5 THEN 'motivated'
    WHEN 4 THEN 'good' 
    WHEN 3 THEN 'neutral'
    WHEN 2 THEN 'tired'
    WHEN 1 THEN 'sick'
  END,
  notes
FROM legacy_recovery_logs
WHERE created_at >= '2023-01-01';
```

### Device Data Integration
```sql
-- Migrate HRV data from various sources
INSERT INTO hrv_measurements (
  user_id, measured_at, measurement_date, 
  rmssd, heart_rate, device_source
)
SELECT 
  user_id,
  timestamp,
  DATE(timestamp),
  rmssd_value,
  avg_hr,
  'hrv4training'
FROM legacy_hrv_data
WHERE timestamp >= '2023-01-01';
```

### Score Recalculation
```sql
-- Recalculate recovery scores with new algorithm
UPDATE recovery_scores 
SET 
  recovery_score = calculate_recovery_score_v2(
    sleep_quality_score,
    sleep_duration_score, 
    subjective_feeling_score,
    soreness_score,
    hrv_score,
    modality_bonus
  ),
  algorithm_version = 'v2.0'
WHERE calculated_at < '2026-01-01';
```

## Configuration Migration

### Environment Variables
```bash
# Legacy configuration
RECOVERY_API_URL=http://localhost:3005
SLEEP_TRACKER_KEY=legacy_key_123
HRV_DEVICE_TOKENS=token1,token2

# New configuration  
RECOVERY_API_PORT=5400
RECOVERY_DB_URL=postgresql://...
HRV_INTEGRATIONS_ENABLED=true
OVERTRAINING_ALERTS_ENABLED=true
```

### Feature Flag Migration
```typescript
// Legacy feature flags
interface LegacyFeatures {
  sleepTracking: boolean;
  hrvMonitoring: boolean;
  recoveryScoring: boolean;
}

// New feature configuration
interface RecoveryFeatures {
  dailyCheckins: boolean;
  automaticScoring: boolean;
  overtrainingDetection: boolean;
  deviceIntegrations: boolean;
  modalityTracking: boolean;
  stressManagement: boolean;
}
```

## Component Migration

### Frontend Component Updates

#### Recovery Dashboard Migration
```typescript
// Legacy component structure
interface LegacyRecoveryDashboard {
  sleepData: SleepMetrics;
  recoveryRating: number;
  mood: string;
}

// New component structure  
interface RecoveryDashboard {
  todayStatus: RecoveryStatus;
  weekTrend: RecoveryTrend[];
  alerts: OvertrainingAlert[];
  recommendations: RecoveryRecommendation[];
}
```

#### Sleep Tracker Migration
```typescript
// Consolidate multiple sleep components
// Legacy: SleepDuration + SleepQuality + SleepNotes
// New: Unified MorningCheckin component

// Old imports
import SleepDuration from './SleepDuration';
import SleepQuality from './SleepQuality';
import SleepNotes from './SleepNotes';

// New import
import MorningCheckin from './MorningCheckin';
```

## Testing Migration

### Test Data Migration
```sql
-- Create test recovery data for development
INSERT INTO recovery_checkins (user_id, date, sleep_hours, sleep_quality, subjective_feeling, mood)
VALUES 
  ('test-user-1', '2026-03-20', 7.5, 8, 7, 'good'),
  ('test-user-1', '2026-03-21', 8.0, 9, 8, 'motivated'),
  ('test-user-1', '2026-03-22', 6.5, 6, 5, 'tired');
```

### API Test Updates
```typescript
// Legacy test
describe('Recovery API v1', () => {
  it('should return sleep data', async () => {
    const response = await request(app)
      .get('/api/v1/sleep/2026-03-20')
      .expect(200);
    expect(response.body.sleep_hours).toBe(7.5);
  });
});

// New consolidated test
describe('Recovery API v2', () => {
  it('should return complete recovery check-in', async () => {
    const response = await request(app)
      .get('/api/recovery/checkin?date=2026-03-20')
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.sleep_hours).toBe(7.5);
    expect(response.body.data.recovery_score).toBeGreaterThan(0);
  });
});
```

## Known Issues and Solutions

### Migration Challenges

#### Data Inconsistency
**Problem**: Legacy systems used different scales (1-5 vs 1-10)
**Solution**: Normalization functions in migration scripts
```sql
-- Normalize legacy 1-5 scale to 1-10
UPDATE recovery_checkins 
SET sleep_quality = sleep_quality * 2 
WHERE sleep_quality <= 5 AND created_at < '2026-01-01';
```

#### Missing Data Points
**Problem**: Legacy data missing required fields for new algorithm
**Solution**: Default values and progressive data collection
```sql
-- Set default values for missing fields
UPDATE recovery_checkins 
SET 
  energy_level = COALESCE(energy_level, subjective_feeling),
  stress_level = COALESCE(stress_level, 5)
WHERE created_at < '2026-01-01';
```

#### Device Integration Conflicts
**Problem**: Multiple devices providing conflicting data
**Solution**: Data source priority and conflict resolution
```typescript
const dataPriority = {
  'oura': 1,
  'whoop': 2, 
  'apple_health': 3,
  'manual': 4
};

function resolveConflictingData(measurements: HRVMeasurement[]) {
  return measurements.sort((a, b) => 
    dataPriority[a.device_source] - dataPriority[b.device_source]
  )[0];
}
```

### Performance Issues

#### Query Optimization
```sql
-- Add missing indexes discovered during migration
CREATE INDEX CONCURRENTLY idx_recovery_scores_score ON recovery_scores(recovery_score);
CREATE INDEX CONCURRENTLY idx_hrv_measurements_source ON hrv_measurements(device_source);
CREATE INDEX CONCURRENTLY idx_recovery_checkins_mood ON recovery_checkins(mood);
```

#### Data Archival Strategy
```sql
-- Archive old data to improve performance
CREATE TABLE recovery_checkins_archive (LIKE recovery_checkins);

-- Move data older than 2 years
WITH archived AS (
  DELETE FROM recovery_checkins 
  WHERE created_at < NOW() - INTERVAL '2 years'
  RETURNING *
)
INSERT INTO recovery_checkins_archive SELECT * FROM archived;
```

## Rollback Procedures

### Database Rollback
```sql
-- Rollback migration 005 (overtraining alerts)
DROP TABLE IF EXISTS overtraining_alerts;
ALTER TABLE recovery_scores DROP COLUMN IF EXISTS alert_status;

-- Rollback migration 004 (enhanced sleep)
DROP TABLE IF EXISTS sleep_data;
ALTER TABLE recovery_checkins 
  DROP COLUMN IF EXISTS sleep_start_time,
  DROP COLUMN IF EXISTS sleep_end_time,
  DROP COLUMN IF EXISTS energy_level;
```

### API Version Rollback
```typescript
// Maintain legacy API endpoints during transition
app.use('/api/v1', legacyRecoveryRouter);
app.use('/api/recovery', newRecoveryRouter);

// Feature flag for gradual rollout
if (config.USE_LEGACY_RECOVERY_API) {
  app.use('/api/recovery', legacyRecoveryRouter);
}
```

### Component Rollback
```typescript
// Conditional component rendering
const RecoveryDashboard = config.USE_NEW_RECOVERY_UI 
  ? NewRecoveryDashboard 
  : LegacyRecoveryDashboard;
```

## Post-Migration Validation

### Data Integrity Checks
```sql
-- Verify migration completeness
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT user_id) as users_with_recovery_data,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM recovery_checkins;

-- Check for data anomalies
SELECT 
  user_id,
  date,
  recovery_score
FROM recovery_scores 
WHERE recovery_score < 0 OR recovery_score > 100;
```

### Performance Validation
```sql
-- Monitor query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM recovery_checkins 
WHERE user_id = 'test-user' 
AND date >= CURRENT_DATE - INTERVAL '30 days';
```

### User Acceptance Testing
- Verify all legacy functionality works in new system
- Test new features with beta users
- Monitor error rates and user feedback
- Gradual rollout to production users

## Documentation Updates

### API Documentation
- Update all endpoint documentation
- Add migration guides for API consumers
- Document breaking changes and compatibility

### User Documentation  
- Update help articles for new UI
- Create migration guides for users
- Document new features and capabilities

### Developer Documentation
- Update integration guides
- Document new database schema
- Provide troubleshooting guides