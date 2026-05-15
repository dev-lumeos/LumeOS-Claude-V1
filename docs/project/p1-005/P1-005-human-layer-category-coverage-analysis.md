# P1-005 Human Layer Category Coverage Analysis

Status: governed local analysis report
Date: 2026-05-15
Scope: local Nutrition Human Layer gap analysis only

## Source Inputs

- `docs/specs/Nutrition/01_current_specs/SPEC_05_FOOD_TAXONOMY.md`
- `docs/specs/Nutrition/01_current_specs/SPEC_08_IMPORT_PIPELINE.md`
- Local `nutrition.foods`
- Local `nutrition.food_categories`
- Local `nutrition.food_nutrients`

## Baseline

| Metric | Count |
|---|---:|
| Foods | 7140 |
| Categorized foods | 4854 |
| Unassigned foods | 2286 |
| Category rows | 518 |
| L1 categories | 13 |
| L2 categories | 75 |
| L3 categories | 385 |
| L4 categories | 45 |

No category mappings were applied by this analysis batch.

## Unassigned Foods By First BLS Prefix

| Prefix | Count |
|---|---:|
| X | 1165 |
| Y | 885 |
| N | 114 |
| V | 105 |
| U | 17 |

## Top Unassigned Two-Character Prefixes

| Prefix | Count | Observed examples |
|---|---:|---|
| Y8 | 271 | desserts, compotes, puddings, sweet prepared foods |
| X4 | 266 | soups, stews, cold soups |
| X5 | 226 | prepared vegetable, pasta, and mixed dishes |
| X6 | 89 | prepared potato dishes |
| X2 | 83 | prepared salads |
| Y9 | 74 | ice cream, fast food, serving dishes |
| Y1 | 71 | prepared beef dishes |
| Y3 | 71 | prepared pork dishes |
| Y7 | 71 | egg and cheese prepared dishes |
| X1 | 62 | prepared mixed foods |
| X8 | 59 | prepared mixed foods |
| Y5 | 59 | prepared mixed foods |
| Y2 | 57 | prepared meat dishes |
| V2 | 49 | game meat / wild |

## Top Source-Label Patterns

| Pattern | Count |
|---|---:|
| kaffee | 17 |
| eier-frischteigwaren | 16 |
| ruehrei / rührei | 16 |
| eierteigwaren | 15 |
| milchreis | 15 |
| fleischbruehe / fleischbrühe | 13 |
| reh | 13 |
| hirsch | 12 |
| pfannkuchen / eierkuchen | 12 |
| pizza | 12 |
| reis | 12 |
| wildschwein | 12 |
| gruene / grüne | 11 |
| eier | 10 |
| kaffeeersatz | 10 |
| rinderkraftbruehe / rinderkraftbrühe | 10 |
| teigwaren | 10 |

## Safe Candidate Rules

These are candidates for a future governed mapping batch. They were not applied here.

| Rule | Estimated coverage | Evidence | Current decision |
|---|---:|---|---|
| `V2xxxx` -> Wild / game meat category | 49 | `SPEC_05_FOOD_TAXONOMY.md` describes game meat under the meat hierarchy and associates Wild with V2 BLS code patterns. | Candidate for a narrow future apply after exact target slug/parent verification. |
| Prepared dish X/Y sub-prefix review | about 2050 | SPEC_05 includes prepared-dish Human Layer categories, but prepared rows require BLS name, code, and category context. | Report only. Do not auto-assign from broad X/Y prefix alone. |

## Unsafe Or Deferred Patterns

- Broad `X` and `Y` prepared-dish prefixes are not one deterministic category.
- Soups, salads, rice dishes, desserts, meat dishes, and fast-food patterns need subcategory-specific rules before category assignment.
- `no_raw_fish` remains unresolved because raw/prepared state metadata is not present.
- `no_gluten` remains unresolved because ingredient-level gluten evidence is not present.
- Human-friendly display names remain uncurated and must not be inferred from BLS source labels.
- Individual preference-catalog food item to `food_id` mappings remain unresolved unless an exact deterministic source match exists.

## Recommendation

Create a narrow follow-up mapping batch for one verified prefix or rule at a time. Start with `V2xxxx` only if the target Human Layer category slug and parent can be proven from SPEC_05 and local category rows. Keep prepared-dish X/Y mapping as review-only until deterministic sub-prefix rules are documented.
