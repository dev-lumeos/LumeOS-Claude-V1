# Nutrition Insights — MacroDetail + MicroDashboard: Exakte Spezifikation

Ergänzt `docs/prompts/nutrition_rebuild_subtabs.md` für die Views
`Nutrition_MacroDetail` und `Nutrition_MicroDashboard`.

**Quell-Dateien im alten Repo:**
- `temp/lumeosold/apps/app/modules/nutrition/components/MacroDetail.tsx` (181 Zeilen)
- `temp/lumeosold/apps/app/modules/nutrition/components/MicroDashboard.tsx` (944 Zeilen)
- `temp/lumeosold/apps/app/modules/nutrition/data/nutrientDetails.ts` (2454 Zeilen)

---

## MacroDetail.js — Genaue Struktur

### Period Selector (Heute / 7d / 14d / 30d)
Pill-Buttons oben rechts. Bei 7d/14d/30d: "Ø über X Tage" anzeigen.

### Drei aufklappbare Sektionen (standardmässig offen)

Jede Sektion hat einen farbigen Header-Button mit Emoji + Titel + Gesamt-Wert.
Klick auf Header = Section auf/zu.

**Sektion: 🫒 Fett (62.4g)**
```
Fett-Header (gelber Hintergrund, aufklappbar)
├── Gesättigte Fettsäuren   18.2g  ████████░░  29%
│   ├── Palmitinsäure       11.1g  ████░░      18%
│   ├── Stearinsäure         4.8g  ██░░         8%
│   └── Myristinsäure        2.3g  █░░          4%
├── Einfach ungesättigt     27.8g  ████████████ 45%
│   └── Ölsäure (C18:1)    26.4g  ████████░░   42%
├── Mehrfach ungesättigt    11.4g  ████░░        18%
│   ├── Linolsäure (LA)      9.8g  ████░░        16%
│   ├── α-Linolensäure       0.8g  ░░            1%
│   ├── EPA                  0.6g  ░░            1%  ⚠️
│   └── DHA                  0.2g  ░░            0%  ⚠️
└── Trans-Fettsäuren         1.0g  ░░            2%
```

**Sektion: 🍞 Kohlenhydrate (198.4g)**
```
├── Stärke                 134.2g  █████████    68%
├── Zucker (gesamt)         42.1g  ████░░        21%
│   ├── Glucose             14.8g  ██░░          7%
│   ├── Fructose            12.3g  ██░░          6%
│   ├── Saccharose          11.6g  ██░░          6%
│   └── Lactose              3.4g  █░░           2%
├── Ballaststoffe (FIBT)    22.1g  ████░░        11%
│   ├── Löslich              7.8g  ██░░          4%
│   └── Unlöslich           14.3g  ██░░          7%
└── Zuckeralkohole           0.0g
```

**Sektion: 🥩 Protein (142.3g)**
```
├── Essenzielle Aminosäuren 68.4g  █████████    48%
│   ├── Leucin (LEU)        12.4g  █████░░       9%  ← mTOR Trigger
│   ├── Isoleucin (ILE)      7.1g  ████░░        5%
│   ├── Valin (VAL)          7.8g  ████░░        5%
│   ├── Lysin (LYS)          9.2g  █████░░       6%
│   ├── Methionin (MET)      3.8g  ██░░          3%
│   ├── Phenylalanin (PHE)   6.1g  ███░░         4%
│   ├── Threonin (THR)       5.9g  ███░░         4%
│   ├── Tryptophan (TRP)     1.8g  █░░           1%
│   └── Histidin (HIS)       4.3g  ██░░          3%
└── Nicht-essenziell         73.9g
    ├── Alanin               8.4g  ████░░        6%
    ├── Arginin              7.2g  ███░░         5%
    └── ...
```

### NutrientRow Komponente
```js
// Jede Zeile in der Baum-Struktur:
// - Einrückung per depth (0 = direkte Kind, 1 = Enkel, 2 = Urenkel)
// - ▶ wenn es Kinder hat, Klick = expand/collapse
// - Balken relativ zum PARENT-Total (nicht Makro-Gesamt)
// - Tiefe 0: relativ zu Makro-Gesamt
// - Tiefe 1: relativ zu Tiefe-0-Parent
// - Wert + Einheit rechtsbündig, Balken 24px breit

return `
  <div style="display:flex;align-items:center;gap:6px;padding:8px 16px 8px ${8 + depth*16}px;
    cursor:${hasChildren?'pointer':'default'};border-bottom:1px solid var(--surface-border)"
    onclick="toggleMacroRow('${key}')">
    <span style="width:12px;color:var(--text-muted)">${hasChildren?(open?'▼':'▶'):''}</span>
    <span style="flex:1;font-size:var(--text-sm);color:var(--text-primary)">${label}</span>
    <span style="font-size:var(--text-sm);font-weight:var(--fw-semibold);width:64px;text-align:right">
      ${value.toFixed(1)}${unit}
    </span>
    <div style="width:80px;background:var(--surface-hover);border-radius:var(--r-full);height:6px">
      <div style="width:${pct}%;background:${color};height:6px;border-radius:var(--r-full)"></div>
    </div>
  </div>
`;
```

---

## MicroDashboard.js — Genaue Struktur

### Period Selector (identisch zu MacroDetail)

### Quick Summary (immer sichtbar)
```
┌─────────────────────────────────────────────────────────┐
│  42        11         8         12                       │
│  Optimal   Adequate   Defizit   kein RDA                │
│  (≥80%)    (50-79%)   (<50%)    (kein Zielwert)          │
└─────────────────────────────────────────────────────────┘
```

### Gruppen-Struktur (alle aufklappbar, mit Badge)

Jede Gruppe hat:
- Header-Button: Icon + Titel + Anzahl + Badge ("3 Mangel" rot / "8/12 optimal" grün)
- Klick = auf/zu
- Wenn aufgeklappt: alle Nährstoffe der Gruppe

```
💊 Vitamine (22)  [2 Mangel]           ▶
  🔽 aufgeklappt:
  ├── Fettlöslich              [header, aufklappbar]
  │   ├── Vitamin A      864μg / 1200μg   72%  🟡 ▼
  │   │   └── [Detail-Card wenn geklickt]
  │   ├── Vitamin D      5.2μg / 20μg     26%  🔴 ▼  ← MANGEL
  │   │   └── [Detail-Card mit rotem Mangel-Banner]
  │   ├── Vitamin E      12.4mg / 15mg    83%  🟢 ▼
  │   └── Vitamin K      98μg / 120μg     82%  🟢 ▼
  └── Wasserlöslich            [header, aufklappbar]
      ├── Vitamin B1     1.4mg / 1.2mg   117%  🟢 ▼
      ├── Vitamin B2     1.8mg / 1.3mg   138%  🟢 ▼
      ├── Niacin (B3)    22mg / 16mg     138%  🟢 ▼
      ├── Vitamin B6     2.1mg / 1.3mg   162%  🟢 ▼
      ├── Folat          287μg / 400μg    72%  🟡 ▼
      ├── Vitamin B12    4.8μg / 2.4μg   200%  🟢 ▼
      └── Vitamin C      142mg / 90mg    158%  🟢 ▼

🪨 Mineralstoffe (7)  [1 Mangel]        ▶
🔬 Spurenelemente (9)  [0 Mangel]       ▶
💪 Aminosäuren (19)  [kein RDA]         ▶
🫒 Fettsäuren (36)  [2 Mangel]         ▶
🍞 Kohlenhydrat-Details (8)             ▶
📊 Sonstiges (12)                       ▶
```

### Ampelfarben
```
🟢 ≥ 80%     bg-green-500 / var(--status-good)
🟡 50-79%    bg-yellow-500 / var(--status-warn)
🔴 < 50%     bg-red-500 / var(--status-alert)
grau         kein RDA vorhanden
```

### Nährstoff-Zeile (renderFullNutrientBar)
```
[Name] [▼ Pfeil]           [Wert Unit] / [RDA Unit]   [XX%]
[███████████░░░░░░░░░░░░]  ← Fortschrittsbalken
```

Klick auf die Zeile = Detail-Card toggle (immer nur eine offen gleichzeitig).

---

## Detail-Card (renderNutrientDetailCard) — DAS HERZSTÜCK

Wird unter jeder Nährstoff-Zeile eingeblendet wenn geklickt.
Gradient-Hintergrund (blau/indigo).

### Aufbau der Detail-Card:

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Beschreibung                                              │
│    [2-3 Sätze aus detail_de — was der Nährstoff ist,        │
│     wie er funktioniert, was ihn besonders macht]           │
│                                                             │
│ ⚠️ Mangelsymptome  ← NUR wenn pct < 50%: roter Alert-Box   │
│    🔴 MANGEL-RISIKO:                                         │
│    [deficiency_de — konkrete Symptome]                      │
│                                                             │
│    ODER (wenn pct ≥ 50%):                                   │
│    [deficiency_de — als normaler Text, kein Alert]          │
│                                                             │
│ 🔶 Bei Überschuss  ← NUR wenn pct > 200%: oranger Alert     │
│    🔶 ÜBERSCHUSS-WARNUNG:                                    │
│    [excess_de — Symptome bei zu viel]                       │
│                                                             │
│    ODER (wenn pct ≤ 200%):                                  │
│    [excess_de — als normaler Hinweis-Text]                  │
│                                                             │
│ 🔄 Wechselwirkungen                                         │
│    [interactions_de — mit welchen Nährstoffen               │
│     Synergien/Antagonismen bestehen]                        │
│                                                             │
│ 🎯 RDA Standard: 600IU (15μg) | RDA Athlet: 2000-5000IU    │
│    ⛔ Obergrenze: 4000IU (100μg)                            │
│                                                             │
│ 🥗 Top-Quellen: Fetter Fisch, Eier, Sonnenlicht             │
│                                                             │
│ 💡 Kritisch für Athleten! Bluttest empfohlen.               │
└─────────────────────────────────────────────────────────────┘
```

### Beispiel: Vitamin D (pct = 26% → MANGEL-RISIKO aktiv)

```html
<div style="margin-top:8px;padding:16px;
  background:linear-gradient(135deg,#eff6ff,#eef2ff);
  border-radius:var(--r-lg);border:1px solid #bfdbfe;
  display:flex;flex-direction:column;gap:10px">

  <!-- Beschreibung -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>📋</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">Beschreibung:</span>
      Vitamin D ist essentiell für die Kalziumaufnahme und Knochengesundheit.
      Es spielt auch eine wichtige Rolle bei der Testosteronproduktion und Immunfunktion.
      Besonders Athleten haben oft einen Mangel, da die Hautsynthese durch Sonnenlicht
      in vielen Regionen unzureichend ist.
    </div>
  </div>

  <!-- MANGEL-ALERT (weil 26% < 50%) -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm);
    padding:10px;background:#fef2f2;border:1px solid #fca5a5;border-radius:var(--r-md)">
    <span>🔴</span>
    <div>
      <span style="font-weight:var(--fw-bold);color:#b91c1c">MANGEL-RISIKO:</span>
      Muskelschwäche, erhöhte Infektanfälligkeit, Knochenschmerzen,
      Stimmungstiefs, verlangsamte Recovery nach Training
    </div>
  </div>

  <!-- Überschuss (normaler Text, kein Alert da 26% < 200%) -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>🔶</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">Bei Überschuss:</span>
      Hyperkalzämie (zu viel Kalzium im Blut), Nierensteine, Übelkeit
    </div>
  </div>

  <!-- Wechselwirkungen -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>🔄</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">Wechselwirkungen:</span>
      Verbessert Kalzium-Absorption. Magnesium wird für die Aktivierung von
      Vitamin D benötigt.
    </div>
  </div>

  <!-- RDA + UL -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>🎯</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">RDA Standard:</span> 600IU (15μg) |
      <span style="font-weight:var(--fw-semibold)">RDA Athlet:</span> 2000-5000IU |
      <span style="font-weight:var(--fw-semibold)">⛔ Obergrenze:</span> 4000IU (100μg)
    </div>
  </div>

  <!-- Top-Quellen -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>🥗</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">Top-Quellen:</span>
      Fetter Fisch, Eier, Sonnenlicht
    </div>
  </div>

  <!-- Tipp -->
  <div style="display:flex;gap:8px;font-size:var(--text-sm)">
    <span>💡</span>
    <div>
      <span style="font-weight:var(--fw-semibold)">Tipp:</span>
      <span style="font-style:italic">
        Kritisch für Athleten! Bluttest empfohlen. Supplementierung mit 2000-4000 IU täglich.
      </span>
    </div>
  </div>
</div>
```

---

## Nutrient Detail Data — Embedded in MicroDashboard.js

Da `nutrientDetails.ts` (2454 Zeilen) nicht dynamisch geladen werden kann,
werden die Daten direkt als JS-Objekt in `MicroDashboard.js` eingebettet.

**Mindestens folgende Nährstoffe müssen Detail-Daten haben:**

```js
const NUTRIENT_DETAILS = {
  // Vitamine fettlöslich
  VITA:   { detail, deficiency, excess, interactions, rda_standard, rda_athlete, ul, top_sources, tip },
  VITD:   { ... },
  VITE:   { ... },
  VITK:   { ... },

  // Vitamine wasserlöslich
  VITC:   { ... },
  THIA:   { ... },  // B1
  RIBF:   { ... },  // B2
  NIA:    { ... },  // B3
  PANTAC: { ... },  // B5
  VITB6:  { ... },
  BIOT:   { ... },  // B7
  FOL:    { ... },
  VITB12: { ... },

  // Mineralstoffe
  CA:  { ... },
  MG:  { ... },
  P:   { ... },
  K:   { ... },
  NA:  { ... },

  // Spurenelemente
  FE:  { ... },
  ZN:  { ... },
  CU:  { ... },
  MN:  { ... },
  SE:  { ... },
  ID:  { ... },
  CR:  { ... },
  MO:  { ... },

  // Key Aminosäuren
  LEU: { detail: 'Leucin ist die wichtigste Aminosäure für den Muskelaufbau...', ... },
  ILE: { ... },
  VAL: { ... },
  LYS: { ... },
  TRP: { ... },

  // Key Fettsäuren
  F20D5N3: { ... },  // EPA
  F22D6N3: { ... },  // DHA
  F18D2N6: { ... },  // LA
};
```

Alle Detail-Texte direkt aus `nutrientDetails.ts` übernehmen (DE-Texte).

---

## Period View (7d / 14d / 30d) — Andere Darstellung

Bei Perioden-Auswahl zeigt MicroDashboard zusätzlich:

**Top 5 Defizite (Ø über Periode):**
```
⚠️ Top Mangel (Ø 7 Tage)
  Vitamin D      3.1μg    ████░░░░░░░░░░░   21%  🔴
  Omega-3 EPA    0.12g    ████░░░░░░░░░░░   28%  🔴
  Folat          182μg    ██████░░░░░░░░░   46%  🔴
  Jod            82μg     ███████░░░░░░░░   55%  🟡
  Vitamin K      74μg     ████████░░░░░░░   62%  🟡
```

**Top 5 gut versorgt:**
```
✅ Gut versorgt (Ø 7 Tage)
  Vitamin B12    6.8μg    ████████████████  283%  🟢
  Vitamin B2     2.4mg    ████████████████  185%  🟢
  ...
```

Danach alle Gruppen mit Ø-Werten statt Tageswerten.

---

## Dummy-Daten für das Mockup

Das Mockup braucht realistische Dummy-Daten die den heutigen Tag simulieren.
Nutze Daten für einen 80kg Athleten mit PPL Split.

```js
const TODAY_MICROS = {
  // Vitamine — gemischt gut/mangel/okay
  VITA:   { value: 864,   rda: 1200,  unit: 'μg',  pct: 72  },
  VITD:   { value: 5.2,   rda: 20,    unit: 'μg',  pct: 26  },  // ← MANGEL
  VITE:   { value: 12.4,  rda: 15,    unit: 'mg',  pct: 83  },
  VITK:   { value: 98,    rda: 120,   unit: 'μg',  pct: 82  },
  VITC:   { value: 142,   rda: 90,    unit: 'mg',  pct: 158 },
  THIA:   { value: 1.4,   rda: 1.2,   unit: 'mg',  pct: 117 },
  RIBF:   { value: 1.8,   rda: 1.3,   unit: 'mg',  pct: 138 },
  NIA:    { value: 22,    rda: 16,    unit: 'mg',  pct: 138 },
  PANTAC: { value: 4.2,   rda: 5,     unit: 'mg',  pct: 84  },
  VITB6:  { value: 2.1,   rda: 1.3,   unit: 'mg',  pct: 162 },
  BIOT:   { value: 28,    rda: 30,    unit: 'μg',  pct: 93  },
  FOL:    { value: 287,   rda: 400,   unit: 'μg',  pct: 72  },
  VITB12: { value: 4.8,   rda: 2.4,   unit: 'μg',  pct: 200 },

  // Mineralstoffe
  CA:  { value: 740,  rda: 1000, unit: 'mg', pct: 74  },
  MG:  { value: 354,  rda: 400,  unit: 'mg', pct: 89  },  // + 100mg Supplement
  P:   { value: 1240, rda: 700,  unit: 'mg', pct: 177 },
  K:   { value: 3100, rda: 3400, unit: 'mg', pct: 91  },
  NA:  { value: 2840, rda: 2300, unit: 'mg', pct: 123 },  // leicht erhöht

  // Spurenelemente
  FE:  { value: 14.2, rda: 10,   unit: 'mg', pct: 142 },
  ZN:  { value: 12.4, rda: 11,   unit: 'mg', pct: 113 },
  CU:  { value: 1.2,  rda: 0.9,  unit: 'mg', pct: 133 },
  MN:  { value: 3.4,  rda: 2.3,  unit: 'mg', pct: 148 },
  SE:  { value: 42,   rda: 55,   unit: 'μg', pct: 76  },
  ID:  { value: 82,   rda: 150,  unit: 'μg', pct: 55  },  // knapp

  // Aminosäuren (kein RDA, nur Wert)
  LEU: { value: 12.4, unit: 'g', pct: null },
  ILE: { value: 7.1,  unit: 'g', pct: null },
  VAL: { value: 7.8,  unit: 'g', pct: null },
  LYS: { value: 9.2,  unit: 'g', pct: null },
  TRP: { value: 1.8,  unit: 'g', pct: null },

  // Fettsäuren
  F20D5N3: { value: 0.42, rda: 0.25, unit: 'g', pct: 168 },  // EPA
  F22D6N3: { value: 0.28, rda: 0.25, unit: 'g', pct: 112 },  // DHA
  F18D2N6: { value: 9.8,  rda: 17,   unit: 'g', pct: 58  },  // LA leicht tief
  FASAT:   { value: 18.2, rda: null, unit: 'g', pct: null },
};
```

Quick Summary für diese Daten:
- Optimal (≥80%): ~28 Nährstoffe
- Adequate (50-79%): ~8 Nährstoffe
- Defizit (<50%): ~2 Nährstoffe (Vitamin D, ...)
- kein RDA: ~19 (Aminosäuren, einige Fettsäuren)
