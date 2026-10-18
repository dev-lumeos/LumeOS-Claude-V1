---
nr: G-671
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: claudecode
beauftragt: 2026-10-18
erledigt: 2026-10-18
commit: d6efd946

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals/tab-phase.tsx
---
# Reste der Mockup-Referenz unter der Phase Engine

## Befund

`[read]` Claude Code (18.10.): Unter der Phase Engine stehen noch der Phasenkopf "Recomposition", "Phase state machine" und "Phase parameters". In PhaseEngine.dc.html kommt nichts davon vor.
Entscheidung des Orchestrators wie bei G-666: Der Entwurf ist verbindlich, also entfernen.

## Was zu tun ist (Claude Code)

- Die drei Abschnitte entfernen und die Aufrufer per `rg` belegen. Was danach keinen Aufrufer mehr hat, mit entfernen.
- Fehlende Mockup-Titel melden. Den Eintrag macht der Orchestrator, Tom hat dafür am 18.10. freigegeben.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-671 Mockup-Reste unter der Phase Engine
    Bereich: apps/web
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d


## Abnahme - 2026-10-18 (Orchestrator, commit d6efd946)

`[cmd]` rg zeigt GoalsPhaseView, PHASE_STATE, PhaseEditorModal und PhaseTemplateLibrary nur noch in Kommentaren. phase-editor.tsx ist geloescht (Tom). `[cmd]` mockup-deckung ist fuer goals gruen, 5 Eintraege verworfen. `[read]` 8 Waechter mit Toms Freigabe 18.10. 13:23 nachgezogen, Gegenproben 4/4 rot. `[cmd]` Gate gruen beim Commit.
