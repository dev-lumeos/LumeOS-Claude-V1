-- G-625: Der eine oeffentliche G-626-Pruefweg gilt auch im Planer.
-- Die bestehenden Grenzwerte bleiben in G-626; hier werden nur die
-- Plan-Kataloggruppen und die eigene Maximaldauer angeschlossen.
BEGIN;

ALTER FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) RENAME TO ziel_grenzen_pruefen_g625_basis;

CREATE FUNCTION goals.ziel_grenzen_pruefen(
  p_erfahrung text,p_richtung text,p_start_kg numeric,p_ziel_kg numeric,
  p_startdatum date,p_zieldatum date,p_programm_code text DEFAULT NULL,
  p_eigene_werte jsonb DEFAULT NULL,p_geschlecht text DEFAULT NULL,
  p_groesse_cm numeric DEFAULT NULL,p_tdee_kcal numeric DEFAULT NULL,
  p_tempo_override numeric DEFAULT NULL
)
RETURNS TABLE (schluessel text,art text,hinweis text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT f.schluessel,f.art,f.hinweis
  FROM goals.ziel_grenzen_pruefen_g625_basis(
    p_erfahrung,p_richtung,p_start_kg,p_ziel_kg,p_startdatum,p_zieldatum,
    p_programm_code,p_eigene_werte,p_geschlecht,p_groesse_cm,
    p_tdee_kcal,p_tempo_override
  ) f
  WHERE NOT (
    f.schluessel='programm_richtung'
    AND EXISTS (
      SELECT 1 FROM goals.goal_strategies s
      WHERE s.code=p_programm_code
        AND s.auswahl_gruppe IN ('plan','uebergang')
    )
  )
  UNION ALL
  SELECT 'eigene_werte_dauer'::text,'warnung'::text,
    format('Eigene Maximaldauer von %s Wochen ueberschritten.',
      p_eigene_werte->>'max_duration_weeks')::text
  WHERE p_eigene_werte IS NOT NULL
    AND jsonb_typeof(p_eigene_werte->'max_duration_weeks')='number'
    AND p_startdatum IS NOT NULL AND p_zieldatum IS NOT NULL
    AND p_zieldatum>p_startdatum
    AND (p_zieldatum-p_startdatum)::numeric/7 >
      (p_eigene_werte->>'max_duration_weeks')::numeric;
$$;

COMMENT ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) IS
  'G-625: G-626-Grenzen gelten auch fuer Planprogramme und die Maximaldauer eigener Werte.';
REVOKE ALL ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) TO authenticated,service_role;
COMMIT;
