from datetime import datetime
from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

REPO = Path(r"D:\GitHub\LumeOS-Claude-V1")
BASE = REPO / "backup" / "c283"
BACKUP_DIR = REPO / "backup" / "vollsicherung"
CONTAINER = "supabase_db_LumeOS-Claude-V1"
RESTORE_DB = "lumeos_c283_restore"

BASE.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
dump_name = f"{stamp}_c283_vor_live.dump"
sql_name = f"{stamp}_c283_vor_live.sql"
dump_container_path = f"/tmp/{dump_name}"
sql_container_path = f"/tmp/{sql_name}"
dump_host_path = BACKUP_DIR / dump_name
sql_host_path = BACKUP_DIR / sql_name
output: list[str] = []


def run(label: str, args: list[str]) -> str:
    result = lauf(args)
    output.append(f"{label}\n{result}")
    return result


counts_sql = """
SELECT 'auth_users=' || count(*) FROM auth.users;
SELECT 'medication_active_substances=' || count(*)
FROM medical.medication_active_substances;
SELECT 'user_medications=' || count(*)
FROM medical.user_medications;
SELECT 'medical_policies=' || count(*)
FROM pg_policies
WHERE schemaname = 'medical';
"""
live_counts = run("LIVE_VORHER_PRUEFUNG", [
    "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
    "-At", "-v", "ON_ERROR_STOP=1", "-c", counts_sql,
])

run("BACKUP_DUMP", [
    "docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres",
    "-Fc", "-f", dump_container_path,
])
run("BACKUP_SQL", [
    "docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", "postgres",
    "-f", sql_container_path,
])
run("COPY_DUMP", ["docker", "cp", f"{CONTAINER}:{dump_container_path}", str(dump_host_path)])
run("COPY_SQL", ["docker", "cp", f"{CONTAINER}:{sql_container_path}", str(sql_host_path)])

run("RESTORE_DROP", [
    "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c", f"DROP DATABASE IF EXISTS {RESTORE_DB} WITH (FORCE);",
])
run("RESTORE_CREATE", ["docker", "exec", CONTAINER, "createdb", "-U", "postgres", RESTORE_DB])
run("RESTORE", [
    "docker", "exec", CONTAINER, "pg_restore", "-U", "postgres", "-d", RESTORE_DB,
    "--role=supabase_admin", "--no-owner", "--no-privileges", dump_container_path,
])

restore_counts = run("RESTORE_PRUEFUNG", [
    "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", RESTORE_DB,
    "-At", "-v", "ON_ERROR_STOP=1", "-c", counts_sql,
])
if restore_counts != live_counts:
    raise RuntimeError("Volldump-Restore weicht bei auth, Medical-Zeilen oder Medical-Policies ab")

pipeline_step = REPO / "supabase" / "_pipeline" / "14_medical" / "283_medication_catalog_mapping.sql"
run("COPY_283", ["docker", "cp", str(pipeline_step), f"{CONTAINER}:/tmp/283_medication_catalog_mapping.sql"])
run("APPLY_283", [
    "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-f", "/tmp/283_medication_catalog_mapping.sql",
])
run("LIVE_PRUEFUNG", [
    "pnpm", "exec", "tsx", "supabase/_pipeline/_validierung/c283_medication_catalog_pruefen.ts",
    "--database", "postgres",
])

run("RESTORE_CLEANUP", [
    "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c", f"DROP DATABASE IF EXISTS {RESTORE_DB} WITH (FORCE);",
])

(BASE / "live-einspielen.out").write_text("\n\n---\n\n".join(output) + "\n", encoding="utf-8", newline="\n")
print(BASE / "live-einspielen.out")
