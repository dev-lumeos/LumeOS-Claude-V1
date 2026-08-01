# Workspace-Inventar

**Stand:** 2026-08-01
**Methode:** `[cmd]` Scan über `apps/`, `services/`, `packages/`, `tools/`;
`package.json` je Verzeichnis gelesen, TS/TSX gezählt (ohne `node_modules`, `dist`, `.next`),
interne `@lumeos/*`-Abhängigkeiten extrahiert. Verifiziert mit `pnpm typecheck`.

---

## Kennzahlen

`[cmd]` **59 Verzeichnisse** im Workspace deklariert.
`[cmd]` **17 davon** haben eine `package.json` und enthalten Code.
`[cmd]` **42 davon** sind leere Gerüste — Absicht, siehe `11-zielarchitektur.md`.
`[cmd]` `pnpm typecheck` 2026-08-01: **17/17 Packages, 0 TypeScript-Fehler, 3,9 s**.

---

## Der zentrale Befund

`[cmd]` **`apps/web` hat null `@lumeos/*`-Abhängigkeiten und null `@lumeos/`-Importe.**

Seine Abhängigkeiten sind ausschliesslich `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `@supabase/ssr`.

Der gesamte `packages/`- und `services/`-Baum hängt damit nicht am Produkt.
13 der 17 lebenden Packages bilden einen geschlossenen Governance-Cluster,
alle an `@lumeos/wo-core` verwurzelt. Sie könnten entfernt werden, ohne dass
`apps/web` es bemerkt.

---

## Die 17 lebenden Packages

| Pfad | Package | TS | Interne Deps | Einordnung | Beleg |
|---|---|---|---|---|---|
| `apps/web` | `@lumeos/web` | 71 | keine | **Produkt, lebend** | `[cmd]` |
| `services/nutrition-api` | `@lumeos/nutrition-api` | 4 | keine | Produkt, unverdrahtet | `[cmd]` |
| `packages/shared` | `@lumeos/shared` | 3 | keine | Produkt, unverdrahtet | `[read]` |
| `packages/types` | `@lumeos/types` | 3 | keine | Produkt, unverdrahtet | `[read]` |
| `packages/wo-core` | `@lumeos/wo-core` | 7 | keine | Governance | `[cmd]` |
| `packages/graph-core` | `@lumeos/graph-core` | 4 | keine | Governance | `[cmd]` |
| `packages/agent-core` | `@lumeos/agent-core` | 3 | keine | Governance | `[cmd]` |
| `packages/scheduler-core` | `@lumeos/scheduler-core` | 4 | wo-core | Governance | `[cmd]` |
| `packages/execution-token` | `@lumeos/execution-token` | 3 | wo-core | Governance | `[cmd]` |
| `packages/vllm-client` | `@lumeos/vllm-client` | 3 | wo-core | Governance | `[cmd]` |
| `packages/supabase-clients` | `@lumeos/supabase-clients` | 1 | keine | Governance (Control Plane) | `[read]` |
| `services/wo-classifier` | `@lumeos/wo-classifier` | 10 | wo-core | Governance | `[cmd]` |
| `services/scheduler-api` | `@lumeos/scheduler-api` | 8 | 6 Pakete | Governance | `[cmd]` |
| `services/sat-check` | `@lumeos/sat-check` | 5 | wo-core | Governance | `[cmd]` |
| `services/orchestrator-api` | `@lumeos/orchestrator-api` | 4 | 4 Pakete | Governance | `[cmd]` |
| `services/governance-compiler` | `@lumeos/governance-compiler` | 2 | wo-core, vllm-client | Governance | `[cmd]` |
| `tools/scripts` | (kein package.json) | 5 | – | Governance, 36 Dateien | `[cmd]` |

### Begründung der Einordnung

`[read]` **`packages/shared`** exportiert `createBrowserClient` und einen Server-Client
über `@supabase/ssr` — genau das Paket, das `apps/web` als Abhängigkeit führt.
Produktcode, vorbereitet, aber nicht importiert.

`[read]` **`packages/types`** enthält Nutrition-Domänentypen (`ProcessingLevel`,
`TagType`, `FoodAliasSource`), passend zum Live-EAV-Schema. Produktcode, nicht importiert.

`[read]` **`packages/supabase-clients`** sagt im Quelltext selbst: „Provides authenticated
Supabase clients for Control Plane … Use for Control Plane operations (scheduler,
orchestrator, sat-check)". Nutzt `SUPABASE_SERVICE_ROLE_KEY`. Governance.

`[cmd]` **`tools/scripts`** enthält 36 Dateien: Spark-Benchmarks, Workorder-Seeding,
Control-Plane-E2E, Grafana, vLLM, Nemotron. Produktneutral bleiben höchstens
`check-supabase.ps1`, `repo-status.ps1`, `seed.sql`, `check-enums.sql`.

---

## Die 42 leeren Gerüste

`[cmd]` Verzeichnis vorhanden, keine `package.json`, kein Code.
**Diese Ordner bleiben.** Sie sind der spezifizierte Endausbau, kein Zerfall.
Begründung und Zielbild: `11-zielarchitektur.md`.

| Bereich | Verzeichnisse |
|---|---|
| `apps/` (5) | admin, buddy, coach, mobile, staff |
| `packages/` (10) | branch-db-core, config, contracts, memory-core, prompts, retrieval-core, rules, skills, tool-adapters, ui |
| `services/` (12) | admin-api, analytics-api, auth-api, coach-api, goals-api, marketplace-api, medical-api, memory-api, recovery-api, retrieval-api, supplements-api, training-api |
| `tools/` (15) | bootstrap, gstack, ingestion, lean-ctx, lightrag, migrations, node_modules, obsidian, onyx, paperclip, qdrant, repomix, rtk, serena, validators |

**Wichtig für künftige Scans:** Ein Scan ohne Shell sieht hier leere Ordner und
schliesst fälschlich, der Workspace sei leer. Genau das ist am 2026-07-30 passiert.
Vor einer solchen Aussage immer `pnpm typecheck` laufen lassen.

---

## Root-Ebene

`[cmd]` Ermittelt per `git ls-files` und Grössenmessung.

### Produktiv und getrackt

`apps/` (116 MB) · `docs/` (70 MB) · `db/` · `supabase/` · `infra/` · `tools/` (3,2 MB)
· `package.json` · `pnpm-workspace.yaml` · `turbo.json` · `tsconfig.json` · `README.md`
· `.gitignore` · `.env.example`

### Getrackt, aber Altlast

`system/` (5,2 MB) · `.agents/` · `.codex/` · `AGENTS.md` · `SESSION_ONBOARDING.md`
· `STACK_REFERENCE.md` · `CLAUDE.md.v1.bak` · `playwright.governance.config.ts`
· `artefakt.json` · `COMMANDS.md` · `.cursorrules`

### Untracked, wegwerfbar

`temp/` (**16,5 GB**) · `tmp/` (31 MB) · `.ijfw/` (6 MB) · `.wayland-core/` (2,4 MB)
· `.wayland/` · `ijfw/` · `_tmp_inventory/` · `backup_system.zip` · `services.zip`
· `system.zip` · `nul` · `.codex-governance-ui.log` · `.commit-msg.tmp`

### Nicht getrackt, aber behalten

`.env` · `.env.bak.preservicekey` — enthalten Zugangsdaten.
`[cmd]` Beide korrekt in `.gitignore` (Zeile 6 und 7), `git log --all` auf beide: leer.
Der Service-Key war nie in einem Commit.
