# _archive/governance — stillgelegter Governance-Cluster

**Archiviert:** 2026-08-03 (per `git mv`, Historie erhalten)
**Herkunft:** Workorder-/Control-Plane-System aus der Governance-Ära dieses Repos.
Die Governance-Arbeit selbst ist in ein eigenes Repo umgezogen (AI-Governance-Core);
was hier liegt, ist der physische Rest, der bis zum 2026-08-03 unverändert im
Workspace stand.

---

## Warum jetzt archiviert wurde: der Dispatch-Vorfall vom 2026-08-03

Bei einem gewöhnlichen `pnpm dev` hat der Scheduler des Clusters versucht, zwei
Workorders zu dispatchen:

- `WO-e2e-1777085851593` → `spark_b`
- `WO-e2e-1777098883305` → `spark_b`

Der Dispatch wurde **nur deshalb abgelehnt, weil die Agent-Registry den Namen
`spark_b` nicht kannte** — nicht durch eine Absicherung. Die Auslösequelle ist
ungeklärt: die vier Workorders in `public.workorders` stammen vom April 2026 und
tragen UUIDs; die dispatchten IDs sind keine UUIDs. Der Cluster war nicht tot,
er war unbeaufsichtigt. Deshalb wurde er vollständig aus den aktiven
Workspace-Pfaden entfernt.

---

## Was hier liegt

| Ordner | Herkunft | Inhalt |
|---|---|---|
| `apps-web-governance/` | `apps/web/src/{app,app/api,components,lib}/governance/` + `apps/web/e2e/` | Governance-Konsole: 10 Seiten, 2 API-Routen, Komponenten, `snapshot.ts`/`command-runner.ts`, Browser-Smoke-Spec |
| `packages/` | `packages/` | wo-core, graph-core, agent-core, scheduler-core, execution-token, vllm-client, supabase-clients |
| `services/` | `services/` | wo-classifier (9000), sat-check (9001), scheduler-api (9002), governance-compiler (9003), orchestrator-api |
| `tools-scripts/` | `tools/scripts/` + `tools/package.json` | 32 Skripte (Spark-Benchmarks, WO-Seeding, Control-Plane-E2E, Grafana/Prometheus, vLLM/Nemotron) und das `@lumeos/tools`-Package |
| `system/` | `system/` | Dispatcher, Control Plane, Agent-Registry, Approval, State, Reports (inkl. untracked Runtime-Dateien, die mitverschoben wurden) |
| `playwright.governance.config.ts` | Repo-Root | Playwright-Config der Governance-UI-Smoke-Tests |

In `tools/scripts/` verblieben sind nur die vier produktneutralen Dateien
`check-supabase.ps1`, `repo-status.ps1`, `start-claude-mem.ps1`,
`start-lightrag.ps1`.

**Nicht hier:** die vier Control-Plane-Tabellen in `public`
(`workorders`, `governance_artefacts`, `execution_tokens`, `wo_failure_events`)
und ihre zwei Migrationen liegen weiterhin in `supabase/` — ihr Entfernen ist
ein Datenbankeingriff und eine eigene Entscheidung.

---

## Regeln

1. **Nicht reaktivieren.** Nichts hieraus starten, bauen oder in Workspace-,
   Turbo- oder CI-Konfiguration zurückverdrahten.
2. **Nicht als Referenz zitieren.** Diese Dateien beschreiben keinen gültigen
   Zustand des Repos.
3. Wer etwas hieraus braucht, **kopiert es bewusst** an den Zielort und
   versieht die Kopie mit einem Statuskopf (Herkunft, Datum, Zweck).
