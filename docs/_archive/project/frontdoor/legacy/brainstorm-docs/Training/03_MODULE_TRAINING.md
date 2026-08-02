# LUMEOS — Modul: Training
> Konsolidiert + Update | 2026-04-14
> API Port: 5200 | Status: ✅ COMPLETE (56/56 Features + 8 Innovation)

---

## 1. Zweck

Das Training-Modul ist das zentrale System für Workout-Management, Exercise-Datenbank,
Progressive Overload und Training-Analytics. Es trackt Live-Workouts, berechnet
Volume/Intensity, erkennt PRs und gibt Progressions-Empfehlungen.
Vollständig integriert mit Goals, Recovery, Nutrition und AI Coach.

---

## 2. Datengrundlage (Asset-Inventar)

| Asset | Anzahl | Status |
|---|---|---|
| Exercises (nach Male/Female-Dedup) | ~1.200 unique | ✅ importiert |
| Mit Instructions | 1.748 (75%) | ✅ DE/TH übersetzt |
| Mit Tips | 1.744 (74%) | ✅ DE/TH übersetzt |
| Mit Primary Muscles | 1.743 (74%) | ✅ normalisiert |
| Mit Equipment | 1.645 (70%) | ✅ normalisiert (~40 kanonische) |
| Bilder | 4.645 (Start/End, Male/Female) | ✅ gemappt |
| Videos | 2.363 (~11 GB, 12 Kategorien) | ✅ Abdominals + Back live |
| Exercises in DB | 1.850 | ✅ DE/EN/TH Translations |

---

## 3. Architektur

```
Frontend (Vite → Next.js Migration pending)
  apps/app/modules/training/
    ├── ExerciseLibrary.tsx
    ├── ExerciseDetail.tsx        (mit locale-aware Instructions/Tips)
    ├── RoutineBuilder.tsx        (Drag & Drop, Supersets)
    ├── LiveWorkout.tsx           (State Machine)
    ├── WorkoutSummary.tsx
    ├── ProgressiveOverloadEngine.tsx
    └── StatsView.tsx             (Volume, PRs, Heatmap)

API Layer (Hono, Port 5200) — 15/15 Endpoints stabil
  src/api/training/routes/
    ├── exercises.ts
    ├── routines.ts
    ├── sessions.ts
    ├── sets.ts
    ├── progression.ts
    └── insights.ts
```

---

## 4. UX-Konzept — 3 Ebenen (Hevy/Strong-Inspiration)

```
EXERCISES (Bibliothek)  →  ROUTINES (Vorlagen/Pläne)  →  WORKOUTS (Live-Tracking)
      📚 Entdecken            📋 Planen                    🏋️ Ausführen
```

### Navigation
```
Training Tab (Bottom Nav)
├── Sub-Tab: Workouts      → History + Quick Start
├── Sub-Tab: Routines      → My / Coach / Marketplace
├── Sub-Tab: Exercises     → Search, Filter, Library (1.200+)
└── Sub-Tab: Stats         → Volume, PRs, Heatmap, Balance
```

---

## 5. Features

### 5.1 Exercise Library (Tab: Exercises)
- **1.200+ Übungen** mit vollständigen Metadaten
- **4.645 Bilder** (Start/End Position, Male/Female)
- **2.363 Videos** (Abdominals + Back live, Rest folgt)
- Übersetzungen: DE/EN/TH für Namen, Instructions, Tips
- Kategorien: Bodyweight, Free Weights, Resistance, Cardio, Stretching
- 157 Muskelgruppen inkl. Untergruppen (lateinische Namen normalisiert)
- ~40 kanonische Equipment-Typen (normalisiert aus 82)
- Movement Patterns: push, pull, squat, hinge, carry
- Disciplines: bodybuilding, powerlifting, olympic, general
- Fulltext-Suche (Name, Muskel, Equipment)
- Multi-Filter (Kategorie + Muskelgruppe + Equipment)
- Virtualisierte Liste (Performance bei 1.200+ Items)
- Persönliche History pro Exercise
- "Add to Routine" direkt aus Detail-View

**Exercise Detail Page:**
- Swipe Start/End-Bild (oder Video wenn verfügbar)
- Muscle Map Visualization (Körpersilhouette mit Highlights)
- Step-by-step Instructions (lokalisiert)
- Pro Tips (lokalisiert)
- Persönliche PR-History + Progress Chart

### 5.2 Routine Builder (Tab: Routines)
- Eigene Routines erstellen (Drag & Drop)
- Supersets / Giant Sets / Drop Sets markieren
- Soll-Werte: Target Sets × Reps, Rest Timer, RPE-Ziel
- Coach-Assigned Routines (read-only, aus Human Coach Modul)
- Marketplace-Routines (kaufbar)
- Routine-Duplikation (Copy & Modify)
- Tags: Push/Pull/Legs/Upper/Lower/Full Body/Custom
- Est. Duration Anzeige
- Move Up/Down Reorder (Drag & Drop als v2)

### 5.3 Live Workout Tracking (Tab: Workouts)

**State Machine:**
```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST →
  ├── NEXT_SET → SET_ACTIVE (loop)
  └── NEXT_EXERCISE → EXERCISE_INTRO (loop)
      └── SESSION_COMPLETE → SUMMARY → IDLE
```

**Key UI-Features:**
- "Previous"-Spalte: zeigt letzten Session-Wert für jede Übung (Progressive Overload sichtbar)
- Auto Rest Timer nach Set-Complete (konfigurierbar pro Übung)
- Superset Flow: Auto-Scroll zum nächsten Superset-Partner
- PR Detection: automatisch (1RM, Volume PR, Reps PR)
- Volume Tracking: Total = Sets × Reps × Weight
- Muscle Heatmap: Welche Muskeln wie stark beansprucht
- 1RM Calculator: Epley-Formel (weight × (1 + reps/30))
- RPE/RIR Input (optional)
- Workout Notes (pro Set oder pro Übung)

**After Workout Summary:**
- Duration, Total Volume, Sets, PRs
- Muscle Distribution (Pie Chart)
- Volume Change % vs letzte Woche
- Est. Calories burned

### 5.4 Progressive Overload Engine (5 Modelle)

**Linear Progression**
```typescript
{ model: 'linear', progressionRate: 0.025, frequency: 'session', weightIncrement: 2.5 }
// Für: Anfänger, konsistente Progression
```

**Double Progression**
```typescript
{ model: 'double', repRange: [8, 12], weightIncrement: 2.5, setsTarget: 3 }
// Für: Hypertrophie (erst Reps, dann Gewicht steigern)
```

**Wave Loading**
```typescript
{ model: 'wave', waveLength: 3, intensityWave: [75, 85, 95, 65], currentWeek: 1 }
// Für: Periodisiertes Krafttraining
```

**RPE-basierte Autoregulation**
```typescript
{ model: 'rpe', targetRPE: 8, rpeRange: [7, 9], adjustmentFactor: 0.05 }
// Für: Fortgeschrittene, tagesabhängige Anpassung
```

**Daily Undulating Periodization (DUP)**
```typescript
{ model: 'dup', phases: ['strength', 'hypertrophy', 'power'], rotationFrequency: 'daily' }
// Für: Variiertes Stimuli-Training
```

**Fatigue Detection:**
```
IF reps falling > 3 sets in row → "Reps fallen ab" + Optionen (kürzen/leichter/weiter)
IF RPE > 9 consistently         → Volume-Reduktion vorschlagen
IF no progression > 3 weeks     → Deload oder Modell-Wechsel
```

### 5.5 Stats & Analytics
- Weekly Volume Load pro Muskelgruppe
- 8-Wochen Volume-Progression
- Strength Progression: 1RM Verlauf
- Strength Standards (Benchmarks)
- Training Frequency (Sessions/Woche)
- Push/Pull/Legs Balance-Check
- Deload-Empfehlungen bei Übervolumen

---

## 6. Datenbank-Schema

### `exercises` (erweitert)
```sql
id              UUID PK
name            TEXT NOT NULL
name_de         TEXT
name_th         TEXT
instructions    TEXT              -- Step-by-step (EN)
instructions_de TEXT
instructions_th TEXT
tips            TEXT              -- Pro Tips (EN)
tips_de         TEXT
tips_th         TEXT
category        VARCHAR(50)       -- Bodyweight, Free Weights, Resistance, Cardio
exercise_type   TEXT DEFAULT 'strength'
tracking_type   TEXT DEFAULT 'weight_reps'  -- weight_reps, reps_only, duration, distance_duration
difficulty      TEXT DEFAULT 'intermediate'
equipment_id    UUID REFERENCES equipment(id)
image_male_start    TEXT
image_male_end      TEXT
image_female_start  TEXT
image_female_end    TEXT
video_url       TEXT
source          TEXT DEFAULT 'exercise_animatic'
is_custom       BOOLEAN DEFAULT false
popularity_score INTEGER DEFAULT 0
safety_rating   INTEGER           -- 1-5
```

### `muscle_groups` (157 Einträge)
```sql
id          UUID PK
name        TEXT UNIQUE           -- 'Quadriceps' (EN, lateinisch normalisiert)
name_de     TEXT                  -- 'Quadrizeps'
name_th     TEXT
body_region TEXT                  -- legs, chest, back, arms, shoulders, core
display_order INT DEFAULT 0
```

### `equipment` (~40 kanonische)
```sql
id          UUID PK
name        TEXT UNIQUE           -- 'Barbell'
name_de     TEXT
name_th     TEXT
category    TEXT                  -- free_weight, machine, cable, bodyweight, band
icon        TEXT
```

### `exercise_muscles` (M:N)
```sql
exercise_id     UUID FK
muscle_group_id UUID FK
role            TEXT NOT NULL     -- 'primary' | 'secondary'
PRIMARY KEY (exercise_id, muscle_group_id, role)
```

### `workout_sessions`
```sql
id              UUID PK
user_id         UUID FK
routine_id      UUID FK (optional)
started_at      TIMESTAMPTZ
completed_at    TIMESTAMPTZ
duration_minutes INT
overall_rating  SMALLINT          -- 1-3 (💪/😐/😩)
coach_notes     TEXT
energy_level    SMALLINT          -- Pre-workout 1-5
total_volume_kg DECIMAL
estimated_calories INT
prs_achieved    JSONB             -- [{exercise, metric, value, previous}]
```

### `workout_sets`
```sql
id              UUID PK
session_id      UUID FK
exercise_id     UUID FK
set_number      SMALLINT
weight_kg       DECIMAL
reps            SMALLINT
rpe             DECIMAL           -- 1-10
rir             INTEGER           -- Reps in Reserve
tempo           VARCHAR(10)       -- "3010"
rest_seconds    SMALLINT
is_pr           BOOLEAN DEFAULT false
notes           TEXT
logged_via      TEXT              -- voice, manual, auto
completed_at    TIMESTAMPTZ
```

---

## 7. Data Import Pipeline

```
Schritt 1: Excel → Normalized JSON
  - Parse 2.343 Zeilen
  - Dedupliziere Male/Female → ~1.200 unique exercises
  - Normalisiere Categories (bodyweight → Bodyweight)
  - Normalisiere Equipment (82 → ~40 kanonische)
  - Parse Muskel-Strings → normalisierte muscle_group IDs
  - Mape tracking_type (Bodyweight→reps_only, Free Weights→weight_reps, etc.)

Schritt 2: Image Mapping
  - Pattern: {Exercise Name}_{gender}{index}.jpeg
  - Mape zu image_male/female_start/end
  - Storage: Cloudflare R2 (S3-kompatibel) für Prod

Schritt 3: Video Mapping
  - 274 Videos live (Abdominals + Back), Rest folgt
  - video_url setzen wo vorhanden

Schritt 4: DB Seed
  - Schema-Migrations
  - Insert normalized exercises + muscle_groups + equipment + exercise_muscles
```

---

## 8. Goal-Integration

```
GoalContextBar: "Lean Bulk — Training Score: 82/100"
→ "4 workouts this week (target: 5)"
→ "Volume +8% vs last week ✅"
→ "Push/Pull balance: ⚠️ More pull needed"
```

Workout → Goals Module:
- Strength Progress (1RM Delta)
- Volume Adherence (Sessions planned vs done)
- Muscle Balance
- PR Frequency

---

## 9. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Goals** | Training Adherence + Strength Progress → Goal Contribution |
| **Recovery** | Training Load Index → Recovery Score; Readiness → Intensity |
| **Nutrition** | TDEE-Anpassung nach Volume, Pre-Workout Optimizer |
| **Coach (AI)** | Session Analysis, PR-Celebrations, Post-Workout Recommendations |
| **Human Coach** | Coach-assigned Routines, Exercise Feedback System (Client↔Coach) |
| **Marketplace** | Routine-Templates kaufbar |

---

## 10. Kompetitiver Vorteil

| Feature | Hevy | Strong | Lumeos |
|---|---|---|---|
| Exercise Library | 400+ | 300+ | **1.200+** |
| Male + Female Images | ❌ | ❌ | **✅** |
| Instructions + Tips (lokalisiert) | Basic | Basic | **DE/EN/TH Step-by-Step** |
| Goal-Integration | ❌ | ❌ | **✅** |
| Coach-Assigned Routines | ❌ | ❌ | **✅** |
| AI Coach Post-Workout | ❌ | ❌ | **✅** |
| Cross-Module Intelligence | ❌ | ❌ | **✅** |
| Marketplace Routines | ❌ | ❌ | **✅** |
| i18n DE/EN/TH | ❌ | ❌ | **✅** |

---

## 11. Storage (Toms Entscheidungen)
- **Dev:** Lokal
- **Prod:** Cloudflare R2 (S3-kompatibel) für Images + Videos
- **Videos + Bilder:** Alle einbinden (~15 GB gesamt)
- **Custom Exercises:** Kein User-Upload (1.200+ reichen)
- **Vorgefertigte Routines:** PPL, Upper/Lower, Full Body vorsehen

---

## 12. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Drag & Drop Reorder (Move Up/Down vorhanden) | 🟡 MITTEL |
| TODO | 🟡 | Videos für restliche Kategorien (Chest, Legs etc.) | 🟡 MITTEL |
| TODO | 🟡 | 15 Sub-Tabs evtl. gruppieren/reduzieren (UX) | 🟡 MITTEL |
| TODO | 🟢 | Community Routine Sharing | 🟢 NIEDRIG |
| TODO | 🟢 | Wearable Integration (HR, GPS für Cardio) | 🟢 NIEDRIG |
