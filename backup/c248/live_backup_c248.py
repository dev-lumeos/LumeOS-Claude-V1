import datetime
import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf


stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
outdir = Path("backup/vollsicherung")
outdir.mkdir(parents=True, exist_ok=True)
base = f"{stamp}_c248_vor_live_lumeos_voll"
container = "supabase_db_LumeOS-Claude-V1"

for ext, fmt in (("dump", "-Fc"), ("sql", "-Fp")):
    tmp = f"/tmp/{base}.{ext}"
    local = outdir / f"{base}.{ext}"
    result = lauf(["docker", "exec", container, "pg_dump", "-U", "postgres", "-d", "postgres", fmt, "-f", tmp])
    if result:
        print(result)
    result = lauf(["docker", "cp", f"{container}:{tmp}", str(local)])
    if result:
        print(result)
    result = lauf(["docker", "exec", container, "rm", "-f", tmp])
    if result:
        print(result)
    print(local)
