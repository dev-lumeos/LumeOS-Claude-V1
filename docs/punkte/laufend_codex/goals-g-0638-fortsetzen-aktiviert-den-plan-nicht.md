---
nr: G-638
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-09
agent: codex
beauftragt: 2026-10-09

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
## Auftrag - Kopf

    AUFTRAG FUER Codex - G-638: Planstatus folgt dem Ziel in beide Richtungen
    Bereich: supabase/_pipeline/ (Kette). Live mit G-611 nach Freigabe.
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-09, HEAD 158ad807


## Kette committet - 2026-10-09, Commit `ba11b66c`

`[cmd]` 3 Dateien nur Kette. Gelesen:
- BEFORE-Trigger `g638_plan_resume_preflight` auf `user_goals.status`: `G638_BLOCK:anderer_aktiver_plan`, `G638_BLOCK:ziel_eingefroren_oder_archiviert`.
- `g625_sync_plan_after_goal_status` erweitert.

`[cmd]` Live nachgemessen: Ziel active → Plan aktiv 3, on_hold → pausiert 1, kein Widerspruch. Gate grün.

`[read]` Codex: 391 Schritte grün, Probe 6/6, Sabotage 2× rot.

Befund: Die Satztexte in den G638-Fehlern stehen ohne Umlaute ("koennen"), wie früher bei G-632. Die Korrektur gehört ins Live-Paket.

Live erst mit G-611 und G-640.