# Sitzung — Governance-Cluster archiviert

**Auftrag vom:** 2026-08-03 · **Durchführung abgeschlossen:** 2026-08-04
**Ankerhash bei Start:** 7a15db1 (verifiziert, HEAD unverändert)
**Auslöser:** Dispatch-Vorfall 2026-08-03 — der Scheduler versuchte bei einem
gewöhnlichen `pnpm dev`, `WO-e2e-1777085851593` und `WO-e2e-1777098883305` an
`spark_b` zu dispatchen; abgelehnt nur, weil die Agent-Registry den Namen nicht
kannte. Details: `_archive/governance/README.md`.

---

## Ergebnis: erledigt

Der gesamte Governance-Cluster liegt unter `_archive/governance/`, verschoben
ausschliesslich per `git mv`. **Nichts wurde gelöscht, nichts committet** — der
Index enthält die Umbenennungen, der Commit ist Toms Entscheidung.

### Verschobene Dateien je Bereich — `[cmd]` aus `git status --porcelain`

| Bereich | Ziel | getrackte Dateien (R) |
|---|---|---|
| `system/` | `_archive/governance/system/` | 349 |
| `services/` (wo-classifier, scheduler-api, sat-check, orchestrator-api, governance-compiler) | `_archive/governance/services/` | 36 |
| `packages/` (wo-core, graph-core, agent-core, scheduler-core, execution-token, vllm-client, supabase-clients) | `_archive/governance/packages/` | 36 |
| `tools/scripts/` (32 Dateien) + `tools/package.json` | `_archive/governance/tools-scripts/` | 33 |
| `apps/web` (src/app/governance 10 Seiten, src/app/api/governance 2 Routen, components/governance, lib/governance, e2e-Smoke-Spec) | `_archive/governance/apps-web-governance/` | 21 |
| `playwright.governance.config.ts` | `_archive/governance/` | 1 |
| **Summe** | | **476** |

`[cmd]` `git status --porcelain`: 476 R-Einträge, **0 D-Einträge**. Nicht-R:
die 3 vorbestehenden `M` (`.claude/settings.json`, `AGENTS.md`, `CLAUDE.md` —
ijfw, nicht Teil dieses Auftrags), die 5 Verweis-Bereinigungen (unten) und das
neue, untrackte `_archive/governance/README.md`.

Hinweis zur Zahl 445 für `system/`: 349 ist die Zahl der **getrackten**
Dateien. Die untracked Runtime-Dateien (`state/*.jsonl`, `approval/*.json`,
`reports/…`) sind physisch mitgewandert und durch die angepassten
`.gitignore`-Pfade wieder ignoriert — nichts ging verloren.

---

## Schritt 1 — tools/scripts/: 36 Dateien einzeln geprüft

**Gerettet (bleiben in `tools/scripts/`), Begründung je Datei `[read]`:**

1. `check-supabase.ps1` — generisch: listet `\dt public.*`, angewendete
   Migrationen, Migrationsdateien. Kein Governance-Bezug.
2. `repo-status.ps1` — zählt Dateien je Root-Verzeichnis. Generisches
   Repo-Werkzeug.
3. `start-claude-mem.ps1` — startet `claude-mem` (Dev-Tooling), kein
   Governance-Bezug.
4. `start-lightrag.ps1` — startet den LightRAG-Index-Server aus
   `tools/lightrag/` (Codebasis-Indexierung), kein Governance-Bezug.

**Abweichung von der Kandidatenliste in `10-workspace.md`** („höchstens
check-supabase, repo-status, seed.sql, check-enums.sql"):

- `seed.sql` — `[read]` `INSERT INTO workorders … 'WO-fresh-001' …` plus
  `wo_failure_events`-Seeds. Das ist Workorder-Testdaten-Seeding → **Governance,
  archiviert**.
- `check-enums.sql` — `[read]` `enum_range(NULL::wo_state)`. Prüft das
  WO-State-Enum → **Governance, archiviert**.
- `check-serena.md` — `[read]` Volltext: Checks 3–5 proben explizit
  `packages/wo-core/src/schema.ts` (WorkOrder, WOBatch) und
  `services/scheduler-api` (`fetchReadyWOs`) als Symbolziele. Das Dokument ist
  ohne den Cluster tot → **Governance, archiviert**.

**Archiviert (32):** die 4 Spark-Benchmarks, `check-all-services.ps1`
(Ports 9000–9005), `check-dgx.ps1`/`check-spark-b.ps1` (Spark-Knoten via SSH),
`check-enums.sql`, `check-grafana.ps1`/`test-grafana-query.ps1`/`start-grafana.ps1`/
`start-monitoring.ps1` (WO-Dashboard-Stack, admin/lumeos2026), `check-serena.md`,
`commit-phase7.ps1` (Governance-Commit-Skript), `fix-docker-spark-b.sh`,
`generate-ed25519-keys.ts` (Execution-Token-Keys), `insert-test-workorders.ps1`,
`nvidia_metrics.ps1` (GPU-Metriken für den Monitoring-Stack), `seed-test-workorders.ps1`,
`seed.sql`, `start-all.ps1` („Control Plane Startup"), `start-nemotron-spark-a.sh`,
`test-classifier.ts`, `test-control-plane-e2e.ts`, `test-e2e-full-pipeline.ts`,
`test-first-real-wo.ts`, `test-spark-a{,-simple}.{json,ps1}`, `test-vllm.{json,ps1}`.

Dazu `tools/package.json` (`@lumeos/tools`): `[read]` Scripts
`test:control-plane`/`test:first-real-wo`, Deps auf wo-core, vllm-client,
execution-token → archiviert. `tools/` ist damit kein Workspace-Package mehr;
der Eintrag `tools` in `pnpm-workspace.yaml` zeigt auf ein Verzeichnis ohne
`package.json` und wird von pnpm/turbo ignoriert (belassen, s. u.).

---

## Zwischenfall: Verzeichnissperre durch den laufenden Dev-Server

- `[cmd]` `git mv` auf `apps/web/src/app/governance`, `app/api/governance` und
  `lib/governance` schlug mit `Permission denied` fehl; `components/governance`
  und die e2e-Spec liessen sich verschieben.
- Fehldiagnose zuvor korrigiert: mein `netstat`-Check filterte auf `LISTENING`,
  deutsches Windows schreibt aber **„ABHÖREN"** — deshalb schien Port 3200 frei.
  `[cmd]` Die Prozessliste zeigte die laufende Kette `pnpm dev` (81244) →
  turbo (5144) → `next dev -p 3200` (80320). Next hielt Watcher-Handles auf
  genau den drei Verzeichnissen.
- `[cmd]` `taskkill //PID 81244 //T //F` — die komplette Dev-Kette (11 Prozesse)
  beendet; danach liefen alle drei `git mv` fehlerfrei.
  **Tom muss `pnpm dev` bei Bedarf neu starten** (starte ich vereinbarungsgemäss
  nicht selbst). Der Server lief zu dem Zeitpunkt ohnehin gegen einen halb
  verschobenen Baum.

---

## Verweis-Bereinigung (5 Dateien)

1. `apps/web/src/components/shell/app-shell.tsx` — toter Early-Return-Zweig
   `if (pathname === '/governance' …)` entfernt (Z. 254–256).
2. `apps/web/src/components/ui/placeholder-page.tsx` — Prosa „governance-korrekt
   freigegeben" → „freigegeben" (der Prozess existiert hier nicht mehr).
3. Root-`package.json` — Script `governance:ui:smoke` entfernt.
4. Root-`tsconfig.json` — die vier `paths` auf `@lumeos/{wo-core,graph-core,agent-core,scheduler-core}` entfernt (zeigten ins Archiv).
5. `.gitignore` — die 14 `system/…`-Runtime-Einträge auf
   `_archive/governance/system/…` umgeschrieben, damit die mitverschobenen
   Runtime-Dateien ignoriert bleiben.

`pnpm-workspace.yaml` und `turbo.json` `[read]`: nur Wildcards bzw. generische
Tasks, kein namentlicher Verweis — unverändert.

---

## Verifikation

1. **`pnpm typecheck`** `[cmd]`: Exit 0. Turbo: **„Packages in scope: 4"** —
   `@lumeos/web`, `@lumeos/shared`, `@lumeos/types`, `@lumeos/nutrition-api` —
   exakt die erwarteten vier. Ausgeführt wurden 2 Tasks (web, nutrition-api):
   `[read]` `shared` und `types` definieren kein `typecheck`-Script — das war
   auch vor der Archivierung so.
2. **Verwaisten-Grep** `[cmd]` (`governance|workorder|wo-core|spark|system/`,
   ohne `_archive/`, `docs/`, `supabase/`, `backup/`): **kein Treffer in aktivem
   Code oder aktiver Konfiguration.** In `apps/web` verbleiben zwei
   Fehlalarme („StrengthSparklines", „docs/design-system/") und die
   Dashboard-Prosa (unten).
3. **`git status`** `[cmd]`: vollständig geprüft — 476 R, **0 D** (siehe Tabelle).

---

## Verbliebene Verweise und warum sie bleiben

- **`apps/web/src/app/dashboard/page.tsx` (Z. 8, 128)** — Status-Chip
  „Governance Boundary / Kein Product Truth, keine Queue" und der
  Boundary-Disclaimer. Reine Anzeige-Prosa, keine Kopplung (kein Import, keine
  Route, kein Pfad). Umformulieren ist eine Produkttext-Entscheidung → Tom.
- **Altlast-Doku und -Configs ausserhalb des Auftrags-Umfangs:** `AGENTS.md`,
  `CLAUDE.md` (Altlasten-Abschnitt), `CLAUDE.md.v1.bak`, `SESSION_ONBOARDING.md`,
  `STACK_REFERENCE.md`, `COMMANDS.md`, Root-`README.md`, `artefakt.json`,
  `project.profile.json`, `.agents/`, `.codex/`, `.claude/agents|skills|hooks`
  (Spark-/WO-Agentendefinitionen, ausgehängte Hooks), `.cursorrules` — im
  Auftrag nicht als zu verschieben genannt; Kandidaten für eine Folgerunde.
- **`infra/`** (Prometheus-Scrape der Sparks, systemd-Units spark-a…d,
  Grafana-Dashboards, vLLM-Setups) — Governance-Hardware-Infrastruktur,
  ausserhalb des deklarierten Umfangs.
- **`.env.example`, `.github/workflows/ci.yml`** (deaktiviert seit 2026-04)
  — Spark-/Governance-Variablen bzw. -Reste; nicht im Umfang.
- **`pnpm-lock.yaml`** — enthält noch die archivierten Workspace-Packages;
  bereinigt sich mit Toms nächstem `pnpm install`.
- **Lokale Tool-Bestände:** `tools/{obsidian,onyx,repomix,lightrag,lean-ctx}`-
  Configs/Seeds und `.serena/`-Memories erwähnen Governance-Begriffe —
  generierte bzw. lokale Wissensstände, keine aktive Konfiguration des Produkts.
- **`docs/` insgesamt** — Berichte über Geschehenes, laut Auftrag in Ordnung.
  Beachte: `docs/ssot/10-workspace.md` und `50-governance-rest.md` beschreiben
  jetzt den Zustand **vor** der Archivierung (Folgeaktualisierung sinnvoll).
- **DB-Anteil bleibt bewusst:** die vier Control-Plane-Tabellen in `public`
  und ihre zwei Migrationen unter `supabase/` — Entfernen wäre ein
  Datenbankeingriff (laut Auftrag nicht anfassen).

---

## Auswirkungen auf TODO (nur benannt, TODO.md nicht angefasst)

- **D-10 (Port-Kollision 9000 im Governance-Rest):** hinfällig — der Rest ist
  archiviert; genau der im Punkt vorgesehene Fall („Bei Entfernung hinfällig").
- **D-04 (E2E-/Testbasis):** Ist-Beschreibung überholt — `apps/web/e2e/` ist
  jetzt leer, `playwright.governance.config.ts` archiviert. Der offene Kern
  (E2E für Produktrouten) bleibt.
- **B-05 (Hook-Dateien):** `post-tool.ps1` schreibt nach
  `system/state/audit.jsonl` — der Pfad existiert nicht mehr; die ohnehin
  ausgehängten Hooks sind jetzt zusätzlich zielos.
- **AK-6-Restposten aus M1 Teil C:** der letzte Shell-Zugriff in `apps/web`
  (`command-runner.ts`, spawnt `system/`-Skripte) ist mit der Konsole
  archiviert — `apps/web` enthält keinen `child_process`-Aufruf mehr.

## Offen für Tom

1. Commit der 476 Umbenennungen + 5 Bereinigungen (ein logischer Change).
2. `pnpm dev` bei Bedarf neu starten (Dev-Kette wurde wegen der
   Verzeichnissperre beendet).
3. Entscheidung über die Folgerunde (Altlast-Doku/`.claude`-Agenten/`infra/`,
   Dashboard-Prosa, SSOT-Aktualisierung 10/50).
