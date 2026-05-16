# Lumeos Training Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **9 Apps analysiert** across 3 Archetypen: Logging/Notebook (Strong, Hevy), AI Coach (Fitbod, Alpha Progression, RP Hypertrophy, GymStreak), Program Library (Boostcamp, StrongLifts, JEFIT)
- **Gym-App-Markt:** $12.12B (2025), 13.4% CAGR
- **Key Players:** Strong (10M+ Downloads), Hevy (5M+), Fitbod (1M+), Boostcamp (500K+)

### Kritische Gaps
1. **KEINE App verbindet Training + Nutrition auf hohem Niveau** — GymStreak versucht es oberflächlich, alle anderen sind reine Training-Apps
2. **3 Archetypen, 3 Silos** — Logging (Strong) ist stumpf, AI Coaches (Fitbod) kennen deine Ernährung nicht, Program Libraries (Boostcamp) sind passiv
3. **Strong limitiert Free Tier auf 3 Routinen** — #1 Kritikpunkt in 200K+ Reviews, massive Opportunity
4. **Exercise Evaluation Scores existieren nur bei Alpha Progression** — "Wie effektiv ist diese Übung für DEIN Ziel?" = Feature das KEIN anderer kopiert hat
5. **Feedback-Loop nur bei RP Hypertrophy** — Pump/Soreness → Volume Auto-Adjustment. Brillant, aber RP ist Powerlifting-niche
6. **Recovery-Integration fehlt überall** — Fitbod schätzt "Muscle Recovery" aber kennt weder Sleep noch HRV noch Nutrition

### Competitive Intelligence
- **Strong:** #1 Logging App, 10M+ Downloads, $5/mo unlimited. Stärke: Speed + Simplicity. Schwäche: limitierter Free Tier (3 Routinen), kein AI, kein Nutrition
- **Hevy:** Fastest-growing Competitor, Social Features, Free Routines. Stärke: Community + Modern UI. Schwäche: kein AI, Nutrition basic
- **Fitbod:** Bester AI-basierter Workout Generator, lernt aus deinem Log. Stärke: Muscle Recovery Map. Schwäche: kein Nutrition, repetitive Workouts
- **Alpha Progression:** Exercise Evaluation Scores (unique!), guter AI Generator. Stärke: Science-Based. Schwäche: niche, kleines Team
- **RP Hypertrophy:** Feedback-Loop (Pump/Soreness → Anpassung), MV/MEV/MAV/MRV System. Stärke: Evidence-Based Periodization. Schwäche: Powerlifter-fokussiert, steile Lernkurve
- **GymStreak:** 3D Exercise Models, AI + basic Nutrition. Stärke: Premium Feel. Schwäche: Nutrition oberflächlich, teuer ($20/mo)
- **Boostcamp:** Free Programs von Top-Coaches (Jeff Nippard). Stärke: Content Quality. Schwäche: kein Custom Programming, kein AI
- **StrongLifts:** 5×5 Fokus, Plate Calculator (genius kleine UX). Stärke: Simplicity für Beginner. Schwäche: nur 5×5, keine Flexibilität
- **JEFIT:** Größte Exercise DB (3500+), Community. Stärke: Quantität. Schwäche: veraltete UX, Ads

---

## 🏗️ Lumeos Training — Architektur

### Modul-Übersicht
```
┌──────────────────────────────────────────────────┐
│                TRAINING MODULE                    │
├──────────────┬───────────────────────────────────┤
│  Workout     │  Exercise Database                 │
│  Logger      │  800+ Exercises (free-exercise-db) │
│  (Sets, Reps,│  + SVG Muscle Maps (wger.de)       │
│   Weight,    │  + Videos (Phase 2)                │
│   RPE/RIR)   │                                    │
├──────────────┼───────────────────────────────────┤
│  Routine     │  AI Workout Engine                 │
│  Builder     │  (Generation + Adaptation)         │
│  (Unlimited  │                                    │
│   im Free!)  │  Exercise Evaluation Scores        │
│              │  Feedback-Loop (Pump/Soreness)     │
├──────────────┴───────────────────────────────────┤
│  Progressive Overload Engine                      │
│  Linear · Double Progression · Wave · DUP · RPE   │
├──────────────────────────────────────────────────┤
│  Volume Landmarks (per Muscle Group)              │
│  MV · MEV · MAV · MRV                             │
├──────────────────────────────────────────────────┤
│         Cross-Module Connectors                   │
│  Nutrition ↔ Recovery ↔ Goals ↔ Supplements        │
└──────────────────────────────────────────────────┘
```

### Datenfluss
1. **Input:** User loggt Sets (Weight × Reps × RPE) oder lässt AI Workout generieren
2. **Processing:** Volume Tracking → Progressive Overload Detection → PR Detection → Muscle Group Balance
3. **Cross-Module:** Recovery Score → Training Intensity Suggestion, Nutrition → Calorie Adjustment, Goals → Phase-aware Volume
4. **Output:** Workout Summary, PRs 🎉, Progress Charts, Next Workout Suggestion

### Integration mit anderen Modulen
| Modul | Datenfluss | Beispiel |
|-------|-----------|---------|
| **Nutrition** | Workout → Calorie Auto-Adjustment | "Leg Day: +400 kcal, +30g Protein empfohlen" |
| **Recovery** | Recovery Score → Training Intensity | "Recovery 55% → reduziere Volumen heute" |
| **Goals** | Goal Phase → Volume Planning | "Lean Bulk Phase → Training bei MAV, nicht MRV" |
| **Supplements** | Workout Type → Pre/Post Stack | "Heavy Squat Day → Creatine Pre, Magnesium Post" |
| **Medical** | Biomarkers → Training Warnings | "CRP erhöht → Trainingsvolumen reduzieren" |
| **AI Coach** | Training Data → Personalized Advice | "Dein Bench Press stagniert seit 3 Wochen → hier sind 3 Strategien" |

### Exercise Database Architecture
```
Layer 1: free-exercise-db (Public Domain)
  → 800+ exercises
  → Name, description, muscle groups, equipment
  → Images (start + end position)
  → FREE, no license restrictions

Layer 2: wger.de SVG Muscle Maps (AGPL)
  → Anatomical muscle illustrations
  → Interactive: highlight worked muscles
  → Color-coded by volume/recovery status

Layer 3: Video Library (Phase 2)
  → Wrkout.xyz Basic ($125/mo) OR
  → Kemtai API (form check) OR
  → Custom produced (long-term)

Layer 4: Lumeos Community
  → User-submitted exercises
  → Moderated + verified
  → Fills gaps (niche exercises, machines)
```

---

## 👤 Persona Design

### Persona 1: "Stefan" — Frustrated Strong User (35%)
- **Alter:** 26, männlich, trainiert seit 2 Jahren, nutzt Strong
- **Ziel:** Einfaches Logging + Progress Tracking + mehr als 3 Routinen
- **Pain Points:** 3-Routinen-Limit bei Strong Free ist lächerlich, will nicht $5/mo zahlen nur dafür
- **Feature-Needs:** Unlimited Routines (FREE!), Fast Set Logging, Previous Performance, PR Detection, Progress Charts
- **Zahlungsbereitschaft:** $0 für Basics, $9.99/mo wenn AI/Nutrition Integration gut ist
- **Churn-Risiko:** Niedrig wenn Speed stimmt — Logging-Apps sind sticky
- **Acquisition:** "Unlimited Free Routines" als App Store Headline = Strong-User-Magnet

### Persona 2: "Lara" — AI-Curious Intermediate (25%)
- **Alter:** 30, weiblich, trainiert seit 1 Jahr, weiß nicht ob ihr Plan gut ist
- **Ziel:** AI soll sagen was sie tun soll, will nicht selbst planen
- **Pain Points:** Fitbod generiert langweilige/repetitive Workouts, kennt ihre Ernährung nicht
- **Feature-Needs:** AI Workout Generation, Muscle Recovery Map, Exercise Suggestions, Feedback-Loop
- **Zahlungsbereitschaft:** $9.99/mo (günstiger als Fitbod $13/mo)
- **Churn-Risiko:** Mittel — AI muss Mehrwert zeigen in ersten 2 Wochen

### Persona 3: "Pavel" — Evidence-Based Lifter (20%)
- **Alter:** 28, männlich, kennt RP/Mike Israetel, will MV/MAV/MRV tracken
- **Ziel:** Scientific Training: Volume Landmarks, Periodization, Deload Timing
- **Pain Points:** RP App ist komplex und Powerlifter-fokussiert, Alpha Progression hat keine Nutrition
- **Feature-Needs:** Volume Landmarks, Exercise Evaluation Scores, Feedback-Loop, Periodization, RPE/RIR
- **Zahlungsbereitschaft:** $9.99-19.99/mo (investiert viel Zeit ins Training, Preis sekundär)
- **Churn-Risiko:** Sehr niedrig — Power User, bleibt wenn das Tool stimmt

### Persona 4: "Jenny" — Social Gym-Goer (20%)
- **Alter:** 22, weiblich, will mit Freunden trainieren, Progress teilen
- **Ziel:** Social Features, Workout Sharing, Community Challenges
- **Pain Points:** Strong hat null Social, Hevy's Social ist nett aber oberflächlich
- **Feature-Needs:** Workout Feed, Share PRs, Challenge Friends, Leaderboards
- **Zahlungsbereitschaft:** Free Tier mit Social, $4.99/mo für Premium Social Features
- **Churn-Risiko:** Hoch ohne Social Stickiness — niedrig MIT Freunden auf der Platform

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers

| Tier | Preis | Features | Ziel-Persona |
|------|-------|----------|-------------|
| **Free** | $0 | Unlimited Routines, Set Logging, Exercise DB (800+), Progress Charts, Workout History, Kalender, PRs, Rest Timer, Superset, Muscle Maps | Stefan, Jenny |
| **Plus** | $9.99/mo / $59.99/yr | AI Workout Generation, Muscle Recovery Map, Exercise Evaluation Scores, Feedback-Loop, RPE/RIR, Nutrition×Training Sync, Periodization, Advanced Analytics | Lara, Pavel |
| **Pro** | $19.99/mo / $119.99/yr | Volume Landmarks (MV/MEV/MAV/MRV), 3D Exercise Models, Form Check (CV), Custom Progressive Overload, Cross-Module Deep Integration, API Export | Pavel (Advanced) |
| **Coach** | $29.99/mo / $199.99/yr | Client Management, Program Builder, Bulk Assign, Coach Analytics, Marketplace Listing | Coaches |

### Revenue Streams
1. **Subscriptions** (75%) — Core Revenue
2. **Coach Marketplace Commission** (10%) — Programme verkauft über Marketplace
3. **Equipment Affiliate** (5%) — "Für diese Übung brauchst du Resistance Bands → [Link]"
4. **Wearable Partnerships** (5%) — Apple Watch / Wear OS Integration Features
5. **B2B Gym Partnerships** (5%) — White-Label Training für Gyms

### Conversion Strategy
- **Free → Plus:** "Du trainierst seit 3 Wochen regelmäßig — dein AI Coach hat einen personalisierten Plan für dich" (nach 3 Wochen Logging-Daten)
- **Plus → Pro:** "Dein Bench Press stagniert — Volume Landmarks zeigen du bist über MRV → Deload empfohlen (Pro Feature)"
- **vs. Strong:** "Unlimited Free Routines" = instant App Store differentiator
- **vs. Fitbod:** "$9.99 statt $12.99 UND Nutrition-Integration" = klares Upgrade

### Sweet-Spot Pricing Analyse
```
Strong:       $5/mo (Logging only)
Fitbod:       $12.99/mo (AI only)
GymStreak:    $19.99/mo (AI + 3D)
RP:           $14.99/mo (Periodization)
Boostcamp:    Free (Programs only)

→ Lumeos Plus $9.99/mo: Günstiger als Fitbod/GymStreak/RP
→ Mehr als Strong (AI + Nutrition)
→ Sweet Spot: Best Value für Training + Nutrition
```

---

## 🔧 Technical Architecture

### Tech Stack
```
Frontend:   Next.js 14 · TypeScript · Tailwind CSS
Backend:    Node.js + TypeScript
Database:   PostgreSQL (workout logs, programs)
Cache:      Redis (live workout session state)
Search:     Meilisearch (exercise search, <50ms)
Models:     Three.js (3D exercise models, Phase 3)
Offline:    SQLite (local workout cache, exercise DB)
Watch:      WatchKit (Apple Watch) / Wear OS SDK
```

### Exercise Database Schema
```typescript
interface Exercise {
  id: string;
  name: string;
  aliases: string[];              // "Bench", "Flat Bench Press"
  category: ExerciseCategory;     // compound | isolation | bodyweight | machine | cable
  primaryMuscles: MuscleGroup[];  // ['chest', 'triceps']
  secondaryMuscles: MuscleGroup[];// ['anterior_deltoid']
  equipment: Equipment[];         // ['barbell', 'flat_bench']
  
  // Science Layer
  evaluationScore?: number;       // 0-100 effectiveness for target muscle (Alpha Progression concept)
  mechanicalTension: 'high' | 'medium' | 'low';
  stretchPosition: boolean;       // Lengthened position = more hypertrophy
  fatigueRatio: number;           // Stimulus-to-Fatigue Ratio (SFR)
  
  // Media
  images: { start: string; end: string };
  video?: string;
  muscleMapSvg?: string;          // wger.de SVG overlay
  model3d?: string;               // Three.js model (Phase 3)
  
  // Instructions
  description: string;
  cues: string[];                 // "Drive through heels", "Chest up"
  commonMistakes: string[];       // "Butt lifting off bench"
}
```

### Progressive Overload Models
```typescript
type ProgressionModel = 
  | 'linear'            // Add weight every session (Beginner)
  | 'double_progression' // Hit rep range top → increase weight (Intermediate)
  | 'wave_loading'       // 3 weeks up, 1 deload (Intermediate)
  | 'daily_undulating'   // DUP: Heavy/Moderate/Light rotation (Advanced)
  | 'rpe_based'          // Auto-regulate by RPE (Advanced)
  | 'percentage_based';  // % of 1RM programming (Powerlifting)

interface ProgressionConfig {
  model: ProgressionModel;
  repRangeMin: number;    // e.g., 8
  repRangeMax: number;    // e.g., 12
  weightIncrement: number; // e.g., 2.5 kg
  deloadFrequency?: number; // every N weeks
  deloadPercentage?: number; // reduce by X%
}
```

### Volume Landmarks (per Muscle Group)
```typescript
interface VolumeLandmarks {
  muscleGroup: MuscleGroup;
  mv: number;   // Maintenance Volume (sets/week)
  mev: number;  // Minimum Effective Volume
  mav: number;  // Maximum Adaptive Volume
  mrv: number;  // Maximum Recoverable Volume
  
  // Personalized (learned from user data + feedback-loop)
  personalMav?: number;
  personalMrv?: number;
}

// Example: Quadriceps
// MV: 6 sets/week, MEV: 8, MAV: 14-18, MRV: 20-24
// Feedback-Loop: User reports high soreness at 18 sets → personal MRV ≈ 18
```

### Workout Session Architecture
```typescript
interface LiveWorkoutSession {
  id: string;
  startedAt: Date;
  routine: RoutineId;
  exercises: {
    exercise: ExerciseId;
    sets: {
      weight: number;
      reps: number;
      rpe?: number;         // 1-10
      rir?: number;         // Reps In Reserve
      completed: boolean;
      restTime?: number;    // seconds
      personalRecord?: 'weight' | 'reps' | 'volume' | 'estimated_1rm';
    }[];
    notes?: string;
    superset?: ExerciseId;
  }[];
  
  // Real-time Features
  restTimer: { duration: number; autoStart: boolean };
  previousPerformance: Map<ExerciseId, PreviousSet[]>;
  aiSuggestions?: { weight: number; reps: number }[];  // AI weight/rep suggestions
  
  // Post-Workout
  duration: number;
  totalVolume: number;     // kg × reps
  musclesWorked: MuscleGroup[];
  feedback?: {
    pump: Map<MuscleGroup, 1|2|3>;     // Low/Medium/High
    soreness: Map<MuscleGroup, 1|2|3>; // Next day
  };
}
```

### Offline-Fähigkeit
- **Full Offline Workout Logging** — SQLite local DB, sync on reconnect
- **Exercise DB cached locally** — 800+ exercises, images, instructions
- **Workout Queue** — Multiple offline workouts sync in order
- **Apple Watch Standalone** — Log sets without phone (Phase 2)

### Data Costs
| Resource | Cost | Notes |
|----------|------|-------|
| free-exercise-db | $0 | Public Domain, 800+ exercises |
| wger.de Muscle Maps | $0 | AGPL (open source) |
| Wrkout.xyz Videos | $125/mo | Phase 2, optional |
| 3D Models (custom) | $500-2K/model | Phase 3, selective |
| **Total MVP** | **$0** | All data sources free |

---

## ⚖️ Key Design Decisions

### 1. Unlimited Free Routines
**Decision:** Keine Limits auf Routinen/Workouts im Free Tier
**Rationale:** Strong's 3-Routine-Limit ist der #1 Kritikpunkt in Reviews (200K+ Bewertungen). Lumeos eliminiert das sofort. Cost: $0 (es kostet nichts, Routinen zu speichern). Stärkster User Acquisition Hebel gegen Strong.

### 2. 3 Archetypen kombinieren (Logging + AI + Programs)
**Decision:** Lumeos ist ALLE 3: manuelles Logging (wie Strong) + AI Generation (wie Fitbod) + Coach Programs (wie Boostcamp)
**Rationale:** User wollen nicht wählen. Montag: AI-generiertes Workout. Mittwoch: eigene Routine. Freitag: Coach-Program von Jeff Nippard. Kein Competitor bietet alle 3.

### 3. Exercise Evaluation Scores (von Alpha Progression)
**Decision:** Jede Übung bekommt einen Effectiveness Score (0-100) für das jeweilige Trainingsziel
**Rationale:** Alpha Progression hat das erfunden und NIEMAND hat es kopiert. "Lat Pulldown: 85/100 für Lat Development, Cable Crossover: 45/100" — hilft User die BESTEN Übungen zu wählen. Science-basiert (SFR, mechanical tension, stretch position).

### 4. Feedback-Loop (von RP Hypertrophy)
**Decision:** Post-Workout Feedback: Pump (1-3) + Soreness (1-3) pro Muskelgruppe
**Rationale:** RP hat bewiesen: Subjektives Feedback + Volume Tracking = personalisierte MV/MAV/MRV. 10 Sekunden Input, massive Datenqualität. Lumeos lernt die individuelle Recovery-Kapazität des Users.

### 5. Free-exercise-db + wger.de statt eigene DB
**Decision:** Open Source Exercise Data statt eigene Datenbank aufbauen
**Rationale:** 800+ Exercises (Public Domain) + SVG Muscle Maps (AGPL) = $0 MVP Cost. Eigene Exercise DB aufbauen dauert Monate und kostet tausende. Community-Beiträge füllen Lücken über Zeit.

### 6. Speed-First Set Logging UX
**Decision:** Set-Logging muss in <3 Sekunden pro Set möglich sein
**Rationale:** Strong's Erfolg basiert auf SPEED. Gym-User loggen zwischen Sets (60-90s Rest). Jede Sekunde zählt. Previous Performance vorausgefüllt, +/- Buttons für Weight, Swipe to Complete. Kein Loading, kein Lag.

### 7. RPE/RIR als Optional (nicht Default)
**Decision:** RPE/RIR Tracking ist verfügbar aber nicht standardmäßig an
**Rationale:** Beginner kennen RPE nicht und werden dadurch verwirrt. Advanced Lifter brauchen es für Auto-Regulation. Progressive Disclosure: Default = Weight × Reps. Plus Tier: RPE/RIR aktivierbar.

### 8. Nutrition × Training als Core Architecture
**Decision:** Training Module ist von Tag 1 für Cross-Module designed
**Rationale:** Das ist DER Lumeos USP. Nicht nachträglich angebaut. Datenmodell: jeder Workout hat einen Nutrition-Context (Pre/Post Meals), jedes Training beeinflusst Calorie Budget. Kein Competitor hat das.

---

## 🚀 Lumeos Training USP

### Primary USP: "The First Training App That Knows What You Eat, How You Recover, and What Your Body Needs"

Strong weiß was du hebst.
Fitbod schätzt deine Recovery.
**Lumeos WEISS:**
- Was du gehoben hast (Sets, Weight, Reps, RPE)
- Was du gegessen hast (Calories, Macros, 138 Micros (BLS))
- Wie erholt du bist (Recovery Score, HRV, Sleep, Muscle Readiness)
- Was du supplementierst (Creatine Pre, Magnesium Post)
- Was dein Blut sagt (CRP, Testosterone, Cortisol)
- Was dein Ziel ist (Lean Bulk Phase: MAV Training, Caloric Surplus)

**→ "Heute: Push Day. Recovery 82%. Volumen: 16 Sets (unter deinem MAV von 18). Empfohlene Exercises: Incline DB Press (Score 92/100), Cable Fly (Score 87/100). Pre-Workout: Creatine + Banana. Post-Workout: 40g Whey + 80g Carbs."**

Kein Competitor kann diesen Satz generieren.

### Secondary USPs

1. **Unlimited Free Routines**
   - Strong limitiert auf 3 → Lumeos: unbegrenzt, kostenlos
   - Sofortige Differenzierung in App Store Rankings
   - "#1 Reason to Switch from Strong"

2. **Exercise Evaluation Scores**
   - "Lat Pulldown: 92/100 für Lat-Hypertrophie, Cable Row: 78/100"
   - Hilft User die EFFEKTIVSTEN Übungen für ihr Ziel zu finden
   - Basierend auf Stimulus-to-Fatigue Ratio, Mechanical Tension, Stretch Position
   - KEIN Competitor außer Alpha Progression hat das

3. **Feedback-Loop (Pump/Soreness)**
   - 10 Sekunden Post-Workout Input → Lumeos lernt DEINE Recovery-Kapazität
   - Personalisierte Volume Landmarks (MV/MEV/MAV/MRV)
   - "Dein persönliches MAV für Chest: 16 Sets/Woche (Population Average: 14)"
   - Von RP inspiriert, aber für JEDEN zugänglich (nicht nur Powerlifter)

4. **Training-Aware Nutrition**
   - "Leg Day: +400 kcal, +30g Protein empfohlen"
   - Pre-Workout Meal Timing + Composition
   - Post-Workout Recovery Nutrition
   - KEIN Competitor verbindet das

5. **All 3 Modes: Log + AI + Programs**
   - Montag: AI generiert dein Workout
   - Mittwoch: Eigene Routine loggen
   - Freitag: Jeff Nippard's Programm aus dem Marketplace
   - Ein App für alles

### Must-Steal Features (priorisiert)
| # | Feature | Von | Priority |
|---|---------|-----|----------|
| 1 | Unlimited Free Routines | Anti-Strong | P0 |
| 2 | Personal Records Celebration 🎉 | Hevy | P0 |
| 3 | AI Workout Generation | Fitbod | P0 (Plus) |
| 4 | Muscle Recovery Map | Fitbod | P0 (Plus) |
| 5 | Exercise Evaluation Scores | Alpha Progression | P1 (Plus) |
| 6 | Feedback-Loop (Pump/Soreness) | RP Hypertrophy | P1 (Plus) |
| 7 | Plate Calculator | StrongLifts | P1 |
| 8 | 3D Exercise Models | GymStreak | P2 (Pro) |
| 9 | Coach Marketplace | Boostcamp | P2 |
| 10 | Nutrition × Training Integration | NIEMAND | P0 (Core USP) |

### Competitive Positioning
```
                    AI-Driven
                       ↑
                       |
         GymStreak  Fitbod  RP Hypertrophy
              |       |         |
              |    Alpha Progression
              |
    ←─────────────────────────────────→
  Nutrition+Training              Training Only
              |
              |  ★ LUMEOS ★
              |  (Training+Nutrition+AI)
              |
         Boostcamp   Hevy    Strong
              |       |         |
              |    JEFIT   StrongLifts
                       |
                       ↓
                   Manual/Logging
```

### Warum Lumeos gewinnt
| Kriterium | Strong | Hevy | Fitbod | RP | GymStreak | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Set Logging Speed | ✅ (Best) | ✅ | 🟡 | 🟡 | 🟡 | ✅ |
| Free Routines | ❌ (3 max) | ✅ | ❌ (Trial) | ❌ | ❌ | ✅ (Unlimited) |
| AI Workouts | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Exercise Scores | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Feedback-Loop | ❌ | ❌ | ❌ | ✅ (Best) | ❌ | ✅ |
| Volume Landmarks | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | 🟡 (Basic) | ✅ (Deep) |
| Recovery Integration | ❌ | ❌ | 🟡 (Guess) | ❌ | ❌ | ✅ (HRV+Sleep) |
| Coach Marketplace | ❌ | 🟡 | ❌ | ❌ | ❌ | ✅ |
| Social Features | ❌ | ✅ (Best) | ❌ | ❌ | ❌ | ✅ |
| 3D Models | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Phase 3) |
| **Price** | $5/mo | Free-$10 | $13/mo | $15/mo | $20/mo | **$9.99/mo** |
