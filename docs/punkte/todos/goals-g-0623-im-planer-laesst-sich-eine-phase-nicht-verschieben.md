---
nr: G-623
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-08

braucht: []
kind_von: G-615

quellen:
  - docs/punkte/erledigt/goals-g-0615-der-planer-legt-plaene-vom-termin-rueckwaerts-an.md

beruehrt:
  tabellen:
    - goals.goal_phases
  dateien:
    - apps/web/src/app/v2/goals/planer.tsx
---

# Im Planer laesst sich eine einzelne Phase nicht verschieben

## Befund

`[read]` Claude Code, G-615: Verlaengern geht ueber die Stufenwochen (G-608);
Verschieben heisst heute, den Termin im Ziel-Editor zu aendern. Eine einzelne
Phase auf der Zeitachse verschieben ist nicht gebaut. Tom 07.10.: ,jede Phase
ist verschiebbar und verlaengerbar, das Enddatum folgt".

## Was zu tun ist

Mit Tom klaeren, ob Ziehen auf der Zeitachse oder ein Datumsfeld je Phase;
dann bauen. Regel bleibt: nie vor dem Zielbeginn, das Ende folgt.