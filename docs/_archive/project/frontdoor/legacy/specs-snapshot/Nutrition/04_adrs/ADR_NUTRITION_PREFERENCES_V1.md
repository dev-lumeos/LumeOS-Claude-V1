# ADR: Nutrition Preferences V1 — Constraint-Modell

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

Nutrition V1 braucht ein Präferenzmodell das sowohl im Onboarding als auch in den Nutrition Settings genutzt wird und Food Search Ranking, Suggestions und MealCam beeinflusst.

## Entscheidung

### Constraint-Level

| Typ | Level | Auswirkung |
|---|---|---|
| Allergie | **hard** | Absoluter Ausschluss — nie anzeigen, nie vorschlagen |
| Unverträglichkeit | **strong** | Starker Ausschluss — nur auf explizite User-Suche anzeigen |
| Religiöse/kulturelle Einschränkung | **hard** (wenn User so setzt) | Wie Allergie |
| Dislike | **soft** | Ranking-Abzug — aber sichtbar wenn User sucht |
| Like | **boost** | Ranking-Bonus |

### Datenmodell

```
food_preferences Tabelle (eine Zeile pro User):
  diet_type
  allergies[]
  intolerances[]
  preferred_cuisines[]
  excluded_foods[]        -- absolute No-Go Food-IDs
  preferred_foods[]       -- bevorzugte Food-IDs
  religious_dietary       -- 'halal', 'kosher', 'hindu_vegetarian' etc.
  religious_is_hard       -- true = Hard Constraint
  meal_slots              -- konfigurierte Meal-Slots
  cooking_skill
  prep_time_max_min
  budget_level

food_preference_items Tabelle (n Zeilen pro User):
  preference              -- 'liked' | 'disliked'
  target_type             -- 'food' | 'category' | 'tag' | 'cuisine'
  severity                -- 'hard' | 'strong' | 'soft' | 'boost'
  source                  -- 'onboarding' | 'settings' | 'coach_suggestion' | 'import'
  food_id / category_id / tag_code
```

### Onboarding vs Settings

Onboarding erfasst initial:
- Allergien, Unverträglichkeiten
- Ernährungsform
- Religiöse/kulturelle Einschränkungen
- No-Go-Lebensmittel, Likes, Dislikes
- Bevorzugte Küchen, Meal-Frequenz, Zielrichtung

Settings (jederzeit bearbeitbar):
- Alle Onboarding-Werte
- Coach-Freigaben (separate Permission-Tabelle)

### Coach-Regel

Coach darf Preferences nur **vorschlagen** (`source: 'coach_suggestion'`).
User muss Änderungen bestätigen.
Coach schreibt nie direkt in `food_preferences` oder `food_preference_items`.

### Food Search Ranking-Einfluss

```
+200  für preferred_foods (direkte User-Präferenz)
+100  für liked food (food_preference_items preference='liked')
+50   für liked category
+30   für liked tag/cuisine
-100  für disliked food
-50   für disliked category
-300  für allergen match (hard constraint)
-200  für intolerance match (strong constraint)
-300  für religious_dietary match wenn religious_is_hard=true
-100  für excluded_foods
```
