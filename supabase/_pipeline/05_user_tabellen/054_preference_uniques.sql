-- =============================================================
-- 054 — Duplikatschutz für die übrigen fünf Zieltypen (C-12)
-- Datum: 2026-08-06 · Anker: 2195de4
-- Zweck: partielle UNIQUE-Indizes auf nutrition.food_preference_items
--        für category, tag, cuisine, exclusion_preset, catalog_item.
--        `food` hat seinen seit C-02 (050).
-- Idempotent: CREATE UNIQUE INDEX IF NOT EXISTS.
-- Läuft NACH 050 (braucht die Tabelle).
--
-- =============================================================
-- WARUM ÜBERHAUPT
-- =============================================================
-- `[cmd]` 2026-08-06: Die Tabelle trägt genau EINEN fachlichen UNIQUE,
-- `uq_food_pref_items_user_food` auf (user_id, food_id) partiell
-- WHERE food_id IS NOT NULL. Die fünf anderen Zieltypen haben keinen.
-- Damit liegt dort dieselbe Wettlaufsituation, die C-02 für Food-Zeilen
-- aufgelöst hat: zwei gleichzeitige Anfragen lesen beide nichts, beide
-- legen an, und danach existieren zwei widersprüchliche Zeilen.
--
-- Heute NICHT ausnutzbar: `[cmd]` der Schreibpfad in
-- preferences-write.ts filtert an allen drei Stellen auf
-- `target_type = 'food'` — für die anderen fünf gibt es keinen. Scharf
-- wird es mit dem Preset-/Profil-Schreibpfad in Settings. Der Index
-- gehört VOR diesen Schreibpfad, nicht danach: nachträglich hinzugefügt
-- scheitert er an den Daten, die inzwischen entstanden sind.
--
-- =============================================================
-- WARUM `preference` NICHT IN DEN SCHLÜSSEL GEHÖRT
-- =============================================================
-- Am Schreibmodell nachgeprüft, nicht übernommen:
-- `[read]` `decideFoodPreferenceWrite()` in preferences-model.ts liefert
-- bei abweichender Präferenz **'update'**, nicht 'insert' — eine
-- bestehende Zeile wird UMGESTUFT. 'duplicate' (→ HTTP 409) gilt nur,
-- wenn dieselbe Präferenz schon steht.
-- Wäre `preference` Teil des Schlüssels, könnten „mag ich" und
-- „ausschliessen" für dasselbe Ziel als ZWEI Zeilen nebeneinander
-- existieren — ein widersprüchlicher Zustand, den die Anwendung nie
-- erzeugen will und die Datenbank dann nicht verhindert.
-- Dieselbe Begründung wie beim Food-Fall; sie hängt nicht am Zieltyp,
-- sondern am Umstufungsmodell. `[cmd]` Der heutige Schreibpfad ist zwar
-- auf 'food' festgelegt, das Modell darunter kennt aber keinen Zieltyp.
--
-- =============================================================
-- WARUM DIE PRÄDIKATE UNTERSCHIEDLICH AUSSEHEN
-- =============================================================
-- Der CHECK `food_preference_items_exactly_one_target` zählt NICHT
-- einheitlich. `[cmd]` aus pg_get_constraintdef gelesen:
--   food_id, category_id, tag_code  ->  IS NOT NULL
--   cuisine_code, exclusion_preset_code, catalog_item_code
--                                   ->  NULLIF(x, '') IS NOT NULL
-- Für die drei Textcodes gilt der LEERE STRING als nicht gesetzt.
-- Ein Index mit `WHERE cuisine_code IS NOT NULL` würde deshalb Zeilen
-- erfassen, die der CHECK als „Ziel nicht gesetzt" behandelt — zwei
-- Zeilen mit cuisine_code = '' und verschiedenen echten Zielen kollidierten
-- im Cuisine-Index, obwohl sie fachlich nichts miteinander zu tun haben.
-- Die Prädikate unten spiegeln deshalb den CHECK exakt.
--
-- TRENNSCHÄRFE: Weil der CHECK genau EIN gesetztes Zielfeld erzwingt,
-- fällt jede Zeile in genau einen dieser sechs Indizes. Überlappung ist
-- konstruktiv ausgeschlossen — nicht durch Absprache, sondern durch den
-- CHECK. `[cmd]` in der Wegwerf-DB nachgewiesen (v054).
-- =============================================================

BEGIN;

-- category: FK auf nutrition.food_categories(id), zählt per IS NOT NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_category
  ON nutrition.food_preference_items(user_id, category_id)
  WHERE category_id IS NOT NULL;

-- tag: FK auf nutrition.tag_definitions(code), zählt per IS NOT NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_tag
  ON nutrition.food_preference_items(user_id, tag_code)
  WHERE tag_code IS NOT NULL;

-- cuisine: freier Text ohne FK, leerer String gilt als nicht gesetzt.
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_cuisine
  ON nutrition.food_preference_items(user_id, cuisine_code)
  WHERE NULLIF(cuisine_code, '') IS NOT NULL;

-- exclusion_preset: wie cuisine.
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_exclusion_preset
  ON nutrition.food_preference_items(user_id, exclusion_preset_code)
  WHERE NULLIF(exclusion_preset_code, '') IS NOT NULL;

-- catalog_item: wie cuisine.
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_pref_items_user_catalog_item
  ON nutrition.food_preference_items(user_id, catalog_item_code)
  WHERE NULLIF(catalog_item_code, '') IS NOT NULL;

COMMIT;

-- =============================================================
-- WAS DIESE INDIZES NICHT LEISTEN
-- =============================================================
-- * Sie ersetzen den Schreibpfad nicht. Er muss den 23505 weiterhin
--   abfangen und in eine Umstufung oder HTTP 409 übersetzen — genau wie
--   setFoodPreference() es für Food-Zeilen tut (Insert zuerst, dann
--   lesen und entscheiden).
-- * Sie sagen nichts über die Gültigkeit der Codes. cuisine_code,
--   exclusion_preset_code und catalog_item_code haben `[cmd]` KEINEN
--   Fremdschlüssel — ein Tippfehler bleibt ein Tippfehler, nur eben ein
--   eindeutiger. Ob diese drei Kataloge in die Datenbank gehören, ist
--   eine eigene Frage (heute liegen sie als Code-Literal in
--   preferences-catalog.ts).
-- * Sie verhindern nicht, dass dieselbe Nutzerin dasselbe Lebensmittel
--   einmal direkt und einmal über seine Kategorie erfasst. Das ist kein
--   Duplikat, sondern zwei verschiedene Aussagen.
-- =============================================================
