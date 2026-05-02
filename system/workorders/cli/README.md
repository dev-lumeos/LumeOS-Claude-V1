# Batch Loader CLI

> Markdown-Batch → Workorder Drafts → Schema Validation → Library Dispatch
> Spec: `docs/project/BATCH_LOADER_CLI_V1.md`
> Implementiert per `WO-governance-004` (Bootstrap).
> **Status: Bootstrap validated** — `pnpm tsc --noEmit` Exit 0, `--dry-run` gegen `BATCH-NUTRITION-P1-001-db-foundation.md` Exit 0 (alle 3 WOs schema-valide), Hook stabil, working tree clean.

## Bootstrap Validation Beispiel

```bash
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md \
  --dry-run
```

Erwartetes Ergebnis: 3 Workorders gefunden (`WO-nutrition-001`/`002`/`003`), `schema-valid: YES`, topologische Order `001 → 002 → 003`, Approval-Bedarf für `WO-002` und `WO-003` markiert, `overall: READY_TO_RUN`, Exit 0, kein Dispatch.

Lädt eine Markdown-Batch-Datei, findet die referenzierten Workorder-Drafts, extrahiert ihre YAML-Blöcke, validiert sie gegen `system/workorders/schemas/workorder.schema.json`, sortiert sie topologisch über `blocked_by` und dispatcht sie sequenziell über `dispatchWorkorder()` aus `system/control-plane/dispatcher.ts` — **als Library-Aufruf, ohne `services/scheduler-api/`**.

---

## Synopsis

```bash
# Dry-Run (sicherer Default — kein Dispatch)
npx tsx system/workorders/cli/run-batch.ts <batch-file>
npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run

# Echter Run (Library-Dispatch via dispatchWorkorder)
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run

# Konkretes Beispiel
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md \
  --dry-run
```

Bei unbekanntem Modus oder fehlender Argumentation fällt das CLI auf Dry-Run zurück.

---

## Modi

### `--dry-run` (Default)

1. Liest die Markdown-Batch (Sektion `## Status` und `## Included Workorders`-Tabelle).
2. Lädt die referenzierten Draft-Dateien aus dem `drafts/`-Schwester-Verzeichnis.
3. Extrahiert den ersten ` ```yaml `-Codeblock pro Draft.
4. Parst das YAML mit einem fokussierten Mini-Parser (kein `js-yaml`-Dependency).
5. Validiert jedes WO-Objekt gegen `workorder.schema.json` (ajv 8, Draft-07 kompatibel).
6. Sortiert topologisch über `blocked_by` und erkennt Zyklen.
7. Markiert Approval-Bedarf (`requires_approval: true` ODER `risk_category` aus High-Risk-Set: `db-migration`, `payments`, `medical`, `release`, `security`, `auth`, `rls`, `shared-core`, `architecture`).
8. Druckt strukturierten Report. **Kein Dispatch.**

### `--run`

Wie Dry-Run, dann zusätzlich:

1. Prüft `isSystemStopped()` (Kill-Switch) — Abbruch bei aktivem Stop.
2. Pro WO in topologischer Reihenfolge:
   - `runPreflight(wo)` — Abbruch bei `HOLD` oder `REJECT`.
   - `dispatchWorkorder(wo, { executeTool: defaultExecuteTool })` direkt als Library.
   - Bei `awaiting_approval`/`paused_for_approval`: Run pausiert, weitere WOs werden nicht angefasst.
3. Druckt `getPendingApprovals()` am Ende für Übersicht.

Voraussetzung: Batch-`## Status` ist `ready_for_approval` oder `approved`. Andere Status werden mit Exit Code 2 abgelehnt.

---

## Sicherheitsregeln

- **Keine** Imports aus oder HTTP-Aufrufe gegen `services/scheduler-api/`.
- **Keine** Nutzung von `DispatchLoop`, `SlotManager` oder `workorder-repository`.
- **Keine** Direktschreiben in `system/approval/queue.json`, `system/state/runtime_state.json` oder `system/state/*.jsonl`.
- **Kein** `supabase db push --linked`, kein `supabase db reset`.
- **Keine** neuen npm-Dependencies (nutzt nur die im Repo vorhandene `ajv`).
- **Keine** Approval-Auto-Granting. Approvals entstehen ausschließlich im Dispatcher (HUMAN_NEEDED-Gate); Tom granted via `npx tsx system/approval/approval-cli.ts grant <id>`.
- **Strikte Reihenfolge** in `--run`. Keine Parallelität in V1.
- **Defense-in-Depth**: Auch wenn der CLI einen db-migration WO dispatched, wird das Permission Gateway den Approval-Gate ziehen — der CLI umgeht keine Sicherheitsschicht.

---

## Exit Codes

| Code | Bedeutung |
|---|---|
| 0 | Erfolg (Dry-Run schema-valid; Run vollständig dispatched). |
| 1 | Schema-/Parse-Fehler, fehlende Datei, falsche Argumente. |
| 2 | System-Stop, Preflight `HOLD`/`REJECT`, Batch-Status nicht runbar, oder Dispatch-Fehler. |
| 3 | Run pausiert wegen Approval (`awaiting_approval`). |

---

## V1 Scope

- Markdown-Batch + Draft-MD-Format wie in `system/workorders/nutrition/{batches,drafts}/` etabliert.
- WO-YAML als erster ` ```yaml `-Codeblock pro Draft.
- Topologische `blocked_by`-Sortierung mit Zyklen-Erkennung.
- Schema-Validierung über `workorder.schema.json` (Pflichtfelder, Regex, db-migration `if/then` für `rollback_hint`).
- Library-Dispatch über `dispatchWorkorder()`.

## Out of Scope (Phase 2)

- Scheduler-Service-HTTP-Integration (`POST /dispatch`).
- `--resume` nach erteiltem Approval (V1: Tom grantet Approval, ruft `--run` erneut auf — schema-valide WOs werden bei zweitem Lauf vom Dispatcher selbst gegen Runtime-State abgeglichen).
- Parallel-Dispatch nicht-konfliktärer WOs.
- Production-DB-Push (bleibt manuell durch Tom).
- UI / Web-Frontend.
- Markdown-Batch-Format V2.
- `--force`-Flag (existiert bewusst nicht).

---

## Operativer Ablauf

Per `MASTERPROMPT_WORKORDER_BATCH_PLAN.md` und `SESSION_ONBOARDING.md`:

```bash
# 1. Approvals sichten (für bereits in der Queue stehende Items)
npx tsx system/approval/approval-cli.ts list

# 2. Stop Rules + Night-Run-Bereitschaft
npx tsx system/control-plane/stop-rules.ts --dry-run
npx tsx system/control-plane/night-run-policy.ts check

# 3. Dry-Run gegen den Batch
npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run

# 4. Wenn READY_TO_RUN: --run
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run

# 5. Bei Approval-Pause: Approval entscheiden
npx tsx system/approval/approval-cli.ts grant <approval_id>
# Dann --run erneut für nachfolgende WOs

# 6. Reports
npx tsx system/reports/morning-report.ts
npx tsx system/reports/run-summary-generator.ts --all
```

---

## Master-Spec & verwandte Dateien

- **Master-Spec:** `docs/project/BATCH_LOADER_CLI_V1.md`
- **WO-Spec:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-004-batch-loader-cli-v1.md`
- **Lifecycle:** `system/workorders/lifecycle/wo_lifecycle_v1.md`
- **Workorder-Schema:** `system/workorders/schemas/workorder.schema.json`
- **Library-Imports (read-only):**
  - `system/control-plane/dispatcher.ts` (`dispatchWorkorder`, `defaultExecuteTool`, `Workorder`)
  - `system/control-plane/scheduler-preflight.ts` (`runPreflight`)
  - `system/state/state-manager.ts` (`isSystemStopped`)
  - `system/approval/approval-queue.ts` (`getPendingApprovals`)

---

## Bekannte Limitierungen V1

- Mini-YAML-Parser deckt nur das WO-Draft-Format ab (Top-Level-Keys, inline/block Arrays, `|`-Block-Scalars). Kein `>`, kein `&`/`*` Anchors, keine verschachtelten Maps.
- `runPreflight()` setzt voraus, dass `system/state/runtime_state.json` lesbar ist; bei frischem Repo werden Checks wie `wo_not_terminal` defensiv neutral durchlaufen.
- `dispatchWorkorder()` führt echte Modell-Calls gegen die in `agents.json` registrierten Agents aus — Sparks müssen für `--run` produktive Calls verfügbar sein.
- Kein eigener Audit-Pfad: alle Audit-Events kommen aus dem bestehenden `pipeline-audit.ts`/`audit-writer.ts`-Stack des Dispatchers.
