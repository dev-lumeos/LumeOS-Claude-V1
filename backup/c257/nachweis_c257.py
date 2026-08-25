import json
import os
import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf

DB = os.environ.get("PGDATABASE", "lumeos_c257_probe")
OUT = Path("backup/c257")
OUT.mkdir(parents=True, exist_ok=True)


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", "supabase_db_LumeOS-Claude-V1",
        "psql", "-U", "postgres", "-d", DB, "-t", "-A", "-F", "\t",
        "-v", "ON_ERROR_STOP=1", "-c", sql,
    ])


def q(name: str, sql: str) -> str:
    text = psql(sql)
    print(f"\n## {name}\n{text}")
    return text


q("top counts", """
select
  (select count(*) from supplements.supplements) as supplements,
  (select count(*) from supplements.supplements where im_katalog) as im_katalog,
  (select count(*) from supplements.supplements where parent_id is not null) as unterformen,
  (select count(*) from supplements.supplement_user_texts) as texte,
  (select count(*) from supplements.supplement_faq) as faq,
  (select count(*) from supplements.supplement_tags) as tags,
  (select count(*) from supplements.supplement_portions) as portions,
  (select count(*) from supplements.supplement_aliases) as aliases;
""")

q("text groups", """
select g.code, count(*)
from supplements.supplement_user_texts t
join supplements.supplements s on s.id=t.supplement_id
join supplements.supplement_groups g on g.id=s.group_id
group by g.code
order by g.code;
""")

q("catalog groups", """
select g.code, count(*) filter (where s.im_katalog) as im_katalog, count(*) as total
from supplements.supplements s
join supplements.supplement_groups g on g.id=s.group_id
group by g.code
order by g.code;
""")

q("parent mapping", """
select p.slug, p.name_en, count(c.id) as formen
from supplements.supplements p
join supplements.supplements c on c.parent_id=p.id
group by p.slug, p.name_en
order by p.slug;
""")

q("length and jargon", """
select
  count(*) filter (where char_length(kurz_was_de) > 140 or char_length(kurz_was_en) > 140) as too_long,
  count(*) filter (where kurz_was_de ~* '(MPS|Bioverfuegbarkeit|Halbwertszeit|Rezeptoragonist|hepatisch)'
                    or kurz_was_en ~* '(MPS|bioavailability|half-life|receptor agonist|hepatic)') as jargon
from supplements.supplement_user_texts;
""")

q("alias duplicate extras", """
with folded as (
  select supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g') as folded, count(*) as n
  from supplements.supplement_aliases
  group by supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g')
)
select coalesce(sum(n - 1) filter (where n > 1), 0) from folded;
""")

q("unparsed dose ranges", """
with ranges as (
  select s.slug, s.name_en, value as studied
  from supplements.supplements s
  join supplements.supplement_dosing d on d.supplement_id=s.id
  cross join lateral jsonb_array_elements_text(coalesce(d.studied_dose_ranges,'[]'::jsonb)) x(value)
  where btrim(value) <> ''
), firsts as (
  select distinct on (slug) slug, name_en, studied
  from ranges
  order by slug, studied
)
select slug, name_en, studied
from firsts
where regexp_match(studied, '([0-9]+(?:[.,][0-9]+)?)\\s*(mg|mcg|ug|µg|g|IU|iu)') is null
order by slug;
""")

q("generated update negative", """
do $$
begin
  update supplements.supplements
  set im_katalog = true
  where id = (select id from supplements.supplements where not im_katalog limit 1);
  raise exception 'NEGATIVPROBE_FEHLT: im_katalog war setzbar';
exception
  when generated_always then
    raise notice 'NEGATIVPROBE_OK: im_katalog ist generiert';
  when others then
    if sqlstate = '428C9' then
      raise notice 'NEGATIVPROBE_OK: im_katalog ist generiert';
    else
      raise;
    end if;
end $$;
""")

q("alias duplicate negative", """
begin;
insert into supplements.supplement_aliases (id, supplement_id, alias, locale, source)
select gen_random_uuid(), supplement_id, alias, locale, 'c257_negative_probe'
from supplements.supplement_aliases
limit 1;
with folded as (
  select supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g') as folded, count(*) as n
  from supplements.supplement_aliases
  group by supplement_id, regexp_replace(lower(alias), '[^a-z0-9]+', '', 'g')
)
select case when coalesce(sum(n - 1) filter (where n > 1), 0) > 0
  then 'NEGATIVPROBE_OK' else 'NEGATIVPROBE_FEHLT' end
from folded;
rollback;
""")

for group in ("supplement", "peptide", "enhanced"):
    sql = f"""
    select jsonb_pretty(jsonb_agg(to_jsonb(x) order by x.name_en))
    from (
      select s.slug, s.name_en, t.kurz_was_de, t.wofuer_de, t.was_bringt_es_de
      from supplements.supplement_user_texts t
      join supplements.supplements s on s.id=t.supplement_id
      join supplements.supplement_groups g on g.id=s.group_id
      where g.code='{group}'
    ) x;
    """
    data = psql(sql)
    (OUT / f"{group}_texte.json").write_text(data + "\n", encoding="utf-8", newline="\n")
    print(f"Snapshot geschrieben: {OUT / (group + '_texte.json')}")
