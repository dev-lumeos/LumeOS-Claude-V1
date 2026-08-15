-- v060 — Validierung der Zugriffsschicht (060_zugriffsschicht.sql)
-- Ausgabe: eine Tabelle pruefung | soll | ist | ok
-- Läuft in der Ziel-Datenbank; setzt voraus, dass die Rollen
-- authenticated und service_role im Cluster existieren.

WITH stammdaten(t) AS (
  VALUES ('foods'),('food_nutrients'),('nutrient_defs'),('food_categories'),
         ('food_tags'),('food_aliases'),('tag_definitions')
),
nutzerdaten(t) AS (
  VALUES ('food_preferences'),('food_preference_items')
),
curation(t) AS (
  VALUES ('food_curation_candidates'),('food_curation_decisions')
),
alle(t) AS (
  SELECT t FROM stammdaten UNION ALL SELECT t FROM nutzerdaten
  UNION ALL SELECT t FROM curation
),
checks(pruefung, soll, ist) AS (

  -- Extension
  SELECT 'extension pg_trgm installiert', '1',
         (SELECT count(*) FROM pg_extension WHERE extname = 'pg_trgm')::text

  -- Trigram-Indizes
  UNION ALL
  SELECT 'index idx_foods_name_display_de (GIN trgm)', '1',
         (SELECT count(*) FROM pg_indexes
          WHERE schemaname='nutrition' AND indexname='idx_foods_name_display_de'
            AND indexdef ILIKE '%gin%trgm%')::text
  UNION ALL
  SELECT 'index idx_food_aliases_alias_trgm (GIN trgm)', '1',
         (SELECT count(*) FROM pg_indexes
          WHERE schemaname='nutrition' AND indexname='idx_food_aliases_alias_trgm'
            AND indexdef ILIKE '%gin%trgm%')::text

  -- Schema-USAGE
  UNION ALL
  SELECT 'USAGE nutrition fuer authenticated', 'true',
         has_schema_privilege('authenticated','nutrition','USAGE')::text
  UNION ALL
  SELECT 'USAGE nutrition fuer service_role', 'true',
         has_schema_privilege('service_role','nutrition','USAGE')::text

  -- Grants authenticated
  UNION ALL
  SELECT 'SELECT-Grant authenticated auf 7 Stammdatentabellen', '7',
         (SELECT count(*) FROM stammdaten
          WHERE has_table_privilege('authenticated','nutrition.'||t,'SELECT'))::text
  UNION ALL
  SELECT 'DML-Grants authenticated auf 2 Nutzerdatentabellen (4 Rechte x 2)', '8',
         (SELECT count(*) FROM nutzerdaten n,
                 unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) AS p(priv)
          WHERE has_table_privilege('authenticated','nutrition.'||n.t, p.priv))::text
  UNION ALL
  SELECT 'KEIN Grant authenticated auf Curation-Tabellen', '0',
         (SELECT count(*) FROM curation c,
                 unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) AS p(priv)
          WHERE has_table_privilege('authenticated','nutrition.'||c.t, p.priv))::text

  -- Grants service_role
  UNION ALL
  SELECT 'Vollrechte service_role auf alle 11 Tabellen', '11',
         (SELECT count(*) FROM alle a
          WHERE has_table_privilege('service_role','nutrition.'||a.t,'SELECT')
            AND has_table_privilege('service_role','nutrition.'||a.t,'INSERT')
            AND has_table_privilege('service_role','nutrition.'||a.t,'UPDATE')
            AND has_table_privilege('service_role','nutrition.'||a.t,'DELETE'))::text

  -- RLS-Flag je Tabelle
  UNION ALL
  SELECT 'RLS aktiv auf allen 11 Tabellen', '11',
         (SELECT count(*) FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname='nutrition' AND c.relkind='r' AND c.relrowsecurity)::text

  -- Policy-Anzahl je Tabelle
  UNION ALL
  SELECT 'policies '||a.t,
         CASE WHEN a.t IN (SELECT t FROM stammdaten)  THEN '1'
              WHEN a.t IN (SELECT t FROM nutzerdaten) THEN '4'
              ELSE '0' END,
         (SELECT count(*) FROM pg_policies p
          WHERE p.schemaname='nutrition' AND p.tablename=a.t)::text
  FROM alle a

  -- Policy-Gesamtzahl
  UNION ALL
  SELECT 'policies gesamt', '15',
         (SELECT count(*) FROM pg_policies WHERE schemaname='nutrition')::text
)
SELECT pruefung, soll, ist,
       CASE WHEN soll = ist THEN 'ok' ELSE '** ABWEICHUNG **' END AS ok
FROM checks
ORDER BY (pruefung LIKE 'policies %'), pruefung;
