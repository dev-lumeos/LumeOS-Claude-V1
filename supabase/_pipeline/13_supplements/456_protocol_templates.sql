-- C-456: Die drei PCT_TEMPLATES aus dem alten CyclePlanner als getrennte,
-- kataloggebundene Systemvorlagen. Die Werte werden nicht aus einer neuen Regel abgeleitet.
BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplements WHERE name_en IN (
    'Tamoxifen Citrate (Nolvadex)', 'Clomiphene Citrate (Clomid)', 'Chorionic gonadotropin (hCG)'
  )) <> 3 THEN
    RAISE EXCEPTION 'C-456: die drei belegten CyclePlanner-Katalogsubstanzen fehlen oder sind mehrdeutig';
  END IF;
END $$;

INSERT INTO supplements.supplement_protocol_templates (code, name_de, source, is_active)
VALUES
  ('standard_nolva_clomid', 'Standard Nolva/Clomid', 'legacy_cycleplanner', true),
  ('nolvadex_only_6_weeks', 'Nolvadex Only (6 Wo)', 'legacy_cycleplanner', true),
  ('hcg_nolva', 'HCG + Nolva', 'legacy_cycleplanner', true)
ON CONFLICT (code) DO UPDATE
SET name_de = EXCLUDED.name_de, source = EXCLUDED.source, is_active = EXCLUDED.is_active;

WITH source_items(template_code, supplement_name_en, dose_amount, dose_unit, weeks_start, weeks_end, sort_order) AS (
  VALUES
    ('standard_nolva_clomid', 'Tamoxifen Citrate (Nolvadex)', 40::numeric, 'mg', 1, 2, 1),
    ('standard_nolva_clomid', 'Tamoxifen Citrate (Nolvadex)', 20::numeric, 'mg', 3, 4, 2),
    ('standard_nolva_clomid', 'Clomiphene Citrate (Clomid)', 50::numeric, 'mg', 1, 2, 3),
    ('standard_nolva_clomid', 'Clomiphene Citrate (Clomid)', 25::numeric, 'mg', 3, 4, 4),
    ('nolvadex_only_6_weeks', 'Tamoxifen Citrate (Nolvadex)', 40::numeric, 'mg', 1, 2, 1),
    ('nolvadex_only_6_weeks', 'Tamoxifen Citrate (Nolvadex)', 20::numeric, 'mg', 3, 6, 2),
    ('hcg_nolva', 'Chorionic gonadotropin (hCG)', 1500::numeric, 'IU', 1, 2, 1),
    ('hcg_nolva', 'Tamoxifen Citrate (Nolvadex)', 40::numeric, 'mg', 3, 4, 2),
    ('hcg_nolva', 'Tamoxifen Citrate (Nolvadex)', 20::numeric, 'mg', 5, 6, 3)
)
INSERT INTO supplements.supplement_protocol_template_items (
  template_id, supplement_id, dose_amount, dose_unit, weeks_start, weeks_end, sort_order
)
SELECT t.id, s.id, i.dose_amount, i.dose_unit, i.weeks_start, i.weeks_end, i.sort_order
FROM source_items i
JOIN supplements.supplement_protocol_templates t ON t.code = i.template_code
JOIN supplements.supplements s ON s.name_en = i.supplement_name_en
ON CONFLICT (template_id, sort_order) DO UPDATE
SET supplement_id = EXCLUDED.supplement_id,
    dose_amount = EXCLUDED.dose_amount,
    dose_unit = EXCLUDED.dose_unit,
    weeks_start = EXCLUDED.weeks_start,
    weeks_end = EXCLUDED.weeks_end;

DO $$
BEGIN
  IF (SELECT count(*) FROM supplements.supplement_protocol_templates WHERE code IN (
       'standard_nolva_clomid', 'nolvadex_only_6_weeks', 'hcg_nolva'
     )) <> 3
     OR (SELECT count(*) FROM supplements.supplement_protocol_template_items i
         JOIN supplements.supplement_protocol_templates t ON t.id = i.template_id
         WHERE t.code IN ('standard_nolva_clomid', 'nolvadex_only_6_weeks', 'hcg_nolva')) <> 9 THEN
    RAISE EXCEPTION 'C-456: erwartet drei Vorlagen mit neun Positionen';
  END IF;
END $$;

COMMIT;
