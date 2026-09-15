---
nr: G-458
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-472
entscheidung: null
beruehrt:
  dateien:
    - tools/migration-datenlogik-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
  soll: 44
  ist: 53
---

# G-458 - neun Migrationen schreiben Daten

## Befund

`[cmd]` **`migration-datenlogik-pruefen.mjs`: Soll 44, Ist 53.**

`[cmd]` **Die neun neuen, gemessen:**

    c496_supplier_product_nutrients      INSERT
    c497_supplier_product_preferences    DELETE, INSERT
    c498_global_allergies                INSERT x3
    c499_deactivate_off_market           UPDATE
    c500_vitamin_e_form_evidence         INSERT x2

`[read]` **Alle aus den Punkten von heute** ? **C-496 bis
C-500.**

## Die Regel

`[cmd]` **`supabase/README.md`, D-17:** **eine Migration darf
keine Katalogdaten schreiben.**

`[cmd]` **C-472 hat 44 als begruendeten Sollstand gesetzt** ?
**historische Faelle, einzeln belegt.**

`[read]` **Neun neue sind dazugekommen, ohne Begruendung.**

## Mein Anteil

`[read]` **Ich habe C-496 bis C-500 abgenommen, OHNE den
Waechter zu pruefen.**

`[cmd]` **Er stand in den Abnahmebedingungen** (*,,Punktelauf"*)
? **aber `migration-datenlogik-pruefen.mjs` ist ein anderer
Lauf.**

## Was zu tun ist

`[read]` **Je der neun messen: echte Verletzung oder
Fehlerkennung?**

`[cmd]` **WARNUNG: ich habe selbst schon 13 Treffer gezaehlt,
die alle Kommentare und `ON DELETE`-Klauseln waren.**

`[read]` **Schluesselwoerter zaehlen ist nicht Anweisungen
zaehlen.**

### Und dann eine Entscheidung

**a** ? **Die Daten in `_pipeline/` umziehen.**

`[read]` **Richtig nach D-17, aber neun Migrationen sind
schon eingespielt.**

**b** ? **In den Sollstand, je mit Grund.**

`[read]` **Wie C-472 es fuer die 44 gemacht hat.**

`[cmd]` **Manche sind vermutlich echte Kataloge** ?
`c500_vitamin_e_form_evidence` **traegt 1.433 belegte
Formen.**

`[read]` **Die gehoeren in die Kette, nicht in eine
Migration.**

## Abnahmebedingungen

    A1  je der neun: echte Verletzung oder
        Fehlerkennung? TABELLE.
    A2  je echter Verletzung: umgezogen oder mit
        Grund im Sollstand.
    A3  KEINE Ausnahme ohne Grund.
    A4  der Waechter ist GRUEN.
    A5  Gegenprobe: eine neue Migration mit INSERT
        -> faellt er?
    A6  Sicherung, Vollkette, Punktelauf.
