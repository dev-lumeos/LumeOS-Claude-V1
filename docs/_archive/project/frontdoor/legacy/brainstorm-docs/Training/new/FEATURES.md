# Training Module — Features

## Implementierte Features (56/56)

### 1. Exercise Library

1.200+ unique Übungen (1.850 in DB inkl. Varianten). Read-only für User.

- 4.645 Bilder (Start/End, Male/Female) auf Cloudflare R2
- 2.363 Videos (~11 GB, 12 Kategorien) — Abdominals+Back live
- DE/EN/TH Übersetzungen (Name, Instructions, Tips) — 1.850/1.850 vollständig
- 157 Muskelgruppen (normalisiert, DE/EN/TH)
- ~40 kanonische Equipment-Typen (normalisiert aus 82)
- Movement Patterns: push/pull/squat/hinge/carry/rotation
- Disciplines: bodybuilding/powerlifting/olympic/general
- Volltext-Suche (pg_trgm), Multi-Filter (Kategorie + Muskel + Equipment)
- Virtualisierte Liste für Performance bei 1.200+ Items

Code: `routes/exercises.ts` · `training.exercises` · `ExerciseLibraryView.tsx` · `useExerciseSearch.ts`

---

### 2. Exercise Evaluation Scores (0–100)

Effektivitätswert pro Übung für primären Muskel. Einzigartiges Feature im Markt.

- Basiert auf SFR (Stimulus-to-Fatigue Ratio), Mechanical Tension, Stretch Position, EMG
- "Lat Pulldown: 92/100 · Cable Crossover: 45/100"
- Für AI Workout Generation als Hauptkriterium

Code: `training.exercises.evaluation_score` · `EvidenceBadge.tsx`

---

### 3. Routine Management

- Unbegrenzte Routines im Free Tier (vs. Strong's 3-Limit)
- Quellen: user / coach / marketplace / buddy — identisches Schema
- Supersets, Giant Sets, Drop Sets
- Move Up/Down (Drag & Drop v2)
- Estimated Duration (auto-computed)
- Tags: push/pull/legs/upper/lower/full_body/custom
- Warm-up Calculator
- Template-System (vorgefertigte Templates)

Code: `routes/routines.ts` · `training.routines` · `training.routine_exercises` · `RoutineView.tsx` · `RoutineBuilder.tsx`

---

### 4. Schedule + Kalender

- Wochenplan-Zuweisung (ScheduleView.tsx)
- Split-Rotation: Sequential + Weekly
- Workout-Kalender (CalendarView.tsx)
- Workout History Timeline (WorkoutHistory.tsx)
- "Next Workout" Widget (API)
- Streak Counter
- Plan aktivieren/deaktivieren

Code: `routes/schedule.ts` · `training.routine_schedule_days` · `ScheduleView.tsx`

---

### 5. Live Workout Tracking

State Machine: IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST → ... → SESSION_COMPLETE

- Previous-Spalte: letzter Session-Wert pro Exercise
- Auto Rest Timer nach Set-Complete
- Superset Flow (Auto-Scroll, Skip Rest)
- PR Detection + Celebration 🎉 (estimated_1rm, max_weight, max_reps, max_volume)
- RPE/RIR Input (Progressive Disclosure)
- Warmup/Drop/Failure Set Labels
- Plate Calculator
- Speed-First: <3 Sekunden pro Set

Code: `routes/sessions-live.ts` · `LiveWorkout.tsx` · `liveWorkoutStore.ts` · `useSetLogging.ts`

---

### 6. Progressive Overload Engine (5 Modelle)

**Linear:** +2.5kg/Session — Beginner
**Double Progression:** Erst Reps bis Max, dann Gewicht +2.5kg — Standard
**Wave Loading:** [75%, 85%, 95%, Deload 65%] — Periodisiert
**RPE-Autoregulation:** Gewicht passt sich an Tagesform an (targetRPE=8)
**DUP:** Kraft/Hypertrophie/Power Rotation — Advanced

Fatigue Detection: Reps fallen ab / RPE > 9 / 3× keine Progression → Deload vorschlagen

Code: `routes/progression.ts` · `packages/scoring/src/training.ts` · `ProgressionBadge.tsx`

---

### 7. Volume Landmarks & Feedback-Loop

- Population-Defaults (MV/MEV/MAV/MRV) für alle Muskelgruppen
- Feedback-Loop: Pump/Soreness → personalisierte MAV/MRV-Anpassung
- Status: below_mev / optimal / approaching_mrv / over_mrv
- Volume Landmarks View in Stats-Tab

Code: `routes/landmarks.ts` · `training.volume_landmarks` · `VolumeLandmarksView.tsx` · `useVolumeLandmarks.ts`

---

### 8. Personal Records

- Auto-Detection nach jedem Set (4 PR-Typen)
- PR-Celebration Animation + Ton
- PR-History Chart (Scatter Plot) pro Exercise
- Brzycki 1RM Berechnung beim Set-Insert (Trigger)

Code: `routes/records.ts` · `training.personal_records` · `PRHistory.tsx` · `usePRDetection.ts`

---

### 9. Post-Workout Feedback

- Pump/Soreness (1–3) pro Muskelgruppe
- Performance-Rating (besser/gleich/schlechter)
- 10-Sekunden Input, massive Datenqualität für Personalisierung

Code: `routes/feedback.ts` · `training.post_workout_feedback` · `PostWorkoutFeedback.tsx`

---

### 10. Stats & Analytics

- Weekly Volume Load per Muskelgruppe (Balken-Chart, 8 Wochen)
- Strength Progression (1RM-Verlauf, Linien-Chart)
- Muscle Balance (Push/Pull/Legs Ratio + Imbalance-Alert)
- Frequency Tracker (Sessions/Woche, Streak)
- Volume Landmarks mit aktuellem Status

Code: `routes/analytics.ts` · `StatsView.tsx` · `VolumeChart.tsx` · `MuscleBalanceView.tsx`

---

### 11. AI Workout Generation (rules-based)

Deterministische Regeln + Exercise Evaluation Scores — kein ML.

1. Muskelgruppen für heute bestimmen
2. Volume-Bedarf bis MAV berechnen
3. Exercises nach Equipment + Readiness + eval_score filtern
4. Top-N Exercises bis Volume-Bedarf erfüllt
5. Sets×Reps nach Progression Model + Ziel
6. User bestätigt Vorschau

Code: `routes/progression.ts` (AI endpoint) · `AIWorkoutGenerator.tsx`

---

### 12. Coach Template Builder

- Coach kann Routines erstellen (CoachTemplateBuilder.tsx)
- Coach kann Routines zuweisen (ClientAssigner.tsx)
- Client sieht Coach-Routines (CoachRoutinesClient.tsx)
- ⬜ Marketplace Integration — Routine als Produkt verkaufen (pending)

---

### 13. Cross-Module Integration

- Recovery → Training: Readiness Score → Intensity Suggestion
- Goals → Training: Volume Planning (goal_phase)
- Supplements → Training: Pre/Post Stack
- Medical → Training: Biomarker-Warnungen
- Muscle Recovery Map (per Muskelgruppe, aus Training Load + Recovery)

---

### 14. i18n

300+ Übersetzungs-Keys in DE/EN/TH. TH vollständig. Instructions/Tips 1.850/1.850.

---

## Geplante Features

### Höchste Priorität

| Feature | Beschreibung |
|---|---|
| Marketplace Integration | Routine als kaufbares Produkt |
| Wave + DUP + RPE UI | Engine implementiert, UI-Steuerung fehlt |
| Offline-Workout | SQLite-Cache + Service Worker |

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Videos restliche Kategorien | Chest, Legs, Shoulders, Arms Videos ausstehend |
| Drag & Drop Reorder | Move Up/Down vorhanden, D&D als Verbesserung |
| Apple Watch Standalone | Set-Logging ohne Handy |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Community Routine Sharing | Routines zwischen Usern teilen |
| Wearable-Integration | HR, GPS für Cardio |
| 3D Exercise Models | Phase 3, GymStreak-Inspiration |
| Form Check via CV | Computer Vision Bewegungsanalyse |
