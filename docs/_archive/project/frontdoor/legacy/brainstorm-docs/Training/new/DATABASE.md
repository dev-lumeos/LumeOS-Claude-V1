# Training Module — Database Schema

## Schema & Übersicht

Alle Training-Tabellen im Schema `training`. Kein anderes Modul schreibt direkt in dieses Schema. Cross-Modul-Zugriff ausschließlich via API (Port 5200).

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `training.muscle_groups` | 157 normalisierte Muskelgruppen (DE/EN/TH) |
| `training.equipment` | ~40 kanonische Equipment-Typen (DE/EN/TH) |
| `training.exercises` | 1.200+ Übungen (1.850 in DB, 3-sprachig) |
| `training.exercise_aliases` | Such-Synonyme |
| `training.exercise_muscles` | Exercise ↔ MuscleGroup (M:N, primary/secondary/stabilizer) |
| `training.strength_standards` | Referenz-Kraftwerte (Beginner → Elite) |
| `training.routines` | Workout-Vorlagen (user/coach/marketplace/buddy) |
| `training.routine_exercises` | Exercises in Routine mit Soll-Werten |
| `training.routine_schedule_days` | Wochenplan-Zuweisung |
| `training.workout_sessions` | Absolvierte Sessions |
| `training.workout_exercises` | Exercises in Session |
| `training.workout_sets` | Einzelne Sätze (weight, reps, rpe, 1RM computed) |
| `training.personal_records` | PRs pro User × Exercise × Typ |
| `training.exercise_progression_configs` | Progression-Konfiguration pro User × Exercise |
| `training.post_workout_feedback` | Pump/Soreness-Feedback |
| `training.volume_landmarks` | Personalisierte MV/MEV/MAV/MRV |

**VIEWs:**
- `training.weekly_volume_summary` — Materialized, wöchentliches Volumen
- `training.muscle_readiness` — Muskel-Erholung aus Training Load Logs

---

## Kern-Tabellen Detail

### `training.exercises`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | Canonical EN Name |
| `name_de` | TEXT | Deutsch |
| `name_en` | TEXT | |
| `name_th` | TEXT | |
| `category` | TEXT NOT NULL | Bodyweight/Free Weights/Resistance/Cardio/Stretching |
| `exercise_type` | TEXT | strength/cardio/stretching/yoga/calisthenics/plyometric |
| `tracking_type` | TEXT | weight_reps/reps_only/duration/distance_duration |
| `movement_pattern` | TEXT | push/pull/squat/hinge/carry/rotation/other |
| `discipline` | TEXT | bodybuilding/powerlifting/olympic/general |
| `difficulty` | TEXT | beginner/intermediate/advanced |
| `equipment_id` | UUID FK → equipment | |
| `image_male_start/end` | TEXT | Cloudflare R2 URLs |
| `image_female_start/end` | TEXT | |
| `video_url` | TEXT | |
| `instructions` | TEXT | Step-by-step (EN) |
| `instructions_de` | TEXT | Step-by-step (DE) — 1.850/1.850 |
| `instructions_th` | TEXT | Step-by-step (TH) — 1.850/1.850 |
| `tips` / `tips_de` / `tips_th` | TEXT | Pro Tips |
| `common_mistakes` | TEXT[] | |
| `evaluation_score` | INTEGER (0–100) | Effectiveness Score |
| `sfr_rating` | NUMERIC(3,2) | Stimulus-to-Fatigue Ratio |
| `stretch_position` | BOOLEAN | Gedehnte Position = mehr Hypertrophie |
| `mechanical_tension` | TEXT | high/medium/low |
| `sort_weight` | INTEGER (0–1000) | Relevanz-Gewicht für Suchreihenfolge |
| `popularity_score` | INTEGER | |
| `safety_rating` | INTEGER (1–5) | |
| `source` | TEXT | exercise_animatic |
| `is_active` | BOOLEAN | |

**Indexes:** GIN auf `name` + `name_de` (pg_trgm), btree auf `category`, `sort_weight DESC`, `equipment_id`

---

### `training.workout_sets`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `workout_exercise_id` | UUID FK CASCADE | |
| `set_number` | SMALLINT | UNIQUE mit workout_exercise_id |
| `reps` | INTEGER | |
| `weight_kg` | NUMERIC(8,2) | NULL bei reps_only/duration |
| `duration_seconds` | INTEGER | |
| `distance_meters` | NUMERIC(8,2) | |
| `rpe` | NUMERIC(3,1) | 1.0–10.0 |
| `rir` | INTEGER | Reps in Reserve |
| `tempo` | VARCHAR(10) | "3010" |
| `set_type` | TEXT | working/warmup/dropset/failure |
| `estimated_1rm` | NUMERIC(8,2) | **AUTO via Trigger** (Brzycki) |
| `volume_kg` | NUMERIC(10,2) | **AUTO via Trigger** (weight × reps) |
| `is_pr` | BOOLEAN | |
| `rest_seconds` | SMALLINT | |
| `logged_via` | TEXT | manual/voice/auto |

**Trigger:** `trg_calc_set_metrics` — berechnet `estimated_1rm` + `volume_kg` bei INSERT/UPDATE
**Trigger:** `trg_update_session_totals` — aktualisiert `workout_sessions.total_*` nach jedem Set

---

### `training.routines`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | |
| `creator_type` | TEXT | user/coach/marketplace/buddy |
| `creator_id` | UUID | coach_id oder marketplace_product_id |
| `name` | TEXT | |
| `name_de` | TEXT | |
| `category` | TEXT | strength/hypertrophy/powerlifting/endurance/general/custom |
| `tags` | TEXT[] | push/pull/legs/upper/lower/full_body/custom |
| `difficulty` | TEXT | |
| `days_per_week` | INTEGER | |
| `estimated_duration_min` | INTEGER | computed |
| `source_ref_id` | UUID | |
| `is_active` | BOOLEAN | |
| `is_template` | BOOLEAN | |
| `times_used` | INTEGER | |
| `last_used_at` | TIMESTAMPTZ | |

---

### `training.volume_landmarks`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID | UNIQUE mit muscle_group_id |
| `muscle_group_id` | UUID FK | |
| `mv_sets` / `mev_sets` / `mav_sets` / `mrv_sets` | INTEGER | Population Defaults |
| `personal_mav` / `personal_mrv` | INTEGER | Feedback-Loop personalisiert |
| `current_sets` | INTEGER | Diese Woche |
| `status` | TEXT | below_mev/optimal/approaching_mrv/over_mrv |

---

## Trigger-Übersicht

| Trigger | Tabelle | Wann | Was |
|---|---|---|---|
| `trg_calc_set_metrics` | `workout_sets` | INSERT/UPDATE weight_kg, reps | Berechnet estimated_1rm (Brzycki) + volume_kg |
| `trg_update_session_totals` | `workout_sets` | INSERT/UPDATE/DELETE | Aktualisiert total_sets, total_reps, total_volume_kg in workout_sessions |

---

## Views

### `weekly_volume_summary` (Materialized)

```sql
-- user_id, week_start, muscle_group_id, muscle_group_name,
-- body_region, session_count, total_sets, total_volume_kg
```

Enthält: JOIN über workout_sessions → workout_exercises → exercise_muscles → muscle_groups
Filter: nur `completed` Sessions, nur `primary` Muskeln

### `muscle_readiness`

Berechnet Stunden seit letztem Training pro Muskelgruppe aus den letzten 7 Tagen.

---

## RLS-Policies

| Tabelle | Policy |
|---|---|
| `muscle_groups`, `equipment`, `exercises`, `exercise_aliases`, `exercise_muscles`, `strength_standards` | SELECT für alle authenticated (read-only) |
| `routines` | ALL für Owner (`auth.uid() = user_id`) |
| `workout_sessions` | ALL für Owner |
| `workout_exercises` | Via workout_sessions (nested check) |
| `workout_sets` | Via workout_exercises + workout_sessions |
| `personal_records` | ALL für Owner |
| `exercise_progression_configs` | ALL für Owner |
| `post_workout_feedback` | ALL für Owner |
| `volume_landmarks` | ALL für Owner |
| `routine_exercises` / `routine_schedule_days` | Via routines |

---

## Schema-Entscheidungen

**Warum separates `training` Schema?**
Domain-Isolation, kein unbeabsichtigter Cross-Modul-Datenzugriff.

**Warum Trigger für 1RM + Volume?**
Konsistenz — kein App-Code kann vergessen die Berechnung durchzuführen. Bei 1.000+ Sets/Tag wichtig.

**Warum keine Custom Exercises?**
1.200+ Übungen decken 99% aller Gym-Use-Cases. Kein Management-Overhead.

**Warum `sort_weight` (0–1000)?**
Suchreihenfolge ohne Suchwort — häufig genutzte Fitness-Übungen oben, Randübungen unten. Einmalig beim Import gesetzt.
