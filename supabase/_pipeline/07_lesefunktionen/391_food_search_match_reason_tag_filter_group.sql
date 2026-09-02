-- C-391/C-390: Erklärbarer Suchvertrag und stabile Tag-Untergruppen.
-- food_tags bleibt Importbestand; keine Tagzuordnung wird hier geschrieben.
\set ON_ERROR_STOP on

BEGIN;

ALTER TABLE nutrition.tag_definitions
  ADD COLUMN IF NOT EXISTS filter_group text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tag_definitions_filter_group_check'
      AND conrelid = 'nutrition.tag_definitions'::regclass
  ) THEN
    ALTER TABLE nutrition.tag_definitions
      ADD CONSTRAINT tag_definitions_filter_group_check
      CHECK (filter_group IS NULL OR filter_group IN (
        'dietary_pattern', 'nutrient', 'processing', 'allergen'
      ));
  END IF;
END $$;

WITH groups(code, filter_group) AS (
  VALUES
    ('vegan', 'dietary_pattern'),
    ('vegetarian', 'dietary_pattern'),
    ('halal', 'dietary_pattern'),
    ('kosher', 'dietary_pattern'),
    -- E-49: Bis preferred_cuisines gebaut ist, bleibt Thai Food hier geparkt.
    ('thai_food', 'dietary_pattern'),
    ('high_protein', 'nutrient'),
    ('high_fiber', 'nutrient'),
    ('low_carb', 'nutrient'),
    ('low_fat', 'nutrient'),
    ('whole_food', 'processing'),
    ('ultra_processed', 'processing'),
    ('contains_gluten', 'allergen'),
    ('contains_lactose', 'allergen'),
    ('contains_nuts', 'allergen')
)
UPDATE nutrition.tag_definitions td
SET filter_group = groups.filter_group
FROM groups
WHERE td.code = groups.code;

DO $$
DECLARE
  v_grouped integer;
  v_ungrouped integer;
BEGIN
  SELECT count(*) INTO v_grouped
  FROM nutrition.tag_definitions
  WHERE code IN (
    'vegan', 'vegetarian', 'halal', 'kosher', 'thai_food',
    'high_protein', 'high_fiber', 'low_carb', 'low_fat',
    'whole_food', 'ultra_processed',
    'contains_gluten', 'contains_lactose', 'contains_nuts'
  )
    AND filter_group IS NOT NULL;

  SELECT count(*) INTO v_ungrouped
  FROM nutrition.tag_definitions
  WHERE code IN (
    'vegan', 'vegetarian', 'halal', 'kosher', 'thai_food',
    'high_protein', 'high_fiber', 'low_carb', 'low_fat',
    'whole_food', 'ultra_processed',
    'contains_gluten', 'contains_lactose', 'contains_nuts'
  )
    AND filter_group IS NULL;

  IF v_grouped <> 14 OR v_ungrouped <> 0 THEN
    RAISE EXCEPTION 'C-390: % gruppiert, % ohne Gruppe; erwartet 14 und 0', v_grouped, v_ungrouped;
  END IF;
END $$;

COMMENT ON COLUMN nutrition.tag_definitions.filter_group IS
  'C-390/E-49: Menschenlesbare Filterfrage des Tags; Thai Food ist bis preferred_cuisines bei dietary_pattern geparkt.';

COMMIT;
