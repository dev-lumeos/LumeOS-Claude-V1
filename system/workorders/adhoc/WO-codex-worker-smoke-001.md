# WO-codex-worker-smoke-001 - Codex Worker Bridge Docs Smoke Test

```yaml
workorder_id: "WO-codex-worker-smoke-001"
agent_id: "senior-coding-agent"
phase: 1
priority: "low"
quality_critical: false
requires_approval: false
risk_category: "docs"

task: |
  Create a concise Markdown smoke-test note for the Codex Worker Bridge.

  Requirements:
  - Write only docs/project/codex-worker-smoke-test.md.
  - State that this is a governance/docs-only smoke test.
  - State that no product work, Supabase command, migration execution, approval grant, runtime state edit, queue edit, or raw BLS commit was performed.
  - Include the dry-run and execute commands used by the worker bridge in generic form.
  - Keep the file short and factual.

scope_files:
  - "docs/project/codex-worker-smoke-test.md"

files_blocked:
  - "supabase/**"
  - "apps/**"
  - "services/**"
  - "packages/**"
  - "system/state/**"
  - "system/approval/**"
  - "docs/specs/Nutrition/00_raw/**"
  - ".env"
  - ".env.*"
  - "system/workers/codex-worker.config.json"

expected_outputs:
  - "docs/project/codex-worker-smoke-test.md"

acceptance_criteria:
  - "docs/project/codex-worker-smoke-test.md exists."
  - "The note is governance/docs-only."
  - "The note states forbidden actions were not performed."
  - "No files outside scope_files are changed."

negative_constraints:
  - "Do not start product work."
  - "Do not run BLS import."
  - "Do not run Supabase db push."
  - "Do not run Supabase db reset."
  - "Do not execute migrations."
  - "Do not grant approvals."
  - "Do not edit runtime_state.json."
  - "Do not edit queue.json."
  - "Do not enable dispatcher auto-integration."
  - "Do not set codex_worker_enabled=true."
  - "Do not commit raw BLS files."

source_refs:
  - "docs/project/CODEX_WORKER_BRIDGE.md"
  - "docs/project/MODEL_RUNTIME_HARDENING.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"

validation_commands:
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
```
