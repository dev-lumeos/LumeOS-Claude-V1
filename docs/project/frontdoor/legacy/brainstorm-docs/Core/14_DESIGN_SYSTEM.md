# LUMEOS — Design System
> Konsolidiert | 2026-04-14
> Quellen: design/DESIGN_SYSTEM.md, design/APP_SPECIFICATIONS.md, design/DATA_STRUCTURE.md

---

## 1. Design-Philosophie

**"Clarity through Complexity"** — Lumeos handelt mit komplexen Health-Daten, aber das Interface bleibt klar und intuitiv.

**Kernprinzipien:**
1. Performance-Focused: jedes Element dient der Health-Optimierung
2. Module Identity: jedes Modul hat eigene visuelle Identität bei System-Kohärenz
3. Data-Dense but Readable: komplexe Daten klar präsentiert
4. Professional Grade: für Consumer und Health Professionals
5. Mobile-First: primär Mobile, Desktop als Enhancement

---

## 2. Modul-Farbsystem

Jedes Modul hat eine eigene Farb-Identität:

```css
/* Nutrition — Green (Wachstum, Gesundheit) */
--nutrition-primary: #16a34a;   /* Green-600 */
--nutrition-light:   #bbf7d0;   /* Green-200 */
--nutrition-bg:      #f0fdf4;   /* Green-50  */

/* Training — Blue (Stärke, Performance) */
--training-primary:  #2563eb;   /* Blue-600  */
--training-light:    #bfdbfe;   /* Blue-200  */
--training-bg:       #eff6ff;   /* Blue-50   */

/* Supplements — Purple (Enhancement, Optimization) */
--supplements-primary: #9333ea; /* Purple-600 */
--supplements-light:   #ddd6fe; /* Purple-200 */
--supplements-bg:      #faf5ff; /* Purple-50  */

/* Recovery — Teal (Restoration, Balance) */
--recovery-primary:  #0d9488;   /* Teal-600  */
--recovery-light:    #99f6e4;   /* Teal-200  */
--recovery-bg:       #f0fdfa;   /* Teal-50   */

/* Medical — Red (Critical, Monitoring) */
--medical-primary:   #dc2626;   /* Red-600   */
--medical-light:     #fecaca;   /* Red-200   */
--medical-bg:        #fef2f2;   /* Red-50    */

/* Goals — Orange (Ambition, Progress) */
--goals-primary:     #ea580c;   /* Orange-600 */
--goals-light:       #fed7aa;   /* Orange-200 */
--goals-bg:          #fff7ed;   /* Orange-50  */

/* Coach — Indigo (Intelligence, Wisdom) */
--coach-primary:     #4f46e5;   /* Indigo-600 */
--coach-light:       #c7d2fe;   /* Indigo-200 */
--coach-bg:          #eef2ff;   /* Indigo-50  */
```

---

## 3. Status-Farben (System-weit)

```css
/* Scores + Alerts */
--status-ok:      #16a34a;   /* Green  — Score ≥ 80 */
--status-warn:    #d97706;   /* Amber  — Score 50-79 */
--status-block:   #dc2626;   /* Red    — Score < 50  */
--status-neutral: #6b7280;   /* Gray   — Kein Wert   */

/* Alerts */
--alert-critical: #ef4444;   /* Red-500   */
--alert-high:     #f97316;   /* Orange-500 */
--alert-medium:   #eab308;   /* Yellow-500 */
--alert-low:      #3b82f6;   /* Blue-500  */
--alert-info:     #6b7280;   /* Gray-500  */
```

---

## 4. Typography

```css
/* Fonts */
--font-primary:  'Inter', sans-serif;
--font-mono:     'JetBrains Mono', monospace;  /* Für Daten/Metriken */

/* Größen */
--text-xs:   0.75rem;  /* 12px — Labels, Badges */
--text-sm:   0.875rem; /* 14px — Sekundärer Text */
--text-base: 1rem;     /* 16px — Body */
--text-lg:   1.125rem; /* 18px — Sub-Headlines */
--text-xl:   1.25rem;  /* 20px — Headlines */
--text-2xl:  1.5rem;   /* 24px — Modul-Titel */
--text-4xl:  2.25rem;  /* 36px — Hero */
```

---

## 5. Score-Visualisierung (System-weit)

Alle Module nutzen dasselbe 0-100 Score-System:

```
Score ≥ 80: Grüner Ring + "ok"    — Alles gut
Score 50-79: Amber Ring + "warn"  — Aufmerksamkeit nötig
Score < 50:  Roter Ring + "block" — Kritisch, Aktion nötig
```

Score-Ring: Circular Progress mit Farb-Gradient, Zahl in der Mitte, Status-Label darunter.

---

## 6. Navigation

**Bottom Navigation (6 Tabs):**
🏠 Home | 🧠 Coach | 📖 Diary | 🏋️ Training | 💊 Supps | 💤 Recovery

Coach auf Position 2 — zentrales Intelligence-Hub.

**Sub-Navigation:** Header-Tabs für Modul-interne Bereiche.

---

## 7. App-spezifisches Design

### Web App (Port 8500) — Marketing/Landing
**Strategy:** "Professional Health Tech with Human Touch"

**Brand Gradient:**
```css
--hero-gradient: linear-gradient(135deg, #2563eb 0%, #0d9488 50%, #16a34a 100%);
--cta-gradient: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
```

**Trust Indicators (Hero Section):**
- 10.000+ Active Users
- 50M+ Data Points Tracked
- 95% Goal Achievement Rate

### Main App (Port 8501) — User Interface
- Mobile-first, Tailwind CSS
- Zustand für Client State
- React Query für Server State
- Module-Identity Colors pro Abschnitt

### Coach App (Port 8502) — Professional Dashboard
- Data-dense Tables (TanStack Table)
- Sortable/Filterable Client Lists
- Alert Cards mit Severity-Color-Coding
- Quick-Action Buttons inline

### Admin App (Port 8504) — Operations
- Dark Sidebar + White Content Area
- Slate Sidebar, White Content, Green-600 Accents
- Server-side Pagination + Debounced Search

---

## 8. UI-Komponenten (Key)

### Score Cards
```
[Module Icon] [Score Ring: 0-100] [Status: ok/warn/block]
[Module Name]                     [Trend: ↑↓→]
```

### Alert Cards
Severity-Badge (Critical/High/Medium/Low/Info) + Icon + Title + Description + Action Button

### Action Cards (Inline, Coach AI)
```
<action id type priority title description>
→ Rendert als: [priority-colored border] [title] [description] [✓ Ja] [✗ Nein]
```

### Data Tables
TanStack Table, Server-side Sort/Filter/Pagination, Inline Actions

---

## 9. i18n

**Unterstützte Sprachen:** DE (Primär), EN (International), TH (Thailand)
- 4.000+ i18n Keys
- Coach antwortet in User-Sprache
- Exercise Instructions in DE/EN/TH

---

## 10. Smart Food Search — Technical

DB-Level Scoring via PostgreSQL CASE expressions (<200ms Target):

| Factor | Modifier | Zweck |
|---|---|---|
| Liked Food Match | +100 | Lieblingsfoods priorisieren |
| Disliked Food Match | -100 | Abneigungen depriorisieren |
| High-Carb (Keto Mode) | -50 | Keto-Compliance |
| Name Match Boost | +1 (ordering) | Prefix-Matches bevorzugen |

**Filtering:** Diet-Type Exclusions (vegan/vegetarian/pescatarian), Allergen Exclusions (PostgreSQL `&&` array), Custom Foods merge
