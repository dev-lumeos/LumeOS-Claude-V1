# Nutrition Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails

---

## Feature 1: Food Database

### Was es ist
Die zentrale Lebensmitteldatenbank. Einzige Datenquelle: **BLS 4.0** (Bundeslebensmittelschlüssel, Max Rubner-Institut, Dez 2025).

### Datenstrategie

**Nur BLS 4.0.** Keine weiteren externen Quellen, keine Merges mit USDA, Fineli, CIQUAL, OpenFoodFacts oder anderen Datenbanken. Updates und Erweiterungen werden zu einem späteren Zeitpunkt evaluiert.

| Kennzahl | Wert |
|---|---|
| Einträge | 7.140 Lebensmittel |
| Nährstoffe | 138 Komponenten pro Food |
| Lizenz | CC BY 4.0 (kostenlos) |
| Herausgeber | Max Rubner-Institut, Karlsruhe |
| Stand | Dezember 2025 |

### Nährstoff-Abdeckung (138 BLS-Nährstoffe)
Energie (kcal, kJ), Makros, Wasser, Alkohol, Organische Säuren, Rohasche, alle Fettsäuren (36 inkl. Einzelfettsäuren), alle Vitamine inkl. D2/D3 und K1/K2 (NEU in BLS 4.0), alle Mineralstoffe/Spurenelemente, 19 Aminosäuren, Zucker-Fraktionen, Ballaststoff-Fraktionen, Zuckeralkohole.

### Technische Details (EAV-Hybrid)
- `nutrition.foods`: Identity + 10 Schnell-Makros als direkte Spalten (für Search + Daily Summary)
- `nutrition.food_nutrients`: Alle 138 BLS-Nährstoffe als EAV (~570K Zeilen, nur non-null Werte)
- `nutrition.nutrient_defs`: 138 Zeilen mit Metadaten (Einheit, RDA, Display-Tier, Formel)
- GIN-Index auf `name_display` (pg_trgm) für Textsuche (<100ms)

---

## Feature 2: Food Search

### Standard-Suche
```
Input:   Suchtext, optional Kategorie-Filter
Output:  Paginated Hit-Liste (limit/offset)
Tech:    Postgres pg_trgm Trigram-Index
Ziel:    <100ms bei 7.140 Foods
```

### Smart Search (Preference-aware)
Lädt `nutrition.food_preference_items` und `nutrition.food_preferences` des Users.

**Scoring:**
- Liked Food: +100 (gelobt via food_preference_items)
- Disliked Food: −100
- Liked Category: +50
- Disliked Category: −50
- Liked Tag: +30
- Allergen-Match (aus food_preferences.allergies): **Ausschluss** (kein Scoring)
- Diet-Type-Mismatch: **Ausschluss** (z.B. vegan → food hat pork/beef/dairy Tag)
- Prefix-Match im Namen: +20

**Suggestions-Endpoint:** Personalisierte Vorschläge ohne Suchbegriff.
Basis: Liked-Food-Kategorien → ähnliche Foods.

### Suchreihenfolge
```sql
ORDER BY
  is_custom DESC,                              -- Custom Foods immer zuerst
  (similarity(name_display, $query) * 0.60)
  + (sort_weight / 1000.0 * 0.40) DESC
```

### Filter-Optionen (in UI)
- Kategorie: L1-Kategorien als Chips (Fleisch, Fisch, Milch, Gemüse...)
- Sub-Kategorie: L2 erscheint wenn L1 gewählt
- Diät-Tags: [Vegetarisch] [Vegan] [Low-Carb] [Keto] [High-Protein]
- Sortierung: Relevanz | Protein ↓ | Kalorien ↑ | Name A-Z

### Quick-Access Buttons
- **Meist genutzt:** Top 10 Foods nach User-Häufigkeit
- **Eigene Foods:** Custom Foods des Users
- **Wie gestern:** Ganzen Tag oder einzelne Mahlzeiten kopieren
- **Aus Mealplan:** Foods aus vergangenen Plänen

---

## Feature 3: Semantic Food Tags

Objektive, wartbare Klassifikation. Automatisch generiert, nicht manuell gepflegt.

### Phase 1 Tags (zum Launch)

| Typ | Tags |
|---|---|
| ingredient | `pork` `beef` `veal` `poultry` `chicken` `turkey` `lamb` `game_meat` `rabbit` `offal` `liver` `heart` `processed_meat` `fish` `fatty_fish` `lean_fish` `shellfish` `molluscs` `dairy` `cheese` `yogurt` `egg` `soy` `nuts` `peanuts` `seeds` `legumes` `gluten_grain` `whole_grain` `potato` `vegetable` `fruit` `cooking_fat` `sugar` `alcohol` `mushroom` |
| diet | `vegetarian` `vegan` `pescatarian` `keto_strict` `keto_moderate` `low_carb` `low_fat` `high_fiber` `sugar_free` `paleo` `carnivore` `gluten_free` |
| allergen | `allergen_gluten` `allergen_crustaceans` `allergen_eggs` `allergen_fish` `allergen_peanuts` `allergen_soy` `allergen_milk` `allergen_nuts` `allergen_celery` `allergen_mustard` `allergen_sesame` `allergen_sulphites` `allergen_lupin` `allergen_molluscs` |
| fitness | `high_protein` `very_high_protein` `lean_protein` `complete_protein` `leucine_rich` `bcaa_rich` `high_carb` `complex_carbs` `fast_carbs` `high_fiber` `very_high_fiber` `omega3_rich` `epa_dha_source` `low_calorie` `calorie_dense` `high_satiety` `iron_rich` `magnesium_rich` `calcium_rich` `vitamin_d_source` `vitamin_b12_source` `zinc_rich` `potassium_rich` |
| gym | `pre_workout_carbs` `pre_workout_balanced` `post_workout_protein` `post_workout_recovery` `pre_sleep_protein` `muscle_building` `anti_catabolic` `cutting_phase` `bulking_phase` `lean_bulk` `endurance_fuel` `glycogen_replenishment` `contest_prep` `hormone_support` `recovery_nutrients` `gut_health` `bone_density` `anti_inflammatory` `electrolyte_source` |
| processing | `raw` `minimally_processed` `fermented` `smoked` `dried` `cooked` `canned` `processed` `ultra_processed` `fortified` |

**Auto-generiert via Trigger** bei INSERT/UPDATE von foods. Basis: BLS-Code-Pattern + Makro-Werte.

### Phase 2 + 3 Tags (geplant)
Phase 2: `gluten`, `nuts`, `soy` (Allergen-Detail); `low_fat`, `organic`, `processed`
Phase 3: `halal`, `kosher`, `seasonal`, `local`

---

## Feature 4: Custom Foods

User-erstellte Lebensmittel. **Vollständig getrennt von BLS-Daten** — keine Durchmischung.

**Erstellungs-Wege:**
1. Manuell (Formular)
2. Barcode-Scan → nicht in BLS → "Custom erstellen"
3. MealCam → unsicheres Ergebnis → als Custom speichern

**Pflichtfelder:** `name_de`, `enercc`, `prot625`, `fat`, `cho`
**Optional:** alle weiteren Makros, Mikro-Subset, `barcode`, `brand`, `serving_size_g`

**Sichtbarkeit:** Nur der erstellende User. In Food Search immer zuerst (`is_custom DESC`).
Custom Foods brauchen keine Tags — Priorisierung via `is_custom` Flag.

**3-Sprachig:** `name_de` Pflicht, `name_en` und `name_th` optional.

---

## Feature 5: Meal Logging (Diary)

**Formel:** `meal_item.nutrient = food.nutrient × (amount_g / 100)`

**Eingefroren beim Erstellen:**
- Alle direkten Makro-Spalten (enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, alc)
- Vollständiger `nutrients JSONB` Snapshot: alle non-null BLS-Nährstoffe skaliert auf amount_g
- Basis für alle Berichte, Diagramme, Mikro-Dashboard, Medical-Modul

**Meal Types:** `breakfast | lunch | dinner | snack | pre_workout | post_workout | other`

---

## Feature 6: Rezepte + Einkaufslisten

**Rezepte:**
- User-erstellte Verbund-Foods aus mehreren BLS-Foods
- Pre-computed Totals via Trigger (Recipe.total_* auto-update bei Zutaten-Änderungen)
- Generated Columns für per-Portion-Werte (keine Divisions-Bugs im App-Code)
- Quellen: `user | coach | marketplace` — identisches Schema

**Als Mahlzeit loggen:**
- User wählt Portionen-Anzahl
- System erstellt Meal + MealItems (je eine Zeile pro Zutat, Nährstoffe eingefroren)

**Einkaufslisten:**
- Generiert aus Rezept: `POST /api/nutrition/recipes/:id/shopping-list`
- User wählt gewünschte Portionen → Items skaliert
- Foods mit Mengen und Display-Einheiten (g, ml, Stück, EL)
- Abhak-Funktion pro Item (`is_checked` Toggle)

---

## Feature 7: Meal Plans

**Quellen:** `user | coach | marketplace | buddy` — identisches Schema

**Activation:** Nur User kann aktivieren. Startdatum + Lifecycle wählen.

**Lifecycle:**
- `once`: endet nach days_count Tagen
- `rollover`: startet nach Ablauf automatisch neu (Day 1)
- `sequence`: nach Ablauf wird next_plan_id aktiviert

**Ghost Entries:**
- Erscheinen im Diary für geplante Mahlzeiten
- Status: `pending` — kein automatisches Expiry
- User entscheidet jederzeit, auch retroaktiv
- Bestätigung via MealCam oder manuell (Flow 4 in SPEC_03)

**Plan-Compliance:**
```
plan_compliance_pct = (confirmed + deviated) / (confirmed + deviated + skipped) × 100
pending Items → "noch offen", nicht im Nenner
```

---

## Feature 8: Water Tracking

**Target:** von Goals geliefert (wissenschaftlich aus Gewicht + Training + Recovery + Umgebung)
**Quick-Add:** 250ml, 500ml, 750ml, 1.000ml (konfigurierbar via Settings)
**Pending Action:** wenn < 80% des Tagesziels nach 18:00 Uhr

---

## Feature 9: MealCam (KI-Erkennung)

**Tech:** Claude Vision API

| Level | Schwelle | Aktion |
|---|---|---|
| AUTO_ACCEPT | ≥ 0.85 | Sofort übernehmen |
| SUGGEST | 0.50–0.84 | Kandidaten zeigen |
| LOW | 0.30–0.49 | "Meintest du...?" |
| REJECT | < 0.30 | Manuelle Eingabe |

Im MealPlan-Kontext: erkannte Foods werden mit Ghost Entry verglichen (Match, Abweichung, Fehlt, Extra).

---

## Feature 10: Mikronährstoff-Tracking (3-Tier)

| Tier | Inhalt | Sichtbarkeit |
|---|---|---|
| 1 — Essential | Ca, Fe, Mg, P, K, Zn, Vit A/D/E/K/C/B1/B2/B3/B6 (15) | Immer |
| 2 — Athlete | Cu, Mn, Se, Iod, Folat, B12, B5, Biotin (+8) | Plus-Tier |
| 3 — Medical | Alle 138 BLS-Nährstoffe inkl. Aminosäuren, Fettsäuren (100+) | Pro-Tier |

**Berechnung:** Aus `nutrients JSONB` in meal_items (vollständiger Snapshot → kein Join nötig)
**MicroFlags:** Deficit/Surplus mit Severity. An Medical-Modul gesendet.

---

## Feature 11: Nutrition Score (Pure Function)

```typescript
score = (
  protein_compliance × 0.30 +   // Höchste Priorität
  calorie_compliance × 0.25 +
  carbs_compliance   × 0.15 +
  fat_compliance     × 0.15 +
  fiber_compliance   × 0.15
) × level_multiplier × 100

level_multiplier: beginner 0.75 | intermediate 0.90 | advanced 1.00 | elite 1.10
thresholds: ok ≥ 80 | warn 50–79 | block < 50
```

Deterministisch. Kein AI. Testbar.

---

## Feature 12: Food Preferences

**Ebenen:** diet_type (global) → category (like/dislike) → tag (like/dislike) → food (like/dislike)
**Allergene:** Harte Ausschlüsse — kein Scoring-Override möglich.
**Priorität:** food > category > tag (Spezifischeres schlägt Allgemeineres)

---

## Feature 13: Daily Summary + Aggregates

`daily_nutrition_summary` VIEW — Makros aus direkten Spalten, Mikros aus JSONB.
Zeitraum-Aggregation via `GET /api/nutrition/summary/range`.
`for-goals` Endpoint für Goals-Compliance-Export.
`for-ai` Endpoint für Buddy-Kontext (kompakt).

---

## Feature 14: Pending Actions

`GET /api/nutrition/pending-actions` — offene User-Actions für Buddy's Tages-TODO.
Auslöser: pending Ghost Entries, Water < 80% nach 18h, kein Meal vor 14h.

---

## Feature 15: Settings (Key-Value Store)

| Key | Default | Beschreibung |
|---|---|---|
| `meal_schedule` | 5 Mahlzeiten | Zeitplan mit Namen + Uhrzeiten |
| `morning_weigh_in` | false | Gewicht täglich morgens tracken |
| `water_quick_amounts` | [250,500,750,1000] | Quick-Add Mengen ml |
| `show_micros_tier` | 1 | Angezeigtes Mikro-Tier (1/2/3) |
| `mealcam_threshold` | 0.85 | Auto-Accept Confidence |
| `meal_plan_confirm_mode` | ask | mealcam / manual / ask |
