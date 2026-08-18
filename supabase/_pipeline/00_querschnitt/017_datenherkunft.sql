-- =============================================================
-- 017 - Datenherkunft fuer User-Messdaten (A-17)
-- Datum: 2026-08-18
-- Laeuft spaet in der Kette, nach den betroffenen Userdaten-Tabellen.
-- =============================================================
--
-- Bestehende Muster:
--   [read] goals.body_measurements/body_circumferences nutzen
--          measurement_source + source_detail.
--   [read] medical.lab_reports/lab_result_values nutzen source +
--          source_detail, plus confidence/verification fuer Import.
--
-- Entscheidung fuer diesen Schritt:
--   * Mess-/Ereigniszeilen bekommen measurement_source + source_detail.
--   * nutrition.meals ist ein Container und bekommt deshalb
--     entry_source + source_detail.
--   * Bestehende Fachfelder bleiben erhalten:
--       - meal_items.food_source = Ziel des Lebensmittels (BLS/custom/manual)
--       - water_logs.source = Eingabemethode (manual/quick_add)
--       - workout_sets.logged_via = Bedienweg (manual/voice/auto)
--
-- Erlaubte Quellen folgen dem spaeter gebauten Goals-Muster:
--   manual, device, import, admin
-- plus seed fuer ausdruecklich erzeugte Testdaten. Der Default ist
-- manual, damit bestehende Zeilen nicht uneindeutig bleiben.
-- =============================================================

BEGIN;

ALTER TABLE nutrition.meals
  ADD COLUMN IF NOT EXISTS entry_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE nutrition.meals
  DROP CONSTRAINT IF EXISTS meals_entry_source_ck;
ALTER TABLE nutrition.meals
  ADD CONSTRAINT meals_entry_source_ck
  CHECK (entry_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN nutrition.meals.entry_source IS
  'Herkunft des Mahlzeit-Containers. Nicht verwechseln mit meal_items.food_source.';
COMMENT ON COLUMN nutrition.meals.source_detail IS
  'Optionales Detail zur Herkunft, z. B. App-Version, Importpfad oder Geraet.';

ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_measurement_source_ck;
ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN nutrition.meal_items.measurement_source IS
  'Herkunft der erfassten Position und Menge. food_source beschreibt dagegen das Ziel-Lebensmittel.';
COMMENT ON COLUMN nutrition.meal_items.source_detail IS
  'Optionales Detail zur Herkunft, z. B. MealCam-Modell, Importpfad oder Geraet.';

ALTER TABLE nutrition.water_logs
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE nutrition.water_logs
  DROP CONSTRAINT IF EXISTS water_logs_measurement_source_ck;
ALTER TABLE nutrition.water_logs
  ADD CONSTRAINT water_logs_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN nutrition.water_logs.measurement_source IS
  'Herkunft des Wasserereignisses. source bleibt die Eingabemethode manual/quick_add.';
COMMENT ON COLUMN nutrition.water_logs.source_detail IS
  'Optionales Detail zur Herkunft, z. B. Trinkflasche, Wearable, Importpfad oder App-Version.';

ALTER TABLE recovery.checkins
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE recovery.checkins
  DROP CONSTRAINT IF EXISTS recovery_checkins_measurement_source_ck;
ALTER TABLE recovery.checkins
  ADD CONSTRAINT recovery_checkins_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN recovery.checkins.measurement_source IS
  'Herkunft des Check-ins. V1 ist manuell; Wearable-Rohdaten brauchen spaeter eigene Tabellen.';
COMMENT ON COLUMN recovery.checkins.source_detail IS
  'Optionales Detail zur Herkunft, z. B. Geraet, Importpfad oder App-Version.';

ALTER TABLE training.workout_sessions
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE training.workout_sessions
  DROP CONSTRAINT IF EXISTS workout_sessions_measurement_source_ck;
ALTER TABLE training.workout_sessions
  ADD CONSTRAINT workout_sessions_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN training.workout_sessions.measurement_source IS
  'Herkunft der Trainingseinheit, z. B. manuelle Eingabe, Geraet oder Import.';
COMMENT ON COLUMN training.workout_sessions.source_detail IS
  'Optionales Detail zur Herkunft, z. B. Geraet, Importpfad oder App-Version.';

ALTER TABLE training.workout_sets
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE training.workout_sets
  DROP CONSTRAINT IF EXISTS workout_sets_measurement_source_ck;
ALTER TABLE training.workout_sets
  ADD CONSTRAINT workout_sets_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN training.workout_sets.measurement_source IS
  'Herkunft des Satzwerts. logged_via bleibt der Bedienweg manual/voice/auto.';
COMMENT ON COLUMN training.workout_sets.source_detail IS
  'Optionales Detail zur Herkunft, z. B. Geraet, Importpfad oder App-Version.';

ALTER TABLE supplements.intake_logs
  ADD COLUMN IF NOT EXISTS measurement_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail TEXT;

ALTER TABLE supplements.intake_logs
  DROP CONSTRAINT IF EXISTS intake_logs_measurement_source_ck;
ALTER TABLE supplements.intake_logs
  ADD CONSTRAINT intake_logs_measurement_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin', 'seed'));

COMMENT ON COLUMN supplements.intake_logs.measurement_source IS
  'Herkunft des Einnahmeprotokolls.';
COMMENT ON COLUMN supplements.intake_logs.source_detail IS
  'Optionales Detail zur Herkunft, z. B. Geraet, Importpfad oder App-Version.';

DO $$
DECLARE
  v_missing INTEGER;
BEGIN
  SELECT
    (SELECT count(*) FROM nutrition.meals WHERE entry_source IS NULL)
    + (SELECT count(*) FROM nutrition.meal_items WHERE measurement_source IS NULL)
    + (SELECT count(*) FROM nutrition.water_logs WHERE measurement_source IS NULL)
    + (SELECT count(*) FROM recovery.checkins WHERE measurement_source IS NULL)
    + (SELECT count(*) FROM training.workout_sessions WHERE measurement_source IS NULL)
    + (SELECT count(*) FROM training.workout_sets WHERE measurement_source IS NULL)
    + (SELECT count(*) FROM supplements.intake_logs WHERE measurement_source IS NULL)
  INTO v_missing;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'Datenherkunft: % Zeilen ohne Herkunft', v_missing;
  END IF;

  RAISE NOTICE 'OK: A-17 Datenherkunft gesetzt; keine User-Messzeile ohne Herkunft.';
END $$;

COMMIT;

