from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\negativprobe.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"
DB = "lumeos_c281_probe"


def run(args):
    return lauf(args)


def psql(sql: str) -> str:
    return run([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", DB,
        "-v", "ON_ERROR_STOP=1", "-c", sql,
    ])


mutation = psql("""
UPDATE supplements.supplement_wada w
SET wada_status='prohibited', updated_at=now()
FROM supplements.supplements c
JOIN supplements.supplements p ON p.id=c.parent_id
WHERE w.supplement_id=c.id
  AND p.name_en='Calcium'
  AND c.name_en <> 'Calcium'
  AND w.source <> 'c281:inherited_from_children'
  AND w.id = (
    SELECT w2.id
    FROM supplements.supplement_wada w2
    JOIN supplements.supplements c2 ON c2.id=w2.supplement_id
    JOIN supplements.supplements p2 ON p2.id=c2.parent_id
    WHERE p2.name_en='Calcium'
      AND w2.source <> 'c281:inherited_from_children'
    ORDER BY c2.name_en
    LIMIT 1
  );
""")

copy = run([
    "docker", "cp",
    r"D:\GitHub\LumeOS-Claude-V1\supabase\_pipeline\13_supplements\281_supplement_wissen_hochreichen.sql",
    f"{CONTAINER}:/tmp/281_supplement_wissen_hochreichen.sql",
])
rerun = run([
    "docker", "exec", CONTAINER,
    "psql", "-U", "postgres", "-d", DB,
    "-v", "ON_ERROR_STOP=1",
    "-f", "/tmp/281_supplement_wissen_hochreichen.sql",
])

OUT.write_text(
    "MUTATION\n" + mutation + "\n\nCOPY\n" + copy + "\n\nRERUN\n" + rerun + "\n",
    encoding="utf-8",
    newline="\n",
)
print(OUT)
