import json
from collections import Counter
from pathlib import Path

path = Path(r"D:\GitHub\LumeOS-Claude-V1\docs\kimi-ingestion\konsolidierung\ABGLEICH_GEFILTERT.jsonl")
fields = Counter()
entities = Counter()
sources = Counter()
fields_by_state = {"FEHLT": Counter(), "ABWEICHEND": Counter(), "UEBERNOMMEN": Counter()}
with path.open(encoding="utf-8") as f:
    for line in f:
        r = json.loads(line)
        fields[r["feld"]] += 1
        entities[r["entitaet"]] += 1
        sources[r["quelldatei"]] += 1
        fields_by_state[r["zustand"]][r["feld"]] += 1
out = {
    "top_fields": fields.most_common(50),
    "top_entities": entities.most_common(50),
    "top_sources": sources.most_common(50),
    "top_fields_by_state": {k: v.most_common(50) for k, v in fields_by_state.items()},
}
Path(r"D:\GitHub\LumeOS-Claude-V1\docs\kimi-ingestion\konsolidierung\C261_FILTER_INSPECTION.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print(json.dumps({k: out[k][:10] if isinstance(out[k], list) else {s: out[k][s][:10] for s in out[k]} for k in out}, ensure_ascii=False, indent=2))
