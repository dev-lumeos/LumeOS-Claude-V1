---
nr: G-673
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-18

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - docs/spezifikation/goals-ziel-setzen/entwurf
---
# Entwurf ergänzen: fünf offene Stellen aus der Abnahme

## Befund

`[read]` Bei der Abnahme von G-648/G-649 am 18.10. sind fünf Stellen aufgefallen, die der Entwurf nicht festlegt:
1. Steuerung bearbeiten: die Vorschau "Vor dem Speichern … neue Rechnung" (G-628)
2. Vergangene Phasen bearbeiten
3. Den aktiven Plan löschen (heute geht Löschen nur bei Entwürfen, G625_BLOCK)
4. Ein Datenpunkt verlinkt auf die Trainingseinheit (dafür gibt es noch keine Route)
5. Die Coach-Freigabe in der Aktivieren-Frage

`[read]` Tom hat am 18.10. um 12:59 entschieden: Alle fünf kommen in den Entwurf.

## Was zu tun ist (Orchestrator)

- Die fünf Stellen im Design-Artefakt ergänzen. Das ist der Prototyp TsYCzByHS8Rpus6sfcgU7u, die Repo-Kopie liegt unter `entwurf/`.
- Tom legt die Ergänzungen vor. Erst nach seiner Freigabe werden Aufträge an Codex und Claude Code daraus.
