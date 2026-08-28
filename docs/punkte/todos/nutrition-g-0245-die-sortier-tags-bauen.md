---
nr: G-245
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-221
entscheidung: E-23
beruehrt:
  tabellen: [nutrition.tag_definitions]
zahlen:
  gemessen: 2026-08-28
  gebaute_tags: 14
---

# G-245 — die Sortier-Tags bauen

## Befund

`[cmd]` Fuer `low_protein`, `high_carb` und `low_fiber` fand Codex in
G-221 **keine belastbare Schwelle** — und daraus wurde eine Frage nach
Grenzwerten, die falsch gestellt war.

## Entschieden: E-23

Tom, 2026-08-28: *,,der suchfilter filtert schon grob, dann fuehrt
dieser tag die sortierung der resultate aus sprich oben sort high to
low for highcarb"*.

**Die drei brauchen keine Schwelle. Sie sind eine Sortierrichtung.**

    Filter    grob, ueber die vorhandene Suche
    Tag       sortiert das Ergebnis - high_carb absteigend nach CHO

`[read]` **Die vier bestehenden Tags sind Auslobungen** — *,,fettarm"*
und *,,ballaststoffreich"* sind rechtlich definiert, deshalb tragen
sie einen Grenzwert. **`high_carb` ist keine Auslobung; es gibt keine
Quelle, weil es die Frage nicht gibt.**

## Was zu bauen ist

**Die Sortierung, nicht die Zuordnung.** `[read]` **Ein Sortier-Tag
erzeugt keine Zeilen in `food_tags`** — es ist eine Abfrageoption.

`[cmd]` **`tag_definitions.macro_rule` traegt heute `{op, value,
nutrient_code}`.** `[read]` **Ein Sortier-Tag braucht Naehrstoff und
Richtung, keinen Wert** — oder er gehoert nicht in
`tag_definitions`, sondern in die Suche. **Das ist die
Bauentscheidung, und sie gehoert gemessen, nicht geraten:** wie
sortiert `food_search` heute?

`[read]` **Und die Gegenprobe ist einfach:** bei `high_carb` muss die
erste Zeile mehr Kohlenhydrate haben als die letzte. **Wenn nicht,
sortiert etwas anderes.**

## Unberuehrt

**Die fuenf Filter-Tags bleiben, wie sie sind** — `high_protein`,
`low_carb`, `low_fat`, `high_fiber`, `high_fat`.
