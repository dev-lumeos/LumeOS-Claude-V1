# Governance-Rest — was physisch bleibt und warum

**Stand:** 2026-08-01
**Methode:** `[cmd]` Greps auf `system/`-Importe, Ports, Commit-Historie;
Verzeichnislisten `system/`, `.github/workflows/`; `[read]` `pnpm-workspace.yaml`,
`turbo.json`, `ci.yml`-Kopf, `system/README.md`-Kopf, `tools/package.json`,
`snapshot.ts`, `command-runner.ts`. Package-Einordnung übernommen aus
`10-workspace.md`.

---

## Der Umzug

`[read]` `CLAUDE.md:66` und `AGENTS.md:172`: „Governance ist in ein **eigenes
Repo** umgezogen. Was hier noch liegt, ist Rest." Der einzige Fundort eines
Repo-Namens: `[read]` `docs/specs/Admin/SPEC_01_UI_DESIGN.md:16` —
„Governance Console = Workorder-Execution-System (in **AI-Governance-Core**,
separates Repo)".

`[cmd]` Commit-Kette des Schnitts: `6f36ef5` (blueprint core extraction) →
`02fcc85` (prepare phase 0) → `11dcfa3` (complete phase 0) → `7798dcf` /
`719f3b7` / `cf7f890` (CLAUDE.md, AGENTS.md, gstack-Notizen auf
Direct-Work-Repo umgeschrieben).

**Es existiert keine dokumentierte Entscheidung, die physischen Reste zu
löschen.** `[cmd]` `docs/decisions/` enthält nur `.gitkeep`. Status: bleibt,
bis Tom entscheidet.

---

## Was physisch da ist

### Die 13 Governance-Packages

Einordnung und interne Abhängigkeiten: `[read]` Tabelle in `10-workspace.md`
(dort `[cmd]`-belegt). Zweck je Package (Ports `[cmd]` aus `src/index.ts`
verifiziert):

| Package | Zweck |
|---|---|
| `packages/wo-core` | Wurzel des Clusters: Workorder-Datenmodell, Schemata, Governance-Artefakt- und Execution-Token-Typen. Alle anderen hängen direkt oder indirekt daran. |
| `packages/graph-core` | WO-Abhängigkeitsgraph: Validierung, Readiness |
| `packages/agent-core` | Agenten-Registry-Typen |
| `packages/scheduler-core` | Priorität und Slots |
| `packages/execution-token` | Signieren/Verifizieren von Execution-Tokens (`@noble/ed25519`) |
| `packages/vllm-client` | vLLM-Inferenz-Client + triple-hash |
| `packages/supabase-clients` | Service-Role-Supabase-Clients „for Control Plane operations" |
| `services/wo-classifier` | deterministischer Pre-Router, `[cmd]` Default-Port 9000 |
| `services/scheduler-api` | Dispatch-Service, `[cmd]` Default-Port 9002; **importiert direkt aus `system/`** (siehe unten) |
| `services/sat-check` | Pre-Execution-Gate, `[cmd]` Default-Port 9001 |
| `services/orchestrator-api` | Entry Point (`/graph`, `/scheduler`, `/retry`), `[cmd]` Default-Port 9000 — **kollidiert mit wo-classifier** (`process.env.PORT` vs. `WO_CLASSIFIER_PORT`) |
| `services/governance-compiler` | Compile-Service, `[cmd]` Default-Port 9003 |
| `tools/` (`@lumeos/tools`) | `[read]` E2E-Skripte Control Plane; deps auf wo-core, vllm-client, execution-token. `tools/scripts/` (36 Dateien, ohne eigene package.json): Spark-Benchmarks, WO-Seeding, Grafana/vLLM-Starter. |

### `system/` — 5,2 MB, getrackt

`[cmd]` 19 Unterordner + 8 Top-Level-Markdowns. `[read]` `system/README.md`:
„Status: MIXED ACTIVE CORE / SUPPORT / GENERATED EVIDENCE / PLACEHOLDER /
ARCHIVE … Do not treat every folder here as equally active."
`[annahme]` Binnengliederung laut README: Active Core (`agent-registry/`,
`approval/`, `control-plane/`, `project-profiles/`, `state/`, `workers/`,
`workorders/`), Support (`memory/`, `model-tiers/`, `policies/`, `prompts/`,
`decomposition/`), Generated Evidence (`reports/`), Rest Platzhalter —
Klassifikation nicht Datei für Datei nachgeprüft; maßgeblich laut README:
`docs/project/system-structure/SYSTEM_TREE_AUDIT.md`.

### DB-Anteil

2 Migrationen im Nutrition-Migrationsordner: `20260423120000_control_plane_tables.sql`
(workorders, governance_artefacts, execution_tokens, wo_failure_events) und
`20260424_002_wo_classifier_fields.sql`. Details: `30-datenbank.md`.

### Sonstiges (getrackt)

`[read]` Liste aus `10-workspace.md`: `AGENTS.md`, `SESSION_ONBOARDING.md`,
`STACK_REFERENCE.md`, `.agents/`, `.codex/`, `playwright.governance.config.ts`,
`artefakt.json`, `COMMANDS.md`, `.cursorrules` — plus die Governance-Teile von
`docs/project/` (TODO A-03).

---

## Kosten der Entfernung — der Kernbefund

Die Entfernbarkeit ist **zweigeteilt**. Die frühere Formulierung in
`10-workspace.md` („könnten entfernt werden, ohne dass `apps/web` es bemerkt")
galt nur für die Packages und ist dort inzwischen präzisiert.

### 1. Packages + Services löschen: billig

- `[cmd]` `apps/web` hat 0 `@lumeos/*`-Importe — kein Produktbezug.
- `[read]` `pnpm-workspace.yaml` (nur Wildcards `apps/*`, `services/*`,
  `packages/*`, `tools`) und `turbo.json` (nur generische Tasks) nennen kein
  Package namentlich — Löschen erfordert keine Config-Änderung.
- `[read]` CI ist seit 2026-04-23 deaktiviert (`ci.yml`: „DISABLED",
  `on: workflow_dispatch` only) — keine Pipeline bricht.
- Einzige Nacharbeit: Root-Script `governance:ui:smoke` und
  `playwright.governance.config.ts` zeigen dann ins Leere.

### 2. `system/` löschen: bricht Produkt-Code

`[cmd]` Grep 2026-08-01 — vier direkte Importe über die Workspace-Grenze:

- `services/scheduler-api/src/index.ts:14` → `system/control-plane/dispatcher`
- `services/scheduler-api/src/wo-adapter.ts:16` → ebenda (Typ-Import)
- `services/scheduler-api/src/workorder-repository.ts:9–10` →
  `system/control-plane/dispatcher` + `system/approval/approval-gate`

Und — entscheidend — **`apps/web` selbst hängt an `system/`**:

- `[read]` `apps/web/src/lib/governance/snapshot.ts:8` — statischer TS-Import
  `system/project-profiles/project-profile-loader`. Ohne `system/` schlägt
  `pnpm typecheck` für `apps/web` fehl.
- `[read]` `command-runner.ts` (Z. 50–90) spawnt zur Laufzeit
  `system/workorders/cli/…`, `system/control-plane/…`, `system/approval/…`,
  `system/reports/…`.
- `[cmd]` 10 `/governance`-Routen und die einzige E2E-Spec
  (`governance-ui.browser-smoke.spec.ts`) sitzen darauf.

**Konsequenz:** `system/`, `services/scheduler-api`,
`apps/web/src/lib/governance/` + `/governance`-Routen +
`playwright.governance.config.ts` bilden einen Verbund — entfernbar nur
gemeinsam und nur mit Eingriff in `apps/web`.

---

## Regel für die Arbeit in diesem Repo

Nichts aus `system/`, `AGENTS.md` oder den Workorder-Handbüchern als aktuelle
Anweisung lesen (`[read]` CLAUDE.md „Altlasten"). Die Governance-**Konsole** in
`apps/web` ist davon unberührt lauffähiger Code — sie zu entfernen ist eine
Produktentscheidung (Verbund oben), keine Aufräumaktion.
