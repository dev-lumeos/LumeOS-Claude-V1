from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c281\live-direkt.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
        "-t", "-A", "-F", "\t", "-c", sql,
    ])


queries = {
    "table_counts": """
      select 'supplement_dosing', count(*) from supplements.supplement_dosing
      union all select 'supplement_lab_effects', count(*) from supplements.supplement_lab_effects
      union all select 'supplement_wada', count(*) from supplements.supplement_wada
      union all select 'wada_conflict_records', count(*) from supplements.wada_conflict_records;
    """,
    "inherited_counts": """
      select 'dosing', count(*) from supplements.supplement_dosing where source='c281:inherited_from_children'
      union all select 'lab', count(*) from supplements.supplement_lab_effects where source='c281:inherited_from_children'
      union all select 'wada', count(*) from supplements.supplement_wada where source='c281:inherited_from_children'
      union all select 'wada_conflicts_c282', count(*) from supplements.wada_conflict_records where source='c282:wada_status_category_self_conflict';
    """,
    "caffeine": """
      select p.name_en parent, c.name_en child, w.wada_status, w.wada_category
      from supplements.supplements c
      join supplements.supplements p on p.id=c.parent_id
      join supplements.supplement_wada w on w.supplement_id=c.id
      where p.name_en='Caffeine'
      order by c.name_en;
    """,
    "caffeine_parent_inherited": """
      select count(*) from supplements.supplement_wada w
      join supplements.supplements s on s.id=w.supplement_id
      where s.name_en='Caffeine' and s.parent_id is null and w.source='c281:inherited_from_children';
    """,
    "magnesium_parent": """
      select s.name_en, d.guideline_dose, d.upper_limit, d.dose_unit, d.frequency_en, d.duration_studied_en, d.sources->'child_names'
      from supplements.supplements s
      join supplements.supplement_dosing d on d.supplement_id=s.id
      where s.name_en='Magnesium' and s.parent_id is null;
    """,
    "single_form_example": """
      select s.name_en, d.sources->'child_names'
      from supplements.supplements s
      join supplements.supplement_dosing d on d.supplement_id=s.id
      where d.source='c281:inherited_from_children'
      order by jsonb_array_length(d.sources->'child_names'), s.name_en
      limit 5;
    """,
    "wada_conflicts": """
      select canonical_name, current_value, category
      from supplements.wada_conflict_records
      where source='c282:wada_status_category_self_conflict'
      order by canonical_name;
    """,
    "reverse": """
      select count(*)
      from supplements.supplement_wada
      where wada_status='not_prohibited'
        and wada_category ilike '%prohibited%'
        and wada_category not ilike '%not prohibited%';
    """,
    "im_katalog": """
      select count(*) filter (where im_katalog and parent_id is null),
             count(*) filter (where im_katalog and parent_id is not null)
      from supplements.supplements;
    """,
}

parts = []
for name, sql in queries.items():
    parts.append(name + "\n" + psql(sql))

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
