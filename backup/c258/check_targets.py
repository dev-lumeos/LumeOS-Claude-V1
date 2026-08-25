import csv
import os
import sys

sys.path.insert(0, "tools")
from lauf import lauf

db = os.environ.get("PGDATABASE", "lumeos_c258_probe")

targets = sorted({r["ziel"] for r in csv.DictReader(open("backup/c258/section0_classification.csv", encoding="utf-8")) if r["klasse"] == "a_handelsname" and r["ziel"]})
values = ",".join("('" + t.replace("'", "''").lower() + "')" for t in targets)
sql = f"""
with targets(name) as (values {values})
select t.name, coalesce(s.name_en, 'FEHLT') as visible_name, coalesce(s.slug, '') as slug
from targets t
left join supplements.supplements s on lower(s.name_en)=t.name and s.im_katalog
order by t.name;
"""
print(lauf(["docker","exec","supabase_db_LumeOS-Claude-V1","psql","-U","postgres","-d",db,"-t","-A","-F","\t","-v","ON_ERROR_STOP=1","-c",sql]))
