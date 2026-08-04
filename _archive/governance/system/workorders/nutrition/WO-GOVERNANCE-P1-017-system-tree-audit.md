# WO-GOVERNANCE-P1-017 - System Tree Audit

**Status:** ready_to_run  
**Phase:** 1 - Governance / system structure documentation audit  
**Source:** Current repository `system/` tree, imports, tests, docs, project profiles, and recent governed runs  
**Execution authority:** documentation-only governance work  
**Scope boundary:** audit/explanation only; no cleanup, moves, deletes, runtime behavior changes, or state edits

```yaml
workorder_id: "WO-governance-017"
agent_id: "docs-agent"
codex_worker: false
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Documentation-only rollback: revert this workorder's docs commit if Tom rejects the audit framing."
required_skills: []
optional_skills: []

task: |
  Create a factual audit of the system/ tree. Classify active core, active
  support, generated evidence, archive/reference, placeholder, stale, and
  unknown areas using only evidence from imports, scripts, tests, docs, project
  profiles, and recent governed runs.

  Required behavior:
  - Explain every top-level folder under system/.
  - Deeply explain system/memory, system/reports, system/workorders, and system/state.
  - Produce a human-readable audit, a machine-readable classification JSON, and
    a phased cleanup proposal.
  - Update the active handover and TODO register with pointers only.
  - Do not move, delete, clean up, or modify runtime behavior.
  - Do not manually edit runtime_state, approval queue, or state/audit logs.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
    - "docs/project/REPORT_RETENTION_POLICY.md"
    - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"
    - "docs/project/PROJECT_PROFILES.md"
  patches: []
  sql_sources: []
  reviews:
    - "docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md"
  adrs: []
  raw_sources: []
  raw_sources_allowed: false
  ssot_priority:
    - "module_index"
    - "current_specs"
    - "patches"
    - "sql_sources"
    - "reviews"
    - "adrs"
    - "raw_sources"

documentation_impact:
  required: true
  domains:
    - "governance"
    - "workflow"
    - "todo_state"
  ssot_files:
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
    - "system/project-profiles/profiles/lumeos.json"
    - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
    - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
    - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
  - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
  - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

scope_files:
  - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
  - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
  - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

files_allowed:
  - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
  - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
  - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

context_files:
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"
  - "docs/project/REPORT_RETENTION_POLICY.md"
  - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"
  - "system/project-profiles/profiles/lumeos.json"
  - "system/reports/report-retention-summarizer.ts"
  - "system/reports/governance-learning-check.ts"
  - "system/workorders/cli/run-batch-operator.ts"
  - "system/state/state-manager.ts"
  - "system/memory/canonical/lumeos_canonical.md"

files_blocked:
  - "system/state/**"
  - "system/approval/**"
  - "system/reports/codex-worker/**"
  - "system/reports/model-runtime-history/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Audit explains each top-level system/ folder."
  - "system/memory canonical and placeholder folders are clearly distinguished."
  - "system/reports generator scripts and generated outputs are clearly distinguished."
  - "system/workorders active batches, drafts, examples, templates, and archives are clearly distinguished."
  - "system/state tracked source and tool-managed runtime artifacts are clearly distinguished."
  - "Machine-readable classification JSON parses successfully."
  - "Cleanup proposal is phased and performs no cleanup."
  - "CURRENT_GOVERNANCE_HANDOVER.md points to the audit."
  - "OPEN_TODOS.md and GOVERNANCE_TODO_REGISTER.json keep GOV-TODO-045 aligned."
  - "SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No product work."
  - "No DB/Supabase/migration execution."
  - "No BLS import."
  - "No DEV/LIVE."
  - "No production routing change."
  - "No service restart."
  - "No file moves."
  - "No file deletes."
  - "No runtime behavior changes."
  - "No manual governed-runtime state edit."
  - "No manual governed queue edit."

validation_commands:
  - "cmd.exe /c node -e \"JSON.parse(require('fs').readFileSync('docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json','utf8')); console.log('classification json ok')\""
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-017-system-tree-audit.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-017-system-tree-audit.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-017-system-tree-audit.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
