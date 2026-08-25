import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(r"D:\GitHub\LumeOS-Claude-V1")
IN_DIR = ROOT / "docs/kimi-ingestion/konsolidierung"
RAW = IN_DIR / "REPORT_DATA_ABGLEICH.jsonl"
FILTERED = IN_DIR / "ABGLEICH_GEFILTERT.jsonl"
NACHZUTRAGEN = IN_DIR / "NACHZUTRAGEN.md"
SACHKONFLIKTE = IN_DIR / "SACHKONFLIKTE.md"
FILTER_PROTOCOL = IN_DIR / "FILTER_PROTOKOLL.md"
SUMMARY_JSON = IN_DIR / "C261_FILTER_SUMMARY.json"
REPORT = ROOT / "docs/berichte/c-261-codex.md"

PATH_RULES = {
    "pfad_cache": ["_cache/", "/cache/", "k_cache/"],
    "pfad_ckpt": ["_ckpt"],
    "pfad_backup_pre_merge": ["_backup_pre_merge"],
    "pfad_stage": ["_stage"],
    "pfad_apps": ["_apps_"],
    "pfad_baseline": ["_baseline"],
    "pfad_tmp": ["_tmp"],
    "pfad_log": [".log"],
}

FIELD_EXACT = {
    "entity_id",
    "generated_at",
    "mismatch_dimensions",
    "source_relationship_ids",
    "source_relationship_ids[]",
    "optional_context",
    "optional_context[]",
    "high_value_context",
    "high_value_context[]",
    "domain",
    "source_ids",
    "source_ids[]",
    "sections_used",
    "sections_used[]",
    "source_threshold",
    "quality_evidence[].source",
}
FIELD_SUBSTRINGS = ["_hashes", "_ckpt", ".source_ids", ".sections_used"]

TIMESTAMP_TAILS = {
    "last_verified", "retrieved_at", "generated_at", "created_at",
    "updated_at", "date", "timestamp", "snapshot_date", "as_of",
}

CONTENT_HINTS = [
    "cas", "unii", "pubchem", "chembl", "inchikey", "sequence",
    "formula", "weight", "chemical_form", "salt_form", "modification",
    "cyp", "transport", "renal", "hepatic", "pregnancy", "lactation",
    "fertility", "cardiovascular", "endocrine", "neurological",
    "wada", "thailand", "regulatory", "safety", "interaction",
    "contraindication", "side_effect", "toxicity", "lab_effect",
    "monitoring", "severity_bands", "effect", "mechanism",
    "clinical_consequence", "evidence", "pharmacology", "dosing",
    "route", "half_life", "bioavailability", "time_to_peak",
    "duration", "elimination", "metabolism", "alias", "synonym",
    "community_names", "research_names", "description",
]

FIELD_NOISE_TAILS = {
    "evidence",
    "source_threshold",
    "sections_used",
    "source_ids",
    "pmid_verification_log",
    "queries",
    "notes",
}

NOISE_ENTITY_PREFIXES = {
    "brand_searches", "supp_searches", "l_result", "amb_details",
    "i_result", "fda_search", "pubmed_search", "searches",
}


def norm_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return str(value)


def norm_cmp(value: Any) -> str:
    text = norm_text(value).strip().lower()
    text = re.sub(r"\s+", " ", text)
    text = text.replace("µ", "u").replace("μ", "u")
    return text


def tail(field: str) -> str:
    return field.split(".")[-1].replace("[]", "")


def path_rule(row: dict[str, Any]) -> str | None:
    path = str(row.get("quelldatei", "")).replace("\\", "/").lower()
    for rule, needles in PATH_RULES.items():
        if any(n in path for n in needles):
            return rule
    return None


def field_rule(row: dict[str, Any]) -> str | None:
    field = str(row.get("feld", ""))
    low = field.lower()
    base = tail(low)
    if low in FIELD_EXACT or base in FIELD_EXACT:
        return f"feld_{base}"
    if base in FIELD_NOISE_TAILS:
        return f"feld_rauschen_{base}"
    for sub in FIELD_SUBSTRINGS:
        if sub in low:
            return f"feld_enthaelt_{sub}"
    return None


def content_rule(row: dict[str, Any]) -> str | None:
    entity = str(row.get("entitaet", "")).lower()
    field = str(row.get("feld", "")).lower()
    if entity in NOISE_ENTITY_PREFIXES:
        return "entitaet_laufartefakt"
    if field.startswith("line_"):
        return "feld_textzeile"
    if row.get("resolved_data_id") is None:
        return "ohne_entitaetszuordnung"
    if not any(h in field for h in CONTENT_HINTS):
        return "kein_sachfeld_hint"
    return None


def exclusion_reason(row: dict[str, Any]) -> str | None:
    for fn in (path_rule, field_rule, content_rule):
        reason = fn(row)
        if reason:
            return reason
    return None


def classify_diff(row: dict[str, Any]) -> str:
    field = str(row.get("feld", "")).lower()
    base = tail(field)
    if base in TIMESTAMP_TAILS or "last_verified" in field or "retrieved_at" in field or "generated_at" in field:
        return "ZEITSTEMPEL"
    report = row.get("wert_report")
    data = row.get("wert_daten")
    data_values = data if isinstance(data, list) else [data]
    report_norm = norm_cmp(report)
    for dv in data_values:
        if norm_cmp(dv) == report_norm:
            return "FORMAT"
        if sorted(re.findall(r"[a-z0-9]+", norm_cmp(dv))) == sorted(re.findall(r"[a-z0-9]+", report_norm)):
            return "FORMAT"
    return "SACHKONFLIKT"


def row_key(row: dict[str, Any]) -> tuple[str, str, str, str]:
    return (
        str(row.get("resolved_data_id") or row.get("entitaet")),
        str(row.get("feld")),
        json.dumps(row.get("wert_report"), ensure_ascii=False, sort_keys=True),
        str(row.get("quelldatei")),
    )


def main():
    before = 0
    kept = 0
    removed = Counter()
    states = Counter()
    diff_classes = Counter()
    missing_by_entity: dict[str, list[dict[str, Any]]] = defaultdict(list)
    sachkonflikte: list[dict[str, Any]] = []
    bpc_cas_rows = []
    seen = set()

    with RAW.open("r", encoding="utf-8") as src, FILTERED.open("w", encoding="utf-8", newline="\n") as dst:
        for line in src:
            before += 1
            row = json.loads(line)
            reason = exclusion_reason(row)
            if reason:
                removed[reason] += 1
                continue
            key = row_key(row)
            if key in seen:
                removed["duplikat_gefiltert"] += 1
                continue
            seen.add(key)
            if row.get("zustand") == "ABWEICHEND":
                row["abweichung_klasse"] = classify_diff(row)
                diff_classes[row["abweichung_klasse"]] += 1
                if row["abweichung_klasse"] == "SACHKONFLIKT":
                    sachkonflikte.append(row)
            state = row.get("zustand")
            states[state] += 1
            if state == "FEHLT":
                missing_by_entity[row.get("entitaet") or row.get("resolved_data_id")].append(row)
            if (
                "bpc" in str(row.get("entitaet", "")).lower()
                and "cas" in str(row.get("feld", "")).lower()
                and row.get("zustand") == "UEBERNOMMEN"
            ):
                bpc_cas_rows.append(row)
            dst.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            kept += 1

    negative_row = {
        "quelldatei": "crawl_038_ws/K_cache/brand_searches.json",
        "arbeitsverzeichnis": "NEGATIVPROBE",
        "entitaet": "BPC-157",
        "resolved_data_id": "sub_9f9bb8c160",
        "feld": "identity.CAS",
        "wert_report": "137525-51-0",
        "wert_daten": ["137525-51-0"],
        "zustand": "UEBERNOMMEN",
    }
    negative_reason = exclusion_reason(negative_row)

    missing_lines = ["# Nachzutragen", ""]
    missing_lines.append("[cmd] Diese Liste enthaelt gefilterte `FEHLT`-Zeilen: Sachfelder, echte Quellen, aufgeloeste Entitaeten.")
    missing_lines.append("")
    for entity in sorted(missing_by_entity):
        rows = missing_by_entity[entity]
        missing_lines.append(f"## {entity}")
        grouped = defaultdict(list)
        for row in rows:
            grouped[row["feld"]].append(row)
        for field in sorted(grouped):
            examples = grouped[field][:10]
            missing_lines.append(f"- `{field}` ({len(grouped[field])} Wert(e))")
            for ex in examples:
                missing_lines.append(f"  - {norm_text(ex['wert_report'])[:500]} - `{ex['quelldatei']}`")
            if len(grouped[field]) > 10:
                missing_lines.append(f"  - ... {len(grouped[field]) - 10} weitere in `ABGLEICH_GEFILTERT.jsonl`")
        missing_lines.append("")
    if not missing_by_entity:
        missing_lines.append("- Keine nachzutragenden Werte nach Filter.")
    NACHZUTRAGEN.write_text("\n".join(missing_lines).rstrip() + "\n", encoding="utf-8", newline="\n")

    conflict_lines = ["# Sachkonflikte", ""]
    conflict_lines.append("[cmd] Nur `ABWEICHEND`-Zeilen der Klasse `SACHKONFLIKT`. Zeitstempel und reine Formatabweichungen sind herausgetrennt.")
    conflict_lines.append("")
    for row in sachkonflikte[:2000]:
        conflict_lines.append(f"- `{row['entitaet']}` / `{row['feld']}` / `{row['quelldatei']}`")
        conflict_lines.append(f"  - Report: {norm_text(row['wert_report'])[:800]}")
        conflict_lines.append(f"  - Data: {norm_text(row['wert_daten'])[:800]}")
    if len(sachkonflikte) > 2000:
        conflict_lines.append(f"- ... {len(sachkonflikte) - 2000} weitere Sachkonflikte in `ABGLEICH_GEFILTERT.jsonl`.")
    if not sachkonflikte:
        conflict_lines.append("- Keine Sachkonflikte nach Filter.")
    SACHKONFLIKTE.write_text("\n".join(conflict_lines).rstrip() + "\n", encoding="utf-8", newline="\n")

    protocol_lines = ["# Filter Protokoll", ""]
    protocol_lines.append(f"- Zeilen vorher: {before}")
    protocol_lines.append(f"- Zeilen nachher: {kept}")
    protocol_lines.append(f"- Entfernt: {before - kept}")
    protocol_lines.append("")
    protocol_lines.append("| Regel | Entfernte Zeilen |")
    protocol_lines.append("|---|---:|")
    for rule, count in removed.most_common():
        protocol_lines.append(f"| `{rule}` | {count} |")
    protocol_lines.append("")
    protocol_lines.append("## Gegenproben")
    protocol_lines.append("")
    protocol_lines.append(f"- BPC-157 CAS bleibt erhalten: {len(bpc_cas_rows)} Treffer.")
    protocol_lines.append(f"- Cache-Pfad mit Sachfeld wird ausgeschlossen: `{negative_reason}`.")
    FILTER_PROTOCOL.write_text("\n".join(protocol_lines).rstrip() + "\n", encoding="utf-8", newline="\n")

    summary = {
        "before_rows": before,
        "after_rows": kept,
        "removed_rows": before - kept,
        "removed_by_rule": dict(removed),
        "states_after": dict(states),
        "abweichend_classes": dict(diff_classes),
        "bpc_cas_uebernommen_rows": len(bpc_cas_rows),
        "negative_cache_probe_reason": negative_reason,
        "sachkonflikte": len(sachkonflikte),
        "entities_with_missing_values": len(missing_by_entity),
        "output_files": {
            "filtered": str(FILTERED),
            "nachzutragen": str(NACHZUTRAGEN),
            "sachkonflikte": str(SACHKONFLIKTE),
            "filter_protocol": str(FILTER_PROTOCOL),
        },
    }
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    report_lines = [
        "# C-261 - Gefilterter Kimi-Abgleich",
        "",
        "## Ausgangslage",
        "",
        f"[cmd] Rohzeilen aus C-260: {before}.",
        f"[cmd] Gefilterte Sachzeilen: {kept}.",
        f"[cmd] Entfernt: {before - kept}.",
        "",
        "## Filter",
        "",
        "| Regel | Entfernte Zeilen |",
        "|---|---:|",
    ]
    for rule, count in removed.most_common():
        report_lines.append(f"| `{rule}` | {count} |")
    report_lines.extend([
        "",
        "## Zustände nach Filter",
        "",
        "| Zustand | Zeilen |",
        "|---|---:|",
    ])
    for state, count in states.most_common():
        report_lines.append(f"| `{state}` | {count} |")
    report_lines.extend([
        "",
        "## ABWEICHEND-Klassen",
        "",
        "| Klasse | Zeilen |",
        "|---|---:|",
    ])
    for cls, count in diff_classes.most_common():
        report_lines.append(f"| `{cls}` | {count} |")
    report_lines.extend([
        "",
        "## Gegenproben",
        "",
        f"[cmd] BPC-157 CAS bleibt nach dem Filter als `UEBERNOMMEN` erhalten: {len(bpc_cas_rows)} Zeile(n).",
        f"[cmd] Negativprobe Cache-Pfad mit Sachfeld wird ausgeschlossen: `{negative_reason}`.",
        "",
        "## Ergebnis",
        "",
        f"[cmd] `NACHZUTRAGEN.md` gruppiert {len(missing_by_entity)} Entitaeten mit gefilterten fehlenden Sachwerten.",
        f"[cmd] `SACHKONFLIKTE.md` enthaelt {len(sachkonflikte)} Sachkonflikte; Zeitstempel und Formatabweichungen sind getrennt.",
        "",
        "[read] Der Rohstand `REPORT_DATA_ABGLEICH.jsonl` wurde nicht ueberschrieben.",
    ])
    REPORT.write_text("\n".join(report_lines).rstrip() + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
