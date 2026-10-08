---
nr: G-613
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: codex
beauftragt: 2026-10-07
erledigt: 2026-10-08
commit: e50f1fcf

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

## Live-Reihenfolge - 2026-10-08

Live zusammen mit G-617 (erweitert) und G-622 (622 hängt an 613 und 617).


## Live - 2026-10-08 15:51, Codex (Paket A-105, Freigabe Tom)

`[cmd]` Eingespielt in dieser Reihenfolge: 613, 617 mit Backfill, 617-Erweiterung, 622 (beide Dateien), 626 (beide Dateien mit G-632-Texten); danach NOTIFY pgrst. Sicherung `backup/a105-paket-g626-vorher.sql` 1.252.413 Byte, `-nachher.sql` 1.317.811 Byte.

`[cmd]` Orchestrator nachgemessen: aktiv steuernd/messend dev 1/1, max.seed 0/1, test-user 1/0, tom.seed 1/1. `experience_goal_limits` 4 Zeilen. Trigger a617_goal_role_guard, a617_phase_role_sync, a617_program_role_sync, g626_guard_controlling_phase, g626_guard_controlling_goal_update vorhanden. Keine Funktion enthaelt mehr die Titelregel `bankdruecken`. `kein_aktives_ziel` steht in 2 Funktionen. Hex "Diät" in `ziel_grenzen_pruefen` = 44 69 C3 A4 74.

`[read]` Codex: 4/4 Bankdrueck-Ziele auf Barbell Bench Press. Waechter ohne Bestaetigung G626_CONFIRM, mit Bestaetigung angenommen, Probe zurueckgerollt. Ohne aktives Ziel: kein_aktives_ziel, zwei Werte maintenance_no_active_goal. pnpm gate gruen 18/18. Wegwerf-DB verworfen (23 -> 22).