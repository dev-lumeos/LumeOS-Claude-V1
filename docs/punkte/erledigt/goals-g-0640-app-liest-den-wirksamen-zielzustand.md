---
nr: G-640
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-09
agent: claudecode
beauftragt: 2026-10-09
erledigt: 2026-10-16
commit: f5f94c2f

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


## Gebaut und committet - 2026-10-10, Commit `8aa14cd9` (Rückfall, nicht live)

`[cmd]` 20 Dateien, nur `apps/web/src`. Neu sind `zustand.ts`, `lebenszyklus.tsx`, `lebenszyklus-write.ts` und `g640-zustand.test.ts`. `berechnePace` steht nur noch in `pace.ts`, die Zielkacheln rufen es nicht mehr auf; `phasen-zeitachse` siehe G-629. Gate grün, web 2813. test-user nachgemessen: 0 Messziele, Abbauziel aktiv mit aktivem Plan, Aufbauziel on_hold mit pausiertem Plan.

`[read]` Claude Code:
- Die Zielliste liest `goal_list_at`. Archivierte Ziele fallen weg, eingefrorene stehen unter Abgeschlossen.
- Neu starten, Archivieren und Löschen fragen nach, Löschen mit "lieber beenden?".
- Alle 9 Schlüssel aus G-611/G-638 erscheinen als Satz.
- Warnung `ziel_eingefroren`.
- Fehlt G-611 live, greift der Rückfall: kein Löschknopf, Meldung "noch nicht eingespielt".
- 12 Tests, Gegenprobe 8/8 rot.

Erledigt erst nach Live G-611/G-638 und dem vollen Schirmnachweis. Einmalige Messziele zeigen derzeit keine Lage: G-643.

## Erledigt - 2026-10-16, Commit `f5f94c2f` (Nachweis am Live-Bestand)

`[read]` Claude Code: Folgendes ist am Live-Bestand belegt, mit 12 Fotos in `backup/g640-live-*`:
- Eingefroren unter Abgeschlossen ohne Lage
- Neu starten vorbelegt
- Archivieren
- Löschen ohne und mit Verlauf (Rückfrage)
- Pausieren und Fortsetzen mit Plan
- dev: 4 eingefrorene Ziele

`[cmd]` test-user nachgemessen: Abbau aktiv mit aktivem Plan, Aufbau on_hold mit pausiertem Plan. Gate grün, web 2855.

Reste aus dem Bildschirmabgleich (Codes statt Namen, "Lieber beenden?" doppelt, Zeitfenster mit eingefrorenen Zielen, Lage-Pille ohne Istwert) gehen mit G-648/G-649.
