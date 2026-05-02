# SPEC_03 — Pass 2 User Flow Ergänzungen und Korrekturen
# docs/specs/Nutrition/SPEC_03_PASS2_PATCH.md
# Schließt FIX-1, FIX-3, FIX-4, FIX-5, FIX-6, FIX-7, FIX-8, FIX-11, FIX-15
# aus OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md

> Stand: Mai 2026 | Pass 3 nach OPUS Review

---

## Korrekturen an bestehenden Flows

### Flow 2 — MealCam Korrektur (FIX-1)

**Die Confidence-Schwellen-Logik aus SPEC_03 Flow 2 ist wie folgt zu korrigieren:**

> **VERALTET:** `Confidence ≥ 0.85 (AUTO_ACCEPT) → Erkannte Foods direkt als Vorschlag`
> AUTO_ACCEPT existiert nicht in V1. Verbindlich: ADR_MEALCAM_V1.md

**Korrekte Logik:**

```
1. User tippt MealCam-Icon im Diary
2. Kamera öffnet sich oder Foto-Upload aus Galerie
3. Foto → Vision-Provider (TBD)

4. HIGH Confidence (≥ 0.75):
   → Items grün markiert in MealCamResults
   → User sieht Confirmation mit allen Items
   → User tippt "Alles hinzufügen" (User-Klick erforderlich)
   → MealItems erstellt

   SUGGEST Confidence (0.50–0.74):
   → Items gelb markiert — "Bitte prüfen" Hinweis
   → User kann Items bearbeiten, entfernen, ergänzen
   → User tippt "Alles hinzufügen"

   LOW Confidence (< 0.50):
   → Items rot markiert — "Niedrige Sicherheit"
   → Kein automatisches Hinzufügen möglich
   → User muss jeden Item manuell bestätigen oder zur manuellen Food Search wechseln

5. Unbekannte Foods → Custom Food erstellen (Flow 6)
6. User kann einzelne erkannte Items korrigieren/ergänzen
```

**Referenz:** ADR_MEALCAM_V1.md, SPEC_04 Feature 9

---

### Flow 6 — Barcode Phase 2 Korrektur (FIX-8)

**In SPEC_03 Flow 6 ist folgender Einstieg als Phase 2 zu markieren:**

> **Phase 2:** `ODER: Barcode-Scan → nicht gefunden → "Custom erstellen"`
>
> Barcode Scanner ist Phase 2. Dieser Einstieg erscheint in V1 nicht.
> Verbindlich: ADR_MEALCAM_V1.md

**V1 Custom Food Erstellungs-Wege:**
1. Aus Food Search: kein Ergebnis → "Selbst anlegen"
2. Direkt über "+ Eigenes Food" Button
3. MealCam → unsicheres Ergebnis → Custom Food vorausgefüllt

---

## Neue Flows

---

## Flow 0: Onboarding — Nutrition Preferences (FIX-3)

Erstes Nutrition-Setup im App-Onboarding. Nur einmalig beim ersten Login.

**Trigger:**
- User schließt App-Onboarding ab
- `food_preferences.onboarding_complete = false` → Nutrition-Onboarding wird angezeigt
- Kann auch über Nutrition → Einstellungen → "Onboarding erneut durchführen" gestartet werden

**Flow:**

```
Step 0: Einleitung
  "Lass uns deine Ernährungsgewohnheiten einrichten"
  [Weiter] [Überspringen]

Step 1: Diät-Typ (DietTypeSelector)
  [Omnivor] [Vegetarisch] [Vegan] [Pescatarisch]
  [Keto] [Paleo] [Mediterran] [Carnivore] [Custom]
  → Auswahl speichert diet_type

Step 2: Allergien (AllergenSelector)
  EU 14 Allergene als Toggle-Chips (Hard Constraint)
  → Auswahl speichert allergies[]

Step 3: Unverträglichkeiten (IntoleranceSelector)
  Laktose, Fruktose, Gluten mild, Histamin, etc. (Strong Constraint)
  → Auswahl speichert intolerances[]

Step 4: Religiöse/kulturelle Einschränkungen (ReligiousDietarySelector)
  [Halal] [Koscher] [Hindu-vegetarisch] [Weitere]
  Toggle: "Als absolute Einschränkung behandeln (Hard Constraint)"
  → Speichert religious_dietary + religious_is_hard

Step 5: No-Go Lebensmittel
  Food Search → User wählt ausgeschlossene Foods
  → Speichert excluded_foods[]

Step 6: Likes & Dislikes (optional)
  "Gibt es Lebensmittel oder Küchen die du bevorzugst/meidest?"
  FoodLikesInput + FoodDislikesInput
  → source: 'onboarding'

Step 7: Bevorzugte Küchen & Meal-Slots
  CuisinePreferenceSelector
  MealSlotEditor (Zeitplan konfigurieren)

Step 8: Abschluss
  "Alles eingerichtet!"
  [Zum Tagebuch] → onboarding_complete = true
```

**Skip/Abbruch:**
- User kann auf "Überspringen" tippen → Onboarding incomplete, wird beim nächsten Start erneut angeboten
- Teilweise ausgefüllte Felder werden gespeichert (kein Rollback)

**Wiederaufnahme:**
- Wenn `onboarding_complete = false` und Nutrition-Tab geöffnet → Badge + Hinweis "Ernährungsprofil einrichten"

**Validierung:**
- Keine Pflichtfelder — alles optional
- Save via `POST /api/nutrition/preferences/onboarding` nach jedem Step oder am Ende
- `onboarding_complete = true` erst nach Step 8 "Abschluss"

**Quelle:** ADR_NUTRITION_PREFERENCES_V1.md, NUTRITION_NEXT_SPEC_DECISIONS.md §6

---

## Flow 15: Meal Item Recalculate (FIX-4)

User lässt einen alten Diary-Eintrag neu berechnen wenn sich Food-Daten geändert haben.

**Trigger:**
- User öffnet ein Meal Item via Diary → "Bearbeiten"
- Button "Nährstoffe neu berechnen" erscheint wenn `snapshot_version > 1` ODER wenn
  Food-Daten neuer sind als `meal_item.created_at` (optional, V1 kann immer zeigen)
- Auch via: Meal → "Alle Items neu berechnen"

**Flow — Einzelitem:**

```
1. User tippt "Nährstoffe neu berechnen" auf einem Meal Item
2. Modal erscheint:
   ┌────────────────────────────────────────────────────┐
   │ Nährstoffe neu berechnen                           │
   │                                                    │
   │ Hähnchenbrust (roh) — 200g                        │
   │                                                    │
   │ Aktuell (Version 1):   218 kcal · 46g Protein     │
   │ Neu (aus BLS aktuell): 220 kcal · 46.4g Protein   │
   │                                                    │
   │ Differenz: +2 kcal · +0.4g Protein                │
   │                                                    │
   │ [Neu berechnen]  [Abbrechen]                       │
   └────────────────────────────────────────────────────┘
3. User tippt "Neu berechnen"
4. POST /api/nutrition/meal-items/:id/recalculate
5. Snapshot wird aktualisiert (History gesichert)
6. Diary-Werte aktualisieren sich
7. Toast: "Nährstoffe aktualisiert"
```

**Flow — Ganzes Meal:**

```
1. User öffnet Meal → "..." Menü → "Alle neu berechnen"
2. Bestätigung: "Alle X Items dieses Meals neu berechnen?"
3. POST /api/nutrition/meals/:id/recalculate
4. Response zeigt: X Items aktualisiert, Y übersprungen (manual), Z Fehler
5. Diary aktualisiert sich
```

**Regeln:**
- Manual Items (food_source='manual') → "Keine Food-Referenz — kein Recalculate möglich"
- food_id nicht mehr vorhanden → Fehler mit Hinweis: "Food existiert nicht mehr"
- Kein automatisches Recalculate — immer expliziter User-Klick
- Snapshot History bleibt erhalten (alte Versionen abrufbar)

**Referenz:** SPEC_06_RECALCULATE_PATCH.md

---

## Flow 16: MealCam Consent Settings (FIX-5)

User verwaltet die Training-Freigabe für MealCam-Bilder.

**Trigger:**
- Nach jedem MealCam-Scan: optionaler `MealCamConsentBanner`
- In Nutrition → Einstellungen → "MealCam & Datenschutz"
- In App-Einstellungen → Datenschutz → "MealCam-Bilder"

**Flow:**

```
1. User öffnet MealCam Consent Settings (MealCamConsentSettings Component)

2. Übersicht:
   ┌────────────────────────────────────────────────────┐
   │ MealCam Datenschutz                                │
   │                                                    │
   │ ● Gespeicherte Bilder: 12                         │
   │ ● Freigabe für Modellverbesserung: Nicht erteilt  │
   │                                                    │
   │ [Training-Freigabe erteilen]                       │
   │ [Alle Bilder anzeigen] → MealCamImageList          │
   │ [Alle Freigaben widerrufen]                        │
   └────────────────────────────────────────────────────┘

3. Training-Freigabe erteilen:
   Hinweis: "Deine Bilder werden anonymisiert für die Verbesserung
   der Food-Erkennung genutzt. Du kannst jederzeit widerrufen."
   [Erteilen] → POST /api/nutrition/mealcam/consent/grant-all

4. MealCam Bilder anzeigen (MealCamImageList):
   Liste aller gespeicherten Scans mit Datum + Vorschaubild
   Pro Bild: [Consent erteilt/nicht erteilt] [Bild löschen]
   Bild löschen → Nährwerte bleiben erhalten, Bild entfernt

5. Alle Freigaben widerrufen (RevokeAllConsentButton):
   Bestätigung: "Alle Bilder aus Trainingspool entfernen?"
   → POST /api/nutrition/mealcam/consent/revoke-all
   → Nährwerte bleiben, Bilder aus Trainingspool entfernt

6. Einzelner Scan: GET /api/nutrition/mealcam/scan/:id/feedback
   Zeigt: erkannte Items, User-Korrekturen, Confidence, finaler Diary-Eintrag
```

**Referenz:** ADR_MEALCAM_CONSENT.md

---

## Flow 17: Coach Suggestion Review (FIX-6)

User sieht und entscheidet über Coach-Vorschläge.

**Trigger:**
- Badge-Counter in Navigation: CoachSuggestionBadge zeigt Zahl offener Suggestions
- Nutrition → Einstellungen → "Coach-Vorschläge"
- Notification vom Coach

**Flow:**

```
1. User öffnet Coach Suggestion List
   → GET /api/nutrition/suggestions/pending

2. Liste aller pending Suggestions:
   ┌────────────────────────────────────────────────────┐
   │ Coach-Vorschläge (3 offen)                         │
   ├────────────────────────────────────────────────────┤
   │ 🎯 Kalorierziel anpassen           🟡 Ausstehend   │
   │    Max Müller · vor 2 Stunden                      │
   │                                                    │
   │ 🍎 Food-Alternative                🟡 Ausstehend   │
   │    Max Müller · gestern                            │
   │                                                    │
   │ ⚠️ Diary-Eintrag prüfen            🟡 Ausstehend   │
   │    Max Müller · vor 3 Tagen                        │
   │ → Läuft ab in 4 Tagen                             │
   └────────────────────────────────────────────────────┘

3. User tippt auf Suggestion → CoachSuggestionCard Detail:
   ┌────────────────────────────────────────────────────┐
   │ Kalorierziel anpassen                              │
   │ Von: Max Müller (Coach) · 02.05.2026               │
   │                                                    │
   │ Vorschlag:                                         │
   │   Kalorienziel: 2.000 → 2.200 kcal                │
   │   Proteinziel:  150g → 175g                        │
   │                                                    │
   │ Begründung:                                        │
   │   "Körperziel angepasst auf Aufbauphase."          │
   │                                                    │
   │ [Annehmen] [Ablehnen]                              │
   └────────────────────────────────────────────────────┘

4a. User tippt "Annehmen":
    Optional: Notiz hinterlassen (decision_note)
    → POST /api/nutrition/suggestions/:id/accept
    Typ-spezifische Wirkung:
      nutrition_target → Nutrition Target wird aktualisiert
      food_alternative → Info-only, kein automatisches Schreiben
      preference → NutritionPreferenceItem wird erstellt (source: 'coach_suggestion')
      micronutrient_comment / diary_flag / mealcam_comment → als gelesen markiert
    Status → accepted
    Toast: "Vorschlag angenommen"

4b. User tippt "Ablehnen":
    Optional: Begründung eingeben (decision_note)
    → POST /api/nutrition/suggestions/:id/reject
    Status → rejected
    Toast: "Vorschlag abgelehnt"

5. Abgelaufene Suggestions (status = expired):
   Werden nach TTL (7 Tage) automatisch expired
   Erscheinen in "Vergangene Vorschläge" Section
   Keine Entscheidung mehr möglich
```

**Status-Visualisierung:**
- 🟡 `pending` — Ausstehend
- 🟢 `accepted` — Angenommen
- ⚫ `rejected` — Abgelehnt
- 🔴 `expired` — Abgelaufen

**Referenz:** ADR_COACH_PERMISSIONS_V1.md, SPEC_07_PASS2_PATCH.md §6

---

## Flow 18: Coach Permissions Settings (FIX-15)

User verwaltet granulare Coach-Zugriffsrechte für Nutrition.

**Trigger:**
- Nutrition → Einstellungen → "Coach-Zugriff"
- Beim ersten Coach-Assignment: Hinweis auf Datenschutz-Einstellungen

**Flow:**

```
1. User öffnet CoachPermissionsPanel

2. Anzeige (alle Toggles Standard: OFF):
   ┌────────────────────────────────────────────────────┐
   │ Coach-Zugriff: Max Müller                          │
   ├────────────────────────────────────────────────────┤
   │ Was darf dein Coach sehen?                         │
   │                                                    │
   │ ☐ Tagebuch (Mahlzeiten + Makros)                  │
   │    Dein Coach sieht deine täglichen Mahlzeiten     │
   │                                                    │
   │ ☐ Wasseraufnahme                                   │
   │    Dein Coach sieht deine Wasserlogs               │
   │                                                    │
   │ ☐ Mikronährstoff-Analyse                           │
   │    Dein Coach sieht Vitaminstatus und Flags        │
   │                                                    │
   │ ☐ MealCam-Bilder (separate Freigabe)              │
   │    Dein Coach kann deine Foto-Scans sehen          │
   │    ⚠️ Separate Freigabe — Standard: Gesperrt       │
   │                                                    │
   │ ☐ Ernährungsziele                                  │
   │    Dein Coach sieht deine Kalorien/Makro-Ziele     │
   │                                                    │
   │ ☐ Eigene Lebensmittel                             │
   │    Dein Coach sieht deine Custom Foods             │
   │                                                    │
   │ ☐ Rezepte                                         │
   │    Dein Coach sieht deine gespeicherten Rezepte   │
   │                                                    │
   │ ☐ Meal Plans                                       │
   │    Dein Coach sieht deine Meal Plans               │
   │                                                    │
   │ ☐ Ernährungspräferenzen                           │
   │    Dein Coach sieht deine Allergien/Präferenzen   │
   │                                                    │
   │ [Einstellungen speichern]                          │
   └────────────────────────────────────────────────────┘

3. User schaltet Toggle(s) an/aus
4. User tippt "Einstellungen speichern"
   → Permission-API (Auth-Modul) speichert Freigaben
   → Nutrition-Modul schreibt nicht direkt in Coach-Permissions
5. Toast: "Coach-Zugriff aktualisiert"
6. Coach wird informiert (wenn Zugriff entzogen)
```

**Regeln:**
- Default: alle OFF — User muss aktiv freigeben
- MealCam-Bilder haben separate Freigabe (extra Erklärung + Bestätigung)
- Änderungen sind sofort wirksam
- User kann Freigaben jederzeit widerrufen
- Alle Coach-Zugriffe werden geloggt (Audit-Trail)

**9 Toggle-Permissions:**
```
nutrition.diary, nutrition.water, nutrition.micronutrient,
nutrition.mealcam_images, nutrition.targets, nutrition.custom_foods,
nutrition.recipes, nutrition.meal_plans, nutrition.preferences
```

**Referenz:** ADR_COACH_PERMISSIONS_V1.md, SPEC_07_PASS2_PATCH.md §6

---

## Flow 19: Quick-Add Makros (FIX-11)

Direktes Loggen von Makros ohne Food-Suche. Alternativer Eingabeweg im Diary.

**Trigger:**
- Diary → "+ Food hinzufügen" → Tab "Schnell-Makros"
- ODER: Diary → "+" → "Schnell-Makros"

**Flow:**

```
1. User tippt auf "Schnell-Makros" Tab in FoodSearchView
   ODER auf dedizierten Button QuickMacroEntry

2. QuickMacroEntry Modal:
   ┌────────────────────────────────────────────────────┐
   │ Schnell-Makros hinzufügen                          │
   ├────────────────────────────────────────────────────┤
   │ Kalorien:      [___] kcal  (Pflicht)               │
   │ Protein:       [___] g     (optional)              │
   │ Kohlenhydrate: [___] g     (optional)              │
   │ Fett:          [___] g     (optional)              │
   │ Label:         [___] z.B. "Meal Prep Bowl"          │
   │ Mahlzeit:      [Frühstück ▼]                       │
   │                                                    │
   │ ⓘ Keine Mikronährstoffdaten verfügbar.             │
   │   Im Mikronährstoff-Dashboard: "Keine Mikro-Daten" │
   │                                                    │
   │ [Hinzufügen]                                       │
   └────────────────────────────────────────────────────┘

3. User tippt "Hinzufügen"
   POST /api/nutrition/meals → MealItem mit:
     food_source = 'manual'
     food_name = Label (oder "Manuelle Eingabe")
     food_id = null, custom_food_id = null
     nutrients = {} (leer — keine Mikros)
     enercc, prot625, fat, cho gesetzt
4. Diary aktualisiert sich
5. MicroDashboard zeigt dieses Item als "Keine Mikro-Daten"
```

**Validierung:** Mindestens kcal muss eingegeben werden.

**Referenz:** ADR_IMPROVEMENTS_PACKAGE.md #14, SPEC_04 Feature 5a

---

## V1-Status-Marker für Schema-only Features (FIX-7)

Die folgenden Flows aus SPEC_03 sind V1 schema-only / Phase 2:

| Flow | Thema | V1-Status |
|---|---|---|
| Flow 7 | Rezept erstellen + loggen | ⚠️ Schema-only V1 — Full UI wenn Zeit reicht, Phase 2 wenn Zeit knapp |
| Flow 8 | Einkaufsliste aus Rezept | ⚠️ Schema-only V1 — Full UI Phase 2 |
| Flow 3 | Meal Plan Aktivierung | ⚠️ Schema-only V1 — Full UI wenn Zeit reicht |
| Flow 4 | Ghost Entry bestätigen | ⚠️ Schema-only V1 — hängt von Flow 3 ab |
| Flow 11–13 | Meal Plan Lifecycle | ⚠️ Schema-only V1 — Phase 2 wenn Zeit knapp |

**Verbindlich:** ADR_RECIPES_SCHEMA_ONLY.md, NUTRITION_NEXT_SPEC_DECISIONS.md §15
