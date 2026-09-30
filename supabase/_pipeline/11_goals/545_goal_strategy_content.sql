-- G-545: Der Katalog bekommt nur Inhalte, die in der geltenden Fachquelle
-- docs/ssot/131-fachwissen-phasen-und-rechenwege.md eine Fundstelle haben.
-- SSOT 131 ist Fachwissen, keine pauschale Festlegung; deshalb bleiben die
-- unten benannten offenen Entscheidungen unveraendert.

BEGIN;

-- A1, contest_prep.sub_phases
-- Quelle je Zelle: SSOT 131, Abschnitt 1 (v2.0 9.1) fuer die drei Stufen
-- sowie Abschnitt 3.1 (v2.0 1.4, 3.1, 4.1, 4.2, 5.2) fuer Kalorien,
-- Protein, Fett, Fettminimum und Cardio.
WITH sourced (code, source_ref, sub_phases) AS (
  VALUES (
    'contest_prep'::text,
    'SSOT 131 Abschnitte 1 und 3.1'::text,
    jsonb_build_array(
      jsonb_build_object(
        'name', 'early',
        'tdee_multiplier', 0.85,
        'protein_g_per_kg', 2.2,
        'fat_g_per_kg', 0.8,
        'fat_minimum_g_per_kg', 0.6,
        'cardio', jsonb_build_object(
          'sessions_per_week', jsonb_build_array(3, 4),
          'minutes', jsonb_build_array(30, 40),
          'type', 'LISS'
        )
      ),
      jsonb_build_object(
        'name', 'mid',
        'tdee_multiplier', 0.78,
        'protein_g_per_kg', 2.4,
        'fat_g_per_kg', 0.7,
        'fat_minimum_g_per_kg', 0.5,
        'cardio', jsonb_build_object(
          'sessions_per_week', jsonb_build_array(4, 6),
          'minutes', jsonb_build_array(40, 40),
          'type', 'LISS/MISS'
        )
      ),
      jsonb_build_object(
        'name', 'late',
        'tdee_multiplier', 0.70,
        'protein_g_per_kg', 2.6,
        'fat_g_per_kg', 0.6,
        'fat_minimum_g_per_kg', 0.5,
        'cardio', jsonb_build_object(
          'sessions_per_week', jsonb_build_array(5, 7),
          'minutes', jsonb_build_array(40, 45),
          'type', 'LISS + HIIT'
        )
      )
    )
  )
)
UPDATE goals.goal_strategies gs
SET sub_phases = sourced.sub_phases
FROM sourced
WHERE gs.code = sourced.code
  AND sourced.source_ref <> '';

-- A2, guards fuer die zehn bislang leeren Strategien.
-- Quelle je Zelle: SSOT 131, Abschnitt 4.4 (v2.0 11.3). Die vier oberen
-- Schwellen sind Steuerwerte; die medizinischen Schwellen darunter werden
-- gemaess Abschnitt 4.4 und Abschnitt 6 nicht in Goals uebernommen.
WITH sourced (code, source_ref) AS (
  VALUES
    ('aggressive_bulk', 'SSOT 131 Abschnitt 4.4'),
    ('body_recomp', 'SSOT 131 Abschnitt 4.4'),
    ('clean_bulk', 'SSOT 131 Abschnitt 4.4'),
    ('custom', 'SSOT 131 Abschnitt 4.4'),
    ('expert_bb_annual', 'SSOT 131 Abschnitt 4.4'),
    ('gain', 'SSOT 131 Abschnitt 4.4'),
    ('maintain', 'SSOT 131 Abschnitt 4.4'),
    ('maintenance_diet_break', 'SSOT 131 Abschnitt 4.4'),
    ('mini_cut', 'SSOT 131 Abschnitt 4.4'),
    ('peak_week', 'SSOT 131 Abschnitt 4.4')
)
UPDATE goals.goal_strategies gs
SET guards = ARRAY[
  'Gewichtsverlust > 2 %/Woche -> warning',
  'Kraftverlust > 15 % -> critical',
  'Schlaf < 5 h an 3+ Tagen -> warning',
  'HRV < 70 % der Baseline an 5+ Tagen -> critical'
]::text[]
FROM sourced
WHERE gs.code = sourced.code
  AND sourced.source_ref <> '';

-- A3 bleibt absichtlich ohne Schreibzugriff: SSOT 131 Abschnitt 3.2 fuehrt
-- je fuenf Grenzen fuer Maenner und Frauen. goals.goal_strategies.requirements
-- hat dafuer keinen entschiedenen Vertrag; eine einzelne Zahl wuerde eine
-- Geschlechtsreihe unterschlagen.

-- A4, direkt belegte Ausgaenge.
-- reverse_diet.exits: SSOT 131 Abschnitt 3.1, Kalorienfaktor x0,90 -> 1,0.
-- contest_prep.exits und alle Cut-Strategien: SSOT 131 Abschnitt 4.3
-- (v2.0 9.2). SSOT 131 definiert keine Erfolgsmetrik fuer diese Strategien;
-- success bleibt deshalb unveraendert statt aus einem Alarm abgeleitet.
WITH sourced (code, source_ref, exits) AS (
  VALUES
    (
      'reverse_diet',
      'SSOT 131 Abschnitt 3.1',
      ARRAY['Kalorienfaktor 1,0 erreicht']::text[]
    ),
    (
      'contest_prep',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['7-10 Tage vor der Show -> Peak Week']::text[]
    ),
    (
      'lose',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep']::text[]
    ),
    (
      'conservative_cut',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep']::text[]
    ),
    (
      'moderate_cut',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep']::text[]
    ),
    (
      'aggressive_cut',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep']::text[]
    ),
    (
      'mini_cut',
      'SSOT 131 Abschnitt 4.3',
      ARRAY['Wettkampfdatum steht: 16-20 Wochen vorher -> Contest Prep']::text[]
    )
)
UPDATE goals.goal_strategies gs
SET exits = sourced.exits
FROM sourced
WHERE gs.code = sourced.code
  AND sourced.source_ref <> '';

-- A5 bleibt absichtlich unveraendert: SSOT 131 Abschnitt 4.3 nennt fuer
-- contest_prep ein Fenster von 16-20 Wochen; die ueberholte Vorfassung C
-- nennt stattdessen eine Rechnung aus Start- und Ziel-KFA. Der Katalogwert 16
-- wird in diesem Auftrag weder als Fenster noch als Rechnung umgedeutet.

-- A6 und Abschluss: keine Substanz, kein Medical-Grenzwert und keine als
-- [annahme] markierte KFA-Kalorienkorrektur aus SSOT 131 Abschnitt 3.2/6.
DO $g545$
DECLARE
  v_forbidden_rows integer;
BEGIN
  IF (SELECT jsonb_array_length(sub_phases)
      FROM goals.goal_strategies WHERE code = 'contest_prep') <> 3 THEN
    RAISE EXCEPTION 'G-545 A1: contest_prep braucht genau drei belegte Stufen';
  END IF;

  IF (SELECT count(*) FROM goals.goal_strategies
      WHERE cardinality(guards) > 0) <> 17 THEN
    RAISE EXCEPTION 'G-545 A2: nicht alle 17 Strategien tragen guards';
  END IF;

  IF (SELECT count(*) FROM goals.goal_strategies
      WHERE cardinality(exits) > 0) <> 7 THEN
    RAISE EXCEPTION 'G-545 A4: erwartet Ausgaenge fuer sieben Strategien';
  END IF;

  SELECT count(*) INTO v_forbidden_rows
  FROM goals.goal_strategies
  WHERE concat_ws(
    ' ', description, array_to_string(warnings, ' '),
    array_to_string(guards, ' '), requirements::text, sub_phases::text,
    array_to_string(exits, ' '), array_to_string(success, ' ')
  ) ~* '(BPC-157|TB-500|CJC-1295|Ipamorelin|GHRP|IGF-1|MGF|Melanotan|PT-141|Blutdruck|Kreatinin|eGFR|H[äa]matokrit|H[äa]moglobin|ALT/AST)';

  IF v_forbidden_rows <> 0 THEN
    RAISE EXCEPTION 'G-545 A6: % Katalogzeilen tragen ausgeschlossene Inhalte',
      v_forbidden_rows;
  END IF;
END
$g545$;

COMMIT;
