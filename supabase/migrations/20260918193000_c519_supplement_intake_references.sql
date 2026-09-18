BEGIN;

-- C-519/E-84: Ein Produkt-Supplement bleibt im Supplements-Schema. Nutrition
-- speichert weder Produktdaten noch einen Naehrwert-Snapshot, sondern nur den
-- Verweis auf die einzelne Einnahme.
ALTER TABLE supplements.intake_logs
  ALTER COLUMN stack_item_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS meal_id uuid
    REFERENCES nutrition.meals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_product_serving_size text,
  ADD COLUMN IF NOT EXISTS supplier_product_serving_quantity numeric(10,3),
  ADD COLUMN IF NOT EXISTS supplier_product_nutrient_status text,
  ADD COLUMN IF NOT EXISTS supplier_product_nutrients_snapshot jsonb;

CREATE INDEX IF NOT EXISTS intake_logs_meal_idx
  ON supplements.intake_logs(meal_id) WHERE meal_id IS NOT NULL;

ALTER TABLE supplements.intake_logs
  DROP CONSTRAINT IF EXISTS intake_logs_supplier_product_snapshot_check,
  ADD CONSTRAINT intake_logs_supplier_product_snapshot_check CHECK (
    (supplier_product_id IS NULL
      AND supplier_product_serving_size IS NULL
      AND supplier_product_serving_quantity IS NULL
      AND supplier_product_nutrient_status IS NULL
      AND supplier_product_nutrients_snapshot IS NULL)
    OR
    (supplier_product_id IS NOT NULL
      AND supplier_product_serving_quantity IS NOT NULL
      AND supplier_product_serving_quantity > 0
      AND supplier_product_nutrient_status IN ('available', 'no_nutrients_available')
      AND supplier_product_nutrients_snapshot IS NOT NULL
      AND jsonb_typeof(supplier_product_nutrients_snapshot) = 'object'
      AND (
        supplier_product_nutrient_status = 'available'
        OR (supplier_product_serving_size IS NULL
            AND supplier_product_nutrients_snapshot = '{}'::jsonb)
      ))
  );

CREATE OR REPLACE FUNCTION supplements.intake_logs_meal_owner_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_meal_user_id uuid;
  v_entry_date date;
BEGIN
  IF NEW.meal_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT m.user_id, m.entry_date INTO v_meal_user_id, v_entry_date
  FROM nutrition.meals m
  WHERE m.id = NEW.meal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'C519: meal % does not exist', NEW.meal_id
      USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id IS DISTINCT FROM v_meal_user_id THEN
    RAISE EXCEPTION 'C519: intake log and meal must have the same owner'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.intake_date IS DISTINCT FROM v_entry_date THEN
    RAISE EXCEPTION 'C519: intake date must match the linked meal date'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS intake_logs_meal_owner_guard_trg ON supplements.intake_logs;
CREATE TRIGGER intake_logs_meal_owner_guard_trg
  BEFORE INSERT OR UPDATE OF user_id, meal_id, intake_date
  ON supplements.intake_logs
  FOR EACH ROW EXECUTE FUNCTION supplements.intake_logs_meal_owner_guard();

COMMENT ON COLUMN supplements.intake_logs.meal_id IS
  'C-519/E-84: optionale Mahlzeit, in der diese Einnahme erscheint; die Einnahme bleibt Supplements-SSOT.';
COMMENT ON COLUMN supplements.intake_logs.supplier_product_nutrients_snapshot IS
  'C-519: historischer Naehrwert-Snapshot einer konkreten Produkt-Einnahme; Nutrition speichert ihn nicht.';

-- Ein Rezept hat eine Nutrition-Zutat als positions- und RLS-Anker. Der
-- Produktverweis selbst liegt ausschliesslich im Supplements-Schema.
ALTER TABLE nutrition.recipe_ingredients
  ALTER COLUMN amount_g DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS recipe_ingredients_amount_g_check,
  DROP CONSTRAINT IF EXISTS recipe_ingredients_food_source_check,
  DROP CONSTRAINT IF EXISTS recipe_ingredients_source_target_check,
  DROP CONSTRAINT IF EXISTS recipe_ingredients_portion_check,
  ADD CONSTRAINT recipe_ingredients_amount_g_check CHECK (
    (food_source = 'supplement' AND amount_g IS NULL)
    OR (food_source <> 'supplement' AND amount_g > 0)
  ),
  ADD CONSTRAINT recipe_ingredients_food_source_check CHECK (
    food_source IN ('bls', 'custom', 'supplement')
  ),
  ADD CONSTRAINT recipe_ingredients_source_target_check CHECK (
    (food_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL)
    OR (food_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL)
    OR (food_source = 'supplement' AND food_id IS NULL AND custom_food_id IS NULL)
  ),
  ADD CONSTRAINT recipe_ingredients_portion_check CHECK (
    (food_source = 'supplement'
      AND portion_name IS NULL AND portion_quantity IS NULL AND portion_amount_g IS NULL)
    OR
    (food_source <> 'supplement'
      AND ((portion_name IS NULL AND portion_quantity IS NULL AND portion_amount_g IS NULL)
        OR (portion_name IS NOT NULL AND length(trim(portion_name)) > 0
          AND portion_quantity IS NOT NULL AND portion_quantity > 0
          AND portion_amount_g IS NOT NULL AND portion_amount_g > 0
          AND abs(amount_g - (portion_quantity * portion_amount_g)) <= 0.01)))
  );

CREATE TABLE IF NOT EXISTS supplements.recipe_product_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_ingredient_id uuid NOT NULL UNIQUE
    REFERENCES nutrition.recipe_ingredients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_product_id uuid NOT NULL
    REFERENCES supplements.supplier_products(id) ON DELETE RESTRICT,
  serving_size text,
  serving_quantity numeric(10,3) NOT NULL CHECK (serving_quantity > 0),
  nutrient_status text NOT NULL CHECK (nutrient_status IN ('available', 'no_nutrients_available')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recipe_product_references_recipe_ingredient_idx
  ON supplements.recipe_product_references(recipe_ingredient_id);
CREATE INDEX IF NOT EXISTS recipe_product_references_user_idx
  ON supplements.recipe_product_references(user_id);

CREATE OR REPLACE FUNCTION supplements.recipe_product_references_owner_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_owner uuid;
  v_source text;
BEGIN
  SELECT ri.user_id, ri.food_source INTO v_owner, v_source
  FROM nutrition.recipe_ingredients ri
  WHERE ri.id = NEW.recipe_ingredient_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'C519: recipe ingredient % does not exist', NEW.recipe_ingredient_id
      USING ERRCODE = '23503';
  END IF;
  IF v_owner IS DISTINCT FROM NEW.user_id OR v_source <> 'supplement' THEN
    RAISE EXCEPTION 'C519: recipe supplement reference must belong to its supplement ingredient owner'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS recipe_product_references_owner_guard_trg ON supplements.recipe_product_references;
CREATE TRIGGER recipe_product_references_owner_guard_trg
  BEFORE INSERT OR UPDATE OF recipe_ingredient_id, user_id
  ON supplements.recipe_product_references
  FOR EACH ROW EXECUTE FUNCTION supplements.recipe_product_references_owner_guard();
DROP TRIGGER IF EXISTS recipe_product_references_touch_updated_at ON supplements.recipe_product_references;
CREATE TRIGGER recipe_product_references_touch_updated_at
  BEFORE UPDATE ON supplements.recipe_product_references
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON supplements.recipe_product_references TO authenticated;
GRANT ALL ON supplements.recipe_product_references TO service_role;
ALTER TABLE supplements.recipe_product_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recipe_product_references_select ON supplements.recipe_product_references;
DROP POLICY IF EXISTS recipe_product_references_insert ON supplements.recipe_product_references;
DROP POLICY IF EXISTS recipe_product_references_update ON supplements.recipe_product_references;
DROP POLICY IF EXISTS recipe_product_references_delete ON supplements.recipe_product_references;
CREATE POLICY recipe_product_references_select ON supplements.recipe_product_references
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY recipe_product_references_insert ON supplements.recipe_product_references
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipe_product_references_update ON supplements.recipe_product_references
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY recipe_product_references_delete ON supplements.recipe_product_references
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- C-513-Zwischenzustand: Die Vollkette verschiebt die eine historische Zeile
-- im folgenden Pipeline-Schritt. Bis dahin akzeptiert der Constraint sowohl
-- den alten Snapshot als auch den neuen, reinen Log-Verweis.
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS supplement_intake_log_id uuid
    REFERENCES supplements.intake_logs(id) ON DELETE RESTRICT,
  ALTER COLUMN food_name DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS meal_items_amount_g_check,
  DROP CONSTRAINT IF EXISTS meal_items_source_target_check,
  DROP CONSTRAINT IF EXISTS meal_items_supplement_snapshot_check,
  ADD CONSTRAINT meal_items_amount_g_check CHECK (
    (food_source = 'supplement' AND amount_g IS NULL)
    OR (food_source <> 'supplement' AND amount_g > 0)
  ),
  ADD CONSTRAINT meal_items_source_target_check CHECK (
    (food_source = 'bls' AND food_id IS NOT NULL AND custom_food_id IS NULL
      AND supplement_product_id IS NULL AND supplement_intake_log_id IS NULL)
    OR (food_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL
      AND supplement_product_id IS NULL AND supplement_intake_log_id IS NULL)
    OR (food_source = 'manual' AND food_id IS NULL AND custom_food_id IS NULL
      AND supplement_product_id IS NULL AND supplement_intake_log_id IS NULL)
    OR (food_source = 'supplement' AND food_id IS NULL AND custom_food_id IS NULL
      AND ((supplement_product_id IS NOT NULL AND supplement_intake_log_id IS NULL)
        OR (supplement_product_id IS NULL AND supplement_intake_log_id IS NOT NULL)))
  ),
  ADD CONSTRAINT meal_items_supplement_snapshot_check CHECK (
    (food_source = 'supplement' AND supplement_product_id IS NOT NULL
      AND supplement_serving_quantity IS NOT NULL AND supplement_serving_quantity > 0
      AND supplement_nutrient_status IN ('available', 'no_nutrients_available'))
    OR (food_source = 'supplement' AND supplement_intake_log_id IS NOT NULL
      AND supplement_product_id IS NULL AND supplement_serving_size IS NULL
      AND supplement_serving_quantity IS NULL AND supplement_nutrient_status IS NULL
      AND enercc IS NULL AND prot625 IS NULL AND fat IS NULL AND cho IS NULL
      AND fibt IS NULL AND sugar IS NULL AND fasat IS NULL AND nacl IS NULL
      AND water_g IS NULL AND nutrients = '{}'::jsonb)
    OR (food_source <> 'supplement' AND supplement_product_id IS NULL
      AND supplement_intake_log_id IS NULL AND supplement_serving_size IS NULL
      AND supplement_serving_quantity IS NULL AND supplement_nutrient_status IS NULL)
  );
CREATE INDEX IF NOT EXISTS meal_items_supplement_intake_log_idx
  ON nutrition.meal_items(supplement_intake_log_id)
  WHERE supplement_intake_log_id IS NOT NULL;

CREATE OR REPLACE FUNCTION nutrition.meal_items_owner_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_meal_owner uuid;
  v_log_owner uuid;
  v_log_meal uuid;
BEGIN
  SELECT m.user_id INTO v_meal_owner FROM nutrition.meals m WHERE m.id = NEW.meal_id;
  IF v_meal_owner IS NULL THEN
    RAISE EXCEPTION 'meal_items.meal_id % existiert nicht', NEW.meal_id USING ERRCODE = '23503';
  END IF;
  IF NEW.user_id <> v_meal_owner THEN
    RAISE EXCEPTION 'meal_items.user_id (%) weicht von meals.user_id (%) ab', NEW.user_id, v_meal_owner
      USING ERRCODE = '23514';
  END IF;
  IF NEW.supplement_intake_log_id IS NOT NULL THEN
    SELECT il.user_id, il.meal_id INTO v_log_owner, v_log_meal
    FROM supplements.intake_logs il WHERE il.id = NEW.supplement_intake_log_id;
    IF NOT FOUND OR v_log_owner IS DISTINCT FROM NEW.user_id OR v_log_meal IS DISTINCT FROM NEW.meal_id THEN
      RAISE EXCEPTION 'C519: meal supplement reference must point to the owner''s intake log for this meal'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION supplements.supplier_product_nutrient_snapshot(
  p_supplier_product_id uuid,
  p_serving_quantity numeric DEFAULT 1,
  p_serving_size text DEFAULT NULL
)
RETURNS TABLE (serving_size text, nutrient_status text, nutrients jsonb)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_option supplements.supplier_product_nutrient_serving_options%ROWTYPE;
  v_option_count integer;
BEGIN
  IF p_serving_quantity IS NULL OR p_serving_quantity <= 0 THEN
    RAISE EXCEPTION 'C519: serving quantity must be greater than zero' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM supplements.supplier_products sp WHERE sp.id = p_supplier_product_id) THEN
    RAISE EXCEPTION 'C519: supplier product % not found', p_supplier_product_id USING ERRCODE = 'P0002';
  END IF;
  SELECT count(*) INTO v_option_count
  FROM supplements.supplier_product_nutrient_serving_options o WHERE o.product_id = p_supplier_product_id;
  IF v_option_count > 1 AND NULLIF(btrim(p_serving_size), '') IS NULL THEN
    RAISE EXCEPTION 'C519: product % has multiple serving sizes; choose one explicitly', p_supplier_product_id USING ERRCODE = 'P0001';
  END IF;
  IF v_option_count = 0 THEN
    IF NULLIF(btrim(p_serving_size), '') IS NOT NULL THEN
      RAISE EXCEPTION 'C519: product % has no evidenced nutrient serving size', p_supplier_product_id USING ERRCODE = '22023';
    END IF;
    RETURN QUERY SELECT NULL::text, 'no_nutrients_available'::text, '{}'::jsonb;
    RETURN;
  END IF;
  SELECT o.* INTO v_option
  FROM supplements.supplier_product_nutrient_serving_options o
  WHERE o.product_id = p_supplier_product_id
    AND (v_option_count = 1 OR o.serving_size = btrim(p_serving_size));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'C519: serving size % is not an evidenced option for product %', p_serving_size, p_supplier_product_id
      USING ERRCODE = '22023';
  END IF;
  RETURN QUERY SELECT v_option.serving_size, 'available'::text,
    jsonb_strip_nulls(jsonb_build_object(
      'ENERCC', v_option.enercc * p_serving_quantity, 'PROT625', v_option.prot625 * p_serving_quantity,
      'FAT', v_option.fat * p_serving_quantity, 'CHO', v_option.cho * p_serving_quantity,
      'FIBT', v_option.fibt * p_serving_quantity, 'SUGAR', v_option.sugar * p_serving_quantity,
      'FASAT', v_option.fasat * p_serving_quantity, 'NACL', v_option.nacl * p_serving_quantity,
      'WATER', v_option.water_g * p_serving_quantity, 'ALC', v_option.alc * p_serving_quantity,
      'VITA', v_option.vita_ug * p_serving_quantity, 'VITD', v_option.vitd_ug * p_serving_quantity,
      'VITE', v_option.vite_mg * p_serving_quantity, 'VITK', v_option.vitk_ug * p_serving_quantity,
      'VITC', v_option.vitc_mg * p_serving_quantity, 'THIA', v_option.thia_mg * p_serving_quantity,
      'RIBF', v_option.ribf_mg * p_serving_quantity, 'NIA', v_option.nia_mg * p_serving_quantity,
      'VITB6', v_option.vitb6_ug * p_serving_quantity, 'FOL', v_option.fol_ug * p_serving_quantity,
      'VITB12', v_option.vitb12_ug * p_serving_quantity, 'NA', v_option.na_mg * p_serving_quantity,
      'K', v_option.k_mg * p_serving_quantity, 'CA', v_option.ca_mg * p_serving_quantity,
      'MG', v_option.mg_mg * p_serving_quantity, 'P', v_option.p_mg * p_serving_quantity,
      'FE', v_option.fe_mg * p_serving_quantity, 'ZN', v_option.zn_mg * p_serving_quantity,
      'ID', v_option.id_ug * p_serving_quantity, 'CU', v_option.cu_ug * p_serving_quantity,
      'MN', v_option.mn_ug * p_serving_quantity
    )) || coalesce((SELECT jsonb_object_agg(k, v::numeric * p_serving_quantity)
                    FROM jsonb_each_text(v_option.nutrients) AS j(k, v)), '{}'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION supplements.record_supplier_product_intake(
  p_supplier_product_id uuid,
  p_intake_date date DEFAULT current_date,
  p_intake_time time DEFAULT NULL,
  p_serving_quantity numeric DEFAULT 1,
  p_serving_size text DEFAULT NULL,
  p_meal_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_meal record;
  v_product record;
  v_snapshot record;
  v_log_id uuid;
BEGIN
  IF p_meal_id IS NOT NULL THEN
    SELECT m.user_id, m.entry_date INTO v_meal FROM nutrition.meals m WHERE m.id = p_meal_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'C519: meal % not found or not readable', p_meal_id USING ERRCODE = 'P0002'; END IF;
    v_user_id := v_meal.user_id;
    IF auth.uid() IS NOT NULL AND auth.uid() <> v_user_id THEN RAISE EXCEPTION 'C519: foreign meal' USING ERRCODE = '42501'; END IF;
    IF p_intake_date IS DISTINCT FROM v_meal.entry_date THEN RAISE EXCEPTION 'C519: intake date must match meal date' USING ERRCODE = '22023'; END IF;
  ELSE
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'C519: authentication required for an intake without meal' USING ERRCODE = '42501'; END IF;
  END IF;
  SELECT sp.id, sp.marke, sp.name_en INTO v_product FROM supplements.supplier_products sp WHERE sp.id = p_supplier_product_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'C519: supplier product % not found', p_supplier_product_id USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_snapshot FROM supplements.supplier_product_nutrient_snapshot(p_supplier_product_id, p_serving_quantity, p_serving_size);
  INSERT INTO supplements.intake_logs (
    user_id, stack_item_id, meal_id, intake_date, intake_time, status,
    supplement_name_snapshot, dose_snapshot, dose_unit_snapshot, supplier_product_id,
    supplier_product_serving_size, supplier_product_serving_quantity,
    supplier_product_nutrient_status, supplier_product_nutrients_snapshot, source_detail
  ) VALUES (
    v_user_id, NULL, p_meal_id, p_intake_date, p_intake_time, 'taken',
    concat_ws(' ', nullif(v_product.marke, ''), v_product.name_en), p_serving_quantity, 'serving', p_supplier_product_id,
    v_snapshot.serving_size, p_serving_quantity, v_snapshot.nutrient_status, v_snapshot.nutrients,
    'C-519: supplier product intake snapshot'
  ) RETURNING id INTO v_log_id;
  IF p_meal_id IS NOT NULL THEN
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_source, food_name, amount_g, nutrients,
      supplement_intake_log_id, source_detail
    ) VALUES (p_meal_id, v_user_id, 'supplement', NULL, NULL, '{}'::jsonb, v_log_id,
      'C-519: supplement intake reference');
  END IF;
  RETURN v_log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION supplements.add_supplier_product_to_recipe(
  p_recipe_id uuid,
  p_supplier_product_id uuid,
  p_serving_quantity numeric DEFAULT 1,
  p_serving_size text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_user_id uuid;
  v_snapshot record;
  v_ingredient_id uuid;
BEGIN
  SELECT r.user_id INTO v_user_id FROM nutrition.recipes r WHERE r.id = p_recipe_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'C519: recipe % not found or not readable', p_recipe_id USING ERRCODE = 'P0002'; END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> v_user_id THEN RAISE EXCEPTION 'C519: foreign recipe' USING ERRCODE = '42501'; END IF;
  SELECT * INTO v_snapshot FROM supplements.supplier_product_nutrient_snapshot(p_supplier_product_id, p_serving_quantity, p_serving_size);
  INSERT INTO nutrition.recipe_ingredients (recipe_id, user_id, sort_order, food_source, amount_g)
  SELECT p_recipe_id, v_user_id, coalesce(max(sort_order), -1) + 1, 'supplement', NULL
  FROM nutrition.recipe_ingredients WHERE recipe_id = p_recipe_id
  RETURNING id INTO v_ingredient_id;
  INSERT INTO supplements.recipe_product_references (
    recipe_ingredient_id, user_id, supplier_product_id, serving_size, serving_quantity, nutrient_status
  ) VALUES (v_ingredient_id, v_user_id, p_supplier_product_id, v_snapshot.serving_size,
    p_serving_quantity, v_snapshot.nutrient_status);
  RETURN v_ingredient_id;
END;
$function$;

REVOKE ALL ON FUNCTION supplements.supplier_product_nutrient_snapshot(uuid,numeric,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.record_supplier_product_intake(uuid,date,time,numeric,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.add_supplier_product_to_recipe(uuid,uuid,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_nutrient_snapshot(uuid,numeric,text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.record_supplier_product_intake(uuid,date,time,numeric,text,uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION supplements.add_supplier_product_to_recipe(uuid,uuid,numeric,text) TO authenticated, service_role;

COMMIT;
