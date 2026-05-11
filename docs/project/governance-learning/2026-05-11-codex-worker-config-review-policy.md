# Codex Worker Config And Review Policy

Date: 2026-05-11

## Summary

Codex Worker configuration now uses a machine-readable status enum:

- `disabled`
- `manual_only`
- `controlled_enabled`

The productive configuration is `controlled_enabled`. Broad automation remains forbidden.

## Policy

Allowed controlled agents:

- `senior-coding-agent`
- `senior-reviewer-agent`

Both require:

- `codex_worker: true`
- `runtime_type: codex-cli`
- complete `source_refs`, `scope_files`, `files_blocked`, and `expected_outputs`
- narrow scope files
- product gate pass
- no approval grants
- no DB/Supabase/migration work
- no runtime-state or queue edits

`senior-reviewer-agent` is review-oriented and may only write scoped docs/governance outputs when the workorder explicitly allows them.

## Product Gate

Product work remains closed unless Tom explicitly opens it.
