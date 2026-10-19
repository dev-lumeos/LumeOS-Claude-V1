-- G-675: extension point for G-679. The gate enumerates every trash root
-- and every registered externally visible reader, including service runs.
BEGIN;
CREATE TABLE goals.trash_contract_tables (
  root_table regclass PRIMARY KEY,
  select_policy name NOT NULL,
  registered_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE goals.trash_contract_readers (
  reader regprocedure PRIMARY KEY,
  required_token text NOT NULL,
  registered_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON goals.trash_contract_tables,goals.trash_contract_readers
  FROM PUBLIC,anon,authenticated;
GRANT SELECT ON goals.trash_contract_tables,goals.trash_contract_readers
  TO service_role;
INSERT INTO goals.trash_contract_tables(root_table,select_policy) VALUES
  ('goals.user_goals','g675_user_goals_visible'),
  ('goals.goal_programs','g675_goal_programs_visible'),
  ('goals.goal_program_events','g675_goal_program_events_visible');
INSERT INTO goals.trash_contract_readers(reader,required_token) VALUES
  ('goals.goal_state_at(uuid,date)','deleted_at IS NULL'),
  ('goals.goal_list_at(uuid,date)','deleted_at IS NULL'),
  ('goals.phase_am(uuid,date)','plan.deleted_at IS NULL'),
  ('goals.berechne_zielwerte(uuid,date)','plan_im_papierkorb'),
  ('goals.goal_progress_at(uuid,date)','g.deleted_at IS NULL'),
  ('goals.measurement_points(uuid,date)','deleted_at IS NULL'),
  ('goals.goal_weekly_adjustments_at(uuid)','p.deleted_at IS NULL'),
  ('goals.controlling_goal_outlook(uuid,date)','g.deleted_at IS NULL'),
  ('goals.refresh_goal_contributions(date,date,date,uuid)','g.deleted_at IS NULL'),
  ('goals.goal_archive(uuid)','deleted_at IS NULL'),
  ('goals.goal_restart(uuid,date,date)','deleted_at IS NULL');
INSERT INTO goals.trash_contract_readers(reader,required_token) VALUES
  ('goals.g675_phase_visible(uuid)','g.deleted_at IS NULL'),
  ('goals.g675_trashed_active_plan(uuid)','p.deleted_at IS NOT NULL'),
  ('nutrition.daily_reference_assessment_g611_basis(uuid,date)',
    'maintenance_plan_in_trash'),
  ('goals.goal_trash_list()','deleted_at IS NOT NULL');

CREATE FUNCTION goals.trash_contract_check()
RETURNS TABLE(object_name text,problem text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE v_table goals.trash_contract_tables%ROWTYPE;
  v_reader goals.trash_contract_readers%ROWTYPE;
  v_name text;
BEGIN
  FOR v_table IN SELECT * FROM goals.trash_contract_tables LOOP
    v_name:=v_table.root_table::text;
    IF NOT EXISTS (SELECT 1 FROM pg_class c
      WHERE c.oid=v_table.root_table AND c.relrowsecurity) THEN
      object_name:=v_name;problem:='RLS fehlt';RETURN NEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute a
      WHERE a.attrelid=v_table.root_table AND a.attname='deleted_at'
        AND NOT a.attisdropped) THEN
      object_name:=v_name;problem:='deleted_at fehlt';RETURN NEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute a
      WHERE a.attrelid=v_table.root_table AND a.attname='deleted_by'
        AND NOT a.attisdropped) THEN
      object_name:=v_name;problem:='deleted_by fehlt';RETURN NEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_attribute a
      WHERE a.attrelid=v_table.root_table AND a.attname='deleted_previous_status'
        AND NOT a.attisdropped) THEN
      object_name:=v_name;problem:='voriger Status fehlt';RETURN NEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy p
      WHERE p.polrelid=v_table.root_table AND p.polname=v_table.select_policy
        AND NOT p.polpermissive AND p.polcmd='r'
        AND pg_get_expr(p.polqual,p.polrelid) LIKE '%deleted_at IS NULL%') THEN
      object_name:=v_name;problem:='restriktive SELECT-Policy fehlt';RETURN NEXT;
    END IF;
  END LOOP;
  FOR v_reader IN SELECT * FROM goals.trash_contract_readers LOOP
    IF strpos(pg_get_functiondef(v_reader.reader::oid),
        v_reader.required_token)=0 THEN
      object_name:=v_reader.reader::text;
      problem:='Löschfilter im Leser fehlt';RETURN NEXT;
    END IF;
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION goals.trash_contract_check() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.trash_contract_check() TO service_role;
COMMIT;
