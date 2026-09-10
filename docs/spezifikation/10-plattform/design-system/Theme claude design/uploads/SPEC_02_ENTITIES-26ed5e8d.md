# Training Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
STAMMDATEN (importiert / System)    USER DATA
────────────────────────────        ──────────────────────────────────
MuscleGroup (157)                   Routine (source: user|coach|marketplace|buddy)
  └── ExerciseMuscle (M:N)            └── RoutineExercise
Equipment (~40)                         └── RoutineSet (target_sets × reps)
Exercise (1.200+ unique, 1.850 DB)      └── RoutineScheduleDay
  └── ExerciseAlias
  └── ExerciseEvaluation (Score)      WorkoutSession
                                        └── WorkoutExercise
                                            └── WorkoutSet (eingefroren)

                                      PersonalRecord
                                      ExerciseProgressionConfig (pro User × Exercise)
                                      PostWorkoutFeedback (Pump/Soreness)
                                      WorkoutSchedule
                                      VolumeLandmark (personalisiert)
                                      StrengthStandard (Referenzwerte)
```

---

## Allgemeine Regeln

**Sprachen:** name_de, name_en, name_th auf allen Stammdaten.
TH initial NULL — kein Pflichtfeld.
**Keine Custom Exercises:** 1.200+ reichen aus — kein User-Upload.
**Schema-Isolation:** Alle Tabellen im Schema `training`.
**Snapshot-Prinzip:** WorkoutSet-Daten werden eingefroren (weight_kg, reps, rpe).

---

## 1. MuscleGroup

157 normalisierte Muskelgruppen. Stammdaten, read-only nach Import.

```
id            UUID PK
name          TEXT UNIQUE NOT NULL    'Quadriceps' (EN, normalisiert)
name_de       TEXT                    'Quadrizeps'
name_en       TEXT                    'Quadriceps'
name_th       TEXT
body_region   TEXT NOT NULL           legs | chest | back | arms | shoulders | core
parent_id     UUID FK → self          NULL = Hauptmuskel
display_order INTEGER DEFAULT 0
```

**body_region-Werte:** legs · chest · back · arms · shoulders · core · full_body

---

## 2. Equipment

~40 kanonische Equipment-Typen. Normalisiert aus ursprünglich 82 rohen Bezeichnungen.

```
id        UUID PK
name      TEXT UNIQUE NOT NULL    'Barbell'
name_de   TEXT                    'Langhantel'
name_en   TEXT                    'Barbell'
name_th   TEXT
category  TEXT                    free_weight | machine | cable | bodyweight |
                                  band | cardio | other
icon      TEXT                    Emoji
```

---

## 3. Exercise

1.200+ unique Übungen (nach Male/Female-Dedup), 1.850 in DB inkl. Varianten.
Read-only für User — kein User-Upload.

```
id                   UUID PK
name                 TEXT NOT NULL         'Barbell Bench Press' (EN, canonical)
name_de              TEXT                  'Langhantel Bankdrücken'
name_en              TEXT                  'Barbell Bench Press'
name_th              TEXT

-- Klassifikation
category             TEXT NOT NULL         Bodyweight | Free Weights | Resistance |
                                           Cardio | Stretching
exercise_type        TEXT DEFAULT 'strength'
                                           strength | cardio | stretching |
                                           yoga | calisthenics | plyometric
tracking_type        TEXT DEFAULT 'weight_reps'
                                           weight_reps | reps_only |
                                           duration | distance_duration
movement_pattern     TEXT                  push | pull | squat | hinge | carry | rotation
discipline           TEXT                  bodybuilding | powerlifting | olympic | general
difficulty           TEXT DEFAULT 'intermediate'
                                           beginner | intermediate | advanced

-- Muskeln (via M:N)
-- → exercise_muscles Tabelle

-- Equipment
equipment_id         UUID FK → Equipment

-- Media (Cloudflare R2 URLs)
image_male_start     TEXT
image_male_end       TEXT
image_female_start   TEXT
image_female_end     TEXT
video_url            TEXT

-- Inhalte (3-sprachig)
instructions         TEXT    Step-by-step (EN)
instructions_de      TEXT    Step-by-step (DE) — 1.850/1.850 übersetzt
instructions_th      TEXT    Step-by-step (TH) — 1.850/1.850 übersetzt
tips                 TEXT    Pro Tips (EN)
tips_de              TEXT
tips_th              TEXT
common_mistakes      TEXT[]  Häufige Fehler

-- Science Layer
evaluation_score     INTEGER CHECK (0–100)    Effectiveness Score für primären Muskel
sfr_rating           NUMERIC(3,2)             Stimulus-to-Fatigue Ratio
stretch_position     BOOLEAN DEFAULT false    Gedehnte Position = mehr Hypertrophie
mechanical_tension   TEXT                     high | medium | low

-- Metadaten
popularity_score     INTEGER DEFAULT 0
safety_rating        INTEGER CHECK (1–5)
source               TEXT DEFAULT 'exercise_animatic'
is_active            BOOLEAN DEFAULT true

created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
```

---

## 4. ExerciseAlias

Alternative Namen für die Suche.

```
exercise_id   UUID FK → Exercise CASCADE  } PK
alias         TEXT NOT NULL               }
locale        TEXT DEFAULT 'en'           } PK
```

---

## 5. ExerciseMuscle (M:N)

Verbindung Exercise ↔ MuscleGroup mit Rolle.

```
exercise_id      UUID FK → Exercise CASCADE  } PK
muscle_group_id  UUID FK → MuscleGroup       } PK
role             TEXT NOT NULL               } PK
                 primary | secondary | stabilizer
```

---

## 6. Routine

Wiederverwendbare Workout-Vorlage.

```
id                       UUID PK
user_id                  UUID NOT NULL           Eigentümer / Ziel-User
creator_type             TEXT NOT NULL           user | coach | marketplace | buddy
creator_id               UUID                    coach_id oder marketplace_product_id

name                     TEXT NOT NULL
name_de                  TEXT
description              TEXT
category                 TEXT                    strength | hypertrophy | powerlifting |
                                                 endurance | general | custom
tags                     TEXT[]                  push | pull | legs | upper | lower |
                                                 full_body | custom
difficulty               TEXT                    beginner | intermediate | advanced
days_per_week            INTEGER
estimated_duration_min   INTEGER                 computed aus Exercises × Sets × Rest

-- Quellen-Tracking
source_ref_id            UUID                    bei coach: coach_program_id

-- Status
is_active                BOOLEAN DEFAULT true
is_template              BOOLEAN DEFAULT false   System-Template vs. User-Routine
times_used               INTEGER DEFAULT 0
last_used_at             TIMESTAMPTZ

created_at               TIMESTAMPTZ
updated_at               TIMESTAMPTZ
```

---

## 7. RoutineExercise

Übungen innerhalb einer Routine mit Soll-Werten.

```
id               UUID PK
routine_id       UUID FK → Routine CASCADE
exercise_id      UUID FK → Exercise
exercise_order   INTEGER NOT NULL
superset_group   INTEGER             NULL = kein Superset, gleiche Zahl = gleiche Gruppe

-- Soll-Werte
target_sets      INTEGER NOT NULL
target_reps      TEXT                '8-10' | '3-5' | 'AMRAP' | '12'
target_weight_kg NUMERIC(8,2)        Optional: fixes Gewicht
weight_type      TEXT                fixed | percentage_1rm | bodyweight | rpe_based
target_rpe       NUMERIC(3,1)
rest_seconds     INTEGER DEFAULT 90

-- Progressive Overload Konfiguration
progression_model    TEXT            linear | double | wave | rpe | dup
progression_rate     NUMERIC(5,4)    z.B. 0.025 = 2.5% Steigerung

notes            TEXT
```

---

## 8. RoutineScheduleDay

Wochenplan-Zuweisung für eine Routine.

```
id          UUID PK
routine_id  UUID FK → Routine CASCADE
day_of_week INTEGER NOT NULL    0=Montag ... 6=Sonntag
week_number INTEGER             NULL = jede Woche, sonst Woche 1/2/... für Rotation
```

---

## 9. WorkoutSession

Ein tatsächlich durchgeführtes Workout.

```
id                 UUID PK
user_id            UUID NOT NULL
routine_id         UUID FK → Routine    NULL = Blanko-Workout
name               TEXT                 Auto-generiert oder User-eingegeben
started_at         TIMESTAMPTZ NOT NULL
completed_at       TIMESTAMPTZ
duration_minutes   INTEGER

-- Aggregierte Metriken (beim Abschluss berechnet)
total_volume_kg    NUMERIC(10,2)        Σ (weight × reps) aller Sets
total_sets         INTEGER DEFAULT 0
total_reps         INTEGER DEFAULT 0
estimated_calories INTEGER
avg_rest_seconds   INTEGER

-- Session-Kontext
mood_before        TEXT                 energized | tired | motivated | neutral
mood_after         TEXT
energy_level       SMALLINT             1–5 (Pre-Workout)
overall_rpe        SMALLINT             1–10 (Session gesamt)
location           TEXT
notes              TEXT

-- PRs dieser Session (snapshot)
prs_achieved       JSONB    [{exercise_id, metric, value, previous_value}]

-- Status
status             TEXT DEFAULT 'active'    active | completed | cancelled

created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ
```

---

## 10. WorkoutExercise

Übung innerhalb einer Session.

```
id                   UUID PK
workout_session_id   UUID FK → WorkoutSession CASCADE
exercise_id          UUID FK → Exercise
exercise_order       INTEGER NOT NULL
superset_group       INTEGER

-- Soll-Werte (aus Routine kopiert, veränderbar)
planned_sets         INTEGER
planned_reps         TEXT
planned_weight_kg    NUMERIC(8,2)
planned_rest_seconds INTEGER

-- Ist-Werte (aus Sets aggregiert, beim Abschluss berechnet)
actual_sets          INTEGER DEFAULT 0
actual_volume_kg     NUMERIC(10,2) DEFAULT 0
max_weight_kg        NUMERIC(8,2)
total_reps           INTEGER DEFAULT 0
avg_rpe              NUMERIC(3,1)

notes                TEXT
created_at           TIMESTAMPTZ
```

---

## 11. WorkoutSet

Einzelner Satz — **eingefroren beim Logging**.

```
id                    UUID PK
workout_exercise_id   UUID FK → WorkoutExercise CASCADE
set_number            SMALLINT NOT NULL
UNIQUE (workout_exercise_id, set_number)

-- Kerndaten (eingefroren)
reps                  INTEGER NOT NULL
weight_kg             NUMERIC(8,2)             NULL bei reps_only/duration
duration_seconds      INTEGER                  für duration/distance_duration
distance_meters       NUMERIC(8,2)             für distance_duration

-- Qualitätsdaten
rpe                   NUMERIC(3,1)             1.0–10.0
rir                   INTEGER                  Reps in Reserve
tempo                 VARCHAR(10)              '3010' (exc-pause-conc-pause)

-- Set-Typ
set_type              TEXT DEFAULT 'working'   working | warmup | dropset | failure

-- Berechnete Werte (beim Logging)
estimated_1rm         NUMERIC(8,2)             Brzycki: weight / (1.0278 - 0.0278 × reps)
volume_kg             NUMERIC(10,2)            weight × reps
is_pr                 BOOLEAN DEFAULT false

-- Metadaten
rest_seconds          SMALLINT
notes                 TEXT
logged_via            TEXT DEFAULT 'manual'    manual | voice | auto
completed_at          TIMESTAMPTZ
```

**1RM Formeln:**
- Brzycki: `weight / (1.0278 - 0.0278 × reps)` — Standard für Krafttraining
- Epley: `weight × (1 + reps/30)` — Alternative

---

## 12. PersonalRecord

Best-Leistung pro User × Exercise × Metrik.

```
id                  UUID PK
user_id             UUID NOT NULL
exercise_id         UUID FK → Exercise
pr_type             TEXT NOT NULL           estimated_1rm | max_weight | max_reps | max_volume
value               NUMERIC(10,3) NOT NULL
reps                INTEGER                 für max_weight / estimated_1rm
weight_kg           NUMERIC(8,2)
workout_session_id  UUID FK → WorkoutSession
achieved_at         TIMESTAMPTZ NOT NULL
bodyweight_kg       NUMERIC(5,1)
video_url           TEXT
notes               TEXT
UNIQUE (user_id, exercise_id, pr_type)     → nur aktuellster PR pro Typ
```

---

## 13. ExerciseProgressionConfig

Progression-Konfiguration pro User × Exercise.

```
id                 UUID PK
user_id            UUID NOT NULL
exercise_id        UUID FK → Exercise
UNIQUE (user_id, exercise_id)

progression_model  TEXT DEFAULT 'double'    linear | double | wave | rpe | dup
rep_range_min      INTEGER DEFAULT 8
rep_range_max      INTEGER DEFAULT 12
weight_increment   NUMERIC(5,2) DEFAULT 2.5   kg pro Progression
deload_threshold   INTEGER DEFAULT 3           Failed Sessions bevor Deload
deload_percentage  NUMERIC(5,4) DEFAULT 0.10   10% Gewichtsreduktion
target_rpe         NUMERIC(3,1) DEFAULT 8.0
rpe_range_min      NUMERIC(3,1) DEFAULT 7.0
rpe_range_max      NUMERIC(3,1) DEFAULT 9.0
wave_current_week  INTEGER DEFAULT 1           für Wave Loading

created_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ
```

---

## 14. PostWorkoutFeedback

Post-Workout-Feedback für personalisierte Volume Landmarks.

```
id                UUID PK
user_id           UUID NOT NULL
session_id        UUID FK → WorkoutSession
date              DATE NOT NULL

-- Pump pro Muskelgruppe (1=niedrig, 2=mittel, 3=hoch)
pump              JSONB    {"chest": 3, "triceps": 2, ...}

-- DOMS/Erschöpfung nach 24h
soreness          JSONB    {"chest": 2, "triceps": 1, ...}

-- Session-Qualität
performance_rating SMALLINT  1–3 (🏆 besser / 😐 gleich / 😩 schlechter)

created_at        TIMESTAMPTZ
```

**Feedback-Loop:** Pump + Soreness + Volume → personalisierte MAV/MRV-Anpassung über Zeit.

---

## 15. VolumeLandmark

Personalisierte Volume Landmarks pro User × Muskelgruppe.

```
id               UUID PK
user_id          UUID NOT NULL
muscle_group_id  UUID FK → MuscleGroup
UNIQUE (user_id, muscle_group_id)

-- Population-Defaults (Sets/Woche)
mv_sets          INTEGER    Maintenance Volume (Standard: 6–8)
mev_sets         INTEGER    Minimum Effective Volume (Standard: 8–10)
mav_sets         INTEGER    Maximum Adaptive Volume (Standard: 12–18)
mrv_sets         INTEGER    Maximum Recoverable Volume (Standard: 18–24)

-- Personalisiert (durch Feedback-Loop berechnet)
personal_mav     INTEGER    NULL = Population Default gilt
personal_mrv     INTEGER

-- Aktuell diese Woche
current_sets     INTEGER
status           TEXT       below_mev | optimal | approaching_mrv | over_mrv

updated_at       TIMESTAMPTZ
```

---

## 16. StrengthStandard

Referenz-Stärke-Standards für Leistungsvergleiche.

```
id                  UUID PK
exercise_id         UUID FK → Exercise
gender              TEXT    male | female | unisex
bodyweight_kg_min   NUMERIC(5,1)
bodyweight_kg_max   NUMERIC(5,1)

-- Multiplikatoren auf Körpergewicht
beginner            NUMERIC(4,2)
novice              NUMERIC(4,2)
intermediate        NUMERIC(4,2)
advanced            NUMERIC(4,2)
elite               NUMERIC(4,2)

UNIQUE (exercise_id, gender, bodyweight_kg_min)
```

---

## Schema-Übersicht

```sql
-- Stammdaten (read-only nach Import)
training.muscle_groups
training.equipment
training.exercises
training.exercise_aliases
training.exercise_muscles
training.strength_standards

-- User-Daten
training.routines
training.routine_exercises
training.routine_schedule_days
training.workout_sessions
training.workout_exercises
training.workout_sets
training.personal_records
training.exercise_progression_configs
training.post_workout_feedback
training.volume_landmarks

-- Views
training.weekly_volume_summary
training.muscle_readiness
```
