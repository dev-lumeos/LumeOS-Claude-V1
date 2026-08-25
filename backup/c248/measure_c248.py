from pathlib import Path
import csv
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backup" / "c248"
OUT.mkdir(parents=True, exist_ok=True)


def lauf(args: list[str]) -> str:
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    from lauf import lauf as run
    return run(args)


def psql(sql: str) -> str:
    return lauf([
        "docker",
        "exec",
        "supabase_db_LumeOS-Claude-V1",
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-Atc",
        sql,
    ])


medical_sql = r"""
select 'multi_slug_loinc', count(*)
from (
  select loinc_code
  from medical.biomarker_reference_ranges
  group by loinc_code
  having count(distinct curated_slug) > 1
) x;

select loinc_code, curated_slug, canonical_name_en, count(*)
from medical.biomarker_reference_ranges
group by loinc_code, curated_slug, canonical_name_en
having loinc_code in (
  select loinc_code
  from medical.biomarker_reference_ranges
  group by loinc_code
  having count(distinct curated_slug) > 1
)
order by loinc_code, curated_slug, canonical_name_en;

select loinc_code, curated_slug, canonical_name_en, range_type, sex, min_value, max_value, unit, source, source_status, decision_status
from medical.biomarker_reference_ranges
where loinc_code in ('1869-7', '1884-6')
order by loinc_code, curated_slug, range_type, sex, min_value, max_value;
"""
OUT.joinpath("medical-live-vor.log").write_text(psql(medical_sql) + "\n", encoding="utf-8", newline="\n")

base = ROOT / "backup" / "kimi-research" / "Kimi_Agent" / "supplement_performance_database" / "data" / "substances"
files = [
    ("kimi_supplement", base / "supplements.jsonl"),
    ("kimi_performance", base / "performance_compounds.jsonl"),
    ("kimi_peptide", base / "peptides.jsonl"),
]
rows: list[dict[str, str]] = []
for domain, path in files:
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            raw = json.loads(line)
            evidence = raw.get("evidence") if isinstance(raw.get("evidence"), dict) else {}
            grade = evidence.get("overall_grade") or raw.get("overall_grade") or ""
            rows.append({
                "domain": domain,
                "source_file": str(path.relative_to(ROOT)).replace("\\", "/"),
                "id": str(raw.get("id") or raw.get("slug") or raw.get("canonical_id") or ""),
                "name": str(raw.get("canonical_name") or raw.get("name") or raw.get("display_name") or ""),
                "overall_grade": str(grade or ""),
                "has_grade": "ja" if grade else "nein",
            })

summary: dict[str, tuple[int, int]] = {}
for row in rows:
    total, graded = summary.get(row["domain"], (0, 0))
    summary[row["domain"]] = (total + 1, graded + (1 if row["overall_grade"] else 0))

missing = [row for row in rows if not row["overall_grade"]]
with OUT.joinpath("kimi-evidence-summary.csv").open("w", encoding="utf-8", newline="\n") as f:
    writer = csv.writer(f)
    writer.writerow(["domain", "total", "graded", "missing"])
    for domain, (total, graded) in sorted(summary.items()):
        writer.writerow([domain, total, graded, total - graded])

with OUT.joinpath("kimi-31-without-grade.csv").open("w", encoding="utf-8", newline="\n") as f:
    writer = csv.DictWriter(f, fieldnames=["domain", "source_file", "id", "name", "overall_grade", "has_grade"])
    writer.writeheader()
    writer.writerows(missing)

print("medical-live-vor.log")
print("kimi-evidence-summary.csv")
print("kimi-31-without-grade.csv")
