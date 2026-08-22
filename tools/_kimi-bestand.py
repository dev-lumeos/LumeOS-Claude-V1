# -*- coding: utf-8 -*-
"""C-194: Den Kimi-Bestand vollstaendig aufnehmen — wiederholbar.

Nur lesen. Erzeugt eine JSON-Aufnahme (fuer den Bericht) und eine
Kurzfassung auf stdout. Der Bestand waechst mit jedem Crawl; dieses
Skript ist die Aufnahme, nicht der Bericht.

Zaehlregeln:
- data/* (ausser metadata), reports/, schemas/, taxonomy/, docs/,
  tools/, tests/ und Wurzeldateien: EINE Zeile je Datei
  (Pfad, Datensaetze, Felder je Satz, Crawl-Marken).
- metadata/, archive/, qa1_tmp/, context_kimiclaw/ und *.tar.gz:
  Sammelzeilen (Caches/Archive, keine Entitaeten).
- Jede JSONL wird DOPPELT gezaehlt (Rohzeilen vs. geparste Saetze) —
  der Kreuzcheck ist die Grundlage der Rot-Probe:
  `--rotprobe` verfaelscht eine Zaehlung absichtlich, der Kreuzcheck
  muss ROT melden.

Aufruf:  python tools/_kimi-bestand.py [--rotprobe]
Ausgabe: backup/kimi-bestand-aufnahme.json (ausserhalb des
         Kimi-Ordners — dort wird nichts geschrieben)
"""
import io
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASIS = r"D:\GitHub\LumeOS-Claude-V1\backup\kimi-research\Kimi_Agent\supplement_performance_database"
ZIEL = r"D:\GitHub\LumeOS-Claude-V1\backup\kimi-bestand-aufnahme.json"
ROTPROBE = "--rotprobe" in sys.argv

SAMMEL_ORDNER = ("data\\metadata", "archive", "qa1_tmp", "context_kimiclaw")
EINZEL_BEREICHE = ("data", "reports", "schemas", "taxonomy", "docs", "tools", "tests")

CRAWL_RE = re.compile(r"crawl[_-]?(\d{3})", re.I)


def crawl_marken(text: str) -> list[str]:
    return sorted(set(CRAWL_RE.findall(text)))


def lese_json(pfad: str):
    with io.open(pfad, encoding="utf-8", errors="replace") as f:
        return json.load(f)


def saetze_und_felder(pfad: str):
    """(anzahl, felderliste, crawl_ids_im_inhalt, rohzeilen|None)"""
    name = os.path.basename(pfad).lower()
    if name.endswith(".jsonl"):
        roh = 0
        geparst = 0
        felder: list[str] = []
        crawls: set[str] = set()
        with io.open(pfad, encoding="utf-8", errors="replace") as f:
            for zeile in f:
                if not zeile.strip():
                    continue
                roh += 1
                try:
                    satz = json.loads(zeile)
                    geparst += 1
                    if not felder and isinstance(satz, dict):
                        felder = sorted(satz.keys())
                    if isinstance(satz, dict):
                        crawls.update(crawl_marken(str(satz.get("crawl_id", ""))
                                                   + str(satz.get("source_crawl", ""))))
                except json.JSONDecodeError:
                    pass
        return geparst, felder, sorted(crawls), roh
    if name.endswith(".json"):
        try:
            inhalt = lese_json(pfad)
        except Exception:
            return None, [], [], None
        crawls = set(crawl_marken(json.dumps(inhalt.get("crawl_id", ""))
                                  if isinstance(inhalt, dict) else ""))
        if isinstance(inhalt, dict):
            for schluessel in ("records", "items", "entries", "constants", "symptome",
                               "symptoms", "markers", "rules", "patterns"):
                if isinstance(inhalt.get(schluessel), list) and inhalt[schluessel]:
                    erster = inhalt[schluessel][0]
                    return (len(inhalt[schluessel]),
                            sorted(erster.keys()) if isinstance(erster, dict) else [],
                            sorted(crawls), None)
            return 1, sorted(inhalt.keys()), sorted(crawls), None
        if isinstance(inhalt, list):
            erster = inhalt[0] if inhalt else None
            return (len(inhalt),
                    sorted(erster.keys()) if isinstance(erster, dict) else [],
                    sorted(crawls), None)
    return None, [], [], None


def fuellgrad(pfad: str, max_tiefe: int = 2):
    """Je Feld (auch eine Ebene verschachtelt): Anteil nicht-leer."""
    saetze: list[dict] = []
    name = os.path.basename(pfad).lower()
    if name.endswith(".jsonl"):
        with io.open(pfad, encoding="utf-8", errors="replace") as f:
            for zeile in f:
                if zeile.strip():
                    try:
                        s = json.loads(zeile)
                        if isinstance(s, dict):
                            saetze.append(s)
                    except json.JSONDecodeError:
                        pass
    else:
        inhalt = lese_json(pfad)
        if isinstance(inhalt, dict):
            for schluessel in ("records", "items", "entries"):
                if isinstance(inhalt.get(schluessel), list):
                    saetze = [s for s in inhalt[schluessel] if isinstance(s, dict)]
                    break
        elif isinstance(inhalt, list):
            saetze = [s for s in inhalt if isinstance(s, dict)]
    if not saetze:
        return {}, 0

    def leer(w) -> bool:
        return w is None or w == "" or w == [] or w == {} or w == "unknown" or w == "n/a"

    zaehler: Counter = Counter()
    for s in saetze:
        def gehe(praefix: str, wert, tiefe: int):
            if isinstance(wert, dict) and tiefe < max_tiefe:
                for k, v in wert.items():
                    gehe(f"{praefix}.{k}" if praefix else k, v, tiefe + 1)
            else:
                if not leer(wert):
                    zaehler[praefix] += 1
        gehe("", s, 0)
    n = len(saetze)
    return {feld: round(100 * anz / n, 1) for feld, anz in zaehler.items()}, n


def main() -> None:
    inventar = []
    sammel = defaultdict(lambda: {"dateien": 0, "bytes": 0})
    kreuzfehler = []
    gesamt_dateien = 0
    gesamt_bytes = 0

    for wurzel, ordner, dateien in os.walk(BASIS):
        rel_wurzel = os.path.relpath(wurzel, BASIS)
        for datei in dateien:
            pfad = os.path.join(wurzel, datei)
            rel = os.path.relpath(pfad, BASIS)
            groesse = os.path.getsize(pfad)
            gesamt_dateien += 1
            gesamt_bytes += groesse

            sammelziel = next((s for s in SAMMEL_ORDNER if rel.startswith(s)), None)
            if sammelziel is None and datei.lower().endswith((".tar.gz", ".tgz")):
                sammelziel = "(Wurzel) tar.gz-Archive"
            if sammelziel:
                sammel[sammelziel]["dateien"] += 1
                sammel[sammelziel]["bytes"] += groesse
                continue

            oberster = rel.split(os.sep)[0]
            if oberster not in EINZEL_BEREICHE and os.sep in rel:
                sammel[oberster]["dateien"] += 1
                sammel[oberster]["bytes"] += groesse
                continue

            anzahl, felder, crawls_inhalt, roh = (None, [], [], None)
            if datei.lower().endswith((".json", ".jsonl")):
                anzahl, felder, crawls_inhalt, roh = saetze_und_felder(pfad)
                if roh is not None:
                    geparst = anzahl
                    if ROTPROBE and rel.endswith("supplements.jsonl"):
                        geparst = (geparst or 0) + 1  # absichtlich falsch
                    if roh != geparst:
                        kreuzfehler.append(
                            f"{rel}: {roh} Rohzeilen, aber {geparst} geparste Saetze")
            inventar.append({
                "pfad": rel.replace(os.sep, "/"),
                "bytes": groesse,
                "saetze": anzahl,
                "felder_anzahl": len(felder) if felder else None,
                "felder": felder[:60],
                "crawl_dateiname": crawl_marken(rel),
                "crawl_inhalt": crawls_inhalt,
            })

    # Fuellgrade der Kern-Entitaeten
    KERN = [
        "data/substances/supplements.jsonl",
        "data/substances/performance_compounds.jsonl",
        "data/substances/peptides.jsonl",
        "data/medications/medication_active_substances.jsonl",
        "data/medications/medication_formulations.jsonl",
        "data/medications/medication_products.jsonl",
        "data/medications/medication_regulatory.jsonl",
        "data/products/products.jsonl",
        "data/companies/brands.jsonl",
        "data/companies/manufacturers.jsonl",
        "data/evidence/population_response_atlas.jsonl",
        "data/evidence/population_response_synthesis.jsonl",
        "data/evidence/population_applicability_atlas.jsonl",
        "data/evidence/response_confounder_graph.jsonl",
        "data/evidence/response_modifier_graph.jsonl",
        # community_* liegt unter data/admin/, nicht evidence — und
        # eine sources.jsonl gibt es NICHT (Befund C-194).
        "data/admin/community_intelligence_patterns.jsonl",
        "data/admin/community_exposure_patterns.jsonl",
    ]
    fuellgrade = {}
    for rel in KERN:
        pfad = os.path.join(BASIS, rel.replace("/", os.sep))
        if os.path.exists(pfad):
            grade, n = fuellgrad(pfad)
            fuellgrade[rel] = {"saetze": n, "felder": grade}
        else:
            fuellgrade[rel] = {"saetze": None, "felder": {},
                               "hinweis": "Datei fehlt — Pfadannahme falsch"}

    aufnahme = {
        "basis": BASIS,
        "gesamt_dateien": gesamt_dateien,
        "gesamt_mb": round(gesamt_bytes / 1024 / 1024, 1),
        "sammel": {k: {"dateien": v["dateien"],
                       "mb": round(v["bytes"] / 1024 / 1024, 1)}
                   for k, v in sorted(sammel.items())},
        "inventar": sorted(inventar, key=lambda e: e["pfad"]),
        "fuellgrade": fuellgrade,
        "kreuzfehler": kreuzfehler,
        "rotprobe": ROTPROBE,
    }
    io.open(ZIEL, "w", encoding="utf-8", newline="\n").write(
        json.dumps(aufnahme, ensure_ascii=False, indent=1))

    print(f"Dateien gesamt: {gesamt_dateien} · {aufnahme['gesamt_mb']} MB")
    print(f"Einzeln inventarisiert: {len(inventar)} Dateien")
    for k, v in aufnahme["sammel"].items():
        print(f"  Sammel {k}: {v['dateien']} Dateien, {v['mb']} MB")
    print(f"Fuellgrade gerechnet fuer {sum(1 for f in fuellgrade.values() if f['saetze'])} Kerndateien")
    if kreuzfehler:
        print("KREUZCHECK ROT:")
        for f in kreuzfehler:
            print("  " + f)
        sys.exit(1)
    print("Kreuzcheck gruen (Rohzeilen == geparste Saetze in allen JSONL).")
    print(f"Aufnahme: {ZIEL}")


if __name__ == "__main__":
    main()
