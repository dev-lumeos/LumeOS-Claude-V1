from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

BASE = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281")
BASE.mkdir(parents=True, exist_ok=True)
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
schema = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\schema") / f"{stamp}_c281_vor_schema.sql"
schema.parent.mkdir(parents=True, exist_ok=True)

backup = lauf([
    "docker", "exec", "supabase_db_LumeOS-Claude-V1",
    "pg_dump", "-U", "postgres", "-d", "postgres",
    "--schema-only", "-f", f"/tmp/{schema.name}",
])
copy = lauf([
    "docker", "cp",
    f"supabase_db_LumeOS-Claude-V1:/tmp/{schema.name}",
    str(schema),
])
chain = lauf([
    "pnpm", "exec", "tsx", "supabase/_pipeline/kette-ausfuehren.ts",
    "--database", "lumeos_c281_probe", "--keep-database",
])
(BASE / "kettenlauf-probe.out").write_text(
    "SCHEMA_BACKUP\n" + backup + "\n" + copy + "\n\nKETTE\n" + chain + "\n",
    encoding="utf-8",
    newline="\n",
)
print(BASE / "kettenlauf-probe.out")
