BEGIN;

CREATE TABLE IF NOT EXISTS nutrition.shopping_lists (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  name               TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  source_type        TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual','recipe','meal_plan','supplement_reorder')),
  recipe_id          UUID REFERENCES nutrition.recipes(id) ON DELETE SET NULL,
  meal_plan_week_id  UUID REFERENCES nutrition.meal_plan_weeks(id) ON DELETE SET NULL,
  servings           NUMERIC(8,3) NOT NULL DEFAULT 1 CHECK (servings > 0),
  status             TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','completed','archived')),
  measurement_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual','device','import','admin','seed')),
  source_detail      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT shopping_lists_source_target_check CHECK (
    (source_type = 'recipe' AND recipe_id IS NOT NULL AND meal_plan_week_id IS NULL) OR
    (source_type = 'meal_plan' AND recipe_id IS NULL AND meal_plan_week_id IS NOT NULL) OR
    (source_type IN ('manual','supplement_reorder') AND recipe_id IS NULL AND meal_plan_week_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user
  ON nutrition.shopping_lists(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_recipe
  ON nutrition.shopping_lists(recipe_id)
  WHERE recipe_id IS NOT NULL;

DROP TRIGGER IF EXISTS shopping_lists_touch_updated_at ON nutrition.shopping_lists;
CREATE TRIGGER shopping_lists_touch_updated_at
  BEFORE UPDATE ON nutrition.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE TABLE IF NOT EXISTS nutrition.shopping_list_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id    UUID NOT NULL REFERENCES nutrition.shopping_lists(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  item_source         TEXT NOT NULL DEFAULT 'free_text'
    CHECK (item_source IN ('bls','custom','free_text')),
  food_id             UUID REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  custom_food_id      UUID REFERENCES nutrition.foods_custom(id) ON DELETE RESTRICT,
  food_name           TEXT NOT NULL CHECK (length(trim(food_name)) >= 1),
  amount_g            NUMERIC(10,2) CHECK (amount_g IS NULL OR amount_g > 0),
  quantity            NUMERIC(10,3) CHECK (quantity IS NULL OR quantity > 0),
  unit_display        TEXT NOT NULL DEFAULT 'g',
  is_checked          BOOLEAN NOT NULL DEFAULT false,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT shopping_list_items_source_target_check CHECK (
    (item_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (item_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL) OR
    (item_source = 'free_text' AND food_id IS NULL AND custom_food_id IS NULL)
  ),
  CONSTRAINT shopping_list_items_amount_or_quantity_check CHECK (
    amount_g IS NOT NULL OR quantity IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list
  ON nutrition.shopping_list_items(shopping_list_id, is_checked, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_user
  ON nutrition.shopping_list_items(user_id);

DROP TRIGGER IF EXISTS shopping_list_items_touch_updated_at ON nutrition.shopping_list_items;
CREATE TRIGGER shopping_list_items_touch_updated_at
  BEFORE UPDATE ON nutrition.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.touch_updated_at();

CREATE OR REPLACE FUNCTION nutrition.shopping_lists_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_recipe_owner UUID;
  v_week_owner UUID;
BEGIN
  IF NEW.recipe_id IS NOT NULL THEN
    SELECT r.user_id INTO v_recipe_owner
    FROM nutrition.recipes r
    WHERE r.id = NEW.recipe_id;
    IF v_recipe_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_lists.recipe_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.meal_plan_week_id IS NOT NULL THEN
    SELECT w.user_id INTO v_week_owner
    FROM nutrition.meal_plan_weeks w
    WHERE w.id = NEW.meal_plan_week_id;
    IF v_week_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_lists.meal_plan_week_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS shopping_lists_owner_guard_trg ON nutrition.shopping_lists;
CREATE TRIGGER shopping_lists_owner_guard_trg
  BEFORE INSERT OR UPDATE OF user_id, recipe_id, meal_plan_week_id
  ON nutrition.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION nutrition.shopping_lists_owner_guard();

CREATE OR REPLACE FUNCTION nutrition.shopping_list_items_owner_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  v_list_owner UUID;
  v_custom_owner UUID;
BEGIN
  SELECT sl.user_id INTO v_list_owner
  FROM nutrition.shopping_lists sl
  WHERE sl.id = NEW.shopping_list_id;

  IF v_list_owner IS NULL THEN
    RAISE EXCEPTION 'shopping_list_items.shopping_list_id % existiert nicht', NEW.shopping_list_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_list_owner THEN
    RAISE EXCEPTION 'shopping_list_items.user_id (%) weicht von shopping_lists.user_id (%) ab',
      NEW.user_id, v_list_owner USING ERRCODE = '23514';
  END IF;

  IF NEW.custom_food_id IS NOT NULL THEN
    SELECT fc.user_id INTO v_custom_owner
    FROM nutrition.foods_custom fc
    WHERE fc.id = NEW.custom_food_id;
    IF v_custom_owner <> NEW.user_id THEN
      RAISE EXCEPTION 'shopping_list_items.custom_food_id gehoert nicht der Nutzerin'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$guard$;

DROP TRIGGER IF EXISTS shopping_list_items_owner_guard_trg ON nutrition.shopping_list_items;
CREATE TRIGGER shopping_list_items_owner_guard_trg
  BEFORE INSERT OR UPDATE OF shopping_list_id, user_id, custom_food_id
  ON nutrition.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.shopping_list_items_owner_guard();

GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO authenticated;

GRANT ALL ON
  nutrition.shopping_lists,
  nutrition.shopping_list_items
TO service_role;

ALTER TABLE nutrition.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shopping_lists_select ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_insert ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_update ON nutrition.shopping_lists;
DROP POLICY IF EXISTS shopping_lists_delete ON nutrition.shopping_lists;
CREATE POLICY shopping_lists_select ON nutrition.shopping_lists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY shopping_lists_insert ON nutrition.shopping_lists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_lists_update ON nutrition.shopping_lists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_lists_delete ON nutrition.shopping_lists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS shopping_list_items_select ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_insert ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_update ON nutrition.shopping_list_items;
DROP POLICY IF EXISTS shopping_list_items_delete ON nutrition.shopping_list_items;
CREATE POLICY shopping_list_items_select ON nutrition.shopping_list_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY shopping_list_items_insert ON nutrition.shopping_list_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_list_items_update ON nutrition.shopping_list_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY shopping_list_items_delete ON nutrition.shopping_list_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMENT ON TABLE nutrition.shopping_lists IS
  'C-187/C-150: user-private Einkaufslisten aus Rezept, Wochenplan oder manuell. Supplements-Reorder kann bis zu einem eigenen Einkaufsmodell free_text-Positionen anlegen.';
COMMENT ON TABLE nutrition.shopping_list_items IS
  'C-187/C-150: Einkaufslistenpositionen mit optionalem Food-/Custom-Food-Bezug; free_text bleibt fuer nicht-nutrition Artikel sichtbar statt geraten.';

DO $$
DECLARE
  v_tables integer;
  v_policies integer;
  v_columns integer;
  v_functions integer;
  v_triggers integer;
  v_fks integer;
BEGIN
  SELECT count(*) INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'nutrition'
    AND table_name IN ('shopping_lists', 'shopping_list_items')
    AND table_type = 'BASE TABLE';

  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'nutrition'
    AND tablename IN ('shopping_lists', 'shopping_list_items');

  SELECT count(*) INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'nutrition'
    AND table_name = 'shopping_list_items'
    AND column_name IN ('item_source', 'food_id', 'custom_food_id', 'food_name', 'amount_g', 'quantity', 'unit_display', 'is_checked');

  SELECT count(*) INTO v_functions
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'nutrition'
    AND p.proname IN ('shopping_lists_owner_guard', 'shopping_list_items_owner_guard');

  SELECT count(*) INTO v_triggers
  FROM pg_trigger tr
  JOIN pg_class c ON c.oid = tr.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'nutrition'
    AND c.relname IN ('shopping_lists', 'shopping_list_items')
    AND NOT tr.tgisinternal
    AND tr.tgname IN (
      'shopping_lists_touch_updated_at',
      'shopping_lists_owner_guard_trg',
      'shopping_list_items_touch_updated_at',
      'shopping_list_items_owner_guard_trg'
    );

  SELECT count(*) INTO v_fks
  FROM information_schema.table_constraints tc
  WHERE tc.constraint_schema = 'nutrition'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name IN (
      'shopping_lists_recipe_id_fkey',
      'shopping_lists_meal_plan_week_id_fkey',
      'shopping_list_items_shopping_list_id_fkey',
      'shopping_list_items_food_id_fkey',
      'shopping_list_items_custom_food_id_fkey'
    );

  IF v_tables <> 2 THEN
    RAISE EXCEPTION 'C-246 shopping tables: %, erwartet 2', v_tables;
  END IF;
  IF v_policies <> 8 THEN
    RAISE EXCEPTION 'C-246 shopping policies: %, erwartet 8', v_policies;
  END IF;
  IF v_columns <> 8 THEN
    RAISE EXCEPTION 'C-246 shopping item columns: %, erwartet 8', v_columns;
  END IF;
  IF v_functions <> 2 THEN
    RAISE EXCEPTION 'C-246 shopping guards: %, erwartet 2', v_functions;
  END IF;
  IF v_triggers <> 4 THEN
    RAISE EXCEPTION 'C-246 shopping triggers: %, erwartet 4', v_triggers;
  END IF;
  IF v_fks <> 5 THEN
    RAISE EXCEPTION 'C-246 shopping FKs: %, erwartet 5', v_fks;
  END IF;
END $$;

COMMIT;
