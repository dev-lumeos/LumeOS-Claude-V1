---
nr: G-660
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-17
agent: codex
beauftragt: 2026-10-17
erledigt: 2026-10-17
commit: 7c200517

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

## Auftrag - Kopf

    AUFTRAG FUER codex - G-660 Taeglicher Lauf der Modulbeitraege (Kettenteil), vorher doppelte Gewichtszeilen
    Bereich: supabase/_pipeline/ (Kette), Live auf dev und test-user nach A-105
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-17, HEAD ea9f54f1

## Kettenteil erledigt - 2026-10-17, Commit `342f78c7` (live)

`[read]` Codex:
- `goals.run_goal_contribution_catchup()` ist nur für service_role.
- Nachgerechnet bis 16.10.: 25 Zeilen geändert, die Wiederholung ändert 0 (Hash gleich).
- dev kcal-Treue 84,9 % an 7/7 Tagen.

Sicherungen: `backup/a105-g660-*`.
`[cmd]` Bild von dev: Ernährung 84,9 % kcal-Treue 7 Tage, Training 3 / 4, Recovery 66,9, Supplements 88,1 %, kein deutlicher Engpass. 0 Attrappen, 0 Konsolenfehler.
Offen: Den Auslöser baut Claude Code in tools/. Der Aufruf als service_role in dieser Reihenfolge: `SELECT goals.run_goal_contribution_catchup();` und `SELECT goals.record_weekly_adjustments();`.

## Erledigt - 2026-10-17, Commit `7c200517` (Auslöser, Gate grün)

`[read]` Claude Code:
- `tools/beitragslauf-taeglich.py` läuft über `dienst_rpc` in lauf.py, ohne Prozess und ohne Fenster.
- Status landet in `backup/_manifests/beitragslauf-status.json`, der Prüfer heisst `--name beitragslauf`, Abfrage mit `pnpm beitrag:status`.
- Live auf test-user: grün mit 0 Zeilen. Mit falschem Schlüssel: HTTP 401, Exit 1, Schritt 2 wird übersprungen.

Offen bei Tom: die geplante Aufgabe einrichten (schtasks, 00:15).
