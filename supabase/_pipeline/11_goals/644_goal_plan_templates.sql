-- G-644: Mehrere Entwuerfe je Steuerziel und gespeicherte Planvorlagen.
BEGIN;

ALTER TABLE goals.goal_programs DROP CONSTRAINT goal_programs_one_per_goal;
COMMENT ON TABLE goals.goal_programs IS
  'G-644: mehrere Plaene je Steuerziel; genau ein aktiver Plan je Nutzer.';

-- Historische Positionen tragen die Rate ihrer wirklich gestarteten Phase.
UPDATE goals.goal_program_positions pos
SET zielrate_pct_kg_woche=ph.zielrate_pct_kg_woche
FROM goals.goal_phases ph
WHERE ph.id=pos.goal_phase_id
  AND pos.zielrate_pct_kg_woche IS DISTINCT FROM ph.zielrate_pct_kg_woche
  AND pos.eigene_werte IS NULL;

CREATE TABLE goals.goal_plan_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (btrim(code)<>''),
  name text NOT NULL CHECK (btrim(name)<>''),
  quelle text NOT NULL CHECK (quelle IN ('lumeos','eigen','coach')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anker_art text NOT NULL CHECK (anker_art IN ('start','A')),
  positionen jsonb NOT NULL CHECK (jsonb_typeof(positionen)='array'
    AND jsonb_array_length(positionen)>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goal_plan_template_owner_check CHECK (
    (quelle='lumeos' AND user_id IS NULL)
    OR (quelle IN ('eigen','coach') AND user_id IS NOT NULL))
);
CREATE INDEX goal_plan_templates_user_id_idx
  ON goals.goal_plan_templates(user_id);
ALTER TABLE goals.goal_plan_templates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.goal_plan_templates FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON goals.goal_plan_templates TO authenticated;
GRANT ALL ON goals.goal_plan_templates TO service_role;
CREATE POLICY goal_plan_template_read ON goals.goal_plan_templates
  FOR SELECT TO authenticated USING (quelle='lumeos' OR user_id=(SELECT auth.uid()));
CREATE POLICY goal_plan_template_insert ON goals.goal_plan_templates
  FOR INSERT TO authenticated WITH CHECK
    (quelle='eigen' AND user_id=(SELECT auth.uid()));
CREATE POLICY goal_plan_template_delete ON goals.goal_plan_templates
  FOR DELETE TO authenticated USING
    (quelle='eigen' AND user_id=(SELECT auth.uid()));

CREATE FUNCTION goals.g644_template_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_part jsonb;
BEGIN
  IF NEW.quelle='eigen' AND NEW.code !~ '^[0-9a-f-]{36}$' THEN
    RAISE EXCEPTION 'G644_BLOCK:eigener_vorlagencode' USING ERRCODE='23514';
  END IF;
  FOR v_part IN SELECT value FROM jsonb_array_elements(NEW.positionen) LOOP
    IF jsonb_typeof(v_part)<>'object'
       OR jsonb_typeof(v_part->'dauer_wochen')<>'number'
       OR (v_part->>'dauer_wochen')::numeric NOT BETWEEN 1 AND 520
       OR (v_part->>'dauer_wochen')::numeric<>trunc((v_part->>'dauer_wochen')::numeric)
       OR ((v_part ? 'strategie_code') = (v_part ? 'eigene_werte'))
       OR (v_part ? 'strategie_code' AND NOT EXISTS (
         SELECT 1 FROM goals.goal_strategies s
         WHERE s.code=v_part->>'strategie_code'))
       OR (v_part ? 'eigene_werte' AND (
         jsonb_typeof(v_part->'eigene_werte')<>'object'
         OR coalesce(v_part->>'richtung','') NOT IN
           ('abnehmen','halten','aufbauen')
         OR coalesce(v_part->>'phase_type','')='')) THEN
      RAISE EXCEPTION 'G644_BLOCK:vorlage_programm_oder_dauer' USING ERRCODE='23514';
    END IF;
    IF v_part ? 'unterphase' AND NOT EXISTS (
      SELECT 1 FROM goals.goal_strategies s
      CROSS JOIN LATERAL jsonb_array_elements(s.sub_phases) u
      WHERE s.code=v_part->>'strategie_code'
        AND u->>'name'=v_part->>'unterphase') THEN
      RAISE EXCEPTION 'G644_BLOCK:vorlage_unterphase' USING ERRCODE='23514';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER g644_template_validate BEFORE INSERT OR UPDATE
  ON goals.goal_plan_templates FOR EACH ROW
  EXECUTE FUNCTION goals.g644_template_validate();
REVOKE ALL ON FUNCTION goals.g644_template_validate() FROM PUBLIC,anon,authenticated;

INSERT INTO goals.goal_plan_templates(code,name,quelle,anker_art,positionen)
VALUES
  ('prep','Contest Prep 16 Wochen','lumeos','A',
   '[{"strategie_code":"contest_prep","unterphase":"early","dauer_wochen":6},
     {"strategie_code":"contest_prep","unterphase":"mid","dauer_wochen":7},
     {"strategie_code":"contest_prep","unterphase":"late","dauer_wochen":2},
     {"strategie_code":"peak_week","dauer_wochen":1}]'::jsonb),
  ('annual','Expert BB Jahreszyklus','lumeos','start',
   '[{"strategie_code":"reverse_diet","dauer_wochen":8},
     {"strategie_code":"lean_bulk","dauer_wochen":20},
     {"strategie_code":"mini_cut","dauer_wochen":4},
     {"strategie_code":"lean_bulk","dauer_wochen":12},
     {"strategie_code":"maintain","dauer_wochen":8}]'::jsonb),
  ('mini','Mini-Cut-Block','lumeos','start',
   '[{"strategie_code":"mini_cut","dauer_wochen":4}]'::jsonb),
  ('leer','Leerer Plan','lumeos','start',
   '[{"strategie_code":"maintain","dauer_wochen":4}]'::jsonb);

CREATE FUNCTION goals.goal_plan_create(
  p_goal_id uuid,p_name text,p_ausgangspunkt text,p_anker_datum date)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_user uuid := auth.uid(); v_template goals.goal_plan_templates%ROWTYPE;
  v_id uuid; v_start date; v_part jsonb; v_code text; v_direction text;
  v_weeks smallint; v_pos smallint := 0; v_rate numeric;
  v_own jsonb; v_phase_type text;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM goals.user_goals WHERE id=p_goal_id AND user_id=v_user
      AND goal_role='controlling') THEN
    RAISE EXCEPTION 'G644_BLOCK:steuerziel_fremd' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_template FROM goals.goal_plan_templates
  WHERE code=p_ausgangspunkt AND (quelle='lumeos' OR user_id=v_user);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:vorlage_fehlt' USING ERRCODE='42501';
  END IF;
  IF p_anker_datum IS NULL THEN
    RAISE EXCEPTION 'G644_BLOCK:anker_datum_fehlt' USING ERRCODE='23514';
  END IF;
  IF v_template.anker_art='A' THEN
    SELECT p_anker_datum-sum((x->>'dauer_wochen')::integer)::integer*7
      INTO v_start FROM jsonb_array_elements(v_template.positionen) x;
  ELSE
    v_start := p_anker_datum;
  END IF;
  INSERT INTO goals.goal_programs(goal_id,user_id,name,status)
  VALUES (p_goal_id,v_user,p_name,'entwurf') RETURNING id INTO v_id;
  IF v_template.anker_art='A' THEN
    INSERT INTO goals.goal_program_events(program_id,name,kind,event_date)
    VALUES (v_id,'Hauptwettkampf','A',p_anker_datum);
  END IF;
  FOR v_part IN SELECT value FROM jsonb_array_elements(v_template.positionen) LOOP
    v_pos := v_pos+1;
    v_code := v_part->>'strategie_code';
    v_own := v_part->'eigene_werte';
    v_weeks := (v_part->>'dauer_wochen')::smallint;
    IF v_code IS NOT NULL THEN
      SELECT CASE WHEN auswahl_gruppe='abnehmen'
          OR code IN ('contest_prep','peak_week')
          THEN 'abnehmen' WHEN auswahl_gruppe='aufbauen' THEN 'aufbauen'
          WHEN code='reverse_diet' THEN 'aufbauen'
          ELSE 'halten' END,
        CASE WHEN auswahl_gruppe='halten' THEN 0
          ELSE weight_change_target_percent END
      INTO v_direction,v_rate FROM goals.goal_strategies WHERE code=v_code;
      v_phase_type := CASE v_code WHEN 'maintain' THEN 'maintenance'
        ELSE v_code END;
    ELSE
      v_direction := v_part->>'richtung';
      v_phase_type := v_part->>'phase_type';
      v_rate := NULL;
    END IF;
    INSERT INTO goals.goal_program_positions(
      program_id,position,strategie_code,eigene_werte,
      sub_phase_code,duration_weeks,
      richtung,phase_type,zielrate_pct_kg_woche,gueltig_ab,projected_end_date)
    VALUES (v_id,v_pos,v_code,v_own,v_part->>'unterphase',v_weeks,
      v_direction,v_phase_type,v_rate,v_start,v_start+v_weeks*7-1);
    v_start := v_start+v_weeks*7;
  END LOOP;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_create(uuid,text,text,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_create(uuid,text,text,date)
  TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_save_as_template(p_plan_id uuid,p_name text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan goals.goal_programs%ROWTYPE; v_id uuid := gen_random_uuid();
  v_positions jsonb;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs
  WHERE id=p_plan_id AND user_id=auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:plan_fremd' USING ERRCODE='42501';
  END IF;
  SELECT jsonb_agg(jsonb_build_object('dauer_wochen',duration_weeks)
      || CASE WHEN strategie_code IS NOT NULL THEN
        jsonb_build_object('strategie_code',strategie_code)
        ELSE jsonb_build_object('eigene_werte',eigene_werte,
          'richtung',richtung,'phase_type',phase_type) END
      || CASE WHEN sub_phase_code IS NULL THEN '{}'::jsonb
        ELSE jsonb_build_object('unterphase',sub_phase_code) END
      ORDER BY position) INTO v_positions
  FROM goals.goal_program_positions WHERE program_id=p_plan_id;
  IF v_positions IS NULL OR EXISTS (
    SELECT 1 FROM goals.goal_program_positions
    WHERE program_id=p_plan_id AND duration_weeks IS NULL
  ) THEN
    RAISE EXCEPTION 'G644_BLOCK:vorlage_braucht_dauer'
      USING ERRCODE='23514';
  END IF;
  INSERT INTO goals.goal_plan_templates(id,code,name,quelle,user_id,anker_art,positionen)
  VALUES (v_id,v_id::text,p_name,'eigen',auth.uid(),
    CASE WHEN EXISTS (SELECT 1 FROM goals.goal_program_events
      WHERE program_id=p_plan_id AND kind='A') THEN 'A' ELSE 'start' END,
    v_positions);
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_save_as_template(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_save_as_template(uuid,text)
  TO authenticated,service_role;

CREATE FUNCTION goals.goal_plan_position_delete(p_position_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_plan_id uuid; v_position smallint;
BEGIN
  SELECT pos.program_id,pos.position INTO v_plan_id,v_position
  FROM goals.goal_program_positions pos
  JOIN goals.goal_programs plan ON plan.id=pos.program_id
  WHERE pos.id=p_position_id AND pos.goal_phase_id IS NULL
    AND plan.user_id=auth.uid() FOR UPDATE OF pos;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G644_BLOCK:nur_geplante_position'
      USING ERRCODE='23514';
  END IF;
  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key DEFERRED;
  DELETE FROM goals.goal_program_positions WHERE id=p_position_id;
  UPDATE goals.goal_program_positions SET position=position-1
  WHERE program_id=v_plan_id AND position>v_position;
  SET CONSTRAINTS goals.goal_program_positions_program_id_position_key IMMEDIATE;
END $$;
REVOKE ALL ON FUNCTION goals.goal_plan_position_delete(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_plan_position_delete(uuid)
  TO authenticated,service_role;
COMMIT;
