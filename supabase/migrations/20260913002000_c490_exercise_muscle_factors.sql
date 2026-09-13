BEGIN;

ALTER TABLE training.exercise_muscles
  ADD COLUMN IF NOT EXISTS faktor numeric(4,2),
  ADD COLUMN IF NOT EXISTS source_id text,
  ADD COLUMN IF NOT EXISTS evidence_class text;

ALTER TABLE training.exercise_muscles
  DROP CONSTRAINT IF EXISTS exercise_muscles_faktor_positive,
  DROP CONSTRAINT IF EXISTS exercise_muscles_evidence_class_check;

ALTER TABLE training.exercise_muscles
  ADD CONSTRAINT exercise_muscles_faktor_positive
    CHECK (faktor IS NULL OR faktor > 0),
  ADD CONSTRAINT exercise_muscles_evidence_class_check
    CHECK (evidence_class IS NULL OR evidence_class IN ('A', 'C'));

COMMENT ON COLUMN training.exercise_muscles.faktor IS
  'C-490: Anteil eines Satzes fuer diese Muskelzuordnung. C-Rueckfall 1.0/0.5 nach Pelland 2026; A nur mit konkreter EMG-Quelle.';
COMMENT ON COLUMN training.exercise_muscles.source_id IS
  'C-490: stabile Quellenkennung fuer den Faktor.';
COMMENT ON COLUMN training.exercise_muscles.evidence_class IS
  'C-490: A = konkrete EMG-Messung, C = aus primary/secondary abgeleiteter Pelland-Rueckfall.';

COMMIT;
