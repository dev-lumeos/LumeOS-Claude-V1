# Workspace-Inventar

**Stand:** 2026-08-04 (neu erhoben nach der Governance-Archivierung vom 2026-08-03)
**Methode:** `[cmd]` Scan über `apps/`, `services/`, `packages/`, `tools/`;
`package.json` je Verzeichnis geprüft, TS/TSX gezählt (ohne `node_modules`,
`dist`, `.next`, `.turbo`), interne `@lumeos/*`-Abhängigkeiten gegrept.
Verifiziert mit `pnpm typecheck`. Wo eine Zahl nicht neu gemessen wurde, trägt
sie das Datum der letzten Messung.

---

## Kennzahlen

`[read]` `pnpm-workspace.yaml` deklariert nur noch `apps/*`, `services/*`,
`packages/*` — der `tools`-Eintrag wurde mit Commit `71ccf52` entfernt.
`[cmd]` 2026-08-04:

- **31 Verzeichnisse** unter den Workspace-Globs (6 apps, 13 services, 12 packages).
- **4 davon** haben eine `package.json` und enthalten Code.
- **27 davon** sind leere Gerüste — Absicht, siehe `11-zielarchitektur.md`.
- `pnpm typecheck`: Exit 0, Turbo **„Packages in scope: 4"**, 2 Tasks ausgeführt
  (`web`, `nutrition-api`) — `shared` und `types` definieren kein
  `typecheck`-Script, das war schon vor der Archivierung so.

---

## Die 4 lebenden Packages

| Pfad | Package | TS | Interne Deps | Einordnung | Beleg |
|---|---|---|---|---|---|
| `apps/web` | `@lumeos/web` | 51 | `@lumeos/shared` (workspace:*) | **Produkt, lebend** | `[cmd]` 2026-08-04 |
| `services/nutrition-api` | `@lumeos/nutrition-api` | 4 | keine | Produkt, unverdrahtet | `[cmd]` 2026-08-04 |
| `packages/shared` | `@lumeos/shared` | 3 | keine | **Produkt, verdrahtet** — liefert den Supabase-Service-Client für `apps/web` | `[cmd]` 2026-08-04 |
| `packages/types` | `@lumeos/types` | — | — | **entfernt 2026-08-06 (C-07)** — deklarierte Spalten, die `nutrition.foods` nie hatte, plus das von ADR-0003 verworfene flache Modell; 0 Importer. Per `git revert` wiederherstellbar | `[cmd]` 2026-08-06 |

Der frühere zentrale Befund („`apps/web` hat null `@lumeos/*`-Importe") ist
seit M1 Teil C überholt: `[cmd]` 2026-08-04 genau **ein** Import —
`apps/web/src/lib/nutrition/nutrition-db.ts:11`
`import { createServiceClient } from '@lumeos/shared'`. Details:
`20-apps-web-ist.md`.

`tools/` ist **kein Workspace-Bestandteil mehr**: `[cmd]` keine `package.json`
in `tools/` (die `@lumeos/tools`-package.json liegt im Archiv), 16 Unterordner,
davon lebend nur lokales Tooling (`scripts/` mit 4 produktneutralen Skripten,
`lightrag/`, `obsidian/`, `onyx/`, `repomix/` u. a. — lokale Werkzeuge, kein
Produktcode).

---

## Die 27 leeren Gerüste

`[cmd]` 2026-08-04: Verzeichnis vorhanden, keine `package.json`, kein Code.
**Diese Ordner bleiben.** Sie sind der spezifizierte Endausbau, kein Zerfall.
Begründung und Zielbild: `11-zielarchitektur.md`.

| Bereich | Verzeichnisse |
|---|---|
| `apps/` (5) | admin, buddy, coach, mobile, staff |
| `packages/` (10) | branch-db-core, config, contracts, memory-core, prompts, retrieval-core, rules, skills, tool-adapters, ui |
| `services/` (12) | admin-api, analytics-api, auth-api, coach-api, goals-api, marketplace-api, medical-api, memory-api, recovery-api, retrieval-api, supplements-api, training-api |

**Wichtig für künftige Scans:** Ein Scan ohne Shell sieht hier leere Ordner und
schliesst fälschlich, der Workspace sei leer. Genau das ist am 2026-07-30 passiert.
Vor einer solchen Aussage immer `pnpm typecheck` laufen lassen.

---

## Was sich am 2026-08-03 geändert hat

Vorher (Stand 2026-08-01): 59 deklarierte Verzeichnisse, **17 lebende Packages**,
davon 13 ein geschlossener Governance-Cluster an `@lumeos/wo-core` verwurzelt,
dazu `system/` (5,2 MB) und `tools/scripts/` (36 Dateien) — dokumentiert in der
Vorfassung dieser Datei und in `50-governance-rest.md`.

Nach dem Dispatch-Vorfall vom 2026-08-03 (Details: `_archive/governance/README.md`)
wurde der gesamte Cluster per `git mv` nach `_archive/governance/` verschoben —
`[cmd]` 476 Umbenennungen, 0 Löschungen, Commit `59cb41e`:

- 7 Governance-Packages, 5 Governance-Services, `@lumeos/tools`
- `system/` (349 getrackte Dateien)
- 32 von 36 Dateien aus `tools/scripts/`
- Governance-Konsole aus `apps/web` (21 Dateien) + `playwright.governance.config.ts`
- 2026-08-04 nachgezogen: die zweite Governance-Kopie
  `tools/onyx/seed/lumeos-governance-current-truth/` → `_archive/governance/onyx-seed/`

Sitzungsberichte: `docs/sessions/2026-08-03-governance-archiviert.md`,
`docs/sessions/2026-08-03-ssot-nachzug.md`.

---

## Root-Ebene

`[cmd]` 2026-08-04, per `git ls-files` (getrackte Dateien je Top-Level) und `du`.

### Produktiv und getrackt

`docs/` (1.538 Dateien, 74 MB) · `apps/` (167, 129 MB inkl. node_modules) ·
`supabase/` (35, 34 MB) · `infra/` (38) · `tools/` (37, 3,5 MB) ·
`packages/` (20) · `services/` (18) · `backup/` (12, 14 MB) · `db/` (8) ·
`package.json` · `pnpm-workspace.yaml` · `turbo.json` · `tsconfig.json` ·
`README.md` · `.gitignore` · `.env.example`

### Archiv (getrackt, stillgelegt)

`_archive/` (477 Dateien, 7 MB) — der Governance-Cluster samt README und Regeln.

### Getrackt, aber Altlast (Kandidaten für eine Folgerunde)

`.agents/` (63) · `.claude/` (94, enthält Governance-Agentendefinitionen und
ausgehängte Hooks) · `.codex/` (4) · `AGENTS.md` · `SESSION_ONBOARDING.md` ·
`STACK_REFERENCE.md` · `COMMANDS.md` · `CLAUDE.md.v1.bak` · `artefakt.json` ·
`project.profile.json` · `.cursorrules` · Teile von `infra/`
(Spark-systemd-Units, vLLM-Profile, Grafana/Prometheus des WO-Dashboards)

`system/` und `playwright.governance.config.ts` sind aus dieser Liste
verschwunden — archiviert.

### Untracked, wegwerfbar

Stand `[cmd]` 2026-08-02 (nicht neu gemessen): `temp/` (16,5 GB — enthält
`temp/lumeosold/` mit den einzigen Prod-Dumps der Vorgängerinstanz, **behalten**),
`tmp/` (31 MB), `.ijfw/`, `.wayland*/`, diverse Zips — Behandlung über
`docs/_archive/loeschliste-2026-08-02.md`. Neu seit 2026-08-04:
`tools/onyx/seed/lumeos-governance-current-truth.zip` (untracked Rest der
zweiten Governance-Kopie, `git mv` kann untrackte Dateien nicht bewegen).

### Nicht getrackt, aber behalten

`.env` · `.env.bak.preservicekey` — enthalten Zugangsdaten.
`[cmd]` 2026-08-01: beide korrekt in `.gitignore`, `git log --all` auf beide leer.
Der Service-Key war nie in einem Commit.

### Bekannte Staleness

`[cmd]` 2026-08-04: `pnpm-lock.yaml` enthält noch 27 Erwähnungen der
archivierten Packages (letzte Änderung `4e085f0`) — bereinigt sich mit dem
nächsten `pnpm install`.
