# Training Module — Frontend Components

## Pages

| Page | Route | Beschreibung |
|---|---|---|
| `page.tsx` | `/training` | 4-Tab Layout: Workouts / Routines / Exercises / Stats |
| `exercises/[id]/page.tsx` | `/training/exercises/:id` | Exercise Detail |

---

## Core Views (4)

| Component | Beschreibung |
|---|---|
| `WorkoutsView` | History, Quick Start, Nächstes Workout Widget |
| `RoutinesView` | Routine-Karten (My / Coach / Marketplace), + Neue Routine |
| `ExerciseLibraryView` | Suche, Kategorie-Filter, Muskel/Equipment-Filter, virtualisierte Liste |
| `StatsView` | Sub-Tabs: Volume / PRs / Balance / Frequenz / Landmarks |

---

## Exercise Components (8)

| Component | Beschreibung |
|---|---|
| `ExerciseSearch` | Suchfeld, Debounce 300ms, Filter-Panel |
| `ExerciseFilters` | Kategorie-Chips, Muskel-Dropdown, Equipment-Dropdown |
| `ExerciseList` | Virtualisierte Liste (react-window), 1.200+ Items |
| `ExerciseCard` | Karte: Bild, Name, Muskel, Equipment, Eval Score Badge |
| `ExerciseDetail` | Vollansicht: Bilder/Video, Instructions, Tips, Mistakes, History, Muscle Map |
| `ExerciseMuscleMap` | SVG-Körpersilhouette mit hervorgehobenen Muskeln |
| `ExerciseHistory` | PR-History Chart + letzte 5 Sessions |
| `ExerciseEvalBadge` | "94/100 🏆" Badge |

---

## Live Workout Components (10)

| Component | Beschreibung |
|---|---|
| `LiveWorkout` | Haupt-Container mit State Machine |
| `WorkoutHeader` | Session-Timer, Workout-Name, Abschliessen-Button |
| `ExerciseLogger` | Aktuelle Übung: Bild + Previous-Spalte + Set-Tabelle |
| `SetRow` | Set-Zeile: Checkmark, Nr., Previous, Weight, Reps |
| `SetInput` | weight_kg/reps mit +/- Buttons, <3s Logging |
| `RPEInput` | RPE/RIR Slider (Progressive Disclosure) |
| `RestTimer` | Countdown nach Set-Complete, Skip-Button |
| `SupersetIndicator` | Farbliche Markierung bei Superset-Übungen |
| `PRCelebration` | 🎉 Animation + Ton bei neuem PR |
| `PlateCalculator` | Hantelscheiben-Komposition |

---

## Workout Summary (3)

| Component | Beschreibung |
|---|---|
| `WorkoutSummary` | Duration, Volume, PRs, Muskelverteilung |
| `PostWorkoutFeedback` | Pump/Soreness per Muskelgruppe, Performance-Rating |
| `PRList` | Neue PRs mit Delta zum alten Wert |

---

## Routine Components (7)

| Component | Beschreibung |
|---|---|
| `RoutineList` | My / Coach / Marketplace Sektionen |
| `RoutineCard` | Name, Source-Badge, Exercises-Anzahl, Est. Duration, Last Used |
| `RoutineDetail` | Exercise-Liste mit Soll-Werten |
| `RoutineBuilder` | Exercise hinzufügen, Move Up/Down, Superset markieren |
| `RoutineExerciseRow` | Name, Sets×Reps, Rest, Progression Model |
| `ScheduleView` | Wochenplan-Grid (Mon–Son) |
| `WorkoutCalendar` | Monatsansicht: absolvierte + geplante Tage |

---

## Stats Components (7)

| Component | Beschreibung |
|---|---|
| `VolumeChart` | Balken-Chart: wöchentliches Volumen per Muskelgruppe |
| `StrengthProgressChart` | 1RM-Verlauf (Linien-Chart) |
| `MuscleBalanceView` | Push/Pull/Legs Pie-Chart + Balance-Status |
| `FrequencyTracker` | Sessions/Woche + Streak Counter |
| `VolumeLandmarksView` | MV/MEV/MAV/MRV mit Status-Farben |
| `PRHistory` | PR-Liste aller Exercises |
| `StrengthStandardsCard` | Vergleich mit Bevölkerungswerten |

---

## Custom Hooks (20)

| Hook | Beschreibung |
|---|---|
| `useExerciseSearch(query, filters)` | Debounced Suche |
| `useExerciseDetail(id)` | Detail + User History |
| `useMuscleGroups()` | Muskelgruppen-Baum (gecacht) |
| `useEquipment()` | Equipment-Liste (gecacht) |
| `useRoutines(filter?)` | Routine-Liste |
| `useRoutineDetail(id)` | Routine mit Exercises |
| `useRoutineActions()` | create, update, delete, duplicate |
| `useSchedule()` | Wochenplan lesen + updaten |
| `useNextWorkout()` | Nächstes geplantes Workout |
| `useLiveWorkout(sessionId?)` | Live-Workout State |
| `useWorkoutTimer()` | Laufender Timer |
| `useRestTimer()` | Countdown-Timer für Pausen |
| `useSetLogging()` | Set loggen, PRs erkennen |
| `useProgressionSuggestion(exerciseId)` | Nächster Satz Vorschlag |
| `usePRDetection()` | Automatische PR-Erkennung |
| `useWorkoutHistory(dateRange)` | Session-History |
| `usePersonalRecords(exerciseId?)` | PRs des Users |
| `useVolumeLandmarks()` | Volume Landmarks Status |
| `useWeeklyAnalytics()` | Wöchentliche Zusammenfassung |
| `usePostWorkoutFeedback(sessionId)` | Feedback speichern |

---

## Zustand Stores (3)

| Store | State | Actions |
|---|---|---|
| `liveWorkoutStore` | sessionId, status, currentExerciseIdx, restSecondsLeft, elapsedSeconds | startSession, logSet, startRest, skipRest, nextExercise, completeSession |
| `exerciseSearchStore` | query, categoryFilter, muscleFilter, equipmentFilter, sortBy | setQuery, setFilter, clearFilters |
| `trainingUIStore` | activeTab, statsSubTab, routineBuilderOpen | setActiveTab, setStatsSubTab, openRoutineBuilder |

---

## Shared Contracts

```
packages/contracts/src/training/
  exercise.ts     Exercise, MuscleGroup, Equipment
  routine.ts      Routine, RoutineExercise
  session.ts      WorkoutSession, WorkoutSet, SetInput
  record.ts       PersonalRecord
  progression.ts  ProgressionConfig, ProgressionSuggestion
  analytics.ts    WeeklyVolume, MuscleBalance, VolumeLandmark
  scoring.ts      TrainingScore
  for-ai.ts       TrainingBuddyContext
  for-goals.ts    TrainingGoalsContribution
```
