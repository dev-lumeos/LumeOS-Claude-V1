import csv
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, "tools")
from lauf import lauf

DB = os.environ.get("PGDATABASE", "lumeos_c258_probe")
OUT = Path("backup/c258")
OUT.mkdir(parents=True, exist_ok=True)


def psql(sql: str) -> str:
    return lauf([
        "docker", "exec", "supabase_db_LumeOS-Claude-V1",
        "psql", "-U", "postgres", "-d", DB, "-t", "-A", "-F", "\t",
        "-v", "ON_ERROR_STOP=1", "-c", sql,
    ])


rows_text = psql(r"""
select
  s.id,
  s.slug,
  s.name_en,
  g.code as gruppe,
  c.slug as filter,
  c.name_en as kategorie,
  coalesce(s.form, '') as typ
from supplements.supplements s
left join supplements.supplement_groups g on g.id=s.group_id
left join supplements.supplement_categories c on c.id=s.category_id
where s.source = 'f05_substance_candidate'
  and not s.im_katalog
  and s.parent_id is null
order by gruppe, s.name_en;
""")

rows = []
for line in rows_text.splitlines():
    parts = line.split("\t")
    if parts and parts[0] and not parts[0].startswith("ERROR:"):
        parts = parts + [""] * (7 - len(parts))
        rows.append(dict(zip(["id", "slug", "name", "gruppe", "filter", "kategorie", "typ"], parts[:7])))

# Known brand/trade names or alternative common names mapped to visible substances.
# This is intentionally curated: names like Dianabol and Methandienone do not share
# characters, so a fold-only script cannot discover these links.
brand_map = {
    "anadrol (oxymetholone)": "Oxymetholone",
    "anavar (oxandrolone)": "Oxandrolone",
    "dianabol (methandrostenolone)": "Methandienone",
    "dbol": "Methandienone",
    "tbol": "Turinabol",
    "turinabol": "Turinabol",
    "winstrol": "Stanozolol",
    "winny": "Stanozolol",
    "deca durabolin": "Nandrolone decanoate",
    "deca": "Nandrolone decanoate",
    "tren": "Trenbolone acetate",
    "tren ace": "Trenbolone acetate",
    "test e": "Testosterone enanthate",
    "test c": "Testosterone cypionate",
    "test p": "Testosterone propionate",
    "equipoise": "Boldenone undecylenate",
    "boldenone acetate": "Boldenone undecylenate",
    "boldenone cypionate": "Boldenone undecylenate",
    "mast e": "Drostanolone enanthate",
    "mast p": "Drostanolone propionate",
    "primo": "Metenolone enanthate",
    "primobolan": "Metenolone enanthate",
    "clen": "Clenbuterol",
    "clomid": "Clomiphene",
    "nolvadex": "Tamoxifen",
    "arimidex": "Anastrozole",
    "aromasin": "Exemestane",
    "bromo": "Bromocriptine",
    "bromocriptine (parlodel)": "Bromocriptine",
    "parlodel": "Bromocriptine",
    "hcg": "Human chorionic gonadotropin",
    "gh": "Somatropin",
    "hgh": "Somatropin",
    "mk-677": "Ibutamoren",
    "nutrobal": "Ibutamoren",
    "cardarine": "GW501516",
    "gw501516": "GW501516",
    "ostarine": "Enobosarm",
    "mk-2866": "Enobosarm",
    "ligandrol": "LGD-4033",
    "lgd-4033": "LGD-4033",
    "rad-140": "RAD-140",
    "testolone": "RAD-140",
    "yk-11": "YK-11",
    "sr9009": "SR9009",
    "stenabolic": "SR9009",
    "ipamorelin": "Ipamorelin",
    "cjc-1295": "CJC-1295",
    "cjc-1295 dac": "CJC-1295 DAC",
    "bpc-157": "BPC-157",
    "tb-500": "TB-500",
    "semaglutide": "Semaglutide",
    "retatrutide": "Retatrutide",
    "tirzepatide": "Tirzepatide",
    "bacopa monnieri": "Bacopa monnieri (standardized bacosides)",
    "ashwagandha": "Ashwagandha (KSM-66)",
    "ashwagandha (sensoril)": "Ashwagandha (KSM-66)",
}

combo_patterns = [
    r"\bstack\b", r"\bmix\b", r"\bblend\b", r"\bcombo\b", r"\+",
    r"\bpre[- ]?workout\b", r"\bpct\b.*\bstack\b", r"\btest .* deca\b",
]

visible_names = set(
    line.strip().lower()
    for line in psql("select lower(name_en) from supplements.supplements where im_katalog;").splitlines()
    if line.strip()
)

classified = []
for r in rows:
    n = r["name"].strip()
    key = n.lower()
    if any(re.search(pat, key) for pat in combo_patterns):
        cls = "b_kombination"
        target = ""
        reason = "Name nennt Stack/Mix/Kombination"
    elif key in brand_map:
        cls = "a_handelsname"
        target = brand_map[key]
        reason = "kuratierte Handels-/Trivialnamen-Zuordnung"
    elif key in visible_names:
        cls = "a_handelsname"
        target = n
        reason = "gleichnamiger sichtbarer Eintrag vorhanden"
    else:
        cls = "c_eigener_stoff"
        target = ""
        reason = "keine Kombinationssignale und kein belegter Zielstoff im sichtbaren Katalog"
    classified.append({**r, "klasse": cls, "ziel": target, "grund": reason})

with (OUT / "section0_classification.csv").open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "slug", "name", "gruppe", "filter", "kategorie", "typ", "klasse", "ziel", "grund"])
    writer.writeheader()
    writer.writerows({k: row[k] for k in writer.fieldnames} for row in classified)

counts = {}
for row in classified:
    counts[row["klasse"]] = counts.get(row["klasse"], 0) + 1

by_group = {}
for row in classified:
    by_group[(row["gruppe"], row["klasse"])] = by_group.get((row["gruppe"], row["klasse"]), 0) + 1

print("SECTION0_COUNTS")
for key in sorted(counts):
    print(f"{key}\t{counts[key]}")
print("SECTION0_BY_GROUP")
for key in sorted(by_group):
    print(f"{key[0]}\t{key[1]}\t{by_group[key]}")
print(f"CSV={OUT / 'section0_classification.csv'}")
