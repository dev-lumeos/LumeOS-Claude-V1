# P1-005 Local Food Search Slice

Status: local-only implemented slice

## Purpose

This slice adds the first visible read-only Food Search surface for the local
Nutrition food foundation. It uses the locally applied BLS-backed data in:

- `nutrition.foods`
- `nutrition.food_nutrients`
- `nutrition.nutrient_defs`

## Boundary

- Local-only UI/API behavior.
- Read-only DB queries only.
- No DB writes.
- No migrations.
- No seed/import changes.
- No RDA value changes.
- No DEV/LIVE/Supabase Cloud action.

## Visible Behavior

- `/nutrition` searches local foods from `nutrition.foods`.
- `/api/nutrition/foods` returns matching local foods and selected food detail.
- Selecting a food shows linked nutrient values from `nutrition.food_nutrients`.
- Nutrient code, DE name, EN name, unit, and value are resolved through
  `nutrition.nutrient_defs`.
- Empty searches and no-match searches show clear read-only states.

## BLS Label Policy

BLS food names are treated as source-backed technical labels. They are not final
human-facing product copy.

The UI explicitly states:

> Source label from BLS. Human-friendly names/aliases will be added later.

No human-friendly aliases, display names, categories, or inferred labels were
invented in this slice.

## Search Normalization

The local search helper normalizes German umlauts for practical source-label
matching:

- `ä` -> `ae`
- `ö` -> `oe`
- `ü` -> `ue`
- `ß` -> `ss`

Search currently applies to available BLS-backed source label fields only:

- `bls_code`
- `name_de`
- `name_en`
- `name_th`
- `name_display`

Future human-friendly names, aliases, categories, and richer search
normalization require a separate source-backed candidate.
