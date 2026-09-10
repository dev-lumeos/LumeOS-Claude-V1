# Nutrition Module — Module Contract
> Spec Phase 1 | Final — aktualisiert April 2026 nach V1-Entscheidungsdokument

---

## Änderungsprotokoll

| Datum | Änderung |
|---|---|
| April 2026 | MealCam von Phase 2 auf V1 hochgestuft |
| April 2026 | Barcode Scanner explizit Phase 2 |
| April 2026 | OpenFoodFacts und USDA vollständig aus V1 entfernt |
| April 2026 | Supplements-API-Boundary für Micronutrient Review definiert |
| April 2026 | Coach Permissions und Suggestions-Modell ergänzt |
| April 2026 | Nutrition Preferences auf Hard/Strong/Soft/Boost Constraints erweitert |
| April 2026 | nutrient_reference_values als V1-Pflicht definiert |
| April 2026 | Recipes/Meal Plans/Shopping Lists als schema-only (nicht V1-Pflicht) |

---

## 1. Zweck

Das Nutrition-Modul ist der **Ernährungs-Datenprovider** von LumeOS.

Einzige Aufgabe: **Was isst der User, und wie verhält sich das zu seinem Ziel?**

Alle Interpretationen — was er essen soll, warum, in Kombination mit Training oder Supplements — macht Buddy. Das Modul liefert Rohdaten und Compliance-Score. Buddy und Goals interpretieren.

---

## 2. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Self-contained** | Keine harten Laufzeit-Abhängigkeiten zu anderen Modulen |
| **Goals-informed** | Targets kommen immer von Goals. Fehlen sie → Fallback-Defaults |
| **Score-deterministisch** | Nutrition Score = Pure Function. Kein AI. Testbar. |
| **Snapshot-Prinzip** | Nährstoffe werden beim Eintrag berechnet und eingefroren |
| **Einzelfoods-Prinzip** | Jedes MealItem referenziert ein einzelnes Food — auch bei Rezepten |
| **Rule-first** | Compliance, Flags, Targets = deterministische Regeln — kein AI |
| **3-sprachig** | DB-Felder: `name_de`, `name_en`, `name_th`. TH initial leer, später befüllbar |
| **BLS-only** | Einzige Core-Food-Datenquelle ist BLS 4.0. Kein OpenFoodFacts, kein USDA. |

---

## 3. Inputs

### 3.1 Von Goals — Tages-Targets (täglich, gecached)

Goals liefert alle aktiven Tages-Targets. Nutrition fragt diese beim Tagesstart ab.
Goals berechnet den `water_target` wissenschaftlich aus allen Modulen.

```
GET http://goals:5900/api/goals/targets/today?user_id=:uid
```

| Feld | Typ | Beschreibung |
|---|---|---|
| `calorie_target` | integer | kcal/Tag |
| `protein_target` | integer | g/Tag |
| `carbs_target` | integer | g/Tag |
| `fat_target` | integer | g/Tag |
| `fiber_target` | integer | g/Tag |
| `water_target` | integer | ml/Tag — von Goals berechnet |
| `goal_phase` | enum | `bulk` \| `cut` \| `maintain` \| `prep` |

**Fallback:** 2000 kcal, 150g P, 200g KH, 65g F, 30g Fiber, 2500ml Wasser.

### 3.2 Von User-Profil — Session-Start (einmalig)

```
GET http://auth:4200/api/users/:uid/profile
```

| Feld | Verwendung |
|---|---|
| `experience_level` | Score-Multiplikator |
| `dietary_preference` | Default-Filter in Food Search |
| `allergies` | Auto-Ausschluss in Food Search |

### 3.3 Von Supplements — Tages-Supplement-Intake (für Micronutrient Review)

Nutrition fragt den Supplement-Intake des Tages für die Micronutrient Review ab.
Nutrition speichert **keine** Supplement-Produkte.

```
GET http://supplements:5200/api/supplements/daily-intake?user_id=:uid&date=:date
```

| Feld | Typ | Beschreibung |
|---|---|---|
| `nutrient_totals` | object | `{ "VITD": 25.0, "ZN": 10.0, ... }` — BLS-Codes |
| `items` | array | Supplement-Items des Tages |

**Fallback bei Supplements-API nicht erreichbar:**
```
supplement_data_available: false
```
Micronutrient Review zeigt dann nur Food-Anteil. Keine Hard-Failure.

---

## 4. Outputs

### 4.1 → Goals: Tägliche Compliance

```
POST http://goals:5900/api/goals/contributions
```

```json
{
  "module": "nutrition",
  "user_id": "uuid",
  "date": "2026-04-15",
  "compliance_score": 84,
  "details": {
    "calorie_adherence_pct": 97,
    "protein_adherence_pct": 91,
    "carbs_adherence_pct": 88,
    "fat_adherence_pct": 95,
    "fiber_adherence_pct": 73,
    "water_target_met": true,
    "water_pct": 103
  }
}
```

### 4.2 → Buddy: Echtzeit-Kontext (on-demand)

```
GET /api/nutrition/for-ai
```

```json
{
  "daily_status": "176/180g Protein · 2.210/2.400 kcal · Wasser ✓",
  "last_meal": "vor 2h (Mittagessen)",
  "remaining": { "protein_g": 4, "calories_kcal": 190, "water_ml": 0 },
  "flags": ["fiber_low"],
  "recommendations": ["Abend: leichte Proteinquelle für restliche 4g"]
}
```

### 4.3 → Medical: Mikronährstoff-Tagesdaten

```
POST http://medical:5800/api/medical/nutrition-micros
```

---

## 5. Modul-Grenzen

### Nutrition BESITZT:

- Food-Datenbank (BLS 4.0 — **einzige** Datenquelle für Core-Foods)
- Custom Foods (pro User, privat in V1)
- Meal Logs + Quick-Add Makros
- Water Logs (explizit geloggt + Nahrungswasser aus meal_items.water_g)
- Food Preferences + Allergien + Unverträglichkeiten + Likes/Dislikes + Diät-Constraints
- Micronutrient Review (kombiniert Food-Intake + Supplement-Intake via API)
- Nutrition Score
- MealCam V1 (Bild → Erkennung → User-Bestätigung → Meal Item)
- Nutrition Targets (gecacht von Goals)
- nutrient_reference_values (RDA/AI/UL intern)
- food_portions (Portionsgrößen pro Food)
- Recipes / Meal Plans / Shopping Lists (Schema V1 — UI und API Phase 2, wenn Zeit reicht)

### Nutrition BESITZT NICHT:

| Was | Wer |
|---|---|
| Weight Logs (Körpergewicht) | Goals |
| TDEE-Berechnung | Goals |
| Water Target Berechnung | Goals |
| Makro-Ziele setzen | Goals |
| **Supplement-Produkte, Dosierungen, Risiken, Interaktionen** | **Supplements** |
| Training-Kalorien-Ausgleich | Goals |
| Medizinische Ernährungsempfehlungen | Buddy |
| Barcode-Datenlayer | Phase 2 |
| OpenFoodFacts Daten | **Nicht V1, nicht Phase 2** — kein Bedarf |
| USDA Daten | **Nicht V1** |

### Food-Datenquellen V1 (endgültig):

```
BLS 4.0 Foods    → nutrition.foods (7.140 Foods, 138 Nährstoffe)
User Custom Foods → nutrition.foods_custom (user-privat)
```

**Explizit nicht Teil von V1:** OpenFoodFacts, USDA, Barcode-Datenlayer.

### Schreib-Rechte anderer Module in Nutrition:

| Modul | Was es schreiben darf | Einschränkung |
|---|---|---|
| Human-Coach | MealPlan + Rezepte anlegen, User zuweisen | Nur `status: 'assigned'`, nie `status: 'active'` |
| Human-Coach | Nutrition Preferences **vorschlagen** | Coach schreibt nicht direkt — User muss bestätigen |
| Marketplace | MealPlan + Rezepte nach Kauf zuweisen | Nur `status: 'assigned'` |
| Buddy | MealPlan + Rezepte auf explizite User-Anweisung | **Phase 2** — V1 nur Schema (`source` Enum-Wert vorbereitet) |

**Regel:** Kein Modul darf `status: 'active'` setzen ohne User-Action.
**Regel:** Coach darf keine Preferences direkt schreiben — nur Suggestions erzeugen, die User bestätigt.

---

## 6. V1 Scope

### V1 Pflicht-Features

```
Food Search (BLS 4.0 + Custom Foods, mit Ranking)
Diary Logging (Meals, MealItems, Snapshots)
Water Tracking
Nutrition Targets (gecacht von Goals)
Custom Foods (user-privat)
Micronutrient Review (Food + Supplements-API)
nutrient_reference_values (RDA/AI/UL intern)
Food Portions
MealCam V1 (Bild → Erkennung → User-Bestätigung)
Nutrition Preferences (Allergien, Unverträglichkeiten, Diät, religiös/kulturell, Likes/Dislikes)
Food Tags V1 (16 Tags)
Thai / i18n strukturell vorbereitet (TH-Texte später)
```

### V1 Schema-Only (optional UI/API wenn Zeit reicht)

```
Recipes
Meal Plans
Shopping Lists
```

**Eskalationspfad:** Wenn V1-Zeitbudget knapp wird, werden Recipes, Meal Plans und Shopping Lists vollständig auf Phase 2 verschoben (siehe `ADR_RECIPES_SCHEMA_ONLY.md` und `NUTRITION_NEXT_SPEC_DECISIONS.md §15`).

### Phase 2

```
Barcode Scanner
Full Recipe UI + Meal Plan Builder + Shopping List UI
Marketplace Recipes
Buddy MealPlan Builder
Public Custom Foods / Sharing
BLS 5.0 Update-Mechanismus
Smart Scale Integration
```

---

## 7. Coach Permissions

User kann Coach-Zugriff pro Funktion granular erlauben/sperren.

### Bereich der Coach-Permissions in Nutrition

```
nutrition.diary               → Diary lesen
nutrition.water               → Water-Logs lesen
nutrition.micronutrient       → Micronutrient Review lesen
nutrition.mealcam_images      → MealCam-Bilder lesen (separate Freigabe)
nutrition.targets             → Nutrition Targets lesen
nutrition.custom_foods        → Custom Foods lesen
nutrition.recipes             → Rezepte lesen (Phase 2)
nutrition.meal_plans          → Meal Plans lesen
nutrition.preferences         → Preferences lesen und vorschlagen
```

### Coach-Zugriffs-Regeln

- Coach hat nur **Leserechte** auf freigegebene Bereiche
- Coach darf **keine** Daten direkt schreiben
- Coach darf **Suggestions** erzeugen (Vorschläge die User bestätigen muss)
- Alle Coach-Zugriffe werden **auditierbar geloggt**
- User kann Freigaben jederzeit widerrufen

### Coach Suggestions (was Coach vorschlagen darf)

```
Nutrition Targets vorschlagen
Meal-Plan-Vorschlag machen
Food-Alternativen vorschlagen
Wasserziel-Vorschlag machen
Custom-Food-Korrektur vorschlagen
Micronutrient-Hinweis kommentieren
MealCam-Ergebnis kommentieren (bei Freigabe)
Diary-Eintrag zur Prüfung markieren
Nutrition Preferences vorschlagen
```

Jeder Vorschlag bekommt Status: `pending | accepted | rejected | expired`
User muss jeden Vorschlag einzeln annehmen oder ablehnen.

---

## 8. Meal Plan — Universelles Format

Ein Meal Plan ist ein gespeicherter mehrtägiger Essensplan.

**Quellen:** `user | coach | marketplace | buddy`

Alle Quellen → identisches Schema. User aktiviert immer selbst.

**Immutabilität:** MealPlanItems sind READ-ONLY nach Plan-Aktivierung.

---

## 9. Rezepte — Universelles Format

Ein Rezept ist eine wiederverwendbare Mahlzeit-Vorlage.

**Quellen:** `user | coach | marketplace | buddy`

**Einzelfoods-Prinzip:** Beim Loggen werden alle Zutaten als einzelne MealItems behandelt.

---

## 10. MealCam V1

MealCam ist **V1** (nicht Phase 2).

### V1-Flow

```
Bild hochladen oder Kamera öffnen
→ Erkennung (Vision-Provider TBD)
→ BLS/Custom Match
→ Portionsvorschlag mit Confidence Score
→ User korrigiert/bestätigt jedes Item einzeln
→ Erst dann: Meal Item erstellen
```

**MealCam darf nie automatisch finale Meal Items schreiben.**
User muss immer bestätigen.

### Barcode Scanner

Barcode Scanner ist **Phase 2**. Nicht V1.

### MealCam Datenschutz

- Bilder werden standardmäßig privat gespeichert
- Opt-in für Modell-Training-Freigabe (separate User-Zustimmung)
- Widerruf möglich — Bilder aus Trainingspool entfernen
- Bestätigte Diary-Nährwerte bleiben bei Bildlöschung erhalten
- Coach sieht MealCam-Bilder nur bei User-Freigabe

---

## 11. Micronutrient Review V1

### Datenquellen

```
Food Intake        → Nutrition (eigene Daten)
Custom Food Mikros → Nutrition (eigene Daten)
Supplement Intake  → Supplements-Modul per API
```

Nutrition kombiniert beide Quellen für die Micronutrient Review.

### Bewertungsgrundlage

Pro Nährstoff individuell (kein pauschales "Wasser-löslich = sicher"):

```
RDA / AI          → Zielwert
UL                → Upper Limit (wenn vorhanden)
target_range      → belegbarer Zielbereich
```

Wenn kein UL existiert → `kein UL belegt` (nicht `0`)
Wenn kein Zielwert → Status `grau / nicht bewertbar`

Fettlösliche Vitamine, Mineralstoffe und Spurenelemente bekommen eigene UL-/Akkumulationslogik.

### Ampelstatus

```
grün  → im Zielbereich ohne UL-Konflikt
gelb  → leicht zu niedrig oder leicht zu hoch
rot   → deutlich zu niedrig oder deutlich zu hoch / über sicherem Bereich
grau  → nicht bewertbar
```

Score darf rote Einzelwerte nicht verstecken. Kritische Werte oben priorisiert.

---

## 12. Nutrition Preferences V1

### Onboarding-Erfassung

Im Onboarding werden erfasst:
```
Allergien (Hard Constraint)
Unverträglichkeiten (Strong Constraint)
Ernährungsform / Diät-Stil
Religiöse/kulturelle Einschränkungen (Hard wenn User so setzt)
Absolute No-Go-Lebensmittel
Likes
Dislikes
Bevorzugte Küchen/Stile
Meal-Frequenz und Meal-Slots
Zielrichtung
```

### Settings (bearbeitbar)

In den Nutrition Settings kann User alle Preferences bearbeiten.

### Constraint-Level

| Typ | Constraint | Bedeutung |
|---|---|---|
| Allergie | **Hard** | Absoluter Ausschluss |
| Unverträglichkeit | **Strong** | Starker Ausschluss |
| Religiös/kulturell | **Hard** (wenn User so setzt) | Absoluter Ausschluss |
| Dislike | **Soft** | Ranking-Abzug |
| Like | **Boost** | Ranking-Bonus |

### Nutzung im System

```
Food Search Ranking     → Constraints + Boosts
Food Suggestions        → Constraints anwenden
MealCam Vorschläge      → Constraints berücksichtigen
Custom Food Vorschläge  → Constraints anwenden
Coach Suggestions       → Constraints nicht überschreiben
```

---

## 13. API-Übersicht

```
http://nutrition:5100/api/nutrition/
  foods/              Food-DB Search (BLS 4.0 + Custom), CRUD, Smart Search
  foods/custom/       Custom Foods CRUD
  foods/portions/     Portionsgrößen pro Food
  meals/              Meal Logging (Diary)
  water/              Water Tracking
  targets/            Gecachte Tages-Targets (von Goals)
  recipes/            Rezepte + Einkaufslisten — V1 schema-only / API Phase 2 wenn Zeit knapp
  meal-plans/         Meal Plans — V1 schema-only / API Phase 2 wenn Zeit knapp
  preferences/        Food Preferences (Allergien, Unverträglichkeiten, Likes/Dislikes, Diät)
  summary/            Tages- und Zeitraum-Aggregate
  nutrients/          Nährstoff-Definitionen + Referenzwerte
  score/              Compliance Score
  mealcam/            MealCam V1 (Scan, Feedback, Consent)
  for-ai/             Buddy Context Endpoint
  for-goals/          Compliance Export an Goals
  pending-actions/    Offene User-Actions
```

---

## 14. Datenbank-Schema-Prinzip

**Alle Nutrition-Tabellen leben im Schema `nutrition`.**

Kernstruktur:
```sql
-- Referenzdaten (nach Import read-only)
nutrition.nutrient_defs
nutrition.nutrient_reference_values    -- RDA/AI/UL — NEU V1
nutrition.food_categories
nutrition.foods
nutrition.food_nutrients
nutrition.food_aliases
nutrition.food_portions                -- NEU V1
nutrition.tag_definitions
nutrition.food_tags

-- User-Daten
nutrition.foods_custom                 -- source: user|manual|import|admin (kein openfoodfacts)
nutrition.food_preferences             -- erweitert: Hard/Strong/Soft/Boost Constraints
nutrition.food_preference_items
nutrition.meals
nutrition.meal_items                   -- food_source: bls|custom|mealcam
nutrition.mealcam_scans                -- NEU V1
nutrition.water_logs
nutrition.nutrition_targets
nutrition.micro_flags

-- Schema-only V1 (UI/API wenn Zeit reicht)
nutrition.recipes
nutrition.recipe_items
nutrition.shopping_lists
nutrition.shopping_list_items
nutrition.meal_plans
nutrition.meal_plan_days
nutrition.meal_plan_items
nutrition.meal_plan_logs
```

**Keine externen Food-Datenquellen ausser BLS 4.0.**

---

## 15. Sprachen

Die Datenbank ist **3-sprachig**: DE / EN / TH.

- `name_de`, `name_en`, `name_th` auf allen relevanten Tabellen
- TH-Felder initial leer (NULL erlaubt)
- Thai Food-Suche nur Schema vorbereiten — keine künstliche Thai-Fallback-Suche über DE/EN/Alias
- Admin kann Thai-Aliases später ergänzen
- Fehlende Thai-Übersetzungen blockieren Release nicht
- UI: DE/EN aktiv. TH sichtbar aber disabled. Wenn User auf TH klickt: "Coming soon"
