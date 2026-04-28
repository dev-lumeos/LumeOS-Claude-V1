# Supplements Module — Frontend Components
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Verzeichnisstruktur

```
apps/app/
├── app/(app)/supplements/
│   ├── page.tsx                  Hauptseite (5-Tab Layout)
│   └── catalog/[id]/page.tsx     Supplement-Detail
│
└── modules/supplements/
    ├── components/
    ├── hooks/
    ├── stores/
    ├── types/
    └── data/
```

---

## Pages

### `supplements/page.tsx` — Hauptseite

5 Tabs:

| Tab | Component | Icon | Beschreibung |
|---|---|---|---|
| Heute | `TodayView` | 📋 | Tägliche Einnahme-Liste |
| Stack | `StackView` | 🗂️ | Aktiver Stack + alle Stacks |
| Catalog | `CatalogView` | 🔬 | Supplement-Suche + Detail |
| Insights | `InsightsView` | 💡 | Gap Analysis, Redundanz, Kosten |
| Inventory | `InventoryView` | 📦 | Bestand-Tracking |

**Enhanced Mode:** Wenn aktiviert, erscheint ein 6. Tab "Enhanced" mit separater Sektion.

---

## Components

### Core Views (5)

| Component | Beschreibung |
|---|---|
| `TodayView` | Intake-Liste nach Timing-Slots, Compliance-Balken, 1-Tap Logging |
| `StackView` | Aktiver Stack + Stack-Liste + Aktivierungs-Flow + Training-Aware Empfehlungen |
| `CatalogView` | Suche mit Evidence-Filter, Kategorie-Chips, Ergebnis-Liste |
| `InsightsView` | Gap Analysis, Redundancy Detection, Cost Overview, Effectiveness |
| `InventoryView` | Bestand-Liste mit Low-Stock Alerts + Update-Funktion |

---

### Today / Intake Components (7)

| Component | Beschreibung |
|---|---|
| `IntakeSlot` | Timing-Slot Container (Morgens, Pre-Workout, Abends...) |
| `IntakeItem` | Einzelnes Supplement mit Status, [✓ Nehmen] Button |
| `ComplianceBar` | Tages-Compliance Fortschrittsbalken mit % |
| `TrainingStackBanner` | "Heute: Leg Day" Banner mit Pre/Post-Workout Empfehlungen |
| `InteractionAlert` | Alert-Banner für aktive Interactions (critical = rot, warning = orange) |
| `SkipModal` | Überspringen-Dialog mit optionaler Begründung |
| `DailyIntakeSummary` | Zusammenfassung: X von Y genommen, Compliance %, Score |

---

### Stack Components (8)

| Component | Beschreibung |
|---|---|
| `ActiveStackCard` | Prominente Karte für aktiven Stack: Name, Ziel, Item-Anzahl, Kosten |
| `StackList` | Liste aller Stacks (My / Coach / Marketplace / Template) |
| `StackCard` | Stack-Karte: Name, Goal-Badge, Item-Anzahl, is_active Markierung |
| `StackDetail` | Stack-Detail: Items-Liste mit Edit-Optionen |
| `StackItemRow` | Einzelnes Item: Name, Dosis, Timing, Frequency, Edit/Delete |
| `StackItemForm` | Formular: Supplement suchen, Dosis/Timing konfigurieren |
| `StackActivateModal` | Aktivierungs-Bestätigung mit Interaction-Check-Ergebnis |
| `TemplateSelector` | Template-Auswahl für neuen Stack (Goal-Based) |

---

### Catalog Components (6)

| Component | Beschreibung |
|---|---|
| `CatalogSearch` | Suchfeld mit Debounce + Kategorie-Chips + Evidence-Filter |
| `CatalogFilters` | Filter-Panel: Kategorie, Evidence Grade, Goal, Timing |
| `CatalogList` | Ergebnis-Liste sortiert nach Evidence (S oben) |
| `CatalogCard` | Karte: Name, Evidence-Badge, Kategorie, Timing-Hint, "+" Button |
| `SupplementDetail` | Vollansicht: Evidence, Dosierung, Absorption, Interactions, Gap-Info |
| `EvidenceBadge` | Badge mit Grade (S=dunkelgrün, A=grün, B=gelb, C=orange, D=grau, F=rot) |

---

### Interaction Components (3)

| Component | Beschreibung |
|---|---|
| `InteractionChecker` | Real-time Interaction-Prüfung beim Hinzufügen |
| `InteractionList` | Liste aller Interactions im Stack (critical oben) |
| `InteractionCard` | Einzelne Interaction: Typ-Icon, Severity-Farbe, Beschreibung, Empfehlung |

---

### Insights Components (6)

| Component | Beschreibung |
|---|---|
| `GapAnalysisView` | Mikronährstoff-Lücken-Liste (rot=gap, grün=ok, Badge=Stack deckt ab) |
| `GapRow` | Einzelne Lücke: Nährstoff, aktuelle %, RDA, Stack-Status, Suggest-Button |
| `RedundancyView` | Überschneidungs-Liste mit Einsparpotential |
| `CostOverview` | Monatliche Kosten: Total + Aufschlüsselung nach Evidence-Grade |
| `TimingOptimizer` | Empfohlener Tages-Ablauf mit Meal-Timing |
| `EffectivenessTracker` | Supplement-Log vs. Biomarker-Verlauf (Medical Integration) |

---

### Inventory Components (4)

| Component | Beschreibung |
|---|---|
| `InventoryList` | Bestand-Liste sortiert nach Restlaufzeit (kritisch oben) |
| `InventoryCard` | Produkt: Name, Restbestand, Tage-Anzeige, Ablauf-Datum |
| `LowStockBadge` | Visueller Indikator (rot <7 Tage, orange <14 Tage) |
| `StockUpdateModal` | Neuen Bestand nach Nachbestellung eingeben |

---

### Enhanced Components (4 — nur bei active enhanced_mode)

| Component | Beschreibung |
|---|---|
| `EnhancedGate` | Opt-In Modal mit Warnung + Age-Verification |
| `EnhancedCatalog` | Catalog für Enhanced Substances (getrennte Sektion) |
| `EnhancedStackSection` | Separater Abschnitt in StackView für Enhanced Items |
| `BloodworkPanel` | Pflicht-Marker-Liste mit Status (Pre/Mid/Post Cycle) |

---

## Custom Hooks (18)

### Catalog

| Hook | Beschreibung |
|---|---|
| `useCatalogSearch(query, filters)` | Debounced Suche mit Kategorie/Evidence Filter |
| `useSupplementDetail(id)` | Detail + Stack-Interactions + Nutrition Gap für dieses Supplement |
| `useEnhancedCatalog(query, category)` | Enhanced Substances Suche (nur wenn mode aktiv) |

### Stack Management

| Hook | Beschreibung |
|---|---|
| `useStacks()` | Alle Stacks des Users |
| `useActiveStack()` | Aktiver Stack mit Items |
| `useStackDetail(id)` | Stack mit Items + Interaction-Status |
| `useStackActions()` | create, activate, update, delete |
| `useStackItemActions()` | add, update, delete, reorder |
| `useInteractionCheck(stackId?)` | Interaction-Checker für Stack oder Supplement-Set |

### Intake & Tracking

| Hook | Beschreibung |
|---|---|
| `useTodayIntake()` | Heutige Intake-Logs gruppiert nach Timing-Slots |
| `useIntakeActions()` | taken, skipped, snoozed setzen |
| `useIntakeCompliance(days?)` | Compliance-History + Trend |
| `useTrainingAwareStack()` | Training-Kontext + Empfehlungen für heute |

### Intelligence

| Hook | Beschreibung |
|---|---|
| `useGapAnalysis(days?)` | Nutrition Gap Analysis |
| `useRedundancies()` | Stack Redundanzen |
| `useCostBreakdown()` | Monatliche Kosten |
| `useTimingOptimizer()` | Meal-based + Training-Aware Timing |

### Inventory

| Hook | Beschreibung |
|---|---|
| `useInventory()` | Bestand-Liste mit Low-Stock Status |
| `useInventoryActions()` | create, update (Bestand auffüllen) |

---

## Zustand Stores (2)

### `stores/supplementsUIStore.ts`

```typescript
interface SupplementsUIStore {
  activeTab:       'today'|'stack'|'catalog'|'insights'|'inventory'|'enhanced';
  enhancedMode:    boolean;
  selectedStackId: string | null;

  setActiveTab:     (tab: SupplementsUIStore['activeTab']) => void;
  setEnhancedMode:  (mode: boolean) => void;
  setSelectedStack: (id: string | null) => void;
}
```

### `stores/intakeStore.ts`

```typescript
interface IntakeStore {
  today:          string;               // YYYY-MM-DD
  pendingOptimistic: Record<string, IntakeStatus>; // stack_item_id → optimistic status

  setOptimisticStatus: (itemId: string, status: IntakeStatus) => void;
  clearOptimistic:     () => void;
}
```

---

## Types

```
modules/supplements/types/
├── supplement.ts    Supplement, EvidenceGrade, SupplementCategory
├── enhanced.ts      EnhancedSubstance, EnhancedCategory
├── stack.ts         UserStack, StackItem, StackSource
├── intake.ts        IntakeLog, IntakeStatus, TodayIntake
├── interaction.ts   SupplementInteraction, InteractionType, InteractionSeverity
├── inventory.ts     UserInventory, StockStatus
├── intelligence.ts  GapResult, RedundancyResult, CostBreakdown, TimingSlot
├── scoring.ts       SupplementScore, InteractionRisk, GapScore
└── api.ts           ApiResponse<T>, Paginated<T>
```

---

## Statische Daten

### `data/evidenceDetails.ts`

```typescript
export const EVIDENCE_GRADE_INFO = {
  S: {
    label: 'Stark (S)',
    label_en: 'Strong Evidence',
    description: 'Mehrere Meta-Analysen und RCTs mit konsistenten Ergebnissen',
    color: '#16a34a',  // dark green
    star_count: 5,
  },
  A: { label: 'Gut (A)', star_count: 4, color: '#22c55e' },
  B: { label: 'Moderat (B)', star_count: 3, color: '#eab308' },
  C: { label: 'Begrenzt (C)', star_count: 2, color: '#f97316' },
  D: { label: 'Schwach (D)', star_count: 1, color: '#94a3b8' },
  F: { label: 'Widerlegt (F)', star_count: 0, color: '#ef4444' },
};
```

### `data/timingLabels.ts`

```typescript
export const TIMING_LABELS = {
  morning:      { de: 'Morgens',         en: 'Morning',       icon: '🌅' },
  midday:       { de: 'Mittags',         en: 'Midday',        icon: '☀️' },
  evening:      { de: 'Abends',          en: 'Evening',       icon: '🌆' },
  pre_workout:  { de: 'Pre-Workout',     en: 'Pre-Workout',   icon: '💪' },
  post_workout: { de: 'Post-Workout',    en: 'Post-Workout',  icon: '🏋️' },
  bedtime:      { de: 'Vor dem Schlafen',en: 'Bedtime',       icon: '🌙' },
};
```

---

## i18n — 350+ Keys

```
Namespace: 'supplements'

supplements.today.title              = "Heute"
supplements.today.compliance         = "{taken} von {total} genommen ({pct}%)"
supplements.today.all_taken          = "Alle Supplements für heute erledigt ✅"
supplements.intake.take              = "Nehmen"
supplements.intake.skip              = "Überspringen"
supplements.intake.snooze            = "Später"
supplements.stack.active             = "Aktiver Stack"
supplements.stack.activate           = "Stack aktivieren"
supplements.stack.no_active          = "Kein Stack aktiv"
supplements.catalog.evidence_grade   = "Evidenz: {grade}"
supplements.catalog.search_placeholder = "Supplement suchen..."
supplements.catalog.add_to_stack     = "Zum Stack hinzufügen"
supplements.interaction.critical     = "⚠️ Kritisch: Einnahme gesperrt"
supplements.interaction.warning      = "Warnung: {desc}"
supplements.interaction.synergy      = "✅ Synergie: {desc}"
supplements.insights.gap_title       = "Nährstoff-Lücken"
supplements.insights.covered_by_stack = "✅ Durch Stack abgedeckt"
supplements.insights.not_covered     = "⚠️ Nicht im Stack"
supplements.insights.cost_monthly    = "Monatliche Kosten: {amount}"
supplements.inventory.days_left      = "ca. {days} Tage"
supplements.inventory.low_stock      = "⚠️ Niedrig"
supplements.enhanced.warning_title   = "Enhanced Mode — Wichtiger Hinweis"
supplements.enhanced.activate_btn    = "Verstanden, Enhanced Mode aktivieren"
```

---

## Shared Contracts

```
packages/contracts/src/supplements/
  supplement.ts      Supplement, EvidenceGrade
  enhanced.ts        EnhancedSubstance
  stack.ts           UserStack, StackItem
  intake.ts          IntakeLog, TodayIntake
  interaction.ts     SupplementInteraction
  inventory.ts       UserInventory
  intelligence.ts    GapResult, CostBreakdown
  scoring.ts         SupplementScore
  for-ai.ts          SupplementBuddyContext
  for-goals.ts       SupplementGoalsContribution
```
