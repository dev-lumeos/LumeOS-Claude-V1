-- G-221 / E-22: only tags with a positive, reproducible basis enter V1.
-- The missing macro thresholds and the lactose contradiction stay deliberately open.
\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE g221_existing_assignments ON COMMIT DROP AS
SELECT tag_code, count(*) AS assignment_count
FROM nutrition.food_tags
WHERE tag_code NOT IN ('high_fat', 'gluten_free')
GROUP BY tag_code;

INSERT INTO nutrition.tag_definitions
  (code, name_de, name_en, tag_type, is_exclusion_relevant, icon, sort_order, requires_macro_check, macro_rule, filter_group)
VALUES
  (
    'high_fat',
    'Fettreich',
    'High fat',
    'diet',
    false,
    '',
    35,
    true,
    '{"nutrient_code":"FAT","op":">","value":17.5,"unit":"g_per_100g","source":"UK Department of Health and Social Care, Front of Pack nutrition labelling guidance, Table 2","source_url":"https://www.gov.uk/government/publications/front-of-pack-nutrition-labelling-guidance"}'::jsonb,
    'nutrient'
  ),
  (
    'gluten_free',
    'Glutenfrei',
    'Gluten free',
    'diet',
    false,
    '',
    105,
    false,
    NULL,
    'dietary_pattern'
  )
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule,
  filter_group = EXCLUDED.filter_group;

DELETE FROM nutrition.food_tags
WHERE tag_code IN ('high_fat', 'gluten_free');

INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT fn.food_id, 'high_fat', 1.0
FROM nutrition.food_nutrients fn
WHERE fn.nutrient_code = 'FAT'
  AND fn.value > 17.5;

INSERT INTO nutrition.food_tags (food_id, tag_code, confidence)
SELECT f.id, 'gluten_free', 1.0
FROM nutrition.foods f
WHERE (
    f.name_de ~* '(^|[^[:alnum:]])glutenfrei([^[:alnum:]]|$)'
    OR f.name_en ~* '(^|[^[:alnum:]])gluten[ -]?free([^[:alnum:]]|$)'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM nutrition.food_tags ft
    WHERE ft.food_id = f.id
      AND ft.tag_code = 'contains_gluten'
  );

DO $$
DECLARE
  v_high_fat int;
  v_high_fat_expected int;
  v_gluten_free int;
  v_gluten_free_expected int;
  v_overlap int;
  v_changed_existing int;
BEGIN
  SELECT count(*) INTO v_high_fat
  FROM nutrition.food_tags
  WHERE tag_code = 'high_fat';

  SELECT count(*) INTO v_high_fat_expected
  FROM nutrition.food_nutrients
  WHERE nutrient_code = 'FAT'
    AND value > 17.5;

  IF v_high_fat <> v_high_fat_expected THEN
    RAISE EXCEPTION 'G-221: high_fat % Zuordnungen, erwartet %', v_high_fat, v_high_fat_expected;
  END IF;

  SELECT count(*) INTO v_gluten_free
  FROM nutrition.food_tags
  WHERE tag_code = 'gluten_free';

  SELECT count(*) INTO v_gluten_free_expected
  FROM nutrition.foods f
  WHERE (
      f.name_de ~* '(^|[^[:alnum:]])glutenfrei([^[:alnum:]]|$)'
      OR f.name_en ~* '(^|[^[:alnum:]])gluten[ -]?free([^[:alnum:]]|$)'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM nutrition.food_tags ft
      WHERE ft.food_id = f.id
        AND ft.tag_code = 'contains_gluten'
    );

  IF v_gluten_free <> v_gluten_free_expected THEN
    RAISE EXCEPTION 'G-221: gluten_free % Zuordnungen, erwartet %', v_gluten_free, v_gluten_free_expected;
  END IF;

  SELECT count(*) INTO v_overlap
  FROM nutrition.food_tags low_fat
  JOIN nutrition.food_tags high_fat
    ON high_fat.food_id = low_fat.food_id
  WHERE low_fat.tag_code = 'low_fat'
    AND high_fat.tag_code = 'high_fat';

  IF v_overlap <> 0 THEN
    RAISE EXCEPTION 'G-221: low_fat und high_fat ueberlappen bei % Lebensmitteln', v_overlap;
  END IF;

  SELECT count(*) INTO v_overlap
  FROM nutrition.food_tags gluten_free
  JOIN nutrition.food_tags contains_gluten
    ON contains_gluten.food_id = gluten_free.food_id
  WHERE gluten_free.tag_code = 'gluten_free'
    AND contains_gluten.tag_code = 'contains_gluten';

  IF v_overlap <> 0 THEN
    RAISE EXCEPTION 'G-221: gluten_free und contains_gluten ueberlappen bei % Lebensmitteln', v_overlap;
  END IF;

  SELECT count(*) INTO v_changed_existing
  FROM g221_existing_assignments before
  FULL JOIN (
    SELECT tag_code, count(*) AS assignment_count
    FROM nutrition.food_tags
    WHERE tag_code NOT IN ('high_fat', 'gluten_free')
    GROUP BY tag_code
  ) after USING (tag_code)
  WHERE before.assignment_count IS DISTINCT FROM after.assignment_count;

  IF v_changed_existing <> 0 THEN
    RAISE EXCEPTION 'G-221: % bestehende Tag-Zuordnungen wurden veraendert', v_changed_existing;
  END IF;
END $$;

COMMIT;
