from pathlib import Path
import shutil

old = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\kimi-research\Kimi_Agent\lumeos_ingestion_analysis")
allowed_parent = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\kimi-research\Kimi_Agent")
if old.exists():
    resolved = old.resolve()
    if resolved.parent != allowed_parent.resolve() or resolved.name != "lumeos_ingestion_analysis":
        raise RuntimeError(f"Refusing to remove unexpected path: {resolved}")
    shutil.rmtree(resolved)
    print(f"removed {resolved}")
else:
    print(f"not present {old}")
