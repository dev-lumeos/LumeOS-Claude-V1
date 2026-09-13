BEGIN;

WITH RECURSIVE ancestry AS (
  SELECT mg.id AS muscle_group_id, mg.id AS ancestor_id, mg.name AS ancestor_name, mg.parent_id
  FROM training.muscle_groups mg
  UNION ALL
  SELECT a.muscle_group_id, parent.id, parent.name, parent.parent_id
  FROM ancestry a
  JOIN training.muscle_groups parent ON parent.id = a.parent_id
), classified AS (
  SELECT mg.id,
    CASE
      WHEN EXISTS (SELECT 1 FROM ancestry a WHERE a.muscle_group_id = mg.id AND a.ancestor_name IN ('erector spinae', 'Lower Back')) THEN 60.0::numeric
      WHEN EXISTS (SELECT 1 FROM ancestry a WHERE a.muscle_group_id = mg.id AND a.ancestor_name IN ('Arms', 'Shoulders', 'Neck Muscles', 'Calves', 'Lower Legs')) THEN 36.0::numeric
      ELSE 48.0::numeric
    END AS hours
  FROM training.muscle_groups mg
)
INSERT INTO recovery.muscle_recovery_profiles
  (muscle_group_id, base_recovery_hours, source_id, evidence_class, note)
SELECT id, hours, 'blog_recovery_guidelines_c492', 'C',
       'Keine Studie belegt eine feste Stundenanzahl je Muskelgruppe; C-492 fuehrt die aus der Vorlage uebernommenen 36/48/60-h-Klassen sichtbar als nicht studiengestuetzten Rueckfall.'
FROM classified
ON CONFLICT (muscle_group_id) DO UPDATE
SET base_recovery_hours = EXCLUDED.base_recovery_hours,
    source_id = EXCLUDED.source_id,
    evidence_class = EXCLUDED.evidence_class,
    note = EXCLUDED.note,
    updated_at = now();

INSERT INTO recovery.recovery_effort_factors (id, factor, source_id, evidence_class, note)
VALUES
  ('rir0_rpe10_failure', 1.37, 'beardsley_37pct_failure_recovery', 'B',
   'Sekundaerquelle nennt 37 Prozent laengere Erholung bis zum Versagen; die primaere Literatur belegt langsamere Recovery, nicht diese allgemeine Stundenkonstante.'),
  ('rir1_2_reference', 1.00, 'beardsley_37pct_failure_recovery', 'B',
   'Referenz fuer RIR 1 bis 2; die Rechenfunktion nutzt fuer alle nicht-Failure-Saetze 1.00.')
ON CONFLICT (id) DO UPDATE
SET factor = EXCLUDED.factor,
    source_id = EXCLUDED.source_id,
    evidence_class = EXCLUDED.evidence_class,
    note = EXCLUDED.note,
    updated_at = now();

DO $$
DECLARE
  v_profiles integer;
  v_missing integer;
  v_class_c integer;
  v_failure numeric;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE source_id IS NULL OR evidence_class IS NULL)
  INTO v_profiles, v_missing FROM recovery.muscle_recovery_profiles;
  SELECT count(*) INTO v_class_c FROM recovery.muscle_recovery_profiles WHERE evidence_class = 'C';
  SELECT factor INTO v_failure FROM recovery.recovery_effort_factors WHERE id = 'rir0_rpe10_failure';
  IF v_profiles <> 105 OR v_missing <> 0 OR v_class_c <> 105 OR v_failure <> 1.37 THEN
    RAISE EXCEPTION 'C-492: profiles %, missing %, C %, failure %', v_profiles, v_missing, v_class_c, v_failure;
  END IF;
END $$;

COMMIT;
