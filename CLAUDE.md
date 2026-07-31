# CLAUDE.md — LumeOS Runtime Instructions

## Rolle

Du bist Claude im LumeOS-Repo (`D:\GitHub\LumeOS-Claude-V1`).
Du arbeitest hier **direkt** mit Tom — kein Workorder-Workflow, keine Governance-Pipeline.
Du änderst Dateien nur, wenn Tom es explizit verlangt.

---

## Was dieses Repo ist

Produkt-Repo für LumeOS. Monorepo (Turborepo + pnpm 9, Node >= 20).

**Real Code enthält nur `apps/web`.** `services/` und `packages/` sind im
`pnpm-workspace.yaml` deklariert, aber leer oder nicht vorhanden. Erfinde keine
Pfade unter `services/` oder `packages/` — prüfe vorher, ob sie existieren.

### apps/web

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS,
`@supabase/supabase-js` als Dependency deklariert.

**Phase 1B:** Shell sichtbar, Nutrition read-only gegen lokale DB.
Keine Writes, kein Auth, keine Live-Userdaten.

### Datenbank

Live-Schema liegt in `supabase/migrations/` (EAV-Core, Aliase, Kategorie-Hierarchie).
`db/schema/nutrition.sql` ist ein **nicht verdrahteter** Diary-Entwurf — nicht als
aktuellen Stand behandeln.

---

## Aktueller Ist-Zustand

`docs/ist-zustand/` — Read-only Repo-Inventar (Stand 2026-07-30):

| Datei | Inhalt |
|---|---|
| `00-overview.md` | Repo-Grundgerüst, Routen, Stack |
| `01-nutrition.md` | Nutrition-Modul Ist-Zustand |
| `02-nutrition-spec-code-abgleich.md` | Spec vs. Code Abgleich |
| `03-todo.md` | Offene Punkte |
| `04-adr-liste.md` | ADR-Übersicht |

Das ist die verlässlichste Beschreibung des Repos. Bei Widerspruch zu älteren
Docs gilt: Code > `docs/ist-zustand/` > alles andere.

---

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe.
- Keine Commits oder Pushes ohne Tom.
- Markdown-Dateien nur per `write_file` mit vollständigem Inhalt schreiben —
  `edit_block` zerstört Tabellen.
- Ein logischer Change pro Commit.
- Keine alten BrainstormDocs als Current Truth verwenden.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.

---

## Altlasten — nicht verwenden

Governance ist in ein **eigenes Repo** umgezogen. Was hier noch liegt, ist Rest:

```
system/                          — Dispatcher, Control-Plane, State, Approval, Reports
AGENTS.md                        — Agent-Registry (Sparks, Routing)
docs/project/USER_MANUAL.md
docs/project/WORKORDER_CREATION_HANDBOOK.md
docs/project/DOCS_GOVERNANCE.md
docs/project/prompts/MASTERPROMPT_*.md
SESSION_ONBOARDING.md
STACK_REFERENCE.md
```

Diese Dateien beschreiben Workorders, Risk-Categories, Spark-Routing und
Review-Pipeline. **Nichts davon gilt in diesem Repo.** Nicht als Referenz lesen,
nicht darauf verweisen, keine Workorders erzeugen.

Wenn Tom nach Governance fragt: das gehört ins Governance-Repo, nicht hierher.

---

## gstack

Installed: v1.60.1.0 at `~/.claude/skills/gstack`.
Telemetry hard-disabled via `~/.gstack/config.yaml` (telemetry, update_check,
auto_upgrade, artifacts_sync all off).
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

**Hinweis:** gstack-Skills die auto-committen oder auto-pushen (`/ship`,
`/land-and-deploy`) brauchen weiterhin explizite Tom-Freigabe per `Schreibregeln`.

---

<!-- IJFW-MEMORY-START (managed -- do not edit manually) -->
<!-- IJFW-MEMORY-END -->
