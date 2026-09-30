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

-- Der Zielwert-Schreibweg besitzt noch keinen goal_id-Vertrag. Solange er
-- keinen eindeutigen Zielbezug bekommt, darf er bei mehreren Phasen nicht
-- still die erste Zeile nehmen.
CREATE OR REPLACE FUNCTION goals.nutrition_target_assign_phase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_phase_id uuid;
  v_phase_count integer;
  v_target record;
BEGIN
  SELECT max(p.phase_id::text)::uuid, count(*)::integer
  INTO v_phase_id, v_phase_count
  FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p;

  IF v_phase_count = 0 THEN
    RAISE EXCEPTION 'nutrition_targets: keine aktive Phase am Gueltigkeitstag'
      USING ERRCODE = '23514';
  END IF;

  IF v_phase_count > 1 THEN
    RAISE EXCEPTION
      'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.phase_id IS NOT NULL AND NEW.phase_id <> v_phase_id THEN
    RAISE EXCEPTION 'nutrition_targets: phase_id ist am Gueltigkeitstag nicht die aktive Phase'
      USING ERRCODE = '23514';
  END IF;
  NEW.phase_id := v_phase_id;

  IF NEW.herkunft = 'formel' THEN
    SELECT * INTO STRICT v_target
    FROM goals.berechne_zielwerte(NEW.user_id, NEW.gueltig_ab);

    IF v_target.hindernis IS NOT NULL THEN
      RAISE EXCEPTION 'nutrition_targets: %', v_target.hindernis
        USING ERRCODE = '23514';
    END IF;

    NEW.kcal := v_target.kcal;
    NEW.protein_g := v_target.protein_g;
    NEW.carbs_g := v_target.carbs_g;
    NEW.fat_g := v_target.fat_g;
    NEW.fiber_g := v_target.fiber_g;
    NEW.linoleic_acid_g := v_target.linoleic_acid_g;
    NEW.alpha_linolenic_acid_g := v_target.alpha_linolenic_acid_g;
    NEW.tdee := v_target.tdee;
    NEW.nutrition_goal := v_target.nutrition_goal;
    NEW.zielrate_pct_kg_woche := v_target.zielrate_pct_kg_woche;
    NEW.body_weight_kg := v_target.body_weight_kg;
    NEW.tdee_herkunft := v_target.tdee_herkunft;
    NEW.tdee_history_id := v_target.tdee_history_id;
  ELSE
    NEW.zielrate_pct_kg_woche := NULL;
    NEW.body_weight_kg := NULL;
    NEW.tdee_herkunft := NULL;
    NEW.tdee_history_id := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION goals.nutrition_target_assign_phase()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.nutrition_target_assign_phase()
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.nutrition_target_assign_phase() IS
  'G-559: ordnet nur bei genau einer Nutzerphase automatisch zu; mehrere gueltige Zielphasen sind ohne Zielbezug ein ausdrueckliches Hindernis.';

COMMIT;
