# C-217: Was ist gebaut, was ist Attrappe — je Modul unter
# apps/web/src/app/v2/, plus die Datenbankseite. Nur lesen.
#
# Gezaehlt wird je Datei:
#   - Attrappen-Marken: das `attrappe`-Prop der Card (drei Formen:
#     nackt, `attrappe={...}`, `attrappe: ...` in Datenobjekten),
#     mit Zeile und Grundtext
#   - DB-Zugriffe: .from('...'), .rpc('...'), .schema('...'),
#     fetch('/api/...'), Importe aus src/lib/
#   - Kacheln: <Card ...> mit title, Zeile
#   - Tabs: label:-Eintraege
#   - Pauschalbanner: "gibt es noch nicht"-Saetze
# Datenbank: Schemata, Tabellen, Zeilenzahlen — selbst gezaehlt.
#
# Rot-Probe (--rotprobe): die Markensumme eines Moduls wird um +1
# verfaelscht; der Kreuzcheck (Detailliste gegen unabhaengigen
# Gesamt-Scan) muss das melden und mit Exit 1 enden.
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import psql  # noqa: E402

REPO = Path(r"D:\GitHub\LumeOS-Claude-V1")
V2 = REPO / "apps" / "web" / "src" / "app" / "v2"

MODULE = [
    "recovery", "training", "medical", "nutrition", "supplements",
    "goals", "coach", "coach/ai", "dashboard", "settings",
]

# `attrappe` als Prop oder Datenfeld — nicht der Typkommentar, nicht
# das Wort im Fliesstext. Der Wert darf mehrzeilig sein
# (checkin-streifen.tsx:38), deshalb reicht `={` bis Zeilenende.
RE_MARKE = re.compile(
    r"(?:^|[\s<])attrappe(?:=\{(?P<wert>[^}\n]*)\}?"
    r'|="(?P<str>[^"]*)"'
    r"|:\s*(?P<feld>[^,\n]+)"
    r"|(?P<nackt>)(?=[\s/>]))"
)
# Attrappen-Flaechen und direkt gerenderte Marken ohne Card-Prop.
RE_FLAECHE = re.compile(r"v2-attrappe-flaeche|>Attrappe</Pill>|v2-attrappe[\"' ]")
RE_FROM = re.compile(r"\.from\(\s*['\"]([\w.]+)")
RE_RPC = re.compile(r"\.rpc\(\s*['\"](\w+)")
RE_SCHEMA = re.compile(r"\.schema\(\s*['\"](\w+)")
RE_FETCH = re.compile(r"fetch\(\s*['\"`](/api/[^'\"`?]+)")
RE_LIBIMP = re.compile(r"from\s+'[./]*lib/([\w/-]+)'")
RE_CARD = re.compile(r"<Card[\s/>]")
RE_TITLE = re.compile(r"title=(?:\"([^\"]+)\"|\{`([^`]+)`\}|\{'([^']+)'\}|\{\"([^\"]+)\"\})")
RE_LABEL = re.compile(r"label:\s*['\"]([^'\"]+)['\"]")
RE_BANNER = re.compile(r"gibt es noch nicht|existiert noch nicht|gibt es nicht")


def ist_kommentar(zeile):
    s = zeile.lstrip()
    return s.startswith("//") or s.startswith("*") or s.startswith("/*")


def datei_aufnehmen(pfad):
    text = pfad.read_text(encoding="utf-8")
    zeilen = text.splitlines()
    marken, flaechen, kacheln, banner = [], [], [], []
    for nr, z in enumerate(zeilen, 1):
        if ist_kommentar(z):
            continue
        for m in RE_MARKE.finditer(z):
            grund = (m.group("wert") or m.group("str") or m.group("feld") or "").strip()
            marken.append({"zeile": nr, "grund": grund[:100]})
        for _ in RE_FLAECHE.finditer(z):
            flaechen.append({"zeile": nr})
        if RE_CARD.search(z):
            titel = None
            for folge in zeilen[nr - 1:nr + 6]:
                t = RE_TITLE.search(folge)
                if t:
                    titel = next(g for g in t.groups() if g)
                    break
            kacheln.append({"zeile": nr, "titel": titel})
        for m in RE_BANNER.finditer(z):
            banner.append({"zeile": nr, "text": z.strip()[:120]})
    return {
        "marken": marken,
        "flaechen": flaechen,
        "kacheln": kacheln,
        "banner": banner,
        "from": sorted(set(RE_FROM.findall(text))),
        "rpc": sorted(set(RE_RPC.findall(text))),
        "schema": sorted(set(RE_SCHEMA.findall(text))),
        "fetch_api": sorted(set(RE_FETCH.findall(text))),
        "lib_importe": sorted(set(RE_LIBIMP.findall(text))),
        "tab_labels": RE_LABEL.findall(text),
    }


def modul_aufnehmen(name):
    ordner = V2 / Path(name)
    dateien = {}
    for p in sorted(ordner.glob("*.ts")) + sorted(ordner.glob("*.tsx")):
        if "__tests__" in str(p):
            continue
        dateien[p.name] = datei_aufnehmen(p)
    # Unterordner mit eigenen Seiten: nutrition/suche, coach/human
    unter = {"nutrition": ["suche"], "coach": ["human"]}.get(name, [])
    for u in unter:
        for p in sorted((ordner / u).glob("*.tsx")):
            dateien[u + "/" + p.name] = datei_aufnehmen(p)
    return dateien


def unabhaengiger_scan(name):
    """Zweite, getrennte Zaehlung der Marken ueber den ganzen Ordner —
    der Kreuzcheck fuer die Rot-Probe."""
    gesamt = 0
    ordner = V2 / Path(name)
    muster = ["*.ts", "*.tsx"] + {
        "nutrition": ["suche/*.tsx"], "coach": ["human/*.tsx"],
    }.get(name, [])
    for glob in muster:
        for p in ordner.glob(glob):
            if "__tests__" in str(p):
                continue
            for nr, z in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
                if not ist_kommentar(z):
                    gesamt += len(list(RE_MARKE.finditer(z)))
    return gesamt


def datenbank_aufnehmen():
    roh = psql(
        "select schemaname, relname, n_live_tup from pg_stat_user_tables "
        "order by schemaname, relname;")
    tabellen = []
    for zeile in roh.splitlines():
        teile = [t.strip() for t in zeile.split("|")]
        if len(teile) == 3 and teile[0]:
            # n_live_tup ist eine Schaetzung — echtes count(*) je Tabelle
            n = psql(f'select count(*) from "{teile[0]}"."{teile[1]}";').strip()
            tabellen.append({"schema": teile[0], "tabelle": teile[1],
                             "zeilen": int(n) if n.isdigit() else None})
    schemata = sorted({t["schema"] for t in tabellen})
    return {"schemata": schemata, "tabellen": tabellen}


def main():
    rotprobe = "--rotprobe" in sys.argv
    ergebnis = {"stichtag": None, "module": {}, "datenbank": None}
    # Stichtag aus git, nicht aus der Uhr — reproduzierbar.
    from lauf import git
    ergebnis["stichtag"] = git("log", "-1", "--format=%cs HEAD=%h")

    fehler = 0
    for name in MODULE:
        dateien = modul_aufnehmen(name)
        summe_detail = sum(len(d["marken"]) for d in dateien.values())
        summe_scan = unabhaengiger_scan(name)
        if rotprobe and name == MODULE[0]:
            summe_detail += 1  # absichtliche Verfaelschung
        if summe_detail != summe_scan:
            print(f"BEFUND {name}: Detailliste {summe_detail} != Scan {summe_scan}")
            fehler = 1
        ergebnis["module"][name] = {
            "marken_summe": summe_scan,
            "kacheln_summe": sum(len(d["kacheln"]) for d in dateien.values()),
            "dateien": dateien,
        }

    ergebnis["datenbank"] = datenbank_aufnehmen()

    ziel = REPO / "backup" / "modul-bestand.json"
    with open(ziel, "w", encoding="utf-8", newline="\n") as f:
        json.dump(ergebnis, f, ensure_ascii=False, indent=1)
    print(f"geschrieben: {ziel}")

    for name, m in ergebnis["module"].items():
        print(f"{name:<12} Marken {m['marken_summe']:>3}  Kacheln {m['kacheln_summe']:>3}")
    db = ergebnis["datenbank"]
    print(f"Schemata: {', '.join(db['schemata'])}")
    print(f"Tabellen: {len(db['tabellen'])}, "
          f"davon mit Zeilen: {sum(1 for t in db['tabellen'] if t['zeilen'])}")
    sys.exit(fehler)


if __name__ == "__main__":
    main()
