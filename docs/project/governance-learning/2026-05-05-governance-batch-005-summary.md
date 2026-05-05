# Governance Batch 005 Summary - Spec Source Chain / Workorder Factory

Date: 2026-05-05

## Purpose

Governance Batch 005 adds a read-only checker and documented standard to ensure workorders resolve the correct source chain before implementation.

## Files Created

- `system/workorders/cli/spec-source-chain-check.ts`
- `system/workorders/cli/__tests__/spec-source-chain-check.test.ts`
- `docs/project/WORKORDER_SOURCE_CHAIN_STANDARD.md`

## Files Updated

- `docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md`
- `docs/project/CURRENT_GOVERNANCE_HANDOVER.md`
- `system/memory/canonical/lumeos_canonical.md`

## Checker Coverage

- Module `INDEX.md` reference.
- `source_refs` convention and legacy warning behavior.
- Nutrition source priority.
- Raw BLS provenance-only policy.
- Expected output declarations.
- `scope_files` / `files_allowed` coverage for expected outputs.
- `files_blocked` requirement for high-risk workorders.
- Acceptance criteria output completeness.
- Placeholder seed, example path, invented-data, and raw-primary-source wording.
- Batch aggregation.
- JSON output.

## Product Work Gate

Batch 005 removes the source-chain checker blocker, but product work is allowed only when:

- this batch is merged and pushed;
- the target workorder/batch passes the source-chain checker;
- invariant checker has no critical/high findings;
- agent contract checker has no critical/high findings;
- Tom has not otherwise closed the gate.

## Remaining Open Work

- Governance Batch 006: Reporting & Dossier Hardening.
- Governance Batch 007: Promotion / Merge Governance.
- Governance Batch 008: Operator Doctor / Autonomy Hardening.
