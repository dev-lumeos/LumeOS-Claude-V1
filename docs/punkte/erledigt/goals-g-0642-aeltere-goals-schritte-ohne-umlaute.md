---
nr: G-642
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-09
agent: codex
beauftragt: 2026-10-10
erledigt: 2026-10-16
commit: 224e40d9

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


## Kette committet - 2026-10-10, Commit `224e40d9`

`[cmd]` 3 Dateien nur Kette. `642_goal_user_texts_utf8.sql`: 14 Zeilen mit Umlauten in Zeichenketten. Nachgelaufenes `pnpm gate`: 18/18 Tasks, Exit 0. Der Commit lief ohne Hook, weil Codex' Gate an fremder WIP aus G-629 rot war. Danach war `verdrahtung` grün.

`[read]` Codex:
- 10 Sätze in 7 Funktionen und 4 Katalogbeschreibungen.
- 2 zusätzliche Sätze aus `goal_phase_start`.
- Der Wortlaut aus 622 ist ausgenommen (App-Test g568).
- Probe 3/3, mit Ersatzschreibung rot.
- Hex "Übung" C3 9C 62 75 6E 67.

Offen: Der 622-Satz kommt zusammen mit Claude Code, wenn der App-Test g568 angepasst ist. Live mit dem Paket G-611.

## Live - 2026-10-16, Codex (Paket 611 → 638 → 631 → 642)

`[cmd]` Orchestrator nachgemessen: Die Funktionen `trendgewicht_am`, `g638_plan_resume_preflight`, `goal_delete` und `goal_list_at` sind live. Sicherung `backup/a105-paket-g611-nachher2.sql` hat 1.420.942 Byte.

`[read]` Codex:
- goal_list_at: 8 Ziele eingefroren, wie im korrigierten Soll.
- dev: kein Hindernis, 2.714 kcal.
- test-user: Ziele und Pläne konsistent, 0 Widersprüche.
- trendgewicht_am: dev `trend_ema` 84,739, test-user `letzte_messung` 81,40.
- goal_delete: ohne Verlauf gelöscht, mit Verlauf `G611_CONFIRM`.
- Rollen unverändert.
- G-642 per Hex C3 9C …
- Gate 18/18 grün, web 2844.