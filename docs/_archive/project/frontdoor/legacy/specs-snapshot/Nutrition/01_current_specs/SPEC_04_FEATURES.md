# Nutrition Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails
> Letzte Aktualisierung: April 2026 (ADR-Paket eingearbeitet)

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
- Liked Food: +100
- Disliked Food: −100
- Liked Category: +50
- Disliked Category: −50
- Liked Tag: +30
- Allergen-Match (food_preferences.allergies): **Ausschluss** (kein Scoring)
- Allergen-Match (foods_custom.custom_allergens): **Ausschluss** (identische Logik)
- Diet-Type-Mismatch: **Ausschluss**
- Prefix-Match im Namen: +20

**Suggestions-Endpoint:** Personalisierte Vorschläge ohne Suchbegriff.
Basis: Liked-Food-Kategorien → ähnliche Foods.

### Suchreihenfolge
```sql
ORDER BY
  is_custom DESC,
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

Objektive, wartbare Klassifikation. Basis: BLS-Code-Pattern + Makro-Werte.

### V1 — User-sichtbare Filter-Tags (16 Tags, verbindlich laut NUTRITION_NEXT_SPEC_DECISIONS.md §5)

Diese 16 Tags sind in V1 für den User als Such-/Filteroptionen sichtbar:

| Tag-Code | DE | Typ |
|---|---|---|
| `high_protein` | Proteinreich | diet/fitness |
| `low_carb` | Low-Carb | diet |
| `low_fat` | Fettarm | diet |
| `high_fiber` | Ballaststoffreich | diet |
| `vegan` | Vegan | diet |
| `vegetarian` | Vegetarisch | diet |
| `gluten_free` | Glutenfrei | diet |
| `lactose_free` | Laktosefrei | diet |
| `nut_free` | Nussfrei | allergen |
| `halal` | Halal | religiös/kulturell |
| `kosher` | Koscher | religiös/kulturell |
| `spicy` | Scharf | Merkmal |
| `thai_food` | Thai Food | Küche |
| `mediterranean` | Mediterran | Küche |
| `processed_food` | Verarbeitet | processing |
| `ultra_processed` | Hochverarbeitet | processing |

**`processed_food`** entspricht `processed` in SPEC_05 (Alias/Mapping: processed_food → processed-Kategorie in Tag-System).

Auto-Tagging für V1 user-visible Tags:
- `high_protein`: PROT625 ≥ 20g/100g
- `low_carb`: CHO ≤ 10g/100g
- `low_fat`: FAT ≤ 3g/100g
- `high_fiber`: FIBT ≥ 6g/100g
- `vegan` / `vegetarian`: abgeleitet aus ingredient-Tags (kein Fleisch/Fisch/Ei/Milch)
- `gluten_free`: NOT allergen_gluten
- `lactose_free`: NOT allergen_milk
- `nut_free`: NOT allergen_nuts AND NOT peanuts
- `halal` / `kosher`: manuell annotiert (nicht auto-ableitbar aus BLS)
- `spicy`: manuell annotiert
- `thai_food`: manuell annotiert (BLS hat keine Thai-Food-Kennung)
- `mediterranean`: manuell annotiert (Fisch + Olivenöl + Hülsenfrüchte + Vollkorn)
- `processed_food`: processing_level = 'processed'
- `ultra_processed`: processing_level = 'ultra_processed'

### Phase 2 — Profi-/Gym-/Medical-Tags (NICHT V1)

> **Phase 2:** Alle 100+ Ingredient-, Fitness-, Gym-, Medical- und Allergen-Detail-Tags
> aus SPEC_05 sind Phase 2. Sie existieren intern als Tag-Definitionen und werden
> beim Import via Auto-Tagging-Trigger befüllt, aber nicht für User-Filter angezeigt.
>
> Interne Tags (allergen_*, ingredient-Tags) können für Smart-Search-Ausschluss genutzt werden,
> sind aber nicht als UI-Filteroptionen sichtbar.
>
> Verbindlich: NUTRITION_NEXT_SPEC_DECISIONS.md §5

**Auto-generiert via Trigger** bei INSERT/UPDATE von foods. Der Auto-Tag-Trigger (SPEC_06) befüllt alle internen Tags. V1 user-visible Tags sind ein Subset davon.

---

## Feature 4: Custom Foods

User-erstellte Lebensmittel. **Vollständig getrennt von BLS-Daten** — keine Durchmischung.

**Erstellungs-Wege:**
1. Manuell (Formular)
2. Barcode-Scan → Custom Food identifizieren oder neu erstellen (siehe unten)
3. MealCam → unsicheres Ergebnis → als Custom speichern

**Pflichtfelder:** `name_de`, `enercc`, `prot625`, `fat`, `cho`
**Optional:** alle weiteren Makros, Mikro-Subset, `barcode`, `brand`, `serving_size_g`, `custom_allergens`

**Sichtbarkeit:** Nur der erstellende User. In Food Search immer zuerst (`is_custom DESC`).
Custom Foods brauchen keine Tags — Allergen-Ausschluss läuft über `custom_allergens[]`.

**3-Sprachig:** `name_de` Pflicht, `name_en` und `name_th` optional.

### Barcode-Scanning (Custom Food Identifier)

> ⚠️ **Phase 2** — Barcode Scanner ist nicht V1.
> Verbindlich: ADR_MEALCAM_V1.md und NUTRITION_NEXT_SPEC_DECISIONS.md §1.
>
> Das Konzept (Barcode als Custom-Food-Identifier, kein OpenFoodFacts-Lookup)
> ist in ADR_IMPROVEMENTS_PACKAGE.md #19 dokumentiert und für Phase 2 vorgesehen.


### Allergene in Custom Foods

Custom Foods bekommen `custom_allergens TEXT[]`.
Im Formular: EU-14 Checkboxen auswählbar.
Smart Search filtert `custom_allergens` identisch zu BLS `allergen_*` Tags.

---

## Feature 5: Meal Logging (Diary)

**Formel:** `meal_item.nutrient = food.nutrient × (amount_g / 100)`

**Eingefroren beim Erstellen:**
- Alle direkten Makro-Spalten (enercc, prot625, fat, cho, fibt, sugar, fasat, nacl, water_g, alc)
- Vollständiger `nutrients JSONB` Snapshot: alle non-null BLS-Nährstoffe skaliert auf amount_g
- Basis für alle Berichte, Diagramme, Mikro-Dashboard, Medical-Modul

**Meal Types:** `breakfast | lunch | dinner | snack | pre_workout | post_workout | other`

> **Offline-Fähigkeit: V2.** V1 erfordert aktive Verbindung zu `nutrition:5100`.
> Offline-Queue + Sync-Mechanismus werden in V2 spezifiziert.

---

## Feature 5a: Quick-Add Makros (ohne Food-Suche)

Direktes Eingeben von Makros ohne spezifisches Food auszuwählen.
Für Power-User die Meal Prep in Bulk tracken oder schnell loggen wollen.

**UI:**
```
+ Schnell-Makros
─────────────────────────────────
Kalorien:      [___] kcal
Protein:       [___] g
Kohlenhydrate: [___] g
Fett:          [___] g
Label:         [___] z.B. "Meal Prep Bowl"
[Hinzufügen]
```

**Technisch:** MealItem ohne `food_id` / `custom_food_id`:
- `food_source = 'manual'`
- `food_name = user-eingegebenes Label` (Default: "Manuelle Eingabe")
- `nutrients JSONB = {}` (leer — keine Mikros verfügbar)
- Direkte Makro-Spalten werden befüllt (enercc, prot625, fat, cho)

**Hinweis:** Quick-Add Makros erzeugen keine Mikronährstoff-Daten.
Das MicroDashboard zeigt diese Einträge als "keine Mikro-Daten" an.

---

## Feature 6: Rezepte + Einkaufslisten

**Rezepte:**
- User-erstellte Verbund-Foods aus mehreren BLS-Foods
- Pre-computed Totals via Trigger (Recipe.total_* auto-update bei Zutaten-Änderungen)
- Generated Columns für per-Portion-Werte (keine Divisions-Bugs im App-Code)
- Quellen: `user | coach | marketplace | buddy` — identisches Schema
- **Ghost Entries aus Rezepten:** Alle Zutaten werden einzeln angezeigt und sind
  einzeln anpassbar. Das Rezept ist eine Vorlage — beim Loggen entsteht ein
  MealItem pro Zutat. Siehe ADR_GHOST_ENTRY_RECIPE.md

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

**Immutabilität nach Aktivierung:**
MealPlanItems sind READ-ONLY sobald der Plan `status: active` hat.
Änderungen erfordern: Plan pausieren → Kopie erstellen → bearbeiten → neu aktivieren.
Schützt die Compliance-History und Deviation-Berechnungen.
Siehe ADR_IMPROVEMENTS_PACKAGE.md #17.

---

## Feature 8: Water Tracking

**Target:** von Goals geliefert (wissenschaftlich aus Gewicht + Training + Recovery + Umgebung)
**Quick-Add:** 250ml, 500ml, 750ml, 1.000ml (konfigurierbar via Settings)
**Pending Action:** wenn < 80% des Tagesziels nach 18:00 Uhr

**Gesamt-Hydration:** Dashboard zeigt explizit geloggtes Wasser + Wasser aus Nahrung (aus
`meal_items.water_g` via DailyNutritionSummary). Beide Quellen werden separat ausgewiesen.
Ziel-Erreichung basiert auf Gesamt-Hydration. Siehe ADR_WATER_TOTAL_HYDRATION.md.

---

## Feature 9: MealCam (KI-Erkennung)

**Tech:** Vision-Provider TBD (Entscheidung vor Implementierung — siehe ADR_MEALCAM_V1.md)
**Usage:** Jeder Scan wird in `usage_events` geloggt (event_type: `mealcam_scan`).

| Level | Schwelle | Aktion |
|---|---|---|
| HIGH | ≥ 0.75 | Grün markiert in Confirmation — **User-Klick ist immer erforderlich** |
| SUGGEST | 0.50–0.74 | Gelb markiert — "Bitte prüfen" Hinweis |
| LOW | < 0.50 | Rot markiert — "Niedrige Sicherheit — manuell prüfen" — kein Auto-Add |

> **Wichtig:** AUTO_ACCEPT existiert nicht in V1. Auch bei HIGH Confidence wird
> das Item nicht automatisch ins Diary übernommen. User muss immer auf "Alles
> hinzufügen" tippen (Schritt in MealCamConfirmation).
> Verbindlich: ADR_MEALCAM_V1.md

Im MealPlan-Kontext: erkannte Foods werden mit Ghost Entry verglichen (Match, Abweichung, Fehlt, Extra).

---

## Feature 10: Mikronährstoff-Tracking (3-Tier)

| Tier | Inhalt | Ziel-Sichtbarkeit (Endausbau) |
|---|---|---|
| 1 — Essential | Ca, Fe, Mg, P, K, Zn, Vit A/D/E/K/C/B1/B2/B3/B6 (15) | Alle User |
| 2 — Athlete | Cu, Mn, Se, Iod, Folat, B12, B5, Biotin (+8) | Plus-Tier |
| 3 — Medical | Alle 138 BLS-Nährstoffe inkl. Aminosäuren, Fettsäuren (100+) | Pro-Tier |

> **V1: Alle Tiers sind ohne Einschränkung sichtbar.** Subscription-Gates werden
> erst implementiert wenn Monetarisierung steht. `show_micros_tier` Setting ist
> frei konfigurierbar. Siehe ADR: SUBSCRIPTION_GATES_ADR.md.

**Berechnung:** Aus `nutrients JSONB` in meal_items (vollständiger Snapshot → kein Join nötig)
**MicroFlags:** Deficit/Surplus mit Severity. An Medical-Modul gesendet.

---

## Feature 11: Nutrition Score (Pure Function)

```typescript
score = (
  protein_compliance × 0.30 +
  calorie_compliance × 0.25 +
  carbs_compliance   × 0.15 +
  fat_compliance     × 0.15 +
  fiber_compliance   × 0.15
) × level_multiplier × 100

level_multiplier: beginner 0.75 | intermediate 0.90 | advanced 1.00 | elite 1.10
thresholds: ok ≥ 80 | warn 50–79 | block < 50
```

**user_level — Quelle und Regeln:**
- `user_level` kommt aus dem **User-Profil / Auth-Modul** (nicht aus Nutrition)
- Nutrition setzt `user_level` nicht und speichert es nicht selbst
- V1 Default: `intermediate` (multiplier = 0.90) wenn kein Profil-Wert vorhanden
- Fallback-Multiplier bei fehlendem Profil: `0.90`
- Nutrition liest `user_level` beim Score-Aufruf aus dem Auth-Modul
  (`GET http://auth:4200/api/users/:uid/profile` → `experience_level`)

Deterministisch. Kein AI. Testbar.

---

## Feature 12: Food Preferences

**Ebenen:** diet_type (global) → category (like/dislike) → tag (like/dislike) → food (like/dislike)
**Allergene:** Harte Ausschlüsse — kein Scoring-Override möglich.
**Gilt für BLS Foods (via food_tags) und Custom Foods (via custom_allergens[]).**
**Priorität:** food > category > tag (Spezifischeres schlägt Allgemeineres)

---

## Feature 13: Daily Summary + Aggregates

`daily_nutrition_summary` VIEW — Makros aus direkten Spalten, Mikros aus JSONB.
Zeitraum-Aggregation via `GET /api/nutrition/summary/range`.
`for-goals` Endpoint für Goals-Compliance-Export.
`for-ai` Endpoint für Buddy-Kontext (kompakt).

**Water Summary:** Enthält `water_logged_ml` (explizit) + `water_food_ml` (aus Nahrung)
+ `water_total_ml` (Summe) für Gesamt-Hydration-Anzeige.

---

## Feature 14: Pending Actions

`GET /api/nutrition/pending-actions` — offene User-Actions für Buddy's Tages-TODO.
Auslöser: pending Ghost Entries, Water total < 80% nach 18h, kein Meal vor 14h.

---

## Feature 15: Settings (Key-Value Store)

| Key | Default | Beschreibung |
|---|---|---|
| `meal_schedule` | 5 Mahlzeiten | Zeitplan mit Namen + Uhrzeiten |
| `morning_weigh_in` | false | Gewicht täglich morgens tracken |
| `water_quick_amounts` | [250,500,750,1000] | Quick-Add Mengen ml |
| `show_micros_tier` | 1 | Angezeigtes Mikro-Tier (1/2/3) — V1 ohne Gate |
| `mealcam_threshold` | 0.85 | Auto-Accept Confidence |
| `meal_plan_confirm_mode` | ask | mealcam / manual / ask |
