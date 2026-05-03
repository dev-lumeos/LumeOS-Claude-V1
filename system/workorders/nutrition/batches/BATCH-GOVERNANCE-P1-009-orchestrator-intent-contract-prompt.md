# BATCH-GOVERNANCE-P1-009-orchestrator-intent-contract-prompt

## Status
ready_for_approval

## Purpose
Inject a complete OrchestratorIntent + ToolRequest contract into the system prompt so the model emits complete combined JSON instead of guessing required fields.

This single-WO batch closes die symmetrische Modell-Output-Seite zur Validator-Strenge nach Closure von WO-005/006/007/008/009/010/011/012: Validator/Dispatcher/State-Layer sind robust (smoke 9/9, fail-cleanup 24/24, tsc PASS, Batch-Dry-Run READY_TO_RUN); aber Live-Re-Runs von `BATCH-NUTRITION-P1-001-db-foundation` produzieren weiterhin reproduzierbar `Governance: REWRITE-Limit (2) erreicht. Letzte Verletzung: Feld "<X>" muss ein Array sein, war: undefined`. Die Orchestrator-Prompt-Diagnose ergab **PROMPT_MISSING_REQUIRED_FIELDS** — der `buildSystemPrompt()`-Output enthält weder JSON-Schema noch Pflichtfeld-Liste noch Beispiel des `OrchestratorIntent`-Contracts. Das Modell muss das Format raten.

**Root-Cause (per Code-Inspektion verifiziert):**
- `dispatcher.ts:391` → `buildSystemPrompt(loadAgentSpec(agentDef.spec_file), skills.loaded)` ist der einzige System-Prompt-Builder.
- `skill-loader.ts:128-132` → `buildSystemPrompt` konkateniert nur `agentSpec` + `<loaded_skills>`-Block, **kein OrchestratorIntent-Contract**.
- `system/prompts/orchestration/` → leeres Verzeichnis.
- `grep -rE "selected_agent|required_gates|stop_conditions" .claude/agents/` → 0 Treffer in allen 16 Agent-Specs.
- `OrchestratorIntent`-Type existiert nur in `governance-validator.ts:14-21` (Validator-Seite).
- `dispatcher.ts:407-408` → REWRITE-Hint reicht nur den vorherigen JSON durch, nennt nicht das fehlende Feld strukturiert.

WO-governance-013 fügt drei zusammenwirkende Komponenten ein:
1. **Neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md`** — statisches Template mit JSON-Schema-Beschreibung aller 6 OrchestratorIntent-Pflichtfelder, allowed-Values-Listen (ALLOWED_AGENTS/ALLOWED_RISK_LEVELS/ALLOWED_GATES statisch eingebettet), combined ToolRequest-Schema, mindestens 1 vollständigem Beispiel-JSON, expliziten "all-fields-required" + "no prose, no markdown fences"-Anweisungen, PRODUCTION_KEYWORDS-Constraint, Versionierungs-Hinweis (manuelle Sync bei Validator-Änderung; Phase-2-Followup für dynamische Generation).
2. **`buildSystemPrompt`-Erweiterung in `skill-loader.ts:128`** mit **lazy** Path-Resolution (analog zu `loadAgentSpec` in `dispatcher.ts:139-142`) und graceful File-missing-Fallback für Test-`process.chdir(TEST_DIR)`-Szenarien. Reihenfolge: agentSpec → `<orchestrator_intent_contract>`-Block → `<loaded_skills>`-Block.
3. **REWRITE-Pfad-Refactor in `dispatcher.ts:407-408`** — `lastValidation`-State-Tracking ergänzen; bei Retry strukturierte Validator-Reason + Field als REWRITE-Hint an das Modell durchreichen (statt nur den vorherigen JSON), plus truncated previous output (max 500 chars).

Validator-Strenge bleibt 1:1 unverändert (`ALLOWED_AGENTS`/`ALLOWED_RISK_LEVELS`/`ALLOWED_GATES`/`AGENT_VALIDATOR_MAP`/`RISK_CATEGORY_TO_RISK_LEVEL_MAP` unangetastet; `MAX_REWRITE_LOOPS = 2`; §0-§8 Body-Logik bit-identisch). Modell bekommt nur den Output-Vertrag, den der Validator ohnehin erwartet — beide Seiten sind danach in Sync.

`.claude/agents/**` bleibt unverändert (Single-Responsibility: Agent-Spec = Identität, System-Prompt-Contract = Output-Format-Vertrag — gehört nicht in jede Agent-Spec dupliziert). `services/scheduler-api/**` (Modell-Routing) bleibt unangetastet. WO-006/011 Lock-Release- und Run-id-Status-Update-Verhalten bleibt 1:1; WO-012 Array-Defensive-§0-Block fungiert weiterhin als letzte Sicherung bei defektem Modell-Output.

Nach Closure dieser WO sieht das Modell den expliziten Contract-Block und liefert vollständige Combined-JSONs. Validator-FAIL-Häufigkeit pro Run sinkt von 2-3 auf ≤1; falls trotzdem Felder fehlen, läuft REWRITE-Loop mit strukturierter "fix this exact field"-Anweisung — Modell hat klares Korrektur-Signal statt blindem Raten.

---

## Included Workorders

| Order | Filename | workorder_id | Title | Risk | Approval |
|---|---|---|---|---|---|
| 1 | `WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md` | `WO-governance-013` | governance-orchestrator-intent-contract-prompt-v1 | `architecture` | required |

**Filename ↔ ID Mapping:** Filename folgt Auftrags-Convention `WO-GOVERNANCE-P1-NNN-...md`; `workorder_id` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$` aus `system/workorders/schemas/workorder.schema.json`. Orchestrator/Scheduler nutzen das `workorder_id`-Feld.

---

## Approval Gate

- WO-governance-013 requires approval.
- Risk category: `architecture` (per `CLAUDE.md` Cautious — Spark D mandatory, no auto-retry).
- `requires_approval: true` is set in the WO YAML.
- No execution may happen before explicit approval.
- Approval is enqueued during dispatch (HUMAN_NEEDED gate via `enqueueApproval()`); Tom grants via `npx tsx system/approval/approval-cli.ts grant <approval_id>`.

---

## Execution Guard

- Must not weaken `governance-validator` (§0-§8 Body-Logik bit-identisch erhalten).
- Must not increase `MAX_REWRITE_LOOPS` (bleibt 2).
- Must not extend or reduce `ALLOWED_GATES`, `ALLOWED_AGENTS`, `ALLOWED_RISK_LEVELS`.
- Must not modify `AGENT_VALIDATOR_MAP` (WO-005) or `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009).
- Must not modify `parseOrchestratorIntent` or `normalizeOrchestratorIntent` (WO-005/009-Layer bleibt unangetastet).
- Must not modify `OrchestratorIntent`-TypeScript-Interface.
- Must not modify validator §0 Array-Defensive-Block (WO-012-Garantie).
- Must not edit `.claude/agents/**` (Agent-Specs bleiben unverändert; Contract gehört in System-Prompt-Schicht).
- Must not change `services/scheduler-api/**` (Modell-Routing/Adapter unangetastet).
- Must not modify `batch-loader.ts` oder `system/workorders/cli/**`.
- Must not modify `system/control-plane/scheduler-preflight.ts`.
- Must not modify `system/control-plane/review-pipeline.ts`.
- Must not modify `system/control-plane/risk-categories.ts`.
- Must not modify `system/control-plane/terminal-wo-reset-cli.ts` (WO-010 Operator-Tooling unangetastet).
- Must not modify `system/workorders/schemas/workorder.schema.json`.
- Must not edit `runtime_state.json` directly — alle State-Mutationen über `state-manager.ts` `mutate()`-Lock.
- Must not edit JSONL audit logs directly (`audit.jsonl`, `audit.error.jsonl`, `pipeline-audit.jsonl`, `pipeline-audit-live.jsonl`) — Audit ausschließlich über `audit-writer.ts`.
- Must not edit approval queue files (`system/approval/**`).
- Must not execute Workorders, Migrationen oder Supabase-Befehle (`supabase db push/reset/migration apply`).
- Must not add `--force` / `--skip-validator` / `--bypass` flags.
- Must not modify `package.json` und keine neuen npm-Dependencies.
- Must not duplicate the contract per agent-spec (`Per-Agent-Spec`-Variante 2 verworfen; statisches Template ist Single-Source-of-Truth).
- Must not introduce dynamic contract generation in this WO (Phase-2-Followup `WO-018` reserviert).
- Must not add Validator-side default-filling for missing array fields (`Variante 5` verworfen — verschiebt das Problem statt zu lösen).
- Must preserve WO-006 Lock-Release-Verhalten 1:1.
- Must preserve WO-011 Run-id-spezifischer Status-Update 1:1.
- Must preserve WO-012 Array-Defensive-§0-Block 1:1.
- **Path resolution for the contract file MUST be lazy per `buildSystemPrompt()` call, analogous to `loadAgentSpec` in `dispatcher.ts:139-142`.** Module-init-Resolution würde `process.cwd()` zu Module-Load-Zeit einfrieren und Test-`process.chdir(TEST_DIR)`-Szenarien brechen.
- Must not disable or skip existing tests in `dispatcher-fail-cleanup.test.ts` oder `smoke-test.ts`.
- Must not weaken any test expectation.
- Must write audit events only via `system/state/audit-writer.ts`.

---

## Expected Output

**Neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md`:**
- JSON-Schema-Beschreibung aller 6 OrchestratorIntent-Pflichtfelder: `selected_agent`, `risk_level`, `risks`, `execution_order`, `required_gates`, `stop_conditions`.
- Allowed-Values-Listen statisch eingebettet:
  - `selected_agent`: mindestens `"micro-executor"`, `"db-migration-agent"`, `"security-specialist"`, `"review-agent"`.
  - `risk_level`: `"low" | "medium" | "high"`.
  - `required_gates`: alle 8 ALLOWED_GATES-Werte (`db-migration-gate`, `rollback-gate`, `typecheck-gate`, `test-gate`, `review-gate`, `human-approval-gate`, `files-scope-gate`, `security-gate`).
- Combined ToolRequest-Schema mit erlaubten `tool`-Werten (`read|write|bash|mcp`) und Optional-Feldern (`targetPath`, `content`, `command`, `mcpTool`, `mcpOperation`, `approvalId`, `approval_operation`).
- Mindestens 1 vollständiges Beispiel-JSON mit allen 6 OrchestratorIntent-Pflichtfeldern UND einem ToolRequest-Beispiel.
- Explizite Anweisungen: `output exactly one JSON object, no prose, no markdown fences` und `include all 6 fields, even when arrays are empty`.
- PRODUCTION_KEYWORDS-Constraint und `human-approval-gate`-Pflicht-Constraint (Validator §5) dokumentiert.
- Versionierungs-Hinweis: muss bei Validator-Änderung manuell synchronisiert werden; Phase-2-Followup für dynamische Generation aus den ALLOWED_*-Sets.

**`buildSystemPrompt` in `skill-loader.ts:128` erweitert:**
- Injiziert `<orchestrator_intent_contract>...</orchestrator_intent_contract>`-Block hinter `agentSpec` und vor `<loaded_skills>`, wenn die Contract-Datei existiert.
- **Lazy** Path-Resolution per Funktions-Aufruf (analog zu `loadAgentSpec`-Pattern; Module-init-Resolution explizit verboten).
- Graceful File-missing-Fallback (return ohne Contract-Block, kein Crash) für Test-`process.chdir`-Szenarien.

**REWRITE-Pfad in `dispatcher.ts:407-408` refactored:**
- `lastValidation`-State-Tracking ergänzt; speichert die letzte `ValidationResult` aus dem REWRITE-Branch.
- Bei Retry: strukturierter Hint mit `Validator reason: <reason>` + `Field: <field>` Headers, plus truncated previous output (max 500 chars).
- Fallback-Format für Parse-Fail-Pfade (lastValidation null) bleibt erhalten.

**Bestehende Validator/Layer/State-Garantien unverändert:**
- Validator §0 Array-Defensive (WO-012), §1 selected_agent (WO-005), §2 risk_level (WO-009), §3-§8 alle BIT-IDENTISCH erhalten.
- `ALLOWED_GATES`, `ALLOWED_RISK_LEVELS`, `ALLOWED_AGENTS`, `AGENT_VALIDATOR_MAP`, `RISK_CATEGORY_TO_RISK_LEVEL_MAP` unverändert.
- `MAX_REWRITE_LOOPS = 2` unverändert.
- `OrchestratorIntent`-TypeScript-Interface unverändert.
- `parseOrchestratorIntent` und `normalizeOrchestratorIntent` unverändert.
- `state-manager.ts` und `audit-writer.ts` unverändert.
- WO-006 Lock-Release-Verhalten 1:1 erhalten.
- WO-011 Run-id-spezifischer Status-Update 1:1 erhalten.
- `.claude/agents/**` Agent-Specs UNVERÄNDERT.
- `services/scheduler-api/**` UNVERÄNDERT.

**Tests:**
- Bestehende 24 Tests in `dispatcher-fail-cleanup.test.ts` bleiben grün (9 WO-006 + 8 WO-011 + 7 WO-012).
- Mindestens 4 additive Tests:
  - **Test D-1:** `buildSystemPrompt` mit Contract-Datei → `<orchestrator_intent_contract>`-Block injiziert; `agentSpec` bleibt enthalten.
  - **Test D-2:** `buildSystemPrompt` ohne Contract-Datei (TEST_DIR ohne File) → graceful fallback (kein Crash, kein Contract-Block; nur `agentSpec`).
  - **Test D-3:** `buildSystemPrompt` mit Skills + Contract → korrekte Reihenfolge (agentSpec → contract → loaded_skills).
  - **Test D-4:** REWRITE-Hint enthält `Validator reason:` und `Field:` nach erstem REWRITE-Cycle (verifizierbar via Mock-`callModel`-Tracking der zweiten userMessage).
- Tests verwenden eindeutige `services/wo013-NNN/...` scope_files-Pattern (analog zu WO-011/012 für Lock-Isolation).
- `smoke-test.ts` bleibt 9/9 PASS (Test-Mocks aus WO-007 liefern Combined-JSONs manuell; sehen den neuen Contract-Block, ignorieren ihn aber).

**Validation:**
- `pnpm tsc --noEmit` clean.
- `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS (kein `--test` Flag — eigene `runAll()`-Schleife).
- `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → all PASS (≥24 + ≥4 = ≥28).
- `npx tsx system/workorders/cli/run-batch.ts system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run` → READY_TO_RUN.

**No changes outside scope:** `services/scheduler-api/**`, `.claude/agents/**`, `terminal-wo-reset-cli.ts`, `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `workorder.schema.json`, `system/workorders/cli/**`, `system/state/**`, `system/approval/**`, `runtime_state.json` (direkt), `*.jsonl` (direkt), `package.json`, `apps/**`, `supabase/**`, `.env*` ungeändert.

---

## Lifecycle Path

Per `system/workorders/lifecycle/wo_lifecycle_v1.md`:

```
wo_generated → graph_validated → queue_released
  → ready (no blocked_by)
  → dispatched → running
  → done
  → reviewed (architecture review + Spark D mandatory)
  → closed
```

Auto-Retry **disabled** for `architecture` per `CLAUDE.md` High-Risk-Regel.

---

## First Intended Operator Verification After Closure

Nach Closure von WO-013 darf Tom folgende Verifikations-Sequenz ausführen:

```bash
# Schritt 1 — Pflicht-Validation:
pnpm tsc --noEmit
npx tsx system/control-plane/__tests__/smoke-test.ts
npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --dry-run

# Erwartet: tsc EXIT=0, smoke 9/9 PASS, fail-cleanup ≥28/28 PASS, dry-run READY_TO_RUN.

# Schritt 2 — Live-Re-Run-Verifikation:
npx tsx system/workorders/cli/run-batch.ts \
  system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md --run

# Erwartet:
# Möglichkeit A — Modell sieht Contract, liefert vollständigen Combined-JSON:
#   WO-nutrition-001 läuft durch oder pausiert am Approval-Gate.
# Möglichkeit B — Modell liefert weiterhin teilweise unvollständigen Intent:
#   Validator-REWRITE-Häufigkeit pro Run sinkt von 2-3 auf ≤1;
#   REWRITE-Hint enthält strukturierte 'Validator reason:'-Angabe;
#   bei FAIL: kontrollierter REWRITE-Limit-FAIL mit klarer Reason
#   (nicht reproduzierbar gleicher Fehler wie pre-WO-013).
# Beide Möglichkeiten sind Spec-konform.

# Schritt 3 — Audit-Inspektion (optional):
# Anzahl der governance_violation-Events pro Run sollte sinken.
# tail -50 system/state/audit.jsonl | grep governance_violation
```

**Wichtig:** Die statische Allowed-Values-Liste im Template muss bei jeder Validator-Änderung (z. B. neuer Wert in `ALLOWED_GATES`) manuell synchronisiert werden. Dieser Sync-Pflege-Hinweis ist Teil des Templates selbst (Versionierungs-Section). Phase-2-Followup `WO-018-orchestrator-contract-dynamic-generation` würde die statische Liste durch Laufzeit-Generation aus den exportierten Sets ersetzen — nicht in WO-013.

---

## Next Step After Approval

Run WO-governance-013 through the normal implementation workflow:

1. Tom grants approval via `npx tsx system/approval/approval-cli.ts grant <approval_id>` once the HUMAN_NEEDED gate triggers during dispatch.
2. Dispatcher resumes, `consumeApproval()` is called, the `senior-coding-agent` adds:
   - Neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md` mit JSON-Schema, ALLOWED_*-Listen, vollständigem Beispiel-JSON, "all-fields-required"-Anweisung, PRODUCTION_KEYWORDS-Constraint, Versionierungs-Hinweis.
   - `buildSystemPrompt`-Erweiterung in `skill-loader.ts:128` mit **lazy** Path-Resolution + graceful File-missing-Fallback.
   - REWRITE-Hint-Refactor in `dispatcher.ts:407-408` mit `lastValidation`-State-Tracking + strukturierter Reason-Field-Pass-Through.
   - 4+ additive Tests in `dispatcher-fail-cleanup.test.ts` für Contract-Injection, Fallback, Reihenfolge, REWRITE-Reason.
   - `governance-validator.ts` und `smoke-test.ts` voraussichtlich UNVERÄNDERT (defensiv im Scope; Edit nicht erwartet).
3. Review Pipeline V2 (Spark C → Spark D mandatory for `architecture`) reviews the implementation.
4. After `done → reviewed → closed`, validation:
   - `pnpm tsc --noEmit` clean.
   - `npx tsx system/control-plane/__tests__/smoke-test.ts` → 9/9 PASS.
   - `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` → ≥28 PASS.
   - `npx tsx system/workorders/cli/run-batch.ts ... --dry-run` → READY_TO_RUN.
5. **Tom-Aktion nach Closure:** Verifikations-Re-Run von BATCH-NUTRITION-P1-001 (siehe oben "First Intended Operator Verification After Closure"). Erwartet: kein reproduzierbarer "Feld muss ein Array sein"-FAIL mehr; Modell liefert vollständige Combined-JSONs oder bei Teil-Defekten ≤1 REWRITE pro Run mit strukturierter Hint-Reason.
6. Followup workorder candidates (not part of this batch):
   - **`WO-governance-014-finally-lock-release-on-non-terminal-paths`** — schließt latentes WO-006-Lock-Leak auf intentional-non-terminal-Pfaden (no-tool-request, awaiting_approval, review). Risk: `architecture`. Bereits in BATCH-007/008 als Followup gelistet.
   - **`WO-governance-015-state-history-cleanup`** — repariert historische stuck-`dispatched`-Einträge oder erweitert WO-010 CLI um `--include-stuck-dispatched`-Flag mit verstärktem Audit. Risk: `architecture`.
   - **`WO-governance-016-stop-rule-cli`** — analoge Operator-CLI für `system_stop` Clear/Status (in BATCH-006 als Followup gelistet). Risk: `architecture`.
   - **`WO-governance-017-validator-normalize-tests`** — dedicated Mapping-/Helper-Tests für WO-005/009/012/013-Layers. Risk: `test`, autonom.
   - **`WO-governance-018-orchestrator-contract-dynamic-generation`** — Phase-2-Followup zu WO-013: Allowed-Values-Listen dynamisch zur Laufzeit aus den exportierten `ALLOWED_*`-Sets generieren statt statisch im Template. Risk: `architecture`. Erst sinnvoll, wenn WO-013 closed ist und Sync-Pflege-Aufwand zum Problem wird.
   - **Spark-D-Reviewer-Injection** (`PipelineDeps.callSeniorReviewer` injizierbar). Risk: `architecture`.
   - **Cleanup of `WO-NUTRITION-P1-001` Bootstrap-Workaround** (`agent_id: docs-agent` zurückrollen). Risk: `standard`/`docs`.

---

## Run Notes

- **Batch is ready for approval, not approved.**
- **This file does not approve execution.**
- Reines Planungsdokument. Kein Worker, kein Scheduler, kein Dispatch durch diese Datei.
- **Single-WO batch** — kein Parallel-Risk, kein Scope-Konflikt mit anderen offenen Batches.
- **Vorgänger-Batches:**
  - `BATCH-GOVERNANCE-P1-001-batch-loader-cli` (Status: `completed`).
  - `BATCH-GOVERNANCE-P1-002-orchestrator-intent-contract` (Status: closed via `WO-governance-005`) — `selected_agent`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-003-dispatcher-fail-cleanup` (Status: closed via `WO-governance-006`) — Try/Finally Lock-Release.
  - `BATCH-GOVERNANCE-P1-004-dispatcher-reviewer-injection` (Status: completed via `WO-governance-008`) — `DispatcherDeps.callFastReviewer`-Injection.
  - `BATCH-GOVERNANCE-P1-005-risk-level-normalization` (Status: completed via `WO-governance-009`) — `risk_level`-Normalisierung.
  - `BATCH-GOVERNANCE-P1-006-terminal-wo-reset-cli` (Status: completed via `WO-governance-010`) — Operator-CLI für Terminal-WO-Reset.
  - `BATCH-GOVERNANCE-P1-007-dispatcher-terminal-status-on-fail` (Status: completed via `WO-governance-011`) — Run-id-spezifischer Status-Update.
  - `BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults` (Status: completed via `WO-governance-012`) — Validator-§0-Defensive für Array-Pflichtfelder.
  - **WO-governance-007** (Smoke-Test Modernize, `risk_category: test`, autonom — kein Batch-Plan; closed nach WO-008).
- **Verhältnis zu BATCH-002 (WO-005), BATCH-005 (WO-009) und BATCH-008 (WO-012):** Komplementär. WO-005/009/012 fixen die **Validator-Seite** (defensive Layer für selected_agent/risk_level/Array-Felder); **WO-013** schließt die symmetrische **Modell-Output-Seite** — beide Seiten sind danach in Sync.
- **Verhältnis zu BATCH-003 (WO-006), BATCH-007 (WO-011):** Komplementär. WO-006/011 fixen Cleanup auf FAIL-Pfaden (Lock-Release + Run-id-Status-Update). WO-013 reduziert die Häufigkeit von FAIL-Pfaden, indem das Modell zuverlässiger korrekten Output liefert. Beide Cleanup-Layers wirken weiterhin auf den (jetzt seltener auftretenden) REWRITE-Limit-FAIL-Pfad.
- **Verhältnis zu BATCH-NUTRITION-P1-001-db-foundation:** Direkter operativer Vorgänger — nach WO-013 reduziert sich die FAIL-Häufigkeit pro `--run`-Versuch. Workflow-Test-Sequenz wird vorhersagbarer.
- **Audit-Trail:** Bestehender `governance_violation`-Event-Typ wird weiterhin vom REWRITE-Pfad korrekt geschrieben. Kein neuer Audit-Event-Typ nötig. Erwartete Änderung: Anzahl der `governance_violation`-Events pro Run sinkt.
- **Production-Default Verhalten:** `dispatch-loop.ts` ruft `defaultCallModel` mit `buildSystemPrompt`-Output. Mit WO-013 enthält der Output zusätzlich den Contract-Block — Modell-Verhalten verändert sich VORTEILHAFT (vollständigere Outputs), keine Regression. Token-Overhead pro Call: einmalig der Contract-Block (nicht pro Retry; System-Prompt ist statisch, nur userMessage variiert).
- **State-Machine-Sicherheit:** Bei seltenen Edge-Cases (Modell ignoriert Contract trotz expliziter Anweisung) greift weiterhin WO-012-§0-Defensive im Validator → kontrolliertes REWRITE → bei Limit `updateActiveWorkorderStatusByRun(... 'failed')` (WO-011) → Lock-Release im finally (WO-006). Defense-in-Depth-Kette intakt.
- **Versionierungs-Pflege:** Statisches Template muss bei Validator-Änderung (z. B. neuer Wert in `ALLOWED_GATES`) manuell synchronisiert werden. Dieser Sync-Punkt ist Teil des Template-Inhalts selbst und Teil der WO-Spec. Phase-2-Followup `WO-018` reserviert für dynamische Generation.

---

*Batch-Plan erzeugt: 2026-05-03 — gemäß `WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md` (Draft, PASS-Review ohne Pflicht-Fixes), `REVIEW-WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md` (Verdict: PASS, eine LOW-Anmerkung zur lazy Path-Resolution nicht-blockierend) und `BATCH-GOVERNANCE-P1-008-orchestrator-intent-array-defaults.md` (Pattern-Vorlage).*
