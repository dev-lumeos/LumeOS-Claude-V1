---
nr: C-370
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: G-301
entscheidung: E-39
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

## Praezisiert durch E-39, 2026-08-31

`[cmd]` **Tom hat entschieden, dass gebaut wird.** `[read]` **Damit
bleibt nur noch, welchen Weg ein eigener Plan nimmt.**

`[read]` **Der Auftrag G-289 baut Flow 3, 7 und 8** — **das Anlegen
eines leeren Plans steht in keinem davon.**

`[cmd]` **`Copy week` existiert im Planner.** `[read]` **Der
naheliegende Weg ist deshalb: aus einer Woche einen Plan sichern** —
**kein Formular, kein leerer Plan.**

`[read]` **Wenn Claude Code beim Bau merkt, dass ein Weg fehlt,
meldet er es.** **Dieser Punkt bleibt offen, bis das geschieht.**

## Gemessen am 2026-08-31 — die Luecke ist belegt

`[cmd]` **`meal_plan_weeks` wird nirgends eingefuegt.** `[cmd]`
**`meal_plan_days` kommt nur in einem `select` vor.**

`[read]` **Es gibt keinen Schreibweg fuer Planwochen** — **also kann
kein Nutzer einen fuellbaren Plan bekommen, gleich welchen Weg man
baut.**

`[cmd]` **Der eine vorhandene Plan stammt aus dem C-150-Seed.**

## Der naheliegende Weg

`[read]` **Aus einer Woche einen Plan sichern.** `[cmd]` **Das
Tagebuch traegt 2.895 Mahlzeiten ueber 181 Tage** — **eine Woche
daraus ist ein fertiger Planinhalt.**

`[read]` **Kein Formular, keine leeren Wochen, kein Tag fuer Tag
fuellen.** `[read]` **Und es beantwortet auch, was *Copy week*
eigentlich tun sollte.**

`[read]` **Zu entscheiden bleibt:** ob das der einzige Weg ist, oder
ob ein leerer Plan mit *n* Wochen daneben stehen soll.
