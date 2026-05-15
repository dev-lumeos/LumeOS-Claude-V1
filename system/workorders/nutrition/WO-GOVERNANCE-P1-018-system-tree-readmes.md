# WO-GOVERNANCE-P1-018 - System Tree Phase 1 READMEs

**Status:** ready_to_run  
**Phase:** 1 - Governance / system structure navigation  
**Source:** `docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md` Phase 1  
**Execution authority:** documentation-only governance work  
**Scope boundary:** add README/index files only; no cleanup, moves, deletes, runtime behavior changes, or state edits

```yaml
workorder_id: "WO-governance-018"
agent_id: "docs-agent"
codex_worker: false
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "standard"
rollback_hint: "Documentation-only rollback: revert this workorder's docs commit if Tom rejects the README/index framing."
required_skills: []
optional_skills: []

task: |
  Run Phase 1 of the system tree cleanup proposal by adding small README/index
  files only. Explain active, generated, placeholder, historical, and
  tool-managed areas without moving, deleting, archiving, or changing runtime
  behavior.

  Required behavior:
  - Add README/index files for system/, system/memory/, system/reports/,
    system/state/, and system/workorders/.
  - Optionally add small Nutrition workorder subfolder READMEs if useful.
  - Update active handover and TODO SSOT to point to Phase 1 output.
  - Do not touch runtime_state, approval queue, audit logs, or generated state
    artifacts.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
    - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
    - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
    - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
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
    - "system/README.md"
    - "system/memory/README.md"
    - "system/reports/README.md"
    - "system/state/README.md"
    - "system/workorders/README.md"
    - "system/workorders/nutrition/README.md"
    - "system/workorders/nutrition/batches/README.md"
    - "system/workorders/nutrition/drafts/README.md"
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
    - "system/project-profiles/profiles/lumeos.json"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "system/README.md"
  - "system/memory/README.md"
  - "system/reports/README.md"
  - "system/state/README.md"
  - "system/workorders/README.md"
  - "system/workorders/nutrition/README.md"
  - "system/workorders/nutrition/batches/README.md"
  - "system/workorders/nutrition/drafts/README.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

scope_files:
  - "system/README.md"
  - "system/memory/README.md"
  - "system/reports/README.md"
  - "system/state/README.md"
  - "system/workorders/README.md"
  - "system/workorders/nutrition/README.md"
  - "system/workorders/nutrition/batches/README.md"
  - "system/workorders/nutrition/drafts/README.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

files_allowed:
  - "system/README.md"
  - "system/memory/README.md"
  - "system/reports/README.md"
  - "system/state/README.md"
  - "system/workorders/README.md"
  - "system/workorders/nutrition/README.md"
  - "system/workorders/nutrition/batches/README.md"
  - "system/workorders/nutrition/drafts/README.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

context_files:
  - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
  - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
  - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "docs/project/REPORT_RETENTION_POLICY.md"
  - "system/workorders/cli/run-batch-operator.ts"

files_blocked:
  - "system/state/runtime_state.json"
  - "system/state/*.jsonl"
  - "system/approval/queue.json"
  - "system/approval/approvals.json"
  - "system/reports/batches/**"
  - "system/reports/codex-worker/**"
  - "system/reports/model-runtime-history/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Every expected output listed in this workorder exists and is complete."
  - "Required Phase 1 README/index files exist."
  - "READMEs point to the audit and classification where appropriate."
  - "READMEs distinguish active, generated, placeholder, and historical areas."
  - "READMEs state that moves/deletes require later approved cleanup phases."
  - "system/state README warns against manual runtime state edits."
  - "system/workorders README states documentation_impact is mandatory."
  - "CURRENT_GOVERNANCE_HANDOVER.md points to Phase 1 READMEs."
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
  - "No archive moves."
  - "No runtime behavior changes."
  - "No manual runtime_state edit."
  - "No manual governed queue edit."

validation_commands:
  - "cmd.exe /c node -e \"JSON.parse(require('fs').readFileSync('docs/project/GOVERNANCE_TODO_REGISTER.json','utf8')); console.log('todo json ok')\""
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-018-system-tree-readmes.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-018-system-tree-readmes.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-018-system-tree-readmes.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```
