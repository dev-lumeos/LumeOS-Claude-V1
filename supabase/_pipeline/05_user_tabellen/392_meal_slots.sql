-- C-392/E-58: Mahlzeiten sind nutzerbenannte, frei viele Zeitslots.
-- meal_type bleibt an historischen Buchungen und Planpositionen bestehen;
-- die Zuordnung zur Anzeige erfolgt ausschliesslich ueber die Uhrzeit.

BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.meal_slots (
  user_id      uuid NOT NULL,
  position     integer NOT NULL,
  name         text NOT NULL,
  planned_time time NOT NULL,
  PRIMARY KEY (user_id, position)
);

COMMENT ON TABLE nutrition.meal_slots IS
  'C-392/E-58: Frei benannte und terminierte Mahlzeiten eines Nutzers. position ordnet ohne Obergrenze; keine Kategorie und kein meal_type.';
COMMENT ON COLUMN nutrition.meal_slots.position IS
  'Reihenfolge innerhalb eines Nutzerplans. Absichtlich ohne Obergrenze (E-58).';
COMMENT ON COLUMN nutrition.meal_slots.name IS
  'Freier, vom Nutzer bearbeitbarer Mahlzeitenname; keine fachliche Kategorie.';
COMMENT ON COLUMN nutrition.meal_slots.planned_time IS
  'Geplante lokale Uhrzeit. Die Anzeige ordnet historische meals ueber meal_time zu; meals speichert keinen Slot-Fremdschluessel.';

GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.meal_slots TO authenticated;
GRANT ALL ON nutrition.meal_slots TO service_role;

ALTER TABLE nutrition.meal_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meal_slots_select ON nutrition.meal_slots;
DROP POLICY IF EXISTS meal_slots_insert ON nutrition.meal_slots;
DROP POLICY IF EXISTS meal_slots_update ON nutrition.meal_slots;
DROP POLICY IF EXISTS meal_slots_delete ON nutrition.meal_slots;

CREATE POLICY meal_slots_select ON nutrition.meal_slots
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_slots_insert ON nutrition.meal_slots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_slots_update ON nutrition.meal_slots
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_slots_delete ON nutrition.meal_slots
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- E-58: Die Anzahl ist eine Nutzerentscheidung, nicht eine Datenbankgrenze.
ALTER TABLE nutrition.food_preferences
  DROP CONSTRAINT IF EXISTS food_preferences_meals_per_day_check;

-- Die einzigen fuenf zeitlosen Mahlzeiten sind gleichartige Seed-Mittagsmahlzeiten
-- des dev-Kontos an aufeinanderfolgenden Tagen. 12:30 folgt der belegten
-- Reihenfolge aller uebrigen Lunch-Eintraege desselben Kontos; es ist keine
-- nutritive oder fachliche Umdeutung von meal_type.
UPDATE nutrition.meals
SET meal_time = TIME '12:30'
WHERE id IN (
  'f8197998-0b80-4e61-8e9c-922260086637'::uuid,
  '374fb71b-db68-41f3-aae7-a847ce801876'::uuid,
  '4ff64c7d-da42-46dc-af02-c6a58f14c3b5'::uuid,
  'a8e6fdbc-8b53-4c06-ac0a-31042016096f'::uuid,
  'a5b1553d-6a9b-4e5f-9bb2-0c0595dc732e'::uuid
)
  AND user_id = 'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'::uuid
  AND meal_type = 'lunch';

-- Beide vorhandenen Preference-Konten haben 4 Mahlzeiten plus 1 Snack.
-- Die vier Regelzeiten sind im Bestand gemessen; der zusaetzliche Snack um
-- 10:14 steht ebenfalls auf beiden Konten und fuellt die belegte fuenfte
-- Position. ON CONFLICT bewahrt spaetere, vom Nutzer geaenderte Slotnamen
-- und -zeiten bei einem erneuten Kettenlauf.
WITH seed_accounts AS (
  SELECT user_id, meals_per_day + snacks_per_day AS slot_count
  FROM nutrition.food_preferences
  WHERE user_id IN (
    'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'::uuid,
    '10000000-0000-0000-0000-000000000101'::uuid
  )
), slot_templates(position, name, planned_time) AS (
  VALUES
    (1, U&'Fr\00FChst\00FCck'::text, TIME '07:30'),
    (2, 'Snack'::text, TIME '10:14'),
    (3, 'Mittagessen'::text, TIME '12:30'),
    (4, 'Nachmittagssnack'::text, TIME '16:00'),
    (5, 'Abendessen'::text, TIME '19:30')
)
INSERT INTO nutrition.meal_slots (user_id, position, name, planned_time)
SELECT account.user_id, template.position, template.name, template.planned_time
FROM seed_accounts account
JOIN slot_templates template ON template.position <= account.slot_count
ON CONFLICT (user_id, position) DO NOTHING;

-- Korrektur ausschliesslich fuer die zwei durch einen Windows-Transportfehler
-- erzeugten Seedwerte; dieser Vergleich trifft keinen regulären Freitext.
UPDATE nutrition.meal_slots
SET name = U&'Fr\00FChst\00FCck'
WHERE user_id IN (
  'd15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6'::uuid,
  '10000000-0000-0000-0000-000000000101'::uuid
)
  AND position = 1
  AND name = 'Fr??hst??ck';

COMMIT;
