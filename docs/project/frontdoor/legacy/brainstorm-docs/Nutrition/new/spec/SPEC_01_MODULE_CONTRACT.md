# Nutrition Module — Module Contract
> Spec Phase 1 | Final

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
| **Rule-first** | Compliance, Flags, Targets = deterministische Regeln — kein AI |
| **3-sprachig** | DB-Felder: `name_de`, `name_en`, `name_th`. TH-Übersetzungen initial leer, später befüllbar |

---

## 3. Inputs

### 3.1 Von Goals — Tages-Targets (täglich, gecached)

Goals liefert alle aktiven Tages-Targets. Nutrition fragt diese beim Tagesstart ab.
Goals berechnet den `water_target` wissenschaftlich aus allen Modulen
(Gewicht × 35ml/kg + Training-Adjustment + Recovery-Faktoren + Umgebung).

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

**Fallback:** Keine Goals-Targets gesetzt → Nutrition berechnet TDEE-Schätzwert aus User-Profil.

### 3.2 Von User-Profil — Session-Start (einmalig)

```
GET http://auth:4200/api/users/:uid/profile
```

| Feld | Verwendung |
|---|---|
| `experience_level` | Score-Multiplikator (beginner 0.75 → elite 1.10) |
| `dietary_preference` | Default-Filter in Food Search |
| `allergies` | Auto-Ausschluss in Food Search |

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
    "water_target_met": true
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

```json
{
  "user_id": "uuid",
  "date": "2026-04-15",
  "micro_totals": { "VITD": 8.2, "MG": 310 },
  "deficit_flags": ["VITD", "ZN"]
}
```

---

## 5. Modul-Grenzen

### Nutrition BESITZT:

- Food-Datenbank (BLS 4.0 — alleinige Datenquelle für Core-Foods)
- Custom Foods (pro User, vollständig getrennt von BLS-Daten)
- Meal Logs
- Rezepte (inkl. Einkaufslisten-Generierung)
- Meal Plans (universelles Format — user / coach / marketplace / buddy)
- Water Logs
- Food Preferences
- Mikronährstoff-Flags
- Nutrition Score

### Nutrition BESITZT NICHT:

| Was | Wer |
|---|---|
| Weight Logs (Körpergewicht) | Goals |
| TDEE-Berechnung | Goals |
| Water Target Berechnung | Goals (aggregiert aus allen Modulen) |
| Makro-Ziele setzen | Goals |
| Supplement-Tracking | Supplements |
| Training-Kalorien-Ausgleich | Goals |
| Medizinische Ernährungsempfehlungen | Buddy (nutzt Medical + Nutrition) |

### Schreib-Rechte anderer Module in Nutrition:

| Modul | Was es schreiben darf |
|---|---|
| Human-Coach | MealPlan + Rezepte mit `source: 'coach'` anlegen und einem User zuweisen |
| Marketplace | MealPlan + Rezepte mit `source: 'marketplace'` nach Kauf zuweisen |
| Buddy | MealPlan mit `source: 'buddy'` auf explizite User-Anweisung erstellen |

**Regel:** Kein Modul darf `status: 'active'` setzen ohne User-Action.

---

## 6. Meal Plan — Universelles Format

Ein Meal Plan ist ein gespeicherter mehrtägiger Essensplan.

**Quellen:**
- `user` — User erstellt selbst im Nutrition-Modul
- `coach` — Coach erstellt via Human-Coach-Modul und weist zu
- `marketplace` — User kauft im Marketplace, wird nach Kauf zugewiesen
- `buddy` — Buddy erstellt auf explizite Anweisung des Users

Alle vier Quellen → identisches Schema. User aktiviert immer selbst mit Startdatum und Lifecycle-Wahl.

---

## 7. Rezepte — Universelles Format

Ein Rezept ist eine wiederverwendbare Mahlzeit-Vorlage mit Zutaten und Nährstoff-Kalkulation.

**Quellen:**
- `user` — User erstellt selbst
- `coach` — Coach erstellt und weist zu
- `marketplace` — User kauft

Alle Quellen → identisches Schema. Zusätzliche Funktion: aus einem Rezept kann eine **Einkaufsliste** generiert werden (Auflistung aller Foods mit Mengen).

---

## 8. API-Übersicht

```
http://nutrition:5100/api/nutrition/
  foods/              Food-DB Search (BLS), CRUD, Smart Search
  meals/              Meal Logging (Diary)
  water/              Water Tracking
  targets/            Gecachte Tages-Targets (von Goals)
  recipes/            Rezepte + Einkaufslisten
  meal-plans/         Meal Plans (alle Quellen)
  preferences/        Food Preferences
  summary/            Tages- und Zeitraum-Aggregate
  score/              Compliance Score
  for-ai/             Buddy Context Endpoint
  for-goals/          Compliance Export an Goals
  pending-actions/    Offene User-Actions (TODO-System)
```

---

## 9. Datenbank-Schema-Prinzip

**Alle Nutrition-Tabellen leben im Schema `nutrition`.**

```sql
nutrition.nutrient_defs       -- 138 BLS-Nährstoff-Definitionen
nutrition.food_categories     -- Kategorie-Baum (4 Ebenen)
nutrition.foods               -- BLS 4.0 Core-Foods (7.140 Einträge)
nutrition.food_nutrients      -- Nährstoffe EAV (~570K Zeilen, nur non-null)
nutrition.tag_definitions     -- Semantic Tag Vokabular
nutrition.food_tags           -- Food-Tag-Zuordnungen (auto-generiert)
nutrition.food_aliases        -- Such-Aliase (DE/EN/TH)
nutrition.foods_custom        -- User-erstellte Foods (getrennt von BLS)
nutrition.food_preferences    -- Diättyp, Allergien
nutrition.food_preference_items  -- Likes/Dislikes auf food/category/tag-Ebene
nutrition.meals               -- Mahlzeiten-Container
nutrition.meal_items          -- Items + vollständig eingefrorene Nährstoffe
nutrition.recipes             -- Rezepte (user/coach/marketplace)
nutrition.recipe_items        -- Zutaten eines Rezepts
nutrition.shopping_lists      -- Einkaufslisten aus Rezepten
nutrition.shopping_list_items -- Positionen einer Einkaufsliste
nutrition.meal_plans          -- Meal Plans (user/coach/marketplace/buddy)
nutrition.meal_plan_days      -- Tage innerhalb Plan
nutrition.meal_plan_items     -- Items pro Plantag
nutrition.meal_plan_logs      -- Ausführungsprotokoll
nutrition.water_logs          -- Wasseraufnahme
nutrition.nutrition_targets   -- Gecachte Tages-Targets (von Goals)
nutrition.micro_flags         -- Mikronährstoff-Warnungen
-- View:
nutrition.daily_nutrition_summary
```

**Kein anderes Modul teilt dieses Schema.**
**Keine Nutrition-Tabellen in `public`.**
**Keine externen Food-Datenquellen ausser BLS 4.0.**

API `search_path`: `nutrition`
Cross-Modul-Zugriff: ausschliesslich via API Port 5100.

---

## 10. Sprachen

Die Datenbank ist **3-sprachig**: Deutsch (DE), Englisch (EN), Thai (TH).

- `name_de`, `name_en`, `name_th` auf allen relevanten Tabellen
- TH-Felder initial leer (NULL erlaubt) — Übersetzung als spätere Phase
- i18n-Schlüssel im Frontend: DE + EN vollständig, TH später
- API liefert immer alle drei Felder; Client wählt nach User-Locale
