from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\kettenlauf-neg.out")
out = lauf([
    "pnpm",
    "exec",
    "tsx",
    "supabase/_pipeline/kette-ausfuehren.ts",
    "--database",
    "lumeos_c280_neg",
    "--keep-database",
])
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(OUT)
