from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\drop-probe-dbs.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"
parts = []
for db in ["lumeos_c280_probe", "lumeos_c280_probe2", "lumeos_c280_neg"]:
    out = lauf([
        "docker",
        "exec",
        CONTAINER,
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        f"DROP DATABASE IF EXISTS {db} WITH (FORCE);",
    ])
    parts.append(db + "\n" + out)

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
