---
nr: G-645
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-10

braucht: []
kind_von: G-629

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---

# Goals und Phase Engine: Befunde am Schirm (dev, 10.10.)

## Befund

`[cmd]` Bildschirmfotos `backup/orch-stand-goals.png` und `backup/orch-stand-phase.png`:
1. Der Plan heisst noch "Lean Bulk bis September", das Ziel heisst "Lean Bulk auf 88 kg". Der Planname folgt dem Ziel nicht (Daten, Codex).
2. Die Steuerungskarte zeigt "Woche 1 von 14", der Phasenblock in der Phase Engine "Woche 1 von 15". Zwei Rechnungen für dieselbe Zahl.
3. Unter dem neuen Planer stehen die alten Phasen-Bauteile weiter da, teils englisch ("Phase parameters", "Hoechstdauer").
4. Unten im Reiter Goals steht noch der Block "Mockup-Referenz" mit Attrappen ("fällt mit Toms Abnahme").
5. Der Kopf zeigt "2 active goals" und zählt dabei das steuernde und das messende Ziel zusammen.
6. Module: alle "noch keine Beiträge — kommt". `goal_contributions` ist für dev leer (Daten, Codex).

## Was zu tun ist

Claude Code: 2, 3 und 5. 4 nach Toms Abnahme des Reiters. Codex: 1 und 6.

## App-Teil committet - 2026-10-16, Commit `f5f94c2f`

Punkte 2, 3 und 5 sind erledigt (Woche 1 von 15 überall, alte Bauteile aufgelöst, Kopf nach Rolle). Punkt 1 (Planname) und Punkt 6 (Beiträge) kommen von Codex: G-645 Datenteil ist committet in `e61f5c42` und noch nicht live. Punkt 4 (Mockup-Referenz) geht mit G-648.
