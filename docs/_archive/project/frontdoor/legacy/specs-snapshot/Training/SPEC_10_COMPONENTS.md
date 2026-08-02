# Training Module — Frontend Components
> Spec Phase 10 | Seiten, Components, Hooks, Stores

---

## Verzeichnisstruktur

```
apps/app/
├── app/(app)/training/
│   ├── page.tsx               Hauptseite (4-Tab Layout)
│   └── exercises/[id]/page.tsx  Exercise Detail Page
│
└── modules/training/
    ├── components/            UI Components
    ├── hooks/                 Custom Hooks
    ├── stores/                Zustand Stores
    ├── types/                 TypeScript Types
    └── data/                  Statische Daten (Muscle Maps, Volume Defaults)
```

---

## Pages

### `training/page.tsx` — Hauptseite

4 Sub-Tabs:

| Tab | Component | Icon | Beschreibung |
|---|---|---|---|
| Workouts | `WorkoutsView` | 🏋️ | History + Quick Start + Nächstes Workout |
| Routines | `RoutinesView` | 📋 | Eigene + Coach + Marketplace Routinen |
| Exercises | `ExerciseLibraryView` | 📚 | Search + Filter + 1.200+ Übungen |
| Stats | `StatsView` | 📊 | Volume, PRs, Balance, Landmarks |

**Header:** Streak Counter + Nächstes Workout Widget

---

## Components

### Core Views (4)

| Component | Beschreibung |
|---|---|
| `WorkoutsView` | History-Liste, Quick Start, Kalender-Eintrag, Nächstes Workout |
| `RoutinesView` | Routine-Karten (My / Coach / Marketplace), + Neue Routine Button |
| `ExerciseLibraryView` | Suchfeld, Kategorie-Filter, Muskel/Equipment-Filter, virtualisierte Liste |
| `StatsView` | Sub-Tabs: Volume / PRs / Balance / Frequenz / Landmarks |

---

### Exercise Library Components (8)

| Component | Beschreibung |
|---|---|
| `ExerciseSearch` | Suchfeld mit Debounce (300ms), Filter-Panel |
| `ExerciseFilters` | Kategorie-Chips (horizontal), Muskel-Dropdown, Equipment-Dropdown |
| `ExerciseList` | Virtualisierte Liste (1.200+ Items, react-window oder ähnlich) |
| `ExerciseCard` | Karte: Start-Bild, Name, Muskel, Equipment, Evaluation Score Badge |
| `ExerciseDetail` | Vollansicht: Bilder/Video, Instructions, Tips, Mistakes, History, Muskel Map |
| `ExerciseMuscleMap` | SVG-Körpersilhouette mit hervorgehobenen Primär-/Sekundärmuskeln |
| `ExerciseHistory` | PR-History Chart + letzte 5 Sessions pro Exercise |
| `ExerciseEvalBadge` | Evaluation Score Badge (z.B. "94/100 🏆") |

---

### Live Workout Components (10)

| Component | Beschreibung |
|---|---|
| `LiveWorkout` | Haupt-Container mit State Machine (IDLE → SESSION_COMPLETE) |
| `WorkoutHeader` | Session-Timer (läuft immer), Workout-Name, [🏁 Abschliessen] |
| `ExerciseLogger` | Aktuelle Übung: Bild + Previous-Spalte + Set-Tabelle |
| `SetRow` | Einzelne Set-Zeile: Checkmark, Set-Nummer, Previous, Weight, Reps |
| `SetInput` | weight_kg / reps Eingabe mit +/- Buttons für schnelles Logging |
| `RPEInput` | RPE/RIR Slider (Progressive Disclosure — default versteckt) |
| `RestTimer` | Countdown nach Set-Complete, Skip-Button, konfigurierbare Dauer |
| `SupersetIndicator` | Farbliche Markierung bei Superset-Übungen |
| `PRCelebration` | 🎉 Animation + Ton bei neuem PR |
| `PlateCalculator` | Hantelscheiben-Komposition für gewähltes Gewicht |

---

### Workout Summary Components (3)

| Component | Beschreibung |
|---|---|
| `WorkoutSummary` | Post-Workout Screen: Duration, Volume, PRs, Muskelverteilung |
| `PostWorkoutFeedback` | Pump/Soreness per Muskelgruppe (1–3), Performance-Rating |
| `PRList` | Liste neuer PRs mit vorherigem Wert und Delta |

---

### Routine Components (7)

| Component | Beschreibung |
|---|---|
| `RoutineList` | Karten-Grid: My / Coach / Marketplace Sektionen |
| `RoutineCard` | Name, Quelle-Badge, Exercises-Anzahl, Est. Duration, Last Used |
| `RoutineDetail` | Vollansicht: Exercise-Liste mit Soll-Werten |
| `RoutineBuilder` | Exercise hinzufügen, Move Up/Down, Superset markieren |
| `RoutineExerciseRow` | Übung in Builder: Name, Sets×Reps, Rest, Progression Model |
| `ScheduleView` | Wochenplan-Grid (Mon–Son) mit Drag-and-drop Zuweisung |
| `WorkoutCalendar` | Monatsansicht: absolvierte + geplante Tage markiert |

---

### Stats Components (7)

| Component | Beschreibung |
|---|---|
| `VolumeChart` | Linien/Balken-Chart: wöchentliches Volumen per Muskelgruppe |
| `StrengthProgressChart` | 1RM-Verlauf pro Übung (Linien-Chart) |
| `MuscleBalanceView` | Push/Pull/Legs Pie-Chart + Balance-Status + Empfehlung |
| `FrequencyTracker` | Sessions/Woche Balken + Streak Counter |
| `VolumeLandmarksView` | MV/MEV/MAV/MRV pro Muskelgruppe mit Status-Farben |
| `PRHistory` | PR-Liste aller Exercises mit Datum und Delta |
| `StrengthStandardsCard` | Vergleich mit Bevölkerungswerten (Beginner → Elite) |

---

### AI & Progression Components (3)

| Component | Beschreibung |
|---|---|
| `ProgressionBadge` | Vorschlag für nächsten Satz (Grau = Suggestion) |
| `DeloadAlert` | Banner wenn Deload empfohlen wird |
| `AIWorkoutGenerator` | Buddy-gesteuerte Workout-Generierung (Ziel + Zeit + Equipment) |

---

## Custom Hooks (20)

### Exercise & Library

| Hook | Beschreibung |
|---|---|
| `useExerciseSearch(query, filters)` | Debounced Search mit Kategorie/Muskel/Equipment Filter |
| `useExerciseDetail(id)` | Einzelne Übung mit allen Details + User History |
| `useMuscleGroups()` | Muskelgruppen-Baum (gecacht) |
| `useEquipment()` | Equipment-Liste (gecacht) |

### Routine Management

| Hook | Beschreibung |
|---|---|
| `useRoutines(filter?)` | Routine-Liste mit optionalem creator_type Filter |
| `useRoutineDetail(id)` | Routine mit Exercises + Soll-Werten |
| `useRoutineActions()` | create, update, delete, duplicate |
| `useSchedule()` | Wochenplan lesen + updaten |
| `useNextWorkout()` | Nächstes geplantes Workout aus Schedule |

### Live Workout

| Hook | Beschreibung |
|---|---|
| `useLiveWorkout(sessionId?)` | Gesamter Live-Workout-State (aktive Session) |
| `useWorkoutTimer()` | Laufender Timer (Sekunden seit Session-Start) |
| `useRestTimer()` | Countdown-Timer für Pausen |
| `useSetLogging()` | Set loggen, updaten, PRs erkennen |
| `useProgressionSuggestion(exerciseId)` | Nächster Satz Vorschlag |
| `usePRDetection()` | Automatische PR-Erkennung nach Set-Log |

### Analytics & History

| Hook | Beschreibung |
|---|---|
| `useWorkoutHistory(dateRange)` | Session-History mit Paginierung |
| `usePersonalRecords(exerciseId?)` | PRs des Users |
| `useVolumeLandmarks()` | Volume Landmarks mit aktuellem Status |
| `useWeeklyAnalytics()` | Wöchentliche Zusammenfassung (Volume, Balance) |
| `usePostWorkoutFeedback(sessionId)` | Feedback speichern |

---

## Zustand Stores (3)

### `stores/liveWorkoutStore.ts`

```typescript
interface LiveWorkoutStore {
  // State
  sessionId:          string | null;
  status:             'idle' | 'active' | 'rest' | 'complete';
  currentExerciseIdx: number;
  currentSetIdx:      number;
  restSecondsLeft:    number;
  elapsedSeconds:     number;

  // Actions
  startSession:       (routineId?: string) => void;
  logSet:             (data: SetInput) => void;
  startRest:          (seconds: number) => void;
  skipRest:           () => void;
  nextExercise:       () => void;
  completeSession:    () => void;
  cancelSession:      () => void;
}
```

### `stores/exerciseSearchStore.ts`

```typescript
interface ExerciseSearchStore {
  // State
  query:           string;
  categoryFilter:  string | null;
  muscleFilter:    string | null;
  equipmentFilter: string | null;
  difficultyFilter: string | null;
  sortBy:          'relevance' | 'evaluation_desc' | 'name_asc';

  // Actions
  setQuery:         (q: string) => void;
  setFilter:        (key: string, value: string | null) => void;
  clearFilters:     () => void;
  setSortBy:        (sort: ExerciseSearchStore['sortBy']) => void;
}
```

### `stores/trainingUIStore.ts`

```typescript
interface TrainingUIStore {
  // State
  activeTab:           'workouts' | 'routines' | 'exercises' | 'stats';
  statsSubTab:         'volume' | 'prs' | 'balance' | 'frequency' | 'landmarks';
  routineBuilderOpen:  boolean;
  routineBuilderData:  Partial<Routine> | null;

  // Actions
  setActiveTab:      (tab: TrainingUIStore['activeTab']) => void;
  setStatsSubTab:    (tab: TrainingUIStore['statsSubTab']) => void;
  openRoutineBuilder: (routine?: Routine) => void;
  closeRoutineBuilder: () => void;
}
```

---

## Types

```
modules/training/types/
├── exercise.ts      Exercise, MuscleGroup, Equipment, ExerciseAlias
├── routine.ts       Routine, RoutineExercise, RoutineScheduleDay
├── session.ts       WorkoutSession, WorkoutExercise, WorkoutSet
├── record.ts        PersonalRecord, PRType
├── progression.ts   ProgressionConfig, ProgressionSuggestion, ProgressionModel
├── feedback.ts      PostWorkoutFeedback, VolumeLandmark
├── analytics.ts     WeeklyVolume, MuscleBalance, StrengthStandard
├── scoring.ts       TrainingScore
└── api.ts           ApiResponse<T>, Paginated<T>
```

---

## Statische Daten

### `data/volumeLandmarkDefaults.ts`

Population-Defaults für Volume Landmarks.
Werden beim ersten User-Login in DB geschrieben.

```typescript
export const VOLUME_LANDMARK_DEFAULTS: Record<string, {mv:number, mev:number, mav:number, mrv:number}> = {
  'Pectoralis Major':  { mv: 8,  mev: 10, mav: 16, mrv: 22 },
  'Latissimus Dorsi':  { mv: 8,  mev: 10, mav: 18, mrv: 24 },
  'Lateral Deltoid':   { mv: 6,  mev: 8,  mav: 14, mrv: 20 },
  'Biceps Brachii':    { mv: 4,  mev: 6,  mav: 10, mrv: 16 },
  'Triceps Brachii':   { mv: 4,  mev: 6,  mav: 10, mrv: 16 },
  'Quadriceps':        { mv: 6,  mev: 8,  mav: 14, mrv: 22 },
  'Hamstrings':        { mv: 4,  mev: 6,  mav: 10, mrv: 18 },
  'Gluteus Maximus':   { mv: 4,  mev: 6,  mav: 12, mrv: 18 },
  'Calves':            { mv: 6,  mev: 8,  mav: 12, mrv: 18 },
  'Rectus Abdominis':  { mv: 0,  mev: 4,  mav: 10, mrv: 16 },
};
```

### `data/exerciseMuscleMap.ts`

SVG-Körpersilhouette Highlight-Koordinaten pro Muskelgruppe.

---

## i18n — 300+ Keys

```
Namespace: 'training'

training.exercises.title          = "Übungen"
training.exercises.search_placeholder = "Übung suchen..."
training.exercises.filter.all     = "Alle"
training.exercises.filter.muscle  = "Muskel"
training.exercises.eval_score     = "Effektivität: {score}/100"
training.exercise.primary_muscles = "Primär"
training.exercise.secondary_muscles = "Sekundär"
training.exercise.your_history    = "Deine History"
training.exercise.add_to_routine  = "Zur Routine hinzufügen"

training.live.timer               = "{h}:{mm}:{ss}"
training.live.previous            = "Vorher"
training.live.set                 = "Satz {n}"
training.live.rest_timer          = "Rest: {seconds}s"
training.live.skip_rest           = "Überspringen"
training.live.new_pr              = "Neuer PR! 🎉"
training.live.finish              = "Workout beenden"

training.summary.duration         = "{min} Minuten"
training.summary.volume           = "{kg} kg Volumen"
training.summary.prs              = "{count} neue PRs"

training.routines.my_routines     = "Meine Routinen"
training.routines.from_coach      = "Vom Coach"
training.routines.marketplace     = "Marketplace"
training.routines.new             = "Neue Routine"
training.routines.start           = "Workout starten"

training.stats.volume             = "Volumen"
training.stats.prs                = "PRs"
training.stats.balance            = "Balance"
training.stats.frequency          = "Frequenz"
training.stats.landmarks          = "Volume Landmarks"
training.stats.below_mev          = "Unter MEV ⚠️"
training.stats.optimal            = "Optimal ✅"
training.stats.approaching_mrv    = "Nahe MRV 🟡"
training.stats.over_mrv           = "Über MRV 🔴"
```

---

## Shared Contracts

```
packages/contracts/src/training/
  exercise.ts        Exercise, MuscleGroup, Equipment
  routine.ts         Routine, RoutineExercise
  session.ts         WorkoutSession, WorkoutSet, SetInput
  record.ts          PersonalRecord
  progression.ts     ProgressionConfig, ProgressionSuggestion
  analytics.ts       WeeklyVolume, MuscleBalance, VolumeLandmark
  scoring.ts         TrainingScore
  for-ai.ts          TrainingBuddyContext
  for-goals.ts       TrainingGoalsContribution
```
