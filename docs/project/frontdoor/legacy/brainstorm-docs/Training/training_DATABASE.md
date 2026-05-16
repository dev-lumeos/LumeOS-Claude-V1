# Training Database Schema

## Core Exercise Tables

### exercises
Primary exercise database with 1,448+ exercises.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category VARCHAR(50), -- strength, cardio, flexibility, plyometric
  description TEXT,
  instructions TEXT,
  
  -- Muscle targeting
  primary_muscle VARCHAR(50),
  secondary_muscles TEXT[],
  body_region VARCHAR(50), -- upper_body, lower_body, full_body
  
  -- Equipment and setup
  equipment VARCHAR(50),
  equipment_needed TEXT[],
  difficulty VARCHAR(20), -- beginner, intermediate, advanced, expert
  
  -- Exercise classification
  exercise_type VARCHAR(50), -- compound, isolation, unilateral
  movement_pattern VARCHAR(50), -- push, pull, squat, hinge, carry
  discipline VARCHAR(50), -- bodybuilding, powerlifting, olympic, general
  
  -- Media and resources
  media_urls TEXT[], -- Video and image URLs
  demo_video_url TEXT,
  form_cues TEXT[],
  common_mistakes TEXT[],
  
  -- Metadata
  popularity_score INTEGER DEFAULT 0,
  safety_rating INTEGER, -- 1-5 scale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_exercises_name` on `name`
- `idx_exercises_category` on `category`
- `idx_exercises_primary_muscle` on `primary_muscle`
- `idx_exercises_equipment` on `equipment`

**Data:** 1,448+ exercises with comprehensive metadata

### muscle_groups
Standardized muscle group definitions.

```sql
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  body_region VARCHAR(50), -- upper_body, lower_body, core
  parent_group VARCHAR(100), -- For sub-muscles (e.g., anterior deltoid)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data:** 157 muscle groups including sub-groups

### equipment
Equipment definitions for exercises.

```sql  
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- free_weights, machines, bodyweight, cardio
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data:** 61+ equipment types

### exercise_muscles  
Many-to-many relationship between exercises and muscles.

```sql
CREATE TABLE exercise_muscles (
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  involvement VARCHAR(20), -- primary, secondary, stabilizer
  
  PRIMARY KEY (exercise_id, muscle_group_id)
);
```

## Workout Tracking Tables

### workout_sessions
Individual workout sessions.

```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id),
  
  -- Session timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Session metrics (calculated)
  total_volume_kg NUMERIC(10,2), -- Sum of all sets volume
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  avg_rest_seconds INTEGER,
  
  -- Session data
  name TEXT,
  notes TEXT,
  location VARCHAR(100),
  mood_before VARCHAR(20), -- energized, tired, motivated, etc.
  mood_after VARCHAR(20),
  perceived_exertion INTEGER, -- 1-10 overall session RPE
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_workout_sessions_user_id_date` on `(user_id, DATE(started_at))`
- `idx_workout_sessions_status` on `status`

### workout_exercises  
Exercises within workout sessions.

```sql
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  
  exercise_order INTEGER NOT NULL,
  
  -- Exercise configuration  
  planned_sets INTEGER,
  planned_reps VARCHAR(20), -- "8-10", "AMRAP", etc.
  planned_weight_kg NUMERIC(8,2),
  planned_rest_seconds INTEGER,
  
  -- Actual performance (calculated from sets)
  actual_sets INTEGER DEFAULT 0,
  actual_volume_kg NUMERIC(10,2) DEFAULT 0,
  max_weight_kg NUMERIC(8,2),
  total_reps INTEGER DEFAULT 0,
  avg_rpe NUMERIC(3,1),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_workout_exercises_session_id` on `workout_session_id`
- `idx_workout_exercises_exercise_id` on `exercise_id`

### workout_sets
Individual sets within workout exercises.

```sql
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  
  set_number INTEGER NOT NULL,
  
  -- Set performance
  reps INTEGER NOT NULL,
  weight_kg NUMERIC(8,2),
  rpe INTEGER, -- Rate of Perceived Exertion (1-10)
  rest_seconds INTEGER,
  
  -- Set metadata
  set_type VARCHAR(20) DEFAULT 'working', -- working, warmup, dropset, failure
  tempo VARCHAR(20), -- "2-1-2-1" (eccentric-pause-concentric-pause)
  notes TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(workout_exercise_id, set_number)
);
```

**Indexes:**
- `idx_workout_sets_workout_exercise_id` on `workout_exercise_id`

## Routine System

### routines  
Training routine templates.

```sql
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50), -- strength, hypertrophy, powerlifting, etc.
  
  -- Routine structure
  frequency_per_week INTEGER,
  estimated_duration_minutes INTEGER,
  difficulty VARCHAR(20), -- beginner, intermediate, advanced
  
  -- Routine metadata
  is_template BOOLEAN DEFAULT FALSE, -- System template vs user routine
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  
  -- Usage statistics
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_routines_user_id` on `user_id`
- `idx_routines_category` on `category`

### routine_exercises
Exercises within routine templates.

```sql
CREATE TABLE routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  
  exercise_order INTEGER NOT NULL,
  
  -- Exercise prescription
  sets INTEGER NOT NULL,
  reps VARCHAR(20), -- "8-10", "3-5", "AMRAP"
  weight_type VARCHAR(20), -- percentage, fixed, bodyweight
  weight_value NUMERIC(8,2), -- %1RM or fixed weight
  rest_seconds INTEGER,
  
  -- Progressive overload config
  progression_model VARCHAR(20), -- linear, double, wave, rpe
  progression_rate NUMERIC(5,4), -- e.g., 0.025 = 2.5% increase
  
  notes TEXT,
  
  UNIQUE(routine_id, exercise_order)
);
```

**Indexes:**
- `idx_routine_exercises_routine_id` on `routine_id`

## Progressive Overload System

### exercise_progression_config
Per-exercise progression configuration.

```sql
CREATE TABLE exercise_progression_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  
  -- Progression settings
  progression_model VARCHAR(50) DEFAULT 'linear',
  progression_rate NUMERIC(5,4) DEFAULT 0.025, -- 2.5% increase
  
  -- Deload settings
  deload_threshold INTEGER DEFAULT 3, -- Failed sessions before deload
  deload_percentage NUMERIC(5,4) DEFAULT 0.10, -- 10% deload
  
  -- RPE settings
  target_rpe INTEGER DEFAULT 8,
  rpe_range_lower INTEGER DEFAULT 7,
  rpe_range_upper INTEGER DEFAULT 9,
  
  -- Wave periodization
  wave_week INTEGER DEFAULT 1, -- Current week in wave (1-4)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, exercise_id)
);
```

## Analytics & Performance Tables

### strength_standards
Reference strength standards for exercises.

```sql
CREATE TABLE strength_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  
  bodyweight_kg_lower NUMERIC(5,1),
  bodyweight_kg_upper NUMERIC(5,1),
  gender VARCHAR(10),
  
  -- Standards by level (bodyweight multipliers)
  beginner NUMERIC(4,2),
  novice NUMERIC(4,2),
  intermediate NUMERIC(4,2),
  advanced NUMERIC(4,2),
  elite NUMERIC(4,2),
  
  UNIQUE(exercise_id, bodyweight_kg_lower, gender)
);
```

### personal_records
User personal records for exercises.

```sql
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  
  -- PR data
  weight_kg NUMERIC(8,2) NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm NUMERIC(8,2), -- Calculated 1RM
  
  -- Context
  bodyweight_kg NUMERIC(5,1),
  workout_session_id UUID REFERENCES workout_sessions(id),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  video_url TEXT, -- PR attempt video
  notes TEXT
);
```

**Indexes:**
- `idx_personal_records_user_exercise` on `(user_id, exercise_id)`
- `idx_personal_records_achieved_at` on `achieved_at`

## Data Statistics
- **Exercises:** 1,448+ exercises
- **Muscle Groups:** 157 muscle groups
- **Equipment Types:** 61+ equipment items  
- **Exercise Media:** 4,633+ videos and images
- **Categories:** 10+ exercise categories
- **Movement Patterns:** 6+ fundamental patterns

## Performance Optimizations
- Composite indexes for user-date queries
- Pre-calculated volume totals in workout sessions
- Cached personal records for quick access
- Efficient exercise search with multiple filters
- Optimized muscle group lookups

## Training Load Calculations

### Volume Load
```sql
-- Weekly volume per muscle group
SELECT 
  muscle_group,
  SUM(reps * weight_kg) as volume_load
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workout_sessions wses ON we.workout_session_id = wses.id
JOIN exercises e ON we.exercise_id = e.id
WHERE wses.user_id = $1
  AND wses.started_at >= current_date - interval '7 days'
GROUP BY muscle_group;
```

### Estimated 1RM
Uses Brzycki formula: `weight / (1.0278 - 0.0278 * reps)`

### Training Intensity
Based on %1RM and RPE correlation for autoregulation.

## Backup & Recovery
- Real-time workout backup during active sessions
- Offline workout capability with sync when online
- Exercise database updates via migration system
- Personal record history preservation