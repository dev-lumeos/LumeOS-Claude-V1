---
nr: G-625
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08

braucht: [G-617]
kind_von: G-617

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen:
    - goals.goal_programs
    - goals.goal_program_positions
    - goals.goal_strategies
    - goals.user_goals
  dateien: []
---

# Ein Plan ist der Inhalt des steuernden Ziels

## Entschieden - 2026-10-08 11:59, Tom

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Jedes steuernde Ziel hat genau einen Plan (`goal_programs.goal_id` besteht). Eine Richtung aus Goals erzeugt einen Plan mit einer Phase. Mehrere Pläne je Nutzer, genau einer aktiv – dieselbe Regel wie „ein Ziel steuert“. Plan-Status: Entwurf, aktiv, pausiert, abgeschlossen. Termine je Plan frei benennbar: Name, Art (Wettkampf A, Wettkampf B, Sperrtermin, Sonstiges), Datum. Phasen tragen entweder ein Katalogprogramm oder eigene Werte (Tempo %/Woche bzw. kcal % zu Erhaltung, Protein g/kg, Fett g/kg, Cardio/Woche, Refeed/Woche, Maximaldauer). Katalog ergänzt um Fett, Cardio, Refeed je Programm und einen Eintrag „Eigene Werte“ ab Pro in jeder Auswahlgruppe. `requirements.min_experience` entfällt (`min_erfahrung` ist die eine Wahrheit).

## Was zu tun ist (Codex)

Datenmodell, Lese- und Schreibfunktionen, Bestand umhängen (jedes bestehende steuernde Ziel bekommt seinen Plan), Tageszielrechnung liest eigene Werte.

