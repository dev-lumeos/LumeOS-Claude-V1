-- C-499/G-458: Marktstatus ist Katalogzustand, kein Migrationsschema.
BEGIN;

UPDATE supplements.supplier_products
SET is_active = false
WHERE market_status = 'Off Market'
  AND is_active IS DISTINCT FROM false;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplier_products WHERE market_status = 'Off Market' AND NOT is_active) <> 92821 THEN
    RAISE EXCEPTION 'C-499/G-458: erwartete 92.821 stillgelegte Off-Market-Produkte';
  END IF;
END $$;

COMMIT;
