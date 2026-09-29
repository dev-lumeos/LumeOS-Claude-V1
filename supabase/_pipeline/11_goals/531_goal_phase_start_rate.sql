-- G-531: Phase und Zielrate werden in einem atomaren Schreibweg angelegt.
-- Die fachlichen Vorzeichen- und Nullregeln bleiben ausschliesslich im
-- Tabellen-CHECK goal_phases_zielrate_passt_zur_art.

BEGIN;

DROP FUNCTION IF EXISTS goals.goal_phase_start(
  text, date, uuid, date, text, jsonb
);

CREATE OR REPLACE FUNCTION goals.goal_phase_start(
  p_phase_type text,
  p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_goal_id uuid DEFAULT NULL,
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
    WHERE gp.user_id = v_user_id
      AND gp.actual_end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'goal_phase_start: zuerst die laufende Phase beenden'
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

CREATE OR REPLACE FUNCTION goals.goal_phase_end(
  p_phase_id uuid,
  p_transition_reason text,
  p_actual_end_date date DEFAULT CURRENT_DATE
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
    RAISE EXCEPTION 'goal_phase_end: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(btrim(p_transition_reason), '') IS NULL THEN
    RAISE EXCEPTION 'goal_phase_end: Ein Uebergangsgrund ist erforderlich'
      USING ERRCODE = '22023';
  END IF;

  UPDATE goals.goal_phases gp
  SET actual_end_date = p_actual_end_date,
      transition_reason = btrim(p_transition_reason)
  WHERE gp.id = p_phase_id
    AND gp.user_id = v_user_id
    AND gp.actual_end_date IS NULL
    AND p_actual_end_date >= gp.gueltig_ab
  RETURNING gp.id INTO v_phase_id;

  IF v_phase_id IS NULL THEN
    RAISE EXCEPTION 'goal_phase_end: laufende eigene Phase nicht gefunden oder Enddatum liegt vor Beginn'
      USING ERRCODE = 'P0002';
  END IF;

  RETURN v_phase_id;
END;
$$;

CREATE OR REPLACE FUNCTION goals.phase_transition_respond(
  p_phase_id uuid,
  p_response text,
  p_reason text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'phase_transition_respond: Anmeldung erforderlich';
  END IF;

  INSERT INTO goals.phase_transition_responses (
    phase_id,
    user_id,
    response,
    reason
  )
  SELECT
    gp.id,
    v_user_id,
    p_response,
    NULLIF(btrim(p_reason), '')
  FROM goals.goal_phases gp
  WHERE gp.id = p_phase_id
    AND gp.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'phase_transition_respond: eigene Phase nicht gefunden';
  END IF;

  RETURN p_response;
END;
$$;

COMMENT ON FUNCTION goals.goal_phase_start(
  text, date, uuid, date, text, jsonb, numeric
) IS
  'G-531: beginnt die eine laufende Goal-Phase des angemeldeten Nutzers und schreibt ihre optionale Zielrate atomar; der Tabellen-CHECK ist fachliche SSOT.';
COMMENT ON FUNCTION goals.goal_phase_end(uuid, text, date) IS
  'G-531: beendet eine eigene laufende Goal-Phase; die Sitzung stammt einheitlich aus auth.uid().';
COMMENT ON FUNCTION goals.phase_transition_respond(uuid, text, text) IS
  'G-531: beantwortet einen Phasenuebergang fuer die eigene Phase; die Sitzung stammt einheitlich aus auth.uid().';

REVOKE ALL ON FUNCTION goals.goal_phase_start(
  text, date, uuid, date, text, jsonb, numeric
) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.goal_phase_end(uuid, text, date)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.phase_transition_respond(uuid, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.goal_phase_start(
  text, date, uuid, date, text, jsonb, numeric
) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.goal_phase_end(uuid, text, date)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.phase_transition_respond(uuid, text, text)
  TO authenticated, service_role;

COMMIT;
