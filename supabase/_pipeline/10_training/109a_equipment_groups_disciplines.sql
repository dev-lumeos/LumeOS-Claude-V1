-- =============================================================
-- 109a - Training: Geraetegruppen und Disziplinen fuer die Suche
-- Datum: 2026-08-18
-- Zweck: C-90 Vorarbeit fuer den Exercises-Tab: flache Geraete in
--        suchbare Gruppen bringen und eine Disziplin je Uebung ableiten.
--
-- Quelle:
--   [read] referenz/lumeos-2026/src/modules/training/components/
--          ExerciseSearch.tsx liefert vier Geraetegruppen und fuenf
--          Disziplinen. Die Wertnamen passen nicht 1:1 zum aktuellen
--          training.equipment-Bestand, deshalb wird hier zugeordnet,
--          nicht kopiert.
--
-- Nicht enthalten:
--   Keine Uebung wird angelegt, umbenannt oder geloescht.
--   training.exercise_muscles bleibt unveraendert.
-- =============================================================

BEGIN;

ALTER TABLE training.equipment
  ADD COLUMN IF NOT EXISTS name_de TEXT,
  ADD COLUMN IF NOT EXISTS equipment_group TEXT,
  ADD COLUMN IF NOT EXISTS equipment_group_de TEXT,
  ADD COLUMN IF NOT EXISTS equipment_group_en TEXT;

ALTER TABLE training.exercises
  ADD COLUMN IF NOT EXISTS discipline TEXT,
  ADD COLUMN IF NOT EXISTS discipline_rule TEXT;

DO $$
BEGIN
  ALTER TABLE training.equipment
    ADD CONSTRAINT equipment_group_known
    CHECK (
      equipment_group IS NULL OR equipment_group IN (
        'free_weights',
        'cables_bands',
        'machines_benches',
        'other'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE training.exercises
    ADD CONSTRAINT exercises_discipline_known
    CHECK (
      discipline IS NULL OR discipline IN (
        'Strength',
        'Cardio',
        'Stretching',
        'Yoga',
        'Bodyweight'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_equipment_group
  ON training.equipment(equipment_group);

CREATE INDEX IF NOT EXISTS idx_exercises_discipline
  ON training.exercises(discipline);

WITH mapping(name, name_de, equipment_group, equipment_group_de, equipment_group_en) AS (
  VALUES
    ('Ab Wheel', 'Bauchroller', 'other', 'Sonstiges', 'Other'),
    ('Assisted Pull Up Machine', 'Klimmzugmaschine mit Unterstützung', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Balance Board', 'Balance-Board', 'other', 'Sonstiges', 'Other'),
    ('Balloon', 'Ballon', 'other', 'Sonstiges', 'Other'),
    ('Bands', 'Widerstandsband', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Bar', 'Stange', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Barbell', 'Langhantel', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Bench', 'Hantelbank', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Bench, Pull Up Bar', 'Hantelbank und Klimmzugstange', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Cable', 'Kabelzug', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Cable Pulley Machine', 'Kabelzugmaschine', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Cable Pulley Machine, Rope Attachment', 'Kabelzug mit Seilgriff', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Cable Row Machine', 'Kabel-Rudergerät', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Chair', 'Stuhl', 'other', 'Sonstiges', 'Other'),
    ('Chest Press Machine', 'Brustpresse', 'machines_benches', 'Geraete & Baenke', 'Machines & Benches'),
    ('Couch', 'Couch', 'other', 'Sonstiges', 'Other'),
    ('Crossover machine', 'Kabel-Crossover', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Dip Pull Up Station', 'Dip- und Klimmzugstation', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Dip stand', 'Dip-Ständer', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Dip Station', 'Dip-Station', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Dual Cable Pulley Machine', 'Doppel-Kabelzugmaschine', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Dual Pec Deck Machine', 'Pec-Deck-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Dual Pec Fly Machine', 'Pec-Fly-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Dumbbell', 'Kurzhantel', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('EZ Bar', 'EZ-Stange', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Fixed Pole Bar', 'feste Stange', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hack Squat Machine', 'Hackenschmidt-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hammer Strength Iso-Lateral Leg Curl Machine', 'Hammer-Strength-Beinbeuger', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hammer Strength MTS Iso-Lateral Biceps Curl Machine', 'Hammer-Strength-Bizepscurl-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hammer Strength MTS Iso-Lateral Decline Press Machine', 'Hammer-Strength-Negativpresse', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hammer Strength Plate Loaded High Row Machine', 'Hammer-Strength-High-Row-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hammer Strength Plate-Loaded Iso-Lateral Chest Press machine', 'Hammer-Strength-Brustpresse', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Hyperextension Bench', 'Hyperextensionsbank', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Iso-Lateral Shoulder Press Machine', 'Schulterpresse', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Jump rope', 'Springseil', 'other', 'Sonstiges', 'Other'),
    ('Kettlebells', 'Kettlebell', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Kneeling leg curl machine', 'kniende Beinbeuger-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Lat Pull Down Machine (Cable)', 'Latzugmaschine', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Leg Press Machine', 'Beinpresse', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Loop Resistance Band', 'Loop-Band', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('MTS Iso-Lateral Kneeling Leg Curl Machine', 'MTS-Beinbeuger kniend', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('None', 'Körpergewicht', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Pec Fly/Rear Delt Machine', 'Pec-Fly-/Reverse-Fly-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Pull Up Bar', 'Klimmzugstange', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Pull Up Bar, Resistance Band', 'Klimmzugstange mit Widerstandsband', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Resistance Cable', 'Widerstandskabel', 'cables_bands', 'Kabel & Bänder', 'Cables & Bands'),
    ('Rowing Machine', 'Ruderergometer', 'other', 'Sonstiges', 'Other'),
    ('Seated Dip Machine', 'Dip-Maschine sitzend', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Seated hip abductor machine', 'Abduktorenmaschine sitzend', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Seated leg curl machine', 'Beinbeuger-Maschine sitzend', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Smith Machine', 'Multipresse', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Stability Ball', 'Gymnastikball', 'other', 'Sonstiges', 'Other'),
    ('Stationary Exercise Bike', 'Ergometer', 'other', 'Sonstiges', 'Other'),
    ('Trap Bar', 'Trap-Bar', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Triceps Dips Machine', 'Trizeps-Dip-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Triceps Extension Machine', 'Trizepsstrecker-Maschine', 'machines_benches', 'Geräte & Bänke', 'Machines & Benches'),
    ('Weight Plate', 'Gewichtsscheibe', 'free_weights', 'Freie Gewichte', 'Free Weights'),
    ('Yoga Mat', 'Yogamatte', 'other', 'Sonstiges', 'Other')
)
UPDATE training.equipment q
SET
  name_de = mapping.name_de,
  equipment_group = mapping.equipment_group,
  equipment_group_de = mapping.equipment_group_de,
  equipment_group_en = mapping.equipment_group_en
FROM mapping
WHERE q.name = mapping.name;

WITH classified AS (
  SELECT
    e.id,
    CASE
      WHEN q.name IN ('Jump rope', 'Rowing Machine', 'Stationary Exercise Bike')
        OR e.name ~* '(jumping jack|rope jump|skipping|rower|stationary bike|exercise bike)'
        THEN 'Cardio'
      WHEN e.name ~* '(stretch|mobility|foam roller|flexibility)'
        THEN 'Stretching'
      WHEN e.name ~* '(yoga|pose|chatarunga|chaturanga|dog pose|cobra|warrior|tree pose|child pose|plow|lotus|namaskar|setu bandhasana)'
        THEN 'Yoga'
      WHEN e.category = 'Bodyweight' OR q.name = 'None'
        THEN 'Bodyweight'
      WHEN e.category IN ('Free Weights', 'Resistance')
        THEN 'Strength'
      ELSE NULL
    END AS discipline,
    CASE
      WHEN q.name IN ('Jump rope', 'Rowing Machine', 'Stationary Exercise Bike')
        OR e.name ~* '(jumping jack|rope jump|skipping|rower|stationary bike|exercise bike)'
        THEN '01_cardio_equipment_or_name'
      WHEN e.name ~* '(stretch|mobility|foam roller|flexibility)'
        THEN '02_stretching_name'
      WHEN e.name ~* '(yoga|pose|chatarunga|chaturanga|dog pose|cobra|warrior|tree pose|child pose|plow|lotus|namaskar|setu bandhasana)'
        THEN '03_yoga_name'
      WHEN e.category = 'Bodyweight' OR q.name = 'None'
        THEN '04_bodyweight_category_or_none'
      WHEN e.category IN ('Free Weights', 'Resistance')
        THEN '05_strength_category'
      ELSE '99_unassigned'
    END AS discipline_rule
  FROM training.exercises e
  LEFT JOIN training.equipment q ON q.id = e.equipment_id
)
UPDATE training.exercises e
SET
  discipline = classified.discipline,
  discipline_rule = classified.discipline_rule
FROM classified
WHERE e.id = classified.id;

COMMENT ON COLUMN training.equipment.name_de IS
  'C-90: deutscher Anzeigename fuer Geraetefilter; Quellname bleibt training.equipment.name.';
COMMENT ON COLUMN training.equipment.equipment_group IS
  'C-90: kuratierte Geraetegruppe fuer die Uebungssuche, abgeleitet aus der Vorgaenger-ExerciseSearch und aktuellem Bestand.';
COMMENT ON COLUMN training.exercises.discipline IS
  'C-90: Disziplinfilter fuer die Uebungssuche: Strength, Cardio, Stretching, Yoga oder Bodyweight.';
COMMENT ON COLUMN training.exercises.discipline_rule IS
  'C-90: Regel, die discipline gesetzt hat; dient der Nachvollziehbarkeit der Kuration.';

DO $$
DECLARE
  v_equipment int;
  v_equipment_grouped int;
  v_equipment_de int;
  v_exercises int;
  v_discipline int;
  v_links int;
  v_orphan_equipment int;
  v_orphan_muscles int;
  v_other_devices int;
  v_other_exercises int;
BEGIN
  SELECT COUNT(*) INTO v_equipment FROM training.equipment;
  SELECT COUNT(*) INTO v_equipment_grouped FROM training.equipment WHERE equipment_group IS NOT NULL;
  SELECT COUNT(*) INTO v_equipment_de FROM training.equipment WHERE name_de IS NOT NULL;
  SELECT COUNT(*) INTO v_exercises FROM training.exercises;
  SELECT COUNT(*) INTO v_discipline FROM training.exercises WHERE discipline IS NOT NULL;
  SELECT COUNT(*) INTO v_links FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_orphan_equipment
  FROM training.exercises e
  LEFT JOIN training.equipment q ON q.id = e.equipment_id
  WHERE e.equipment_id IS NOT NULL AND q.id IS NULL;
  SELECT COUNT(*) INTO v_orphan_muscles
  FROM training.exercise_muscles em
  LEFT JOIN training.exercises e ON e.id = em.exercise_id
  LEFT JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE e.id IS NULL OR mg.id IS NULL;
  SELECT COUNT(*) INTO v_other_devices FROM training.equipment WHERE equipment_group = 'other';
  SELECT COUNT(DISTINCT e.id) INTO v_other_exercises
  FROM training.exercises e
  JOIN training.equipment q ON q.id = e.equipment_id
  WHERE q.equipment_group = 'other';

  IF v_equipment <> 58 THEN
    RAISE EXCEPTION 'training.equipment: % statt 58', v_equipment;
  END IF;
  IF v_equipment_grouped <> 58 THEN
    RAISE EXCEPTION 'Geraetegruppen fehlen: % von 58 gesetzt', v_equipment_grouped;
  END IF;
  IF v_equipment_de <> 58 THEN
    RAISE EXCEPTION 'deutsche Geraetenamen fehlen: % von 58 gesetzt', v_equipment_de;
  END IF;
  IF v_exercises <> 1416 THEN
    RAISE EXCEPTION 'training.exercises: % statt 1416', v_exercises;
  END IF;
  IF v_discipline <> 1416 THEN
    RAISE EXCEPTION 'Disziplinen fehlen: % von 1416 gesetzt', v_discipline;
  END IF;
  IF v_links <> 6588 THEN
    RAISE EXCEPTION 'training.exercise_muscles: % statt 6588', v_links;
  END IF;
  IF v_orphan_equipment <> 0 THEN
    RAISE EXCEPTION 'Waisen bei exercise.equipment_id: %', v_orphan_equipment;
  END IF;
  IF v_orphan_muscles <> 0 THEN
    RAISE EXCEPTION 'Waisen in exercise_muscles: %', v_orphan_muscles;
  END IF;
  IF v_other_devices > 19 THEN
    RAISE EXCEPTION 'Sonstiges enthaelt % von 58 Geraeten; Gliederung traegt nicht', v_other_devices;
  END IF;
  IF v_other_exercises > 472 THEN
    RAISE EXCEPTION 'Sonstiges enthaelt % von 1416 Uebungen; Gliederung traegt nicht', v_other_exercises;
  END IF;

  RAISE NOTICE 'OK: 58 Geraete gruppiert, 58 deutsche Namen, 1416 Disziplinen, 6588 Muskelzuordnungen, Sonstiges % Geraete/% Uebungen',
    v_other_devices, v_other_exercises;
END $$;

COMMIT;
