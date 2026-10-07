---
nr: G-610
typ: entscheidung
modul: goals
schwere: mittel
angelegt: 2026-10-07

braucht: [G-608]
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien: []
---

# contest_prep ist in der App nicht anlegbar

## Befund

`[read]` Claude Code, G-608: das Anlegemodal bietet nur Strategien mit
`tier = 'simple'` an (Filter aus G-554). `contest_prep` ist `advanced` -
die Wettkampfvorbereitung samt Dauer-Anteilen, Stufenwochen und Ankerplan
ist gebaut, aber kein Nutzer kommt hinein. Der Nachweis lief nur ueber ein
per SQL angelegtes Ziel.

`[read]` Dazu: tragen die gespeicherten Stufen mehr Wochen als die
Gesamtdauer, beginnt die erste Stufe VOR dem Zielbeginn (Nachweis: 30.09.
statt 07.10.). Sichtbar ist das nur im Abweichungssatz.

## Was zu entscheiden ist (Tom)

1. Sollen fortgeschrittene Strategien (contest_prep u. a.) im Anlegemodal
   waehlbar sein - fuer alle, nach einer Erfahrungsfrage, oder nur ueber
   einen Coach?
2. Wenn die Stufen laenger sind als die Gesamtdauer: darf der Plan vor dem
   Zielbeginn starten, oder verschiebt sich das Zieldatum, oder wird das
   Speichern verweigert?
