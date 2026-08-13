-- =============================================================
-- 072 — Eine Wahrheit für die Suchnormalisierung
-- Datum: 2026-08-14 · Laeuft NACH 071. Idempotent.
-- =============================================================
--
-- BEFUND: Die Faltung stand ZWEIMAL da — als `search_fold` in der
-- Datenbank und als `normalizeFoodSearchText` in
-- apps/web/src/lib/nutrition/food-search.ts. `food_search` nimmt
-- `p_normalized_query` und `p_tokens` als Parameter, die Anwendung
-- faltet also selbst.
--
-- `[cmd]` 2026-08-14 ueber alle 7.140 Namen gemessen: die beiden Regeln
-- liefern bei **4.769 Namen (67 %) VERSCHIEDENE** Ergebnisse.
--   "Hase Fleisch, roh"
--     search_fold        -> "hase fleisch, roh"      (Komma bleibt)
--     normalizeFoodSearch-> "hase fleisch roh"       (Komma wird Leerz.)
-- Auf der Anfrageseite ebenso: "gouda 48 %" wird zu "gouda 48" bzw.
-- "gouda 48 %", "karotte/moehre" zu "karotte moehre" bzw.
-- "karotte/moehre".
--
-- HEUTE FAELLT DAS NICHT AUF, weil die Alias-Tabelle beide Formen
-- traegt (020 legt eine satzzeichenfreie Variante an, 022 weitere).
-- Der Fehler ist also nicht behoben, sondern VERDECKT — und die
-- Relevanzstufen aus 071 vergleichen `p_normalized_query` direkt gegen
-- `search_fold(alias)`. Faellt eine Seite aus dem Takt, bricht die
-- Suche STILL: keine Fehlermeldung, nur leere oder falsch sortierte
-- Ergebnisse.
--
-- =============================================================
-- ENTSCHEIDUNG: Die Datenbank ist die eine Wahrheit
-- =============================================================
-- `search_fold` wird an die Anwendungsregel angeglichen (Satzzeichen zu
-- Leerzeichen, mehrfache Leerzeichen zusammen, trimmen). Damit gilt
-- EINE Regel, und sie steht dort, wo auch die Daten liegen.
--
-- WARUM NICHT UMGEKEHRT (Anwendung an Datenbank angleichen):
--   * `[cmd]` Die Anwendungsregel wird auch fuer Slugs und Tag-Codes
--     benutzt (`normalizeSlug`, `p_tag_code`) — sie kann nicht einfach
--     verschwinden.
--   * Die Datenbank kann die Faltung selbst herstellen, die Anwendung
--     kann die Daten nicht sehen. Wer pruefen will, ob beide Seiten
--     uebereinstimmen, braucht die Regel in der Datenbank.
--
-- WARUM DIE PARAMETER BLEIBEN: `p_normalized_query` und `p_tokens`
-- werden NICHT entfernt. Ein Entfernen aendert die Signatur, und
-- `[cmd]` eine zweite Overload-Signatur hat am 2026-08-04 PostgREST
-- verwirrt. Stattdessen leitet `food_search` die Werte kuenftig SELBST
-- ab und benutzt die Parameter nur noch als Rueckfall — die Anwendung
-- darf weiter liefern, aber die Datenbank entscheidet.
--
-- FOLGE FUER DEN INDEX: Der Ausdrucks-Index aus 022 liegt auf
-- `search_fold(alias)`. Aendert sich die Funktion, muss er neu gebaut
-- werden — das erledigt dieser Schritt mit.
-- =============================================================

BEGIN;

-- --- Die eine Faltungsregel ---
-- Neu gegenueber vorher: `[^a-z0-9]+` wird zu einem Leerzeichen, dann
-- Mehrfach-Leerzeichen zusammengezogen und getrimmt. Das entspricht
-- Zeile fuer Zeile `normalizeFoodSearchText`.
CREATE OR REPLACE FUNCTION nutrition.search_fold(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT btrim(regexp_replace(
           regexp_replace(
             replace(replace(replace(replace(
               lower(coalesce(t, '')),
               'ä', 'ae'), 'ö', 'oe'), 'ü', 'ue'), 'ß', 'ss'),
             '[^a-z0-9]+', ' ', 'g'),
           '\s+', ' ', 'g'))
$function$;

COMMENT ON FUNCTION nutrition.search_fold(text) IS
  'Einzige Faltungsregel der Suche. Muss Zeichen fuer Zeichen '
  'normalizeFoodSearchText in apps/web/src/lib/nutrition/food-search.ts '
  'entsprechen. Die Gegenprobe steht in '
  'supabase/_pipeline/_validierung/v072_normalisierung.sql — laufen die '
  'beiden auseinander, bricht die Suche STILL.';

-- --- Index neu bauen, er haengt am Funktionsergebnis ---
DROP INDEX IF EXISTS nutrition.idx_food_aliases_fold_trgm;
CREATE INDEX idx_food_aliases_fold_trgm
  ON nutrition.food_aliases USING gin (nutrition.search_fold(alias) gin_trgm_ops);

COMMIT;
