# Codex Worker Bridge

Date: 2026-05-09

## Purpose

The Codex Worker Bridge prepares `senior-coding-agent` workorders for non-interactive Codex CLI execution through `codex exec`.

It removes Tom's manual prompt-copy step without changing the governance gates. The bridge is dry-run by default, does not dispatch workorders by itself, and does not grant approvals.

## Commands

Dry-run a workorder prompt:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run
```

Execute a workorder through Codex CLI:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute
```

Dry-run an existing prompt file:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --prompt-file <prompt-file> --dry-run
```

Execute an existing prompt file:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --prompt-file <prompt-file> --execute
```

Resume a Codex session:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --execute --resume <session-id>
```

JSON output:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workers\codex-worker.ts --workorder <workorder-file> --dry-run --json
```

## Dry-run First

Default behavior is dry-run.

Dry-run:

- parses the workorder
- validates the path
- builds the Codex prompt
- previews the `codex exec` command shape
- does not call Codex
- does not write runtime reports

`--execute` is required before Codex is invoked.

## Artifacts

Generated prompt and execution reports are written under:

```text
system/reports/codex-worker/
```

The bridge writes artifacts only when:

- `--execute` is used
- `--write-prompt` is used

These reports are runtime artifacts and should not be committed by default.

## Safety Boundaries

Every generated prompt includes:

- repository path
- workorder id
- objective
- `scope_files`
- `files_blocked`
- `expected_outputs`
- acceptance criteria
- `source_refs`
- risk category
- forbidden commands
- validation commands
- final report format
- STOP conditions

The bridge tells Codex:

- no approval grants
- no Supabase `db push`
- no Supabase `db reset`
- no migration execution unless explicitly allowed and Tom-approved
- no production DB work
- no manual `runtime_state.json` edits
- no manual `queue.json` edits
- no product work outside scope
- no raw BLS file commits
- obey `scope_files`, `files_allowed`, and `files_blocked`
- stop at `DONE`, `NEEDS_TOM_APPROVAL`, `FIX_REQUIRED`, or `STOP`

## Difference From Interactive Codex

Interactive Codex is Tom-driven.

The worker bridge is governance-driven:

- it constructs a constrained prompt from a workorder
- it runs `codex exec` non-interactively only when explicitly requested
- it captures stdout, stderr, exit code, duration, prompt path, and report path
- it parses the final state when possible

## Senior Coding Agent Integration

`senior-coding-agent` remains represented as:

- runtime: Codex CLI
- model: GPT-5.5
- healthcheck: config/manual

Current integration is intentionally conservative:

- `system/workers/codex-worker.config.json` exists
- `codex_worker_enabled` is `false` by default
- dispatcher/operator auto-dispatch is deferred

Future integration may allow the Governance Operator to call the bridge for `senior-coding-agent` workorders after Tom explicitly enables it.

## Forbidden Commands

The worker must not be used to run:

- `supabase db reset`
- `supabase db push`
- `supabase db push --linked`
- `supabase migration up`
- production DB commands
- migration execution without explicit Tom approval
- approval grants
- manual runtime-state edits
- manual approval-queue edits
- product batches outside the current gate

## Future Dispatcher Integration

The safe future path is:

1. Operator selects `senior-coding-agent`.
2. Operator verifies source-chain, invariant, agent-contract, learning, model-runtime, and product-gate checks.
3. Operator asks for explicit Tom enablement of Codex worker dispatch.
4. Dispatcher invokes `codex-worker.ts --workorder <file> --execute`.
5. Dossier records prompt path, report path, stdout, stderr, exit code, duration, and final state.

Until that integration is built, use the worker manually through dry-run and explicit execute commands.
