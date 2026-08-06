-- =============================================================
-- 061 — Minimales Rollenkonzept: Admin (C.2, Vorlage — NICHT angewendet)
-- Datum: 2026-08-06 · Anker: f4bf993
-- Zweck: Eine einzige Rolle ("admin") einführen, damit die
--        Curation-Tabellen einen definierten Leser bekommen, statt
--        pauschal für `authenticated` geöffnet zu werden.
-- Status: WARTET AUF FREIGABE. In der Wegwerf-DB nachgewiesen,
--        nicht auf die laufende Instanz angewendet.
-- Idempotent: Funktionen per CREATE OR REPLACE, Policies per
--        DROP POLICY IF EXISTS + CREATE (Muster 060).
--
-- =============================================================
-- WO DIE ROLLE LEBT — und warum nicht woanders
-- =============================================================
-- Gewählt: auth.users.raw_app_meta_data, gelesen über den JWT-Claim
--          request.jwt.claims -> 'app_metadata' -> 'role'.
--
-- Die drei erwogenen Orte, je mit dem Grund für oder gegen:
--
-- (a) Spalte auf public.profiles — VERWORFEN.
--     profiles trägt heute 4 Policies mit auth.uid() = id, darunter
--     profiles_update mit WITH CHECK (auth.uid() = id). Eine Nutzerin
--     DARF ihre eigene profiles-Zeile ändern. Käme dort eine Spalte
--     `is_admin` hinzu, könnte sie sich per PATCH selbst zum Admin
--     machen — die Policy prüft die Identität, nicht die Spalte.
--     Reparierbar wäre das nur mit einer zusätzlichen Sperre (Trigger
--     oder Spalten-Grant), also mit einem zweiten Mechanismus, der
--     genau dann bricht, wenn ihn jemand vergisst.
--
-- (b) Eigene Tabelle (z. B. nutrition.app_roles) — VERWORFEN für jetzt.
--     Sicher machbar (RLS an, keine Schreib-Policy für authenticated),
--     aber sie kostet einen Join in JEDER Policy, die die Rolle prüft,
--     und eine zweite Wahrheit neben auth.users. Bei genau einer Rolle
--     und [cmd] genau einem Nutzer ist das Aufwand ohne Gegenwert.
--     Wird interessant, sobald Rollen fachlich differenzieren
--     (Coach, Gym, Supplier) — dann als eigener Schritt.
--
-- (c) auth.users.raw_app_meta_data — GEWÄHLT.
--     [cmd] 2026-08-06 belegt, nicht angenommen:
--       * PUT /auth/v1/user mit {"app_metadata":{"role":"admin"}}
--         antwortet 403 {"error_code":"not_admin",
--         "msg":"Updating app_metadata requires admin privileges"}.
--       * Derselbe Aufruf mit {"data":{"role":"admin"}} GELINGT — der
--         Wert landet in raw_user_meta_data und im JWT-Claim
--         user_metadata. Ein Nutzer kann sich dort also nach Belieben
--         zum "admin" erklären.
--       * information_schema.role_table_grants: auf auth.users hat NUR
--         postgres Rechte. authenticated hat weder SELECT noch UPDATE.
--     Daraus die harte Regel unten: die Policies lesen ausschliesslich
--     app_metadata. Wer user_metadata liest, baut die Lücke ein.
--
-- Gesetzt wird die Rolle ausserhalb der Anwendung: per Admin-API oder
-- direkt als postgres (siehe Abschnitt 4). Es gibt bewusst KEINEN
-- Anwendungspfad, der Rollen vergibt.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Die Rollenprüfung als Funktion — eine Stelle, nicht je Policy.
--
--    STABLE, weil der Claim innerhalb einer Anweisung konstant ist.
--    SECURITY INVOKER (Vorgabe): die Funktion liest nur den Claim der
--    aufrufenden Sitzung, sie braucht keine fremden Rechte.
--    search_path = '' nach dem Muster von handle_new_user.
--
--    Liest AUSSCHLIESSLICH app_metadata. Der Standard ist "kein Admin":
--    fehlender Claim, fehlendes app_metadata, fehlende role, anderer
--    Wert — alles ergibt false. Es gibt keinen Pfad, auf dem "unbekannt"
--    zu "erlaubt" wird.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(
      current_setting('request.jwt.claims', true), ''
    )::jsonb -> 'app_metadata' ->> 'role' = 'admin',
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

COMMENT ON FUNCTION public.is_admin() IS
  'Rollenprüfung (C.2, 2026-08-06). Liest NUR den JWT-Claim '
  'app_metadata->>role. user_metadata ist vom Nutzer selbst setzbar '
  '([cmd] belegt) und darf hier niemals gelesen werden. '
  'Standard ohne Claim: false.';

-- -------------------------------------------------------------
-- 2. Curation-Tabellen: Lesen für Admins.
--
--    Bewusst NUR SELECT. Die Seite ist [cmd] read-only (curation.ts
--    enthält keine Schreiboperation; die RPC curation_overview macht
--    drei COUNT(*)). Schreibrechte kämen erst mit einem echten
--    Kurations-Schreibpfad — und der gehört nach apps/admin, nicht
--    nach apps/web (docs/spezifikation/20-apps/web/00-app-web.md:
--    "web kennt genau eine Rolle ... wer verwaltet, in admin").
--
--    RLS bleibt an (aus 060). Bisher galt: RLS an, keine Policy =
--    für authenticated dicht. Das war kein Fehler, sondern eine
--    bewusste Lücke mit offener Frage — jetzt beantwortet.
-- -------------------------------------------------------------
GRANT SELECT ON
  nutrition.food_curation_candidates,
  nutrition.food_curation_decisions
TO authenticated;

DROP POLICY IF EXISTS food_curation_candidates_select_admin
  ON nutrition.food_curation_candidates;
CREATE POLICY food_curation_candidates_select_admin
  ON nutrition.food_curation_candidates
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS food_curation_decisions_select_admin
  ON nutrition.food_curation_decisions;
CREATE POLICY food_curation_decisions_select_admin
  ON nutrition.food_curation_decisions
  FOR SELECT TO authenticated USING (public.is_admin());

-- KEINE INSERT/UPDATE/DELETE-Policies. Ohne sie ist Schreiben für
-- authenticated gesperrt, auch für Admins. service_role arbeitet
-- weiterhin per bypassrls daran vorbei (Importe, Pipeline).

COMMIT;

-- =============================================================
-- 3. WAS MIT NUTZERN OHNE ROLLE PASSIERT
-- =============================================================
-- Nichts ändert sich für sie. is_admin() liefert false, die
-- SELECT-Policies greifen nicht, die Curation-Tabellen bleiben
-- unsichtbar (leere Ergebnismenge statt Fehler, sobald der Grant da
-- ist — RLS filtert, sie sperrt nicht mehr aus).
-- Der Standard ist "kein Admin", ohne dass irgendwo etwas gesetzt
-- werden muss.
--
-- =============================================================
-- 4. ROLLE VERGEBEN — nicht Teil dieser Datei
-- =============================================================
-- Bewusst kein automatischer Teil der Kette: eine Kettendatei, die
-- Adminrechte vergibt, würde sie in jeder Umgebung vergeben.
--
-- Tom als Admin setzen (manuell, als postgres, nach Freigabe):
--
--   UPDATE auth.users
--      SET raw_app_meta_data =
--          COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--    WHERE email = 'dev@lumeos.app';
--
-- Danach muss die Sitzung erneuert werden (ab-/anmelden oder Token
-- auffrischen) — der Claim steckt im JWT, ein bestehendes Token trägt
-- die alte Rolle bis zum Ablauf ([cmd] jwt_expiry = 3600 in
-- supabase/config.toml).
--
-- Rolle entziehen:
--   UPDATE auth.users
--      SET raw_app_meta_data = raw_app_meta_data - 'role'
--    WHERE email = 'dev@lumeos.app';
-- =============================================================
