# SPEC_10 — Pass 2 Component Ergänzungen
# docs/specs/Nutrition/SPEC_10_PASS2_PATCH.md
# Ergänzt SPEC_10_COMPONENTS.md um V1-Entscheidungen aus NUTRITION_NEXT_SPEC_DECISIONS.md

> Stand: April 2026 | Pass 2 nach NUTRITION_NEXT_SPEC_DECISIONS.md

---

## Neue Components (Pass 2)

---

## Portion Components (Neu)

| Component | Beschreibung |
|---|---|
| `PortionSelector` | Auswahlliste der verfügbaren Portionsgrößen eines Foods (Dropdown oder Chips). Fallback: Gramm-Direkteingabe. Zeigt zuletzt genutzte Portion vorausgefüllt. |
| `FoodAmountInput` (erweitert) | Bestehende Komponente: ergänzt um Portion-Selector-Integration und Live-Makro-Preview bei Portions-Wahl. |

**Logik PortionSelector:**
```
1. GET /api/nutrition/foods/:id/portions laden
2. Wenn portions.length > 0: Dropdown mit Portionen anzeigen
3. "Eigene Menge (g)" immer als letzter Eintrag
4. recent_amount_g wenn vorhanden: vorausgefüllt
5. Bei Auswahl: amount_g aus Portion in FoodAmountInput übernehmen
```

---

## MealCam Components (V1)

| Component | Beschreibung |
|---|---|
| `MealCamButton` | Kamera-Icon-Button in DiaryView und FoodSearchView. Öffnet MealCamModal. |
| `MealCamModal` | Haupt-Modal für den MealCam-Flow: Upload/Kamera → Erkennung → Bestätigung. |
| `MealCamImageInput` | Bild-Auswahl: Kamera öffnen oder Datei hochladen. Max 10MB, JPEG/PNG. |
| `MealCamProcessing` | Lade-Animation während Erkennung läuft. Polling auf scan_id Status. |
| `MealCamResults` | Liste erkannter Foods mit Confidence-Balken und Mengen-Eingabe. |
| `MealCamFoodItem` | Einzelner erkannter Food: Name, Confidence, Menge (editable), BLS/Custom-Badge. |
| `MealCamUnknownItem` | Item ohne BLS-Match: zeigt "Unbekannt" + Link zu Custom Food Formular. |
| `MealCamConfirmation` | Bestätigungs-Screen: alle zu loggenden Items + Gesamtmakros. "Alles hinzufügen"-Button. |
| `MealCamConsentBanner` | Optionaler Banner nach Bestätigung: "Darf LumeOS dein Bild zur Verbesserung nutzen?" mit Opt-in Checkbox. Kein Pflicht-Schritt. |
| `MealCamPlanComparison` | Plan-Vergleichs-Ansicht wenn plan_item_id gesetzt: Match / Abweichung / Fehlt / Extra. |

**MealCam Flow in Komponenten:**

```
MealCamButton klickt
→ MealCamModal öffnet
  → MealCamImageInput (Bild wählen)
  → POST /mealcam/scan
  → MealCamProcessing (während Status polling)
  → MealCamResults (detected_items anzeigen)
    → MealCamFoodItem (je Food: bearbeiten/entfernen)
    → MealCamUnknownItem (kein Match → Custom Food)
  → [Optional] MealCamPlanComparison
  → MealCamConfirmation
    → POST /mealcam/scan/:id/confirm
  → [Optional] MealCamConsentBanner
    → POST /mealcam/scan/:id/consent
  → Diary aktualisiert
```

**Wichtige UI-Regel:**
Kein automatisches Hinzufügen ohne explizite User-Bestätigung.
"Alles hinzufügen" ist ein bewusster User-Klick.

---

## MealCam Confidence UI

| Confidence | Farbe | Verhalten |
|---|---|---|
| ≥ 0.75 | 🟢 Grün | Item direkt in Confirmation |
| 0.50–0.74 | 🟡 Gelb | Item anzeigen, aber Hinweis "Bitte prüfen" |
| < 0.50 | 🔴 Rot | "Niedrige Sicherheit — Bitte manuell prüfen" — kein Auto-Add |

---

## Nutrition Preferences — Onboarding Components

| Component | Beschreibung |
|---|---|
| `OnboardingPreferencesStep` | Onboarding-Schritt für Nutrition Preferences. Multi-Step innerhalb des Onboarding-Flows. |
| `DietTypeSelector` | Diät-Typ Auswahl mit Chips (omnivore, vegetarian, vegan, etc.) |
| `AllergenSelector` | EU 14 Allergene als Toggle-Chips mit Icon. Hard Constraint. |
| `IntoleranceSelector` | Unverträglichkeiten (Laktose, Fruktose, Gluten mild etc.) als Toggle-Chips. Strong Constraint. |
| `ReligiousDietarySelector` | Religiöse/kulturelle Einschränkungen (halal, kosher etc.) + Hard-Constraint-Toggle |
| `FoodLikesInput` | Likes erfassen: Food Search + Kategorie-Picker + Tag-Picker |
| `FoodDislikesInput` | Dislikes erfassen: wie Likes |
| `MealSlotEditor` | Meal-Slots konfigurieren: Zeiten, Namen, aktivieren/deaktivieren |
| `CuisinePreferenceSelector` | Bevorzugte Küchen/Stile als Multi-Select-Chips |

**Onboarding-Flow (mehrstufig):**

```
Step 1: Diät-Typ + Allergien + Unverträglichkeiten
Step 2: Religiöse/kulturelle Einschränkungen
Step 3: Likes + Dislikes (optional im Onboarding)
Step 4: Meal-Slots + Zielrichtung
```

---

## Nutrition Preferences — Settings Components

| Component | Beschreibung |
|---|---|
| `PreferencesView` (erweitert) | Bestehende Komponente erweitert um: religiöse Einschränkungen, excluded_foods, preferred_foods. |
| `ExcludedFoodsManager` | Liste der absoluten No-Go Foods verwalten. Suche + Hinzufügen + Entfernen. |
| `PreferredFoodsManager` | Liste bevorzugter Foods (Ranking-Boost) verwalten. |
| `CoachPermissionsPanel` | Granulare Coach-Freigaben pro Nutrition-Bereich. Toggle-Liste. |

**Coach-Permission Toggles:**

```
☑ Diary lesen
☑ Water-Logs lesen
☑ Micronutrient Review lesen
☐ MealCam-Bilder lesen (separate Freigabe — default off)
☑ Nutrition Targets lesen
☑ Custom Foods lesen
☐ Rezepte lesen
☑ Preferences lesen
```

---

## Coach Suggestion UI Components

| Component | Beschreibung |
|---|---|
| `CoachSuggestionBadge` | Badge-Counter (Zahl offener Suggestions) in Navigation. |
| `CoachSuggestionList` | Liste aller pending Coach-Suggestions für Nutrition. |
| `CoachSuggestionCard` | Einzelne Suggestion: Typ, Begründung, Accept/Reject-Buttons, Expires-At. |
| `SuggestionTypeDisplay` | Typ-spezifische Darstellung: nutrition_target zeigt Zielwerte-Diff, preference zeigt Food/Tag. |

**Suggestion-Status-Visualisierung:**

| Status | Farbe | Label |
|---|---|---|
| pending | 🟡 Gelb | "Ausstehend" |
| accepted | 🟢 Grün | "Angenommen" |
| rejected | ⚫ Grau | "Abgelehnt" |
| expired | 🔴 Rot | "Abgelaufen" |

---

## Micronutrient Review — Erweiterte Components

| Component | Beschreibung |
|---|---|
| `MicroDashboard` (erweitert) | Zeigt jetzt: Food-Anteil + Supplement-Anteil + Gesamtwert. Wenn Supplements nicht verfügbar: Hinweis-Banner. |
| `MicroNutrientCard` (erweitert) | Einzelner Nährstoff: jetzt mit Food/Supplement-Aufschlüsselung, UL-Balken wenn UL vorhanden. |
| `ULWarningBar` | Visueller UL-Fortschrittsbalken: Grün bis RDA, Gelb bis UL, Rot ab UL. |
| `SupplementDataBanner` | Banner wenn Supplements-API nicht verfügbar: "Supplement-Daten nicht verfügbar". |

**MicroNutrientCard Aufbau:**

```
Vitamin D                              🟢 146% RDA
─────────────────────────────────────────────────
Aus Nahrung:     4.2 µg   (21%)
Aus Supplements: 25.0 µg  (125%)
Gesamt:          29.2 µg

[ ████████████████░░░░░░░░░░░░░░░ ] 29.2 / 100 µg UL
  Zielbereich: 20 µg RDA  |  Oberes Limit: 100 µg
```

---

## Thai / i18n — Verhalten in UI

| Element | V1 Verhalten |
|---|---|
| Sprach-Umschalter | DE/EN aktiv auswählbar. TH sichtbar aber disabled (ausgegraut). |
| Klick auf TH | Toast/Tooltip: "Thai-Unterstützung kommt bald" |
| Food-Namen TH | Wenn `name_display_th = null`: Fallback auf `name_display` (DE) — kein Fehler |
| Kategorie-Namen TH | Wenn `name_th = null`: Fallback auf `name_de` |

**Kein Release-Block durch fehlende Thai-Texte.**
TH-Felder sind schema-vorbereitet, müssen V1 nicht befüllt sein.

---

## Hooks (Pass 2 Additions)

| Hook | Endpoint | Beschreibung |
|---|---|---|
| `useFoodPortions(foodId)` | `GET /foods/:id/portions` | Portionsgrößen + recent |
| `useMealCamScan()` | `POST /mealcam/scan` | Scan starten |
| `useMealCamStatus(scanId)` | `GET /mealcam/scan/:id` | Status pollen |
| `useMealCamConfirm()` | `POST /mealcam/scan/:id/confirm` | Bestätigen → Meal Items |
| `useMealCamConsent()` | `POST /mealcam/scan/:id/consent` | Consent setzen |
| `useOnboardingPreferences()` | `GET/POST /preferences/onboarding` | Onboarding-Preferences |
| `useNutritionSettings()` | `GET/PUT /preferences/settings` | Settings lesen/schreiben |
| `useCoachSuggestions()` | `GET /suggestions/pending` | Offene Suggestions laden |
| `useAcceptSuggestion()` | `POST /suggestions/:id/accept` | Suggestion annehmen |
| `useRejectSuggestion()` | `POST /suggestions/:id/reject` | Suggestion ablehnen |
| `useMicronutrientReview(date)` | `GET /summary/micronutrients` | Vollständiger Mikro-Review |

---

## Store-Ergänzungen

### `stores/mealCamStore.ts` (neu)

```typescript
interface MealCamStore {
  activeScanId:    string | null;
  scanStatus:      MealCamScanStatus | null;
  detectedItems:   DetectedFoodItem[];
  corrections:     MealCamCorrection[];

  setScanId: (id: string | null) => void;
  addCorrection: (correction: MealCamCorrection) => void;
  clearScan: () => void;
}
```

### `stores/preferencesStore.ts` (neu)

```typescript
interface PreferencesStore {
  preferences:     NutritionPreferences | null;
  items:           NutritionPreferenceItem[];
  pendingSuggestions: CoachNutritionSuggestion[];

  setPreferences: (p: NutritionPreferences) => void;
  addItem: (item: NutritionPreferenceItem) => void;
  removeItem: (id: string) => void;
}
```

---

## Type-Additions (packages/contracts/src/nutrition/)

```
mealcam.ts       MealCamScan, DetectedFoodItem, MealCamCorrection, MealCamStatus
portions.ts      FoodPortion, UserRecentPortion
preferences.ts   NutritionPreferences (erweitert), NutritionPreferenceItem (erweitert)
suggestions.ts   CoachNutritionSuggestion
micronutrients.ts MicronutrientReviewResponse, NutrientWithSources
```

---

## Pass 3 Ergänzungen (OPUS Review 03 Fixes)

---

## Recalculate Components (FIX-4)

| Component | Beschreibung |
|---|---|
| `RecalculateButton` | Icon-Button auf MealItemCard: "Nährstoffe neu berechnen" |
| `RecalculateModal` | Modal mit Vorher/Nachher-Vergleich (Kalorien, Protein, Diff) und Bestätigungs-Button |
| `MealRecalculateAction` | Bulk-Recalculate für ein ganzes Meal aus dem Meal-Kontextmenü |
| `RecalculateResultToast` | Toast-Meldung nach erfolgreichem Recalculate mit Diff-Anzeige |

**Logik:**
```
RecalculateButton sichtbar wenn:
  - food_source IN ('bls', 'custom', 'mealcam')
  - NICHT sichtbar wenn food_source = 'manual' (kein Food-Referenz)

RecalculateModal zeigt:
  - Food-Name + Menge
  - Aktuell (Version N): enercc, prot625, fat, cho
  - Neu (aus aktuellen Food-Daten): enercc, prot625, fat, cho
  - Differenz (grün wenn kleiner, rot wenn größer)
```

**Hook:** `useRecalculateMealItem(mealItemId)` → `POST /api/nutrition/meal-items/:id/recalculate`

**Referenz:** SPEC_06_RECALCULATE_PATCH.md, SPEC_03_PASS2_PATCH.md Flow 15

---

## MealCam Consent Settings Components (FIX-5)

| Component | Beschreibung |
|---|---|
| `MealCamConsentSettings` | Einstellungsseite: Übersicht gespeicherter Bilder, Consent-Status, Aktionen |
| `MealCamImageList` | Scrollbare Liste aller gespeicherten MealCam-Scans mit Vorschau + Consent-Status |
| `MealCamImageCard` | Einzelner Scan: Datum, Thumbnail, "Consent erteilt/nicht erteilt", Löschen-Button |
| `RevokeAllConsentButton` | "Alle Freigaben widerrufen" mit Bestätigungs-Dialog |
| `GrantAllConsentButton` | "Training-Freigabe erteilen" mit Erklärungstext |

**Hooks:**
```
useConsentSummary()     → GET /api/nutrition/mealcam/consent/summary
useGrantAllConsent()    → POST /api/nutrition/mealcam/consent/grant-all
useRevokeAllConsent()   → POST /api/nutrition/mealcam/consent/revoke-all
useMealCamImages()      → GET /api/nutrition/mealcam/scans (alle User-Scans)
useDeleteScanImage()    → DELETE /api/nutrition/mealcam/scan/:id/image
```

**Referenz:** ADR_MEALCAM_CONSENT.md, SPEC_03_PASS2_PATCH.md Flow 16

---

## QuickMacroEntry Component (FIX-11)

| Component | Beschreibung |
|---|---|
| `QuickMacroEntry` | Modal/Tab für direktes Loggen von Makros ohne Food-Suche. food_source='manual'. |

```typescript
// QuickMacroEntry Props
interface QuickMacroEntryProps {
  mealId: string;
  onSuccess: () => void;
}

// Form-State
interface QuickMacroForm {
  enercc: number;         // Pflicht
  prot625?: number;
  fat?: number;
  cho?: number;
  label?: string;         // Default: "Manuelle Eingabe"
}
```

**Wichtig:** QuickMacroEntry Items haben `nutrients: {}` — keine Mikronährstoffdaten.
Das MicroDashboard zeigt solche Items als "Keine Mikro-Daten" an.

**Hook:** `useQuickAddMacros()` → `POST /api/nutrition/meals/:id/items` mit `food_source='manual'`

**UI-Position:** Tab in FoodSearchView neben "BLS-Suche" und "Eigene Foods"

**Referenz:** SPEC_04 Feature 5a, SPEC_03_PASS2_PATCH.md Flow 19

---

## Preferences Settings Components — IntoleranceSelector + ReligiousDietarySelector (FIX-12)

Diese Komponenten sind in Onboarding (SPEC_03_PASS2_PATCH.md Flow 0) UND in
Nutrition Settings verwendbar (DRY-Prinzip, gleiche Components für beide Kontexte).

| Component | Kontext |
|---|---|
| `AllergenSelector` | Onboarding Step 2 + Nutrition Settings Allergien-Tab |
| `IntoleranceSelector` | Onboarding Step 3 + Nutrition Settings Unverträglichkeiten-Tab |
| `ReligiousDietarySelector` | Onboarding Step 4 + Nutrition Settings Religiöse Einschränkungen |
| `DietTypeSelector` | Onboarding Step 1 + Nutrition Settings Diät-Typ |
| `FoodLikesInput` | Onboarding Step 6 + Nutrition Settings Likes |
| `FoodDislikesInput` | Onboarding Step 6 + Nutrition Settings Dislikes |
| `MealSlotEditor` | Onboarding Step 7 + Nutrition Settings Mahlzeiten-Zeitplan |
| `CuisinePreferenceSelector` | Onboarding Step 7 + Nutrition Settings Küchen |

**Wiederverwendungs-Pattern:**
```typescript
// Gleicher Component, unterschiedlicher Kontext via Prop
<IntoleranceSelector
  mode="onboarding"    // oder "settings"
  value={intolerances}
  onChange={setIntolerances}
/>
```

Onboarding nutzt `source: 'onboarding'`, Settings nutzen `source: 'settings'`
in `food_preference_items.source`.

---

## V1-Status für Recipes/Shopping/MealPlan Components (FIX-7)

| Component-Gruppe | V1-Status |
|---|---|
| `RecipeView`, `RecipeForm`, `RecipeDetail` | ⚠️ Schema-only V1 — Phase 2 wenn Zeit knapp. Siehe ADR_RECIPES_SCHEMA_ONLY.md |
| `ShoppingListView`, `ShoppingListDetail` | ⚠️ Schema-only V1 — Full UI Phase 2 |
| `MealPlansView`, `MealPlanDetail`, `PlanActivation` | ⚠️ Schema-only V1 — Phase 2 wenn Zeit knapp |
| `GhostEntryCard` | ⚠️ Abhängig von MealPlan-Flow — Schema-only V1 |

Diese Components werden nicht in V1 gebaut wenn Zeit knapp wird.
Tabellen und Schemas existieren, APIs und UIs sind Phase 2.

