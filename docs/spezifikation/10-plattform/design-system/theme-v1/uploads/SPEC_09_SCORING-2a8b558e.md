# Recovery Module — Scoring Engine
> Spec Phase 9 | Deterministische Score-Berechnung

---

## Pure Functions in `packages/scoring/src/recovery.ts`

---

## 1. Hauptfunktion: calcRecoveryScore

```typescript
interface RecoveryScoreInput {
  checkin: {
    sleep_quality?:     number;   // 1–10
    sleep_hours?:       number;
    subjective_feeling?: number;  // 1–10
    soreness:           Record<string, number>;  // muscle → 0–3
    mood?:              'motivated'|'good'|'neutral'|'tired'|'sick';
    stress_level?:      number;   // 1–10
    hrv_rmssd?:         number;   // optional
  };
  hrv_baseline?:        HRVBaseline | null;
  acwr?:                number;   // Acute/Chronic Workload Ratio
  nutrition_compliance?: number;  // 0–100
  modalities_today?:    { modality_type: string }[];
  sleep_data?:          SleepData | null;   // Wearable
}

function calcRecoveryScore(input: RecoveryScoreInput): RecoveryScoreResult {
  const { checkin, hrv_baseline, acwr, nutrition_compliance, modalities_today, sleep_data } = input;

  const hasHRV     = !!checkin.hrv_rmssd && !!hrv_baseline && hrv_baseline.data_points >= 7;
  const hasWearable = !!sleep_data;
  const mode = hasWearable ? 'wearable' : hasHRV ? 'hrv' : 'manual';

  // Sub-Scores
  const sleepQS   = calcSleepQualityScore(checkin.sleep_quality, sleep_data);
  const sleepDS   = calcSleepDurationScore(checkin.sleep_hours, sleep_data);
  const deepS     = hasWearable ? calcDeepSleepScore(sleep_data!) : null;
  const subjectS  = ((checkin.subjective_feeling ?? 7) / 10) * 100;
  const sorenessS = calcSorenessScore(checkin.soreness);
  const moodS     = MOOD_SCORE[checkin.mood ?? 'neutral'];
  const hrvS      = hasHRV ? calcHRVScore(checkin.hrv_rmssd!, hrv_baseline!) : null;
  const trainingS = calcTrainingLoadScore(acwr);
  const nutritionS = nutrition_compliance ?? 70;
  const bonus     = calcModalityBonus(modalities_today ?? []);

  let score: number;
  const components: Record<string, number | null> = {};

  if (mode === 'manual') {
    score = (
      sleepQS   * 0.30 +
      sleepDS   * 0.15 +
      subjectS  * 0.15 +
      sorenessS * 0.10 +
      trainingS * 0.15 +
      nutritionS * 0.10 +
      moodS     * 0.05
    ) + bonus;
    Object.assign(components, {
      sleep_quality_score: sleepQS, sleep_duration_score: sleepDS,
      subjective_score: subjectS, soreness_score: sorenessS,
      training_load_score: trainingS, nutrition_score: nutritionS,
      mood_score: moodS, modality_bonus: bonus,
    });

  } else if (mode === 'hrv') {
    score = (
      hrvS!     * 0.25 +
      sleepQS   * 0.15 +
      sleepDS   * 0.15 +
      subjectS  * 0.10 +
      sorenessS * 0.10 +
      trainingS * 0.15 +
      nutritionS * 0.10
    ) + bonus;
    Object.assign(components, {
      hrv_score: hrvS, sleep_quality_score: sleepQS, sleep_duration_score: sleepDS,
      subjective_score: subjectS, soreness_score: sorenessS,
      training_load_score: trainingS, nutrition_score: nutritionS,
      modality_bonus: bonus,
    });

  } else { // wearable
    const efficiencyS = (sleep_data!.sleep_efficiency ?? 85);
    score = (
      hrvS!       * 0.25 +
      sleepQS     * 0.10 +
      sleepDS     * 0.10 +
      deepS!      * 0.10 +
      efficiencyS * 0.05 +
      subjectS    * 0.10 +
      sorenessS   * 0.10 +
      trainingS   * 0.15 +
      nutritionS  * 0.05
    ) + bonus;
    Object.assign(components, {
      hrv_score: hrvS, sleep_quality_score: sleepQS, sleep_duration_score: sleepDS,
      deep_sleep_score: deepS, sleep_efficiency_score: efficiencyS,
      subjective_score: subjectS, soreness_score: sorenessS,
      training_load_score: trainingS, nutrition_score: nutritionS,
      modality_bonus: bonus,
    });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const readiness_level = getReadinessLevel(score);

  return { score, readiness_level, components, mode, intensity_recommendation: getIntensityRec(score) };
}
```

---

## 2. Sub-Score Funktionen

```typescript
function calcSleepQualityScore(quality?: number, sleep_data?: SleepData | null): number {
  if (sleep_data?.sleep_efficiency) {
    return sleep_data.sleep_efficiency;  // direkt 0–100
  }
  return ((quality ?? 7) / 10) * 100;
}

function calcSleepDurationScore(hours?: number, sleep_data?: SleepData | null): number {
  const minutes = sleep_data?.total_sleep_minutes ?? (hours ?? 7) * 60;
  return Math.min(minutes / 480, 1.0) * 100;  // vs. 8h = 480min
}

function calcDeepSleepScore(sleep: SleepData): number {
  const deepPct = (sleep.deep_sleep_minutes ?? 0) / Math.max(sleep.total_sleep_minutes ?? 480, 1);
  return Math.min(deepPct / 0.20, 1.0) * 100;  // 20% deep = 100%
}

function calcSorenessScore(soreness: Record<string, number>): number {
  const values = Object.values(soreness);
  if (!values.length) return 100;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round((1 - avg / 3) * 100);
}

const MOOD_SCORE: Record<string, number> = {
  motivated: 100, good: 80, neutral: 60, tired: 30, sick: 10,
};

function calcHRVScore(rmssd: number, baseline: HRVBaseline): number {
  if (baseline.data_points < 7) return 70;
  const z = (rmssd - baseline.avg_rmssd) / Math.max(baseline.stddev_rmssd, 1);
  return Math.max(0, Math.min(100, Math.round(70 + z * 15)));
}

function calcTrainingLoadScore(acwr?: number): number {
  if (!acwr) return 70;
  if (acwr >= 0.8 && acwr <= 1.2)  return 100;
  if (acwr > 1.2 && acwr <= 1.5)   return Math.round(100 - (acwr - 1.2) * 133);
  if (acwr > 1.5)                   return Math.max(0, Math.round(60 - (acwr - 1.5) * 100));
  return 85;
}

function calcModalityBonus(modalities: { modality_type: string }[]): number {
  const BONUS: Record<string, number> = {
    sauna: 2.0, cold_plunge: 1.5, contrast_therapy: 2.0, massage: 2.5,
    foam_rolling: 0.5, stretching: 0.5, yoga: 0.75, meditation: 1.0,
    breathwork: 1.0, nap: 1.5, active_recovery: 0.5,
  };
  const total = modalities.reduce((sum, m) => sum + (BONUS[m.modality_type] ?? 0.5), 0);
  return Math.min(5, total);
}

function getReadinessLevel(score: number): ReadinessLevel {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'moderate';
  if (score >= 60) return 'poor';
  return 'rest';
}

function getIntensityRec(score: number): string {
  if (score >= 90) return 'high_intensity';
  if (score >= 80) return 'moderate_to_high';
  if (score >= 70) return 'moderate';
  if (score >= 60) return 'light';
  return 'rest';
}
```

---

## 3. Muscle Recovery Berechnung

```typescript
function calcMuscleRecoveryMap(
  trainingLogs: TrainingLoadLog[],
  checkin: RecoveryCheckin,
  nutritionData?: { protein_pct: number; calorie_pct: number }
): MuscleRecoveryResult[] {

  // Alle Muskeln aus Training-Logs der letzten 7 Tage
  const muscleData = aggregateMuscleData(trainingLogs);
  const results: MuscleRecoveryResult[] = [];

  for (const [muscle, data] of Object.entries(muscleData)) {
    const pct = calcMusclePct(muscle, data, checkin, nutritionData);
    results.push({
      muscle_group: muscle,
      recovery_pct: pct,
      status: pct >= 80 ? 'ready' : pct >= 50 ? 'recovering' : 'not_ready',
      hours_since_trained: data.hours_since,
      estimated_ready_in_hours: estimateReadyIn(pct, muscle),
    });
  }

  return results.sort((a, b) => b.recovery_pct - a.recovery_pct);
}

function calcMusclePct(
  muscle: string,
  data: { hours_since: number; sets: number },
  checkin: RecoveryCheckin,
  nutrition?: { protein_pct: number; calorie_pct: number }
): number {
  const base = baseRecoveryCurve(data.hours_since);
  const volMod = getVolumeMod(data.sets);
  const sleepMod = getSleepMod(checkin.sleep_quality ?? 7);
  const nutMod = nutrition
    ? getNutritionMod(nutrition.protein_pct, nutrition.calorie_pct) : 1.0;
  const soreMod = getSorenessMod(checkin.soreness?.[MUSCLE_SLUG_MAP[muscle]] ?? 0);
  return Math.min(100, Math.round(base * volMod * sleepMod * nutMod * soreMod));
}

function estimateReadyIn(currentPct: number, muscle: string): number {
  if (currentPct >= 80) return 0;
  const targetPct = 80;
  const params = MUSCLE_PARAMS[muscle] ?? { base_recovery_h: 48 };
  const estimatedTotal = params.base_recovery_h;
  return Math.round(estimatedTotal * (1 - currentPct / targetPct));
}
```

---

## 4. Übertraining Detection

```typescript
function checkOvertSigns(userData: OvertSignalData): OvertSigns {
  const signals: OvertSignal[] = [
    {
      id: 'score_low',
      active: userData.recovery_3d_avg < 55,
      value: userData.recovery_3d_avg,
      threshold: 55,
      days: 3,
    },
    {
      id: 'hrv_low',
      active: !!userData.hrv_baseline && userData.hrv_7d_avg < userData.hrv_baseline * 0.90,
      value: userData.hrv_7d_avg,
      threshold: userData.hrv_baseline * 0.90,
      days: 7,
    },
    {
      id: 'sleep_poor',
      active: userData.sleep_quality_3d_avg < 6,
      value: userData.sleep_quality_3d_avg,
      threshold: 6,
      days: 3,
    },
    {
      id: 'fatigue',
      active: userData.subjective_3d_avg <= 4,
      value: userData.subjective_3d_avg,
      threshold: 4,
      days: 3,
    },
    {
      id: 'soreness',
      active: userData.soreness_high_days >= 3,
      value: userData.soreness_high_days,
      threshold: 3,
      days: 7,
    },
    {
      id: 'acwr_high',
      active: userData.current_acwr > 1.5,
      value: userData.current_acwr,
      threshold: 1.5,
      days: 1,
    },
    {
      id: 'mood_low',
      active: userData.motivation_5d_avg <= 3,
      value: userData.motivation_5d_avg,
      threshold: 3,
      days: 5,
    },
    {
      id: 'performance',
      active: userData.training_trend === 'declining',
      value: 0,
      threshold: 0,
      days: 7,
    },
  ];

  const activeSignals = signals.filter(s => s.active);
  const count = activeSignals.length;

  return {
    signals: activeSignals,
    count,
    severity:
      count === 0 ? 'none' :
      count <= 2  ? 'low' :
      count <= 4  ? 'moderate' :
      count <= 6  ? 'high' : 'critical',
  };
}
```

---

## 5. For-Goals Output

```typescript
function buildGoalsContribution(score: RecoveryScoreResult, checkinStreak: number): GoalsContribution {
  return {
    module: 'recovery',
    compliance_score: score.score,
    details: {
      recovery_score:     score.score,
      readiness_level:    score.readiness_level,
      checkin_completed:  true,
      overtraining_risk:  'low',
      checkin_streak,
    },
  };
}
```

---

## 6. Unit Tests

```typescript
describe('calcRecoveryScore', () => {

  it('perfect sleep + motivated + no soreness → >90', () => {
    const result = calcRecoveryScore({
      checkin: { sleep_quality: 10, sleep_hours: 8.5, subjective_feeling: 10, soreness: {}, mood: 'motivated' },
      acwr: 1.0, nutrition_compliance: 95,
    });
    expect(result.score).toBeGreaterThan(90);
    expect(result.readiness_level).toBe('excellent');
  });

  it('sick + 4h sleep + extreme soreness → <30', () => {
    const result = calcRecoveryScore({
      checkin: { sleep_quality: 3, sleep_hours: 4, subjective_feeling: 2,
                 soreness: { chest: 3, legs: 3, back: 3 }, mood: 'sick' },
      acwr: 1.8, nutrition_compliance: 50,
    });
    expect(result.score).toBeLessThan(30);
    expect(result.readiness_level).toBe('rest');
  });

  it('modality bonus capped at 5', () => {
    const bonus = calcModalityBonus([
      { modality_type: 'massage' },    // 2.5
      { modality_type: 'sauna' },      // 2.0
      { modality_type: 'cold_plunge' }, // 1.5 → capped
    ]);
    expect(bonus).toBe(5);
  });

  it('ACWR 1.6 → training load score penalized', () => {
    expect(calcTrainingLoadScore(1.6)).toBeLessThan(50);
  });

  it('HRV +2σ über Baseline → 100 score', () => {
    const baseline = { avg_rmssd: 38, stddev_rmssd: 5, data_points: 30 };
    expect(calcHRVScore(48, baseline)).toBeGreaterThan(95);
  });

  it('HRV -2σ unter Baseline → 40 score', () => {
    const baseline = { avg_rmssd: 38, stddev_rmssd: 5, data_points: 30 };
    expect(calcHRVScore(28, baseline)).toBeLessThan(45);
  });

});

describe('calcMuscleRecovery', () => {

  it('72h rest + good sleep + no soreness → >80%', () => {
    const pct = calcMusclePct('Quadriceps',
      { hours_since: 72, sets: 10 },
      { sleep_quality: 8, soreness: {} },
      { protein_pct: 0.9, calorie_pct: 1.0 }
    );
    expect(pct).toBeGreaterThan(80);
  });

  it('20h after 20 sets + soreness 3 → <25%', () => {
    const pct = calcMusclePct('Quadriceps',
      { hours_since: 20, sets: 20 },
      { sleep_quality: 7, soreness: { quadriceps: 3 } },
      { protein_pct: 0.8, calorie_pct: 0.9 }
    );
    expect(pct).toBeLessThan(25);
  });

});
```
