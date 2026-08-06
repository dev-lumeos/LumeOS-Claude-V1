-- =============================================================
-- 062 — Objektliste für die Rechteprüfung (B-22)
-- Datum: 2026-08-06 · Anker: 6a81297
-- Zweck: nutrition.pruef_objektliste() — nennt jede Tabelle und jede
--        Sicht im Schema `nutrition`, damit die Rechteprüfung ihre
--        Sollliste aus dem Katalog zieht statt aus einer Handliste.
-- Idempotent: CREATE OR REPLACE FUNCTION.
--
-- =============================================================
-- WARUM DIESE FUNKTION EXISTIERT
-- =============================================================
-- Die Prüfung (`_validierung/zugriffsrechte-pruefen.mjs`) brauchte eine
-- Liste dessen, was `authenticated` erreichen können muss. Zwei Wege
-- schieden aus:
--
--   (a) Handgepflegte Liste im Skript — VERWORFEN. Sie veraltet beim
--       ersten neuen Objekt. Genau so entstand der Curation-Bug: die
--       Curation-Tabellen standen in keiner Prüfung, weil niemand sie
--       nachgetragen hatte.
--
--   (b) Die OpenAPI-Beschreibung von PostgREST (`GET /rest/v1/`) —
--       VERWORFEN, und das ist der interessante Fall.
--       [cmd] 2026-08-06 belegt: wird `authenticated` das SELECT auf
--       nutrition.food_tags entzogen, VERSCHWINDET die Tabelle aus der
--       Beschreibung. Die Prüfung hätte sie dann nicht als "unlesbar"
--       gemeldet, sondern gar nicht mehr gekannt — ein stiller blinder
--       Fleck genau an der Stelle, für die die Prüfung gebaut ist.
--       Eine Prüfung darf ihre Sollliste nicht vom Prüfling erzeugen
--       lassen.
--
--   (c) Systemkatalog — GEWÄHLT. Er sieht alles, unabhängig von den
--       Rechten der Aufruferin.
--
-- SECURITY DEFINER, mit Absicht und mit engen Grenzen:
--   Die Funktion muss Objekte nennen können, die die aufrufende Rolle
--   nicht lesen darf — sonst hat sie denselben blinden Fleck wie (b).
--   Sie gibt ausschliesslich NAMEN und die Art (Tabelle/Sicht) zurück,
--   niemals Inhalte. Ein Name ist keine schützenswerte Information: die
--   Struktur des Schemas steht ohnehin im Repo.
--   search_path = '' nach dem Muster von handle_new_user.
-- =============================================================

BEGIN;

CREATE OR REPLACE FUNCTION nutrition.pruef_objektliste()
RETURNS TABLE (objekt text, art text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.relname::text AS objekt,
         CASE c.relkind WHEN 'r' THEN 'TABLE' WHEN 'v' THEN 'VIEW' ELSE 'OTHER' END AS art
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'nutrition'
    AND c.relkind IN ('r', 'v')
  ORDER BY 1;
$$;

REVOKE ALL ON FUNCTION nutrition.pruef_objektliste() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION nutrition.pruef_objektliste() TO authenticated, service_role;

COMMENT ON FUNCTION nutrition.pruef_objektliste() IS
  'Objektliste des Schemas nutrition fuer die Rechtepruefung (B-22, 2026-08-06). '
  'SECURITY DEFINER mit Absicht: die Pruefung muss auch Objekte kennen, die die '
  'aufrufende Rolle NICHT lesen darf — sonst hat sie einen blinden Fleck genau '
  'dort, wo sie hinsehen soll. Gibt nur Namen und Art zurueck, niemals Inhalte.';

COMMIT;
