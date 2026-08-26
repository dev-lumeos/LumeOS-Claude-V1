from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI, _wo

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\live-schema-vollstaendigkeit-retry.out")

try:
    r = subprocess.run(
        [_wo("pnpm"), "exec", "tsx", "supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts"],
        cwd=r"D:\GitHub\LumeOS-Claude-V1",
        capture_output=True,
        startupinfo=_SI,
        creationflags=_FLAGS,
        shell=False,
        timeout=360,
    )
    text = f"EXIT {r.returncode}\n" + (r.stdout + r.stderr).decode("utf-8", "replace")
except subprocess.TimeoutExpired as exc:
    text = f"TIMEOUT after 360s\n{exc}"

OUT.write_text(text + "\n", encoding="utf-8", newline="\n")
print(OUT)
