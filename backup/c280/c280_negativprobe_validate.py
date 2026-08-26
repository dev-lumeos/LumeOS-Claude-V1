from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI, _wo

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\negativprobe-schema.out")
env = dict(**__import__("os").environ)
env["PGDATABASE"] = "lumeos_c280_neg"
env["LUMEOS_DB_CONTAINER"] = "supabase_db_LumeOS-Claude-V1"

try:
    r = subprocess.run(
        [_wo("pnpm"), "exec", "tsx", "supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts"],
        cwd=r"D:\GitHub\LumeOS-Claude-V1",
        env=env,
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=60,
    )
    text = f"EXIT {r.returncode}\n" + (r.stdout + r.stderr).decode("utf-8", "replace")
except subprocess.TimeoutExpired as exc:
    text = f"TIMEOUT\n{exc}"

OUT.write_text(text + "\n", encoding="utf-8", newline="\n")
print(OUT)
