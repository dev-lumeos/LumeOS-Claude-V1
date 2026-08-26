from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

REPO = Path(r"D:\GitHub\LumeOS-Claude-V1")
BASE = REPO / "backup" / "c281"
BASE.mkdir(parents=True, exist_ok=True)
BACKUP_DIR = REPO / "backup" / "vollsicherung"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
CONTAINER = "supabase_db_LumeOS-Claude-V1"
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
dump_name = f"{stamp}_c281_vor_live.dump"
sql_name = f"{stamp}_c281_vor_live.sql"

parts = []
for name, args in [
    ("BACKUP_DUMP", ["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres", "-Fc", "-f", f"/tmp/{dump_name}"]),
    ("BACKUP_SQL", ["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres", "-f", f"/tmp/{sql_name}"]),
    ("COPY_DUMP", ["docker", "cp", f"{CONTAINER}:/tmp/{dump_name}", str(BACKUP_DIR / dump_name)]),
    ("COPY_SQL", ["docker", "cp", f"{CONTAINER}:/tmp/{sql_name}", str(BACKUP_DIR / sql_name)]),
]:
    parts.append(name + "\n" + lauf(args))

for step in [
    "281_supplement_wissen_hochreichen.sql",
    "282_wada_status_kategorie_konflikte.sql",
]:
    host = REPO / "supabase" / "_pipeline" / "13_supplements" / step
    parts.append(f"COPY {step}\n" + lauf(["docker", "cp", str(host), f"{CONTAINER}:/tmp/{step}"]))
    parts.append(f"APPLY {step}\n" + lauf([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
        "-v", "ON_ERROR_STOP=1", "-f", f"/tmp/{step}",
    ]))

(BASE / "live-einspielen.out").write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(BASE / "live-einspielen.out")
