-- G-558: Der atomare Phasenstart nimmt die Strategie entgegen. Ohne
-- persoenliche Zielrate wird die Rate der Strategie in die Phaseninstanz
-- uebernommen; eine ausdrueckliche Zielrate bleibt der persoenliche Override.

BEGIN;

DROP FUNCTION IF EXISTS goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric
);

DROP FUNCTION IF EXISTS goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric, text
);

CREATE FUNCTION goals.goal_phase_start(
  p_phase_type text,
  p_goal_id uuid,
  p_gueltig_ab date DEFAULT CURRENT_DATE,
  p_projected_end_date date DEFAULT NULL,
  p_variant text DEFAULT NULL,
  p_parameters jsonb DEFAULT '{}'::jsonb,
  p_zielrate_pct_kg_woche numeric DEFAULT NULL,
  p_strategie_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_phase_id uuid;
  v_zielrate_pct_kg_woche numeric := p_zielrate_pct_kg_woche;
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

  IF v_zielrate_pct_kg_woche IS NULL AND p_strategie_code IS NOT NULL THEN
    SELECT gs.weight_change_target_percent
    INTO v_zielrate_pct_kg_woche
    FROM goals.goal_strategies gs
    WHERE gs.code = p_strategie_code;
  END IF;

  INSERT INTO goals.goal_phases (
    user_id,
    goal_id,
    phase_type,
    gueltig_ab,
    projected_end_date,
    variant,
    parameters,
    zielrate_pct_kg_woche,
    strategie_code
  ) VALUES (
    v_user_id,
    p_goal_id,
    p_phase_type,
    p_gueltig_ab,
    p_projected_end_date,
    p_variant,
    p_parameters,
    v_zielrate_pct_kg_woche,
    p_strategie_code
  )
  RETURNING id INTO v_phase_id;

  RETURN v_phase_id;
END;
$$;

COMMENT ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric, text
) IS
  'G-558: startet eine Strategie fuer ein Nutzerziel. Eine ausdrueckliche Zielrate ueberschreibt die Katalograte.';

REVOKE ALL ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric, text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.goal_phase_start(
  text, uuid, date, date, text, jsonb, numeric, text
) TO authenticated, service_role;

COMMIT;
