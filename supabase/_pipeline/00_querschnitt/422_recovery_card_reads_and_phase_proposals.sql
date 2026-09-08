-- C-422/G-363: database read contract for the eleven newly attachable cards.
CREATE OR REPLACE FUNCTION recovery.card_read_all(p_user_id uuid)
RETURNS TABLE (card_key text, has_data boolean, rows jsonb, empty_hint text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH data AS (
    SELECT 'pending_actions'::text k, coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.alert_date DESC), '[]'::jsonb) v FROM recovery.overtraining_alerts a WHERE a.user_id=p_user_id AND a.status <> 'resolved'
    UNION ALL SELECT 'overtraining_watch', coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.alert_date DESC), '[]'::jsonb) FROM recovery.overtraining_alerts a WHERE a.user_id=p_user_id
    UNION ALL SELECT 'overtraining_signals', coalesce(jsonb_agg(jsonb_build_object('alert_date',a.alert_date,'signals',a.signals) ORDER BY a.alert_date DESC), '[]'::jsonb) FROM recovery.overtraining_alerts a WHERE a.user_id=p_user_id
    UNION ALL SELECT 'overtraining_severity', coalesce(jsonb_agg(jsonb_build_object('alert_date',a.alert_date,'severity',a.severity) ORDER BY a.alert_date DESC), '[]'::jsonb) FROM recovery.overtraining_alerts a WHERE a.user_id=p_user_id
    UNION ALL SELECT 'overtraining_lifecycle', coalesce(jsonb_agg(jsonb_build_object('alert_date',a.alert_date,'status',a.status,'acknowledged_at',a.acknowledged_at,'resolved_at',a.resolved_at) ORDER BY a.alert_date DESC), '[]'::jsonb) FROM recovery.overtraining_alerts a WHERE a.user_id=p_user_id
    UNION ALL SELECT 'protocol_library', coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.started_on DESC), '[]'::jsonb) FROM recovery.recovery_protocols p WHERE p.user_id=p_user_id
    UNION ALL SELECT 'protocol_timing', coalesce(jsonb_agg(jsonb_build_object('name',p.name,'started_on',p.started_on,'duration_days',p.duration_days,'status',p.status) ORDER BY p.started_on DESC), '[]'::jsonb) FROM recovery.recovery_protocols p WHERE p.user_id=p_user_id
    UNION ALL SELECT 'stress_log', coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.entry_date DESC), '[]'::jsonb) FROM recovery.stress_logs s WHERE s.user_id=p_user_id
    UNION ALL SELECT 'stress_relief', coalesce(jsonb_agg(jsonb_build_object('entry_date',s.entry_date,'stress_level',s.stress_level,'notes',s.notes) ORDER BY s.entry_date DESC), '[]'::jsonb) FROM recovery.stress_logs s WHERE s.user_id=p_user_id AND s.notes IS NOT NULL
    UNION ALL SELECT 'score_contributors', coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.entry_date DESC), '[]'::jsonb) FROM recovery.score_contributions c WHERE c.user_id=p_user_id
    UNION ALL SELECT 'score_contribution_trend', coalesce(jsonb_agg(jsonb_build_object('entry_date',c.entry_date,'source_module',c.source_module,'weighted_points',c.weighted_points) ORDER BY c.entry_date DESC), '[]'::jsonb) FROM recovery.score_contributions c WHERE c.user_id=p_user_id
  ) SELECT k, v <> '[]'::jsonb, v, CASE WHEN v='[]'::jsonb THEN 'Noch keine Daten fuer ' || replace(k,'_',' ') || '.' END FROM data;
$$;
REVOKE ALL ON FUNCTION recovery.card_read_all(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION recovery.card_read_all(uuid) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS goals.phase_transition_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), phase_id uuid NOT NULL REFERENCES goals.goal_phases(id), user_id uuid NOT NULL REFERENCES auth.users(id),
  response text NOT NULL CHECK (response IN ('accepted','rejected')), reason text, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE goals.phase_transition_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS phase_transition_responses_own ON goals.phase_transition_responses;
DROP POLICY IF EXISTS phase_transition_responses_select_own ON goals.phase_transition_responses;
DROP POLICY IF EXISTS phase_transition_responses_insert_own ON goals.phase_transition_responses;
DROP POLICY IF EXISTS phase_transition_responses_update_own ON goals.phase_transition_responses;
DROP POLICY IF EXISTS phase_transition_responses_delete_own ON goals.phase_transition_responses;
CREATE POLICY phase_transition_responses_select_own ON goals.phase_transition_responses FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
CREATE POLICY phase_transition_responses_insert_own ON goals.phase_transition_responses FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY phase_transition_responses_update_own ON goals.phase_transition_responses FOR UPDATE TO authenticated USING ((SELECT auth.uid())=user_id) WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY phase_transition_responses_delete_own ON goals.phase_transition_responses FOR DELETE TO authenticated USING ((SELECT auth.uid())=user_id);
GRANT SELECT, INSERT ON goals.phase_transition_responses TO authenticated;
GRANT ALL ON goals.phase_transition_responses TO service_role;

CREATE OR REPLACE FUNCTION goals.phase_transition_recommendation(p_user_id uuid, p_as_of date DEFAULT CURRENT_DATE)
RETURNS TABLE (phase_id uuid, recommended_next text, transition_reason text)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_phase goals.goal_phases%ROWTYPE; v_measurements integer; v_latest date; v_next text; v_reason text;
BEGIN
  SELECT * INTO v_phase FROM goals.goal_phases WHERE user_id=p_user_id AND actual_end_date IS NULL AND projected_end_date <= p_as_of ORDER BY gueltig_ab DESC LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT count(*), max(measurement_date) INTO v_measurements,v_latest FROM goals.body_measurements WHERE user_id=p_user_id AND measurement_date<=p_as_of;
  IF v_measurements < 2 THEN RETURN; END IF;
  v_next := CASE v_phase.phase_type WHEN 'lean_bulk' THEN 'mini_cut' WHEN 'fat_loss' THEN 'maintenance' WHEN 'mini_cut' THEN 'maintenance' WHEN 'contest_prep' THEN 'reverse_diet' WHEN 'reverse_diet' THEN 'maintenance' ELSE 'recomp' END;
  v_reason := format('Regelvorschlag: %s Tage ueber dem geplanten Phasenende; %s Koerpermessungen bis %s belegen die Entscheidung.', p_as_of-v_phase.projected_end_date, v_measurements, v_latest);
  UPDATE goals.goal_phases SET recommended_next=v_next, transition_reason=v_reason WHERE id=v_phase.id;
  RETURN QUERY SELECT v_phase.id,v_next,v_reason;
END $$;
CREATE OR REPLACE FUNCTION goals.phase_transition_respond(p_phase_id uuid,p_response text,p_reason text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_user uuid := NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'phase_transition_respond: Anmeldung erforderlich'; END IF;
  INSERT INTO goals.phase_transition_responses(phase_id,user_id,response,reason) SELECT id,v_user,p_response,NULLIF(btrim(p_reason),'') FROM goals.goal_phases WHERE id=p_phase_id AND user_id=v_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'phase_transition_respond: eigene Phase nicht gefunden'; END IF; RETURN p_response;
END $$;
REVOKE ALL ON FUNCTION goals.phase_transition_recommendation(uuid,date), goals.phase_transition_respond(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.phase_transition_recommendation(uuid,date), goals.phase_transition_respond(uuid,text,text) TO authenticated, service_role;
