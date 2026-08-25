import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf


container = "supabase_db_LumeOS-Claude-V1"
local_sql = Path("backup/c248/apply_live_c248.sql")
tmp = "/tmp/apply_live_c248.sql"

print(lauf(["docker", "cp", str(local_sql), f"{container}:{tmp}"]))
result = lauf(["docker", "exec", container, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-f", tmp])
print(result)
cleanup = lauf(["docker", "exec", container, "rm", "-f", tmp])
if cleanup:
    print(cleanup)
