# MuscleBodyMap — Universelle Körpervisualisierung

**Datei:** `apps/web/public/mockup/components/MuscleBodyMap.js`  
**Test:** `apps/web/public/mockup/components/MuscleBodyMap_test.html`  
**Status:** ✅ Vollständig — alle Paths aus `react-muscle-highlighter@1.2.0`  
**Theme:** LUMEOS Light (defaultFill `#d1d5db`, Outline `#64748b`)

---

## Einbinden

```html
<script src="components/MuscleBodyMap.js"></script>
```

Kein Build-Step, kein Framework — reines Vanilla JS, überall einbindbar.

---

## API

### 1. Muskel-Fatigue (Recovery Status)

```js
MuscleBodyMap.renderFatigue(el, data, opts?)
```

```js
MuscleBodyMap.renderFatigue(document.getElementById('map'), [
  { id: 'chest',     fatigue: 78 },  // 🔴 Rest   >60%
  { id: 'biceps',    fatigue: 12 },  // 🟢 Ready  ≤25%
  { id: 'gluteal',   fatigue: 42 },  // 🟡 Caution 26-60%
]);
```

Farb-Logik: ≤25% → `#10B981`, 26–60% → `#F59E0B`, >60% → `#EF4444`

---

### 2. Workout-Aktivierung

```js
MuscleBodyMap.renderActivation(el, data, opts?)
```

```js
MuscleBodyMap.renderActivation(el, [
  { id: 'chest',    intensity: 4 },  // 4 Stufen: 1=gelb → 4=dunkelrot
  { id: 'deltoids', intensity: 3 },
]);
```

Farben: `#fde047` / `#fb923c` / `#ef4444` / `#991b1b`

---

### 3. Injektionspunkte (Supplements)

```js
MuscleBodyMap.renderInjection(el, data, opts?)
```

```js
MuscleBodyMap.renderInjection(el, [
  { id: 'delt_r',  daysSince: 999, isNext: true },  // Nie benutzt + empfohlen (pulsierend)
  { id: 'glute_l', daysSince: 10 },                 // 7–14d → gelb
  { id: 'quad_l',  daysSince: 1  },                 // <3d   → rot
]);
```

`isNext: true` → pulsierender Ring-Animation.  
`dimBody: false` kann übergeben werden um den Body nicht zu dimmen.

**Farb-Schema Injektionspunkte:**
| Tage seit letzter Injektion | Farbe |
|---|---|
| ≥ 14d | `#10b981` grün — safe |
| 7–14d | `#eab308` gelb |
| 3–7d  | `#f59e0b` orange |
| < 3d  | `#ef4444` rot — zu früh |
| nie   | `#6b7280` grau |

---

### 4. Kombiniert (Muskeln + Injektionspunkte)

```js
MuscleBodyMap.renderCombined(el, muscleData, injectionData, opts?)
```

```js
MuscleBodyMap.renderCombined(el,
  [{ id: 'chest', fatigue: 78 }, { id: 'gluteal', fatigue: 42 }],
  [{ id: 'delt_r', daysSince: 999, isNext: true }],
  { width: 160 }
);
```

Muscle-Daten können `fatigue` oder `intensity` enthalten — werden automatisch erkannt.

---

### 5. Custom Punkte (beliebig)

```js
MuscleBodyMap.renderPoints(el, data, opts?)
```

```js
MuscleBodyMap.renderPoints(el, [
  { id: 'lwk',   side: 'back',  xPct: 0.50, yPct: 0.44, color: '#ef4444', label: 'LWS',   badge: 'stark' },
  { id: 'knee_l',side: 'front', xPct: 0.38, yPct: 0.67, color: '#f59e0b', label: 'Knie L', badge: 'mittel' },
]);
```

`xPct`/`yPct` sind 0–1 relativ zur jeweiligen Seiten-Breite/Höhe.  
Verwendbar für: Schmerz-Tracker, Akupunktur, Physiotherapie-Markierungen, etc.

---

### 6. Basis-Render (direkt)

```js
MuscleBodyMap.render(el, muscles, opts)
```

Alle anderen Methoden rufen intern `render()` auf. Für direkten Zugriff mit eigenem colorMap.

---

## opts Parameter

```js
{
  width:       160,           // Breite pro SVG in px (default: 130)
  showLabels:  true,          // "VORNE" / "HINTEN" Labels
  showLegend:  true,          // Legende unter der Map
  legendItems: [...],         // [{fill, opacity, label}] — überschreibt Standard-Legende
  points:      [...],         // Overlay-Punkte (injection dots, custom points)
  dimBody:     false,         // Body 40% opacity (automatisch bei renderInjection)
  defaultFill: '#d1d5db',     // Farbe inaktiver Muskeln (light theme)
                              // dark theme: '#253347'
}
```

---

## Click-Handler

```js
MuscleBodyMap.setClickHandler((id, type, data) => {
  // type = 'muscle' | 'injection' | 'point'
  // id   = Muskel-ID oder Punkt-ID
  // data = das originale Dataobjekt (mit fatigue/intensity/daysSince etc.)
  console.log(id, type, data);
});
```

Global — ein Handler für alle gleichzeitig gerenderten Maps auf der Seite.

---

## Injektionsstellen-Dictionary

```js
MuscleBodyMap.INJECTION_SITES  // {id: {label, side, xPct, yPct}}
```

| ID | Label | Seite |
|---|---|---|
| `delt_l` | Schulter L | front |
| `delt_r` | Schulter R | front |
| `pec_l` | Brust L | front |
| `pec_r` | Brust R | front |
| `bicep_l` | Bizeps L | front |
| `bicep_r` | Bizeps R | front |
| `quad_l` | Oberschenkel L | front |
| `quad_r` | Oberschenkel R | front |
| `glute_l` | Gluteus L | back |
| `glute_r` | Gluteus R | back |
| `vg_l` | Ventrogluteal L | back |
| `vg_r` | Ventrogluteal R | back |
| `lat_l` | Lat L | back |
| `lat_r` | Lat R | back |
| `tricep_l` | Trizeps L | back |
| `tricep_r` | Trizeps R | back |

---

## Implementierte Muskel-IDs

### Vorderseite (`side: 'front'`)
`chest`, `abs`, `obliques`, `biceps`, `triceps`*, `deltoids`*, `trapezius`*, `neck`*, `forearm`*, `adductors`*, `quadriceps`, `knees`, `tibialis`, `calves`*, `hands`*, `ankles`*, `feet`*, `head`*, `hair`*

### Rückseite (`side: 'back'`)
`upper-back`, `lower-back`, `gluteal`, `hamstring`, `calves`*, `forearm`*, `triceps`*, `deltoids`*, `trapezius`*, `neck`*, `adductors`*, `hands`*, `ankles`*, `feet`*, `head`*, `hair`*

`*` = `side: 'both'` — Paths für beide Seiten separat definiert

### Special (fixedFill — überschreiben defaultFill)
| ID | fixedFill | Beschreibung |
|---|---|---|
| `head` | `#c8c0b8` | Hautton — unabhängig vom Theme |
| `hair` | `#6b5b4e` | Dunkelbraun |

---

## SVG-Architektur

```
<svg viewBox="0|724 0 724 1448">
  <g opacity="0|0.4">        ← bodyGroup (opacity nur bei dimBody=true)
    <g> outline path </g>    ← vector-effect:non-scaling-stroke, stroke:#64748b
    <g> muscle fills </g>    ← defaultFill oder colorMap-Farbe
  </g>
  <g> overlay points </g>    ← Injektions-Dots / Custom-Punkte (volle Sichtbarkeit)
</svg>
```

**ViewBox:** Front `0 0 724 1448`, Back `724 0 724 1448`  
**Outline:** `vector-effect:non-scaling-stroke` — Stroke bleibt konstant 1.5px unabhängig vom Zoom  
**dimBody:** Body-Gruppe bei `opacity: 0.4` — Overlay-Punkte schweben voll sichtbar darüber

---

## Theme-Wechsel

```js
// Light (Standard — LUMEOS Platform)
MuscleBodyMap.renderFatigue(el, data, { defaultFill: '#d1d5db' })

// Dark (z.B. Modal auf dunklem Hintergrund)
MuscleBodyMap.renderFatigue(el, data, { defaultFill: '#253347' })
```

---

## Verwendung in LUMEOS-Modulen

| Modul | Render-Methode | Zweck |
|---|---|---|
| **Training → Recovery** | `renderFatigue()` | Muskel-Erholungsstatus |
| **Training → Volume** | `renderActivation()` | Workout-Belastungsheatmap |
| **Supplements → Injektionen** | `renderInjection()` | Rotations-Tracker |
| **Supplements Enhanced** | `renderCombined()` | Muskeln + Injektionsstellen |
| **Medical / Recovery** | `renderPoints()` | Schmerz-Tracker, Physiotherapie |

---

## Datenbasis

SVG-Paths direkt aus `react-muscle-highlighter@1.2.0`:
- `bodyFront.js` — 19 Muskelgruppen, 80+ Paths
- `bodyBack.js` — 17 Muskelgruppen, 70+ Paths

Alle Paths vollständig übernommen (100%). Keine Paths fehlen.

---

## Bekannte Limitierungen / TODO

- [ ] **Female Body:** `bodyFemaleFront.js` / `bodyFemaleBack.js` noch nicht implementiert → `gender: 'female'` Option ausstehend
- [ ] **index.html:** `<script src="components/MuscleBodyMap.js">` noch nicht eingebunden
- [ ] **MusclesView.js:** `renderFatigue()` einbinden
- [ ] **VolumeView.js:** `renderActivation()` einbinden
