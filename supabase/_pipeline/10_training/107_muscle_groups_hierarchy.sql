-- =============================================================
-- 107 - Muscle-group curation and hierarchy (C-73)
-- Datum: 2026-08-18
-- Laeuft NACH 105, VOR 106. Idempotent.
-- =============================================================
--
-- Quelle bleibt `name`: Die Namen stammen aus dem Legacy-Export
-- (101_training_seed.sql). Die Kuration liegt daneben als Anzeige- und
-- Hierarchieebene. Einzelmuskeln werden NICHT in Sammelgruppen
-- aufgeloest; sie bekommen einen parent.
--
-- Zusammengefuehrt werden nur echte Alias-/Dublettenzeilen:
--   Rotator Cuff Muscles -> Rotator Cuff
--   Back Muscles         -> Back
--   Core Muscles         -> Core
--   Upper Back Muscles   -> Upper Back
--   Middle Back          -> Mid Back
--   Traps                -> Trapezius
--   Lats                 -> latissimus dorsi
--   triceps brachii      -> Triceps
--   Side abdominals      -> Obliques
--   Rear Shoulders       -> Rear Deltoids
--   Forearm Muscles      -> Forearms
--
-- Gegenprobe vor dem Bau [cmd]: fuer diese elf Paare gab es 0
-- Kollisionen gleicher Uebung + gleicher Rolle. Die Summe der
-- `exercise_muscles` muss daher bei 6.624 bleiben.
-- =============================================================

BEGIN;

ALTER TABLE training.muscle_groups
  ADD COLUMN IF NOT EXISTS parent_id UUID,
  ADD COLUMN IF NOT EXISTS name_display_en TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'training.muscle_groups'::regclass
      AND conname = 'muscle_groups_parent_id_fkey'
  ) THEN
    ALTER TABLE training.muscle_groups
      ADD CONSTRAINT muscle_groups_parent_id_fkey
      FOREIGN KEY (parent_id)
      REFERENCES training.muscle_groups(id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'training.muscle_groups'::regclass
      AND conname = 'muscle_groups_parent_not_self'
  ) THEN
    ALTER TABLE training.muscle_groups
      ADD CONSTRAINT muscle_groups_parent_not_self
      CHECK (parent_id IS NULL OR parent_id <> id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_muscle_groups_parent
  ON training.muscle_groups(parent_id);

CREATE TEMP TABLE muscle_group_merge (
  old_name TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO muscle_group_merge (old_name, canonical_name) VALUES
  ('Rotator Cuff Muscles', 'Rotator Cuff'),
  ('Back Muscles', 'Back'),
  ('Core Muscles', 'Core'),
  ('Upper Back Muscles', 'Upper Back'),
  ('Middle Back', 'Mid Back'),
  ('Traps', 'Trapezius'),
  ('Lats', 'latissimus dorsi'),
  ('triceps brachii', 'Triceps'),
  ('Side abdominals', 'Obliques'),
  ('Rear Shoulders', 'Rear Deltoids'),
  ('Forearm Muscles', 'Forearms')
ON CONFLICT (old_name) DO UPDATE
SET canonical_name = EXCLUDED.canonical_name;

UPDATE training.muscle_groups child
   SET parent_id = canonical.id
  FROM muscle_group_merge mm
  JOIN training.muscle_groups old_group ON old_group.name = mm.old_name
  JOIN training.muscle_groups canonical ON canonical.name = mm.canonical_name
 WHERE child.parent_id = old_group.id;

UPDATE training.exercise_muscles em
   SET muscle_group_id = canonical.id
  FROM muscle_group_merge mm
  JOIN training.muscle_groups old_group ON old_group.name = mm.old_name
  JOIN training.muscle_groups canonical ON canonical.name = mm.canonical_name
 WHERE em.muscle_group_id = old_group.id
   AND old_group.id <> canonical.id
   AND NOT EXISTS (
     SELECT 1
     FROM training.exercise_muscles existing
     WHERE existing.exercise_id = em.exercise_id
       AND existing.muscle_group_id = canonical.id
       AND existing.role = em.role
   );

DELETE FROM training.exercise_muscles em
USING muscle_group_merge mm, training.muscle_groups old_group
WHERE old_group.name = mm.old_name
  AND em.muscle_group_id = old_group.id;

DELETE FROM training.muscle_groups old_group
USING muscle_group_merge mm
WHERE old_group.name = mm.old_name
  AND old_group.name <> mm.canonical_name;

-- Region-Korrekturen, die 104 bereits als offen benannt hatte.
UPDATE training.muscle_groups
   SET body_region = 'legs'
 WHERE name IN ('Biceps Femoris', 'Rectus Femoris', 'Tensor Fasciae Latae', 'Hip Rotators')
   AND body_region IS DISTINCT FROM 'legs';

UPDATE training.muscle_groups
   SET body_region = 'shoulders'
 WHERE name = 'Rear Deltoids'
   AND body_region IS DISTINCT FROM 'shoulders';

-- Anzeigeebene: Quellname bleibt erhalten, Anzeige bekommt nur
-- vorsichtige Korrektur von Schreibweise und gelaufiger Kurzform.
UPDATE training.muscle_groups AS g
   SET name_display_en = v.display_name
  FROM (VALUES
    ('Abdominals', 'Abdominals'),
    ('Abductors', 'Abductors'),
    ('Achilles Tendon', 'Achilles Tendon'),
    ('adductor brevis', 'Adductor brevis'),
    ('Adductor Longus', 'Adductor longus'),
    ('adductor magnus', 'Adductor magnus'),
    ('Adductors', 'Adductors'),
    ('Anterior Tibialis', 'Tibialis anterior'),
    ('Arms', 'Arms'),
    ('Back', 'Back'),
    ('Biceps', 'Biceps'),
    ('Biceps Femoris', 'Biceps femoris'),
    ('Brachialis', 'Brachialis'),
    ('Brachioradialis', 'Brachioradialis'),
    ('Buttocks', 'Buttocks'),
    ('Calves', 'Calves'),
    ('Chest', 'Chest'),
    ('Clavicular Head', 'Clavicular head'),
    ('Core', 'Core'),
    ('Deltoids', 'Deltoids'),
    ('erector spinae', 'Erector spinae'),
    ('Extensor Carpi Radialis', 'Extensor carpi radialis'),
    ('Extensor Carpi Radialis Brevis', 'Extensor carpi radialis brevis'),
    ('Extensor Carpi Radialis Longus', 'Extensor carpi radialis longus'),
    ('Extensor Carpi Ulnaris', 'Extensor carpi ulnaris'),
    ('Fibularis Muscles', 'Fibularis muscles'),
    ('Fingers Flexors', 'Finger flexors'),
    ('Flexor Carpi Radialis', 'Flexor carpi radialis'),
    ('Flexor Carpi Ulnaris', 'Flexor carpi ulnaris'),
    ('Flexor Digitorum Longus', 'Flexor digitorum longus'),
    ('Flexor Digitorum Profundus', 'Flexor digitorum profundus'),
    ('Foot Muscles', 'Foot muscles'),
    ('Forearm Extensors', 'Forearm extensors'),
    ('Forearm Flexors', 'Forearm flexors'),
    ('Forearms', 'Forearms'),
    ('Front Shoulders', 'Front deltoids'),
    ('Glutes', 'Glutes'),
    ('Gluteus Maximus', 'Gluteus maximus'),
    ('Gluteus Medius', 'Gluteus medius'),
    ('Gluteus Minimus', 'Gluteus minimus'),
    ('Grip Muscles', 'Grip muscles'),
    ('Hamstrings', 'Hamstrings'),
    ('Hip Abductors', 'Hip abductors'),
    ('Hip Adductors', 'Hip adductors'),
    ('Hip Flexors', 'Hip flexors'),
    ('Hip Rotators', 'Hip rotators'),
    ('Hips', 'Hips'),
    ('Iliopsoas', 'Iliopsoas'),
    ('Infraspinatus', 'Infraspinatus'),
    ('Inner Thigh', 'Inner thigh'),
    ('Internal Oblique', 'Internal oblique'),
    ('latissimus dorsi', 'Latissimus dorsi'),
    ('Legs', 'Legs'),
    ('levator scapulae', 'Levator scapulae'),
    ('Lower Abs', 'Lower abs'),
    ('Lower Back', 'Lower back'),
    ('Lower Legs', 'Lower legs'),
    ('Mid Back', 'Mid back'),
    ('Neck Muscles', 'Neck muscles'),
    ('Obliques', 'Obliques'),
    ('Outer Thigh', 'Outer thigh'),
    ('Palmaris Longus', 'Palmaris longus'),
    ('Pectoralis Major', 'Pectoralis major'),
    ('Peroneals', 'Peroneals'),
    ('Peroneus Brevis', 'Peroneus brevis'),
    ('piriformis', 'Piriformis'),
    ('Pronator Teres', 'Pronator teres'),
    ('Quadriceps', 'Quadriceps'),
    ('Rear Deltoids', 'Rear deltoids'),
    ('Rectus Abdominis', 'Rectus abdominis'),
    ('Rectus Femoris', 'Rectus femoris'),
    ('Rhomboids', 'Rhomboids'),
    ('Rotator Cuff', 'Rotator cuff'),
    ('Scalenes', 'Scalenes'),
    ('Semimembranosus', 'Semimembranosus'),
    ('Semitendinosus', 'Semitendinosus'),
    ('Shoulders', 'Shoulders'),
    ('Soleus', 'Soleus'),
    ('splenius capitis', 'Splenius capitis'),
    ('Sternal Head', 'Sternal head'),
    ('Sternocleidomastoid', 'Sternocleidomastoid'),
    ('Subscapularis', 'Subscapularis'),
    ('Tensor Fasciae Latae', 'Tensor fasciae latae'),
    ('Teres Major', 'Teres major'),
    ('Teres Minor', 'Teres minor'),
    ('Thighs', 'Thighs'),
    ('Tibialis', 'Tibialis'),
    ('Tibialis Posterior', 'Tibialis posterior'),
    ('Transverse Abdominis', 'Transverse abdominis'),
    ('Trapezius', 'Trapezius'),
    ('Triceps', 'Triceps'),
    ('Upper Back', 'Upper back'),
    ('Upper Chest', 'Upper chest'),
    ('Upper Legs', 'Upper legs'),
    ('Wrist Extensors', 'Wrist extensors'),
    ('Wrist Flexors', 'Wrist flexors')
  ) AS v(name, display_name)
 WHERE g.name = v.name;

UPDATE training.muscle_groups
   SET name_display_en = name
 WHERE name_display_en IS NULL;

CREATE TEMP TABLE muscle_group_parent (
  child_name TEXT PRIMARY KEY,
  parent_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO muscle_group_parent (child_name, parent_name) VALUES
  -- shoulders
  ('Deltoids', 'Shoulders'),
  ('Front Shoulders', 'Deltoids'),
  ('Rear Deltoids', 'Deltoids'),
  ('Rotator Cuff', 'Shoulders'),
  ('Infraspinatus', 'Rotator Cuff'),
  ('Subscapularis', 'Rotator Cuff'),
  ('Teres Minor', 'Rotator Cuff'),

  -- chest
  ('Pectoralis Major', 'Chest'),
  ('Clavicular Head', 'Pectoralis Major'),
  ('Sternal Head', 'Pectoralis Major'),
  ('Upper Chest', 'Chest'),

  -- back
  ('Upper Back', 'Back'),
  ('Mid Back', 'Back'),
  ('Lower Back', 'Back'),
  ('Trapezius', 'Upper Back'),
  ('Rhomboids', 'Upper Back'),
  ('Teres Major', 'Upper Back'),
  ('levator scapulae', 'Upper Back'),
  ('erector spinae', 'Lower Back'),
  ('latissimus dorsi', 'Back'),

  -- core
  ('Abdominals', 'Core'),
  ('Lower Abs', 'Abdominals'),
  ('Rectus Abdominis', 'Abdominals'),
  ('Transverse Abdominis', 'Core'),
  ('Obliques', 'Core'),
  ('Internal Oblique', 'Obliques'),

  -- arms
  ('Biceps', 'Arms'),
  ('Brachialis', 'Biceps'),
  ('Triceps', 'Arms'),
  ('Forearms', 'Arms'),
  ('Brachioradialis', 'Forearms'),
  ('Forearm Flexors', 'Forearms'),
  ('Forearm Extensors', 'Forearms'),
  ('Flexor Carpi Radialis', 'Forearm Flexors'),
  ('Flexor Carpi Ulnaris', 'Forearm Flexors'),
  ('Flexor Digitorum Profundus', 'Forearm Flexors'),
  ('Fingers Flexors', 'Forearm Flexors'),
  ('Grip Muscles', 'Forearm Flexors'),
  ('Palmaris Longus', 'Forearm Flexors'),
  ('Pronator Teres', 'Forearm Flexors'),
  ('Extensor Carpi Radialis', 'Forearm Extensors'),
  ('Extensor Carpi Radialis Brevis', 'Forearm Extensors'),
  ('Extensor Carpi Radialis Longus', 'Forearm Extensors'),
  ('Extensor Carpi Ulnaris', 'Forearm Extensors'),
  ('Wrist Extensors', 'Forearm Extensors'),
  ('Wrist Flexors', 'Forearm Flexors'),

  -- legs
  ('Quadriceps', 'Legs'),
  ('Rectus Femoris', 'Quadriceps'),
  ('Hamstrings', 'Legs'),
  ('Biceps Femoris', 'Hamstrings'),
  ('Semimembranosus', 'Hamstrings'),
  ('Semitendinosus', 'Hamstrings'),
  ('Calves', 'Lower Legs'),
  ('Soleus', 'Calves'),
  ('Lower Legs', 'Legs'),
  ('Anterior Tibialis', 'Lower Legs'),
  ('Tibialis', 'Lower Legs'),
  ('Tibialis Posterior', 'Lower Legs'),
  ('Peroneals', 'Lower Legs'),
  ('Peroneus Brevis', 'Lower Legs'),
  ('Fibularis Muscles', 'Lower Legs'),
  ('Flexor Digitorum Longus', 'Lower Legs'),
  ('Foot Muscles', 'Lower Legs'),
  ('Achilles Tendon', 'Lower Legs'),
  ('Glutes', 'Legs'),
  ('Gluteus Maximus', 'Glutes'),
  ('Gluteus Medius', 'Glutes'),
  ('Gluteus Minimus', 'Glutes'),
  ('Buttocks', 'Glutes'),
  ('Hip Flexors', 'Legs'),
  ('Iliopsoas', 'Hip Flexors'),
  ('Hips', 'Legs'),
  ('Hip Rotators', 'Hips'),
  ('piriformis', 'Hip Rotators'),
  ('Hip Abductors', 'Legs'),
  ('Tensor Fasciae Latae', 'Hip Abductors'),
  ('Outer Thigh', 'Hip Abductors'),
  ('Adductors', 'Legs'),
  ('Abductors', 'Legs'),
  ('adductor brevis', 'Adductors'),
  ('Adductor Longus', 'Adductors'),
  ('adductor magnus', 'Adductors'),
  ('Hip Adductors', 'Adductors'),
  ('Inner Thigh', 'Adductors'),
  ('Thighs', 'Legs'),
  ('Upper Legs', 'Legs'),

  -- neck: no body_region exists in the allowed list, but hierarchy still helps.
  ('Scalenes', 'Neck Muscles'),
  ('Sternocleidomastoid', 'Neck Muscles'),
  ('splenius capitis', 'Neck Muscles')
ON CONFLICT (child_name) DO UPDATE
SET parent_name = EXCLUDED.parent_name;

UPDATE training.muscle_groups child
   SET parent_id = parent.id
  FROM muscle_group_parent mp
  JOIN training.muscle_groups parent ON parent.name = mp.parent_name
 WHERE child.name = mp.child_name
   AND child.id <> parent.id;

DO $$
DECLARE
  v_groups int;
  v_links int;
  v_orphans int;
  v_deleted_names int;
  v_empty_display int;
  v_parent_rows int;
  v_rotator_children int;
  v_delt_children int;
  v_quad_children int;
  v_bad_regions int;
BEGIN
  SELECT COUNT(*) INTO v_groups FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_links FROM training.exercise_muscles;
  SELECT COUNT(*) INTO v_orphans
  FROM training.exercise_muscles em
  LEFT JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE mg.id IS NULL;
  SELECT COUNT(*) INTO v_deleted_names
  FROM training.muscle_groups
  WHERE name IN (
    'Rotator Cuff Muscles', 'Back Muscles', 'Core Muscles',
    'Upper Back Muscles', 'Middle Back', 'Traps', 'Lats',
    'triceps brachii', 'Side abdominals', 'Rear Shoulders',
    'Forearm Muscles'
  );
  SELECT COUNT(*) INTO v_empty_display
  FROM training.muscle_groups
  WHERE name_display_en IS NULL OR btrim(name_display_en) = '';
  SELECT COUNT(*) INTO v_parent_rows
  FROM training.muscle_groups
  WHERE parent_id IS NOT NULL;
  SELECT COUNT(*) INTO v_rotator_children
  FROM training.muscle_groups child
  JOIN training.muscle_groups parent ON parent.id = child.parent_id
  WHERE parent.name = 'Rotator Cuff'
    AND child.name IN ('Infraspinatus', 'Subscapularis', 'Teres Minor');
  SELECT COUNT(*) INTO v_delt_children
  FROM training.muscle_groups child
  JOIN training.muscle_groups parent ON parent.id = child.parent_id
  WHERE parent.name = 'Deltoids'
    AND child.name IN ('Front Shoulders', 'Rear Deltoids');
  SELECT COUNT(*) INTO v_quad_children
  FROM training.muscle_groups child
  JOIN training.muscle_groups parent ON parent.id = child.parent_id
  WHERE parent.name = 'Quadriceps'
    AND child.name = 'Rectus Femoris';
  SELECT COUNT(*) INTO v_bad_regions
  FROM training.muscle_groups
  WHERE (name = 'Biceps Femoris' AND body_region <> 'legs')
     OR (name = 'Rectus Femoris' AND body_region <> 'legs')
     OR (name = 'Tensor Fasciae Latae' AND body_region <> 'legs')
     OR (name = 'Hip Rotators' AND body_region <> 'legs')
     OR (name = 'Rear Deltoids' AND body_region <> 'shoulders');

  IF v_groups <> 96 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 96', v_groups;
  END IF;
  IF v_links <> 6624 THEN
    RAISE EXCEPTION 'exercise_muscles: % statt 6624', v_links;
  END IF;
  IF v_orphans <> 0 THEN
    RAISE EXCEPTION 'Waisen in exercise_muscles: %', v_orphans;
  END IF;
  IF v_deleted_names <> 0 THEN
    RAISE EXCEPTION 'Aufgeloeste Dubletten noch vorhanden: %', v_deleted_names;
  END IF;
  IF v_empty_display <> 0 THEN
    RAISE EXCEPTION 'Leere Anzeige-Namen: %', v_empty_display;
  END IF;
  IF v_parent_rows < 70 THEN
    RAISE EXCEPTION 'Zu wenige Hierarchiezeilen: %', v_parent_rows;
  END IF;
  IF v_rotator_children <> 3 THEN
    RAISE EXCEPTION 'Rotator-Cuff-Kinder: % statt 3', v_rotator_children;
  END IF;
  IF v_delt_children <> 2 THEN
    RAISE EXCEPTION 'Deltoid-Kinder: % statt 2', v_delt_children;
  END IF;
  IF v_quad_children <> 1 THEN
    RAISE EXCEPTION 'Quadrizeps-Kinder: % statt 1', v_quad_children;
  END IF;
  IF v_bad_regions <> 0 THEN
    RAISE EXCEPTION 'Regionskorrekturen unvollstaendig: %', v_bad_regions;
  END IF;

  RAISE NOTICE 'OK: 96 Gruppen, 6624 Zuordnungen, % Hierarchiezeilen, 0 Waisen', v_parent_rows;
END $$;

COMMIT;
