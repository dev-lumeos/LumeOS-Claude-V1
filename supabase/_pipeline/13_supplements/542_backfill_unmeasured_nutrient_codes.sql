BEGIN;

-- C-542: Older intake snapshots did not retain named label entries whose
-- quantity was not stated. Derive that single missing snapshot field once,
-- then future reads never consult mutable product-catalog rows again.
UPDATE supplements.intake_logs intake
SET supplier_product_unmeasured_nutrient_codes = supplements.supplier_product_unmeasured_nutrient_codes(
  intake.supplier_product_id,
  intake.supplier_product_serving_size
)
WHERE intake.supplier_product_id IS NOT NULL
  AND intake.supplier_product_unmeasured_nutrient_codes IS NULL;

COMMIT;
