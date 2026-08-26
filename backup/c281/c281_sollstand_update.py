import json
from pathlib import Path

path = Path(r"D:\GitHub\LumeOS-Claude-V1\supabase\_pipeline\daten\schema-sollstand.json")
data = json.loads(path.read_text(encoding="utf-8"))

data["mindestzeilen"]["supplements.supplement_lab_effects"] = 271
data["mindestzeilen"]["supplements.supplement_wada"] = 337
data["mindestzeilen"]["supplements.wada_conflict_records"] = 8

notes = data.setdefault("mindestzeilen_belege", {})
notes["supplements.supplement_lab_effects"] = (
    "C-281: 225 bestehende Laboreffekt-Zeilen plus 46 einheitliche Kind-Effekte "
    "auf Sammelnamen hochgereicht; Magnesium:Serum Mg bleibt wegen Abweichung unten."
)
notes["supplements.supplement_wada"] = (
    "C-281: 320 bestehende WADA-Zeilen plus 17 einheitliche Kind-Status auf "
    "Sammelnamen hochgereicht; Caffeine bleibt wegen monitored/not_prohibited unten."
)
notes["supplements.wada_conflict_records"] = (
    "C-272: 6 WADA-Korrekturkonflikte; C-282: 2 Selbstwidersprueche "
    "wada_status vs wada_category fuer Phenibut und Tianeptine."
)

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
print(path)
