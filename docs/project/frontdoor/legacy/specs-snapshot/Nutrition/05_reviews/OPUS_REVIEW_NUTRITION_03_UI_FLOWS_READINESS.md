# OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md

> Review 3 — User Flows, Features, Food Tags, UI Components, Onboarding, Settings, MealCam UX, Coach Suggestions UX, Workorder Readiness
> Reviewer: Opus | Datum: 2026-05-02
> Scope: nur Nutrition Spec Pfad (`docs/specs/Nutrition/`)
> Gelesen: `NUTRITION_NEXT_SPEC_DECISIONS.md`, `INDEX.md`, `SPEC_03_USER_FLOWS.md`, `SPEC_04_FEATURES.md`, `SPEC_05_FOOD_TAXONOMY.md`, `SPEC_10_COMPONENTS.md`, `SPEC_10_PASS2_PATCH.md`, `SPEC_06_RECALCULATE_PATCH.md`, ADRs (`NUTRITION_PREFERENCES_V1`, `MEALCAM_V1`, `MEALCAM_CONSENT`, `COACH_PERMISSIONS_V1`, `RECIPES_SCHEMA_ONLY`)

---

## Executive Verdict

**PASS_WITH_FIXES**

Das Pass-2-UI-Modell deckt MealCam V1, Nutrition Preferences (Onboarding + Settings), Coach Suggestions, Portions und Micronutrient Review als Komponenten ab. SPEC_10_PASS2_PATCH.md ist umfangreich und konsistent mit den V1-Entscheidungen.

Trotzdem gibt es **drei kritische Lücken** vor der Workorder-Generierung:

1. **MealCam Auto-Accept widerspricht ADR_MEALCAM_V1.** SPEC_03 §Flow 2 und SPEC_04 §Feature 9 beschreiben einen `AUTO_ACCEPT ≥ 0.85` Pfad ("Sofort übernehmen"), während `ADR_MEALCAM_V1.md` explizit fordert: "MealCam darf NIE automatisch finale Meal Items schreiben." SPEC_10_PASS2_PATCH.md ist mit dem ADR konsistent (User-Klick erforderlich), die älteren Specs jedoch nicht.
2. **Food-Tag-Set V1 ist nicht eindeutig.** `NUTRITION_NEXT_SPEC_DECISIONS.md §5` listet 16 V1-Tags (inkl. `nut_free`, `halal`, `kosher`, `spicy`, `thai_food`). SPEC_04 §Feature 3 und SPEC_05 §Semantic Tags listen 100+ Tags als "Phase 1 zum Launch", inkl. esoterische Gym-Tags wie `creatine_source`, `cortisol_management`, `recomp`. Halal/Kosher stehen in SPEC_05 in Phase 3, was wiederum Decisions widerspricht. Ein definitiver V1-Tag-Set ist nicht belegt.
3. **Onboarding Flow für Nutrition Preferences fehlt in SPEC_03.** SPEC_10_PASS2 definiert die Components (`OnboardingPreferencesStep` + 9 Sub-Components, 4 Steps), aber `SPEC_03_USER_FLOWS.md` enthält **keinen** dedizierten Onboarding-Flow. Flow 9 deckt nur die Settings-Pflege ab. Wann das Onboarding ausgelöst wird, was passiert wenn User abbricht, wie der Übergang Onboarding → Diary läuft — nicht belegt.

Plus 7 Important Findings (Recalculate-UI fehlt, MealCam Consent-Widerruf-UI fehlt, Coach Suggestion User-Flow fehlt, Recipes/Shopping/MealPlans ohne V1-Marker in SPEC_10, Barcode-Flow in SPEC_03 trotz Phase-2-Status, Score-Level-Multiplier inkonsistent zwischen SPEC_04 und SPEC_07, fehlender Admin-Override-Flow für Tag-Korrekturen).

Keine fundamentalen Component-Lücken. Thai i18n korrekt als disabled beschrieben. Allergien/Unverträglichkeiten/Likes/Dislikes/religiöse Einschränkungen alle sichtbar im Onboarding (jedoch in Settings teilweise nur implizit über `PreferencesView (erweitert)`).

---

## Critical Findings

### CRIT-1 — MealCam Auto-Accept widerspricht ADR_MEALCAM_V1

`ADR_MEALCAM_V1.md` "V1 MealCam Flow":
> User bestätigt/korrigiert jedes Item einzeln
> Erst nach User-Bestätigung: Meal Item erstellen
> **MealCam darf NIE automatisch finale Meal Items schreiben.**

`NUTRITION_NEXT_SPEC_DECISIONS.md §18`:
> User muss jedes erkannte Item bestätigen
> niedrige Confidence blockiert automatisches Hinzufügen

`SPEC_03_USER_FLOWS.md §Flow 2 (MealCam ohne Plan)`:
> Confidence ≥ 0.85 (AUTO_ACCEPT):
> → Erkannte Foods direkt als Vorschlag
> → User kann Mengen anpassen
> → "Hinzufügen" → MealItems erstellt

`SPEC_04_FEATURES.md §Feature 9 (MealCam)`:
> | AUTO_ACCEPT | ≥ 0.85 | **Sofort übernehmen** |

SPEC_03 ist mehrdeutig ("als Vorschlag" + "Hinzufügen" erfordert Klick), aber SPEC_04 sagt explizit "Sofort übernehmen". Das widerspricht dem ADR.

`SPEC_10_PASS2_PATCH.md` (korrigiert):
> | ≥ 0.75 | 🟢 Grün | Item direkt in Confirmation |
> "Alles hinzufügen" ist ein bewusster User-Klick.

SPEC_10_PASS2 ist mit dem ADR konsistent. SPEC_03 und SPEC_04 sind es nicht.

**Konsequenz:** Workorder-Generator könnte einen Auto-Accept-Pfad implementieren, der die ADR-Regel verletzt. Datenintegrität (Diary nur mit User-Bestätigung) wäre kompromittiert.

### CRIT-2 — Food-Tag-Set V1 widersprüchlich definiert

Drei Quellen mit unterschiedlichen Tag-Listen:

**`NUTRITION_NEXT_SPEC_DECISIONS.md §5` — V1 Tags (16):**
```
high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian,
gluten_free, lactose_free, nut_free, halal, kosher, spicy,
thai_food, mediterranean, processed_food, ultra_processed
```

**`SPEC_04_FEATURES.md §Feature 3` — "Phase 1 Tags (zum Launch)" (100+):**
- Listet ingredient, diet, allergen, fitness, gym, processing Kategorien mit insgesamt über 100 Tags.
- Enthält esoterische Tags wie `creatine_source`, `carnitine_source`, `cortisol_management`, `insulin_sensitivity`, `bcaa_rich`, `leucine_rich`, `pre_workout_carbs`, `post_workout_recovery`, `contest_prep`, `powerlifting_bulk`.
- Nennt `halal`, `kosher` explizit als **Phase 3** (entgegen Decisions).

**`SPEC_05_FOOD_TAXONOMY.md` — Tags, vollständiger Profi-Katalog:**
- Listet identische Tag-Liste wie SPEC_04 (Phase 1 zum Launch).
- Nennt `halal`, `kosher` als Phase 3.
- `nut_free`, `spicy`, `thai_food` aus Decisions §5 fehlen komplett oder sind nur indirekt abbildbar (z. B. `nut_free` ⇔ NOT `allergen_nuts`).

**Konflikte:**

| Tag | Decisions §5 (V1) | SPEC_04/05 |
|---|---|---|
| `nut_free` | V1 | nicht belegt (nur `allergen_nuts` als Negation) |
| `halal` | V1 | Phase 3 |
| `kosher` | V1 | Phase 3 |
| `spicy` | V1 | nicht belegt |
| `thai_food` | V1 | nicht belegt |
| `processed_food` | V1 | `processed` (anders benannt) |
| `creatine_source` | nicht in Decisions | "Phase 1 zum Launch" in SPEC_05 |
| `cortisol_management` | nicht in Decisions | "Phase 1" |
| `pre_workout_carbs` | nicht in Decisions | "Phase 1" |

**Konsequenz:** Nicht klar, was V1 Tag-WOs umfassen sollen. Auto-Tag-Trigger in `SPEC_06` ist auf SPEC-04/05-Tags ausgerichtet. Workorders auf Tag-bezogene Features (Filter-UI, Smart Search Boost, Auto-Tagging) sind blockiert bis V1-Tag-Set entschieden ist.

### CRIT-3 — Onboarding Flow für Nutrition Preferences fehlt in SPEC_03

`NUTRITION_NEXT_SPEC_DECISIONS.md §6` und `ADR_NUTRITION_PREFERENCES_V1.md` fordern einen Onboarding-Flow für:
- Allergien (Hard)
- Unverträglichkeiten (Strong)
- Ernährungsform / Diät-Stil
- Religiöse/kulturelle Einschränkungen (Hard wenn User so setzt)
- No-Go-Lebensmittel
- Likes / Dislikes
- Bevorzugte Küchen
- Meal-Slots
- Zielrichtung

`SPEC_10_PASS2_PATCH.md` definiert dafür:
- 9 Components (`OnboardingPreferencesStep`, `DietTypeSelector`, `AllergenSelector`, `IntoleranceSelector`, `ReligiousDietarySelector`, `FoodLikesInput`, `FoodDislikesInput`, `MealSlotEditor`, `CuisinePreferenceSelector`)
- 4 Onboarding-Steps (Diät+Allergien+Unverträglichkeiten → Religiös → Likes/Dislikes → Meal-Slots+Ziel)

`SPEC_03_USER_FLOWS.md` enthält **keinen** dedizierten Onboarding-Flow:
- Flow 9 "Food Preferences setzen" beschreibt **Settings-Pflege**, nicht erstmaliges Onboarding.
- Kein Trigger-Event spezifiziert (z. B. "nach Sign-up", "vor erstem Diary-Tag").
- Kein Abbruch-/Skip-Verhalten dokumentiert.
- Kein Übergang spezifiziert (Onboarding → Diary, oder Onboarding → Goals → Diary?).
- Validierung pro Step (Pflicht- vs. Optional-Felder) nicht dokumentiert.
- Wiederaufnahme bei Abbruch (`onboarding_complete = false`) nicht beschrieben.

**Konsequenz:** Workorders für Onboarding-Components sind ohne Flow nicht klar abgrenzbar. UX-Entscheidungen (Step-Reihenfolge, Skippability, Wiederaufnahme) sind offen.

---

## Important Findings

### IMP-1 — Recalculate-UI in SPEC_10 fehlt (bekanntes Open Item)

`SPEC_06_RECALCULATE_PATCH.md` §Offene Punkte:
> [ ] Recalculate-UI in Meal Item Editor ergänzen
>     (SPEC_10: "Neu berechnen" Button wenn Food-Daten neuer als Snapshot)

API-Endpoints existieren:
- `POST /api/nutrition/meal-items/:id/recalculate`
- `POST /api/nutrition/meals/:id/recalculate`

Components fehlen in `SPEC_10_COMPONENTS.md` und `SPEC_10_PASS2_PATCH.md`:
- Kein `MealItemRecalculateButton` o. ä.
- Kein `MealRecalculateModal` (für Batch-Recalculate eines Meals)
- Kein Hook (z. B. `useMealItemRecalculate`)
- Kein Trigger-Mechanismus dokumentiert: Wann erscheint der Button? Soll System Veränderungen am Food erkennen und User benachrichtigen? Nicht belegt.

User Flow für Recalculate fehlt vollständig.

### IMP-2 — MealCam Consent-Widerruf in Nutrition Settings nicht beschrieben

`ADR_MEALCAM_CONSENT.md`:
> User kann Freigabe jederzeit widerrufen.

`SPEC_10_PASS2_PATCH.md` definiert nur `MealCamConsentBanner` (nach Confirmation, Opt-in für einzelne Bilder bzw. global). Es fehlt:
- Settings-Component für globale Verwaltung (z. B. `MealCamConsentSettings`)
- Liste aller Bilder mit Consent-Status pro Bild (zumindest aggregiert: "X Bilder im Trainings-Pool")
- Bulk-Widerruf-Button ("Alle Bilder aus Trainings-Pool entfernen")
- Settings-Pfad für Coach-Bild-Freigabe (separat von Training-Consent)

`SPEC_03_USER_FLOWS.md` hat keinen Consent-Flow.

`SPEC_07_PASS2_PATCH.md §4` Schritt 5 hat `POST /mealcam/scan/:id/consent` für einzelnen Scan, aber kein globales Widerruf-Endpoint und kein "Alle Bilder löschen"-Endpoint.

**Konsequenz:** Datenschutz-Anforderung "jederzeit widerrufen" ist nur teilweise umsetzbar. Compliance-Lücke.

### IMP-3 — Coach Suggestion User Flow fehlt

`SPEC_10_PASS2_PATCH.md` definiert UI-Components:
- `CoachSuggestionBadge`
- `CoachSuggestionList`
- `CoachSuggestionCard`
- `SuggestionTypeDisplay`

Es gibt aber keinen User Flow in `SPEC_03_USER_FLOWS.md` der beschreibt:
- Wann erscheinen Suggestions im UI? (Push? In-App-Banner? Tab-Badge?)
- Wie navigiert User zur Suggestion-Liste?
- Was passiert nach Accept/Reject? (UI-Feedback, sofortige Wirkung, Coach-Notification?)
- Wie wird `expired`-Status visualisiert vs. ignoriert?
- Per-Type-Akzeptanz-Verhalten (`nutrition_target` setzt Target sofort, `food_alternative` ist nur Info — wie unterscheidbar?)
- Kann User Begründung für Reject hinterlegen? (Schema hat `decision_note` — UI nicht beschrieben.)

`SPEC_07_PASS2_PATCH.md §6` hat API-Endpoints, aber UI-Flow fehlt.

### IMP-4 — V1-Status-Marker fehlen für Recipes/Shopping/MealPlans Components in SPEC_10

`ADR_RECIPES_SCHEMA_ONLY.md`:
> V1: Schema vorbereiten — kein Full-UI, kein Full-API Pflicht.
> Wenn Zeit knapp: Recipes, Meal Plans und Shopping Lists komplett auf Phase 2 verschoben.

`SPEC_10_COMPONENTS.md` listet:
- 5 Recipe Components (`RecipeList`, `RecipeCard`, `RecipeBuilder`, `RecipeDetail`, `RecipeLogModal`)
- 3 Shopping List Components (`ShoppingListView`, `ShoppingListDetail`, `ShoppingListItem`)
- 8 Meal Plan Components (`MealPlanList`, `MealPlanCard`, ...)

Ohne V1-Status-Hinweis. Reader interpretiert sie als V1-Pflicht.

`SPEC_10_PASS2_PATCH.md` adressiert das nicht. Der Pass-2-Patch ergänzt nur neue Components.

`SPEC_03_USER_FLOWS.md §Flow 7` (Rezepte) und §Flow 8 (Einkaufsliste) sind als komplette V1-Flows beschrieben — ohne Phase-2-Markierung.

**Konsequenz:** WO-Generator könnte vollen Recipe-Builder als V1-Pflicht-WO schreiben, obwohl ADR sagt: optional.

### IMP-5 — SPEC_03 §Flow 6 Custom Food erstellen via Barcode-Scan widerspricht Phase-2-Status

`NUTRITION_NEXT_SPEC_DECISIONS.md §1` und `§23`: Barcode Scanner ist Phase 2.
`ADR_MEALCAM_V1.md`: Barcode Scanner ist Phase 2.

`SPEC_03_USER_FLOWS.md §Flow 6 (Custom Food erstellen)`:
> 1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
>    ODER: **Barcode-Scan** → nicht gefunden → "Custom erstellen"
>    ODER: direkt über "+ Eigenes Food" Button

`SPEC_04_FEATURES.md §Feature 4 (Custom Foods)` listet Barcode-Scanning als V1-Feature ("Erstellungs-Wege: 2. Barcode-Scan"). Bezieht sich auf `ADR_IMPROVEMENTS_PACKAGE.md #19` (außerhalb dieses Review-Scopes, aber in Review 1 als Phase-2-konfliktig markiert).

**Konsequenz:** UI-Komponenten könnten Barcode-Scan-Einstieg implementieren, was Phase 2 ist.

### IMP-6 — Score Level Multiplier inkonsistent zwischen SPEC_04 und SPEC_07

`SPEC_04_FEATURES.md §Feature 11 (Nutrition Score)`:
> level_multiplier: beginner 0.75 | intermediate 0.90 | advanced 1.00 | **elite 1.10**

`SPEC_07_API.md §8 Score Response`:
```json
{
  "level_multiplier": 0.90,
  "user_level": "intermediate"
}
```

Vier Level in SPEC_04 (beginner/intermediate/advanced/elite). SPEC_07-Response zeigt nur `intermediate` als Beispiel. Es ist nicht spezifiziert, woher `user_level` kommt — User-Profil-Feld? Wo gepflegt? Settings-UI? Nicht belegt.

`SPEC_10` `NutritionScoreCard` zeigt Score 0–100 + Status, aber keine UI für Level-Multiplier-Erklärung oder -Auswahl.

**Konsequenz:** Score-Berechnung hat externen Input (`user_level`), dessen UI-/API-Pfad nicht spezifiziert ist. Workorder ist blockiert bis das geklärt ist.

### IMP-7 — Admin-Override-Flow für Tag-Korrekturen nicht belegt

`NUTRITION_NEXT_SPEC_DECISIONS.md §5`:
> manuell gepflegte Tag-Liste für schwierige Tags
> Admin darf Tags bei BLS Foods korrigieren
> User darf Tags bei Custom Foods selbst setzen

`SPEC_06_DATABASE_SCHEMA.md` Trigger `auto_tag_food` — automatisch.
Manueller Override-Mechanismus für Admin nicht belegt:
- Kein Admin-API-Endpoint in SPEC_07 oder SPEC_07_PASS2_PATCH (nicht belegt)
- Kein Admin-UI in SPEC_10 (nicht belegt)
- Trigger löscht alle bestehenden Tags vor INSERT (`DELETE FROM food_tags WHERE food_id = p_food_id;`) — dadurch würde ein manueller Admin-Override beim nächsten `UPDATE foods` automatisch überschrieben.

User-Tags für Custom Foods:
- Decisions §5: "User darf Tags bei Custom Foods selbst setzen"
- `foods_custom` hat `custom_allergens TEXT[]` (EU-14 Allergene), aber kein generisches Tag-Feld.
- Kein API-Endpoint für `POST /foods/custom/:id/tags` in SPEC_07.

**Konsequenz:** Wenn V1 Admin-Tag-Korrekturen oder User-Custom-Tags verlangt, sind diese Pfade nicht implementierbar.

---

## Minor Findings

### MIN-1 — `nutrition.water/page.tsx` und `nutrition.shopping-lists/page.tsx` als separate Pages

`SPEC_10_COMPONENTS.md §Verzeichnisstruktur` listet zwei separate Pages neben der 5-Tab-Hauptseite. Wenn Shopping Lists schema-only V1 sind, ist eine eigene Page-Datei doppelte Struktur. Konsistenz mit V1-Status (siehe IMP-4) nicht klar.

### MIN-2 — `SPEC_04 §Feature 9 MealCam` referenziert `ADR_AI_USAGE_WALLET.md` — nicht im Nutrition Spec Pfad

`SPEC_04 Feature 9`:
> Jeder Scan wird in `usage_events` geloggt (event_type: `mealcam_scan`).
> Basis für spätere Wallet-Abrechnung. Siehe ADR_AI_USAGE_WALLET.md.

Die ADR-Datei existiert nicht im Nutrition Spec Pfad (Glob-Liste enthält sie nicht). Ist `usage_events` ein Cross-Modul-Konzept oder nutritionsspezifisch? Nicht belegt im Review-Scope.

V1-Wirkung: Wenn Wallet-Logik V1 erforderlich ist, fehlt sie in Specs. Wenn nicht V1, sollte Hinweis "Phase 2" beigefügt werden.

### MIN-3 — Quick-Add Makros UI-Component fehlt in SPEC_10

`SPEC_04 §Feature 5a (Quick-Add Makros)` und `ADR_IMPROVEMENTS_PACKAGE.md #14` (außerhalb Scope) beschreiben einen `QuickMacroEntry` Component. `INDEX.md` (Review 1 Scope) listet `SPEC_10_PATCH_APRIL2026.md` mit "QuickMacroEntry" als Patch.

`SPEC_10_COMPONENTS.md` und `SPEC_10_PASS2_PATCH.md` enthalten **keinen** `QuickMacroEntry` Component. Diary-Components-Liste (10 Items) enthält ihn nicht.

V1-Status von Quick-Add Makros: nicht belegt explizit (SPEC_04 als Feature 5a beschrieben, aber nicht als V1-Pflicht markiert).

### MIN-4 — `MealSlotEditor` Component-Name doppelt verwendet

In `SPEC_10_COMPONENTS.md` §Settings/Preferences Components:
> `MealScheduleEditor` | Mahlzeiten-Zeitplan konfigurieren

In `SPEC_10_PASS2_PATCH.md` §Onboarding Components:
> `MealSlotEditor` | Meal-Slots konfigurieren: Zeiten, Namen, aktivieren/deaktivieren

Sind das die gleichen Components mit unterschiedlichen Namen oder zwei verschiedene? Nicht belegt.

### MIN-5 — `IntoleranceSelector` und `ReligiousDietarySelector` nur als Onboarding-Components definiert

`SPEC_10_PASS2_PATCH.md` listet diese Components unter "Nutrition Preferences — Onboarding Components". Settings-Components-Block listet nur `PreferencesView (erweitert)`, `ExcludedFoodsManager`, `PreferredFoodsManager`, `CoachPermissionsPanel`.

Decisions §6 fordert: "In den Nutrition Settings kann der User diese Angaben später bearbeiten" inkl. Allergien, Unverträglichkeiten, Religiös. Wird `IntoleranceSelector` und `ReligiousDietarySelector` von Onboarding und Settings beide verwendet? Nicht explizit belegt.

### MIN-6 — `MicroDashboard` Tier-System (Tier 1/2/3) und Subscription-Gates ungeklärt

`SPEC_04 §Feature 10`:
> V1: Alle Tiers sind ohne Einschränkung sichtbar.
> Subscription-Gates werden erst implementiert wenn Monetarisierung steht.
> `show_micros_tier` Setting ist frei konfigurierbar.

`SPEC_10` MicroDashboard zeigt Tier-System ohne Gating-Hinweis. UI-Verhalten bei `show_micros_tier = 1`: nicht spezifiziert.

### MIN-7 — `SmartSuggestions` Component und `useSmartSearchSuggestions` Hook ohne klaren V1-Trigger

`SPEC_10` listet `SmartSuggestions` (Component) und `useSmartSearchSuggestions` (Hook). Wann werden Suggestions angezeigt? Auf welcher Seite? Nicht belegt in `SPEC_03_USER_FLOWS.md`.

Decisions §6 erwähnt "Food Suggestions" als Effekt von Preferences — aber UI-Trigger und Platzierung unklar.

### MIN-8 — `data/nutrientDetails.ts` als statisches Array — `food_sources` Array veraltet (per Review 1 ADR_IMPROVEMENTS_PACKAGE #20)

SPEC_10 dokumentiert `food_sources: string[]` als statisches Array. ADR_IMPROVEMENTS_PACKAGE #20 (Review-1-Scope) ersetzt das durch dynamischen Endpoint. Diese Korrektur wurde in `INDEX.md` als Pass-1-Patch eingearbeitet, aber `SPEC_10_COMPONENTS.md` zeigt noch das alte Array. SPEC_10_PASS2_PATCH ergänzt nichts dazu.

### MIN-9 — `Plan.source = 'buddy'` in SPEC_10 ohne UI-Trigger

`SPEC_10 §MealPlanComponents` listet `MealPlanList` mit "Source-Badge". Source-Werte: `user | coach | marketplace | buddy`. Decisions §1: "Buddy MealPlan Builder" ist Phase 2.

UI zeigt also einen Quellentyp, dessen Erzeugungs-Flow Phase 2 ist. Konsistent mit `MealPlanCard` (Anzeige), aber widersprüchlich für UX-Erwartung (User sieht Buddy-Plan-Quelle, kann sie aber nicht erzeugen).

---

## Missing User Flows

Folgende Flows sind in `SPEC_03_USER_FLOWS.md` **nicht belegt** (oder nur teilweise):

| # | Flow | Wo wäre er nötig | Quelle die ihn fordert |
|---|---|---|---|
| 1 | **Onboarding Preferences (4-Step)** | SPEC_03 | Decisions §6, ADR_NUTRITION_PREFERENCES_V1, SPEC_10_PASS2 |
| 2 | **MealCam Consent Flow** (Opt-in + Widerruf in Settings) | SPEC_03 + SPEC_10 (Settings) | Decisions §19, ADR_MEALCAM_CONSENT |
| 3 | **Recalculate Meal Item** (Trigger, UI, Bestätigung, History-Anzeige) | SPEC_03 + SPEC_10 | Decisions §12, SPEC_06_RECALCULATE_PATCH |
| 4 | **Coach Suggestion** (Erscheinen → Review → Accept/Reject → Effekt) | SPEC_03 | Decisions §22, ADR_COACH_PERMISSIONS_V1 |
| 5 | **Coach Permissions konfigurieren** (Toggle pro Bereich, Effekt-Erklärung) | SPEC_03 | Decisions §21, ADR_COACH_PERMISSIONS_V1 |
| 6 | **Micronutrient Review** (Tier-Auswahl, Supplements-API-Banner, UL-Warnung) | SPEC_03 | Decisions §7 |
| 7 | **Portions wählen + speichern** (recent_amount_g) | SPEC_03 | Decisions §10, SPEC_10_PASS2 |
| 8 | **Settings-Pfad** ("Wo finde ich was?") | SPEC_03 + SPEC_10 | Decisions §6 |
| 9 | **Custom Allergens setzen** (EU-14 Checkboxen) | SPEC_03 §Flow 6 | ADR_IMPROVEMENTS_PACKAGE #18 |
| 10 | **Quick-Add Makros UI** | SPEC_03 + SPEC_10 | SPEC_04 §Feature 5a, ADR_IMPROVEMENTS_PACKAGE #14 |

`SPEC_03_USER_FLOWS.md` deckt 14 Flows ab (Meal Logging, MealCam, Plan-Aktivierung, Ghost-Confirm, Water, Custom Food, Recipe, Shopping, Preferences-Settings, Day-Summary, Plan-Lifecycle, Pending Actions). Die zehn Flows oben fehlen oder sind nur in Components beschrieben — ohne User-Flow-Schritte.

---

## Scope Creep Risks

| Bereich | Risiko | Begründung |
|---|---|---|
| **Food Tag Set** | **Hoch** | SPEC_05 listet 100+ "Phase 1" Tags inkl. spezialisierte Gym/Medical-Tags (`creatine_source`, `cortisol_management`, `recomp`, `powerlifting_bulk`, `inflammation_reducer`). Decisions §5 listet 16 V1-Tags. Wenn alle SPEC-05-Tags V1 wären, blockiert das das BLS-Import-Skript bis alle Tags definiert sind. |
| **Recipes / Meal Plans / Shopping Lists Full UI** | **Hoch** | SPEC_10 listet 16 Components (5 Recipe + 3 Shopping + 8 MealPlan). ADR_RECIPES_SCHEMA_ONLY.md sagt "V1 schema-only, Phase 2 wenn Zeit knapp". Aktuell als V1 dokumentiert. |
| **Coach Suggestion Workflow** | **Mittel** | 9 Suggestion-Typen (siehe Entity 28 in Review 2). UI-Logik pro Typ ist unterschiedlich. Komplettes V1-Suggestion-System ist ambitioniert. |
| **MealCam Plan-Comparison** | **Mittel** | `MealCamPlanComparison` Component mit komplexer UI (Match/Abweichung/Fehlt/Extra) und `compare_with_plan` API-Parameter. V1-Pflicht oder Phase 2? Nicht belegt. |
| **Buddy/Marketplace Source Badges** | **Niedrig** | UI zeigt 4 Sources, aber Buddy-Erzeugung ist Phase 2 und Marketplace-Erzeugung erfordert Marketplace-Modul. |
| **Sort Weight System Editorial Pflege** | **Niedrig** | SPEC_05 §Sort Weight beschreibt detailliertes Scoring beim Import. Aufwand begrenzt auf Import-WO. |
| **138 Mikronährstoffe in nutrient_defs** | **Niedrig** | Tier-3 (alle 138) ist V1 ohne Subscription-Gate sichtbar. UI-Performance bei sehr großem MicroDashboard nicht belegt. |
| **i18n 400+ Keys** | **Niedrig** | DE/EN ausreichend; TH leer aber Key-Pflicht. SPEC_10 erwähnt 400+ Keys — verwaltbar mit Tooling. |

---

## Workorder Readiness

| Bereich | Ready? | Warum | Voraussetzung |
|---|---|---|---|
| **Food Search UI (BLS + Custom)** | ✅ Ja | Components, Hook, Flow vollständig | — |
| **Diary UI (Meals + Items)** | ⚠️ Teilweise | Components ✅, aber Recalculate-UI fehlt (IMP-1) | Recalculate-Component-Spec ergänzen |
| **Water Tracker UI** | ✅ Ja | WaterTracker, WaterQuickAdd, Flow 5 | — |
| **Targets UI (Read-only)** | ✅ Ja | implicit über NutritionScoreCard | — |
| **Custom Foods Form** | ⚠️ Teilweise | Components ✅, aber Allergen-Selector (`custom_allergens`) und Barcode-Phase-2-Klärung (IMP-5) | Custom Allergen UI definieren, Barcode aus Flow 6 entfernen |
| **Portions UI** | ✅ Ja | PortionSelector, Hooks, FoodAmountInput erweitert | — |
| **MealCam UI** | ❌ Nein | Auto-Accept-Konflikt mit ADR (CRIT-1); Consent-Settings-UI fehlt (IMP-2) | SPEC_03+SPEC_04 mit ADR synchronisieren; Consent-Settings-Component definieren |
| **Onboarding Preferences UI** | ❌ Nein | Onboarding User-Flow fehlt komplett in SPEC_03 (CRIT-3) | Flow ergänzen (Trigger, Steps, Validierung, Skip, Resume) |
| **Settings: Preferences UI** | ⚠️ Teilweise | Components ✅, aber Intoleranzen/Religiös in Settings nur implizit (MIN-5) | Settings-Components-Liste explizit ergänzen |
| **Coach Permissions Panel** | ⚠️ Teilweise | Component ✅, aber User-Flow fehlt | Flow ergänzen (Effekt der Toggles erklären) |
| **Coach Suggestions UI** | ❌ Nein | Components ✅, aber User-Flow fehlt (IMP-3) und Per-Type-Akzeptanz-Verhalten | Flow + Per-Type-Spec ergänzen |
| **Micronutrient Review UI** | ✅ Ja | MicroDashboard erweitert, MicroNutrientCard, ULWarningBar, SupplementDataBanner | RDA-Werte (bekannt aus Review 2 nicht V1-Blocker für UI selbst) |
| **Nutrition Score Card** | ⚠️ Teilweise | Component ✅, aber `user_level` UI-/API-Pfad ungeklärt (IMP-6) | level_multiplier-Quelle klären |
| **Food Tags V1** | ❌ Nein | V1-Tag-Set widersprüchlich (CRIT-2) | Decisions §5 vs. SPEC-04/05 entscheiden; auto-tag-Trigger reduzieren oder erweitern |
| **Auto-Tagging Trigger** | ⚠️ Teilweise | Trigger SQL ✅, aber abhängig von Tag-Set-Entscheidung (CRIT-2) | Tag-Set-Konflikt lösen |
| **Admin-Tag-Override** | ❌ Nein | Nicht belegt (IMP-7) | API + UI definieren oder explizit Phase 2 markieren |
| **Custom Food User-Tags** | ❌ Nein | Nur `custom_allergens` Feld, kein generisches Tag-System (IMP-7) | Decisions-Anforderung klären (Custom-Tag-Set) |
| **Recipe Builder UI (V1)** | ⚠️ Teilweise | Components ✅, aber V1-Status nicht markiert (IMP-4) | Phase-2-Marker setzen oder bestätigt V1 |
| **Shopping List UI (V1)** | ⚠️ Teilweise | Components ✅, V1-Status nicht markiert (IMP-4) | Phase-2-Marker setzen |
| **Meal Plan Activation UI** | ⚠️ Teilweise | Flow 3 + Components ✅, aber Schema-only-Status fehlt (IMP-4) | Phase-2-Marker setzen |
| **Ghost Entry Confirm/Skip UI** | ✅ Ja | Flow 4 (beide Cases) + Components vollständig | — |
| **Plan-Compliance UI** | ✅ Ja | MealPlanComplianceBar + Daily Summary | — |
| **Quick-Add Makros UI** | ❌ Nein | Component fehlt in SPEC_10 (MIN-3) | QuickMacroEntry-Component-Spec ergänzen |
| **Smart Suggestions UI** | ⚠️ Teilweise | Component ✅, Trigger/Platzierung unklar (MIN-7) | Flow ergänzen |
| **Thai i18n disabled UI** | ✅ Ja | SPEC_10_PASS2 §Thai-Verhalten + Decisions §16 | — |
| **MealCam Plan-Comparison** | ⚠️ Teilweise | Component ✅, V1-Status unklar (Scope Creep) | V1-vs-Phase-2-Entscheidung |

**Zusammenfassung Workorder-Readiness:**

| Status | Anzahl Bereiche |
|---|---|
| ✅ Ready | 7 |
| ⚠️ Teilweise (kleine Klarstellung nötig) | 11 |
| ❌ Nicht ready (kritische/wichtige Lücke) | 7 |

---

## File-by-File Findings

| Datei | Finding | Severity | Empfohlene Aktion |
|---|---|---|---|
| `NUTRITION_NEXT_SPEC_DECISIONS.md` | konsistent als V1-Quelle; §5 V1-Tag-Liste konfligiert mit SPEC-04/05 | OK (Quelle) | als verbindlich behandeln, andere Specs angleichen |
| `INDEX.md` | außerhalb Scope dieses Reviews (Review 1) | — | — |
| `SPEC_03_USER_FLOWS.md` | Flow 2 MealCam ohne Plan: AUTO_ACCEPT-Pfad mehrdeutig (CRIT-1) | Critical | Auto-Accept-Pfad explizit als "User-Klick erforderlich" formulieren |
| `SPEC_03_USER_FLOWS.md` | Kein Onboarding-Flow für Nutrition Preferences (CRIT-3) | Critical | Onboarding-Flow als Flow 0 ergänzen |
| `SPEC_03_USER_FLOWS.md` | §Flow 6 Custom Food: Barcode als Einstieg trotz Phase-2 (IMP-5) | Important | Barcode-Einstieg entfernen oder als Phase-2 markieren |
| `SPEC_03_USER_FLOWS.md` | Kein Coach Suggestion Flow (IMP-3) | Important | Flow ergänzen |
| `SPEC_03_USER_FLOWS.md` | Kein Recalculate Flow (IMP-1) | Important | Flow ergänzen |
| `SPEC_03_USER_FLOWS.md` | Kein Coach Permissions Settings Flow (Missing Flow #5) | Important | Flow ergänzen |
| `SPEC_03_USER_FLOWS.md` | Kein MealCam Consent Settings Flow (IMP-2) | Important | Flow ergänzen |
| `SPEC_03_USER_FLOWS.md` | Kein Micronutrient Review Flow (Missing Flow #6) | Minor | Flow ergänzen |
| `SPEC_03_USER_FLOWS.md` | Kein Settings-Übersicht-Flow (Missing Flow #8) | Minor | optional |
| `SPEC_04_FEATURES.md` | §Feature 9: AUTO_ACCEPT "Sofort übernehmen" widerspricht ADR (CRIT-1) | Critical | "Sofort übernehmen" → "User-Bestätigung erforderlich" |
| `SPEC_04_FEATURES.md` | §Feature 3: 100+ "Phase 1" Tags vs. Decisions §5 (CRIT-2) | Critical | Tag-Set angleichen oder als Phase-2-Erweiterung markieren |
| `SPEC_04_FEATURES.md` | §Feature 11: 4 Level-Multiplier ohne `user_level` Quellen-Spec (IMP-6) | Important | `user_level` Quelle dokumentieren |
| `SPEC_04_FEATURES.md` | §Feature 9: ADR_AI_USAGE_WALLET-Referenz nicht im Spec-Path (MIN-2) | Minor | V1-Status klären oder Hinweis "Phase 2" ergänzen |
| `SPEC_04_FEATURES.md` | §Feature 10: V1 ohne Subscription-Gate, aber UI bei `show_micros_tier=1` unklar (MIN-6) | Minor | Settings-Effekt dokumentieren |
| `SPEC_05_FOOD_TAXONOMY.md` | "Phase 1 Tags" (100+) widerspricht Decisions §5 (CRIT-2) | Critical | Tag-Phasen angleichen; halal/kosher zu Phase 1 wenn V1 |
| `SPEC_05_FOOD_TAXONOMY.md` | `nut_free`, `spicy`, `thai_food` aus Decisions fehlen (CRIT-2) | Critical | Tags ergänzen oder Decisions korrigieren |
| `SPEC_05_FOOD_TAXONOMY.md` | Sort Weight Detail-Scoring ist umfangreich; OK für Import-WO | OK (kein Scope Creep) | — |
| `SPEC_06_RECALCULATE_PATCH.md` | konsistent; klärt CRIT-4 aus Review 2; UI-Open-Item dokumentiert | OK | siehe IMP-1 für UI-Component-Spec |
| `SPEC_10_COMPONENTS.md` | Recipes/Shopping/MealPlans Components ohne V1-Status-Hinweis (IMP-4) | Important | Phase-2-Marker pro Component-Block |
| `SPEC_10_COMPONENTS.md` | `data/nutrientDetails.ts` `food_sources[]` veraltet (MIN-8) | Minor | Hinweis auf API-Endpoint-Ersatz |
| `SPEC_10_COMPONENTS.md` | Kein `QuickMacroEntry` (MIN-3) | Minor | Component ergänzen |
| `SPEC_10_COMPONENTS.md` | Kein `MealItemRecalculateButton` (IMP-1) | Important | Component ergänzen |
| `SPEC_10_COMPONENTS.md` | `MealScheduleEditor` vs. PASS2 `MealSlotEditor` Doppelbenennung (MIN-4) | Minor | Naming klären |
| `SPEC_10_PASS2_PATCH.md` | konsistent mit Decisions §6, §18, §19, §21, §22; Thai-Verhalten korrekt | OK | — |
| `SPEC_10_PASS2_PATCH.md` | `IntoleranceSelector`/`ReligiousDietarySelector` nur Onboarding (MIN-5) | Minor | Settings-Block explizit ergänzen |
| `SPEC_10_PASS2_PATCH.md` | Kein `MealCamConsentSettings` (IMP-2) | Important | Settings-Component für Widerruf ergänzen |
| `SPEC_10_PASS2_PATCH.md` | Kein `MealItemRecalculateButton` (IMP-1) | Important | siehe oben |
| `ADR_NUTRITION_PREFERENCES_V1.md` | konsistent | OK | — |
| `ADR_MEALCAM_V1.md` | klar; Auto-Accept widerspricht in SPEC-04/03 (CRIT-1) | OK (Quelle) | als verbindlich behandeln |
| `ADR_MEALCAM_CONSENT.md` | klar; Widerruf-UI fehlt aber in Specs (IMP-2) | OK (Quelle) | als verbindlich behandeln |
| `ADR_COACH_PERMISSIONS_V1.md` | konsistent mit Components; UI-Flow fehlt (IMP-3, Missing Flow #4/#5) | OK (Quelle) | siehe Flow-Lücken |
| `ADR_RECIPES_SCHEMA_ONLY.md` | klar; SPEC-10/03 setzt es nicht inline um (IMP-4) | OK (Quelle) | als verbindlich behandeln, V1-Marker in SPECs ergänzen |

---

## Recommended Fixes For Sonnet

Konkrete kurze Fix-Anweisungen ohne Code-Implementation. **Nur Spec-Files ändern.**

### FIX-1 — MealCam Auto-Accept Konflikt auflösen (CRIT-1)

In `SPEC_04_FEATURES.md` §Feature 9 (MealCam) Tabelle ändern:

```
| Level | Schwelle | Aktion |
|---|---|---|
| HIGH_CONFIDENCE | ≥ 0.85 | Item grün markiert in Confirmation — User klickt "Alles hinzufügen" zur Bestätigung |
| SUGGEST | 0.50–0.84 | Item gelb markiert — "Bitte prüfen" Hinweis |
| LOW | 0.30–0.49 | Item rot markiert — "Niedrige Sicherheit, manuelle Prüfung" |
| REJECT | < 0.30 | Nicht angezeigt — manuelle Suche empfohlen |
```

Dazu fett: "MealCam erstellt nie automatisch Meal Items. User-Bestätigung ist immer erforderlich (siehe ADR_MEALCAM_V1.md)."

In `SPEC_03_USER_FLOWS.md` §Flow 2 die Zeile "Confidence ≥ 0.85 (AUTO_ACCEPT)" umformulieren:

```
4. Confidence ≥ 0.85 (HIGH):
   → Erkannte Foods grün markiert in der Bestätigungsliste
   → User passt Mengen an wenn nötig
   → User klickt "Alles hinzufügen" → MealItems erstellt

   Confidence 0.50–0.84 (SUGGEST):
   ...

ADR-Verweis: Kein automatisches Schreiben (ADR_MEALCAM_V1.md).
```

### FIX-2 — V1 Food Tag Set festlegen (CRIT-2)

Empfehlung: Decisions §5 ist verbindlich für **User-sichtbare Filter-Tags in V1**. SPEC-04/05 enthält den **maximalen Tag-Katalog** für interne Auto-Tagging-Trigger. Beide Sets nicht identisch — explizit so dokumentieren.

In `SPEC_04_FEATURES.md` §Feature 3 oben einfügen:
```
> **V1 User-sichtbare Filter-Tags:** 16 Tags aus NUTRITION_NEXT_SPEC_DECISIONS.md §5
> (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free,
> lactose_free, nut_free, halal, kosher, spicy, thai_food, mediterranean,
> processed_food, ultra_processed).
> Auto-Tagging-Trigger setzt diese 16 Tags. Weitere interne Tags (siehe SPEC_05)
> sind Phase 2 — werden weder im Filter-UI noch in Smart-Search-Boost angezeigt.
```

In `SPEC_05_FOOD_TAXONOMY.md` ähnlichen Block ergänzen. Phase-1/2/3 Markierungen pro Tag korrigieren:
- `nut_free`: ergänzen (Negation von `allergen_nuts`) — V1
- `spicy`: ergänzen — V1
- `thai_food`: ergänzen — V1
- `halal`, `kosher`: V1 (statt Phase 3)
- `processed_food`: alias für `processed` — V1
- `creatine_source`, `cortisol_management`, `recomp` etc.: Phase 2

In `SPEC_06_DATABASE_SCHEMA.md` Auto-Tag-Trigger entsprechend reduzieren oder Tag-Code-Liste in `tag_definitions` entsprechend pflegen.

### FIX-3 — Onboarding Flow ergänzen (CRIT-3)

In `SPEC_03_USER_FLOWS.md` neuen Abschnitt **vor Flow 1** einfügen:

```
## Flow 0: Onboarding Nutrition Preferences

### Trigger
Nach erstem Auth-Sign-up und User-Profil-Anlage. `food_preferences.onboarding_complete = false`
ist die Bedingung. Onboarding wird vor erstem Diary-Zugang ausgelöst.

### Step 1 — Diät & Allergien
- DietTypeSelector (Pflicht)
- AllergenSelector (Multi, optional aber empfohlen)
- IntoleranceSelector (Multi, optional)

### Step 2 — Religiös/Kulturell
- ReligiousDietarySelector + Hard-Constraint-Toggle (optional)

### Step 3 — Likes / Dislikes
- FoodLikesInput (optional, kann übersprungen werden)
- FoodDislikesInput (optional)
- CuisinePreferenceSelector (Multi, optional)

### Step 4 — Meal-Slots & Zielrichtung
- MealSlotEditor (vorausgefüllt mit Defaults aus mealScheduleDefaults.ts)
- Zielrichtung-Auswahl (cut/maintain/bulk/prep)

### Abschluss
- POST /api/nutrition/preferences/onboarding mit allen Werten
- food_preferences.onboarding_complete = true
- food_preference_items mit source: 'onboarding' angelegt
- Übergang zu Diary (heutiges Datum)

### Skip / Abbruch
- "Später ausfüllen" pro Step (außer Step 1) erlaubt
- Bei vollständigem Skip: onboarding_complete = false, Diary erreichbar mit
  Default-Empfehlungen (keine personalisierten Suggestions)
- Wiederaufnahme: Settings → "Onboarding fortsetzen" Banner solange
  onboarding_complete = false

### Validierung
- Step 1 DietTypeSelector ist Pflicht (Default: omnivore)
- Allergien/Unverträglichkeiten: keine Mindestauswahl
- Step 4 MealSlotEditor: mindestens ein Slot aktiv

### Quelle
ADR_NUTRITION_PREFERENCES_V1.md, NUTRITION_NEXT_SPEC_DECISIONS.md §6
```

### FIX-4 — Recalculate UI ergänzen (IMP-1)

In `SPEC_10_PASS2_PATCH.md` neuen Abschnitt einfügen:

```
## Meal Item Recalculate Components (Neu)

| Component | Beschreibung |
|---|---|
| `MealItemRecalculateButton` | Button "Neu berechnen" am Meal Item, sichtbar wenn meal_item.snapshot_version unter aktueller Food-Data-Version. |
| `MealItemRecalculateModal` | Bestätigung mit Diff-Anzeige (alte vs. neue Werte) |
| `MealRecalculateAllButton` | "Mahlzeit neu berechnen" — alle Items eines Meals |

### Hooks
- useMealItemRecalculate(mealItemId)  → POST /meal-items/:id/recalculate
- useMealRecalculate(mealId)          → POST /meals/:id/recalculate

### Trigger-Bedingung
Der Recalculate-Button erscheint, wenn:
- meal_item.snapshot_version < aktueller food_data_version
- ODER explizit über Settings: "Alle alten Snapshots prüfen"

### Quelle
SPEC_06_RECALCULATE_PATCH.md, NUTRITION_NEXT_SPEC_DECISIONS.md §12
```

In `SPEC_03_USER_FLOWS.md` neuen Flow ergänzen:

```
## Flow 15: Meal Item neu berechnen

1. User öffnet Diary, vergangenes Datum
2. Meal Item zeigt "Neu berechnen verfügbar" Hinweis (wenn Food-Daten neuer)
3. User tippt "Neu berechnen"
4. Modal zeigt Diff: "Alt: 218 kcal | Neu: 222 kcal | Δ +4 kcal"
5. "Bestätigen" → POST /meal-items/:id/recalculate
6. Snapshot wird neu erstellt, snapshot_version+=1, History gespeichert
7. UI aktualisiert; Tages-Aggregat wird beim nächsten Read neu gebildet
```

### FIX-5 — MealCam Consent Settings UI ergänzen (IMP-2)

In `SPEC_10_PASS2_PATCH.md` §Nutrition Preferences — Settings Components ergänzen:

```
| Component | Beschreibung |
|---|---|
| `MealCamConsentSettings` | Globale Verwaltung der MealCam-Bild-Freigaben. Listet alle Bilder mit Status, erlaubt globalen Widerruf. |
| `MealCamImageList` | Aggregierte Anzeige: "X Bilder im Trainings-Pool, Y nicht freigegeben" |
| `RevokeAllConsentButton` | Bulk-Widerruf — entfernt alle Bilder aus Trainings-Pool |
```

In `SPEC_07_PASS2_PATCH.md` §4 (MealCam) neue Endpoints ergänzen:

```
### POST /api/nutrition/mealcam/consent/revoke-all
Globaler Widerruf — alle eigenen Bilder aus Trainings-Pool entfernen.

### GET /api/nutrition/mealcam/consent/summary
Aggregat: { total_scans, training_consent_count, revokable_count }
```

In `SPEC_03_USER_FLOWS.md` ergänzen:

```
## Flow 16: MealCam Consent Widerruf

1. Nutrition Settings → "MealCam Datenschutz"
2. Anzeige: "X Bilder im Trainings-Pool"
3. Optionen: Einzeln widerrufen oder "Alles widerrufen"
4. Bestätigung mit Hinweis: "Bilder werden aus Trainings-Pool entfernt; bestätigte Diary-Nährwerte bleiben erhalten"
5. Confirm → POST /mealcam/consent/revoke-all
6. UI bestätigt: "0 Bilder im Trainings-Pool"
```

### FIX-6 — Coach Suggestion User Flow ergänzen (IMP-3)

In `SPEC_03_USER_FLOWS.md` ergänzen:

```
## Flow 17: Coach Suggestion bearbeiten

### Trigger
Coach erstellt Suggestion via API → Status = pending → User-Notification (Push/In-App).

### UI-Wege
- CoachSuggestionBadge in Navigation (Counter)
- Optionaler Push: "Dein Coach hat einen Vorschlag"
- In Diary/Settings als gelbe Banner

### Schritt 1: Liste öffnen
User tippt Badge oder Banner → CoachSuggestionList zeigt alle pending Suggestions
sortiert nach expires_at.

### Schritt 2: Suggestion-Detail
CoachSuggestionCard zeigt:
- Suggestion-Typ + Begründung
- Aktuelle Werte vs. vorgeschlagene Werte (typ-spezifisch)
- Coach-Name + Zeitstempel
- Expires-At-Badge

### Schritt 3: Entscheidung
Per Suggestion-Typ unterschiedliche Akzeptanz-Wirkung:

| Typ | Bei Accept |
|---|---|
| nutrition_target | Target wird sofort aktualisiert |
| meal_plan | Plan wird zugewiesen, User aktiviert separat |
| food_alternative | Info-only, nichts wird automatisch geschrieben |
| water_goal | Hinweis, Goal-Modul wird informiert |
| custom_food_correction | Custom Food wird aktualisiert |
| micronutrient_comment | Als gelesen markiert |
| mealcam_comment | Als gelesen markiert |
| diary_flag | Flag bleibt sichtbar |
| preference | Preference Item mit source='coach_suggestion' angelegt |

### Schritt 4: Reject mit optionaler Begründung
User kann decision_note hinterlegen.

### Schritt 5: Status-Update
Suggestion → accepted oder rejected, decided_at gesetzt.
Coach wird (extern) informiert. Audit-Log geschrieben.

### Quelle
ADR_COACH_PERMISSIONS_V1.md, NUTRITION_NEXT_SPEC_DECISIONS.md §22
```

### FIX-7 — V1-Status-Marker in SPEC_10 für Recipes/Shopping/MealPlans (IMP-4)

In `SPEC_10_COMPONENTS.md` jeweils oben in den drei Component-Blöcken einen Marker einfügen:

```
### Recipe Components (5)
> **V1-Status:** Schema-only / Phase 2 wenn Zeit knapp.
> Components dokumentiert, V1-Implementierung optional.
> Siehe ADR_RECIPES_SCHEMA_ONLY.md.

### Shopping List Components (3)
> **V1-Status:** Schema-only / Phase 2.

### Meal Plan Components (8)
> **V1-Status:** Schema-only / Phase 2 wenn Zeit knapp.
```

In `SPEC_03_USER_FLOWS.md` für §Flow 7 (Recipe), §Flow 8 (Shopping List) und §Flow 3 (Meal Plan Aktivierung):

```
> **V1-Status:** Schema-only — Flow optional V1, ggf. Phase 2.
```

### FIX-8 — Barcode aus SPEC_03 Flow 6 entfernen (IMP-5)

In `SPEC_03_USER_FLOWS.md` §Flow 6 die Zeile mit Barcode-Scan ersetzen durch:

```
1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
   ODER: direkt über "+ Eigenes Food" Button
   (Barcode-Scan als Einstieg ist Phase 2 — siehe ADR_MEALCAM_V1.md)
```

In `SPEC_04_FEATURES.md` §Feature 4 "Erstellungs-Wege" Punkt 2 ändern:

```
2. Barcode-Scan (Phase 2) — als Identifikations-Mechanismus für bereits angelegte Custom Foods
```

### FIX-9 — `user_level` Quelle dokumentieren (IMP-6)

In `SPEC_04_FEATURES.md` §Feature 11 ergänzen:

```
**user_level Quelle:**
Kommt aus User-Profil (Auth/User-Modul). V1 Default: 'intermediate'.
Wird nicht über Nutrition-API gesetzt. Settings-UI für level-Pflege ist
außerhalb des Nutrition-Moduls (wahrscheinlich Goals oder User-Profile).
Wenn Feld nicht verfügbar → fallback level_multiplier = 0.90.
```

### FIX-10 — Admin Override Tag Mechanismus klären (IMP-7)

In `SPEC_05_FOOD_TAXONOMY.md` §Auto-Tagging am Ende ergänzen:

```
### Manuelle Tag-Overrides (V1)

V1 erlaubt manuelle Admin-Korrekturen an BLS-Food-Tags. Mechanismus:

1. Tag-Definition Tabelle hat optional `manual_only` Flag (Phase 2 Erweiterung).
2. V1: separate Tabelle `food_tags_manual` mit `food_id, tag_code` —
   Trigger respektiert diese und überschreibt sie nicht.

API-Endpoint (Admin-only, V1):
   POST /api/admin/foods/:id/tags/manual { tag_code, action: 'add'|'remove' }

User-Tags für Custom Foods (V1 Eingrenzung):
   In V1 nur EU-14 Allergene über `custom_allergens TEXT[]`.
   Generisches User-Tag-System ist Phase 2.

Wenn V1 weder Admin-Override noch User-Custom-Tags umsetzt:
   Diesen Block als "Phase 2 — siehe NUTRITION_NEXT_SPEC_DECISIONS.md §5"
   markieren, damit klar ist dass V1 das nicht abdeckt.
```

### FIX-11 — `QuickMacroEntry` Component ergänzen (MIN-3)

In `SPEC_10_PASS2_PATCH.md` §Diary Components Ergänzungen einfügen:

```
| Component | Beschreibung |
|---|---|
| `QuickMacroEntry` | Modal/Inline-Form für direkte kcal+P+C+F-Eingabe ohne Food-Suche. Erstellt MealItem mit food_source='manual'. |
```

In `SPEC_03_USER_FLOWS.md` §Flow 1 unten Abschnitt ergänzen:

```
**Quick-Add Makros (alternativer Eingabe-Weg):**

1. User wählt "Schnell-Makros" statt "+ Mahlzeit"
2. Eingabe von kcal/Protein/Carbs/Fat + optionalem Label
3. Speichern → MealItem ohne food_id, food_source='manual'

Hinweis: keine Mikronährstoff-Daten für diese Items.
Quelle: SPEC_04 §Feature 5a, ADR_IMPROVEMENTS_PACKAGE #14
```

### FIX-12 — `IntoleranceSelector` und `ReligiousDietarySelector` in Settings explizit (MIN-5)

In `SPEC_10_PASS2_PATCH.md` §Nutrition Preferences — Settings Components Block am Ende ergänzen:

```
**Wiederverwendete Components (auch in Settings):**
- IntoleranceSelector (aus Onboarding)
- ReligiousDietarySelector (aus Onboarding)
- DietTypeSelector
- AllergenSelector
- FoodLikesInput / FoodDislikesInput
- CuisinePreferenceSelector
- MealSlotEditor (auch als MealScheduleEditor in alter SPEC-10 Liste benannt)

In Settings via PreferencesView (erweitert) eingebunden.
```

### FIX-13 — `MealScheduleEditor` vs. `MealSlotEditor` Naming klären (MIN-4)

In `SPEC_10_PASS2_PATCH.md` Hinweis ergänzen:

```
> Naming-Hinweis: `MealScheduleEditor` (aus SPEC_10) und `MealSlotEditor`
> (aus SPEC_10_PASS2 Onboarding-Liste) sind dieselbe Component.
> Verbindlicher Name: `MealSlotEditor`. Alte Referenz `MealScheduleEditor` deprecated.
```

### FIX-14 — `data/nutrientDetails.ts` `food_sources[]` Hinweis (MIN-8)

In `SPEC_10_COMPONENTS.md` §Statische Daten unter `nutrientDetails` ergänzen:

```
> **Hinweis (Pass 1):** `food_sources: string[]` ist deprecated.
> Stattdessen: `GET /api/nutrition/nutrients/:code/top-foods?limit=10`
> liefert die aktuellen Top-Foods aus BLS-Daten.
> Siehe ADR_IMPROVEMENTS_PACKAGE.md #20.
```

### FIX-15 — Coach Permissions Settings Flow ergänzen (Missing Flow #5)

In `SPEC_03_USER_FLOWS.md` ergänzen:

```
## Flow 18: Coach Permissions konfigurieren

1. Nutrition Settings → "Coach-Zugriff"
2. CoachPermissionsPanel mit 9 Toggles (Diary/Water/Micronutrient/MealCam/Targets/Custom Foods/Recipes/Meal Plans/Preferences)
3. Default: alle off
4. Tap auf Toggle → Erklärung erscheint:
   - Was Coach sehen kann
   - Dass Coach nicht direkt schreiben darf — nur Suggestions
5. Speichern → Permission-Update via API
6. Coach-Zugriff wird per Permission-Tabelle (Auth-Modul) durchgesetzt

Quelle: ADR_COACH_PERMISSIONS_V1.md, NUTRITION_NEXT_SPEC_DECISIONS.md §21
```

---

## Out-of-Scope-Hinweis

Folgende Dateien aus dem Nutrition Spec Pfad wurden für diesen Review **bewusst nicht gelesen** (außerhalb Review-3-Scope):

- `SPEC_01_MODULE_CONTRACT.md`, `SPEC_02_*.md`, `SPEC_06_DATABASE_SCHEMA.md`, `SPEC_06_PATCH_*.md`, `SPEC_06_V1_MIGRATION.sql`, `SPEC_07_*.md`, `SPEC_08_IMPORT_PIPELINE.md`, `SPEC_09_*.md`, `SPEC_03_FLOW4_RECIPE_PATCH.md`, `SPEC_10_PATCH_APRIL2026.md`, `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`
- ADRs außerhalb der gelisteten: `ADR_BLS_ONLY.md`, `ADR_CUSTOM_FOODS_V1.md`, `ADR_GHOST_ENTRY_RECIPE.md`, `ADR_IMPROVEMENTS_PACKAGE.md`, `ADR_RECIPE_SOURCE_BUDDY.md`, `ADR_SUPPLEMENTS_API_BOUNDARY.md`, `ADR_WATER_TOTAL_HYDRATION.md`
- Vorherige Reviews: `OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md`, `OPUS_REVIEW_NUTRITION_02_DATA_API.md`

`SPEC_10_PATCH_APRIL2026.md` (z. B. `QuickMacroEntry`-Component-Spec) und `SPEC_03_FLOW4_RECIPE_PATCH.md` enthalten möglicherweise weitere relevante UI/Flow-Inhalte. Sollte in nachfolgenden Reviews betrachtet werden.

Ebenfalls nicht geprüft (Scope-Ausschluss): `docs/BrainstormDocs/Nutrition/new/spec`, andere Modul-Specs, `system/**`, `apps/**`, `packages/**`, `supabase/**`, `tools/**`. Konsistenz zwischen Spec und tatsächlicher Implementation in `apps/web/` oder `services/nutrition-api/` wurde nicht geprüft — gehört zur Implementierungs-Review.

---

*Ende OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md*
