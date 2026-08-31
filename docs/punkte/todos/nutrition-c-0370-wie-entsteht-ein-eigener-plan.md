---
nr: C-370
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-301
entscheidung: null
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen: null
---

# C-370 — wie entsteht ein eigener Plan?

## Die Luecke

`[cmd]` **`SPEC_03` Flow 3 beginnt bei *,,Uebersicht zeigt alle
verfuegbaren Plaene"*.** `[cmd]` **Vier Quellen sind genannt: eigene,
Coach, Marketplace, Buddy.**

`[read]` **Fuer drei davon gibt es einen Weg.** `[cmd]` **Coach:
`coach.pending_actions` und die Freigabematrix. Marketplace:
`POST /api/nutrition/meal-plans` (E-37). Buddy: die
Autonomiestufe.**

`[read]` **Fuer *Eigene* steht nichts.**

## Die Frage

**Soll ein Nutzer selbst einen Plan anlegen koennen?**

`[read]` **Dafuer spricht:** `[cmd]` **`plan_origin` kennt
`self_created` als ersten Wert** — **das Schema geht davon aus.**

`[read]` **Dagegen:** ein leerer Plan mit 21 Tagen und null Eintraegen
ist Arbeit, die niemand macht. `[cmd]` **Der Planner ist seit G-299
die Bearbeitungsflaeche** — **aber er braucht einen Plan, in den er
schreibt.**

## Drei denkbare Wege

    aus einer Woche      die aktuelle Diary-Woche als Plan sichern
    aus einem Bestand    einen vorhandenen Plan kopieren
    leer und fuellen     Name, Dauer, dann Tag fuer Tag

`[read]` **Der erste braucht kein Formular** — **er nimmt, was schon
da ist.** `[cmd]` **`Copy week` existiert bereits im Planner.**

`[read]` **Und das entscheidet auch, was das *Neuer Plan*-Formular
sein soll** — **oder ob es verschwindet.**
