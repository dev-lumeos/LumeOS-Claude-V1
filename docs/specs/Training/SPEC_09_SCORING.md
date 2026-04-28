# Training Module — Scoring Engine
> Spec Phase 9 | Deterministische Score-Berechnung

---

## Prinzipien

Alle Scores sind **Pure Functions** — testbar, deterministisch, kein AI.
Implementierungsort: `packages/scoring/src/training.ts`

---

## 1. Training Compliance Score (→ Goals)

```typescript
function calcTrainingScore(
  sessionsCompleted: number,
  sessionsPlanned:   number,
  volumeLandmarks:   VolumeLandmarkStatus[],
  strengthTrend:     number,   // % Verbesserung über 4 Wochen, 0.0–0.20+
  muscleBalance:     MuscleBalanceResult
): TrainingScore {

  // 1. Session-Adhärenz (0–1)
  const adherence = sessionsPlanned > 0
    ? Math.min(sessionsCompleted / sessionsPlanned, 1.0)
    : 0.5;  // Kein Plan → neutraler Wert

  // 2. Volume-in-Landmarks (0–1)
  // Wie viele Muskelgruppen befinden sich im MAV-Bereich?
  const inRange = volumeLandmarks.filter(
    l => l.status === 'optimal' || l.status === 'approaching_mrv'
  ).length;
  const volumeScore = volumeLandmarks.length > 0
    ? inRange / volumeLandmarks.length
    : 0.5;

  // 3. Stärke-Trend (0–1)
  // 0% gain → 0.0, 5%+ gain → 1.0 (linear)
  const strengthScore = Math.min(strengthTrend / 0.05, 1.0);

  // 4. Muskel-Balance (0–1)
  const balanceScore = muscleBalance.score / 100;

  // Gewichteter Score
  const raw =
    adherence    * 0.40 +
    volumeScore  * 0.30 +
    strengthScore * 0.20 +
    balanceScore * 0.10;

  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  return {
    score,
    status: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'block',
    breakdown: {
      session_adherence:    Math.round(adherence    * 100),
      volume_in_landmarks:  Math.round(volumeScore  * 100),
      strength_trend:       Math.round(strengthScore * 100),
      muscle_balance:       Math.round(balanceScore * 100),
    },
  };
}
```

---

## 2. 1RM Berechnung

```typescript
// Primär: Brzycki (genauer bei 1–10 Reps)
function brzycki1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || reps > 30) return weightKg;
  if (reps === 1) return weightKg;
  return weightKg / (1.0278 - 0.0278 * reps);
}

// Alternativ: Epley (häufiger bei hohen Reps)
function epley1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

// Rep-zu-1RM Prozentsatz-Tabelle (für Training-Planung)
const REPS_TO_PERCENT_1RM: Record<number, number> = {
  1: 1.00, 2: 0.95, 3: 0.93, 4: 0.90, 5: 0.87,
  6: 0.85, 7: 0.83, 8: 0.80, 10: 0.75, 12: 0.70,
  15: 0.65, 20: 0.60,
};

function percentOf1RM(reps: number): number {
  return REPS_TO_PERCENT_1RM[reps] ?? 0.60;
}
```

---

## 3. Progressive Overload Suggestions

```typescript
interface ProgressionConfig {
  model:            'linear' | 'double' | 'wave' | 'rpe' | 'dup';
  repRangeMin:      number;
  repRangeMax:      number;
  weightIncrement:  number;   // kg
  targetRPE?:       number;
  rpeRangeMin?:     number;
  rpeRangeMax?:     number;
  waveCurrentWeek?: number;
}

interface SessionHistory {
  sets: { weight_kg: number; reps: number; rpe?: number }[];
}

function calcProgressionSuggestion(
  config:   ProgressionConfig,
  history:  SessionHistory | null
): ProgressionSuggestion {

  if (!history || history.sets.length === 0) {
    return { weight_kg: null, reps: config.repRangeMin, reason: 'Keine History — Start mit leichtem Gewicht' };
  }

  const lastSets = history.sets.filter(s => s.weight_kg !== null);
  const lastWeight = lastSets[lastSets.length - 1]?.weight_kg ?? 0;
  const lastReps   = lastSets.map(s => s.reps);
  const avgReps    = lastReps.reduce((a, b) => a + b, 0) / lastReps.length;
  const lastRPE    = history.sets[history.sets.length - 1]?.rpe;

  switch (config.model) {

    case 'linear': {
      return {
        weight_kg: lastWeight + config.weightIncrement,
        reps: config.repRangeMin,
        reason: `Linear: +${config.weightIncrement}kg`,
      };
    }

    case 'double': {
      const allAtMax = lastSets.every(s => s.reps >= config.repRangeMax);
      if (allAtMax) {
        return {
          weight_kg: lastWeight + config.weightIncrement,
          reps: config.repRangeMin,
          reason: `Double: alle Sets bei ${config.repRangeMax} Reps → Gewicht +${config.weightIncrement}kg`,
        };
      }
      return {
        weight_kg: lastWeight,
        reps: Math.min(Math.round(avgReps) + 1, config.repRangeMax),
        reason: `Double: Reps steigern (${Math.round(avgReps)} → ${Math.min(Math.round(avgReps)+1, config.repRangeMax)})`,
      };
    }

    case 'wave': {
      const WAVE_INTENSITIES = [0.75, 0.85, 0.95, 0.65];
      const week = (config.waveCurrentWeek ?? 1) - 1;
      const intensity = WAVE_INTENSITIES[week % WAVE_INTENSITIES.length];
      return {
        weight_kg: Math.round(lastWeight * intensity * 2) / 2,  // round to 0.5kg
        reps: week < 3 ? config.repRangeMin : config.repRangeMax,
        reason: `Wave Woche ${(week % WAVE_INTENSITIES.length) + 1}: ${Math.round(intensity * 100)}% Intensität`,
      };
    }

    case 'rpe': {
      const targetRPE = config.targetRPE ?? 8;
      if (!lastRPE) {
        return { weight_kg: lastWeight, reps: config.repRangeMin, reason: 'RPE: kein RPE-Wert — Gewicht beibehalten' };
      }
      if (lastRPE > (config.rpeRangeMax ?? 9)) {
        const newWeight = lastWeight * 0.95;
        return { weight_kg: Math.round(newWeight * 2) / 2, reps: config.repRangeMin, reason: `RPE zu hoch (${lastRPE}) → -5%` };
      }
      if (lastRPE < (config.rpeRangeMin ?? 7)) {
        const newWeight = lastWeight * 1.03;
        return { weight_kg: Math.round(newWeight * 2) / 2, reps: config.repRangeMin, reason: `RPE zu niedrig (${lastRPE}) → +3%` };
      }
      return { weight_kg: lastWeight, reps: config.repRangeMin, reason: `RPE optimal (${lastRPE} ≈ ${targetRPE})` };
    }

    case 'dup': {
      // DUP rotiert: Kraft (3-5) → Hypertrophie (8-12) → Power (2-4)
      const phases = ['strength', 'hypertrophy', 'power'];
      const DUP_REPS = { strength: [3, 5], hypertrophy: [8, 12], power: [2, 4] };
      const DUP_INTENSITY = { strength: 0.87, hypertrophy: 0.75, power: 0.90 };
      const phaseIndex = (config.waveCurrentWeek ?? 0) % 3;
      const phase = phases[phaseIndex] as keyof typeof DUP_REPS;
      const [minReps] = DUP_REPS[phase];
      const intensityPct = DUP_INTENSITY[phase];
      const baseWeight = lastWeight / percentOf1RM(avgReps);
      return {
        weight_kg: Math.round(baseWeight * intensityPct * 2) / 2,
        reps: minReps,
        reason: `DUP ${phase}: ${Math.round(intensityPct*100)}% 1RM`,
      };
    }
  }
}
```

---

## 4. Deload Detection

```typescript
interface DeloadCheck {
  needed:  boolean;
  reason?: string;
  action?: 'reduce_weight' | 'reduce_volume' | 'rest_day';
}

function checkDeloadNeeded(
  recentSessions: SessionHistory[],
  config:         ProgressionConfig,
  feedbackHistory: PostWorkoutFeedback[]
): DeloadCheck {

  if (recentSessions.length < config.deloadThreshold) {
    return { needed: false };
  }

  const last3 = recentSessions.slice(-3);

  // 1. Reps fallen ab — 3 Sessions hintereinander
  const repsDecreasing = last3.every((session, i) => {
    if (i === 0) return true;
    const prevAvg = avg(last3[i-1].sets.map(s => s.reps));
    const currAvg = avg(session.sets.map(s => s.reps));
    return currAvg < prevAvg;
  });
  if (repsDecreasing) {
    return { needed: true, reason: 'Reps fallen seit 3 Sessions ab', action: 'reduce_weight' };
  }

  // 2. RPE konsistent zu hoch
  const avgRPE = avg(last3.flatMap(s => s.sets).map(s => s.rpe ?? 7));
  if (avgRPE > 9) {
    return { needed: true, reason: `Durchschnittliche RPE ${avgRPE.toFixed(1)} > 9`, action: 'reduce_volume' };
  }

  // 3. Feedback: Performance 😩 in 2+ Sessions
  const poorFeedback = feedbackHistory.slice(-3).filter(f => f.performance_rating === 3);
  if (poorFeedback.length >= 2) {
    return { needed: true, reason: '2+ Sessions mit schlechtem Feedback', action: 'reduce_volume' };
  }

  return { needed: false };
}

function avg(nums: number[]): number {
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
```

---

## 5. Volume Landmark Feedback-Loop

```typescript
function updateVolumeLandmarks(
  current: VolumeLandmark,
  feedback: PostWorkoutFeedback[],
  currentSets: number
): Partial<VolumeLandmark> {
  if (feedback.length < 5) {
    return {};  // Mindestens 5 Datenpunkte nötig
  }

  const last5 = feedback.slice(-5);
  const avgPump    = avg(last5.flatMap(f => Object.values(f.pump)));
  const avgSoreness = avg(last5.flatMap(f => Object.values(f.soreness)));

  let updates: Partial<VolumeLandmark> = {};

  // Kann mehr Volumen verarbeiten
  if (avgPump >= 2.5 && avgSoreness <= 1.5) {
    updates.personal_mav = Math.min(
      (current.personal_mav ?? current.mav_sets) + 1,
      current.mrv_sets - 2
    );
  }

  // MRV offensichtlich erreicht oder überschritten
  if (avgSoreness >= 2.5 && avgPump <= 1.5) {
    updates.personal_mrv = Math.min(
      currentSets,
      current.personal_mrv ?? current.mrv_sets
    );
  }

  return updates;
}
```

---

## 6. Muscle Balance Score

```typescript
interface MuscleBalanceResult {
  score:            number;   // 0–100
  push_sets_week:   number;
  pull_sets_week:   number;
  legs_sets_week:   number;
  push_pull_ratio:  number;
  status:           'balanced' | 'too_much_push' | 'too_much_pull' | 'neglecting_legs';
  recommendation:   string | null;
}

function calcMuscleBalance(weeklyVolume: Record<string, number>): MuscleBalanceResult {
  const PUSH_MUSCLES = ['Pectoralis Major', 'Anterior Deltoid', 'Lateral Deltoid', 'Triceps Brachii'];
  const PULL_MUSCLES = ['Latissimus Dorsi', 'Rhomboids', 'Posterior Deltoid', 'Biceps Brachii'];
  const LEGS_MUSCLES = ['Quadriceps', 'Hamstrings', 'Gluteus Maximus', 'Calves'];

  const pushSets = sum(PUSH_MUSCLES.map(m => weeklyVolume[m] ?? 0));
  const pullSets = sum(PULL_MUSCLES.map(m => weeklyVolume[m] ?? 0));
  const legsSets = sum(LEGS_MUSCLES.map(m => weeklyVolume[m] ?? 0));
  const total    = pushSets + pullSets + legsSets;

  if (total === 0) return { score: 50, push_sets_week: 0, pull_sets_week: 0, legs_sets_week: 0, push_pull_ratio: 1, status: 'balanced', recommendation: null };

  const ratio = pullSets > 0 ? pushSets / pullSets : 2;
  const legsPercent = total > 0 ? legsSets / total : 0;

  let score = 100;
  let status: MuscleBalanceResult['status'] = 'balanced';
  let recommendation: string | null = null;

  // Push/Pull Balance (ideal: 0.8–1.2)
  if (ratio > 1.5) {
    score -= 30;
    status = 'too_much_push';
    recommendation = 'Mehr Pull-Exercises (Rudern, Klimmzüge) empfohlen';
  } else if (ratio < 0.7) {
    score -= 20;
    status = 'too_much_pull';
    recommendation = 'Mehr Push-Exercises (Bankdrücken, OHP) empfohlen';
  } else if (ratio > 1.2) {
    score -= 10;
  }

  // Legs (ideal: ≥30% des Gesamtvolumens)
  if (legsPercent < 0.20 && legsSets > 0) {
    score -= 20;
    status = 'neglecting_legs';
    recommendation = 'Beintraining wird vernachlässigt — mehr Kniebeugen/RDL empfohlen';
  } else if (legsPercent < 0.25) {
    score -= 10;
  }

  return {
    score:           Math.max(0, score),
    push_sets_week:  pushSets,
    pull_sets_week:  pullSets,
    legs_sets_week:  legsSets,
    push_pull_ratio: Math.round(ratio * 100) / 100,
    status,
    recommendation,
  };
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
```

---

## 7. Strength Standard Comparison

```typescript
type StrengthLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';

function compareToStandard(
  estimated1RM: number,
  bodyweightKg: number,
  standard: StrengthStandard
): { level: StrengthLevel; ratio: number; percentile: number } {
  const ratio = estimated1RM / bodyweightKg;

  const levels: [StrengthLevel, number][] = [
    ['beginner',     standard.beginner],
    ['novice',       standard.novice],
    ['intermediate', standard.intermediate],
    ['advanced',     standard.advanced],
    ['elite',        standard.elite],
  ];

  let level: StrengthLevel = 'beginner';
  for (const [lvl, threshold] of levels) {
    if (ratio >= threshold) level = lvl;
  }

  // Grobe Perzentil-Schätzung
  const pctMap: Record<StrengthLevel, number> = {
    beginner: 10, novice: 30, intermediate: 50, advanced: 80, elite: 95
  };

  return { level, ratio: Math.round(ratio * 100) / 100, percentile: pctMap[level] };
}
```

---

## 8. TypeScript Types

```typescript
export type ProgressionModel = 'linear' | 'double' | 'wave' | 'rpe' | 'dup';

export interface ProgressionSuggestion {
  weight_kg: number | null;
  reps:      number;
  reason:    string;
}

export interface TrainingScore {
  score:  number;   // 0–100
  status: 'ok' | 'warn' | 'block';
  breakdown: {
    session_adherence:   number;
    volume_in_landmarks: number;
    strength_trend:      number;
    muscle_balance:      number;
  };
}

export interface VolumeLandmark {
  muscle_group_id: string;
  mv_sets:         number;
  mev_sets:        number;
  mav_sets:        number;
  mrv_sets:        number;
  personal_mav?:   number;
  personal_mrv?:   number;
  current_sets:    number;
  status:          'below_mev' | 'optimal' | 'approaching_mrv' | 'over_mrv';
}

export type VolumeLandmarkStatus = Pick<VolumeLandmark, 'status'>;

export interface PostWorkoutFeedback {
  pump:               Record<string, 1|2|3>;
  soreness:           Record<string, 1|2|3>;
  performance_rating: 1|2|3;
}

export interface StrengthStandard {
  beginner:     number;
  novice:       number;
  intermediate: number;
  advanced:     number;
  elite:        number;
}
```

---

## 9. Unit Tests

```typescript
describe('calcTrainingScore', () => {

  it('perfect week → 100', () => {
    const score = calcTrainingScore(
      5, 5,
      Array(6).fill({ status: 'optimal' }),
      0.05,
      { score: 100, push_sets_week: 20, pull_sets_week: 20, legs_sets_week: 18, push_pull_ratio: 1, status: 'balanced', recommendation: null }
    );
    expect(score.score).toBe(100);
    expect(score.status).toBe('ok');
  });

  it('missed 2 sessions, other metrics good → warn', () => {
    const score = calcTrainingScore(3, 5, Array(6).fill({ status: 'optimal' }), 0.03, { score: 80, push_pull_ratio: 1.1, status: 'balanced', recommendation: null, push_sets_week: 18, pull_sets_week: 16, legs_sets_week: 14 });
    expect(score.status).toBe('warn');
  });

});

describe('calcProgressionSuggestion - double', () => {

  it('all sets at max reps → increase weight', () => {
    const config = { model: 'double' as const, repRangeMin: 8, repRangeMax: 12, weightIncrement: 2.5 };
    const history = { sets: [{ weight_kg: 90, reps: 12 }, { weight_kg: 90, reps: 12 }, { weight_kg: 90, reps: 12 }] };
    const suggestion = calcProgressionSuggestion(config, history);
    expect(suggestion.weight_kg).toBe(92.5);
    expect(suggestion.reps).toBe(8);
  });

  it('not at max → increase reps', () => {
    const config = { model: 'double' as const, repRangeMin: 8, repRangeMax: 12, weightIncrement: 2.5 };
    const history = { sets: [{ weight_kg: 90, reps: 9 }, { weight_kg: 90, reps: 8 }] };
    const suggestion = calcProgressionSuggestion(config, history);
    expect(suggestion.weight_kg).toBe(90);
    expect(suggestion.reps).toBe(9);
  });

});

describe('calcMuscleBalance', () => {

  it('equal push/pull → balanced', () => {
    const result = calcMuscleBalance({
      'Pectoralis Major': 12, 'Triceps Brachii': 8,
      'Latissimus Dorsi': 14, 'Biceps Brachii': 8,
      'Quadriceps': 12, 'Hamstrings': 10,
    });
    expect(result.status).toBe('balanced');
    expect(result.score).toBeGreaterThan(80);
  });

  it('too much push → warning', () => {
    const result = calcMuscleBalance({
      'Pectoralis Major': 20, 'Triceps Brachii': 12,
      'Latissimus Dorsi': 6, 'Biceps Brachii': 4,
      'Quadriceps': 10,
    });
    expect(result.status).toBe('too_much_push');
    expect(result.recommendation).toBeTruthy();
  });

});
```
