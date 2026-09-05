-- 407 -- Wochenlisten-Leseweg und Nutrition-Vorrat (C-407/C-408)
--
-- Einkaufslisten sind ein Nutrition-Beleg: sie werden archiviert statt
-- geloescht. Der Vorrat bleibt bewusst ein editierbarer Anhaltspunkt;
-- der Meal-Item-Trigger zieht nur von bereits angelegten Vorratszeilen ab.

\set ON_ERROR_STOP on

BEGIN;

-- Ein eigener Ursprung trennt Nutrition-Nachbestellungen von
-- supplement_reorder, ohne einen Fremdschluessel zum Supplements-Modul.
ALTER TABLE nutrition.shopping_lists
  DROP CONSTRAINT IF EXISTS shopping_lists_source_target_check;
ALTER TABLE nutrition.shopping_lists
  ADD CONSTRAINT shopping_lists_source_target_check CHECK (
    (source_type = 'recipe' AND recipe_id IS NOT NULL AND meal_plan_week_id IS NULL) OR
    (source_type = 'meal_plan' AND recipe_id IS NULL AND meal_plan_week_id IS NOT NULL) OR
    (source_type IN ('manual', 'supplement_reorder', 'nutrition_reorder')
      AND recipe_id IS NULL AND meal_plan_week_id IS NULL)
  );

-- C-409: Beide source_type-CHECKs muessen denselben neuen Ursprung
-- kennen. Der Basisschutz stammt aus 058b und wird hier bewusst
-- ersetzt, statt zwei widerspruechliche Wertelisten zu behalten.
ALTER TABLE nutrition.shopping_lists
  DROP CONSTRAINT IF EXISTS shopping_lists_source_type_check;
ALTER TABLE nutrition.shopping_lists
  ADD CONSTRAINT shopping_lists_source_type_check
  CHECK (source_type IN (
    'manual', 'recipe', 'meal_plan', 'supplement_reorder', 'nutrition_reorder'
  ));

-- Eine Liste ist ein Beleg. Das UI archiviert sie ueber die Funktion
-- unten; direktes DELETE bleibt fuer einzelne, noch offene Positionen
-- moeglich, aber nicht fuer die Liste selbst.
REVOKE DELETE ON nutrition.shopping_lists FROM authenticated;
DROP POLICY IF EXISTS shopping_lists_delete ON nutrition.shopping_lists;

CREATE OR REPLACE FUNCTION nutrition.shopping_list_from_meal_plan_week(
  p_week_id UUID,
  p_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id UUID;
  v_week_name TEXT;
  v_week_start DATE;
  v_list_id UUID;
BEGIN
  SELECT w.user_id, w.name, w.week_start
    INTO v_user_id, v_week_name, v_week_start
  FROM nutrition.meal_plan_weeks w
  WHERE w.id = p_week_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'shopping_list_from_meal_plan_week: Woche % nicht gefunden oder nicht lesbar', p_week_id
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO nutrition.shopping_lists (
    user_id, name, source_type, meal_plan_week_id, measurement_source, source_detail
  )
  VALUES (
    v_user_id,
    COALESCE(NULLIF(btrim(p_name), ''), 'Einkauf ' || COALESCE(v_week_name, v_week_start::text)),
    'meal_plan', p_week_id, 'manual', 'Aus Planwoche erzeugt'
  )
  RETURNING id INTO v_list_id;

  WITH source_items AS (
    SELECT
      e.entry_type AS item_source,
      e.food_id,
      e.custom_food_id,
      COALESCE(NULLIF(f.name_display_de, ''), f.name_de, fc.name_de) AS food_name,
      e.amount_g
    FROM nutrition.meal_plan_days d
    JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
    LEFT JOIN nutrition.foods f ON f.id = e.food_id
    LEFT JOIN nutrition.foods_custom fc ON fc.id = e.custom_food_id
    WHERE d.week_id = p_week_id
      AND e.entry_type IN ('bls', 'custom')

    UNION ALL

    SELECT
      ri.food_source AS item_source,
      ri.food_id,
      ri.custom_food_id,
      COALESCE(
        NULLIF(ri.food_name_snapshot, ''),
        NULLIF(f.name_display_de, ''),
        f.name_de,
        fc.name_de
      ) AS food_name,
      ri.amount_g * e.planned_servings / r.servings AS amount_g
    FROM nutrition.meal_plan_days d
    JOIN nutrition.meal_plan_entries e ON e.day_id = d.id AND e.entry_type = 'recipe'
    JOIN nutrition.recipes r ON r.id = e.recipe_id
    JOIN nutrition.recipe_ingredients ri ON ri.recipe_id = r.id
    LEFT JOIN nutrition.foods f ON f.id = ri.food_id
    LEFT JOIN nutrition.foods_custom fc ON fc.id = ri.custom_food_id
    WHERE d.week_id = p_week_id
  ), grouped_items AS (
    SELECT
      item_source,
      food_id,
      custom_food_id,
      min(food_name) AS food_name,
      sum(amount_g)::numeric(10,2) AS amount_g
    FROM source_items
    GROUP BY item_source, food_id, custom_food_id
  )
  INSERT INTO nutrition.shopping_list_items (
    shopping_list_id, user_id, sort_order, item_source, food_id, custom_food_id,
    food_name, amount_g, quantity, unit_display
  )
  SELECT
    v_list_id,
    v_user_id,
    row_number() OVER (ORDER BY lower(food_name), item_source, food_id, custom_food_id) - 1,
    item_source,
    food_id,
    custom_food_id,
    food_name,
    amount_g,
    NULL,
    'g'
  FROM grouped_items;

  RETURN v_list_id;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.shopping_list_read(p_shopping_list_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT jsonb_build_object(
    'id', sl.id,
    'name', sl.name,
    'source_type', sl.source_type,
    'meal_plan_week_id', sl.meal_plan_week_id,
    'status', sl.status,
    'servings', sl.servings,
    'created_at', sl.created_at,
    'updated_at', sl.updated_at,
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', sli.id,
        'sort_order', sli.sort_order,
        'item_source', sli.item_source,
        'food_id', sli.food_id,
        'custom_food_id', sli.custom_food_id,
        'food_name', sli.food_name,
        'amount_g', sli.amount_g,
        'quantity', sli.quantity,
        'unit_display', sli.unit_display,
        'is_checked', sli.is_checked,
        'notes', sli.notes
      ) ORDER BY sli.sort_order, sli.id)
      FROM nutrition.shopping_list_items sli
      WHERE sli.shopping_list_id = sl.id
    ), '[]'::jsonb)
  )
  FROM nutrition.shopping_lists sl
  WHERE sl.id = p_shopping_list_id;
$function$;

CREATE OR REPLACE FUNCTION nutrition.shopping_list_archive(p_shopping_list_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_archived BOOLEAN;
BEGIN
  UPDATE nutrition.shopping_lists
  SET status = 'archived'
  WHERE id = p_shopping_list_id
    AND status <> 'archived'
  RETURNING true INTO v_archived;

  RETURN COALESCE(v_archived, false);
END;
$function$;

CREATE TABLE IF NOT EXISTS nutrition.user_inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id             UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  custom_food_id      UUID REFERENCES nutrition.foods_custom(id) ON DELETE RESTRICT,
  menge_g             NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (menge_g >= 0),
  schwelle_g          NUMERIC(10,2) CHECK (schwelle_g IS NULL OR schwelle_g >= 0),
  zuletzt_angepasst   TIMESTAMPTZ NOT NULL DEFAULT now(),
  reorder_flag        BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_inventory_source_target_check CHECK (
    (food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (food_id IS NULL AND custom_food_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_inventory_food
  ON nutrition.user_inventory(user_id, food_id)
  WHERE food_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_inventory_custom_food
  ON nutrition.user_inventory(user_id, custom_food_id)
  WHERE custom_food_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_inventory_reorder
  ON nutrition.user_inventory(user_id, reorder_flag)
  WHERE reorder_flag;

CREATE OR REPLACE FUNCTION nutrition.user_inventory_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_custom_owner UUID;
BEGIN
  IF NEW.custom_food_id IS NOT NULL THEN
    SELECT fc.user_id INTO v_custom_owner
    FROM nutrition.foods_custom fc
    WHERE fc.id = NEW.custom_food_id;

    IF v_custom_owner IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'user_inventory.custom_food_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION nutrition.user_inventory_set_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  NEW.reorder_flag := NEW.schwelle_g IS NOT NULL AND NEW.menge_g <= NEW.schwelle_g;
  NEW.zuletzt_angepasst := now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS user_inventory_owner_guard_trg ON nutrition.user_inventory;
CREATE TRIGGER user_inventory_owner_guard_trg
  BEFORE INSERT OR UPDATE OF user_id, custom_food_id
  ON nutrition.user_inventory
  FOR EACH ROW EXECUTE FUNCTION nutrition.user_inventory_owner_guard();

DROP TRIGGER IF EXISTS user_inventory_set_state_trg ON nutrition.user_inventory;
CREATE TRIGGER user_inventory_set_state_trg
  BEFORE INSERT OR UPDATE ON nutrition.user_inventory
  FOR EACH ROW EXECUTE FUNCTION nutrition.user_inventory_set_state();

CREATE OR REPLACE FUNCTION nutrition.meal_items_inventory_deduct()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  -- Der Vorrat ist opt-in und symbolisch: ohne angelegte Vorratszeile
  -- wird nichts erfunden. Ein erfassbares Meal-Item ist die einzige
  -- Quelle; Korrekturen bleiben eine bewusste Handanpassung.
  UPDATE nutrition.user_inventory ui
  SET menge_g = GREATEST(0::numeric, ui.menge_g - NEW.amount_g)
  WHERE ui.user_id = NEW.user_id
    AND (
      (NEW.food_id IS NOT NULL AND ui.food_id = NEW.food_id) OR
      (NEW.custom_food_id IS NOT NULL AND ui.custom_food_id = NEW.custom_food_id)
    );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS meal_items_inventory_deduct_trg ON nutrition.meal_items;
CREATE TRIGGER meal_items_inventory_deduct_trg
  AFTER INSERT ON nutrition.meal_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.meal_items_inventory_deduct();

GRANT SELECT, INSERT, UPDATE, DELETE ON nutrition.user_inventory TO authenticated;
GRANT ALL ON nutrition.user_inventory TO service_role;
ALTER TABLE nutrition.user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_inventory_select ON nutrition.user_inventory;
DROP POLICY IF EXISTS user_inventory_insert ON nutrition.user_inventory;
DROP POLICY IF EXISTS user_inventory_update ON nutrition.user_inventory;
DROP POLICY IF EXISTS user_inventory_delete ON nutrition.user_inventory;
CREATE POLICY user_inventory_select ON nutrition.user_inventory
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY user_inventory_insert ON nutrition.user_inventory
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_inventory_update ON nutrition.user_inventory
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_inventory_delete ON nutrition.user_inventory
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

REVOKE ALL ON FUNCTION nutrition.shopping_list_from_meal_plan_week(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.shopping_list_read(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION nutrition.shopping_list_archive(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION nutrition.shopping_list_from_meal_plan_week(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.shopping_list_read(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION nutrition.shopping_list_archive(UUID) TO authenticated, service_role;

COMMENT ON TABLE nutrition.user_inventory IS
  'C-408/E-65: symbolischer Nutrition-Vorrat in Gramm. Er ist editierbar und kein Verpackungs- oder Bestandsmodell.';
COMMENT ON FUNCTION nutrition.shopping_list_from_meal_plan_week(UUID, TEXT) IS
  'C-407: erzeugt eine meal_plan-Einkaufsliste und aggregiert BLS- und Custom-Foods je kanonischer Food-ID.';
COMMENT ON FUNCTION nutrition.shopping_list_archive(UUID) IS
  'C-407: archiviert statt eine Einkaufsliste physisch zu loeschen.';
COMMENT ON FUNCTION nutrition.meal_items_inventory_deduct() IS
  'C-408: reduziert nur vorhandene Nutrition-Vorratszeilen beim Anlegen eines Meal-Items; keine moduluebergreifenden Daten.';

COMMIT;
