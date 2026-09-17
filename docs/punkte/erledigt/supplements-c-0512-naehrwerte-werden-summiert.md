---
nr: C-512
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-466
entscheidung: null
erledigt: 2026-09-08
commit: 8a1588bb
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
---

# C-512 - die Naehrwerte werden summiert statt getrennt

## Befund

Aus G-466, Codex, 2026-09-08:

> *,,C-496 mittelt nicht, SUMMIERT aber mehrfache
Etikettzeilen; bei Vegan Liquid Iron Berry entstehen so 55 kcal
und 42 mg Eisen."*

> *,,Ohne Herkunft je Wert ist keine sichere Korrektur
moeglich."*

`[read]` **Ein Produkt mit zwei Etikettspalten bekommt die
ADDIERTEN Werte.**

## Was NICHT die Ursache ist

`[cmd]` **`amount_qualifier` traegt:**

    not_stated      1.591.063
    exact           1.394.584
    less_than          14.598
    greater_than          737

`[read]` **Das sagt, wie GENAU eine Menge ist** ? **nicht,
worauf sie sich bezieht.**

`[cmd]` **C-485 meldete, die Portionsspalte fehle. Claude Code
meldete in G-464, sie sei `amount_qualifier`. Beide falsch.**

## Was zu messen ist

`[read]` **Woher kommen die doppelten Zeilen?**

`[cmd]` **DSLD fuehrt je Produkt eine Naehrwerttafel** ? **ein
Produkt mit zwei Portionsangaben hat zwei Spalten.**

`[read]` **Im Import (C-485) wurden sie untereinander gelegt,
ohne zu vermerken, welche zu welcher Spalte gehoert.**

`[cmd]` **MISS an einem Beispiel: `Vegan Liquid Iron Berry`,
55 kcal und 42 mg Eisen** ? **welche Zeilen ergeben das,
und was steht auf dem Etikett?**

### Drei Wege

**a** ? **Die Herkunft aus DSLD nachtragen.**

`[cmd]` **`docs/ssot/daten/DSLD-full-database-XLSX/`** ? **die
Quelle liegt vor, 268 MB.**

`[read]` **Miss, ob die XLSX eine Spaltenkennung traegt.**

**b** ? **Die ERSTE Zeile je Zutat nehmen.**

`[cmd]` **`reihenfolge` existiert** ? **die erste Spalte ist
meist die Standardportion.**

`[read]` **Einfach, aber geraten.**

**c** ? **Melden, dass der Wert unsicher ist.**

`[read]` **Wie bei Vitamin E (C-500)** ? **eine sichtbare
Luecke statt einer falschen Zahl.**

## Warum es zaehlt

`[cmd]` **`supplier_product_nutrients` deckt 128.157
Produkte** ? **wie viele davon haben doppelte Zeilen?**

`[read]` **Solange das offen ist, sind die Naehrwerte dieser
Produkte falsch** ? **und sie sollen in Mahlzeiten einfliessen
(Toms Whey-Fall).**

## Abnahmebedingungen

    A1  wie viele Produkte haben mehrfache
        Etikettzeilen? Zahl.
    A2  traegt die DSLD-Quelle eine Spaltenkennung?
        Gemessen.
    A3  Vegan Liquid Iron Berry: was steht auf dem
        Etikett, was rechnet LumeOS?
    A4  der gewaehlte Weg, BEGRUENDET.
    A5  wo unsicher: gemeldet, nicht geraten.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

    source_serving_size   2.020.128 Zeilen gefuellt
    Produkte mit mehreren Portionen   3.273
    supplier_product_nutrient_serving_options   da

`[cmd]` **Mary Ruths Vegan Liquid Iron, selbst gemessen:**

     5 mL   ->   6 mg Eisen
    10 mL   ->  12 mg
    15 mL   ->  18 mg

`[read]` **Linear** ? **und vorher waren es 42 mg, die Summe
aller drei.**

### Der Weg war a, und die Quelle traegt es

> *,,Die XLSX enthaelt die Spalte `Serving Size`."*

`[read]` **Ich hatte drei Wege angeboten** ? **die Herkunft
nachtragen, die erste Zeile nehmen, oder melden.**

`[read]` **Er hat den einzigen genommen, der nichts raet** ?
**die Quelle hatte die Antwort.**

### Und die Luecke bleibt sichtbar

> *,,Die Standardsicht zeigt stattdessen
`luecken.multiple_serving_sizes`."*

`[cmd]` **Fuer Mary Ruths: `["10 mL","15 mL","5 mL"]`** ?
**keine kcal-Summe, keine Eisensumme.**

`[read]` **Dieselbe Bauform wie bei Vitamin E (C-500): eine
sichtbare Luecke statt einer falschen Zahl.**

`[read]` **Und wer die Werte braucht, ruft die neue Sicht** ?
**je Portion getrennt.**

### Damit ist Toms Whey-Fall rechenbar

`[cmd]` **1.409.919 Facts-Mengen tragen jetzt Herkunft.**

`[read]` **Ein Produkt mit einer Portion rechnet wie bisher,
eines mit dreien meldet die Wahl** ? **statt zu addieren.**

**Abgenommen.**
