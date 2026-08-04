# Governance-Rest — archiviert am 2026-08-03

**Stand:** 2026-08-04
**Methode:** `[cmd]` Verschiebung selbst durchgeführt und per `git status`
verifiziert (Sitzungen 2026-08-03/04); Greps auf verbliebene Verweise;
`[read]` Archiv-README, Seed-Manifest. Historischer Zustand vor der
Archivierung: Vorfassung dieser Datei (Git-Historie, Stand 2026-08-01).

---

## Was passiert ist

Der Governance-Cluster — 13 Packages/Services, `system/`, die
Governance-Konsole in `apps/web`, 32 `tools/scripts`-Dateien, die
Playwright-Governance-Config — liegt seit dem 2026-08-03 unter
**`_archive/governance/`**. `[cmd]` 476 Umbenennungen per `git mv`,
0 Löschungen, Commit `59cb41e`; `tools`-Workspace-Eintrag entfernt
(Commit `71ccf52`).

**Auslöser:** Beim gewöhnlichen `pnpm dev` am 2026-08-03 versuchte der
Scheduler, zwei Workorders (`WO-e2e-1777085851593`, `WO-e2e-1777098883305`)
an `spark_b` zu dispatchen — abgelehnt nur, weil die Agent-Registry den Namen
nicht kannte, nicht durch eine Absicherung. Der Cluster war nicht tot, er war
unbeaufsichtigt. Vollständige Dokumentation samt Regeln (nicht reaktivieren,
nicht als Referenz zitieren): `[read]` `_archive/governance/README.md`.

Der frühere Kernbefund dieser Datei — `system/`, `scheduler-api` und die
Governance-Konsole bilden einen nur gemeinsam entfernbaren Verbund — hat sich
bestätigt: der Verbund wurde gemeinsam verschoben, `apps/web` kompiliert ohne
ihn (`[cmd]` 2026-08-04 `pnpm typecheck` Exit 0, 4 Packages in scope).

## Was wohin verschoben wurde

| Archiv-Ordner | Herkunft | Umfang |
|---|---|---|
| `_archive/governance/apps-web-governance/` | `apps/web/src/{app,app/api,components,lib}/governance/`, `apps/web/e2e/` | 21 Dateien: 10 Seiten, 2 API-Routen, Konsole, `command-runner.ts`/`snapshot.ts`, E2E-Spec |
| `_archive/governance/packages/` | `packages/` | wo-core, graph-core, agent-core, scheduler-core, execution-token, vllm-client, supabase-clients (36 Dateien) |
| `_archive/governance/services/` | `services/` | wo-classifier, scheduler-api, sat-check, orchestrator-api, governance-compiler (36 Dateien) |
| `_archive/governance/tools-scripts/` | `tools/scripts/`, `tools/package.json` | 32 Skripte + `@lumeos/tools` (33 Dateien) |
| `_archive/governance/system/` | `system/` | 349 getrackte Dateien + untracked Runtime-State |
| `_archive/governance/onyx-seed/` | `tools/onyx/seed/` | zweite Governance-Kopie, siehe unten (2026-08-04) |
| `_archive/governance/playwright.governance.config.ts` | Repo-Root | 1 Datei |

In `tools/scripts/` verblieben nur `check-supabase.ps1`, `repo-status.ps1`,
`start-claude-mem.ps1`, `start-lightrag.ps1` (produktneutral, je Datei geprüft —
Begründung: `docs/sessions/2026-08-03-governance-archiviert.md`).

## Die zweite Kopie: der Onyx-Seed (2026-08-04 nachgezogen)

`[cmd]` `tools/onyx/seed/lumeos-governance-current-truth/` enthielt 108 Dateien
(51 md, 32 txt, 24 json): AGENTS.md, CLAUDE.md, SESSION_ONBOARDING.md,
STACK_REFERENCE.md, MASTERPROMPT-Dateien, `system/`-Inhalte als `.txt`.
`[read]` `SEED_MANIFEST.md`: Seed-Paket für das Onyx-Document-Set
`LUMEOS_GOVERNANCE_CURRENT_TRUTH`, erstellt **2026-04-30** — der Name
„current-truth" beschreibt den Stand von vor der Stilllegung.

Per `git mv` nach `_archive/governance/onyx-seed/` (nur 2 der 108 Dateien waren
getrackt; der Rest untracked und physisch mitverschoben, Ignore-Regel folgt dem
neuen Pfad). `[cmd]` Weder `tools/onyx/install.ps1` noch eine docker-compose
referenziert den Seed-Pfad. Rest: `lumeos-governance-current-truth.zip` liegt
untracked unter `tools/onyx/seed/` — `git mv` kann untrackte Dateien nicht
bewegen; Behandlung über die Löschliste.

---

## Was physisch noch im Repo ist

1. **Die vier Control-Plane-Tabellen in `public`** der lokalen Supabase:
   `workorders`, `governance_artefacts`, `execution_tokens`,
   `wo_failure_events` — mit den vier April-Workorders. Ihr Entfernen ist ein
   Datenbankeingriff; Tom arbeitet daran (`[cmd]` 2026-08-04: untracked
   `backup/schema/2026-08-03_public_vor_drop.sql` liegt bereit). Die beiden
   zugehörigen Migrationen liegen seit 2026-08-02 in `supabase/_archive/`.
2. **Altlast-Doku und -Configs** (getrackt, ausserhalb des Archivier-Umfangs):
   `AGENTS.md`, `SESSION_ONBOARDING.md`, `STACK_REFERENCE.md`, `COMMANDS.md`,
   `CLAUDE.md.v1.bak`, `artefakt.json`, `project.profile.json`, `.cursorrules`,
   `.agents/`, `.codex/`, `.claude/agents|skills|hooks` (Spark-/WO-Agenten,
   ausgehängte Hooks) — Kandidaten für eine Folgerunde.
3. **`infra/`-Anteile:** Spark-systemd-Units, vLLM-Setups, Grafana/Prometheus
   des WO-Dashboards — Governance-Hardware-Infrastruktur.
4. **Kleinteile:** Spark-/Governance-Variablen in `.env.example`; deaktivierte
   `ci.yml`; `[cmd]` 27 Erwähnungen archivierter Packages in `pnpm-lock.yaml`
   (bereinigt das nächste `pnpm install`); Governance-Prosa auf
   `/dashboard` (Anzeige-Text, keine Kopplung — Produkttext-Entscheidung).
5. **Der Dispatch-Auslöser ist weiterhin ungeklärt** — die dispatchten
   `WO-e2e-*`-IDs passen zu keiner Zeile in `public.workorders`. Mit dem
   Archiv (kein Code mehr in Workspace-Pfaden) und dem anstehenden Drop der
   Tabellen ist die Angriffsfläche entfernt, die Ursache aber nicht benannt.

---

## Regel für die Arbeit in diesem Repo

Nichts aus `_archive/governance/`, `AGENTS.md` oder den Workorder-Handbüchern
als aktuelle Anweisung lesen. Wer etwas aus dem Archiv braucht, kopiert es
bewusst und versieht die Kopie mit einem Statuskopf — Regeln im Archiv-README.
