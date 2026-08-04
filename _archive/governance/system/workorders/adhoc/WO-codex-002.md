# WO-codex-002 - Codex Senior Review Smoke Test

```yaml
workorder_id: "WO-codex-002"
agent_id: "senior-coding-agent"
phase: 1
priority: "low"
quality_critical: false
requires_approval: false
risk_category: "docs"
codex_worker: true

task: |
  Review the previous Codex dispatcher smoke output and create one concise Markdown senior-review note.

  Review input:
  - docs/project/codex-dispatcher-smoke-test.md

  Write only:
  - docs/project/codex-senior-review-smoke-test.md

  The review must answer:
  1. Was the dispatcher-to-Codex-worker path proven?
  2. Were safety boundaries preserved?
  3. Is broad automation still blocked?
  4. Is the path acceptable for governance workorders?
  5. What remains before product work?

  Keep the review factual and short. Do not perform product work.

scope_files:
  - "docs/project/codex-senior-review-smoke-test.md"

context_files:
  - "docs/project/codex-dispatcher-smoke-test.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "supabase/**"
  - "apps/**"
  - "services/**"
  - "packages/**"
  - ".env"
  - ".env.*"
  - "docs/specs/Nutrition/00_raw/**"
  - "system/workers/codex-worker.config.json"

expected_outputs:
  - "docs/project/codex-senior-review-smoke-test.md"

acceptance_files:
  - "docs/project/codex-senior-review-smoke-test.md"

acceptance_criteria:
  - "The expected output exists."
  - "The review states whether the dispatcher-to-Codex-worker path was proven."
  - "The review states whether safety boundaries were preserved."
  - "The review states broad automation remains blocked."
  - "The review states whether the path is acceptable for governance workorders."
  - "The review states what remains before product work."
  - "No files outside scope_files are changed."

negative_constraints:
  - "Do not start product work."
  - "Do not run product batches."
  - "Do not run BLS import."
  - "Do not run Supabase db push."
  - "Do not run Supabase db reset."
  - "Do not execute migrations."
  - "Do not grant approvals."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not commit raw BLS files."
  - "Do not commit system/reports/codex-worker runtime artifacts."

source_refs:
  - "docs/project/CODEX_WORKER_BRIDGE.md"
  - "docs/project/CODEX_DISPATCHER_SMOKE_PLAN.md"
  - "docs/project/MODEL_RUNTIME_HARDENING.md"
  - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/codex-dispatcher-smoke-test.md"

validation_commands:
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
```
