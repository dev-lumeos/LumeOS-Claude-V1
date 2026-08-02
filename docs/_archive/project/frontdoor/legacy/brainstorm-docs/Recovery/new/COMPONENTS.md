# Recovery Module — Frontend Components

## Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/recovery` | 4-Tab Layout |

## Tabs

| Tab | Component | Beschreibung |
|---|---|---|
| Heute | `TodayView` | Recovery Score + Check-in Banner + Empfehlung |
| Muskeln | `MuscleMapView` | SVG Body Map + Details |
| Insights | `InsightsView` | Trends, Muster, Modality Effectiveness |
| Mehr | `MoreView` | HRV, Protokolle, Wearables |

---

## Morning Check-in (5)

| Component | Beschreibung |
|---|---|
| `CheckinBanner` | Home-Screen Banner wenn kein Check-in heute |
| `CheckinModal` | Vollständiger Check-in Flow |
| `SleepSlider` | Stunden + Qualität (Emoji-Slider) |
| `SorenessBodyMap` | react-body-highlighter, 4 Stufen per Tap |
| `MoodSelector` | 5 Emoji-Buttons |

---

## Recovery Score (5)

| Component | Beschreibung |
|---|---|
| `RecoveryScoreCard` | Prominente Score-Karte mit Farbcoding |
| `ScoreBreakdown` | Aufklappbare Komponenten |
| `ReadinessIndicator` | excellent/good/moderate/poor/rest Badge |
| `ScoreTrendChart` | 7-Tage Linien-Chart |
| `TrainingRecommendation` | "Heute ideal: Push Day" |

---

## Muscle Recovery Map (5)

| Component | Beschreibung |
|---|---|
| `MuscleRecoveryMap` | SVG anterior + posterior mit Farbcoding |
| `MuscleColorOverlay` | 🟢>80% / 🟡50–80% / 🔴<50% |
| `MuscleDetailModal` | Recovery%, letztes Training, Modifikatoren |
| `MuscleMapLegend` | Legende |
| `TrainingDaySuggestion` | "Heute: Push Day" Empfehlung |

---

## HRV (4)

| Component | Beschreibung |
|---|---|
| `HRVCard` | RMSSD + Baseline-Vergleich + Trend |
| `HRVMeasureFlow` | Phone Camera Messung (60s Countdown) |
| `HRVTrendChart` | 14-Tage Verlauf mit Baseline-Band |
| `HRVBaselineStatus` | Datenpunkte, Avg, Status |

---

## Modality (4)

| Component | Beschreibung |
|---|---|
| `ModalityQuickLog` | Quick-Buttons in TodayView |
| `ModalityLogger` | Vollständiges Formular |
| `ModalityList` | Heute geloggte Aktivitäten + Bonus |
| `ModalityEffectivenessChart` | Welche Modalität bringt am meisten |

---

## Insights (5)

| Component | Beschreibung |
|---|---|
| `RecoveryTrendChart` | 30-Tage Score-Verlauf |
| `SleepTrendChart` | Schlaf über Zeit |
| `PatternInsights` | Erkannte Muster als Cards |
| `OvertrainingRiskCard` | Aktuelles Risiko + Signale |
| `WeeklySummaryCard` | Wöchentliche Zusammenfassung |

---

## Alerts & Protocols (4)

| Component | Beschreibung |
|---|---|
| `OvertrainingAlert` | Alert-Banner mit Severity + Signalen |
| `AlertActionButtons` | "Deload starten" / "Verstanden" |
| `ProtocolCard` | Name, Dauer, Evidence Level |
| `ProtocolProgress` | X/7 Tage + heutige Tasks |

---

## Wearable (3)

| Component | Beschreibung |
|---|---|
| `WearableList` | Konfigurierbare Datenquellen |
| `WearableConnectButton` | Connect/Disconnect + letzter Sync |
| `SyncStatus` | Datenpunkte, Status |

---

## Custom Hooks (16)

| Hook | Beschreibung |
|---|---|
| `useCheckinToday()` | Heutiger Check-in |
| `useCheckinActions()` | submitCheckin |
| `useRecoveryScore(date?)` | Score + Komponenten |
| `useScoreTrend(days?)` | Trend |
| `useMuscleMap()` | Alle Muskelgruppen mit Recovery % |
| `useMuscleDetail(muscle)` | Detail einer Gruppe |
| `useHRVData(days?)` | HRV + Baseline |
| `useHRVActions()` | submitHRVMeasurement |
| `useHRVTrend()` | 30-Tage Verlauf |
| `useModalitiesToday()` | Heute + Bonus |
| `useModalityActions()` | logModality, updateNextDayEffect |
| `useModalityEffectiveness()` | Effektivitäts-Ranking |
| `useInsights(period)` | 7d/30d Muster |
| `useOvertrainingAlerts()` | Aktive Alerts |
| `useProtocols()` | Vorlagen + aktives Protokoll |
| `usePendingActions()` | Offene Actions |

---

## Stores (2)

| Store | State | Actions |
|---|---|---|
| `recoveryStore` | checkinDone, currentScore, readiness, activeTab | setCheckinDone, setScore, setActiveTab |
| `checkinStore` | draft (sleep_hours, soreness, mood etc.) | setDraftField, setSoreness, resetDraft |

---

## Shared Contracts

```
packages/contracts/src/recovery/
  checkin.ts     RecoveryCheckin
  score.ts       RecoveryScoreResult, ReadinessLevel
  muscle.ts      MuscleRecoveryResult
  hrv.ts         HRVMeasurement, HRVBaseline
  sleep.ts       SleepData
  modality.ts    RecoveryModality
  alerts.ts      OvertrainingAlert
  protocol.ts    RecoveryProtocol
  for-ai.ts      RecoveryBuddyContext
  for-goals.ts   RecoveryGoalsContribution
  readiness.ts   TrainingReadiness
```
