# BATCH_LOADER_CLI_V1.md

> Spec für den fehlenden CLI-Entry-Point, der Markdown-Batches in den bestehenden Dispatcher-Workflow einspeist.
> Stand: 2026-05-02 | Status: **Implemented and validated** (Bootstrap via `WO-governance-004` abgeschlossen, Batch `BATCH-GOVERNANCE-P1-001-batch-loader-cli.md` `completed`)

## Usage

```bash
npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run
```

`--dry-run` ist verpflichtender erster Schritt vor jedem `--run`. Ohne erfolgreichen Dry-Run (alle WOs schema-valide, keine Dependency-Zyklen, `overall: READY_TO_RUN`) darf `--run` nicht ausgeführt werden.
> Quellen: `BATCH-NUTRITION-P1-001-db-foundation.md`, drei Phase-1-WO-Drafts, `workorder.schema.json`, `wo_lifecycle_v1.md`, `dispatcher.ts`, `scheduler-preflight.ts`, `approval-queue.ts`, `approval-cli.ts`, `run-summary-generator.ts`, `test-first-real-wo.ts`

---

## 1. Problem

Es existiert kein belegter CLI-Entry-Point für Markdown-Batches.

Konkret aus dem Repo-Inspector-Befund:
- Batch-Pläne (`system/workorders/<modul>/batches/*.md`) und WO-Drafts (`system/workorders/<modul>/drafts/*.md`) sind Markdown-Dateien mit YAML-Block.
- Der Dispatcher (`system/control-plane/dispatcher.ts`) ist eine Library-Funktion `dispatchWorkorder(wo, deps)` und erwartet ein `Workorder`-Objekt — kein Markdown.
- Die Approval-CLI (`system/approval/approval-cli.ts`) operiert auf bestehenden Approval-Items per `approval_id`. Approval-Items entstehen **nur** während eines Dispatch-Runs (HUMAN_NEEDED-Gate via `enqueueApproval()`), nicht vorab aus einem Batch heraus.
- Tests wie `tools/scripts/test-first-real-wo.ts` nutzen das Governance-Artefakt-V3-Format mit Supabase-Direktanbindung — nicht das hier verwendete MD-Batch-Format.

Lücke: kein Skript/CLI, das eine Batch-MD-Datei einliest, die referenzierten WO-Drafts findet, deren YAML-Blöcke extrahiert, gegen `workorder.schema.json` validiert und in der korrekten Reihenfolge an den Dispatcher übergibt.

## 2. Ziel

Ein CLI, der Batch-MD-Dateien sicher in den bestehenden Dispatcher-Workflow einspeist:

```
Markdown-Batch → WO-Drafts → Schema Validation → Dispatch → Approval → Audit/Reports
```

Das CLI ist ein **dünner Adapter**. Es erfindet keine neuen Mechanismen — es übersetzt nur das Markdown-Batch-Format in `Workorder`-Objekte, die der bestehende Dispatcher konsumieren kann.

## 3. Nicht-Ziele

- Keine neue Approval Engine — `system/approval/*` bleibt unverändert.
- Kein neuer Dispatcher — `system/control-plane/dispatcher.ts` bleibt unverändert.
- Kein Bypass von `approvalGate` (`system/approval/approval-gate.ts`).
- Keine direkte DB-Ausführung.
- Kein `supabase db push --linked` (bleibt manuell durch Tom).
- Kein neues Lifecycle — `wo_lifecycle_v1.md` Transitionen bleiben verbindlich.
- Keine neuen Risk-Kategorien.
- Keine Schema-Erweiterung (`workorder.schema.json` bleibt unverändert).

## 4. Input

- **Batch-Datei** im Markdown-Format (z. B. `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md`) mit Sektionen:
  - `## Status` (`ready_for_approval` als Pre-Run-Voraussetzung)
  - `## Included Workorders` (Tabelle mit `Filename` + `workorder_id` + `Risk` + `Approval`)
  - `## Execution Order` / `## Dependency Chain`
  - `## Approval Gate` / `## Execution Guard`
- **Draft-Workorder-Dateien** referenziert via `Filename`-Spalte; jede enthält genau einen YAML-Block mit dem WO-Schema (in einem ```yaml ... ``` Codeblock).
- **Schema** `system/workorders/schemas/workorder.schema.json` (Validation-Quelle).
- **Lifecycle** `system/workorders/lifecycle/wo_lifecycle_v1.md` (State-Erwartungen — read-only Referenz, durchgesetzt durch state-manager).

## 5. Output

- **Validierte WO-Run-Anfragen** als `Workorder`-Objekte gemäß `workorder.schema.json`.
- **Dispatcher-Aufrufe** via `dispatchWorkorder(wo, deps)` in der durch `blocked_by` definierten Reihenfolge.
- **Audit/Reports über bestehende Systeme:**
  - Audit-Events via `system/state/audit-writer.ts` und `pipeline-audit.ts` (bestehend, kein neuer Pfad).
  - Run-Summaries via `npx tsx system/reports/run-summary-generator.ts <run_id>`.
  - Morning-/Failed-Reports via bestehender Report-CLIs.
- **Dry-Run-Report** als stdout (Text) und/oder optional als JSON-Datei unter `system/reports/batch-dry-runs/<batch-name>.json`.

## 6. CLI-Vorschlag

```bash
# Vor-Ausführung: nur prüfen
npx tsx system/workorders/cli/run-batch.ts <batch-file> --dry-run

# Echte Ausführung
npx tsx system/workorders/cli/run-batch.ts <batch-file> --run

# Konkretes Beispiel für den aktuellen Batch
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md \
  --dry-run
```

Pfad-Konvention: `system/workorders/cli/run-batch.ts` (neuer CLI-Pfad innerhalb `system/workorders/`, parallel zu `schemas/`, `templates/`, `lifecycle/`).

## 7. Modi

| Modus | Aktion |
|---|---|
| `--dry-run` | Parse Batch-MD, lese referenzierte Draft-MDs, extrahiere YAML, validiere gegen Schema, prüfe `blocked_by`-Konsistenz innerhalb des Batches, ermittle Approval-Bedarf pro WO. **Kein Dispatch.** Ausgabe: Bericht mit Status pro WO + Approval-Liste + Reihenfolge. |
| `--run` | Voraussetzungen wie `--dry-run` plus: Stop-Rules-Check (`isSystemStopped()`), Preflight-Check (`runPreflight()`), strikte Reihenfolge-Ausführung über `dispatchWorkorder()`. Bei `awaiting_approval` State: pausieren und Hinweis ausgeben. |
| `--resume` (optional, Phase 2) | Wartende Batch-Run-Position aus persistierter Marker-Datei (z. B. `system/state/batch-runs/<batch-name>.json`) wieder aufnehmen, sobald Approval erteilt ist. |

## 8. Sicherheitsregeln

- **`scope_files` und `files_blocked` respektieren** — kein Eingriff in `system/agent-registry/authorize-tool-call.ts`. Der Dispatcher leitet die Felder unverändert weiter.
- **`approvalGate` bleibt zuständig** — der CLI ruft niemals `grantApproval()`/`denyApproval()` auf. Approval-Entscheidung bleibt Tom über `approval-cli.ts`.
- **`db-migration` erzeugt Approval/HUMAN_NEEDED in der Pipeline** — der CLI initialisiert keine Approval-Items vorab. Bei `--run` wird der Dispatcher aufgerufen; HUMAN_NEEDED-Gate triggert `enqueueApproval()` automatisch.
- **Keine Production-DB-Pushes** — Migrations-Dateien werden geschrieben (durch Worker im Dispatch), aber nicht angewandt. `supabase db push` bleibt manuelle Tom-Aktion.
- **Stop-Rules und Preflight müssen vor Dispatch laufen** — der CLI ruft `isSystemStopped()` und `runPreflight()` aus den bestehenden Modulen auf. Bei HOLD/REJECT: nicht dispatchen.
- **Strikte Reihenfolge** — `blocked_by` wird pro WO geprüft (Topologische Sortierung). Bei Verletzung: Abbruch mit klarer Fehlermeldung.
- **Kein `--force`-Flag in V1.** Keine Möglichkeit, Approval/Locks zu umgehen.
- **Read-only Modus** ist Default-Verhalten bei jedem unbekannten Argument: lieber nichts tun als ungewollt dispatchen.

## 9. Minimal V1 Scope

- Markdown-Batch einlesen — Sektion `## Included Workorders` und `## Execution Order` parsen.
- WO-Dateien aus `Included Workorders` (Spalte `Filename`) auflösen — relativ zum Batch-Datei-Pfad oder gegen den `drafts/`-Ordner desselben Moduls.
- YAML/WO-Block aus jeder Draft-MD extrahieren — erster ```yaml ... ``` Codeblock pro Datei.
- Schema validieren über `workorder.schema.json` (z. B. via `ajv`, das im Repo als devDependency vorhanden ist).
- Dependency-Order prüfen — `blocked_by`-Felder gegen WO-IDs im Batch matchen. Topologisch sortieren.
- **Dry-Run-Report** ausgeben mit:
  - Validierungs-Status pro WO (schema-valid / schema-fail mit Details)
  - Reihenfolge (sortierte WO-ID-Liste)
  - Approval-Bedarf-Liste (`requires_approval: true` Items mit `risk_category`)
  - Gesamtstatus (`READY_TO_RUN` / `BLOCKED` / `INVALID`)
- **Optional `--run`-Modus für WO-001 (docs-only)** — kann ohne Approval direkt dispatchen, da `risk_category: docs`.
- **`db-migration` läuft nur bis Approval-Gate** — Dispatcher wird aufgerufen, Pipeline triggert Approval, CLI gibt Hinweis "Approval-Item erstellt: <approval_id>" und beendet den Batch-Run an dieser Stelle. **Keine direkte Migration-Ausführung ohne Approval.**

Bewusst nicht in V1:
- `--resume` nach Approval (kann V1 manuell durch erneuten `--run` mit Skip-Logic für bereits `done` markierte WOs erfolgen, oder Phase-2-Erweiterung).
- Parallel-Dispatch nicht-konfliktärer WOs (V1: strikt sequenziell).
- Auto-Granting (gibt es nicht und soll es nicht geben).
- Web-/HTTP-Schnittstelle.

## 10. Open Questions

Echte offene Punkte aus den gelesenen Dateien:

1. **WO-YAML-Block-Format in den Drafts:** Die drei Phase-1-Drafts enthalten den WO-YAML innerhalb einer Markdown-Sektion `## Workorder` als ```yaml-Codeblock. Das Format ist konsistent über alle drei Drafts, aber in keiner Spec/keinem Schema **formal als Konvention belegt**. Empfehlung: V1 implementiert "erster `yaml`-Codeblock pro Datei" als pragmatischen Default, mit klarer Fehlermeldung wenn keiner gefunden wird.

2. **Filename ↔ workorder_id-Mapping:** Im Batch existiert die Sektion `## Filename ↔ Workorder ID Mapping` (manuell gepflegt). Der CLI muss entscheiden, ob er die Tabelle parst oder die `workorder_id` direkt aus dem WO-YAML liest. Empfehlung: aus dem YAML lesen — die Mapping-Tabelle ist Doku, nicht Source-of-Truth.

3. **Persistierter Batch-Run-State:** Für `--resume` (Phase 2) wäre eine Datei wie `system/state/batch-runs/<batch-name>.json` nötig. **Nicht belegt** ob ein vergleichbarer State-File-Pfad bereits konventioniert ist. Vorschlag: V1 ohne Resume; Phase-2-WO entscheidet.

4. **Wo ruft der CLI `dispatchWorkorder` an?** Lokal als Library-Aufruf (synchron) oder über einen Scheduler-Service (HTTP)? `system/scheduler/scheduler_dispatch_v1.md` und ggf. `services/scheduler-api/` sind im Inspections-Scope nicht im Detail geprüft — nicht belegt.

5. **WO-Status nach erfolgreichem Dispatch:** `dispatchWorkorder` setzt internen State über `state-manager.ts`. Der CLI braucht eine Möglichkeit, das Endergebnis abzufragen (`done`/`failed`/`awaiting_approval`). Empfehlung: nach jedem Dispatch via `getActiveWorkorder(wo_id)` oder über das `DispatchResult`-Returnobjekt prüfen — Methode existiert per Code-Signatur.

## 11. Workorder-Kandidat

```yaml
candidate:
  slug: governance-batch-loader-cli-v1
  agent_id: senior-coding-agent
  layer: tooling
  phase: 2
  risk_category: architecture
  requires_approval: true
  rollback_hint: "DELETE system/workorders/cli/run-batch.ts; restore unchanged Dispatcher/Approval/Reports."
  scope_files:
    - "system/workorders/cli/run-batch.ts"
    - "system/workorders/cli/__tests__/run-batch.test.ts"
    - "system/workorders/cli/README.md"
  context_files:
    - "system/workorders/schemas/workorder.schema.json"
    - "system/workorders/lifecycle/wo_lifecycle_v1.md"
    - "system/control-plane/dispatcher.ts"
    - "system/control-plane/scheduler-preflight.ts"
    - "system/state/state-manager.ts"
    - "system/approval/approval-queue.ts"
    - "system/approval/approval-gate.ts"
    - "system/reports/run-summary-generator.ts"
    - "system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md"
    - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-001-audit-existing-state.md"
    - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-002-core-schema-foundation.md"
    - "system/workorders/nutrition/drafts/WO-NUTRITION-P1-003-food-core-tables.md"
  blocked_by: []
  files_blocked:
    - "supabase/**"
    - "apps/**"
    - "services/**"
    - "packages/**"
    - "system/control-plane/dispatcher.ts"
    - "system/control-plane/scheduler-preflight.ts"
    - "system/approval/**"
    - "system/state/**"
    - "system/reports/**"
    - ".env"
    - ".env.*"
  validation_commands:
    - "pnpm tsc --noEmit"
    - "pnpm test"
```

Begründung `risk_category: architecture` (cautious, Spark D mandatory, kein Auto-Retry per `CLAUDE.md` High-Risk-Regel): der CLI berührt zwar keine User-Daten, ist aber ein neuer Workflow-Eintrittspunkt mit Auswirkungen auf die gesamte Dispatch-Kette — Architektur-Review erforderlich. Approval Pflicht.

## 12. Acceptance Criteria

- `--dry-run` zeigt alle drei Nutrition WOs (`WO-nutrition-001`, `WO-nutrition-002`, `WO-nutrition-003`) korrekt mit Status, Risk, Approval-Bedarf, Reihenfolge.
- CLI erkennt `WO-nutrition-002` und `WO-nutrition-003` als `requires_approval: true` (`risk_category: db-migration`) und markiert sie im Dry-Run als "approval required before dispatch".
- `--dry-run` führt **nichts** aus: kein `dispatchWorkorder`-Aufruf, kein Datei-Write außer dem optionalen Dry-Run-Report.
- `--run`-Modus kann `WO-nutrition-001` dispatchen (Pipeline läuft, Audit-Report wird erzeugt, Run-Summary vorhanden).
- `--run`-Modus startet `WO-nutrition-002` nicht produktiv ohne Approval — bei aktivem HUMAN_NEEDED-Gate wird ein Approval-Item erzeugt und der Batch-Run pausiert mit klarem Hinweis.
- `db-migration` läuft nicht ohne Approval. Auch bei `--run` keine Migration-Ausführung gegen Production-DB.
- Reports/Audit bleiben bestehend: `npx tsx system/reports/run-summary-generator.ts <run_id>` zeigt für WO-001 einen vollständigen Run; `system/state/pipeline-audit.jsonl` enthält Events.
- `pnpm tsc --noEmit` clean nach Implementation.
- Bestehende Tests bleiben grün.

---

## Abschluss-Zusammenfassung

**Erstellte Datei:** `docs/project/BATCH_LOADER_CLI_V1.md`

**Offene Fragen (nur belegte):**

1. WO-YAML-Block-Format in Drafts ist Konvention, nicht spec'd — Vorschlag: pragmatischer Default "erster `yaml`-Codeblock pro Datei".
2. Filename↔ID-Mapping als Quelle: Tabelle vs. YAML — Vorschlag: YAML als SoT.
3. Resume-Strategie für `--run` mit pausiertem Approval — V1 ohne Resume.
4. Library-Aufruf vs. HTTP an Scheduler-Service — `services/scheduler-api/` nicht im Inspection-Scope geprüft.
5. WO-Status-Auslesung nach Dispatch — über `DispatchResult` möglich, exakte Schnittstelle V1-Implementation-Detail.

**Empfohlener nächster Schritt:**

`governance-batch-loader-cli-v1` als Workorder-Kandidat in einen Batch-Plan überführen (Risk: `architecture`, requires_approval: true). Vor WO-Erstellung: `services/scheduler-api/` und `system/scheduler/scheduler_dispatch_v1.md` prüfen, um Open Question 4 (Library vs. HTTP) zu klären. Bis zur Klärung bleibt der Nutrition-Phase-1-Batch im Status `ready_for_approval`, ohne Bypass.
