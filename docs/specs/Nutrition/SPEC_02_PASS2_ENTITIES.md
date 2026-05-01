# SPEC_02 — Pass 2 Entity Ergänzungen
# docs/specs/Nutrition/SPEC_02_PASS2_ENTITIES.md
# Ergänzt SPEC_02_ENTITIES.md um Entities aus den V1-Entscheidungen

> Stand: April 2026 | Pass 2 nach NUTRITION_NEXT_SPEC_DECISIONS.md

---

## Neue Entities (Pass 2)

Die folgenden Entities wurden in SPEC_06_V1_MIGRATION.sql als SQL definiert
und werden hier formal als Entities dokumentiert.

---

## 22. NutrientReferenceValue

RDA/AI/UL Referenzwerte pro Nährstoff, Alter-Range und Geschlecht.
Single Source of Truth für alle Scoring-Bewertungen in Micronutrient Review.

```
nutrient_code   TEXT FK → NutrientDef    BLS-Code (z.B. VITD, FE, ZN)
unit            TEXT                     Einheit (kompatibel mit NutrientDef.unit)
age_min         INTEGER                  Mindestalter (inkl.) — NULL = kein Minimum
age_max         INTEGER                  Maximalalter (inkl.) — NULL = unbegrenzt
sex             TEXT                     male | female | both
is_pregnant     BOOLEAN DEFAULT false    Schema vorbereitet, V1 nicht aktiv
is_lactating    BOOLEAN DEFAULT false    Schema vorbereitet, V1 nicht aktiv

rda             NUMERIC(12,4)            Recommended Dietary Allowance (NULL wenn kein RDA)
ai              NUMERIC(12,4)            Adequate Intake (NULL wenn kein AI)
ul              NUMERIC(12,4)            Upper Limit (NULL = kein UL belegt — NICHT 0)
target_min      NUMERIC(12,4)            Belegbarer Zielbereich Minimum (optional)
target_max      NUMERIC(12,4)            Belegbarer Zielbereich Maximum (optional)

source          TEXT NOT NULL            z.B. 'DACH 2020', 'EFSA 2017', 'IOM 2011'
source_version  TEXT                     Versionsnummer/Stand der Quelle
notes           TEXT                     Besondere Hinweise (z.B. UL-Risikoprofil)
effective_from  DATE NOT NULL
```

**Wichtige Regeln:**
- `ul = NULL` bedeutet "kein UL belegt" — niemals `ul = 0`
- Wenn kein `rda` und kein `ai` → Nährstoff hat keinen Zielwert → Status `grau / nicht bewertbar`
- Pro Nährstoff individuelle Bewertungslogik — kein pauschales "wasserlöslich = sicher"
- V1 aktiv ausgewertet: `age_min/max` + `sex`
- V1 schema-only vorbereitet: `is_pregnant`, `is_lactating`

**Seed-Anforderungen:**
Keine Werte in Spec hinterlegt — erfordert geprüfte Quelltabellen.
Siehe `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`.

---

## 23. FoodPortion

Portionsgrößen pro Food mit Gramm-Äquivalent.
Ermöglicht Logging mit "1 Scheibe", "1 Glas" etc. statt nur Gramm.

```
id               UUID PK
food_id          UUID FK → Food (nullable)
custom_food_id   UUID FK → CustomFood (nullable)
portion_name_de  TEXT NOT NULL           z.B. "1 Stück", "1 Scheibe", "1 Glas"
portion_name_en  TEXT
portion_name_th  TEXT                    Schema vorbereitet
amount_g         NUMERIC(8,2) NOT NULL   Gramm-Äquivalent dieser Portion
sort_order       INTEGER DEFAULT 0
source           TEXT                    editorial | bls_import | user
created_at       TIMESTAMPTZ
```

**Constraint:** Genau eines von `food_id` / `custom_food_id` muss gesetzt sein.

**Logik beim Logging:**
```
User wählt Portion: "1 Scheibe Brot (35g)"
→ amount_g = 35
→ Nährstoffe = food.nutrients × (35 / 100.0)
→ Snapshot wie bei direkter Gramm-Eingabe
```

**Fallback:** Wenn keine Portionsdaten → immer Gramm-Eingabe.

---

## 24. UserRecentPortion

Zuletzt genutzte Portionsgröße pro User und Food.
Für schnellen Zugriff beim erneuten Loggen.

```
id               UUID PK
user_id          UUID NOT NULL
food_id          UUID FK → Food (nullable)
custom_food_id   UUID FK → CustomFood (nullable)
amount_g         NUMERIC(8,2) NOT NULL
portion_name     TEXT          Denormalisiert (z.B. "1 Stück")
used_at          TIMESTAMPTZ NOT NULL
```

**Constraint:** Genau eines von `food_id` / `custom_food_id` muss gesetzt sein.

**Verwendung:**
- FoodAmountInput zeigt zuletzt genutzten Wert vorausgefüllt
- Wird bei jedem Meal Item Log aktualisiert

---

## 25. MealCamScan

MealCam V1 Scan-Ergebnis mit User-Korrekturen und Consent-Status.

```
id               UUID PK
user_id          UUID NOT NULL
meal_id          UUID FK → Meal (NULL bis User bestätigt)
plan_item_id     UUID FK → MealPlanItem (optional, für Plan-Vergleich)

-- Bild
image_path       TEXT                   Storage-Pfad
image_url        TEXT                   Signed URL
image_stored     BOOLEAN DEFAULT false
training_consent BOOLEAN DEFAULT false  Opt-in — standardmäßig false

-- Status
scan_status      TEXT                   pending | processing | completed | failed |
                                        user_corrected | user_confirmed
confidence_level TEXT                   high | suggest | low
provider_response JSONB                 Raw Vision-Provider Response

-- Erkannte Items
detected_items   JSONB DEFAULT '[]'
-- Format: [{ "food_id": "uuid", "food_name": "...", "confidence": 0.78, "estimated_amount_g": 180 }]

-- User-Korrekturen
user_corrections JSONB DEFAULT '[]'
-- Format: [{ "original_food_id": "uuid", "corrected_food_id": "uuid", "corrected_amount_g": 200 }]

created_at       TIMESTAMPTZ
confirmed_at     TIMESTAMPTZ
```

**Wichtige Regeln:**
- MealCam darf NIE automatisch Meal Items erstellen
- Erst nach `scan_status = 'user_confirmed'` werden Meal Items erstellt
- `training_consent = false` ist Default — kein impliziter Opt-in
- `image_stored = true` erst wenn Bild erfolgreich gespeichert

---

## 26. NutritionPreferences (erweitert)

Ersetzt / ergänzt die bisherige `FoodPreference` Entity (Entity 18) um
Hard/Strong/Soft/Boost Constraint-Level und neue Preference-Felder.

```
user_id              UUID PK

-- Diät/Stil
diet_type            TEXT          omnivore | vegetarian | vegan | pescatarian |
                                   keto | paleo | mediterranean | carnivore | custom
cooking_skill        TEXT          beginner | intermediate | advanced
prep_time_max_min    INTEGER
budget_level         TEXT          low | medium | high | no_limit
preferred_cuisines   TEXT[]

-- Allergien / Einschränkungen (Hard Constraints)
allergies            TEXT[]        EU 14 Allergen-Codes
intolerances         TEXT[]        z.B. ['lactose', 'fructose', 'gluten_mild']
excluded_foods       UUID[]        Absolute No-Go food_ids (BLS oder Custom)

-- Religiös/Kulturell
religious_dietary    TEXT          z.B. 'halal', 'kosher', 'hindu_vegetarian'
religious_is_hard    BOOLEAN DEFAULT false   Wenn true → Hard Constraint (wie Allergie)

-- Bevorzugte Foods
preferred_foods      UUID[]        Bevorzugte food_ids

-- Meal-Konfiguration
meal_slots           JSONB         Konfigurierte Meal-Slots mit Zeiten

-- Onboarding
onboarding_complete  BOOLEAN DEFAULT false

updated_at           TIMESTAMPTZ
```

**Constraint-Level (aus FoodPreferenceItem.severity):**

| Typ | Severity | Auswirkung |
|---|---|---|
| Allergie | hard | Absoluter Ausschluss |
| Unverträglichkeit | strong | Starker Ausschluss |
| Dislike | soft | Ranking-Abzug |
| Like | boost | Ranking-Bonus |

---

## 27. NutritionPreferenceItem (erweitert)

Strukturierte Likes/Dislikes mit Constraint-Level und Herkunft.
Erweitert Entity 18 (FoodPreferenceItem).

```
id              UUID PK
user_id         UUID NOT NULL
preference      TEXT NOT NULL    liked | disliked
target_type     TEXT NOT NULL    food | category | tag | cuisine
severity        TEXT DEFAULT 'soft'
                  hard | strong | soft | boost
source          TEXT DEFAULT 'settings'
                  onboarding | settings | coach_suggestion | import

-- Ziel (genau eines gesetzt)
food_id         UUID FK → Food
custom_food_id  UUID FK → CustomFood
category_id     UUID FK → FoodCategory
tag_code        TEXT FK → TagDefinition

created_at      TIMESTAMPTZ
```

**Constraint:** Genau eines der vier Ziel-Felder muss gesetzt sein.

**Priorität bei Konflikten:** food > category > tag (spezifischeres schlägt allgemeineres)

---

## 28. CoachNutritionSuggestion

Coach-Vorschläge die User bestätigen oder ablehnen muss.
Coach schreibt nie direkt in Nutrition-Tabellen.

```
id              UUID PK
user_id         UUID NOT NULL
coach_id        UUID NOT NULL
suggestion_type TEXT NOT NULL
                  nutrition_target | meal_plan | food_alternative | water_goal |
                  custom_food_correction | micronutrient_comment | mealcam_comment |
                  diary_flag | preference
status          TEXT NOT NULL DEFAULT 'pending'
                  pending | accepted | rejected | expired
payload         JSONB NOT NULL   Typ-spezifischer Inhalt
expires_at      TIMESTAMPTZ      DEFAULT now() + INTERVAL '7 days'
decided_at      TIMESTAMPTZ
decision_note   TEXT
created_at      TIMESTAMPTZ
```

**Payload-Beispiele:**

```json
// nutrition_target
{ "calorie_target": 2200, "protein_target": 170, "reason": "Cutting Phase angepasst" }

// food_alternative
{ "replace_food_id": "uuid", "with_food_id": "uuid", "reason": "Mehr Protein pro kcal" }

// preference
{ "preference": "disliked", "target_type": "tag", "tag_code": "ultra_processed",
  "reason": "Weniger Ultra-Processed Foods empfohlen" }
```

**Regeln:**
- Coach erzeugt Suggestions — User entscheidet
- Status `expired` nach TTL (Default 7 Tage)
- Alle Coach-Suggestion-Aktionen werden geloggt

---

## Schema-Übersicht (Pass 2 Additions)

```sql
-- Neue Referenzdaten
nutrition.nutrient_reference_values    -- RDA/AI/UL pro Nährstoff
nutrition.food_portions                -- Portionsgrößen

-- Neue User-Daten
nutrition.user_recent_portions         -- Zuletzt genutzte Portionen
nutrition.mealcam_scans                -- MealCam V1 Scans + Consent
nutrition.coach_nutrition_suggestions  -- Coach-Vorschläge (User muss bestätigen)

-- Geändert (nicht neu)
nutrition.food_preferences             -- erweitert um religiös/kulturell, excluded_foods etc.
nutrition.food_preference_items        -- erweitert um severity + source
nutrition.meal_items                   -- food_source erweitert um 'mealcam' + 'manual'
nutrition.foods_custom                 -- source bereinigt (kein openfoodfacts)
nutrition.food_categories              -- name_th ergänzt
```

---

## Abgrenzung: Was Nutrition NICHT speichert

```
Supplement-Produkte     → Supplements-Modul
Supplement-Dosierungen  → Supplements-Modul
Supplement-Risiken      → Supplements-Modul
Supplement-Interaktionen→ Supplements-Modul
```

Nutrition fragt Supplement-Intake per API ab und kombiniert ihn in der
Micronutrient Review. Die Daten werden nicht lokal persistiert.

---

## Schema-Only Entities (V1 Tabellen ohne V1-Pflicht-UI/API)

| Entity | Status |
|---|---|
| `ShoppingList` | Schema-only V1 — Full UI/API Phase 2 |
| `ShoppingListItem` | Schema-only V1 — Full UI/API Phase 2 |
| `Recipe` | Schema-only V1 (Full UI/API optional) |
| `RecipeItem` | Schema-only V1 |
| `MealPlan` | Schema-only V1 (Full UI/API optional) |
| `MealPlanDay` | Schema-only V1 |
| `MealPlanItem` | Schema-only V1 |
| `MealPlanLog` | Schema-only V1 |
