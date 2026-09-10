-- C-461: Ein Programmtag darf keine Routine eines anderen Nutzers referenzieren.
BEGIN;

CREATE OR REPLACE FUNCTION training.validate_program_day_routine_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM training.programs AS program
    JOIN training.routines AS routine ON routine.id = NEW.routine_id
    WHERE program.id = NEW.program_id
      AND program.user_id = routine.user_id
  ) THEN
    RAISE EXCEPTION 'program_days.routine_id muss demselben Nutzer wie das Programm gehoeren'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION training.validate_program_day_routine_owner() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER program_days_validate_routine_owner
  BEFORE INSERT OR UPDATE OF program_id, routine_id
  ON training.program_days
  FOR EACH ROW EXECUTE FUNCTION training.validate_program_day_routine_owner();

COMMIT;
