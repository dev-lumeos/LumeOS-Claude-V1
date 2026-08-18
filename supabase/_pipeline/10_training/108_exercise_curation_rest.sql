-- =============================================================
-- 108 - Rest-Kuration Training-Uebungen (E-14 bis E-19)
-- Datum: 2026-08-18
-- Laeuft NACH 107, VOR 106. Idempotent.
-- =============================================================
--
-- E-17: `Achilles Tendon` ist eine Sehne, keine Muskelgruppe.
--        Die einzige Zuordnung liegt auf `Standing gastrocnemius stretch`;
--        dort ist `Calves` bereits primary. Die Sehnen-Zeile wird deshalb
--        entfernt, nicht auf einen zweiten Calves-Eintrag abgebildet.
--
-- E-18: `none`/`None` bleibt eine Pruefung; im aktuellen Bestand gibt es
--        nach 107 keine solche Muskelgruppe.
--
-- E-19: Wenn dieselbe Uebung denselben Muskel als primary UND secondary
--        fuehrt, wird die secondary-Zeile entfernt. Das senkt die
--        Zuordnungszahl bewusst um 35.
--
-- E-14: Medienpfade werden hier nicht geaendert; die betroffenen
--        image_male_*-Verweise auf _Female-Dateien sind ein offener
--        Medien-/Produktfall, keine Datenbank-Kuration.
-- =============================================================

BEGIN;

DELETE FROM training.exercise_muscles em
USING training.muscle_groups mg
WHERE em.muscle_group_id = mg.id
  AND mg.name = 'Achilles Tendon';

UPDATE training.muscle_groups child
   SET parent_id = NULL
  FROM training.muscle_groups achilles
 WHERE child.parent_id = achilles.id
   AND achilles.name = 'Achilles Tendon';

DELETE FROM training.muscle_groups
WHERE name = 'Achilles Tendon';

DELETE FROM training.exercise_muscles secondary_em
USING training.exercise_muscles primary_em
WHERE secondary_em.exercise_id = primary_em.exercise_id
  AND secondary_em.muscle_group_id = primary_em.muscle_group_id
  AND secondary_em.role = 'secondary'
  AND primary_em.role = 'primary';

DO $$
DECLARE
  v_exercises int;
  v_groups int;
  v_links int;
  v_orphan_groups int;
  v_orphan_exercises int;
  v_achilles int;
  v_none int;
  v_bad_regions int;
  v_dual_roles int;
BEGIN
  SELECT COUNT(*) INTO v_exercises FROM training.exercises;
  SELECT COUNT(*) INTO v_groups FROM training.muscle_groups;
  SELECT COUNT(*) INTO v_links FROM training.exercise_muscles;

  SELECT COUNT(*) INTO v_orphan_groups
  FROM training.exercise_muscles em
  LEFT JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
  WHERE mg.id IS NULL;

  SELECT COUNT(*) INTO v_orphan_exercises
  FROM training.exercise_muscles em
  LEFT JOIN training.exercises e ON e.id = em.exercise_id
  WHERE e.id IS NULL;

  SELECT COUNT(*) INTO v_achilles
  FROM training.muscle_groups
  WHERE name = 'Achilles Tendon';

  SELECT COUNT(*) INTO v_none
  FROM training.muscle_groups
  WHERE lower(name) = 'none';

  SELECT COUNT(*) INTO v_bad_regions
  FROM training.muscle_groups
  WHERE (name = 'Biceps Femoris' AND body_region <> 'legs')
     OR (name = 'Rectus Femoris' AND body_region <> 'legs')
     OR (name = 'Tensor Fasciae Latae' AND body_region <> 'legs')
     OR (name = 'Hip Rotators' AND body_region <> 'legs')
     OR (name = 'Rear Deltoids' AND body_region <> 'shoulders');

  SELECT COUNT(*) INTO v_dual_roles
  FROM (
    SELECT exercise_id, muscle_group_id
    FROM training.exercise_muscles
    WHERE role IN ('primary', 'secondary')
    GROUP BY exercise_id, muscle_group_id
    HAVING COUNT(DISTINCT role) = 2
  ) d;

  IF v_exercises <> 1416 THEN
    RAISE EXCEPTION 'exercises: % statt 1416', v_exercises;
  END IF;
  IF v_groups <> 95 THEN
    RAISE EXCEPTION 'Muskelgruppen: % statt 95', v_groups;
  END IF;
  IF v_links <> 6588 THEN
    RAISE EXCEPTION 'exercise_muscles: % statt 6588', v_links;
  END IF;
  IF v_orphan_groups <> 0 THEN
    RAISE EXCEPTION 'Waisen-Muskelgruppen in exercise_muscles: %', v_orphan_groups;
  END IF;
  IF v_orphan_exercises <> 0 THEN
    RAISE EXCEPTION 'Waisen-Uebungen in exercise_muscles: %', v_orphan_exercises;
  END IF;
  IF v_achilles <> 0 THEN
    RAISE EXCEPTION 'Achilles Tendon noch vorhanden: %', v_achilles;
  END IF;
  IF v_none <> 0 THEN
    RAISE EXCEPTION 'none/None-Muskelgruppen noch vorhanden: %', v_none;
  END IF;
  IF v_bad_regions <> 0 THEN
    RAISE EXCEPTION 'Regionskorrekturen unvollstaendig: %', v_bad_regions;
  END IF;
  IF v_dual_roles <> 0 THEN
    RAISE EXCEPTION 'Primary/Secondary-Doppelrollen noch vorhanden: %', v_dual_roles;
  END IF;

  RAISE NOTICE 'OK: 1416 Uebungen, 95 Gruppen, 6588 Zuordnungen, 0 Waisen, 0 Doppelrollen';
END $$;

COMMIT;
