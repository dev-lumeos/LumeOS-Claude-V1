BEGIN;

CREATE TABLE IF NOT EXISTS recovery.muscle_recovery_profiles (
  muscle_group_id uuid PRIMARY KEY REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  base_recovery_hours numeric(5,2) NOT NULL CHECK (base_recovery_hours > 0),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  note text NOT NULL CHECK (btrim(note) <> ''),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recovery.recovery_effort_factors (
  id text PRIMARY KEY,
  factor numeric(5,3) NOT NULL CHECK (factor > 0),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  evidence_class text NOT NULL CHECK (evidence_class IN ('A', 'B', 'C')),
  note text NOT NULL CHECK (btrim(note) <> ''),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recovery.muscle_recovery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.recovery_effort_factors ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON recovery.muscle_recovery_profiles, recovery.recovery_effort_factors FROM PUBLIC, anon;
GRANT SELECT ON recovery.muscle_recovery_profiles, recovery.recovery_effort_factors TO authenticated;
GRANT ALL ON recovery.muscle_recovery_profiles, recovery.recovery_effort_factors TO service_role;

DROP POLICY IF EXISTS muscle_recovery_profiles_select ON recovery.muscle_recovery_profiles;
CREATE POLICY muscle_recovery_profiles_select ON recovery.muscle_recovery_profiles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS recovery_effort_factors_select ON recovery.recovery_effort_factors;
CREATE POLICY recovery_effort_factors_select ON recovery.recovery_effort_factors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS muscle_recovery_profiles_service_role ON recovery.muscle_recovery_profiles;
CREATE POLICY muscle_recovery_profiles_service_role ON recovery.muscle_recovery_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS recovery_effort_factors_service_role ON recovery.recovery_effort_factors;
CREATE POLICY recovery_effort_factors_service_role ON recovery.recovery_effort_factors
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION recovery.muscle_recovery_target_hours(
  p_muscle_group_id uuid,
  p_rir smallint DEFAULT NULL,
  p_rpe numeric DEFAULT NULL
)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT round(profile.base_recovery_hours * CASE
    WHEN p_rir = 0 OR (p_rir IS NULL AND p_rpe = 10) THEN (
      SELECT factor FROM recovery.recovery_effort_factors WHERE id = 'rir0_rpe10_failure'
    )
    ELSE 1.0::numeric
  END, 2)
  FROM recovery.muscle_recovery_profiles profile
  WHERE profile.muscle_group_id = p_muscle_group_id;
$$;

CREATE OR REPLACE FUNCTION recovery.muscle_recovery_progress(
  p_muscle_group_id uuid,
  p_hours_since numeric,
  p_rir smallint DEFAULT NULL,
  p_rpe numeric DEFAULT NULL
)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT least(1.0::numeric, greatest(0::numeric, p_hours_since) /
    recovery.muscle_recovery_target_hours(p_muscle_group_id, p_rir, p_rpe));
$$;

REVOKE ALL ON FUNCTION recovery.muscle_recovery_target_hours(uuid, smallint, numeric), recovery.muscle_recovery_progress(uuid, numeric, smallint, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION recovery.muscle_recovery_target_hours(uuid, smallint, numeric), recovery.muscle_recovery_progress(uuid, numeric, smallint, numeric) TO authenticated, service_role;

COMMENT ON TABLE recovery.muscle_recovery_profiles IS
  'C-492: explizite Basiszeiten je Training-Muskelgruppe. C markiert die nicht studiengestuetzten Katalogwerte sichtbar.';
COMMENT ON FUNCTION recovery.muscle_recovery_target_hours(uuid, smallint, numeric) IS
  'C-492: eine Erholungskomponente. RIR 0 (oder ohne RIR RPE 10) erhoeht die Basiszeit um den belegten Failure-Faktor; keine Zwei-Komponenten-Kurve.';

COMMIT;
