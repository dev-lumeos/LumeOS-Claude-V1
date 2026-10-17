-- G-627: Regelkatalog und nachvollziehbare Wochenempfehlung je aktivem Plan.
-- Empfehlungen veraendern keine Phasenwerte ohne bestaetigten Schreibweg.
BEGIN;

-- Der Dienst verwendet dieselben nutzerbezogenen Leser mit gesetztem JWT.
GRANT EXECUTE ON FUNCTION goals.controlling_goal_outlook(uuid,date),
  goals.trendgewicht_am(uuid,date),goals.plan_soll_am(uuid,date),
  goals.plan_zieldatum(uuid) TO service_role;

CREATE TABLE goals.weekly_adjustment_rules (
  rule_key text PRIMARY KEY,
  phase_type text,
  priority integer NOT NULL CHECK (priority>0),
  condition_type text NOT NULL CHECK (condition_type IN (
    'low_logs','three_week_behind','three_week_ahead','trend_gt_adherence',
    'trend_lt_adherence','trend_gt','trend_lt','strength_loss_gt','always')),
  threshold numeric,
  adherence_threshold numeric,
  kcal_delta integer NOT NULL DEFAULT 0,
  protein_delta_g integer NOT NULL DEFAULT 0,
  reason text NOT NULL,
  source_ref text NOT NULL
);
ALTER TABLE goals.weekly_adjustment_rules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.weekly_adjustment_rules FROM PUBLIC,anon;
GRANT SELECT ON goals.weekly_adjustment_rules TO authenticated,service_role;
CREATE POLICY weekly_adjustment_rules_read
  ON goals.weekly_adjustment_rules FOR SELECT TO authenticated,service_role
  USING (true);

INSERT INTO goals.weekly_adjustment_rules
  (rule_key,phase_type,priority,condition_type,threshold,
    adherence_threshold,kcal_delta,protein_delta_g,reason,source_ref)
VALUES
  ('logtage_zu_wenig',NULL,1,'low_logs',5,NULL,0,0,
    'zu wenig Logtage (mind. 5)',
    'docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html'),
  ('wache_fat_loss_hinterher','fat_loss',2,'three_week_behind',3,NULL,-100,0,
    'Wache: 3 Wochen hinter Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('wache_fat_loss_voraus','fat_loss',2,'three_week_ahead',3,NULL,100,0,
    'Wache: 3 Wochen vor Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('wache_lean_bulk_hinterher','lean_bulk',2,'three_week_behind',3,NULL,100,0,
    'Wache: 3 Wochen hinter Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('wache_lean_bulk_voraus','lean_bulk',2,'three_week_ahead',3,NULL,-100,0,
    'Wache: 3 Wochen vor Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('wache_reverse_hinterher','reverse_diet',2,'three_week_behind',3,NULL,100,0,
    'Wache: 3 Wochen hinter Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('wache_reverse_voraus','reverse_diet',2,'three_week_ahead',3,NULL,-100,0,
    'Wache: 3 Wochen vor Soll',
    'PhaseEngine.dc.html + goals.controlling_goal_lage_at'),
  ('fat_loss_stillstand','fat_loss',10,'trend_gt_adherence',-0.05,85,-100,0,
    'Kein Gewichtsverlust trotz guter Kalorientreue',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('fat_loss_zu_schnell','fat_loss',11,'trend_lt',-1,NULL,150,0,
    'Gewichtsverlust über 1 kg pro Woche',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('fat_loss_kraft','fat_loss',12,'strength_loss_gt',10,NULL,0,20,
    'Kraftverlust: Muskelschutz durch mehr Protein',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('lean_bulk_zu_schnell','lean_bulk',10,'trend_gt',0.8,NULL,-100,0,
    'Zunahme über 0,8 kg pro Woche',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('lean_bulk_zu_langsam','lean_bulk',11,'trend_lt_adherence',0.1,85,100,0,
    'Keine Zunahme trotz Überschuss und guter Kalorientreue',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('reverse_zu_schnell','reverse_diet',10,'trend_gt',0.5,NULL,0,0,
    'Gewichtszunahme zu schnell',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('reverse_erhoehen','reverse_diet',20,'always',NULL,NULL,100,0,
    'Wöchentliche Reverse-Diet-Erhöhung',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment'),
  ('auf_kurs',NULL,999,'always',NULL,NULL,0,0,'Auf Kurs',
    'docs/specs/Goals/SCORING.md §6 calcWeeklyAdjustment');

CREATE TABLE goals.goal_weekly_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES goals.goal_programs(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals.user_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL CHECK (week_end=week_start+6),
  phase_type text,
  trend_delta_kg numeric,
  soll_delta_kg numeric,
  log_days integer NOT NULL CHECK (log_days BETWEEN 0 AND 7),
  adherence_pct numeric,
  strength_loss_pct numeric,
  three_week_side text CHECK (three_week_side IN ('hinterher','voraus')),
  rule_key text NOT NULL REFERENCES goals.weekly_adjustment_rules(rule_key),
  kcal_delta integer NOT NULL,
  protein_delta_g integer NOT NULL,
  reason text NOT NULL,
  source_data jsonb NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(program_id,week_start)
);
CREATE INDEX goal_weekly_adjustments_user_plan_week
  ON goals.goal_weekly_adjustments(user_id,program_id,week_start DESC);
ALTER TABLE goals.goal_weekly_adjustments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.goal_weekly_adjustments FROM PUBLIC,anon,authenticated;
GRANT SELECT ON goals.goal_weekly_adjustments TO authenticated;
GRANT SELECT,INSERT,UPDATE ON goals.goal_weekly_adjustments TO service_role;
CREATE POLICY goal_weekly_adjustments_own_read
  ON goals.goal_weekly_adjustments FOR SELECT TO authenticated
  USING (user_id=auth.uid());
CREATE POLICY goal_weekly_adjustments_service
  ON goals.goal_weekly_adjustments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE FUNCTION goals.weekly_adjustment_rule_at(
  p_phase_type text,p_trend_delta numeric,p_adherence numeric,
  p_strength_loss numeric,p_log_days integer,p_three_week_side text
) RETURNS goals.weekly_adjustment_rules
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT r FROM goals.weekly_adjustment_rules r
  WHERE (r.phase_type IS NULL OR r.phase_type=p_phase_type)
    AND CASE r.condition_type
      WHEN 'low_logs' THEN p_log_days<r.threshold
      WHEN 'three_week_behind' THEN p_three_week_side='hinterher'
      WHEN 'three_week_ahead' THEN p_three_week_side='voraus'
      WHEN 'trend_gt_adherence' THEN p_trend_delta>r.threshold
        AND p_adherence>r.adherence_threshold
      WHEN 'trend_lt_adherence' THEN p_trend_delta<r.threshold
        AND p_adherence>r.adherence_threshold
      WHEN 'trend_gt' THEN p_trend_delta>r.threshold
      WHEN 'trend_lt' THEN p_trend_delta<r.threshold
      WHEN 'strength_loss_gt' THEN p_strength_loss>r.threshold
      WHEN 'always' THEN true ELSE false END
  ORDER BY r.priority,r.rule_key LIMIT 1;
$$;
REVOKE ALL ON FUNCTION goals.weekly_adjustment_rule_at(
  text,numeric,numeric,numeric,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.weekly_adjustment_rule_at(
  text,numeric,numeric,numeric,integer,text) TO authenticated,service_role;

CREATE FUNCTION goals.record_weekly_adjustments(
  p_through date DEFAULT ((now() AT TIME ZONE 'Asia/Bangkok')::date-1),
  p_user_ids uuid[] DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path='' AS $$
DECLARE v_plan record; v_week jsonb; v_week_end date; v_phase text;
  v_side text; v_lages text[]; v_adherence numeric; v_strength numeric;
  v_rule goals.weekly_adjustment_rules%ROWTYPE; v_written integer:=0;
  v_accounts integer:=0; v_claim text;
BEGIN
  IF current_user<>'service_role' THEN
    RAISE EXCEPTION 'G627_BLOCK:nur_dienst' USING ERRCODE='42501';
  END IF;
  IF p_through IS NULL OR p_through>
    ((now() AT TIME ZONE 'Asia/Bangkok')::date-1) THEN
    RAISE EXCEPTION 'G627_BLOCK:unvollstaendige_woche' USING ERRCODE='22007';
  END IF;
  v_claim:=current_setting('request.jwt.claim.sub',true);
  FOR v_plan IN SELECT p.id,p.goal_id,p.user_id
    FROM goals.goal_programs p JOIN goals.user_goals g ON g.id=p.goal_id
    WHERE p.status='aktiv' AND g.status='active'
      AND (p_user_ids IS NULL OR p.user_id=ANY(p_user_ids))
    ORDER BY p.user_id,p.id LOOP
    v_accounts:=v_accounts+1;
    PERFORM set_config('request.jwt.claim.sub',v_plan.user_id::text,true);
    FOR v_week IN SELECT value FROM jsonb_array_elements(
      goals.controlling_goal_outlook(v_plan.goal_id,p_through)->'wochen') LOOP
      IF NOT coalesce((v_week->>'vollstaendig')::boolean,false) THEN
        CONTINUE;
      END IF;
      v_week_end:=(v_week->>'woche_bis')::date;
      SELECT ph.phase_type INTO v_phase FROM goals.goal_phases ph
      WHERE ph.goal_id=v_plan.goal_id AND ph.gueltig_ab<=v_week_end
        AND (ph.actual_end_date IS NULL OR ph.actual_end_date>=v_week_end)
      ORDER BY ph.gueltig_ab DESC,ph.created_at DESC LIMIT 1;
      SELECT round(avg(c.contribution_score),2) INTO v_adherence
      FROM goals.goal_contributions c
      WHERE c.goal_id=v_plan.goal_id AND c.module='nutrition'
        AND c.contribution_date BETWEEN (v_week->>'woche_ab')::date
          AND v_week_end;
      v_strength:=(goals.goal_phase_guards_at(v_plan.goal_id,v_week_end)
        ->0->>'wert_pct')::numeric;
      SELECT array_agg(goals.controlling_goal_lage_at(
        v_plan.goal_id,v_week_end-n*7)->>'lage' ORDER BY n)
      INTO v_lages FROM generate_series(0,2) n;
      v_side:=CASE WHEN v_lages=ARRAY['hinterher','hinterher','hinterher']
        THEN 'hinterher'
        WHEN v_lages=ARRAY['voraus','voraus','voraus'] THEN 'voraus'
        ELSE NULL END;
      SELECT * INTO v_rule FROM goals.weekly_adjustment_rule_at(
        v_phase,(v_week->>'trend_delta_kg')::numeric,v_adherence,
        v_strength,(v_week->>'logtage')::integer,v_side);
      INSERT INTO goals.goal_weekly_adjustments(
        program_id,goal_id,user_id,week_start,week_end,phase_type,
        trend_delta_kg,soll_delta_kg,log_days,adherence_pct,
        strength_loss_pct,three_week_side,rule_key,kcal_delta,
        protein_delta_g,reason,source_data)
      VALUES(v_plan.id,v_plan.goal_id,v_plan.user_id,
        (v_week->>'woche_ab')::date,v_week_end,v_phase,
        (v_week->>'trend_delta_kg')::numeric,
        (v_week->>'soll_delta_kg')::numeric,
        (v_week->>'logtage')::integer,v_adherence,v_strength,v_side,
        v_rule.rule_key,v_rule.kcal_delta,v_rule.protein_delta_g,
        v_rule.reason,jsonb_build_object(
          'trend_delta',v_week->>'trend_delta_quelle',
          'soll_delta',v_week->>'soll_delta_quelle',
          'logtage',v_week->>'logtage_quelle',
          'adherence','goals.goal_contributions:nutrition',
          'strength','goals.goal_phase_guards_at:kraftverlust_4w',
          'three_week','goals.controlling_goal_lage_at:3_sonntage',
          'rule',v_rule.source_ref))
      ON CONFLICT(program_id,week_start) DO UPDATE SET
        week_end=EXCLUDED.week_end,phase_type=EXCLUDED.phase_type,
        trend_delta_kg=EXCLUDED.trend_delta_kg,
        soll_delta_kg=EXCLUDED.soll_delta_kg,
        log_days=EXCLUDED.log_days,adherence_pct=EXCLUDED.adherence_pct,
        strength_loss_pct=EXCLUDED.strength_loss_pct,
        three_week_side=EXCLUDED.three_week_side,
        rule_key=EXCLUDED.rule_key,kcal_delta=EXCLUDED.kcal_delta,
        protein_delta_g=EXCLUDED.protein_delta_g,reason=EXCLUDED.reason,
        source_data=EXCLUDED.source_data,calculated_at=now()
      WHERE (goals.goal_weekly_adjustments.week_end,
        goals.goal_weekly_adjustments.phase_type,
        goals.goal_weekly_adjustments.trend_delta_kg,
        goals.goal_weekly_adjustments.soll_delta_kg,
        goals.goal_weekly_adjustments.log_days,
        goals.goal_weekly_adjustments.adherence_pct,
        goals.goal_weekly_adjustments.strength_loss_pct,
        goals.goal_weekly_adjustments.three_week_side,
        goals.goal_weekly_adjustments.rule_key,
        goals.goal_weekly_adjustments.kcal_delta,
        goals.goal_weekly_adjustments.protein_delta_g,
        goals.goal_weekly_adjustments.reason,
        goals.goal_weekly_adjustments.source_data) IS DISTINCT FROM (
        EXCLUDED.week_end,EXCLUDED.phase_type,EXCLUDED.trend_delta_kg,
        EXCLUDED.soll_delta_kg,EXCLUDED.log_days,EXCLUDED.adherence_pct,
        EXCLUDED.strength_loss_pct,EXCLUDED.three_week_side,
        EXCLUDED.rule_key,EXCLUDED.kcal_delta,EXCLUDED.protein_delta_g,
        EXCLUDED.reason,EXCLUDED.source_data);
      IF FOUND THEN v_written:=v_written+1; END IF;
    END LOOP;
  END LOOP;
  PERFORM set_config('request.jwt.claim.sub',coalesce(v_claim,''),true);
  RETURN jsonb_build_object('plaene',v_accounts,'geschriebene_wochen',
    v_written,'bis',p_through);
END $$;
REVOKE ALL ON FUNCTION goals.record_weekly_adjustments(date,uuid[])
  FROM PUBLIC,anon,authenticated,postgres;
GRANT EXECUTE ON FUNCTION goals.record_weekly_adjustments(date,uuid[])
  TO service_role;

CREATE FUNCTION goals.goal_weekly_adjustments_at(p_program_id uuid)
RETURNS TABLE(week_start date,week_end date,trend_delta_kg numeric,
  soll_delta_kg numeric,log_days integer,adherence_pct numeric,
  kcal_delta integer,protein_delta_g integer,reason text,
  rule_key text,source_data jsonb)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT a.week_start,a.week_end,a.trend_delta_kg,a.soll_delta_kg,
    a.log_days,a.adherence_pct,a.kcal_delta,a.protein_delta_g,
    a.reason,a.rule_key,a.source_data
  FROM goals.goal_weekly_adjustments a
  WHERE a.program_id=p_program_id AND a.user_id=auth.uid()
  ORDER BY a.week_start DESC;
$$;
REVOKE ALL ON FUNCTION goals.goal_weekly_adjustments_at(uuid)
  FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.goal_weekly_adjustments_at(uuid)
  TO authenticated,service_role;

COMMIT;
