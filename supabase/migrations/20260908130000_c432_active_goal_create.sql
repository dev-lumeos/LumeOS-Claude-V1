-- C-432: Ein aktives Ziel bekommt seinen freien Rang innerhalb einer
-- Transaktion. priority ist kein fachlicher Standardwert: der Schreibweg
-- bestimmt aus den drei aktiven Slots den niedrigsten freien.
BEGIN;

ALTER TABLE goals.user_goals
  ALTER COLUMN priority DROP DEFAULT;

CREATE OR REPLACE FUNCTION goals.active_goal_create(
  p_goal_type text,
  p_title text,
  p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_subtype text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_target_value numeric DEFAULT NULL,
  p_target_unit text DEFAULT NULL,
  p_target_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_slot smallint;
  v_active_goals jsonb;
  v_goal goals.user_goals%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'active_goal_create: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;
  IF NULLIF(btrim(p_title), '') IS NULL THEN
    RAISE EXCEPTION 'active_goal_create: Titel ist erforderlich'
      USING ERRCODE = '22023';
  END IF;
  IF p_gueltig_ab IS NULL THEN
    RAISE EXCEPTION 'active_goal_create: gueltig_ab ist erforderlich'
      USING ERRCODE = '22023';
  END IF;

  -- Ein Lock pro Nutzer schliesst auch den leeren Anfangsfall: ohne ihn
  -- koennten zwei Transaktionen gleichzeitig Platz 1 sehen. Die Funktion
  -- bleibt SECURITY INVOKER; RLS auf user_goals gilt unveraendert.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_user_id::text, 432));

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', ug.id,
        'title', ug.title,
        'priority', ug.priority,
        'is_primary', ug.is_primary
      ) ORDER BY ug.priority
    ),
    '[]'::jsonb
  )
  INTO v_active_goals
  FROM goals.user_goals ug
  WHERE ug.user_id = v_user_id
    AND ug.status = 'active';

  SELECT slot::smallint
  INTO v_slot
  FROM generate_series(1, 3) AS slot
  WHERE NOT EXISTS (
    SELECT 1
    FROM goals.user_goals ug
    WHERE ug.user_id = v_user_id
      AND ug.status = 'active'
      AND ug.priority = slot
  )
  ORDER BY slot
  LIMIT 1;

  IF v_slot IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'ACTIVE_SLOTS_FULL',
      'message', 'Drei aktive Ziele belegen die Plaetze 1-3. Waehle ein Ziel zum Pausieren, Abschliessen oder Umpriorisieren.',
      'active_goals', v_active_goals
    );
  END IF;

  INSERT INTO goals.user_goals (
    user_id, goal_type, subtype, title, description,
    target_value, target_unit, gueltig_ab, target_date,
    status, priority
  ) VALUES (
    v_user_id, p_goal_type, p_subtype, btrim(p_title), p_description,
    p_target_value, p_target_unit, p_gueltig_ab, p_target_date,
    'active', v_slot
  )
  RETURNING * INTO v_goal;

  RETURN jsonb_build_object(
    'ok', true,
    'goal', jsonb_build_object(
      'id', v_goal.id,
      'title', v_goal.title,
      'priority', v_goal.priority,
      'is_primary', v_goal.is_primary
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION goals.active_goal_create(text, text, date, text, text, numeric, text, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.active_goal_create(text, text, date, text, text, numeric, text, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.active_goal_create(text, text, date, text, text, numeric, text, date) IS
  'C-432: Erstellt fuer den angemeldeten Nutzer ein aktives Ziel im niedrigsten freien Slot 1-3. Bei Vollbelegung liefert sie die drei Ziele fuer eine Nutzerentscheidung; priority wird nicht vom Aufrufer gesetzt.';

COMMIT;
