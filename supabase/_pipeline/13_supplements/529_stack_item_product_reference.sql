-- C-529 -- Bestehende Daten, bewusst in der Pipeline: die G-484-Kruecke
-- `Produkt-Id <uuid>` wird nur dann umgezogen, wenn sie exakt und gegen
-- den Produktkatalog belegbar ist. Freitext und mehrzeilige Notizen bleiben
-- unveraendert; aus Namen wird keine Produkt-ID geraten.

BEGIN;

DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'supplements' AND table_name = 'stack_items'
      AND column_name = 'supplier_product_id'
  ) THEN
    RAISE EXCEPTION 'C-529 braucht supplements.stack_items.supplier_product_id';
  END IF;
END;
$block$;

UPDATE supplements.stack_items AS item
   SET supplier_product_id = product.id,
       notes = NULL
  FROM supplements.supplier_products AS product
 WHERE item.supplier_product_id IS NULL
   AND btrim(item.notes) = 'Produkt-Id ' || product.id::text;

DO $block$
DECLARE
  v_remaining integer;
BEGIN
  SELECT count(*) INTO v_remaining
  FROM supplements.stack_items AS item
  JOIN supplements.supplier_products AS product
    ON btrim(item.notes) = 'Produkt-Id ' || product.id::text
  WHERE item.supplier_product_id IS NULL;

  IF v_remaining <> 0 THEN
    RAISE EXCEPTION 'C-529: % eindeutige Produkt-Id-Notiz(en) blieben unverknuepft', v_remaining;
  END IF;
END;
$block$;

COMMIT;
