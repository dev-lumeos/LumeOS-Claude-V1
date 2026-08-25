"""C-252: die Katalogliste gegen die laufende Datenbank zaehlen.

`[read]` Geprueft wird die SQL-Wirkung der Abfrage, die
`ladeSubstanzListe` stellt — mit und ohne `im_katalog`-Filter, plus die
namentliche Gegenprobe. Ueber `psql`, nicht ueber den Supabase-Client:
der braeuchte den Service-Key aus `.env.local`, und den zu lesen sperrt
der Hook zu Recht.
"""
import sys
sys.path.insert(0, r"D:\GitHub\LumeOS-Claude-V1\tools")
from lauf import psql

print("=== Die Zahl, um die es geht ===")
print(psql("""select
  count(*) filter (where im_katalog) as mit_filter,
  count(*) as ohne_filter
  from supplements.supplements;"""))
print("   erwartet: mit_filter 290 · ohne_filter 566")

print()
print("=== Gegenprobe, namentlich ===")
print(psql("""select slug, name_en, im_katalog,
    coalesce(evidence_grade,'(kein Grad)') as grad,
    case when coalesce(description_en,'')='' then '(keine)' else 'vorhanden' end as beschreibung
  from supplements.supplements
  where slug in ('sub_9f9bb8c160','f05_7_keto_dhea')
  order by im_katalog desc;"""))
print("   sub_9f9bb8c160 muss erscheinen (im_katalog t)")
print("   f05_7_keto_dhea darf nicht erscheinen (im_katalog f)")

print()
print("=== Traegt jeder der 290 die Felder, die die Liste zeigt? ===")
print(psql("""select
  count(*) as gesamt,
  count(*) filter (where coalesce(name_de, name_en, '')='') as ohne_namen,
  count(*) filter (where coalesce(description_de, description_en, '')='') as ohne_beschreibung,
  count(*) filter (where group_id is null) as ohne_gruppe,
  count(*) filter (where category_id is null) as ohne_kategorie,
  count(*) filter (where evidence_grade is null) as ohne_grad
  from supplements.supplements where im_katalog;"""))
print("   erwartet: 290 und danach ueberall 0")

print()
print("=== Die Einbettung: kommt Kategorie und Gruppe an? ===")
print(psql("""select s.slug,
    coalesce(nullif(s.name_de,''), s.name_en) as name,
    coalesce(nullif(k.name_de,''), k.name_en) as kategorie,
    g.code as gruppe, s.evidence_grade as grad
  from supplements.supplements s
  left join supplements.supplement_categories k on k.id = s.category_id
  left join supplements.supplement_groups g on g.id = s.group_id
  where s.slug = 'sub_9f9bb8c160';"""))

print()
print("=== Die Gruppen, wie die Liste sie zaehlt (nur die 290) ===")
print(psql("""select g.code, count(*)
  from supplements.supplements s
  join supplements.supplement_groups g on g.id = s.group_id
  where s.im_katalog group by 1 order by 2 desc;"""))
