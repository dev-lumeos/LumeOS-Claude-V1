-- G-625: Planfelder und der Einstieg Eigene Werte in jeder Auswahlgruppe.
-- Unbelegte Fachwerte bleiben NULL; fat_percent ist kein g/kg-Wert und
-- refeeds.every_weeks sind keine Refeed-Tage pro Woche.
BEGIN;

DO $g625_catalog$
BEGIN
  IF (SELECT count(*) FROM goals.goal_strategies)<>17
     OR EXISTS (SELECT 1 FROM goals.goal_strategies
       WHERE requirements ? 'min_experience')
     OR EXISTS (SELECT 1 FROM goals.goal_strategies
       WHERE code LIKE 'eigene_werte_%') THEN
    RAISE EXCEPTION 'G-625: Strategiekatalog weicht vom gemessenen Bestand ab';
  END IF;
END $g625_catalog$;

ALTER TABLE goals.goal_strategies
  ADD COLUMN fett_g_kg numeric(5,2)
    CHECK (fett_g_kg IS NULL OR fett_g_kg>0),
  ADD COLUMN cardio_pro_woche numeric(5,2)
    CHECK (cardio_pro_woche IS NULL OR cardio_pro_woche>=0),
  ADD COLUMN refeed_pro_woche numeric(5,2)
    CHECK (refeed_pro_woche IS NULL OR refeed_pro_woche>=0);

INSERT INTO goals.goal_strategies (
  code,label,description,icon,category,tier,
  auswahl_gruppe,min_erfahrung,standard
) VALUES
  ('eigene_werte_abnehmen','Eigene Werte',
    'Eigenes Vorgehen fuer Abnehmen ab Pro.','settings','fat_loss',
    'advanced','abnehmen','pro',false),
  ('eigene_werte_halten','Eigene Werte',
    'Eigenes Vorgehen fuer Halten ab Pro.','settings','hybrid',
    'advanced','halten','pro',false),
  ('eigene_werte_aufbauen','Eigene Werte',
    'Eigenes Vorgehen fuer Aufbauen ab Pro.','settings','muscle_gain',
    'advanced','aufbauen','pro',false),
  ('eigene_werte_uebergang','Eigene Werte',
    'Eigener Uebergang ab Pro.','settings','recovery',
    'advanced','uebergang','pro',false),
  ('eigene_werte_plan','Eigene Werte',
    'Eigene Planphase ab Pro.','settings','expert',
    'advanced','plan','pro',false);

COMMENT ON COLUMN goals.goal_strategies.fett_g_kg IS
  'G-625: Fettvorgabe in g/kg; NULL, wenn nur fat_percent oder eine Unterphasenregel belegt ist.';
COMMENT ON COLUMN goals.goal_strategies.cardio_pro_woche IS
  'G-625: Cardioeinheiten je Woche; NULL ohne eine eindeutige Katalogvorgabe.';
COMMENT ON COLUMN goals.goal_strategies.refeed_pro_woche IS
  'G-625: Refeed-Tage je Woche; NULL ohne eine eindeutige Katalogvorgabe.';
COMMIT;
