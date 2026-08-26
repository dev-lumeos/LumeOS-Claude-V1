from pathlib import Path
import subprocess
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import _FLAGS, _SI, _wo, lauf

BASE = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281")


def run_capture(name: str, args: list[str], timeout: int):
    out_path = BASE / name
    try:
        r = subprocess.run(
            args,
            cwd=r"D:\GitHub\LumeOS-Claude-V1",
            capture_output=True,
            startupinfo=_SI,
            creationflags=_FLAGS,
            shell=False,
            timeout=timeout,
        )
        text = f"EXIT {r.returncode}\n" + (r.stdout + r.stderr).decode("utf-8", "replace")
    except subprocess.TimeoutExpired as exc:
        text = f"TIMEOUT after {timeout}s\n{exc}"
    out_path.write_text(text + "\n", encoding="utf-8", newline="\n")


run_capture(
    "live-schema-vollstaendigkeit.out",
    [_wo("pnpm"), "exec", "tsx", "supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts"],
    180,
)
run_capture(
    "live-testdaten-pruefen.out",
    [_wo("pnpm"), "exec", "tsx", "supabase/_pipeline/_validierung/testdaten-pruefen.ts"],
    180,
)
(BASE / "live-schemafreigabe.out").write_text(
    lauf(["node", "tools/schemafreigabe-pruefen.mjs"]) + "\n",
    encoding="utf-8",
    newline="\n",
)
print(BASE)
