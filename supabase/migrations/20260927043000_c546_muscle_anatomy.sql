BEGIN;

CREATE TABLE training.anatomy_sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  source_kind text NOT NULL,
  citation text NOT NULL,
  published_year integer,
  CONSTRAINT anatomy_sources_nonempty_check CHECK (
    btrim(id) <> ''
    AND btrim(name) <> ''
    AND btrim(url) <> ''
    AND btrim(citation) <> ''
  ),
  CONSTRAINT anatomy_sources_kind_check CHECK (
    source_kind IN ('terminology', 'anatomy_reference')
  )
);

CREATE TABLE training.muscle_origins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  attachment_site text NOT NULL CHECK (btrim(attachment_site) <> ''),
  source_id text NOT NULL REFERENCES training.anatomy_sources(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, muscle_group_id),
  UNIQUE (muscle_group_id, attachment_site, source_id)
);

CREATE TABLE training.muscle_insertions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  attachment_site text NOT NULL CHECK (btrim(attachment_site) <> ''),
  source_id text NOT NULL REFERENCES training.anatomy_sources(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, muscle_group_id),
  UNIQUE (muscle_group_id, attachment_site, source_id)
);

CREATE TABLE training.muscle_innervations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  nerve_name text NOT NULL CHECK (btrim(nerve_name) <> ''),
  nerve_roots text,
  source_id text NOT NULL REFERENCES training.anatomy_sources(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, muscle_group_id),
  UNIQUE (muscle_group_id, nerve_name, source_id)
);

CREATE TABLE training.muscle_pain_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  trigger_site text NOT NULL CHECK (btrim(trigger_site) <> ''),
  referred_area text NOT NULL CHECK (btrim(referred_area) <> ''),
  source_id text NOT NULL REFERENCES training.anatomy_sources(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, muscle_group_id),
  UNIQUE (muscle_group_id, trigger_site, referred_area, source_id)
);

CREATE OR REPLACE FUNCTION training.require_canonical_muscle_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM training.muscle_groups AS muscle
    WHERE muscle.id = NEW.muscle_group_id
      AND muscle.canonical_muscle_group_id IS NULL
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'C-546: anatomy and observations require a canonical muscle group';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER muscle_origins_canonical
  BEFORE INSERT OR UPDATE OF muscle_group_id ON training.muscle_origins
  FOR EACH ROW EXECUTE FUNCTION training.require_canonical_muscle_reference();
CREATE TRIGGER muscle_insertions_canonical
  BEFORE INSERT OR UPDATE OF muscle_group_id ON training.muscle_insertions
  FOR EACH ROW EXECUTE FUNCTION training.require_canonical_muscle_reference();
CREATE TRIGGER muscle_innervations_canonical
  BEFORE INSERT OR UPDATE OF muscle_group_id ON training.muscle_innervations
  FOR EACH ROW EXECUTE FUNCTION training.require_canonical_muscle_reference();
CREATE TRIGGER muscle_pain_referrals_canonical
  BEFORE INSERT OR UPDATE OF muscle_group_id ON training.muscle_pain_referrals
  FOR EACH ROW EXECUTE FUNCTION training.require_canonical_muscle_reference();

CREATE TABLE recovery.muscle_symptom_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  muscle_group_id uuid NOT NULL REFERENCES training.muscle_groups(id) ON DELETE RESTRICT,
  observed_at timestamptz NOT NULL,
  symptom_type text NOT NULL CHECK (
    symptom_type IN ('soreness', 'pain', 'numbness')
  ),
  severity smallint NOT NULL CHECK (severity BETWEEN 0 AND 10),
  anatomical_focus text NOT NULL CHECK (
    anatomical_focus IN (
      'muscle_belly',
      'origin_attachment',
      'insertion_attachment',
      'nerve',
      'unknown'
    )
  ),
  origin_id uuid,
  insertion_id uuid,
  innervation_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT muscle_symptom_observations_origin_fkey
    FOREIGN KEY (origin_id, muscle_group_id)
    REFERENCES training.muscle_origins(id, muscle_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT muscle_symptom_observations_insertion_fkey
    FOREIGN KEY (insertion_id, muscle_group_id)
    REFERENCES training.muscle_insertions(id, muscle_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT muscle_symptom_observations_innervation_fkey
    FOREIGN KEY (innervation_id, muscle_group_id)
    REFERENCES training.muscle_innervations(id, muscle_group_id)
    ON DELETE RESTRICT,
  CONSTRAINT muscle_symptom_observations_focus_check CHECK (
    CASE anatomical_focus
      WHEN 'origin_attachment' THEN
        origin_id IS NOT NULL
        AND insertion_id IS NULL
        AND innervation_id IS NULL
      WHEN 'insertion_attachment' THEN
        origin_id IS NULL
        AND insertion_id IS NOT NULL
        AND innervation_id IS NULL
      WHEN 'nerve' THEN
        origin_id IS NULL
        AND insertion_id IS NULL
        AND innervation_id IS NOT NULL
      ELSE
        origin_id IS NULL
        AND insertion_id IS NULL
        AND innervation_id IS NULL
    END
  )
);

CREATE INDEX muscle_symptom_observations_user_time_idx
  ON recovery.muscle_symptom_observations(user_id, observed_at DESC);
CREATE INDEX muscle_symptom_observations_muscle_time_idx
  ON recovery.muscle_symptom_observations(muscle_group_id, observed_at DESC);

CREATE TRIGGER muscle_symptom_observations_canonical
  BEFORE INSERT OR UPDATE OF muscle_group_id ON recovery.muscle_symptom_observations
  FOR EACH ROW EXECUTE FUNCTION training.require_canonical_muscle_reference();
CREATE TRIGGER muscle_symptom_observations_touch_updated_at
  BEFORE UPDATE ON recovery.muscle_symptom_observations
  FOR EACH ROW EXECUTE FUNCTION recovery.touch_updated_at();

ALTER TABLE training.anatomy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.muscle_origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.muscle_insertions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.muscle_innervations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training.muscle_pain_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.muscle_symptom_observations ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA training, recovery TO authenticated, service_role;
GRANT SELECT ON TABLE training.muscle_groups TO authenticated, service_role;

CREATE POLICY anatomy_sources_select ON training.anatomy_sources
  FOR SELECT TO authenticated USING (true);
CREATE POLICY muscle_origins_select ON training.muscle_origins
  FOR SELECT TO authenticated USING (true);
CREATE POLICY muscle_insertions_select ON training.muscle_insertions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY muscle_innervations_select ON training.muscle_innervations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY muscle_pain_referrals_select ON training.muscle_pain_referrals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY muscle_symptom_observations_select
  ON recovery.muscle_symptom_observations
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY muscle_symptom_observations_insert
  ON recovery.muscle_symptom_observations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY muscle_symptom_observations_update
  ON recovery.muscle_symptom_observations
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY muscle_symptom_observations_delete
  ON recovery.muscle_symptom_observations
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE
  training.anatomy_sources,
  training.muscle_origins,
  training.muscle_insertions,
  training.muscle_innervations,
  training.muscle_pain_referrals
FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE
  training.anatomy_sources,
  training.muscle_origins,
  training.muscle_insertions,
  training.muscle_innervations,
  training.muscle_pain_referrals
TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  training.anatomy_sources,
  training.muscle_origins,
  training.muscle_insertions,
  training.muscle_innervations,
  training.muscle_pain_referrals
TO service_role;

REVOKE ALL ON TABLE recovery.muscle_symptom_observations
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE recovery.muscle_symptom_observations
  TO authenticated, service_role;

COMMENT ON TABLE training.anatomy_sources IS
  'C-546: Quellenkatalog. FIPAT TA2 normiert Begriffe; konkrete Ursprungs-, Ansatz- und Nervenrelationen brauchen eine anatomische Fachquelle.';
COMMENT ON TABLE training.muscle_origins IS
  'C-546: allgemeingueltige, belegte Urspruenge kanonischer Muskeln; keine Nutzerbeobachtung und kein Platzhalter.';
COMMENT ON TABLE training.muscle_insertions IS
  'C-546: allgemeingueltige, belegte Ansaetze kanonischer Muskeln; getrennt von Ursprung und Beobachtung.';
COMMENT ON TABLE training.muscle_innervations IS
  'C-546: allgemeingueltige, belegte motorische Nervenversorgung kanonischer Muskeln.';
COMMENT ON TABLE training.muscle_pain_referrals IS
  'C-546: nur belegte typische Triggerpunkt-Ausstrahlungsmuster. Leer ist ehrlicher als eine aus Muskelname oder Region geratene Aussage.';
COMMENT ON TABLE recovery.muscle_symptom_observations IS
  'C-546: zeitbezogene Nutzerbeobachtung zu Muskelkater, Schmerz oder Taubheit. Optionaler Fokus verweist technisch auf genau einen belegten Ursprung, Ansatz oder Nerv desselben Muskels.';

COMMIT;
