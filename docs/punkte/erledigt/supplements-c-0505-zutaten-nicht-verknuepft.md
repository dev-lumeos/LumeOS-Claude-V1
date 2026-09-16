---
nr: C-505
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-496
entscheidung: null
erledigt: 2026-09-08
commit: 5e970b18
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
  gemappt: 302293
  gesamt: 3000982
---

# C-505 - die Mehrheit der Zutaten ist nicht verknuepft

## Toms Befund

Tom, 2026-09-08:

> dann hat es in details immer noch die mehrheit
> naehrwerte/wirkstoffe/hilfsstoffe, die nicht verknuepft sind.
> da hatten wir auch schon einen auftrag, der das vereinheit-
> lichen sollte und matched auf unsere makros und mikros

`[cmd]` **Der Auftrag war C-496** ? **er hat 39 Namen gemappt.**

## Gemessen

    product_contents           3.000.982 Zeilen
      mit supplement_id          302.293   (10 %)
      ohne                     2.698.689   (90 %)

    supplier_product_nutrients  128.157 Produkte
      von 214.780               (60 %)

    supplier_product_nutrient_name_mappings   39

`[read]` **C-496 hat die MAKROS gemappt** ? **`Calories`,
`Protein`, `Total Fat` und 36 weitere.**

`[read]` **Was fehlt, sind die WIRKSTOFFE und HILFSSTOFFE.**

## Was das in der Tafel bedeutet

`[cmd]` **Dr. Mercola: 1 von 18 Zutaten kennt LumeOS.**
`[cmd]` **N.O. Black Powder: 5 von 54.**

`[read]` **Der Nutzer sieht *,,nicht im Katalog"* bei fast
allem.**

## Warum 39 nicht reichen

`[cmd]` **Die haeufigsten Zutaten, die NICHT gemappt sind** ?
**MISS sie.**

`[read]` **Vermutlich: `Magnesium Stearate` (56.903),
`Microcrystalline Cellulose`, `Silicon Dioxide`, `Gelatin`,
`Rice Flour` ? Hilfsstoffe.**

`[read]` **Und Wirkstoffe: `Caffeine`, `Creatine`, `L-Arginine`,
`Ashwagandha`, `Curcumin`.**

`[cmd]` **`supplements.supplements` hat 596 Substanzen und
`supplement_aliases` 2.843 Aliase** ? **wie viele der 14.677
eindeutigen Zutaten treffen darauf?**

## Die drei Klassen

    NAEHRWERT   Calories, Protein, Vitamin C
                -> nutrient_code (C-496, gebaut)
    WIRKSTOFF   Creatine, Caffeine, Ashwagandha
                -> supplement_id (596 Substanzen)
    HILFSSTOFF  Magnesium Stearate, Silicon Dioxide
                -> eigene Klasse, KEIN Wirkstoff

`[cmd]` **`ist_wirkstoff` existiert in `product_contents`** ?
**miss, was drinsteht.**

`[read]` **Ein Hilfsstoff gehoert nicht in die
Naehrstoffbilanz** ? **aber er gehoert erkannt, damit die
Allergiepruefung ihn findet.**

## Abnahmebedingungen

    A1  die haeufigsten nicht gemappten Zutaten.
        TABELLE, nach Produktzahl.
    A2  je Klasse: wie viele treffen auf supplements
        oder supplement_aliases?
    A3  ist_wirkstoff: was steht heute drin?
    A4  wie viele Zeilen sind NACHHER verknuepft?
        Vorher 302.293.
    A5  Dr. Mercola und N.O. Black Powder: wie viele
        Zutaten kennt LumeOS nachher?
    A6  KEINE Zuordnung raten -- was nicht trifft,
        bleibt Kandidat.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Bericht

`[cmd]` `ist_wirkstoff` stammt eindeutig aus dem DSLD-Import: Facts werden
mit `true`, die getrennte DSLD-Liste `Other Ingredients` mit `false` geladen.
Im Bestand stehen 2.020.128 true und 980.854 false; die Spalte ist daher eine
Quellenklassifikation, kein frei erfundener Stoffname.

`[cmd]` `supplier_product_content_catalog` liefert jede Zeile als
`naehrwert`, `wirkstoff`, `hilfsstoff` oder `kandidat`. Naehrwerte folgen nur
den 39 C-496-Labelmappings; Hilfsstoffe folgen den DSLD-Other-Ingredients und
fliessen nicht in die Naehrwertsicht ein. Nur aktive Facts mit exakt einem
normalisierten Namen oder Alias aus dem vorhandenen 596/2.843-Katalog erhalten
einen nachgezogenen `supplement_id`; Mehrdeutiges bleibt Kandidat.

`[cmd]` Verknuepfte Inhaltszeilen: 302.293 vorher, 305.080 nachher. Die
Pipeline hat 2.785 eindeutige, belegte Nachzuege geschrieben. Klassen danach:
748.687 Naehrwerte, 171.422 Wirkstoffe, 945.316 Hilfsstoffe und 1.135.557
Kandidaten. Die Kandidatenliste beginnt mit Pantothenic Acid (19.793 Produkte),
Selenium (16.857), Chromium (16.381), Calories from Fat (14.782) und
Cholesterol (13.761) — keine davon wurde geraten.

`[cmd]` Gegenprobe in den Details: Dr.-Mercola-ID
`7bd745e2-6822-42d5-bbd9-8e5820b7e36a` kennt 15/18 Zeilen; N.O. Black Powder
kennt 23/54. Damit sind Hilfsstoffe sichtbar erkannt statt faelschlich als
Wirkstoffe zu erscheinen; offene aktive Facts bleiben sichtbar Kandidat.

`[cmd]` Sicherung und Vollkette wie C-504; C-505-Vertragstest gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **305.080 von 3.000.982 verknuepft** ? **vorher
302.293.**

`[read]` **2.787 dazu** ? **er meldet 2.785 eindeutige exakte
Treffer.**

### Die Zurueckhaltung ist der Kern

> *,,Nur 2.785 eindeutige, EXAKTE Katalogtreffer wurden
nachverknuepft; keine Zuordnung geraten."*

`[read]` **Von 2,7 Mio offenen Zeilen hat er 2.785 belegt** ?
**ein Zehntel Prozent.**

`[read]` **Die Auflage war:** *,,KEINE Zuordnung raten ? was
nicht trifft, bleibt Kandidat."*

`[cmd]` **Und die Klassifikation steht:** **Naehrwert,
Wirkstoff, Hilfsstoff, offener Kandidat.**

`[read]` **Damit ist Toms Befund BENANNT, aber nicht
geloest** ? **die Mehrheit bleibt unverknuepft, und das ist
ehrlich.**

`[read]` **Was fehlt, ist eine QUELLE fuer die uebrigen** ?
**596 Substanzen reichen fuer 14.677 eindeutige Zutaten
nicht.**

`[cmd]` **Als C-509.**

**Abgenommen.**
