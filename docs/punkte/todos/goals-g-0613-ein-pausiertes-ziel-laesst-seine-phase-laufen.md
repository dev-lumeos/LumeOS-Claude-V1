---
nr: G-613
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07

braucht: [G-604]
kind_von: G-604

quellen:
  - docs/punkte/erledigt/goals-g-0604-hoechstens-ein-aktives-kalorienziel.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien: []
---

# Ein pausiertes Ziel laesst seine Phase laufen

## Befund

`[cmd]` Live, test-user, 07.10.:

    G-559 Abbauziel   active   fat_loss   ab 2026-05-19  kein Ende  moderate_cut
    G-559 Aufbauziel  on_hold  lean_bulk  ab 2026-05-20  kein Ende  lean_bulk

`[read]` Der Reiter ,Phase engine" zeigt deshalb Lean Bulk UND Fat Loss
gleichzeitig laufend (`backup/rundgang-goals/01-phase-engine-gesamt.png`).
G-604 sperrt zwei aktive ZIELE mit Kalorienrichtung, aber das Pausieren
beendet oder pausiert die Phase nicht. Toms Regel (04.10.): Aufbau und
Abbau gleichzeitig ist unmoeglich - am Schirm steht genau das.

## Was zu klaeren ist

Was passiert mit der offenen Phase, wenn ihr Ziel pausiert wird (Ende
setzen, pausieren, oder nur nicht anzeigen)? Danach Regel in die Datenbank
und Bestand bereinigen.
