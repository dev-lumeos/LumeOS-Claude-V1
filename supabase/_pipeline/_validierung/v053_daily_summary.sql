-- v053 — Validierung der Tagessumme (C-04, 2026-08-06)
-- Erwartet nach Lauf von 053. Stil wie v050/v052/v061.

-- --- Existenz ---
SELECT 'daily_summary_exists', (to_regclass('nutrition.daily_summary') IS NOT NULL)::text;

-- --- DIE tragende Pruefung: security_invoker ---
-- Ohne diese Option laeuft die Sicht mit den Rechten der Eigentuemerin
-- (postgres) und zeigte jeder Nutzerin ALLE Tagessummen. Aus der Existenz
-- der Sicht folgt nicht ihre Abschottung — deshalb hier explizit.
SELECT 'daily_summary_security_invoker',
       (c.reloptions IS NOT NULL AND 'security_invoker=true' = ANY(c.reloptions))::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'daily_summary';

-- Gegenprobe: NICHT security_definer.
SELECT 'daily_summary_not_security_definer',
       (c.reloptions IS NULL OR NOT ('security_invoker=false' = ANY(c.reloptions)))::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'daily_summary';

-- --- Grants ---
SELECT 'daily_summary_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'daily_summary'
  AND grantee = 'authenticated';

-- Kein Schreibrecht auf eine Aggregatsicht.
SELECT 'daily_summary_kein_schreibrecht', (COUNT(*) = 0)::text
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'daily_summary'
  AND grantee = 'authenticated' AND privilege_type IN ('INSERT','UPDATE','DELETE');

-- --- Die Luecken-Spalten sind vorhanden (fehlender Wert bleibt fehlend) ---
SELECT 'daily_summary_missing_spalten', COUNT(*)::text
FROM information_schema.columns
WHERE table_schema = 'nutrition' AND table_name = 'daily_summary'
  AND column_name LIKE '%_missing';

-- --- Die neun Makro-Summen sind vorhanden ---
SELECT 'daily_summary_makro_spalten', COUNT(*)::text
FROM information_schema.columns
WHERE table_schema = 'nutrition' AND table_name = 'daily_summary'
  AND column_name IN ('enercc','prot625','fat','cho','fibt','sugar','fasat','nacl','water_g');

-- --- Die zugrunde liegenden Tabellen tragen weiterhin RLS ---
-- Die Abschottung der Sicht haengt vollstaendig daran.
SELECT 'meals_rls_noch_an', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'meals';
SELECT 'meal_items_rls_noch_an', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'meal_items';

-- --- Rechnerische Konsistenz: Summe der Sicht = Summe der Positionen ---
-- Als postgres (sieht alles). Weicht das ab, rechnet die Sicht falsch.
SELECT 'summe_stimmt_mit_positionen',
       (COALESCE((SELECT SUM(enercc) FROM nutrition.daily_summary), 0)
        = COALESCE((SELECT SUM(enercc) FROM nutrition.meal_items), 0))::text;

-- --- Kein Tag geht verloren ---
SELECT 'alle_tage_in_der_sicht',
       ((SELECT COUNT(*) FROM (SELECT DISTINCT user_id, entry_date FROM nutrition.meals) d)
        = (SELECT COUNT(*) FROM nutrition.daily_summary))::text;
