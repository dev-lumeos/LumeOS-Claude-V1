import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql


queries = [
    ("ranges_total", "select count(*) from medical.biomarker_reference_ranges"),
    (
        "multi_slug_loinc",
        """
        select count(*) from (
          select loinc_code
          from medical.biomarker_reference_ranges
          where nullif(loinc_code, '') is not null
          group by loinc_code
          having count(distinct curated_slug) > 1
        ) x
        """,
    ),
    (
        "supplement_evidence_graded",
        "select count(*) from supplements.supplement_evidence where overall_grade is not null",
    ),
    (
        "supplements_evidence_grade",
        "select count(*) from supplements.supplements where evidence_grade is not null",
    ),
]

out = []
for label, sql in queries:
    result = psql(sql)
    if label == "evidence_by_source":
        for line in result.splitlines():
            if line.strip():
                out.append(f"{label}|{line.strip()}")
    else:
        out.append(f"{label}|{result.strip()}")

has_source_primary = psql(
    """
    select count(*)
    from information_schema.columns
    where table_schema = 'supplements'
      and table_name = 'supplements'
      and column_name = 'source_primary'
    """
).strip()
if has_source_primary == "1":
    result = psql(
        """
        select source_primary || '|' || count(*) || '|' || count(evidence_grade)
        from supplements.supplements
        group by source_primary
        order by source_primary
        """
    )
    for line in result.splitlines():
        if line.strip():
            out.append(f"evidence_by_source|{line.strip()}")
else:
    out.append("evidence_by_source|source_primary fehlt live")

target = Path(sys.argv[1])
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text("\n".join(out) + "\n", encoding="utf-8", newline="\n")
print(target)
