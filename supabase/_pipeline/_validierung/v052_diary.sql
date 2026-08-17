-- v052 — Validierung der Diary-Grundlage (C-03 / WP-02, 2026-08-06)
-- Erwartet nach Lauf von 052 gegen eine frische Datenbank.
-- Stil wie v050/v060: SELECT 'label', wert::text.

-- --- Existenz ---
SELECT 'meals_exists', (to_regclass('nutrition.meals') IS NOT NULL)::text;
SELECT 'meal_items_exists', (to_regclass('nutrition.meal_items') IS NOT NULL)::text;

-- --- Zeilenschutz an (beide Tabellen) ---
SELECT 'meals_rls_enabled', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'meals';
SELECT 'meal_items_rls_enabled', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'meal_items';

-- --- Policies je Operation: je Tabelle genau 4, je Operation genau 1 ---
-- Der benannte Fehler des verworfenen Entwurfs war RLS OHNE Policy.
-- Diese vier Prüfungen schlagen an, wenn er sich wiederholt.
SELECT 'meals_policy_count', COUNT(*)::text
FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'meals';
SELECT 'meal_items_policy_count', COUNT(*)::text
FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'meal_items';
SELECT 'meals_policy_ops', string_agg(DISTINCT cmd, ',' ORDER BY cmd)
FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'meals';
SELECT 'meal_items_policy_ops', string_agg(DISTINCT cmd, ',' ORDER BY cmd)
FROM pg_policies WHERE schemaname = 'nutrition' AND tablename = 'meal_items';

-- --- Schreib-Policies tragen WITH CHECK ---
-- USING allein prueft INSERTs nicht (das Leck, das 060 bei den
-- Preferences beseitigt hat). Erwartet: 4 (je 2 Tabellen INSERT+UPDATE).
SELECT 'write_policies_with_check', COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'nutrition' AND tablename IN ('meals','meal_items')
  AND cmd IN ('INSERT','UPDATE') AND with_check IS NOT NULL;

-- --- Grants fuer authenticated: SELECT/INSERT/UPDATE/DELETE je Tabelle ---
-- Ohne Grant ist jede Policy toter Text (PostgREST: erst Grant, dann RLS).
SELECT 'meals_grants_authenticated', string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type)
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'meals' AND grantee = 'authenticated';
SELECT 'meal_items_grants_authenticated', string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type)
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'meal_items' AND grantee = 'authenticated';

-- --- C-61/C-59: Uhrzeit und mehrere Mahlzeiten je Typ ---
SELECT 'meal_time_column_exists', (COUNT(*) = 1)::text
FROM information_schema.columns
WHERE table_schema = 'nutrition' AND table_name = 'meals'
  AND column_name = 'meal_time' AND data_type = 'time without time zone';
SELECT 'uq_meals_user_date_type_absent', (COUNT(*) = 0)::text
FROM pg_indexes
WHERE schemaname = 'nutrition' AND tablename = 'meals'
  AND indexname = 'uq_meals_user_date_type' AND indexdef LIKE '%UNIQUE%';
SELECT 'idx_meals_user_date_time_exists', (COUNT(*) = 1)::text
FROM pg_indexes
WHERE schemaname = 'nutrition' AND tablename = 'meals'
  AND indexname = 'idx_meals_user_date_time';

-- --- Eigentuemer-Wachhund auf meal_items ---
SELECT 'meal_items_owner_guard_trigger', (COUNT(*) = 1)::text
FROM pg_trigger
WHERE tgrelid = 'nutrition.meal_items'::regclass
  AND tgname = 'meal_items_owner_guard_trg' AND NOT tgisinternal;
SELECT 'meal_items_owner_mismatch', COUNT(*)::text
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.user_id <> m.user_id;

-- --- Einfrieren: jede Position traegt einen Zeitpunkt ---
SELECT 'meal_items_without_frozen_at', COUNT(*)::text
FROM nutrition.meal_items WHERE frozen_at IS NULL;

-- --- Waisen (Fremdschluessel muessen greifen) ---
SELECT 'orphan_meal_items', COUNT(*)::text
FROM nutrition.meal_items mi
WHERE NOT EXISTS (SELECT 1 FROM nutrition.meals m WHERE m.id = mi.meal_id);
SELECT 'meal_items_unknown_food', COUNT(*)::text
FROM nutrition.meal_items mi
WHERE mi.food_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.foods f WHERE f.id = mi.food_id);

-- --- Quelle und Ziel passen zusammen ---
SELECT 'meal_items_source_target_violations', COUNT(*)::text
FROM nutrition.meal_items
WHERE NOT ((food_source = 'bls' AND food_id IS NOT NULL)
        OR (food_source = 'manual' AND food_id IS NULL));

-- --- Bestand ---
SELECT 'meals_rows', COUNT(*)::text FROM nutrition.meals;
SELECT 'meal_items_rows', COUNT(*)::text FROM nutrition.meal_items;
