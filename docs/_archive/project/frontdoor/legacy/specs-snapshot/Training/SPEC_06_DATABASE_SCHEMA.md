# Training Module — Database Schema
> Spec Phase 6 | Vollständiges SQL-Schema

---

```sql
CREATE SCHEMA IF NOT EXISTS training;
SET search_path = training, public;
```

## Tabellen-Index

| Tabelle | Typ | Beschreibung |
|---|---|---|
| `training.muscle_groups` | Stammdaten | 157 Muskelgruppen |
| `training.equipment` | Stammdaten | ~40 kanonische Equipment-Typen |
| `training.exercises` | Stammdaten | 1.200+ Übungen |
| `training.exercise_aliases` | Stammdaten | Such-Aliase |
| `training.exercise_muscles` | Stammdaten | Exercise ↔ MuscleGroup (M:N) |
| `training.strength_standards` | Stammdaten | Referenz-Kraftwerte |
| `training.routines` | User-Daten | Workout-Vorlagen |
| `training.routine_exercises` | User-Daten | Exercises in Routine |
| `training.routine_schedule_days` | User-Daten | Wochenplan-Zuweisung |
| `training.workout_sessions` | User-Daten | Absolvierte Sessions |
| `training.workout_exercises` | User-Daten | Exercises in Session |
| `training.workout_sets` | User-Daten | Einzelne Sätze |
| `training.personal_records` | User-Daten | PRs pro Exercise |
| `training.exercise_progression_configs` | User-Daten | Progression-Konfiguration |
| `training.post_workout_feedback` | User-Daten | Pump/Soreness-Feedback |
| `training.volume_landmarks` | User-Daten | Personalisierte MV/MAV/MRV |
| `training.weekly_volume_summary` | VIEW | Wöchentliches Volumen |
| `training.muscle_readiness` | VIEW | Muskel-Erholung |

---

## 1. training.muscle_groups

```sql
CREATE TABLE training.muscle_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  name_de       TEXT,
  name_en       TEXT,
  name_th       TEXT,
  body_region   TEXT NOT NULL
    CHECK (body_region IN ('chest','back','shoulders','arms','core','legs','full_body')),
  parent_id     UUID REFERENCES training.muscle_groups(id),
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_muscle_groups_region ON training.muscle_groups(body_region);
ALTER TABLE training.muscle_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "muscle_groups_select" ON training.muscle_groups FOR SELECT USING (true);
```

### Seed (Auswahl — vollständige Liste im Import-Script)

```sql
INSERT INTO training.muscle_groups (name, name_de, name_en, body_region) VALUES
-- Brust
('Pectoralis Major',      'Großer Brustmuskel',          'Pectoralis Major',      'chest'),
('Upper Chest',           'Obere Brust (Clavicular)',     'Upper Chest',           'chest'),
('Lower Chest',           'Untere Brust (Costal)',        'Lower Chest',           'chest'),
-- Rücken
('Latissimus Dorsi',      'Breiter Rückenmuskel',         'Latissimus Dorsi',      'back'),
('Rhomboids',             'Rautenmuskel',                 'Rhomboids',             'back'),
('Lower Back',            'Unterer Rücken',               'Lower Back',            'back'),
-- Schultern
('Anterior Deltoid',      'Vorderer Deltamuskel',         'Anterior Deltoid',      'shoulders'),
('Lateral Deltoid',       'Seitlicher Deltamuskel',       'Lateral Deltoid',       'shoulders'),
('Posterior Deltoid',     'Hinterer Deltamuskel',         'Posterior Deltoid',     'shoulders'),
-- Arme
('Biceps Brachii',        'Bizeps',                       'Biceps Brachii',        'arms'),
('Triceps Brachii',       'Trizeps',                      'Triceps Brachii',       'arms'),
('Brachialis',            'Musculus brachialis',          'Brachialis',            'arms'),
('Forearms',              'Unterarme',                    'Forearms',              'arms'),
-- Core
('Rectus Abdominis',      'Gerader Bauchmuskel',          'Rectus Abdominis',      'core'),
('Obliques',              'Schräge Bauchmuskeln',         'Obliques',              'core'),
('Transverse Abdominis',  'Querer Bauchmuskel',           'Transverse Abdominis',  'core'),
('Hip Flexors',           'Hüftbeuger',                   'Hip Flexors',           'core'),
-- Beine
('Quadriceps',            'Quadrizeps',                   'Quadriceps',            'legs'),
('Hamstrings',            'Hintere Oberschenkelmuskulatur','Hamstrings',            'legs'),
('Gluteus Maximus',       'Großer Gesäßmuskel',           'Gluteus Maximus',       'legs'),
('Gluteus Medius',        'Mittlerer Gesäßmuskel',        'Gluteus Medius',        'legs'),
('Calves',                'Wadenmuskulatur',              'Calves',                'legs'),
('Adductors',             'Adduktoren',                   'Adductors',             'legs');
```

---

## 2. training.equipment

```sql
CREATE TABLE training.equipment (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL UNIQUE,
  name_de   TEXT,
  name_en   TEXT,
  name_th   TEXT,
  category  TEXT NOT NULL
    CHECK (category IN ('free_weight','machine','cable','bodyweight','band','cardio','other')),
  icon      TEXT
);

ALTER TABLE training.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_select" ON training.equipment FOR SELECT USING (true);
```

### Seed (kanonische ~40 Equipment-Typen)

```sql
INSERT INTO training.equipment (name, name_de, category) VALUES
('Barbell',            'Langhantel',             'free_weight'),
('Dumbbell',           'Kurzhantel',             'free_weight'),
('EZ-Bar',             'EZ-Stange',              'free_weight'),
('Trap Bar',           'Trap-Stange',            'free_weight'),
('Kettlebell',         'Kettlebell',             'free_weight'),
('Cable Machine',      'Kabelzug',               'cable'),
('Smith Machine',      'Smith-Maschine',         'machine'),
('Leg Press Machine',  'Beinpresse',             'machine'),
('Lat Pulldown Machine','Lat-Zug-Maschine',      'machine'),
('Chest Press Machine','Brustpresse',            'machine'),
('Leg Curl Machine',   'Beinbeuger-Maschine',    'machine'),
('Leg Extension Machine','Beinstrecker',         'machine'),
('Cable Row Machine',  'Rudermaschine (Kabel)',  'machine'),
('Pull-Up Bar',        'Klimmzugstange',         'bodyweight'),
('Dip Station',        'Dip-Stange',             'bodyweight'),
('Bench',              'Bank',                   'other'),
('Incline Bench',      'Schrägbank',             'other'),
('Preacher Bench',     'Scottbank',              'other'),
('Ab Roller',          'Bauchrad',               'other'),
('Resistance Band',    'Widerstandsband',        'band'),
('Mini Band',          'Mini-Band',              'band'),
('Treadmill',          'Laufband',               'cardio'),
('Rowing Machine',     'Rudergerät',             'cardio'),
('Stationary Bike',    'Fahrradergometer',       'cardio'),
('Elliptical',         'Crosstrainer',           'cardio'),
('Box',                'Sprungbox',              'other'),
('Medicine Ball',      'Medizinball',            'other'),
('None (Bodyweight)',  'Kein Equipment nötig',   'bodyweight'),
('TRX / Suspension',  'TRX / Schlingentrainer', 'other'),
('Foam Roller',        'Schaumstoffrolle',       'other');
```

---

## 3. training.exercises

```sql
CREATE TABLE training.exercises (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  name_de              TEXT,
  name_en              TEXT,
  name_th              TEXT,

  -- Klassifikation
  category             TEXT NOT NULL
    CHECK (category IN ('Bodyweight','Free Weights','Resistance','Cardio','Stretching')),
  exercise_type        TEXT DEFAULT 'strength'
    CHECK (exercise_type IN ('strength','cardio','stretching','yoga','calisthenics','plyometric')),
  tracking_type        TEXT NOT NULL DEFAULT 'weight_reps'
    CHECK (tracking_type IN ('weight_reps','reps_only','duration','distance_duration')),
  movement_pattern     TEXT
    CHECK (movement_pattern IN ('push','pull','squat','hinge','carry','rotation','other')),
  discipline           TEXT DEFAULT 'general'
    CHECK (discipline IN ('bodybuilding','powerlifting','olympic','general')),
  difficulty           TEXT DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner','intermediate','advanced')),

  -- Equipment (FK)
  equipment_id         UUID REFERENCES training.equipment(id),

  -- Media (Cloudflare R2 URLs)
  image_male_start     TEXT,
  image_male_end       TEXT,
  image_female_start   TEXT,
  image_female_end     TEXT,
  video_url            TEXT,

  -- Inhalte (3-sprachig, 1.850/1.850 übersetzt)
  instructions         TEXT,
  instructions_de      TEXT,
  instructions_th      TEXT,
  tips                 TEXT,
  tips_de              TEXT,
  tips_th              TEXT,
  common_mistakes      TEXT[],

  -- Science Layer
  evaluation_score     INTEGER CHECK (evaluation_score BETWEEN 0 AND 100),
  sfr_rating           NUMERIC(3,2),         -- Stimulus-to-Fatigue Ratio
  stretch_position     BOOLEAN DEFAULT false,
  mechanical_tension   TEXT CHECK (mechanical_tension IN ('high','medium','low')),

  -- Sort & Meta
  sort_weight          INTEGER DEFAULT 500 CHECK (sort_weight BETWEEN 0 AND 1000),
  popularity_score     INTEGER DEFAULT 0,
  safety_rating        INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  source               TEXT DEFAULT 'exercise_animatic',
  is_active            BOOLEAN DEFAULT true,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_exercises_name_trgm ON training.exercises
  USING GIN (name gin_trgm_ops);
CREATE INDEX idx_exercises_name_de_trgm ON training.exercises
  USING GIN (name_de gin_trgm_ops);
CREATE INDEX idx_exercises_category    ON training.exercises(category);
CREATE INDEX idx_exercises_sort_weight ON training.exercises(sort_weight DESC);
CREATE INDEX idx_exercises_equipment   ON training.exercises(equipment_id);
CREATE INDEX idx_exercises_tracking    ON training.exercises(tracking_type);

ALTER TABLE training.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises_select" ON training.exercises FOR SELECT USING (is_active = true);
```

---

## 4. training.exercise_aliases

```sql
CREATE TABLE training.exercise_aliases (
  exercise_id  UUID NOT NULL REFERENCES training.exercises(id) ON DELETE CASCADE,
  alias        TEXT NOT NULL,
  locale       TEXT NOT NULL DEFAULT 'en',
  PRIMARY KEY  (exercise_id, alias, locale)
);

CREATE INDEX idx_exercise_aliases_trgm ON training.exercise_aliases
  USING GIN (alias gin_trgm_ops);
ALTER TABLE training.exercise_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_aliases_select" ON training.exercise_aliases FOR SELECT USING (true);
```

---

## 5. training.exercise_muscles

```sql
CREATE TABLE training.exercise_muscles (
  exercise_id      UUID NOT NULL REFERENCES training.exercises(id) ON DELETE CASCADE,
  muscle_group_id  UUID NOT NULL REFERENCES training.muscle_groups(id),
  role             TEXT NOT NULL CHECK (role IN ('primary','secondary','stabilizer')),
  PRIMARY KEY      (exercise_id, muscle_group_id, role)
);

CREATE INDEX idx_exmuscles_exercise ON training.exercise_muscles(exercise_id);
CREATE INDEX idx_exmuscles_muscle   ON training.exercise_muscles(muscle_group_id);
ALTER TABLE training.exercise_muscles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_muscles_select" ON training.exercise_muscles FOR SELECT USING (true);
```

---

## 6. training.strength_standards

```sql
CREATE TABLE training.strength_standards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id         UUID NOT NULL REFERENCES training.exercises(id),
  gender              TEXT NOT NULL CHECK (gender IN ('male','female','unisex')),
  bodyweight_kg_min   NUMERIC(5,1),
  bodyweight_kg_max   NUMERIC(5,1),
  beginner            NUMERIC(4,2),
  novice              NUMERIC(4,2),
  intermediate        NUMERIC(4,2),
  advanced            NUMERIC(4,2),
  elite               NUMERIC(4,2),
  UNIQUE (exercise_id, gender, bodyweight_kg_min)
);

ALTER TABLE training.strength_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strength_standards_select" ON training.strength_standards FOR SELECT USING (true);
```

---

## 7. training.routines

```sql
CREATE TABLE training.routines (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL,
  creator_type            TEXT NOT NULL DEFAULT 'user'
    CHECK (creator_type IN ('user','coach','marketplace','buddy')),
  creator_id              UUID,

  name                    TEXT NOT NULL,
  name_de                 TEXT,
  description             TEXT,
  category                TEXT
    CHECK (category IN ('strength','hypertrophy','powerlifting','endurance','general','custom')),
  tags                    TEXT[] DEFAULT '{}',
  difficulty              TEXT DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner','intermediate','advanced')),
  days_per_week           INTEGER,
  estimated_duration_min  INTEGER,

  source_ref_id           UUID,

  is_active               BOOLEAN DEFAULT true,
  is_template             BOOLEAN DEFAULT false,
  times_used              INTEGER DEFAULT 0,
  last_used_at            TIMESTAMPTZ,

  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_routines_user     ON training.routines(user_id);
CREATE INDEX idx_routines_active   ON training.routines(user_id, is_active);

ALTER TABLE training.routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routines_owner" ON training.routines
  USING (auth.uid()::text = user_id::text);
```

---

## 8. training.routine_exercises

```sql
CREATE TABLE training.routine_exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id       UUID NOT NULL REFERENCES training.routines(id) ON DELETE CASCADE,
  exercise_id      UUID NOT NULL REFERENCES training.exercises(id),
  exercise_order   INTEGER NOT NULL,
  superset_group   INTEGER,

  target_sets      INTEGER NOT NULL DEFAULT 3,
  target_reps      TEXT DEFAULT '8-12',
  target_weight_kg NUMERIC(8,2),
  weight_type      TEXT DEFAULT 'fixed'
    CHECK (weight_type IN ('fixed','percentage_1rm','bodyweight','rpe_based')),
  target_rpe       NUMERIC(3,1),
  rest_seconds     INTEGER DEFAULT 90,

  progression_model   TEXT DEFAULT 'double'
    CHECK (progression_model IN ('linear','double','wave','rpe','dup')),
  progression_rate    NUMERIC(5,4) DEFAULT 0.025,

  notes            TEXT,
  UNIQUE (routine_id, exercise_order)
);

CREATE INDEX idx_routine_exercises_routine ON training.routine_exercises(routine_id);

ALTER TABLE training.routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routine_exercises_owner" ON training.routine_exercises
  USING (EXISTS (
    SELECT 1 FROM training.routines r
    WHERE r.id = routine_exercises.routine_id
      AND auth.uid()::text = r.user_id::text
  ));
```

---

## 9. training.routine_schedule_days

```sql
CREATE TABLE training.routine_schedule_days (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   UUID NOT NULL REFERENCES training.routines(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  week_number  INTEGER,
  UNIQUE (routine_id, day_of_week, week_number)
);

ALTER TABLE training.routine_schedule_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_owner" ON training.routine_schedule_days
  USING (EXISTS (
    SELECT 1 FROM training.routines r
    WHERE r.id = routine_schedule_days.routine_id
      AND auth.uid()::text = r.user_id::text
  ));
```

---

## 10. training.workout_sessions

```sql
CREATE TABLE training.workout_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  routine_id         UUID REFERENCES training.routines(id),
  name               TEXT,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at       TIMESTAMPTZ,
  duration_minutes   INTEGER,

  total_volume_kg    NUMERIC(10,2),
  total_sets         INTEGER DEFAULT 0,
  total_reps         INTEGER DEFAULT 0,
  estimated_calories INTEGER,
  avg_rest_seconds   INTEGER,

  mood_before        TEXT,
  mood_after         TEXT,
  energy_level       SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  overall_rpe        SMALLINT CHECK (overall_rpe BETWEEN 1 AND 10),
  location           TEXT,
  notes              TEXT,

  prs_achieved       JSONB DEFAULT '[]',

  status             TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','cancelled')),

  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_user_date ON training.workout_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_status    ON training.workout_sessions(user_id, status);

ALTER TABLE training.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_owner" ON training.workout_sessions
  USING (auth.uid()::text = user_id::text);
```

---

## 11. training.workout_exercises

```sql
CREATE TABLE training.workout_exercises (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id   UUID NOT NULL REFERENCES training.workout_sessions(id) ON DELETE CASCADE,
  exercise_id          UUID NOT NULL REFERENCES training.exercises(id),
  exercise_order       INTEGER NOT NULL,
  superset_group       INTEGER,

  planned_sets         INTEGER,
  planned_reps         TEXT,
  planned_weight_kg    NUMERIC(8,2),
  planned_rest_seconds INTEGER,

  actual_sets          INTEGER DEFAULT 0,
  actual_volume_kg     NUMERIC(10,2) DEFAULT 0,
  max_weight_kg        NUMERIC(8,2),
  total_reps           INTEGER DEFAULT 0,
  avg_rpe              NUMERIC(3,1),

  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workout_exercises_session  ON training.workout_exercises(workout_session_id);
CREATE INDEX idx_workout_exercises_exercise ON training.workout_exercises(exercise_id);

ALTER TABLE training.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_exercises_owner" ON training.workout_exercises
  USING (EXISTS (
    SELECT 1 FROM training.workout_sessions ws
    WHERE ws.id = workout_exercises.workout_session_id
      AND auth.uid()::text = ws.user_id::text
  ));
```

---

## 12. training.workout_sets

```sql
CREATE TABLE training.workout_sets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id   UUID NOT NULL REFERENCES training.workout_exercises(id) ON DELETE CASCADE,
  set_number            SMALLINT NOT NULL,

  reps                  INTEGER,
  weight_kg             NUMERIC(8,2),
  duration_seconds      INTEGER,
  distance_meters       NUMERIC(8,2),

  rpe                   NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  rir                   INTEGER CHECK (rir BETWEEN 0 AND 10),
  tempo                 VARCHAR(10),

  set_type              TEXT DEFAULT 'working'
    CHECK (set_type IN ('working','warmup','dropset','failure')),

  estimated_1rm         NUMERIC(8,2),
  volume_kg             NUMERIC(10,2),
  is_pr                 BOOLEAN DEFAULT false,

  rest_seconds          SMALLINT,
  notes                 TEXT,
  logged_via            TEXT DEFAULT 'manual'
    CHECK (logged_via IN ('manual','voice','auto')),
  completed_at          TIMESTAMPTZ DEFAULT now(),

  UNIQUE (workout_exercise_id, set_number)
);

CREATE INDEX idx_workout_sets_exercise ON training.workout_sets(workout_exercise_id);

ALTER TABLE training.workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_sets_owner" ON training.workout_sets
  USING (EXISTS (
    SELECT 1 FROM training.workout_exercises we
    JOIN training.workout_sessions ws ON ws.id = we.workout_session_id
    WHERE we.id = workout_sets.workout_exercise_id
      AND auth.uid()::text = ws.user_id::text
  ));
```

### Trigger: 1RM + Volume beim Einfügen berechnen

```sql
CREATE OR REPLACE FUNCTION training.calc_set_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Volume
  IF NEW.weight_kg IS NOT NULL AND NEW.reps IS NOT NULL THEN
    NEW.volume_kg := NEW.weight_kg * NEW.reps;
  END IF;
  -- Estimated 1RM (Brzycki, nur für reps 1–30)
  IF NEW.weight_kg IS NOT NULL AND NEW.reps IS NOT NULL
     AND NEW.reps >= 1 AND NEW.reps <= 30 AND NEW.set_type = 'working' THEN
    NEW.estimated_1rm :=
      ROUND((NEW.weight_kg / (1.0278 - 0.0278 * NEW.reps))::NUMERIC, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_set_metrics
  BEFORE INSERT OR UPDATE OF weight_kg, reps
  ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION training.calc_set_metrics();
```

### Trigger: Session-Totals updaten

```sql
CREATE OR REPLACE FUNCTION training.update_session_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT ws.workout_session_id INTO v_session_id
  FROM training.workout_exercises ws
  WHERE ws.id = COALESCE(NEW.workout_exercise_id, OLD.workout_exercise_id);

  UPDATE training.workout_sessions SET
    total_sets   = (SELECT COUNT(*) FROM training.workout_sets wset
                    JOIN training.workout_exercises we ON we.id = wset.workout_exercise_id
                    WHERE we.workout_session_id = v_session_id
                      AND wset.set_type = 'working'),
    total_reps   = (SELECT COALESCE(SUM(wset.reps), 0) FROM training.workout_sets wset
                    JOIN training.workout_exercises we ON we.id = wset.workout_exercise_id
                    WHERE we.workout_session_id = v_session_id
                      AND wset.set_type = 'working'),
    total_volume_kg = (SELECT COALESCE(SUM(wset.volume_kg), 0) FROM training.workout_sets wset
                       JOIN training.workout_exercises we ON we.id = wset.workout_exercise_id
                       WHERE we.workout_session_id = v_session_id
                         AND wset.set_type = 'working'),
    updated_at = now()
  WHERE id = v_session_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_totals
  AFTER INSERT OR UPDATE OR DELETE ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION training.update_session_totals();
```

---

## 13. training.personal_records

```sql
CREATE TABLE training.personal_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  exercise_id         UUID NOT NULL REFERENCES training.exercises(id),
  pr_type             TEXT NOT NULL
    CHECK (pr_type IN ('estimated_1rm','max_weight','max_reps','max_volume')),
  value               NUMERIC(10,3) NOT NULL,
  reps                INTEGER,
  weight_kg           NUMERIC(8,2),
  workout_session_id  UUID REFERENCES training.workout_sessions(id),
  achieved_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  bodyweight_kg       NUMERIC(5,1),
  video_url           TEXT,
  notes               TEXT,
  UNIQUE (user_id, exercise_id, pr_type)
);

CREATE INDEX idx_prs_user_exercise ON training.personal_records(user_id, exercise_id);
CREATE INDEX idx_prs_achieved      ON training.personal_records(user_id, achieved_at DESC);

ALTER TABLE training.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prs_owner" ON training.personal_records
  USING (auth.uid()::text = user_id::text);
```

---

## 14. training.exercise_progression_configs

```sql
CREATE TABLE training.exercise_progression_configs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  exercise_id         UUID NOT NULL REFERENCES training.exercises(id),
  UNIQUE (user_id, exercise_id),

  progression_model   TEXT DEFAULT 'double'
    CHECK (progression_model IN ('linear','double','wave','rpe','dup')),
  rep_range_min       INTEGER DEFAULT 8,
  rep_range_max       INTEGER DEFAULT 12,
  weight_increment    NUMERIC(5,2) DEFAULT 2.5,
  deload_threshold    INTEGER DEFAULT 3,
  deload_percentage   NUMERIC(5,4) DEFAULT 0.10,
  target_rpe          NUMERIC(3,1) DEFAULT 8.0,
  rpe_range_min       NUMERIC(3,1) DEFAULT 7.0,
  rpe_range_max       NUMERIC(3,1) DEFAULT 9.0,
  wave_current_week   INTEGER DEFAULT 1,

  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE training.exercise_progression_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progression_owner" ON training.exercise_progression_configs
  USING (auth.uid()::text = user_id::text);
```

---

## 15. training.post_workout_feedback

```sql
CREATE TABLE training.post_workout_feedback (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  session_id         UUID NOT NULL REFERENCES training.workout_sessions(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  UNIQUE (user_id, session_id),

  pump               JSONB DEFAULT '{}',
  -- Format: {"Pectoralis Major": 3, "Triceps Brachii": 2, ...}
  soreness           JSONB DEFAULT '{}',
  -- Nächster-Tag-Bewertung: 1=nichts, 2=leicht, 3=stark
  performance_rating SMALLINT CHECK (performance_rating BETWEEN 1 AND 3),
  -- 1=besser als erwartet, 2=wie erwartet, 3=schlechter

  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_feedback_user_date ON training.post_workout_feedback(user_id, date DESC);

ALTER TABLE training.post_workout_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_owner" ON training.post_workout_feedback
  USING (auth.uid()::text = user_id::text);
```

---

## 16. training.volume_landmarks

```sql
CREATE TABLE training.volume_landmarks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  muscle_group_id  UUID NOT NULL REFERENCES training.muscle_groups(id),
  UNIQUE (user_id, muscle_group_id),

  -- Population Defaults (Sets/Woche)
  mv_sets          INTEGER NOT NULL,
  mev_sets         INTEGER NOT NULL,
  mav_sets         INTEGER NOT NULL,
  mrv_sets         INTEGER NOT NULL,

  -- Personalisiert (Feedback-Loop)
  personal_mav     INTEGER,
  personal_mrv     INTEGER,

  current_sets     INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'optimal'
    CHECK (status IN ('below_mev','optimal','approaching_mrv','over_mrv')),

  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_landmarks_user ON training.volume_landmarks(user_id);

ALTER TABLE training.volume_landmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "landmarks_owner" ON training.volume_landmarks
  USING (auth.uid()::text = user_id::text);
```

### Seed: Population-Defaults

```sql
-- Wird pro User beim ersten Login angelegt (oder per API)
-- Beispiel für einen User:
INSERT INTO training.volume_landmarks
  (user_id, muscle_group_id, mv_sets, mev_sets, mav_sets, mrv_sets)
SELECT
  $1,
  mg.id,
  CASE mg.body_region
    WHEN 'chest'     THEN 8
    WHEN 'back'      THEN 8
    WHEN 'shoulders' THEN 6
    WHEN 'arms'      THEN 4
    WHEN 'core'      THEN 0
    WHEN 'legs'      THEN 6
  END,
  CASE mg.body_region
    WHEN 'chest'     THEN 10
    WHEN 'back'      THEN 10
    WHEN 'shoulders' THEN 8
    WHEN 'arms'      THEN 6
    WHEN 'core'      THEN 4
    WHEN 'legs'      THEN 8
  END,
  CASE mg.body_region
    WHEN 'chest'     THEN 16
    WHEN 'back'      THEN 18
    WHEN 'shoulders' THEN 14
    WHEN 'arms'      THEN 12
    WHEN 'core'      THEN 12
    WHEN 'legs'      THEN 16
  END,
  CASE mg.body_region
    WHEN 'chest'     THEN 22
    WHEN 'back'      THEN 24
    WHEN 'shoulders' THEN 20
    WHEN 'arms'      THEN 16
    WHEN 'core'      THEN 16
    WHEN 'legs'      THEN 22
  END
FROM training.muscle_groups mg
WHERE mg.parent_id IS NULL;  -- Nur Hauptmuskelgruppen
```

---

## 17. VIEWs

### weekly_volume_summary

```sql
CREATE OR REPLACE VIEW training.weekly_volume_summary AS
SELECT
  ws.user_id,
  date_trunc('week', ws.started_at)::DATE AS week_start,
  mg.id                                   AS muscle_group_id,
  mg.name                                 AS muscle_group_name,
  mg.name_de                              AS muscle_group_name_de,
  mg.body_region,
  COUNT(DISTINCT ws.id)                   AS session_count,
  SUM(CASE WHEN wset.set_type = 'working' THEN 1 ELSE 0 END) AS total_sets,
  COALESCE(SUM(wset.volume_kg), 0)        AS total_volume_kg
FROM training.workout_sessions ws
JOIN training.workout_exercises we ON we.workout_session_id = ws.id
JOIN training.exercise_muscles em ON em.exercise_id = we.exercise_id AND em.role = 'primary'
JOIN training.muscle_groups mg    ON mg.id = em.muscle_group_id
JOIN training.workout_sets wset   ON wset.workout_exercise_id = we.id
WHERE ws.status = 'completed'
GROUP BY ws.user_id, week_start, mg.id, mg.name, mg.name_de, mg.body_region;
```

### muscle_readiness (für Recovery-Integration)

```sql
CREATE OR REPLACE VIEW training.muscle_readiness AS
SELECT
  ws.user_id,
  em.muscle_group_id,
  mg.name,
  mg.body_region,
  MAX(ws.completed_at)   AS last_trained_at,
  EXTRACT(EPOCH FROM (now() - MAX(ws.completed_at))) / 3600
                         AS hours_since_trained,
  SUM(wset.volume_kg)    AS last_session_volume
FROM training.workout_sessions ws
JOIN training.workout_exercises we   ON we.workout_session_id = ws.id
JOIN training.exercise_muscles em    ON em.exercise_id = we.exercise_id AND em.role = 'primary'
JOIN training.muscle_groups mg       ON mg.id = em.muscle_group_id
JOIN training.workout_sets wset      ON wset.workout_exercise_id = we.id
WHERE ws.status = 'completed'
  AND ws.completed_at > now() - INTERVAL '7 days'
GROUP BY ws.user_id, em.muscle_group_id, mg.name, mg.body_region;
```

---

## 18. Grants

```sql
GRANT USAGE ON SCHEMA training TO authenticated, service_role;

GRANT SELECT ON
  training.muscle_groups, training.equipment, training.exercises,
  training.exercise_aliases, training.exercise_muscles,
  training.strength_standards TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  training.routines, training.routine_exercises, training.routine_schedule_days,
  training.workout_sessions, training.workout_exercises, training.workout_sets,
  training.personal_records, training.exercise_progression_configs,
  training.post_workout_feedback, training.volume_landmarks TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA training TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA training TO authenticated, service_role;
```
