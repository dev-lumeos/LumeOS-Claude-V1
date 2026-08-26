from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\config-wissen-pruefen.out")
out = lauf([
    "powershell",
    "-NoProfile",
    "-Command",
    "Select-String -Path supabase/config.toml -Pattern 'wissen' -SimpleMatch",
])
OUT.write_text((out or "(kein Treffer)") + "\n", encoding="utf-8", newline="\n")
print(OUT)
