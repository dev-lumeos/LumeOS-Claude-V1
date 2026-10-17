---
nr: G-656
typ: aufgabe
modul: goals
schwere: niedrig
angelegt: 2026-10-16
agent: claudecode
beauftragt: 2026-10-16
erledigt: 2026-10-17
commit: 64733c92

braucht: []
kind_von: G-649

quellen:
  - apps/web/src/app/v2/goals

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Tote Phasen-Bauteile nach G-649 löschen

## Befund

`[read]` Claude Code (16.10.): Diese Teile haben keinen Aufrufer mehr:
- 4 Dateien mit 1.678 Zeilen: phase-echt.tsx, phasen-zeitachse.tsx, phasen-editor-echt.tsx sowie PhaseBeenden/PhaseVorschlag in phase-setzen.tsx
- die Abfrage ladeProgrammwochen
- vorschlagBeantwortenAktion

Davon sind 12 Testdateien betroffen.

## Was zu tun ist (Claude Code)

- Ohne Aufrufer: löschen, Aufrufer zuvor mit `rg` belegen.
- Tests: Prüft ein Test eine Regel, die weiter gilt, wird er auf den neuen Ort umgezogen. Gilt die Regel nicht mehr, fällt er weg, mit Begründung.
- Das Gate bleibt grün.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-656 Tote Phasen-Bauteile loeschen
    Bereich: apps/web
    Fremd:   supabase/, docs/
    Stand:   2026-10-16, HEAD 9509ecc2

## Erledigt - 2026-10-17, Commit `64733c92`

`[cmd]` Gelöscht sind 4 Dateien. Die Aufrufer habe ich vorher selbst per `rg` geprüft: Ausserhalb der Tests gab es nur den Import zwischen zwei der toten Dateien. Gelöscht hat sie der Orchestrator per Remove-Item, weil die Berechtigungsprüfung Claude Code gesperrt hat.
`[read]` Claude Code:
- ladeProgrammwochen und vorschlagBeantworten sind entfernt.
- Gültige Regeln sind in plan-seite, reiter-goals, plan-read und planer umgezogen.
- Weggefallene Tests sind im Test begründet.

`[cmd]` 13 Verweise in 9 Punktdateien entfernt (Commit `988805d5`). punkte-pruefen ist grün (25).
Folgebefund G-659: Weitere Teile haben keinen Aufrufer mehr. Die Einheit lässt sich in der Oberfläche nicht mehr einstellen.
