# Nutrition / BLS / Bootstrap Document Status

STATUS: CURRENT GOVERNANCE REFERENCE

This index labels older Nutrition, BLS, Supabase, and bootstrap documents so operators do not confuse retained evidence with active allowed work.

Product work remains closed unless Tom explicitly opens a specific product gate.
Since this index was first created, Tom opened several narrow local-only P1-005
boundaries. Those completed local-only boundaries are summarized in
`docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md`.

This document still does not authorize new BLS import work, Supabase Cloud,
DEV/LIVE promotion, production DB work, migration execution, product batches,
approval grants, raw BLS commits, RDA value changes, diary write flow, or
MealItem creation. Execute only the current governed workorders/runbooks that
pass the active product gate and SSOT checks.

## Current Governance References

| Document | Status | Use |
|---|---|---|
| `docs/project/PRODUCT_WORK_GATE.md` | CURRENT GOVERNANCE REFERENCE | Source of truth for closed product gate policy. |
| `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md` | CURRENT GOVERNANCE REFERENCE | Current operator/governance workflow. |
| `docs/project/BATCH_LOADER_CLI_V1.md` | CURRENT GOVERNANCE REFERENCE | Historical bootstrap context for the implemented batch-loader CLI; not product execution authority. |
| `docs/project/p1-005/P1-005-local-nutrition-foundation-v1-cut.md` | CURRENT LOCAL PRODUCT MILESTONE | Current local-only Nutrition Foundation V1 cut. It documents completed local work and open product TODOs, but does not authorize DEV/LIVE or new DB execution. |

## Reference-Only Product Specs

| Document | Status | Use |
|---|---|---|
| `docs/specs/Nutrition/INDEX.md` | REFERENCE_ONLY / GATED_SOURCE | Source-chain index for governed Nutrition work. |
| `docs/specs/Nutrition/01_current_specs/*` | REFERENCE_ONLY / GATED_SOURCE | Product specifications used as source refs for governed local Nutrition work. |
| `docs/specs/Nutrition/02_patches/*` | REFERENCE_ONLY / GATED_SOURCE | Spec patches retained as source refs. |
| `docs/specs/Nutrition/03_sql/*` | REFERENCE_ONLY / NOT EXECUTION AUTHORITY | SQL/spec evidence only; not executable migration authority. |
| `docs/specs/Nutrition/04_adrs/*` | REFERENCE_ONLY / GATED_SOURCE | Product architecture decisions for future governed work. |
| `docs/specs/Nutrition/05_reviews/*` | REFERENCE_ONLY / GATED_SOURCE | Review evidence for future governed work. |

## Archival / Historical Workorder Material

| Document | Status | Use |
|---|---|---|
| `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-001-db-foundation.md` | ARCHIVAL / HISTORICAL / BLOCKED_BY_PRODUCT_GATE | Historical DB foundation batch evidence. Do not execute. |
| `system/workorders/nutrition/batches/BATCH-NUTRITION-P1-004-schema-verification.md` | ARCHIVAL / HISTORICAL / REFERENCE_ONLY | Completed static verification evidence. Rerun only through a current governance workorder. |
| `system/workorders/nutrition/drafts/*` | ARCHIVAL / HISTORICAL | Historical generated drafts and reviews. Not queue input unless explicitly re-issued by current governance. |

## Local Supabase Reports

| Document | Status | Use |
|---|---|---|
| `docs/project/local-supabase/LOCAL_SUPABASE_INVENTORY_REPORT.md` | REFERENCE_ONLY | Historical read-only inventory evidence. |
| `docs/project/local-supabase/LOCAL_SUPABASE_ADDITIVE_MIGRATION_PLAN.md` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Historical planning context only. |
| `docs/project/local-supabase/LOCAL_SUPABASE_TRANSACTION_DRY_RUN_REPORT.md` | REFERENCE_ONLY | Historical dry-run evidence only. |

## Operator Rule

If a document has historical commands, treat them as evidence, not instructions. Execute only commands from current governance workorders/runbooks that pass the product gate, invariant checker, agent-contract checker, source-chain checker, and promotion governance.
