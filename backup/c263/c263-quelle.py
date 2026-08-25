"""C-263: aus den Kimi-Dateien je Substanz einen kompakten Steckbrief
ziehen — die Grundlage, gegen die geschrieben wird.

`[read]` Nicht die Datenbank: Codex importiert dort parallel (C-262).
"""
import io
import json
import os
import sys

BASIS = (r"D:\GitHub\LumeOS-Claude-V1\backup\kimi-research\Kimi_Agent"
         r"\supplement_performance_database\data\substances")
DATEIEN = [("supplements.jsonl", "supplement"),
           ("peptides.jsonl", "peptide"),
           ("performance_compounds.jsonl", "enhanced")]


def liste(v):
    if not v:
        return []
    if isinstance(v, str):
        return [v]
    if isinstance(v, list):
        return [str(x) for x in v if x]
    return []


def steckbrief(x, gruppe):
    d = x.get("dosing") or {}
    s = x.get("safety") or {}
    p = x.get("pharmacology") or {}
    e = x.get("evidence") or {}
    schw = (s.get("pregnancy") or {}) if isinstance(s.get("pregnancy"), dict) else {}
    return {
        "id": x.get("id"),
        "name": x.get("canonical_name"),
        "gruppe": gruppe,
        "typ": x.get("compound_type"),
        "kategorie": x.get("category"),
        "form": x.get("chemical_form"),
        "aliase": liste(x.get("aliases"))[:4],
        "beschreibung": x.get("description") or "",
        "mechanismus": liste(x.get("mechanism_of_action")),
        "belegt": liste(x.get("evidence_supported_effects"))[:6],
        "behauptet": liste(x.get("claimed_effects"))[:6],
        "zugelassen": liste(x.get("approved_indications"))[:4],
        "grad": e.get("overall_grade"),
        "evidenz": e.get("summary") or "",
        "dosis_studien": liste(d.get("studied_dose_ranges"))[:3],
        "dosis_leitlinie": d.get("guideline_dose"),
        "dosis_obergrenze": d.get("tolerable_upper_intake_level"),
        "nebenwirkungen": liste(s.get("common_side_effects"))[:4],
        "ernst": liste(s.get("serious_side_effects"))[:3],
        "gegenanzeigen": liste(s.get("contraindications"))[:4],
        "schwangerschaft": schw.get("status"),
        "bioverfuegbar": p.get("bioavailability"),
        "halbwertszeit": p.get("half_life"),
        "metabolismus": p.get("metabolism"),
        "route": liste(p.get("route_of_administration"))[:3],
        "labor": liste(x.get("lab_effects"))[:3],
    }


alle = []
for datei, gruppe in DATEIEN:
    p = os.path.join(BASIS, datei)
    for zeile in io.open(p, encoding="utf-8"):
        if zeile.strip():
            alle.append(steckbrief(json.loads(zeile), gruppe))

ziel = sys.argv[1] if len(sys.argv) > 1 else "c263-steckbriefe.json"
io.open(ziel, "w", encoding="utf-8", newline="\n").write(
    json.dumps(alle, ensure_ascii=False, indent=1))

print(f"{len(alle)} Steckbriefe -> {ziel}")
for g in ("supplement", "peptide", "enhanced"):
    n = sum(1 for a in alle if a["gruppe"] == g)
    mit = sum(1 for a in alle if a["gruppe"] == g and a["mechanismus"])
    print(f"  {g:12} {n:3}   mit mechanism_of_action: {mit}")
