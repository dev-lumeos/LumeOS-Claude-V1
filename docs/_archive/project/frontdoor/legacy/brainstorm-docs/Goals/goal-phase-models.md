# Goal Phase Models — Implementation Reference

## Phase Transition Logic

```
LUMEOS GOAL PHASE STATE MACHINE

                    ┌──────────────┐
                    │  ONBOARDING  │
                    │  (Day 1)     │
                    └──────┬───────┘
                           │
                    User selects goal
                           │
        ┌──────────┬───────┼───────┬──────────┐
        ▼          ▼       ▼       ▼          ▼
    ┌───────┐ ┌────────┐ ┌─────┐ ┌───────┐ ┌────────┐
    │  CUT  │ │ BULK   │ │HOLD │ │RECOMP │ │CONTEST │
    └───┬───┘ └────┬───┘ └──┬──┘ └───┬───┘ └────┬───┘
        │          │        │        │           │
        ▼          ▼        │        │           ▼
    ┌────────┐ ┌────────┐   │        │      ┌─────────┐
    │REVERSE │ │MINI-CUT│   │        │      │PEAK WEEK│
    │ DIET   │ │(opt.)  │   │        │      └────┬────┘
    └───┬────┘ └────┬───┘   │        │           │
        │          │        │        │           ▼
        └──────────┴────────┴────────┘      ┌────────┐
                    │                       │ REVERSE │
                    ▼                       │  DIET   │
              ┌──────────┐                  └────┬───┘
              │   NEW    │◄──────────────────────┘
              │  PHASE   │
              └──────────┘
```

---

## Phase Definitions (Implementation-Ready)

### FAT_LOSS
```json
{
  "phase": "FAT_LOSS",
  "variants": ["moderate", "aggressive"],
  "moderate": {
    "calorieDeficit": { "min": -400, "max": -600 },
    "rateOfLoss": "0.5-0.75% BW/week",
    "proteinMultiplier": { "min": 1.8, "max": 2.4, "unit": "g/kg" },
    "fatMinimum": { "value": 0.5, "unit": "g/kg" },
    "maxDuration": { "weeks": 20 },
    "dietBreak": { "every": 8, "duration": 1, "unit": "weeks" },
    "exitConditions": [
      "goalWeightReached",
      "goalBFReached",
      "maxDurationReached",
      "userRequest"
    ],
    "transitionsTo": ["REVERSE_DIET", "MAINTENANCE", "LEAN_BULK"]
  },
  "aggressive": {
    "calorieDeficit": { "min": -750, "max": -1000 },
    "rateOfLoss": "1.0-1.5% BW/week",
    "proteinMultiplier": { "min": 2.3, "max": 3.1, "unit": "g/kg" },
    "fatMinimum": { "value": 0.5, "unit": "g/kg" },
    "maxDuration": { "weeks": 8 },
    "dietBreak": { "every": 4, "duration": 1, "unit": "weeks" },
    "guards": [
      "strengthLoss > 10% → reduce deficit",
      "duration > 8 weeks → force transition"
    ],
    "transitionsTo": ["REVERSE_DIET"]
  }
}
```

### LEAN_BULK
```json
{
  "phase": "LEAN_BULK",
  "calorieSurplus": { "min": 200, "max": 400 },
  "rateOfGain": "0.25-0.5% BW/month",
  "proteinMultiplier": { "min": 1.6, "max": 2.2, "unit": "g/kg" },
  "fatPercent": { "min": 25, "max": 35, "unit": "% of calories" },
  "maxDuration": { "weeks": 52 },
  "guards": [
    "BF% increase > 2% in 4 weeks → reduce surplus",
    "strengthNotImproving 3+ weeks → check training",
    "weightGain > 1kg/week → surplus too high"
  ],
  "transitionsTo": ["MINI_CUT", "MAINTENANCE", "CONTEST_PREP"]
}
```

### REVERSE_DIET
```json
{
  "phase": "REVERSE_DIET",
  "weeklyCalorieIncrease": { "min": 50, "max": 150 },
  "primaryMacroIncrease": "carbs",
  "proteinMaintain": true,
  "maxDuration": { "weeks": 16 },
  "exitConditions": [
    "reachedEstimatedTDEE",
    "weightGain > 0.5kg/week (too fast)",
    "userSatisfied"
  ],
  "guards": [
    "weeklyWeightGain > 0.5kg → slow down increase",
    "hunger normalized → close to TDEE"
  ],
  "transitionsTo": ["MAINTENANCE", "LEAN_BULK", "FAT_LOSS"]
}
```

### CONTEST_PREP
```json
{
  "phase": "CONTEST_PREP",
  "totalDuration": { "min": 16, "max": 24, "unit": "weeks" },
  "phases": [
    { "name": "early", "weeks": "24-16", "deficit": -300, "cardio": "low" },
    { "name": "mid", "weeks": "16-8", "deficit": -600, "cardio": "moderate" },
    { "name": "late", "weeks": "8-2", "deficit": -750, "cardio": "high" },
    { "name": "peak_week", "weeks": 1, "special": true }
  ],
  "proteinMultiplier": { "min": 2.3, "max": 3.1, "unit": "g/kg" },
  "refeeds": {
    "startAfterWeek": 8,
    "frequency": "1-2x/week",
    "type": "high carb, moderate calories"
  },
  "peakWeek": {
    "waterManipulation": true,
    "carbDepletion": { "days": 3 },
    "carbLoad": { "days": 2 },
    "sodiumManipulation": true,
    "showDayCarbs": "high"
  },
  "guards": [
    "BF% < 5% (M) or < 10% (F) → health warning",
    "strength loss > 20% → reduce deficit",
    "hormonal symptoms → medical check"
  ],
  "transitionsTo": ["REVERSE_DIET"]
}
```

### RECOMP
```json
{
  "phase": "RECOMP",
  "strategies": {
    "calorieCycling": {
      "trainingDays": "+200 from TDEE",
      "restDays": "-300 from TDEE",
      "weeklyAverage": "~maintenance"
    },
    "steadyState": {
      "daily": "TDEE ± 100",
      "proteinHigher": true
    }
  },
  "proteinMultiplier": { "min": 2.0, "max": 2.4, "unit": "g/kg" },
  "successMetrics": [
    "BF% decreasing",
    "strength increasing",
    "weight relatively stable"
  ],
  "bestFor": ["beginners", "returning after break", "overweight with muscle memory"],
  "transitionsTo": ["LEAN_BULK", "FAT_LOSS"]
}
```

### MAINTENANCE
```json
{
  "phase": "MAINTENANCE",
  "calorieTarget": "TDEE ± 100",
  "proteinMultiplier": { "min": 1.4, "max": 2.0, "unit": "g/kg" },
  "duration": "indefinite",
  "purpose": [
    "Weight stabilization after cut/bulk",
    "Long-term sustainable eating",
    "Lifestyle mode"
  ],
  "transitionsTo": ["FAT_LOSS", "LEAN_BULK", "RECOMP", "CONTEST_PREP"]
}
```

### HYBRID
```json
{
  "phase": "HYBRID",
  "subGoals": [
    { "type": "strength", "weight": 0.4 },
    { "type": "endurance", "weight": 0.3 },
    { "type": "aesthetics", "weight": 0.3 }
  ],
  "nutrition": "slight surplus or maintenance",
  "training": {
    "strengthDays": 3,
    "conditioningDays": 2,
    "restDays": 2
  },
  "metrics": [
    "compound lift numbers",
    "VO2max or conditioning benchmarks",
    "body composition (BF%, measurements)"
  ]
}
```

### EXPERT_BB_ANNUAL
```json
{
  "phase": "EXPERT_BB_ANNUAL",
  "annualPlan": [
    { "months": "1-4", "phase": "LEAN_BULK", "focus": "Mass building" },
    { "months": "5-6", "phase": "MAINTENANCE", "focus": "Transition" },
    { "months": "7-10", "phase": "CONTEST_PREP", "focus": "Dieting down" },
    { "month": 11, "phase": "PEAK_WEEK + SHOW", "focus": "Competition" },
    { "month": 12, "phase": "REVERSE_DIET", "focus": "Recovery" }
  ],
  "autoTransitions": true,
  "coachOverride": true,
  "requires": ["experience >= advanced"]
}
```

---

## Adaptive Adjustment Algorithm

```typescript
interface WeeklyAdjustment {
  weightTrend: number;        // kg change this week (7-day avg)
  calorieAdherence: number;   // 0-100%
  strengthTrend: number;      // % change in compound lifts
  hrvTrend: number;           // HRV 7-day avg vs baseline
  sleepQuality: number;       // 0-100%
  phase: GoalPhase;
}

function adjustTargets(data: WeeklyAdjustment): Adjustment {
  const { weightTrend, phase } = data;

  if (phase === 'FAT_LOSS') {
    if (weightTrend > -0.1 && data.calorieAdherence > 85) {
      // Stalled despite good adherence
      return { action: 'REDUCE_CALORIES', amount: -100, reason: 'Plateau detected' };
    }
    if (weightTrend < -1.0) {
      // Losing too fast
      return { action: 'INCREASE_CALORIES', amount: +150, reason: 'Loss rate too aggressive' };
    }
    if (data.strengthTrend < -10) {
      // Losing strength
      return { action: 'INCREASE_PROTEIN', amount: +20, reason: 'Strength preservation' };
    }
  }

  if (phase === 'LEAN_BULK') {
    if (weightTrend > 0.75) {
      // Gaining too fast (mostly fat)
      return { action: 'REDUCE_CALORIES', amount: -100, reason: 'Gaining too fast' };
    }
    if (weightTrend < 0.1 && data.calorieAdherence > 85) {
      // Not gaining enough
      return { action: 'INCREASE_CALORIES', amount: +100, reason: 'Insufficient surplus' };
    }
  }

  if (data.hrvTrend < -15) {
    // Recovery declining
    return { action: 'RECOVERY_ALERT', reason: 'HRV declining — consider deload or extra rest' };
  }

  return { action: 'NO_CHANGE', reason: 'On track' };
}
```

---

## Onboarding Flow (Goal Selection)

```
STEP 1: Profile
├── Age, Gender, Height, Weight
├── Body Fat % (optional, photo estimation?)
└── Experience Level (Beginner / Intermediate / Advanced / Expert)

STEP 2: Primary Goal
├── 🔥 Fett verlieren (Fat Loss)
├── 💪 Muskeln aufbauen (Muscle Building)
├── ⚖️ Gewicht halten (Maintenance)
├── 🔄 Body Recomposition
├── ⚡ Hybrid (Kraft + Ausdauer + Optik)
├── 🏆 Contest Prep (Wettkampf)
├── 🔙 Reverse Diet
└── 📅 Expert Jahresplan

STEP 3: Goal Parameters
├── Zielgewicht (optional)
├── Zeithorizont
├── Aggressivität (langsam / moderat / schnell)
├── Training Frequenz (2-7x/Woche)
└── Besonderheiten (Vegan, Allergien, Fasting)

STEP 4: Calculated Targets
├── "Dein geschätztes TDEE: 2,850 kcal"
├── "Dein Ziel: 2,350 kcal (-500 Deficit)"
├── "Macros: 170g Protein | 85g Fett | 280g Carbs"
├── "Erwartetes Ergebnis: -0.5kg/Woche, Ziel in 16 Wochen"
└── [Start] [Anpassen] [Fragen?]
```
