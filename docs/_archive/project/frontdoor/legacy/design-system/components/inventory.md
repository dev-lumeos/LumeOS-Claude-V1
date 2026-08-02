# LUMEOS Component Inventory
_Extracted 2026-04-27 from 534 TSX files across apps/app + src/_

---

## 1. Shared Primitives — `@lumeos/ui` (`packages/ui/src/`)

Custom design-system package. **No shadcn/ui. No Radix.** Pure Tailwind + React.

| Component | File | Variants / Props | Theme |
|-----------|------|-----------------|-------|
| `Button` | `button.tsx` | variant: primary/secondary/ghost/danger · size: sm/md/lg · loading: boolean | Dark (zinc) |
| `Card` | `card.tsx` | padding: sm/md/lg | Dark (zinc-900 bg, zinc-800 border) |
| `Input` | `input.tsx` | label, error, all native input props | Dark (zinc-900 bg) |
| `Modal` | `modal.tsx` | open, onClose, title, children · ESC closes | Dark overlay |
| `Badge` | `badge.tsx` | variant: default/success/warning/danger/info | Semantic colors |
| `Spinner` | `spinner.tsx` | size: sm/md/lg | brand-500 spin |

> **Note:** These primitives use a **dark zinc theme** (zinc-900 bg, zinc-700/800 borders) distinct from the light-gray theme used in the module UI.

---

## 2. App Layout Components — `apps/app/components/`

### Layout (`components/layout/`)
| Component | Description |
|-----------|-------------|
| `Sidebar` | Desktop nav (w-64). 10 module links + 3 external port links + user panel. Active state: `bg-green-50 text-green-700` + `::before` left bar indicator |
| `mobile-header` | Mobile top navigation header |

### Buddy (`components/buddy/`)
| Component | Description |
|-----------|-------------|
| `ActionCard` | AI Buddy chat card — `from-blue-50 to-indigo-50` gradient, 3 action button variants. Max-width 75% (chat bubble layout) |
| `BuddyChat` | Full chat interface wrapper |
| `ActionCard.example` | Usage example (dev reference) |

### Settings (`components/settings/`)
| Component | Description |
|-----------|-------------|
| `ModuleTogglePanel` | Full module enable/disable panel |
| `SimpleModuleToggle` | Compact toggle for single module |

### UI Primitives (`components/ui/`)
| Component | File | Key Props |
|-----------|------|-----------|
| `ModuleHeader` | `ModuleHeader.tsx` | icon, title, description, gradient (Tailwind class string), kpis[], actions |
| `ResponsiveTabNav` | `ResponsiveTabNav.tsx` | tabs[], activeTab, onTabChange, accentColor: green/blue/orange/purple/teal |
| `toast` | `toast.tsx` | Toast notification system |

---

## 3. Module Components

### 3.1 Nutrition (~73 files)
| Component | Description |
|-----------|-------------|
| `SmartSuggestions` | AI food suggestions — "same as yesterday", quick-add |
| `NutrientHeatmap` | Visual heatmap of nutrient coverage over time |
| `PreWorkoutOptimizer` | Pre-workout meal timing/macro optimizer |
| `FoodSearch` + `FoodSearchModal` | Food search with smart SQL + USDA integration |
| `MealCard` | Single meal display card |
| `DiaryView` | Full diary tab layout |
| `MacroProgressBar` | Protein/fat/carb progress bars (colored: blue/yellow/orange) |
| `WaterTracker` | Daily water intake tracking |
| `WeightTracker` | Body weight log |
| `GoalSelector` / `GoalSetupDialog` / `MacroCyclingConfig` | Goal configuration flow |
| `DiaryTabView` | Tabbed nutrition diary (tabs: diary/insights/goals/heatmap) |

### 3.2 Training (~81 files)
| Component | Description |
|-----------|-------------|
| `TrainingView` | Root tab view (calendar/history/schedule/live/routines) |
| `CalendarView` | Training calendar grid |
| `LiveWorkout` | Active workout tracker — fullscreen/overlay |
| `RoutineList` | Saved workout routines |
| `ExerciseCard` | Single exercise with sets/reps/weight |
| `ProgressionChart` | Strength progression over time |
| `DeloadSuggestion` | AI-powered deload recommendation widget |
| `PeriodizationView` | Training periodization planner |

### 3.3 Coach / AI Buddy (~41 files)
| Component | Description |
|-----------|-------------|
| `CoachBuddy` | Root AI buddy component |
| `BuddyAvatar` | Animated avatar for AI coach |
| `BuddyCommandCenter` | Command palette for buddy actions |
| `BuddyDecisionFeed` | Timeline feed of AI decisions |
| `BuddyFloatingWidget` | Floating action button / mini chat |
| `BuddyMemory` | Memory display panel |
| `ChatInterface` | Full chat UI with message bubbles |
| `ActionConfirmCard` | Confirmation card for buddy actions |

### 3.4 Goals (~39 files)
| Component | Description |
|-----------|-------------|
| `GoalForm` | Goal creation/editing form |
| `BodyCompositionView` | Body composition tracking |
| `TrendCharts` | Goal trend visualization |
| `GoalAlignmentCard` | Cross-module goal alignment widget |
| `GoalProgressBanner` | Full-width progress banner |
| `GoalStreakWidget` | Streak counter widget |
| `TodayActionPlan` | Today's goal-aligned action plan |
| `WeeklyReport` | Weekly goal progress report |

### 3.5 Supplements (~25 files)
| Component | Description |
|-----------|-------------|
| `SupplementsView` | Root view — tabs: today/stack/enhanced |
| `SupplementTodayView` | Daily supplement checklist |
| `SupplementStackView` | Stack builder/viewer |

### 3.6 Recovery (~16 files)
| Component | Description |
|-----------|-------------|
| `RecoveryView` | Root recovery module |
| `SleepTracker` | Sleep quality tracking |
| `HRVDisplay` | HRV data visualization |
| `RecoveryScore` | Composite recovery score card |

### 3.7 Dashboard (~11 files)
| Component | Description |
|-----------|-------------|
| `DashboardView` | Main dashboard with grid layout |
| `MorningBriefing` | AI morning brief card |
| `HealthMomentum` | Rolling health momentum indicator |
| `PredictiveInsights` | Predictive health insights |
| `QuickWins` | Today's recommended quick wins |
| `CrossModuleCorrelations` | Cross-module data correlations |

### 3.8–3.13 Further Modules
| Module | Files | Notes |
|--------|-------|-------|
| Human Coach | ~13 | Coach portal client-facing side |
| Medical | ~11 | `from-rose-500 to-pink-500` gradient |
| Marketplace | ~10 | — |
| Intelligence | ~7 | Cross-module correlation engine UI |
| Onboarding | ~10 | Multi-step onboarding flow |
| Habits | ~6 | Habit chain tracking |

---

## 4. Icon Library

**`lucide-react`** — used in 14+ files. Most-used icons:
- Navigation: `ChevronRight`, `ChevronLeft`, `ChevronDown`
- Actions: `Plus`, `X`, `Check`, `Edit`, `Trash2`
- Content: `Search`, `Calendar`, `Clock`, `Target`
- Status: `TrendingUp`, `TrendingDown`, `AlertCircle`, `CheckCircle`
- Modules: `Dumbbell`, `Apple`, `Brain`, `Heart`

**Inline emoji** also heavily used (📊🎯🍽️🏋️💊😴🧠🤖) — especially in navigation and ModuleHeader.

> **Issue:** No unified strategy — decision needed for V2. Recommendation: Emoji for nav/headers, lucide for inline UI actions.

---

## 5. shadcn/ui Usage

**Not used.** LUMEOS does not use shadcn/ui or Radix UI component primitives.

- **`@lumeos/ui`** custom package replaces shadcn primitive layer
- `lucide-react` for icons (only shared dependency with shadcn ecosystem)
- 14 files use `@radix-ui/*` directly — custom implementations, not shadcn wrappers

---

## 6. Component Counts by Module

| Module | TSX Files | Primary Location |
|--------|-----------|-----------------|
| Nutrition | ~73 | apps/app/modules/nutrition |
| Training | ~81 | apps/app/modules/training |
| Coach | ~41 | apps/app/modules/coach |
| Goals | ~39 | apps/app/modules/goals + src |
| Supplements | ~25 | apps/app/modules/supplements |
| Recovery | ~16 | apps/app/modules/recovery |
| Dashboard | ~11 | apps/app/modules/dashboard |
| Human-coach | ~13 | apps/app/modules/human-coach |
| Medical | ~11 | apps/app/modules/medical |
| Marketplace | ~10 | apps/app/modules/marketplace |
| Intelligence | ~7 | apps/app/modules/intelligence |
| Onboarding | ~10 | apps/app/modules/onboarding |
| Habits | ~6 | apps/app/modules/habits |
| **Total** | **~534** | |
