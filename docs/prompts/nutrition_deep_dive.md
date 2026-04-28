# Claude Code — LUMEOS Mockup: Nutrition Deep Dive + Methodik

## Das Vorgehen (gilt für ALLE Module)

Bevor du irgendetwas schreibst, lies für jedes Modul in dieser Reihenfolge:

```
1. docs/specs/[Modul]/SPEC_04_FEATURES.md    → Vollständige Feature-Liste
2. docs/specs/[Modul]/SPEC_09_SCORING.md     → Scoring-Algorithmen + Formeln
3. docs/specs/[Modul]/SPEC_10_COMPONENTS.md  → Component-Inventar + Hooks
4. docs/specs/[Modul]/SPEC_03_USER_FLOWS.md  → Alle User Flows
5. temp/lumeosold/apps/app/modules/[modul]/components/  → Echte Implementation
6. docs/BrainstormDocs/[Modul]/               → Vision + Strategie
```

Dann bau die Views so dass sie **alle Features, Flows und Komponenten** aus den Specs abbilden.
Das Mockup ist ohne DB/Logik — aber jede UI-Struktur muss der Spec entsprechen.

---

## JETZT: Nutrition Modul vollständig ausbauen

### Schritt 1 — Diese Files lesen (Pflicht vor dem Schreiben)

```
docs/specs/Nutrition/SPEC_04_FEATURES.md        ← 15 Features inkl. Food Preferences, Settings
docs/specs/Nutrition/SPEC_09_SCORING.md         ← Score-Formel, MicroFlags, Plan Compliance
docs/specs/Nutrition/SPEC_10_COMPONENTS.md      ← 50+ Components, 24 Hooks
docs/specs/Nutrition/SPEC_03_USER_FLOWS.md      ← 14 User Flows inkl. Ghost Entries, MealCam
temp/lumeosold/apps/app/modules/nutrition/components/  ← Alle 35 echten Components
```

---

### Schritt 2 — Neue Views / Tabs die komplett fehlen

Das Nutrition-Modul hat laut SPEC_10_COMPONENTS 5 Haupt-Views:

**Aktuell im Mockup:** `📋 Tagebuch | 💡 Insights | 🎯 Ziele | 🌡️ Heatmap`

**Laut Spec müssen es sein:**
```
📋 Tagebuch       → DiaryView (vorhanden, aber unvollständig)
🔍 Suche          → FoodSearchView (FEHLT KOMPLETT)
📅 Pläne          → MealPlansView (FEHLT KOMPLETT)
📊 Insights       → InsightsView (vorhanden, aber unvollständig)
⚙️ Einstellungen  → PreferencesView/SettingsView (FEHLT KOMPLETT)
```

**index.html und features/nutrition/index.js müssen geupdated werden.**

---

### Schritt 3 — Was gebaut werden muss (Detail)

---

#### `features/nutrition/DiaryView.js` — Verbessern

**Lies:** `temp/lumeosold/apps/app/modules/nutrition/components/DiaryView.tsx`
und alle anderen Dairy-Components

Was noch fehlt oder verbesserbar:

**NutritionScoreCard** — oben in der rechten Spalte:
```
Score: 84/100 ✅
Breakdown:
  Protein:       94% ████████░ 
  Kalorien:      88% ███████░░
  Kohlenhydrate: 82% ██████░░░
  Fett:          91% ███████░░
  Ballaststoffe: 71% █████░░░░
Level: Intermediate (×0.90)
```

**DaySummary** — am Ende des Diary:
- Abend-Review Card: Compliance % + Score + aktive Flags + Buddy-Empfehlung
- "Protein offen: 28g — kleiner Casein-Shake?" 

**RemainingBar** — unter MacroRing in rechter Spalte:
```
Verbleibend:   260 kcal  28g P  42g KH offen
```
Als farbige Progress-Bars (wie SPEC beschreibt)

**Plan-Compliance** wenn Plan aktiv:
```
Plan: "Hypertrophie Woche 3" — 3/5 bestätigt heute (60%)
```

---

#### `features/nutrition/FoodSearchView.js` — NEUE DATEI

**Lies:** `temp/lumeosold/apps/app/modules/nutrition/components/FoodSearch.tsx`
und `SmartSuggestions.tsx`, `FoodSearchResults.tsx`

```js
window.Nutrition_FoodSearchView = function() {
  return `
    <!-- Schnellzugriff-Buttons -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button>📊 Meist genutzt</button>
      <button>👤 Eigene Foods</button>
      <button>📋 Wie gestern</button>
      <button>📅 Aus Mealplan</button>
    </div>

    <!-- Suchfeld -->
    <div class="card" style="padding:12px">
      <div style="display:flex;gap:8px;align-items:center">
        🔍 [Suchfeld] [Smart Search ⚡] [Filter ▼]
      </div>
    </div>

    <!-- Filter Panel (collapsed/expanded) -->
    <div class="card">
      Kategorien: [Alle] [Fleisch] [Fisch] [Milch] [Eier] [Getreide] [Gemüse] [Obst] ...
      Diät:       [Vegetarisch] [Vegan] [Low-Carb] [Keto] [High-Protein]
      Sortierung: [Relevanz ✓] [Protein ↓] [Kalorien ↑] [Name A-Z]
    </div>

    <!-- Suchergebnisse (Custom Foods first) -->
    <div class="card">
      <div>Meine Foods (2)</div>
      <!-- Custom Food Cards -->
      
      <div>Alle Lebensmittel</div>
      <!-- BLS Food Cards mit: Name, kcal/100g, P/KH/F Badges -->
    </div>

    <!-- Food Detail + Mengen-Eingabe (wenn ausgewählt) -->
    <div class="card">
      Hähnchenbrust (roh)
      Menge: [200] g
      Portionen: [1 Stück ~120g] [1 Brust ~150g]
      
      Bei 200g: 218 kcal · 46g P · 3.4g F · 0g KH
      
      [Hinzufügen zu: Frühstück ▼]
    </div>
  `;
};
```

**Food Cards** müssen zeigen:
- Name (deutsch)
- kcal/100g
- Makro-Badges: `46g P` `0g KH` `3g F`
- Diät-Tags wenn vorhanden: `🥩 Fleisch` `💪 High-Protein`
- Bei Custom Food: `👤` Icon

**Smart Suggestions** Section:
- 3-5 personalisierte Vorschläge ohne Suchbegriff
- Basis: Bisherige Präferenzen + Tageszeit + offene Makros
- Zeige warum: "Empfohlen: noch 28g Protein offen"

---

#### `features/nutrition/MealPlansView.js` — NEUE DATEI

**Lies:** `temp/lumeosold/apps/app/modules/nutrition/components/MealPlanView.tsx`

```js
window.Nutrition_MealPlansView = function() {
  // Plan-Liste mit Status-Badges
  // Plan-Detail mit Tages-Accordion (Tag 1, Tag 2...)
  // Aktivierungs-Flow visuell
  // Plan-Compliance für aktiven Plan
};
```

Zeige mindestens:
- Aktiver Plan (hervorgehoben, compliance %)
- Abgeschlossene Pläne (ausgegraut)
- Verfügbare Pläne zum Aktivieren
- Plan-Karte: Name, Quelle (Eigener/Coach/Marketplace), Kalorien/Tag, Dauer, Status

Plan-Quellen-Badges:
- `Eigener Plan` (kein Badge)
- `Von Coach Mueller` (blauer Badge)
- `Gekauft: Lean Bulk 12W` (orangener Badge "Marketplace")
- `Erstellt von Buddy` (grüner Badge "AI")

Lifecycle-Picker:
```
○ Einmalig — endet nach 12 Tagen
○ Wiederholend — startet automatisch neu  
○ Gefolgt von... → [Plan B wählen]
```

---

#### `features/nutrition/InsightsView.js` — DEUTLICH ERWEITERN

**Lies:** `SPEC_09_SCORING.md` (Score-Breakdown, MicroFlags)
und `temp/lumeosold/apps/app/modules/nutrition/components/InsightsView.tsx`
und `MacroDashboard.tsx`, `MacroDetail.tsx`, `TrendAnalysis.tsx`

**Das User spezifisch vermisst: Makro Details + Mikro Details**

**Sektion 1 — Nutrition Score Breakdown** (oben):
```
Gesamt-Score: 84 / 100 ✅

Gewichtete Compliance:
  Protein       ████████░░  94%  × 0.30 = 28.2 Pkt
  Kalorien      ███████░░░  88%  × 0.25 = 22.0 Pkt  
  Kohlenhydrate ██████░░░░  82%  × 0.15 = 12.3 Pkt
  Fett          ███████░░░  91%  × 0.15 = 13.7 Pkt
  Ballaststoffe █████░░░░░  71%  × 0.15 =  8.0 Pkt
                                   Gesamt: 84.2 Pkt
Level: Intermediate (Faktor ×0.90)
```

**Sektion 2 — Makro-Details (aufgebrochen pro Makro)**

Pro Makro eine expandierbare Sektion:

**Protein:**
```
Protein: 142g / 170g Ziel (84%)
├─ Vollständige Proteine: Hähnchen, Whey, Eier
├─ Quellen heute:
│   🥩 Hähnchen   46g  (32%)  ████████
│   🥛 Whey        22g  (16%)  ████
│   🥚 Eier        18g  (13%)  ███
│   🐟 Lachs       14g  (10%)  ██
│   🥬 Andere      42g  (29%)  ██████
├─ Aminosäuren (Tier 2):
│   Leucin:  12.4g / 14g (89%) ✅
│   BCAA:    28g / 35g  (80%) ⚠️
└─ Fehlen noch: 28g → z.B. 120g Magerquark (14g P)
```

**Kohlenhydrate:**
```
Kohlenhydrate: 198g / 240g Ziel (83%)
├─ Zucker:      42g    (21%) ⚠️ max 50g/Tag
├─ Stärke:     134g    (68%)
├─ Ballaststoffe: 22g / 30g (73%) ⚠️
└─ Qualität: Komplexe KH: 78% ✅ | Einfache KH: 22%
```

**Fett:**
```
Fett: 62g / 70g Ziel (89%)
├─ Gesättigte FS:    18g  (29%) ✅
├─ Einfach unges.:   28g  (45%)
├─ Mehrfach unges.:  16g  (26%)
│   ├─ Omega-3:    2.1g / 3g (70%) ⚠️
│   │   └─ EPA/DHA: 0.8g   Fischöl-Supplement empfohlen
│   └─ Omega-6:    13.9g
└─ Omega-3:6 Ratio: 1:6.6  (Ziel: 1:4)
```

**Ballaststoffe:**
```
Ballaststoffe: 22g / 30g (73%) ⚠️
Quellen heute:
  🫘 Hülsenfrüchte:  8g
  🥦 Gemüse:         7g
  🌾 Vollkorn:       5g
  🍎 Obst:           2g
Noch 8g offen → Empfehlung: 1 Apfel + 30g Haferflocken
```

---

**Sektion 3 — Mikronährstoffe DETAIL (aufgebrochen)**

Das user-spezifisch vermisst: jeder Mikronährstoff einzeln runtergebrochen

**Tier 1 — Essential (immer sichtbar):**
```
Vitamine                      Heute    RDA    Status
─────────────────────────────────────────────────────
Vitamin A      🟡  72%         864µg / 1200µg  ⚠️ 
Vitamin D      🔴  62%           5µg /  20µg   🔴 kritisch
  → Supplement: Vitamin D3 deckt nur 50% — Tageslicht empfohlen
Vitamin E      ✅  94%          12mg /  13mg
Vitamin K      ✅  88%          88µg / 100µg
Vitamin C      ✅ 112%          90mg /  80mg   (Surplus ok)
Vitamin B1     ✅  95%         1.14mg / 1.2mg
Vitamin B2     ✅  98%         1.37mg / 1.4mg
Vitamin B3     ✅  91%          14mg /  15mg
Vitamin B6     🟡  78%         1.17mg / 1.5mg  ⚠️
Vitamin B12    ✅ 100%           3µg /   3µg

Mineralstoffe                 Heute    RDA    Status
─────────────────────────────────────────────────────
Calcium        🟡  74%          740mg / 1000mg  ⚠️
Eisen          ✅  92%           8.3mg /  10mg
Magnesium      🟡  88%          353mg /  400mg  (inkl. Supplement: 753mg ✅)
Phosphor       ✅  98%           980mg / 1000mg
Kalium         🟡  71%          2840mg / 4000mg  ⚠️
Zink           ✅  95%            9.5mg /  10mg
```

Pro Mikronährstoff Klick: Expandiert zu:
```
Vitamin D — Details
  Funktion:  Knochengesundheit, Immunsystem, Testosteron, Stimmung
  Heute:     5.2µg  (aus Nahrung: 0.2µg + Supplement: 5µg)
  Ziel:      20µg RDA
  Status:    🔴 Kritisch (26% der RDA ohne Supplement)
  Quellen:   Lachs (top) · Hering · Eier · Pilze
  Empfehlung: Vitamin D3 Supplement (5000 IU) + täglich 20min Sonne
```

**Tier 2 — Athlete (Plus-User):**
Kupfer, Mangan, Selen, Jod, Folat, Biotin — gleiche Darstellung

---

#### `features/nutrition/SettingsView.js` — NEUE DATEI (User spezifisch vermisst)

**Lies:** `SPEC_04_FEATURES.md` Feature 12 (Food Preferences) + Feature 15 (Settings)
und `temp/lumeosold/apps/app/modules/nutrition/components/SettingsView.tsx`

**Das muss enthalten:**

**1. Mahlzeiten-Zeitplan (Meal Schedule Editor)**
```
Meine Mahlzeiten                         [+ Mahlzeit hinzufügen]
──────────────────────────────────────────
☑ Frühstück          07:00   [umbenennen] [Zeit] [löschen]
☑ Snack 1            10:00   [umbenennen] [Zeit] [löschen]
☑ Mittagessen        12:30   [umbenennen] [Zeit] [löschen]
☑ Snack 2            15:00   [umbenennen] [Zeit] [löschen]
☑ Abendessen         18:30   [umbenennen] [Zeit] [löschen]
☐ Pre-Workout        17:00   [aktivieren]  (deaktiviert)
☐ Post-Workout       19:00   [aktivieren]  (deaktiviert)
```
User kann: Mahlzeiten aktivieren/deaktivieren, umbenennen, Zeiten ändern, neue hinzufügen.

**2. Diät-Typ Auswahl**
```
Mein Ernährungsstil
──────────────────────────────────────────────
[Omnivor ✓] [Vegetarisch] [Vegan] [Pescatarisch]
[Keto]      [Paleo]       [Low-Carb] [Mediterran]

Kochskill:    [Anfänger] [Mittel ✓] [Fortgeschritten]
Max. Zubereitungszeit: [15min] [30min ✓] [60min] [Egal]
```

**3. Allergene (EU 14 + weitere)**
```
Allergien & Unverträglichkeiten
──────────────────────────────────────────────
[Gluten ☐] [Milch ☐] [Eier ☐] [Nüsse ☐] [Erdnüsse ☐]
[Fisch ☐] [Schalentiere ☐] [Soja ☐] [Sesam ☐]
[Sellerie ☐] [Senf ☐] [Sulfite ☐] [Lupine ☐] [Weichtiere ☐]
                                        
⚠️ Allergene werden aus der Food Search HART ausgeschlossen
```

**4. Likes & Dislikes**
```
Meine Food-Präferenzen
──────────────────────────────────────────────
Favoriten-Kategorien:     [+ Kategorie mögen]
  💚 Hähnchen             [✕]
  💚 Lachs                [✕]
  💚 Haferflocken         [✕]

Nicht-mögen Kategorien:   [+ Kategorie nicht mögen]
  ❌ Innereien            [✕]
  ❌ Fertiggerichte       [✕]

Favoriten-Tags:           [+ Tag mögen]
  💚 High-Protein         [✕]
  💚 Post-Workout         [✕]

Spezifische Foods:
  💚 Hähnchenbrust (roh)  [✕]
  ❌ Feta-Käse            [✕]
```

**5. Micro-Dashboard Einstellungen**
```
Mikronährstoff-Anzeige
──────────────────────────────────────────────
Anzeige-Level: ○ Tier 1 — Essential (15 Nährstoffe)
               ● Tier 2 — Athlete   (+8 weitere)     ✓
               ○ Tier 3 — Medical   (alle 138)
               
MealCam Confidence: ████████░░ 85% (Auto-Accept ab diesem Wert)
Gewicht täglich tracken: [✓ Aktiviert]
```

**6. Wasser Quick-Add Mengen**
```
Quick-Add Mengen (ml)
──────────────────────────────────────────────
[250] [500] [750] [1000] [+ Eigene Menge]
```

---

### Schritt 4 — index.html und index.js updaten

**features/nutrition/index.js** muss auf 5 Tabs erweitert werden:
```js
window.renderNutrition = function(tab) {
  switch(tab) {
    case 0: return window.Nutrition_DiaryView();
    case 1: return window.Nutrition_FoodSearchView();
    case 2: return window.Nutrition_MealPlansView();
    case 3: return window.Nutrition_InsightsView();
    case 4: return window.Nutrition_SettingsView();
    default: return '';
  }
};
```

**index.html** MODULES-Objekt nutrition-Eintrag updaten:
```js
nutrition: {
  tabs: ['📋 Tagebuch', '🔍 Suche', '📅 Pläne', '📊 Insights', '⚙️ Einstellungen'],
  ...
}
```

---

### Schritt 5 — Neue Script-Tags in index.html

```html
<script src="features/nutrition/FoodSearchView.js"></script>
<script src="features/nutrition/MealPlansView.js"></script>
<script src="features/nutrition/SettingsView.js"></script>
```

---

## Generelle Regeln (wie immer)

- Eine Datei pro Write
- CSS vars everywhere (tokens.css)
- 2-Spalten-Layout wo sinnvoll
- CSS-only Charts
- Realistische Dummy-Daten

## Reihenfolge

1. Lies alle genannten Spec-Dateien + old repo components
2. `features/nutrition/FoodSearchView.js` — neue Datei
3. `features/nutrition/MealPlansView.js` — neue Datei
4. `features/nutrition/SettingsView.js` — neue Datei (User spezifisch gewünscht)
5. `features/nutrition/InsightsView.js` — komplett neu (Makro-Detail + Mikro-Detail)
6. `features/nutrition/DiaryView.js` — NutritionScore + DaySummary ergänzen
7. `features/nutrition/index.js` — 5 Tabs
8. `index.html` — Tabs + Script-Tags updaten
