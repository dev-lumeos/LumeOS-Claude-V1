---
nr: G-618
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-07

braucht: [G-617]
kind_von: G-617

quellen:
  - docs/punkte/todos/goals-g-0617-ein-kraftziel-findet-seine-uebung-nur-ueber-den-titel.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/app/v2/goals
---

# Der Reiter Goals trennt das steuernde Ziel von den messenden

## Entschieden - 2026-10-07 16:39, Tom

Steuerndes Ziel (eines) oben, mit Strategie und Phase. Darunter die
messenden Ziele, grafisch nach Kategorie (`goal_type`/`subtype`:
Kraft, Kapazitaet, Cardio, Gewohnheit ...) getrennt. Keine
Eltern-Kind-Verknuepfung, keine Mischung mit Strategie oder Phasen.

## Was zu tun ist

Reiter Goals: Bereich ,Steuerung" (das eine aktive steuernde Ziel, Variante,
laufende Phase) und Bereich ,Messziele" nach Kategorie, je Ziel Messart,
Uebung, Ist/Ziel, Frist. Anlegen eines Messziels mit Uebungsauswahl (G-617).
Danach eigener Punkt: ,Ziel setzen" an der Uebung in Training, oeffnet
dasselbe Anlegen mit vorausgefuellter Uebung.
