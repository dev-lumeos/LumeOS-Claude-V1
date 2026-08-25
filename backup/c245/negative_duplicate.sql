
BEGIN;
WITH target AS (
  SELECT us.id AS stack_id, s.id AS supplement_id
  FROM supplements.user_stacks us
  JOIN auth.users u ON u.id = us.user_id
  JOIN supplements.supplements s ON s.slug = 'sub_9f9bb8c160'
  WHERE u.email = 'test-user@lumeos.local'
    AND us.name = 'Nachweis-Stack'
    AND us.is_active
)
INSERT INTO supplements.stack_items (
  id, stack_id, supplement_id, custom_name, notes, dose, dose_unit,
  frequency, timing, sort_order, is_active
)
SELECT gen_random_uuid(), stack_id, supplement_id, NULL,
       'C-245 Negativprobe: absichtlich doppelte Kreatin-Zeile',
       5, 'g', 'daily', 'any', 99, true
FROM target;

DO $$
DECLARE
  v_duplicates integer;
BEGIN
  WITH test_user AS (
    SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
  ), active_stack AS (
    SELECT us.id
    FROM supplements.user_stacks us
    JOIN test_user u ON u.id = us.user_id
    WHERE us.name = 'Nachweis-Stack' AND us.is_active
  ), rows AS (
    SELECT si.id, s.slug, si.custom_name,
           regexp_replace(lower(COALESCE(si.custom_name, s.name_en, s.slug, '')), '[^a-z0-9]+', '', 'g') AS folded
    FROM supplements.stack_items si
    JOIN active_stack st ON st.id = si.stack_id
    LEFT JOIN supplements.supplements s ON s.id = si.supplement_id
  ), keyed AS (
    SELECT CASE
      WHEN slug = 'sub_9f9bb8c160' OR folded IN ('creatinmonohydrat','creatinemonohydrate') THEN 'creatine_monohydrate'
      WHEN slug = 'sub_4480fcfa86' OR folded IN ('omega3epadha','omega3') THEN 'omega3_epa_dha'
      WHEN folded IN ('vitamind3') THEN 'vitamin_d3'
      ELSE COALESCE(slug, folded)
    END AS duplicate_key
    FROM rows
  )
  SELECT count(*) INTO v_duplicates
  FROM (
    SELECT duplicate_key
    FROM keyed
    GROUP BY duplicate_key
    HAVING count(*) > 1
  ) d;

  IF v_duplicates > 0 THEN
    RAISE EXCEPTION 'C-245 Negativprobe rot: % doppelte Keys gefunden', v_duplicates;
  END IF;
END $$;
COMMIT;
