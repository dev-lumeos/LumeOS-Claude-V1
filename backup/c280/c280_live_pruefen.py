from pathlib import Path
import sys

sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import lauf

OUT = Path(r"D:\GitHub\LumeOS-Claude-V1\backup\c280\live-direkt.out")
CONTAINER = "supabase_db_LumeOS-Claude-V1"


def psql(sql: str) -> str:
    return lauf([
        "docker",
        "exec",
        CONTAINER,
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-t",
        "-A",
        "-F",
        "\t",
        "-c",
        sql,
    ])


queries = {
    "sicht_zeilen": "select count(*) from supplements.community_anzeige;",
    "datasets": """
        select dataset, count(*)
          from supplements.community_anzeige
         group by dataset
         order by dataset;
    """,
    "columns": """
        select column_name
          from information_schema.columns
         where table_schema='supplements'
           and table_name='community_anzeige'
         order by ordinal_position;
    """,
    "raw_column": """
        select count(*)
          from information_schema.columns
         where table_schema='supplements'
           and table_name='community_anzeige'
           and column_name='raw';
    """,
    "forbidden_columns": """
        select count(*)
          from information_schema.columns
         where table_schema='supplements'
           and table_name='community_anzeige'
           and column_name = any(array['reported_mitigations','components','reported_reason_for_combination','why_these_doses']);
    """,
    "forbidden_viewdef": """
        select count(*)
          from unnest(array['reported_mitigations','components','reported_reason_for_combination','why_these_doses']) f(name)
         where pg_get_viewdef('supplements.community_anzeige'::regclass, true) like '%' || f.name || '%';
    """,
    "nandrolone_deca": """
        select count(*)
          from supplements.community_anzeige
         where dataset='community_side_effect_patterns'
           and side_effect ilike '%Deca%'
           and 'sub_77b68a4df6' = any(substance_ids);
    """,
    "sarm_jama": """
        select count(*)
          from supplements.community_anzeige
         where dataset='community_product_quality_signals'
           and quality_claim ilike '%52%'
           and 'sub_a407e3597e' = any(substance_ids);
    """,
    "vitamin_d3": """
        select count(*)
          from supplements.community_anzeige
         where 'sub_479964998b' = any(substance_ids)
            or 'vitamin-d3' = any(substance_ids);
    """,
    "im_katalog": """
        select
          count(*) filter (where im_katalog and parent_id is null) as top_level_true,
          count(*) filter (where im_katalog and parent_id is not null) as visible_subforms
        from supplements.supplements;
    """,
    "wissen_config": """
        select count(*)
          from information_schema.schemata
         where schema_name='wissen';
    """,
}

parts = []
for name, sql in queries.items():
    parts.append(name + "\n" + psql(sql))

OUT.write_text("\n\n---\n\n".join(parts) + "\n", encoding="utf-8", newline="\n")
print(OUT)
