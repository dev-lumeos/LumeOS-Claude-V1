---
nr: G-245
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-221
entscheidung: E-23
agent: codex
beauftragt: 2026-08-28
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

**Sie brauchen keine Schwelle. Sie sind eine Sortierrichtung.**

    Filter    grob, ueber Suche und vorhandene Filter
    Tag       sortiert das Ergebnis - obenauf, nicht anstelle

**Acht Achsen** (Tom, 2026-08-28): Kalorien, Protein, Kohlenhydrate
und Fett, je hoch und niedrig.

`[read]` **Kalorien sind neu**, es gibt keinen Kalorien-Tag.
`[read]` **Ballaststoffe sind nicht dabei** — `low_fiber` war meine
Annahme, nicht Toms Liste.

`[read]` **Nicht global:** wer *vegan* filtert und nach Protein
absteigend sortiert, bekommt **vegane Lebensmittel nach Protein
geordnet** — nicht alle proteinreichen.

`[read]` **Die vier bestehenden Tags sind Auslobungen** — *,,fettarm"*
und *,,ballaststoffreich"* sind rechtlich definiert, deshalb tragen
sie einen Grenzwert. **`high_carb` ist keine Auslobung; es gibt keine
Quelle, weil es die Frage nicht gibt.**

## Die Sortierung existiert bereits

`[cmd]` **`nutrition.food_search` traegt `p_sort text` und kennt
vier Werte:**

    relevance · protein_desc · kcal_asc · name_asc

`[read]` **Zwei Achteln der Liste sind damit gebaut** —
`protein_desc` ist *Protein hoch*, `kcal_asc` ist *Kalorien niedrig*.
**Und die Benennung ist bereits die richtige Form:**
`<naehrstoff>_<richtung>`, keine Tags, kein Grenzwert.

`[cmd]` **Es fehlen sechs:** `protein_asc`, `kcal_desc`,
`carbs_desc`, `carbs_asc`, `fat_desc`, `fat_asc`.

`[cmd]` **Und der Rueckfall ist still:**

    CASE WHEN p_sort IN ('relevance','protein_desc','kcal_asc',
                         'name_asc')
         THEN p_sort ELSE 'relevance' END

`[read]` **Wer `carbs_desc` schickt, bekommt Relevanz und merkt es
nicht** — dieselbe Klasse wie `unsupported_operator` vor C-313b.

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

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

### Zu tun

**Sechs Sortierwerte ergaenzen:** `protein_asc`, `kcal_desc`,
`carbs_desc`, `carbs_asc`, `fat_desc`, `fat_asc`.

**Und den stillen Rueckfall sichtbar machen.** `[read]` **Wie, ist
deine Entscheidung** — werfen, melden, oder im Ergebnis kennzeichnen.
`[cmd]` **Das Muster steht in C-313b:** ein unbekannter Wert soll
nicht stillschweigend zu etwas anderem werden.

### Was nicht zu tun ist

**Keine Tags anlegen.** `[read]` **Ein Sortierwert erzeugt keine
Zeilen in `food_tags`** — die fuenf Filter-Tags (`high_protein`,
`low_carb`, `low_fat`, `high_fiber`, `high_fat`) bleiben unberuehrt.

**Keine Ballaststoff-Sortierung.** `[cmd]` Toms Liste nennt Kalorien,
Protein, Kohlenhydrate und Fett — **`low_fiber` war meine Annahme.**

**Die Sortierung ersetzt keinen Filter.** `[read]` Sie ordnet, was
Suche und Filter uebrig lassen — **nie den ganzen Katalog anstelle
einer Suche.**

`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Sortierwerte vorher / nachher   4 / 10
    je Wert: erste gegen letzte     bei `carbs_desc` muss die erste
      Zeile                         Zeile mehr Kohlenhydrate haben
    mit Filter kombiniert           z. B. `vegan` + `protein_desc`:
                                    nur vegane Treffer, nach Protein
    unbekannter Wert                nicht mehr still - belegt
    Laufzeit                        ms vorher / nachher, je Wert
    bestehende vier                 unveraendert - belegt

`[read]` **Die zweite Zeile ist die eigentliche Probe, und sie ist so
einfach wie die Sache:** bei `carbs_desc` muss oben mehr stehen als
unten. **Wenn nicht, sortiert etwas anderes.**

`[read]` **Die dritte ist die, die den Unterschied zu einem Filter
belegt.** Ein `protein_desc` ohne Filter zeigt den ganzen Katalog
sortiert; mit `vegan` nur die veganen. **Beides muss gehen.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
`[cmd]` **`food_search` ist gemessen empfindlich** — C-121 fuehrt
*,,die Suche ist langsamer geworden"*, C-191/C-192 *,,`p_user_id`
kostet das Dreifache"*. **Miss die Laufzeit vorher und nachher.**

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
