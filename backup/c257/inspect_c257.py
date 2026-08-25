import sys

sys.path.insert(0, "tools")
from lauf import psql


def q(titel: str, sql: str) -> None:
    print(f"\n## {titel}")
    print(psql(sql))


q(
    "supplement columns",
    """
    select column_name, data_type
    from information_schema.columns
    where table_schema='supplements' and table_name='supplements'
    order by ordinal_position;
    """,
)

q(
    "groups",
    """
    select g.code as gruppe, count(*) as n, count(*) filter (where s.im_katalog) as im_katalog
    from supplements.supplements s
    left join supplements.supplement_groups g on g.id=s.group_id
    group by g.code
    order by g.code;
    """,
)

q(
    "parent candidates",
    """
    with terms(term) as (
      values
      ('magnesium'), ('whey'), ('zinc'), ('caffeine'), ('calcium'), ('iron'),
      ('vitamin b12'), ('collagen'), ('lion'), ('tongkat'), ('vitamin a'),
      ('vitamin b6'), ('vitamin c'), ('vitamin d3'), ('vitamin e')
    )
    select s.id, s.slug, s.name_en, s.name_de, s.source, g.code as gruppe,
           c.slug as filter, c.name_en as kategorie, s.form, s.evidence_grade,
           s.im_katalog
    from supplements.supplements s
    left join supplements.supplement_groups g on g.id=s.group_id
    left join supplements.supplement_categories c on c.id=s.category_id
    join terms t on lower(coalesce(s.name_en,'') || ' ' || coalesce(s.name_de,'') || ' ' || s.slug) like '%' || t.term || '%'
    order by t.term, s.name_en, s.slug;
    """,
)

q(
    "local catalog names",
    """
    select s.slug, s.name_en, c.slug as filter, s.im_katalog
    from supplements.supplements s
    left join supplements.supplement_categories c on c.id=s.category_id
    where s.source='lumeos_supplement_catalog'
    order by s.name_en;
    """,
)

q(
    "alias duplicates",
    """
    with folded as (
      select supplement_id,
             regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g') as folded,
             count(*) as n
      from supplements.supplement_aliases
      group by supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g')
    )
    select count(*) filter (where n > 1) as duplicate_keys,
           coalesce(sum(n - 1) filter (where n > 1), 0) as excess_rows
    from folded;
    """,
)

q(
    "dosing non-empty",
    """
    select g.code as gruppe,
           count(*) filter (where d.studied_dose_ranges is not null and d.studied_dose_ranges <> '[]'::jsonb) as studied_non_empty,
           count(*) filter (where d.upper_limit is not null and btrim(d.upper_limit) <> '') as upper_limit,
           count(*) filter (where d.usage_hint_en is not null and btrim(d.usage_hint_en) <> '') as usage_hint
    from supplements.supplements s
    left join supplements.supplement_groups g on g.id=s.group_id
    left join supplements.supplement_dosing d on d.supplement_id=s.id
    where g.code in ('supplement','peptide','enhanced')
    group by g.code
    order by g.code;
    """,
)
