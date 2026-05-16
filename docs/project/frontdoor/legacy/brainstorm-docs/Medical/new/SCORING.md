# Medical Module — Scoring Engine

## 1. System Score Berechnung

```typescript
const SYSTEM_MARKERS: Record<string, string[]> = {
  liver:         ['ALT', 'AST', 'GGT', 'Bilirubin Total', 'Albumin'],
  cardiovascular:['LDL', 'HDL', 'Triglycerides', 'hs-CRP', 'Homocysteine'],
  kidney:        ['Creatinine', 'BUN', 'eGFR', 'Uric Acid'],
  hormonal:      ['Total Testosterone', 'Estradiol', 'Cortisol (AM)', 'TSH', 'Free T3', 'Free T4'],
  metabolic:     ['HbA1c', 'Glucose (fasting)', 'Insulin (fasting)', 'HOMA-IR'],
};

function calcSystemScore(
  system: string,
  userValues: LatestBiomarker[],
  userGender: string,
  userAge: number
): SystemScore {
  const markers = SYSTEM_MARKERS[system];
  const scores: number[] = [];

  for (const markerName of markers) {
    const val = userValues.find(v => v.common_name === markerName || v.name === markerName);
    if (!val) continue;

    const flag = calcBiomarkerFlag(val.value, val.biomarker, userGender, userAge);
    const score =
      flag === 'optimal'       ? 100 :
      flag === 'normal'         ?  75 :
      flag === 'low' || 'high'  ?  40 :
      flag.startsWith('critical')? 10 : 50;

    scores.push(score);
  }

  if (!scores.length) return { score: null, status: 'no_data', marker_count: 0 };

  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  return {
    score:        Math.round(avg),
    status:       avg >= 85 ? 'optimal' : avg >= 65 ? 'normal' : avg >= 40 ? 'warn' : 'critical',
    marker_count: scores.length,
    missing:      markers.length - scores.length,
  };
}

function calcOverallHealthScore(systemScores: Record<string, SystemScore>): number {
  const weights: Record<string, number> = {
    cardiovascular: 0.25, metabolic: 0.25, liver: 0.15,
    kidney: 0.15, hormonal: 0.20,
  };

  let total = 0, totalWeight = 0;
  for (const [system, weight] of Object.entries(weights)) {
    const s = systemScores[system];
    if (s?.score != null) {
      total += s.score * weight;
      totalWeight += weight;
    }
  }
  return totalWeight > 0 ? Math.round(total / totalWeight) : 0;
}
```

---

## 2. Biomarker Flag

```typescript
function calcBiomarkerFlag(
  value: number,
  biomarker: Biomarker,
  gender: 'male' | 'female',
  age: number
): BiomarkerFlag {
  const range = getApplicableRange(biomarker, gender, age) ?? {
    optimal_min: biomarker.optimal_range_min,
    optimal_max: biomarker.optimal_range_max,
    lab_min: biomarker.lab_range_min,
    lab_max: biomarker.lab_range_max,
  };

  if (biomarker.critical_low_value  && value <= biomarker.critical_low_value)  return 'critical_low';
  if (biomarker.critical_high_value && value >= biomarker.critical_high_value) return 'critical_high';
  if (range.optimal_min != null && range.optimal_max != null &&
      value >= range.optimal_min && value <= range.optimal_max)                return 'optimal';
  if (range.lab_min != null && range.lab_max != null &&
      value >= range.lab_min && value <= range.lab_max)                        return 'normal';
  return value < (range.lab_min ?? 0) ? 'low' : 'high';
}
```

---

## 3. Trend Berechnung

Lineare Regression über Biomarker-History.

```typescript
function calcBiomarkerTrend(
  history: { value: number; test_date: string }[]
): BiomarkerTrend {
  if (history.length < 3) return { direction: 'insufficient_data', strength: 0 };

  const sorted = [...history].sort((a, b) => a.test_date.localeCompare(b.test_date));
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map(h => h.value);

  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;

  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0) /
                xs.reduce((s, x) => s + Math.pow(x - meanX, 2), 0);

  const pctChange = Math.abs(slope) / meanY * 100;

  return {
    direction: Math.abs(pctChange) < 3 ? 'stable' : slope > 0 ? 'rising' : 'falling',
    strength:  pctChange < 3 ? 'negligible' : pctChange < 10 ? 'mild' : 'significant',
    slope_per_period: Math.round(slope * 100) / 100,
    latest: sorted[n-1].value,
    first:  sorted[0].value,
    change_pct: Math.round((sorted[n-1].value - sorted[0].value) / sorted[0].value * 100),
  };
}
```

---

## 4. Supplement Effectiveness Score

```typescript
function calcSupplementEffectiveness(
  supplementName: string,
  biomarkerHistory: { value: number; test_date: string }[],
  supplementStartDate: string,
  biomarker: Biomarker,
  gender: string,
  age: number
): SupplementEffectiveness {
  const before = biomarkerHistory.filter(h => h.test_date < supplementStartDate);
  const after  = biomarkerHistory.filter(h => h.test_date >= supplementStartDate);

  if (before.length < 1 || after.length < 1) return { status: 'insufficient_data' };

  const baselineValue = before[before.length - 1].value;
  const latestValue   = after[after.length - 1].value;
  const changePct     = (latestValue - baselineValue) / baselineValue * 100;

  const baselineFlag = calcBiomarkerFlag(baselineValue, biomarker, gender, age);
  const latestFlag   = calcBiomarkerFlag(latestValue,   biomarker, gender, age);

  const improved = (baselineFlag !== 'optimal' && latestFlag === 'optimal') ||
                   (baselineFlag === 'critical_low' && latestFlag !== 'critical_low');

  return {
    supplement: supplementName,
    biomarker:  biomarker.name,
    baseline_value:  baselineValue,
    latest_value:    latestValue,
    change_pct:      Math.round(changePct),
    baseline_flag:   baselineFlag,
    latest_flag:     latestFlag,
    status:  improved ? 'effective' : Math.abs(changePct) < 5 ? 'no_change' : 'inconclusive',
  };
}
```

---

## 5. OCR Confidence Scoring

```typescript
// Nach Claude Vision OCR
function calcOCRConfidence(extraction: OCRExtraction): number {
  let score = 100;

  // Abzüge
  if (!extraction.biomarker_matched)      score -= 30;  // Nicht im Katalog gefunden
  if (!extraction.value_in_range)         score -= 20;  // Biologisch implausibel
  if (extraction.unit_mismatch)           score -= 15;  // Einheit unbekannt/ungewöhnlich
  if (extraction.date_confidence < 0.7)   score -= 10;
  if (extraction.handwritten)             score -= 15;  // Handschrift = weniger sicher
  if (extraction.fax_quality)             score -= 10;

  return Math.max(0, score) / 100;
}

// needs_verification = true wenn confidence < 0.8
```

---

## 6. Medical Goals Contribution

```typescript
function buildMedicalGoalsContribution(
  healthMetrics: UserHealthMetrics
): GoalsContribution {
  // Composite aus allen System Scores
  const available_scores = [
    healthMetrics.liver_score, healthMetrics.cardiovascular_score,
    healthMetrics.kidney_score, healthMetrics.hormonal_score,
    healthMetrics.metabolic_score,
  ].filter(Boolean) as number[];

  const avg = available_scores.length > 0
    ? available_scores.reduce((s, v) => s + v, 0) / available_scores.length
    : 0;

  return {
    module: 'medical',
    compliance_score: Math.round(avg),
    details: {
      overall_health_score:  healthMetrics.overall_health_score,
      liver_score:           healthMetrics.liver_score,
      cardiovascular_score:  healthMetrics.cardiovascular_score,
      kidney_score:          healthMetrics.kidney_score,
      hormonal_score:        healthMetrics.hormonal_score,
      metabolic_score:       healthMetrics.metabolic_score,
      trajectory:            healthMetrics.health_trajectory,
      data_completeness:     healthMetrics.data_completeness_score,
    },
  };
}
```
