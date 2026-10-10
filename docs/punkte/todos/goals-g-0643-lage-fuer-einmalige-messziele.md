---
nr: G-643
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-10

braucht: [G-611]
kind_von: G-640

quellen:
  - supabase/_pipeline/11_goals/611_goal_freeze_archive_delete.sql
  - docs/spezifikation/goals-ziel-setzen/README.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
    - apps/web/src/lib/goals
---

# Lage "voraus / im Plan / hinterher" für einmalige Messziele

## Befund

`[read]` Claude Code, G-640: `goal_progress_at` liefert die Lage nur für Wochenziele (über deren Quote). Einmalige Messziele zeigen keine Lage mehr, seit die eigene Rechnung (`berechnePace`) aus der App entfernt ist.

`[read]` Der Entwurf, den Tom am 08.10. freigegeben hat (`Main.dc.html`, Dossier 8.4), zeigt den Status voraus / im Plan / hinterher auf jeder Messziel-Kachel. Es gibt also nichts zu entscheiden, es fehlt nur die Datenseite.

## Was zu tun ist

- Codex: `goal_progress_at` liefert für einmalige Ziele ein Feld `lage` (voraus | im_plan | hinterher | offen). Grundlage ist eine Soll-Linie vom Startwert (Snapshot) zum Zielwert über die Laufzeit. Die Toleranz liegt als Wert in der Kette und wird begründet. Ohne Istwert ist die Lage "offen". Eingefrorene Ziele bekommen keine Lage.
- Claude Code: das Feld anzeigen, ohne eigene Rechnung.