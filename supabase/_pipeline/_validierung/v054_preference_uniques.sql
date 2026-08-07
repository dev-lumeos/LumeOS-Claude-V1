-- v054 — Validierung des Duplikatschutzes (C-12, 2026-08-06)
-- Erwartet nach Lauf von 054. Stil wie v050/v052/v053.

-- --- Alle sechs Indizes vorhanden, UNIQUE und partiell ---
SELECT 'uq_user_food_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_food'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';
SELECT 'uq_user_category_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_category'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';
SELECT 'uq_user_tag_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_tag'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';
SELECT 'uq_user_cuisine_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_cuisine'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';
SELECT 'uq_user_exclusion_preset_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_exclusion_preset'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';
SELECT 'uq_user_catalog_item_exists', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_catalog_item'
  AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%WHERE%';

-- --- Sechs fachliche UNIQUEs insgesamt, keiner zu viel ---
SELECT 'fachliche_uniques_gesamt', COUNT(*)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname LIKE 'uq_food_pref_items_%';

-- --- KEIN Index enthaelt die SPALTE `preference` ---
-- Waere preference Teil des Schluessels, koennten "mag ich" und
-- "ausschliessen" fuer dasselbe Ziel als zwei Zeilen nebeneinander stehen.
-- Das Schreibmodell stuft stattdessen dieselbe Zeile um.
--
-- Geprueft ueber pg_attribute, NICHT ueber indexdef LIKE '%preference%':
-- der Tabellenname `food_preference_items` steht in JEDEM indexdef, das
-- Muster traf also immer und meldete faelschlich rot. Der Fehler lag in
-- der Pruefung, nicht in den Indizes ([cmd] 2026-08-06 auseinandergehalten).
SELECT 'kein_index_mit_spalte_preference', (COUNT(*) = 0)::text
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
WHERE c.relname LIKE 'uq_food_pref_items_%' AND a.attname = 'preference';

-- --- Die drei Textcode-Indizes spiegeln den CHECK (NULLIF-Semantik) ---
-- Ein Praedikat `IS NOT NULL` statt `NULLIF(x,'') IS NOT NULL` wuerde
-- Zeilen erfassen, die der CHECK als "nicht gesetzt" behandelt.
SELECT 'cuisine_index_nullif_semantik', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_cuisine' AND indexdef LIKE '%NULLIF%';
SELECT 'exclusion_preset_index_nullif_semantik', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_exclusion_preset' AND indexdef LIKE '%NULLIF%';
SELECT 'catalog_item_index_nullif_semantik', (COUNT(*) = 1)::text
FROM pg_indexes WHERE schemaname='nutrition' AND tablename='food_preference_items'
  AND indexname='uq_food_pref_items_user_catalog_item' AND indexdef LIKE '%NULLIF%';

-- --- Der CHECK, auf dem die Trennschaerfe beruht, steht noch ---
SELECT 'exactly_one_target_check_vorhanden', (COUNT(*) = 1)::text
FROM pg_constraint WHERE conname='food_preference_items_exactly_one_target';

-- --- Bestand: keine Zeile verletzt einen der sechs Indizes ---
SELECT 'dubletten_food', COUNT(*)::text FROM (
  SELECT user_id, food_id FROM nutrition.food_preference_items
  WHERE food_id IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;
SELECT 'dubletten_category', COUNT(*)::text FROM (
  SELECT user_id, category_id FROM nutrition.food_preference_items
  WHERE category_id IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;
SELECT 'dubletten_tag', COUNT(*)::text FROM (
  SELECT user_id, tag_code FROM nutrition.food_preference_items
  WHERE tag_code IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;
SELECT 'dubletten_cuisine', COUNT(*)::text FROM (
  SELECT user_id, cuisine_code FROM nutrition.food_preference_items
  WHERE NULLIF(cuisine_code,'') IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;
SELECT 'dubletten_exclusion_preset', COUNT(*)::text FROM (
  SELECT user_id, exclusion_preset_code FROM nutrition.food_preference_items
  WHERE NULLIF(exclusion_preset_code,'') IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;
SELECT 'dubletten_catalog_item', COUNT(*)::text FROM (
  SELECT user_id, catalog_item_code FROM nutrition.food_preference_items
  WHERE NULLIF(catalog_item_code,'') IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) > 1) d;

-- --- Trennschaerfe: jede Zeile faellt in genau einen Index ---
-- Zaehlt je Zeile die gesetzten Zielfelder nach CHECK-Semantik.
-- Erwartet: 0 Zeilen mit einem anderen Wert als 1.
SELECT 'zeilen_nicht_genau_ein_ziel', COUNT(*)::text
FROM nutrition.food_preference_items
WHERE ((food_id IS NOT NULL)::int
     + (category_id IS NOT NULL)::int
     + (tag_code IS NOT NULL)::int
     + (NULLIF(cuisine_code,'') IS NOT NULL)::int
     + (NULLIF(exclusion_preset_code,'') IS NOT NULL)::int
     + (NULLIF(catalog_item_code,'') IS NOT NULL)::int) <> 1;

SELECT 'zeilen_gesamt', COUNT(*)::text FROM nutrition.food_preference_items;
