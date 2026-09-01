-- C-381/G-151: Die Bestaetigung ist ein atomarer, serverseitiger Vorgang.
-- Der Aufrufer liefert nur die Aktions-ID. Akteur, Ablauf, Zielaenderung und
-- Protokoll entstehen ausschliesslich in dieser Funktion.

BEGIN;

-- Ein direkter Update koennte Status, confirmed_by oder Ablaufpruefung
-- umgehen. pending_actions bleibt fuer Coach-Erstellung und Lesefall offen;
-- die Bestaetigung selbst geht nur ueber bestaetige_aktion().
REVOKE UPDATE ON coach.pending_actions FROM authenticated;
DROP POLICY IF EXISTS pending_actions_update ON coach.pending_actions;

-- action_log ist ein Ausfuehrungsprotokoll, kein vom Browser schreibbares
-- Ereignis. Der SECURITY DEFINER-Ausfuehrer schreibt es weiterhin atomar.
REVOKE INSERT, UPDATE ON coach.action_log FROM authenticated;
DROP POLICY IF EXISTS action_log_insert ON coach.action_log;
DROP POLICY IF EXISTS action_log_update ON coach.action_log;

CREATE OR REPLACE FUNCTION coach.bestaetige_aktion(p_action_id uuid)
RETURNS TABLE (
  action_id uuid,
  target_valid_from date,
  protein_g numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_action coach.pending_actions%ROWTYPE;
  v_target goals.nutrition_targets%ROWTYPE;
  v_delta numeric;
  v_new_protein numeric;
  v_note text;
  v_created_target boolean;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Anmeldung erforderlich' USING ERRCODE = '42501';
  END IF;

  -- Die Zeile wird zusammen mit ihrem Status gesperrt. Die client_id steht
  -- in der Datenbank; eine fremde ID ist weder Parameter noch Rueckfall.
  SELECT pa.* INTO v_action
  FROM coach.pending_actions AS pa
  WHERE pa.id = p_action_id
    AND pa.client_id = v_actor
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aktion ist nicht fuer diesen Klienten bestaetigbar'
      USING ERRCODE = '42501';
  END IF;

  IF v_action.status <> 'pending' THEN
    RAISE EXCEPTION 'Aktion ist nicht mehr offen' USING ERRCODE = 'P0001';
  END IF;

  IF v_action.expires_at <= statement_timestamp() THEN
    RAISE EXCEPTION 'Aktion ist abgelaufen' USING ERRCODE = 'P0001';
  END IF;

  -- Der Dispatcher ist absichtlich eine enge Allowlist. Neue Aktionstypen
  -- brauchen ihre eigene, explizite Zielzuordnung statt einen JSON-Schreibweg.
  IF v_action.module <> 'nutrition'
     OR v_action.action_type <> 'adjust_macro_targets' THEN
    RAISE EXCEPTION 'Aktionstyp ist nicht ausfuehrbar' USING ERRCODE = '22023';
  END IF;

  IF jsonb_typeof(v_action.payload) <> 'object'
     OR NOT (v_action.payload ? 'protein_g_delta')
     OR jsonb_typeof(v_action.payload -> 'protein_g_delta') <> 'number'
     OR (v_action.payload ? 'reason' AND jsonb_typeof(v_action.payload -> 'reason') <> 'string')
     OR EXISTS (
       SELECT 1
       FROM jsonb_object_keys(v_action.payload) AS payload_key(key)
       WHERE payload_key.key NOT IN ('protein_g_delta', 'reason')
     ) THEN
    RAISE EXCEPTION 'Payload fuer adjust_macro_targets ist ungueltig'
      USING ERRCODE = '22023';
  END IF;

  v_delta := (v_action.payload ->> 'protein_g_delta')::numeric;
  IF v_delta = 0 THEN
    RAISE EXCEPTION 'protein_g_delta darf nicht null sein' USING ERRCODE = '22023';
  END IF;

  -- Alle Bestaetigungen eines Klienten serialisieren: zwei Vorschlaege am
  -- selben Tag duerfen nicht beide einen neuen Tagesstand erzeugen.
  PERFORM 1 FROM auth.users AS u WHERE u.id = v_action.client_id FOR UPDATE;

  SELECT nt.* INTO v_target
  FROM goals.nutrition_targets AS nt
  WHERE nt.user_id = v_action.client_id
    AND nt.gueltig_ab <= current_date
  ORDER BY nt.gueltig_ab DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND OR v_target.protein_g IS NULL THEN
    RAISE EXCEPTION 'Kein bestimmbarer Protein-Zielwert fuer diese Aktion'
      USING ERRCODE = 'P0001';
  END IF;

  v_new_protein := v_target.protein_g + v_delta;
  IF v_new_protein < 0 OR v_new_protein > 500 THEN
    RAISE EXCEPTION 'Protein-Zielwert liegt ausserhalb des erlaubten Bereichs'
      USING ERRCODE = '22023';
  END IF;

  v_note := concat_ws(E'\n', NULLIF(v_target.notiz, ''),
    'Coach-Bestaetigung: ' || COALESCE(NULLIF(v_action.payload ->> 'reason', ''), 'adjust_macro_targets'));
  v_created_target := v_target.gueltig_ab <> current_date;

  -- Ziele sind zeithistorisch. Nur ein bereits heutiger Stand wird fuer eine
  -- weitere heutige Bestaetigung fortgeschrieben; sonst bleibt die alte Zeile
  -- fuer vergangene Tage unangetastet.
  IF v_created_target THEN
    INSERT INTO goals.nutrition_targets (
      user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g,
      linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee,
      nutrition_goal, notiz
    ) VALUES (
      v_target.user_id, current_date, v_target.kcal, v_new_protein,
      v_target.carbs_g, v_target.fat_g, v_target.linoleic_acid_g,
      v_target.alpha_linolenic_acid_g, 'manuell', v_target.tdee,
      v_target.nutrition_goal, v_note
    );
  ELSE
    UPDATE goals.nutrition_targets AS nt
    SET protein_g = v_new_protein,
        herkunft = 'manuell',
        notiz = v_note,
        updated_at = statement_timestamp()
    WHERE nt.user_id = v_target.user_id
      AND nt.gueltig_ab = current_date;
  END IF;

  UPDATE coach.pending_actions AS pa
  SET status = 'confirmed',
      confirmed_at = statement_timestamp(),
      confirmed_by = v_actor
  WHERE pa.id = v_action.id;

  INSERT INTO coach.action_log (
    pending_action_id, coach_id, client_id, module, action_type,
    payload_snapshot, undo_data, executed_by
  ) VALUES (
    v_action.id, v_action.coach_id, v_action.client_id,
    v_action.module, v_action.action_type, v_action.payload,
    jsonb_build_object(
      'target_valid_from', current_date,
      'created_target_row', v_created_target,
      'target_before', jsonb_build_object(
        'gueltig_ab', v_target.gueltig_ab,
        'kcal', v_target.kcal,
        'protein_g', v_target.protein_g,
        'carbs_g', v_target.carbs_g,
        'fat_g', v_target.fat_g,
        'linoleic_acid_g', v_target.linoleic_acid_g,
        'alpha_linolenic_acid_g', v_target.alpha_linolenic_acid_g,
        'herkunft', v_target.herkunft,
        'tdee', v_target.tdee,
        'nutrition_goal', v_target.nutrition_goal,
        'notiz', v_target.notiz
      )
    ),
    v_actor
  );

  RETURN QUERY SELECT v_action.id, current_date, v_new_protein;
END;
$function$;

REVOKE ALL ON FUNCTION coach.bestaetige_aktion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION coach.bestaetige_aktion(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION coach.bestaetige_aktion(uuid) IS
  'C-381/G-151: Atomare Klientenbestaetigung einer erlaubten Coach-Aktion. Der Akteur stammt aus auth.uid(); Ablauf, Zielwert und action_log werden gemeinsam geprueft und geschrieben.';

COMMIT;
