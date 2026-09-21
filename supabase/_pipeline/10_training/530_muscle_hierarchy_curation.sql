-- C-530 -- Katalogdaten, bewusst in der Pipeline (D-17), nicht in der Migration.
-- Keine Muskelgruppe wird geloescht: vier bisherige Namen bleiben Aliaszeilen
-- mit stabiler ID. Nur kollidierende exercise_muscles-Zuordnungen entfallen.

BEGIN;

DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'training' AND table_name = 'muscle_groups'
      AND column_name = 'canonical_muscle_group_id'
  ) THEN
    RAISE EXCEPTION 'C-530 braucht training.muscle_groups.canonical_muscle_group_id';
  END IF;
END;
$block$;

-- Fachname in `name`, alltagssprachliche Anzeige in `name_display_en`.
-- Die IDs der vorhandenen Gruppen bleiben dabei unveraendert.
UPDATE training.muscle_groups
   SET name = CASE name
     WHEN 'Clavicular Head' THEN 'Clavicular Head of Pectoralis Major'
     WHEN 'Sternal Head' THEN 'Sternocostal Head of Pectoralis Major'
     WHEN 'Front Shoulders' THEN 'Anterior Deltoid'
     WHEN 'Rear Deltoids' THEN 'Posterior Deltoid'
   END,
       name_display_en = CASE name
     WHEN 'Clavicular Head' THEN 'Upper chest'
     WHEN 'Sternal Head' THEN 'Middle chest'
     WHEN 'Front Shoulders' THEN 'Front shoulders'
     WHEN 'Rear Deltoids' THEN 'Rear deltoids'
   END
 WHERE name IN ('Clavicular Head', 'Sternal Head', 'Front Shoulders', 'Rear Deltoids');

-- Neue, anatomisch belegte Detailknoten. Keine Zuordnung zu Uebungen wird
-- daraus abgeleitet; ohne bewegungsspezifische Evidenz blieben sie leer.
INSERT INTO training.muscle_groups AS target (name, name_display_en, body_region)
VALUES
  ('Vastus Intermedius', 'Vastus intermedius', 'legs'),
  ('Supraspinatus', 'Supraspinatus', 'shoulders'),
  ('Fibularis Longus', 'Fibularis longus', 'legs'),
  ('Gracilis', 'Gracilis', 'legs'),
  ('Pectoralis Minor', 'Pectoralis minor', 'chest'),
  ('Abdominal Part of Pectoralis Major', 'Lower chest', 'chest'),
  ('Lateral Deltoid', 'Side deltoid', 'shoulders')
ON CONFLICT (name) DO UPDATE
  SET name_display_en = EXCLUDED.name_display_en,
      body_region = EXCLUDED.body_region
  WHERE target.name_display_en IS DISTINCT FROM EXCLUDED.name_display_en
     OR target.body_region IS DISTINCT FROM EXCLUDED.body_region;

CREATE TEMP TABLE c530_aliases (
  alias_name text PRIMARY KEY,
  canonical_name text NOT NULL
) ON COMMIT DROP;

INSERT INTO c530_aliases (alias_name, canonical_name) VALUES
  ('Upper Chest', 'Clavicular Head of Pectoralis Major'),
  ('Abductors', 'Hip Abductors'),
  ('Hip Adductors', 'Adductors'),
  ('Peroneals', 'Fibularis Muscles');

-- Die alte Zeile bleibt, ihr Zweck ist nun explizit Alias. So bleiben
-- externe IDs, historische resolution_notes und Recovery-Profile lesbar.
UPDATE training.muscle_groups alias_group
   SET canonical_muscle_group_id = canonical.id
  FROM c530_aliases aliases
  JOIN training.muscle_groups canonical ON canonical.name = aliases.canonical_name
 WHERE alias_group.name = aliases.alias_name
   AND alias_group.id <> canonical.id
   AND alias_group.canonical_muscle_group_id IS DISTINCT FROM canonical.id;

-- Die detaillierte Baumstruktur. `Tibialis` ist die vorhandene,
-- bewusst beibehaltene Sammelzeile; beide spezifizierten Muskeln werden
-- darunter gefuehrt, statt als drei gleichrangige Blattknoten.
CREATE TEMP TABLE c530_parents (
  child_name text PRIMARY KEY,
  parent_name text NOT NULL
) ON COMMIT DROP;

INSERT INTO c530_parents (child_name, parent_name) VALUES
  ('Clavicular Head of Pectoralis Major', 'Pectoralis Major'),
  ('Sternocostal Head of Pectoralis Major', 'Pectoralis Major'),
  ('Abdominal Part of Pectoralis Major', 'Pectoralis Major'),
  ('Pectoralis Minor', 'Chest'),
  ('Anterior Deltoid', 'Deltoids'),
  ('Lateral Deltoid', 'Deltoids'),
  ('Posterior Deltoid', 'Deltoids'),
  ('Supraspinatus', 'Rotator Cuff'),
  ('Vastus Intermedius', 'Quadriceps'),
  ('Fibularis Longus', 'Fibularis Muscles'),
  ('Peroneus Brevis', 'Fibularis Muscles'),
  ('Gracilis', 'Adductors'),
  ('Anterior Tibialis', 'Tibialis'),
  ('Tibialis Posterior', 'Tibialis');

UPDATE training.muscle_groups child
   SET parent_id = parent.id
  FROM c530_parents links
  JOIN training.muscle_groups parent ON parent.name = links.parent_name
 WHERE child.name = links.child_name
   AND child.id <> parent.id
   AND child.parent_id IS DISTINCT FROM parent.id;

-- Aliaszuordnungen werden in den kanonischen Knoten verschoben. Bei einer
-- gleichen Uebung/Rolle ist die Aussage bereits vorhanden; A-Evidenz hat
-- Vorrang vor C-Evidenz, sonst bleibt die bestehende Zeile unveraendert.
INSERT INTO training.exercise_muscles
  (exercise_id, muscle_group_id, role, faktor, source_id, evidence_class)
SELECT em.exercise_id, canonical.id, em.role, em.faktor, em.source_id, em.evidence_class
FROM training.exercise_muscles em
JOIN training.muscle_groups alias_group ON alias_group.id = em.muscle_group_id
JOIN training.muscle_groups canonical ON canonical.id = alias_group.canonical_muscle_group_id
WHERE alias_group.canonical_muscle_group_id IS NOT NULL
ON CONFLICT (exercise_id, muscle_group_id, role) DO UPDATE
SET faktor = CASE
      WHEN EXCLUDED.evidence_class = 'A' AND training.exercise_muscles.evidence_class <> 'A'
      THEN EXCLUDED.faktor ELSE training.exercise_muscles.faktor END,
    source_id = CASE
      WHEN EXCLUDED.evidence_class = 'A' AND training.exercise_muscles.evidence_class <> 'A'
      THEN EXCLUDED.source_id ELSE training.exercise_muscles.source_id END,
    evidence_class = CASE
      WHEN EXCLUDED.evidence_class = 'A' AND training.exercise_muscles.evidence_class <> 'A'
      THEN EXCLUDED.evidence_class ELSE training.exercise_muscles.evidence_class END;

DELETE FROM training.exercise_muscles em
USING training.muscle_groups alias_group
WHERE alias_group.id = em.muscle_group_id
  AND alias_group.canonical_muscle_group_id IS NOT NULL;

-- Gegenprobe aus C-528: dieselbe, nur pauschal (C) belegte Nebenrolle lag
-- einmal an der Obergruppe Fibularis und einmal am konkreten Brevis. Ohne
-- bewegungsspezifische Quelle bleibt die Sammelgruppe die Zaehlebene;
-- die Brevis-Dublette wird entfernt, nicht als zweiter Reiz gefuehrt.
DELETE FROM training.exercise_muscles em
USING training.exercises exercise_row,
      training.muscle_groups brevis,
      training.muscle_groups fibularis,
      training.exercise_muscles retained
WHERE exercise_row.id = em.exercise_id
  AND exercise_row.name = 'Bodyweight standing calf raise'
  AND brevis.name = 'Peroneus Brevis'
  AND em.muscle_group_id = brevis.id
  AND em.role = 'secondary'
  AND fibularis.name = 'Fibularis Muscles'
  AND retained.exercise_id = em.exercise_id
  AND retained.muscle_group_id = fibularis.id
  AND retained.role = em.role;

-- Diese zwei Sammelgruppen haben nach der Korrektur direkte Zuordnungen und
-- Kinder. Die Satzebene bleibt explizit die Gruppe, bis Einzel-Evidenz da ist.
INSERT INTO training.muscle_group_level_decisions AS target
  (muscle_group_id, decision, source_id, reason)
SELECT mg.id, 'keep_group', 'c530_muscle_hierarchy_curation',
       'C-530: Direkte Zuordnungen bleiben ohne bewegungsspezifische Einzelquelle auf der Sammelgruppe; Detailkinder dienen Hierarchie und Auflistung.'
FROM training.muscle_groups mg
WHERE mg.name IN ('Fibularis Muscles', 'Tibialis')
ON CONFLICT (muscle_group_id) DO UPDATE
SET decision = EXCLUDED.decision,
    source_id = EXCLUDED.source_id,
    reason = EXCLUDED.reason,
    updated_at = now()
WHERE target.decision IS DISTINCT FROM EXCLUDED.decision
   OR target.source_id IS DISTINCT FROM EXCLUDED.source_id
   OR target.reason IS DISTINCT FROM EXCLUDED.reason;

-- C-492 hat keine muskelindividuellen Studienwerte. Neue Detailknoten
-- erben deshalb sichtbar die bestehende Elternklasse, nicht einen geratenen Wert.
CREATE TEMP TABLE c530_recovery_inheritance (
  child_name text PRIMARY KEY,
  parent_name text NOT NULL
) ON COMMIT DROP;

INSERT INTO c530_recovery_inheritance (child_name, parent_name) VALUES
  ('Vastus Intermedius', 'Quadriceps'),
  ('Supraspinatus', 'Rotator Cuff'),
  ('Fibularis Longus', 'Fibularis Muscles'),
  ('Gracilis', 'Adductors'),
  ('Pectoralis Minor', 'Chest'),
  ('Abdominal Part of Pectoralis Major', 'Pectoralis Major'),
  ('Lateral Deltoid', 'Deltoids');

INSERT INTO recovery.muscle_recovery_profiles AS target
  (muscle_group_id, base_recovery_hours, source_id, evidence_class, note)
SELECT child.id, parent_profile.base_recovery_hours,
       'c530_parent_recovery_inheritance', parent_profile.evidence_class,
       'C-530: Erbt ' || parent.name || ' (' || parent_profile.base_recovery_hours || ' h), bis eine muskelindividuelle Quelle vorliegt.'
FROM c530_recovery_inheritance inheritance
JOIN training.muscle_groups child ON child.name = inheritance.child_name
JOIN training.muscle_groups parent ON parent.name = inheritance.parent_name
JOIN recovery.muscle_recovery_profiles parent_profile ON parent_profile.muscle_group_id = parent.id
ON CONFLICT (muscle_group_id) DO UPDATE
SET base_recovery_hours = EXCLUDED.base_recovery_hours,
    source_id = EXCLUDED.source_id,
    evidence_class = EXCLUDED.evidence_class,
    note = EXCLUDED.note,
    updated_at = now()
WHERE target.base_recovery_hours IS DISTINCT FROM EXCLUDED.base_recovery_hours
   OR target.source_id IS DISTINCT FROM EXCLUDED.source_id
   OR target.evidence_class IS DISTINCT FROM EXCLUDED.evidence_class
   OR target.note IS DISTINCT FROM EXCLUDED.note;

DO $block$
DECLARE
  v_groups integer;
  v_links integer;
  v_aliases integer;
  v_alias_links integer;
  v_orphans integer;
  v_calf_fibularis integer;
  v_calf_brevis integer;
  v_expected_parents integer;
  v_profiles integer;
  v_surface_orphans integer;
BEGIN
  SELECT count(*) INTO v_groups FROM training.muscle_groups;
  SELECT count(*) INTO v_links FROM training.exercise_muscles;
  SELECT count(*) INTO v_aliases FROM training.muscle_groups
  WHERE canonical_muscle_group_id IS NOT NULL;
  SELECT count(*) INTO v_alias_links FROM training.exercise_muscles em
  JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE mg.canonical_muscle_group_id IS NOT NULL;
  SELECT count(*) INTO v_orphans FROM training.exercise_muscles em
  LEFT JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE mg.id IS NULL;
  SELECT count(*) INTO v_calf_fibularis
  FROM training.exercise_muscles em
  JOIN training.exercises e ON e.id = em.exercise_id
  JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE e.name = 'Bodyweight standing calf raise'
    AND mg.name = 'Fibularis Muscles' AND em.role = 'secondary';
  SELECT count(*) INTO v_calf_brevis
  FROM training.exercise_muscles em
  JOIN training.exercises e ON e.id = em.exercise_id
  JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE e.name = 'Bodyweight standing calf raise'
    AND mg.name = 'Peroneus Brevis' AND em.role = 'secondary';
  SELECT count(*) INTO v_expected_parents
  FROM c530_parents expected
  JOIN training.muscle_groups child ON child.name = expected.child_name
  JOIN training.muscle_groups parent ON parent.id = child.parent_id AND parent.name = expected.parent_name;
  SELECT count(*) INTO v_profiles
  FROM c530_recovery_inheritance inheritance
  JOIN training.muscle_groups child ON child.name = inheritance.child_name
  JOIN recovery.muscle_recovery_profiles profile ON profile.muscle_group_id = child.id;
  SELECT count(*) INTO v_surface_orphans
  FROM public.koerperflaechen surface
  LEFT JOIN training.muscle_groups mg ON mg.id = surface.muscle_group_id
  WHERE surface.muscle_group_id IS NOT NULL AND mg.id IS NULL;

  IF v_groups <> 112 OR v_links <> 6726 OR v_aliases <> 4 OR v_alias_links <> 0
     OR v_orphans <> 0 OR v_calf_fibularis <> 1 OR v_calf_brevis <> 0
     OR v_expected_parents <> 14 OR v_profiles <> 7 OR v_surface_orphans <> 0 THEN
    RAISE EXCEPTION 'C-530: groups %, links %, aliases %/% , orphans %, calf %/%, parents %, profiles %, surfaces %',
      v_groups, v_links, v_aliases, v_alias_links, v_orphans,
      v_calf_fibularis, v_calf_brevis, v_expected_parents, v_profiles, v_surface_orphans;
  END IF;
END;
$block$;

COMMIT;
