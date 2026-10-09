---
nr: G-640
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-09
agent: claudecode
beauftragt: 2026-10-09

braucht: [G-611]
kind_von: G-611

quellen:
  - supabase/_pipeline/11_goals/611_goal_freeze_archive_delete.sql

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/lib/goals
    - apps/web/src/app/v2/goals
    - apps/web/src/lib/profile
---

# Die App liest den wirksamen Zielzustand

## Befund

`[read]` Codex, G-611: Die Oberfläche liest den gespeicherten Status direkt und rechnet "hinterher" selbst. Die neuen Leser `goal_state_at` und `goal_list_at` liefern den eingefrorenen Zustand. Die App benutzt sie nicht.

## Was zu tun ist (Claude Code)

- Zielliste und Kacheln über `goal_list_at`/`goal_state_at`. "hinterher" und der Fortschritt kommen aus `goal_progress_at`, keine eigene Rechnung.
- Eingefroren: Status sichtbar, Details lesbar, Aktionen "Neu starten" (`goal_restart`, vorbelegt) und "Löschen".
- Archivieren (`goal_archive`) für Abgeschlossene.
- Löschen (`goal_delete`) mit Bestätigung. `G611_CONFIRM:beenden_statt_loeschen` wird zur Rückfrage "lieber beenden?", `G611_BLOCK` zu einem Satz.
- Hindernis `ziel_eingefroren` in der Warnung (Today/Nutrition/Goals) und in der Steuerungskarte.
- Löschknopf nachrüsten (G-639).
## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-640 (+ Loeschknopf aus G-639): App liest den wirksamen Zielzustand
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals, apps/web/src/lib/profile, apps/web/src/app/v2 (Warnung)
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-09
