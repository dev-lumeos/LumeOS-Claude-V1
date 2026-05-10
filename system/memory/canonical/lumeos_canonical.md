# LumeOS Canonical Memory

> CURRENT TRUTH - Stand: 2026-05-05
> This file contains compact current truths only.
> Historical design material in `docs/BrainstormDocs/` is archive material, not current truth.

---

## System

Architecture: Brain / Law / Muscle.

- Brain: Codex/GPT-5.5 for senior repo-aware engineering and review; Claude/Codex-compatible brain agents for planning, specs, workorders, and governance maintenance.
- Law: deterministic governance system: scheduler, preflight, operator, approval gate, stop rules, reports.
- Muscle: Spark/vLLM execution agents.

Repo: `https://github.com/dev-lumeos/LumeOS-Claude-V1`

Stack: pnpm / Turborepo / Hono / Supabase / vLLM / TypeScript.

---

## Current Governance Truth

The deterministic governance/execution system is functional and has run real governance and Nutrition batches. It is not complete.

Current gap-analysis truth:

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`

Current handover:

- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`

Governance learning records:

- `docs/project/governance-learning/`

## Implemented And Preferred

- Governance Batch Operator is the preferred way to run workorder batches.
- Operator modes: `--status`, `--dry-run`, `--continue`, `--continue --apply-safe-cleanups`.
- Approval queue, dispatcher enforcement tokens, and runtime approval mirrors exist and must stay synchronized.
- Stop rules exist and must use baselines for historical failed-run and invalid-json incidents.
- Migration writes must pass static guard and human approval where required.
- Operator `DONE` means no active batch workorders remain and expected outputs exist.
- Read-only invariant checker exists at `system/control-plane/governance-invariant-check.ts`.
- Read-only Agent & Skill Contract Checker exists at `system/control-plane/agent-contract-check.ts`.
- Read-only Spec Source Chain Checker exists at `system/workorders/cli/spec-source-chain-check.ts`.
- Workorder source-chain rules live in `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md`.
- Read-only Batch Dossier Reporter exists at `system/reports/batch-dossier.ts` and writes reports only with explicit `--write`.
- Promotion / Merge Governance CLI exists at `system/control-plane/promotion-governance.ts`.
- Operator Doctor mode exists at `system/workorders/cli/run-batch-operator.ts <batch-file> --doctor`.
- Workorder Factory Automation exists at `system/workorders/cli/wo-factory.ts`.
- The factory accepts a structured JSON plan inside Markdown, dry-runs by default, and writes draft workorders/batches only with `--write`.
- Governance Learning Checker exists at `system/reports/governance-learning-check.ts`.
- Current learning status can be written explicitly to `docs/project/governance-learning/CURRENT_LEARNING_STATUS.md`.
- Model Runtime Checker exists at `system/control-plane/model-runtime-check.ts`.
- Dispatcher model calls have bounded timeout and one retry for model-runtime failures.
- `senior-coding-agent` uses Codex CLI / GPT-5.5 as the productive senior engineering runtime. It is config/manual checked, not HTTP endpoint checked.
- Codex Worker Bridge exists at `system/workers/codex-worker.ts` for dry-run-first non-interactive `codex exec` prompt construction.
- Codex Worker dispatcher integration is controlled-enabled for `senior-coding-agent` only. It requires `codex_worker: true`, complete source/scope/output metadata, no pending approval requirement, hard timeout, and product-gate policy pass.
- MealCam/Vision runtime is optional/on-demand and may be offline during normal governance work.
- Governance UI V1 exists under `apps/web/src/app/governance` as a local operator console backed by allowlisted CLI execution.

## Current Product Work Gate

Product work is not freely open.

Tom has conditionally opened the product gate only for the next controlled planning/probe batch.

Allowed: planning-only product work, BLS import planning/preflight, local read-only raw file inspection, report/spec-linked workorder generation, static validation, governance checker runs, and operator dry-run/continue only when no DB execution, migration execution, or real bulk import occurs.

Forbidden: Supabase `db push`, Supabase `db reset`, production DB changes, migration execution, real BLS bulk import execution, committing raw BLS files, invented BLS/nutrient values, checker/operator bypass, approval auto-grants, autonomous/night/large product runs.

Any target workorder or batch must still pass source-chain, invariant, agent-contract, learning, operator, and promotion governance checks.

Raw BLS files are local-only and ignored.

Static Spark Runtime Hardening is implemented. Endpoint health must still be proven before autonomous, night, or large product runs.

Do not run:

- `supabase db push`
- `supabase db reset`
- production DB commands
- migration execution from worker/operator flow

## Memory And Learning Policy

- Chat history is not durable memory.
- Every governance incident must become: Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update.
- Governance learning records must pass `system/reports/governance-learning-check.ts` before product work opens.
- Detailed incidents belong in `docs/project/governance-learning/`.
- Compact current truths belong in this canonical memory file.
- Session continuity belongs in `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`.

## Agent Routing

Source of truth:

- `system/agent-registry/agents.json`
- `system/agent-registry/model_routing.json`
- `AGENTS.md`

Qwen3.6 rule:

```json
{
  "chat_template_kwargs": { "enable_thinking": false },
  "temperature": 0.0
}
```

Prompt text such as `/no_think` is not sufficient.

## Important Invariants

- completed run must not leave active_workorder stuck in dispatched/running/awaiting_approval.
- blocked/awaiting_approval must not collapse to failed in scheduler state.
- approval queue, runtime approval item, and enforcement token must stay synchronized.
- denied approval must sync runtime state.
- selected_agent must not drift from workorder agent.
- example/template paths must never become real tool targets.
- read-only context access must not require db-migration approval.
- executable rollback/DOWN SQL must be blocked.
- runtime artifacts must not be committed.
- runtime-facing agent contracts must remain JSON-only and must not leak example paths into real tool targets.
- SKILL.md files must keep parser-safe frontmatter.
- Workorders must resolve module INDEX -> current specs -> patches -> SQL sources -> ADRs -> reviews -> raw/provenance sources.
- Raw BLS files must not override current specs as implementation SSOT.
- Factory-generated workorders must include `source_refs`, `expected_outputs`, scoped writes, high-risk `files_blocked`, and db-migration `rollback_hint`.
- Model runtime checks must pass before autonomous operator work; endpoint health checks must be short read-only `/v1/models` checks, not real workorder prompts.
- Codex CLI runtimes must not be treated as vLLM HTTP endpoints.
- Codex worker execution must remain explicit, dry-run first, and scoped by workorder `scope_files`, `files_blocked`, source refs, and forbidden commands.
- Automatic Codex worker dispatch requires Tom-opened config gates and workorder `codex_worker: true`; arbitrary agents must not route to Codex.
- Optional runtimes only block when the target batch/workorder explicitly requires them.
- Governance UI commands must stay routed through the allowlist and must not expose Supabase reset/push, migration execution, runtime state edits, queue edits, or approval auto-grants.

## Open Governance Work

- Governance Batch 003 - Invariant Checker is implemented.
- Governance Batch 004 - Agent & Skill Contract Validation is implemented.
- Governance Batch 005 - Spec Source Chain / Workorder Factory is implemented as a checker and standard; target product work must pass it.
- Governance Batch 006 - Reporting & Dossier Hardening is implemented as a batch dossier reporter.
- Governance Batch 007 - Promotion / Merge Governance is implemented as a deterministic review/merge/push CLI.
- Governance Batch 008 - Operator Doctor / Autonomy Hardening is implemented as read-only diagnosis with exactly one next action.
- Workorder Factory / Decomposition Automation is implemented for structured plans; free-form decomposition remains a prompt/manual Brain step.
- Memory/Learning Automation is implemented as a read-only checker plus explicit status writer.
- Spark Runtime Hardening is implemented as a read-only checker; deeper runtime observability remains optional.
- Codex Worker Bridge is implemented as a manual/controlled bridge; dispatcher integration is controlled-enabled for the senior-coding-agent path only.
- Governance UI V1 is implemented as local operator console V1; richer graphing and saved dossier views remain optional refinements.
