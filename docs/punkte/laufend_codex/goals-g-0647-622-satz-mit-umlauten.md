---
nr: G-647
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-18

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

## Auftrag - Kopf

    AUFTRAG FUER codex - G-647 622-Satz in UTF-8 (Codex-Teil) (Sammelauftrag 18.10. mit G-616/G-620/G-647 + Bestandspruefung G-643/G-646/G-525)
    Bereich: supabase/_pipeline/ (Kette), Live dev nach A-105 nur wo noetig
    Fremd:   apps/, packages/, tools/, docs/
    Stand:   2026-10-18, HEAD 2510f992

