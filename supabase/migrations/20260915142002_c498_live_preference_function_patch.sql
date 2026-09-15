-- C-498: Live-Upgrade fuer bereits vorhandene Nutrition-Preference-Funktionen.
-- In der Vollkette werden 074/075 bereits in ihrer neuen Fassung ausgefuehrt.
-- Auf einer bestehenden Datenbank ersetzt diese Migration die alte Spaltenreferenz,
-- bevor sie nach dem Entfernen von nutrition.food_preferences.allergies aufgerufen
-- werden kann.

BEGIN;

DO $patch$
DECLARE
  v_proc record;
  v_definition text;
BEGIN
  -- Leser, Suchindex und Suche: die alte Preference-Spalte ist durch die
  -- kanonischen globalen Nahrung-Allergien des Nutzers ersetzt.
  FOR v_proc IN
    SELECT p.oid
    FROM pg_proc AS p
    JOIN pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'nutrition'
      AND p.prosrc LIKE '%fp.allergies%'
  LOOP
    v_definition := pg_get_functiondef(v_proc.oid);
    v_definition := replace(
      v_definition,
      'COALESCE(fp.allergies, ''{}''::text[]) AS allergies',
      'public.user_allergy_codes(fp.user_id) AS allergies'
    );
    EXECUTE v_definition;
  END LOOP;

  -- Der Schreibweg muss die alte JSON-Eingabe in die globale Tabelle schreiben.
  -- Nur die alte Funktionsfassung enthaelt EXCLUDED.allergies; die Vollkette
  -- ueberspringt diesen Abschnitt daher bewusst.
  IF to_regprocedure('nutrition.food_preferences_write(uuid,jsonb,jsonb)') IS NOT NULL THEN
    SELECT pg_get_functiondef('nutrition.food_preferences_write(uuid,jsonb,jsonb)'::regprocedure)
    INTO v_definition;

    IF position('allergies = EXCLUDED.allergies' IN v_definition) > 0 THEN
      v_definition := replace(v_definition, E'    allergies,\n', '');
      v_definition := replace(
        v_definition,
        E'    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_preferences->''allergies'', ''[]''::jsonb))), ''{}''::text[]),\n',
        ''
      );
      v_definition := replace(v_definition, E'    allergies = EXCLUDED.allergies,\n', '');
      v_definition := replace(
        v_definition,
        E'  IF to_regclass(''pg_temp.food_preferences_write_items'') IS NOT NULL THEN\n',
        E'  DELETE FROM public.user_allergies\n'
        || E'  WHERE user_id = p_user_id\n'
        || E'    AND art = ''nahrung''\n'
        || E'    AND quelle = ''nutrition_preferences'';\n\n'
        || E'  INSERT INTO public.user_allergies (user_id, stoff_code, stoff_text, art, schwere, quelle)\n'
        || E'  SELECT p_user_id, lower(btrim(value)), replace(lower(btrim(value)), ''_'', '' ''),\n'
        || E'         ''nahrung'', ''allergie'', ''nutrition_preferences''\n'
        || E'  FROM jsonb_array_elements_text(COALESCE(p_preferences->''allergies'', ''[]''::jsonb)) AS allergy(value)\n'
        || E'  WHERE btrim(value) <> '''';\n\n'
        || E'  IF to_regclass(''pg_temp.food_preferences_write_items'') IS NOT NULL THEN\n'
      );
      EXECUTE v_definition;
    END IF;
  END IF;
END
$patch$;

COMMIT;
