-- G-614: Ziel setzen nutzt drei Richtungen; Uebergang und Planer bleiben
-- eigene Gruppen. Bestehende category/tier/requirements/next_codes bleiben.
BEGIN;

CREATE TEMP TABLE g614_selection (
  code text PRIMARY KEY,
  auswahl_gruppe text NOT NULL,
  min_erfahrung text NOT NULL,
  standard boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO g614_selection (code, auswahl_gruppe, min_erfahrung, standard) VALUES
  ('lose', 'abnehmen', 'beginner', true),
  ('conservative_cut', 'abnehmen', 'advanced', false),
  ('moderate_cut', 'abnehmen', 'advanced', false),
  ('mini_cut', 'abnehmen', 'advanced', false),
  ('aggressive_cut', 'abnehmen', 'pro', false),
  ('maintain', 'halten', 'beginner', true),
  ('body_recomp', 'halten', 'advanced', false),
  ('maintenance_diet_break', 'halten', 'pro', false),
  ('gain', 'aufbauen', 'beginner', true),
  ('lean_bulk', 'aufbauen', 'advanced', false),
  ('clean_bulk', 'aufbauen', 'advanced', false),
  ('aggressive_bulk', 'aufbauen', 'pro', false),
  ('reverse_diet', 'uebergang', 'advanced', false),
  ('contest_prep', 'plan', 'pro', false),
  ('peak_week', 'plan', 'pro', false),
  ('expert_bb_annual', 'plan', 'pro', false),
  ('custom', 'plan', 'pro', false);

DO $g614$
BEGIN
  IF (SELECT count(*) FROM goals.goal_strategies) <> 17
     OR (SELECT count(*) FROM g614_selection) <> 17
     OR EXISTS (
       SELECT code FROM goals.goal_strategies
       EXCEPT SELECT code FROM g614_selection
     )
     OR EXISTS (
       SELECT code FROM g614_selection
       EXCEPT SELECT code FROM goals.goal_strategies
     ) THEN
    RAISE EXCEPTION 'G-614: Katalog weicht von den 17 freigegebenen Codes ab';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'goals' AND table_name = 'goal_strategies'
      AND column_name IN ('auswahl_gruppe', 'min_erfahrung', 'standard', 'phasen_karte')
  ) THEN
    RAISE EXCEPTION 'G-614: Auswahlspalten bereits vorhanden; nicht blind wiederholen';
  END IF;
END
$g614$;

ALTER TABLE goals.goal_strategies
  ADD COLUMN auswahl_gruppe text,
  ADD COLUMN min_erfahrung text,
  ADD COLUMN standard boolean;

UPDATE goals.goal_strategies gs
SET auswahl_gruppe = s.auswahl_gruppe,
    min_erfahrung = s.min_erfahrung,
    standard = s.standard
FROM g614_selection s
WHERE gs.code = s.code;

ALTER TABLE goals.goal_strategies
  ALTER COLUMN auswahl_gruppe SET NOT NULL,
  ALTER COLUMN min_erfahrung SET NOT NULL,
  ALTER COLUMN standard SET NOT NULL,
  ADD CONSTRAINT goal_strategies_g614_auswahl_gruppe_check
    CHECK (auswahl_gruppe IN ('abnehmen', 'halten', 'aufbauen', 'uebergang', 'plan')),
  ADD CONSTRAINT goal_strategies_g614_min_erfahrung_check
    CHECK (min_erfahrung IN ('beginner', 'advanced', 'pro', 'elite')),
  ADD CONSTRAINT goal_strategies_g614_standard_check
    CHECK (NOT standard OR (
      auswahl_gruppe IN ('abnehmen', 'halten', 'aufbauen')
      AND min_erfahrung = 'beginner'
    ));

CREATE UNIQUE INDEX goal_strategies_g614_one_standard_per_group
  ON goals.goal_strategies (auswahl_gruppe)
  WHERE standard;

DO $g614$
BEGIN
  IF EXISTS (
    SELECT 1 FROM (
      VALUES ('abnehmen'), ('halten'), ('aufbauen')
    ) AS direction(code)
    LEFT JOIN goals.goal_strategies gs
      ON gs.auswahl_gruppe = direction.code AND gs.standard
    GROUP BY direction.code
    HAVING count(gs.code) <> 1
  ) THEN
    RAISE EXCEPTION 'G-614: jede Zielrichtung braucht genau eine Beginner-Erstwahl';
  END IF;
END
$g614$;

COMMENT ON COLUMN goals.goal_strategies.auswahl_gruppe IS
  'G-614: Zielrichtung, empfohlener Uebergang oder mehrphasiger Planer.';
COMMENT ON COLUMN goals.goal_strategies.min_erfahrung IS
  'G-614: Mindestgrad fuer die neue Strategieauswahl; unabhaengig vom historischen requirements-Objekt.';
COMMENT ON COLUMN goals.goal_strategies.standard IS
  'G-614: Erstwahl genau einer Beginner-Strategie je Zielrichtung.';

COMMIT;
