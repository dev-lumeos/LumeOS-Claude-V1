-- v080 Pruefung: ist public frei von Governance-Resten?
SELECT 'Tabellen in public' AS pruefung,
       count(*)::text AS ist, '0' AS soll,
       CASE WHEN count(*)=0 THEN 'ok' ELSE 'FEHLER' END AS ergebnis
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
UNION ALL
SELECT 'wo_-Enums', count(*)::text, '0',
       CASE WHEN count(*)=0 THEN 'ok' ELSE 'FEHLER' END
FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
WHERE n.nspname='public' AND t.typtype='e' AND t.typname LIKE 'wo_%'
UNION ALL
SELECT 'Nicht-Extension-Funktionen', count(*)::text, '0',
       CASE WHEN count(*)=0 THEN 'ok' ELSE 'FEHLER' END
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public'
  AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid=p.oid AND d.deptype='e')
UNION ALL
SELECT 'nutrition-Tabellen unberuehrt', count(*)::text, '11',
       CASE WHEN count(*)=11 THEN 'ok' ELSE 'FEHLER' END
FROM information_schema.tables
WHERE table_schema='nutrition' AND table_type='BASE TABLE'
UNION ALL
SELECT 'foods-Zeilen unberuehrt', count(*)::text, '7140',
       CASE WHEN count(*)=7140 THEN 'ok' ELSE 'FEHLER' END
FROM nutrition.foods;