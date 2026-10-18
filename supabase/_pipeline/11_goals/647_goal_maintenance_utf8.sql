-- G-647: Der noch ausgenommene Nutzertext aus G-622 bekommt echte Umlaute.
BEGIN;

DO $g647$
DECLARE
  v_signature regprocedure := to_regprocedure('goals.berechne_zielwerte_g637_basis(uuid,date)');
  v_definition text;
  v_before text := 'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt';
  v_after text := 'nutrition_targets: mehrere aktive Phasen am Gültigkeitstag; Zielbezug fehlt';
BEGIN
  IF v_signature IS NULL THEN
    RAISE EXCEPTION 'G647_SCHEMA: G-637-Basis fehlt';
  END IF;
  v_definition := pg_get_functiondef(v_signature);
  IF (length(v_definition) - length(replace(v_definition, v_before, '')))
      / length(v_before) <> 1 OR position(v_after IN v_definition) > 0 THEN
    RAISE EXCEPTION 'G647_TEXT: Erwarteter alter Satz nicht genau einmal vorhanden';
  END IF;
  EXECUTE replace(v_definition, v_before, v_after);

  -- Derselbe G-622-Text steht im Zuordnungs-Trigger in drei Varianten.
  v_signature := to_regprocedure('goals.nutrition_target_assign_phase()');
  IF v_signature IS NULL THEN
    RAISE EXCEPTION 'G647_SCHEMA: Zielzuordnungs-Trigger fehlt';
  END IF;
  v_before := 'Gueltigkeitstag';
  v_after := 'Gültigkeitstag';
  v_definition := pg_get_functiondef(v_signature);
  IF (length(v_definition) - length(replace(v_definition, v_before, '')))
      / length(v_before) <> 3 OR position(v_after IN v_definition) > 0 THEN
    RAISE EXCEPTION 'G647_TEXT: Zielzuordnungstexte unerwartet';
  END IF;
  EXECUTE replace(v_definition, v_before, v_after);

  -- G-664 hat die G-642-korrigierte Vorschau später neu angelegt.
  v_signature := to_regprocedure(
    'goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)');
  IF v_signature IS NULL THEN
    RAISE EXCEPTION 'G647_SCHEMA: Startwertvorschau fehlt';
  END IF;
  v_before := 'eine der 13 Koerperstellen waehlen';
  v_after := 'eine der 13 Körperstellen wählen';
  v_definition := pg_get_functiondef(v_signature);
  IF (length(v_definition) - length(replace(v_definition, v_before, '')))
      / length(v_before) <> 1 OR position(v_after IN v_definition) > 0 THEN
    RAISE EXCEPTION 'G647_TEXT: G-664-Vorschautext unerwartet';
  END IF;
  EXECUTE replace(v_definition, v_before, v_after);
END $g647$;

COMMIT;
