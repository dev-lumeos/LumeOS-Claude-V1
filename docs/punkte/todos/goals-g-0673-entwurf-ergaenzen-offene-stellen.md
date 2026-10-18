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

## Ergebnis (18.10.)

`[read]` Im Artefakt stehen jetzt die Versionen 55 bis 57. Die Repo-Kopie ist nachgezogen.
1. Vorschau: Der Block "Neue Rechnung" zeigt bisher → neu für Tagesziel, Tempo, "nach Plan erreicht" und Phase, dazu die Grenzen.
2. Phasen: Vergangene sind gesperrt. In der laufenden gibt es nur ± Wochen und "Hier beenden". Geplante sind frei.
3. Aktiver Plan: Er darf in den Papierkorb, danach gilt Erhaltung mit Warnung.
4. Datenpunkt: Er klappt die Einheit bzw. Messung auf, mit einem Link ins Modul.
5. Coach-Freigabe: Sie stand schon im Entwurf. Sie kommt mit dem Coach-Modul.

`[read]` Tom hat 13:10 die vier Stellen freigegeben. Dazu kam ein Papierkorb statt endgültigem Löschen.
Um 13:16 hat er entschieden: Der Papierkorb gilt über alle Module, ohne automatisches Entfernen.
Daraus sind G-674 (UI), G-675 (Kette Goals) und G-676 (Papierkorb plattformweit) entstanden.
