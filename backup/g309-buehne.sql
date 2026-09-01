-- G-309: die Buehne auf test-user@lumeos.local.
--
-- `[read]` **Zwei Plaene, damit das Pausieren belegbar wird** — einer
-- steht auf `active`, der zweite wird ueber die Oberflaeche aktiviert.
--
-- `[read]` **Ein Rezepteintrag, damit `ADR_GHOST_ENTRY_RECIPE`
-- messbar ist** — er muss als Einzelzutaten erscheinen.
--
-- **Nichts auf dev@lumeos.app.**
\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  v_user      uuid;
  v_alt       uuid := gen_random_uuid();
  v_neu       uuid := gen_random_uuid();
  v_woche_a   uuid := gen_random_uuid();
  v_woche_n   uuid := gen_random_uuid();
  v_tag_a     uuid := gen_random_uuid();
  v_tag_n     uuid := gen_random_uuid();
  v_rezept    uuid := gen_random_uuid();
  v_heute     date := current_date;
  v_montag    date;
  v_huhn      uuid;
  v_reis      uuid;
  v_brok      uuid;
  v_ei        uuid;
BEGIN
  SELECT id INTO v_user FROM auth.users WHERE email = 'test-user@lumeos.local';
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'test-user@lumeos.local fehlt';
  END IF;

  -- Der Montag dieser Woche — `week_start` verlangt einen.
  v_montag := v_heute - ((EXTRACT(isodow FROM v_heute)::int) - 1);

  -- Vier Lebensmittel mit Naehrwerten, damit die kcal nicht NULL sind.
  SELECT f.id INTO v_huhn FROM nutrition.foods f
    JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
   WHERE f.name_display_de ILIKE '%hähnchen%' OR f.name_de ILIKE '%hühnerfleisch%'
   LIMIT 1;
  SELECT f.id INTO v_reis FROM nutrition.foods f
    JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
   WHERE f.name_display_de ILIKE '%reis%' LIMIT 1;
  SELECT f.id INTO v_brok FROM nutrition.foods f
    JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
   WHERE f.name_display_de ILIKE '%brokkoli%' OR f.name_de ILIKE '%broccoli%'
   LIMIT 1;
  SELECT f.id INTO v_ei FROM nutrition.foods f
    JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
   WHERE f.name_display_de ILIKE '%ei, %' OR f.name_display_de ILIKE '%hühnerei%'
   LIMIT 1;

  IF v_huhn IS NULL OR v_reis IS NULL OR v_brok IS NULL OR v_ei IS NULL THEN
    RAISE EXCEPTION 'Buehne: Lebensmittel fehlen (huhn=% reis=% brok=% ei=%)',
      v_huhn, v_reis, v_brok, v_ei;
  END IF;

  -- ── Ein Rezept mit drei Zutaten ─────────────────────────────────
  INSERT INTO nutrition.recipes (id, user_id, name_de, servings, darf_weiterverkaufen)
  VALUES (v_rezept, v_user, 'G-309 Huhn-Reis-Bowl', 2, true);

  INSERT INTO nutrition.recipe_ingredients
    (recipe_id, user_id, sort_order, food_source, food_id, amount_g)
  VALUES
    (v_rezept, v_user, 1, 'bls', v_huhn, 400),
    (v_rezept, v_user, 2, 'bls', v_reis, 300),
    (v_rezept, v_user, 3, 'bls', v_brok, 200);

  -- ── Plan A: laeuft schon, wird beim Aktivieren pausiert ─────────
  INSERT INTO nutrition.meal_plans
    (id, user_id, name, status, is_active, plan_origin, start_date)
  VALUES
    (v_alt, v_user, 'G-309 Altplan (soll pausieren)', 'active', true,
     'self_created', v_montag);

  INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
  VALUES (v_woche_a, v_alt, v_user, v_montag);

  INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, day_index, plan_date)
  VALUES (v_tag_a, v_woche_a, v_user,
          EXTRACT(isodow FROM v_heute)::int, v_heute);

  INSERT INTO nutrition.meal_plan_entries
    (day_id, user_id, meal_type, slot_order, entry_type, food_id, amount_g)
  VALUES (v_tag_a, v_user, 'dinner', 1, 'bls', v_ei, 120);

  -- ── Plan B: wird ueber die Oberflaeche aktiviert ────────────────
  INSERT INTO nutrition.meal_plans
    (id, user_id, name, status, is_active, plan_origin)
  VALUES
    (v_neu, v_user, 'G-309 Neuplan (wird aktiviert)', 'assigned', false,
     'self_created');

  INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
  VALUES (v_woche_n, v_neu, v_user, v_montag);

  INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, day_index, plan_date)
  VALUES (v_tag_n, v_woche_n, v_user,
          EXTRACT(isodow FROM v_heute)::int, v_heute);

  -- Ein BLS-Eintrag und ein Rezepteintrag — beide Formen.
  INSERT INTO nutrition.meal_plan_entries
    (day_id, user_id, meal_type, slot_order, entry_type, food_id, amount_g)
  VALUES (v_tag_n, v_user, 'breakfast', 1, 'bls', v_ei, 150);

  INSERT INTO nutrition.meal_plan_entries
    (day_id, user_id, meal_type, slot_order, entry_type, recipe_id, planned_servings)
  VALUES (v_tag_n, v_user, 'lunch', 1, 'recipe', v_rezept, 1);

  INSERT INTO nutrition.meal_plan_entries
    (day_id, user_id, meal_type, slot_order, entry_type, food_id, amount_g)
  VALUES (v_tag_n, v_user, 'dinner', 1, 'bls', v_huhn, 200);

  RAISE NOTICE 'Buehne: Altplan % / Neuplan % / Tag %', v_alt, v_neu, v_heute;
END $$;

COMMIT;

-- Gegenprobe
SELECT p.name, p.status, p.is_active,
       (SELECT count(*) FROM nutrition.meal_plan_entries e
          JOIN nutrition.meal_plan_days d ON d.id = e.day_id
          JOIN nutrition.meal_plan_weeks w ON w.id = d.week_id
         WHERE w.plan_id = p.id) AS positionen
  FROM nutrition.meal_plans p
  JOIN auth.users u ON u.id = p.user_id
 WHERE u.email = 'test-user@lumeos.local'
 ORDER BY p.name;
