# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo.  
Du hilfst Tom beim Planen, Strukturieren, Reviewen und Erzeugen von Specs/Workorders.  
Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Projektstatus


## Arbeitsprinzip


## Workorder-Workflow


## Wichtige Referenzen

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom.
- Keine Runtime-Hardening-Arbeiten
- Keine alten BrainstormDocs als Current Truth verwenden.
- Bei Unsicherheit: nach aktuellem SSOT suchen, nicht raten.

---

## High-Risk-Regel

High-Risk — brauchen Prior Approval:
- `db-migration`, `payments`, `medical`, `release`

Cautious — senior review mandatory through Codex/GPT-5.5, kein Auto-Retry:
- `security`, `auth`, `rls`, `shared-core`, `architecture`

Autonom — dürfen ohne Approval laufen:
- `standard`, `docs`, `i18n`, `test`

Quelle: `system/control-plane/risk-categories.ts`

---

## Reports

Für den aktuellen Status:

```bash
npx tsx system/reports/morning-report.ts
npx tsx system/reports/failed-wo-report.ts
npx tsx system/reports/model-quality-report.ts
npx tsx system/reports/wo-dossier.ts --all-completed
npx tsx system/control-plane/docs-drift-checker.ts
```

---

## Veraltete Referenzen

Wenn alte Pfade, alte Skills oder alte Service-Flows gefunden werden, nicht verwenden.  
Stattdessen die aktuellen Referenzen oben nutzen.

---

## Aktueller Stack

*Brain only. System macht den Rest.*

---

## gstack

Installed: v1.60.1.0 at `~/.claude/skills/gstack`.
Telemetry hard-disabled via `~/.gstack/config.yaml` (telemetry, update_check, auto_upgrade, artifacts_sync all off).
No SessionStart / PostToolUse / PreToolUse hooks installed (setup ran without `--team`).

### Browsing

For any web browsing / scraping / headless-browser task, use the gstack `/browse` skill.
Do **not** use `mcp__claude-in-chrome__*` tools.

### Available skills

Planning & review:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan`

Design:
`/design-consultation`, `/design-shotgun`, `/design-html`, `/design-review`, `/devex-review`

Ship & QA:
`/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/qa`, `/qa-only`

Browser & scrape:
`/browse`, `/connect-chrome`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`

Meta & docs:
`/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

**Governance note:** gstack skills that auto-commit or auto-push (`/ship`, `/land-and-deploy`) still require explicit Tom-approval per `Schreibregeln` above. gstack does not override LumeOS workflow rules.

---

<!-- IJFW-MEMORY-START (managed -- do not edit manually) -->
<!-- IJFW-MEMORY-END -->
