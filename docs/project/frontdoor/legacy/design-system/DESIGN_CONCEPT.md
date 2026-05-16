# LUMEOS Design Concept

*Extracted via AST analysis of 534 TSX files — 2026-04-27Status: DRAFT*

---

## 1. Core Philosophy

LUMEOS is a **health OS** — not a single-purpose app. The design reflects this:

- **Per-module identity** through gradient headers and accent colors, while sharing a neutral white/gray base
- **Mobile-first, desktop-aware** — Tailwind `lg:` breakpoints add desktop layout on top of a mobile stack
- **Data-dense but calm** — tiny text (`text-xs`, `text-[10px]`) for metadata keeps UI uncluttered while displaying a lot
- **Emoji as micro-icons** — used alongside `lucide-react` icons for warmth and fast visual parsing

---

## 2. Dual Theme System

The project has **two coexisting color themes**:

### Light Theme — Module UI (primary)

Used in all `apps/app/modules/**` and `src/modules/**` components.

```
Background:  bg-white / bg-gray-50
Cards:       bg-white rounded-xl border border-gray-200 p-5
Text:        text-gray-900 / text-gray-700 / text-gray-500 / text-gray-400
Borders:     border-gray-200
```

### Dark Theme — Primitive Package

Used exclusively in `packages/ui/src/*` (Button, Card, Input, Modal, Badge, Spinner).

```
Background:  bg-zinc-900
Borders:     border-zinc-700 / border-zinc-800
Text:        text-zinc-100 / text-zinc-300 / text-zinc-400
```

> **Implication:** The `@lumeos/ui` primitives are styled for a dark context (e.g. coach portal, admin), while the main app (`apps/app`) uses light-mode module components directly with Tailwind utilities — not the primitive package.

---

## 3. Module Identity System

Each module has a **gradient header** (via `ModuleHeader`) and an **accent color** (via `ResponsiveTabNav`):

ModuleGradientTab AccentEmojiNutrition`from-green-500 to-teal-400`green🍽️Training`from-orange-500 to-red-500`orange🏋️Coach/AI`from-blue-600 to-indigo-600`blue🤖Goals`from-purple-500 to-pink-500`purple🎯Supplements`from-teal-500 to-cyan-500`teal💊Recovery`from-blue-500 to-cyan-500`blue😴Medical`from-rose-500 to-pink-500`—🩺Intelligence——🧠Dashboard——📊

The `ModuleHeader` component is the **identity anchor** for each module — it shows the emoji icon, title, description, and up to 3 KPI tiles on a gradient background.

---

## 4. Recurring Design Patterns

### 4.1 Standard Module Card

The single most-repeated layout unit across all modules:

```tsx
<div className="bg-white rounded-xl border border-gray-200 p-5">
  {/* header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-gray-900">…</h3>
    <span className="text-sm text-gray-500">…</span>
  </div>
  {/* content */}
  <div className="space-y-3">…</div>
</div>
```

**Frequency:** 58 exact matches for the card wrapper, hundreds more with minor variations.

### 4.2 Section Heading

```tsx
<p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
  SECTION TITLE
</p>
```

Also available as CSS utility class `.section-heading`. Used for grouping within cards and in the sidebar ("Apps" label).

### 4.3 Flex Data Row

```tsx
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-700">Label</span>
  <span className="text-sm font-semibold text-gray-900">Value</span>
</div>
```

**Frequency:** 190 exact matches. The backbone of every metric display card.

### 4.4 Icon + Label Row

```tsx
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 text-gray-500" />
  <span className="text-sm text-gray-700">Text</span>
</div>
```

`gap-2` (286 matches) and `gap-3` (158 matches) are the primary flex gaps.

### 4.5 Module Tab Navigation

```tsx
<ResponsiveTabNav
  tabs={[
    { id: 'diary', label: 'Diary', icon: '📋' },
    { id: 'insights', label: 'Insights', icon: '💡' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  accentColor="green"  // module-specific
/>
```

Always placed at top of module view, horizontally scrollable on mobile.

### 4.6 Form Field

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Field Name
  </label>
  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
</div>
```

**Frequency:** Label pattern: 81 matches (`mb-2`) + 58 matches (`mb-1`).

### 4.7 Module Header with KPIs

```tsx
<ModuleHeader
  icon="🍽️"
  title="Ernährung"
  description="Dein Tagesprotokoll"
  gradient="from-green-500 to-teal-400"
  kpis={[
    { label: 'Kalorien', value: '1.840', icon: '🔥' },
    { label: 'Protein', value: '142g', icon: '💪' },
    { label: 'Wasser', value: '2.1L', icon: '💧' },
  ]}
/>
```

KPI tiles use `bg-white/15 backdrop-blur-sm rounded-xl p-3` — glassmorphism on gradient.

### 4.8 Sidebar Navigation Item

```tsx
<Link
  href="/nutrition"
  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
    active
      ? 'bg-green-50 text-green-700 font-medium'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`}
>
  <span className="text-lg">🍽️</span>
  Nutrition
</Link>
```

Active state additionally gets `::before` pseudo-element left-bar (via `.sidebar-item-active`).

### 4.9 AI Buddy Action Card

```tsx
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-md border border-blue-100 max-w-[75%]">
  <h3 className="font-semibold text-gray-800 mb-2 text-sm">{title}</h3>
  <p className="text-gray-700 text-sm mb-4">{message}</p>
  <div className="flex flex-wrap gap-2">
    {actions.map(a => <button className={getButtonStyles(a.variant)}>{a.label}</button>)}
  </div>
</div>
```

Chat-bubble style max-width constraint. Gradient tint differentiates AI messages from system cards.

### 4.10 Dashboard Grid

```tsx
<div className="dashboard-grid">
  <div className="span-2">…</div>   {/* 2-col wide on desktop */}
  <div className="full-width">…</div>  {/* spans all columns */}
  <div>…</div>
</div>
```

Custom CSS class — 1 col mobile → 2 col (lg) → 3 col (2xl).

---

## 5. Responsive Strategy

```
Mobile (default):  single column, bottom nav, scrollable tabs
Desktop (lg: 1024px+): sidebar (w-64) + main content area, 2-col grid
Wide (2xl: 1536px+):   3-col grid
```

Key breakpoint patterns:

- `flex-col lg:flex-row` — stack to side-by-side
- `hidden lg:flex` / `lg:hidden` — show/hide nav elements
- `.card-hover` and `.custom-scrollbar` activate only at `lg:`
- Dashboard grid column expansion at `lg:` and `2xl:`

---

## 6. Accessibility Patterns

- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500` on Button
- `focus:ring-2 focus:ring-green-500` on form inputs
- `disabled:opacity-50 disabled:cursor-not-allowed` on Button
- Keyboard ESC handler in Modal (`keydown` event listener)
- `transition-colors` on all interactive elements for visual feedback

---

## 7. Missing / Inconsistencies to Address

1. **Dark/Light theme split** — `@lumeos/ui` uses zinc-dark, module components use gray-light. No runtime theming (no `dark:` classes, no theme toggle). The packages need alignment.

2. **No shadcn/ui or design token variables in CSS** — colors are hardcoded Tailwind classes throughout. No HSL CSS variable system like `hsl(var(--primary))`.

3. **Gradient duplication** — module gradients are strings passed as props without a central constant. Should be a token map (provided in `tokens/colors.json`).

4. **Emoji vs. lucide-react inconsistency** — some components use emoji icons, others `lucide-react`. No unified icon strategy.

5. **Button pattern duplication** — `@lumeos/ui Button` (dark theme) and inline button patterns in modules (light theme, e.g. ActionCard's `getButtonStyles`) are not unified.

6. `text-[10px]` — arbitrary Tailwind value. Should be promoted to a named token (`text-micro`).

7. `space-y-*` **vs** `gap-*` — both are used for the same purpose in different components. No consistent convention.

---

## 8. Recommended Next Steps

1. **Unify color tokens** — introduce CSS custom properties (HSL variables) for primary, surface, text-muted etc., enabling true dark mode
2. **Align** `@lumeos/ui` — migrate primitives to the light theme or make them theme-aware
3. **Centralize module gradients** as a `GRADIENTS` constant importable everywhere
4. **Icon audit** — decide: emoji for nav/headers, lucide for inline UI
5. **Promote** `text-[10px]` — add `micro: '10px'` to Tailwind `fontSize` config
6. **Extract** `CardSection` component — the `flex items-center justify-between mb-4` header pattern repeats 66+ times
