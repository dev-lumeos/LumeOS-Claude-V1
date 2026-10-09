---
nr: G-638
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-09

braucht: []
kind_von: G-625

quellen:
  - docs/ssot/183-goals-ziel-plan-modell.md

beruehrt:
  tabellen:
    - goals.goal_programs
  dateien: []
---

# Fortsetzen eines Ziels aktiviert seinen Plan nicht

## Befund

`[read]` Claude Code, G-618 am Schirm: Beim Pausieren des Abbauziels setzt ein G-625-Trigger dessen Plan auf `pausiert`. Beim Fortsetzen (Ziel wieder `active`) setzt niemand den Plan zurück. Der Rückbau musste den Plan von Hand auf `aktiv` setzen.

`[read]` Tom 08.10. 18:19 (Backfill B): Der Planstatus folgt dem Ziel. Das gilt auch in diese Richtung.

## Was zu tun ist (Codex)

Ziel `paused`/`on_hold` → `active`: Der Plan geht von `pausiert` auf `aktiv`, soweit kein anderer Plan des Nutzers aktiv ist. Sonst weist der Wechsel ab mit Hinweis. Gemeinsam mit G-611 prüfen (eingefroren, archiviert). Probe beide Richtungen, Sabotage rot.