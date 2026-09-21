BEGIN;

ALTER TABLE training.muscle_groups
  ADD COLUMN IF NOT EXISTS canonical_muscle_group_id uuid;

DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'training.muscle_groups'::regclass
      AND conname = 'muscle_groups_canonical_muscle_group_id_fkey'
  ) THEN
    ALTER TABLE training.muscle_groups
      ADD CONSTRAINT muscle_groups_canonical_muscle_group_id_fkey
      FOREIGN KEY (canonical_muscle_group_id)
      REFERENCES training.muscle_groups(id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'training.muscle_groups'::regclass
      AND conname = 'muscle_groups_canonical_not_self'
  ) THEN
    ALTER TABLE training.muscle_groups
      ADD CONSTRAINT muscle_groups_canonical_not_self
      CHECK (canonical_muscle_group_id IS NULL OR canonical_muscle_group_id <> id);
  END IF;
END;
$block$;

CREATE INDEX IF NOT EXISTS idx_muscle_groups_canonical
  ON training.muscle_groups(canonical_muscle_group_id)
  WHERE canonical_muscle_group_id IS NOT NULL;

COMMENT ON COLUMN training.muscle_groups.canonical_muscle_group_id IS
  'C-530: Nicht-null markiert eine erhaltene historische/umgangssprachliche Aliaszeile. Neue exercise_muscles-Zuordnungen zeigen immer auf die kanonische Gruppe.';

COMMIT;
