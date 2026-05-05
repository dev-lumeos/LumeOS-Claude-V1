# Governance Workorder Factory Automation Summary

Date: 2026-05-05

## Purpose

Add the deterministic bridge from approved structured plans to valid workorders and batch files, without duplicating the existing prompt-based decomposition skills.

## Existing Capability Audit Result

- Prompt-only decomposition and WO generation already existed.
- Templates and schema already existed.
- Batch loading, schema validation, dependency sorting, operator execution, and source-chain checking already existed.
- The missing layer was an executable, read-only-by-default factory that writes only with explicit `--write`.

## Files Added

- `system/workorders/cli/wo-factory.ts`
- `system/workorders/cli/__tests__/wo-factory.test.ts`
- `docs/project/WORKORDER_FACTORY_AUTOMATION.md`

## Rules Implemented

- Structured JSON plan input inside Markdown.
- Source_refs required at plan or workorder level.
- Expected outputs must be covered by scope/files_allowed.
- High-risk workorders require files_blocked.
- db-migration workorders require rollback_hint.
- Mixed-risk workorders are rejected.
- Runtime artifacts, raw BLS files, and env files are rejected as expected outputs.
- Placeholder/example path leaks are rejected.
- Dry-run writes nothing; `--write` is explicit.

## Product Work Gate

Product work remains blocked unless Tom explicitly opens it after reviewing this system layer. Future product workorders must still pass source-chain, invariant, and agent-contract checks before operator execution.

## Next System Work

- Memory/Learning Automation.
- Optional deeper decomposition-spec validator if free-form spec-to-plan automation is later required.
