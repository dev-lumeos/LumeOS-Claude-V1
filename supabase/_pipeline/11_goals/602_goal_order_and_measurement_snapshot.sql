-- G-602: aktive Ziele atomar neu ordnen und den Groessen-Snapshot bei
-- Datumswechsel erneut aus dem Profil holen.
BEGIN;

CREATE OR REPLACE FUNCTION goals.ziel_reihenfolge_setzen(p_reihenfolge jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_goal_ids uuid[];
  v_priorities smallint[];
  v_item_count integer;
  v_owned_active_count integer;
  v_all_active_count integer;
  v_distinct_goal_count integer;
  v_distinct_priority_count integer;
  v_current_priorities smallint[];
  v_requested_priorities smallint[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF p_reihenfolge IS NULL
     OR jsonb_typeof(p_reihenfolge) <> 'array'
     OR jsonb_array_length(p_reihenfolge) = 0 THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Reihenfolge muss eine nichtleere Liste sein'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_reihenfolge) item
    WHERE jsonb_typeof(item) <> 'object'
       OR NOT item ? 'goal_id'
       OR NOT item ? 'priority'
       OR jsonb_typeof(item->'goal_id') <> 'string'
       OR jsonb_typeof(item->'priority') <> 'number'
       OR (item->>'priority') !~ '^-?[0-9]+$'
  ) THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Jeder Eintrag braucht goal_id und ganzzahlige priority'
      USING ERRCODE = '23514';
  END IF;

  BEGIN
    SELECT
      array_agg((item->>'goal_id')::uuid ORDER BY ordinality),
      array_agg((item->>'priority')::smallint ORDER BY ordinality),
      count(*)::integer
    INTO v_goal_ids, v_priorities, v_item_count
    FROM jsonb_array_elements(p_reihenfolge) WITH ORDINALITY AS parsed(item, ordinality);
  EXCEPTION
    WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION 'ziel_reihenfolge_setzen: goal_id oder priority hat ein ungueltiges Format'
        USING ERRCODE = '23514';
  END;

  SELECT count(DISTINCT goal_id)::integer
  INTO v_distinct_goal_count
  FROM unnest(v_goal_ids) AS goal_id;

  IF v_distinct_goal_count <> v_item_count THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: goal_ids sind nicht eindeutig'
      USING ERRCODE = '23514';
  END IF;

  SELECT count(DISTINCT priority)::integer
  INTO v_distinct_priority_count
  FROM unnest(v_priorities) AS priority;

  IF v_distinct_priority_count <> v_item_count THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Prioritaeten sind nicht eindeutig'
      USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(v_priorities) AS priority
    WHERE priority NOT BETWEEN 1 AND 3
  ) THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Prioritaeten muessen zwischen 1 und 3 liegen'
      USING ERRCODE = '23514';
  END IF;

  -- Derselbe Nutzer-Lock wie in active_goal_create verhindert, dass ein
  -- paralleler Funktionsaufruf waehrend der Umordnung einen Slot belegt.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text, 432));

  -- Sperrt die aktuelle Menge. Direkte konkurrierende Inserts bleiben
  -- zusaetzlich durch uq_user_goals_active_slot begrenzt.
  PERFORM 1
  FROM goals.user_goals ug
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active'
  FOR UPDATE;

  SELECT count(*)::integer
  INTO v_owned_active_count
  FROM goals.user_goals ug
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active'
    AND ug.id = ANY(v_goal_ids);

  IF v_owned_active_count <> v_item_count THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Ziel gehoert nicht dem Nutzer oder ist nicht aktiv'
      USING ERRCODE = '42501';
  END IF;

  SELECT array_agg(ug.priority ORDER BY ug.priority)
  INTO v_current_priorities
  FROM goals.user_goals ug
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active'
    AND ug.id = ANY(v_goal_ids);

  SELECT array_agg(priority ORDER BY priority)
  INTO v_requested_priorities
  FROM unnest(v_priorities) AS priority;

  IF v_requested_priorities IS DISTINCT FROM v_current_priorities THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Prioritaeten sind keine Umordnung der heutigen Plaetze'
      USING ERRCODE = '23514';
  END IF;

  SELECT count(*)::integer
  INTO v_all_active_count
  FROM goals.user_goals ug
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active';

  IF v_item_count <> v_all_active_count THEN
    RAISE EXCEPTION 'ziel_reihenfolge_setzen: Alle aktiven Ziele muessen genannt sein'
      USING ERRCODE = '23514';
  END IF;

  -- Alle betroffenen Zeilen verlassen den partiellen Index gemeinsam. Erst
  -- danach werden die Plaetze geschrieben und die Zeilen wieder aktiviert.
  UPDATE goals.user_goals ug
  SET status = 'on_hold'
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active'
    AND ug.id = ANY(v_goal_ids);

  UPDATE goals.user_goals ug
  SET priority = requested.priority
  FROM unnest(v_goal_ids, v_priorities) AS requested(goal_id, priority)
  WHERE ug.id = requested.goal_id
    AND ug.user_id = v_user_id
    AND ug.status = 'on_hold';

  UPDATE goals.user_goals ug
  SET status = 'active'
  WHERE ug.user_id = v_user_id
    AND ug.status = 'on_hold'
    AND ug.id = ANY(v_goal_ids);
END;
$$;

REVOKE ALL ON FUNCTION goals.ziel_reihenfolge_setzen(jsonb)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.ziel_reihenfolge_setzen(jsonb)
  TO authenticated;

COMMENT ON FUNCTION goals.ziel_reihenfolge_setzen(jsonb) IS
  'G-602: ordnet alle aktiven Ziele des angemeldeten Nutzers atomar auf ihren bestehenden Plaetzen 1-3 neu.';

CREATE OR REPLACE FUNCTION goals.fill_body_measurement_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_height numeric;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.height_cm_snapshot IS NULL THEN
      SELECT p.height_cm
      INTO v_height
      FROM public.profiles p
      WHERE p.id = NEW.user_id;

      NEW.height_cm_snapshot := v_height;
    END IF;
  ELSIF NEW.measurement_date IS DISTINCT FROM OLD.measurement_date THEN
    SELECT p.height_cm
    INTO v_height
    FROM public.profiles p
    WHERE p.id = NEW.user_id;

    NEW.height_cm_snapshot := v_height;
  ELSE
    NEW.height_cm_snapshot := OLD.height_cm_snapshot;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION goals.fill_body_measurement_snapshot() IS
  'G-602: setzt den Profil-Groessensnapshot beim Anlegen und erneut nur bei einer Aenderung des Messdatums.';

COMMIT;
