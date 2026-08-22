# -*- coding: utf-8 -*-
"""C-180: Die Evidenz-Registry als nachschlagbares Modul generieren.

Quelle:  backup/kimi-research/.../data/evidence/
         constant_evidence_registry.json   (181 Records, crawl_025)
         recovery_modality_evidence.json   (32 Records — die C-124-IDs,
                                            die NICHT in der 181er stehen)
Ziel:    apps/web/src/lib/evidenz/registry.ts  (GENERIERT)

Warum Repo und nicht Datenbank: die Einstufungen haengen zur
Compile-Zeit an Code-Konstanten und aendern sich nur mit einem neuen
Crawl. Eine Tabelle waere ein Schema (Codex-Bereich) und brauchte
Laufzeit-Reads fuer statische Wahrheiten.

Was das Modul BEWUSST NICHT enthaelt: `current_value`. Ein Wert, der
REMOVE_NUMERIC_VALUE oder not_evidence traegt, kann so gar nicht erst
in eine Oberflaeche gelangen; belegte Zahlen (KEEP_NUMERIC) stehen in
den Konstanten-Dateien und werden dort per Waechtertest an ihre
Registry-Einstufung gebunden.
"""
import io
import json
import sys
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

REPO = r"D:\GitHub\LumeOS-Claude-V1"
QUELLE = REPO + r"\backup\kimi-research\Kimi_Agent\supplement_performance_database\data\evidence"
ZIEL = REPO + r"\apps\web\src\lib\evidenz\registry.ts"

HANDLINGS = (
    "USE_DIRECTIONAL_GUIDANCE", "LABEL_HEURISTIC", "REQUIRE_CONTEXT",
    "KEEP_NUMERIC", "DO_NOT_IMPLEMENT", "USE_RANGE", "PERSONALIZE",
    "REMOVE_NUMERIC_VALUE", "REPO_REVIEW_REQUIRED",
)
GESPERRT = {"DO_NOT_IMPLEMENT", "REMOVE_NUMERIC_VALUE", "REPO_REVIEW_REQUIRED"}
GRADE = {"A", "B", "C", "D", "E"}
SOLL_181 = {
    "USE_DIRECTIONAL_GUIDANCE": 133, "LABEL_HEURISTIC": 15,
    "REQUIRE_CONTEXT": 13, "KEEP_NUMERIC": 6, "DO_NOT_IMPLEMENT": 4,
    "USE_RANGE": 4, "PERSONALIZE": 3, "REMOVE_NUMERIC_VALUE": 2,
    "REPO_REVIEW_REQUIRED": 1,
}


def fehl(text: str) -> None:
    print("FEHLER:", text)
    sys.exit(1)


def lade(name: str) -> list[dict]:
    with io.open(QUELLE + "\\" + name, encoding="utf-8") as f:
        return json.load(f)["records"]


def quelle_kurz(e: dict) -> tuple[str | None, int | None, str | None]:
    """Erste Quelle als (Text, Jahr, URL) — Verlag vor Titel, PMID als
    Text, wenn sonst nichts Greifbares da ist."""
    quellen = e.get("sources") or []
    if not quellen or not isinstance(quellen[0], dict):
        return None, None, None
    q = quellen[0]
    jahr = q.get("year") if isinstance(q.get("year"), int) else None
    text = q.get("publisher") or q.get("title")
    if not text and q.get("pmid"):
        text = f"PMID {q['pmid']}"
    url = q.get("url") or (f"https://pubmed.ncbi.nlm.nih.gov/{q['pmid']}/" if q.get("pmid") else None)
    return (str(text)[:90] if text else None), jahr, url


def ts_string(wert) -> str:
    if wert is None:
        return "null"
    if isinstance(wert, bool):
        return "true" if wert else "false"
    if isinstance(wert, int):
        return str(wert)
    s = str(wert).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")
    return f"'{s}'"


def main() -> None:
    haupt = lade("constant_evidence_registry.json")
    recovery = lade("recovery_modality_evidence.json")
    # C-181: die Formel-Registry (22 Records) — dort stehen die
    # ACWR-Entscheidungen (C01-C08) und Session-Load (C10).
    formeln = lade("formula_evidence_registry.json")

    # Pruefungen an der Quelle — der Generator bricht, statt Murks zu
    # schreiben.
    zaehlung = Counter(e["recommended_product_handling"] for e in haupt)
    if dict(zaehlung) != SOLL_181 or len(haupt) != 181:
        fehl(f"181er-Zaehlung weicht ab: {dict(zaehlung)} (Summe {len(haupt)})")
    if len(recovery) != 32 or any(e["recommended_product_handling"] != "REMOVE_NUMERIC_VALUE" for e in recovery):
        fehl("recovery_modality_evidence: erwartet 32 x REMOVE_NUMERIC_VALUE")
    if len(formeln) != 22:
        fehl(f"formula_evidence_registry: erwartet 22 Records, sind {len(formeln)}")

    eintraege: list[str] = []
    gesehen: set[str] = set()
    uebersprungen = 0
    for datei, records in (("constant_evidence_registry", haupt),
                           ("recovery_modality_evidence", recovery),
                           ("formula_evidence_registry", formeln)):
        for e in records:
            kid = e.get("constant_id")
            handling = e.get("recommended_product_handling")
            grad = e.get("evidence_grade")
            if not kid:
                fehl("constant_id fehlt")
            if kid in gesehen:
                # `[cmd]` 9 der 22 Formel-Records stehen bereits in der
                # 181er (sie aggregiert die Workstream-Register) — die
                # Erstquelle gewinnt, Duplikate werden gezaehlt, nicht
                # doppelt eingetragen.
                if datei == "formula_evidence_registry":
                    uebersprungen += 1
                    continue
                fehl(f"constant_id doppelt: {kid!r}")
            if handling not in HANDLINGS:
                fehl(f"{kid}: unbekanntes Handling {handling!r}")
            if grad is not None and grad not in GRADE:
                fehl(f"{kid}: unbekannter Grad {grad!r}")
            gesehen.add(kid)
            text, jahr, url = quelle_kurz(e)
            eintraege.append(
                "  " + ts_string(kid) + ": { "
                + f"id: {ts_string(kid)}, "
                + f"domain: {ts_string(e.get('domain'))}, "
                + f"handling: {ts_string(handling)}, "
                + f"grad: {ts_string(grad)}, "
                + f"einstufung: {ts_string(e.get('classification'))}, "
                + f"konzept: {ts_string(str(e.get('concept') or '')[:110])}, "
                + f"einheit: {ts_string(e.get('unit'))}, "
                + f"wertNutzbar: {ts_string(handling not in GESPERRT)}, "
                + f"quelle: {ts_string(text)}, "
                + f"jahr: {ts_string(jahr)}, "
                + f"quelleUrl: {ts_string(url)}, "
                + f"registerDatei: {ts_string(datei)}" + " },")

    kopf = """// GENERIERT — NICHT VON HAND AENDERN.
//
// Quelle:   backup/kimi-research/Kimi_Agent/supplement_performance_database/
//           data/evidence/{constant_evidence_registry,recovery_modality_evidence}.json
// Erzeuger: tools/evidenz-registry-generieren.py  (C-180)
//
// Das Evidenzregister aus crawl_025: je Konstante die Einstufung
// (`handling`), der Grad und die Erstquelle — damit Code sie
// NACHSCHLAGEN kann, statt sie als Kommentar zu tragen.
//
// `current_value` ist BEWUSST nicht enthalten: ein Wert mit
// REMOVE_NUMERIC_VALUE/not_evidence kann so gar nicht erst in eine
// Oberflaeche gelangen. Belegte Zahlen (KEEP_NUMERIC) stehen in den
// Konstanten-Dateien; Waechtertests binden sie an diese Eintraege.

export type EvidenzHandling =
  | 'USE_DIRECTIONAL_GUIDANCE' | 'LABEL_HEURISTIC' | 'REQUIRE_CONTEXT'
  | 'KEEP_NUMERIC' | 'DO_NOT_IMPLEMENT' | 'USE_RANGE' | 'PERSONALIZE'
  | 'REMOVE_NUMERIC_VALUE' | 'REPO_REVIEW_REQUIRED'

export type EvidenzEintrag = {
  id: string
  domain: string | null
  handling: EvidenzHandling
  grad: 'A' | 'B' | 'C' | 'D' | 'E' | null
  einstufung: string | null
  konzept: string
  einheit: string | null
  /** `false` bei DO_NOT_IMPLEMENT, REMOVE_NUMERIC_VALUE und
   *  REPO_REVIEW_REQUIRED — solche Konstanten duerfen keinen Zahlwert
   *  in die Oberflaeche tragen. */
  wertNutzbar: boolean
  quelle: string | null
  jahr: number | null
  quelleUrl: string | null
  registerDatei: 'constant_evidence_registry' | 'recovery_modality_evidence' | 'formula_evidence_registry'
}

export const EVIDENZ_REGISTRY: Record<string, EvidenzEintrag> = {
"""

    fuss = """}

/**
 * Nachschlagen mit Fehlwurf: eine unbekannte Registry-ID ist ein
 * Programmierfehler, kein Datenzustand — sie soll krachen, nicht
 * `undefined` durchreichen.
 */
export function holeEvidenz(id: string): EvidenzEintrag {
  const e = EVIDENZ_REGISTRY[id]
  if (!e) throw new Error(`Evidenzregister: unbekannte Konstante ${id}`)
  return e
}
"""

    io.open(ZIEL, "w", encoding="utf-8", newline="\n").write(
        kopf + "\n".join(eintraege) + "\n" + fuss)

    nach = Counter()
    for z in eintraege:
        for h in HANDLINGS:
            if f"handling: '{h}'" in z:
                nach[h] += 1
                break
    print(f"Geschrieben: {ZIEL}")
    print(f"Eintraege gesamt: {len(eintraege)} "
          f"(181 Haupt + 32 Recovery + {22 - uebersprungen} Formeln; "
          f"{uebersprungen} Formel-Duplikate der 181er uebersprungen)")
    print("Zaehlung je Handling im ERZEUGNIS:")
    for h in HANDLINGS:
        print(f"  {h}: {nach[h]}")


if __name__ == "__main__":
    main()
