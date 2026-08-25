import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import psql


Path("backup/c250").mkdir(parents=True, exist_ok=True)

queries = {
    "supplement-columns.log": """
        select table_name || '|' || column_name || '|' || data_type
        from information_schema.columns
        where table_schema = 'supplements'
          and table_name in (
            'supplements', 'supplement_dosing', 'supplement_categories',
            'supplement_groups', 'stack_items', 'user_stacks',
            'supplement_evidence'
          )
        order by table_name, ordinal_position
    """,
    "nutrition-shopping-columns.log": """
        select table_name || '|' || column_name || '|' || data_type
        from information_schema.columns
        where table_schema = 'nutrition'
          and table_name in ('shopping_lists', 'shopping_list_items', 'foods')
        order by table_name, ordinal_position
    """,
    "supplement-fks.log": """
        select conname || '|' || conrelid::regclass::text || '|' ||
               confrelid::regclass::text || '|' || pg_get_constraintdef(oid)
        from pg_constraint
        where contype = 'f'
          and conrelid in (
            'supplements.stack_items'::regclass,
            'supplements.supplements'::regclass,
            'supplements.supplement_dosing'::regclass,
            'nutrition.shopping_lists'::regclass,
            'nutrition.shopping_list_items'::regclass
          )
        order by conrelid::regclass::text, conname
    """,
    "supplement-lab-effects-columns.log": """
        select column_name || '|' || data_type
        from information_schema.columns
        where table_schema = 'supplements'
          and table_name = 'supplement_lab_effects'
        order by ordinal_position
    """,
    "users.log": """
        select id || '|' || email
        from auth.users
        where email in ('test-user@lumeos.local','dev@lumeos.app','tom.seed@example.com')
        order by email
    """,
    "testuser-shopping-before.log": """
        with u as (
          select id from auth.users where email = 'test-user@lumeos.local'
        )
        select 'shopping_lists|' || count(*)
        from nutrition.shopping_lists, u
        where user_id = u.id
        union all
        select 'shopping_list_items|' || count(*)
        from nutrition.shopping_list_items, u
        where user_id = u.id
    """,
    "testuser-stack-before.log": """
        with u as (
          select id from auth.users where email = 'test-user@lumeos.local'
        ), st as (
          select us.id, us.name
          from supplements.user_stacks us
          join u on us.user_id = u.id
          where us.is_active
        )
        select 'stack|' || st.name || '|' || count(si.*) || '|' ||
               count(si.supplement_id) || '|' || count(si.custom_name)
        from st
        left join supplements.stack_items si on si.stack_id = st.id and si.is_active
        group by st.name
    """,
}

for name, sql in queries.items():
    out = psql(sql)
    Path("backup/c250", name).write_text(out + "\n", encoding="utf-8", newline="\n")
    print(f"backup/c250/{name}")
