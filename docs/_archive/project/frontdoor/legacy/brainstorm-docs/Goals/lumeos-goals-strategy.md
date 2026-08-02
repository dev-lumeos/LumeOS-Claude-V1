# Lumeos Goals Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **10 Apps analysiert** across 3 Tiers: Dumb Goals (MFP, YAZIO — static formulas), Adaptive Goals (MacroFactor, Carbon Diet Coach, RP Strength), Psychology-First (Noom, $400M+ Revenue)
- **Kein App hat Cross-Module Goals** — alle optimieren nur 1 Dimension (Weight ODER Training ODER Nutrition)

### Kritische Gaps
1. **Adaptive TDEE existiert, aber isoliert** — MacroFactor berechnet TDEE aus echten Daten (nicht Formeln), aber kennt dein Training-Volumen nicht
2. **Periodisierung existiert, aber isoliert** — RP Strength hat MV→MAV→MRV Feedback-Loop, aber kennt deine Nutrition/Recovery nicht
3. **Contest Prep existiert, aber isoliert** — Carbon ist der Benchmark für Reverse Diet + Prep, aber hat kein Supplement/Bloodwork-Tracking
4. **Psychology-First funktioniert** — Noom macht $400M+/yr NUR mit Verhaltensänderung, kaum Tracking-Tiefe
5. **NIEMAND hat:** Cross-Module Goals, Expert BB Annual Plan, Supplement Goals, Recovery Goals, Bloodwork-informed Goals

### Competitive Intelligence
- **MacroFactor:** TDEE-Benchmark — lernt aus echten Daten, korrigiert wöchentlich, $72/yr. Gold Standard für adaptive Calories
- **RP Strength:** Periodisierung-Benchmark — MV/MEV/MAV/MRV Feedback-Loop, bester Training AI
- **Carbon Diet Coach:** Reverse Diet + Contest Prep Benchmark — einziges Tool für Phase Management
- **Noom:** $400M+ Revenue beweist: Psychology > Features. Coaching + CBT + Behavior Change = zahlungswillige User
- **MacroFactor's Key Innovation:** Expenditure = Intake ± ΔWeight. Simple, accurate, no activity level guessing

---

## 🏗️ Lumeos Goals — Architektur

### System-Übersicht
```
┌──────────────────────────────────────────────────┐
│                GOALS MODULE                       │
├──────────────────────────────────────────────────┤
│  Goal Phases (State Machine)                      │
│  Fat Loss → Maintenance → Lean Bulk → Prep →      │
│  Reverse Diet → Recomp → Expert Annual Plan       │
├──────────────────────────────────────────────────┤
│  Adaptive Engine                                  │
│  TDEE Learner · Macro Adjuster · Volume Planner   │
├──────────────────────────────────────────────────┤
│  Cross-Module Goal Awareness                      │
│  Nutrition Goals · Training Goals · Recovery Goals │
│  Supplement Goals · Medical Goals                  │
├──────────────────────────────────────────────────┤
│  Behavioral Layer                                 │
│  Adherence Tracking · Nudges · Streaks · Milestones│
└──────────────────────────────────────────────────┘
```

### Goal Phase State Machine
```
                    ┌──────────────┐
                    │  ASSESSMENT  │ (Onboarding)
                    └──────┬───────┘
                           ↓
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ FAT LOSS │ │  RECOMP  │ │LEAN BULK │
        └────┬─────┘ └──────────┘ └────┬─────┘
             ↓                          ↓
        ┌──────────┐            ┌──────────────┐
        │MAINTENANCE│           │ CONTEST PREP │
        └──────────┘            └──────┬───────┘
                                       ↓
                                ┌──────────────┐
                                │ REVERSE DIET │
                                └──────────────┘

Expert BB Annual: Fat Loss → Lean Bulk → Mini-Cut → Bulk → Prep → Reverse → Offseason
(12-month periodized cycle with phase transitions)
```

### Adaptive TDEE Algorithm
```typescript
// MacroFactor-inspired but cross-module enhanced
function computeAdaptiveTDEE(data: WeeklyData): number {
  // Core: Expenditure = Intake ± Weight Change
  const weeklyIntake = data.nutritionLog.totalCalories; // from Nutrition Module
  const weightDelta = data.endWeight - data.startWeight; // kg
  const caloricDelta = weightDelta * 7700; // kcal per kg body mass change
  
  const rawTDEE = (weeklyIntake - caloricDelta) / 7;
  
  // Cross-Module Adjustments
  const trainingLoad = data.trainingModule.weeklyVolume; // from Training Module
  const recoveryScore = data.recoveryModule.avgScore;     // from Recovery Module
  const sleepQuality = data.recoveryModule.avgSleep;       // from Recovery Module
  
  // Exponential moving average (smooth, like MacroFactor)
  return ema(rawTDEE, previousTDEE, alpha: 0.3);
}
```

### Cross-Module Goal Integration
| Goal Type | Modules Involved | Example |
|-----------|-----------------|---------|
| **Weight Goal** | Nutrition + Training + Recovery | "Lose 0.5kg/week: 2300 kcal, 160g Protein, 4x Training" |
| **Strength Goal** | Training + Nutrition + Recovery + Supplements | "Squat 150kg: Progressive Overload + Caloric Surplus + Creatine + Recovery >70%" |
| **Body Composition** | ALL modules | "Recomp: Maintenance calories, high protein, periodized training, bloodwork monitoring" |
| **Health Goal** | Medical + Nutrition + Supplements | "Ferritin >80: Iron-rich foods + Supplement + Retest in 3 months" |
| **Recovery Goal** | Recovery + Training + Nutrition + Supplements | "Improve Recovery Score to >80%: Sleep >7h, Magnesium, Deload every 4th week" |
| **Supplement Goal** | Supplements + Medical + Nutrition | "Optimize Vitamin D: 5000IU daily → Retest in 8 weeks → Target 50-80 ng/mL" |

---

## 👤 Persona Design

### Persona 1: "Lena" — Weight Loss Seeker (40%)
- **Alter:** 31, weiblich, will 10kg abnehmen
- **Ziel:** Nachhaltiger Fat Loss, kein Jojo
- **Pain Points:** MFP gibt statische 1500 kcal/Tag → Metabolismus adaptiert, Plateau nach 4 Wochen
- **Feature-Needs:** Adaptive TDEE, Phase Transitions (Cut → Maintenance → Cut), Psychology/Nudges
- **Zahlungsbereitschaft:** $9.99/mo

### Persona 2: "Kai" — Strength Athlete (25%)
- **Alter:** 26, männlich, Powerlifting
- **Ziel:** Squat/Bench/Deadlift PRs, optimaler Bulk/Cut Cycle
- **Pain Points:** Kein Tool plant Annual Periodisierung, muss alles selbst in Excel machen
- **Feature-Needs:** Strength Goals, Periodization Planner, Lean Bulk Phase, Contest Prep (wenn PL-Meet)
- **Zahlungsbereitschaft:** $9.99/mo

### Persona 3: "Nina" — Bikini Competitor (15%)
- **Alter:** 28, weiblich, Bodybuilding Contest Prep
- **Ziel:** 12-week Prep → Stage → Reverse Diet → Offseason
- **Pain Points:** Carbon ist der einzige Coach der Reverse Diet versteht, aber hat kein Training/Supplement Tracking
- **Feature-Needs:** Contest Prep Phase, Reverse Diet Protocol, Refeed Days, Peak Week, Supplement Cycling, Bloodwork Monitoring
- **Zahlungsbereitschaft:** $19.99/mo (kritische Phase, Preis egal)

### Persona 4: "Frank" — Longevity Optimizer (20%)
- **Alter:** 50, männlich, präventive Gesundheit
- **Ziel:** Gewicht halten, Biomarker optimieren, Muskelmasse erhalten
- **Pain Points:** Fitness-Apps sind alle auf junge Gym-Bro ausgerichtet, nichts für seinen Use Case
- **Feature-Needs:** Health-based Goals (Biomarker Targets), Muscle Preservation, Anti-inflammatory Nutrition, Long-term Trends
- **Zahlungsbereitschaft:** $19.99/mo

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing (Teil des Lumeos Gesamt-Abos)
Goals ist kein standalone Modul sondern Core Feature des Lumeos Plus/Pro Tiers.

| Tier | Goal Features |
|------|---------------|
| **Free** | Static Goal (lose/gain/maintain), Basic Calorie Target, Weekly Weigh-in |
| **Plus** ($9.99/mo) | Adaptive TDEE, Phase Management (Fat Loss, Bulk, Maintenance), Streak System, Weekly Adjustments |
| **Pro** ($19.99/mo) | ALL Phases (Contest Prep, Reverse Diet, Recomp, Expert Annual), Cross-Module Goals, Bloodwork-informed Goals, Custom Phase Builder |

### Revenue Impact
- Goals Module ist der **Retention Driver** — User mit aktiven Goals haben 3x höhere Retention
- Phase Transitions = natürliche Upgrade-Momente: "Dein Cut ist fertig → starte Reverse Diet (Pro Feature)"
- Annual Plan = Lock-in: "Dein 12-Monats-Plan läuft → Abo kündigen = Plan verlieren"

---

## 🔧 Technical Architecture

### TDEE Formulas (Fallback + Calibration)
```typescript
// Harris-Benedict (Revised) — Onboarding Default
function harrisBenedict(sex: 'M'|'F', weight: number, height: number, age: number): number {
  if (sex === 'M') return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
}

// Mifflin-St Jeor — Alternative
function mifflinStJeor(sex: 'M'|'F', weight: number, height: number, age: number): number {
  if (sex === 'M') return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

// Activity Multipliers
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,      // 1-3 days/week
  moderate: 1.55,     // 3-5 days/week
  active: 1.725,      // 6-7 days/week
  veryActive: 1.9     // 2x/day or physical job
};

// After 2 weeks of data → switch to Adaptive TDEE
```

### Phase State Machine (Implementation)
```typescript
interface GoalPhase {
  type: 'fat_loss' | 'lean_bulk' | 'maintenance' | 'recomp' | 
        'contest_prep' | 'reverse_diet' | 'expert_annual';
  startDate: Date;
  targetDate?: Date;
  parameters: {
    weeklyWeightChange: number;  // kg/week target
    calorieTarget: number;       // daily
    proteinTarget: number;       // g/day
    carbTarget?: number;
    fatTarget?: number;
    refeedDays?: number;         // per week
    deloadWeek?: number;         // every N weeks
  };
  exitConditions: {
    targetWeight?: number;
    targetBodyfat?: number;
    maxDuration?: number;        // weeks
    metabolicAdaptation?: number; // TDEE drop % trigger
  };
  nextPhase?: GoalPhase['type']; // auto-transition
}
```

### Data Pipeline
```
Daily Input:
  Weight (morning, fasted) → 7-day moving average
  Nutrition Log → Total Calories + Macros
  Training Log → Volume + Intensity
  Recovery Score → Adjustment Factor
  
Weekly Processing:
  Adaptive TDEE Recalculation
  Phase Progress Check (on track / behind / ahead)
  Auto-Adjustment (±100-200 kcal if off-track)
  Phase Transition Check (exit conditions met?)
  
Monthly Processing:
  Trend Analysis (weight trajectory, strength trajectory)
  Phase Recommendation ("Consider transitioning to Maintenance")
  Bloodwork Reminder (if applicable to goal)
```

---

## ⚖️ Key Design Decisions

### 1. Adaptive TDEE ab Woche 2 (nicht sofort)
**Decision:** Woche 1: Formula-basiert (Harris-Benedict/Mifflin). Ab Woche 2: Adaptive aus echten Daten
**Rationale:** MacroFactor hat bewiesen dass adaptive TDEE massiv besser ist als Formeln. Aber braucht minimum 7-14 Tage Daten. Onboarding muss trotzdem sofort einen Wert liefern.

### 2. Phase Transitions sind Semi-Automatisch
**Decision:** System empfiehlt Phase-Wechsel, User bestätigt
**Rationale:** "Du hast dein Zielgewicht erreicht → Wechsel zu Maintenance empfohlen. Bestätigen?" Kein auto-switch der User überrascht. Aber auch kein Manual-Only der vergessen wird.

### 3. Cross-Module Goals als Pro Feature
**Decision:** Multi-Module Goals (Training + Nutrition + Recovery + Medical) nur im Pro Tier
**Rationale:** Free/Plus hat Single-Dimension Goals (Weight, Calories). Cross-Module ist der Power Feature und Upgrade-Trigger. "Dein Recovery Score beeinflusst dein Gewichtsziel → Upgrade für Insights".

### 4. Psychology-Layer inspiriert von Noom
**Decision:** Behavioral Nudges, Streaks, Milestones, Weekly Check-ins
**Rationale:** Noom macht $400M+/yr PRIMÄR mit Psychology, kaum Features. Goals Module braucht Behavioral Science: Commitment Devices, Progress Photos, Milestone Celebrations, Accountability.

### 5. Expert Annual Plan nur für Pro
**Decision:** 12-Monats Bodybuilding Periodisierung (Bulk→Cut→Prep→Reverse→Offseason) ist Pro-only
**Rationale:** Niche Feature für erfahrene Athleten. Hoher Wert, hohe Zahlungsbereitschaft. Carbon verlangt $8/mo nur dafür → Lumeos bietet es als Teil von Pro.

### 6. Weight = 7-Day Moving Average
**Decision:** Tägliche Schwankungen werden geglättet, System zeigt Trend nicht Taggewicht
**Rationale:** Tägliche Gewichtsschwankungen (1-2kg) frustrieren User. MacroFactor/Happy Scale beweisen: Moving Average reduziert Anxiety und zeigt den echten Trend.

---

## 🚀 Lumeos Goals USP

### Primary USP: "Goals That Adapt to Your Entire Life — Not Just Your Scale"

MacroFactor passt Kalorien an dein Gewicht an.
Lumeos passt ALLES an ALLES an:
- **TDEE lernt** aus deinem echten Verbrauch (wie MacroFactor)
- **Training-Volumen passt sich an** deine Recovery (wie RP Strength)
- **Supplement-Stack ändert sich** mit deiner Phase (Bulk: Creatine+Carbs, Cut: Caffeine+L-Carnitine)
- **Bloodwork-Monitoring** informiert deine Goals (Testosterone fällt → Cut pausieren?)
- **Recovery Score limitiert** dein Training-Volumen (nicht nur Willpower)

**Kein Competitor verbindet mehr als 2 dieser Dimensionen.**

### Secondary USPs

1. **Adaptive > Static**
   - "Dein TDEE ist 2847, nicht die 2500 die eine Formel sagt"
   - Wöchentliche Neuberechnung aus echten Daten
   - Keine Activity Level Ratespiele

2. **Phase Management**
   - Fat Loss → Maintenance → Lean Bulk → Contest Prep → Reverse Diet
   - Automatische Empfehlungen für Phase-Wechsel
   - Expert Annual Plan für Bodybuilder (12-Monats-Cycle)

3. **Cross-Module Goals**
   - "Squat 150kg" = Training Volume + Caloric Surplus + Sleep >7h + Creatine + Recovery >70%
   - Ein Ziel, alle Module arbeiten zusammen

4. **Behavioral Psychology**
   - Noom-inspirierte Nudges, nicht nur Zahlen
   - Progress Photos, Milestones, Streak System
   - Weekly Check-ins mit AI Coach

5. **Bloodwork-Informed Goals**
   - "Dein Ferritin ist unter 50 → Performance-Plateau erwartet → Supplementiere Eisen"
   - "Dein Testosterone Recovery nach dem Cut dauert noch → verlängere Maintenance"
   - KEIN Competitor hat das

### Warum Lumeos gewinnt
| Kriterium | MFP/YAZIO | MacroFactor | Carbon | RP Strength | Noom | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Adaptive TDEE | ❌ (Static) | ✅ (Best) | ✅ | ❌ | ❌ | ✅ |
| Phase Management | ❌ | 🟡 | ✅ (Best) | 🟡 | ❌ | ✅ |
| Training Goals | ❌ | ❌ | ❌ | ✅ (Best) | ❌ | ✅ |
| Nutrition Goals | 🟡 | ✅ | ✅ | ❌ | 🟡 | ✅ |
| Recovery-Aware | ❌ | ❌ | ❌ | 🟡 | ❌ | ✅ |
| Bloodwork-Aware | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Supplement Goals | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Psychology/CBT | ❌ | ❌ | ❌ | ❌ | ✅ (Best) | ✅ |
| Cross-Module | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Price** | Free-$80/yr | $72/yr | $96/yr | $120/yr | $240/yr | **$120/yr** |
