# Recovery Module — Frontend Components
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Verzeichnisstruktur

```
apps/app/
├── app/(app)/recovery/
│   └── page.tsx           Hauptseite (4-Tab)
│
└── modules/recovery/
    ├── components/
    ├── hooks/
    ├── stores/
    └── types/
```

---

## Pages

### `recovery/page.tsx` — Hauptseite

4 Tabs:

| Tab | Component | Icon | Beschreibung |
|---|---|---|---|
| Heute | `TodayView` | 😴 | Recovery Score + Check-in Banner + Empfehlung |
| Muskeln | `MuscleMapView` | 💪 | Muscle Recovery Map (Body SVG + Details) |
| Insights | `InsightsView` | 📊 | Trends, Muster, Modality Effectiveness |
| Mehr | `MoreView` | ⚙️ | HRV, Protokolle, Wearables, Einstellungen |

**Auto-Prompt:** Wenn kein Check-in heute → Check-in Banner ganz oben in `TodayView`.

---

## Components

### Core Views (4)

| Component | Beschreibung |
|---|---|
| `TodayView` | Recovery Score Card + Muscle Map Preview + Empfehlung + Modality Quick-Log |
| `MuscleMapView` | SVG Body Map (react-body-highlighter) + Detail Modals pro Muskelgruppe |
| `InsightsView` | Trend-Charts, Pattern Insights, Modality Effectiveness |
| `MoreView` | HRV-Messung, Protokolle, Wearable-Verbindungen, Einstellungen |

---

### Morning Check-in Components (5)

| Component | Beschreibung |
|---|---|
| `CheckinBanner` | Home-Screen Banner wenn kein Check-in heute |
| `CheckinModal` | Vollständiger Check-in Flow in einem Modal/Screen |
| `SleepSlider` | Dual-Slider: Stunden (0–12, 0.5er) + Qualität (1–10 Emoji) |
| `SorenessBodyMap` | react-body-highlighter mit 4 Soreness-Levels (0–3) per Tap |
| `MoodSelector` | 5 Buttons mit Emojis: 💪😊😐😩🤒 |

---

### Recovery Score Components (5)

| Component | Beschreibung |
|---|---|
| `RecoveryScoreCard` | Prominente Score-Karte: Zahl, Readiness Level, Farbe, Empfehlung |
| `ScoreBreakdown` | Aufklappbare Komponenten-Aufschlüsselung (Schlaf, HRV, Kater, ...) |
| `ReadinessIndicator` | Farbiger Badge: excellent/good/moderate/poor/rest |
| `ScoreTrendChart` | 7-Tage Verlauf (Linien-Chart, mit Wochentagen) |
| `TrainingRecommendation` | "Heute ideal: Push Day" mit Begründung |

---

### Muscle Recovery Map Components (5)

| Component | Beschreibung |
|---|---|
| `MuscleRecoveryMap` | SVG Körpersilhouette (anterior + posterior) mit Farbcoding |
| `MuscleColorOverlay` | Overlay: 🟢>80% / 🟡50–80% / 🔴<50% |
| `MuscleDetailModal` | Tap auf Muskelgruppe: Recovery%, letztes Training, Modifikatoren, Empfehlung |
| `MuscleMapLegend` | Legende: Ready / Recovering / Not Ready |
| `TrainingDaySuggestion` | "Heute ideal: Push Day" basierend auf Muscle Map |

---

### HRV Components (4)

| Component | Beschreibung |
|---|---|
| `HRVCard` | Aktueller RMSSD + Vergleich zur Baseline + Trend |
| `HRVMeasureFlow` | Camera-Interface für Phone Camera Messung (60s Countdown) |
| `HRVTrendChart` | 14-Tage RMSSD Verlauf mit Baseline-Band |
| `HRVBaselineStatus` | Baseline: Datenpunkte, Avg, Status (min. 7 Messungen nötig) |

---

### Modality Components (4)

| Component | Beschreibung |
|---|---|
| `ModalityQuickLog` | Quick-Buttons für häufige Modalitäten auf TodayView |
| `ModalityLogger` | Vollständiges Formular (Typ, Dauer, Temperatur, Kosten, Sofort-Rating) |
| `ModalityList` | Heute geloggte Aktivitäten mit Bonus-Punkte Anzeige |
| `ModalityEffectivenessChart` | Bar-Chart: Welche Modalität bringt am meisten (+Score) |

---

### Insights Components (5)

| Component | Beschreibung |
|---|---|
| `RecoveryTrendChart` | 30-Tage Score-Verlauf |
| `SleepTrendChart` | Schlafstunden + Qualität über Zeit |
| `PatternInsights` | Erkannte Muster (Cards): "Sauna → +2.3 Punkte Ø" |
| `OvertrainingRiskCard` | Aktuelles Übertraining-Risiko + Signal-Count |
| `WeeklySummaryCard` | Wöchentliche Zusammenfassung mit Trend-Pfeil |

---

### Alerts & Protocols (4)

| Component | Beschreibung |
|---|---|
| `OvertrainingAlert` | Alert-Banner: Severity, Signale, Empfehlungen |
| `AlertActionButtons` | "Deload starten" / "Verstanden" Buttons |
| `ProtocolCard` | Protokoll-Vorlage: Name, Dauer, Evidence Level |
| `ProtocolProgress` | Aktives Protokoll: X/7 Tage + heutige Tasks |

---

### Wearable Components (3)

| Component | Beschreibung |
|---|---|
| `WearableList` | Liste aller konfigurierbaren Datenquellen |
| `WearableConnectButton` | Connect/Disconnect + letzter Sync-Zeitpunkt |
| `SyncStatus` | Sync-Statistik: Datenpunkte, letzte Sync, Status |

---

## Custom Hooks (16)

### Check-in & Score

| Hook | Beschreibung |
|---|---|
| `useCheckinToday()` | Heutiger Check-in (null wenn noch nicht gemacht) |
| `useCheckinActions()` | submitCheckin (UPSERT), lädt Score neu |
| `useRecoveryScore(date?)` | Recovery Score + Komponenten |
| `useScoreTrend(days?)` | Score-Trend über N Tage |

### Muscle Map

| Hook | Beschreibung |
|---|---|
| `useMuscleMap()` | Alle Muskelgruppen mit Recovery % |
| `useMuscleDetail(muscle)` | Detail einer Muskelgruppe |

### HRV

| Hook | Beschreibung |
|---|---|
| `useHRVData(days?)` | HRV-Messungen + Baseline |
| `useHRVActions()` | submitHRVMeasurement |
| `useHRVTrend()` | 30-Tage RMSSD Verlauf |

### Modalities

| Hook | Beschreibung |
|---|---|
| `useModalitiesToday()` | Heute geloggte Modalitäten + Bonus |
| `useModalityActions()` | logModality, updateNextDayEffect |
| `useModalityEffectiveness()` | Effektivitäts-Ranking |

### Insights & Alerts

| Hook | Beschreibung |
|---|---|
| `useInsights(period)` | 7d/30d Muster und Statistiken |
| `useOvertrainingAlerts()` | Aktive Alerts |
| `useProtocols()` | Protokoll-Vorlagen + aktives Protokoll |
| `usePendingActions()` | Offene User-Actions für Buddy-TODO |

---

## Zustand Stores (2)

### `stores/recoveryStore.ts`

```typescript
interface RecoveryStore {
  checkinDone: boolean;        // heute bereits Check-in gemacht
  currentScore: number | null;
  readiness: ReadinessLevel | null;
  activeTab: 'today' | 'muscles' | 'insights' | 'more';

  setCheckinDone:  (done: boolean) => void;
  setScore:        (score: number, readiness: ReadinessLevel) => void;
  setActiveTab:    (tab: RecoveryStore['activeTab']) => void;
}
```

### `stores/checkinStore.ts`

Zwischenspeicher für den laufenden Check-in (Progressive Disclosure).

```typescript
interface CheckinStore {
  // Draft-State während Eingabe
  draft: {
    sleep_hours?:       number;
    sleep_quality?:     number;
    subjective_feeling?: number;
    soreness:           Record<string, number>;
    mood?:              Mood;
  };

  setDraftField:  (key: string, value: unknown) => void;
  setSoreness:    (muscle: string, level: 0|1|2|3) => void;
  resetDraft:     () => void;
}
```

---

## Types

```
modules/recovery/types/
├── checkin.ts     RecoveryCheckin, CheckinDraft
├── score.ts       RecoveryScoreResult, ReadinessLevel, ScoreComponents
├── muscle.ts      MuscleRecoveryResult, MuscleSoreness
├── hrv.ts         HRVMeasurement, HRVBaseline, HRVScoreResult
├── sleep.ts       SleepData, SleepScore
├── modality.ts    RecoveryModality, ModalityType, ModalityEffectiveness
├── alerts.ts      OvertrainingAlert, OvertSignal, AlertSeverity
├── protocol.ts    RecoveryProtocol, ProtocolAssignment
├── insights.ts    RecoveryInsights, PatternResult, WeeklySummary
└── api.ts         ApiResponse<T>
```

---

## i18n — 250+ Keys

```
Namespace: 'recovery'

recovery.today.title             = "Recovery"
recovery.today.no_checkin        = "Guten Morgen! Check-in ausstehend ☀️"
recovery.checkin.sleep_hours     = "Wie lange hast du geschlafen?"
recovery.checkin.sleep_quality   = "Wie war die Schlafqualität?"
recovery.checkin.feeling         = "Wie fühlst du dich heute?"
recovery.checkin.soreness        = "Muskelkater?"
recovery.checkin.mood_motivated  = "Motiviert 💪"
recovery.checkin.mood_good       = "Gut 😊"
recovery.checkin.mood_neutral    = "Neutral 😐"
recovery.checkin.mood_tired      = "Müde 😩"
recovery.checkin.mood_sick       = "Krank 🤒"
recovery.score.excellent         = "Optimal 🟢"
recovery.score.good              = "Gut 🟢"
recovery.score.moderate          = "Moderat 🟡"
recovery.score.poor              = "Niedrig 🟠"
recovery.score.rest              = "Pause empfohlen 🔴"
recovery.muscle.ready            = "Bereit ✅"
recovery.muscle.recovering       = "Erholt sich 🟡"
recovery.muscle.not_ready        = "Noch nicht bereit 🔴"
recovery.muscle.ready_in         = "Bereit in ~{hours}h"
recovery.modality.bonus_added    = "+{points} Recovery Punkte"
recovery.alert.title             = "Übertraining Risiko"
recovery.alert.start_deload      = "Deload starten"
```

---

## Shared Contracts

```
packages/contracts/src/recovery/
  checkin.ts         RecoveryCheckin
  score.ts           RecoveryScoreResult, ReadinessLevel
  muscle.ts          MuscleRecoveryResult
  hrv.ts             HRVMeasurement, HRVBaseline
  sleep.ts           SleepData
  modality.ts        RecoveryModality
  alerts.ts          OvertrainingAlert
  for-ai.ts          RecoveryBuddyContext
  for-goals.ts       RecoveryGoalsContribution
  readiness.ts       TrainingReadiness  (ausgehend ans Training-Modul)
```
