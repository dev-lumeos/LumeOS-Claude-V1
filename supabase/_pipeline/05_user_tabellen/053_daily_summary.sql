-- =============================================================
-- 053 — Tagessumme (C-04 / WP-03)
-- Datum: 2026-08-06 · Anker: 6a81297
-- Zweck: nutrition.daily_summary — Tagessummen je Nutzerin und Tag,
--        abgeleitet aus den eingefrorenen Werten in meal_items.
-- Idempotent: CREATE OR REPLACE VIEW.
-- Laeuft NACH 052 (braucht meals und meal_items).
--
-- =============================================================
-- ENTSCHEIDUNG: Sicht (VIEW), nicht materialisierte Sicht,
--               nicht Summentabelle
-- =============================================================
-- C-03 hat diese Wahl ausdruecklich offengelassen. Sie faellt hier.
--
-- (a) Materialisierte Sicht — VERWORFEN.
--     Sie braucht einen Aktualisierungsweg, der bei JEDEM Schreibvorgang
--     greift: Insert, Update und Delete auf meal_items, dazu Delete auf
--     meals (CASCADE!). Wer einen davon vergisst, bekommt keinen Fehler,
--     sondern einen stillen Falschstand — die Summe sieht richtig aus und
--     ist es nicht. Genau diese Fehlerklasse hat dieses Repo schon zweimal
--     teuer bezahlt. Ausserdem kennt PostgreSQL kein inkrementelles
--     REFRESH: jede Aktualisierung rechnet ALLE Nutzerinnen neu.
--
-- (b) Summentabelle — VERWORFEN.
--     Eine zweite Wahrheit neben meal_items. Sie kann von den Positionen
--     abweichen, und dann ist nicht entscheidbar, welche recht hat.
--     Braucht dieselben Trigger wie (a), plus eigene Policies, plus eine
--     Abgleichpruefung. Der Aufwand lohnt erst, wenn Messungen zeigen,
--     dass die Sicht zu langsam ist — heute ist das [annahme], nicht
--     gemessen.
--
-- (c) Sicht — GEWAEHLT.
--     Immer aktuell, weil sie nichts speichert. Kein Aktualisierungsweg,
--     der vergessen werden kann. Keine zweite Wahrheit.
--     Die Summe ist deterministisch: meal_items traegt EINGEFRORENE Werte
--     (ADR-0003), die Sicht summiert nur — sie rechnet nicht gegen
--     food_nutrients. Ein spaeter geaenderter BLS-Wert aendert die
--     Tagessumme der Vergangenheit deshalb NICHT.
--     Die Schnell-Makros liegen als Spalten vor, nicht nur im JSONB:
--     die Summe braucht keine JSONB-Auswertung.
--
-- WAS DIESE SICHT NICHT KANN (benannt, nicht verschwiegen):
--   * Sie ist nicht schneller als die zugrunde liegende Abfrage. Bei
--     vielen Positionen je Tag wird sie linear langsamer. [annahme] Bei
--     realistischen Tagesmengen (Dutzende Positionen) unkritisch —
--     NICHT gemessen, weil es dafuer noch keine Daten gibt.
--   * Sie kann keine Verlaufszahlen ueber Zeitraeume vorhalten
--     (Wochen-/Monatsschnitte). Das waere ein eigener Schritt.
--   * Sie fuehrt KEINE Zielwerte mit (Tagesziel Kalorien o. ae.) — die
--     gehoeren zum Profil, nicht zur Summe.
--   * Sie summiert nur die neun Schnell-Makros. Die uebrigen bis zu 138
--     Naehrstoffe stehen je Position im JSONB; eine Summe darueber
--     braeuchte eine JSONB-Aggregation und ist bewusst nicht Teil davon.
--
-- =============================================================
-- FEHLENDER WERT BLEIBT FEHLEND (verbindlich, wie C-03)
-- =============================================================
-- SUM() ignoriert NULL. Eine Position ohne gemessenen Wert wuerde die
-- Summe also stillschweigend zu niedrig machen, ohne dass man es sieht.
-- Deshalb traegt die Sicht je Makro ZWEI Angaben:
--   <makro>              die Summe der vorhandenen Werte
--   <makro>_missing      wie viele Positionen dieses Tages KEINEN Wert
--                        fuer dieses Makro hatten
-- Ist <makro>_missing > 0, ist die Summe eine Untergrenze, keine Wahrheit.
-- Zusaetzlich: hat KEINE Position einen Wert, ist die Summe NULL statt 0 —
-- "nichts gemessen" ist nicht "null Gramm".
-- Die Oberflaeche muss das zeigen; die reine Funktion in diary-summary.ts
-- liefert dafuer die noetigen Angaben.
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- security_invoker: die Sicht laeuft mit den Rechten der Abfragenden,
-- NICHT der Eigentuemerin. Nur so greifen die RLS-Policies von
-- meal_items (aus 052) — ohne diese Angabe liefe die Sicht als postgres
-- und zeigte jeder Nutzerin ALLE Tagessummen.
--
-- Verfuegbar seit PostgreSQL 15; [cmd] die Instanz laeuft auf 17.6.
-- Der Nachweis, dass es wirklich greift, steht in v053 und ist mit zwei
-- echten Sessions gefuehrt — nicht angenommen.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW nutrition.daily_summary
WITH (security_invoker = true) AS
SELECT
  m.user_id,
  m.entry_date,
  COUNT(DISTINCT m.id)                              AS meal_count,
  COUNT(mi.id)                                      AS item_count,

  SUM(mi.enercc)                                    AS enercc,
  SUM(mi.prot625)                                   AS prot625,
  SUM(mi.fat)                                       AS fat,
  SUM(mi.cho)                                       AS cho,
  SUM(mi.fibt)                                      AS fibt,
  SUM(mi.sugar)                                     AS sugar,
  SUM(mi.fasat)                                     AS fasat,
  SUM(mi.nacl)                                      AS nacl,
  SUM(mi.water_g)                                   AS water_g,

  -- Luecken je Makro: Positionen ohne gemessenen Wert.
  -- COUNT(mi.id) zaehlt nur echte Positionen (NULL bei Mahlzeiten ohne
  -- Positionen), COUNT(mi.<makro>) nur die mit Wert — die Differenz ist
  -- die Zahl der Luecken.
  COUNT(mi.id) - COUNT(mi.enercc)                   AS enercc_missing,
  COUNT(mi.id) - COUNT(mi.prot625)                  AS prot625_missing,
  COUNT(mi.id) - COUNT(mi.fat)                      AS fat_missing,
  COUNT(mi.id) - COUNT(mi.cho)                      AS cho_missing,
  COUNT(mi.id) - COUNT(mi.fibt)                     AS fibt_missing,
  COUNT(mi.id) - COUNT(mi.sugar)                    AS sugar_missing,
  COUNT(mi.id) - COUNT(mi.fasat)                    AS fasat_missing,
  COUNT(mi.id) - COUNT(mi.nacl)                     AS nacl_missing,
  COUNT(mi.id) - COUNT(mi.water_g)                  AS water_g_missing
FROM nutrition.meals m
LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
GROUP BY m.user_id, m.entry_date;

-- LEFT JOIN, nicht INNER: ein Tag mit angelegter, aber leerer Mahlzeit
-- soll mit meal_count 1 und item_count 0 erscheinen, nicht verschwinden.
-- Alle Summen sind dann NULL — richtig, denn gemessen wurde nichts.

COMMENT ON VIEW nutrition.daily_summary IS
  'Tagessummen aus den eingefrorenen Werten in meal_items (C-04, 2026-08-06). '
  'security_invoker=true, damit die RLS-Policies von meals/meal_items greifen. '
  'Je Makro zusaetzlich <makro>_missing: Zahl der Positionen ohne Wert — '
  'ist sie > 0, ist die Summe eine Untergrenze. Keine Summe ueber den '
  'JSONB-Schnappschuss, nur ueber die neun Schnell-Makros.';

-- -------------------------------------------------------------
-- Rechte. Muster wie 060/052: ohne Grant ist jede Policy toter Text.
-- Nur SELECT — eine Sicht mit Aggregation ist ohnehin nicht schreibbar.
-- KEINE eigenen Policies: die Sicht hat keine eigenen Zeilen. Der
-- Zeilenschutz kommt durch security_invoker aus meals und meal_items.
-- -------------------------------------------------------------
GRANT SELECT ON nutrition.daily_summary TO authenticated, service_role;

COMMIT;
