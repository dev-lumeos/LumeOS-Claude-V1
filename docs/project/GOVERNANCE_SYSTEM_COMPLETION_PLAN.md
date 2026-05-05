# LumeOS Governance System Completion Plan

## 1. Purpose

This plan exists because the governance system is now powerful enough to run real batches, but it is still too dependent on chat history and Tom manually carrying state between ChatGPT, Codex, Claude, the operator, and runtime artifacts.

The goal is to make the governance system operable before more product work continues. Tom's role should be to define goals, approve or reject real human decisions, and review final reports. Tom should not have to debug runtime lifecycle state by hand or copy every intermediate keypoint between tools.

## 2. Current Architecture Map

| Layer | Current implementation files | Status | Evidence |
|---|---|---|---|
| 1. Brainstorm / input capture | `docs/project/prompts/MASTERPROMPT_BRAINSTORM_TO_SPEC.md`, `docs/BrainstormDocs/` | PARTIAL | Prompts exist, but source capture is not tied to operator lifecycle. |
| 2. Spec source-chain | `docs/specs/*/INDEX.md`, Nutrition `01_current_specs`, `02_patches`, `03_sql`, `04_adrs`, `05_reviews`, `system/workorders/cli/spec-source-chain-check.ts` | TESTED | Batch 005 adds read-only source-chain validation and the Workorder Source Chain Standard. |
| 3. Decomposition | `.agents/skills/spec-to-decomposition`, `docs/project/prompts/MASTERPROMPT_SPEC_TO_WORKORDERS.md` | DOCS_ONLY | Skill and prompt exist; no deterministic checker confirms decomposition completeness. |
| 4. Workorder factory | `.agents/skills/wo-writer`, `system/workorders/templates/`, `system/workorders/schemas/workorder.schema.json`, `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md` | PARTIAL | Source-chain requirements are defined and checkable; factory generation is not yet automated/enforced. |
| 5. Workorder schema / validator | `system/workorders/schemas/workorder.schema.json`, `system/control-plane/governance-validator.ts`, tests | TESTED | Validator tests exist; lifecycle-specific invariants are spread across files. |
| 6. Batch graph / dependency | `system/workorders/cli/batch-loader.ts`, `run-batch.ts`, batch operator tests | TESTED | Batch order and `blocked_by` behavior are covered; deeper cross-batch graph checks are missing. |
| 7. Scheduler / preflight | `system/control-plane/scheduler-preflight.ts`, `services/scheduler-api/`, tests | TESTED | Preflight tests exist; scheduler/runtime mapping bugs have occurred. |
| 8. Dispatcher / tool-loop | `system/control-plane/dispatcher.ts`, dispatcher tests | PARTIAL | Tool-loop exists; incident history shows fragile model-output handling. |
| 9. Approval lifecycle | `system/approval/*`, `system/agent-registry/approval_operation_types.json`, approval tests, `system/control-plane/governance-invariant-check.ts` | TESTED | Queue/token/runtime split is improved and tested; Batch 003 adds read-only invariant detection. |
| 10. Review pipeline | `system/control-plane/review-pipeline.ts`, review tests | PARTIAL | Pipeline exists; reviewer invalid JSON learning is not fed into durable rules automatically. |
| 11. Stop rules / system stop | `system/control-plane/stop-rules.ts`, `system/state/state-manager.ts`, tests | TESTED | Baselines exist for failed runs and invalid JSON; stop lifecycle docs are thin. |
| 12. Cleanup / state lifecycle | `system/control-plane/terminal-wo-reset-cli.ts`, `system/control-plane/governance-invariant-check.ts`, state manager, tests | TESTED | Official cleanup paths exist and read-only invariant checks summarize runtime drift. |
| 13. Reporting / dossier | `system/reports/*`, `system/reports/batch-dossier.ts`, reports directories | TESTED | Batch 006 adds a read-only batch dossier reporter with Markdown/JSON output, explicit `--write`, output classification, checker summaries, and operator dossier suggestions. |
| 14. Operator CLI | `system/workorders/cli/run-batch-operator.ts`, `batch-operator.ts`, runbook, tests | TESTED | Operator reached real DONE for Nutrition 001 and P1-004. |
| 15. Agent contract | `.claude/agents/*`, `system/agent-registry/agents.json`, `system/control-plane/agent-contract-check.ts` | TESTED | Batch 004 adds read-only checks for JSON-only contracts, selected_agent drift, example path leaks, and db-migration write/review rules. |
| 16. Skill contract | `.agents/skills/*/SKILL.md`, `system/agent-registry/skill_registry.json`, `system/control-plane/agent-contract-check.ts` | TESTED | Batch 004 validates SKILL.md frontmatter/body and reports registry drift. |
| 17. Model routing / JSON / thinking policy | `system/agent-registry/model_routing.json`, dispatcher model caller, AGENTS.md, `system/control-plane/agent-contract-check.ts` | TESTED | Batch 004 checks Qwen3.6 thinking-off documentation and dispatcher JSON object response enforcement. |
| 18. Merge / promotion governance | Manual branch review and push procedure in chat | MISSING | No branch-review CLI or promotion gate exists. |
| 19. Memory layer | `system/memory/canonical/*`, `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`, CLAUDE.md, AGENTS.md | PARTIAL | Batch 002 created current handover and canonical corrections; update enforcement is still manual. |
| 20. Learning / feedback-loop | `docs/project/governance-learning/*`, commit history, tests | PARTIAL | Batch 002 created incident records and schema; machine-readable operator learning records are still missing. |
| 21. Incident-to-regression-test | Tests near fixes | PARTIAL | Many recent incidents have tests, but there is no required incident record. |
| 22. Knowledge handover / session continuity | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`, `system/memory/canonical/*` | PARTIAL | Current handover exists; operator-maintained refresh is still missing. |
| 23. Runtime artifact policy | `.gitignore`, operator artifact categorization, `system/control-plane/governance-invariant-check.ts` | TESTED | Raw BLS and runtime artifact drift are checked read-only by Batch 003. |
| 24. Product work gate | `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`, `system/memory/canonical/lumeos_canonical.md` | PARTIAL | Gate is documented; automated enforcement is still missing. |

## 3. Completed Components

- Workorder schema validation and governance intent validation.
- Permission gateway and migration static guard.
- Approval queue, token creation, consumption, denial sync, and CLI.
- Stop rules with baselines for historical failed runs and invalid JSON spikes.
- Safe terminal, stale-dispatched, and expired-approval cleanup paths.
- Governance batch operator with `--status`, `--dry-run`, `--continue`, and `--continue --apply-safe-cleanups`.
- Batch operator tests covering clean status, approvals, cleanup suggestions, stop-rule blocks, no automatic grants, no Supabase commands, ambiguity refusal, and exact next commands.
- Agent & Skill Contract Checker for runtime-facing agent contracts, SKILL.md frontmatter/body, registry drift, model routing JSON/thinking policy, and approval operation scope.
- Spec Source Chain Checker for module INDEX resolution, `source_refs`, expected outputs, scope alignment, raw-source policy, and placeholder/example guards.
- Nutrition Batch 001 output completion and Nutrition P1-004 static schema verification.

## 4. Partial Components

- Spec source-chain is now checkable, but Workorder Factory generation of `source_refs` is not yet automated.
- Agent and skill contract validation exists as a read-only checker, but it is not yet wired into operator preflight or merge promotion gates.
- Reporting exists as run summaries, WO dossiers, and a Batch 006 batch dossier reporter; merge-readiness promotion is still separate.
- Runtime artifact policy exists in operator categorization, `.gitignore`, and the Batch 003 invariant checker; automated merge enforcement is still missing.
- Stop-rule lifecycle has baselines, but acknowledgement policy is still manual.
- Memory exists, but it is not updated after every governance batch and contains stale claims.

## 5. Missing Components

- Branch review / merge / push readiness CLI.
- Operator `--doctor` mode for self-diagnosing common blockers.
- Product work gate that blocks BLS import until required governance batches are done.

## 6. Critical Invariants

- A completed run must not leave an `active_workorder` in `dispatched`, `running`, or `awaiting_approval`.
- Scheduler state must preserve `blocked` and `awaiting_approval`; it must not collapse them into generic `failed`.
- Approval queue, runtime approval item, and enforcement token must stay synchronized.
- A granted approval is redispatchable only if the enforcement token is usable and scoped to the same workorder, agent, operation, tool, and path.
- A denied approval must be reflected in runtime state and must allow official cleanup when no pending usable approval remains.
- Model output cannot change the selected agent away from the workorder agent.
- Read-only context access must not require a db-migration human gate.
- Migration writes must pass static guard before review.
- Example/template paths such as `example.sql` must never become real tool targets.
- Rollback/DOWN sections in migrations must not be executable.
- Operator `DONE` must mean all expected outputs exist and no active blockers remain.
- Runtime artifacts must not be committed.
- Raw BLS files are local-only unless Tom explicitly approves source-control inclusion.
- No Supabase `db push`, `db reset`, production DB command, or migration execution may be performed by workers or Codex during governance batches.

## 7. Workorder Execution Lifecycle

The intended lifecycle is:

`Brainstorm -> Spec -> Decomposition -> Workorder -> Batch -> Preflight -> Dispatch -> Tool Request -> Approval Gate if needed -> Tool Execution -> Review -> Done -> Report -> Memory/Learning update`

Current gap: the first and last stages are weak. The deterministic middle is much stronger than source-chain capture and durable post-run learning.

## 8. Approval Lifecycle

Intended lifecycle:

`pending -> granted | denied | expired -> consumed where applicable -> official cleanup behavior`

Rules:

- `pending` blocks cleanup and continuation.
- `granted` permits only the exact operation in the token scope.
- `denied`, `expired`, and `consumed` are terminal for the approval decision.
- Expired or unusable approval blockers may be cleaned only through `terminal-wo-reset-cli.ts clear-expired-approval` after dry-run proves one exact target.
- Grants must never imply Supabase execution.

Gaps:

- Approval state invariants are tested and audited by the Batch 003 read-only checker, but the checker is not yet part of operator `--doctor`.
- Approval review reports are chat-local, not saved as durable incident/decision records.

## 9. Cleanup Lifecycle

Official cleanup paths:

- `clear` for terminal `failed` or `done` active workorders.
- `clear-stale-dispatched` for stale `dispatched` entries with evidence.
- `clear-expired-approval` for `awaiting_approval` entries with denied, expired, consumed, or missing unusable approval evidence.

Rules:

- Dry-run first.
- Confirm only one exact WO/run target.
- Refuse ambiguous matches.
- Refuse running workorders.
- Refuse active locks.
- Refuse pending usable approvals.

Gap: cleanup is safe but reactive. Batch 003 identifies these states read-only; operator `--doctor` still needs to surface the same diagnosis in the operator workflow.

## 10. Stop Rule Lifecycle

Current stop rules include failed runs, pending human approvals, invalid JSON spikes, scope violations, and escalation spikes.

Required lifecycle:

`detect -> dry-run report -> system_stop if needed -> Tom acknowledgement -> baseline update -> memory/learning record`

Gaps:

- Baseline acknowledgement exists for failed runs and invalid JSON, but not as a guided operator lifecycle.
- Scope and escalation historical baselines are less mature.
- Stop-rule incidents are not automatically converted into regression tests or prompt rules.

## 11. Reporting / Dossier Lifecycle

Current reports include run summaries, failed WO report, model quality report, morning report, and WO dossiers.

Required lifecycle:

`run timeline -> approval timeline -> cleanup timeline -> output classification -> merge readiness -> handover update`

Gaps:

- Unified batch dossier exists through `system/reports/batch-dossier.ts`.
- Runtime artifact classification is reused by the dossier, but promotion governance still needs a formal merge gate.
- Report generation is read-only by default and writes files only with `--write`.

## 12. Agent Contract Rules

- Runtime-facing agents must emit JSON only where the dispatcher expects JSON.
- Qwen3.6 routes must use `enable_thinking: false`, `temperature: 0.0`, and JSON object response format where required.
- Agent examples must use non-executable placeholders or explicitly say "never use literally".
- `selected_agent` must match the workorder agent or be rewritten.
- `db-migration-agent` writes require human approval and post-write review; reads do not.
- `db-migration-agent` must be followed by security-specialist review for SQL/RLS work.

Batch 004 status: implemented as `system/control-plane/agent-contract-check.ts`. Remaining gap: the checker is not yet wired into operator preflight, merge readiness, or promotion gates.

## 13. Skill Contract Rules

- Every `SKILL.md` needs parser-safe frontmatter.
- Skills must declare narrow purpose and safe boundaries.
- High-risk skills must not authorize unsafe tools by generic wording.
- Skill registry should match filesystem skills.

Batch 004 status: implemented as `system/control-plane/agent-contract-check.ts`. Remaining gap: registry drift is reported as non-blocking until a canonical skill registry policy is decided.

## 14. Model Routing Rules

- `system/agent-registry/model_routing.json` and `agents.json` are the SSOT for routing.
- Qwen3.6 must have thinking disabled through API kwargs, not prompt text.
- JSON object response format should be requested for JSON-only paths.
- Fallback behavior must preserve agent identity and risk gates.

Batch 004 status: Qwen3.6 thinking-off and JSON object response policy are checked read-only by `system/control-plane/agent-contract-check.ts`.

## 15. Operator Commands

Implemented:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --status
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --dry-run
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --continue
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --continue --apply-safe-cleanups
```

Planned:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --doctor
```

`--doctor` should explain runtime blockers, invariant violations, memory/learning status, stop-rule baselines, and exact safe next action without dispatching.

## 16. Memory Layer

Current locations:

- `system/memory/canonical/lumeos_canonical.md`
- `system/memory/canonical/adr_index.md`
- `system/memory/canonical/session_protocol.md`
- `system/memory/schemas/memory_schemas_v1.md`
- `docs/chatgpt/LUMEOS_HANDOVER_CONTEXT*.md`
- `CLAUDE.md`
- `AGENTS.md`

Assessment:

- Durable project decisions exist but are stale.
- Runtime lessons are mostly in chat, commits, and tests.
- Agent-specific lessons are scattered across `.claude/agents`, `AGENTS.md`, and tests.
- Operator lessons are in the runbook and batch-operator tests, not in a single current handover.
- Incident summaries are not structured.
- "Do not repeat" rules exist in prompts and docs but are duplicated.
- There is no authoritative `CURRENT_GOVERNANCE_HANDOVER.md`.
- Fixes are linked to tests by commit history, not by durable incident records.
- Future runs cannot reliably retrieve lessons without chat history.
- Memory updates are manual afterthoughts, not a workflow step.

Required policy:

- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md` is the current session handover.
- `docs/project/governance-learning/` stores incident learning records.
- `system/memory/canonical/` stores compact current truths only after batch completion.
- Every governance batch must update the handover and learning log if it fixes or discovers an incident.

## 17. Learning / Feedback Loop Layer

Current state:

- Failed runs can trigger stop rules.
- Some bug classes have regression tests.
- Invalid JSON and approval lifecycle incidents led to fixes.
- Operator failures led to operator improvements during Nutrition Batch 001.

Gaps:

- Failed runs are not classified into durable incident categories automatically.
- Recurring patterns are not detected across runs.
- Incidents are not required to create regression tests.
- Reviewer invalid JSON failures are not automatically converted into prompt/contract rules.
- Approval lifecycle bugs are not recorded in a learning schema.
- Stop-rule triggers are not converted into baseline/acknowledge policy records.
- Operator failures do not create machine-readable learning records.
- The system cannot yet detect repeated bug classes before they recur.

Required workflow:

`Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update -> Operator/Checker coverage`

## 18. Incident-to-Regression Pipeline

Every governance bug should produce:

- Incident ID.
- Affected layer.
- Root cause.
- Fix commit.
- Regression test path.
- Durable rule path.
- Memory/handover update.
- Recurrence detector or explicit reason why no detector exists.

This should be mandatory for approval lifecycle, dispatcher lifecycle, stop-rule, model-output, migration guard, and operator end-state bugs.

## 19. Spec Source Chain

Required resolution:

`module INDEX.md -> current specs -> patches -> SQL patch sources -> ADRs -> reviews -> workorder planning -> workorder`

Nutrition source priority example:

1. `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`
2. `docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql`
3. `docs/specs/Nutrition/00_raw/bls/original/` for validation/provenance only

Batch 005 status: implemented as `system/workorders/cli/spec-source-chain-check.ts` and documented in `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md`. Remaining gap: Workorder Factory prompts/skills still need to generate `source_refs` automatically for every new workorder.

## 20. Product Work Gate

BLS import and Nutrition product feature work may proceed only after Governance Batch 005 is merged/pushed and the target workorder or batch passes source-chain, invariant, and agent-contract checks, unless explicitly waived by Tom.

Minimum gate before BLS import:

- Current governance handover exists and is updated.
- Learning schema exists.
- Recent incidents have durable records.
- Runtime invariant checker exists and passes.
- Operator status for the target batch is clean.
- No pending approvals, active locks, or stop-rule triggers.
- Raw BLS local-only policy remains enforced.
- Source-chain checker passes for the target workorder or batch.

## 21. Required Governance Batches

| Priority | Batch | Goal | Blocks product work | Notes |
|---|---|---|---|---|
| 1 | Governance Batch 002 - Memory & Learning Foundation | Make project knowledge durable and reduce repeated debugging. | yes | Required before BLS import resumes. |
| 2 | Governance Batch 003 - Invariant Checker | Read-only runtime/state consistency checker. | completed | Implemented by `system/control-plane/governance-invariant-check.ts`. |
| 3 | Governance Batch 004 - Agent & Skill Contract Validation | Prevent agent/skill contract drift. | completed | Implemented by `system/control-plane/agent-contract-check.ts`. |
| 4 | Governance Batch 005 - Spec Source Chain / Workorder Factory | Ensure WOs are derived from specs, not fragments. | completed | Implemented by `system/workorders/cli/spec-source-chain-check.ts`; target product work must pass it. |
| 5 | Governance Batch 006 - Reporting & Dossier Hardening | Make results self-explaining and reduce manual review. | no | Implemented as read-only batch dossier reporter. |
| 6 | Governance Batch 007 - Promotion / Merge Governance | Formalize branch review, merge, push, and post-merge checks. | no | Reduces manual Git choreography. |
| 7 | Governance Batch 008 - Operator Doctor / Autonomy Hardening | Self-diagnose common blockers. | no | Builds on Batches 002 and 003. |

## Gap Register

| Layer | Status | Risk | Product work blocked | Autonomous operator blocked | Recommended fix | Next batch | Safe now |
|---|---|---|---|---|---|---|---|
| Memory layer | BROKEN | critical | yes | yes | Create current handover, learning schema, update policy. | Batch 002 | yes |
| Learning loop | MISSING | critical | yes | yes | Add incident records and required Incident -> Fix -> Test -> Rule -> Memory workflow. | Batch 002 | yes |
| Invariant checker | DONE | high | no | no | Maintain read-only checker for runtime, approvals, locks, stop rules, artifact policy. | Batch 003 | done |
| Spec source chain | DONE | high | target must pass | no | Maintain checker for INDEX/spec/patch/ADR/workorder links and raw-source priority. | Batch 005 | done |
| Agent contract checker | DONE | high | no | partial | Maintain read-only checks for JSON-only, examples, selected_agent, Qwen policy, and approval operation scope. | Batch 004 | done |
| Skill contract checker | DONE | medium | no | no | Maintain SKILL frontmatter/body validation and registry drift warnings. | Batch 004 | done |
| Batch dossier | DONE | medium | no | no | Maintain `system/reports/batch-dossier.ts` and wire future promotion gates to it. | Batch 006 | done |
| Promotion governance | MISSING | medium | no | no | Branch review, merge, push readiness CLI. | Batch 007 | yes |
| Operator doctor | MISSING | medium | no | partial | Add read-only `--doctor`. | Batch 008 | after Batch 003 |
| Stop-rule lifecycle docs | PARTIAL | medium | no | partial | Document baselines, acknowledgement, memory records. | Batch 002/003 | yes |
| Runtime artifact policy checker | DONE | medium | no | no | Maintain git-tracked runtime/raw detector. | Batch 003 | done |
| Merge/product gate | PARTIAL | high | yes | no | Turn documented Product Work Gate into an enforced checklist. | Batch 007 | yes |

## Recent Incident Review

| Incident | Root cause | Fix commit | Regression test | Durable rule | Memory record | Recurrence risk | Missing follow-up |
|---|---|---|---|---|---|---|---|
| No-tool success not marking active_workorder done | Dispatcher/status lifecycle did not finalize no-tool completions. | `10c3ac6`, `4060f0d` | yes | partial | no | medium | Incident record and lifecycle invariant checker. |
| Scheduler mapping `blocked`/`awaiting_approval` to failed | Scheduler collapsed non-terminal outcomes. | `a9d1f24` | yes | partial | no | medium | Scheduler invariant in Batch 003. |
| Approval queue/token/runtime split-brain | Queue grant did not create/align dispatcher token/runtime view. | `f8c2844`, `8c86a12`, `15090ae` | yes | partial | no | high | Approval invariant checker and incident records. |
| Granted approval not redispatchable | Dispatcher could not reuse valid granted token. | `8c86a12` | yes | partial | no | medium | Approval lifecycle dossier. |
| Failed run stop-rule historical retrigger | Stop rule counted historical failures after acknowledgement. | baseline fix commits including `1f796f5` | yes | partial | no | medium | Baseline policy doc. |
| Invalid JSON spike historical retrigger | Metrics baseline handling insufficient. | `1f796f5` | yes | partial | no | medium | Invalid JSON learning records. |
| db-migration-agent conflicting output contract | Agent contract mixed dispatcher intent and review status formats. | `86ab65c`, later contract tests | yes | partial | no | high | Agent contract checker. |
| Qwen thinking/prose instead of JSON | API thinking mode and response format not constrained enough. | `13729ae` | yes | partial | no | high | Model routing checker. |
| Post-execution scope trailing slash mismatch | Directory scope normalization bug. | `ca39e58` | yes | partial | no | medium | Scope invariant checker. |
| Executable DOWN rollback SQL | Migration guard allowed destructive rollback blocks. | `9f8b847`, `6fe8322` | yes | yes in guard | no | medium | Incident record. |
| selected_agent mismatch causing wrong DB gates | Model-selected agent drifted from workorder agent. | `ba91cf2` | yes | partial | no | high | Agent contract checker. |
| Example migration path leak | Example path became real tool target. | `1ef079b` | yes | partial | no | high | Agent example checker. |
| Approval deny not syncing runtime | Queue deny did not update runtime approval mirror. | `15090ae` | yes | partial | no | high | Approval invariant checker. |
| Expired approval split-brain token state | Cleanup logic saw inconsistent queue/runtime/token state. | `85edb4d`, `a52ad2e`, `15090ae` | yes | partial | no | high | Runtime invariant checker. |
| Read-only spec access requiring migration approval | Human approval was applied to reads for db agent. | `e6eb876` | yes | partial | no | medium | Approval operation contract checker. |
| Operator DONE meaning blockers cleaned, not outputs complete | Operator did not distinguish clean runtime from complete outputs. | `c1c1a2e` plus follow-up tests and Batch 006 dossier output checks | yes | runbook plus dossier | no | low | Maintain dossier/output checks. |
| Missing spec source-chain enforcement | WO source priority not machine-checked. | none | no | no | no | high | Batch 005. |
| Raw BLS data source policy unclear | Raw files were untracked and docs linked local artifacts ambiguously. | `49366c9` | no | partial | no | medium | Product work gate and spec source-chain checker. |
