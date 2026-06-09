# SPEC_05 — Training UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Training/ (Backend-Spec)

---

## 1. Übersicht

Training ist **Offline-first**. Alle Workout-Logging-Funktionen müssen ohne Internet funktionieren.
Accent: `--acc-train` (lavender, oklch(0.74 0.10 290)).

---

## 2. Routing

```
/training              — Today (default)
/training/plan         — Trainingsplan / Mesozyklus
/training/history      — Session History + Charts
/training/library      — Übungsbibliothek
```

---

## 3. Tab-Navigation

| Tab | Route | Default? |
|---|---|---|
| Today | `/training` | ✅ |
| Plan | `/training/plan` | — |
| History | `/training/history` | — |
| Library | `/training/library` | — |

---

## 4. Today (Tab 1)

### Layout

```
[Offline-Status-Widget]      (zeigt Sync-State)
[Heute's Session Card]
  ├── Session Name + Datum
  ├── Exercise Table (Sets × Reps × Gewicht × e1RM × RIR)
  └── [Start Live Workout] [Edit] [Skip]

[Week Strip]                 (Mo–So, heutiger Tag markiert)
[Volume Bars]                (Volumen pro Muskelgruppe diese Woche)
[Streak Heatmap]             (52 Wochen)
```

### Offline-Status-Widget

```tsx
<OfflineStatusWidget>
  {isOnline ? (
    <span className="text-pos">● Online · Synced</span>
  ) : (
    <span className="text-warn">● Offline · {queuedCount} entries queued</span>
  )}
</OfflineStatusWidget>
```

Immer sichtbar im Today-Tab-Header.

### Exercise Table

```
Übung                  Sets  Reps   Gewicht  e1RM     RIR  [···]
Bench Press            4     6      100 kg   130 kg   2    [···]
Pendlay Row            4     6       80 kg   106 kg   2    [···]
Pull-Up                3     8        BW      —       1    [···]
```

Click auf Zeile → ExerciseDetailModal.
Click auf [···] → Inline Edit.

### Live Workout Modal

```tsx
<LiveWorkoutModal workout={activeWorkout}>
  <LiveHeader sessionName={name} duration={elapsed} />

  <CurrentExercise>
    <ExerciseName>{current.name}</ExerciseName>
    <SetEntry
      setNumber={currentSet}
      lastSet={previousSetData}
      onLog={logSet}
    />
    <RestTimer
      duration={restSeconds}
      onComplete={startNextSet}
      onSkip={skipRest}
    />
  </CurrentExercise>

  <HeartRateWidget
    bpm={hrData?.current}
    zone={hrData?.zone}
    sparkline={hrData?.history60s}
  />

  <ExerciseQueue remaining={remainingExercises} />
</LiveWorkoutModal>
```

**Offline:** Alle Set-Logs gehen in IndexedDB (`idb`). Sync beim nächsten Online-Event.

### Heart Rate Widget

```tsx
<HeartRateWidget>
  <HRValue bpm={current} />           // Mono, 32px
  <HRZoneBar zone={zone} />           // Z1–Z5 farbcodiert
  <HRSparkline data={last60s} />      // 30px high, 120s window
</HeartRateWidget>
```

HR-Zonen: Z1 (< 60%), Z2 (60–70%), Z3 (70–80%), Z4 (80–90%), Z5 (> 90% HRmax).
Wearable-Connection: Polar H10 / Garmin via Web Bluetooth API.

---

## 5. Plan (Tab 2)

### Periodization Full View

```tsx
<PeriodizationFullView>
  <AnnualOverview blocks={annualBlocks} currentWeek={currentWeek} />
  <CurrentBlock block={activeBlock}>
    <BlockHeader name="Hypertrophy Block 3" weeks={12} currentWeek={7} />
    <WeekPlan weeks={blockWeeks} onAssignWeek={openAssignWeekModal} />
  </CurrentBlock>
</PeriodizationFullView>
```

Annual Overview: Horizontale Streifen-Timeline, 52 Wochen × N Blöcke.
Jeder Block farbcodiert: done (gedimmt), current (akzent), planned (gestrichelt).

### Block Editor Modal

```tsx
<BlockEditorModal block={selectedBlock}>
  <BlockName />
  <PeriodizationType
    options={['Linear', 'Undulating', 'Block', 'Conjugate']}
  />
  <WeekTable weeks={block.weeks}>
    {/* Pro Woche: Load %, RIR-Target, Deload-Flag, Intent */}
  </WeekTable>
  <AssignedRoutines routines={assignedRoutines} />
  <SaveButton />
</BlockEditorModal>
```

### Routine Editor Modal

```tsx
<RoutineEditorModal routine={selectedRoutine}>
  <RoutineName />
  <ExerciseList exercises={routine.exercises}>
    {/* Drag-Handle, Superset-Gruppierung */}
  </ExerciseList>
  <SupersetGrouper onGroup={createSuperset} />
  <AddExerciseSearch onAdd={addExercise} />
  <TimeEstimate minutes={estimatedMinutes} />
  <SaveButton />
</RoutineEditorModal>
```

Supersets: Visuell als gruppierte Card mit eigenem Header (A/B-Label), eigenem Rest-Timer.

### Assign Week Modal

```tsx
<AssignWeekModal week={selectedWeek}>
  <DayAssigner days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
    {/* Dropdown: Routine auswählen oder "Rest" */}
  </DayAssigner>
  <SaveButton />
</AssignWeekModal>
```

---

## 6. History (Tab 3)

### Layout

```
[Session History Table]
[Volume by Muscle Group — Bar Chart]
[e1RM Progression Chart — Übung auswählen]
[Body-Stats Correlation Card]
```

### Session History Table

```
Datum        Routine         Volume    Sets   Dauer    PRs
26.05.2026   Push Day        8.420 kg  18     62 min   1
24.05.2026   Pull Day        6.840 kg  16     55 min   2
21.05.2026   Leg Day         9.100 kg  20     70 min   0
```

Click auf Session → Session Detail Drawer.

### e1RM Progression Chart

Recharts `LineChart`. Datenpunkt = Session. X-Achse: Datum. Y-Achse: e1RM (kg).
Übungs-Selektor dropdown (alle Hauptübungen).

### Body-Stats Correlation

```tsx
<TrainingBodyStatsCorrelation>
  <CorrelationChart
    series={[
      { label: 'Bench e1RM', data: bench1RM, axis: 'left' },
      { label: 'Bodyweight', data: bodyweight, axis: 'right' },
      { label: 'BF%', data: bodyFat, axis: 'right' },
    ]}
    weeks={12}
    rSquared={0.91}
  />
</TrainingBodyStatsCorrelation>
```

Full-Width Card am Ende des History-Tabs.

---

## 7. Library (Tab 4)

### Layout

```
[Suche] [Filter: Muskelgruppe / Equipment]
[Übungs-Tabelle]
[+ Custom Exercise Button]
```

### Übungs-Tabelle

```
Name              Muskelgruppe    Equipment    Sets (30d)  e1RM
Bench Press       Chest           Barbell      48          130 kg
Squat             Legs            Barbell      36          180 kg
```

Click auf Zeile → ExerciseDetailModal.

### Exercise Detail Modal

```tsx
<ExerciseDetailModal exercise={selectedExercise}>
  <VideoPlaceholder label={`${exercise.name} Technique Video`} />

  <ExerciseStats>
    <Stat label="e1RM" value={`${e1rm} kg`} />
    <Stat label="Last session" value={lastSession} />
    <Stat label="Sets (30d)" value={sets30d} />
  </ExerciseStats>

  <MuscleGroups primary={exercise.primary} synergists={exercise.synergists} />

  <ProgressionChart data={last12WeeksE1RM} />

  <TechniqueCues cues={exercise.cues} />
  <CommonErrors errors={exercise.errors} />
  <Variations variations={exercise.variations} />

  <Last5Sessions sessions={recentSessions} />
</ExerciseDetailModal>
```

### Custom Exercise Modal

```tsx
<CustomExerciseModal>
  <ExerciseName />
  <EquipmentSelect />
  <ExerciseType options={['Compound', 'Isolation', 'Cardio', 'Mobility']} />
  <PrimaryMuscleSelect multi />
  <SynergistMuscleSelect multi />
  <VideoUpload optional />
  <Notes />
  <SaveButton />
</CustomExerciseModal>
```

---

## 8. Offline-Strategie

### IndexedDB Schema (idb)

```ts
interface WorkoutDB {
  pendingSets: PendingSet[];        // Queue für nicht-gesyncte Sets
  workoutSessions: LocalSession[];  // Lokale Session-Copies
  exerciseCache: Exercise[];        // Offline-Bibliothek
}
```

### Sync-Flow

```
Benutzer loggt Set → idb.pendingSets.push(set)
                   → UI sofort aktualisiert (optimistic)

Online-Event fired → flush pendingSets via React Query mutation
                   → Server-Konflikt? → Server gewinnt + User-Benachrichtigung
                   → Erfolg → pendingSets geleert
```

### Service Worker (Workbox via next-pwa)

- Precache: `/training`, `/training/plan`, `/training/library`
- Runtime Cache: Exercise-Library (stale-while-revalidate, 24h)
- Network-first für alles andere

---

## 9. Context Panel (Training)

```tsx
CONTEXT_DATA.training = {
  buddy: {
    state: 'idle',
    message: 'Pull Day wartet. Letzte Woche: 3 PRs — du bist im Aufwärtstrend.',
  },
  insights: [
    { type: 'pos', text: 'Bench e1RM +5 kg diese Woche' },
    { type: 'info', text: 'Rest Day morgen empfohlen (Recovery 68)' },
    { type: 'warn', text: 'Beinvolumen 30% unter Wochenziel' },
  ],
  quickActions: ['Start Workout', 'Log Bodyweight', 'View Plan', 'Log PR'],
};
```

---

## 10. Acceptance Criteria

```
[ ] Offline-Indicator sichtbar im Today-Tab
[ ] Set-Logging funktioniert ohne Internet (IndexedDB)
[ ] Sync startet automatisch beim nächsten Online-Event
[ ] LiveWorkout Modal zeigt Rest-Timer korrekt
[ ] HR-Widget zeigt Zone + Sparkline (wenn Wearable verbunden)
[ ] Periodization Full View zeigt alle Blöcke korrekt
[ ] Superset-Gruppierung in Routine-Editor visuell klar
[ ] Exercise Detail zeigt Video-Placeholder, nicht leeren Bereich
[ ] Correlation-Chart rendert ohne NaN-Werte
[ ] Service Worker cached /training für Offline-Nutzung
```
