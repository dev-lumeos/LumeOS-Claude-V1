---
nr: G-611
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-07

braucht: []
kind_von: G-608

quellen:
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien: []
---

# Ein Ziel laesst sich nicht loeschen

## Befund

`[read]` Claude Code, G-608: es gibt in der App keinen Loeschweg fuer
Ziele - das Testziel musste per SQL entfernt werden. Ein Nutzer, der sich
vertippt oder ein Ziel aufgibt, kann es nur pausieren.

## Was zu klaeren ist

Messen, ob die Datenbank einen Loesch- oder Archivweg hat (Status,
Funktion, Kaskaden auf Phasen, Programme, Zielwerte, Snapshots), und
was das Mockup vorsieht. Danach entscheiden: echtes Loeschen oder
Archivieren mit Historie.
