-- v061 — Validierung des Rollenkonzepts (C.2, 2026-08-06)
-- Erwartet nach Lauf von 061. Stil wie v050/v052.

-- --- Funktion vorhanden und richtig gebaut ---
SELECT 'is_admin_exists', (to_regprocedure('public.is_admin()') IS NOT NULL)::text;
SELECT 'is_admin_is_invoker', (NOT p.prosecdef)::text
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';
SELECT 'is_admin_is_stable', (p.provolatile = 's')::text
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- --- DIE tragende Pruefung: liest die Funktion user_metadata? ---
-- user_metadata ist vom Nutzer selbst setzbar ([cmd] belegt). Kommt es
-- im Funktionsrumpf vor, ist die Rollenpruefung wertlos.
SELECT 'is_admin_reads_app_metadata', (p.prosrc LIKE '%app_metadata%')::text
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';
SELECT 'is_admin_ignores_user_metadata', (p.prosrc NOT LIKE '%user_metadata%')::text
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- --- Standard ist "kein Admin" ---
-- Ohne gesetzten Claim muss die Funktion false liefern, nicht NULL.
SELECT 'is_admin_without_claim', public.is_admin()::text;
SELECT 'is_admin_never_null', (public.is_admin() IS NOT NULL)::text;

-- --- Curation: Grants und Policies ---
SELECT 'curation_candidates_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'food_curation_candidates'
  AND grantee = 'authenticated';
SELECT 'curation_decisions_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema = 'nutrition' AND table_name = 'food_curation_decisions'
  AND grantee = 'authenticated';

-- Genau eine Policy je Tabelle, und zwar SELECT — kein Schreibzugriff.
SELECT 'curation_candidates_policy_ops',
       COALESCE(string_agg(DISTINCT cmd, ',' ORDER BY cmd), 'KEINE')
FROM pg_policies
WHERE schemaname = 'nutrition' AND tablename = 'food_curation_candidates';
SELECT 'curation_decisions_policy_ops',
       COALESCE(string_agg(DISTINCT cmd, ',' ORDER BY cmd), 'KEINE')
FROM pg_policies
WHERE schemaname = 'nutrition' AND tablename = 'food_curation_decisions';

-- Keine Schreib-Policies auf den Curation-Tabellen.
SELECT 'curation_write_policies', COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'nutrition'
  AND tablename IN ('food_curation_candidates','food_curation_decisions')
  AND cmd IN ('INSERT','UPDATE','DELETE');

-- --- RLS bleibt an ---
SELECT 'curation_candidates_rls', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'food_curation_candidates';
SELECT 'curation_decisions_rls', c.relrowsecurity::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'nutrition' AND c.relname = 'food_curation_decisions';

-- --- auth.users bleibt fuer authenticated unerreichbar ---
-- Waere hier ein Grant, koennte ein Nutzer seine eigene Rolle setzen.
SELECT 'auth_users_grants_authenticated',
       COALESCE(string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type), 'KEINE')
FROM information_schema.role_table_grants
WHERE table_schema = 'auth' AND table_name = 'users' AND grantee = 'authenticated';
