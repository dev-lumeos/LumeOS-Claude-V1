# system/workorders

Status: ACTIVE_CORE WITH HISTORICAL DRAFTS AND REFERENCES

This folder is the governed workorder root. It contains active operator code,
schemas, templates, current workorders, historical drafts, and examples.

## Active Core

- `cli/`: batch operator, batch loader, source-chain checker, workorder factory,
  documentation-impact checks, and helper scripts.
- `schemas/`: workorder schema contracts.
- `nutrition/`: current and historical Nutrition/governance workorders and
  batches used during P1-005.

## Authoring Support

- `templates/`: workorder authoring templates.
- `lifecycle/`: lifecycle reference docs.
- `examples/`: non-executable examples and references.

## Historical Or Placeholder Areas

- `adhoc/`: older ad hoc workorders and smokes.
- `batches/`: top-level placeholder; current Nutrition batches live under
  `nutrition/batches/`.
- `nutrition/drafts/`: historical drafts/reviews unless explicitly promoted.
- `nutrition/archive/` and `nutrition/approved/`: placeholder folders today.

## Active Queue Rule

A file in this tree is not active queue just because it exists. Active execution
requires a governed batch/operator path, valid workorder schema, clean gates,
and any required approvals.

## Documentation Impact Rule

Every governed workorder must declare `documentation_impact`. DONE is blocked
when documentation handling or SSOT sync is required and not completed.

## Cleanup Rule

Do not move/delete old drafts, examples, or completed batches in Phase 1. Add
indexes first, then move only after Tom approves an exact cleanup list.
