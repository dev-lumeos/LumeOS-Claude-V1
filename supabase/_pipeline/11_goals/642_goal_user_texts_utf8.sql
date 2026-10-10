-- G-642: Nur wirksame Nutzersaetze und vier Katalogbeschreibungen berichtigen.
-- Historische Schritte bleiben unveraendert; 622 bleibt bis zur App-Anpassung ausgenommen.
BEGIN;

DO $g642$
DECLARE
  v_change text[];
  v_function regprocedure;
  v_definition text;
  v_count integer;
BEGIN
  FOREACH v_change SLICE 1 IN ARRAY ARRAY[
    ARRAY['goals.goal_phase_start(text,uuid,date,date,text,jsonb,numeric,text)',
      'Ziel gehoert nicht dem angemeldeten Nutzer',
      'Ziel gehört nicht dem angemeldeten Nutzer'],
    ARRAY['goals.goal_phase_start(text,uuid,date,date,text,jsonb,numeric,text)',
      'fuer dieses Ziel laeuft bereits eine Phase',
      'für dieses Ziel läuft bereits eine Phase'],
    ARRAY['goals.ziel_reihenfolge_setzen(jsonb)',
      'Alle aktiven eigenen Ziele muessen genannt sein',
      'Alle aktiven eigenen Ziele müssen genannt sein'],
    ARRAY['goals.goal_phases_calorie_guard()',
      'Ziel fehlt oder gehoert nicht dem angemeldeten Nutzer',
      'Ziel fehlt oder gehört nicht dem angemeldeten Nutzer'],
    ARRAY['goals.goal_phases_calorie_guard()',
      'Phase und Ziel muessen demselben Nutzer gehoeren',
      'Phase und Ziel müssen demselben Nutzer gehören'],
    ARRAY['goals.phase_transition_recommendation(uuid,date)',
      'Tage ueber dem geplanten Phasenende; %s Koerpermessungen',
      'Tage über dem geplanten Phasenende; %s Körpermessungen'],
    ARRAY['goals.measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)',
      'eine der 13 Koerperstellen waehlen',
      'eine der 13 Körperstellen wählen'],
    ARRAY['goals.g617_measurement_goal_snapshot()',
      'feste Koerpereinheit verwenden',
      'feste Körpereinheit verwenden'],
    ARRAY['goals.g617_measurement_goal_snapshot()',
      'Uebung und einmaliger Rhythmus erforderlich',
      'Übung und einmaliger Rhythmus erforderlich'],
    ARRAY['goals.ziel_grenzen_pruefen_g633_basis(text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric)',
      'Eigene Maximaldauer von %s Wochen ueberschritten.',
      'Eigene Maximaldauer von %s Wochen überschritten.']
  ] LOOP
    v_function := to_regprocedure(v_change[1]);
    IF v_function IS NULL THEN
      RAISE EXCEPTION 'G642_SCHEMA: Funktion % fehlt', v_change[1];
    END IF;
    v_definition := pg_get_functiondef(v_function);
    v_count := (length(v_definition)-length(replace(v_definition,v_change[2],'')))
      / length(v_change[2]);
    IF v_count <> 1 OR position(v_change[3] IN v_definition) > 0 THEN
      RAISE EXCEPTION 'G642_TEXT: Erwarteter alter Satz in % nicht genau einmal vorhanden', v_change[1];
    END IF;
    EXECUTE replace(v_definition,v_change[2],v_change[3]);
  END LOOP;

  IF (SELECT count(*) FROM goals.goal_strategies
      WHERE (code,description) IN (
        ('eigene_werte_abnehmen','Eigenes Vorgehen fuer Abnehmen ab Pro.'),
        ('eigene_werte_halten','Eigenes Vorgehen fuer Halten ab Pro.'),
        ('eigene_werte_aufbauen','Eigenes Vorgehen fuer Aufbauen ab Pro.'),
        ('eigene_werte_uebergang','Eigener Uebergang ab Pro.')
      )) <> 4 THEN
    RAISE EXCEPTION 'G642_CATALOG: Vier erwartete Beschreibungen fehlen';
  END IF;
  UPDATE goals.goal_strategies
  SET description = CASE code
    WHEN 'eigene_werte_abnehmen' THEN 'Eigenes Vorgehen für Abnehmen ab Pro.'
    WHEN 'eigene_werte_halten' THEN 'Eigenes Vorgehen für Halten ab Pro.'
    WHEN 'eigene_werte_aufbauen' THEN 'Eigenes Vorgehen für Aufbauen ab Pro.'
    WHEN 'eigene_werte_uebergang' THEN 'Eigener Übergang ab Pro.'
  END
  WHERE code IN ('eigene_werte_abnehmen','eigene_werte_halten',
                 'eigene_werte_aufbauen','eigene_werte_uebergang');
END $g642$;

COMMIT;
