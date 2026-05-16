# Training Module — Konsolidiertes Wissen
> Konsolidiert aus 12 Alt-Dokumenten | 2026-04-15
> Quellen: 03_MODULE_TRAINING.md, exercise-db-schema.md, lumeos-gym-strategy.md,
> lumeos-training-strategy.md, training-module-concept.md, training-todo.md,
> training_API.md, training_COMPONENTS.md, training_DATABASE.md,
> training_FEATURES.md, training_MIGRATION.md, training_RESEARCH.md

---

## 1. Zweck & Status

Das Training-Modul (Port 5200) ist das zentrale System für Workout-Management,
Exercise-Datenbank, Progressive Overload und Training-Analytics in LumeOS.

**Status:** 56/56 Features implementiert (Stand 2026-02-27).
Verbleibend: Marketplace-Integration für Routinen, Videos für restliche Kategorien.

---

## 2. Asset-Inventar

| Asset | Anzahl | Status |
|---|---|---|
| Exercises (nach Male/Female-Dedup) | ~1.200 unique | ✅ |
| Exercises in DB | 1.850 | ✅ DE/EN/TH |
| Mit Instructions/Tips | 1.748 / 1.744 (75%/74%) | ✅ DE/TH übersetzt |
| Mit Primary Muscles | 1.743 (74%) | ✅ normalisiert |
| Mit Equipment | 1.645 (70%) | ✅ ~40 kanonische Typen |
| Bilder (Start/End, Male/Female) | 4.645 | ✅ Cloudflare R2 |
| Videos (~11 GB, 12 Kategorien) | 2.363 | ✅ Abdominals+Back live |
| Muskelgruppen | 157 | ✅ DE/EN/TH |
| Equipment-Typen (kanonisch) | ~40 (normalisiert aus 82) | ✅ |

---

## 3. UX-Konzept — 3 Ebenen

```
EXERCISES (Bibliothek) → ROUTINES (Vorlagen) → WORKOUTS (Live-Tracking)
      📚 Entdecken           📋 Planen               🏋️ Ausführen
```

**Navigation:** 4 Sub-Tabs im Training-Tab:
- Workouts — History + Quick Start
- Routines — My / Coach / Marketplace
- Exercises — Library (1.200+)
- Stats — Volume, PRs, Heatmap, Balance

---

## 4. Core Features (implementiert)

### Exercise Library
- 1.200+ Übungen mit vollständigen Metadaten
- Bilder: Start/End-Position, Male/Female, Cloudflare R2
- Videos: 2.363 vorhanden, Abdominals+Back live
- DE/EN/TH für Name, Instructions, Tips
- Kategorien: Bodyweight, Free Weights, Resistance, Cardio, Stretching
- 157 Muskelgruppen inkl. Untergruppen
- ~40 kanonische Equipment-Typen
- Movement Patterns: push, pull, squat, hinge, carry
- Disciplines: bodybuilding, powerlifting, olympic, general
- Exercise Evaluation Scores (0–100, wie Alpha Progression)
- Common Mistakes
- Exercise Aliases
- Muscle Map Visualization (Körpersilhouette mit Highlights)
- Persönliche History + 1RM Chart pro Exercise

### Routine Builder
- Eigene Routines: Drag & Drop (Move Up/Down)
- Supersets / Giant Sets / Drop Sets
- Soll-Werte: Target Sets × Reps, Rest Timer, RPE-Ziel
- Coach-Assigned Routines (read-only)
- Marketplace-Routines (geplant)
- Tags: Push/Pull/Legs/Upper/Lower/Full Body/Custom
- Estimated Duration (computed)
- Warm-up Calculator
- Schedule-Zuweisung (ScheduleView.tsx)
- Split-Rotation: Sequential + Weekly
- Workout-Kalender (CalendarView.tsx)

### Live Workout Tracking
State Machine:
```
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST →
  ├── NEXT_SET → SET_ACTIVE (loop)
  └── NEXT_EXERCISE → EXERCISE_INTRO (loop)
      └── SESSION_COMPLETE → SUMMARY → IDLE
```
- "Previous" Spalte: letzter Session-Wert
- Auto Rest Timer nach Set-Complete
- Superset Flow: Auto-Scroll, Skip Rest
- PR Detection + Celebration 🎉 (1RM, Volume PR, Reps PR)
- RPE/RIR Input (Progressive Disclosure)
- Warmup/Drop/Failure Set Labels
- Post-Workout Feedback (Pump/Soreness 1–3)
- Plate Calculator
- Workout Summary mit Muscle Distribution

### Progressive Overload Engine (5 Modelle)
1. **Linear:** +2.5kg/Session für Beginner
2. **Double Progression:** Erst Reps erhöhen (8–12), dann Gewicht
3. **Wave Loading:** 3 Wochen auf, 1 Deload, Intensitäts-Welle
4. **RPE-Autoregulation:** Tagesabhängige Anpassung, targetRPE=8
5. **DUP (Daily Undulating Periodization):** Heavy/Moderate/Light Rotation

**Fatigue Detection:**
- Reps fallen > 3 Sätze → Warnung
- RPE > 9 konsistent → Volume-Reduktion
- Keine Progression > 3 Wochen → Deload oder Modell-Wechsel

### Stats & Analytics
- Volume over Time (Linien-Chart, 8-Wochen)
- PR History
- Muscle Balance Heatmap (Push/Pull/Legs Balance)
- Frequency Tracker (Sessions/Woche)
- Volume Landmarks (MV/MEV/MAV/MRV pro Muskelgruppe)
- 1RM Tracker (Brzycki-Formel)
- Deload-Empfehlungen bei Übervolumen

---

## 5. Volume Landmarks (Research-Based)

| Muskelgruppe | MV | MEV | MAV | MRV |
|---|---|---|---|---|
| Chest | 8 | 10 | 14 | 22 |
| Back | 8 | 10 | 16 | 24 |
| Shoulders | 6 | 8 | 14 | 20 |
| Biceps | 4 | 6 | 10 | 16 |
| Triceps | 4 | 6 | 10 | 16 |
| Quads | 6 | 8 | 14 | 22 |
| Hamstrings | 4 | 6 | 10 | 18 |
| Glutes | 4 | 6 | 12 | 18 |
| Calves | 6 | 8 | 12 | 18 |
| Abs | 0 | 4 | 10 | 16 |

Sets/Woche. Personalisiert durch Feedback-Loop (Pump/Soreness).

---

## 6. Exercise Classification

### tracking_type
| Wert | Übungstyp | Beispiele |
|---|---|---|
| weight_reps | Free Weights, Maschinen | Bench Press, Squat |
| reps_only | Bodyweight | Pull-Up, Push-Up, Dip |
| duration | Statisch/Cardio | Plank, Fahrrad |
| distance_duration | Ausdauer | Laufen, Rudern |

### category
Bodyweight · Free Weights · Resistance (Machines/Cables) · Cardio · Stretching

### movement_pattern
push · pull · squat · hinge · carry · rotation

### discipline
bodybuilding · powerlifting · olympic · general

---

## 7. Quellen-System für Routinen

| Source | Erstellt von | Status |
|---|---|---|
| user | User selbst | ✅ implementiert |
| coach | Human Coach Modul | ✅ implementiert |
| marketplace | Kauf über Marketplace | ⬜ geplant |

Alle drei Quellen → identisches Schema.
Keine Custom Exercises (1.200+ reichen aus).

---

## 8. Cross-Module Verbindungen

| Modul | Was Training empfängt | Was Training sendet |
|---|---|---|
| Goals | Goal Phase, Volume-Ziel | Training Adherence, Strength Progress |
| Recovery | Recovery Score, Readiness | Training Load Index |
| Nutrition | TDEE-Anpassung | Workout-Datum, Volume, Muskelgruppen |
| Supplements | Pre/Post-Stack | Workout-Typ |
| Medical | Biomarker-Warnungen | — |
| Coach (AI) | Session-Analyse | Post-Workout Data |
| Human Coach | Assigned Routines | Client Progress |

---

## 9. Technologie & Storage

- **API:** Hono.js, Port 5200, TypeScript
- **DB:** Supabase PostgreSQL, Schema `training`
- **Media:** Cloudflare R2 (S3-kompatibel), ~15GB
- **Search:** pg_trgm / Meilisearch (<50ms)
- **State:** Live Workout Session via React Context
- **Cache:** Redis für Live-Session-State (geplant)
- **Offline:** SQLite-Cache für Exercises (geplant)

---

## 10. Kompetitiver Vorteil

| Feature | Hevy | Strong | Fitbod | Alpha | RP | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Exercise Library | 400+ | 300+ | 600+ | 400+ | 300+ | **1.200+** |
| Male+Female Images | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| DE/EN/TH Lokalisierung | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Free Unlimited Routines | ✅ | ❌ (3 max) | ❌ | ❌ | ❌ | **✅** |
| Exercise Eval Scores | ❌ | ❌ | ❌ | ✅ | ❌ | **✅** |
| Feedback-Loop | ❌ | ❌ | ❌ | ❌ | ✅ | **✅** |
| Volume Landmarks | ❌ | ❌ | ❌ | ❌ | ✅ | **✅** |
| Nutrition-Integration | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ (Deep)** |
| Recovery-Integration | ❌ | ❌ | 🟡 | ❌ | ❌ | **✅** |
| Coach Marketplace | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |

---

## 11. Gym-Modul (Separates B2B-Modul)

**WICHTIG:** Der `lumeos-gym-strategy.md` beschreibt ein **separates B2B-Modul** (Gym Management).
Kein Teil des Training-Moduls (Port 5200). Separater Port, separates Schema.

Gym-Modul-Übersicht: Mandantenfähig, Trainer-Dashboard, Member 360°, Equipment Registry,
Program Distribution, Integration mit Magicline/Mindbody/Technogym.
→ Wird als eigenes Modul separat spezifiziert.

---

## 12. Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | Marketplace-Integration: Routine als Produkt verkaufen | 🟡 |
| 2 | Videos für restliche Kategorien (Chest, Legs, etc.) | 🟡 |
| 3 | Community Routine Sharing | 🟢 |
| 4 | Wearable-Integration (HR, GPS für Cardio) | 🟢 |
| 5 | Offline-Workout (SQLite-Cache) | 🟡 |
| 6 | Wave+DUP+RPE Modelle (in Engine vorhanden, UI pending) | 🟡 |
