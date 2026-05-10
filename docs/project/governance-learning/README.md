# Governance Learning Log

This directory is the durable learning layer for LumeOS governance incidents.

Chat history is not a memory system. A fix is not complete until the lesson can be recovered by a future Codex, Claude, or operator run without reading the original chat.

## Required Workflow

Every governance incident must follow:

`Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update`

## What Belongs Here

- Incident learning records.
- Incident-to-regression mapping.
- Repeated failure pattern summaries.
- "Do not repeat" rules that are not yet mature enough for `CLAUDE.md`, `AGENTS.md`, or agent contracts.
- Batch-level learning summaries.

## What Does Not Belong Here

- Runtime state.
- Approval queue state.
- Raw logs copied wholesale from `system/state`.
- Product feature specs.
- Raw BLS data.

## Required After Every Governance Batch

1. Add or update incident records for every bug class touched.
2. Link each incident to a fix commit and regression test.
3. Update `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`.
4. Update canonical memory only for compact current truths.
5. If no incident occurred, record that no learning update was needed in the batch final report.

## Automation

Run the learning checker before opening product work or closing a governance batch:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-check.ts --write-summary
```

Default mode is read-only. `--write-summary` may create or update:

```text
docs/project/governance-learning/CURRENT_LEARNING_STATUS.md
```

The checker validates required memory files, incident schema fields, fix commit references, regression test paths, durable rules, recurrence detectors, canonical memory product-gate wording, and open incidents.

Run the learning suggestion tool when operator, dossier, audit, runtime, or Codex Worker output may contain a new incident candidate:

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --from-dossier <dossier-json-or-md>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --write-drafts
```

Default mode is read-only. `--write-drafts` may create draft review candidates only under:

```text
docs/project/governance-learning/drafts/
```

Drafts are not final incident records. They must be reviewed, linked to a fix and regression test, and then promoted manually into this directory. The suggestion tool never writes canonical memory, runtime state, approval state, audit history, queue files, or final incident records.

The suggestion tool detects incident candidates from dossier/autonomy output, recent audit and pipeline metrics, Codex Worker reports, runtime history, and existing incident records. If a candidate matches an existing incident, it is marked as `duplicate_of` and no new draft is suggested by default.

## File Naming

Use:

```text
YYYY-MM-DD-<short-incident-slug>.md
```

Examples:

```text
2026-05-05-approval-deny-runtime-sync.md
2026-05-05-example-migration-path-leak.md
2026-05-05-read-only-spec-approval-misclassification.md
```

## Minimum Review Checklist

- Is the root cause concrete?
- Is the fix commit linked?
- Is a regression test linked?
- Is the durable rule linked?
- Is the affected layer listed?
- Is the recurrence detector or missing detector stated?
- Is the current handover updated if the lesson changes future behavior?
