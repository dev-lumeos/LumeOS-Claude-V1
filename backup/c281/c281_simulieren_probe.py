from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\simulation-probe.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"
DB = "lumeos_c281_probe"


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", DB,
        "-t", "-A", "-F", "\t", "-c", sql,
    ])


sql = """
WITH child_dosing AS (
  SELECT c.parent_id, p.name_en AS parent_name, d.*
  FROM supplements.supplement_dosing d
  JOIN supplements.supplements c ON c.id=d.supplement_id
  JOIN supplements.supplements p ON p.id=c.parent_id
  WHERE c.parent_id IS NOT NULL
), grouped AS (
  SELECT parent_id, parent_name, count(*) child_rows,
    CASE WHEN count(DISTINCT official_label_dose) FILTER (WHERE official_label_dose IS NOT NULL AND official_label_dose <> '{}'::jsonb) = 1 THEN min(official_label_dose::text)::jsonb END official_label_dose,
    CASE WHEN count(DISTINCT guideline_dose) FILTER (WHERE guideline_dose IS NOT NULL AND guideline_dose <> '{}'::jsonb) = 1 THEN min(guideline_dose::text)::jsonb END guideline_dose,
    CASE WHEN count(DISTINCT studied_dose_ranges) FILTER (WHERE studied_dose_ranges IS NOT NULL AND studied_dose_ranges <> '[]'::jsonb AND studied_dose_ranges <> '{}'::jsonb) = 1 THEN min(studied_dose_ranges::text)::jsonb END studied_dose_ranges,
    CASE WHEN count(DISTINCT anecdotal_dose_ranges) FILTER (WHERE anecdotal_dose_ranges IS NOT NULL AND anecdotal_dose_ranges <> '[]'::jsonb AND anecdotal_dose_ranges <> '{}'::jsonb) = 1 THEN min(anecdotal_dose_ranges::text)::jsonb END anecdotal_dose_ranges,
    CASE WHEN count(DISTINCT upper_limit) FILTER (WHERE upper_limit IS NOT NULL AND upper_limit <> '{}'::jsonb) = 1 THEN min(upper_limit::text)::jsonb END upper_limit,
    CASE WHEN count(DISTINCT nullif(dose_unit,'')) FILTER (WHERE nullif(dose_unit,'') IS NOT NULL) = 1 THEN min(nullif(dose_unit,'')) END dose_unit,
    CASE WHEN count(DISTINCT nullif(frequency_en,'')) FILTER (WHERE nullif(frequency_en,'') IS NOT NULL) = 1 THEN min(nullif(frequency_en,'')) END frequency_en,
    CASE WHEN count(DISTINCT nullif(duration_studied_en,'')) FILTER (WHERE nullif(duration_studied_en,'') IS NOT NULL) = 1 THEN min(nullif(duration_studied_en,'')) END duration_studied_en
  FROM child_dosing GROUP BY parent_id,parent_name
), effective AS (
  SELECT *, ((official_label_dose IS NOT NULL)::int + (guideline_dose IS NOT NULL)::int + (studied_dose_ranges IS NOT NULL)::int + (anecdotal_dose_ranges IS NOT NULL)::int + (upper_limit IS NOT NULL)::int + (dose_unit IS NOT NULL)::int + (frequency_en IS NOT NULL)::int + (duration_studied_en IS NOT NULL)::int) inherited_fields
  FROM grouped
)
select inherited_fields, count(*), string_agg(parent_name, ', ' order by parent_name)
from effective group by inherited_fields order by inherited_fields;
"""

OUT.write_text(psql(sql) + "\n", encoding="utf-8", newline="\n")
print(OUT)
