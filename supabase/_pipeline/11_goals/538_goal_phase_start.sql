-- G-538: Eine Phase wird fuer ein konkretes Ziel gestartet. Das Ziel ist ein
-- Pflichtargument; parallel laufende Phasen sind fuer verschiedene Ziele erlaubt.

BEGIN;

DROP FUNCTION goals.goal_phase_start(
  text, date, uuid, date, text, jsonb, numeric
);

DROP FUNCTION IF EXISTS goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric
);

CREATE FUNCTION goals.goal_phase_start(
  p_phase_type text,
  p_goal_id uuid,
  p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_projected_end_date date DEFAULT NULL,
  p_variant text DEFAULT NULL,
  p_parameters jsonb DEFAULT '{}'::jsonb,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_phase_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'goal_phase_start: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF p_parameters IS NULL OR jsonb_typeof(p_parameters) <> 'object' THEN
    RAISE EXCEPTION 'goal_phase_start: parameters muss ein JSON-Objekt sein'
      USING ERRCODE = '22023';
  END IF;

  IF p_goal_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM goals.user_goals ug
    WHERE ug.id = p_goal_id
      AND ug.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'goal_phase_start: Ziel gehoert nicht dem angemeldeten Nutzer'
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_phases gp
    WHERE gp.goal_id = p_goal_id
      AND gp.actual_end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'goal_phase_start: fuer dieses Ziel laeuft bereits eine Phase'
      USING ERRCODE = '23505';
  END IF;

  INSERT INTO goals.goal_phases (
    user_id,
    goal_id,
    phase_type,
    gueltig_ab,
    projected_end_date,
    variant,
    parameters,
    zielrate_pct_kg_woche
  ) VALUES (
    v_user_id,
    p_goal_id,
    p_phase_type,
    p_gueltig_ab,
    p_projected_end_date,
    p_variant,
    p_parameters,
    p_zielrate_pct_kg_woche
  )
  RETURNING id INTO v_phase_id;

  RETURN v_phase_id;
END;
$$;

COMMENT ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric
) IS
  'G-538: startet eine Zielterminierung. Das Ziel ist Pflicht; je Ziel darf genau eine Phase offen sein.';

REVOKE ALL ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric
) TO authenticated, service_role;

COMMIT;
