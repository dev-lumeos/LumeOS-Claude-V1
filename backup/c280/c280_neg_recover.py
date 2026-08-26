from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\neg-recover.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def run(sql: str, timeout=20):
    r = subprocess.run(
        ["docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-c", sql],
        cwd=r"D:\GitHub\LumeOS-Claude-V1",
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=timeout,
    )
    return (r.stdout + r.stderr).decode("utf-8", "replace")


parts = []
for sql in [
    "select pid, state, wait_event_type, wait_event, left(query, 200) from pg_stat_activity where datname='lumeos_c280_neg';",
    "select pg_terminate_backend(pid) from pg_stat_activity where datname='lumeos_c280_neg' and pid <> pg_backend_pid();",
]:
    try:
        out = run(sql)
    except subprocess.TimeoutExpired as exc:
        out = f"TIMEOUT: {exc}"
    parts.append(sql + "\n" + out)

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
