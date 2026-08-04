-- v090 — Validierung Identität (090_profile.sql)
-- Ausgabe: eine Tabelle pruefung | soll | ist | ok
-- Läuft in der Ziel-Datenbank; setzt voraus, dass die Rollen
-- anon, authenticated und service_role im Cluster existieren.

WITH checks(pruefung, soll, ist) AS (

  -- Tabelle
  SELECT 'tabelle public.profiles existiert', '1',
         (SELECT count(*) FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relname = 'profiles'
            AND c.relkind = 'r')::text

  -- Spalten: genau id/created_at/updated_at mit erwarteten Typen
  UNION ALL
  SELECT 'spaltenzahl profiles', '3',
         (SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'profiles')::text
  UNION ALL
  SELECT 'spalte id uuid not null', '1',
         (SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'profiles'
            AND column_name = 'id' AND data_type = 'uuid'
            AND is_nullable = 'NO')::text
  UNION ALL
  SELECT 'spalten created_at/updated_at timestamptz not null mit default', '2',
         (SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'profiles'
            AND column_name IN ('created_at', 'updated_at')
            AND data_type = 'timestamp with time zone'
            AND is_nullable = 'NO' AND column_default IS NOT NULL)::text

  -- Fremdschlüssel auf auth.users mit ON DELETE CASCADE
  UNION ALL
  SELECT 'fk profiles.id -> auth.users(id) on delete cascade', '1',
         (SELECT count(*) FROM pg_constraint
          WHERE conrelid = 'public.profiles'::regclass
            AND contype = 'f' AND confdeltype = 'c'
            AND confrelid = 'auth.users'::regclass)::text

  -- RLS
  UNION ALL
  SELECT 'rls aktiv auf profiles', 'true',
         (SELECT relrowsecurity FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relname = 'profiles')::text

  -- Policies: genau 4, eine je Operation
  UNION ALL
  SELECT 'policy-anzahl auf profiles', '4',
         (SELECT count(*) FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'profiles')::text
  UNION ALL
  SELECT 'je genau eine policy fuer SELECT/INSERT/UPDATE/DELETE', '4',
         (SELECT count(DISTINCT cmd) FROM pg_policies
          WHERE schemaname = 'public' AND tablename = 'profiles'
            AND cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE'))::text

  -- Trigger + Funktion
  UNION ALL
  SELECT 'trigger on_auth_user_created auf auth.users', '1',
         (SELECT count(*) FROM pg_trigger
          WHERE tgrelid = 'auth.users'::regclass
            AND tgname = 'on_auth_user_created' AND NOT tgisinternal)::text
  UNION ALL
  SELECT 'funktion handle_new_user security definer + search_path gesetzt', '1',
         (SELECT count(*) FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
            AND p.prosecdef
            AND EXISTS (SELECT 1 FROM unnest(p.proconfig) cfg
                        WHERE cfg LIKE 'search_path=%'))::text

  -- Grants: authenticated S/I/U ja, DELETE nein; anon nichts; service_role alles
  UNION ALL
  SELECT 'grants authenticated SELECT+INSERT+UPDATE', '3',
         (SELECT count(*) FROM unnest(ARRAY['SELECT','INSERT','UPDATE']) AS p(priv)
          WHERE has_table_privilege('authenticated', 'public.profiles', p.priv))::text
  UNION ALL
  SELECT 'KEIN DELETE-Grant fuer authenticated', 'false',
         has_table_privilege('authenticated', 'public.profiles', 'DELETE')::text
  UNION ALL
  SELECT 'KEIN Grant fuer anon (4 Rechte)', '0',
         (SELECT count(*) FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) AS p(priv)
          WHERE has_table_privilege('anon', 'public.profiles', p.priv))::text
  UNION ALL
  SELECT 'service_role volle Rechte (4 Rechte)', '4',
         (SELECT count(*) FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']) AS p(priv)
          WHERE has_table_privilege('service_role', 'public.profiles', p.priv))::text
)
SELECT pruefung, soll, ist, (soll = ist) AS ok
FROM checks
ORDER BY (soll = ist), pruefung;
