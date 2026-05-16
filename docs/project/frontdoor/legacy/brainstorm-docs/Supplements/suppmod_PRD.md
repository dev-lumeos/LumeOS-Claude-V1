# LUMEOS Supplement Module — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2026-02-23
**Author:** Jarvis (AI Architect)
**Status:** DRAFT — Awaiting Tom Review

---

## 1. Vision

Das Supplement-Modul macht Lumeos zur **einzigen App die weiß was du isst, trainierst UND supplementierst** — und daraus intelligente Empfehlungen ableitet. Kein Competitor hat diesen Cross-Module-Vorteil.

### Core Differentiators
1. **Nutrition-Gap-Analysis** — "Dir fehlen 4000 IU Vitamin D basierend auf deinem Food Log"
2. **Redundancy Detection** — "3 Supplements enthalten Magnesium → 1 reicht"
3. **Training-Aware Stacks** — "Leg Day → Creatine Pre, Magnesium Post"
4. **Timing mit Mahlzeiten** — "Vitamin D zum Mittagessen (Fett nötig)"
5. **Evidence Grades** — "Creatine: A★★★★★ | Glutamine: F (kein Effekt)"
6. **Bloodwork Effectiveness** — "Vitamin D: 18→52 ng/mL in 3 Monaten ✅"

---

## 2. Scope

### In Scope (MVP — Milestones 1-4)
- Supplement Database (kuratiert, ~200 Supplements)
- Stack Manager (My Supps, Dosierung, Schedule)
- Intake Logging (Taken ✓ / Skipped ✕ / Snoozed ⏰)
- Timing Optimizer (Mahlzeiten-basiert, Interaktions-basiert)
- Interaction Checker (Supplement↔Supplement, Supplement↔Food)
- Nutrition Gap Analysis (Cross-Module: Mikronährstoffe aus Food Log)
- Redundancy Detection
- Evidence Grades (A-F pro Supplement/Benefit)
- Cost Tracking (monatliche Stack-Kosten)
- Inventory Management (Bestand, Low-Stock Alert)
- Stack Templates (Muskelaufbau, Cut, Longevity, etc.)
- Reminders (Local Notifications)
- Settings (Einnahme-Zeiten, Reminder-Präferenzen)

### In Scope (Milestones 5-6)
- Enhanced Supplements Mode (PEDs, TRT, Peptides) — Privacy-First, Local-Only
- Barcode Scanner
- Bloodwork Effectiveness Tracking (Cross-Module: Medical)
- Training-Aware Stacks (Cross-Module: Training)

### Out of Scope (Later)
- Supplement Marketplace / Affiliate
- AI Supplement Advisor (Coach)
- Community Stacks
- Apple Watch Complications

---

## 3. User Stories

### Stack Management
- **US-01** Als User kann ich Supplements zu meinem Stack hinzufügen (Name, Marke, Dosis, Form)
- **US-02** Als User kann ich mehrere Stacks erstellen (z.B. "Bulk Stack", "Cut Stack", "Daily")
- **US-03** Als User kann ich einen Stack als aktiv setzen
- **US-04** Als User kann ich Stack Templates importieren (vordefiniert)
- **US-05** Als User sehe ich meinen aktiven Stack mit allen Supplements auf einen Blick

### Intake Logging
- **US-10** Als User sehe ich meine tägliche Einnahme-Liste (wie Diary Ghost Entries)
- **US-11** Als User kann ich ein Supplement als "Genommen" markieren (1-Tap)
- **US-12** Als User kann ich ein Supplement als "Übersprungen" markieren
- **US-13** Als User sehe ich meine Compliance-Rate (% der Woche/Monat genommen)
- **US-14** Als User bekomme ich Reminders zur Einnahme (konfigurierbar)

### Timing & Interactions
- **US-20** Als User sehe ich optimale Einnahme-Zeiten basierend auf meinen Mahlzeiten
- **US-21** Als User werde ich gewarnt bei Interaktionen (Supplement↔Supplement)
- **US-22** Als User sehe ich Absorption-Hinweise ("Mit Fett einnehmen", "Nüchtern")
- **US-23** Als User sehe ich Timing-Konflikte ("Calcium + Iron: 2h Abstand!")

### Intelligence
- **US-30** Als User sehe ich welche Mikronährstoffe mir aus dem Food Log fehlen (Gap Analysis)
- **US-31** Als User sehe ich Redundanzen in meinem Stack ("3 Supplements mit Magnesium")
- **US-32** Als User sehe ich Evidence Grades für jedes Supplement (A-F)
- **US-33** Als User sehe ich monatliche Kosten meines Stacks
- **US-34** Als User bekomme ich Vorschläge basierend auf Deficits ("Dir fehlt Vitamin D")

### Inventory
- **US-40** Als User kann ich Bestand pro Supplement tracken (Kapseln/Tabletten übrig)
- **US-41** Als User bekomme ich Low-Stock Alerts ("Nur noch 5 Tage Creatine")

### Enhanced Mode (PEDs)
- **US-50** Als User kann ich Enhanced Mode aktivieren (separater PIN/Biometrie)
- **US-51** Als User kann ich Compounds tracken (AAS, SARMs, Peptides, TRT)
- **US-52** Als User sehe ich Blood Level Curves (Half-Life Visualisierung)
- **US-53** Als User sehe ich Injection Site Rotation (Body Map)
- **US-54** Als User sehe ich Health Monitoring Dashboard (Leber, Lipide, Blut, Hormone)
- **US-55** Enhanced Daten sind 100% lokal, nie Cloud

---

## 4. Data Model

### DB Tables (Migration 008)

```sql
-- Supplement Master Data (kuratiert, shipped with app)
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT,
  name_en TEXT,
  name_th TEXT,
  brand TEXT,
  category TEXT NOT NULL, -- 'vitamin', 'mineral', 'amino_acid', 'herb', 'performance', 'other'
  form TEXT, -- 'capsule', 'tablet', 'powder', 'liquid', 'softgel', 'gummy'
  serving_size NUMERIC,
  serving_unit TEXT, -- 'mg', 'g', 'IU', 'mcg', 'ml'
  ingredients JSONB, -- [{name, amount, unit}]
  evidence_grade CHAR(1), -- A, B, C, D, F
  evidence_data JSONB, -- {benefits: [{claim, grade, studies}]}
  timing_default TEXT, -- 'morning', 'with_meal', 'pre_workout', 'post_workout', 'evening', 'any'
  absorption_notes JSONB, -- {needs_fat: true, empty_stomach: false, avoid_with: ['calcium']}
  cost_per_serving NUMERIC,
  is_curated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Stacks
CREATE TABLE user_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  goal TEXT, -- 'muscle_gain', 'cut', 'longevity', 'general_health', 'performance', 'custom'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stack Items (Supplements in a Stack)
CREATE TABLE stack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES user_stacks(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES supplements(id),
  custom_name TEXT, -- for user-added supplements not in DB
  dose NUMERIC NOT NULL,
  dose_unit TEXT NOT NULL, -- 'mg', 'g', 'IU', 'mcg', 'capsules', 'scoops'
  frequency TEXT DEFAULT 'daily', -- 'daily', '2x_daily', '3x_daily', 'weekly', 'as_needed'
  timing TEXT, -- 'morning', 'with_breakfast', 'pre_workout', 'post_workout', 'evening', 'bedtime'
  cycling JSONB, -- {on_weeks: 8, off_weeks: 4} or null
  notes TEXT,
  cost_per_month NUMERIC,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intake Schedule (daily generated from active stack)
CREATE TABLE intake_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stack_item_id UUID NOT NULL REFERENCES stack_items(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL, -- '07:00', '12:30', 'pre_workout'
  with_meal TEXT, -- 'breakfast', 'lunch', 'dinner', null
  notes TEXT -- 'Take with fatty meal', 'Empty stomach'
);

-- Intake Logs
CREATE TABLE intake_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stack_item_id UUID NOT NULL REFERENCES stack_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'taken', 'skipped', 'snoozed', 'pending'
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stack_item_id, date)
);

-- Supplement Interactions
CREATE TABLE supplement_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement1_id UUID REFERENCES supplements(id),
  supplement1_name TEXT, -- fallback for general rules like "Iron + Calcium"
  supplement2_id UUID REFERENCES supplements(id),
  supplement2_name TEXT,
  interaction_type TEXT NOT NULL, -- 'avoid', 'separate_2h', 'separate_4h', 'take_together', 'enhance', 'reduce'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  reason TEXT NOT NULL,
  reason_de TEXT,
  reason_en TEXT,
  reason_th TEXT,
  source TEXT, -- PubMed DOI or reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Inventory
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stack_item_id UUID REFERENCES stack_items(id),
  supplement_name TEXT,
  quantity_remaining NUMERIC,
  quantity_unit TEXT, -- 'capsules', 'scoops', 'ml', 'tablets'
  servings_per_container NUMERIC,
  purchase_date DATE,
  expiry_date DATE,
  cost NUMERIC,
  low_stock_threshold NUMERIC DEFAULT 7, -- days
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Substances (Privacy-First — future, local-only in prod)
CREATE TABLE enhanced_substances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  aliases TEXT[],
  category TEXT NOT NULL, -- 'AAS', 'SARM', 'Peptide', 'GH', 'AI', 'SERM', 'Other'
  half_life_hours NUMERIC,
  active_life_hours NUMERIC,
  detection_time_days NUMERIC,
  route TEXT, -- 'intramuscular', 'subcutaneous', 'oral', 'transdermal'
  typical_dose_min NUMERIC,
  typical_dose_max NUMERIC,
  dose_unit TEXT,
  frequency TEXT,
  monitoring_markers TEXT[],
  warnings TEXT[],
  legal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Endpoints (Hono, Port 5300)

```
# Supplements DB
GET    /api/supplements/search?q=          — Search supplement database
GET    /api/supplements/:id                — Get supplement details + evidence

# Stacks
GET    /api/supplements/stacks             — List user stacks
POST   /api/supplements/stacks             — Create stack
PUT    /api/supplements/stacks/:id         — Update stack
DELETE /api/supplements/stacks/:id         — Delete stack
POST   /api/supplements/stacks/:id/activate — Set as active

# Stack Items
GET    /api/supplements/stacks/:id/items   — List items in stack
POST   /api/supplements/stacks/:id/items   — Add item to stack
PUT    /api/supplements/stacks/:id/items/:itemId — Update item
DELETE /api/supplements/stacks/:id/items/:itemId — Remove item

# Intake
GET    /api/supplements/intake?date=       — Get daily intake schedule + status
POST   /api/supplements/intake/:itemId     — Log intake (taken/skipped/snoozed)

# Intelligence
GET    /api/supplements/gap-analysis       — Nutrition gap analysis (reads from nutrition module)
GET    /api/supplements/redundancies       — Detect ingredient overlaps
GET    /api/supplements/interactions       — Get all interaction warnings for active stack
GET    /api/supplements/timing?date=       — Optimized timing schedule for today

# Inventory
GET    /api/supplements/inventory          — List inventory
PUT    /api/supplements/inventory/:id      — Update inventory
GET    /api/supplements/inventory/alerts   — Low stock alerts

# Cost
GET    /api/supplements/cost               — Monthly cost overview
```

---

## 6. UI Structure (Bottom Nav: 💊 Supplements)

### Navigation
```
💊 Supplements (Bottom Tab)
├── 📋 Today (Default View)
│   ├── Tägliche Einnahmeliste (Ghost-Entries wie Diary)
│   ├── Timing-optimiert (Morning → Evening)
│   ├── ✓ Taken / ✕ Skip / ⏰ Snooze per Item
│   └── Compliance % Badge
├── 📦 My Stack
│   ├── Aktiver Stack mit allen Items
│   ├── Dose, Timing, Evidence Grade pro Item
│   ├── + Add Supplement (Search DB)
│   ├── Stack Templates (Quick Import)
│   └── Switch Stack / Create New
├── 🧠 Insights
│   ├── Gap Analysis (Was fehlt aus Food Log?)
│   ├── Redundancy Check (Overlap-Warnung)
│   ├── Interaction Warnings
│   ├── Cost Overview (Monthly)
│   └── Evidence Summary
├── 📊 History
│   ├── Compliance Chart (7d/30d/90d)
│   ├── Intake Calendar (Heatmap)
│   └── Per-Supplement Compliance
└── 🏪 Inventory
    ├── Bestand pro Supplement
    ├── Low-Stock Alerts
    └── Nachbestell-Reminder
```

### Today View (Primary UX)
```
┌─────────────────────────────────────┐
│ 💊 Supplements         Di 23. Feb   │
│ Compliance: 0/8 heute               │
│ ████████░░░░░░░░░░░░░ 0%           │
├─────────────────────────────────────┤
│                                     │
│ ☀️ MORGENS (07:00, mit Frühstück)   │
│ ┌─────────────────────────────────┐ │
│ │ 🟡 Vitamin D3 · 5000 IU    [✓] │ │
│ │    "Mit Fett einnehmen"     [✕] │ │
│ │    Evidence: A ★★★★★            │ │
│ ├─────────────────────────────────┤ │
│ │ 🟡 Omega-3 · 2g            [✓] │ │
│ │    "Mit Mahlzeit"           [✕] │ │
│ │    Evidence: A ★★★★            │ │
│ ├─────────────────────────────────┤ │
│ │ 🟡 Multivitamin · 1 Kapsel [✓] │ │
│ │    "Mit Mahlzeit"           [✕] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🏋️ PRE-WORKOUT (16:00)             │
│ ┌─────────────────────────────────┐ │
│ │ 🟡 Creatine · 5g           [✓] │ │
│ │    "Jederzeit, täglich"     [✕] │ │
│ │    Evidence: S ★★★★★            │ │
│ ├─────────────────────────────────┤ │
│ │ 🟡 Caffeine · 200mg        [✓] │ │
│ │    "30min Pre-Workout"      [✕] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🌙 ABENDS (21:00, vor Schlaf)      │
│ ┌─────────────────────────────────┐ │
│ │ 🟡 Magnesium · 400mg       [✓] │ │
│ │    "Abends, fördert Schlaf" [✕] │ │
│ ├─────────────────────────────────┤ │
│ │ 🟡 ZMA · 1 Kapsel          [✓] │ │
│ │    "Nüchtern oder mit wenig"[✕] │ │
│ │    ⚠️ Nicht mit Calcium!        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⚠️ INTERACTIONS                     │
│ Calcium + Iron: 2h Abstand halten!  │
│ Vitamin C + Iron: zusammen ✅        │
└─────────────────────────────────────┘
```

---

## 7. Milestones

### M1: Foundation (DB + API + Basic UI)
**Goal:** Supplement DB, Stacks, basic intake logging
**Tasks:**
- [ ] Migration 008: supplements, user_stacks, stack_items, intake_logs, supplement_interactions, user_inventory
- [ ] Seed: 50+ kuratierte Supplements mit Evidence Grades
- [ ] Seed: 30+ Interaction Rules
- [ ] API: Supplement search, CRUD stacks/items, intake logging
- [ ] UI: Today View (intake list with ✓/✕)
- [ ] UI: My Stack View (CRUD)
- [ ] UI: Add Supplement (search + manual)
- [ ] i18n: DE/EN/TH keys
- [ ] Navigation: 💊 Tab in Bottom Nav (replace Training or add 6th)

### M2: Timing & Interactions
**Goal:** Smart timing, interaction warnings
- [ ] API: Timing Optimizer (reads meal schedule from nutrition settings)
- [ ] API: Interaction Checker (active stack → all warnings)
- [ ] UI: Today View grouped by time slots (Morning/Pre-WO/Evening)
- [ ] UI: Interaction warnings inline + dedicated panel
- [ ] UI: Absorption hints per supplement
- [ ] Seed: Timing rules for all 50+ supplements

### M3: Intelligence
**Goal:** Gap Analysis, Redundancy, Cost, Evidence
- [ ] API: Gap Analysis (reads nutrition micro totals → compares to RDA → identifies gaps)
- [ ] API: Redundancy Detection (ingredient overlap across stack items)
- [ ] API: Cost calculation
- [ ] UI: Insights View (Gap, Redundancy, Cost, Evidence)
- [ ] UI: Evidence Grade badges on all supplements
- [ ] UI: "You're missing Vitamin D" suggestions

### M4: Inventory & History
**Goal:** Bestand-Tracking, Compliance-Visualisierung
- [ ] API: Inventory CRUD, Low-stock calculation
- [ ] UI: Inventory View
- [ ] UI: History/Compliance charts (7d/30d/90d)
- [ ] UI: Intake Calendar Heatmap
- [ ] Stack Templates (5+ vordefinierte)

### M5: Enhanced Mode (PEDs) — Privacy-First
**Goal:** Compound tracking, injection rotation, health monitoring
- [ ] Local-only storage architecture
- [ ] Enhanced Substances DB (shipped offline, ~200 compounds)
- [ ] Cycle Planner UI
- [ ] Blood Level Calculator
- [ ] Injection Site Tracker (Body Map)
- [ ] Health Monitoring Dashboard
- [ ] PCT Planner

### M6: Cross-Module Integration
**Goal:** Training-aware stacks, Bloodwork effectiveness
- [ ] Training-Aware Stack adjustments (Rest Day vs Training Day)
- [ ] Bloodwork Effectiveness Tracking (Medical Module)
- [ ] Barcode Scanner
- [ ] Pre-Workout Context on Home (Nutrition Module integration)

---

## 8. Tom's Decisions (2026-02-23)

1. **Navigation:** ✅ Supplements als 6. Bottom Tab
2. **Enhanced Mode:** ✅ Einbauen als Toggle in Settings (on/off), von Anfang an
3. **Supplement DB:** ✅ Eigene kuratierte DB verwenden (aus Evidence-Tiers Research)
4. **Inventory:** ✅ Vorsehen, als TODO markieren, später bauen
5. **Reminders:** ✅ Einnahmeliste im Diary reicht, keine Push Notifications nötig
6. **Kosten-Tracking:** ✅ Durchschnittspreise, später B2B-Supplements mit echten Preisen
7. **Diary Integration:** ✅ Supplements IN Diary integrieren (zwischen Mahlzeiten, zeitlich sortiert)
8. **Privacy:** ✅ Alles Supabase (auch Enhanced) — kein Local-Only

---

## 9. Technical Notes

- **API Port:** 5300 (Nutrition=5100, Training=5200, Supplements=5300)
- **Vite Proxy:** `/api/supplements` → `localhost:5300`
- **DB:** Shared Postgres (same as nutrition/training)
- **i18n:** Same pattern as nutrition (src/i18n/translations/)
- **Hooks:** TanStack Query + custom hooks (same pattern as nutrition)
- **Components:** `src/modules/supplements/components/`
- **Cross-Module:** Reads from nutrition summary API for gap analysis
