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
erledigt: 2026-09-19
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
weiter deren Makrospalten und verlor damit Meal-Supplemente.

| Tag | Supplementzeilen | fehlende Energie | fehlendes Protein |
|---|---:|---:|---:|
| 2026-09-18 | 1 | 120 kcal | 24 g |
| 2026-09-19 | 2 | 260 kcal | 48 g |

Damit waren drei Zeilen betroffen, nicht eine.

## Live eingespielt

`20260919013000_c521_daily_summary_supplement_snapshots.sql` ist am
2026-09-19 nach der vorhandenen Sicherung eingespielt worden. Die Ansicht
liest fuer `food_source = 'supplement'` Makro- und Mikrowerte aus
`supplements.intake_logs.supplier_product_nutrients_snapshot`; alle anderen
Positionen bleiben beim eingefrorenen Snapshot in `nutrition.meal_items`.
Fehlwerte bleiben Fehlwerte und werden weiterhin in `<wert>_missing` gezählt.

## Nachmessung live

| Tag | Tagesenergie | Tagesprotein | Supplementanteil | fehlende Energie/Protein |
|---|---:|---:|---:|---:|
| 2026-09-18 | 2.127,53 kcal | 166,4322 g | 120 kcal / 24 g | 0 / 0 |
| 2026-09-19 | 2.599,05 kcal | 199,31 g | 260 kcal / 48 g | 0 / 0 |

Die Ansicht enthält `supplier_product_nutrients_snapshot`; am 18.09. stimmt
sie mit der Mahlzeitensumme überein. C-466 bleibt richtig getrennt:
Nahrung liefert dort 2.007,53 kcal und 142,4322 g Protein, Meal-Supplemente
120 kcal und 24 g. Ein Tag ohne Supplemente (2026-11-16) blieb unverändert:
2.391,74 kcal und 179,8534 g Protein entsprechen der Rohsumme der
`meal_items`.

Toms Frühstück bleibt in der Meal-Bilanz bei 557,5 kcal und 40,022 g Protein.

## Nachweise

- Sicherung: [20260919012500_c521_vorher.sql](D:/GitHub/LumeOS-Claude-V1/backup/schema/20260919012500_c521_vorher.sql).
- Der C-521-Vertragstest war vor der Korrektur rot und danach in der frischen
  Vollkette grün.
- Die Vollkette erreichte C-521. Ihr Abschluss bleibt ausschließlich am
  bestehenden C-327-Rechtestand rot: `service_role` hat auf
  `supplements.substance_group_memberships` mehr Rechte als erwartet.
- `migration-kette-pruefen` und `migration-datenlogik-pruefen` sind grün.
  Der Dev-Server wurde nicht angefasst.

## Abnahmebedingungen

| Kriterium | Stand |
|---|---|
| A1 | Live: Tagesansicht liest Supplement-Snapshots aus `intake_logs` |
| A2 | Live-Nachmessung stimmt mit der Mahlzeitensumme überein |
| A3 | Alle drei Supplementzeilen zählen |
| A4 | C-466 gemessen und nicht betroffen |
| A5 | Tag ohne Supplement unverändert |
| A6 | Sicherung, Vollkette und Wächter dokumentiert; C-327-Fremdbefund offen |

## Abnahme

**2026-09-19. Live eingespielt und nachgemessen.**
