# WO-GOVERNANCE-P1-019 - AI-Governance-Core Phase 0 Verification

**Status:** ready_to_run  
**Phase:** 0 - Governance / AI-Governance-Core extraction planning  
**Source:** `docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md` Phase 0  
**Execution authority:** documentation-only governance architecture planning  
**Scope boundary:** read-only verification plus planning docs and SSOT pointers only; no extraction, copies, moves, deletes, runtime behavior changes, product code changes, or state edits
**Routing note:** docs-only planning task. Use the existing `docs-agent` worker route. This is not a security-specialist workorder.

## YAML Contract

```yaml
workorder_id: "WO-governance-019"
agent_id: "docs-agent"
codex_worker: false
product_work: false
phase: 1
priority: "normal"
quality_critical: true
requires_approval: false
risk_category: "docs"
rollback_hint: "Documentation-only rollback: revert the Phase-0 docs/SSOT commit if Tom rejects the copy-manifest framing."
required_skills: []
optional_skills: []

task: |
  Run Phase 0 of the AI-Governance-Core extraction plan. Record the source
  repository state, resolve or narrow known UNKLAR classification items by
  read-only inspection, add the file-backed-by-default storage rule, and
  produce a Phase-1 copy manifest for Tom review.

  Do not perform extraction. Do not create or populate D:\GitHub\AI-Governance-Core.
  Do not copy, move, delete, or archive files. Do not change product code,
  runtime behavior, DB state, runtime state, approval queue state, or generated
  reports.

  Routing constraint:
  - This is a docs-only governance planning task.
  - The existing docs-agent worker route is appropriate.
  - Do not route to security-specialist.
  - Required gates should be documentation/review/files-scope/typecheck/checks,
    not a security-gate.

source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_01_MODULE_CONTRACT.md"
    - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
    - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
    - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_EXTRACTION_BLUEPRINT.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_TARGET_STRUCTURE.md"
    - "docs/project/governance-core-extraction/LUMEOS_PROJECT_REATTACH_PLAN.md"
    - "docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md"
    - "docs/project/governance-core-extraction/FRONTDOOR_AND_PROJECT_SEPARATION_NOTES.md"
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
    - "system/project-profiles/profiles/lumeos.json"
  patches: []
  sql_sources: []
  reviews: []
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
    - "docs/project/governance-core-extraction/PHASE_0_SOURCE_VERIFICATION_REPORT.md"
    - "docs/project/governance-core-extraction/PHASE_1_COPY_MANIFEST.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_EXTRACTION_BLUEPRINT.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md"
    - "docs/project/governance-core-extraction/GOVERNANCE_CORE_TARGET_STRUCTURE.md"
    - "docs/project/governance-core-extraction/LUMEOS_PROJECT_REATTACH_PLAN.md"
    - "docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md"
    - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
    - "docs/project/OPEN_TODOS.md"
    - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  documentation_agent_required: true
  na_reason: null

expected_outputs:
  - "docs/project/governance-core-extraction/PHASE_0_SOURCE_VERIFICATION_REPORT.md"
  - "docs/project/governance-core-extraction/PHASE_1_COPY_MANIFEST.md"
  - "docs/project/governance-core-extraction/GOVERNANCE_CORE_EXTRACTION_BLUEPRINT.md"
  - "docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md"
  - "docs/project/governance-core-extraction/GOVERNANCE_CORE_TARGET_STRUCTURE.md"
  - "docs/project/governance-core-extraction/LUMEOS_PROJECT_REATTACH_PLAN.md"
  - "docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/project-profiles/profiles/lumeos.json"

scope_files:
  - "docs/project/governance-core-extraction/**"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/workorders/nutrition/WO-GOVERNANCE-P1-019-governance-core-phase-0.md"
  - "system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-019-governance-core-phase-0.md"
  - "system/project-profiles/profiles/lumeos.json"

files_allowed:
  - "docs/project/governance-core-extraction/**"
  - "docs/project/CURRENT_GOVERNANCE_HANDOVER.md"
  - "docs/project/OPEN_TODOS.md"
  - "docs/project/GOVERNANCE_TODO_REGISTER.json"
  - "system/workorders/nutrition/WO-GOVERNANCE-P1-019-governance-core-phase-0.md"
  - "system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-019-governance-core-phase-0.md"
  - "system/project-profiles/profiles/lumeos.json"

context_files:
  - "docs/project/system-structure/SYSTEM_TREE_AUDIT.md"
  - "docs/project/system-structure/SYSTEM_DIRECTORY_CLASSIFICATION.json"
  - "docs/project/system-structure/SYSTEM_CLEANUP_PROPOSAL.md"
  - "docs/project/governance-core-extraction/GOVERNANCE_CORE_MIGRATION_MAP.md"
  - "docs/project/governance-core-extraction/EXTRACTION_PHASE_PLAN.md"
  - "package.json"
  - "pnpm-workspace.yaml"
  - "tsconfig.json"
  - "services/governance-compiler/package.json"
  - "services/orchestrator-api/package.json"
  - "services/wo-classifier/package.json"
  - "packages/graph-core/package.json"
  - "packages/shared/package.json"

files_blocked:
  - "D:/GitHub/AI-Governance-Core/**"
  - "apps/**"
  - "services/**"
  - "packages/**"
  - "supabase/**"
  - "docs/specs/Nutrition/00_raw/**"
  - "system/state/runtime_state.json"
  - "system/state/*.jsonl"
  - "system/approval/queue.json"
  - "system/approval/approvals.json"
  - "system/reports/batches/**"
  - "system/reports/codex-worker/**"
  - "system/reports/dossiers/**"
  - "system/reports/model-runtime-history/**"
  - ".env"
  - ".env.*"

acceptance_criteria:
  - "Phase-0 source branch, commit hash, and worktree state are recorded."
  - "COPY/STAY/TEMPLATE/GENERATED/ARCHIVE/PLACEHOLDER/UNKNOWN classifications are verified or narrowed using read-only evidence."
  - "Known UNKLAR items are resolved where evidence supports it or retained with exact verification commands."
  - "PHASE_0_SOURCE_VERIFICATION_REPORT.md exists and is factual."
  - "PHASE_1_COPY_MANIFEST.md exists and includes all required copy/stay/template/generated/unknown tables."
  - "Every expected output listed in this workorder exists and is complete."
  - "File-backed default storage rule is explicit."
  - "Supabase/Postgres is documented as an optional future adapter only."
  - "No extraction or copy into D:\\GitHub\\AI-Governance-Core occurs."
  - "CURRENT_GOVERNANCE_HANDOVER.md and TODO SSOT point to the Phase-0 manifest."
  - "SSOT_SYNC_CHECK passes."

negative_constraints:
  - "No extraction execution."
  - "No copying into D:\\GitHub\\AI-Governance-Core."
  - "No file moves."
  - "No file deletes."
  - "No product code changes."
  - "No DB/Supabase/migration execution."
  - "No BLS import."
  - "No DEV/LIVE."
  - "No production routing changes."
  - "No MiniMax routing."
  - "No service restart."
  - "No runtime_state edit."
  - "No queue edit."
  - "No generated report cleanup."
  - "No archive moves."

validation_commands:
  - "cmd.exe /c node -e \"JSON.parse(require('fs').readFileSync('docs/project/GOVERNANCE_TODO_REGISTER.json','utf8')); console.log('todo json ok')\""
  - "cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\governance-invariant-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\agent-contract-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\reports\\governance-learning-check.ts --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\control-plane\\ssot-sync-check.ts --json"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\spec-source-chain-check.ts --batch system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-019-governance-core-phase-0.md --json --project lumeos"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-019-governance-core-phase-0.md --dry-run --project lumeos --orchestration-mode spark1_orchestrated"
  - "cmd.exe /c node node_modules\\tsx\\dist\\cli.mjs system\\workorders\\cli\\run-batch-operator.ts system/workorders/nutrition/batches/BATCH-GOVERNANCE-P1-019-governance-core-phase-0.md --doctor --json --project lumeos --orchestration-mode spark1_orchestrated"
```

## Notes

This workorder exists to make the Phase-0 planning work auditable through the
governed lifecycle. It does not authorize extraction, copying, cleanup, runtime
changes, product changes, DB work, or queue/state edits.
