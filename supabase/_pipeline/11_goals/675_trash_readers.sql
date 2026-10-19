-- G-675: explicit filters for service calls and for plan-free maintenance.
BEGIN;
CREATE FUNCTION goals.g675_trashed_active_plan(p_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT p.id FROM goals.goal_programs p
  JOIN goals.user_goals g ON g.id=p.goal_id
  WHERE p.user_id=p_user_id AND g.status='active'
    AND g.deleted_at IS NULL AND p.deleted_previous_status='aktiv'
    AND p.deleted_at IS NOT NULL
    AND (auth.uid()=p_user_id
      OR current_setting('role',true)='service_role')
  ORDER BY p.deleted_at DESC,p.id DESC LIMIT 1;
$$;
REVOKE ALL ON FUNCTION goals.g675_trashed_active_plan(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g675_trashed_active_plan(uuid)
  TO authenticated,service_role;

CREATE FUNCTION goals.g675_patch_reader(p_signature text,p_old text,p_new text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef(to_regprocedure(p_signature)) INTO v_def;
  IF v_def IS NULL OR strpos(v_def,p_old)=0 THEN
    RAISE EXCEPTION 'G675_SCHEMA: reader changed: %',p_signature;
  END IF;
  EXECUTE replace(v_def,p_old,p_new);
END $$;

SELECT goals.g675_patch_reader('goals.goal_state_at(uuid,date)',
  'WHERE g.id=p_goal_id AND g.gueltig_ab<=p_stichtag;',
  'WHERE g.id=p_goal_id AND g.gueltig_ab<=p_stichtag AND g.deleted_at IS NULL;');
SELECT goals.g675_patch_reader('goals.goal_list_at(uuid,date)',
  'WHERE g.user_id=p_user_id AND g.archived_at IS NULL',
  'WHERE g.user_id=p_user_id AND g.archived_at IS NULL AND g.deleted_at IS NULL');
SELECT goals.g675_patch_reader('goals.phase_am(uuid,date)',
  'AND g.status=''active'' AND g.archived_at IS NULL',
  'AND g.status=''active'' AND g.archived_at IS NULL AND g.deleted_at IS NULL');
SELECT goals.g675_patch_reader('goals.phase_am(uuid,date)',
  'WHERE gp.user_id=p_user_id AND gp.gueltig_ab<=p_stichtag',
  'WHERE gp.user_id=p_user_id AND gp.gueltig_ab<=p_stichtag
    AND EXISTS (SELECT 1 FROM goals.goal_program_positions pos
      JOIN goals.goal_programs plan ON plan.id=pos.program_id
      WHERE pos.goal_phase_id=gp.id AND plan.status=''aktiv''
        AND plan.deleted_at IS NULL)');
SELECT goals.g675_patch_reader('goals.ziel_ohne_laufende_phase_am(uuid,date)',
  'AND g.status=''active'' AND g.archived_at IS NULL',
  'AND g.status=''active'' AND g.archived_at IS NULL AND g.deleted_at IS NULL');
SELECT goals.g675_patch_reader('goals.berechne_zielwerte(uuid,date)',
  ') frozen ON true;',
  ') frozen ON true
  LEFT JOIN LATERAL (
    SELECT goals.g675_trashed_active_plan(p_user_id) AS id
  ) trashed ON true;');
SELECT goals.g675_patch_reader('goals.berechne_zielwerte(uuid,date)',
  'CASE WHEN frozen.id IS NOT NULL AND b.hindernis=''kein_aktives_ziel''',
  'CASE WHEN trashed.id IS NOT NULL AND b.hindernis=''ziel_ohne_laufende_phase''
      THEN ''plan_im_papierkorb''
      WHEN frozen.id IS NOT NULL AND b.hindernis=''kein_aktives_ziel''');
SELECT goals.g675_patch_reader('goals.goal_progress_at(uuid,date)',
  'JOIN goals.user_goals g ON g.id=p.goal_id;',
  'JOIN goals.user_goals g ON g.id=p.goal_id AND g.deleted_at IS NULL;');
SELECT goals.g675_patch_reader('goals.measurement_points(uuid,date)',
  'WITH g AS (SELECT * FROM goals.user_goals WHERE id = p_goal_id)',
  'WITH g AS (SELECT * FROM goals.user_goals
    WHERE id = p_goal_id AND deleted_at IS NULL)');
SELECT goals.g675_patch_reader('goals.goal_weekly_adjustments_at(uuid)',
  'FROM goals.goal_weekly_adjustments a
  WHERE a.program_id=p_program_id AND a.user_id=auth.uid()',
  'FROM goals.goal_weekly_adjustments a
  JOIN goals.goal_programs p ON p.id=a.program_id
  JOIN goals.user_goals g ON g.id=p.goal_id
  WHERE a.program_id=p_program_id AND a.user_id=auth.uid()
    AND p.deleted_at IS NULL AND g.deleted_at IS NULL');
SELECT goals.g675_patch_reader('goals.controlling_goal_outlook(uuid,date)',
  'WHERE g.id=p_goal_id AND g.goal_role=''controlling''',
  'WHERE g.id=p_goal_id AND g.deleted_at IS NULL
      AND g.goal_role=''controlling''');
SELECT goals.g675_patch_reader(
  'goals.refresh_goal_contributions(date,date,date,uuid)',
  'WHERE g.status=''active'' AND g.gueltig_ab<=t.tag',
  'WHERE g.status=''active'' AND g.deleted_at IS NULL
      AND g.gueltig_ab<=t.tag');
SELECT goals.g675_patch_reader(
  'goals.refresh_goal_contributions(date,date,date,uuid)',
  'WHERE g.user_id=nt.user_id AND g.status=''active''',
  'WHERE g.user_id=nt.user_id AND g.deleted_at IS NULL
        AND g.status=''active''');

-- Security-definer lifecycle functions must not act on a trashed goal.
SELECT goals.g675_patch_reader('goals.goal_archive(uuid)',
  'WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;',
  'WHERE id=p_goal_id AND user_id=auth.uid()
    AND deleted_at IS NULL FOR UPDATE;');
SELECT goals.g675_patch_reader('goals.goal_restart(uuid,date,date)',
  'WHERE id=p_goal_id AND user_id=auth.uid() FOR UPDATE;',
  'WHERE id=p_goal_id AND user_id=auth.uid()
    AND deleted_at IS NULL FOR UPDATE;');
SELECT goals.g675_patch_reader(
  'nutrition.daily_reference_assessment_g611_basis(uuid,date)',
  'CASE WHEN a.nutrient_code IN (''F18:2CN6'',''F18:3CN3'')',
  'CASE WHEN a.nutrient_code IN (''F18:2CN6'',''F18:3CN3'')
      AND a.reference_kind=''AI''
      AND goals.g675_trashed_active_plan(p_user_id) IS NOT NULL
      THEN ''maintenance_plan_in_trash''
      WHEN a.nutrient_code IN (''F18:2CN6'',''F18:3CN3'')');

DROP FUNCTION goals.g675_patch_reader(text,text,text);
COMMIT;
