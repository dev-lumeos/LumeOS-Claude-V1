# SPEC_02 — Design System
> WebPlatform | Stand: Mai 2026 | Status: draft

---

## 1. Design-Philosophie

**Linear-style, datenorientiert, professionell.**
Nicht verspielt. Nicht medical-steril. Sportlich-professionell — näher an Linear/Figma/Notion als an MyFitnessPal.

Kernprinzipien:
- Datendichte ohne Überwältigung: viele Daten, hierarchisch priorisiert
- Modul-Farben als Orientierung: Akzent, nie als Fläche
- Professional, kein Gamification-Kitsch
- Numerics immer in Mono mit tabular-nums

---

## 2. Farb-Token-System (OKLCH)

Alle Farben in OKLCH. Tailwind-Integration via CSS-Custom-Properties in `globals.css`.

### Basis-Tokens (Dark Mode — primär)

```css
:root {
  --bg:           oklch(0.155 0.005 270);   /* near-black, leicht blau */
  --bg-elev:      oklch(0.185 0.005 270);   /* elevated bg */
  --surface:      oklch(0.205 0.005 270);   /* card backgrounds */
  --surface-2:    oklch(0.235 0.005 270);   /* nested surfaces */
  --surface-hover:oklch(0.255 0.005 270);   /* hover state */
  --border:       oklch(0.280 0.005 270);   /* default border */
  --border-strong:oklch(0.360 0.005 270);   /* emphasized border */
  --fg:           oklch(0.970 0.000 0);     /* primary text */
  --fg-muted:     oklch(0.720 0.005 270);   /* secondary text */
  --fg-subtle:    oklch(0.550 0.005 270);   /* tertiary / placeholders */
  --fg-dim:       oklch(0.420 0.005 270);   /* disabled / eyebrow labels */
}
```

### Basis-Tokens (Light Mode)

```css
[data-theme="light"] {
  --bg:           oklch(0.985 0.002 270);
  --bg-elev:      oklch(1.000 0.000 0);
  --surface:      oklch(1.000 0.000 0);
  --surface-2:    oklch(0.975 0.003 270);
  --surface-hover:oklch(0.955 0.003 270);
  --border:       oklch(0.910 0.003 270);
  --border-strong:oklch(0.820 0.005 270);
  --fg:           oklch(0.200 0.005 270);
  --fg-muted:     oklch(0.400 0.005 270);
  --fg-subtle:    oklch(0.550 0.005 270);
  --fg-dim:       oklch(0.680 0.005 270);
}
```

### Status-Farben

```css
:root {
  --pos:  oklch(0.78 0.13 150);   /* grün — Erfolg, positiv */
  --warn: oklch(0.82 0.13  80);   /* amber — Warnung */
  --neg:  oklch(0.72 0.16  22);   /* rot — Fehler, kritisch */
}
```

### Modul-Akzentfarben (Dark, Muted Set — Standard)

```css
:root {
  --acc-dash:  oklch(0.78 0.04 240);   /* steel (Dashboard) */
  --acc-nutri: oklch(0.78 0.10  70);   /* clay/amber (Nutrition) */
  --acc-train: oklch(0.74 0.10 290);   /* lavender (Training) */
  --acc-recov: oklch(0.78 0.08 160);   /* sage (Recovery) */
  --acc-suppl: oklch(0.76 0.10  25);   /* terracotta (Supplements) */
  --acc-goals: oklch(0.80 0.10  95);   /* mustard (Goals) */
  --acc-medic: oklch(0.76 0.09  15);   /* rust (Medical) */
  --acc-coach: oklch(0.78 0.08 200);   /* slate-cyan (Coach) */
  --acc-buddy: oklch(0.76 0.09 310);   /* lilac (Buddy) */
  --acc-mkt:   oklch(0.78 0.08 145);   /* moss (Marketplace) */
  --acc-admin: oklch(0.75 0.01 270);   /* neutral (Admin) */

  /* Aktiv-Resolve: wird per JS beim Modul-Wechsel gesetzt */
  --acc: var(--acc-dash);
}
```

### Modul-Akzentfarben (Light Mode)

```css
[data-theme="light"] {
  --acc-nutri: oklch(0.55 0.13 60);
  --acc-train: oklch(0.50 0.16 290);
  --acc-recov: oklch(0.50 0.10 160);
  --acc-suppl: oklch(0.55 0.15 25);
  --acc-goals: oklch(0.58 0.13 90);
  --acc-medic: oklch(0.55 0.14 15);
  --acc-coach: oklch(0.55 0.10 200);
  --acc-buddy: oklch(0.55 0.12 310);
}
```

### Tailwind-Integration

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: 'oklch(var(--bg) / <alpha-value>)',
      surface: 'oklch(var(--surface) / <alpha-value>)',
      border: 'oklch(var(--border) / <alpha-value>)',
      fg: 'oklch(var(--fg) / <alpha-value>)',
      'fg-muted': 'oklch(var(--fg-muted) / <alpha-value>)',
      pos: 'oklch(var(--pos) / <alpha-value>)',
      warn: 'oklch(var(--warn) / <alpha-value>)',
      neg: 'oklch(var(--neg) / <alpha-value>)',
      acc: 'var(--acc)',
    }
  }
}
```

---

## 3. Typografie

### Font-Paare

| Rolle | Font | Fallback |
|---|---|---|
| Body / UI | Inter | -apple-system, system-ui, sans-serif |
| Alle Zahlen | JetBrains Mono | ui-monospace, monospace |

### Zahlen-Regel (kritisch)

**Alle numerischen Werte** in der UI verwenden Mono + tabular-nums.

```css
.num, .num * {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' on, 'zero' on;
  letter-spacing: -0.01em;
}
```

```tsx
// Tailwind utility
<span className="font-mono tabular-nums">82.4 kg</span>

// Zahl und Einheit immer mit Abstand
<span className="font-mono tabular-nums">82.4<span className="opacity-60 ml-0.5">kg</span></span>
```

### Typografie-Skala

| Token | Größe | Gewicht | Einsatz |
|---|---|---|---|
| Display | 28px / 700 | — | Score-Zahlen, Hero-KPIs |
| Heading | 16px / 600 | — | Card-Titel, Section-Header |
| Body | 13px / 400 | — | Standard-Text |
| Small | 11px / 400 | — | Meta, Labels |
| Eyebrow | 10px / 600 | uppercase, 0.08em spacing | Gruppen-Labels |
| Mono | 13px / 400 | — | Zahlen, IDs, Codes |

---

## 4. Spacing und Layout

```css
:root {
  --pad-card:   16px;        /* Card-Innenabstand (density-gesteuert) */
  --radius:      8px;        /* Default Border-Radius */
  --radius-sm:   6px;        /* Kleine Elemente (Badges, Inputs) */
  --radius-lg:  12px;        /* Modale, Sheets */
}
```

### Basis-Spacing (Tailwind)

Standard Tailwind 4-Punkte-Raster. Häufig verwendete Kombinationen:

| Zweck | Klassen |
|---|---|
| Card padding | `p-[var(--pad-card)]` oder `p-4` |
| Section spacing | `space-y-4` |
| Inline gap | `gap-2` (8px) |
| Header/Footer gap | `gap-3` (12px) |
| Zwischen Cards | `gap-3` bis `gap-4` |

---

## 5. Komponenten-Primitives

### Card

```tsx
interface CardProps {
  title?: string;
  sub?: string;
  accent?: string;         // CSS color — zeigt Dot links vom Titel
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
```

Implementiert als shadcn `<Card>` Wrapper mit Custom Header-Pattern.
Accent-Dot wenn `accent` gesetzt.

### Pill / Badge

```tsx
type PillVariant = 'default' | 'pos' | 'warn' | 'neg' | 'accent' | 'outline';

<Pill variant="warn">Review</Pill>
```

Mapping auf shadcn `<Badge>` mit Variant-Extension.

### Sparkline

```tsx
interface SparklineProps {
  data: number[];
  color?: string;          // CSS color, default: var(--acc)
  width?: number;
  height?: number;
  fill?: boolean;          // Area fill unter der Linie
}
```

Leichte SVG-Komponente. Kein Recharts für inline-Sparklines.
Recharts nur für Vollformat-Charts (dedizierter Chart-Bereich).

### Tabs

```tsx
// Nutzt shadcn Tabs, erweitert um accent-underline
<Tabs defaultValue="diary" accentColor="var(--acc-nutri)">
  <TabsList>
    <TabsTrigger value="diary">Diary</TabsTrigger>
    <TabsTrigger value="foods">Foods</TabsTrigger>
  </TabsList>
  <TabsContent value="diary">...</TabsContent>
</Tabs>
```

Active-Tab Underline: 2px `--acc` statt Default-shadcn-Indicator.

### Modal / Dialog

shadcn `<Dialog>` mit angepassten Größen:

```
sm:  max-w-sm    (360px)  — Confirmations
md:  max-w-lg    (512px)  — Standard-Modals
lg:  max-w-2xl   (672px)  — Detail-Modals (z.B. Nutrient-Detail)
xl:  max-w-4xl   (896px)  — Complex Workflows (MealCam, Recipe Builder)
full: 90vw / 90vh         — LiveWorkout, Fullscreen-Flows
```

### Drawer (Sheet)

shadcn `<Sheet>` für Detail-Panels:

```
side="right"  width="460px"  — Standard-Drawer (Detail-Ansichten)
side="bottom"               — Mobile-ähnliche Bestätigungen
```

---

## 6. Datentabellen

Standardmuster für alle tabellarischen Listen:

```tsx
// Klassen-Pattern
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border text-fg-subtle text-xs uppercase tracking-wide">
      <th>...</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border/40 hover:bg-surface-hover cursor-pointer last:border-0">
      <td>...</td>
    </tr>
  </tbody>
</table>
```

Regeln:
- Kein Border auf letzter Zeile
- Kein Border auf Action-Spalte (`td:last-child { border-bottom: 0 }`)
- Tabelle hat `table-layout: fixed; width: 100%` — nie über Container-Breite hinaus
- Zahlen-Spalten rechtsbündig mit `font-mono tabular-nums`

---

## 7. Icons

Ausschließlich `lucide-react`. Keine custom SVGs.

```tsx
import { Flame, Droplets, Dumbbell, Heart } from 'lucide-react';

// Größen
<Flame className="w-4 h-4" />     // Standard (16px)
<Flame className="w-3.5 h-3.5" /> // Small (14px)
<Flame className="w-5 h-5" />     // Large (20px)
```

Modul-Icons:

| Modul | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Nutrition | `Apple` |
| Training | `Dumbbell` |
| Recovery | `Heart` |
| Supplements | `Pill` |
| Goals & Body | `Target` |
| Medical | `Stethoscope` |
| Coach | `Users` |
| Buddy | `MessageCircle` |
| Marketplace | `ShoppingBag` |
| Admin | `Shield` |

---

## 8. Dark / Light Mode

Toggle via `data-theme` Attribut auf `<html>`.
Persistenz: `localStorage` Key `lumeos-theme`.

```tsx
// Theme-Provider in layout.tsx
'use client';
const [theme, setTheme] = useLocalStorage('lumeos-theme', 'dark');
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

**Regel:** Kein `dark:` Tailwind-Prefix verwenden.
Alle Farben laufen über CSS-Variablen. `data-theme` regelt die Werte.

---

## 9. Density-System

User-Präferenz, persistiert in localStorage.

```tsx
type Density = 'compact' | 'default' | 'comfortable';

// Gesetzt auf .app-shell via data-density
// Komponenten nutzen var(--pad-card) statt fixer Padding-Werte
```

---

## 10. Responsive-Breakpoints

```
xs:  < 640px   — nicht supported in apps/web
sm:  640px     — nicht supported in apps/web
md:  768px     — nicht supported in apps/web
lg:  1024px    — Sidebar collapses to icon-only
xl:  1280px    — Minimum supported viewport
2xl: 1440px    — Design-Optimum
3xl: 1920px    — Wide-screen, Context Panel wider
```

---

## 11. Animation-Richtlinien

- **Modul-Transitions**: `fade` 150ms ease-out (Framer Motion `AnimatePresence`)
- **Modal Enter**: `scale(0.96) opacity(0) → scale(1) opacity(1)` 120ms
- **Drawer Slide**: `translateX(100%) → translateX(0)` 200ms ease-out
- **Buddy-Avatar**: Framer Motion `variants` (idle/thinking/responding/alert/celebrating)
- **Kein** `transition-all` — immer spezifische Properties
- Keine Animationen bei `prefers-reduced-motion: reduce`

---

## 12. Acceptance Criteria

```
[ ] Alle Token als CSS Custom Properties in globals.css definiert
[ ] Dark/Light Theme wechselt via data-theme auf <html>
[ ] Zahlen überall in JetBrains Mono mit tabular-nums
[ ] Modul-Akkzentfarbe wechselt bei Navigation korrekt
[ ] Card/Pill/Tabs/Modal/Drawer als wiederverwendbare Komponenten in packages/ui
[ ] Sparkline SVG-Komponente ohne Recharts-Dependency
[ ] Keine hardcodierten Farbwerte in Komponenten — ausschließlich Token
[ ] Density-Klassen wirken auf var(--pad-card) korrekt
[ ] Tabellen gehen nie über Container-Breite hinaus (table-layout: fixed)
```
