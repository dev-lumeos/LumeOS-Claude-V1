---
nr: G-647
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-16

braucht: [G-642]
kind_von: G-642

quellen:
  - supabase/_pipeline/11_goals/622_goal_free_maintenance.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/622_goal_free_maintenance.sql
    - apps/web/src/lib/profile/__tests__/g568-zielwerte-ziel.test.ts
---

# Der Satz aus 622 steht noch ohne Umlaute

## Was zu tun ist

Codex: neuer Kettenschritt mit dem Satz aus `622_goal_free_maintenance.sql:32` in UTF-8, danach den Wächter aus G-642 ohne die Ausnahme. Claude Code: im selben Zug `g568-zielwerte-ziel.test.ts:249` anpassen. Beide Commits zusammen.