# Nutrition Module — Core Entities

> Spec Phase 2 | Core Entities & Datenmodell

---

## Entity-Übersicht

```
STAMMDATEN (BLS / System)        USER DATA
────────────────────────         ────────────────────────────────────
NutrientDef (138 BLS-Codes)      Meal
FoodCategory (4-Ebenen-Baum)       └── MealItem ──→ Food | CustomFood
Food (BLS 4.0, 7.140 Einträge)
  └── FoodNutrient (EAV, ~570K)   Recipe
  └── FoodTag (auto-generiert)       └── RecipeItem ──→ Food
  └── FoodAlias (DE/EN/TH)          └── ShoppingList
CustomFood (pro User)                    └── ShoppingListItem

FoodCategory                     MealPlan (source: user|coach|marketplace|buddy)
TagDefinition                       └── MealPlanDay
                                        └── MealPlanItem ──→ Food|CustomFood|Recipe
                                    └── MealPlanLog

                                 WaterLog
                                 FoodPreference
                                 FoodPreferenceItem (liked/disliked)
                                 NutritionTarget    (gecacht von Goals)
                                 DailyNutritionSummary  (VIEW)
                                 MicroFlag
```

---

## Allgemeine Regeln

**Sprachen:** Alle User-sichtbaren Texte: `name_de`, `name_en`, `name_th`. TH initial NULL — kein Pflichtfeld auf DB-Ebene.

**Datenquelle:** Einzige Core-Food-Quelle ist BLS 4.0.

**Snapshot-Prinzip:** Nährstoffe werden beim Erstellen von MealItems berechnet und eingefroren.

---

## 1. NutrientDef

138 BLS-Nährstoff-Definitionen. Einmalig beim Import befüllt, danach read-only.

```
code                TEXT PK          BLS-Code (z.B. ENERCC, PROT625, VITD)
name_de             TEXT NOT NULL    Deutscher BLS-Name
name_en             TEXT NOT NULL    Englischer BLS-Name
unit                TEXT NOT NULL    kcal | kJ | g | mg | µg
group_de            TEXT NOT NULL    Energie | Makronährstoffe | Vitamine | etc.
group_en            TEXT NOT NULL
sort_index          INTEGER          Reihenfolge gemäss BLS-Dokumentation (1-138)
display_tier        INTEGER          1 = immer | 2 = Athlet | 3 = Wissenschaftlich
is_always_computed  BOOLEAN          Immer aus Formel berechnet (z.B. ENERCC, CHO)
is_partly_computed  BOOLEAN          Nur wenn Einzelwerte vorhanden (z.B. FIBT)
formula             TEXT             Berechnungsformel (z.B. "PROT625*4 + FAT*9 + ...")
rda_male            NUMERIC(10,3)    DACH-Referenzwert Männer
rda_female          NUMERIC(10,3)    DACH-Referenzwert Frauen
rda_unit            TEXT             Einheit des RDA-Werts
```

---

## 2. FoodCategory

Kategorie-Baum für den Human Layer. 4 Ebenen, unbegrenzte Tiefe via parent_id.

```
id          UUID PK
slug        TEXT UNIQUE         z.B. 'meat_poultry', 'beef', 'beef_steaks'
name_de     TEXT NOT NULL
name_en     TEXT NOT NULL
name_th     TEXT
parent_id   UUID FK → self      NULL = Level 1 (Hauptkategorie)
level       INTEGER             1 | 2 | 3 | 4
icon        TEXT                Emoji
sort_order  INTEGER
bls_hint    TEXT                Hinweis auf BLS-Code-Pattern für Import-Mapping
```

---

## 3. Food

BLS 4.0 Core-Food-Datenbank. 7.140 Einträge. Read-only für User-Module.

```
id                UUID PK
bls_code          TEXT UNIQUE NOT NULL    BLS-Schlüssel (z.B. C133000)
name_de           TEXT NOT NULL           BLS-Originalname (wissenschaftlich)
name_en           TEXT                    BLS-Originalname EN

-- Human Layer (beim Import generiert)
name_display      TEXT                    User-freundlicher Anzeigename DE
name_display_en   TEXT                    User-freundlicher Anzeigename EN
name_display_th   TEXT                    User-freundlicher Anzeigename TH (später)
category_id       UUID FK → FoodCategory  Tiefste zutreffende Kategorie
sort_weight       INTEGER (0-1000)        Relevanz-Gewicht für Suchreihenfolge
processing_level  TEXT                    raw | minimally_processed | processed |
                                          ultra_processed | cooked | fermented |
                                          smoked | dried | canned | fortified
is_prepared_dish  BOOLEAN DEFAULT false   X/Y Kategorie (Fertiggerichte)

-- Schnell-Makros (direkte Spalten für Search + schnelle Aggregation)
enercc    NUMERIC(8,2)    kcal/100g
enercj    NUMERIC(8,2)    kJ/100g
water_g   NUMERIC(8,3)
prot625   NUMERIC(8,3)    Protein g/100g
fat       NUMERIC(8,3)    Fett g/100g
cho       NUMERIC(8,3)    Kohlenhydrate g/100g (verfügbar)
fibt      NUMERIC(8,3)    Ballaststoffe g/100g (gesamt)
sugar     NUMERIC(8,3)    Zucker g/100g (gesamt)
fasat     NUMERIC(8,3)    Gesättigte Fettsäuren g/100g
nacl      NUMERIC(8,3)    Salz g/100g
alc       NUMERIC(8,3)    Alkohol g/100g

created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

---

## 4. FoodNutrient

Alle 138 BLS-Nährstoffe als EAV. Nur Zeilen für vorhandene Werte (kein NULL-Spam).

```
food_id         UUID FK → Food CASCADE    } PK
nutrient_code   TEXT FK → NutrientDef     }
value           NUMERIC(12,5) NOT NULL
data_source     TEXT NOT NULL
  -- BLS data_source Werte:
  -- Analyse | Rezeptberechnung | Musterberechnung | Literatur | Aggregation
  -- Labelangabe | Naehrstoffdatenbank | Uebernommener Wert | Reskalierung
  -- Logische Null | Logische Annahme | Spuren | Formelberechnung
```

**Import-Regeln:**

- `-` (Fehlender Wert) → kein Eintrag
- `0` + "Logische Null" → Eintrag mit value=0
- `<LOQ` → kein Eintrag (unter Nachweisgrenze)
- Numerisch → Eintrag mit entsprechendem data_source

---

## 5. TagDefinition + FoodTag

Semantische Klassifikation von Foods.

```
-- tag_definitions
code                    TEXT PK
name_de                 TEXT NOT NULL
name_en                 TEXT NOT NULL
tag_type                TEXT NOT NULL    ingredient | diet | allergen | fitness | gym | processing
is_exclusion_relevant   BOOLEAN          Für Diät-Ausschlüsse nutzbar
icon                    TEXT             Emoji
sort_order              INTEGER
requires_macro_check    BOOLEAN
macro_rule              JSONB            {"field":"prot625","op":">=","value":20}

-- food_tags
food_id     UUID FK → Food CASCADE  } PK
tag_code    TEXT FK → TagDefinition }
confidence  NUMERIC(3,2)            1.0 = BLS-sicher | 0.9 = Heuristik | 0.7 = Default
```

**Auto-generiert:** Trigger `trg_foods_auto_tag` setzt alle Tags bei INSERT/UPDATE von `bls_code`, `name_de`, `prot625`, `fat`, `cho`, `fibt`, `enercc`.

---

## 6. FoodAlias

Such-Synonyme pro Food und Sprache.

```
food_id   UUID FK → Food CASCADE  } PK
alias     TEXT NOT NULL           }
locale    TEXT DEFAULT 'de'       } PK  (de | en | th)
source    TEXT                    editorial | ai_generated
```

---

## 7. CustomFood

User-erstellte Lebensmittel. **Vollständig getrennt von BLS-Daten**.Kein Merge mit `foods`-Tabelle.

```
id              UUID PK
user_id         UUID NOT NULL
name_de         TEXT NOT NULL
name_en         TEXT
name_th         TEXT
brand           TEXT
barcode         TEXT                EAN / UPC
serving_size_g  NUMERIC DEFAULT 100
serving_name    TEXT                z.B. "1 Riegel"
source          TEXT DEFAULT 'user' user | mealcam

-- Pflicht: Makros
enercc    NUMERIC(8,2) NOT NULL
prot625   NUMERIC(8,3) NOT NULL
fat       NUMERIC(8,3) NOT NULL
cho       NUMERIC(8,3) NOT NULL

-- Optional: weitere Makros
fibt      NUMERIC(8,3)   sugar  NUMERIC(8,3)
fasat     NUMERIC(8,3)   nacl   NUMERIC(8,3)
water_g   NUMERIC(8,3)   alc    NUMERIC(8,3)

-- Optional: Mikros (Subset, was User kennt)
vita_ug   vitd_ug   vite_mg   vitk_ug   vitc_mg
thia_mg   ribf_mg   nia_mg    vitb6_ug  fol_ug   vitb12_ug
na_mg     k_mg      ca_mg     mg_mg     p_mg
fe_mg     zn_mg     id_ug     cu_ug     mn_ug

created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

---

## 8. Meal

Container für eine Mahlzeit an einem Tag.

```
id          UUID PK
user_id     UUID NOT NULL
date        DATE NOT NULL
meal_type   TEXT NOT NULL
  breakfast | lunch | dinner | snack | pre_workout | post_workout | other
notes       TEXT
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

---

## 9. MealItem

Ein Food-Eintrag innerhalb einer Mahlzeit. **Alle Makros UND alle vorhandenen Mikros werden eingefroren.**

```
id              UUID PK
meal_id         UUID FK → Meal CASCADE DELETE
food_id         UUID                     Referenz (BLS Food)
custom_food_id  UUID FK → CustomFood     Referenz (Custom Food)
food_source     TEXT NOT NULL            bls | custom | mealcam
food_name       TEXT NOT NULL            Denormalisiert (bleibt korrekt auch wenn Food gelöscht)
amount_g        NUMERIC(8,2) NOT NULL

-- DIREKTE MAKRO-SPALTEN (für Daily Summary Performance)
-- Berechnung: food.nutrient × (amount_g / 100)
enercc    NUMERIC(8,2)    prot625  NUMERIC(8,3)
fat       NUMERIC(8,3)    cho      NUMERIC(8,3)
fibt      NUMERIC(8,3)    sugar    NUMERIC(8,3)
fasat     NUMERIC(8,3)    nacl     NUMERIC(8,3)
water_g   NUMERIC(8,3)    alc      NUMERIC(8,3)

-- VOLLSTÄNDIGER NÄHRSTOFF-SNAPSHOT (alle non-null Nährstoffe eingefroren)
-- Format: {"ENERCC": 343.0, "PROT625": 11.4, "VITD": 0.0, "FE": 5.16, ...}
-- Alle 138 BLS-Codes die für dieses Food existieren → skaliert auf amount_g
-- Basis für: Mikro-Dashboard, Nährstoff-Berichte, Trend-Analysen, MedicalModule
nutrients       JSONB NOT NULL DEFAULT '{}'

created_at      TIMESTAMPTZ
```

**Berechnung bei Eintrag:**

```
1. Lade alle FoodNutrients für food_id (EAV-Query)
2. Für jeden Nährstoff: item_value = food_value × (amount_g / 100.0)
3. Direkte Spalten: enercc, prot625, fat, cho, ... direkt füllen
4. nutrients JSONB: {"CODE": item_value, ...} für ALLE vorhandenen Nährstoffe
5. Einfrieren → kein nachträgliches Update
```

---

## 10. Recipe

Wiederverwendbare Mahlzeit-Vorlage mit Nährstoff-Kalkulation. Aus Rezepten können Einkaufslisten generiert werden.

```
id              UUID PK
user_id         UUID NOT NULL
name            TEXT NOT NULL
name_en         TEXT
name_th         TEXT
description     TEXT
servings        NUMERIC(6,2) NOT NULL DEFAULT 1
prep_time_min   INTEGER
cook_time_min   INTEGER
instructions    TEXT
tags            TEXT[]
is_favorite     BOOLEAN DEFAULT false
is_public       BOOLEAN DEFAULT false

-- Herkunft
source          TEXT NOT NULL DEFAULT 'user'
                  user | coach | marketplace

-- Pre-computed Totals (auto-update via Trigger)
total_weight_g  NUMERIC(10,2) DEFAULT 0
total_enercc    NUMERIC(10,2) DEFAULT 0
total_prot625   NUMERIC(10,3) DEFAULT 0
total_fat       NUMERIC(10,3) DEFAULT 0
total_cho       NUMERIC(10,3) DEFAULT 0
total_fibt      NUMERIC(10,3) DEFAULT 0
total_sugar     NUMERIC(10,3) DEFAULT 0

-- Generated Columns: pro Portion
serving_weight_g   GENERATED AS total_weight_g / NULLIF(servings, 0)
serving_enercc     GENERATED AS total_enercc   / NULLIF(servings, 0)
serving_prot625    GENERATED AS total_prot625  / NULLIF(servings, 0)
serving_fat        GENERATED AS total_fat      / NULLIF(servings, 0)
serving_cho        GENERATED AS total_cho      / NULLIF(servings, 0)

created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

---

## 11. RecipeItem

Zutat innerhalb eines Rezepts. Nährstoffe ebenfalls eingefroren.

```
id          UUID PK
recipe_id   UUID FK → Recipe CASCADE
food_id     UUID FK → Food RESTRICT
amount_g    NUMERIC(10,2) NOT NULL
enercc      NUMERIC(10,2)   prot625  NUMERIC(10,3)
fat         NUMERIC(10,3)   cho      NUMERIC(10,3)
fibt        NUMERIC(10,3)   sugar    NUMERIC(10,3)
sort_order  INTEGER DEFAULT 0
created_at  TIMESTAMPTZ
```

**Trigger:** `trg_recipe_items_recalculate` → aktualisiert `Recipe.total_*` bei Item-Änderungen.

---

## 12. ShoppingList

Einkaufsliste generiert aus einem Rezept oder einer Sammlung von Rezepten.

```
id          UUID PK
user_id     UUID NOT NULL
name        TEXT NOT NULL
recipe_id   UUID FK → Recipe    (null wenn manuell oder aus mehreren Rezepten)
servings    NUMERIC(6,2) DEFAULT 1    Wie viele Portionen eingekauft werden sollen
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

---

## 13. ShoppingListItem

Eine Position in der Einkaufsliste.

```
id                UUID PK
shopping_list_id  UUID FK → ShoppingList CASCADE
food_id           UUID FK → Food
custom_food_id    UUID FK → CustomFood
food_name         TEXT NOT NULL           Denormalisiert
amount_g          NUMERIC(10,2) NOT NULL
unit_display      TEXT                    "g" | "ml" | "Stück" | "EL" etc.
is_checked        BOOLEAN DEFAULT false   User hat Item abgehakt
sort_order        INTEGER DEFAULT 0
```

**Generierung:** `POST /api/nutrition/recipes/:id/shopping-list`Erstellt ShoppingList + ShoppingListItems aus RecipeItems, skaliert auf gewünschte Portionen.

---

## 14. MealPlan

Universeller gespeicherter Essensplan.

```
id              UUID PK
user_id         UUID NOT NULL
name            TEXT NOT NULL
description     TEXT

days_count      INTEGER NOT NULL DEFAULT 7
target_kcal     INTEGER
target_protein  INTEGER
target_carbs    INTEGER
target_fat      INTEGER

-- Herkunft
source          TEXT NOT NULL DEFAULT 'user'
                  user | coach | marketplace | buddy
source_ref_id   UUID    coach_id oder marketplace_product_id (null bei 'user'/'buddy')

-- Lifecycle
lifecycle_type  TEXT NOT NULL DEFAULT 'once'
                  once       → endet nach days_count Tagen
                  rollover   → wiederholt sich automatisch
                  sequence   → gefolgt von next_plan_id
next_plan_id    UUID FK → MealPlan    nur bei lifecycle_type = 'sequence'
rollover_count  INTEGER DEFAULT 0    Zähler wie oft gerollt

-- Status
status          TEXT NOT NULL DEFAULT 'assigned'
                  assigned | active | completed | paused | archived
start_date      DATE          Gesetzt beim Aktivieren
end_date        DATE          Berechnet: start_date + days_count - 1
activated_at    TIMESTAMPTZ

created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Lifecycle-Regeln:**

- `once`: endet nach days_count Tagen → `status: completed`
- `rollover`: nach days_count Tagen → start_date + days_count, rollover_count++, bleibt `active`
- `sequence`: nach Ablauf → dieser Plan `completed`, next_plan_id wird `active`

**Buddy als Ersteller:** `source: 'buddy'` — identisches Schema, User muss trotzdem aktivieren.

---

## 15. MealPlanDay + MealPlanItem

```
-- MealPlanDay
id          UUID PK
plan_id     UUID FK → MealPlan CASCADE
day_number  INTEGER NOT NULL
name        TEXT          "Montag" | "Training Day" | "Rest Day"
UNIQUE (plan_id, day_number)

-- MealPlanItem
id              UUID PK
day_id          UUID FK → MealPlanDay CASCADE
meal_type       TEXT NOT NULL
  breakfast | lunch | dinner | snack | pre_workout | post_workout | other
food_id         UUID FK → Food          (nullable)
custom_food_id  UUID FK → CustomFood    (nullable)
recipe_id       UUID FK → Recipe        (nullable)
name            TEXT NOT NULL           Denormalisiert
amount_g        NUMERIC DEFAULT 100
enercc          NUMERIC   prot625  NUMERIC
cho             NUMERIC   fat      NUMERIC
sort_order      INTEGER DEFAULT 0
CONSTRAINT exactly_one_source CHECK (
  (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int + (recipe_id IS NOT NULL)::int = 1
)
```

---

## 16. MealPlanLog

Protokolliert Ausführung jedes Plan-Items. Basis für Compliance-Tracking.

```
id              UUID PK
plan_id         UUID FK → MealPlan CASCADE
plan_item_id    UUID FK → MealPlanItem CASCADE
user_id         UUID NOT NULL
execution_date  DATE NOT NULL
status          TEXT NOT NULL DEFAULT 'pending'
                  pending | confirmed | skipped | deviated
actual_meal_id  UUID FK → Meal    (null wenn skipped)
logged_via      TEXT              mealcam | manual
deviation_kcal  NUMERIC(6,2)      Differenz geplant vs. tatsächlich in kcal
deviation_pct   NUMERIC(5,2)      Abweichung in % (Kalorien-Basis)
confirmed_at    TIMESTAMPTZ
created_at      TIMESTAMPTZ
```

**Status-Regeln:**

- `pending` → kein Timeout, kein automatisches Expiry
- User entscheidet jederzeit — auch retroaktiv für vergangene Tage
- `pending` Items zählen NICHT als Fehler in der Compliance-Berechnung
- Buddy erinnert am nächsten Morgen: "Gestern 2 Mahlzeiten offen — was willst du damit machen?"

**Compliance-Berechnung:**

```
plan_compliance_pct = (confirmed + deviated) / (confirmed + deviated + skipped) × 100
pending Items → "noch offen", zählen nicht in Nenner
```

---

## 17. WaterLog

```
id          UUID PK
user_id     UUID NOT NULL
date        DATE NOT NULL
amount_ml   NUMERIC(8,2) NOT NULL
source      TEXT DEFAULT 'manual'    manual | quick_add
created_at  TIMESTAMPTZ
```

---

## 18. FoodPreference + FoodPreferenceItem

```
-- FoodPreference: Allgemeine Ernährungspräferenzen
user_id             UUID PK
diet_type           TEXT    omnivore | vegetarian | vegan | pescatarian |
                            keto | paleo | mediterranean | carnivore | custom
allergies           TEXT[]
intolerances        TEXT[]
preferred_cuisines  TEXT[]
cooking_skill       TEXT    beginner | intermediate | advanced
prep_time_max_min   INTEGER DEFAULT 30
budget_level        TEXT    low | medium | high | no_limit
updated_at          TIMESTAMPTZ

-- FoodPreferenceItem: Strukturierte Likes/Dislikes auf jeder Ebene
id              UUID PK
user_id         UUID NOT NULL
preference      TEXT NOT NULL    liked | disliked
target_type     TEXT NOT NULL    food | category | tag
food_id         UUID FK → Food              (wenn target_type = 'food')
custom_food_id  UUID FK → CustomFood        (wenn target_type = 'food' + custom)
category_id     UUID FK → FoodCategory      (wenn target_type = 'category')
tag_code        TEXT FK → TagDefinition     (wenn target_type = 'tag')
created_at      TIMESTAMPTZ
CONSTRAINT exactly_one_target CHECK (
  (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int +
  (category_id IS NOT NULL)::int + (tag_code IS NOT NULL)::int = 1
)
```

**Priorität bei Konflikten:** food &gt; category &gt; tag (spezifischeres schlägt allgemeineres)

---

## 19. NutritionTarget

Gecachte Tages-Targets. Täglich von Goals abgerufen und lokal eingefroren.

```
id              UUID PK
user_id         UUID NOT NULL
date            DATE NOT NULL
UNIQUE (user_id, date)

calorie_target  INTEGER NOT NULL
protein_target  INTEGER NOT NULL
carbs_target    INTEGER NOT NULL
fat_target      INTEGER NOT NULL
fiber_target    INTEGER DEFAULT 30
water_target    INTEGER NOT NULL      Von Goals berechnet
goal_phase      TEXT                  bulk | cut | maintain | prep
source          TEXT DEFAULT 'goals'  goals | fallback_calculated
fetched_at      TIMESTAMPTZ
```

---

## 20. DailyNutritionSummary (VIEW)

Aggregierter Tagesüberblick: Meals + MealItems + WaterLogs.

**Makros:** aus direkten Spalten von meal_items (schnell) **Mikros:** aus `nutrients JSONB` von meal_items (flexibel, alle 138 Codes) **Wasser:** aus water_logs

---

## 21. MicroFlag

```
id              UUID PK
user_id         UUID NOT NULL
date            DATE NOT NULL
nutrient_code   TEXT FK → NutrientDef    BLS-Code (z.B. VITD, FE, ZN)
flag_type       TEXT NOT NULL            deficit | surplus
actual_value    NUMERIC(10,4) NOT NULL
target_value    NUMERIC(10,4) NOT NULL
pct_of_target   NUMERIC(6,2) NOT NULL
severity        TEXT NOT NULL            info | warn | critical
created_at      TIMESTAMPTZ
```

**Severity:** deficit: &lt;50% critical | 50–80% warn | 80–100% info · surplus: &gt;200% warn | &gt;300% critical

---

## Schema-Übersicht

```sql
-- Stammdaten (read-only nach Import)
nutrition.nutrient_defs
nutrition.food_categories
nutrition.foods
nutrition.food_nutrients
nutrition.tag_definitions
nutrition.food_tags
nutrition.food_aliases

-- User-Daten
nutrition.foods_custom
nutrition.food_preferences
nutrition.food_preference_items
nutrition.meals
nutrition.meal_items
nutrition.recipes
nutrition.recipe_items
nutrition.shopping_lists
nutrition.shopping_list_items
nutrition.meal_plans
nutrition.meal_plan_days
nutrition.meal_plan_items
nutrition.meal_plan_logs
nutrition.water_logs
nutrition.nutrition_targets
nutrition.micro_flags

-- View
nutrition.daily_nutrition_summary
```
