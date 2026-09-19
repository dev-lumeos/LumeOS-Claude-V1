---
nr: C-521
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519]
kind_von: C-519
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a26c2c4b
beruehrt:
  tabellen: [nutrition.daily_summary]
zahlen:
  gemessen: 2026-09-19
---

# C-521 - die Tagessumme uebersieht die Supplemente

## Befund

Nach C-519 sind die vier alten Produktsnapshot-Spalten in
`nutrition.meal_items` absichtlich leer. `nutrition.daily_summary` summierte
weiter die dortigen Makrospalten und verlor dadurch alle Meal-Supplemente.

Live gemessen bei `dev@lumeos.app`:

| Tag | Supplementzeilen | verlorene Energie | verlorenes Protein |
|---|---:|---:|---:|
| 2026-09-18 | 1 | 120 kcal | 24 g |
| 2026-09-19 | 2 | 260 kcal | 48 g |

Damit sind drei Zeilen betroffen, nicht eine.

## Gebaut, noch nicht live eingespielt

`20260919013000_c521_daily_summary_supplement_snapshots.sql` ersetzt die
Quelle der Tagesansicht nach C-519: fuer `food_source='supplement'` kommen
Makro- und Mikrowerte aus
`intake_logs.supplier_product_nutrients_snapshot`; alle anderen Positionen
bleiben bei ihrem eingefrorenen `meal_items`-Snapshot. Fehlwerte bleiben
Fehlwerte und werden weiterhin in `<wert>_missing` gezaehlt.

Der Schritt steht nach C-519 in `supabase/_pipeline/kette.json`. Der fruehe
Basis-Schritt 053 blieb absichtlich unveraendert, weil `intake_logs` zu diesem
Zeitpunkt der Vollkette noch nicht existiert.

## Nachweise

- Sicherung vor der Arbeit:
  [`20260919012500_c521_vorher.sql`](D:/GitHub/LumeOS-Claude-V1/backup/schema/20260919012500_c521_vorher.sql).
- Der neue Vertragstest war vor der Korrektur rot: `2.007,53` statt
  `2.367,53 kcal`, drei fehlende Energie- und Proteinwerte.
- Danach gruen: drei Whey-Logs plus Nahrung ergeben `2.367,53 kcal`,
  `214,4322 g Protein`, vier Positionen und keine fehlenden Werte.
- Ein Tag ohne Supplement bleibt `437,5 kcal`, `16,022 g Protein` und eine
  Position.
- C-466 ist nicht betroffen: `nutrient_intake_source_breakdown_for_day`
  liefert fuer den 18.09. Nahrung `2.007,53 kcal/142,4322 g` und Meal-Whey
  `120 kcal/24 g` getrennt.
- Toms Fruehstueck bleibt in der Meal-Bilanz `557,5 kcal` und `40,022 g
  Protein`.

## Vollkette und Waechter

Die frische Vollkette `lumeos_c521_vollkette` erreichte C-521 und fuehrte den
Schritt gruen aus. Der C-521-Vertragstest ist dort gruen. Der Abschluss bleibt
am bestehenden, fachfremden C-327-Sollstand rot: `service_role` hat auf
`supplements.substance_group_memberships` mehr Rechte als erwartet.

`migration-kette-pruefen` und `migration-datenlogik-pruefen` sind gruen.
Der Punktelauf hat 25/25 Sollbefunde und ist nur wegen dieses fehlgeschlagenen
Tagesketten-Nachweises rot. Der Dev-Server wurde nicht angefasst.

## Abnahmebedingungen

| Kriterium | Stand |
|---|---|
| A1 | gebaut: Tagesansicht liest Supplement-Snapshots aus `intake_logs` |
| A2 | im Vertragstest belegt; Live-Einspielung steht aus |
| A3 | drei Zeilen im Vertragstest und live gemessene drei Zeilen |
| A4 | C-466 gemessen, nicht betroffen |
| A5 | Tag ohne Supplement unveraendert im Vertragstest |
| A6 | Sicherung, Vollkette und Waechter gelaufen; C-327-Fremdbefund dokumentiert |

## Abnahme

**2026-09-08, Orchestrator. Gebaut ? NICHT live.**

`[cmd]` **Selbst gemessen: `daily_summary` liest noch
`sum(mi.enercc)`.**

`[cmd]` **Was vorliegt:**
`migrations/20260919013000_c521_daily_summary_supplement_snapshots`,
`_validierung/nutrition-c521-daily-summary-supplements`.

### Drei verlorene Zeilen, und die Summe ist groesser

> *,,Drei verlorene Zeilen belegt: 120 kcal/24 g am 18.09.
sowie 260 kcal/48 g am 19.09."*

`[read]` **Ich hatte drei Zeilen gemessen, er hat sie
datiert** ? **380 kcal und 72 g Protein fehlten insgesamt.**

`[cmd]` **Vertragstest: drei Whey-Logs ergeben 2.367,53 kcal
und 214,4322 g Protein.**

### Und A4 hat er beantwortet

> *,,C-466 ist nicht betroffen; seine Quellbilanz rechnet
Meal-Supplemente bereits korrekt."*

`[read]` **Eine Sicht war falsch, die andere nicht** ?
**gemessen, nicht angenommen.**

`[cmd]` **Die Vollkette lief 250 Schritte und endet am
bekannten C-327-Rechtestand** ? **fremd, nicht von C-521.**

**Abgenommen. Einspielen steht aus.**
