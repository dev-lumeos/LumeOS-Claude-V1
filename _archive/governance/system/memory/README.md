# system/memory

Status: CANONICAL ACTIVE_SUPPORT / OTHER SUBFOLDERS MOSTLY PLACEHOLDER

This folder is not a general active database. Today it has one active support
layer and several planned subsystem placeholders.

## Canonical Memory

`system/memory/canonical/` is `ACTIVE_SUPPORT`.

It contains compact continuity memory such as:

- `lumeos_canonical.md`
- `adr_index.md`
- `session_protocol.md`

Evidence of use:

- `system/reports/governance-learning-check.ts` reads
  `system/memory/canonical/lumeos_canonical.md`.
- Project profiles define `memory_root` as `system/memory`.
- Governance docs and checks reference canonical memory as compact continuity
  context.

## Handover Versus Canonical Memory

`docs/project/CURRENT_GOVERNANCE_HANDOVER.md` and
`system/memory/canonical/lumeos_canonical.md` are different layers.

- `CURRENT_GOVERNANCE_HANDOVER.md`: current operational handover and immediate
  truth for the next governed work.
- `lumeos_canonical.md`: compact long-lived memory/continuity support.

Do not replace one with the other without a governed memory/SSOT change.

## Placeholder Folders

The audit found no active reader/writer evidence for these folders beyond
`.gitkeep` and historical/planning references:

- `events/`
- `execution/`
- `learning/`
- `promotions/`
- `retrieval/`

Treat them as `PLACEHOLDER` until code, tests, or governed docs prove active
use. Do not claim they are active runtime memory.

## Schema Reference

`schemas/` is `ACTIVE_SUPPORT` as a memory schema reference. It is not currently
the active runtime state validator.

## Cleanup Rule

Do not delete or consolidate memory folders in Phase 1. Future cleanup should
first decide whether placeholder folders are planned subsystems or archival
structure.
