-- C-515: Kuratierte DSLD-Wirkstoffe. Nur die hier explizit belegten
-- Ingredient-Labelnamen erhalten Katalogwurzeln bzw. Verknuepfungen. Die
-- Evidenzklasse A belegt ausschliesslich die Stoffidentitaet im DSLD-Label;
-- sie ist keine klinische Wirksamkeitsbewertung (evidence_grade bleibt NULL).
BEGIN;

CREATE TEMP TABLE c515_curated_targets (
  target_slug text NOT NULL,
  ingredient_name text NOT NULL,
  name_de text,
  category_slug text,
  is_new_root boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO c515_curated_targets (
  target_slug, ingredient_name, name_de, category_slug, is_new_root
) VALUES
  ('pantothenic-acid', 'Pantothenic Acid', 'Pantothensaeure', 'vitamine', true),
  ('selenium', 'Selenium', 'Selen', 'mineralstoffe', true),
  ('chromium', 'Chromium', 'Chrom', 'mineralstoffe', true),
  ('inositol', 'Inositol', 'Inosit', 'uebrige', true),
  ('docosahexaenoic-acid', 'Docosahexaenoic Acid', 'Docosahexaensaeure (DHA)', 'uebrige', true),
  ('eicosapentaenoic-acid', 'Eicosapentaenoic Acid', 'Eicosapentaensaeure (EPA)', 'uebrige', true),
  ('bromelain', 'Bromelain', 'Bromelain', 'botanicals', true),
  ('lutein', 'Lutein', 'Lutein', 'uebrige', true),
  ('vanadium', 'Vanadium', 'Vanadium', 'mineralstoffe', true),
  ('papain', 'Papain', 'Papain', 'botanicals', true),
  ('ginger', 'Ginger', 'Ingwer', 'botanicals', true),
  ('alpha-lipoic-acid', 'Alpha Lipoic Acid', 'Alpha-Liponsaeure', 'uebrige', true),
  ('l-valine', 'L-Valine', 'L-Valin', 'protein_aminos', true),
  ('l-isoleucine', 'L-Isoleucine', 'L-Isoleucin', 'protein_aminos', true),
  ('lactase', 'Lactase', 'Laktase', 'uebrige', true),
  ('rutin', 'Rutin', 'Rutin', 'uebrige', true),
  ('lactobacillus-acidophilus', 'Lactobacillus acidophilus', 'Lactobacillus acidophilus', 'uebrige', true),
  ('coenzyme-q10', 'Coenzyme Q10', 'Coenzym Q10', 'uebrige', true),
  ('paba', 'PABA', 'PABA', 'uebrige', true),
  ('turmeric', 'Turmeric', 'Kurkuma', 'botanicals', true),
  ('zeaxanthin', 'Zeaxanthin', 'Zeaxanthin', 'uebrige', true),
  -- Caffeine ist bereits eine Katalogwurzel. Beide exakten DSLD-Formen
  -- werden auf dieselbe Stoffidentitaet gefuehrt, ohne eine neue anzulegen.
  ('caffeine', 'Caffeine', NULL, NULL, false),
  ('caffeine', 'Caffeine Anhydrous', NULL, NULL, false);

INSERT INTO supplements.supplements (
  slug, category_id, name_de, name_en, description_de, description_en, source, evidence_grade
)
SELECT
  t.target_slug,
  c.id,
  t.name_de,
  t.ingredient_name,
  'Kuratierter DSLD-Wirkstoffeintrag. Die vorliegende Quelle belegt die Stoffidentitaet auf dem Etikett; Dosierung, Wirkung und klinische Evidenz sind hier nicht bewertet.',
  'Curated DSLD active-substance entry. The available source establishes label identity only; dosage, effects, and clinical evidence are not assessed here.',
  'c515_dsld_label_curation',
  NULL
FROM c515_curated_targets t
LEFT JOIN supplements.supplement_categories c ON c.slug = t.category_slug
WHERE t.is_new_root
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM c515_curated_targets t
    LEFT JOIN supplements.supplements s ON s.slug = t.target_slug
    WHERE s.id IS NULL
  ) THEN
    RAISE EXCEPTION 'C-515: eine kuratierte Zielwurzel fehlt';
  END IF;

  IF (SELECT count(*) FROM supplements.supplements
      WHERE source = 'c515_dsld_label_curation') <> 21 THEN
    RAISE EXCEPTION 'C-515: erwartete 21 neue Katalogwurzeln';
  END IF;
END $$;

INSERT INTO supplements.supplement_aliases (
  supplement_id, alias, source, confidence
)
SELECT
  s.id,
  t.ingredient_name,
  'c515_dsld_label_curation',
  1.0
FROM c515_curated_targets t
JOIN supplements.supplements s ON s.slug = t.target_slug
ON CONFLICT (supplement_id, alias, source) DO NOTHING;

INSERT INTO supplements.supplement_field_sources (
  supplement_id, status, field_name, source_id, evidence_class,
  source_note_de, source_note_en, source
)
SELECT
  s.id,
  'bekannt',
  'identity.c515_dsld_label',
  'dsld_product_contents:exact_label:' || nutrition.search_fold(t.ingredient_name),
  'A',
  'C-515: Exakte Stoffbezeichnung im DSLD-Dietary-Supplement-Facts-Label; belegt nur die Stoffidentitaet, keine klinische Wirksamkeit.',
  'C-515: Exact substance name in the DSLD Dietary Supplement Facts label; establishes identity only, not clinical efficacy.',
  'c515_dsld_label_curation'
FROM c515_curated_targets t
JOIN supplements.supplements s ON s.slug = t.target_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM supplements.supplement_field_sources fs
  WHERE fs.supplement_id = s.id
    AND fs.field_name = 'identity.c515_dsld_label'
    AND fs.source_id = 'dsld_product_contents:exact_label:' || nutrition.search_fold(t.ingredient_name)
    AND fs.source = 'c515_dsld_label_curation'
);

-- Diese drei Kimi-Eintraege benennen jeweils die spezifizierte Form einer
-- jetzt vorhandenen allgemeinen Stoffwurzel. Die Elternschaft bewahrt ihre
-- eigene Evidenz, verhindert aber eine zweite sichtbare Kernsubstanz.
UPDATE supplements.supplements child
SET parent_id = parent.id,
    updated_at = now()
FROM (VALUES
  ('sub_b7423d9551', 'chromium'),
  ('sub_807cf36d76', 'coenzyme-q10'),
  ('sub_c747ba99bc', 'selenium')
) AS hierarchy(child_slug, parent_slug)
JOIN supplements.supplements parent ON parent.slug = hierarchy.parent_slug
WHERE child.slug = hierarchy.child_slug
  AND child.parent_id IS NULL;

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM (VALUES
      ('sub_b7423d9551', 'chromium'),
      ('sub_807cf36d76', 'coenzyme-q10'),
      ('sub_c747ba99bc', 'selenium')
    ) AS hierarchy(child_slug, parent_slug)
    JOIN supplements.supplements child ON child.slug = hierarchy.child_slug
    JOIN supplements.supplements parent ON parent.slug = hierarchy.parent_slug
    WHERE child.parent_id = parent.id
      AND NOT child.im_katalog
  ) <> 3 THEN
    RAISE EXCEPTION 'C-515: drei spezifische Stoffformen muessen Unterformen sein';
  END IF;
END $$;

UPDATE supplements.product_contents pc
SET supplement_id = s.id,
    updated_at = now()
FROM c515_curated_targets t
JOIN supplements.supplements s ON s.slug = t.target_slug
WHERE pc.source = 'dsld'
  AND pc.supplement_id IS NULL
  AND nutrition.search_fold(pc.ingredient_name) = nutrition.search_fold(t.ingredient_name);

COMMIT;
