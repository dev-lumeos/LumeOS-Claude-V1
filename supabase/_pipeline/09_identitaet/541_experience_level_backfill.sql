-- C-541: Bestehende Profile ohne Erfahrungsgrad konservativ als beginner
-- nachziehen. Die fuenf Leser behandeln fehlend heute bereits wie die
-- niedrigste Stufe; der Nachzug erfindet daher keinen hoeheren Zugang.
--
-- Dieser Datenschritt laeuft vor der Strukturmigration, die NOT NULL setzt.
-- Er ist idempotent und aendert bereits gewaehlte Grade nicht.

BEGIN;

UPDATE public.profiles
SET experience_level = 'beginner',
    updated_at = now()
WHERE experience_level IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE experience_level IS NULL
  ) THEN
    RAISE EXCEPTION 'C-541: public.profiles enthaelt weiter einen leeren experience_level';
  END IF;
END $$;

COMMIT;
