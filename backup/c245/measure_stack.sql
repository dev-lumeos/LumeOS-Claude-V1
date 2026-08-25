
WITH test_user AS (
  SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'
), active_stack AS (
  SELECT us.id
  FROM supplements.user_stacks us
  JOIN test_user u ON u.id = us.user_id
  WHERE us.name = 'Nachweis-Stack' AND us.is_active
), rows AS (
  SELECT si.id, si.supplement_id, s.slug, s.name_en, si.custom_name,
         regexp_replace(lower(COALESCE(si.custom_name, s.name_en, s.slug, '')), '[^a-z0-9]+', '', 'g') AS folded,
         (SELECT count(*) FROM supplements.intake_logs il WHERE il.stack_item_id = si.id) AS intake_count,
         si.dose, si.dose_unit, si.stock_remaining, si.low_stock_threshold
  FROM supplements.stack_items si
  JOIN active_stack st ON st.id = si.stack_id
  LEFT JOIN supplements.supplements s ON s.id = si.supplement_id
), keyed AS (
  SELECT *, CASE
    WHEN slug = 'sub_9f9bb8c160' OR folded IN ('creatinmonohydrat','creatinemonohydrate') THEN 'creatine_monohydrate'
    WHEN slug = 'sub_4480fcfa86' OR folded IN ('omega3epadha','omega3') THEN 'omega3_epa_dha'
    WHEN folded IN ('vitamind3') THEN 'vitamin_d3'
    ELSE COALESCE(slug, folded)
  END AS duplicate_key
  FROM rows
)
SELECT 'position' AS kind, duplicate_key, COALESCE(name_en, custom_name, slug) AS label, supplement_id::text, custom_name, intake_count::text
FROM keyed
UNION ALL
SELECT 'duplicate', duplicate_key, count(*)::text, NULL, NULL, sum(intake_count)::text
FROM keyed
GROUP BY duplicate_key
HAVING count(*) > 1
UNION ALL
SELECT 'summary', 'stack_items_total', count(*)::text, NULL, NULL, NULL FROM keyed
UNION ALL
SELECT 'summary', 'stack_items_with_supplement_id', count(*) FILTER (WHERE supplement_id IS NOT NULL)::text, NULL, NULL, NULL FROM keyed
UNION ALL
SELECT 'summary', 'stack_items_with_custom_name', count(*) FILTER (WHERE custom_name IS NOT NULL)::text, NULL, NULL, NULL FROM keyed
UNION ALL
SELECT 'summary', 'intake_logs_total', (SELECT count(*)::text FROM supplements.intake_logs), NULL, NULL, NULL
ORDER BY kind, duplicate_key, label;
