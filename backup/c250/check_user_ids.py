import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql

OUT = Path("backup/c250/user-id-check.log")
SQL = """
SELECT id || '|' || email
FROM auth.users
WHERE email IN ('test-user@lumeos.local', 'dev@lumeos.app', 'tom.seed@example.com')
ORDER BY email;

SELECT user_id || '|' || count(*)::text
FROM nutrition.shopping_lists
GROUP BY user_id
ORDER BY user_id::text;
"""

out = psql(SQL)
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(out)
