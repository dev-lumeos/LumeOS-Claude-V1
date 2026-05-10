# WO-codex-dispatcher-smoke-001 - Codex Dispatcher Docs Smoke Test

```yaml
workorder_id: "WO-codex-dispatcher-smoke-001"
agent_id: "senior-coding-agent"
phase: 1
priority: "low"
quality_critical: false
requires_approval: false
risk_category: "docs"
codex_worker: true

task: |
  Create a concise Markdown note proving the Codex Worker dispatcher smoke path can update one docs-only file.

  Requirements:
  - Write only docs/project/codex-dispatcher-smoke-test.md.
  - State that this is a governance/docs-only dispatcher smoke.
  - State that no product work, Supabase command, migration execution, approval grant, runtime state edit, queue edit, or raw BLS commit was performed.
  - State that dispatcher Codex Worker integration was temporarily enabled only for this smoke and must be disabled afterward.
  - Keep the file short and factual.

scope_files:
  - "docs/project/codex-dispatcher-smoke-test.md"

files_blocked:
  - "supabase/**"
  - "apps/**"
  - "services/**"
  - "packages/**"
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/**/00_raw/**"
  - ".env"
  - ".env.*"
  - "system/workers/codex-worker.config.json"

expected_outputs:
  - "docs/project/codex-dispatcher-smoke-test.md"

acceptance_files:
  - "docs/project/codex-dispatcher-smoke-test.md"

acceptance_criteria:
  - "All expected_outputs exist, including docs/project/codex-dispatcher-smoke-test.md."
  - "The note is governance/docs-only."
  - "The note states forbidden actions were not performed."
  - "No files outside scope_files are changed."
  - "Codex Worker dispatcher config is disabled after the smoke."

negative_constraints:
  - "Do not start application feature work."
  - "Do not run product batches."
  - "Do not run bulk data import."
  - "Do not run Supabase db push."
  - "Do not run Supabase db reset."
  - "Do not execute migrations."
  - "Do not grant approvals."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not commit raw BLS files."
  - "Do not commit system/reports/codex-worker runtime artifacts."

source_refs:
  - "docs/project/CODEX_DISPATCHER_SMOKE_PLAN.md"
  - "docs/project/CODEX_WORKER_BRIDGE.md"
  - "docs/project/MODEL_RUNTIME_HARDENING.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

validation_commands:
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
```
