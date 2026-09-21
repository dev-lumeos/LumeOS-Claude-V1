---
nr: G-490
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-460
entscheidung: null
beruehrt:
  dateien:
    - tools/gefallene-spalten-pruefen.mjs
zahlen:
  gemessen: 2026-09-08
---

# G-490 - der Spaltenwaechter kennt die Tabelle nicht

## Befund

`[cmd]` **`gefallene-spalten-pruefen.mjs` meldet:**

    apps/web/src/lib/supplements/produkt-daumen.ts
      liest `supplement_product_id` -- geworfen in
      c519_remove_meal_product_snapshots.sql

`[cmd]` **Selbst gemessen: `produkt-daumen.ts` liest aus
`nutrition.food_preference_items`** ? **und dort steht die
Spalte noch.**

`[read]` **C-519 hat `supplement_product_id` aus `meal_items`
entfernt, nicht aus `food_preference_items`.**

`[read]` **Der Waechter vergleicht den SPALTENNAMEN, nicht die
TABELLE** ? **falscher Alarm.**

## Dieselbe Klasse wie G-460

`[cmd]` **G-460: der Waechter suchte das WORT `ebene` statt
der Spaltenform** ? **acht Falschmeldungen.**

`[read]` **Hier sucht er die Spalte ohne die Tabelle** ? **ein
Name, der in zwei Tabellen vorkommt, wird verwechselt.**

## Warum es zaehlt

`[cmd]` **Codex zaehlt den Befund zu den *,,bestehenden roten
Waechtern"*** ? **er wird als Altlast mitgeschleppt, obwohl er
keiner ist.**

`[read]` **Ein Waechter, der falsch rot ist, lehrt alle, ihn zu
uebersehen.**

## Abnahmebedingungen

    A1  der Waechter kennt die Tabelle, nicht nur den
        Spaltennamen.
    A2  produkt-daumen.ts ist gruen.
    A3  Gegenprobe: eine echte gefallene Spalte in
        meal_items wird weiter rot. Sabotageprobe.
    A4  G-485 wuerde er fangen -- belegt.
