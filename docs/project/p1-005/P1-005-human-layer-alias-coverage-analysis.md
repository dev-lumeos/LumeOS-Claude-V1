# P1-005 Human Layer Alias Coverage Analysis

Status: governed local analysis report
Date: 2026-05-15
Scope: local Nutrition Human Layer alias gap analysis only

## Source Inputs

- `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- Local `nutrition.foods`
- Local `nutrition.food_aliases`

## Baseline

| Metric | Count |
|---|---:|
| Foods | 7140 |
| Food aliases | 21420 |
| Foods with zero aliases | 0 |
| Foods with one alias | 0 |
| Foods with multiple aliases | 7140 |
| Foods with German umlauts in source label | 3248 |
| Foods with EN source label | 7140 |

No aliases were inserted, updated, or deleted by this analysis batch.

## Alias Distribution

| Dimension | Value |
|---|---:|
| `locale=de` aliases | 14280 |
| `locale=en` aliases | 7140 |
| `source=editorial` aliases | 21420 |

The current alias baseline already covers the deterministic source-backed pattern expected for the local BLS-backed slice:

- exact source label
- normalized source label
- German umlaut variants where produced by source-label normalization
- punctuation/case normalized variants where produced by source-label normalization
- sourced English label where present

## Safe Expansion Opportunities

No immediate automatic alias expansion is recommended. Every food already has multiple source-backed aliases, and the remaining useful search recall work crosses into curated Human Layer vocabulary.

## Unresolved Alias Curation Needs

These remain future governed Human Layer curation work:

- human-friendly display names
- curated common names
- true synonyms
- cuisine-specific names
- region-specific names
- admin-reviewed aliases
- preference catalog item to food/category/tag aliases

## Guardrails

Forbidden alias sources remain:

- invented synonyms
- marketing names
- common names not present in a source or curated by a human
- AI-generated aliases
- inferred translations

## Recommendation

Keep the current alias set unchanged. Build a future local curation workflow for reviewed alias and display-name decisions rather than expanding aliases automatically.
