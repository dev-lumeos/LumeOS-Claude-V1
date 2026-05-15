# Nutrition Workorders

Status: MIXED ACTIVE/HISTORICAL WORKORDER EVIDENCE / PRODUCT GATE CLOSED BY DEFAULT

This folder contains Nutrition and governance workorders, batches, drafts, and
tests created during P1-005 local Nutrition foundation work. Some files are
current governed batch definitions; others are historical drafts or evidence.

## Active / Completed Governed Work

- Root `WO-*.md` files are workorder definitions.
- `batches/` contains governed batch definitions. Many completed P1-005 local
  Nutrition and governance batches remain here as source-chain evidence.
- `__tests__/` contains workorder-related tests where present.

## Historical / Placeholder Areas

- `drafts/` contains historical drafts/reviews unless a future governed task
  explicitly promotes one.
- `archive/` and `approved/` are currently placeholder folders.

## Product Gate Rule

Existing Nutrition workorders and batches do not by themselves authorize new
product work, BLS import, Supabase commands, migration execution, approval
grants, DEV/LIVE work, or production routing changes. Use the governed operator
with the exact batch and current project profile.

## Documentation Impact Rule

New governed workorders must include `documentation_impact`. If documentation
or SSOT handling is required, the documentation step and `SSOT_SYNC_CHECK` must
pass before DONE.
