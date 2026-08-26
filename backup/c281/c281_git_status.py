from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import git

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\git-status.out")
OUT.write_text(git("status", "--short") + "\n", encoding="utf-8", newline="\n")
print(OUT)
