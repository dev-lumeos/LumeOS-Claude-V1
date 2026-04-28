# Claude Code — Nutrition Modul: Kompletter Rebuild

## Pflicht: Diese Dateien ZUERST lesen, bevor eine einzige Zeile geschrieben wird

```
temp/lumeosold/apps/app/app/(app)/nutrition/page.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MacroDetail.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MicroDashboard.tsx
temp/lumeosold/apps/app/modules/nutrition/components/FoodPreferences.tsx   ← 927 Zeilen
temp/lumeosold/apps/app/modules/nutrition/components/FoodsView.tsx
temp/lumeosold/apps/app/modules/nutrition/components/InsightsView.tsx
temp/lumeosold/apps/app/modules/nutrition/data/nutrientDetails.ts          ← 2454 Zeilen
```

---

## Was falsch ist und was gebaut werden muss

**Old Repo Struktur (korrekt):**
- 5 Primary Tabs: Tagebuch / Insights / Lebensmittel / Trends / Einstellungen
- InsightsView → Sub-Tabs: 🧬 Makros | 🔬 Mikros | 🎯 Targets
- FoodsView → Sub-Tabs: 🔍 Suche | 📖 Rezepte | 📅 Pläne | ✏️ Eigene
- Einstellungen → 4-Step Wizard mit 60+ Food-Grid

**Aktuelles Mockup (falsch):**
- Suche + Pläne als eigenständige Tabs statt Sub-Tabs
- SettingsView = simple Key/Value statt 4-Step Wizard
- MacroDetail = oberflächlich, kein echter Nährstoff-Baum
- MicroDashboard = fehlt die klickbare Detail-Card pro Nährstoff

---

## Schritt 1: Sub-Tab System in index.html prüfen

Muss vorhanden sein (aus Training-Rebuild). Falls nicht:
CSS `.subtab-nav`, `.subtab-btn`, `.subtab-btn.active` + JS `switchSubTab()`, `getActiveSubTab()` einbauen.

---

## Schritt 2: Nutrition MODULES-Eintrag ersetzen

```js
nutrition: {
  icon: '🍽️', title: 'Ernährung', gradient: 'g-nutrition',
  desc: 'Dein Tagesprotokoll — 27. April 2026',
  kpis: [{val:'1.840',lbl:'Kalorien 🔥'},{val:'142g',lbl:'Protein 💪'},{val:'2.1L',lbl:'Wasser 💧'}],
  tabs: ['📝 Tagebuch', '📊 Insights', '🔍 Lebensmittel', '📈 Trends', '⚙️ Einstellungen'],
  subTabs: {
    0: [],
    1: ['🧬 Makros', '🔬 Mikros', '🎯 Targets'],
    2: ['🔍 Suche', '📖 Rezepte', '📅 Pläne', '✏️ Eigene'],
    3: [],
    4: [],
  },
  render: (tab, subTab = 0) => window.renderNutrition(tab, subTab),
},
```

---

## Schritt 3: features/nutrition/index.js komplett neu

```js
window.renderNutrition = function(tab, subTab) {
  subTab = subTab || 0;
  switch(tab) {
    case 0: return window.Nutrition_DiaryView();
    case 1:
      switch(subTab) {
        case 0: return window.Nutrition_MacroDetail();
        case 1: return window.Nutrition_MicroDashboard();
        case 2: return window.Nutrition_TargetsView();
        default: return '';
      }
    case 2:
      switch(subTab) {
        case 0: return window.Nutrition_FoodSearchView();
        case 1: return window.Nutrition_RecipeList();
        case 2: return window.Nutrition_MealPlansView();
        case 3: return window.Nutrition_CustomFoodForm();
        default: return '';
      }
    case 3: return window.Nutrition_TrendsView();
    case 4: return window.Nutrition_PreferencesView();
    default: return '';
  }
};
```

---

## Schritt 4: Neue View-Dateien (eine nach der anderen)

---

### A. `MacroDetail.js` — `window.Nutrition_MacroDetail`

**Exakte Struktur aus MacroDetail.tsx:**

Period Selector oben rechts: `[Heute] [7d] [14d] [30d]`

Drei aufklappbare Sektionen mit farbigem Header:

**🫒 Fett (62.4g)** — gelber Header
Hierarchischer Baum, 3 Ebenen tief. Balken = Anteil am Makro-Total:
```
Gesättigte Fettsäuren   18.2g  ████████░░  29%
  ▶ Palmitinsäure       11.1g  ████░░      18%
  ▶ Stearinsäure         4.8g  ██░░         8%
Einfach ungesättigt     27.8g  ████████████ 45%
  ▶ Ölsäure (C18:1)    26.4g  ████████░░   42%
Mehrfach ungesättigt    11.4g  ████░░        18%
  ▶ Linolsäure (LA)      9.8g  ████░░        16%
  ▶ EPA                  0.6g  ░░            1%
  ▶ DHA                  0.2g  ░░            0%
Trans-Fettsäuren         1.0g  ░░            2%
```

**🍞 Kohlenhydrate (198.4g)** — grüner Header
```
Stärke            134.2g  █████████    68%
Zucker gesamt      42.1g  ████░░        21%
  ▶ Glucose        14.8g  ██░░          7%
  ▶ Fructose       12.3g  ██░░          6%
  ▶ Saccharose     11.6g  ██░░          6%
Ballaststoffe      22.1g  ████░░        11%
  ▶ Löslich         7.8g  ██░░          4%
  ▶ Unlöslich      14.3g  ██░░          7%
```

**🥩 Protein (142.3g)** — blauer Header
```
Essentielle AAs    68.4g  █████████    48%
  ▶ Leucin (LEU)   12.4g  █████░░       9%  ← mTOR Trigger
  ▶ Isoleucin       7.1g  ████░░        5%
  ▶ Valin           7.8g  ████░░        5%
  ▶ Lysin           9.2g  █████░░       6%
  ▶ Methionin       3.8g  ██░░          3%
  ▶ Phenylalanin    6.1g  ███░░         4%
  ▶ Threonin        5.9g  ███░░         4%
  ▶ Tryptophan      1.8g  █░░           1%
  ▶ Histidin        4.3g  ██░░          3%
Nicht-essenziell   73.9g  ██████████   52%
  ▶ Alanin          8.4g  ...
```

**NutrientRow Implementierung:**
```js
// hasChildren → Klick togglet expand/collapse
// depth → Einrückung: depth * 16px links-padding
// Balken: relativ zum Parent-Total (nicht Makro-Gesamt)
// State: window._macroOpenRows = {} → key: open/closed
```

---

### B. `MicroDashboard.js` — `window.Nutrition_MicroDashboard`

**Das ist die komplexeste View. Alle Details implementieren.**

**Period Selector:** `[Heute] [7d] [14d] [30d]`

**Quick Summary (immer sichtbar, 4 Counters):**
```
┌──────────────────────────────────────────────┐
│  28 Optimal   8 Adequate   2 Defizit   19 –  │
│   (≥80%)      (50-79%)     (<50%)    kein RDA │
└──────────────────────────────────────────────┘
```

**Gruppen-Struktur (alle aufklappbar):**

Jede Gruppe: Header-Button mit Icon + Titel + Anzahl + Badge
Badge: "X Mangel" (rot) oder "X/Y optimal" (grün)

```
💊 Vitamine (22)          [2 Mangel]  ▶
🪨 Mineralstoffe (7)      [1 Mangel]  ▶
🔬 Spurenelemente (9)     [✅ 7/9]    ▶
💪 Aminosäuren (19)       [kein RDA]  ▶
🫒 Fettsäuren (36)        [2 Mangel]  ▶
🍞 KH-Details (8)                     ▶
```

**Vitamine hat SUB-Gruppen** (weitere Ebene):
```
💊 Vitamine aufgeklappt:
  [Fettlöslich ▶]   → Vitamin A/D/E/K
  [Wasserlöslich ▶] → B1-B12 + C
```

**Nährstoff-Zeile:**
```
[Vitamin D ▼]      5.2μg / 20μg    26%
[████░░░░░░░░░░░░░░░░]              🔴
```
→ Klick öffnet Detail-Card (nur eine gleichzeitig offen)

---

**DETAIL-CARD — Das Herzstück (beim Klick auf jeden Nährstoff):**

Gradient-Hintergrund (blau/indigo), 7 Sektionen:

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Beschreibung                                          │
│    [2-3 Sätze: Was ist es, Funktion, Besonderheit]      │
│                                                         │
│ [Wenn pct < 50% → ROTER ALERT-BLOCK:]                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 MANGEL-RISIKO: [deficiency_de Text]              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Wenn pct >= 50% → normaler Text:]                     │
│ ⚠️ Bei Mangel: [deficiency_de Text]                     │
│                                                         │
│ [Wenn pct > 200% → ORANGER ALERT-BLOCK:]               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔶 ÜBERSCHUSS-WARNUNG: [excess_de Text]             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Wenn pct <= 200% → normaler Text:]                    │
│ 🔶 Bei Überschuss: [excess_de Text]                     │
│                                                         │
│ 🔄 Wechselwirkungen: [interactions_de]                  │
│                                                         │
│ 🎯 RDA Standard: X | RDA Athlet: Y | ⛔ Obergrenze: Z  │
│                                                         │
│ 🥗 Top-Quellen: Quelle 1, Quelle 2, Quelle 3           │
│                                                         │
│ 💡 [tip_de — kursiv]                                    │
└─────────────────────────────────────────────────────────┘
```

**Beispiel Vitamin D (pct=26%, Mangel aktiv):**
```html
<!-- Rotes Mangel-Banner -->
<div style="padding:10px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px">
  <span style="font-weight:700;color:#b91c1c">🔴 MANGEL-RISIKO:</span>
  Muskelschwäche, erhöhte Infektanfälligkeit, Knochenschmerzen, verlangsamte Recovery
</div>
<!-- Dann normal: Überschuss, Wechselwirkungen, RDA, Quellen, Tipp -->
```

**NUTRIENT_DETAILS Objekt — direkt in MicroDashboard.js einbetten:**

Alle Texte aus `nutrientDetails.ts` (DE-Felder), mindestens für:
```js
const NUTRIENT_DETAILS = {
  // Vitamine fettlöslich
  VITA:   { detail:'...', deficiency:'...', excess:'...', interactions:'...', rda_standard:'900μg (M), 700μg (F)', rda_athlete:'Standard', ul:'3000μg', top_sources:['Leber','Karotten','Süßkartoffeln'], tip:null },
  VITD:   { detail:'...', deficiency:'Muskelschwäche, erhöhte Infektanfälligkeit...', excess:'Hyperkalzämie, Nierensteine...', interactions:'Verbessert Kalzium-Absorption. Magnesium wird für Aktivierung benötigt.', rda_standard:'600IU (15μg)', rda_athlete:'2000-5000IU', ul:'4000IU (100μg)', top_sources:['Fetter Fisch','Eier','Sonnenlicht'], tip:'Kritisch für Athleten! Bluttest empfohlen.' },
  VITE:   { ... },
  VITK:   { ... },
  // Vitamine wasserlöslich
  VITC:   { ... },
  THIA:   { ... },
  RIBF:   { ... },
  NIA:    { ... },
  PANTAC: { ... },
  VITB6:  { ... },
  BIOT:   { ... },
  FOL:    { ... },
  VITB12: { ... },
  // Mineralstoffe
  CA: { ... }, MG: { ... }, P: { ... }, K: { ... }, NA: { ... },
  // Spurenelemente
  FE: { ... }, ZN: { ... }, CU: { ... }, MN: { ... }, SE: { ... }, ID: { ... }, CR: { ... }, MO: { ... },
  // Aminosäuren (key ones)
  LEU: { detail:'Leucin triggert mTOR — direkter Muskelaufbau-Schalter. Mindest-Schwelle: 2-3g pro Mahlzeit.', deficiency:'Reduzierter Muskelaufbau, langsamere Protein-Synthese', excess:null, interactions:'Synergistisch mit Isoleucin + Valin (BCAA)', rda_standard:'2-3g/Mahlzeit', rda_athlete:'2-3g/Mahlzeit', ul:null, top_sources:['Whey Protein','Hähnchenbrust','Eier','Rindfleisch'], tip:'Leucin triggert mTOR — Muskelaufbau!' },
  ILE: { ... }, VAL: { ... }, LYS: { ... }, TRP: { ... },
  // Fettsäuren
  F20D5N3: { ... },  // EPA
  F22D6N3: { ... },  // DHA
};
```

Alle Texte direkt aus `nutrientDetails.ts` DE-Felder übernehmen.

**Dummy-Daten für heutigen Tag (80kg Athlet, PPL Split):**
```js
const TODAY_MICROS = {
  vitamins: [
    { key:'VITA',   name:'Vitamin A',    value:864,   rda:1200, unit:'μg',  pct:72  },
    { key:'VITD',   name:'Vitamin D',    value:5.2,   rda:20,   unit:'μg',  pct:26  },  // MANGEL
    { key:'VITE',   name:'Vitamin E',    value:12.4,  rda:15,   unit:'mg',  pct:83  },
    { key:'VITK',   name:'Vitamin K',    value:98,    rda:120,  unit:'μg',  pct:82  },
    { key:'VITC',   name:'Vitamin C',    value:142,   rda:90,   unit:'mg',  pct:158 },
    { key:'THIA',   name:'Vitamin B1',   value:1.4,   rda:1.2,  unit:'mg',  pct:117 },
    { key:'RIBF',   name:'Vitamin B2',   value:1.8,   rda:1.3,  unit:'mg',  pct:138 },
    { key:'NIA',    name:'Niacin (B3)',   value:22,    rda:16,   unit:'mg',  pct:138 },
    { key:'PANTAC', name:'Pantothens. B5',value:4.2,  rda:5,    unit:'mg',  pct:84  },
    { key:'VITB6',  name:'Vitamin B6',   value:2.1,   rda:1.3,  unit:'mg',  pct:162 },
    { key:'BIOT',   name:'Biotin (B7)',  value:28,    rda:30,   unit:'μg',  pct:93  },
    { key:'FOL',    name:'Folat',        value:287,   rda:400,  unit:'μg',  pct:72  },
    { key:'VITB12', name:'Vitamin B12',  value:4.8,   rda:2.4,  unit:'μg',  pct:200 },
  ],
  minerals: [
    { key:'CA',  name:'Calcium',    value:740,  rda:1000, unit:'mg', pct:74  },
    { key:'MG',  name:'Magnesium',  value:354,  rda:400,  unit:'mg', pct:89  },
    { key:'P',   name:'Phosphor',   value:1240, rda:700,  unit:'mg', pct:177 },
    { key:'K',   name:'Kalium',     value:3100, rda:3400, unit:'mg', pct:91  },
    { key:'NA',  name:'Natrium',    value:2840, rda:2300, unit:'mg', pct:123 },
  ],
  trace_elements: [
    { key:'FE', name:'Eisen',     value:14.2, rda:10,  unit:'mg', pct:142 },
    { key:'ZN', name:'Zink',      value:12.4, rda:11,  unit:'mg', pct:113 },
    { key:'CU', name:'Kupfer',    value:1.2,  rda:0.9, unit:'mg', pct:133 },
    { key:'MN', name:'Mangan',    value:3.4,  rda:2.3, unit:'mg', pct:148 },
    { key:'SE', name:'Selen',     value:42,   rda:55,  unit:'μg', pct:76  },
    { key:'ID', name:'Jod',       value:82,   rda:150, unit:'μg', pct:55  },
    { key:'CR', name:'Chrom',     value:28,   rda:35,  unit:'μg', pct:80  },
    { key:'MO', name:'Molybdän',  value:38,   rda:45,  unit:'μg', pct:84  },
  ],
  amino_acids: [
    { key:'LEU', name:'Leucin',      value:12.4, rda:null, unit:'g', pct:null },
    { key:'ILE', name:'Isoleucin',   value:7.1,  rda:null, unit:'g', pct:null },
    { key:'VAL', name:'Valin',       value:7.8,  rda:null, unit:'g', pct:null },
    { key:'LYS', name:'Lysin',       value:9.2,  rda:null, unit:'g', pct:null },
    { key:'MET', name:'Methionin',   value:3.8,  rda:null, unit:'g', pct:null },
    { key:'PHE', name:'Phenylalanin',value:6.1,  rda:null, unit:'g', pct:null },
    { key:'THR', name:'Threonin',    value:5.9,  rda:null, unit:'g', pct:null },
    { key:'TRP', name:'Tryptophan',  value:1.8,  rda:null, unit:'g', pct:null },
    { key:'HIS', name:'Histidin',    value:4.3,  rda:null, unit:'g', pct:null },
  ],
  fatty_acids: [
    { key:'F20D5N3', name:'EPA (Omega-3)', value:0.42, rda:0.25, unit:'g', pct:168 },
    { key:'F22D6N3', name:'DHA (Omega-3)', value:0.28, rda:0.25, unit:'g', pct:112 },
    { key:'F18D2N6', name:'LA (Omega-6)',  value:9.8,  rda:17,   unit:'g', pct:58  },
    { key:'FASAT',   name:'Ges. Fettsäuren',value:18.2, rda:null, unit:'g', pct:null },
  ],
};
// Quick Summary: optimal=28, adequate=8, deficit=2, noRda=19
```

**Ampelfarben:**
- `pct >= 80` → grün (`var(--status-good)` oder `#22c55e`)
- `pct 50-79` → gelb (`var(--status-warn)` oder `#eab308`)
- `pct < 50` → rot (`var(--status-alert)` oder `#ef4444`)
- `pct === null` → grau

---

### C. `TargetsView.js` — `window.Nutrition_TargetsView`

Lies: `temp/lumeosold/apps/app/modules/nutrition/components/NutritionTargetEditor.tsx`
      `temp/lumeosold/apps/app/modules/nutrition/components/TDEECalculator.tsx`

Zeigt:
- Aktive Targets (von Goals): kcal / Protein / KH / Fett / Fiber / Wasser
- TDEE-Breakdown sichtbar:
  ```
  BMR (Mifflin-St Jeor): 1.890 kcal
  Aktivitätsfaktor:       × 1.55 (Moderat aktiv, 4x/Woche)
  TDEE:                   2.930 kcal
  Ziel (Cut −20%):        2.340 kcal
  Aktuell eingestellt:    2.400 kcal
  ```
- Goal Phase Badge: `[🔻 Cut]` / `[📈 Bulk]` / `[➡️ Maintain]`
- Makro-Split visuell: Protein 32% | KH 42% | Fett 26% als Balken
- Hinweis-Card: "Targets werden täglich von Goals berechnet und können dort angepasst werden"

---

### D. `RecipeList.js` — `window.Nutrition_RecipeList`

Lies: `temp/lumeosold/apps/app/modules/nutrition/components/RecipeList.tsx`

Zeigt:
- Filter-Chips: [Alle] [Eigene] [Coach] [Marketplace] [AI]
- 5+ Recipe-Cards:
  ```
  📖 Hähnchen-Reis-Bowl          [Eigene]
     2 Portionen · 426 kcal · 52g P · 58g KH · 8g F
     ⏱ 25 min    🔽 aufklappbar
     ─────────────────────────────
     Hähnchenbrust  200g  · Basmati Reis 150g
     Brokkoli       100g  · Olivenöl      10g
     [Als Mahlzeit loggen ✓]  [Bearbeiten]  [Einkaufsliste 🛒]
  ```
- "+ Neues Rezept" Button → Formular-Teaser

---

### E. `CustomFoodForm.js` — `window.Nutrition_CustomFoodForm`

Lies: `temp/lumeosold/apps/app/modules/nutrition/components/CustomFoodForm.tsx`

Zeigt:
1. **Barcode-Banner** oben: `[📷 Barcode scannen]` → bei "Scan": "Produkt nicht gefunden — jetzt anlegen"
2. **Formular**: Name DE / Marke / Barcode / Portionsgrösse
3. **Pflicht-Makros**: kcal / Protein / KH / Fett (Eingabefelder)
4. **[+ Weitere Makros]** aufklappbar: Zucker / Ballaststoffe / Salz / ges. Fett
5. **EU-14 Allergen-Selektor** (Checkboxen): Gluten / Milch / Eier / Fisch / Schalentiere / Erdnüsse / Nüsse / Soja / Sellerie / Senf / Sesam / Sulfite / Lupine / Weichtiere
6. **[+ Mikronährstoffe]** aufklappbar: Vitamin D / B12 / Eisen / Calcium / Magnesium / Zink
7. **Gespeicherte Custom Foods** darunter als kleine Cards

---

### F. `TrendsView.js` — `window.Nutrition_TrendsView`

Lies: `temp/lumeosold/apps/app/modules/nutrition/components/NutrientHeatmap.tsx`

Zeigt (4 Sektionen):

**1. Kalorien-Trend 30 Tage** — CSS Balken-Chart
Ziel-Linie als gestrichelte horizontale Linie, Ø-Wert, Min/Max

**2. Protein-Streak** — 30-Tage Kalender-Grid
Grün = Ziel erreicht, Rot = nicht erreicht, Grau = keine Daten
Streak-Counter: "🔥 14 Tage in Folge"

**3. Nährstoff-Heatmap 7×7** (7 Nährstoffe × 7 Tage)
```
              Mo   Di   Mi   Do   Fr   Sa   So
Kalorien       🟢   🟡   🟢   🟢   🔴   🟢   🟡
Protein        🟢   🟢   🟡   🟢   🟡   🟢   🟢
Vitamin D      🔴   🔴   🔴   🔴   🔴   🟡   🔴
Magnesium      🟡   🟢   🟢   🟡   🟢   🟢   🟡
Ballaststoffe  🟡   🟡   🟢   🟡   🔴   🟡   🟡
Omega-3        🟡   🟡   🟡   🟢   🟡   🟡   🟡
Vitamin C      🟢   🟢   🟢   🟢   🟢   🟢   🟢
```

**4. Makro-Qualität Trend**
KH-Qualität: Komplex vs. Einfach % über Zeit
Fett-Qualität: Omega-3:6 Ratio Trend

---

### G. `PreferencesView.js` — `window.Nutrition_PreferencesView`

**Lies FoodPreferences.tsx VOLLSTÄNDIG (927 Zeilen) bevor du anfängst.**

4-Step Wizard mit Progress-Bar oben.

**Step 1 — Ernährung & Allergien:**

Diät-Typ: 8 Cards in 2×4 Grid
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   🥩     │ │   🐟     │ │   🥬     │ │   🌱     │
│ Omnivor  │ │Pescetarisch│ │Vegetarisch│ │  Vegan   │
│  Alles   │ │Kein Fleisch│ │K.Fl./Fisch│ │Nur Pflzl.│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   🥑     │ │   🦴     │ │   🫒     │ │   ⚙️     │
│   Keto   │ │  Paleo   │ │Mediterran│ │Individual │
│sehr lowC.│ │k.Getreide│ │Fisch+Öl  │ │Selbst wähl│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

Allergien-Chips (3-State: neutral → Sensibel [amber] → Allergie [rot] → neutral):
```
[🌾 Gluten] [🥛 Milcheiweiss ⚠️] [🥛 Laktose] [🥚 Eier] [🐟 Fisch 🚫]
[🦐 Krebstiere] [🦑 Weichtiere] [🥜 Erdnüsse] [🥜 Baumnüsse]
[🫘 Soja] [🥬 Sellerie] [🟡 Senf] [🌻 Sesam] [🍷 Sulfite] [🌸 Lupine]
[🍎 Fruktose] [⚠️ Histamin] [🍬 Sorbit] [🫧 FODMAP] [⚙️ Nickel]
```
Hinweis: "1× = Sensibel · 2× = Allergie · 3× = Entfernen"

Globale Ausschlüsse (8 Cards, 2×4):
```
┌──────────────────────┐ ┌──────────────────────┐
│ 🫀 Keine Innereien   │ │ 🌭 Kein verarbeit.   │
│ Leber, Herz, Niere.. │ │ Wurst, Salami...     │
└──────────────────────┘ └──────────────────────┘
(+ 6 weitere)
```

Küchen-Grid: 27 Länder als kleine Chips mit Emoji-Flagge

**Step 2 — Food Grid:**

Info-Banner: "💚 Mag ich · ❌ Mag nicht · kein Tap = Egal"
Counter oben: "18 💚 · 3 ❌"

Gruppen (mindestens 8):
```
🐔 Geflügel          [Alle 💚] [Reset]
  [🍗 Hähnchenbrust] [🍗 Hähnchenschenkel] [🦃 Putenbrust]
  [🦃 Putenhack] [🦆 Ente] [🐓 Ganzes Hähnchen]

🐄 Rind              [Alle 💚] [Reset]
  [🥩 Filet] [🥩 Rumpsteak] [🥩 Ribeye] [🥩 Hack] ...

🐟 Fisch             [Alle 💚] [Reset]
  [🐟 Lachs] [🐟 Thunfisch] [🐟 Kabeljau] [🐟 Makrele] ...

🥛 Milch & Käse      ...
🥚 Eier & Pflanzl. P ...
🍚 Getreide & Beilag ...
🥦 Gemüse            ...
🍎 Obst              ...
🥜 Nüsse & Samen     ...
```

Jede Food-Card:
- Emoji gross + Name
- Neutral: weisse Border
- 💚 Gemocht: grüne Border + grüner Haken oben rechts
- ❌ Abgelehnt: rote Border + rotes X oben rechts

**Step 3 — Kochen & Alltag:**
```
Mahlzeiten/Tag:  [2] [3] [4✓] [5] [6]
Snacks/Tag:      [0] [1✓] [2] [3]
Kochlevel:       [🔰 Einfach] [👨‍🍳 Normal✓] [⭐ Fortgeschritten]
Zubereitungszeit:[15] [20] [30✓] [45] [60] min
Meal-Prep OK:    [● Ja] ← Toggle
Budget:          [💰 Sparsam] [💰💰 Normal✓] [💰💰💰 Premium] [♾️ Egal]
Notizen:         [Textarea: "z.B. Abends keine Carbs..."]
```

**Step 4 — Zusammenfassung:**
Read-only Zusammenfassung aller Einstellungen.
Liked Foods als grüne Chips, Disliked als rote Chips.
```
[💾 Profil speichern]  → [✅ Gespeichert! Der AI-Coach nutzt jetzt dein Profil.]
```

Navigation: `[← Zurück]` und `[Weiter →]`

---

### H. `DiaryView.js` — VERBESSERN

Bestehendes 2-Spalten Layout behalten, folgendes ergänzen:
- **DateNavigation** ganz oben: `‹ Mo. 27. April 2026 [Heute] ›`
- **Gesamt-Hydration** im WaterTracker: `💧 2.0L getrunken + 🥗 0.6L aus Nahrung = 2.6L`
- **Supplement-Slots**: nach Frühstück `☀️ Morgen-Supplements (4/4 ✅)`, nach Abendessen `🌙 Abend (0/2 ⚠️)`
- **DaySummary** unten: Abend-Review mit Compliance-Werten

---

## Schritt 5: Script-Tags in index.html

```html
<script src="features/nutrition/MacroDetail.js"></script>
<script src="features/nutrition/MicroDashboard.js"></script>
<script src="features/nutrition/TargetsView.js"></script>
<script src="features/nutrition/RecipeList.js"></script>
<script src="features/nutrition/CustomFoodForm.js"></script>
<script src="features/nutrition/TrendsView.js"></script>
<script src="features/nutrition/PreferencesView.js"></script>
```

Alte Dateien: `InsightsView.js`, `SettingsView.js`, `HeatmapView.js` → können geleert/gelöscht werden.

---

## Reihenfolge

1. Sub-Tab System in index.html prüfen
2. MODULES-Eintrag + index.js
3. `nutrientDetails.ts` lesen → NUTRIENT_DETAILS Objekt bauen
4. `MicroDashboard.js` — Detail-Card ist das Kernfeature
5. `MacroDetail.js` — rekursiver Baum
6. `FoodPreferences.tsx` vollständig lesen → `PreferencesView.js`
7. `TargetsView.js`
8. `RecipeList.js`
9. `CustomFoodForm.js`
10. `TrendsView.js`
11. `DiaryView.js` verbessern
12. Script-Tags + Browser-Test aller 5 Tabs × Sub-Tabs
