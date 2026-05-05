# LumeOS Canonical Memory

> CURRENT TRUTH - Stand: 2026-05-05
> This file contains compact current truths only.
> Historical design material in `docs/BrainstormDocs/` is archive material, not current truth.

---

## System

Architecture: Brain / Law / Muscle.

- Brain: Claude Code and Codex for planning, specs, workorders, review, and governance maintenance.
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

## Current Product Work Gate

BLS import and Nutrition P1-005 product work are blocked until Governance Batch 005 is complete or Tom explicitly waives it.

Raw BLS files are local-only and ignored.

Do not run:

- `supabase db push`
- `supabase db reset`
- production DB commands
- migration execution from worker/operator flow

## Memory And Learning Policy

- Chat history is not durable memory.
- Every governance incident must become: Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update.
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

## Open Governance Work

- Governance Batch 003 - Invariant Checker is implemented.
- Governance Batch 004 - Agent & Skill Contract Validation is implemented.
- Governance Batch 005 - Spec Source Chain / Workorder Factory.
- Governance Batch 006 - Reporting & Dossier Hardening.
- Governance Batch 007 - Promotion / Merge Governance.
- Governance Batch 008 - Operator Doctor / Autonomy Hardening.
- Spark Runtime Hardening.
