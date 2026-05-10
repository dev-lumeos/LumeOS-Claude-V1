# Memory/Learning V2 Incident Suggestions

Date: 2026-05-10

## Summary

Memory/Learning V2 adds a read-only incident suggestion tool for governance outputs. It reduces manual learning work by turning dossier, operator/autonomy, audit, pipeline metrics, runtime history, and Codex Worker signals into draft incident candidates.

## Tool

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --from-dossier <dossier-json-or-md>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\reports\governance-learning-suggest.ts --write-drafts
```

Default mode is read-only. Draft writing requires `--write-drafts` and writes only under:

```text
docs/project/governance-learning/drafts/
```

## Detection

The tool detects candidates such as Codex Worker timeouts, dispatcher failures, approval/token drift, stop-rule retriggers, invalid JSON spikes, model-runtime blockers, product-gate false positives, source-chain blockers, agent-contract blockers, migration-guard blockers, scope violations, dirty worktree blockers, promotion blockers, output mismatches, and runtime artifact commit risks.

Each candidate includes severity, confidence, evidence, likely fix area, regression-test suggestion, durable-rule suggestion, memory-update need, recurrence detector, and duplicate status.

## Duplicate Handling

Existing incident records under `docs/project/governance-learning/` are scanned before suggesting drafts. Matching candidates are marked `duplicate_of` and are not emitted as new draft suggestions by default.

## Safety

The tool does not write canonical memory, final incident records, runtime state, approval state, audit history, queue files, Supabase state, or product outputs. Final learning records still require review and promotion through the existing Incident -> Root Cause -> Fix -> Regression Test -> Durable Rule -> Memory Update workflow.

## Product Gate

Product work remains closed unless Tom explicitly opens it.
