from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\simulation-vorher.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
        "-t", "-A", "-F", "\t", "-c", sql,
    ])


sql = r"""
WITH child_dosing AS (
  SELECT c.parent_id, d.*
  FROM supplements.supplement_dosing d
  JOIN supplements.supplements c ON c.id=d.supplement_id
  WHERE c.parent_id IS NOT NULL
), dosing AS (
  SELECT parent_id,
    CASE WHEN count(DISTINCT official_label_dose) FILTER (WHERE official_label_dose IS NOT NULL AND official_label_dose <> '{}'::jsonb) = 1 THEN min(official_label_dose::text)::jsonb END official_label_dose,
    CASE WHEN count(DISTINCT guideline_dose) FILTER (WHERE guideline_dose IS NOT NULL AND guideline_dose <> '{}'::jsonb) = 1 THEN min(guideline_dose::text)::jsonb END guideline_dose,
    CASE WHEN count(DISTINCT studied_dose_ranges) FILTER (WHERE studied_dose_ranges IS NOT NULL AND studied_dose_ranges <> '[]'::jsonb AND studied_dose_ranges <> '{}'::jsonb) = 1 THEN min(studied_dose_ranges::text)::jsonb END studied_dose_ranges,
    CASE WHEN count(DISTINCT anecdotal_dose_ranges) FILTER (WHERE anecdotal_dose_ranges IS NOT NULL AND anecdotal_dose_ranges <> '[]'::jsonb AND anecdotal_dose_ranges <> '{}'::jsonb) = 1 THEN min(anecdotal_dose_ranges::text)::jsonb END anecdotal_dose_ranges,
    CASE WHEN count(DISTINCT upper_limit) FILTER (WHERE upper_limit IS NOT NULL AND upper_limit <> '{}'::jsonb) = 1 THEN min(upper_limit::text)::jsonb END upper_limit,
    CASE WHEN count(DISTINCT nullif(dose_unit,'')) FILTER (WHERE nullif(dose_unit,'') IS NOT NULL) = 1 THEN min(nullif(dose_unit,'')) END dose_unit,
    CASE WHEN count(DISTINCT nullif(frequency_en,'')) FILTER (WHERE nullif(frequency_en,'') IS NOT NULL) = 1 THEN min(nullif(frequency_en,'')) END frequency_en,
    CASE WHEN count(DISTINCT nullif(duration_studied_en,'')) FILTER (WHERE nullif(duration_studied_en,'') IS NOT NULL) = 1 THEN min(nullif(duration_studied_en,'')) END duration_studied_en,
    count(*) child_rows
  FROM child_dosing GROUP BY parent_id
), dosing_effective AS (
  SELECT p.name_en, d.*,
    ((official_label_dose IS NOT NULL)::int + (guideline_dose IS NOT NULL)::int + (studied_dose_ranges IS NOT NULL)::int + (anecdotal_dose_ranges IS NOT NULL)::int + (upper_limit IS NOT NULL)::int + (dose_unit IS NOT NULL)::int + (frequency_en IS NOT NULL)::int + (duration_studied_en IS NOT NULL)::int) inherited_fields
  FROM dosing d JOIN supplements.supplements p ON p.id=d.parent_id
), lab AS (
  SELECT c.parent_id, p.name_en, le.lab_marker_id, le.loinc_code, le.effect_type, le.analyte_en,
         count(*) child_rows,
         count(DISTINCT jsonb_build_object('direction',le.direction,'clinical_consequence_en',le.clinical_consequence_en,'evidence',le.evidence,'effect_class',le.effect_class,'magnitude_context',le.magnitude_context,'mechanism_en',le.mechanism_en)) variants
  FROM supplements.supplement_lab_effects le
  JOIN supplements.supplements c ON c.id=le.supplement_id
  JOIN supplements.supplements p ON p.id=c.parent_id
  WHERE c.parent_id IS NOT NULL
  GROUP BY c.parent_id,p.name_en,le.lab_marker_id,le.loinc_code,le.effect_type,le.analyte_en
), wada AS (
  SELECT c.parent_id, p.name_en, count(*) child_rows,
         count(DISTINCT jsonb_build_object('wada_status',w.wada_status,'wada_category',w.wada_category,'scope_class',w.scope_class,'scope_note_de',w.scope_note_de,'scope_note_en',w.scope_note_en,'note_de',w.note_de,'note_en',w.note_en)) variants
  FROM supplements.supplement_wada w
  JOIN supplements.supplements c ON c.id=w.supplement_id
  JOIN supplements.supplements p ON p.id=c.parent_id
  WHERE c.parent_id IS NOT NULL
  GROUP BY c.parent_id,p.name_en
)
SELECT 'dosing_parent_groups', count(*)::text FROM dosing_effective
UNION ALL SELECT 'dosing_parents_with_uniform_field', count(*)::text FROM dosing_effective WHERE inherited_fields > 0
UNION ALL SELECT 'dosing_uniform_fields_total', sum(inherited_fields)::text FROM dosing_effective
UNION ALL SELECT 'dosing_nonuniform_parents', string_agg(name_en, ', ' order by name_en) FROM dosing_effective WHERE child_rows > 1 AND inherited_fields < 8
UNION ALL SELECT 'lab_groups_uniform', count(*)::text FROM lab WHERE variants=1
UNION ALL SELECT 'lab_groups_nonuniform', count(*)::text FROM lab WHERE variants>1
UNION ALL SELECT 'lab_nonuniform_names', string_agg(name_en || ':' || coalesce(analyte_en,'?'), ', ' order by name_en) FROM lab WHERE variants>1
UNION ALL SELECT 'wada_parents_uniform', count(*)::text FROM wada WHERE variants=1
UNION ALL SELECT 'wada_parents_nonuniform', count(*)::text FROM wada WHERE variants>1
UNION ALL SELECT 'wada_nonuniform_names', string_agg(name_en, ', ' order by name_en) FROM wada WHERE variants>1;
"""

OUT.write_text(psql(sql) + "\n", encoding="utf-8", newline="\n")
print(OUT)
