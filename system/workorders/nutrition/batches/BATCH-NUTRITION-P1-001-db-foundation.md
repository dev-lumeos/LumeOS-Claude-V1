# BATCH-NUTRITION-P1-001-db-foundation

## Status
ready_for_approval

## Purpose
Plan für die ersten drei Nutrition Phase-1 DB-Foundation Workorders.

Dieser Batch bündelt die Discovery- und Foundation-Schritte des `nutrition-db-foundation-v1`-Tracks aus `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §10 ("Recommended First Batch"). Ziel: einen Audit-Report erzeugen, das `nutrition`-Schema + Extensions vorbereiten und die 7 Stamm-Tabellen (BLS Food Core) inklusive Auto-Tag-Trigger als idempotente Migration entwerfen — ohne Produktiv-Migration auszuführen.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-NUTRITION-P1-001-audit-existing-state.md` | `WO-nutrition-001` | Audit Existing Nutrition DB State | `docs` | nicht erforderlich |
| 2 | `WO-NUTRITION-P1-002-core-schema-foundation.md` | `WO-nutrition-002` | Nutrition Core Schema Foundation | `db-migration` | erforderlich |
| 3 | `WO-NUTRITION-P1-003-food-core-tables.md` | `WO-nutrition-003` | Nutrition Food Core Tables | `db-migration` | erforderlich |

**Filename ↔ ID Mapping:** Die Dateinamen folgen der Auftrags-Convention `WO-NUTRITION-P1-NNN-...md`; das `workorder_id`-Feld folgt der Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Filename ↔ Workorder ID Mapping

| Filename | workorder_id |
|---|---|
| WO-NUTRITION-P1-001-audit-existing-state.md | WO-nutrition-001 |
| WO-NUTRITION-P1-002-core-schema-foundation.md | WO-nutrition-002 |
| WO-NUTRITION-P1-003-food-core-tables.md | WO-nutrition-003 |

---

## Approval Gate

- WO-nutrition-001: no approval required, docs/read-only.
- WO-nutrition-002: approval required, risk_category db-migration.
- WO-nutrition-003: approval required, risk_category db-migration.
- No execution may happen before explicit approval.
- `supabase db push --linked` remains manual by Tom.

---

## Execution Guard

- Execute in strict order: WO-nutrition-001 → WO-nutrition-002 → WO-nutrition-003.
- Stop after WO-nutrition-001 and review the audit report before WO-nutrition-002.
- Stop after WO-nutrition-002 and review migration diff before WO-nutrition-003.
- Do not run WO-nutrition-002 or WO-nutrition-003 without approval.

---

## Execution Order

1. **Audit zuerst** — `WO-nutrition-001` erzeugt einen Audit-Report (Read-only Discovery), der den Ist-Stand des `nutrition`-Schemas und der `packages/types/src/nutrition/`-Files in einem Markdown-Dokument festhält. Liefert Datenbasis für die nachfolgenden Migrationen.
2. **Core Schema nach Audit** — `WO-nutrition-002` legt das `nutrition`-Schema, die benötigten Postgres-Extensions (`pg_trgm`, `pgcrypto` falls nötig) und die Schema-Grants an. Kein Tabellen-DDL.
3. **Food Core Tables nach Core Schema** — `WO-nutrition-003` legt die 7 Stamm-Tabellen (`nutrient_defs`, `food_categories`, `foods`, `food_nutrients`, `food_aliases`, `tag_definitions`, `food_tags`), Seed-Inserts (138 BLS-Codes + 16 V1-Tag-Definitionen), Auto-Tag-Trigger (auf 12 deterministisch ableitbare Tags reduziert), GIN-Indexe, RLS und korrespondierende TypeScript-Types an.

---

## Dependency Chain

```
WO-nutrition-001  →  WO-nutrition-002  →  WO-nutrition-003
```

`blocked_by`-Felder in den Drafts spiegeln diese Kette:
- `WO-nutrition-001.blocked_by = []`
- `WO-nutrition-002.blocked_by = ["WO-nutrition-001"]`
- `WO-nutrition-003.blocked_by = ["WO-nutrition-002"]`

Lifecycle-Pfad pro WO (per `system/workorders/lifecycle/wo_lifecycle_v1.md`):

```
wo_generated → graph_validated → queue_released
  → blocked (warten auf upstream done/closed)
  → ready (Scheduler deterministisch)
  → dispatched → running
  → done
  → reviewed (für db-migration WO-002/WO-003 mit security-specialist)
  → closed
```

WO-001 als trivialer Discovery-WO darf direkt `done → closed` gehen (per `wo_lifecycle_v1.md`).

---

## Approval Requirements

| WO | requires_approval | risk_category | Approval-Pfad |
|---|---|---|---|
| WO-nutrition-001 | `false` | `docs` | kein Approval nötig — autonomer Run möglich |
| WO-nutrition-002 | `true` | `db-migration` | Human Approval + security-specialist Review (per `template_migration.md`); Spark D Pflicht (per `CLAUDE.md` High-Risk-Regel für `db-migration`) |
| WO-nutrition-003 | `true` | `db-migration` | wie WO-002 |

**`rollback_hint`** ist gesetzt für beide db-migration WOs (Pflicht per `workorder.schema.json` if/then-Block).

---

## Scope Boundaries

### Erlaubt

- **WO-001** Schreiben des Audit-Reports unter `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md` (Verzeichnis bei Bedarf anlegen)
- **WO-002** Erstellen einer neuen Migration-Datei unter `supabase/migrations/` (Naming-Convention `YYYYMMDD_NNN_nutrition_schema_foundation.sql` — exakter Pfad: future path to be decided)
- **WO-003** Erstellen einer neuen Migration-Datei unter `supabase/migrations/` (`YYYYMMDD_NNN_nutrition_food_core_tables.sql` — future path to be decided) plus `packages/types/src/nutrition/foods.ts` und `packages/types/src/nutrition/index.ts`
- Lesen (read-only) der Spec-Dateien in `docs/specs/Nutrition/`
- Lesen (read-only) bestehender Migrationen unter `supabase/migrations/`

### Nicht erlaubt

- `apps/**`
- `services/**`
- echte Supabase-Ausführung
- `supabase db push --linked`
- `supabase db reset` (durch Worker)
- Produktivcode (über `packages/types/src/nutrition/` hinaus)
- UI-Implementierung
- API-Implementierung
- BLS Import Runner (Phase 2)
- MealCam Provider (BLOCK-1, externer Research)
- Reference Value Seeds für `nutrient_reference_values` (BLOCK-2, externer Research)
- Tabellen außerhalb der 7 Food-Core-Tabellen in WO-003
- Tag-Set-Erweiterungen über die 16 V1-Tags hinaus

---

## Preflight Checklist

- [x] Alle drei Draft-WOs vorhanden in `system/workorders/nutrition/drafts/`
- [x] Review-Datei `REVIEW-WO-NUTRITION-P1-BATCH-001.md` vorhanden
- [x] Required Fixes aus Review umgesetzt:
  - WO-003 Auto-Tag-Trigger 12-vs-4 Klärung in `<analyze>`/`<implement>`/`<constraints>`/`<on_error>` und Notes
  - WO-003 Acceptance Criteria ergänzt: 138 BLS-Code-Seed, 16 V1-Tag-Seed, Trigger-12-Tags-Beschränkung, 4-admin-managed-Ausnahme
  - WO-001 Verzeichnis-Anlage `audit/` im `<implement>`-Block ergänzt (Minor)
  - WO-002 Acceptance `supabase db diff` als manueller Reviewer-Check markiert (Minor)
- [ ] Git working tree sauber außer dieser Batch-Datei (manuell durch Tom zu prüfen vor Approval)
- [ ] Keine Produktivdateien im Scope (siehe Scope Boundaries — gilt durch `scope_files`/`files_blocked` der Drafts)

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- **Batch erzeugt keine Ausführung.** Diese Datei ist ein reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch wird durch diese Datei ausgelöst.
- **Execution erfolgt erst nach explizitem Approval** durch Tom für WO-002 und WO-003 (db-migration). WO-001 darf nach Batch-Freigabe autonom laufen.
- **DB-Migration-WOs dürfen nur nach Approval laufen** — der Worker hat `requires_approval: true` und wird vom Scheduler vor `dispatched` blockiert, bis Approval erfolgt ist.
- **`supabase db push --linked` bleibt manuell durch Tom.** Worker erzeugt nur Migration-Dateien. Tom drückt manuell auf production. Lokales `supabase db reset` erfolgt durch Tom für lokales Testing.
- **Spark-Routing:** WO-002 und WO-003 sind `db-migration` → Spark D Senior Reviewer mandatory (per `CLAUDE.md` Stack-Reference). WO-001 ist `docs` → autonomer Run möglich auf Spark B / C.
- **Failure-Verhalten:**
  - WO-001 Failure → kein Auto-Retry bei `guardrail_violation`; sonst per Failure-Class
  - WO-002/003 Failure (db-migration) → kein Auto-Retry per `CLAUDE.md` High-Risk-Regel; Reviewed-Status erzwungen

---

## Expected Outputs

| WO | Output |
|---|---|
| WO-nutrition-001 | Audit-Report unter `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md` mit: Liste existierender Nutrition-Migrationen, Liste existierender Type-Files, Diff-Liste Spec vs. DB, `data_source` vs. `food_source` Flag, RLS-Status pro existierender Tabelle |
| WO-nutrition-002 | Neue Migration-Datei unter `supabase/migrations/` (`YYYYMMDD_NNN_nutrition_schema_foundation.sql`) mit: `CREATE SCHEMA IF NOT EXISTS nutrition`, `CREATE EXTENSION IF NOT EXISTS pg_trgm`, `CREATE EXTENSION IF NOT EXISTS pgcrypto` (falls nötig), `GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role`, DOWN-Rollback-Kommentar |
| WO-nutrition-003 | Neue Migration-Datei unter `supabase/migrations/` (`YYYYMMDD_NNN_nutrition_food_core_tables.sql`) mit 7 Stamm-Tabellen, 138 `nutrient_defs`-Seed-Inserts, 16 V1-Tag-Definitions-Seeds, Auto-Tag-Trigger auf 12 Tags reduziert, GIN-Indexen, RLS, GRANTs, DOWN-Rollback-Kommentar — plus `packages/types/src/nutrition/foods.ts` und `packages/types/src/nutrition/index.ts` |

---

## Next Step After Batch

Nach Review/Freigabe dieses Batch-Plans:

1. **WO-001 ausführen** (autonomer Run, kein Approval) → Audit-Report verfügbar
2. **Ergebnis prüfen:**
   - Audit-Report manuell sichten
   - Feststellen ob `nutrition`-Schema oder Tabellen ggf. teilweise existieren
   - Ggf. Korrekturen am Plan vor Schritt 3
3. **Erst danach WO-002** (Approval einholen, Spark D Senior Reviewer für db-migration aktivieren, ausführen) → Schema-Foundation-Migration verfügbar
4. **WO-002 lokal testen** durch Tom (`supabase db reset` lokal, prüfen dass Migration idempotent durchläuft)
5. **Erst danach WO-003** (Approval einholen, ausführen) → Food-Core-Migration + TypeScript-Types verfügbar
6. **WO-003 lokal testen** durch Tom (Migration lokal anwenden, Auto-Tag-Trigger gegen Sample-Insert testen, RLS gegen Test-User prüfen, `pnpm tsc --noEmit` grün)

Nach erfolgreichem Abschluss aller drei WOs ist die Foundation gelegt für den nächsten Phase-1-Batch (Kandidaten #4–#11 aus `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §5: Custom Foods + Portions, Diary, Preferences, Targets+Water, Reference-Values-Struktur, MealCam, Coach Suggestions, Schema-only Recipes/Plans/Shopping). Vor diesem nächsten Batch ist eine erneute Split-Plan-Anpassung möglich, falls der Audit-Report Lücken oder unerwartete Konflikte zeigt.

---

*Batch-Plan erzeugt: 2026-05-02 — gemäß `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §10, Drafts P1-001/002/003 und Review-Pass aus `REVIEW-WO-NUTRITION-P1-BATCH-001.md` (PASS_WITH_FIXES → Fixes umgesetzt).*

---

## Workflow Test Result — 2026-05-03

**Status:** **WORKFLOW TEST SNAPSHOT — pre WO-014**

**Result:**
- WO-nutrition-001 successfully dispatched.
- Dispatcher returned `completed`.
- Validator/model-output contract chain is now working end-to-end.
- WO-nutrition-002 not yet reached because Preflight HOLD occurred after WO-001.

**Confirmed fixed (Validator/Dispatcher/Model-Output-Vertrag-Kette):**
- `selected_agent` undefined → eliminiert via WO-005 Mapping.
- `risk_level` undefined → eliminiert via WO-009 Mapping.
- `required_gates` TypeError (`is not iterable`) → eliminiert via WO-012 §0 Array-Defensive.
- Missing array-field TypeErrors (`risks`, `execution_order`, `stop_conditions`) → eliminiert via WO-012 §0.
- Stale `failed`-Status auf neuen `active_workorders`-Einträgen (Find-Key-Mismatch) → eliminiert via WO-011 `updateActiveWorkorderStatusByRun`.
- Model output contract missing from prompt → eliminiert via WO-013 statisches Contract-Template + lazy `buildSystemPrompt`-Injection + strukturierter REWRITE-Hint mit Validator-Reason und Field.

**Validation-Snapshot (vor `--run`):**
- `git status --short` → clean.
- `pnpm tsc --noEmit` → PASS.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → 28/28 PASS. *(pre WO-014 snapshot; after WO-014 this suite is 32/32 PASS.)*
- `npx tsx system/workorders/cli/run-batch.ts ... --dry-run` → READY_TO_RUN.

**`--run`-Ergebnis:**
- `WO-nutrition-001 [dispatched] Dispatcher status: completed` — erstmals erfolgreicher Dispatch in der Workflow-Test-Sequenz.
- `WO-nutrition-002 [preflight_blocked] Preflight HOLD` — nicht durch Approval-Pause, sondern durch Preflight.
- Approval Queue: 0 Pending Approvals.
- `git status --short` post-run: clean (alle State-Mutationen in gitignored `runtime_state.json`).

**Remaining blocker:**

Lock-/State-Cleanup auf `cleanupHandled = true`-Pfaden im Dispatcher (latentes WO-006-Restdefekt — bekannt, nicht Teil von WO-006/011/012/013-Scope):
- `no-tool-request completed`-Pfad
- `awaiting_approval`-Pfad
- `review`-Pfad
- `human-needed → awaiting_approval`-Pfad

Diese Pfade setzen `cleanupHandled = true`, womit der finally-Block übersprungen wird. Folge: `releaseScopeLock(runId)` und `releaseDbMigrationLock(runId)` werden auf intentional-non-terminalen Erfolgs-/Approval-/Review-Pfaden NICHT aufgerufen. Nachfolge-Workorders mit überlappenden `scope_files` treffen den stale Scope-Lock und werden vom Preflight ge`HOLD`et.

### Update 2026-05-03 — post WO-014

The lock-release issue on `cleanupHandled = true` paths was addressed by WO-GOVERNANCE-P1-014.

Code commit:
`b681402` `fix(governance): release locks on non-terminal dispatcher paths`

Meaning:
- no-tool-request completed path releases locks
- awaiting_approval path releases locks
- review path releases locks
- human-needed awaiting_approval path releases locks
- WO-002 Preflight HOLD caused by stale lock should no longer occur for new runs
- empirical re-run of BATCH-NUTRITION-P1-001 after WO-014 is still pending

**Recommended WO at that time — resolved:**

`WO-GOVERNANCE-P1-014-finally-lock-release-on-non-terminal-paths` — Lock-Release explizit VOR `cleanupHandled = true` ergänzen auf den 4 intentional-non-terminalen Pfaden, ohne die WO-006-Garantie zu schwächen oder den Status zu ändern. Risk: `architecture`. Erwartung nach Closure: Re-Run von BATCH-NUTRITION-P1-001 erreicht WO-nutrition-002 → pausiert wie spezifiziert am `db-migration`-Approval-Gate (Tom-Approval erforderlich).

Resolved by WO-GOVERNANCE-P1-014 / commit `b681402`.

**Weitere offene Followup-Kandidaten:**
- `WO-015-state-history-cleanup` — historische stuck-`dispatched`-Einträge in `active_workorders` bereinigen.
- `WO-016-stop-rule-cli` — analoge Operator-CLI für `system_stop`.
- `WO-017-validator-normalize-tests` — dedicated Mapping-/Helper-Tests für WO-005/009/012-Layers.
- `WO-018-orchestrator-contract-dynamic-generation` — Phase-2 dynamische Generation der ALLOWED_*-Listen aus dem Validator (eliminiert WO-013-LOW-Drift-Risiko).
- Spark-D-Reviewer-Injection.
- WO-NUTRITION-P1-001 Bootstrap-Workaround-Cleanup (`agent_id: docs-agent` zurückrollen).

---

*Workflow-Test-Sektion ergänzt: 2026-05-03 — nach WO-005/006/007/008/009/010/011/012/013-Closure-Sequenz und finaler Live-Verifikation des `BATCH-NUTRITION-P1-001 --run`.*
