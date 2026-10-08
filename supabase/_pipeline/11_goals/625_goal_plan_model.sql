-- G-625: Ein Ziel besitzt einen Plan; die Phase ist eine Position darin.
BEGIN;

DO $g625_preflight$
BEGIN
  IF EXISTS (SELECT 1 FROM goals.goal_programs)
     OR EXISTS (SELECT 1 FROM goals.goal_program_positions) THEN
    RAISE EXCEPTION 'G-625: unerwarteter Planbestand; Backfill abgebrochen';
  END IF;
END $g625_preflight$;

ALTER TABLE goals.goal_programs
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN status text NOT NULL DEFAULT 'entwurf'
    CHECK (status IN ('entwurf','aktiv','pausiert','abgeschlossen')),
  ADD CONSTRAINT goal_programs_one_per_goal UNIQUE (goal_id);
ALTER TABLE goals.goal_programs ALTER COLUMN user_id SET NOT NULL;
CREATE UNIQUE INDEX goal_programs_one_active_per_user
  ON goals.goal_programs(user_id) WHERE status='aktiv';

ALTER TABLE goals.goal_program_positions
  ALTER COLUMN strategie_code DROP NOT NULL,
  ALTER COLUMN duration_weeks DROP NOT NULL,
  ADD COLUMN eigene_werte jsonb,
  ADD COLUMN richtung text NOT NULL CHECK (richtung IN ('abnehmen','halten','aufbauen')),
  ADD COLUMN phase_type text NOT NULL,
  ADD COLUMN zielrate_pct_kg_woche numeric(5,3),
  ADD COLUMN gueltig_ab date,
  ADD COLUMN projected_end_date date,
  ADD COLUMN confirmed_warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT goal_program_positions_one_source
    CHECK ((strategie_code IS NULL) <> (eigene_werte IS NULL)),
  ADD CONSTRAINT goal_program_positions_own_object
    CHECK (eigene_werte IS NULL OR jsonb_typeof(eigene_werte)='object'),
  ADD CONSTRAINT goal_program_positions_confirmations_array
    CHECK (jsonb_typeof(confirmed_warnings)='array');

CREATE TABLE goals.goal_program_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES goals.goal_programs(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (btrim(name) <> ''),
  kind text NOT NULL CHECK (kind IN ('A','B','S','X')),
  event_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX goal_program_events_program_date
  ON goals.goal_program_events(program_id,event_date);
CREATE TRIGGER goal_program_events_touch_updated_at
  BEFORE UPDATE ON goals.goal_program_events
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();
ALTER TABLE goals.goal_program_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.goal_program_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.goal_program_events TO authenticated;
GRANT ALL ON goals.goal_program_events TO service_role;
CREATE POLICY goal_program_events_owner ON goals.goal_program_events
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM goals.goal_programs p
    WHERE p.id=program_id AND p.user_id=(SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals.goal_programs p
    WHERE p.id=program_id AND p.user_id=(SELECT auth.uid())
  ));

CREATE FUNCTION goals.g625_program_owner_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_goal goals.user_goals%ROWTYPE;
BEGIN
  SELECT * INTO v_goal FROM goals.user_goals WHERE id=NEW.goal_id;
  IF NOT FOUND OR NEW.user_id IS DISTINCT FROM v_goal.user_id THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_ziel_zuordnung' USING ERRCODE='23514';
  END IF;
  IF NEW.status='aktiv' AND v_goal.status<>'active' THEN
    RAISE EXCEPTION 'G625_BLOCK:ziel_nicht_aktiv' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER g625_program_owner_guard
  BEFORE INSERT OR UPDATE OF goal_id,user_id,status ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.g625_program_owner_guard();
REVOKE ALL ON FUNCTION goals.g625_program_owner_guard() FROM PUBLIC,anon,authenticated;

DROP TRIGGER goal_program_positions_validate ON goals.goal_program_positions;
CREATE OR REPLACE FUNCTION goals.goal_program_position_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_plan goals.goal_programs%ROWTYPE;
  v_phase goals.goal_phases%ROWTYPE;
  v_experience text;
  v_custom jsonb := NEW.eigene_werte;
  v_key text;
BEGIN
  SELECT * INTO v_plan FROM goals.goal_programs WHERE id=NEW.program_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G625_BLOCK:plan_fehlt' USING ERRCODE='23514';
  END IF;
  IF (NEW.strategie_code IS NULL) = (v_custom IS NULL) THEN
    RAISE EXCEPTION 'G625_BLOCK:vorgehen_doppelt_oder_fehlt' USING ERRCODE='23514';
  END IF;
  IF NEW.strategie_code IS NOT NULL THEN
    IF NEW.strategie_code LIKE 'eigene_werte_%' THEN
      RAISE EXCEPTION 'G625_BLOCK:eigene_werte_statt_katalogcode'
        USING ERRCODE='23514';
    END IF;
    IF NEW.sub_phase_code IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM goals.goal_strategies gs
      CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases) AS part(value)
      WHERE gs.code=NEW.strategie_code AND part.value->>'name'=NEW.sub_phase_code
    ) THEN
      RAISE EXCEPTION 'G625_BLOCK:unterphase_passt_nicht' USING ERRCODE='23514';
    END IF;
  ELSE
    IF NEW.zielrate_pct_kg_woche IS NOT NULL THEN
      RAISE EXCEPTION 'G625_BLOCK:eigene_werte_und_katalograte'
        USING ERRCODE='23514';
    END IF;
    SELECT experience_level INTO v_experience
    FROM public.profiles WHERE id=v_plan.user_id;
    IF v_experience NOT IN ('pro','elite') OR v_experience IS NULL THEN
      RAISE EXCEPTION 'G625_BLOCK:eigene_werte_grad' USING ERRCODE='23514';
    END IF;
    IF (v_custom ? 'tempo_pct_kg_woche') = (v_custom ? 'kcal_pct_erhaltung') THEN
      RAISE EXCEPTION 'G625_BLOCK:eigene_werte_tempo_oder_kcal'
        USING ERRCODE='23514';
    END IF;
    IF v_custom ? 'tempo_pct_kg_woche' THEN
      IF jsonb_typeof(v_custom->'tempo_pct_kg_woche')<>'number'
         OR (NEW.richtung='halten'
           AND (v_custom->>'tempo_pct_kg_woche')::numeric<>0)
         OR (NEW.richtung<>'halten'
           AND (v_custom->>'tempo_pct_kg_woche')::numeric<=0) THEN
        RAISE EXCEPTION 'G625_BLOCK:eigene_werte_tempo'
          USING ERRCODE='23514';
      END IF;
    ELSE
      IF jsonb_typeof(v_custom->'kcal_pct_erhaltung')<>'number'
         OR (NEW.richtung='abnehmen'
           AND (v_custom->>'kcal_pct_erhaltung')::numeric NOT BETWEEN -99 AND -0.001)
         OR (NEW.richtung='aufbauen'
           AND (v_custom->>'kcal_pct_erhaltung')::numeric<=0)
         OR (NEW.richtung='halten'
           AND (v_custom->>'kcal_pct_erhaltung')::numeric<>0) THEN
        RAISE EXCEPTION 'G625_BLOCK:eigene_werte_kcal_richtung'
          USING ERRCODE='23514';
      END IF;
    END IF;
    FOREACH v_key IN ARRAY ARRAY[
      'protein_g_kg','fett_g_kg','cardio_pro_woche','refeed_pro_woche'
    ] LOOP
      IF jsonb_typeof(v_custom->v_key) IS DISTINCT FROM 'number'
         OR (v_key IN ('protein_g_kg','fett_g_kg')
           AND (v_custom->>v_key)::numeric<=0)
         OR (v_key NOT IN ('protein_g_kg','fett_g_kg')
           AND (v_custom->>v_key)::numeric<0) THEN
        RAISE EXCEPTION 'G625_BLOCK:eigene_werte_%',v_key USING ERRCODE='23514';
      END IF;
    END LOOP;
    IF v_custom ? 'max_duration_weeks'
       AND (jsonb_typeof(v_custom->'max_duration_weeks')<>'number'
         OR (v_custom->>'max_duration_weeks')::numeric <= 0) THEN
      RAISE EXCEPTION 'G625_BLOCK:eigene_werte_dauer' USING ERRCODE='23514';
    END IF;
  END IF;
  IF NEW.goal_phase_id IS NOT NULL THEN
    SELECT * INTO v_phase FROM goals.goal_phases WHERE id=NEW.goal_phase_id;
    IF NOT FOUND OR v_phase.goal_id IS DISTINCT FROM v_plan.goal_id
      OR v_phase.phase_type IS DISTINCT FROM NEW.phase_type
      OR (NEW.strategie_code IS NOT NULL
        AND v_phase.strategie_code IS DISTINCT FROM NEW.strategie_code)
      OR (NEW.strategie_code IS NULL AND v_phase.strategie_code<>'custom') THEN
      RAISE EXCEPTION 'G625_BLOCK:phase_passt_nicht' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER goal_program_positions_validate
  BEFORE INSERT OR UPDATE ON goals.goal_program_positions
  FOR EACH ROW EXECUTE FUNCTION goals.goal_program_position_validate();

DO $g625_backfill$
DECLARE v_count integer;
BEGIN
  CREATE TEMP TABLE g625_expected (
    goal_id uuid PRIMARY KEY, phase_id uuid NOT NULL, plan_id uuid NOT NULL
  ) ON COMMIT DROP;
  INSERT INTO g625_expected VALUES
    ('30000000-0000-0000-0000-000000000101',
     '31000000-0000-0000-0000-000000000102',
     '62500000-0000-0000-0000-000000000101'),
    ('30000000-0000-0000-0000-000000000901',
     '31000000-0000-0000-0000-000000000901',
     '62500000-0000-0000-0000-000000000901'),
    ('30000000-0000-0000-0000-000000000902',
     '31000000-0000-0000-0000-000000000902',
     '62500000-0000-0000-0000-000000000902'),
    ('dc5f4d6f-9df0-45f4-bbf8-f1e0620ef50b',
     '53ae9232-4749-4350-9a58-60dfc159ff1c',
     '62500000-0000-0000-0000-000000000903');
  SELECT count(*) INTO v_count FROM goals.user_goals WHERE goal_role='controlling';
  IF v_count NOT IN (3,4)
     OR EXISTS (
       SELECT 1 FROM goals.user_goals g
       WHERE g.goal_role='controlling'
         AND NOT EXISTS (SELECT 1 FROM g625_expected e WHERE e.goal_id=g.id)
     )
     OR EXISTS (
       SELECT 1 FROM g625_expected e
       JOIN goals.user_goals g ON g.id=e.goal_id
       WHERE g.goal_role<>'controlling'
         OR NOT EXISTS (
           SELECT 1 FROM goals.goal_phases p
           WHERE p.id=e.phase_id AND p.goal_id=e.goal_id
         )
     ) THEN
    RAISE EXCEPTION 'G-625: Steuerziel-/Phasenbestand weicht vom gemessenen Satz ab';
  END IF;
  INSERT INTO goals.goal_programs(id,goal_id,user_id,name,status)
  SELECT e.plan_id,g.id,g.user_id,g.title,
    CASE WHEN g.status='active' THEN 'aktiv' ELSE 'pausiert' END
  FROM g625_expected e JOIN goals.user_goals g ON g.id=e.goal_id;
  INSERT INTO goals.goal_program_positions(
    program_id,position,strategie_code,richtung,phase_type,
    duration_weeks,goal_phase_id,gueltig_ab,projected_end_date
  )
  SELECT e.plan_id,1,p.strategie_code,
    CASE p.phase_type
      WHEN 'fat_loss' THEN 'abnehmen'
      WHEN 'mini_cut' THEN 'abnehmen'
      WHEN 'lean_bulk' THEN 'aufbauen'
      ELSE 'halten' END,
    p.phase_type,
    CASE WHEN p.projected_end_date IS NOT NULL
      THEN greatest(1,ceil((p.projected_end_date-p.gueltig_ab)::numeric/7))::smallint
      ELSE NULL END,
    p.id,p.gueltig_ab,p.projected_end_date
  FROM g625_expected e
  JOIN goals.user_goals g ON g.id=e.goal_id
  JOIN goals.goal_phases p ON p.id=e.phase_id;
  IF (SELECT count(*) FROM goals.goal_programs)<>v_count
     OR (SELECT count(*) FROM goals.goal_program_positions)<>v_count THEN
    RAISE EXCEPTION 'G-625: Backfill unvollstaendig';
  END IF;
END $g625_backfill$;

COMMENT ON TABLE goals.goal_programs IS
  'G-625: genau ein Plan als Inhalt des steuernden Ziels; maximal ein aktiver Plan pro Nutzer.';
COMMENT ON TABLE goals.goal_program_events IS
  'G-625: frei benannte A-, B-, S- und X-Termine eines Plans.';
COMMENT ON COLUMN goals.goal_program_positions.eigene_werte IS
  'G-625: eigene Phasenwerte statt eines Katalogprogramms, ab Pro.';
COMMIT;
