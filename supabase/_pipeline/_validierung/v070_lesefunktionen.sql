-- v070 — Validierung der Lesefunktionen (070_lesefunktionen.sql)
-- Ausgabe: eine Tabelle pruefung | soll | ist | ok
-- Prüft Existenz, Rechte und Grundverhalten der 5 RPC-Funktionen
-- gegen den erwarteten Datenbestand (7.140 Foods etc.).

WITH fns(name, args) AS (
  VALUES
    ('food_search', 10),
    ('food_categories_tree', 0),
    ('preference_search_preview', 11),
    ('curation_overview', 5),
    ('schema_debug', 0)
),
checks(pruefung, soll, ist) AS (

  -- Existenz
  SELECT 'funktion nutrition.'||f.name||' existiert', '1',
         (SELECT count(*) FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'nutrition' AND p.proname = f.name
            AND p.pronargs = f.args)::text
  FROM fns f

  -- EXECUTE-Rechte
  UNION ALL
  SELECT 'EXECUTE authenticated auf allen 5 Funktionen', '5',
         (SELECT count(*) FROM fns f
          WHERE has_function_privilege('authenticated',
            (SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname='nutrition' AND p.proname=f.name AND p.pronargs=f.args), 'EXECUTE'))::text
  UNION ALL
  SELECT 'KEIN EXECUTE anon auf den 5 Funktionen', '0',
         (SELECT count(*) FROM fns f
          WHERE has_function_privilege('anon',
            (SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname='nutrition' AND p.proname=f.name AND p.pronargs=f.args), 'EXECUTE'))::text

  -- Faltungs-Helfer
  UNION ALL
  SELECT 'search_fold faltet Umlaute', 'kuerbis oel suess',
         nutrition.search_fold('Kürbis Öl süß')

  -- food_search: leere Suche liefert Gesamtbestand als total
  UNION ALL
  SELECT 'food_search leere Suche: total', '7140',
         (nutrition.food_search('', '', ARRAY[]::text[], NULL, '', NULL, '', 'relevance', 25, 0)->>'total')
  UNION ALL
  SELECT 'food_search leere Suche: result_count (Limit 25)', '25',
         (nutrition.food_search('', '', ARRAY[]::text[], NULL, '', NULL, '', 'relevance', 25, 0)->>'result_count')
  UNION ALL
  SELECT 'food_search Tokensuche kuerbis: total > 0', 'true',
         ((nutrition.food_search('kürbis', 'kuerbis', ARRAY['kuerbis'], NULL, '', NULL, '', 'relevance', 25, 0)->>'total')::int > 0)::text
  UNION ALL
  SELECT 'food_search: Nährstoffliste des ersten Treffers gefüllt', 'true',
         (json_array_length(nutrition.food_search('kürbis', 'kuerbis', ARRAY['kuerbis'], NULL, '', NULL, '', 'relevance', 25, 0)->'nutrients') > 0)::text

  -- food_categories_tree: Wurzelknoten = Level-1-Kategorien
  UNION ALL
  SELECT 'food_categories_tree: Wurzelknoten',
         (SELECT count(*)::text FROM nutrition.food_categories WHERE level = 1),
         json_array_length(nutrition.food_categories_tree())::text

  -- preference_search_preview: leere Suche ohne Präferenzen
  UNION ALL
  SELECT 'preference_preview leer: total', '7140',
         (nutrition.preference_search_preview('', '', ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], 'relevance', 25, 0)->>'total')

  -- curation_overview: Zählwerk
  UNION ALL
  SELECT 'curation_overview: foods-Zähler', '7140',
         (nutrition.curation_overview(TRUE, '', '', '', 'category_missing_first')->'counts'->>'foods')

  -- schema_debug
  UNION ALL
  SELECT 'schema_debug: row_count nutrient_defs', '138',
         (nutrition.schema_debug()->>'row_count')
)
SELECT pruefung, soll, ist,
       CASE WHEN soll = ist THEN 'ok' ELSE '** ABWEICHUNG **' END AS ok
FROM checks
ORDER BY pruefung;
