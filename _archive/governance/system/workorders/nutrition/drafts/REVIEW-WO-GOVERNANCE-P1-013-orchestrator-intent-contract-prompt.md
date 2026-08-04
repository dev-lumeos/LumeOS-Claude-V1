# REVIEW-WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md

**Reviewed Draft:** `system/workorders/nutrition/drafts/WO-GOVERNANCE-P1-013-orchestrator-intent-contract-prompt.md`
**Reviewer:** Claude (Brain) · Workorder-Reviewer
**Review-Datum:** 2026-05-03

---

## Verdict

**PASS**

Architektur-Variante 1 sauber gewählt; Scope minimal; alle Validator/Cleanup/Agent-Spec-Garantien aus WO-005/006/009/011/012 explizit verankert. Eine LOW-Anmerkung zur Path-Resolution-Klarstellung (kein Blocker — Implementer kann das aus dem `loadAgentSpec`-Pattern ableiten).

---

## Findings

| Severity | Finding | Fix |
|---|---|---|
| INFO | **Schema-konform:** `workorder_id` matched `^WO-[a-z]+-[0-9]+$`; alle Pflichtfelder gesetzt; `negative_constraints`=31 (≥4); `acceptance_criteria`=27 (≥1); `scope_files`=6 (≥1); `task` enthält XML-Block; `rollback_hint` nicht nötig (nicht db-migration); `risk_category` ∈ enum; `priority` ∈ enum; `phase` ∈ enum. | — |
| INFO | **Template-konform:** `template_implementation_medium.md`-Struktur (XML-Task `<analyze>/<implement>/<constraints>/<on_error>`, `agent_id: senior-coding-agent`, `post_review_required: true`, 6 Files innerhalb 3-15-Range). | — |
| INFO | **`risk_category: architecture` korrekt:** Eingriff in System-Prompt-Vertrag-Schicht (zentraler `buildSystemPrompt`-Injection-Point + REWRITE-Hint-Refactor) ist architectural per `CLAUDE.md` Cautious-Block. Spark-D-Mandatory-Review eingehalten. | — |
| INFO | **`requires_approval: true` korrekt** für `risk_category: architecture`. | — |
| INFO | **`agent_id: senior-coding-agent` korrekt:** Existiert in `agents.json`; via `AGENT_VALIDATOR_MAP` (WO-005) zu `'micro-executor'` normalisiert; via `RISK_CATEGORY_TO_RISK_LEVEL_MAP` (WO-009) `risk_level: 'medium'`. | — |
| INFO | **Scope minimal und angemessen:** 6 Files. `skill-loader.ts` (Primary, `buildSystemPrompt`-Erweiterung); neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md`; `governance-validator.ts` (defensiv im Scope für ggf. additive Set-Exports — Edit explizit als "nicht erwartet" markiert); `dispatcher.ts` (REWRITE-Hint-Edit Zeile 407-408); 2 Test-Files. | — |
| INFO | **`files_blocked` korrekt verriegelt 14 Patterns:** `.claude/agents/**` (Agent-Specs unverändert; Contract gehört in System-Prompt-Schicht), `services/scheduler-api/**`, `terminal-wo-reset-cli.ts` (WO-010), `scheduler-preflight.ts`, `review-pipeline.ts`, `risk-categories.ts`, `system/state/**`, `system/approval/**`, `system/workorders/cli/**`, `workorder.schema.json`, `package.json`, `.env*`. Lückenlos. | — |
| INFO | **Fix ist tatsächlich nur System-Prompt-/Contract-Injection:** Out-of-Scope-Block + Constraints + 31 negative_constraints schließen explizit aus: Validator-Bypass, §0-§8 Logik-Änderung, ALLOWED_*-Werte-Schwächung, AGENT_VALIDATOR_MAP/RISK_CATEGORY_TO_RISK_LEVEL_MAP-Änderung, MAX_REWRITE_LOOPS-Erhöhung, parseOrchestratorIntent/normalizeOrchestratorIntent-Edit, OrchestratorIntent-Type-Änderung, WO-006/011-Behaviour-Bruch, WO-012-§0-Block-Schwächung, Per-Agent-Spec-Duplikation, dynamische Generation, Validator-Auto-Default-Filling. Reiner Prompt-Layer-Fix. | — |
| INFO | **Validator-Strenge unverändert:** §0-§8 Body-Logik bit-identisch (Constraint + AC + negative_constraint dreifach verankert). `ALLOWED_AGENTS`/`ALLOWED_RISK_LEVELS`/`ALLOWED_GATES`/`AGENT_VALIDATOR_MAP`/`RISK_CATEGORY_TO_RISK_LEVEL_MAP` unverändert. `MAX_REWRITE_LOOPS = 2` unverändert. Allowed-Values im Template **statisch eingebettet** (sync-Pflege bei Validator-Änderung dokumentiert). | — |
| INFO | **`parseOrchestratorIntent`/`normalizeOrchestratorIntent` unverändert:** Out-of-Scope + 1 dedicated negative_constraint. WO-005/009-Layer bleibt unangetastet. | — |
| INFO | **`.claude/agents/**` nicht geändert:** explizit in `files_blocked` + 1 dedicated negative_constraint + Out-of-Scope-Bullet. Sauberer Layer-Cut: Agent-Spec = Identität, System-Prompt-Contract = Output-Format. | — |
| INFO | **Statisches Template ist sinnvoll:** Single-Source-of-Truth in `system/prompts/orchestration/orchestrator_intent_contract.md` (das aktuell leere Verzeichnis bekommt sinnvollen Inhalt). Variante-2-5 alle sauber begründet verworfen (Per-Agent-Duplikation, dynamische Generation als Phase-2, userMessage inline Token-ineffizient, Validator-Auto-Default verschiebt Problem). Versionierungs-Hinweis im Template selbst sicherstellt manuelle Sync bei Validator-Änderung. | — |
| INFO | **`buildSystemPrompt` ist der zentrale Injection-Point:** Verifiziert per Code-Inspektion — `dispatcher.ts:391` `const systemPrompt = buildSystemPrompt(loadAgentSpec(agentDef.spec_file), skills.loaded)` ist der einzige Einstiegspunkt für System-Prompts aller dispatched Workorders. `skill-loader.ts:128` `buildSystemPrompt` hat bereits `fs`/`path` imports (Zeile 8-9). Kein neuer Module-Cross-Cut nötig. | — |
| INFO | **REWRITE-Hint-Refactor sauber spezifiziert:** Aktuelle Zeile 407-408 reicht nur den vorherigen JSON durch. Spec ergänzt strukturierte `Validator reason: ...`/`Field: ...`-Header + truncated previous output (max 500 chars für Token-Effizienz). `lastValidation`-State-Tracking-Pattern explizit dokumentiert. Same userMessage-Path (kein Eingriff in `callModel`-Signatur). | — |
| INFO | **Acceptance Criteria messbar:** 27 ACs, davon 24 binär verifizierbar (Datei-Existenz, JSON-Schema-Inhalt-Match, Block-Header-Match `<orchestrator_intent_contract>`, Test-Counts, REWRITE-Hint-Pattern-Match `Validator reason:`, Pattern-Match `Field:`). AC "≤1 Validator-REWRITE pro Run statt 2-3" ist via Audit-File-Inspektion (`governance_violation`-Event-Count) prüfbar. | — |
| INFO | **Validation-Commands passend:** `pnpm tsc --noEmit` + `npx tsx system/control-plane/__tests__/smoke-test.ts` (ohne `--test` — korrekt, eigene `runAll()`) + `npx tsx --test system/control-plane/__tests__/dispatcher-fail-cleanup.test.ts` (mit `--test` — korrekt, `node:test`) + Batch-Dry-Run als E2E-Smoke. | — |
| INFO | **`<on_error>` umfassend:** TypeScript-Fehler, Breaking-Change in `buildSystemPrompt`-API, Edits an `.claude/agents/**`/`services/scheduler-api/**`/`batch-loader.ts`/`governance-validator.ts`-Body/`parseOrchestratorIntent`/`normalizeOrchestratorIntent`, neue Dependency, Migration, Security, rote Tests, WO-006/009/011/012-Behaviour-Bruch — alle Pfade mit klaren ESCALATE/STOP-Triggers. | — |
| INFO | **Tests sind ausreichend:** 4 additive Tests (D-1 Contract-Injection, D-2 graceful-fallback, D-3 Skills+Contract-Reihenfolge, D-4 REWRITE-Hint-Reason-Match). Plus Verifikation dass bestehende 24 fail-cleanup + 9/9 smoke-test grün bleiben. Eindeutige `services/wo013-NNN/...` scope_files-Pattern. | — |
| INFO | **Lifecycle korrekt:** `done → reviewed → closed` (architecture → Spark-D mandatory) per `wo_lifecycle_v1.md`. Auto-Retry deaktiviert per `CLAUDE.md` High-Risk-Regel. | — |
| INFO | **Pattern-Konsistenz mit WO-005/009/012:** WO-005 fixt `selected_agent` (Validator-Layer + Mapping); WO-009 fixt `risk_level` (Validator-Layer + Mapping); WO-012 fixt Array-Felder (Validator-§0-Defensive); **WO-013** schließt die symmetrische Modell-Output-Seite — der Validator wartet auf 6 Pflichtfelder, jetzt sagt der System-Prompt dem Modell explizit, dass und wie es diese liefern soll. Beide Seiten (Validator-Strenge + Modell-Output-Vertrag) sind danach in Sync. | — |
| INFO | **WO-006 Lock-Release + WO-011 Run-id-Status-Update + WO-012 Array-Defensive intakt:** Constraint + 3 dedicated negative_constraints explizit verankern dies. Bei §0-Validator-REWRITE-Limit-FAIL (z. B. Modell liefert weiterhin unvollständig) wirkt WO-011 weiter; bei Lock-Release wirkt WO-006 weiter. | — |
| LOW | **Path-Resolution-Klarstellung im Implement-Schritt 2.** Spec-Code-Skizze: `const CONTRACT_PATH = path.resolve(process.cwd(), 'system/prompts/orchestration/orchestrator_intent_contract.md')`. Der Hinweis "Add path resolution at module-init **oder** in der Funktion (lazy)" ist mehrdeutig. Wenn die Konstante module-init-resolved wird, friert sie `process.cwd()` zu Module-Load-Zeit ein — das **bricht Tests** mit `process.chdir(TEST_DIR)` (Test D-2 graceful-fallback würde im REAL-Repo-Pfad suchen statt im TEST_DIR). Existing `loadAgentSpec` (`dispatcher.ts:139-142`) nutzt **lazy** Per-Aufruf-Resolution. Für Test-Kompatibilität ist lazy zwingend. | Klarstellung im Implement-Schritt 2: "Path-Resolution MUSS lazy (per Funktions-Aufruf) erfolgen, analog zu `loadAgentSpec` in `dispatcher.ts:139-142`. Konstanten-Style auf Modul-Ebene würde `process.cwd()` zu Module-Load-Zeit einfrieren und Test D-2 (`process.chdir(TEST_DIR)` ohne Contract-Datei) brechen." Im Code-Beispiel `try { ... }`-Block direkt einbauen statt module-level Konstante. Kein Blocker — Implementer würde das beim ersten Test-Failure entdecken und korrigieren. |

---

## Batch Readiness

**Ready** — kein blocker-level Finding. LOW-Anmerkung zur Path-Resolution ist Implementer-Hinweis und nicht-blockierend (Tests fangen den Fehler ab, falls er auftritt). WO ist ready für `BATCH-GOVERNANCE-P1-009-orchestrator-intent-contract-prompt` und Approval-Gate (`requires_approval: true`).

---

## Required Fixes

**Keine.** Die WO ist batch-ready. LOW-Finding zur lazy Path-Resolution ist optional (Implementer kann das aus dem `loadAgentSpec`-Pattern ableiten; Test D-2 würde es ohnehin abfangen).

---

## Recommended Next Step

1. **Single-WO-Batch erstellen** (`BATCH-GOVERNANCE-P1-009-orchestrator-intent-contract-prompt.md`) analog zu BATCH-005/006/007/008.
2. **Approval-Gate** (`requires_approval: true`) durch Tom (`npx tsx system/approval/approval-cli.ts grant <approval_id>`).
3. **Senior-Coding-Agent ausführt:**
   - Neue Datei `system/prompts/orchestration/orchestrator_intent_contract.md` mit JSON-Schema, ALLOWED_*-Listen, 1+ vollständigem Beispiel-JSON, "all-fields-required"-Anweisung, Versionierungs-Hinweis.
   - `buildSystemPrompt`-Erweiterung in `skill-loader.ts:128` mit **lazy** Path-Resolution + graceful File-missing-Fallback.
   - REWRITE-Hint-Refactor in `dispatcher.ts:407-408` mit `lastValidation`-State-Tracking und strukturierter Reason-Field-Pass-Through.
   - 4+ additive Tests in `dispatcher-fail-cleanup.test.ts` für Contract-Injection, Fallback, Reihenfolge, REWRITE-Reason.
4. **Spark-D Mandatory Review** vor `done → reviewed → closed`.
5. **Validation:** `pnpm tsc --noEmit`, `smoke-test.ts` (9/9), `dispatcher-fail-cleanup.test.ts` (24 + ≥4 = ≥28 PASS), Batch-Dry-Run READY_TO_RUN.
6. **Tom-Aktion nach Closure (Verifikation):** Re-Run `BATCH-NUTRITION-P1-001-db-foundation` `--run`. Erwartung: Modell-Output enthält vollständigen Combined-JSON (alle 6 OrchestratorIntent-Pflichtfelder + Optional-ToolRequest); Validator-REWRITE-Häufigkeit pro Run sinkt von 2-3 auf ≤1; falls weiterhin unvollständig, dann mit klarer Validator-Reason und WO-011-konformem `failed`-Status.

**Übersicht der bereits geplanten Followup-WOs (aus BATCH-007/008/Vorgänger):**
- `WO-014-finally-lock-release-on-non-terminal-paths` (latentes WO-006-Lock-Leak)
- `WO-015-state-history-cleanup` (historische stuck-`dispatched`-Einträge)
- `WO-016-stop-rule-cli` (analoge Operator-CLI für `system_stop`)
- `WO-017-validator-normalize-tests` (dedicated Mapping-Tests)
- `WO-018-orchestrator-contract-dynamic-generation` (Phase-2 dynamische Generation aus den ALLOWED_*-Sets — neuer Followup-Kandidat aus WO-013-Architektur-Diskussion)
- Spark-D-Reviewer-Injection
- WO-NUTRITION-P1-001 Bootstrap-Cleanup

---

*Review erzeugt: 2026-05-03 — gemäß `MASTERPROMPT_WORKORDER_REVIEW.md`, gegen `workorder.schema.json`, `wo_lifecycle_v1.md`, `template_implementation_medium.md`, `skill-loader.ts` (`buildSystemPrompt` Zeile 128 + `fs`/`path`-Imports Zeile 8-9), `dispatcher.ts` (`loadAgentSpec` Zeile 139-142 lazy-pattern, `buildSystemPrompt`-Aufruf Zeile 391, REWRITE-Hint-Stelle Zeile 407-408), `governance-validator.ts` (`OrchestratorIntent`-Interface, `ALLOWED_*`-Sets), und WO-005/009/012 als Pattern-Vorlagen für Validator/Modell-Output-Vertrags-Schicht.*
