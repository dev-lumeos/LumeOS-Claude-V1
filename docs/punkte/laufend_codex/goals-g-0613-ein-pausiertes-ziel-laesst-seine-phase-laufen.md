---
nr: G-613
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-07

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

---

## Entschieden - 2026-10-07 14:21, Tom

*,pausierend heisst nicht aktiv, wenn das reaktiviert wird soll der user
gefragt werden ob es mit den alten daten wieder gestartet werden soll oder
ob er zuerst anpassen will"*

- Pausiert = nicht aktiv: die Phase eines pausierten Ziels laeuft nicht,
  zaehlt nicht fuer Zielwerte, Tagesziele und ,aktuelle Phase', und wird
  nicht als laufend gezeigt.
- Reaktivieren fragt: ,mit den alten Daten fortsetzen" oder ,zuerst
  anpassen" (oeffnet das Ziel zum Bearbeiten, erst danach aktiv).

## Auftrag - Kopf (Datenhaelfte)

    AUFTRAG FUER Codex - G-613: die Phase eines pausierten Ziels ist nicht aktiv
    Bereich: supabase/_pipeline/ (Kette), danach Live nach Toms Freigabe
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

1. Messen: welche Funktionen und Sichten ,die laufende Phase' bestimmen
   (z. B. phase_at, Zielwert-Rechnung, Tagesziele) und ob sie den Status
   des Ziels pruefen. Live: test-user Abbau active/fat_loss, Aufbau
   on_hold/lean_bulk - beide ohne Ende.
2. Regel: eine Phase gilt nur als laufend, wenn ihr Ziel `active` ist.
   Pausieren beendet die Phase NICHT (sie bleibt fuer das Fortsetzen
   erhalten). Begruenden, ob als Bedingung in den Lesern oder als
   eigener Phasenstatus.
3. Probe: pausiertes Ziel -> seine Phase taucht in keinem Leser als
   laufend auf, Zielwerte kommen nur aus der aktiven; reaktivieren ->
   wieder laufend mit unveraenderten Daten. Kette gruen,
   `testdaten-pruefen` 0 Befunde, Sabotage beidseitig.
4. Live nur nach Toms Freigabe, Muster A-105, danach Gate gruen.
   Kein Commit.

Die Oberflaechenhaelfte (Frage beim Reaktivieren) folgt an Claude Code.

## Entschieden - 2026-10-08 08:18, Tom: kein aktives Ziel

*,erhaltung aktiv aber klare warnung dass kein goal aktiv ist, der user muss wissen dass er planlos laeuft"*

Folge aus G-613: ohne aktive Phase gibt es keine Tagesziele. Ersatz und Warnung: G-622.

`[cmd]` Commit-Versuch 08.10. rot - nicht G-613: `v2-attrappen.test.ts` ,fehlende-kacheln.tsx: 6 statt 7" aus Claude Codes laufender G-615-Arbeit. Commit nach G-615; `kette.json` getrennt (`.git/kette-ohne-617.py`, 359 Schritte).

## Kette committet - 2026-10-08, Commit `e50f1fcf`

Gate gruen. kette.json/testdaten-pruefen getrennt nach 613/617/622 (Codex' G-622 lag schon im Baum). Erledigt erst nach Live.
