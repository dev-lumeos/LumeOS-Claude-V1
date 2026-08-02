# Food Semantic Tags - Design Documentation

**Branch:** `feat/food-semantic-foundation`
**Migration:** `20260331000004_food_semantic_tags.sql`
**Date:** 2026-03-31

## Overview

Clean, objective food classification system that enables diet exclusions, ingredient filtering, and fitness-relevant food discovery without UI blocks or user preference workarounds.

## Design Principles

1. **No Fantasy Data**: Only tags derived from BLS codes and macros
2. **Confidence Levels**: Explicit confidence scoring (1.0 = certain, 0.7-0.9 = probable)
3. **Idempotent**: Can be re-run without side effects
4. **Trigger-based**: Auto-updates when foods change
5. **No Overengineering**: Phase 1 only includes essential tags

## Schema

### `nutrition.tag_definitions`

| Column | Type | Description |
|--------|------|-------------|
| code | TEXT | Primary key (e.g., 'pork', 'dairy', 'vegan') |
| label_de | TEXT | German label |
| label_en | TEXT | English label |
| tag_type | TEXT | 'ingredient', 'diet', or 'fitness' |
| is_exclusion_relevant | BOOLEAN | Can be used for diet exclusions |
| sort_order | INTEGER | Display order |

### `nutrition.food_tags`

| Column | Type | Description |
|--------|------|-------------|
| food_id | UUID | Reference to nutrition.foods |
| tag_code | TEXT | Reference to tag_definitions |
| confidence | NUMERIC(3,2) | 1.0 = certain, 0.7-0.9 = probable |

## Phase 1 Tags

### Ingredient Tags (type: 'ingredient')

| Code | Label (EN) | Auto-tagging Rule |
|------|-----------|-------------------|
| **pork** | Pork | BLS: G3* (Schwein)<br>BLS: H* + name contains "schwein/schinken/speck" (0.9)<br>BLS: H* (default fallback, 0.7) |
| **beef** | Beef | BLS: G1* (Rind)<br>BLS: G2* (Kalb)<br>BLS: H* + name contains "rind" (0.9) |
| **poultry** | Poultry | BLS: G5* (Geflügel)<br>BLS: G8* (Kaninchen, 0.8)<br>BLS: H* + name contains "geflügel/pute/huhn" (0.9) |
| **lamb** | Lamb | BLS: G7* (Lamm) |
| **fish** | Fish | BLS: J1* (Süßwasserfische)<br>BLS: J2* (Seefische)<br>BLS: J4* (Fischerzeugnisse, 0.9) |
| **shellfish** | Shellfish | BLS: J3* (Meeresfrüchte) |
| **dairy** | Dairy | BLS: K* (Milch, Milcherzeugnisse, Käse) |
| **egg** | Egg | BLS: L* (Eier) |
| **offal** | Offal | BLS: G4* (Innereien) |

### Diet Tags (type: 'diet')

| Code | Label (EN) | Computation Rule |
|------|-----------|------------------|
| **vegetarian** | Vegetarian-compatible | NOT tagged with any of: pork, beef, poultry, lamb, fish, shellfish, offal |
| **vegan** | Vegan-compatible | Tagged as vegetarian AND NOT tagged with: dairy, egg |

### Fitness Tags (type: 'fitness')

| Code | Label (EN) | Computation Rule |
|------|-----------|------------------|
| **high_protein** | High-protein | macros.protein_g >= 15 per 100g |

## BLS Code Mapping

### Category G: Fleisch, Wild, Innereien (Meat, Game, Offal)

```
G1* → beef      (Rind)
G2* → beef      (Kalb)
G3* → pork      (Schwein)
G4* → offal     (Innereien)
G5* → poultry   (Geflügel)
G6* → (skip)    (Wild - complex, needs better data)
G7* → lamb      (Lamm)
G8* → poultry   (Kaninchen, confidence 0.8)
```

### Category H: Wurstwaren (Sausages, Cold Cuts)

**Challenge**: Sausages can contain pork, beef, poultry, or mixed meat.

**Strategy**: Name-based heuristics + confidence levels

```sql
IF name_de LIKE '%schwein%' OR '%schinken%' OR '%speck%' OR '%salami%'
  → pork (confidence 0.9)

ELSIF name_de LIKE '%rind%'
  → beef (confidence 0.9)

ELSIF name_de LIKE '%geflügel%' OR '%pute%' OR '%huhn%'
  → poultry (confidence 0.9)

ELSE
  → pork (confidence 0.7)  -- Most German sausages are pork-based
```

### Category J: Fisch, Meeresfrüchte (Fish, Seafood)

```
J1* → fish       (Süßwasserfische)
J2* → fish       (Seefische)
J3* → shellfish  (Meeresfrüchte)
J4* → fish       (Fischerzeugnisse, confidence 0.9)
```

### Category K: Milch, Milcherzeugnisse, Käse (Dairy)

```
K* → dairy (all subcategories)
```

### Category L: Eier (Eggs)

```
L* → egg (all subcategories)
```

## Auto-tagging Logic

### 1. Ingredient Tags (BLS-based)

```sql
-- Direct mapping from BLS code
IF bls_code LIKE 'G3%' THEN
  INSERT food_tags (food_id, 'pork', 1.0)

-- Name-based heuristics for complex categories (H*)
IF bls_code LIKE 'H%' AND name_de LIKE '%schwein%' THEN
  INSERT food_tags (food_id, 'pork', 0.9)
```

### 2. Diet Tags (Computed)

```sql
-- Vegetarian: Exclude all meat/fish tags
IF NOT EXISTS (
  SELECT 1 FROM food_tags
  WHERE tag_code IN ('pork', 'beef', 'poultry', 'lamb', 'fish', 'shellfish', 'offal')
) THEN
  INSERT food_tags (food_id, 'vegetarian', 1.0)

-- Vegan: Vegetarian + exclude dairy/egg
IF 'vegetarian' AND NOT EXISTS (
  SELECT 1 FROM food_tags
  WHERE tag_code IN ('dairy', 'egg')
) THEN
  INSERT food_tags (food_id, 'vegan', 1.0)
```

### 3. Fitness Tags (Macro-based)

```sql
-- High protein: >= 15g per 100g
IF (macros->>'protein_g')::NUMERIC >= 15 THEN
  INSERT food_tags (food_id, 'high_protein', 1.0)
```

## Trigger Behavior

```sql
CREATE TRIGGER trg_foods_auto_tag
  AFTER INSERT OR UPDATE OF bls_code, macros, is_active, name_de
  ON nutrition.foods
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.trigger_auto_tag_food();
```

**When triggered:**
1. Delete all existing tags for the food
2. Re-run auto-tagging logic
3. Ensures tags stay synchronized with food data

## Example Queries

### Find all pork-free, high-protein foods

```sql
SELECT f.name_de, f.name_en, (f.macros->>'protein_g')::NUMERIC as protein
FROM nutrition.foods f
WHERE f.is_active = true
  AND f.id IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'high_protein')
  AND f.id NOT IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'pork')
ORDER BY protein DESC;
```

### Find all vegan foods

```sql
SELECT f.name_de, f.name_en
FROM nutrition.foods f
JOIN nutrition.food_tags ft ON f.id = ft.food_id
WHERE ft.tag_code = 'vegan'
ORDER BY f.name_de;
```

### View food with all its tags

```sql
SELECT * FROM nutrition.v_foods_with_tags
WHERE name_de ILIKE '%hähnchen%';
```

## Expected Statistics

Based on typical BLS database composition:

| Tag | Expected Count | Notes |
|-----|----------------|-------|
| pork | ~500-800 | G3* + many H* products |
| beef | ~300-500 | G1*, G2* + some H* |
| poultry | ~200-400 | G5*, G8* + some H* |
| lamb | ~20-50 | G7* (less common) |
| fish | ~300-500 | J1*, J2*, J4* |
| shellfish | ~50-100 | J3* (subset of seafood) |
| dairy | ~800-1200 | Entire K* category |
| egg | ~50-100 | Entire L* category |
| offal | ~100-200 | G4* category |
| vegetarian | ~5000-7000 | All non-meat categories |
| vegan | ~3000-5000 | Vegetarian minus dairy/egg |
| high_protein | ~1000-1500 | Meat, fish, legumes, dairy |

## Future Phases (NOT Phase 1)

**Phase 2 potential additions:**
- `gluten`, `nuts`, `soy` (allergen tags)
- `low_carb`, `low_fat` (fitness tags)
- `organic`, `processed` (quality tags)

**Phase 3 potential additions:**
- `halal`, `kosher` (religious diet tags)
- `local`, `seasonal` (sustainability tags)

## Migration Output

The migration will output statistics like:

```
============================================================
Food Semantic Tags Foundation - Statistics
============================================================
Total active foods:           8749
Foods with tags:              8749
Total tag assignments:        15203
Average tags per tagged food: 1.74
------------------------------------------------------------
Tag distribution:
------------------------------------------------------------
  pork            Pork                      [ingredient]: 723 foods (confidence: 0.89)
  beef            Beef                      [ingredient]: 412 foods (confidence: 0.97)
  poultry         Poultry                   [ingredient]: 298 foods (confidence: 0.93)
  lamb            Lamb                      [ingredient]: 34 foods (confidence: 1.00)
  fish            Fish                      [ingredient]: 387 foods (confidence: 0.98)
  shellfish       Shellfish                 [ingredient]: 76 foods (confidence: 1.00)
  dairy           Dairy                     [ingredient]: 1034 foods (confidence: 1.00)
  egg             Egg                       [ingredient]: 67 foods (confidence: 1.00)
  offal           Offal                     [ingredient]: 142 foods (confidence: 1.00)
  vegetarian      Vegetarian-compatible     [diet]: 6523 foods (confidence: 1.00)
  vegan           Vegan-compatible          [diet]: 4389 foods (confidence: 1.00)
  high_protein    High-protein              [fitness]: 1122 foods (confidence: 1.00)
============================================================
```

## Testing Checklist

After running migration:

- [ ] All G3* foods tagged as 'pork'
- [ ] All K* foods tagged as 'dairy'
- [ ] All L* foods tagged as 'egg'
- [ ] Vegetables (D* category) tagged as 'vegetarian' and 'vegan'
- [ ] Fruits (F* category) tagged as 'vegetarian' and 'vegan'
- [ ] High-protein meats tagged as 'high_protein'
- [ ] No meat/fish/dairy foods have 'vegan' tag
- [ ] Sausages (H*) have appropriate tags with confidence < 1.0
- [ ] View `nutrition.v_foods_with_tags` works correctly

## Known Limitations

1. **Sausages (H* category)**: Mixed meat products require name-based heuristics
   - Confidence scores reflect uncertainty (0.7-0.9 vs 1.0)
   - Some products may be mis-tagged if name is ambiguous

2. **Game meats (G6*)**: Currently not auto-tagged
   - Requires better data or manual curation
   - Too diverse (wild boar, deer, etc.)

3. **Processed foods**: May contain hidden ingredients
   - We rely on BLS categorization
   - Cross-contamination not modeled

4. **Allergens**: Not covered in Phase 1
   - Will be added in Phase 2 if needed

## Rollback

If needed, rollback with:

```sql
DROP TRIGGER IF EXISTS trg_foods_auto_tag ON nutrition.foods;
DROP FUNCTION IF EXISTS nutrition.trigger_auto_tag_food();
DROP FUNCTION IF EXISTS nutrition.auto_tag_food(UUID);
DROP VIEW IF EXISTS nutrition.v_foods_with_tags;
DROP TABLE IF EXISTS nutrition.food_tags;
DROP TABLE IF EXISTS nutrition.tag_definitions;
```

## References

- BLS 4.0 Documentation: https://www.blsdb.de/
- Migration: `20260331000004_food_semantic_tags.sql`
- Previous migrations:
  - `20260331000002_seed_food_categories.sql` (BLS categories)
  - `20260331000003_build_food_aliases_foundation.sql` (aliases)
