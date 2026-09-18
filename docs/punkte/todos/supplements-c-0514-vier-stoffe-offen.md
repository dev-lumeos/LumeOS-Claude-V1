---
nr: C-514
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-509
entscheidung: null
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
---

# C-514 - vier Stoffe stehen im Katalog und sind offen

## Befund

Aus C-509, Codex, 2026-09-08:

> *,,Exakte bestehende Ziele unter den Top 100: nur `Gelatin`,
`Glycerin`, `Selenium` und `Caffeine`. Das belegt zusaetzlich
eine NACHVERKNUEPFUNGSLUECKE, wurde aber nicht veraendert."*

`[cmd]` **`Gelatin` allein: 35.900 Produkte, alle ohne
`supplement_id`.**

`[read]` **Der Stoff ist im Katalog, die Zeile ist offen** ?
**C-510 hat nachverknuepft, aber diese vier nicht erwischt.**

## Was zu messen ist

`[read]` **Warum haben sie es nicht durch C-510 geschafft?**

`[cmd]` **C-510 hat *,,nur bei eindeutigem Katalogwurzelziel"*
ergaenzt** ? **miss, ob diese vier mehrdeutig sind.**

`[read]` **`Gelatin` koennte auf mehrere Eintraege passen
(Rind, Schwein, Fisch)** ? **dann ist die Zurueckhaltung
richtig und der Befund ist keiner.**

`[read]` **Oder sie sind eindeutig und wurden uebersehen.**

## Abnahmebedingungen

    A1  je der vier: eindeutig oder mehrdeutig?
        Gemessen.
    A2  wo eindeutig: nachverknuepft. Zahl.
    A3  wo mehrdeutig: GEMELDET, nicht geraten.
    A4  wie viele Zeilen nachher verknuepft?
    A5  Gegenprobe: ein zweiter Lauf aendert nichts.
    A6  Sicherung, Vollkette, ALLE Waechter.
