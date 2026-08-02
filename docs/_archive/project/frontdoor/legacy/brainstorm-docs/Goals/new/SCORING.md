# Goals Module — Scoring Engine

## 1. Adaptive TDEE Berechnung

```typescript
// packages/scoring/src/goals.ts

// Onboarding (Woche 1-2): Harris-Benedict Revised
function calcHarrisBenedict(gender: 'male'|'female', weight_kg: number, height_cm: number, age: number): number {
  if (gender === 'male') return 88.362 + 13.397*weight_kg + 4.799*height_cm - 5.677*age;
  return 447.593 + 9.247*weight_kg + 3.098*height_cm - 4.330*age;
}

// Alternative: Mifflin-St Jeor
function calcMifflin(gender: 'male'|'female', weight_kg: number, height_cm: number, age: number): number {
  const base = 10*weight_kg + 6.25*height_cm - 5*age;
  return gender === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
};

// Ab Woche 2: Adaptive TDEE aus echten Daten
function calcAdaptiveTDEE(
  weeklyIntake: number,         // kcal diese Woche total
  weightStart: number,          // kg Montag
  weightEnd: number,            // kg Sonntag
  previousTDEE: number          // letzter TDEE-Wert
): number {
  const deltaWeight = weightEnd - weightStart;                  // kg
  const caloricDelta = deltaWeight * 7700;                     // kcal (7700 kcal/kg Körpermasse)
  const rawTDEE = (weeklyIntake - caloricDelta) / 7;          // kcal/Tag

  // Exponential Moving Average (smoothing factor α = 0.3)
  const alpha = 0.3;
  return Math.round(alpha * rawTDEE + (1 - alpha) * previousTDEE);
}
```

---

## 2. Goal Progress Score

```typescript
// Gewichtungen je nach Goal-Typ
const CONTRIBUTION_WEIGHTS: Record<string, Record<string, number>> = {
  body_composition_loss:  { nutrition: 0.40, training: 0.25, recovery: 0.20, supplements: 0.10, medical: 0.05 },
  body_composition_gain:  { nutrition: 0.30, training: 0.35, recovery: 0.20, supplements: 0.10, medical: 0.05 },
  performance_strength:   { nutrition: 0.25, training: 0.40, recovery: 0.20, supplements: 0.10, medical: 0.05 },
  health:                 { nutrition: 0.25, training: 0.20, recovery: 0.20, supplements: 0.15, medical: 0.20 },
};

function calcGoalProgress(
  contributions: Record<string, number>,  // module → score 0-100
  goalType: string
): GoalProgress {
  const weights = CONTRIBUTION_WEIGHTS[goalType] ?? CONTRIBUTION_WEIGHTS['body_composition_gain'];

  let totalScore = 0, totalWeight = 0;
  const breakdown: Record<string, number> = {};

  for (const [module, weight] of Object.entries(weights)) {
    const score = contributions[module] ?? 0;
    breakdown[module] = Math.round(score * weight);
    totalScore += score * weight;
    totalWeight += weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  return {
    overall_score: overallScore,
    status: overallScore >= 80 ? 'excellent' : overallScore >= 65 ? 'on_track' : overallScore >= 50 ? 'needs_attention' : 'at_risk',
    breakdown,
  };
}
```

---

## 3. Bottleneck Identification

```typescript
function findBottleneck(
  contributions: Record<string, number>,
  goalType: string
): Bottleneck | null {
  const weights = CONTRIBUTION_WEIGHTS[goalType] ?? {};
  const avg = Object.values(contributions).reduce((s, v) => s + v, 0) / Object.keys(contributions).length;

  // Bottleneck = Modul mit größtem negativen Abstand zur Overall Performance,
  // gewichtet nach Wichtigkeit für dieses Ziel
  let worstModule = '';
  let worstGap = 0;

  for (const [module, score] of Object.entries(contributions)) {
    const weight = weights[module] ?? 0;
    const gap = (avg - score) * weight;
    if (gap > worstGap) {
      worstGap = gap;
      worstModule = module;
    }
  }

  if (!worstModule || worstGap < 5) return null;

  const improvementPotential = Math.round(worstGap);

  return {
    module:               worstModule,
    current_score:        contributions[worstModule],
    avg_score:            Math.round(avg),
    gap:                  Math.round(worstGap),
    improvement_potential_pct: improvementPotential,
    recommendation:       getBottleneckRecommendation(worstModule, contributions[worstModule]),
  };
}

function getBottleneckRecommendation(module: string, score: number): string {
  const rec: Record<string, string> = {
    nutrition:   score < 60 ? 'Makros tracken + Protein-Ziel priorisieren' : 'Protein heute Abend nochmals prüfen',
    training:    score < 60 ? 'Training-Frequenz erhöhen oder Routine optimieren' : 'Progressives Overload anwenden',
    recovery:    score < 60 ? 'Schlaf auf 7-8h erhöhen + Recovery-Aktivitäten' : 'Schlafdauer um 30 Min erhöhen',
    supplements: score < 60 ? 'Supplement-Einnahme konsistenter gestalten' : 'Abend-Supplements nicht vergessen',
    medical:     score < 60 ? 'Nächste Blutuntersuchung einplanen' : 'Biomarker weiter beobachten',
  };
  return rec[module] ?? '';
}
```

---

## 4. Achievement Probability

```typescript
function calcAchievementProbability(
  goalProgress: GoalProgress,
  daysElapsed: number,
  totalDays: number,
  recentContributions: number[],  // last 7 days
  plateauDetected: boolean
): number {
  // Basis: Expected vs Actual Progress Rate
  const expectedPct     = (daysElapsed / totalDays) * 100;
  const progressRatio   = goalProgress.overall_score / Math.max(expectedPct, 1);
  let probability       = Math.min(95, Math.max(5, progressRatio * 70));

  // Modifikatoren
  const recentTrend = recentContributions.length >= 3
    ? (recentContributions.slice(-3).reduce((s, v) => s + v, 0) / 3) - 70
    : 0;
  probability += recentTrend * 0.3;  // Guter Trend → +, schlechter → −

  if (plateauDetected)                probability -= 15;
  if (goalProgress.status === 'excellent') probability += 10;
  if (goalProgress.status === 'at_risk')   probability -= 20;

  return Math.round(Math.min(95, Math.max(5, probability)));
}
```

---

## 5. Body Composition Calculations

```typescript
function calcBodyMetrics(weight_kg: number, body_fat_pct: number, height_cm: number): BodyMetrics {
  const height_m    = height_cm / 100;
  const muscle_mass = weight_kg * (1 - body_fat_pct / 100);
  const bmi         = weight_kg / (height_m * height_m);
  // FFMI: Fat-Free Mass Index
  const ffmi        = muscle_mass / (height_m * height_m) + 6.1 * (1.8 - height_m);

  return {
    muscle_mass_kg: Math.round(muscle_mass * 10) / 10,
    bmi:            Math.round(bmi * 10) / 10,
    ffmi:           Math.round(ffmi * 10) / 10,
    ffmi_natural_max: 25,
    ffmi_elite_min:   25,
    ffmi_status: ffmi >= 25 ? 'elite' : ffmi >= 22 ? 'advanced' : ffmi >= 18 ? 'natural' : 'developing',
  };
}

function calcBodyRatios(c: BodyCircumferences): BodyRatios {
  const armAvg = (c.bicep_l_cm + c.bicep_r_cm) / 2;
  const legAvg = (c.thigh_l_cm + c.thigh_r_cm) / 2;
  return {
    shoulder_waist_ratio: c.waist_cm > 0 ? Math.round(c.shoulders_cm / c.waist_cm * 100) / 100 : null,
    golden_ratio_target:  1.618,
    arm_symmetry_pct:     armAvg > 0 ? Math.round(Math.min(c.bicep_l_cm, c.bicep_r_cm) / armAvg * 100 * 10) / 10 : null,
    leg_symmetry_pct:     legAvg > 0 ? Math.round(Math.min(c.thigh_l_cm, c.thigh_r_cm) / legAvg * 100 * 10) / 10 : null,
    v_taper_score:        c.waist_cm > 0 && c.shoulders_cm > 0
      ? Math.min(100, Math.round((c.shoulders_cm / c.waist_cm / 1.618) * 100))
      : null,
  };
}
```

---

## 6. Weekly Auto-Adjustment

```typescript
function calcWeeklyAdjustment(
  phase: string,
  weightTrend_kg: number,    // 7-Tage Δ
  calorieAdherence: number,  // 0-100
  strengthTrend: number,     // % Δ compound lifts
  currentCalories: number
): Adjustment {
  if (phase === 'fat_loss') {
    if (weightTrend_kg > -0.05 && calorieAdherence > 85)
      return { action: 'reduce_calories', delta: -100, reason: 'Kein Gewichtsverlust trotz guter Adherence' };
    if (weightTrend_kg < -1.0)
      return { action: 'increase_calories', delta: +150, reason: 'Verlust zu schnell (>1kg/Woche)' };
    if (strengthTrend < -10)
      return { action: 'increase_protein', delta_protein_g: +20, reason: 'Kraftverlust — Muskelschutz' };
  }
  if (phase === 'lean_bulk') {
    if (weightTrend_kg > 0.8)
      return { action: 'reduce_calories', delta: -100, reason: 'Zunahme zu schnell (Fettzunahme)' };
    if (weightTrend_kg < 0.1 && calorieAdherence > 85)
      return { action: 'increase_calories', delta: +100, reason: 'Keine Zunahme trotz Surplus' };
  }
  if (phase === 'reverse_diet') {
    if (weightTrend_kg > 0.5)
      return { action: 'slow_reverse', delta: 0, reason: 'Gewichtszunahme zu schnell' };
    return { action: 'increase_calories', delta: +100, reason: 'Wöchentliche Reverse Diet Erhöhung' };
  }
  return { action: 'no_change', delta: 0, reason: 'Auf Kurs' };
}
```

---

## 7. TypeScript Types

```typescript
export type GoalPhaseType =
  'fat_loss' | 'lean_bulk' | 'maintenance' | 'recomp' |
  'contest_prep' | 'reverse_diet' | 'expert_bb_annual' | 'mini_cut' | 'peak_week';

export interface GoalProgress {
  overall_score:  number;
  status:         'excellent' | 'on_track' | 'needs_attention' | 'at_risk';
  breakdown:      Record<string, number>;
}

export interface Bottleneck {
  module:                     string;
  current_score:              number;
  avg_score:                  number;
  gap:                        number;
  improvement_potential_pct:  number;
  recommendation:             string;
}

export interface Adjustment {
  action:            string;
  delta?:            number;
  delta_protein_g?:  number;
  reason:            string;
}

export interface BodyMetrics {
  muscle_mass_kg:    number;
  bmi:               number;
  ffmi:              number;
  ffmi_natural_max:  number;
  ffmi_status:       'developing' | 'natural' | 'advanced' | 'elite';
}

export interface BodyRatios {
  shoulder_waist_ratio:  number | null;
  golden_ratio_target:   number;
  arm_symmetry_pct:      number | null;
  leg_symmetry_pct:      number | null;
  v_taper_score:         number | null;
}
```
