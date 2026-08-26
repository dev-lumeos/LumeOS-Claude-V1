import json
from pathlib import Path

path = Path(r"D:\GitHub\LumeOS-Claude-V1\supabase\_pipeline\kette.json")
data = json.loads(path.read_text(encoding="utf-8"))
steps = data["steps"] if isinstance(data, dict) and "steps" in data else data

steps[:] = [s for s in steps if s.get("id") not in {"281", "282"}]
idx = next(i for i, s in enumerate(steps) if s.get("id") == "280") + 1
steps[idx:idx] = [
    {
        "id": "281",
        "path": "supabase/_pipeline/13_supplements/281_supplement_wissen_hochreichen.sql",
        "kind": "sql",
        "creates": "C-281: Einheitliche Kind-Angaben fuer Dosis, Laborwirkung und WADA mit Herkunft zum Sammelnamen hochreichen",
        "depends_on": ["280"],
    },
    {
        "id": "282",
        "path": "supabase/_pipeline/13_supplements/282_wada_status_kategorie_konflikte.sql",
        "kind": "sql",
        "creates": "C-282: WADA status/category-Selbstwidersprueche als Konflikt-Records festhalten",
        "depends_on": ["281"],
    },
]

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
print(path)
