# Goals Module — Frontend Components

## Pages + Tabs

| Page | Route | Tabs |
|---|---|---|
| `page.tsx` | `/goals` | Dashboard · Body Comp · Fotos · Phasen · Insights |

---

## Dashboard Components (7)

| Component | Beschreibung |
|---|---|
| `GoalsDashboard` | Haupt-Dashboard: Primary Goal + Contributions + Quick Actions |
| `PrimaryGoalCard` | Großes Goal-Card: Progress Ring, Titel, Phase, Deadline |
| `GoalProgressRing` | Animierter SVG-Ring (0–100%) mit Farbgradient |
| `ModuleContributionGrid` | 5 Module als Grid: Score + Trend-Pfeil + Mini-Chart |
| `BottleneckAlert` | "Dein Schlaf limitiert aktuell am meisten" Banner |
| `PredictionCard` | "78% Chance — Ziel in 26 Wochen" + Scenario-Tipps |
| `WeeklySummaryCard` | Top Win + Bottleneck + Nächste-Woche-Focus |

---

## Phase Management Components (5)

| Component | Beschreibung |
|---|---|
| `PhaseManager` | Aktuelle Phase + Transition-Button |
| `PhaseCard` | Phase-Details: Kalorien, Protein, Rate, Fortschritt |
| `PhaseTransitionModal` | "Phase wechseln?" Bestätigung mit Optionen |
| `PhaseTimeline` | Visuelle Timeline aller bisherigen + geplanter Phasen |
| `TDEECard` | Adaptive TDEE: Formula vs. Adaptive + Trend |

---

## Body Composition Components (8)

| Component | Beschreibung |
|---|---|
| `BodyCompositionView` | Overview: Gewicht, KF%, Muskelmasse, FFMI + Trends |
| `MeasurementEntry` | Neue Körperkompositions-Messung eingeben |
| `CircumferenceEntry` | 13 Umfänge eingeben (L/R getrennt) |
| `TrendCharts` | Linien-Charts: Gewicht / KF% / Muskelmasse über Zeit |
| `RatiosCard` | V-Taper, Schulter-Taille, Symmetrie (mit Golden Ratio Visualisierung) |
| `WeightMovingAverage` | 7-Tage Moving Average Chart (tägliche + geglättete Linie) |
| `FFMICard` | FFMI mit natürlichem Max (18–25 / Elite 25+) |
| `GoalProgressBars` | Progress-Bars für alle gesetzten Zielwerte |

---

## Visual AI / Photo Components (8)

| Component | Beschreibung |
|---|---|
| `PhotoSessionView` | Photo-Session: Posen-Set wählen, Fotos aufnehmen |
| `PoseGuide` | Silhouetten-Overlay auf Kamera + Schritt-für-Schritt Anweisung |
| `PoseSelector` | 3 Sets: Mandatory 8 / Quarter Turns / Detail Close-Ups |
| `PhotoTimer` | Countdown 3/5/10s + Kamera-Button |
| `PhotoReviewCard` | "Nochmal" / "Weiter" nach Aufnahme |
| `PhotoGallery` | Grid aller Fotos (filter: Pose, Datum, Muskelgruppe) |
| `PhotoCompare` | Side-by-Side Vergleich (2 Daten wählbar) |
| `PhotoSlider` | Vorher/Nachher Slider mit Datum-Auswahl |

---

## Goal Management Components (5)

| Component | Beschreibung |
|---|---|
| `GoalList` | Alle Ziele (aktive / pausierte / erreichte) |
| `GoalCard` | Einzelnes Ziel: Typ, Wert, Deadline, Progress |
| `GoalCreator` | Neues Ziel erstellen (Onboarding-Flow + Quick Create) |
| `MilestoneList` | Milestones mit Celebration-Konfetti |
| `MilestoneCelebration` | Animation + Celebration-Message bei Milestone |

---

## Insights Components (5)

| Component | Beschreibung |
|---|---|
| `InsightsView` | Cross-Module Korrelationen + Weekly Report |
| `CrossModuleCorrelations` | Korrelationsmatrix: Modul-Adherence ↔ Goal Progress |
| `WeeklyReport` | Wöchentlicher Report: Wins, Bottleneck, Empfehlungen |
| `PredictionTimeline` | Visuelle Projektions-Timeline bis Goal-Achievement |
| `ScenarioModeler` | "Was wenn ich X verändere?" interaktiv |

---

## Custom Hooks (18)

| Hook | Beschreibung |
|---|---|
| `useGoals(status?)` | Alle Ziele |
| `usePrimaryGoal()` | Primary Goal |
| `useGoalDetail(id)` | Ziel + Milestones + History |
| `useGoalActions()` | create, update, achieve, pause |
| `useActivePhase()` | Aktuelle Phase |
| `usePhaseActions()` | startPhase, transitionPhase |
| `useTDEE()` | Adaptive TDEE + Settings |
| `useTDEEActions()` | recalculate, override |
| `useGoalProgress(id)` | Cross-Module Progress |
| `useBottleneck()` | Welches Modul limitiert |
| `useContributions(goalId, days)` | Contribution History |
| `usePredictions(goalId)` | Achievement Probability |
| `useMilestones(goalId)` | Milestones |
| `useBodyMeasurements(days)` | Körperkomposition History |
| `useBodyCircumferences(days)` | Umfänge History |
| `useBodyRatios()` | V-Taper, Symmetrie, etc. |
| `useProgressPhotos(filter)` | Fotos + Filter |
| `useWeeklyReport()` | Aktueller Wochenbericht |

---

## Stores (2)

| Store | State | Actions |
|---|---|---|
| `goalsUIStore` | activeTab, selectedGoalId, photoSessionActive, poseStep | setActiveTab, selectGoal, startPhotoSession, nextPose |
| `bodyCompStore` | draftMeasurement, draftCircumferences, measMode | setDraft, setMode, resetDraft |

---

## Shared Contracts

```
packages/contracts/src/goals/
  goal.ts           UserGoal, GoalType, GoalStatus
  phase.ts          GoalPhase, PhaseType, PhaseParameters
  tdee.ts           TDEESettings, Adjustment
  contribution.ts   GoalContribution, ContributionModule
  milestone.ts      GoalMilestone
  measurement.ts    BodyMeasurement, BodyCircumference
  photo.ts          ProgressPhoto, PoseType
  progress.ts       GoalProgress, ModuleContribution, BottleneckInfo
  prediction.ts     GoalPrediction, Scenario
  for-ai.ts         GoalsBuddyContext
  for-coach.ts      GoalsCoachContext
  targets-today.ts  TodaysTargets
```
