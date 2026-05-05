# Workorder Source Chain Standard

## Purpose

Every workorder must be traceable to the correct project source chain before execution. The goal is to prevent implementation from isolated fragments, examples, raw data, stale patches, or chat-only context when a higher-priority source of truth exists.

## `source_refs` Convention

New workorders should include a top-level YAML `source_refs` block inside the workorder YAML:

```yaml
source_refs:
  module_index: "docs/specs/Nutrition/INDEX.md"
  current_specs:
    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  patches:
    - "docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md"
  sql_sources:
    - "docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql"
  adrs:
    - "docs/specs/Nutrition/04_adrs/ADR_EXAMPLE.md"
  reviews:
    - "docs/specs/Nutrition/05_reviews/REVIEW_EXAMPLE.md"
  raw_sources:
    - "docs/specs/Nutrition/00_raw/bls/original/"
  raw_sources_allowed: true
  ssot_priority:
    - module_index
    - current_specs
    - patches
    - sql_sources
    - adrs
    - reviews
    - raw_sources
```

`raw_sources` is optional and must be used only for provenance or validation when a current spec exists.

## SSOT Priority

The default module source priority is:

1. Module `INDEX.md`
2. `01_current_specs`
3. `02_patches`
4. `03_sql`
5. `04_adrs`
6. `05_reviews`
7. `00_raw`

For Nutrition specifically:

- `docs/specs/Nutrition/INDEX.md` is the entry point.
- `docs/specs/Nutrition/01_current_specs/` is the primary implementation SSOT.
- `docs/specs/Nutrition/02_patches/` overrides or clarifies current specs.
- `docs/specs/Nutrition/03_sql/` provides SQL/seed structure context.
- `docs/specs/Nutrition/04_adrs/` constrains decisions.
- `docs/specs/Nutrition/05_reviews/` captures readiness/review evidence.
- `docs/specs/Nutrition/00_raw/` is local-only provenance/validation input, not the implementation SSOT when current specs exist.

## Module INDEX Requirement

Every new module workorder must reference the module `INDEX.md`. The index is the entry point for resolving the current spec chain and prevents agents from selecting raw files or isolated snippets as the primary source.

Legacy workorders without `source_refs` may remain unchanged, but the checker reports them as legacy warnings.

## Raw Source Rules

- Raw BLS files stay local-only and ignored.
- Workorders may reference raw BLS paths for provenance or source validation.
- Workorders must not require committing raw BLS files.
- Workorders must not prioritize raw sources over `01_current_specs` when current specs exist.
- Raw data must not be used to invent schema, nutrient codes, seed values, tags, or acceptance criteria.

## Expected Outputs

New workorders must list all expected outputs:

```yaml
expected_outputs:
  - "supabase/migrations/20240522_002_nutrition_food_core_tables.sql"
  - "packages/types/src/nutrition/foods.ts"
```

Every expected output must be covered by `scope_files` or `files_allowed`.

## Scope Relationship

- `expected_outputs` declares what must exist when the workorder is done.
- `scope_files` / `files_allowed` declares what the worker may write.
- `files_blocked` declares what the worker may not touch.
- High-risk workorders must include `files_blocked`.

The source-chain checker reports an expected output outside write scope as high severity because the worker could not legally produce the required artifact.

## Acceptance Criteria Relationship

Acceptance criteria must mention output completeness. A workorder is not complete just because runtime blockers are gone; it is complete only when all expected outputs exist and satisfy the source-chain-derived requirements.

## Placeholder And Example Guards

Workorders must not authorize:

- placeholder seeds
- "few examples" seed blocks
- invented nutrient codes
- fake RDA/AI/UL values
- executable example migration paths such as `20240101_001_example.sql`
- raw files as primary source where specs exist

Examples must use placeholders such as `<WORKORDER_DERIVED_MIGRATION_PATH>` and must clearly state that they are not literal targets.

## Workorder Factory Requirement

The Workorder Factory must derive `source_refs` from:

1. module `INDEX.md`
2. linked current specs
3. patches
4. SQL sources
5. ADRs
6. review records
7. raw/provenance sources, if explicitly allowed

It must also generate:

- `expected_outputs`
- `scope_files` or `files_allowed` matching expected outputs
- `files_blocked` for high-risk workorders
- acceptance criteria that verify all expected outputs
- negative constraints forbidding raw-source misuse and placeholder/example output

## Checker Commands

```powershell
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file>
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts <workorder-file> --json
cmd.exe /c node node_modules\tsx\dist\cli.mjs system\workorders\cli\spec-source-chain-check.ts --batch <batch-file>
```

Exit codes:

- `0`: no critical/high findings
- `1`: critical or high findings
- `2`: tool/config error
