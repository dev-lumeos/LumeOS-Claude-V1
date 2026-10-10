---
nr: G-642
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-09
agent: codex
beauftragt: 2026-10-10

braucht: []
kind_von: G-632

quellen:
  - supabase/_pipeline/11_goals/602_goal_order_and_measurement_snapshot.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
    - apps/web/src/lib/profile/__tests__/g568-zielwerte-ziel.test.ts
---

# Ältere Goals-Schritte schreiben Nutzertexte ohne Umlaute

## Befund

`[read]` Codex, Gegenprobe über alle 6xx-Dateien am 2026-10-09: 22 Nutzersätze stehen noch mit Ersatzschreibung.

| Datei | Zeilen |
|---|---|
| 602_goal_order_and_measurement_snapshot.sql | 58, 76, 84, 108, 124, 135 |
| 604_one_active_calorie_goal.sql | 160, 165 |
| 613_paused_goal_phase_readers.sql | 362 |
| 617_measurement_goal_exercise_and_role.sql | 387 |
| 617_measurement_goal_expansion.sql | 261, 268, 305 |
| 622_goal_free_maintenance.sql | 32 |
| 625_goal_plan_limits.sql | 35 |
| 625_goal_strategy_plan_values.sql | 30, 33, 36, 39 |
| 634_measurement_goal_start_preview.sql | 25, 126, 138 |

`[read]` Ein App-Test prüft den exakten 622-Wortlaut: `apps/web/src/lib/profile/__tests__/g568-zielwerte-ziel.test.ts:249`.

## Was zu tun ist

- Codex: neuer Kettenschritt, der die Texte ersetzt (Funktionen neu anlegen, keine alten Dateien umschreiben, die live sind).
- Claude Code: im selben Zug den Test an den neuen Wortlaut anpassen.
- Danach einen Wächter einbauen: Nutzertexte in `supabase/_pipeline/11_goals` ohne ae/oe/ue-Ersatz, Schlüssel ausgenommen.
## Auftrag - Kopf

    AUFTRAG FUER Codex - G-642: aeltere Goals-Schritte mit Umlauten
    Bereich: supabase/_pipeline/ (Kette)
    Fremd:   apps/ (Test g568 -> Claude Code). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-10
