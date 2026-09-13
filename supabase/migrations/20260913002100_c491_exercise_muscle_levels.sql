BEGIN;

CREATE TABLE IF NOT EXISTS training.exercise_muscle_resolution_notes (
  exercise_id uuid NOT NULL REFERENCES training.exercises(id) ON DELETE RESTRICT,
  original_muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN ('primary', 'secondary')),
  resolution text NOT NULL CHECK (resolution IN ('resolved', 'unresolved')),
  resolved_muscle_group_ids uuid[] NOT NULL DEFAULT '{}',
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  reason text NOT NULL CHECK (btrim(reason) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, original_muscle_group_id, role),
  CHECK (
    (resolution = 'resolved' AND cardinality(resolved_muscle_group_ids) > 0)
    OR (resolution = 'unresolved' AND cardinality(resolved_muscle_group_ids) = 0)
  )
);

CREATE TABLE IF NOT EXISTS training.muscle_group_level_decisions (
  muscle_group_id uuid PRIMARY KEY REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('keep_group', 'map_to_child')),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  reason text NOT NULL CHECK (btrim(reason) <> ''),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE training.exercise_muscle_resolution_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.muscle_group_level_decisions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON training.exercise_muscle_resolution_notes, training.muscle_group_level_decisions FROM PUBLIC, anon, authenticated;
GRANT ALL ON training.exercise_muscle_resolution_notes, training.muscle_group_level_decisions TO service_role;

-- Die Tabellen sind nur Import-Nachweis, nicht Teil eines Client-Lesepfads.
-- Eine explizite service_role-Policy haelt RLS pruefbar statt die Tabellen
-- stillschweigend trotz aktivem RLS unzugaenglich zu lassen.
DROP POLICY IF EXISTS exercise_muscle_resolution_notes_service_role ON training.exercise_muscle_resolution_notes;
CREATE POLICY exercise_muscle_resolution_notes_service_role
  ON training.exercise_muscle_resolution_notes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS muscle_group_level_decisions_service_role ON training.muscle_group_level_decisions;
CREATE POLICY muscle_group_level_decisions_service_role
  ON training.muscle_group_level_decisions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE training.exercise_muscle_resolution_notes IS
  'C-491: Nachweis je ehemaliger Wurzelzuordnung. Aufgeloest aus dem vorhandenen Katalog-Rohtext oder einzeln als unklar erhalten.';
COMMENT ON TABLE training.muscle_group_level_decisions IS
  'C-491/E-82: Entscheidung je Zwischenebene, ob Satzzaehlung diese Ebene sinnvoll trennt.';

COMMIT;
