-- C-461: Programme trennen die mehrwoechige Vorlage von der einzelnen Routine.
-- Der Marketplace und Coach erhalten nur die Quelle; deren Auslieferungs- bzw.
-- Zuweisungswege bleiben bewusst Folgeauftraege.
BEGIN;

CREATE TABLE training.routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  source text NOT NULL DEFAULT 'self'
    CHECK (source IN ('self', 'coach', 'marketplace')),
  name text NOT NULL CHECK (btrim(name) <> ''),
  description text,
  days_per_week smallint CHECK (days_per_week IS NULL OR days_per_week BETWEEN 1 AND 7),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE training.routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES training.routines(id) ON DELETE RESTRICT,
  exercise_id uuid NOT NULL REFERENCES training.exercises(id) ON DELETE RESTRICT,
  exercise_order smallint NOT NULL CHECK (exercise_order > 0),
  target_sets smallint NOT NULL DEFAULT 3 CHECK (target_sets > 0),
  target_reps text NOT NULL DEFAULT '8-12' CHECK (btrim(target_reps) <> ''),
  target_weight_kg numeric(8,2) CHECK (target_weight_kg IS NULL OR target_weight_kg >= 0),
  target_percent_1rm numeric(5,2) CHECK (target_percent_1rm IS NULL OR target_percent_1rm > 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_exercises_order_key UNIQUE (routine_id, exercise_order),
  CONSTRAINT routine_exercises_weight_or_percent_ck CHECK (
    target_weight_kg IS NULL OR target_percent_1rm IS NULL
  )
);

CREATE TABLE training.routine_schedule_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL REFERENCES training.routines(id) ON DELETE RESTRICT,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  week_number smallint CHECK (week_number IS NULL OR week_number > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routine_schedule_days_key UNIQUE NULLS NOT DISTINCT (routine_id, day_of_week, week_number)
);

CREATE TABLE training.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  source text NOT NULL DEFAULT 'self'
    CHECK (source IN ('self', 'coach', 'marketplace')),
  name text NOT NULL CHECK (btrim(name) <> ''),
  description text,
  duration_weeks smallint NOT NULL CHECK (duration_weeks > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE training.program_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training.programs(id) ON DELETE RESTRICT,
  week_start smallint NOT NULL CHECK (week_start > 0),
  week_end smallint NOT NULL CHECK (week_end >= week_start),
  label text NOT NULL CHECK (btrim(label) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_blocks_start_key UNIQUE (program_id, week_start)
);

CREATE TABLE training.program_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training.programs(id) ON DELETE RESTRICT,
  routine_id uuid NOT NULL REFERENCES training.routines(id) ON DELETE RESTRICT,
  week_number smallint NOT NULL CHECK (week_number > 0),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_days_week_day_key UNIQUE (program_id, week_number, day_of_week)
);

CREATE TABLE training.program_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training.programs(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'confirmed', 'running', 'ended')),
  proposed_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  started_at date,
  ended_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT program_assignments_confirmed_ck CHECK (
    status = 'proposed' OR confirmed_at IS NOT NULL
  ),
  CONSTRAINT program_assignments_started_ck CHECK (
    status NOT IN ('running', 'ended') OR started_at IS NOT NULL
  ),
  CONSTRAINT program_assignments_ended_ck CHECK (
    status <> 'ended' OR ended_at IS NOT NULL
  )
);

ALTER TABLE training.workout_sessions
  ADD COLUMN program_assignment_id uuid REFERENCES training.program_assignments(id) ON DELETE RESTRICT,
  ADD COLUMN program_day_id uuid REFERENCES training.program_days(id) ON DELETE RESTRICT;

CREATE INDEX routines_user_active_idx ON training.routines (user_id, is_active);
CREATE INDEX routine_exercises_routine_order_idx ON training.routine_exercises (routine_id, exercise_order);
CREATE INDEX routine_schedule_days_routine_idx ON training.routine_schedule_days (routine_id, week_number, day_of_week);
CREATE INDEX programs_user_source_idx ON training.programs (user_id, source);
CREATE INDEX program_blocks_program_week_idx ON training.program_blocks (program_id, week_start);
CREATE INDEX program_days_program_week_day_idx ON training.program_days (program_id, week_number, day_of_week);
CREATE INDEX program_assignments_user_status_idx ON training.program_assignments (user_id, status);
CREATE INDEX workout_sessions_program_assignment_idx ON training.workout_sessions (program_assignment_id)
  WHERE program_assignment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION training.validate_program_session_link()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.program_assignment_id IS NULL) <> (NEW.program_day_id IS NULL) THEN
    RAISE EXCEPTION 'workout_sessions braucht Programmtag und Zuweisung zusammen oder gar nicht'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.program_assignment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM training.program_assignments AS assignment
    JOIN training.program_days AS day ON day.id = NEW.program_day_id
    WHERE assignment.id = NEW.program_assignment_id
      AND assignment.user_id = NEW.user_id
      AND day.program_id = assignment.program_id
  ) THEN
    RAISE EXCEPTION 'workout_sessions-Programmverweise gehoeren nicht zu diesem Nutzer und Programm'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION training.validate_program_session_link() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER workout_sessions_validate_program_link
  BEFORE INSERT OR UPDATE OF user_id, program_assignment_id, program_day_id
  ON training.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION training.validate_program_session_link();
CREATE TRIGGER routines_touch_updated_at
  BEFORE UPDATE ON training.routines
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();
CREATE TRIGGER programs_touch_updated_at
  BEFORE UPDATE ON training.programs
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();
CREATE TRIGGER program_assignments_touch_updated_at
  BEFORE UPDATE ON training.program_assignments
  FOR EACH ROW EXECUTE FUNCTION training.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON
  training.routines, training.routine_exercises, training.routine_schedule_days,
  training.programs, training.program_blocks, training.program_days,
  training.program_assignments
TO authenticated;
GRANT ALL ON
  training.routines, training.routine_exercises, training.routine_schedule_days,
  training.programs, training.program_blocks, training.program_days,
  training.program_assignments
TO service_role;

ALTER TABLE training.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.routine_schedule_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.program_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.program_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY routines_owner ON training.routines FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY routine_exercises_owner ON training.routine_exercises FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM training.routines r WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM training.routines r WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())));
CREATE POLICY routine_schedule_days_owner ON training.routine_schedule_days FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM training.routines r WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM training.routines r WHERE r.id = routine_id AND r.user_id = (SELECT auth.uid())));
CREATE POLICY programs_owner ON training.programs FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY program_blocks_owner ON training.program_blocks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM training.programs p WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM training.programs p WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())));
CREATE POLICY program_days_owner ON training.program_days FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM training.programs p WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM training.programs p WHERE p.id = program_id AND p.user_id = (SELECT auth.uid())));
CREATE POLICY program_assignments_owner ON training.program_assignments FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE training.programs IS
  'C-461: fachmodul-eigene mehrwoechige Programmvorlage. source reserviert self, coach und marketplace; C-452 liefert noch nicht aus.';
COMMENT ON TABLE training.program_assignments IS
  'C-461/SPEC_01 HumanCoach: Zuweisung folgt proposed -> confirmed -> running -> ended; kein Coach-Schreibweg in diesem Auftrag.';
COMMENT ON COLUMN training.workout_sessions.program_day_id IS
  'C-461: nullable. Freie und historische Sitzungen bleiben ohne Programmtag gueltig.';

COMMIT;
