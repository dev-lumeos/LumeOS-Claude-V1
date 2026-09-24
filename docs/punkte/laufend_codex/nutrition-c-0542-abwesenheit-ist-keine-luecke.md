---
nr: C-542
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-426
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [nutrition.meal_items]
zahlen:
  gemessen: 2026-09-08
---

# C-542 - eine Abwesenheit ist keine Luecke

## Befund

Aus G-426, Claude Code, 2026-09-08:

> *,,`meal_supplement_missing_count` zaehlt `item_count -
value_count`, wodurch ein Praeparat, das einen Naehrstoff
schlicht NICHT ENTHAELT, als fehlende Messung gilt. Bei sieben
Whey-Posten heisst das fuer jeden Mikronaehrstoff missing = 7."*

> *,,Eine Abwesenheit ist keine Luecke."*

## Selbst nachgemessen

`[cmd]` **Die Obergrenze am 2026-09-22:**

    complete                    1
    incomplete_supplements     16
    unresolved_fortified_food   1

`[cmd]` **Und `missing 7` bei 126 Naehrstoffen** ? **von VITK
ueber ZN bis F22:6CN3.**

`[read]` **Ein Whey-Pulver enthaelt kein Vitamin K** ? **das
ist keine fehlende Messung, das ist eine Null.**

## Warum es zaehlt

`[cmd]` **1 von 18 Zeilen ist rechenbar** ? **die Obergrenze
ist an den meisten Tagen unbrauchbar.**

`[read]` **Und sie ist der Grund, warum C-466 gebaut wurde:
wer Praeparate nimmt, soll sehen, ob er ueber die Grenze
kommt.**

## Was zu unterscheiden ist

    NICHT ENTHALTEN   das Etikett fuehrt den Stoff nicht
                      -> eine Null, kein Loch
    NICHT GEMESSEN    das Etikett nennt ihn ohne Menge
                      -> ein Loch

`[cmd]` **C-496 hat `amount_qualifier` (not_stated, exact,
less_than, greater_than)** ? **MISS, ob das die Unterscheidung
schon traegt.**

`[cmd]` **Und G-466 hat gemessen: `not_stated` heisst *ohne
Mengenangabe*, nicht *nicht enthalten*.**

## Abnahmebedingungen

    A1  was heute als missing zaehlt: aufgeschluesselt.
    A2  traegt amount_qualifier die Unterscheidung?
        Gemessen.
    A3  nach der Behebung: wie viele Zeilen sind
        rechenbar? Zahl vorher/nachher.
    A4  Gegenprobe: ein Stoff MIT Menge, aber ohne Wert,
        zaehlt weiter als Luecke.
    A5  G-426 zeigt die Obergrenze danach richtig --
        GEMELDET, damit Claude Code nachzieht.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
