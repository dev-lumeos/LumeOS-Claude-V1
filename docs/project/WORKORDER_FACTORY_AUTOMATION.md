# Workorder Factory Automation

## Purpose

The Workorder Factory is the deterministic bridge from an approved structured plan to scoped, source-linked workorders and a batch file. It does not execute workorders, dispatch agents, grant approvals, run Supabase commands, or make product changes.

This layer exists to reduce manual prompt stitching while preserving governance gates.

## Existing Capability Audit

| Component | Current role | Executable | Tested | Classification | Decision / goal |
|---|---|---:|---:|---|---|
| `system/prompts/wo-factory/wo_factory_prompt.md` | Copyable prompt for turning a checked split plan into draft workorders. | no | no | KEEP_AS_PROMPT | Keep as LLM/human guidance; do not treat as deterministic execution. |
| `system/prompts/wo-factory/wo_decomposition_prompt.md` | Copyable prompt for decomposing a plan/spec into WO candidates. | no | no | KEEP_AS_PROMPT | Keep for creative decomposition; deterministic factory consumes structured plans after review. |
| `system/workorders/templates/` | Workorder authoring templates by risk/type. | no | no | REUSE | Reuse layout/risk conventions; do not duplicate template policy. |
| `system/workorders/schemas/workorder.schema.json` | Workorder schema and db-migration rollback requirement. | indirectly | yes | REUSE | Factory validates generated workorders against this schema. |
| `system/workorders/schemas/wo_factory_spec_v1.md` | Factory design/spec, including deterministic pipeline and rule engine. | no | no | EXTEND | Implement the missing executable Stage 1/3/4/5 subset without LLM calls. |
| `system/workorders/cli/batch-loader.ts` | Batch/workorder parser, schema validator, dependency sorter, dispatcher bridge. | yes | yes | REUSE | Factory imports schema validation and emits compatible batch Markdown. |
| `system/workorders/cli/run-batch.ts` | Low-level dry-run/run batch CLI. | yes | yes | REUSE | Factory prints validation/operator commands but does not dispatch. |
| `system/workorders/cli/run-batch-operator.ts` | Safe operator lifecycle CLI. | yes | yes | REUSE | Generated batches are intended to be checked by operator dry-run/doctor before execution. |
| `system/workorders/cli/spec-source-chain-check.ts` | Read-only source-chain checker. | yes | yes | REUSE | Factory enforces source_refs and generated output must pass this checker. |
| `system/workorders/cli/__tests__/` | Governance CLI regression tests. | yes | yes | REUSE | Add factory tests here using existing node:test style. |
| `.agents/skills/spec-to-decomposition/` | Skill prompt for feature spec to decomposition spec. | no | no | KEEP_AS_PROMPT | Keep as upstream Brain workflow; factory does not duplicate decomposition creativity. |
| `.agents/skills/decomposition-to-workorders/` | Skill prompt for decomposition spec to WO batch. | no | no | KEEP_AS_PROMPT | Keep as LLM assistant path; deterministic CLI validates and writes only structured plan output. |
| `.agents/skills/wo-writer/` | Brain-layer WO generation skill chain. | no | no | KEEP_AS_PROMPT | Keep for interactive planning; deterministic CLI is the governed write bridge. |
| `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md` | Source_refs, SSOT priority, raw source, scope/output standard. | no | no | REUSE | Factory requires plan/workorders to follow this standard. |
| `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md` | Governance roadmap and gap register. | no | no | REUSE | Update to record factory automation as implemented. |
| Nutrition draft/batch examples | Real examples of current WO/batch Markdown. | no | yes via surrounding tests | REUSE | Use as format precedent; do not rewrite historical WOs in this batch. |

## Decision

The smallest missing executable layer was a deterministic structured-plan to workorder/batch CLI. Existing prompt skills already cover creative decomposition, and existing schema/checkers cover downstream validation. A new CLI was added only for the missing bridge:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --dry-run
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --from-plan <plan-file> --out <output-dir> --write
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\wo-factory.ts --validate <workorder-or-batch>
```

## Plan Format

The CLI expects a Markdown file with a JSON code block. JSON is used intentionally so the factory can parse deterministically without adding YAML parser dependencies or relying on model interpretation.

Required top-level fields:

- `module`
- `batch_id`
- `batch_title`
- `source_refs`
- `workorders`

Each workorder must include:

- `id`
- `title`
- `agent_id`
- `risk_category`
- `task`
- `expected_outputs`
- `scope_files`
- `acceptance_criteria`
- `negative_constraints`

Recommended workorder fields:

- `files_allowed`
- `files_blocked`
- `context_files`
- `validation_commands`
- `blocked_by`
- `requires_approval`
- `rollback_hint`

## Safety Rules

- Default mode is read-only dry-run.
- `--write` is required to create workorder and batch files.
- No dispatch is performed.
- No approvals are granted.
- No Supabase commands are run.
- No migrations are executed.
- Raw BLS files and runtime artifacts are rejected as expected outputs.
- High-risk workorders require `files_blocked`.
- `db-migration` workorders require `rollback_hint`.
- Mixed-risk workorders are rejected; split them before writing.
- Placeholder/example paths such as `example.sql` are rejected.

## Output

With `--write`, the factory writes:

- `<out>/drafts/<workorder-id>-<slug>.md`
- `<out>/batches/<batch-id>.md`

The batch file uses the existing `## Included Workorders` table format so `batch-loader`, `run-batch`, `run-batch-operator`, `batch-dossier`, and promotion governance can reuse it.

## Required Validation After Generation

Run:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <batch-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\governance-invariant-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\control-plane\agent-contract-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\run-batch-operator.ts <batch-file> --dry-run
```

## Out Of Scope

- Generating decomposition from free-form specs.
- Making architecture decisions.
- Running product batches.
- Executing migrations.
- Importing BLS data.
- Replacing prompt skills.
