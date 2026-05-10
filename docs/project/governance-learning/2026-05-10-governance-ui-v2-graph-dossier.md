# Governance UI V2 Graph / Dossier Summary

Date: 2026-05-10

## Layer

Governance UI / operator console.

## Change

Governance UI V2 improves the local console without changing command authority:

- Workorders now render as a lightweight dependency board with status, risk, approval, output completeness, and selected-node details.
- Dossiers now render as structured summary and timeline sections before raw output.
- Doctor, Approval Center, and Runtime pages now prioritize parsed JSON summaries and keep raw stdout/stderr collapsible.
- Next actions are more prominent and copyable.

## Safety

- No new command authority was added.
- The central allowlist remains the only execution path.
- Approval grant/deny execution remains absent.
- Product work remains closed unless Tom explicitly opens it.
- Supabase reset/push, migrations, production DB actions, runtime state edits, queue edits, and raw BLS commits remain forbidden.

## Tests

Regression coverage was added to the governance UI safety test for:

- V2 graph and dossier timeline structure.
- Raw output kept secondary.
- Approval Center remaining display-only.
- Runtime cards for optional/external runtimes.

## Remaining Work

- React Flow graph can replace the lightweight dependency board later.
- Read-only polling can be added after the manual refresh UX remains stable.
- Approval detail and dossier timelines can be deepened as dossier JSON gets richer.
