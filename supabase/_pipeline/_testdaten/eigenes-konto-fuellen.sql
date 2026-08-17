-- Ein ECHTES Anmeldekonto bekommt die Tage eines Seed-Nutzers.
--
-- Aufruf (Standard: dev@lumeos.app aus tom.seed@example.com):
--   docker exec -i supabase_db_LumeOS-Claude-V1 psql -U postgres -d postgres \
--     < supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql
--
-- Anderes Zielkonto: -v ziel_email="'jemand@example.com'" voranstellen.
--
-- WARUM KOPIEREN STATT DEN SEED UMBIEGEN:
-- testdaten-einspielen.ts macht DELETE FROM auth.users WHERE id IN (...).
-- Zeigte der Seed auf ein echtes Konto, loeschte er dessen Anmeldedaten
-- samt Passwort. Ausserdem pruefen testdaten-pruefen.ts und das
-- Szenarienregister die drei festen Seed-UUIDs -- andere IDs braechen
-- genau die Pruefung, die gruen sein soll.
--
-- Vorlage ist tom.seed@example.com: vollstaendiges Profil, 172 Mahlzeiten
-- ueber 43 Tage, deckt sechs der elf Szenariotage ab.
--
-- Wiederholbar: raeumt die Daten des Zielkontos und kopiert neu. Das
-- auth.users-Konto selbst wird NIE angefasst.
\if :{?ziel_email}
\else
  \set ziel_email '''dev@lumeos.app'''
\endif
\set quelle_email '''tom.seed@example.com'''

BEGIN;

SELECT id AS ziel_id FROM auth.users WHERE email = :ziel_email \gset
SELECT id AS quelle_id FROM auth.users WHERE email = :quelle_email \gset

\set tom '''' :ziel_id ''''
\set quelle '''' :quelle_id ''''

-- Wiederholbar: erst raeumen, dann neu kopieren.
DELETE FROM nutrition.meal_items WHERE user_id = :tom::uuid;
DELETE FROM nutrition.meals      WHERE user_id = :tom::uuid;
DELETE FROM goals.nutrition_targets WHERE user_id = :tom::uuid;

-- 1. Profil: die sechs Felder, an denen Referenzwerte und Formel haengen.
UPDATE public.profiles p
SET birth_date     = q.birth_date,
    biological_sex = q.biological_sex,
    height_cm      = q.height_cm,
    body_weight_kg = q.body_weight_kg,
    activity_level = q.activity_level,
    nutrition_goal = q.nutrition_goal,
    updated_at     = now()
FROM public.profiles q
WHERE p.id = :tom::uuid AND q.id = :quelle::uuid;

-- 2. Zielwerte. gueltig_ab bleibt wie in der Vorlage -- ein Ziel wirkt
--    vorwaerts, ein frueheres Datum wuerde die aelteren Tage falsch bewerten.
INSERT INTO goals.nutrition_targets
  (user_id, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee, nutrition_goal, notiz)
SELECT :tom::uuid, gueltig_ab, kcal, protein_g, carbs_g, fat_g, herkunft, tdee, nutrition_goal,
       'Kopie aus Seed-Konto fuer dev@lumeos.app'
FROM goals.nutrition_targets WHERE user_id = :quelle::uuid;

-- 3. Mahlzeiten mit neuer id, aber gemerkter Herkunft fuer die Positionen.
--    Die Abbildung laeuft explizit ueber IDs, nicht ueber
--    (entry_date, meal_type): seit C-59 darf derselbe Typ mehrfach am Tag
--    vorkommen.
CREATE TEMP TABLE abbild (neu uuid, alt uuid PRIMARY KEY) ON COMMIT DROP;

WITH quelle AS (
  SELECT gen_random_uuid() AS neu, id AS alt
  FROM nutrition.meals
  WHERE user_id = :quelle::uuid
)
INSERT INTO abbild (neu, alt) SELECT neu, alt FROM quelle;

INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, meal_time, notes)
SELECT a.neu, :tom::uuid, m.entry_date, m.meal_type, m.meal_time, m.notes
FROM nutrition.meals m
JOIN abbild a ON a.alt = m.id;

-- 4. Positionen. Die eingefrorenen Naehrwerte werden UNVERAENDERT uebernommen
--    (ADR-0003) -- nicht neu gegen food_nutrients gerechnet.
INSERT INTO nutrition.meal_items (
  id, meal_id, user_id, food_id, food_source, food_name, amount_g,
  enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g,
  nutrients, frozen_at, custom_food_id, portion_name, portion_quantity, portion_amount_g
)
SELECT gen_random_uuid(), a.neu, :tom::uuid, i.food_id, i.food_source, i.food_name, i.amount_g,
       i.enercc, i.prot625, i.fat, i.cho, i.fibt, i.sugar, i.fasat, i.nacl, i.water_g,
       i.nutrients, i.frozen_at, i.custom_food_id, i.portion_name, i.portion_quantity, i.portion_amount_g
FROM nutrition.meal_items i
JOIN abbild a ON a.alt = i.meal_id
WHERE i.user_id = :quelle::uuid;

COMMIT;

SELECT 'mahlzeiten' AS was, count(*) FROM nutrition.meals WHERE user_id = :tom::uuid
UNION ALL SELECT 'positionen', count(*) FROM nutrition.meal_items WHERE user_id = :tom::uuid
UNION ALL SELECT 'ziele', count(*) FROM goals.nutrition_targets WHERE user_id = :tom::uuid
UNION ALL SELECT 'tage', count(DISTINCT entry_date) FROM nutrition.meals WHERE user_id = :tom::uuid;
