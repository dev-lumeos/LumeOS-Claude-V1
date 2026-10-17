---
nr: G-660
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-17

braucht: []
kind_von: G-522

quellen:
  - supabase/_pipeline/11_goals/522_goal_contribution_range.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Täglicher Lauf der Modulbeiträge

## Befund

`[cmd]` G-522 ist am 17.10. live und einmal nachgefüllt (Commit `1c9ad54a`). Einen laufenden Lauf gibt es nicht. Ab morgen veralten die Kacheln. pg_cron ist nicht installiert. `tools/kettenlauf-taeglich.mjs` baut nur eine Wegwerf-Kette und ist kein Weg, live zu schreiben.
`[read]` Vorschlag Codex (17.10.):
- Ein externer Dienstauftrag ruft die Bereichsfunktion täglich auf, nachdem der Vortag abgeschlossen ist.
- Ein Erfolgsdatum je Konto steuert das Nachholen verpasster Tage.
- Ein überlappender Zeitraum erfasst nachgetragene Einträge.
- Der Lauf ist wiederholbar und endet bei eingefrorenen Zielen am Freeze.

`[read]` Tom hat am 17.10. um 13:09 zugestimmt.

## Was zu tun ist

Codex baut den Kettenteil:
- Erfolgsdatum je Konto
- eine Funktion "seit letztem Erfolg nachholen" mit Überlappung
- Rechte nur für service_role
- Proben mit Sabotage

Den Auslöser (geplanter Aufruf auf Toms Rechner) baut Claude Code in `tools/` als eigenen Teil, nachdem der Kettenteil gemeldet ist.


