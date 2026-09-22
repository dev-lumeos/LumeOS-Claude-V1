BEGIN;

-- C-529: Ein Stackeintrag kann ein konkretes Katalogprodukt meinen,
-- ohne eine Hauptsubstanz aus dessen Inhaltsstoffen abzuleiten.
ALTER TABLE supplements.stack_items
  ADD COLUMN IF NOT EXISTS supplier_product_id uuid
    REFERENCES supplements.supplier_products(id) ON DELETE SET NULL;

-- Ein Produkt kann ohne Stoffkatalogeintrag und ohne Freitextname im Stack
-- stehen. Die Produkt-ID ist dann die eindeutige Identitaet der Position.
ALTER TABLE supplements.stack_items
  DROP CONSTRAINT IF EXISTS stack_items_check;
ALTER TABLE supplements.stack_items
  ADD CONSTRAINT stack_items_check
  CHECK (
    supplement_id IS NOT NULL
    OR custom_name IS NOT NULL
    OR supplier_product_id IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS stack_items_supplier_product_idx
  ON supplements.stack_items (supplier_product_id)
  WHERE supplier_product_id IS NOT NULL;

COMMENT ON COLUMN supplements.stack_items.supplier_product_id IS
  'C-529: optionales, konkret gewaehltes supplier_product zusaetzlich zur optionalen supplement_id; keine Hauptsubstanz wird daraus abgeleitet.';

COMMIT;
