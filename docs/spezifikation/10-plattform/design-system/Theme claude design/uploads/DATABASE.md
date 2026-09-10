# Goals Module — Database Schema

## Schema & Übersicht

Alle Goals-Tabellen im Schema `goals`. Goals empfängt Contributions von allen anderen Modulen.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `goals.user_goals` | Alle Ziele (SMART, multi-type) |
| `goals.goal_phases` | Aktuelle Phase + Parameter |
| `goals.goal_milestones` | Meilensteine (25/50/75/100%) |
| `goals.goal_contributions` | Täglich eingehend von allen Modulen |
| `goals.goal_adjustments` | Auto/Manual Zielanpassungen |
| `goals.tdee_settings` | Adaptive TDEE + Phase-Parameter |
| `goals.body_measurements` | Körperfett%, Gewicht, Muskelmasse |
| `goals.body_circumferences` | 13 Umfangmessungen |
| `goals.progress_photos` | Foto-Sessions mit Pose-Metadaten |
| `goals.weekly_reports` | Wöchentliche Report-Snapshots |

**VIEWs:**
- `goals.user_goal_dashboard` (Materialized)
- `goals.weekly_contributions_summary`

---

## 1. goals.user_goals

```sql
CREATE TABLE goals.user_goals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,

  -- Klassifikation
  goal_type            TEXT NOT NULL
    CHECK (goal_type IN ('body_composition','performance','health','lifestyle')),
  subtype              TEXT,
  title                TEXT NOT NULL,
  description          TEXT,

  -- Zielwert
  target_value         NUMERIC(10,3),
  target_unit          TEXT,
  current_value        NUMERIC(10,3),
  start_value          NUMERIC(10,3),

  -- Zeitplan
  start_date           DATE DEFAULT CURRENT_DATE,
  target_date          DATE,

  -- Status + Priorität
  status               TEXT DEFAULT 'active'
    CHECK (status IN ('active','paused','achieved','abandoned','on_hold')),
  priority             INTEGER DEFAULT 5
    CHECK (priority BETWEEN 1 AND 10),
  is_primary           BOOLEAN DEFAULT false,

  -- Fortschritt
  progress_pct         NUMERIC(5,2) DEFAULT 0,
  achievement_probability NUMERIC(5,2),

  -- Motivation
  motivation_reason    TEXT,
  difficulty_level     TEXT
    CHECK (difficulty_level IN ('easy','moderate','challenging','aggressive','unrealistic',NULL)),
  realism_score        NUMERIC(3,2),

  -- Auto-Update
  auto_update          BOOLEAN DEFAULT true,
  celebration_enabled  BOOLEAN DEFAULT true,

  achievement_date     DATE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_progress CHECK (progress_pct >= 0 AND progress_pct <= 100)
);

CREATE INDEX idx_goals_user_status  ON goals.user_goals(user_id, status);
CREATE INDEX idx_goals_user_primary ON goals.user_goals(user_id)
  WHERE is_primary = true;

ALTER TABLE goals.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_owner" ON goals.user_goals
  USING (auth.uid()::text = user_id::text);
```

---

## 2. goals.goal_phases

```sql
CREATE TABLE goals.goal_phases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL,
  goal_id              UUID REFERENCES goals.user_goals(id),

  phase_type           TEXT NOT NULL
    CHECK (phase_type IN ('fat_loss','lean_bulk','maintenance','recomp',
                          'contest_prep','reverse_diet','expert_bb_annual',
                          'mini_cut','peak_week')),
  variant              TEXT DEFAULT 'moderate',
  is_active            BOOLEAN DEFAULT true,

  -- Parameter (JSONB für Flexibilität)
  parameters           JSONB NOT NULL DEFAULT '{}',
  -- Enthält: calorie_target, protein_g, carbs_g, fat_g, rate_target,
  --          max_duration_weeks, refeed_days, deload_frequency

  start_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  projected_end_date   DATE,
  actual_end_date      DATE,

  -- Transition
  transitioned_from    TEXT,
  recommended_next     TEXT,
  transition_reason    TEXT,

  UNIQUE (user_id) WHERE (is_active = true)
);

CREATE INDEX idx_phases_user_active ON goals.goal_phases(user_id)
  WHERE is_active = true;

ALTER TABLE goals.goal_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phases_owner" ON goals.goal_phases
  USING (auth.uid()::text = user_id::text);
```

---

## 3. goals.goal_contributions

```sql
CREATE TABLE goals.goal_contributions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id              UUID NOT NULL REFERENCES goals.user_goals(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL,
  contribution_date    DATE NOT NULL,
  module               TEXT NOT NULL
    CHECK (module IN ('nutrition','training','recovery','supplements','medical')),

  contribution_score   NUMERIC(5,2),  -- 0–100

  -- Details (je nach Modul unterschiedlich)
  details              JSONB NOT NULL DEFAULT '{}',
  -- Nutrition: {compliance_score, protein_g, calories, protein_adherence_pct}
  -- Training: {sessions, volume_kg, strength_progress, adherence_pct}
  -- Recovery: {recovery_score, sleep_hours, checkin_completed}
  -- Supplements: {compliance_score, items_taken, items_scheduled}
  -- Medical: {overall_health_score, trajectory, active_alerts}

  UNIQUE (goal_id, module, contribution_date)
);

CREATE INDEX idx_contributions_goal_date  ON goals.goal_contributions(goal_id, contribution_date DESC);
CREATE INDEX idx_contributions_user_date  ON goals.goal_contributions(user_id, contribution_date DESC);

ALTER TABLE goals.goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contributions_owner" ON goals.goal_contributions
  USING (auth.uid()::text = user_id::text);
```

---

## 4. goals.goal_milestones

```sql
CREATE TABLE goals.goal_milestones (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id              UUID NOT NULL REFERENCES goals.user_goals(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL,

  milestone_type       TEXT NOT NULL
    CHECK (milestone_type IN ('percentage','absolute_value','time_based','behavioral')),
  milestone_name       TEXT,
  percentage_threshold NUMERIC(5,2),  -- 25 / 50 / 75 / 100
  absolute_value       NUMERIC(10,3),

  is_achieved          BOOLEAN DEFAULT false,
  achieved_date        TIMESTAMPTZ,
  achieved_value       NUMERIC(10,3),

  celebration_message  TEXT,
  auto_generated       BOOLEAN DEFAULT true,
  notification_sent    BOOLEAN DEFAULT false
);

CREATE INDEX idx_milestones_goal ON goals.goal_milestones(goal_id);

ALTER TABLE goals.goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_owner" ON goals.goal_milestones
  USING (auth.uid()::text = user_id::text);
```

---

## 5. goals.tdee_settings

```sql
CREATE TABLE goals.tdee_settings (
  user_id              UUID PRIMARY KEY,

  -- Aktuelle Ziele
  calorie_target       INTEGER,
  protein_g            INTEGER,
  carbs_g              INTEGER,
  fat_g                INTEGER,

  -- TDEE
  tdee_formula         NUMERIC(8,2),    -- Formel-basiert (Onboarding)
  tdee_adaptive        NUMERIC(8,2),    -- Adaptive (ab Woche 2)
  tdee_active          NUMERIC(8,2),    -- Aktuell verwendeter TDEE
  tdee_updated_at      TIMESTAMPTZ,

  -- Phase
  current_phase        TEXT,
  phase_calorie_modifier NUMERIC(5,2),  -- Deficit/Surplus kcal/Tag

  -- Macro Cycling
  macro_cycling        BOOLEAN DEFAULT false,
  cycling_config       JSONB DEFAULT '{}',
  -- {training_days: {protein_g, carbs_g, fat_g}, rest_days: {...}}

  -- Gewicht (7-Tage Moving Average)
  weight_7d_avg        NUMERIC(6,2),
  weight_trend         TEXT,           -- losing / gaining / stable

  -- User-Profil Snapshot (für Formeln)
  weight_kg            NUMERIC(6,2),
  height_cm            NUMERIC(5,1),
  age                  INTEGER,
  gender               TEXT,
  activity_level       TEXT,

  updated_at           TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE goals.tdee_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdee_owner" ON goals.tdee_settings
  USING (auth.uid()::text = user_id::text);
```

---

## 6. goals.body_measurements

```sql
CREATE TABLE goals.body_measurements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  measurement_date DATE NOT NULL,

  weight_kg        NUMERIC(6,2),
  body_fat_pct     NUMERIC(5,2),
  bf_method        TEXT
    CHECK (bf_method IN ('caliper_3','caliper_7','dexa','bia','visual','hydrostatic',NULL)),
  muscle_mass_kg   NUMERIC(6,2)
    GENERATED ALWAYS AS (weight_kg * (1 - body_fat_pct / 100)) STORED,
  bmi              NUMERIC(5,2),
  ffmi             NUMERIC(5,2),

  notes            TEXT,

  UNIQUE (user_id, measurement_date)
);

ALTER TABLE goals.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurements_owner" ON goals.body_measurements
  USING (auth.uid()::text = user_id::text);
```

---

## 7. goals.body_circumferences

```sql
CREATE TABLE goals.body_circumferences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  measurement_date DATE NOT NULL,

  neck_cm          NUMERIC(5,2),
  shoulders_cm     NUMERIC(5,2),
  chest_cm         NUMERIC(5,2),
  bicep_l_cm       NUMERIC(5,2),
  bicep_r_cm       NUMERIC(5,2),
  forearm_l_cm     NUMERIC(5,2),
  forearm_r_cm     NUMERIC(5,2),
  waist_cm         NUMERIC(5,2),
  hip_cm           NUMERIC(5,2),
  thigh_l_cm       NUMERIC(5,2),
  thigh_r_cm       NUMERIC(5,2),
  calf_l_cm        NUMERIC(5,2),
  calf_r_cm        NUMERIC(5,2),

  UNIQUE (user_id, measurement_date)
);

ALTER TABLE goals.body_circumferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circ_owner" ON goals.body_circumferences
  USING (auth.uid()::text = user_id::text);
```

---

## 8. goals.progress_photos

```sql
CREATE TABLE goals.progress_photos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  session_date     DATE NOT NULL,
  pose_type        TEXT NOT NULL
    CHECK (pose_type IN ('mandatory_8','quarter_turns','detail','custom')),
  pose_name        TEXT NOT NULL,
  pose_number      INTEGER,

  photo_url        TEXT NOT NULL,
  thumbnail_url    TEXT,

  -- AI Analyse
  ai_analysis      JSONB DEFAULT '{}',
  -- {muscle_scores: {chest: 78, ...}, conditioning: 72, symmetry: 85, notes: [...]}
  ai_analyzed_at   TIMESTAMPTZ,

  notes            TEXT,
  is_private       BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_user_date ON goals.progress_photos(user_id, session_date DESC);
CREATE INDEX idx_photos_pose      ON goals.progress_photos(user_id, pose_name);

ALTER TABLE goals.progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_owner" ON goals.progress_photos
  USING (auth.uid()::text = user_id::text);
```

---

## 9. goals.goal_adjustments

```sql
CREATE TABLE goals.goal_adjustments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id          UUID FK → goals.user_goals,
  user_id          UUID NOT NULL,
  adjustment_type  TEXT
    CHECK (adjustment_type IN ('plateau_response','phase_transition','life_event',
                               'seasonal','calorie_adjustment','protein_adjustment','user_manual')),
  old_target       NUMERIC(10,3),
  new_target       NUMERIC(10,3),
  old_calories     INTEGER,
  new_calories     INTEGER,
  reason           TEXT,
  adjusted_at      TIMESTAMPTZ DEFAULT now(),
  adjusted_by      TEXT DEFAULT 'ai_auto'
    CHECK (adjusted_by IN ('ai_auto','user_manual','coach'))
);
```

---

## 10. goals.weekly_reports

```sql
CREATE TABLE goals.weekly_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  week_start       DATE NOT NULL,
  UNIQUE (user_id, week_start),

  -- Overall
  overall_progress_pct NUMERIC(5,2),
  overall_trajectory   TEXT,

  -- Module Contributions (Snapshot)
  nutrition_score      NUMERIC(5,2),
  training_score       NUMERIC(5,2),
  recovery_score       NUMERIC(5,2),
  supplement_score     NUMERIC(5,2),
  medical_score        NUMERIC(5,2),

  -- Insights
  top_win              TEXT,
  top_bottleneck       TEXT,
  next_week_focus      TEXT[],

  generated_at         TIMESTAMPTZ DEFAULT now()
);
```

---

## VIEWs

### user_goal_dashboard (Materialized)

```sql
CREATE MATERIALIZED VIEW goals.user_goal_dashboard AS
SELECT
  ug.user_id,
  ug.id AS goal_id,
  ug.title,
  ug.goal_type,
  ug.status,
  ug.progress_pct,
  ug.target_date,
  gp.phase_type AS current_phase,
  gp.parameters->>'calorie_target' AS calorie_target,
  ts.tdee_active,
  ts.weight_7d_avg,
  COALESCE(
    AVG(gc.contribution_score) FILTER (WHERE gc.contribution_date >= CURRENT_DATE - 7),
    0
  ) AS avg_contribution_7d
FROM goals.user_goals ug
LEFT JOIN goals.goal_phases gp ON gp.user_id = ug.user_id AND gp.is_active = true
LEFT JOIN goals.tdee_settings ts ON ts.user_id = ug.user_id
LEFT JOIN goals.goal_contributions gc ON gc.goal_id = ug.id
WHERE ug.status = 'active'
GROUP BY ug.user_id, ug.id, ug.title, ug.goal_type, ug.status,
         ug.progress_pct, ug.target_date, gp.phase_type, gp.parameters, ts.tdee_active, ts.weight_7d_avg;

CREATE UNIQUE INDEX ON goals.user_goal_dashboard(user_id, goal_id);
```

---

## Grants

```sql
GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA goals TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA goals TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA goals TO authenticated, service_role;
```
