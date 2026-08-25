import datetime as dt
import os
import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf, pnpm

CONTAINER = "supabase_db_LumeOS-Claude-V1"
DB = os.environ.get("PGDATABASE", "postgres")
STAMP = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = Path("backup/vollsicherung")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)


def run(cmd):
    print("$ " + " ".join(cmd))
    print(lauf(cmd))


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", CONTAINER,
        "psql", "-U", "postgres", "-d", DB, "-t", "-A", "-F", "\t",
        "-v", "ON_ERROR_STOP=1", "-c", sql,
    ])


def backup():
    dump_name = f"{STAMP}_c257_live.dump"
    sql_name = f"{STAMP}_c257_live.sql"
    run(["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", DB, "-Fc", "-f", f"/tmp/{dump_name}"])
    run(["docker", "cp", f"{CONTAINER}:/tmp/{dump_name}", str(BACKUP_DIR / dump_name)])
    run(["docker", "exec", CONTAINER, "pg_dump", "-U", "postgres", "-d", DB, "-f", f"/tmp/{sql_name}"])
    run(["docker", "cp", f"{CONTAINER}:/tmp/{sql_name}", str(BACKUP_DIR / sql_name)])
    print(f"BACKUP_DUMP={BACKUP_DIR / dump_name}")
    print(f"BACKUP_SQL={BACKUP_DIR / sql_name}")


def apply_sql():
    source = Path("supabase/_pipeline/13_supplements/140_supplement_nutzertexte.sql")
    remote = f"/tmp/{STAMP}_140_supplement_nutzertexte.sql"
    run(["docker", "cp", str(source), f"{CONTAINER}:{remote}"])
    run(["docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", DB, "-v", "ON_ERROR_STOP=1", "-f", remote])


def counts():
    print("\n## C-257 live counts")
    print(psql("""
select
  (select count(*) from supplements.supplements) as supplements,
  (select count(*) from supplements.supplements where im_katalog) as im_katalog,
  (select count(*) from supplements.supplements where parent_id is not null) as unterformen,
  (select count(*) from supplements.supplement_user_texts) as texte,
  (select count(*) from supplements.supplement_faq) as faq,
  (select count(*) from supplements.supplement_tags) as tags,
  (select count(*) from supplements.supplement_portions) as portions,
  (select count(*) from supplements.supplement_aliases) as aliases;
"""))

    print("\n## 19 Kontrollzahlen")
    print(psql("""
with wanted(schema_name, table_name) as (
  values
    ('nutrition','meal_items'),
    ('nutrition','meals'),
    ('supplements','substance_aliases'),
    ('nutrition','water_logs'),
    ('supplements','intake_logs'),
    ('supplements','substance_catalog_sources'),
    ('supplements','substance_catalog'),
    ('medical','medication_active_substances'),
    ('medical','medication_formulations'),
    ('medical','medication_products'),
    ('goals','body_measurements'),
    ('recovery','checkins'),
    ('recovery','scores'),
    ('medical','lab_result_values'),
    ('supplements','substance_lab_effects'),
    ('training','workout_sets'),
    ('recovery','modality_log'),
    ('nutrition','nutrient_defs'),
    ('nutrition','foods')
)
select schema_name || '.' || table_name,
       case
         when to_regclass(format('%I.%I', schema_name, table_name)) is null then 'FEHLT'
         else (xpath('/row/c/text()', query_to_xml(format('select count(*) c from %I.%I', schema_name, table_name), false, true, '')))[1]::text
       end as rows
from wanted;
"""))

    print("\n## Policy count")
    print(psql("""
select schemaname, count(*)
from pg_policies
where schemaname in ('supplements','nutrition','medical','recovery','training','goals','coach')
group by schemaname
order by schemaname;
"""))


def main():
    backup()
    apply_sql()
    counts()
    os.environ["PGDATABASE"] = DB
    print("\n## Schema")
    print(pnpm("exec", "tsx", "supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts"))


if __name__ == "__main__":
    main()
