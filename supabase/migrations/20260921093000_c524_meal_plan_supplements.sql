BEGIN;

ALTER TABLE nutrition.meal_plan_entries
  DROP CONSTRAINT meal_plan_entries_entry_type_check,
  ADD CONSTRAINT meal_plan_entries_entry_type_check
    CHECK (entry_type IN ('recipe', 'bls', 'custom', 'supplement')),
  DROP CONSTRAINT meal_plan_entries_target_check,
  ADD CONSTRAINT meal_plan_entries_target_check CHECK (
    (entry_type = 'recipe' AND recipe_id IS NOT NULL AND food_id IS NULL AND custom_food_id IS NULL
      AND planned_servings IS NOT NULL AND amount_g IS NULL)
    OR (entry_type = 'bls' AND recipe_id IS NULL AND food_id IS NOT NULL AND custom_food_id IS NULL
      AND amount_g IS NOT NULL AND planned_servings IS NULL)
    OR (entry_type = 'custom' AND recipe_id IS NULL AND food_id IS NULL AND custom_food_id IS NOT NULL
      AND amount_g IS NOT NULL AND planned_servings IS NULL)
    OR (entry_type = 'supplement' AND recipe_id IS NULL AND food_id IS NULL AND custom_food_id IS NULL
      AND amount_g IS NULL AND planned_servings IS NULL)
  );

CREATE TABLE supplements.product_form_placement_rules (
  form_code text PRIMARY KEY CHECK (btrim(form_code) <> ''),
  form_label text NOT NULL CHECK (btrim(form_label) <> ''),
  placement text NOT NULL CHECK (placement IN ('meal', 'stack', 'unsupported')),
  source_id text NOT NULL CHECK (btrim(source_id) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE supplements.meal_plan_product_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_entry_id uuid NOT NULL UNIQUE REFERENCES nutrition.meal_plan_entries(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_product_id uuid NOT NULL REFERENCES supplements.supplier_products(id) ON DELETE RESTRICT,
  serving_size text NULL,
  serving_quantity numeric NOT NULL DEFAULT 1 CHECK (serving_quantity > 0),
  nutrient_status text NOT NULL CHECK (nutrient_status IN ('available', 'no_nutrients_available')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meal_plan_product_references_user_idx
  ON supplements.meal_plan_product_references(user_id, meal_plan_entry_id);
CREATE INDEX meal_plan_product_references_product_idx
  ON supplements.meal_plan_product_references(supplier_product_id);

CREATE TRIGGER product_form_placement_rules_touch_updated_at
  BEFORE UPDATE ON supplements.product_form_placement_rules
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();
CREATE TRIGGER meal_plan_product_references_touch_updated_at
  BEFORE UPDATE ON supplements.meal_plan_product_references
  FOR EACH ROW EXECUTE FUNCTION supplements.touch_updated_at();

CREATE OR REPLACE FUNCTION supplements.supplier_product_meal_eligibility(p_supplier_product_id uuid)
RETURNS TABLE (
  product_id uuid,
  produktform text,
  form_code text,
  placement text,
  is_meal_eligible boolean,
  notice text
)
LANGUAGE sql
STABLE
SET search_path = pg_catalog, supplements
AS $$
  WITH product AS (
    SELECT sp.id, sp.produktform,
           (regexp_match(sp.produktform, E'\\[([^]]+)\\]$'))[1] AS extracted_form_code
    FROM supplements.supplier_products sp
    WHERE sp.id = p_supplier_product_id
  )
  SELECT p.id,
         p.produktform,
         p.extracted_form_code,
         coalesce(r.placement, 'unsupported') AS placement,
         coalesce(r.placement = 'meal', false) AS is_meal_eligible,
         CASE coalesce(r.placement, 'unsupported')
           WHEN 'meal' THEN NULL
           WHEN 'stack' THEN 'Diese Produktform wird im Stack erfasst, nicht im Mahlzeitplan.'
           ELSE 'Für diese Produktform ist keine Mahlzeitplatzierung festgelegt.'
         END AS notice
  FROM product p
  LEFT JOIN supplements.product_form_placement_rules r ON r.form_code = p.extracted_form_code;
$$;

CREATE OR REPLACE FUNCTION supplements.validate_meal_plan_product_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_entry_user_id uuid;
  v_entry_type text;
  v_eligible boolean;
BEGIN
  SELECT e.user_id, e.entry_type
  INTO v_entry_user_id, v_entry_type
  FROM nutrition.meal_plan_entries e
  WHERE e.id = NEW.meal_plan_entry_id;

  IF v_entry_user_id IS NULL OR v_entry_user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'meal_plan_product_references.user_id muss dem Planeintrag gehören'
      USING ERRCODE = '23514';
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> NEW.user_id THEN
    RAISE EXCEPTION 'meal_plan_product_references gehört einer anderen Nutzerin'
      USING ERRCODE = '42501';
  END IF;
  IF v_entry_type <> 'supplement' THEN
    RAISE EXCEPTION 'meal_plan_product_references braucht einen supplement-Planeintrag'
      USING ERRCODE = '23514';
  END IF;

  SELECT is_meal_eligible INTO v_eligible
  FROM supplements.supplier_product_meal_eligibility(NEW.supplier_product_id);
  IF v_eligible IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Diese Produktform ist nicht für einen Mahlzeitplan zugelassen'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER meal_plan_product_references_guard
  BEFORE INSERT OR UPDATE OF meal_plan_entry_id, user_id, supplier_product_id
  ON supplements.meal_plan_product_references
  FOR EACH ROW EXECUTE FUNCTION supplements.validate_meal_plan_product_reference();

ALTER TABLE supplements.product_form_placement_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements.meal_plan_product_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_form_placement_rules_select
  ON supplements.product_form_placement_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY meal_plan_product_references_select
  ON supplements.meal_plan_product_references FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY meal_plan_product_references_insert
  ON supplements.meal_plan_product_references FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_product_references_update
  ON supplements.meal_plan_product_references FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY meal_plan_product_references_delete
  ON supplements.meal_plan_product_references FOR DELETE TO authenticated USING (auth.uid() = user_id);

REVOKE ALL ON TABLE supplements.product_form_placement_rules FROM PUBLIC, anon;
REVOKE ALL ON TABLE supplements.meal_plan_product_references FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.supplier_product_meal_eligibility(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION supplements.validate_meal_plan_product_reference() FROM PUBLIC, anon;
GRANT SELECT ON TABLE supplements.product_form_placement_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE supplements.meal_plan_product_references TO authenticated;
GRANT EXECUTE ON FUNCTION supplements.supplier_product_meal_eligibility(uuid) TO authenticated;
GRANT ALL ON TABLE supplements.product_form_placement_rules, supplements.meal_plan_product_references TO service_role;

COMMENT ON TABLE supplements.meal_plan_product_references IS
  'C-524/E-84: Produktabsicht eines supplement-Planeintrags. Kein intake_log vor einer echten Mahlzeitbestätigung.';
COMMENT ON TABLE supplements.product_form_placement_rules IS
  'C-524/E-83: eine lesbare Datenbankregel bestimmt je DSLD-Produktform Meal, Stack oder offen; UI und Guard verwenden dieselbe Wahrheit.';
COMMENT ON FUNCTION supplements.supplier_product_meal_eligibility(uuid) IS
  'C-524/E-83: UI-lesbare und im Plan-Guard verwendete Formentscheidung für ein Supplier-Produkt.';

COMMIT;
