import json
from pathlib import Path

root = Path(r"D:\GitHub\LumeOS-Claude-V1\docs\kimi-ingestion\konsolidierung")
files = [
    "ABGLEICH_GEFILTERT.jsonl",
    "NACHZUTRAGEN.md",
    "SACHKONFLIKTE.md",
    "FILTER_PROTOKOLL.md",
    "C261_FILTER_SUMMARY.json",
    "C261_FILTER_INSPECTION.json",
]
result = {name: (root / name).stat().st_size for name in files}
result["bericht"] = Path(r"D:\GitHub\LumeOS-Claude-V1\docs\berichte\c-261-codex.md").stat().st_size
print(json.dumps(result, ensure_ascii=False, indent=2))
