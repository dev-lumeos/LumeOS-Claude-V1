-- C-524/E-83: Toms Formregel wird als Katalogregel geführt, nicht doppelt
-- in der Oberfläche. E-Codes sind die in supplier_products gemessenen
-- DSLD-Produktformcodes (2026-09-21).
BEGIN;

INSERT INTO supplements.product_form_placement_rules (
  form_code, form_label, placement, source_id
) VALUES
  ('E0162', 'Powder', 'meal', 'E-83:tom_formregel'),
  ('E0165', 'Liquid', 'meal', 'E-83:tom_formregel'),
  ('E0164', 'Bar', 'meal', 'E-83:tom_formregel'),
  ('E0176', 'Gummy or Jelly', 'meal', 'E-83:tom_formregel'),
  ('E0159', 'Capsule', 'stack', 'E-83:tom_formregel'),
  ('E0155', 'Tablet or Pill', 'stack', 'E-83:tom_formregel'),
  ('E0161', 'Softgel Capsule', 'stack', 'E-83:tom_formregel'),
  ('E0174', 'Lozenge', 'stack', 'E-83:tom_formregel'),
  ('E0172', 'Other (e.g. tea bag)', 'unsupported', 'E-83:tom_formregel_offen'),
  ('E0177', 'Unknown', 'unsupported', 'E-83:tom_formregel_offen')
ON CONFLICT (form_code) DO UPDATE SET
  form_label = EXCLUDED.form_label,
  placement = EXCLUDED.placement,
  source_id = EXCLUDED.source_id
WHERE supplements.product_form_placement_rules.form_label IS DISTINCT FROM EXCLUDED.form_label
   OR supplements.product_form_placement_rules.placement IS DISTINCT FROM EXCLUDED.placement
   OR supplements.product_form_placement_rules.source_id IS DISTINCT FROM EXCLUDED.source_id;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.product_form_placement_rules) <> 10 THEN
    RAISE EXCEPTION 'C-524: erwartete zehn DSLD-Produktformregeln';
  END IF;
  IF (SELECT placement FROM supplements.product_form_placement_rules WHERE form_code = 'E0159') <> 'stack' THEN
    RAISE EXCEPTION 'C-524: Capsule muss im Stack bleiben';
  END IF;
END;
$$;

COMMIT;
