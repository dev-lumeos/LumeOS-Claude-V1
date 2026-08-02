# Supplements Module — Frontend Components

## Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/supplements` | 5-Tab + optionaler Enhanced Tab |

## Tabs

| Tab | Component | Beschreibung |
|---|---|---|
| Heute | `TodayView` | Intake-Liste nach Timing-Slots, Compliance-Balken |
| Stack | `StackView` | Aktiver Stack + alle Stacks |
| Catalog | `CatalogView` | Supplement-Suche mit Evidence-Filter |
| Insights | `InsightsView` | Gap Analysis, Redundanz, Kosten |
| Inventory | `InventoryView` | Bestand-Tracking mit Low-Stock Alerts |
| Enhanced | `EnhancedView` | Nur wenn enhanced_mode aktiv |

---

## Today / Intake (7)

| Component | Beschreibung |
|---|---|
| `IntakeSlot` | Timing-Slot Container (Morgens, Pre-Workout...) |
| `IntakeItem` | Supplement mit Status + [✓ Nehmen] Button |
| `ComplianceBar` | Fortschrittsbalken mit % |
| `TrainingStackBanner` | "Heute: Leg Day" + Pre/Post Empfehlungen |
| `InteractionAlert` | critical=rot / warning=orange Banner |
| `SkipModal` | Überspringen mit optionaler Begründung |
| `DailyIntakeSummary` | X von Y genommen, Score |

---

## Stack (8)

| Component | Beschreibung |
|---|---|
| `ActiveStackCard` | Aktiver Stack: Name, Ziel, Items, Kosten |
| `StackList` | My / Coach / Marketplace / Template |
| `StackCard` | Name, Goal-Badge, Items, is_active |
| `StackDetail` | Items-Liste mit Edit |
| `StackItemRow` | Name, Dosis, Timing, Frequenz |
| `StackItemForm` | Supplement suchen, Dosis/Timing |
| `StackActivateModal` | Bestätigung + Interaction-Check Ergebnis |
| `TemplateSelector` | Goal-Based Template Auswahl |

---

## Catalog (6)

| Component | Beschreibung |
|---|---|
| `CatalogSearch` | Suchfeld + Kategorie-Chips + Evidence-Filter |
| `CatalogFilters` | Kategorie, Evidence, Goal, Timing |
| `CatalogList` | Sortiert nach Evidence (S oben) |
| `CatalogCard` | Name, Evidence-Badge, Kategorie, + Button |
| `SupplementDetail` | Evidence, Dosierung, Absorption, Interactions, Gap-Info |
| `EvidenceBadge` | S=dunkelgrün / A=grün / B=gelb / C=orange / D=grau / F=rot |

---

## Interactions (3)

| Component | Beschreibung |
|---|---|
| `InteractionChecker` | Real-time Check beim Hinzufügen |
| `InteractionList` | Alle Interactions (critical oben) |
| `InteractionCard` | Typ-Icon, Severity-Farbe, Empfehlung |

---

## Insights (6)

| Component | Beschreibung |
|---|---|
| `GapAnalysisView` | Nährstoff-Lücken (rot=gap, grün=ok) |
| `GapRow` | Nährstoff, %, RDA, Stack-Status, Suggest |
| `RedundancyView` | Überschneidungen mit Einsparpotential |
| `CostOverview` | Total + nach Evidence Grade |
| `TimingOptimizer` | Empfohlener Tagesablauf |
| `EffectivenessTracker` | Supplement-Log vs. Biomarker-Verlauf |

---

## Inventory (4)

| Component | Beschreibung |
|---|---|
| `InventoryList` | Sortiert nach Restlaufzeit |
| `InventoryCard` | Produkt, Bestand, Tage, Ablauf |
| `LowStockBadge` | rot <7d / orange <14d |
| `StockUpdateModal` | Neuen Bestand eingeben |

---

## Enhanced (4 — nur wenn active)

| Component | Beschreibung |
|---|---|
| `EnhancedGate` | Opt-In Modal + Age Verification |
| `EnhancedCatalog` | Getrennte Catalog-Sektion |
| `EnhancedStackSection` | Enhanced Items in StackView |
| `BloodworkPanel` | Pflicht-Marker Pre/Mid/Post Cycle |

---

## Custom Hooks (18)

| Hook | Beschreibung |
|---|---|
| `useCatalogSearch(query, filters)` | Debounced Suche |
| `useSupplementDetail(id)` | Detail + Stack-Interactions + Gap |
| `useEnhancedCatalog(query, category)` | Enhanced Suche |
| `useStacks()` | Alle Stacks |
| `useActiveStack()` | Aktiver Stack mit Items |
| `useStackDetail(id)` | Stack + Items + Interaction-Status |
| `useStackActions()` | create, activate, update, delete |
| `useStackItemActions()` | add, update, delete, reorder |
| `useInteractionCheck(stackId?)` | Interaction Checker |
| `useTodayIntake()` | Heute nach Timing-Slots |
| `useIntakeActions()` | taken / skipped / snoozed |
| `useIntakeCompliance(days?)` | Compliance-History + Trend |
| `useTrainingAwareStack()` | Training-Kontext |
| `useGapAnalysis(days?)` | Nutrition Gap |
| `useRedundancies()` | Stack Redundanzen |
| `useCostBreakdown()` | Monatliche Kosten |
| `useInventory()` | Bestand + Low-Stock |
| `useInventoryActions()` | create, update |

---

## Stores (2)

| Store | State | Actions |
|---|---|---|
| `supplementsUIStore` | activeTab, enhancedMode, selectedStackId | setActiveTab, setEnhancedMode, setSelectedStack |
| `intakeStore` | today, pendingOptimistic | setOptimisticStatus, clearOptimistic |

---

## Shared Contracts

```
packages/contracts/src/supplements/
  supplement.ts   Supplement, EvidenceGrade
  enhanced.ts     EnhancedSubstance
  stack.ts        UserStack, StackItem
  intake.ts       IntakeLog, TodayIntake
  interaction.ts  SupplementInteraction
  inventory.ts    UserInventory
  intelligence.ts GapResult, CostBreakdown
  scoring.ts      SupplementScore
  for-ai.ts       SupplementBuddyContext
  for-goals.ts    SupplementGoalsContribution
```
