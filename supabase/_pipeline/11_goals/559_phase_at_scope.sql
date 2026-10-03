-- G-559: Eine Nutzerin kann seit G-538 mehrere gleichzeitig gueltige Phasen
-- tragen, je eine pro Ziel. Die nutzerweite und die zielbezogene Frage sind
-- deshalb zwei getrennte Funktionen.

BEGIN;

CREATE OR REPLACE FUNCTION goals.phase_am(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  phase_id uuid,
  user_id uuid,
  goal_id uuid,
  phase_type text,
  variant text,
  parameters jsonb,
  gueltig_ab date,
  projected_end_date date,
  actual_end_date date,
  transitioned_from text,
  recommended_next text,
  transition_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT gp.id, gp.user_id, gp.goal_id, gp.phase_type, gp.variant, gp.parameters,
         gp.gueltig_ab, gp.projected_end_date, gp.actual_end_date,
         gp.transitioned_from, gp.recommended_next, gp.transition_reason,
         gp.created_at, gp.updated_at
  FROM goals.goal_phases gp
  WHERE gp.user_id = p_user_id
    AND gp.gueltig_ab <= p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
  ORDER BY gp.gueltig_ab DESC, gp.created_at DESC, gp.id DESC;
$$;

COMMENT ON FUNCTION goals.phase_am(uuid, date) IS
  'G-559: alle am lokalen Stichtag gueltigen Phasen eines Nutzers, geordnet nach gueltig_ab, created_at und id jeweils absteigend.';

REVOKE ALL ON FUNCTION goals.phase_am(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.phase_am(uuid, date)
  TO authenticated, service_role;

DROP FUNCTION IF EXISTS goals.phase_eines_ziels_am(uuid, date);
CREATE FUNCTION goals.phase_eines_ziels_am(
  p_goal_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  phase_id uuid,
  user_id uuid,
  goal_id uuid,
  phase_type text,
  variant text,
  parameters jsonb,
  gueltig_ab date,
  projected_end_date date,
  actual_end_date date,
  transitioned_from text,
  recommended_next text,
  transition_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT gp.id, gp.user_id, gp.goal_id, gp.phase_type, gp.variant, gp.parameters,
         gp.gueltig_ab, gp.projected_end_date, gp.actual_end_date,
         gp.transitioned_from, gp.recommended_next, gp.transition_reason,
         gp.created_at, gp.updated_at
  FROM goals.goal_phases gp
  WHERE gp.goal_id = p_goal_id
    AND gp.gueltig_ab <= p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
  ORDER BY gp.gueltig_ab DESC, gp.created_at DESC, gp.id DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.phase_eines_ziels_am(uuid, date) IS
  'G-559: die am lokalen Stichtag gueltige Phase genau eines Ziels. LIMIT 1 loest nur ueberlappende Historie auf; die Reihenfolge ist gueltig_ab, created_at und id jeweils absteigend.';

REVOKE ALL ON FUNCTION goals.phase_eines_ziels_am(uuid, date)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.phase_eines_ziels_am(uuid, date)
  TO authenticated, service_role;

-- Der Zielwert-Schreibweg wird im unmittelbar folgenden Kettenschritt 563
-- zielbezogen definiert. Zwischen 559 und 563 liegt kein weiterer Schritt
-- und damit kein Schreiber auf goals.nutrition_targets.

COMMIT;
