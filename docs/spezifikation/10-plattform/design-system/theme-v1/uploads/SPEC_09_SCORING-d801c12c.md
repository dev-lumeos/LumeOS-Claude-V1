# Human Coach Module — Scoring Engine (Spec)
> Spec Phase 9 | Alle Algorithmen

---

## 1. Client Status Berechnung

```typescript
// packages/scoring/src/human-coach.ts

export type ClientStatus = 'excellent' | 'good' | 'attention' | 'critical';

export function calcClientStatus(
  adherence7d:  number,    // 0–1 weighted
  recoveryScore: number,   // 0–100
  openAlerts: { priority: number }[]
): ClientStatus {
  const critical = openAlerts.filter(a => a.priority <= 1).length;
  const high     = openAlerts.filter(a => a.priority === 2).length;

  if (critical > 0 || adherence7d < 0.40 || recoveryScore < 40) return 'critical';
  if (high >= 2    || adherence7d < 0.60 || recoveryScore < 55) return 'attention';
  if (high >= 1    || adherence7d < 0.75 || recoveryScore < 65) return 'good';
  return 'excellent';
}
```

---

## 2. Risk Level

```typescript
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export function calcRiskLevel(
  avg7d:        number,   // 0–1
  volatility:   number,   // 0–1 stddev
  highPrioAlerts: number
): RiskLevel {
  if (avg7d < 0.50 || highPrioAlerts >= 3)                        return 'critical';
  if (avg7d < 0.70 || highPrioAlerts >= 2 || volatility > 0.30)  return 'high';
  if (avg7d < 0.80 || highPrioAlerts >= 1)                        return 'medium';
  return 'low';
}
```

---

## 3. Weighted Adherence

```typescript
export const ADHERENCE_WEIGHTS = {
  nutrition:   0.35,
  training:    0.35,
  recovery:    0.20,
  supplements: 0.10,
};

export function calcWeightedAdherence(
  nutrition:    number,    // 0–1
  training:     number,
  recovery:     number,
  supplements:  number
): number {
  const w = ADHERENCE_WEIGHTS;
  return Math.round((
    nutrition   * w.nutrition +
    training    * w.training +
    recovery    * w.recovery +
    supplements * w.supplements
  ) * 1000) / 1000;
}
```

---

## 4. Adherence Trend Richtung

```typescript
export function calcTrendDirection(
  values: number[]  // chronologisch, neuste zuletzt
): 'improving' | 'stable' | 'declining' | 'insufficient_data' {
  if (values.length < 3) return 'insufficient_data';

  const n    = values.length;
  const xs   = values.map((_, i) => i);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  const slope = xs.reduce((s, x, i) => s + (x - meanX) * (values[i] - meanY), 0) /
                xs.reduce((s, x) => s + (x - meanX) ** 2, 0.001);

  const pctChange = Math.abs(slope) / Math.max(meanY, 0.01) * 100;
  if (pctChange < 3)   return 'stable';
  return slope > 0 ? 'improving' : 'declining';
}
```

---

## 5. Autonomy Level Empfehlung

```typescript
export interface AutonomyScores {
  consistency:     number;  // 0–1: Tage mit Daten / Tage
  knowledge:       number;  // 0–1: Adherence-Qualität
  selfCorrection:  number;  // 0–1: Eigenständige Korrekturen
  communication:   number;  // 0–1: Reaktionszeit + Qualität
}

export function recommendAutonomyLevel(scores: AutonomyScores): number {
  const overall = (
    scores.consistency    * 0.35 +
    scores.knowledge      * 0.25 +
    scores.selfCorrection * 0.25 +
    scores.communication  * 0.15
  );

  if (overall >= 0.90) return 5;
  if (overall >= 0.75) return 4;
  if (overall >= 0.60) return 3;
  if (overall >= 0.40) return 2;
  return 1;
}
```

---

## 6. Rule Condition Evaluation

```typescript
export type Operator =
  '<' | '>' | '<=' | '>=' | '==' | '!=' | 'trend_down' | 'trend_up';

export function evaluateCondition(
  actual:   number | boolean | null,
  operator: Operator,
  expected: number | boolean,
  trend?:   'up' | 'down' | 'stable' | null
): boolean {
  if (actual === null) return false;

  switch (operator) {
    case '<':    return typeof actual === 'number' && actual < (expected as number);
    case '>':    return typeof actual === 'number' && actual > (expected as number);
    case '<=':   return typeof actual === 'number' && actual <= (expected as number);
    case '>=':   return typeof actual === 'number' && actual >= (expected as number);
    case '==':   return actual === expected;
    case '!=':   return actual !== expected;
    case 'trend_down': return trend === 'down';
    case 'trend_up':   return trend === 'up';
    default:     return false;
  }
}

export function evaluateRule(
  conditions: RuleConditionResult[],
  logic: 'AND' | 'OR'
): boolean {
  return logic === 'AND'
    ? conditions.every(c => c.met)
    : conditions.some(c => c.met);
}
```

---

## 7. Coach Performance Score

```typescript
export function calcCoachPerformanceScore(m: CoachMetrics): number {
  const rtScore = m.avg_response_time_hours < 2  ? 1.0
                : m.avg_response_time_hours < 8  ? 0.75
                : m.avg_response_time_hours < 24 ? 0.50 : 0.25;

  return Math.round((
    m.client_retention_rate  * 0.25 +
    m.goal_completion_rate   * 0.20 +
    (m.avg_satisfaction / 5) * 0.20 +
    m.adherence_improvement  * 0.20 +
    rtScore                  * 0.15
  ) * 100);
}
```

---

## 8. Alert Priority → Severity Mapping

```typescript
export function priorityToSeverity(priority: number): string {
  switch (priority) {
    case 1: return 'critical';
    case 2: return 'high';
    case 3: return 'medium';
    case 4: return 'low';
    default: return 'info';
  }
}

export function typeToPriority(type: string): number {
  const PRIORITIES: Record<string, number> = {
    medical_concern:           1,
    supplement_interactions:   1,
    recovery_issues:           2,
    missed_goals:              2,
    adherence_drop:            3,
    nutrition_concerns:        3,
    overtraining:              2,
    streak_achievement:        5,
    goal_reached:              5,
  };
  return PRIORITIES[type] ?? 3;
}
```

---

## 9. Adherence Summary — Modul-Quellen

```typescript
// Wie der Adherence Score pro Modul berechnet wird
export function moduleScoreToAdherence(moduleScore: number): number {
  // Module liefern 0–100, wir brauchen 0–1
  return Math.round(Math.min(1, Math.max(0, moduleScore / 100)) * 1000) / 1000;
}

// Quellen (via for-coach APIs):
// nutrition:    GET /api/nutrition/for-coach    → daily_score / 100
// training:     GET /api/training/for-coach     → adherence_pct / 100
// recovery:     GET /api/recovery/for-coach     → checkin_rate (0–1)
// supplements:  GET /api/supplements/for-coach  → compliance_pct / 100
```

---

## 10. Unit Tests

```typescript
describe('calcClientStatus', () => {
  it('critical → critical', () => {
    expect(calcClientStatus(0.3, 40, [{priority: 1}])).toBe('critical');
  });
  it('high adherence, good recovery, no alerts → excellent', () => {
    expect(calcClientStatus(0.9, 82, [])).toBe('excellent');
  });
});

describe('calcWeightedAdherence', () => {
  it('all 1.0 → 1.0', () => {
    expect(calcWeightedAdherence(1, 1, 1, 1)).toBe(1.0);
  });
  it('nutrition drops → weighted drops appropriately', () => {
    const r = calcWeightedAdherence(0.5, 1.0, 1.0, 1.0);
    expect(r).toBeCloseTo(0.825, 2);
  });
});

describe('recommendAutonomyLevel', () => {
  it('all high → level 5', () => {
    expect(recommendAutonomyLevel({
      consistency: 0.95, knowledge: 0.92, selfCorrection: 0.90, communication: 0.88
    })).toBe(5);
  });
  it('low scores → level 1', () => {
    expect(recommendAutonomyLevel({
      consistency: 0.3, knowledge: 0.25, selfCorrection: 0.2, communication: 0.35
    })).toBe(1);
  });
});
```
