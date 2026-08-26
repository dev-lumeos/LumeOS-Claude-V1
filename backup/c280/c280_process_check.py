from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\process-check.out")

out = lauf([
    "powershell",
    "-NoProfile",
    "-Command",
    "Get-Process | Where-Object { $_.ProcessName -match 'node|pnpm|tsx|python' } | Select-Object Id,ProcessName,StartTime | Format-Table -AutoSize",
])
OUT.write_text(out + "\n", encoding="utf-8", newline="\n")
print(OUT)
