# 🏋️ Training Module — Konzept & Architektur

## Datengrundlage

### Was wir haben
| Asset | Anzahl | Qualität |
|-------|--------|----------|
| Exercise-Einträge (Excel) | 2'343 Zeilen → **~1'200 unique Exercises** (nach Male/Female-Dedup) |
| Mit Instructions | 1'748 (75%) | Schritt-für-Schritt Anleitungen |
| Mit Tips | 1'744 (74%) | Profi-Tipps |
| Mit Primary Muscles | 1'743 (74%) | Anatomische Bezeichnungen (lat.) |
| Mit Secondary Muscles | 1'743 (74%) | Anatomische Bezeichnungen (lat.) |
| Mit Equipment | 1'645 (70%) | 82 Equipment-Typen |
| Kategorien | 4 (Bodyweight, Free Weights, Resistance, bodyweight→normalize) |
| Bilder | 4'645 (Start/End-Position, Male/Female) |
| Videos | **2'363** (alle 12 Kategorien, ~11 GB) |
| PDF Katalog | 1 (Exercise Catalogue 1st Edition) |

### Datenqualität-Issues (zu bereinigen)
1. **Categories** nur bei 1'520/2'343 (65%) — 823 Zeilen ohne Kategorie
2. **Kategorie-Normalisierung**: `bodyweight` vs `Bodyweight` (casing)
3. **Equipment-Normalisierung**: Duplikate (`Ab Roller`/`Ab roller`/`Ab wheel`, `Smith Machine`/`Smith machine`, `none`/`None`/`None (Bodyweight)`)
4. **Muskel-Parsing**: Komplexe Strings mit Klammern + lateinischen Namen → müssen normalisiert werden
5. **Male/Female-Varianten**: Gleiche Übung, 2 Zeilen — in DB als 1 Exercise mit 2 Image-Sets

---

## Architektur

### DB Schema (erweitert)

```sql
-- Normalisierte Muskelgruppen
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,        -- 'Quadriceps'
  name_de TEXT,                      -- 'Quadrizeps'
  name_th TEXT,                      -- 'กล้ามเนื้อต้นขาด้านหน้า'
  body_region TEXT NOT NULL,         -- 'legs', 'chest', 'back', 'arms', 'shoulders', 'core'
  display_order INT DEFAULT 0
);

-- Normalisierte Equipment-Liste
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,         -- 'Barbell'
  name_de TEXT,
  name_th TEXT,
  category TEXT,                     -- 'free_weight', 'machine', 'cable', 'bodyweight', 'band', 'other'
  icon TEXT                          -- emoji oder icon-name
);

-- Exercises (erweitert von bestehender Tabelle)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS
  name_de TEXT,
  name_th TEXT,
  instructions TEXT,                 -- Step-by-step
  tips TEXT,                         -- Pro tips
  equipment_id UUID REFERENCES equipment(id),
  exercise_type TEXT DEFAULT 'strength',  -- 'strength', 'cardio', 'stretching', 'yoga', 'calisthenics'
  tracking_type TEXT DEFAULT 'weight_reps', -- 'weight_reps', 'reps_only', 'duration', 'distance_duration'
  difficulty TEXT DEFAULT 'intermediate',   -- 'beginner', 'intermediate', 'advanced'
  image_male_start TEXT,             -- Pfad/URL
  image_male_end TEXT,
  image_female_start TEXT,
  image_female_end TEXT,
  video_url TEXT,
  source TEXT DEFAULT 'exercise_animatic',  -- Datenquelle
  is_custom BOOLEAN DEFAULT false;   -- User-erstellte Übungen

-- Exercise ↔ Muscle (M:N)
CREATE TABLE exercise_muscles (
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID REFERENCES muscle_groups(id),
  role TEXT NOT NULL,                -- 'primary' | 'secondary'
  PRIMARY KEY (exercise_id, muscle_group_id, role)
);
```

### Bestehende Tabellen (bleiben)
- `routines` — Vorlagen/Templates
- `routine_exercises` — Exercises in einer Routine
- `workout_sessions` — Tatsächliche Workouts (mit Datum)
- `workout_exercises` — Exercises in einem Workout
- `workout_sets` — Einzelne Sätze (weight, reps, duration etc.)

---

## UX Konzept — 3 Ebenen

### Inspiration: Hevy + Strong + Apple Fitness

Die besten Workout-Apps haben 3 klar getrennte Ebenen:

```
EXERCISES (Bibliothek)  →  ROUTINES (Vorlagen/Pläne)  →  WORKOUTS (Live-Tracking)
      📚 Entdecken            📋 Planen                    🏋️ Ausführen
```

---

### 1️⃣ EXERCISE LIBRARY (Tab: "Exercises")

**Zweck:** Alle 1'200+ Übungen durchsuchen, entdecken, lernen.

**UX-Pattern (wie Hevy):**

```
┌─────────────────────────────────┐
│ 🔍 Search exercises...          │
├─────────────────────────────────┤
│ [All] [Bodyweight] [Free Weights] [Resistance] [Cardio] [Stretching]  ← Horizontal Scroll Filter
├─────────────────────────────────┤
│ Filter by: [Muscle ▾] [Equipment ▾]
├─────────────────────────────────┤
│ ┌─────────┬───────────────────┐ │
│ │ 📷      │ Barbell Bench     │ │
│ │ Start/  │ Chest · Barbell   │ │
│ │ End Img │ ⭐ Primary: Pecs  │ │
│ └─────────┴───────────────────┘ │
│ ┌─────────┬───────────────────┐ │
│ │ 📷      │ Pull-Up           │ │
│ │         │ Back · Bodyweight  │ │
│ └─────────┴───────────────────┘ │
│         ... scroll ...          │
└─────────────────────────────────┘
```

**Exercise Detail Page:**
```
┌─────────────────────────────────┐
│ ← Back                          │
│                                  │
│  [📷 Start]  ←→  [📷 End]      │  ← Swipe/Toggle zwischen Start/End
│  (oder 🎬 Video wenn verfügbar) │
│                                  │
│ Barbell Bench Press              │
│ Chest · Free Weights · Barbell   │
│ Difficulty: ●●○ Intermediate     │
│                                  │
│ ─── Muscles ─────────────────── │
│ Primary:  Pectoralis Major       │
│ Secondary: Triceps, Ant. Deltoid │
│ [Muscle Map Visualization]       │  ← Körper-Silhouette mit Highlights
│                                  │
│ ─── Instructions ────────────── │
│ 1. Lie on a flat bench...        │
│ 2. Grip the barbell...           │
│ 3. Lower to chest...             │
│ 4. Press up...                   │
│                                  │
│ ─── Tips ────────────────────── │
│ 💡 Keep shoulder blades pinched  │
│ 💡 Don't bounce off chest        │
│                                  │
│ ─── Your History ────────────── │
│ Best: 100kg × 5 (Feb 20)        │
│ Last: 90kg × 8 (Feb 24)         │
│ [📊 Progress Chart]              │
│                                  │
│ [+ Add to Routine]               │
└─────────────────────────────────┘
```

**Key Features:**
- Fulltext-Suche (Name, Muskel, Equipment)
- Multi-Filter (Kategorie + Muskelgruppe + Equipment)
- Virtualisierte Liste (1'200 Items → nur sichtbare rendern)
- Persönliche History pro Exercise
- "Add to Routine" direkt aus Detail-View
- Custom Exercise erstellen (is_custom=true)

---

### 2️⃣ ROUTINES (Tab: "Routines")

**Zweck:** Workout-Templates erstellen und verwalten. Ein Routine ist ein wiederverwendbarer Plan.

**UX-Pattern:**

```
┌─────────────────────────────────┐
│ My Routines                      │
│ [+ New Routine]                  │
├─────────────────────────────────┤
│ ┌───────────────────────────────┐│
│ │ 💪 Push Day                   ││
│ │ 6 exercises · ~45 min         ││
│ │ Chest, Shoulders, Triceps     ││
│ │ Last: 2 days ago              ││
│ │ [▶ Start Workout]             ││
│ └───────────────────────────────┘│
│ ┌───────────────────────────────┐│
│ │ 🦵 Leg Day                   ││
│ │ 5 exercises · ~50 min         ││
│ │ Quads, Hamstrings, Glutes     ││
│ │ Last: 4 days ago              ││
│ │ [▶ Start Workout]             ││
│ └───────────────────────────────┘│
│                                  │
│ ─── From Coach ─────────────── │
│ ┌───────────────────────────────┐│
│ │ 🏋️ Iron Mind: Upper Body     ││
│ │ 7 exercises · Assigned Feb 20 ││
│ │ [▶ Start] [📋 View Plan]     ││
│ └───────────────────────────────┘│
│                                  │
│ ─── Discover ───────────────── │
│ [Browse Community Routines →]    │
│ [Browse Marketplace Routines →]  │
└─────────────────────────────────┘
```

**Routine Builder (Drag & Drop):**
```
┌─────────────────────────────────┐
│ ← Edit: Push Day                │
├─────────────────────────────────┤
│ 1. Barbell Bench Press    [≡] ← │ ← Drag to reorder
│    4 × 8-10 · Rest 90s         │
│    [Superset ↔]                 │
│                                  │
│ 2. Incline Dumbbell Press [≡]   │
│    3 × 10-12 · Rest 60s        │
│                                  │
│ 3A. Cable Fly            [≡]   │ ← Superset
│     3 × 12-15 · Rest 0s        │
│ 3B. Push-Up              [≡]   │ ← Superset Partner
│     3 × to failure · Rest 90s  │
│                                  │
│ [+ Add Exercise]                 │
│ [+ Add Superset]                 │
│ [+ Add Rest Period]              │
├─────────────────────────────────┤
│ Notes: Focus on mind-muscle...   │
│ Est. Duration: ~45 min           │
│                                  │
│ [💾 Save Routine]                │
└─────────────────────────────────┘
```

**Key Features:**
- Eigene Routines erstellen (Drag & Drop Builder)
- Supersets / Giant Sets / Drop Sets markieren
- Soll-Werte (Target Sets × Reps, Rest Timer)
- Coach-Assigned Routines (read-only, aus Human Coach Modul)
- Marketplace-Routines (kaufbar)
- Routine-Duplikation (Copy & Modify)
- Tags: Push/Pull/Legs/Upper/Lower/Full Body/Custom

---

### 3️⃣ WORKOUTS (Live Tracking — Tab: "Workouts")

**Zweck:** Das tatsächliche Workout loggen. Minimale Ablenkung, maximale Effizienz.

**UX-Pattern (wie Strong App — distraction-free):**

```
┌─────────────────────────────────┐
│ Push Day              ⏱ 32:15   │ ← Timer läuft
│ Feb 26, 2026                     │
├─────────────────────────────────┤
│ ✅ Barbell Bench Press           │
│ ┌─────┬────────┬──────┬───────┐ │
│ │ Set │ Prev   │ kg   │ Reps  │ │
│ ├─────┼────────┼──────┼───────┤ │
│ │ 1 ✅│ 90×8  │ [90] │ [8]   │ │ ← Prev = letzte Session
│ │ 2 ✅│ 90×8  │ [95] │ [7]   │ │ ← Grün wenn done
│ │ 3 ✅│ 85×10 │ [90] │ [8]   │ │
│ │ 4   │ 85×10 │ [  ] │ [  ]  │ │ ← Aktueller Set
│ └─────┴────────┴──────┴───────┘ │
│ [+ Add Set]                      │
│                                  │
│ ⏳ Rest Timer: 1:23 / 1:30      │ ← Countdown nach Set-Complete
│ [Skip Rest]                      │
│                                  │
│ ──────────────────────────────── │
│ ◻️ Incline Dumbbell Press        │ ← Nächste Übung
│    3 × 10-12 · 60s rest         │
│                                  │
│ ◻️ Cable Fly ↔ Push-Up (SS)     │ ← Superset
│    3 × 12-15                     │
│                                  │
├─────────────────────────────────┤
│ [🏁 Finish Workout]             │
└─────────────────────────────────┘
```

**After Workout Summary:**
```
┌─────────────────────────────────┐
│ 🎉 Workout Complete!            │
│                                  │
│ Duration: 47 min                 │
│ Volume: 12'450 kg               │
│ Sets: 18 completed              │
│ PRs: 🏆 Bench Press 95kg×7      │
│                                  │
│ ─── Muscle Distribution ─────  │
│ [Heatmap / Pie Chart]            │
│ Chest: 45% · Shoulders: 30%     │
│ Triceps: 25%                     │
│                                  │
│ ─── Personal Records ─────────  │
│ 🏆 Bench Press: New 1RM est.    │
│    95kg × 7 → est. 1RM: 117kg   │
│                                  │
│ [📤 Share] [📝 Add Notes]       │
│ [✅ Done]                        │
└─────────────────────────────────┘
```

**Key Features:**
- **"Previous" Column**: Zeigt letzte Session für jede Übung → Progressive Overload sichtbar
- **Auto Rest Timer**: Startet automatisch nach Set-Complete, konfigurierbar pro Übung
- **Superset Flow**: Auto-Scroll zum nächsten Superset-Partner (wie Hevy)
- **PR Detection**: Automatische Erkennung von Personal Records (1RM, Volume, Reps)
- **Volume Tracking**: Total Weight = Sets × Reps × Weight
- **Muscle Heatmap**: Welche Muskeln wie stark beansprucht
- **1RM Calculator**: Epley-Formel (weight × (1 + reps/30))
- **RPE/RIR Input** (optional): Rate of Perceived Exertion / Reps in Reserve
- **Workout Notes**: Pro Set oder pro Exercise

---

## Navigation in Lumeos

```
Training Tab (Bottom Nav)
├── Sub-Tab: Workouts (History + Quick Start)
│   ├── [▶ Start Empty Workout]
│   ├── [▶ Start from Routine →]
│   └── Recent Workouts (Timeline)
├── Sub-Tab: Routines
│   ├── My Routines
│   ├── Coach Routines
│   └── [+ New Routine]
├── Sub-Tab: Exercises
│   ├── Search + Filter
│   └── Exercise Library (1200+)
└── Sub-Tab: Stats
    ├── Volume over Time (Chart)
    ├── Frequency per Muscle Group
    ├── PR History
    └── Body Part Balance
```

---

## Data Import Pipeline

### Schritt 1: Excel → Normalized JSON
- Parse 2'343 Zeilen
- Dedupliziere Male/Female (→ ~1'200 unique exercises)
- Normalisiere Categories (`bodyweight` → `Bodyweight`)
- Normalisiere Equipment (82 → ~40 kanonische)
- Parse Muskel-Strings → normalisierte muscle_group IDs
- Mape tracking_type: Bodyweight→`reps_only`, Free Weights/Resistance→`weight_reps`, Cardio→`distance_duration`, Yoga/Stretching→`duration`

### Schritt 2: Image Mapping
- Filename-Pattern: `{Exercise Name}_{gender}{index}.jpeg`
- Mape zu `image_male_start`, `image_male_end`, `image_female_start`, `image_female_end`
- Images nach `public/exercises/images/` kopieren (oder CDN/Supabase Storage)

### Schritt 3: Video Mapping
- Nur 274 Videos (Abdominals + Back) — Rest kommt später
- `video_url` setzen wo vorhanden

### Schritt 4: DB Seed
- Migration: Schema-Erweiterungen
- Seed: Insert normalized exercises + muscle_groups + equipment + exercise_muscles
- Preserve existing 35 exercises (merge/update statt overwrite)

---

## Goal-Integration (Lumeos-Prinzip)

Jedes Workout wird gegen das aktive Goal gemessen:
- **Muscle Building**: Volume-Tracking, Progressive Overload Alerts
- **Fat Loss**: Kalorienverbrauch-Schätzung, Intensity Score
- **Strength**: 1RM Progress, PR-Frequenz
- **Endurance**: Duration, Heart Rate Zones (wenn Wearable)

```
GoalContextBar: "Lean Bulk — Training Score: 82/100"
→ "4 workouts this week (target: 5)"
→ "Volume +8% vs last week ✅"
→ "Push/Pull balance: ⚠️ More pull needed"
```

---

## Differenzierung vs. Konkurrenz

| Feature | Hevy | Strong | Lumeos |
|---------|------|--------|--------|
| Exercise Library | 400+ | 300+ | **1'200+** |
| Male + Female Images | ❌ | ❌ | **✅** |
| Instructions + Tips | Basic | Basic | **Detailliert (Schritt-für-Schritt + Pro-Tips)** |
| Goal-Integration | ❌ | ❌ | **✅ (Scores, Alignment, Recommendations)** |
| Coach-Assigned Routines | ❌ | ❌ | **✅ (Human Coach Modul)** |
| AI Coach Feedback | ❌ | ❌ | **✅ (Post-Workout Analysis)** |
| Cross-Module Intelligence | ❌ | ❌ | **✅ (Nutrition×Recovery×Training)** |
| Marketplace Routines | ❌ | ❌ | **✅ (Monetarisierung)** |
| i18n DE/EN/TH | ❌ | ❌ | **✅** |

---

## Geschätzter Aufwand

| Phase | Scope | Agents | Est. |
|-------|-------|--------|------|
| 1. Data Import | Parse, normalize, seed 1'200 exercises | 1 Coder | 1 Session |
| 2. Exercise Library UI | Search, Filter, Detail, Images | 1 Coder | 1-2 Sessions |
| 3. Routine Builder | CRUD, Drag&Drop, Supersets | 1-2 Coder | 2 Sessions |
| 4. Live Workout | Tracking, Timer, PR Detection | 1-2 Coder | 2-3 Sessions |
| 5. Stats & Charts | Volume, PRs, Heatmap | 1 Coder | 1 Session |
| 6. Goal Integration | Scores, Alerts, GoalContextBar | 1 Coder | 1 Session |
| **Total** | | | **~8-10 Sessions** |

---

## Entscheidungen (Tom, 26.02.2026)

1. **Storage**: Lokal für Dev → **Cloudflare R2** (S3-kompatibel) für Prod
2. **Videos + Bilder**: Alle einbinden (2'363 Videos + 4'645 Bilder = ~15 GB)
3. **Custom Exercises**: Nein — 1'200+ reichen
4. **Workout Bundles**: Coaches können Routines zuweisen oder via Marketplace verkaufen
5. **Wearables**: Später
6. **Übersetzung**: Instructions DE/TH übersetzen (AI-Translation)
7. **Vorgefertigte Routines**: Ja, vorsehen (PPL, Upper/Lower, Full Body etc.)
