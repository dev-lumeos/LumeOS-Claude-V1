# Agent Instructions — LumeOS

<!-- lean-ctx -->
## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: @LEAN-CTX.md
<!-- /lean-ctx -->

---

## Kontext

Produkt-Repo für LumeOS. Tom arbeitet hier **direkt** mit Claude, Claude Code
und Codex. Kein Workorder-Workflow, keine Governance-Pipeline, keine
Spark-Agent-Registry.

Ausführliche Runtime-Instructions: `CLAUDE.md`

---

## Repo-Struktur

Monorepo (Turborepo + pnpm 9, Node >= 20).

**Berichtigt 2026-08-06 (A-10).** Hier stand: „Real Code enthält nur
`apps/web`. `services/` und `packages/` sind im `pnpm-workspace.yaml`
deklariert, aber leer oder nicht vorhanden." Das ist überholt.
`[cmd]` 2026-08-06: der Workspace hat **vier** Projekte —
`apps/web`, `packages/shared` (verdrahtet, Supabase-Clients),
`services/nutrition-api` (unverdrahtet, Gerüst; siehe C-08) und das
Wurzelpaket. `packages/types` wurde am 2026-08-06 entfernt (C-07).
Der Rat bleibt richtig, nur die Begründung war falsch: **keine Pfade
erfinden — vorher prüfen, ob sie existieren.** Der Ist-Zustand steht in
`docs/ssot/00-INDEX.md`, nicht hier.

### apps/web

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS,
`@supabase/supabase-js` als Dependency deklariert.

**Phase 1B:** Shell sichtbar, Nutrition read-only gegen lokale DB.
Keine Writes, kein Auth, keine Live-Userdaten.

### Datenbank

Live-Schema in `supabase/migrations/` (EAV-Core, Aliase, Kategorie-Hierarchie).
`db/schema/nutrition.sql` ist ein **nicht verdrahteter** Diary-Entwurf — nicht
als aktuellen Stand behandeln.

---

## Referenzen

`docs/ist-zustand/` — Read-only Repo-Inventar (Stand 2026-07-30), verlässlichste
Beschreibung des Repos.

Bei Widerspruch gilt: **Code > `docs/ist-zustand/` > alles andere.**

---

## Schreibregeln

- Keine Codeänderung ohne explizite Freigabe von Tom.
- Keine Commits oder Pushes ohne Tom.
- Markdown-Dateien nur mit vollständigem Inhalt neu schreiben — partielle
  String-Edits zerstören Tabellen.
- Ein logischer Change pro Commit.
- Bei Unsicherheit: im Repo nachsehen, nicht raten.

---

## Altlasten — nicht verwenden

Governance ist in ein **eigenes Repo** umgezogen. Was hier noch liegt, ist Rest:

```
system/                          — Dispatcher, Control-Plane, State, Approval, Reports
SESSION_ONBOARDING.md
STACK_REFERENCE.md
docs/project/USER_MANUAL.md
docs/project/WORKORDER_CREATION_HANDBOOK.md
docs/project/DOCS_GOVERNANCE.md
docs/project/prompts/MASTERPROMPT_*.md
```

Diese Dateien beschreiben Workorders, Risk-Categories, Spark-Routing (A–D),
Approval-Queue und Review-Pipeline. **Nichts davon gilt in diesem Repo.**
Nicht als Referenz lesen, nicht darauf verweisen, keine Workorders erzeugen.

Die frühere Agent-Registry (`agents.json`, `model_routing.json`, Spark-Hardware-
Tabellen) stand an dieser Stelle und gehört jetzt ins Governance-Repo.

---

<!-- IJFW-MEMORY-START -->
Project memory at .ijfw/memory/. Call `ijfw_memory_prelude` for full context.
<!-- IJFW-MEMORY-END -->

<!-- IJFW-AGENTS-START -->
No project agents yet. Run `ijfw team` to set them up.
<!-- IJFW-AGENTS-END -->
