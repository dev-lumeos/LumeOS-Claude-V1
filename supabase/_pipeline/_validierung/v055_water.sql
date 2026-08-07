-- v055 — Validierung Water Tracking (C-05, 2026-08-06)
-- Deckt 055 (Tabelle) und 056 (Sicht) ab. Stil wie v052/v053/v054.

-- --- Existenz ---
SELECT 'water_logs_exists', (to_regclass('nutrition.water_logs') IS NOT NULL)::text;
SELECT 'hydration_summary_exists', (to_regclass('nutrition.hydration_summary') IS NOT NULL)::text;

-- --- Zeilenschutz an ---
SELECT 'water_logs_rls_enabled', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'water_logs';

-- --- Vier Policies, eine je Operation ---
-- RLS ohne Policy sperrt die Tabelle vollstaendig (der Fehler des
-- verworfenen Diary-Entwurfs). Diese zwei Pruefungen schlagen an,
-- wenn er sich wiederholt.
SELECT 'water_logs_policy_count', COUNT(*)::text
FROM pg_policies WHERE schemaname='nutrition' AND tablename='water_logs';
SELECT 'water_logs_policy_ops', string_agg(DISTINCT cmd, ',' ORDER BY cmd)
FROM pg_policies WHERE schemaname='nutrition' AND tablename='water_logs';

-- --- Schreib-Policies tragen WITH CHECK ---
-- USING allein prueft INSERTs nicht. SPEC_06 Abschnitt 13 schreibt genau
-- diese Luecke vor (eine FOR-ALL-Policy mit USING); hier bewusst anders.
SELECT 'water_logs_write_policies_with_check', COUNT(*)::text
FROM pg_policies WHERE schemaname='nutrition' AND tablename='water_logs'
  AND cmd IN ('INSERT','UPDATE') AND with_check IS NOT NULL;

-- --- Grants: ohne sie ist jede Policy toter Text ---
SELECT 'water_logs_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema='nutrition' AND table_name='water_logs' AND grantee='authenticated';

-- --- Die Sicht laeuft mit den Rechten der Abfragenden ---
-- Ohne security_invoker zeigte sie jeder Nutzerin ALLE Zeilen.
SELECT 'hydration_summary_security_invoker',
       (c.reloptions IS NOT NULL AND 'security_invoker=true' = ANY(c.reloptions))::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='nutrition' AND c.relname='hydration_summary';

SELECT 'hydration_summary_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema='nutrition' AND table_name='hydration_summary' AND grantee='authenticated';

SELECT 'hydration_summary_kein_schreibrecht', (COUNT(*) = 0)::text
FROM information_schema.role_table_grants
WHERE table_schema='nutrition' AND table_name='hydration_summary'
  AND grantee='authenticated' AND privilege_type IN ('INSERT','UPDATE','DELETE');

-- --- Beide Quellen und der Luecken-Zaehler sind in der Sicht ---
SELECT 'hydration_summary_spalten', COUNT(*)::text
FROM information_schema.columns
WHERE table_schema='nutrition' AND table_name='hydration_summary'
  AND column_name IN ('logged_ml','food_ml','total_ml','food_ml_missing','total_complete');

-- --- Bewusst KEIN UNIQUE auf water_logs ---
-- Zweimal 250 ml um 14:00 Uhr sind zwei Glaeser, kein Fehler.
-- Diese Pruefung haelt die Entscheidung fest: taucht hier ein UNIQUE auf,
-- hat jemand einen Schutz erfunden, der echte Eingaben ablehnt.
SELECT 'water_logs_kein_unique', (COUNT(*) = 0)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='water_logs'
  AND indexdef LIKE '%UNIQUE%' AND indexname <> 'water_logs_pkey';

-- --- Mengen sind positiv ---
SELECT 'water_logs_amount_check_vorhanden', (COUNT(*) = 1)::text
FROM pg_constraint WHERE conname = 'water_logs_amount_ml_check';
SELECT 'water_logs_nicht_positive_mengen', COUNT(*)::text
FROM nutrition.water_logs WHERE amount_ml <= 0;

-- --- Die zugrunde liegende Tagessumme traegt weiterhin ihre Wasserspalte ---
-- Die Sicht haengt daran; verschwindet sie, ist die halbe Hydration weg.
SELECT 'daily_summary_hat_water_g', (COUNT(*) = 1)::text
FROM information_schema.columns
WHERE table_schema='nutrition' AND table_name='daily_summary' AND column_name='water_g';

-- --- Bestand ---
SELECT 'water_logs_rows', COUNT(*)::text FROM nutrition.water_logs;
SELECT 'hydration_summary_rows', COUNT(*)::text FROM nutrition.hydration_summary;
