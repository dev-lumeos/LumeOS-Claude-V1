-- =============================================================
-- 106 — Training-Sitzungen und Saetze (C-66)
-- Datum: 2026-08-17
-- Zweck: Userdaten fuer Training: Sitzung, Uebung in Sitzung, Satz.
-- Idempotent: CREATE IF NOT EXISTS, Trigger/Policies per DROP + CREATE.
--
-- Zuschnitt:
--   [read] SPEC_06 nennt workout_sessions, workout_exercises,
--          workout_sets als Kern einer absolvierten Trainingseinheit.
--   [read] SPEC_02 nennt WorkoutSet-Daten als eingefroren.
--   [cmd]  Im aktuellen Repo existieren vor diesem Schritt nur
--          Training-Stammdaten: exercises, equipment, muscle_groups,
--          exercise_muscles. Keine Userdaten.
--
-- Bewusste Abweichungen:
--   1. Keine Routinen, Progression, PRs, Events, Feedback. Das sind
--      Folgeschritte; C-66 baut nur, was eine Sitzung ausmacht.
--   2. Zeit wie bei nutrition.meals: lokaler Tag + lokale Uhrzeiten,
--      nicht nur timestamptz. Sonst verschiebt UTC den Trainingstag.
--   3. Uebungsname wird in workout_exercises eingefroren. Satzwerte
--      selbst sind ohnehin der Log-Snapshot; Stammdatenkorrekturen
--      duerfen alte Logs nicht umbenennen.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS training;

-- -------------------------------------------------------------
-- 1. workout_sessions — eine Trainingseinheit eines Nutzers.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.workout_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  session_date     DATE NOT NULL,
  started_time     TIME NOT NULL,
  ended_time       TIME,
  name             TEXT,
  status           TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('planned','active','completed','cancelled')),
  location         TEXT,
  notes            TEXT,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  total_volume_kg  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_sets       INTEGER NOT NULL DEFAULT 0,
  total_reps       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ended_time IS NULL OR ended_time >= started_time)
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date_time
  ON training.workout_sessions(user_id, session_date DESC, started_time DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_status
  ON training.workout_sessions(user_id, status);

-- -------------------------------------------------------------
-- 2. workout_exercises — Uebungen innerhalb einer Sitzung.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.workout_exercises (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES training.workout_sessions(id) ON DELETE CASCADE,
  exercise_id        UUID NOT NULL REFERENCES training.exercises(id) ON DELETE RESTRICT,
  exercise_order     INTEGER NOT NULL CHECK (exercise_order > 0),
  superset_group     INTEGER,
  exercise_name      TEXT NOT NULL,
  planned_sets       INTEGER CHECK (planned_sets IS NULL OR planned_sets > 0),
  planned_reps       TEXT,
  planned_weight_kg  NUMERIC(8,2) CHECK (planned_weight_kg IS NULL OR planned_weight_kg >= 0),
  notes              TEXT,
  actual_sets        INTEGER NOT NULL DEFAULT 0,
  actual_volume_kg   NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_weight_kg      NUMERIC(8,2),
  total_reps         INTEGER NOT NULL DEFAULT 0,
  best_estimated_1rm NUMERIC(8,2),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workout_session_id, exercise_order)
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_session
  ON training.workout_exercises(workout_session_id, exercise_order);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise
  ON training.workout_exercises(exercise_id);

-- -------------------------------------------------------------
-- 3. workout_sets — einzelne Saetze.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training.workout_sets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id   UUID NOT NULL REFERENCES training.workout_exercises(id) ON DELETE CASCADE,
  set_number            SMALLINT NOT NULL CHECK (set_number > 0),
  reps                  INTEGER CHECK (reps IS NULL OR reps > 0),
  weight_kg             NUMERIC(8,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  duration_seconds      INTEGER CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  distance_meters       NUMERIC(10,2) CHECK (distance_meters IS NULL OR distance_meters >= 0),
  rpe                   NUMERIC(3,1) CHECK (rpe IS NULL OR rpe BETWEEN 1 AND 10),
  rir                   SMALLINT CHECK (rir IS NULL OR rir BETWEEN 0 AND 10),
  set_type              TEXT NOT NULL DEFAULT 'working'
    CHECK (set_type IN ('working','warmup','dropset','failure')),
  rest_seconds          INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  notes                 TEXT,
  logged_via            TEXT NOT NULL DEFAULT 'manual'
    CHECK (logged_via IN ('manual','voice','auto')),
  completed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  volume_kg             NUMERIC(12,2),
  estimated_1rm         NUMERIC(8,2),
  is_pr                 BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workout_exercise_id, set_number),
  CHECK (
    reps IS NOT NULL
    OR duration_seconds IS NOT NULL
    OR distance_meters IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise
  ON training.workout_sets(workout_exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_workout_sets_completed_at
  ON training.workout_sets(completed_at DESC);

-- -------------------------------------------------------------
-- 4. Trigger: Snapshots und Aggregate.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION training.fill_workout_exercise_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.exercise_name IS NULL OR btrim(NEW.exercise_name) = '' THEN
    SELECT e.name INTO NEW.exercise_name
    FROM training.exercises e
    WHERE e.id = NEW.exercise_id;
  END IF;

  IF NEW.exercise_name IS NULL OR btrim(NEW.exercise_name) = '' THEN
    RAISE EXCEPTION 'workout_exercises.exercise_name konnte nicht aus exercise_id gefuellt werden';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION training.calc_workout_set_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.weight_kg IS NOT NULL AND NEW.reps IS NOT NULL THEN
    NEW.volume_kg := round(NEW.weight_kg * NEW.reps, 2);
  ELSE
    NEW.volume_kg := NULL;
  END IF;

  IF NEW.weight_kg IS NOT NULL
     AND NEW.reps IS NOT NULL
     AND NEW.reps BETWEEN 1 AND 30
     AND NEW.set_type = 'working' THEN
    NEW.estimated_1rm := round((NEW.weight_kg / (1.0278 - 0.0278 * NEW.reps))::numeric, 2);
  ELSE
    NEW.estimated_1rm := NULL;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION training.refresh_workout_totals_for_exercise(p_workout_exercise_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT workout_session_id INTO v_session_id
  FROM training.workout_exercises
  WHERE id = p_workout_exercise_id;

  IF v_session_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE training.workout_exercises we
  SET
    actual_sets = totals.actual_sets,
    actual_volume_kg = totals.actual_volume_kg,
    max_weight_kg = totals.max_weight_kg,
    total_reps = totals.total_reps,
    best_estimated_1rm = totals.best_estimated_1rm
  FROM (
    SELECT
      count(*) FILTER (WHERE set_type = 'working')::integer AS actual_sets,
      COALESCE(sum(volume_kg) FILTER (WHERE set_type = 'working'), 0)::numeric(12,2) AS actual_volume_kg,
      max(weight_kg) FILTER (WHERE set_type = 'working') AS max_weight_kg,
      COALESCE(sum(reps) FILTER (WHERE set_type = 'working'), 0)::integer AS total_reps,
      max(estimated_1rm) FILTER (WHERE set_type = 'working') AS best_estimated_1rm
    FROM training.workout_sets
    WHERE workout_exercise_id = p_workout_exercise_id
  ) totals
  WHERE we.id = p_workout_exercise_id;

  UPDATE training.workout_sessions ws
  SET
    total_sets = totals.total_sets,
    total_reps = totals.total_reps,
    total_volume_kg = totals.total_volume_kg,
    updated_at = now()
  FROM (
    SELECT
      COALESCE(sum(actual_sets), 0)::integer AS total_sets,
      COALESCE(sum(total_reps), 0)::integer AS total_reps,
      COALESCE(sum(actual_volume_kg), 0)::numeric(12,2) AS total_volume_kg
    FROM training.workout_exercises
    WHERE workout_session_id = v_session_id
  ) totals
  WHERE ws.id = v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION training.refresh_workout_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  PERFORM training.refresh_workout_totals_for_exercise(COALESCE(NEW.workout_exercise_id, OLD.workout_exercise_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS workout_exercises_snapshot_trg ON training.workout_exercises;
CREATE TRIGGER workout_exercises_snapshot_trg
  BEFORE INSERT OR UPDATE OF exercise_id, exercise_name
  ON training.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION training.fill_workout_exercise_snapshot();

DROP TRIGGER IF EXISTS workout_sets_calc_metrics_trg ON training.workout_sets;
CREATE TRIGGER workout_sets_calc_metrics_trg
  BEFORE INSERT OR UPDATE OF weight_kg, reps, set_type
  ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION training.calc_workout_set_metrics();

DROP TRIGGER IF EXISTS workout_sets_refresh_totals_trg ON training.workout_sets;
CREATE TRIGGER workout_sets_refresh_totals_trg
  AFTER INSERT OR UPDATE OR DELETE
  ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION training.refresh_workout_totals();

DROP TRIGGER IF EXISTS workout_sessions_touch_updated_at ON training.workout_sessions;
CREATE TRIGGER workout_sessions_touch_updated_at
  BEFORE UPDATE ON training.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();

DROP TRIGGER IF EXISTS workout_sets_touch_updated_at ON training.workout_sets;
CREATE TRIGGER workout_sets_touch_updated_at
  BEFORE UPDATE ON training.workout_sets
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();

-- -------------------------------------------------------------
-- 5. Rechte und RLS.
-- -------------------------------------------------------------
GRANT USAGE ON SCHEMA training TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  training.workout_sessions,
  training.workout_exercises,
  training.workout_sets
TO authenticated;

GRANT ALL ON
  training.workout_sessions,
  training.workout_exercises,
  training.workout_sets
TO service_role;

ALTER TABLE training.workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.workout_sets      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workout_sessions_select ON training.workout_sessions;
DROP POLICY IF EXISTS workout_sessions_insert ON training.workout_sessions;
DROP POLICY IF EXISTS workout_sessions_update ON training.workout_sessions;
DROP POLICY IF EXISTS workout_sessions_delete ON training.workout_sessions;
CREATE POLICY workout_sessions_select ON training.workout_sessions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_insert ON training.workout_sessions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_update ON training.workout_sessions
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_delete ON training.workout_sessions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS workout_exercises_select ON training.workout_exercises;
DROP POLICY IF EXISTS workout_exercises_insert ON training.workout_exercises;
DROP POLICY IF EXISTS workout_exercises_update ON training.workout_exercises;
DROP POLICY IF EXISTS workout_exercises_delete ON training.workout_exercises;
CREATE POLICY workout_exercises_select ON training.workout_exercises
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_exercises_insert ON training.workout_exercises
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_exercises_update ON training.workout_exercises
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND s.user_id = (SELECT auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_exercises_delete ON training.workout_exercises
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM training.workout_sessions s
      WHERE s.id = workout_session_id
        AND s.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS workout_sets_select ON training.workout_sets;
DROP POLICY IF EXISTS workout_sets_insert ON training.workout_sets;
DROP POLICY IF EXISTS workout_sets_update ON training.workout_sets;
DROP POLICY IF EXISTS workout_sets_delete ON training.workout_sets;
CREATE POLICY workout_sets_select ON training.workout_sets
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_sets_insert ON training.workout_sets
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_sets_update ON training.workout_sets
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND s.user_id = (SELECT auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND s.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY workout_sets_delete ON training.workout_sets
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM training.workout_exercises we
      JOIN training.workout_sessions s ON s.id = we.workout_session_id
      WHERE we.id = workout_exercise_id
        AND s.user_id = (SELECT auth.uid())
    )
  );

COMMIT;
