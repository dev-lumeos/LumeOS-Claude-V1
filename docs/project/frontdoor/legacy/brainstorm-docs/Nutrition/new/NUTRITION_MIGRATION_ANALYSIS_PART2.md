# Nutrition Module — Migration Analyse, Teil 2

> Fortsetzung von `NUTRITION_MIGRATION_ANALYSIS.md`
> Nach vollständiger Lektüre von: SPEC_03, SPEC_05, SPEC_07, `packages/rules-engine/src/nutrition.ts`, `packages/scoring/src/nutrition.ts`, Legacy-Hooks `useFoodLog.ts`, `useMealConfirm.ts`, `useDailyTotals.ts`.

---

## A. RISIKEN AUS TEIL 1 — KLÄRUNG

| # | Status | Befund |
|---|---|---|
| **R-04** Semantic-Tags-Migration | **KLAR: NICHT VORHANDEN** | File-Scan über `D:\GitHub\LumeOSmacmini\supabase\migrations\**/*semantic*`, `**/*food_tags*`, `**/*tag_definitions*` → alle leer. DATABASE.md-Referenz auf `20260331000004_food_semantic_tags.sql` ist fiktiv. Tag-Daten sind **komplett Greenfield** — SPEC_06 §6 Trigger + SPEC_05 Tag-Katalog sind die einzige Wahrheit. |
| **R-08** `food_favorites` | **KLAR: SPEC droppt es** | SPEC_07 hat keinen `/favorites`-Endpoint. SPEC_02/06 listet die Tabelle nicht. SPEC_05 erwähnt Favoriten nicht. Legacy hat zudem hardcoded Dev-UUID → praktisch leer. **Entscheidung:** Legacy-Rows mit echten User-IDs als `food_preference_items(preference='liked', target_type='food')` migrieren, Tabelle dann droppen. Rows mit Dev-UUID verwerfen. |
| **R-10** Selenium (`SE`) im `nutrient_defs`-Seed | **KLAR: FEHLT** | Volltext-Scan durch SPEC_06 nutrient_defs Seed: kein `SE`-Eintrag. Aber SPEC_05 definiert Tag `selenium_source` mit Formel `SE ≥ 10µg/100g`, und das neue `daily_nutrition_summary` VIEW braucht `SE` nicht (zählt es nicht). Trotzdem: Legacy `meal_items` haben `selenium_ug`, und ohne `SE` in `nutrient_defs` bricht der EAV-Split mit FK-Violation. **Fix:** SPEC_06 §1 muss ergänzt werden — siehe §D unten. |
| **R-11** `user_settings` | **KLAR: BLEIBT** | SPEC_07 §18 hat `/settings`-Endpoints. DATABASE.md listet sie. SPEC_06 hat sie vergessen. → **SPEC_06 lückenhaft, muss ergänzt werden**, aber Tabelle bleibt in Nutrition. |
| **R-12** `shopping_lists` DDL | **KLAR: IN SPEC_06 LÜCKE** | SPEC_02 §12,13 definiert Entities. SPEC_07 §10 hat vollständige API. SPEC_06 hat die DDL vergessen und erwähnt das im "Ausstehende Korrekturen"-Block selbst. → DDL aus SPEC_02 synthetisieren; siehe §D unten. |
| **R-09** `food_ratings` JSONB Format | **BLEIBT UNKNOWN** | Ohne Sample-Data nicht auflösbar. Query zum Prüfen in §C.3. |
| **R-18** `rules-engine` Dependency | **KLAR: CODE MUSS UMGESCHRIEBEN WERDEN** | `packages/rules-engine/src/nutrition.ts` nutzt hartkodiert Legacy-Spaltennamen (`target.protein_g`, `target.calcium_mg`, `actual.vitamin_d` etc.) und hartkodierte Legacy-Keys (`TIER1_MICROS` array mit 20 Einträgen). Nach Schema-Rename in Nutrition stimmen KEINE Referenzen mehr. Und: Die Datei referenziert via `keyof NutritionTarget` auf das Contract-Interface — das muss ebenfalls umgebaut werden. **Ein Full-Rewrite des files ist Teil der Migration, nicht optional.** |
| **R-05** `foods_portions` | **KLAR: BLEIBT** | SPEC_01 §9 Schema-Liste nennt sie nicht, DATABASE.md aber schon. SPEC_06 hat sie nicht explizit. **Nächster Schritt**: nachziehen in SPEC_06 oder verschieben nach Custom-Food-Serving-Model. Aktuell: **konservativ KEEP**. |

---

## B. NEU ENTDECKTE RISIKEN

### R-21: Ghost MealItems — SPEC-Inkonsistenz, Daten werden brechen (KRITISCH)

**Evidenz:** `useMealConfirm.ts:82-90`:

```ts
if (item.food_id && item.food_id !== 'null') {
  payload.food_id = item.food_id;
} else {
  // Ghost meal item — send nutrients directly
  payload.food_name = item.food_name || 'Meal item';
  payload.kcal = item.kcal || 0;
  payload.protein_g = item.protein_g || 0;
  payload.carbs_g = item.carbs_g || 0;
  payload.fat_g = item.fat_g || 0;
}
```

Und `SPEC_03 Flow 1, Ende`:

> **Quick-Add Makros (Fallback ohne Food-Suche):** Direkte Eingabe von kcal + Protein wenn User kein spezifisches Food suchen möchte. Erstellt MealItem ohne Food-Referenz, nur Makro-Werte, keine Mikros.

**Problem:** Die neue SPEC_06 `meal_items` DDL verbietet genau das:

```sql
food_source TEXT NOT NULL CHECK (food_source IN ('bls','custom','mealcam'))
food_name   TEXT NOT NULL
```

- `food_source` ist NOT NULL mit geschlossener Check-List → Ghost-Items passen in **keinen** Wert.
- Die Alternative wäre `food_source = 'custom'` mit `custom_food_id = NULL` — aber dann würden die Nutrients trotzdem aus `foods_custom` berechnet, nicht manuell gesetzt.

**Legacy-Daten-Problem:** In der aktuellen `meal_items`-Tabelle existieren mit hoher Wahrscheinlichkeit Rows mit `food_id IS NULL`, die beim Migrieren in Phase 4 den CHECK-Constraint **nicht passieren**.

**Mitigation — 3 Optionen:**

1. **SPEC anpassen:** `food_source` um `'manual'` erweitern, `food_id + custom_food_id` beide nullable lassen.
2. **Ghost-Items per Migration zu Custom Foods umwandeln:** Pro Ghost-Item in `foods_custom` einen Eintrag anlegen, dann `meal_item.custom_food_id` setzen. **Teuer** (hunderte neue Custom Foods) und **verfälscht die foods_custom-Tabelle**.
3. **Ghost-Items droppen:** Alle betroffenen MealItems und gegebenenfalls ganze Meals löschen. **Datenverlust.**

**Empfehlung:** Option 1. SPEC_06 `meal_items` DDL ändern auf:

```sql
food_source TEXT NOT NULL CHECK (food_source IN ('bls','custom','mealcam','manual')),
-- food_id und custom_food_id beide nullable (existiert schon)
CONSTRAINT food_ref_consistency CHECK (
  (food_source = 'bls'    AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
  (food_source = 'custom' AND food_id IS NULL AND custom_food_id IS NOT NULL) OR
  (food_source IN ('mealcam','manual') AND food_id IS NULL AND custom_food_id IS NULL)
)
```

### R-22: API Breaking Change — `food_source` im POST-Body (HOCH)

**Evidenz:** Legacy `useFoodLog.ts:113-119`:

```ts
await nutritionApi(`/meals/${meal.id}/items`, {
  method: 'POST',
  body: JSON.stringify({
    food_id: food.id,
    amount_g: amount,     // <-- kein food_source
  }),
});
```

SPEC_07 §4 POST `/meals/:mealId/items`:

```json
{ "food_id": "uuid", "food_source": "bls", "amount_g": 200 }
```

**Problem:** Neue API verlangt `food_source` im Body. Jeder existierende Client (Next.js App, Jarvis-UI, etc.) muss angepasst werden.

**Mitigation:** Entweder
- Server-Seite: `food_source` optional machen und per Default-Logik ermitteln (`food_id` matcht `foods.id` → `bls`, matcht `foods_custom.id` → `custom`, sonst 400)
- Client-Seite: alle Call-Sites finden und umstellen.

**Action:** Vor Cut-Over Code-Search über alle Repos: `/meals.*items.*POST` bzw. `amount_g.*food_id` → liste der zu ändernden Files.

### R-23: Rules-Engine `TIER1_MICROS` mit 20 Einträgen vs. neuer Tier-1 mit 15 (MITTEL)

**Evidenz:** `rules-engine/src/nutrition.ts:44-63` hat 20 Mikros als Tier-1:
`calcium, iron, magnesium, phosphorus, potassium, zinc, vitamin_a/d/e/k/c, thiamin, riboflavin, niacin, vitamin_b6, folate, vitamin_b12, selenium, iodine`

Neue Spec (SPEC_01/06 `display_tier=1`, 15 Mikros): **ohne** `selenium`, `iodine`, `folate`, `vitamin_b12`, `copper/manganese` (Tier 2).

**Aber:** In der Legacy-TIER1-Liste sind `folate, vitamin_b12` drin, während sie in der neuen SPEC Tier 2 sind. Das verschiebt, welche Mikros Alerts feuern.

**Business-Entscheidung nötig:** Soll das neue Alert-System strenger (nur 15) oder großzügiger (20) sein? Default-Annahme: SPEC gilt → 15. Rules-Engine Rewrite kriegt neue Liste.

### R-24: Hardcoded RDA-Werte in rules-engine widersprechen SPEC_06 RDA-Tabelle (MITTEL)

**Evidenz:** `rules-engine/src/nutrition.ts:44-63` vs. SPEC_06 §1 RDA-UPDATEs:

| Nutrient | rules-engine RDA (Legacy) | SPEC_06 RDA (male/female) | Abweichung |
|---|---|---|---|
| `magnesium_mg` | 420 | 350 / 300 | Legacy überschätzt |
| `potassium_mg` | 4700 | 4000 / 4000 | Legacy überschätzt |
| `vitamin_d_ug` | 15 | 20 / 20 | Legacy unterschätzt |
| `vitamin_k_ug` | 120 | 70 / 60 | Legacy überschätzt |
| `thiamin_mg` | 1.2 | 1.3 / 1.0 | minimal |
| `niacin_mg` | 16 | 16 / 13 | ok (male-value) |
| `folate_ug` | 400 | 320 / 300 | Legacy überschätzt |
| `vitamin_b12_ug` | 2.4 | 4.0 / 4.0 | Legacy unterschätzt! |
| `selenium_ug` | 55 | — (siehe R-10) | — |

**Quelle der Differenzen:** Legacy nutzt US-RDA, SPEC nutzt DACH-Referenzwerte. **Bei Umstellung werden viele bisherige "ok"-User plötzlich Defizit-Alerts bekommen oder umgekehrt.** User-Kommunikation nötig.

### R-25: `food_source` Ghost-Item-Spur in Legacy API-Handler (LOW)

**Evidenz:** Legacy `src/modules/nutrition/api/handlers.ts:21-30` ist In-Memory-Mock, nicht produktiv. Der **echte** Backend-Code liegt hinter `apps/app/shared/lib/api-shim` und ist außerhalb der gelesenen Scope. Die exakte Server-seitige Snapshot-Berechnungslogik (die, die beim `POST /meals/:id/items` die 34 Nutrient-Spalten + optional JSONB befüllt) ist **nicht im aktuellen File-Scan sichtbar**.

**Bewertung:** Für die Migration reicht die SQL-Spec-Ebene. Für den **Server-Rewrite** muss aber `apps/app/shared/lib/api-shim` bzw. der Hono-Backend-Code dahinter (vermutlich in `apps/app/server/routes/nutrition/**`) gefunden und umgestellt werden. Nicht Teil dieser Analyse.

---

## C. PRE-MIGRATION AUDIT SQL

Diese Queries **VOR** Phase 0 (§4 Teil 1) ausführen. Jeder Query ≠ 0 Zeilen → Entscheidung nötig.

### C.1 Orphaned references

```sql
-- Orphaned meal_items with food_source='bls' but no matching food
-- (Risiko: R-02 aus Teil 1)
SELECT mi.id, mi.meal_id, mi.food_id, mi.food_name, m.user_id
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_source = 'bls'
  AND mi.food_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.foods f WHERE f.id = mi.food_id);

-- Orphaned meal_items with food_source='custom' but no matching custom food
SELECT mi.id, mi.meal_id, mi.food_id, mi.food_name, m.user_id
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_source = 'custom'
  AND mi.food_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM nutrition.foods_custom fc WHERE fc.id = mi.food_id);

-- Ghost MealItems — kein food_id (→ R-21)
SELECT mi.id, mi.meal_id, mi.food_source, mi.food_name, m.user_id, m.date, mi.kcal, mi.protein_g
FROM nutrition.meal_items mi
JOIN nutrition.meals m ON m.id = mi.meal_id
WHERE mi.food_id IS NULL;

-- Meals without any items (leere Meals — droppen oder migrieren?)
SELECT m.id, m.user_id, m.date, m.meal_type, m.created_at
FROM nutrition.meals m
WHERE NOT EXISTS (SELECT 1 FROM nutrition.meal_items mi WHERE mi.meal_id = m.id);
```

### C.2 meal_plan_items integrity (R-07)

```sql
-- Rows die 0 oder mehrere FK-Felder gefüllt haben — new CHECK constraint würde brechen
SELECT id, day_id, meal_type, food_id, custom_food_id, recipe_id, name
FROM public.meal_plan_items
WHERE (food_id IS NOT NULL)::int
    + (custom_food_id IS NOT NULL)::int
    + (recipe_id IS NOT NULL)::int
    != 1;
```

### C.3 food_preferences JSONB structures (R-09)

```sql
-- liked_foods + disliked_foods Samples: Schema inspizieren
SELECT user_id,
       jsonb_pretty(liked_foods)     AS liked_sample,
       jsonb_pretty(disliked_foods)  AS disliked_sample,
       jsonb_pretty(food_ratings)    AS ratings_sample
FROM public.user_food_preferences
WHERE liked_foods    != '[]'::jsonb
   OR disliked_foods != '[]'::jsonb
   OR food_ratings   != '{}'::jsonb
LIMIT 5;

-- Welche Keys existieren in food_ratings?
SELECT DISTINCT jsonb_object_keys(food_ratings) AS ratings_key
FROM public.user_food_preferences
WHERE food_ratings IS NOT NULL AND food_ratings != '{}'::jsonb;
```

### C.4 Hardcoded Dev-UUID Audit (R-03)

```sql
-- Wie viele Rows hängen am Dev-User? Pro Tabelle zählen.
WITH dev AS (SELECT '00000000-0000-0000-0000-000000000001'::uuid AS uid)
SELECT 'meals'            AS tbl, COUNT(*) AS dev_rows FROM nutrition.meals            , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'foods_custom'      , COUNT(*)     FROM nutrition.foods_custom       , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'nutrition_targets' , COUNT(*)     FROM nutrition.nutrition_targets  , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'water_logs'        , COUNT(*)     FROM nutrition.water_logs         , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'weight_logs'       , COUNT(*)     FROM nutrition.weight_logs        , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'recipes'           , COUNT(*)     FROM public.recipes               , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'meal_plans'        , COUNT(*)     FROM public.meal_plans            , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'food_favorites'    , COUNT(*)     FROM public.food_favorites        , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'user_nutrition_goals', COUNT(*)   FROM public.user_nutrition_goals  , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'tdee_history'      , COUNT(*)     FROM public.tdee_history          , dev WHERE user_id = dev.uid
UNION ALL
SELECT 'user_food_preferences', COUNT(*)  FROM public.user_food_preferences , dev WHERE user_id = dev.uid;

-- Orphan-User-IDs: user_id in Nutrition-Tabellen, aber nicht in auth.users
SELECT DISTINCT mi.user_id FROM nutrition.meals mi
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = mi.user_id);
```

### C.5 Schema-Zustand verifizieren

```sql
-- Prüfen: ist daily_nutrition_aggregates Tabelle oder VIEW? (vs. 071 Migration)
SELECT schemaname, tablename  FROM pg_tables WHERE tablename = 'daily_nutrition_aggregates';
SELECT schemaname, viewname   FROM pg_views  WHERE viewname = 'daily_nutrition_summary';

-- Prüfen: liegen Tabellen in nutrition oder public? (nach 071 sollten sie in nutrition sein)
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename IN ('foods','foods_custom','foods_portions','meals','meal_items',
                    'nutrition_targets','nutrition_micro_flags','water_logs','weight_logs')
ORDER BY tablename;

-- Prüfen: ist die Double-Migration 071 + 20250322030003 ein Problem? (R-13)
SELECT * FROM supabase_migrations.schema_migrations
WHERE name ILIKE '%nutrition_schema_split%'
ORDER BY version;
```

### C.6 Unit-Check: werte sanitäts-prüfen (R-01)

```sql
-- Foods mit unplausiblen Mikro-Werten (Typ-Check vor Unit-Conversion)
SELECT bls_code, name_de, copper_mg, manganese_mg, vitamin_b6_mg
FROM nutrition.foods
WHERE copper_mg       > 100   -- Kupfer in mg > 100 unplausibel → Spalte hat evtl schon µg-Werte?
   OR manganese_mg    > 100
   OR vitamin_b6_mg   > 100
LIMIT 20;

-- Meal_items: unplausible Werte, die auf doppelte Conversion hindeuten würden
SELECT id, food_name, amount_g, copper_mg, manganese_mg, vitamin_b6_mg
FROM nutrition.meal_items
WHERE copper_mg > 1000 OR manganese_mg > 1000 OR vitamin_b6_mg > 1000
LIMIT 20;
```

Falls hier Werte > 100 mg auftreten → Spalten sind bereits in µg (trotz `_mg` Suffix). Dann **keine** ×1000-Conversion machen! Vor Phase 2 zwingend prüfen.

### C.7 Diskrepanzen Food-Snapshots vs. Food-DB (Sanity-Check)

```sql
-- meal_items Snapshot entspricht NICHT food × amount/100 — wie groß ist die Abweichung?
-- (hilft zu beurteilen, wie verlässlich Snapshots waren)
SELECT
  mi.id,
  mi.food_name,
  mi.amount_g,
  mi.kcal    AS snapshot_kcal,
  ROUND(f.kcal * mi.amount_g / 100.0, 2) AS recalc_kcal,
  ROUND(mi.kcal - f.kcal * mi.amount_g / 100.0, 2) AS diff_kcal
FROM nutrition.meal_items mi
JOIN nutrition.foods f ON f.id = mi.food_id
WHERE mi.food_source = 'bls'
  AND f.kcal IS NOT NULL
  AND ABS(mi.kcal - f.kcal * mi.amount_g / 100.0) > 5   -- more than 5 kcal drift
ORDER BY diff_kcal DESC
LIMIT 50;
```

Ergebnis: wenn sehr viele Rows → Snapshots sind konsistent mit **alter** Food-DB (vor BLS-Update) oder Kalkulations-Bug. Entscheidung: Snapshots sind historisch korrekt (Speicherprinzip) → **immer behalten**, nicht neu berechnen.

---

## D. SPEC-GAPS — notwendige Ergänzungen zu SPEC_06

Vor Migration diese **4 Patches** in SPEC_06 einarbeiten:

### D.1 `nutrient_defs` — SE (Selen) ergänzen

```sql
INSERT INTO nutrition.nutrient_defs
  (code, name_de, name_en, unit, group_de, group_en, sort_index, display_tier,
   is_always_computed, is_partly_computed, formula)
VALUES
  ('SE','Selen','Selenium','µg','Elemente','Elements', 50, 2, false, false, NULL);

UPDATE nutrition.nutrient_defs SET rda_male=70, rda_female=60, rda_unit='µg' WHERE code='SE';
```

Sort-Index 50 ist der DACH-Wert zwischen `ID` (50→51 verschieben) und `CU`; alternativ freier Slot.

### D.2 `foods_portions` DDL — fehlt komplett in SPEC_06

```sql
CREATE TABLE nutrition.foods_portions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id     UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  name_de     TEXT NOT NULL,
  name_en     TEXT,
  name_th     TEXT,
  amount_g    NUMERIC(8,2) NOT NULL,
  is_default  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_portions_food         ON nutrition.foods_portions(food_id);
CREATE INDEX idx_portions_default      ON nutrition.foods_portions(food_id, is_default) WHERE is_default = true;

ALTER TABLE nutrition.foods_portions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_portions_select" ON nutrition.foods_portions FOR SELECT USING (true);
GRANT SELECT ON nutrition.foods_portions TO authenticated;
```

### D.3 `shopping_lists` + `shopping_list_items` DDL

```sql
CREATE TABLE nutrition.shopping_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  name        TEXT NOT NULL,
  recipe_id   UUID REFERENCES nutrition.recipes(id) ON DELETE SET NULL,
  servings    NUMERIC(6,2) DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_shopping_lists_user ON nutrition.shopping_lists(user_id);

ALTER TABLE nutrition.shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_lists_owner" ON nutrition.shopping_lists
  USING (auth.uid()::text = user_id::text);

CREATE TABLE nutrition.shopping_list_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id  UUID NOT NULL REFERENCES nutrition.shopping_lists(id) ON DELETE CASCADE,
  food_id           UUID REFERENCES nutrition.foods(id),
  custom_food_id    UUID REFERENCES nutrition.foods_custom(id),
  food_name         TEXT NOT NULL,
  amount_g          NUMERIC(10,2) NOT NULL,
  unit_display      TEXT,
  is_checked        BOOLEAN DEFAULT false,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT exactly_one_ref CHECK (
    (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int <= 1
  )
);
CREATE INDEX idx_shopping_list_items_list ON nutrition.shopping_list_items(shopping_list_id);

ALTER TABLE nutrition.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_list_items_owner" ON nutrition.shopping_list_items
  USING (EXISTS (
    SELECT 1 FROM nutrition.shopping_lists sl
    WHERE sl.id = shopping_list_items.shopping_list_id
      AND auth.uid()::text = sl.user_id::text
  ));
```

### D.4 `user_settings` DDL ergänzen

```sql
CREATE TABLE nutrition.user_settings (
  user_id        UUID NOT NULL,
  setting_key    TEXT NOT NULL,
  setting_value  JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, setting_key)
);

ALTER TABLE nutrition.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_owner" ON nutrition.user_settings
  USING (auth.uid()::text = user_id::text);
```

### D.5 `meal_items.food_source` CHECK anpassen (R-21)

Alternative A (bevorzugt): Ghost-Items erlauben.

```sql
-- Statt:
-- food_source TEXT NOT NULL CHECK (food_source IN ('bls','custom','mealcam'))
-- Nutze:
ALTER TABLE nutrition.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_food_source_check;

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_food_source_check
  CHECK (food_source IN ('bls','custom','mealcam','manual'));

ALTER TABLE nutrition.meal_items
  ADD CONSTRAINT meal_items_food_ref_consistency CHECK (
    (food_source = 'bls'     AND food_id IS NOT NULL AND custom_food_id IS NULL) OR
    (food_source = 'custom'  AND food_id IS NULL     AND custom_food_id IS NOT NULL) OR
    (food_source IN ('mealcam','manual') AND food_id IS NULL AND custom_food_id IS NULL)
  );
```

Diese 5 Patches sind Voraussetzung dafür, dass der Migrationsplan aus Teil 1 sauber durchläuft.

---

## E. CODE-SIDE MIGRATION (über DB hinaus)

Diese Änderungen sind **zwingend** synchron mit der DB-Migration, sonst brechen Features:

### E.1 `packages/rules-engine/src/nutrition.ts` — Full Rewrite

Neue Version muss:

- Nicht mehr `NutritionTarget.calcium_mg` etc. erwarten. Stattdessen:
  - Targets-Parameter: `{ calorie_target, protein_target, carbs_target, fat_target, fiber_target, water_target }` (Makros only)
  - Micros-RDA: aus `nutrient_defs.rda_male` / `rda_female` lesen via separatem `rdaMap: Record<BlsCode, number>`-Parameter
- `dailyTotals` Parameter-Interface umstellen auf BLS-Code-Keys: `{ ENERCC, PROT625, CHO, FAT, FIBT, VITD, VITA, FE, CA, MG, ... }`
- `TIER1_MICROS`-Liste auf 15 Einträge reduzieren (gemäß SPEC `MICRO_TIER1_NUTRIENTS`)
- `TIER2_MICROS`-Liste neu hinzufügen für User mit `micro_tier = 'tier2'`

### E.2 `packages/scoring/src/nutrition.ts` — Keine Änderung nötig

Die Scoring-Formel ist Schema-agnostisch (nimmt nur `Macros`-Objekt). Bleibt wie es ist.

### E.3 `packages/contracts/src/nutrition/` — komplett neu

Alle 6 Contract-Files müssen neue Schema-Wahrheit widerspiegeln:
- `food.ts`: `Food` mit `name_display`, `category_id`, `sort_weight`, BLS-Code-Namen statt Legacy-Namen. Neue Types `NutrientDef`, `FoodCategory`, `FoodNutrient`, `FoodTag`, `FoodAlias`.
- `meal.ts`: `MealItem.nutrients: Record<string, number>` + direkte BLS-Code-Spalten.
- `tracking.ts`: `NutritionTarget` massiv abspecken (nur Makros + Water + Phase), `WeightLog` entfernen (wandert zu Goals).
- `aggregates.ts`: Aggregate-Types passen zum neuen VIEW.
- `scoring.ts`: behält `LEVEL_MULTIPLIER`, `UserLevel`.
- **Neu:** `preferences.ts` für `FoodPreference` + `FoodPreferenceItem`.

### E.4 Alle Hooks/Queries im Frontend

Globale Find/Replace-Operation auf:

| Alt | Neu |
|---|---|
| `food.kcal` / `food.protein_g` / `food.fat_g` / `food.carbs_g` etc. | `food.enercc` / `food.prot625` / `food.fat` / `food.cho` |
| `food.fiber_g` / `food.sugar_g` / `food.salt_g` | `food.fibt` / `food.sugar` / `food.nacl` |
| `target.kcal_target` etc. | `target.calorie_target` (die neuen Namen) |
| `summary.totals.{macro}` direkt | `summary.macros.total_{macro}` |
| `summary.totals.vitamin_d` etc. | `summary.micros.VITD` etc. |

**Betroffene Files (aus Scan):** alle `src/modules/nutrition/queries/*.ts`, alle `src/modules/nutrition/hooks/*.ts`, alle `src/modules/nutrition/components/*.tsx` plus `apps/web/src/lib/nutrition/*.ts` (aus dem lumeos-app Repo). **Hunderte Stellen.**

Empfehlung: **Adapter-Layer** zwischen API und Frontend als Zwischenschritt, der Legacy-Namen in neue übersetzt. Erlaubt graduelle Migration der Components.

### E.5 `DEV_USER_ID` entfernen

Hardcoded in:
- `src/modules/nutrition/hooks/useFoodLog.ts:44`
- `src/modules/nutrition/hooks/useMealConfirm.ts:12`
- `src/modules/nutrition/hooks/useDailyTotals.ts:74`
- (und wahrscheinlich viele weitere — Find/Replace über ganzes Repo)

Muss ersetzt werden durch `userId` aus JWT-Context / Auth-Hook.

---

## F. ZUSAMMENFASSUNG Teil 1+2

### Was bleibt aus Teil 1

- 6-Block-Struktur vollständig.
- 20 Risiken dokumentiert (R-01 bis R-20).
- Komplettes Field-Mapping Legacy → Neu.
- 9-Phasen Blue/Green-Plan.

### Was Teil 2 ergänzt

- **5 von 8 offenen UNKNOWNs geklärt** (R-04, R-08, R-10, R-11, R-12, R-18) — plus R-05 und R-07 bestätigt bleiben wie vorgeschlagen.
- **5 neue Risiken entdeckt** (R-21 Ghost-Items SPEC-Inkonsistenz, R-22 API Breaking Change, R-23 Tier-1-Semantik, R-24 RDA-Werte-Shift DACH vs US, R-25 Server-Backend-Location unbekannt).
- **7 Pre-Migration Audit-Queries** ready-to-run.
- **5 SPEC-Gaps** mit konkreten DDL-Patches.
- **Code-Side Migration Plan** (rules-engine Rewrite, Contracts Full-Rewrite, Frontend Adapter-Layer, DEV_USER_ID Cleanup).

### Blocker für den Start der eigentlichen Daten-Migration

1. **D.1–D.5 SPEC-Patches müssen eingearbeitet sein** (Selen, Portions, Shopping Lists, Settings, Ghost-Items).
2. **C.1–C.7 Audit-Queries müssen gelaufen sein** — Ergebnisse bestimmen, ob Phase 4 oder Phase 6 Nachbearbeitung braucht.
3. **Goals-Modul-Kontrakt für weight_logs + user_nutrition_goals-Export** muss stehen.
4. **Server-Backend-Location** finden: wo ist die eigentliche Hono-Implementierung? Ohne die kann der API-Layer nicht umgestellt werden.
5. **R-01 Unit-Sanity-Check** (C.6-Query) zwingend durchlaufen **vor** jeder Unit-Conversion-Migration.

### Offene Business-Entscheidungen

| # | Entscheidung | Optionen |
|---|---|---|
| 1 | Tier-1-Mikros: 15 oder 20? | SPEC sagt 15; Legacy rules-engine hat 20 |
| 2 | RDA-Werte: DACH oder US? | SPEC sagt DACH; impliziert User-weites Re-Alert-Event |
| 3 | Ghost-Items: erlauben oder droppen? | §D.5 empfiehlt erlauben |
| 4 | Historische `nutrition_targets`: verwerfen oder rekonstruieren? | §3.6 Teil 1: verwerfen (kein Backfill möglich) |
| 5 | `food_favorites` migrieren oder verwerfen? | §A: migrieren zu `food_preference_items` |
| 6 | `foods_custom.allergens`: verwerfen oder behalten? | SPEC hat kein Feld; Teil 1 §3.3: verwerfen |
| 7 | API v1 parallel behalten während v2 einführen? | Empfehlung: Adapter-Layer statt Dual-API |

Bei Klärung dieser 7 Punkte ist die Migration spezifikations-komplett und Phase 0 kann starten.
