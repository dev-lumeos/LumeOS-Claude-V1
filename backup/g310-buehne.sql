-- G-310: die Buehne fuer den Plan-Reiter.
--
-- `[read]` **Vier Plaene mit VIER Herkuenften** — das Mockup zeigt
-- genau diese (Z. 7-15), und der CHECK erlaubt genau diese.
--
-- `[read]` **Und Logzeilen ueber sieben Tage**, damit die Sparkline
-- eine Kurve hat statt eines Punktes.
--
-- **Nichts auf dev@lumeos.app.**
\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  v_user   uuid;
  v_aktiv  uuid := gen_random_uuid();
  v_woche  uuid := gen_random_uuid();
  v_heute  date := current_date;
  v_montag date;
  v_food   uuid;
  v_tag    uuid;
  v_eintrag uuid;
  v_meal    uuid;
  i        integer;
  d        integer;
BEGIN
  SELECT id INTO v_user FROM auth.users WHERE email = 'test-user@lumeos.local';
  IF v_user IS NULL THEN RAISE EXCEPTION 'test-user fehlt'; END IF;

  v_montag := v_heute - ((EXTRACT(isodow FROM v_heute)::int) - 1);

  SELECT f.id INTO v_food FROM nutrition.foods f
    JOIN nutrition.food_nutrients fn ON fn.food_id = f.id
   WHERE f.name_display_de ILIKE '%hähnchenbrustfilet gebraten%' LIMIT 1;
  IF v_food IS NULL THEN
    SELECT f.id INTO v_food FROM nutrition.foods f
      JOIN nutrition.food_nutrients fn ON fn.food_id = f.id LIMIT 1;
  END IF;

  -- ── Der aktive Plan, mit Zielen wie in der Attrappe ────────────
  INSERT INTO nutrition.meal_plans
    (id, user_id, name, description, status, is_active, plan_origin,
     lifecycle_type, start_date, days_count, target_kcal, target_protein_g)
  VALUES
    (v_aktiv, v_user, 'G-310 Recomp 5-Meal Plan',
     'Lean Bulk mit hohem Protein · 4 Mahlzeiten/Tag',
     'active', true, 'coach_created', 'rollover', v_montag, 7, 2100, 170);

  INSERT INTO nutrition.meal_plan_weeks (id, plan_id, user_id, week_start)
  VALUES (v_woche, v_aktiv, v_user, v_montag);

  -- Sieben Tage, je eine Position, je ein Log — das ergibt die Kurve.
  FOR d IN 0..6 LOOP
    v_tag := gen_random_uuid();
    v_eintrag := gen_random_uuid();
    INSERT INTO nutrition.meal_plan_days (id, week_id, user_id, day_index, plan_date)
    VALUES (v_tag, v_woche, v_user, d + 1, v_montag + d);

    INSERT INTO nutrition.meal_plan_entries
      (id, day_id, user_id, meal_type, slot_order, entry_type, food_id, amount_g)
    VALUES (v_eintrag, v_tag, v_user, 'lunch', 1, 'bls', v_food, 200);

    -- `[read]` **Ein gemischtes Bild**, damit Avg, Deviations und
    -- Skips verschiedene Zahlen tragen.
    IF d IN (0, 1, 3, 5) THEN
      -- Der resolution_check verlangt actual_meal_id bei confirmed.
      v_meal := gen_random_uuid();
      INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, entry_source)
      VALUES (v_meal, v_user, v_montag + d, 'lunch', 'manual');
      INSERT INTO nutrition.meal_plan_logs
        (plan_id, plan_entry_id, user_id, execution_date, status,
         actual_meal_id, confirmation_mode, confirmed_at)
      VALUES (v_aktiv, v_eintrag, v_user, v_montag + d, 'confirmed',
              v_meal, 'manual', now())
      ON CONFLICT DO NOTHING;
    ELSIF d = 2 THEN
      v_meal := gen_random_uuid();
      INSERT INTO nutrition.meals (id, user_id, entry_date, meal_type, entry_source)
      VALUES (v_meal, v_user, v_montag + d, 'lunch', 'manual');
      INSERT INTO nutrition.meal_plan_logs
        (plan_id, plan_entry_id, user_id, execution_date, status,
         actual_meal_id, confirmation_mode, confirmed_at,
         deviation_kcal, deviation_pct)
      VALUES (v_aktiv, v_eintrag, v_user, v_montag + d, 'deviated',
              v_meal, 'manual', now(), 420, 31.5)
      ON CONFLICT DO NOTHING;
    ELSIF d = 4 THEN
      INSERT INTO nutrition.meal_plan_logs
        (plan_id, plan_entry_id, user_id, execution_date, status, skipped_at)
      VALUES (v_aktiv, v_eintrag, v_user, v_montag + d, 'skipped', now())
      ON CONFLICT DO NOTHING;
    END IF;
    -- d = 6 bleibt ohne Log: `pending`.
  END LOOP;

  -- ── Drei weitere Plaene, je eine Herkunft (Mockup Z. 10-15) ────
  INSERT INTO nutrition.meal_plans
    (user_id, name, description, status, is_active, plan_origin, target_kcal)
  VALUES
    (v_user, 'G-310 Lean Bulk 12 Wochen',
     'Von Tom Müller · 12 Wochen strukturierter Bulk',
     'assigned', false, 'marketplace', 2400),
    (v_user, 'G-310 Buddy AI — Defizit Plan',
     'Abgeschlossen: 14/14 Tage', 'completed', false, 'buddy', 1900),
    (v_user, 'G-310 Eigener Plan', 'Ohne Badge — SPEC_03 Flow 3',
     'assigned', false, 'self_created', 2200);

  RAISE NOTICE 'Buehne: aktiver Plan %, Montag %', v_aktiv, v_montag;
END $$;

COMMIT;

SELECT p.name, p.plan_origin, p.status,
       (SELECT count(*) FROM nutrition.meal_plan_logs l WHERE l.plan_id = p.id) AS logs
  FROM nutrition.meal_plans p
  JOIN auth.users u ON u.id = p.user_id
 WHERE u.email = 'test-user@lumeos.local'
 ORDER BY p.name;
