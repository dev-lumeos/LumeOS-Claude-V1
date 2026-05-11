# Nutrition / BLS / Bootstrap Document Status

STATUS: CURRENT GOVERNANCE REFERENCE

This index labels older Nutrition, BLS, Supabase, and bootstrap documents so operators do not confuse retained evidence with active allowed work.

Product work remains closed unless Tom explicitly opens a specific product gate. None of the documents below authorize BLS import, Nutrition implementation, Supabase commands, migration execution, product batches, approval grants, or raw BLS commits.

## Current Governance References

| Document | Status | Use |
|---|---|---|
| `docs/project/PRODUCT_WORK_GATE.md` | CURRENT GOVERNANCE REFERENCE | Source of truth for closed product gate policy. |
| `docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md` | CURRENT GOVERNANCE REFERENCE | Current operator/governance workflow. |
| `docs/project/BATCH_LOADER_CLI_V1.md` | CURRENT GOVERNANCE REFERENCE | Historical bootstrap context for the implemented batch-loader CLI; not product execution authority. |

## Reference-Only Product Specs

| Document | Status | Use |
|---|---|---|
| `docs/specs/Nutrition/INDEX.md` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Source-chain index for future Nutrition work. |
| `docs/specs/Nutrition/01_current_specs/*` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Product specifications retained as future source refs. |
| `docs/specs/Nutrition/02_patches/*` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Historical spec patches retained as source refs. |
| `docs/specs/Nutrition/03_sql/*` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | SQL/spec evidence only; not executable migration authority. |
| `docs/specs/Nutrition/04_adrs/*` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Product architecture decisions for future gated work. |
| `docs/specs/Nutrition/05_reviews/*` | BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY | Review evidence for future gated work. |

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
