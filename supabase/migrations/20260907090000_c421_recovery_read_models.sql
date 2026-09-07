-- C-421/G-367: user-owned Recovery read models and the cross-module
-- muscle-load view. Seed rows live exclusively in pipeline step 421_seed.

CREATE SCHEMA IF NOT EXISTS recovery;

CREATE TABLE IF NOT EXISTS recovery.overtraining_alerts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  alert_date            date NOT NULL,
  severity              text NOT NULL CHECK (severity IN ('normal', 'moderate', 'high', 'critical')),
  signals               jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_action    text,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at       timestamptz,
  resolved_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, alert_date),
  CHECK (jsonb_typeof(signals) = 'array')
);

CREATE TABLE IF NOT EXISTS recovery.recovery_protocols (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  protocol_key          text NOT NULL CHECK (protocol_key IN ('active_recovery_week', 'passive_deload', 'sleep_optimization', 'injury_protocol')),
  name                  text NOT NULL,
  target_condition      text NOT NULL,
  started_on            date NOT NULL,
  duration_days         integer NOT NULL CHECK (duration_days BETWEEN 1 AND 31),
  daily_activities      jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
  completed_days        integer NOT NULL DEFAULT 0 CHECK (completed_days >= 0),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(daily_activities) = 'array')
);

CREATE TABLE IF NOT EXISTS recovery.stress_logs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  entry_date            date NOT NULL,
  logged_at             timestamptz NOT NULL DEFAULT now(),
  stress_level          smallint NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  work_stress           smallint CHECK (work_stress BETWEEN 1 AND 10),
  life_stress           smallint CHECK (life_stress BETWEEN 1 AND 10),
  hrv_impact_points     numeric(4,1),
  source                text NOT NULL DEFAULT 'checkin' CHECK (source IN ('checkin', 'manual', 'import')),
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recovery.score_contributions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
  entry_date            date NOT NULL,
  source_module         text NOT NULL CHECK (source_module IN ('recovery', 'training', 'nutrition', 'medical')),
  contribution_key      text NOT NULL,
  input_score           numeric(5,1) NOT NULL CHECK (input_score BETWEEN 0 AND 100),
  weight_percent        numeric(5,2) NOT NULL CHECK (weight_percent BETWEEN 0 AND 100),
  weighted_points       numeric(5,2) NOT NULL,
  source_status         text NOT NULL CHECK (source_status IN ('measured', 'fallback', 'unavailable')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date, source_module, contribution_key)
);

CREATE INDEX IF NOT EXISTS idx_recovery_alerts_user_date
  ON recovery.overtraining_alerts (user_id, alert_date DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_protocols_user_status
  ON recovery.recovery_protocols (user_id, status, started_on DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_stress_logs_user_date
  ON recovery.stress_logs (user_id, entry_date DESC, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_score_contributions_user_date
  ON recovery.score_contributions (user_id, entry_date DESC, source_module);

ALTER TABLE recovery.overtraining_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.recovery_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.stress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.score_contributions ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA recovery TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON recovery.overtraining_alerts, recovery.recovery_protocols,
  recovery.stress_logs, recovery.score_contributions TO authenticated;
GRANT ALL ON recovery.overtraining_alerts, recovery.recovery_protocols,
  recovery.stress_logs, recovery.score_contributions TO service_role;

DROP POLICY IF EXISTS recovery_overtraining_alerts_select ON recovery.overtraining_alerts;
DROP POLICY IF EXISTS recovery_overtraining_alerts_insert ON recovery.overtraining_alerts;
DROP POLICY IF EXISTS recovery_overtraining_alerts_update ON recovery.overtraining_alerts;
DROP POLICY IF EXISTS recovery_overtraining_alerts_delete ON recovery.overtraining_alerts;
CREATE POLICY recovery_overtraining_alerts_select ON recovery.overtraining_alerts
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_overtraining_alerts_insert ON recovery.overtraining_alerts
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_overtraining_alerts_update ON recovery.overtraining_alerts
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_overtraining_alerts_delete ON recovery.overtraining_alerts
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS recovery_protocols_select ON recovery.recovery_protocols;
DROP POLICY IF EXISTS recovery_protocols_insert ON recovery.recovery_protocols;
DROP POLICY IF EXISTS recovery_protocols_update ON recovery.recovery_protocols;
DROP POLICY IF EXISTS recovery_protocols_delete ON recovery.recovery_protocols;
CREATE POLICY recovery_protocols_select ON recovery.recovery_protocols
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_protocols_insert ON recovery.recovery_protocols
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_protocols_update ON recovery.recovery_protocols
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_protocols_delete ON recovery.recovery_protocols
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS recovery_stress_logs_select ON recovery.stress_logs;
DROP POLICY IF EXISTS recovery_stress_logs_insert ON recovery.stress_logs;
DROP POLICY IF EXISTS recovery_stress_logs_update ON recovery.stress_logs;
DROP POLICY IF EXISTS recovery_stress_logs_delete ON recovery.stress_logs;
CREATE POLICY recovery_stress_logs_select ON recovery.stress_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_stress_logs_insert ON recovery.stress_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_stress_logs_update ON recovery.stress_logs
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_stress_logs_delete ON recovery.stress_logs
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS recovery_score_contributions_select ON recovery.score_contributions;
DROP POLICY IF EXISTS recovery_score_contributions_insert ON recovery.score_contributions;
DROP POLICY IF EXISTS recovery_score_contributions_update ON recovery.score_contributions;
DROP POLICY IF EXISTS recovery_score_contributions_delete ON recovery.score_contributions;
CREATE POLICY recovery_score_contributions_select ON recovery.score_contributions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_score_contributions_insert ON recovery.score_contributions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_score_contributions_update ON recovery.score_contributions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_score_contributions_delete ON recovery.score_contributions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE VIEW public.muscle_training_loads
WITH (security_invoker = true) AS
WITH per_session AS (
  SELECT
    session.user_id,
    muscle.name AS muscle_group,
    session.id AS session_id,
    session.session_date,
    COALESCE(session.ended_time, session.started_time) AS session_time,
    SUM(exercise.actual_sets)::integer AS sets,
    SUM(exercise.actual_volume_kg)::numeric(12,2) AS volume_kg
  FROM training.workout_sessions AS session
  JOIN training.workout_exercises AS exercise ON exercise.workout_session_id = session.id
  JOIN training.exercise_muscles AS exercise_muscle ON exercise_muscle.exercise_id = exercise.exercise_id
  JOIN training.muscle_groups AS muscle ON muscle.id = exercise_muscle.muscle_group_id
  WHERE session.status = 'completed'
  GROUP BY session.user_id, muscle.name, session.id, session.session_date, session.started_time, session.ended_time
), latest AS (
  SELECT DISTINCT ON (user_id, muscle_group)
    user_id,
    muscle_group,
    session_id,
    session_date,
    session_time,
    sets,
    volume_kg
  FROM per_session
  ORDER BY user_id, muscle_group, session_date DESC, session_time DESC, session_id DESC
)
SELECT
  user_id,
  muscle_group,
  session_id,
  session_date AS last_trained_date,
  session_time AS last_trained_time,
  GREATEST(0::numeric, ROUND(EXTRACT(EPOCH FROM (now() - (session_date + session_time)::timestamp)) / 3600, 1)) AS hours_since_trained,
  sets,
  volume_kg
FROM latest;

GRANT SELECT ON public.muscle_training_loads TO authenticated, service_role;

COMMENT ON VIEW public.muscle_training_loads IS
  'G-367/E-52: Plattform-Lesesicht ueber Training-Sitzungen, Exercises und Muskelzuordnungen. Jede Zeile ist die letzte absolvierte Sitzung je Nutzer und Muskelgruppe; security_invoker erhaelt das Training-RLS.';
