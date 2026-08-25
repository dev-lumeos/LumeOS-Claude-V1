import datetime as dt
import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf, psql


STAMP = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = Path("backup/vollsicherung")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
CONTAINER = "supabase_db_LumeOS-Claude-V1"
DUMP_IN_CONTAINER = f"/tmp/{STAMP}_c250_voll.dump"
SQL_IN_CONTAINER = f"/tmp/{STAMP}_c250_voll.sql"
DUMP_LOCAL = BACKUP_DIR / f"{STAMP}_c250_voll.dump"
SQL_LOCAL = BACKUP_DIR / f"{STAMP}_c250_voll.sql"


def run(cmd: list[str]) -> str:
    out = lauf(cmd)
    print(" ".join(cmd))
    if out:
        print(out)
    return out


run(["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres", "-Fc", "-f", DUMP_IN_CONTAINER])
run(["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres", "-f", SQL_IN_CONTAINER])
run(["docker", "cp", f"{CONTAINER}:{DUMP_IN_CONTAINER}", str(DUMP_LOCAL)])
run(["docker", "cp", f"{CONTAINER}:{SQL_IN_CONTAINER}", str(SQL_LOCAL)])

seed_sql = r"""
BEGIN;

DELETE FROM nutrition.shopping_list_items
WHERE EXISTS (
    SELECT 1
    FROM nutrition.shopping_lists sl
    WHERE sl.id = shopping_list_items.shopping_list_id
      AND sl.source_detail = 'C-251 test-user Einkaufsliste'
  )
  AND user_id <> (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');

DELETE FROM nutrition.shopping_lists
WHERE source_detail = 'C-251 test-user Einkaufsliste'
  AND user_id <> (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');

DELETE FROM nutrition.shopping_list_items
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')
  AND EXISTS (
    SELECT 1
    FROM nutrition.shopping_lists sl
    WHERE sl.id = shopping_list_items.shopping_list_id
      AND sl.source_detail = 'C-251 test-user Einkaufsliste'
  );

DELETE FROM nutrition.shopping_lists
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')
  AND source_detail = 'C-251 test-user Einkaufsliste';

INSERT INTO nutrition.shopping_lists (
  id, user_id, name, source_type, servings, status,
  measurement_source, source_detail
)
VALUES (
  'c2510000-0000-0000-0000-000000000001'::uuid,
  (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
  'Nachweis-Einkaufsliste',
  'manual',
  1,
  'open',
  'seed',
  'C-251 test-user Einkaufsliste'
);

CREATE TEMP TABLE c251_shopping_items (
  sort_order integer NOT NULL,
  bls_code text NOT NULL,
  amount_g numeric,
  quantity numeric,
  unit_display text NOT NULL,
  notes text
) ON COMMIT DROP;

INSERT INTO c251_shopping_items VALUES
  (10, 'C133000', 500, NULL, 'g', 'Oats fuer Fruehstueck'),
  (20, 'F503100', 750, NULL, 'g', 'Banane'),
  (30, 'E111100', NULL, 12, 'Stueck', 'Eier'),
  (40, 'V416100', 800, NULL, 'g', 'Haehnchen'),
  (50, 'C351000', 1000, NULL, 'g', 'Reis'),
  (60, 'Q120000', 250, NULL, 'ml', 'Olivenoel');

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(i.bls_code, ', ' ORDER BY i.bls_code)
    INTO v_missing
  FROM c251_shopping_items i
  LEFT JOIN nutrition.foods f ON f.bls_code = i.bls_code
  WHERE f.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'C-251 Einkaufslisten-Seed: BLS-Codes fehlen: %', v_missing;
  END IF;
END $$;

INSERT INTO nutrition.shopping_list_items (
  shopping_list_id, user_id, sort_order, item_source, food_id, food_name,
  amount_g, quantity, unit_display, notes
)
SELECT
  'c2510000-0000-0000-0000-000000000001'::uuid,
  (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
  i.sort_order,
  'bls',
  f.id,
  COALESCE(NULLIF(f.name_display_de, ''), f.name_de),
  i.amount_g,
  i.quantity,
  i.unit_display,
  i.notes
FROM c251_shopping_items i
JOIN nutrition.foods f ON f.bls_code = i.bls_code;

COMMIT;
"""

print(psql(seed_sql))
Path("backup/c250/live-backup-and-seed.log").write_text(
    f"dump={DUMP_LOCAL}\nsql={SQL_LOCAL}\n", encoding="utf-8", newline="\n"
)
