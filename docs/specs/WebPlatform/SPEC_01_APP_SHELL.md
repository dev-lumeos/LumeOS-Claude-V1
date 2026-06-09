# SPEC_01 — App Shell
> WebPlatform | Stand: Mai 2026 | Status: draft

---

## 1. Übersicht

Die App Shell ist das persistente Rahmenwerk der gesamten `apps/web` Applikation.
Sie rendert unabhängig vom aktiven Modul und besteht aus drei festen Bereichen.

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar (240px) │  Content Area (fluid)  │ Context Panel (340px) │
│                 │                        │                        │
│ [Brand]         │ [Topbar]               │ [Buddy-Avatar]         │
│ [Search ⌘K]    │ [Module Content]       │ [Insights-Cards]       │
│ [Nav Groups]    │                        │ [Quick-Actions]        │
│   ─ Modules     │                        │ [Buddy-Message]        │
│   ─ Workspaces  │                        │                        │
│   ─ System      │                        │                        │
│ [User / Avatar] │                        │                        │
└─────────────────────────────────────────────────────────────────┘
```

Context Panel ist per User-Präferenz collapsible.
Bei ausgeblendetem Panel: `grid-template-columns: 240px 1fr`.

---

## 2. Layout

### CSS Grid Root

```css
.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr 340px;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}

/* Context Panel hidden */
.app-shell[data-right-panel="hidden"] {
  grid-template-columns: 240px 1fr;
}

/* Density variants */
.app-shell[data-density="compact"]     { --pad-card: 12px; }
.app-shell[data-density="default"]     { --pad-card: 16px; }
.app-shell[data-density="comfortable"] { --pad-card: 20px; }
```

### Viewport-Annahmen

- **Desktop-first**: Minimum 1280px, optimiert für 1440px
- Keine Mobile-Layouts in `apps/web` (→ `apps/mobile` für Native)
- Responsive Breakpoints: 1280px / 1440px / 1920px
- Bei < 1280px: Sidebar collapsible (Icon-only mode, 56px)

---

## 3. Sidebar (240px)

### Struktur

```
sidebar/
├── SidebarBrand          — Logo, Name "LumeOS", Version-Tag
├── SidebarSearch         — ⌘K Trigger, Placeholder "Search or jump to…"
├── SidebarNav
│   ├── NavGroup "Modules"     — 7 Module mit Keyboard-Shortcut
│   ├── NavGroup "Workspaces"  — 4 externe Links (Coach, Buddy, Marketplace, Admin)
│   └── NavGroup "System"      — Settings
└── SidebarUser           — Avatar, Name, Rolle, More-Button
```

### Module-Navigation (7 Core-Module)

| Shortcut | Module | Accent-Token |
|---|---|---|
| `1` | Dashboard | `--acc-dash` |
| `2` | Nutrition | `--acc-nutri` |
| `3` | Training | `--acc-train` |
| `4` | Recovery | `--acc-recov` |
| `5` | Supplements | `--acc-suppl` |
| `6` | Goals & Body | `--acc-goals` |
| `7` | Medical | `--acc-medic` |

### Workspace-Links (separate Domains)

| Label | Target | Auth-Handoff |
|---|---|---|
| Coach Portal | `coach.lumeos.app` | SSO-Token |
| Buddy | `buddy.lumeos.app` | SSO-Token |
| Marketplace | `marketplace.lumeos.app` | SSO-Token |
| Admin | `admin.lumeos.app` | Role-check + SSO |

Workspace-Links öffnen in neuem Tab. Sie haben keine Keyboard-Shortcuts.
In der Nav visuell als sekundäre Gruppe markiert (gedimmte Labels, `↗` Icon).

### Active-State-Indikator

```css
.nav-item.active {
  background: var(--surface);
  color: var(--fg);
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 4px; bottom: 4px;
  width: 2px;
  background: var(--acc);          /* Modul-Akzentfarbe */
  border-radius: 0 2px 2px 0;
}
```

### User-Section (Bottom)

```tsx
<SidebarUser>
  <Avatar initials="TM" onClick={() => openProfileSettings()} />
  <div>
    <UserName>{user.displayName}</UserName>
    <UserRole>{user.role} · {user.tier}</UserRole>
  </div>
  <MoreButton />
</SidebarUser>
```

Avatar-Click → ProfileSettings-Modal (7 Tabs: Profile, Units, Modules, Privacy, Data Sources, Subscription, Danger Zone).

---

## 4. Topbar

### Struktur

```
[MOD-TAG] Workspace / {ModuleLabel}          [Sync-Pill] [🔔] [☀/🌙] [⊞] [Commands]
```

| Element | Beschreibung |
|---|---|
| `MOD-TAG` | Modulname uppercase, farbiger Dot mit Accent |
| Breadcrumb | `Workspace / {ModuleLabel}` |
| Sync-Pill | `● Synced` (grün) oder `● Offline · N queued` (amber) |
| Notifications | Bell Icon, Badge mit ungelesener Anzahl |
| Theme Toggle | Sun/Moon Split-Button |
| Context Toggle | Panel-ein/ausblenden Icon |
| Commands | `⌘K` Button |

### Accent-Linie

Unterhalb der Topbar: 2px Gradient-Linie in `--acc` (aktive Modulfarbe).

```css
.topbar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--acc) 20%,
    var(--acc) 80%,
    transparent 100%
  );
  opacity: 0.5;
}
```

---

## 5. Context Panel (340px)

### Struktur pro Modul

```
ctx-panel/
├── CtxHeader            — "Context · {ModuleLabel}"
├── BuddyWidget          — Animierter Avatar (5 States) + Buddy-Message
├── InsightCards[]       — 2–4 Kontext-relevante Insights
│   ├── Insight (pos)    — Erfolg, positiver Trend
│   ├── Insight (warn)   — Warnung, Abweichung
│   └── Insight (info)   — Neutraler Hinweis
├── QuickActions[]       — 2–4 modul-spezifische Schnellaktionen
└── ModuleDetails        — Modul-Meta (z.B. "117 nutrients · BLS 10.840")
```

### Buddy-Avatar Zustände

| State | Animation | Auslöser |
|---|---|---|
| `idle` | Subtiles Pulse (Orb) | Default |
| `thinking` | Rotation + Opacity-Pulse | API-Call läuft |
| `responding` | Schnelleres Pulse | Text erscheint |
| `alert` | Rot-Tint + Shake | Kritische Warnung |
| `celebrating` | Grün + Scale-Pop | Goal erreicht, PR |

Implementiert via Framer Motion `variants` auf einem `motion.div`.

---

## 6. Keyboard Navigation

| Shortcut | Aktion |
|---|---|
| `1` – `7` | Modul wechseln (Sidebar) |
| `⌘K` | Command Palette öffnen |
| `Esc` | Modal / Drawer schließen |
| `⌘,` | Profile Settings öffnen |
| `⌘/` | Keyboard Shortcuts Overlay |

---

## 7. Routing (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── onboarding/page.tsx        — Multi-Step Flow
│
├── (app)/                         — Authenticated Layout
│   ├── layout.tsx                 — AppShell (Sidebar + Topbar + ContextPanel)
│   ├── dashboard/page.tsx
│   ├── nutrition/
│   │   ├── page.tsx               — Diary (default)
│   │   ├── foods/page.tsx
│   │   ├── planner/page.tsx
│   │   └── insights/page.tsx
│   ├── training/
│   │   ├── page.tsx               — Today
│   │   ├── plan/page.tsx
│   │   ├── history/page.tsx
│   │   └── library/page.tsx
│   ├── recovery/page.tsx
│   ├── supplements/page.tsx
│   ├── goals/page.tsx
│   └── medical/page.tsx
│
└── api/                           — Route Handlers (Proxy zu Services)
```

### Active-Module Detection

```tsx
// layout.tsx
const pathname = usePathname();
const activeModule = pathname.split('/')[1] ?? 'dashboard';

// CSS var auf root setzen
useEffect(() => {
  document.documentElement.style.setProperty(
    '--acc',
    `var(--acc-${MODULE_ACCENT_MAP[activeModule]})`
  );
}, [activeModule]);
```

---

## 8. Command Palette (⌘K)

Globale Suche + Navigation. Implementiert mit `cmdk`.

**Kategorien:**
- Navigate: Modul-Shortcuts
- Quick Actions: "Log meal", "Start workout", "Log sleep"
- Search: Foods, Exercises, Supplements (Supabase full-text)
- Recent: Letzte 5 Aktionen

---

## 9. ProfileSettings Modal

7-Tab Modal, trigger: Sidebar-Avatar-Click.

| Tab | Inhalt |
|---|---|
| Profile | Display Name, Avatar, Bio |
| Units | kg/lbs, cm/inch, °C/°F, 24h/12h, Wochenbeginn |
| Modules | Module aktivieren/deaktivieren, Reihenfolge |
| Privacy | Coach-Permissions Matrix, Buddy-Zugriff |
| Data Sources | Wearables (Garmin, Polar, Whoop, Apple Health) |
| Subscription | Plan, Billing, Feature-Gates |
| Danger Zone | Daten-Export, Account-Löschung (14d Grace) |

---

## 10. Acceptance Criteria

```
[ ] 3-Spalten-Shell rendert bei ≥ 1280px korrekt
[ ] Modul-Wechsel via Keyboard (1–7) funktioniert
[ ] Accent-Token wechselt beim Modul-Wechsel
[ ] Context Panel collapsible, Zustand persistent (localStorage)
[ ] ⌘K öffnet Command Palette
[ ] Avatar-Click öffnet ProfileSettings-Modal
[ ] Workspace-Links öffnen in neuem Tab
[ ] Sync-Pill zeigt Offline-Status korrekt
[ ] Theme-Toggle persistiert (localStorage oder Cookie)
[ ] Topbar Accent-Linie folgt aktivem Modul
[ ] Sidebar Icon-only Mode unter 1280px
```
