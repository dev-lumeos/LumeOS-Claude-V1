---
nr: E-23
getroffen: 2026-08-28
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-245, G-221, E-22]
modul: nutrition
---

# E-23 — die neuen Makro-Tags sortieren, sie filtern nicht

## Frage

`[cmd]` Fuer `low_protein`, `high_carb` und `low_fiber` fand Codex in
G-221 **keine belastbare Schwelle.** Ich hatte daraus eine Frage nach
Grenzwerten gemacht.

## Entscheidung

Tom, 2026-08-28: *,,was einfacheres gibt es ja wohl nicht oder? der
suchfilter filtert schon grob, dann fuehrt dieser tag die sortierung
der resultate aus sprich oben sort high to low for highcarb"*.

**Die neuen Tags brauchen keine Schwelle. Sie sind eine
Sortierrichtung.**

    Filter    grob, ueber die vorhandene Suche
    Tag       sortiert das Ergebnis - high_carb absteigend nach CHO

## Praezisierung, 2026-08-28

Tom: *,,das gilt fuer high und low sprich
kalorien/protein/carbs/fat und darf nicht global verwendet werden es
muss auf alle anderen filter ontop kommen"*.

**Acht Sortierachsen, vier Naehrstoffe in zwei Richtungen:**

    Kalorien        hoch / niedrig
    Protein         hoch / niedrig
    Kohlenhydrate   hoch / niedrig
    Fett            hoch / niedrig

`[read]` **Kalorien sind neu** — es gibt heute keinen Kalorien-Tag.
`[read]` **Ballaststoffe sind nicht dabei.** Ich hatte `low_fiber`
angenommen; es steht nicht in der Liste.

### Nicht global, sondern obenauf

`[read]` **Die Sortierung ersetzt keinen Filter, sie ordnet dessen
Ergebnis.** Wer *vegan* filtert und dann nach Protein absteigend
sortiert, bekommt **vegane Lebensmittel nach Protein geordnet** —
nicht alle proteinreichen.

`[read]` **,,Darf nicht global verwendet werden"** heisst: die
Sortierung wirkt nie auf den ganzen Katalog anstelle einer Suche,
sondern immer auf das, was die Suche und die Filter uebrig lassen.

### Was das fuer `high_protein` bedeutet

`[cmd]` **`high_protein` gibt es bereits als Filter-Tag** mit 1.400
Zuordnungen und der Regel `>= 20 g PROT625`.

`[read]` **Damit traegt der Begriff zwei Bedeutungen:** eine
Auslobung, die filtert, und eine Sortierrichtung, die ordnet.
**Ob sie denselben Namen tragen duerfen, ist eine Bauentscheidung**
— und wenn nicht, braucht die Sortierung eigene Bezeichner.

## Warum meine Frage falsch war

`[read]` **Die vier bestehenden Tags sind Auslobungen.** *,,Fettarm"*
und *,,ballaststoffreich"* sind rechtlich definierte Begriffe mit
Grenzwert — deshalb tragen sie einen, und deshalb liess sich
`high_fat` mit 17,5 g/100 g belegen.

`[read]` **`high_carb` ist keine Auslobung.** Niemand bewirbt ein
Lebensmittel als kohlenhydratreich. **Es gibt keine Quelle, weil es
die Frage nicht gibt.**

`[read]` **Codex' Messung war richtig, meine Frage war es nicht.**

## Was daraus folgt

`[read]` **Ein Sortier-Tag braucht keine Zuordnung je Lebensmittel.**
`[cmd]` `high_fat` mit 1.233 Zuordnungen ist ein Filter-Tag; ein
Sortier-Tag ist eine Abfrageoption und erzeugt keine Zeilen in
`food_tags`.

`[read]` **Damit stellt sich die Frage nach dem Datenmodell:**
`tag_definitions.macro_rule` traegt heute `{op, value,
nutrient_code}`. **Ein Sortier-Tag braeuchte Naehrstoff und
Richtung, keinen Wert** — oder er gehoert gar nicht in
`tag_definitions`, sondern in die Suche.

`[read]` **Das ist eine Bauentscheidung, keine Produktfrage.**

## Unberuehrt

**Die fuenf Filter-Tags bleiben, wie sie sind** — `high_protein`,
`low_carb`, `low_fat`, `high_fiber`, `high_fat`. **Sie loben aus, sie
sortieren nicht.**
