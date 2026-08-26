from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\messung-vorher.out")
OUT.parent.mkdir(parents=True, exist_ok=True)
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
        "-t", "-A", "-F", "\t", "-c", sql,
    ])


queries = {
    "columns_dosing": "select column_name, data_type from information_schema.columns where table_schema='supplements' and table_name='supplement_dosing' order by ordinal_position;",
    "columns_lab": "select column_name, data_type from information_schema.columns where table_schema='supplements' and table_name='supplement_lab_effects' order by ordinal_position;",
    "columns_wada": "select column_name, data_type from information_schema.columns where table_schema='supplements' and table_name='supplement_wada' order by ordinal_position;",
    "columns_conflicts": "select column_name, data_type from information_schema.columns where table_schema='supplements' and table_name='wada_conflict_records' order by ordinal_position;",
    "child_rows": """
      select 'supplement_dosing' table_name, count(*) from supplements.supplement_dosing d join supplements.supplements s on s.id=d.supplement_id where s.parent_id is not null
      union all select 'supplement_lab_effects', count(*) from supplements.supplement_lab_effects d join supplements.supplements s on s.id=d.supplement_id where s.parent_id is not null
      union all select 'supplement_user_texts', count(*) from supplements.supplement_user_texts d join supplements.supplements s on s.id=d.supplement_id where s.parent_id is not null
      union all select 'supplement_wada', count(*) from supplements.supplement_wada d join supplements.supplements s on s.id=d.supplement_id where s.parent_id is not null;
    """,
    "wada_parent_own": """
      with child_parent as (
        select distinct c.parent_id from supplements.supplement_wada w join supplements.supplements c on c.id=w.supplement_id where c.parent_id is not null
      )
      select count(*) filter (where pw.id is not null) as parents_with_own_wada,
             count(*) as parents_with_child_wada
      from child_parent cp
      left join supplements.supplement_wada pw on pw.supplement_id = cp.parent_id;
    """,
    "wada_uniform": """
      with groups as (
        select c.parent_id, p.name_en,
               count(*) child_rows,
               count(distinct jsonb_build_object('wada_status',w.wada_status,'wada_category',w.wada_category,'scope_class',w.scope_class,'scope_note_de',w.scope_note_de,'scope_note_en',w.scope_note_en,'note_de',w.note_de,'note_en',w.note_en)) variants,
               string_agg(distinct coalesce(w.wada_status,'NULL') || ':' || coalesce(w.wada_category,'NULL'), ' | ' order by coalesce(w.wada_status,'NULL') || ':' || coalesce(w.wada_category,'NULL')) vals
        from supplements.supplement_wada w
        join supplements.supplements c on c.id=w.supplement_id
        join supplements.supplements p on p.id=c.parent_id
        where c.parent_id is not null
        group by c.parent_id,p.name_en
      )
      select variants, count(*), string_agg(name_en || ' [' || vals || ']', '; ' order by name_en) from groups group by variants order by variants;
    """,
    "dosing_uniform": """
      with groups as (
        select c.parent_id, p.name_en,
               count(*) child_rows,
               count(distinct jsonb_build_object('status',d.status,'official_label_dose',d.official_label_dose,'guideline_dose',d.guideline_dose,'studied_dose_ranges',d.studied_dose_ranges,'anecdotal_dose_ranges',d.anecdotal_dose_ranges,'upper_limit',d.upper_limit,'dose_unit',d.dose_unit,'frequency_en',d.frequency_en,'duration_studied_en',d.duration_studied_en)) variants
        from supplements.supplement_dosing d
        join supplements.supplements c on c.id=d.supplement_id
        join supplements.supplements p on p.id=c.parent_id
        where c.parent_id is not null
        group by c.parent_id,p.name_en
      )
      select variants, count(*), string_agg(name_en, ', ' order by name_en) from groups group by variants order by variants;
    """,
    "lab_uniform": """
      with groups as (
        select c.parent_id, p.name_en, le.lab_marker_id, le.loinc_code, le.effect_type, le.analyte_en,
               count(*) child_rows,
               count(distinct jsonb_build_object('direction',le.direction,'clinical_consequence_en',le.clinical_consequence_en,'evidence',le.evidence,'effect_class',le.effect_class,'magnitude_context',le.magnitude_context,'mechanism_en',le.mechanism_en)) variants
        from supplements.supplement_lab_effects le
        join supplements.supplements c on c.id=le.supplement_id
        join supplements.supplements p on p.id=c.parent_id
        where c.parent_id is not null
        group by c.parent_id,p.name_en,le.lab_marker_id,le.loinc_code,le.effect_type,le.analyte_en
      )
      select variants, count(*), string_agg(name_en || ':' || coalesce(analyte_en,'?'), ', ' order by name_en) from groups group by variants order by variants;
    """,
    "caffeine_wada": """
      select p.name_en parent, c.name_en child, w.wada_status, w.wada_category
      from supplements.supplements c
      join supplements.supplements p on p.id=c.parent_id
      join supplements.supplement_wada w on w.supplement_id=c.id
      where p.name_en ilike 'Caffeine%'
      order by c.name_en;
    """,
    "magnesium_dosing": """
      select p.name_en parent, c.name_en child, d.guideline_dose, d.upper_limit, d.dose_unit, d.frequency_en, d.duration_studied_en
      from supplements.supplements c
      join supplements.supplements p on p.id=c.parent_id
      join supplements.supplement_dosing d on d.supplement_id=c.id
      where p.name_en ilike 'Magnesium%'
      order by c.name_en;
    """,
    "wada_contradictions": """
      select s.name_en, w.wada_status, w.wada_category, w.source
      from supplements.supplement_wada w
      join supplements.supplements s on s.id=w.supplement_id
      where (w.wada_status = 'prohibited' and w.wada_category ilike '%not prohibited%')
         or (w.wada_status = 'not_prohibited' and (
              w.wada_category ilike '%prohibited%'
              and w.wada_category not ilike '%not prohibited%'
            ))
      order by s.name_en;
    """,
    "im_katalog": "select count(*) filter (where im_katalog and parent_id is null), count(*) filter (where im_katalog and parent_id is not null) from supplements.supplements;",
}

parts = []
for name, sql in queries.items():
    parts.append(name + "\n" + psql(sql))

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
