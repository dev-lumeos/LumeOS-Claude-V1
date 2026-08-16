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

-- =============================================================
-- ENTSCHEIDUNG (C-37, 2026-08-15): Mikros FLACH, nicht als JSONB
-- =============================================================
-- Der Kopf oben sagte noch, eine Summe ueber die uebrigen Naehrstoffe
-- sei "bewusst nicht Teil davon". Das gilt fuer die vollen 138 weiter.
-- Fuer die 24 Werte aus SPEC_06 Abschnitt 16 faellt die Wahl jetzt.
--
-- Zur Wahl standen 24 flache Spaltenpaare (48 Spalten zusaetzlich zu den
-- vorhandenen 22) gegen ein JSONB je Naehrstoff mit Wert und
-- Abdeckungsgrad.
--
-- GEWAEHLT: flach, aus drei Gruenden.
--
-- (1) Die Daten sind dicht, nicht duenn. [cmd] Belegung der 24 Codes in
--     food_nutrients ueber 7.140 Lebensmittel: von 87,2 % (ID, Iodid)
--     bis 99,9 % (FOL, VITA); 23 der 24 liegen ueber 94 %. Ein JSONB
--     lohnt bei duennen Daten, wo die meisten Schluessel fehlen. Hier
--     waere fast jeder Schluessel in fast jeder Zeile gesetzt — die
--     Schluesselnamen wuerden je Zeile mitgeschrieben, ohne etwas zu
--     sparen.
--
-- (2) Gleiche Form fuer gleiche Sache. Die neun Makros stehen flach mit
--     <makro> und <makro>_missing. Mikros daneben in anderer Form
--     zwaenge jede Abfrage, zwei Zugriffsarten zu kennen, und jede
--     Auswertung, zwei Lueckenbegriffe zu unterscheiden.
--
-- (3) Erweiterbarkeit ist hier kein echtes Argument fuer JSONB. Ein
--     25. Naehrstoff heisst so oder so: Schritt aendern, Sicht neu
--     anlegen, Sollstand nachziehen. JSONB verschoebe die Aenderung nur
--     von der Spaltenliste in den auspackenden Code.
--
-- GEGEN die flache Form spricht die Breite: 70 Spalten sind viel fuer
-- eine Sicht, und wer SELECT * macht, bekommt sie alle. Das ist der
-- Preis und er ist bewusst bezahlt. [annahme] Laufzeit wurde NICHT
-- gemessen: [cmd] meals und meal_items haben heute 0 Zeilen, es gibt
-- also nichts zu messen. Sollte sich die Breite spaeter als Last
-- erweisen, ist der Rueckweg eine zweite, schmale Sicht — nicht ein
-- Umbau dieser.
--
-- NICHT UEBERNOMMEN aus der Spec-Fassung: dort steht durchgehend
-- COALESCE(..., 0). [read] Damit wuerde ein nicht erfasster Eisenwert
-- zu "null Milligramm Eisen" — eine Aussage, die die Daten nicht
-- hergeben. Die gebaute Sicht ist an dieser Stelle besser als die Spec
-- und bleibt es: fehlend bleibt NULL, gezaehlt wird in <code>_missing.
-- Ebenfalls nicht uebernommen: die Spec-Namen (total_vita_ug &c.) und
-- der eingebettete Wasser-Unterabfrage — Wasser laeuft getrennt in
-- hydration_summary (056) und bleibt dort.
--
-- C-53, 2026-08-16: Zwei essenzielle Fettsaeuren kommen dazu. LEU war
-- [cmd] schon seit C-37 enthalten, obwohl C-53 es als fehlend nannte.
-- PostgreSQL erlaubt bei CREATE OR REPLACE VIEW nur Anhaengen, nicht
-- Einfuegen in der Mitte. Deshalb stehen die C-53-Spalten am Ende,
-- damit die 70 alten Spalten unveraendert bleiben.
--
-- ZAEHLWEISE DER LUECKEN. Bei den Makros ist der fehlende Wert eine
-- NULL-Spalte, bei den Mikros ein FEHLENDER SCHLUESSEL im JSONB
-- ([read] 052: "Fehlende Werte sind kein Schluessel — ein fehlender
-- Naehrwert ist nicht 0"). Der Operator ->> liefert fuer einen
-- fehlenden Schluessel NULL, also zaehlt COUNT(...) ihn nicht mit —
-- dieselbe Rechnung wie bei den Makros: COUNT(mi.id) minus COUNT(wert).
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
  COUNT(mi.id) - COUNT(mi.water_g)                  AS water_g_missing,

  -- -----------------------------------------------------------
  -- Mikronaehrstoffe (C-37). Quelle ist der eingefrorene
  -- JSONB-Schnappschuss mi.nutrients, NICHT food_nutrients — die Sicht
  -- rechnet weiterhin nicht gegen die Stammdaten (ADR-0003).
  -- Reihenfolge: display_tier, dann sort_index aus nutrient_defs.
  -- Einheiten stehen je Zeile; sie stammen aus nutrient_defs und werden
  -- hier NICHT umgerechnet.
  -- [cmd] Alle 24 Codes sind in nutrient_defs vorhanden.
  -- -----------------------------------------------------------
  SUM((mi.nutrients->>'VITA')::NUMERIC)           AS vita,     -- µg
  SUM((mi.nutrients->>'VITD')::NUMERIC)           AS vitd,     -- µg
  SUM((mi.nutrients->>'VITE')::NUMERIC)           AS vite,     -- mg
  SUM((mi.nutrients->>'VITK')::NUMERIC)           AS vitk,     -- µg
  SUM((mi.nutrients->>'THIA')::NUMERIC)           AS thia,     -- mg
  SUM((mi.nutrients->>'RIBF')::NUMERIC)           AS ribf,     -- mg
  SUM((mi.nutrients->>'NIA')::NUMERIC)            AS nia,      -- mg
  SUM((mi.nutrients->>'VITB6')::NUMERIC)          AS vitb6,    -- µg
  SUM((mi.nutrients->>'FOL')::NUMERIC)            AS fol,      -- µg
  SUM((mi.nutrients->>'VITB12')::NUMERIC)         AS vitb12,   -- µg
  SUM((mi.nutrients->>'VITC')::NUMERIC)           AS vitc,     -- mg
  SUM((mi.nutrients->>'NA')::NUMERIC)             AS na,       -- mg
  SUM((mi.nutrients->>'K')::NUMERIC)              AS k,        -- mg
  SUM((mi.nutrients->>'CA')::NUMERIC)             AS ca,       -- mg
  SUM((mi.nutrients->>'MG')::NUMERIC)             AS mg,       -- mg
  SUM((mi.nutrients->>'P')::NUMERIC)              AS p,        -- mg
  SUM((mi.nutrients->>'FE')::NUMERIC)             AS fe,       -- mg
  SUM((mi.nutrients->>'ZN')::NUMERIC)             AS zn,       -- mg
  SUM((mi.nutrients->>'ID')::NUMERIC)             AS iodid,    -- µg (Code ID)
  SUM((mi.nutrients->>'CHORL')::NUMERIC)          AS chorl,    -- mg
  SUM((mi.nutrients->>'FAPUN3')::NUMERIC)         AS fapun3,   -- g (Tier 2)
  SUM((mi.nutrients->>'FAPUN6')::NUMERIC)         AS fapun6,   -- g (Tier 2)
  SUM((mi.nutrients->>'AAE9')::NUMERIC)           AS aae9,     -- g (Tier 2)
  SUM((mi.nutrients->>'LEU')::NUMERIC)            AS leu,      -- g (Tier 2)

  -- Luecken je Mikro. Ein fehlender Naehrstoff ist im Schnappschuss ein
  -- FEHLENDER SCHLUESSEL, nicht der Wert 0 ([read] 052). ->> liefert
  -- dafuer NULL, COUNT() zaehlt NULL nicht — dieselbe Rechnung wie oben.
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITA')::NUMERIC) AS vita_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITD')::NUMERIC) AS vitd_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITE')::NUMERIC) AS vite_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITK')::NUMERIC) AS vitk_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'THIA')::NUMERIC) AS thia_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'RIBF')::NUMERIC) AS ribf_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'NIA')::NUMERIC) AS nia_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITB6')::NUMERIC) AS vitb6_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'FOL')::NUMERIC) AS fol_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITB12')::NUMERIC) AS vitb12_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'VITC')::NUMERIC) AS vitc_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'NA')::NUMERIC) AS na_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'K')::NUMERIC) AS k_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'CA')::NUMERIC) AS ca_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'MG')::NUMERIC) AS mg_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'P')::NUMERIC) AS p_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'FE')::NUMERIC) AS fe_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'ZN')::NUMERIC) AS zn_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'ID')::NUMERIC) AS iodid_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'CHORL')::NUMERIC) AS chorl_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'FAPUN3')::NUMERIC) AS fapun3_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'FAPUN6')::NUMERIC) AS fapun6_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'AAE9')::NUMERIC) AS aae9_missing,
  COUNT(mi.id) - COUNT((mi.nutrients->>'LEU')::NUMERIC) AS leu_missing,

  -- C-53: angehaengt, nicht einsortiert, damit CREATE OR REPLACE VIEW
  -- keine bestehenden Spalten verschiebt. Beide Codes sind essenziell
  -- und haben seit C-52 Goals-Zielwerte; bewertet werden sie erst durch
  -- daily_reference_assessment.
  SUM((mi.nutrients->>'F18:2CN6')::NUMERIC)       AS f18_2cn6, -- g Linolsaeure
  COUNT(mi.id) - COUNT((mi.nutrients->>'F18:2CN6')::NUMERIC) AS f18_2cn6_missing,
  SUM((mi.nutrients->>'F18:3CN3')::NUMERIC)       AS f18_3cn3, -- g Alpha-Linolensaeure
  COUNT(mi.id) - COUNT((mi.nutrients->>'F18:3CN3')::NUMERIC) AS f18_3cn3_missing
FROM nutrition.meals m
LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
GROUP BY m.user_id, m.entry_date;

-- LEFT JOIN, nicht INNER: ein Tag mit angelegter, aber leerer Mahlzeit
-- soll mit meal_count 1 und item_count 0 erscheinen, nicht verschwinden.
-- Alle Summen sind dann NULL — richtig, denn gemessen wurde nichts.

COMMENT ON VIEW nutrition.daily_summary IS
  'Tagessummen aus den eingefrorenen Werten in meal_items (C-04, 2026-08-06; '
  'Mikros ergaenzt C-37, 2026-08-15). '
  'security_invoker=true, damit die RLS-Policies von meals/meal_items greifen. '
  'Je Wert zusaetzlich <wert>_missing: Zahl der Positionen ohne Wert — '
  'ist sie > 0, ist die Summe eine Untergrenze. Neun Makros aus den Spalten, '
  '24 Mikros aus dem JSONB-Schnappschuss mi.nutrients, plus C-53: '
  'Linolsaeure und Alpha-Linolensaeure. '
  'Diese Sicht SUMMIERT und BEWERTET NICHT: sie fuehrt keine Referenz- oder '
  'Tageswerte und sagt nicht, ob eine Menge ausreicht.';

-- -------------------------------------------------------------
-- Rechte. Muster wie 060/052: ohne Grant ist jede Policy toter Text.
-- Nur SELECT — eine Sicht mit Aggregation ist ohnehin nicht schreibbar.
-- KEINE eigenen Policies: die Sicht hat keine eigenen Zeilen. Der
-- Zeilenschutz kommt durch security_invoker aus meals und meal_items.
-- -------------------------------------------------------------
GRANT SELECT ON nutrition.daily_summary TO authenticated, service_role;

COMMIT;
