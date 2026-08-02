# Operator Autonomy V2

Date: 2026-05-10

## Summary

Operator stop states now produce a stable autonomy handoff instead of leaving Tom to infer the next dossier, learning, cleanup, or approval step.

## What Changed

- Operator reports include an `Autonomy Handoff` section.
- Operator Doctor JSON includes `autonomy_handoff`.
- Batch Dossier JSON and Markdown include `autonomy_handoff`.
- Governance UI Doctor and Dossier pages show the handoff fields directly.
- `system/reports/governance-learning-suggest.ts` can recommend whether a learning record is needed without writing by default.

## Durable Rule

Every STOP, FIX_REQUIRED, NEEDS_TOM_APPROVAL, or NEEDS_SAFE_CLEANUP handoff must include one exact next action, dossier guidance, cleanup safety state, learning guidance, product-gate state, and Codex Worker eligibility.

## Safety

- No product work was opened.
- Product gate remains closed.
- Cleanup suggestions point first to official dry-run commands.
- Approval states do not auto-grant.
- Learning draft writes require explicit `--write-draft`.
