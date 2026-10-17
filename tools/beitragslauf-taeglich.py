"""G-660: der taegliche Beitragslauf — nach Mitternacht (lokal), als service_role.

Reihenfolge (Auftrag G-660, 17.10.):
    1  SELECT goals.run_goal_contribution_catchup();   Modulbeitraege bis gestern nachholen
    2  SELECT goals.record_weekly_adjustments();       Wochenprotokoll G-627 schreiben

Beide Funktionen nehmen ohne Argument „bis gestern (Asia/Bangkok)". Scheitert Schritt 1,
laeuft Schritt 2 nicht — er wuerde auf den Beitraegen von vorgestern rechnen.

Nachweis wie beim Tageskettenlauf (`kettenlauf-taeglich.mjs`): eine Statusdatei, die
`kettenlauf-status-pruefen.mjs --status … --name beitragslauf` liest; der Punktelauf meldet
einen roten oder ueberfaelligen Lauf. Dazu eine Zeile je Lauf im Protokoll.

Aufruf (geplante Aufgabe mit pythonw.exe, damit kein Fenster aufgeht):
    pythonw tools/beitragslauf-taeglich.py
    python  tools/beitragslauf-taeglich.py --nur <user_id>[,<user_id>…]   nur diese Konten
Optionen: --status <pfad>  --protokoll <pfad>
"""
import argparse
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lauf import REPO, dienst_rpc, schreib  # noqa: E402

SCHRITTE = ("run_goal_contribution_catchup", "record_weekly_adjustments")


def main(argv=None):
    a = argparse.ArgumentParser()
    a.add_argument("--status", default=os.path.join(REPO, "backup", "_manifests", "beitragslauf-status.json"))
    a.add_argument("--protokoll", default=os.path.join(REPO, "backup", "_manifests", "beitragslauf.log"))
    a.add_argument("--nur", default=None, help="Konten (user_id, kommagetrennt); ohne: alle")
    o = a.parse_args(argv)

    argumente = {"p_user_ids": [u.strip() for u in o.nur.split(",") if u.strip()]} if o.nur else {}
    beginn = datetime.datetime.now(datetime.timezone.utc)
    schritte, ok = [], True
    for fn in SCHRITTE:
        if not ok:
            schritte.append({"funktion": fn, "status": "uebersprungen"})
            continue
        t0 = datetime.datetime.now(datetime.timezone.utc)
        gut, antwort = dienst_rpc("goals", fn, argumente)
        schritte.append({"funktion": fn, "status": "passed" if gut else "failed",
                         "sekunden": round((datetime.datetime.now(datetime.timezone.utc) - t0).total_seconds(), 1),
                         "ergebnis" if gut else "fehler": antwort})
        ok = gut

    ende = datetime.datetime.now(datetime.timezone.utc)
    bericht = {
        "version": 1, "status": "passed" if ok else "failed",
        "started_at": beginn.isoformat(), "finished_at": ende.isoformat(),
        "duration_seconds": round((ende - beginn).total_seconds(), 1),
        "exit_code": 0 if ok else 1, "konten": argumente.get("p_user_ids", "alle"),
        "schritte": schritte, "log": o.protokoll,
    }
    os.makedirs(os.path.dirname(o.status), exist_ok=True)
    if not schreib(o.status, json.dumps(bericht, ensure_ascii=False, indent=2) + "\n"):
        print(f"[beitragslauf] Status nicht schreibbar: {o.status}", file=sys.stderr)
        return 1
    zeile = f"{ende.isoformat()} {bericht['status']} " + " ".join(
        f"{s['funktion']}={s['status']}" + (f" ({str(s['fehler'])[:200]})" if s.get("fehler") else "") for s in schritte)
    with open(o.protokoll, "a", encoding="utf-8") as f:
        f.write(zeile + "\n")
    print(f"[beitragslauf] {zeile}", file=sys.stdout if ok else sys.stderr)
    return bericht["exit_code"]


if __name__ == "__main__":
    sys.exit(main())
