---
nr: G-674
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-18

braucht: [G-675]
kind_von: G-673

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# UI: die Ergänzungen aus dem Entwurf (Vorschau, Datenpunkt, Phasensperre, Papierkorb)

## Befund

`[read]` Tom hat am 18.10. die Ergänzungen im Entwurf freigegeben (Version 57, G-673):
1. Main, Steuerung bearbeiten: Der Block "Neue Rechnung" ersetzt den Platzhaltersatz. Er zeigt eine Tabelle bisher → neu und die Grenzen.
2. Main, Messziel-Details:
   - Die Quelle eines Datenpunkts klappt eine Zeile auf.
   - Darin stehen die Einheit, die Sätze bzw. Maße und ein Link "… in Training öffnen →" bzw. "Messung in Measurements öffnen →".
   - Für eine einzelne Trainingseinheit gibt es noch keine Route.
3. PhaseEngine, Phasen bearbeiten:
   - Vergangene Phasen sind gesperrt, mit Schloss und Begründung.
   - In der laufenden Phase gibt es nur ± Wochen und "Hier beenden".
   - Geplante Phasen sind frei bearbeitbar.
4. Beide Seiten, Löschen:
   - Löschen heißt "In den Papierkorb", mit neuen Rückfragen und Meldungen.
   - Unten steht der Bereich "Papierkorb" mit "Wiederherstellen" und "Endgültig löschen". Endgültig löschen hat eine eigene Rückfrage.

## Was zu tun ist (Claude Code)

- Stelle 2 (Aufklappen und Route) kann sofort beginnen.
- Die Stellen 1, 3 und 4 binden die Leser und Schreiber aus G-675 an. Erst wenn Codex gemeldet hat.
- Die Abnahme läuft gegen den Entwurf, Version 57, mit Ist-Bildern auf test-user.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-674 Entwurfsergaenzungen Goals/Phase Engine
    Bereich: apps/web
    Fremd:   supabase/_pipeline gehoert Codex, docs/ dem Orchestrator.
    Stand:   2026-10-18, HEAD 5815dba3
