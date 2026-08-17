-- =============================================================
-- 052a -- Mahlzeitenzeit und mehrere Mahlzeiten je Typ (C-61/C-59)
-- Datum: 2026-08-17
-- Zweck: nutrition.meals speichert die lokale Uhrzeit des Essens und
--        erlaubt mehrere Mahlzeiten desselben Typs am selben Tag.
--
-- Entscheidung: meal_time ist eine lokale Uhrzeit zum entry_date, kein
-- timestamptz. entry_date ist der lokale Tagebuchtag; eine UTC-Uhrzeit
-- wuerde Tom in Thailand beim Abendessen auf einen anderen Kalendertag
-- schieben. Die Anwendung muss die aktuelle lokale Uhrzeit als Vorgabe
-- setzen. Die Datenbank setzt keinen DEFAULT now(), weil der Server in
-- UTC laeuft und dadurch genau die falsche Uhrzeit einfrieren wuerde.
-- =============================================================

BEGIN;

ALTER TABLE nutrition.meals
  ADD COLUMN IF NOT EXISTS meal_time TIME;

COMMENT ON COLUMN nutrition.meals.meal_time IS
  'Lokale Uhrzeit des Essens zum entry_date (C-61). Kein Erfassungszeitpunkt. '
  'Kein DB-Default: die Anwendung setzt die lokale aktuelle Uhrzeit; der Server laeuft in UTC.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'nutrition.meals'::regclass
      AND conname = 'meals_meal_time_minute_check'
  ) THEN
    ALTER TABLE nutrition.meals
      ADD CONSTRAINT meals_meal_time_minute_check
      CHECK (meal_time IS NULL OR EXTRACT(SECOND FROM meal_time) = 0);
  END IF;
END $$;

-- Bestehende Seed-/Testdaten bekommen stabile, konservative Uhrzeiten.
-- Neue Schreibpfade sollen meal_time explizit setzen; NULL bleibt
-- zulaessig, damit der heute existierende App-Pfad nicht bricht.
UPDATE nutrition.meals
SET meal_time = CASE meal_type
  WHEN 'breakfast' THEN TIME '07:30'
  WHEN 'lunch' THEN TIME '12:30'
  WHEN 'snack' THEN TIME '16:00'
  WHEN 'dinner' THEN TIME '19:30'
  WHEN 'pre_workout' THEN TIME '17:00'
  WHEN 'post_workout' THEN TIME '19:00'
  ELSE TIME '12:00'
END
WHERE meal_time IS NULL;

-- C-59: mehrere Snacks oder andere gleichartige Mahlzeiten am selben
-- lokalen Tag sind erlaubt. Die Sortierung laeuft ueber meal_time.
DROP INDEX IF EXISTS nutrition.uq_meals_user_date_type;

CREATE INDEX IF NOT EXISTS idx_meals_user_date_time
  ON nutrition.meals(user_id, entry_date, meal_time, created_at, id);

CREATE INDEX IF NOT EXISTS idx_meals_user_date_type_time
  ON nutrition.meals(user_id, entry_date, meal_type, meal_time, id);

COMMIT;
