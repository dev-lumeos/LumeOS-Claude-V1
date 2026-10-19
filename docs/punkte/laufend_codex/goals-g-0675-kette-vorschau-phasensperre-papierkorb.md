---
nr: G-675
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-19

braucht: [G-676]
kind_von: G-673

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen:
    - goals.user_goals
    - goals.goal_programs
    - goals.goal_phases
  dateien:
    - supabase/_pipeline/11_goals
---
# Kette: Vorschau beim Bearbeiten, Phasensperre, Papierkorb für Goals und die Phase Engine

## Befund

`[read]` Tom hat am 18.10. die Ergänzungen im Entwurf freigegeben (Version 57, G-673). In der Kette fehlen dafür drei Dinge:
1. Steuerung bearbeiten: Die Vorschau zeigt vor dem Speichern bisher und neu für Tagesziel, Tempo, "nach Plan erreicht" und Phasenlänge. Liegt die Rate außerhalb der Grenzen, steht der Grund da und Speichern ist gesperrt.
2. Phasen im aktiven Plan:
   - Vergangene Phasen sind unveränderlich.
   - Die laufende Phase ändert nur ihre Länge, und das Ende liegt nie vor heute.
   - "Hier beenden" schließt die laufende Phase heute ab.
   - Geplante Phasen sind frei änderbar.
3. Papierkorb für Ziele, Messziele und Pläne:
   - Legen, Wiederherstellen und endgültig Löschen.
   - Ein Ziel kommt pausiert zurück, ein Plan, der aktiv war, als Entwurf.
   - Ein aktiver Plan darf in den Papierkorb, die Sperre G625_BLOCK entfällt. Bis zum Wiederherstellen gilt Erhaltung mit Warnung.
   - Nichts wird automatisch entfernt.

## Was zu tun ist (Codex)

- Zu 1: Prüfen, ob der Vorschau-Leser aus "Ziel setzen" (G-628) für ein bestehendes Ziel reicht. Wenn nicht, einen Leser bauen, der nichts schreibt.
- Zu 2: Die Sperre in der Kette durchsetzen, nicht nur in der UI.
- Zu 3: Die Mechanik aus G-676 verwenden. Kein Leser darf Gelöschtes zeigen: Tagesziel, Wochenprotokoll, Messziele, Phasen-Leser und Tageslauf.
- Gegenproben: Eine vergangene Phase ändern muss rot werden. Ein Ziel im Papierkorb darf in keinem Leser auftauchen.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-675 Vorschau, Phasensperre, Papierkorb Goals
    Bereich: supabase/_pipeline
    Fremd:   apps/ gehoert Claude Code, docs/ dem Orchestrator.
    Stand:   2026-10-18, HEAD 5815dba3
