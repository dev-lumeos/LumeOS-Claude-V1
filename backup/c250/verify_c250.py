import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql


OUT = Path("backup/c250")
OUT.mkdir(parents=True, exist_ok=True)

TEST_USER = "test-user@lumeos.local"

TEST_USER_ID = psql(f"""
SELECT id::text
FROM auth.users
WHERE email = '{TEST_USER}';
""").strip()

if not TEST_USER_ID:
    raise SystemExit(f"{TEST_USER} nicht in auth.users gefunden")


def write(name: str, sql: str) -> str:
    out = psql(sql)
    (OUT / name).write_text(out + "\n", encoding="utf-8", newline="\n")
    print(f"backup/c250/{name}")
    print(out)
    return out


write("testuser-stack-current.log", f"""
WITH u AS (
  SELECT id FROM auth.users WHERE email = '{TEST_USER}'
), active_stack AS (
  SELECT us.id, us.name
  FROM supplements.user_stacks us
  JOIN u ON u.id = us.user_id
  WHERE us.is_active
), items AS (
  SELECT
    ast.name AS stack_name,
    si.id,
    COALESCE(NULLIF(s.name_de, ''), s.name_en, si.custom_name, '-') AS name,
    s.slug,
    si.custom_name,
    si.supplement_id,
    (
      SELECT count(*)
      FROM supplements.intake_logs il
      WHERE il.stack_item_id = si.id
    ) AS intake_logs
  FROM active_stack ast
  JOIN supplements.stack_items si ON si.stack_id = ast.id
  LEFT JOIN supplements.supplements s ON s.id = si.supplement_id
  WHERE si.is_active
)
SELECT stack_name || '|' || count(*) || '|' ||
       count(supplement_id) || '|' || count(custom_name)
FROM items
GROUP BY stack_name
UNION ALL
SELECT name || '|' || COALESCE(slug, 'custom') || '|' ||
       COALESCE(custom_name, '') || '|' || intake_logs::text
FROM items
ORDER BY 1;
""")

write("testuser-shopping-rls-current.log", f"""
BEGIN;
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claim.sub', '{TEST_USER_ID}', true);
SELECT 'shopping_lists|' || count(*) FROM nutrition.shopping_lists;
SELECT 'shopping_list_items|' || count(*) FROM nutrition.shopping_list_items;
SELECT COALESCE(NULLIF(f.name_display_de, ''), f.name_de) || '|' ||
       sli.item_source || '|' || sli.unit_display || '|' ||
       COALESCE(sli.amount_g::text, sli.quantity::text, '')
FROM nutrition.shopping_list_items sli
JOIN nutrition.foods f ON f.id = sli.food_id
ORDER BY sli.sort_order;
ROLLBACK;
""")

write("required-new-supplement-fields.log", """
WITH required(table_name, column_name) AS (
  VALUES
    ('supplements', 'id'),
    ('supplements', 'slug'),
    ('supplements', 'name_de'),
    ('supplements', 'name_en'),
    ('supplements', 'evidence_grade'),
    ('supplements', 'category_id'),
    ('supplements', 'im_katalog'),
    ('supplement_categories', 'name_de'),
    ('supplement_categories', 'name_en'),
    ('supplement_dosing', 'dose_unit'),
    ('supplement_dosing', 'guideline_dose'),
    ('supplement_dosing', 'official_label_dose'),
    ('supplement_dosing', 'studied_dose_ranges'),
    ('supplement_evidence', 'summary_de'),
    ('supplement_evidence', 'summary_en'),
    ('supplement_evidence', 'overall_grade')
)
SELECT r.table_name || '.' || r.column_name || '|ok'
FROM required r
JOIN information_schema.columns c
  ON c.table_schema = 'supplements'
 AND c.table_name = r.table_name
 AND c.column_name = r.column_name
ORDER BY r.table_name, r.column_name;
""")

write("negative-wrong-field.log", """
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'supplements'
      AND table_name = 'supplements'
      AND column_name = 'name'
  ) THEN
    RAISE EXCEPTION 'NEGATIVPROBE OK: supplements.supplements.name existiert nicht';
  END IF;
END $$;
""")

write("negative-missing-supplement-id.log", """
BEGIN;
DO $$
DECLARE
  v_stack uuid;
BEGIN
  SELECT us.id INTO v_stack
  FROM supplements.user_stacks us
  JOIN auth.users u ON u.id = us.user_id
  WHERE u.email = 'test-user@lumeos.local'
    AND us.is_active
  LIMIT 1;

  INSERT INTO supplements.stack_items (
    stack_id, supplement_id, dose, dose_unit, timing, frequency
  )
  VALUES (
    v_stack,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    1, 'g', 'any', 'daily'
  );
END $$;
ROLLBACK;
""")
