-- G-633: Nur die Anzeige der Zahlen aendert sich; Befundschluessel und
-- G-626-Regeln bleiben identisch.
BEGIN;

CREATE FUNCTION goals.g633_hinweis_zahlen_de(p_hinweis text)
RETURNS text LANGUAGE sql IMMUTABLE STRICT SET search_path='' AS $$
  SELECT regexp_replace(
    regexp_replace(p_hinweis,
      '([0-9]+)\.0+([^0-9]|$)','\1\2','g'),
    '([0-9]+)\.([0-9]+)','\1,\2','g');
$$;

ALTER FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) RENAME TO ziel_grenzen_pruefen_g633_basis;

CREATE FUNCTION goals.ziel_grenzen_pruefen(
  p_erfahrung text,p_richtung text,p_start_kg numeric,p_ziel_kg numeric,
  p_startdatum date,p_zieldatum date,p_programm_code text DEFAULT NULL,
  p_eigene_werte jsonb DEFAULT NULL,p_geschlecht text DEFAULT NULL,
  p_groesse_cm numeric DEFAULT NULL,p_tdee_kcal numeric DEFAULT NULL,
  p_tempo_override numeric DEFAULT NULL
)
RETURNS TABLE (schluessel text,art text,hinweis text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT f.schluessel,f.art,goals.g633_hinweis_zahlen_de(f.hinweis)
  FROM goals.ziel_grenzen_pruefen_g633_basis(
    p_erfahrung,p_richtung,p_start_kg,p_ziel_kg,p_startdatum,p_zieldatum,
    p_programm_code,p_eigene_werte,p_geschlecht,p_groesse_cm,
    p_tdee_kcal,p_tempo_override
  ) f;
$$;

REVOKE ALL ON FUNCTION goals.g633_hinweis_zahlen_de(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.g633_hinweis_zahlen_de(text)
  TO authenticated,service_role;
REVOKE ALL ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) TO authenticated,service_role;
COMMENT ON FUNCTION goals.ziel_grenzen_pruefen(
  text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric
) IS 'G-633: dieselben G-626-Befunde mit deutscher Zahlenschreibweise.';
COMMIT;
