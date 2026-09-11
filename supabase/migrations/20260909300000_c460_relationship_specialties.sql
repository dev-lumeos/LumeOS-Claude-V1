BEGIN;

CREATE TABLE coach.relationship_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid NOT NULL REFERENCES coach.relationships(id) ON DELETE RESTRICT,
  specialty text NOT NULL CHECK (specialty IN ('training','nutrition','supplement','medical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (relationship_id, specialty)
);
CREATE INDEX relationship_specialties_relationship_idx ON coach.relationship_specialties(relationship_id, specialty);
ALTER TABLE coach.relationship_specialties ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON coach.relationship_specialties TO authenticated;
GRANT ALL ON coach.relationship_specialties TO service_role;
CREATE POLICY relationship_specialties_select ON coach.relationship_specialties FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM coach.relationships r WHERE r.id=relationship_id AND (SELECT auth.uid()) IN (r.coach_id,r.client_id)));

CREATE FUNCTION coach.set_relationship_specialties(p_relationship_id uuid, p_specialties text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_specialties IS NULL OR cardinality(p_specialties)=0 OR EXISTS (SELECT 1 FROM unnest(p_specialties) s WHERE s NOT IN ('training','nutrition','supplement','medical')) THEN RAISE EXCEPTION 'one or more valid coach specialties required' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM coach.relationships r WHERE r.id=p_relationship_id AND r.status='active' AND (SELECT auth.uid()) IN (r.coach_id,r.client_id)) THEN RAISE EXCEPTION 'active own relationship required' USING ERRCODE='42501'; END IF;
  DELETE FROM coach.relationship_specialties WHERE relationship_id=p_relationship_id;
  INSERT INTO coach.relationship_specialties(relationship_id,specialty)
  SELECT p_relationship_id, s FROM (SELECT DISTINCT unnest(p_specialties) AS s) x;
END $$;
REVOKE ALL ON FUNCTION coach.set_relationship_specialties(uuid,text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.set_relationship_specialties(uuid,text[]) TO authenticated, service_role;
COMMENT ON TABLE coach.relationship_specialties IS 'C-460: Die vier Coach-Faecher sind eine eigene Liste, nicht die sieben Berechtigungs-Module; eine Beziehung kann mehrere Faecher haben.';
COMMIT;
