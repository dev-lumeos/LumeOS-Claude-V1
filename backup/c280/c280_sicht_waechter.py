from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\sicht-waechter-negativ.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"
DB = "lumeos_c280_neg"


def psql(sql: str, timeout=20):
    r = subprocess.run(
        [
            "docker",
            "exec",
            CONTAINER,
            "psql",
            "-U",
            "postgres",
            "-d",
            DB,
            "-t",
            "-A",
            "-F",
            "\t",
            "-c",
            sql,
        ],
        cwd=r"D:\GitHub\LumeOS-Claude-V1",
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=timeout,
    )
    return (r.stdout + r.stderr).decode("utf-8", "replace").strip()


forbidden = [
    "raw",
    "reported_mitigations",
    "components",
    "reported_reason_for_combination",
    "why_these_doses",
]

column_hits = psql(
    """
    SELECT column_name
      FROM information_schema.columns
     WHERE table_schema='supplements'
       AND table_name='community_anzeige'
       AND column_name = ANY(ARRAY['raw','reported_mitigations','components','reported_reason_for_combination','why_these_doses'])
     ORDER BY column_name;
    """
).splitlines()

viewdef = psql("SELECT pg_get_viewdef('supplements.community_anzeige'::regclass, true);")
viewdef_hits = [name for name in forbidden if name in viewdef]

status = 1 if column_hits or viewdef_hits else 0
text = [
    f"EXIT {status}",
    "FORBIDDEN_COLUMNS:",
    "\n".join(column_hits) if column_hits else "(none)",
    "FORBIDDEN_VIEWDEF:",
    "\n".join(viewdef_hits) if viewdef_hits else "(none)",
]
OUT.write_text("\n".join(text) + "\n", encoding="utf-8", newline="\n")
print(OUT)
raise SystemExit(status)
