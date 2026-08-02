# Medical Module — Scoring Engine
> Spec Phase 9 | System Scores, Alerts, Trend-Algorithmen

---

## 1. System Score Berechnung

```typescript
// packages/scoring/src/medical.ts

const SYSTEM_MARKERS: Record<string, string[]> = {
  liver:          ['ALT', 'AST', 'GGT', 'ALP', 'Bilirubin Total', 'Albumin'],
  cardiovascular: ['LDL', 'HDL', 'Triglycerides', 'hs-CRP', 'Homocysteine', 'ApoB'],
  kidney:         ['Creatinine', 'BUN', 'eGFR', 'Uric Acid'],
  hormonal:       ['Total Testosterone', 'Estradiol', 'Cortisol (AM)', 'TSH', 'Free T3', 'Prolactin'],
  metabolic:      ['HbA1c', 'Glucose (fasting)', 'Insulin (fasting)', 'HOMA-IR'],
};

const FLAG_SCORE: Record<string, number> = {
  optimal:      100,
  normal:        75,
  low:           40,
  high:          40,
  critical_low:  10,
  critical_high: 10,
};

function calcSystemScore(
  system: string,
  userValues: LatestBiomarker[]
): SystemScore {
  const markerNames = SYSTEM_MARKERS[system];
  const scores: number[] = [];

  for (const name of markerNames) {
    const val = userValues.find(v =>
      v.biomarker_name === name ||
      v.biomarker_common_name === name ||
      v.biomarker_abbreviation === name
    );
    if (!val?.current_flag) continue;
    scores.push(FLAG_SCORE[val.current_flag] ?? 50);
  }

  if (!scores.length) return { score: null, status: 'no_data', marker_count: 0, missing: markerNames.length };

  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  return {
    score:        Math.round(avg),
    status:       avg >= 85 ? 'optimal' : avg >= 65 ? 'normal' : avg >= 40 ? 'warn' : 'critical',
    marker_count: scores.length,
    missing:      markerNames.length - scores.length,
  };
}

function calcOverallHealthScore(systems: Record<string, SystemScore>): OverallScore {
  const WEIGHTS: Record<string, number> = {
    cardiovascular: 0.25,
    metabolic:      0.25,
    liver:          0.15,
    kidney:         0.15,
    hormonal:       0.20,
  };

  let total = 0, totalW = 0;
  for (const [sys, w] of Object.entries(WEIGHTS)) {
    const s = systems[sys];
    if (s?.score != null) { total += s.score * w; totalW += w; }
  }

  const score = totalW > 0 ? Math.round(total / totalW) : 0;
  return {
    score,
    status:    score >= 85 ? 'optimal' : score >= 70 ? 'good' : score >= 55 ? 'fair' : 'poor',
    data_completeness: totalW,
  };
}
```

---

## 2. Biomarker Flag Berechnung

```typescript
interface BiomarkerRanges {
  lab_range_min?:    number;
  lab_range_max?:    number;
  optimal_range_min?: number;
  optimal_range_max?: number;
  critical_low_value?:  number;
  critical_high_value?: number;
  gender_specific_ranges?: Record<string, Record<string, number>>;
}

function calcBiomarkerFlag(
  value: number,
  ranges: BiomarkerRanges,
  gender: 'male' | 'female',
  age: number
): string {
  // Gender-spezifische Ranges überschreiben Defaults
  const gRange = ranges.gender_specific_ranges?.[gender];
  const optMin = gRange?.optimal_min  ?? ranges.optimal_range_min;
  const optMax = gRange?.optimal_max  ?? ranges.optimal_range_max;
  const labMin = gRange?.lab_min      ?? ranges.lab_range_min;
  const labMax = gRange?.lab_max      ?? ranges.lab_range_max;
  const critLow  = ranges.critical_low_value;
  const critHigh = ranges.critical_high_value;

  if (critLow  != null && value <= critLow)              return 'critical_low';
  if (critHigh != null && value >= critHigh)             return 'critical_high';
  if (optMin != null && optMax != null &&
      value >= optMin && value <= optMax)                return 'optimal';
  if (labMin != null && labMax != null &&
      value >= labMin && value <= labMax)                return 'normal';
  if (labMin != null && value < labMin)                  return 'low';
  return 'high';
}
```

---

## 3. Alert-Generierung

```typescript
async function generateAlertsForNewResults(
  userId: string,
  newResults: UserBiomarkerResult[]
): Promise<MedicalAlert[]> {
  const alerts: MedicalAlert[] = [];

  for (const result of newResults) {
    if (result.current_flag === 'critical_low' || result.current_flag === 'critical_high') {
      alerts.push({
        user_id:         userId,
        biomarker_id:    result.biomarker_id,
        alert_type:      result.current_flag === 'critical_low' ? 'critical_low' : 'critical_high',
        severity:        'critical',
        triggered_value: result.value,
      });
    } else if (result.current_flag === 'low' || result.current_flag === 'high') {
      alerts.push({
        user_id:         userId,
        biomarker_id:    result.biomarker_id,
        alert_type:      'out_of_range',
        severity:        'warning',
        triggered_value: result.value,
      });
    }
  }

  // Monitoring-Overdue Alerts
  const overdue = await getMedicationsWithOverdueMonitoring(userId);
  for (const med of overdue) {
    alerts.push({
      user_id:      userId,
      medication_id: med.id,
      alert_type:   'monitoring_overdue',
      severity:     'info',
    });
  }

  return alerts;
}
```

---

## 4. Trend-Berechnung (Lineare Regression)

```typescript
interface TrendResult {
  direction:            'rising' | 'stable' | 'falling' | 'insufficient_data';
  strength:             'negligible' | 'mild' | 'significant';
  slope_per_period:     number;
  change_pct:           number;
  projected_next:       number | null;
  data_points:          number;
}

function calcBiomarkerTrend(
  history: { value: number; test_date: string }[]
): TrendResult {
  const sorted = [...history].sort((a, b) => a.test_date.localeCompare(b.test_date));
  const n = sorted.length;

  if (n < 3) {
    return { direction: 'insufficient_data', strength: 'negligible',
             slope_per_period: 0, change_pct: 0, projected_next: null, data_points: n };
  }

  const xs = sorted.map((_, i) => i);
  const ys = sorted.map(h => h.value);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;

  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0) /
                xs.reduce((s, x) => s + Math.pow(x - meanX, 2), 1);

  const pctChange = meanY > 0 ? Math.abs(slope) / meanY * 100 * (n - 1) : 0;

  const direction: TrendResult['direction'] =
    pctChange < 5 ? 'stable' : slope > 0 ? 'rising' : 'falling';
  const strength: TrendResult['strength'] =
    pctChange < 5 ? 'negligible' : pctChange < 15 ? 'mild' : 'significant';

  const changePct = meanY > 0 ?
    Math.round((ys[n-1] - ys[0]) / ys[0] * 100) : 0;

  return {
    direction, strength,
    slope_per_period: Math.round(slope * 100) / 100,
    change_pct:       changePct,
    projected_next:   Math.round((ys[n-1] + slope) * 10) / 10,
    data_points:      n,
  };
}
```

---

## 5. Supplement Effectiveness Score

```typescript
function calcSupplementEffectiveness(
  supplementName: string,
  supplementStartDate: string,
  biomarkerHistory: { value: number; test_date: string }[],
  biomarkerRanges: BiomarkerRanges,
  gender: 'male' | 'female',
  age: number
): SupplementEffectiveness {
  const before = biomarkerHistory.filter(h => h.test_date < supplementStartDate);
  const after  = biomarkerHistory.filter(h => h.test_date >= supplementStartDate);

  if (!before.length || !after.length) return { status: 'insufficient_data' };

  const baselineVal = before[before.length - 1].value;
  const latestVal   = after[after.length - 1].value;
  const changePct   = Math.round((latestVal - baselineVal) / baselineVal * 100);

  const baselineFlag = calcBiomarkerFlag(baselineVal, biomarkerRanges, gender, age);
  const latestFlag   = calcBiomarkerFlag(latestVal,   biomarkerRanges, gender, age);

  // Effektiv wenn: sich dem optimalen Bereich annähert ODER bereits optimal
  const improvingDirection = ['critical_low','low','normal'].includes(baselineFlag) && latestVal > baselineVal ||
                              ['critical_high','high','normal'].includes(baselineFlag) && latestVal < baselineVal;

  const becameOptimal = latestFlag === 'optimal' && baselineFlag !== 'optimal';

  return {
    supplement_name: supplementName,
    baseline_value:  baselineVal,
    baseline_flag:   baselineFlag,
    latest_value:    latestVal,
    latest_flag:     latestFlag,
    change_pct:      changePct,
    status:          becameOptimal ? 'effective' :
                     improvingDirection && Math.abs(changePct) >= 10 ? 'partial' :
                     Math.abs(changePct) < 5 ? 'no_change' : 'inconclusive',
  };
}
```

---

## 6. Goals Contribution

```typescript
function buildMedicalGoalsContribution(
  metrics: UserHealthMetrics,
  activeAlerts: MedicalAlert[]
): GoalsContribution {
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const warningAlerts  = activeAlerts.filter(a => a.severity === 'warning');

  // Score reduzieren bei ungelösten kritischen Alerts
  const alertPenalty = criticalAlerts.length * 20 + warningAlerts.length * 5;
  const baseScore    = metrics.overall_health_score ?? 60;
  const finalScore   = Math.max(0, Math.min(100, Math.round(baseScore - alertPenalty)));

  return {
    module:           'medical',
    compliance_score: finalScore,
    details: {
      overall_health_score:  metrics.overall_health_score,
      liver_score:           metrics.liver_score,
      cardiovascular_score:  metrics.cardiovascular_score,
      kidney_score:          metrics.kidney_score,
      hormonal_score:        metrics.hormonal_score,
      metabolic_score:       metrics.metabolic_score,
      trajectory:            metrics.health_trajectory,
      data_completeness:     metrics.data_completeness_score,
      unresolved_critical:   criticalAlerts.length,
    },
  };
}
```

---

## 7. TypeScript Types

```typescript
export type BiomarkerFlag =
  'optimal' | 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';

export type SystemScoreStatus = 'optimal' | 'normal' | 'warn' | 'critical' | 'no_data';

export interface SystemScore {
  score:        number | null;
  status:       SystemScoreStatus;
  marker_count: number;
  missing:      number;
}

export interface OverallScore {
  score:             number;
  status:            'optimal' | 'good' | 'fair' | 'poor';
  data_completeness: number;   // 0–1
}

export interface TrendResult {
  direction:        'rising' | 'stable' | 'falling' | 'insufficient_data';
  strength:         'negligible' | 'mild' | 'significant';
  slope_per_period: number;
  change_pct:       number;
  projected_next:   number | null;
  data_points:      number;
}

export interface SupplementEffectiveness {
  supplement_name?: string;
  baseline_value?:  number;
  baseline_flag?:   BiomarkerFlag;
  latest_value?:    number;
  latest_flag?:     BiomarkerFlag;
  change_pct?:      number;
  status:           'effective' | 'partial' | 'no_change' | 'inconclusive' | 'insufficient_data';
}
```

---

## 8. Unit Tests

```typescript
describe('calcBiomarkerFlag', () => {
  const ferritin = {
    lab_range_min: 12, lab_range_max: 300,
    optimal_range_min: 80, optimal_range_max: 150,
    critical_low_value: 12,
  };

  it('28 → normal (lab ok, not optimal)', () => {
    expect(calcBiomarkerFlag(28, ferritin, 'male', 35)).toBe('normal');
  });

  it('95 → optimal', () => {
    expect(calcBiomarkerFlag(95, ferritin, 'male', 35)).toBe('optimal');
  });

  it('10 → critical_low', () => {
    expect(calcBiomarkerFlag(10, ferritin, 'male', 35)).toBe('critical_low');
  });

  it('350 → high (above lab range)', () => {
    expect(calcBiomarkerFlag(350, ferritin, 'male', 35)).toBe('high');
  });
});

describe('calcSystemScore', () => {
  it('all optimal → 100', () => {
    const markers = [
      { biomarker_name: 'LDL', current_flag: 'optimal' },
      { biomarker_name: 'HDL', current_flag: 'optimal' },
      { biomarker_name: 'Triglycerides', current_flag: 'optimal' },
    ] as LatestBiomarker[];
    // Only these 3 from cardiovascular available
    const result = calcSystemScore('cardiovascular', markers);
    expect(result.score).toBe(100);
    expect(result.status).toBe('optimal');
  });

  it('no data → null score', () => {
    expect(calcSystemScore('liver', []).score).toBeNull();
    expect(calcSystemScore('liver', []).status).toBe('no_data');
  });
});

describe('calcBiomarkerTrend', () => {
  it('rising trend detected', () => {
    const history = [
      { value: 18, test_date: '2025-01-01' },
      { value: 32, test_date: '2025-04-01' },
      { value: 52, test_date: '2025-07-01' },
    ];
    const result = calcBiomarkerTrend(history);
    expect(result.direction).toBe('rising');
    expect(result.strength).toBe('significant');
  });

  it('< 3 data points → insufficient_data', () => {
    expect(calcBiomarkerTrend([{value: 100, test_date: '2026-01-01'}]).direction)
      .toBe('insufficient_data');
  });
});
```
