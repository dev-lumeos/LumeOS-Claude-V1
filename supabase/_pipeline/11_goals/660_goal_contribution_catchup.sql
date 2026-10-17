-- G-660: Fortschritt je Konto und wiederholbarer Nachhol-Lauf.
-- Der Bereichsschreiber aus G-522 bleibt fachlich gleich; bei identischen
-- Inhalten unterbleibt sein UPDATE, damit auch updated_at stabil bleibt.
BEGIN;

CREATE TABLE goals.goal_contribution_run_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  successful_through date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE goals.goal_contribution_run_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON goals.goal_contribution_run_state FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON goals.goal_contribution_run_state TO service_role;
CREATE POLICY goal_contribution_run_state_service
  ON goals.goal_contribution_run_state FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION goals.refresh_goal_contributions(
  p_von date,p_bis date,p_stichtag date DEFAULT CURRENT_DATE,
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path='' AS $$
DECLARE v_rows integer;
BEGIN
  IF current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'G522_BLOCK:nur_dienst' USING ERRCODE='42501';
  END IF;
  IF p_von IS NULL OR p_bis IS NULL OR p_stichtag IS NULL
    OR p_von>p_bis THEN
    RAISE EXCEPTION 'G522_BLOCK:ungueltiger_zeitraum' USING ERRCODE='22007';
  END IF;

  WITH tage AS (
    SELECT d::date AS tag FROM generate_series(p_von::timestamp,
      least(p_bis,p_stichtag,CURRENT_DATE)::timestamp,
      interval '1 day') d
  ), aktive_ziele AS (
    SELECT g.id AS goal_id,g.user_id,t.tag
    FROM goals.user_goals g CROSS JOIN tage t
    JOIN LATERAL goals.goal_state_at(g.id,t.tag) s ON s.state='active'
    WHERE g.status='active' AND g.gueltig_ab<=t.tag
      AND (p_user_id IS NULL OR g.user_id=p_user_id)
  ), nutzer_tage AS (
    SELECT DISTINCT user_id,tag FROM aktive_ziele
  ), quellen AS (
    SELECT nt.user_id,nt.tag,
      ds.item_count,ds.enercc,ds.enercc_missing,z.kcal AS kcal_ziel,
      tr.ziel_anzahl,tr.ziel_woche,tr.einheiten,
      rec.score AS recovery_score,rec.sleep_hours_used,
      sup.compliance_pct,sup.total_taken,sup.total_logged
    FROM nutzer_tage nt
    LEFT JOIN nutrition.daily_summary ds
      ON ds.user_id=nt.user_id AND ds.entry_date=nt.tag
    LEFT JOIN LATERAL (
      SELECT b.kcal FROM goals.berechne_zielwerte(nt.user_id,nt.tag) b
      LIMIT 1
    ) z ON true
    LEFT JOIN LATERAL (
      SELECT count(*)::integer AS ziel_anzahl,
        max(g.target_value) AS ziel_woche,
        (SELECT count(*)::integer FROM training.workout_sessions ws
          WHERE ws.user_id=nt.user_id AND ws.status='completed'
            AND ws.session_date BETWEEN date_trunc('week',nt.tag)::date
              AND nt.tag) AS einheiten
      FROM goals.user_goals g
      WHERE g.user_id=nt.user_id AND g.status='active'
        AND g.measurement_type='training_sessions_week'
        AND g.gueltig_ab<=nt.tag
        AND (g.target_date IS NULL OR g.target_date>=nt.tag)
    ) tr ON true
    LEFT JOIN recovery.scores rec ON rec.user_id=nt.user_id
      AND rec.entry_date=nt.tag
    LEFT JOIN supplements.daily_intake_summary sup
      ON sup.user_id=nt.user_id AND sup.intake_date=nt.tag
  )
  INSERT INTO goals.goal_contributions(
    goal_id,user_id,contribution_date,module,contribution_score,
    missing_reason,details)
  SELECT a.goal_id,a.user_id,a.tag,v.module,v.score,v.reason,v.details
  FROM aktive_ziele a JOIN quellen q USING (user_id,tag)
  CROSS JOIN LATERAL (VALUES
    ('nutrition'::text,
      CASE WHEN q.item_count>0 AND q.enercc_missing=0
        AND q.enercc IS NOT NULL AND q.kcal_ziel>0
        THEN round(greatest(0::numeric,
          1-abs(q.enercc-q.kcal_ziel)/q.kcal_ziel)*100,2) END,
      CASE WHEN coalesce(q.item_count,0)=0 THEN 'kein_kalorienlog'
        WHEN q.enercc_missing<>0 OR q.enercc IS NULL
          THEN 'kalorienlog_unvollstaendig'
        WHEN q.kcal_ziel IS NULL OR q.kcal_ziel<=0
          THEN 'kein_kalorienziel' END,
      jsonb_build_object('writer','G-522','metric','kcal_treue',
        'calories',q.enercc,'target_kcal',q.kcal_ziel,
        'item_count',q.item_count,'source',
        'nutrition.daily_summary+goals.berechne_zielwerte')),
    ('training'::text,
      CASE WHEN q.ziel_anzahl=1 AND q.ziel_woche>0
        THEN round(least(1::numeric,q.einheiten/q.ziel_woche)*100,2)
        END,
      CASE WHEN q.ziel_anzahl=0 THEN 'kein_wochenziel'
        WHEN q.ziel_anzahl>1 THEN 'wochenziel_nicht_eindeutig'
        WHEN q.ziel_woche IS NULL OR q.ziel_woche<=0
          THEN 'wochenziel_ungueltig' END,
      jsonb_build_object('writer','G-522','metric','wochenquote',
        'sessions_week',q.einheiten,
        'weekly_target',q.ziel_woche,
        'week_start',date_trunc('week',a.tag)::date,
        'source','training.workout_sessions+goals.user_goals')),
    ('recovery'::text,q.recovery_score::numeric,
      CASE WHEN q.recovery_score IS NULL THEN 'kein_recovery_score' END,
      jsonb_build_object('writer','G-522','metric','recovery_score',
        'recovery_score',q.recovery_score,
        'sleep_hours_used',q.sleep_hours_used,
        'source','recovery.scores')),
    ('supplements'::text,q.compliance_pct::numeric,
      CASE WHEN q.compliance_pct IS NULL THEN
        'keine_entschiedene_einnahme' END,
      jsonb_build_object('writer','G-522','metric','einnahme_treue',
        'compliance_score',q.compliance_pct,
        'items_taken',q.total_taken,'items_logged',q.total_logged,
        'source','supplements.daily_intake_summary'))
  ) v(module,score,reason,details)
  ON CONFLICT (goal_id,module,contribution_date) DO UPDATE SET
    contribution_score=EXCLUDED.contribution_score,
    missing_reason=EXCLUDED.missing_reason,
    details=EXCLUDED.details,
    updated_at=now()
  WHERE goals.goal_contributions.details->>'writer'='G-522'
    AND (goals.goal_contributions.contribution_score,
      goals.goal_contributions.missing_reason,
      goals.goal_contributions.details) IS DISTINCT FROM
      (EXCLUDED.contribution_score,EXCLUDED.missing_reason,EXCLUDED.details);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN jsonb_build_object('von',p_von,'bis',p_bis,
    'user_id',p_user_id,
    'stichtag',p_stichtag,'geschriebene_zeilen',v_rows);
END $$;

REVOKE ALL ON FUNCTION goals.refresh_goal_contributions(date,date,date,uuid)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION goals.refresh_goal_contributions(date,date,date,uuid)
  TO service_role;
COMMENT ON FUNCTION goals.refresh_goal_contributions(date,date,date,uuid) IS
  'G-660: G-522-Bereichsrechnung; identische Inhalte bleiben unveraendert.';

CREATE FUNCTION goals.run_goal_contribution_catchup(
  p_through date DEFAULT (now() AT TIME ZONE 'Asia/Bangkok')::date - 1,
  p_user_ids uuid[] DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY INVOKER
SET search_path='' AS $$
DECLARE
  v_account record;
  v_last date;
  v_from date;
  v_result jsonb;
  v_accounts integer := 0;
  v_changed integer := 0;
  v_details jsonb := '[]'::jsonb;
  v_yesterday date := (now() AT TIME ZONE 'Asia/Bangkok')::date - 1;
BEGIN
  IF current_user <> 'service_role' THEN
    RAISE EXCEPTION 'G660_BLOCK:nur_service_role' USING ERRCODE='42501';
  END IF;
  IF p_through IS NULL OR p_through > v_yesterday THEN
    RAISE EXCEPTION 'G660_BLOCK:nur_abgeschlossene_tage' USING ERRCODE='22007';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('goals.run_goal_contribution_catchup'));

  FOR v_account IN
    SELECT u.id AS user_id,min(g.gueltig_ab) AS first_goal
    FROM public.profiles u LEFT JOIN goals.user_goals g ON g.user_id=u.id
    WHERE p_user_ids IS NULL OR u.id=ANY(p_user_ids)
    GROUP BY u.id ORDER BY u.id
  LOOP
    v_last := NULL;
    SELECT successful_through INTO v_last
    FROM goals.goal_contribution_run_state
    WHERE user_id=v_account.user_id FOR UPDATE;
    IF v_last > p_through THEN CONTINUE; END IF;

    -- Drei Kalendertage einschliesslich des letzten Erfolgstags werden
    -- erneut gelesen. Das erfasst spaete Eintraege ohne Doppelzeilen.
    v_from := CASE WHEN v_account.first_goal IS NULL THEN p_through+1
      ELSE greatest(v_account.first_goal,
        coalesce(v_last-2,v_account.first_goal)) END;
    v_result := NULL;
    IF v_from <= p_through THEN
      v_result := goals.refresh_goal_contributions(
        v_from,p_through,p_through,v_account.user_id);
      v_changed := v_changed
        + (v_result->>'geschriebene_zeilen')::integer;
    END IF;

    INSERT INTO goals.goal_contribution_run_state
      (user_id,successful_through)
    VALUES (v_account.user_id,p_through)
    ON CONFLICT (user_id) DO UPDATE SET
      successful_through=EXCLUDED.successful_through,
      completed_at=now()
    WHERE goals.goal_contribution_run_state.successful_through
      < EXCLUDED.successful_through;

    v_accounts := v_accounts+1;
    v_details := v_details || jsonb_build_array(jsonb_build_object(
      'user_id',v_account.user_id,'von',v_from,'bis',p_through,
      'geschriebene_zeilen',
        coalesce((v_result->>'geschriebene_zeilen')::integer,0)));
  END LOOP;
  RETURN jsonb_build_object('bis',p_through,'konten',v_accounts,
    'geschriebene_zeilen',v_changed,'details',v_details);
END $$;

REVOKE ALL ON FUNCTION goals.run_goal_contribution_catchup(date,uuid[])
  FROM PUBLIC,anon,authenticated,postgres;
GRANT EXECUTE ON FUNCTION goals.run_goal_contribution_catchup(date,uuid[])
  TO service_role;
COMMENT ON FUNCTION goals.run_goal_contribution_catchup(date,uuid[]) IS
  'G-660: alle Konten bis gestern nachholen; drei Tage Ueberlappung, nur service_role.';

COMMIT;
