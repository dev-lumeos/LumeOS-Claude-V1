from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\drop-probe.out")
out = lauf([
    "docker", "exec", "supabase_db_LumeOS-Claude-V1",
    "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1",
    "-c", "DROP DATABASE IF EXISTS lumeos_c281_probe WITH (FORCE);",
])
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(OUT)
