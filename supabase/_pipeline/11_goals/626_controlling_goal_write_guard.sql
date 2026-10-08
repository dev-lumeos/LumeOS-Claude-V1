-- G-626: Jede neue/geaenderte steuernde Gewichtsphase durchlaeuft dieselbe
-- Befundfunktion wie die Vorschau. Bestaetigungen sind Schluessel im
-- parameters-Array g626_confirmed_warnings; fremde Keys helfen nicht.
BEGIN;

CREATE FUNCTION goals.g626_guard_controlling_phase()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_goal goals.user_goals%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_direction text;
  v_start_kg numeric;
  v_target_kg numeric;
  v_tdee numeric;
  v_program_code text;
  v_own_values jsonb;
  v_confirmed jsonb;
  v_blocks text[];
  v_unconfirmed text[];
BEGIN
  -- Der Planer und Messziele haben eigene Eingaben; hier gelten die drei
  -- Richtungen von Ziel setzen. Auch direkte Tabellenwrites gehen durch.
  IF NEW.goal_id IS NULL OR NEW.phase_type NOT IN
    ('fat_loss', 'mini_cut', 'lean_bulk', 'maintenance') THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_goal FROM goals.user_goals WHERE id = NEW.goal_id
    AND user_id = NEW.user_id;
  IF NOT FOUND OR v_goal.goal_type <> 'body_composition' THEN
    RETURN NEW;
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = NEW.user_id;
  v_direction := CASE NEW.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    ELSE 'halten' END;
  v_start_kg := coalesce(
    CASE WHEN v_goal.target_unit = 'kg' THEN v_goal.start_value END,
    v_profile.body_weight_kg);
  v_target_kg := CASE WHEN v_goal.target_unit = 'kg' THEN v_goal.target_value END;
  SELECT b.tdee INTO v_tdee
  FROM goals.tdee_basis_am(NEW.user_id, NEW.gueltig_ab) b;

  IF NEW.strategie_code = 'custom' THEN
    v_own_values := NEW.parameters -> 'g626_eigene_werte';
  ELSE
    v_program_code := NEW.strategie_code;
    IF NEW.parameters ? 'g626_eigene_werte' THEN
      RAISE EXCEPTION 'G626_BLOCK:vorgehen_doppelt'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  v_confirmed := coalesce(NEW.parameters -> 'g626_confirmed_warnings', '[]'::jsonb);
  IF jsonb_typeof(v_confirmed) <> 'array' THEN
    RAISE EXCEPTION 'G626_BLOCK:bestaetigungen_ungueltig'
      USING ERRCODE = '23514';
  END IF;

  SELECT
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (WHERE f.art = 'sperre'),
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (
      WHERE f.art = 'warnung' AND NOT v_confirmed ? f.schluessel)
  INTO v_blocks, v_unconfirmed
  FROM goals.ziel_grenzen_pruefen(
    v_profile.experience_level, v_direction, v_start_kg, v_target_kg,
    NEW.gueltig_ab, coalesce(v_goal.target_date, NEW.projected_end_date),
    v_program_code, v_own_values, v_profile.biological_sex,
    v_profile.height_cm, v_tdee,
    CASE WHEN v_program_code IS NOT NULL
      THEN NEW.zielrate_pct_kg_woche END
  ) f;

  IF v_blocks IS NOT NULL THEN
    RAISE EXCEPTION 'G626_BLOCK:%', array_to_string(v_blocks, ',')
      USING ERRCODE = '23514';
  END IF;
  IF v_unconfirmed IS NOT NULL THEN
    RAISE EXCEPTION 'G626_CONFIRM:%', array_to_string(v_unconfirmed, ',')
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER g626_guard_controlling_phase
  BEFORE INSERT OR UPDATE OF goal_id, phase_type, strategie_code,
    zielrate_pct_kg_woche, gueltig_ab, projected_end_date, parameters
  ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.g626_guard_controlling_phase();

-- Nach dem Phasenstart darf ein direktes Ziel-UPDATE keine der Grenzen
-- umgehen. Das gilt nur fuer Gewichtsziele mit einer offenen Phase.
CREATE FUNCTION goals.g626_guard_controlling_goal_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_phase goals.goal_phases%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_direction text;
  v_start_kg numeric;
  v_target_kg numeric;
  v_tdee numeric;
  v_program_code text;
  v_own_values jsonb;
  v_confirmed jsonb;
  v_blocks text[];
  v_unconfirmed text[];
BEGIN
  IF NEW.goal_type <> 'body_composition' THEN RETURN NEW; END IF;
  SELECT * INTO v_phase FROM goals.goal_phases
  WHERE goal_id = NEW.id AND user_id = NEW.user_id
    AND actual_end_date IS NULL
    AND phase_type IN ('fat_loss', 'mini_cut', 'lean_bulk', 'maintenance')
  ORDER BY gueltig_ab DESC, created_at DESC LIMIT 1;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = NEW.user_id;
  v_direction := CASE v_phase.phase_type
    WHEN 'fat_loss' THEN 'abnehmen'
    WHEN 'mini_cut' THEN 'abnehmen'
    WHEN 'lean_bulk' THEN 'aufbauen'
    ELSE 'halten' END;
  v_start_kg := coalesce(
    CASE WHEN NEW.target_unit = 'kg' THEN NEW.start_value END,
    v_profile.body_weight_kg);
  v_target_kg := CASE WHEN NEW.target_unit = 'kg' THEN NEW.target_value END;
  SELECT b.tdee INTO v_tdee
  FROM goals.tdee_basis_am(NEW.user_id, v_phase.gueltig_ab) b;
  IF v_phase.strategie_code = 'custom' THEN
    v_own_values := v_phase.parameters -> 'g626_eigene_werte';
  ELSE
    v_program_code := v_phase.strategie_code;
  END IF;
  v_confirmed := coalesce(v_phase.parameters -> 'g626_confirmed_warnings', '[]'::jsonb);
  SELECT
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (WHERE f.art = 'sperre'),
    array_agg(f.schluessel ORDER BY f.schluessel) FILTER (
      WHERE f.art = 'warnung' AND NOT (v_confirmed ? f.schluessel))
  INTO v_blocks, v_unconfirmed
  FROM goals.ziel_grenzen_pruefen(
    v_profile.experience_level, v_direction, v_start_kg, v_target_kg,
    v_phase.gueltig_ab, coalesce(NEW.target_date, v_phase.projected_end_date),
    v_program_code, v_own_values, v_profile.biological_sex,
    v_profile.height_cm, v_tdee,
    CASE WHEN v_program_code IS NOT NULL
      THEN v_phase.zielrate_pct_kg_woche END
  ) f;
  IF v_blocks IS NOT NULL THEN
    RAISE EXCEPTION 'G626_BLOCK:%', array_to_string(v_blocks, ',')
      USING ERRCODE = '23514';
  END IF;
  IF v_unconfirmed IS NOT NULL THEN
    RAISE EXCEPTION 'G626_CONFIRM:%', array_to_string(v_unconfirmed, ',')
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER g626_guard_controlling_goal_update
  BEFORE UPDATE OF target_value, target_unit, start_value, target_date, goal_type
  ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.g626_guard_controlling_goal_update();

COMMENT ON FUNCTION goals.g626_guard_controlling_phase() IS
  'G-626: Phasenschreibweg nutzt ziel_grenzen_pruefen; Sperren werden abgewiesen, Warnungen brauchen bestätigte stabile Schlüssel im parameters-Array.';
REVOKE ALL ON FUNCTION goals.g626_guard_controlling_phase()
  FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION goals.g626_guard_controlling_goal_update() IS
  'G-626: Zieländerungen einer laufenden Gewichtsphase prüfen dieselben Grenzen und Warnbestätigungen erneut.';
REVOKE ALL ON FUNCTION goals.g626_guard_controlling_goal_update()
  FROM PUBLIC, anon, authenticated;

COMMIT;
