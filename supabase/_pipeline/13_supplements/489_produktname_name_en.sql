BEGIN;

UPDATE supplements.supplement_field_sources
SET field_name = 'name_en'
WHERE source = 'dsld'
  AND supplier_product_id IS NOT NULL
  AND field_name = 'name';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM supplements.supplement_field_sources
    WHERE source = 'dsld' AND supplier_product_id IS NOT NULL AND field_name = 'name'
  ) THEN
    RAISE EXCEPTION 'C-489: DSLD-Herkunft verweist noch auf die alte Produktspalte name';
  END IF;
END $$;

COMMIT;
