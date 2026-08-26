from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

REPO = Path(r"D:\GitHub\LumeOS-Claude-V1")
OUT = REPO / "backup" / "c280" / "live-einspielen.out"
BACKUP_DIR = REPO / "backup" / "vollsicherung"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
dump_name = f"{stamp}_c280_vor_live.dump"
sql_name = f"{stamp}_c280_vor_live.sql"
container = "supabase_db_LumeOS-Claude-V1"

parts: list[str] = []

parts.append("BACKUP_DUMP\n" + lauf([
    "docker",
    "exec",
    container,
    "pg_dump",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-Fc",
    "-f",
    f"/tmp/{dump_name}",
]))
parts.append("BACKUP_SQL\n" + lauf([
    "docker",
    "exec",
    container,
    "pg_dump",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-f",
    f"/tmp/{sql_name}",
]))
parts.append("COPY_DUMP\n" + lauf([
    "docker",
    "cp",
    f"{container}:/tmp/{dump_name}",
    str(BACKUP_DIR / dump_name),
]))
parts.append("COPY_SQL\n" + lauf([
    "docker",
    "cp",
    f"{container}:/tmp/{sql_name}",
    str(BACKUP_DIR / sql_name),
]))
parts.append("COPY_STEP\n" + lauf([
    "docker",
    "cp",
    str(REPO / "supabase" / "_pipeline" / "16_wissen" / "280_community_anzeige.sql"),
    f"{container}:/tmp/280_community_anzeige.sql",
]))
parts.append("APPLY_STEP\n" + lauf([
    "docker",
    "exec",
    container,
    "psql",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "/tmp/280_community_anzeige.sql",
]))

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
