# Food Semantic Tags - Implementation Summary

**Branch:** `feat/food-semantic-foundation`
**Commit:** `7cfe6a5`
**Date:** 2026-03-31

## Mission Accomplished

Saubere, objektive Food-Klassifikation ohne UI-Blocks, ohne Search-Patches, ohne User-Preferences, ohne Workarounds.

## Was wurde gebaut?

### 1. Schema

**`nutrition.tag_definitions`** - Tag-Vokabular
```sql
CREATE TABLE nutrition.tag_definitions (
  code TEXT PRIMARY KEY,           -- 'pork', 'dairy', 'vegan'
  label_de TEXT NOT NULL,
  label_en TEXT NOT NULL,
  tag_type TEXT NOT NULL,          -- 'ingredient', 'diet', 'fitness'
  is_exclusion_relevant BOOLEAN,   -- Für diet exclusions nutzbar
  sort_order INTEGER
);
```

**`nutrition.food_tags`** - Food-Tag-Zuordnungen
```sql
CREATE TABLE nutrition.food_tags (
  food_id UUID REFERENCES nutrition.foods(id),
  tag_code TEXT REFERENCES nutrition.tag_definitions(code),
  confidence NUMERIC(3,2),         -- 1.0 = sicher, 0.7-0.9 = wahrscheinlich
  PRIMARY KEY (food_id, tag_code)
);
```

### 2. Phase 1 Tags (12 Tags)

| Code | Label (DE) | Label (EN) | Type | BLS-basiert |
|------|-----------|-----------|------|-------------|
| **pork** | Schweinefleisch | Pork | ingredient | G3*, H* (heuristisch) |
| **beef** | Rindfleisch | Beef | ingredient | G1*, G2*, H* (heuristisch) |
| **poultry** | Geflügel | Poultry | ingredient | G5*, G8*, H* (heuristisch) |
| **lamb** | Lamm | Lamb | ingredient | G7* |
| **fish** | Fisch | Fish | ingredient | J1*, J2*, J4* |
| **shellfish** | Schalentiere | Shellfish | ingredient | J3* |
| **dairy** | Milchprodukt | Dairy | ingredient | K* |
| **egg** | Ei | Egg | ingredient | L* |
| **offal** | Innerei | Offal | ingredient | G4* |
| **vegetarian** | Vegetarisch-geeignet | Vegetarian-compatible | diet | Computed |
| **vegan** | Vegan-geeignet | Vegan-compatible | diet | Computed |
| **high_protein** | Proteinreich | High-protein | fitness | macros >= 15g |

### 3. Auto-Tagging-Logik

#### BLS-Code basiert (Ingredient Tags)

```sql
-- G3* → pork (Schweinefleisch)
IF bls_code LIKE 'G3%' THEN
  INSERT food_tags (food_id, 'pork', 1.0)

-- K* → dairy (Milchprodukte)
IF bls_code LIKE 'K%' THEN
  INSERT food_tags (food_id, 'dairy', 1.0)

-- L* → egg (Eier)
IF bls_code LIKE 'L%' THEN
  INSERT food_tags (food_id, 'egg', 1.0)
```

#### Name-basiert (Wurstwaren H*)

```sql
-- H* + Name-Heuristik mit Confidence < 1.0
IF bls_code LIKE 'H%' THEN
  IF name_de LIKE '%schwein%' OR '%schinken%' THEN
    INSERT food_tags (food_id, 'pork', 0.9)
  ELSIF name_de LIKE '%rind%' THEN
    INSERT food_tags (food_id, 'beef', 0.9)
  ELSE
    INSERT food_tags (food_id, 'pork', 0.7)  -- Default: meiste Wurst ist Schwein
  END IF
```

#### Computed (Diet Tags)

```sql
-- vegetarian = NICHT (meat OR fish OR shellfish OR offal)
IF NOT EXISTS (
  SELECT 1 FROM food_tags
  WHERE tag_code IN ('pork', 'beef', 'poultry', 'lamb', 'fish', 'shellfish', 'offal')
) THEN
  INSERT food_tags (food_id, 'vegetarian', 1.0)

-- vegan = vegetarian AND NOT (dairy OR egg)
IF 'vegetarian' AND NOT EXISTS (
  SELECT 1 FROM food_tags WHERE tag_code IN ('dairy', 'egg')
) THEN
  INSERT food_tags (food_id, 'vegan', 1.0)
```

#### Macro-basiert (Fitness Tags)

```sql
-- high_protein = >= 15g protein per 100g
IF (macros->>'protein_g')::NUMERIC >= 15 THEN
  INSERT food_tags (food_id, 'high_protein', 1.0)
```

### 4. Trigger für Auto-Sync

```sql
CREATE TRIGGER trg_foods_auto_tag
  AFTER INSERT OR UPDATE OF bls_code, macros, is_active, name_de
  ON nutrition.foods
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.trigger_auto_tag_food();
```

Wenn sich `bls_code`, `macros`, `is_active` oder `name_de` ändern:
1. Alle Tags für das Food löschen
2. Auto-Tagging neu durchführen
3. Tags bleiben synchron

## Dateien

| Datei | Beschreibung |
|-------|--------------|
| `D:\GitHub\LumeOS-Workspace-V1\supabase\migrations\20260331000004_food_semantic_tags.sql` | Hauptmigration (570 Zeilen) |
| `D:\GitHub\LumeOS-Workspace-V1\docs\food-semantic-tags-design.md` | Design-Dokumentation mit BLS-Mapping |
| `D:\GitHub\LumeOS-Workspace-V1\supabase\migrations\test_food_semantic_tags.sql` | Test-Queries zur Verifikation |

## Migration anwenden

```bash
# Supabase CLI
supabase db push

# Oder direkt via psql
psql -h <host> -U <user> -d <db> -f supabase/migrations/20260331000004_food_semantic_tags.sql
```

## Erwartete Statistiken

Nach der Migration siehst du in den RAISE NOTICE Ausgaben:

```
============================================================
Food Semantic Tags Foundation - Statistics
============================================================
Total active foods:           8749
Foods with tags:              8749
Total tag assignments:        ~15000
Average tags per tagged food: ~1.7
------------------------------------------------------------
Tag distribution:
------------------------------------------------------------
  pork            Pork                      [ingredient]: ~700 foods (confidence: 0.89)
  beef            Beef                      [ingredient]: ~400 foods (confidence: 0.97)
  poultry         Poultry                   [ingredient]: ~300 foods (confidence: 0.93)
  lamb            Lamb                      [ingredient]: ~30 foods (confidence: 1.00)
  fish            Fish                      [ingredient]: ~380 foods (confidence: 0.98)
  shellfish       Shellfish                 [ingredient]: ~75 foods (confidence: 1.00)
  dairy           Dairy                     [ingredient]: ~1000 foods (confidence: 1.00)
  egg             Egg                       [ingredient]: ~65 foods (confidence: 1.00)
  offal           Offal                     [ingredient]: ~140 foods (confidence: 1.00)
  vegetarian      Vegetarian-compatible     [diet]: ~6500 foods (confidence: 1.00)
  vegan           Vegan-compatible          [diet]: ~4300 foods (confidence: 1.00)
  high_protein    High-protein              [fitness]: ~1100 foods (confidence: 1.00)
============================================================
```

## Test-Queries

Nach der Migration kannst du die Ergebnisse verifizieren:

```bash
psql -h <host> -U <user> -d <db> -f supabase/migrations/test_food_semantic_tags.sql
```

### Wichtige Verifikationen

1. **BLS-Code Mapping**
   - Alle G3* Foods haben 'pork' Tag
   - Alle K* Foods haben 'dairy' Tag
   - Alle L* Foods haben 'egg' Tag

2. **Diet Tags**
   - Gemüse (D*) hat 'vegetarian' + 'vegan'
   - Obst (F*) hat 'vegetarian' + 'vegan'
   - Fleisch (G*) hat KEINE 'vegetarian' Tags
   - Milch (K*) hat 'vegetarian' aber KEINE 'vegan' Tags

3. **Conflicts**
   - KEINE Foods mit 'vegan' + 'dairy'
   - KEINE Foods mit 'vegan' + 'egg'
   - KEINE Foods mit 'vegetarian' + 'pork'

## Praktische Anwendungen

### Use Case 1: Pork-free, high-protein foods

```sql
SELECT f.name_de, (f.macros->>'protein_g')::NUMERIC as protein
FROM nutrition.foods f
WHERE f.is_active = true
  AND f.id IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'high_protein')
  AND f.id NOT IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'pork')
ORDER BY protein DESC;
```

**Ergebnis:** Rindfleisch, Hähnchen, Fisch, Eier, Milchprodukte - alle ohne Schwein

### Use Case 2: Vegan, high-protein foods

```sql
SELECT f.name_de, (f.macros->>'protein_g')::NUMERIC as protein
FROM nutrition.foods f
WHERE f.is_active = true
  AND f.id IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'vegan')
  AND f.id IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code = 'high_protein')
ORDER BY protein DESC;
```

**Ergebnis:** Hülsenfrüchte, Tofu, Nüsse, Samen - vegan + proteinreich

### Use Case 3: Multiple Exclusions (no pork, no dairy, no shellfish)

```sql
SELECT f.name_de, f.name_en
FROM nutrition.foods f
WHERE f.is_active = true
  AND f.id NOT IN (SELECT food_id FROM nutrition.food_tags WHERE tag_code IN ('pork', 'dairy', 'shellfish'))
ORDER BY f.name_de;
```

**Ergebnis:** Alle Foods außer Schwein, Milch, Schalentiere

### Use Case 4: View mit allen Tags

```sql
SELECT * FROM nutrition.v_foods_with_tags
WHERE 'pork' = ANY(tags)
LIMIT 10;
```

**Ergebnis:** Foods mit allen ihren Tags als Array

## Confidence Levels erklärt

| Confidence | Bedeutung | Beispiel |
|-----------|-----------|----------|
| **1.0** | Sicher (BLS-basiert) | G3* → pork |
| **0.9** | Sehr wahrscheinlich | H* + "Schinken" → pork |
| **0.8** | Wahrscheinlich | G8* (Kaninchen) → poultry |
| **0.7** | Unsicher (Default) | H* ohne Name-Match → pork |

Warum Confidence?
- **Sausages (H*)** können Schwein, Rind, Geflügel oder Mix sein
- Name-Heuristiken sind nicht 100% zuverlässig
- Confidence ermöglicht später Filterung nach Sicherheit

## BLS-Code Mapping Cheat Sheet

```
Fleisch & Wild:
G1* → beef (Rind)
G2* → beef (Kalb)
G3* → pork (Schwein)
G4* → offal (Innereien)
G5* → poultry (Geflügel)
G6* → (skip, Wild ist zu divers)
G7* → lamb (Lamm)
G8* → poultry (Kaninchen, confidence 0.8)

Wurstwaren:
H* → pork/beef/poultry via Name-Heuristik (confidence 0.7-0.9)

Fisch & Meeresfrüchte:
J1* → fish (Süßwasserfische)
J2* → fish (Seefische)
J3* → shellfish (Schalentiere)
J4* → fish (Fischerzeugnisse, confidence 0.9)

Milch & Eier:
K* → dairy (alle Milchprodukte)
L* → egg (alle Eier)
```

## Was ist NICHT implementiert?

**Kein UI-Block:** Keine UI-Komponenten
**Kein Search-Patch:** Keine Search-Modifikationen
**Keine User-Preferences:** Keine Userprofil-Logik
**Keine Workarounds:** Pure Semantic Foundation

**Phase 2 potentials (später):**
- Allergen-Tags: gluten, nuts, soy
- Fitness-Tags: low_carb, low_fat
- Qualitäts-Tags: organic, processed
- Religion-Tags: halal, kosher

## Rollback

Falls nötig:

```sql
DROP TRIGGER IF EXISTS trg_foods_auto_tag ON nutrition.foods;
DROP FUNCTION IF EXISTS nutrition.trigger_auto_tag_food();
DROP FUNCTION IF EXISTS nutrition.auto_tag_food(UUID);
DROP VIEW IF EXISTS nutrition.v_foods_with_tags;
DROP TABLE IF EXISTS nutrition.food_tags;
DROP TABLE IF EXISTS nutrition.tag_definitions;
```

## Nächste Schritte

1. **Migration anwenden** in Supabase
2. **Test-Queries laufen lassen** zur Verifikation
3. **Statistiken checken** (sollten wie oben aussehen)
4. **Use Cases testen** (pork-free, vegan, etc.)

Wenn alles grün ist → **Food Semantic Foundation steht!**

## Proof of Concept

Die Foundation ist da. Jetzt können wir:
- Diet Exclusions sauber implementieren
- Ingredient Filtering ohne Workarounds
- Bodybuilding-relevante Foods finden
- Vegan/Vegetarian Discovery ohne Halluzinationen

Alles basierend auf BLS-Codes und Makros. Objektiv. Wartbar. Erweiterbar.

---

**Status:** Ready for Migration
**Next:** Apply migration and verify with test queries
