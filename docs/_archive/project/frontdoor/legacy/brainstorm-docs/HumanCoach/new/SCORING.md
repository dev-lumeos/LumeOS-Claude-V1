# Human Coach Module — Scoring Engine

## 1. Client Status Berechnung

```typescript
type ClientStatus = 'excellent' | 'good' | 'attention' | 'critical';

function calcClientStatus(
  adherence7d: number,     // 0–1
  recoveryScore: number,   // 0–100
  openAlerts: { priority: number }[]
): ClientStatus {
  const criticalAlerts = openAlerts.filter(a => a.priority <= 1).length;
  const highAlerts     = openAlerts.filter(a => a.priority === 2).length;

  if (criticalAlerts > 0 || adherence7d < 0.40 || recoveryScore < 40)
    return 'critical';
  if (highAlerts >= 2  || adherence7d < 0.60 || recoveryScore < 55)
    return 'attention';
  if (highAlerts >= 1  || adherence7d < 0.75 || recoveryScore < 65)
    return 'good';
  return 'excellent';
}
```

---

## 2. Client Risk Level

```typescript
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

function calcRiskLevel(
  avg7dAdherence: number,    // 0–1
  adherenceVolatility: number,
  highPriorityAlerts: number
): RiskLevel {
  if (avg7dAdherence < 0.5 || highPriorityAlerts >= 3) return 'critical';
  if (avg7dAdherence < 0.7 || highPriorityAlerts >= 2 || adherenceVolatility > 0.3) return 'high';
  if (avg7dAdherence < 0.8 || highPriorityAlerts >= 1) return 'medium';
  return 'low';
}
```

---

## 3. Adherence Score — Multi-Dimensional

```typescript
const ADHERENCE_WEIGHTS = {
  nutrition:   0.35,
  training:    0.35,
  recovery:    0.20,
  supplements: 0.10,
};

function calcWeightedAdherence(
  nutrition: number,    // 0–1
  training: number,
  recovery: number,
  supplements: number
): number {
  return Math.round((
    nutrition   * ADHERENCE_WEIGHTS.nutrition +
    training    * ADHERENCE_WEIGHTS.training +
    recovery    * ADHERENCE_WEIGHTS.recovery +
    supplements * ADHERENCE_WEIGHTS.supplements
  ) * 1000) / 1000;
}
```

---

## 4. Autonomy Level Auto-Empfehlung

```typescript
interface AutonomyScores {
  consistency:     number;  // 0–1: Tage mit Daten / Tage im Zeitraum
  knowledge:       number;  // 0–1: Wie gut versteht Client seinen Plan
  selfCorrection:  number;  // 0–1: Hat Client eigenständig reagiert?
  communication:   number;  // 0–1: Reaktionszeit + Qualität
}

function recommendAutonomyLevel(scores: AutonomyScores): number {
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

## 5. Rule Engine — Condition Evaluation

```typescript
interface RuleCondition {
  module:          string;
  metric:          string;
  operator:        '<'|'>'|'<='|'>='|'=='|'!='|'trend_down'|'trend_up';
  value:           number | boolean;
  timeframe_days?: number;
}

async function evaluateCondition(
  condition: RuleCondition,
  clientData: ClientDataContext
): Promise<boolean> {
  const actual = getMetricValue(clientData, condition.module, condition.metric, condition.timeframe_days);
  if (actual === null) return false;

  switch (condition.operator) {
    case '<':          return actual < condition.value;
    case '>':          return actual > condition.value;
    case '<=':         return actual <= condition.value;
    case '>=':         return actual >= condition.value;
    case '==':         return actual === condition.value;
    case '!=':         return actual !== condition.value;
    case 'trend_down': return isTrendDown(clientData, condition.module, condition.metric, condition.timeframe_days ?? 7);
    case 'trend_up':   return isTrendUp( clientData, condition.module, condition.metric, condition.timeframe_days ?? 7);
    default:           return false;
  }
}

async function evaluateRule(
  rule: CoachRule,
  clientData: ClientDataContext
): Promise<boolean> {
  const results = await Promise.all(rule.conditions.map(c => evaluateCondition(c, clientData)));
  return rule.logic_operator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}
```

---

## 6. Verfügbare Metriken für Rule Builder

```typescript
const AVAILABLE_METRICS: Record<string, MetricDef[]> = {
  nutrition: [
    { key: 'daily_score',            label: 'Nutrition Score (0-100)',   type: 'number' },
    { key: 'calorie_adherence_pct',  label: 'Kalorien-Adherence (%)',   type: 'number' },
    { key: 'protein_adherence_pct',  label: 'Protein-Adherence (%)',    type: 'number' },
    { key: 'protein_g',              label: 'Protein heute (g)',         type: 'number' },
  ],
  training: [
    { key: 'session_today',          label: 'Training heute',            type: 'boolean' },
    { key: 'weekly_sessions',        label: 'Sessions diese Woche',      type: 'number' },
    { key: 'adherence_pct',          label: 'Training-Adherence (%)',   type: 'number' },
    { key: 'volume_trend',           label: 'Volumen-Trend',             type: 'trend' },
    { key: 'consecutive_days',       label: 'Tage in Folge',             type: 'number' },
  ],
  recovery: [
    { key: 'score',                  label: 'Recovery Score (0-100)',    type: 'number' },
    { key: 'score_trend',            label: 'Recovery Score Trend',      type: 'trend' },
    { key: 'sleep_hours',            label: 'Schlaf heute (h)',          type: 'number' },
    { key: 'checkin_completed',      label: 'Check-in gemacht',          type: 'boolean' },
    { key: 'hrv_vs_baseline',        label: 'HRV vs Baseline (%)',      type: 'number' },
  ],
  supplements: [
    { key: 'compliance_rate',        label: 'Supplement-Compliance (%)', type: 'number' },
    { key: 'critical_interaction',   label: 'Kritische Interaktion',     type: 'boolean' },
  ],
  medical: [
    { key: 'critical_alert',         label: 'Medizinischer Alert',       type: 'boolean' },
    { key: 'bloodwork_overdue_days', label: 'Bluttest überfällig (Tage)', type: 'number' },
  ],
};
```

---

## 7. System-Alert-Regeln (immer aktiv, nicht abschaltbar)

```typescript
const SYSTEM_RULES = [
  {
    name: 'Medical Critical Alert',
    condition: { module: 'medical', metric: 'critical_alert', operator: '==', value: true },
    action: { type: 'alert', severity: 'critical', priority: 1 },
  },
  {
    name: 'Supplement Critical Interaction',
    condition: { module: 'supplements', metric: 'critical_interaction', operator: '==', value: true },
    action: { type: 'alert', severity: 'critical', priority: 1 },
  },
];
```

---

## 8. Coach Performance Score

```typescript
function calcCoachPerformanceScore(metrics: CoachPerformanceMetrics): number {
  const weights = {
    retention_rate:            0.25,
    goal_completion_rate:      0.20,
    avg_satisfaction:          0.20,
    adherence_improvement:     0.20,
    avg_response_time_score:   0.15,
  };

  // Response time score: < 2h = 100, 2-8h = 75, 8-24h = 50, > 24h = 25
  const rtScore = metrics.avg_response_time_hours < 2  ? 1.0
                : metrics.avg_response_time_hours < 8  ? 0.75
                : metrics.avg_response_time_hours < 24 ? 0.50 : 0.25;

  return Math.round((
    metrics.client_retention_rate   * weights.retention_rate +
    metrics.goal_completion_rate    * weights.goal_completion_rate +
    (metrics.avg_satisfaction / 5)  * weights.avg_satisfaction +
    metrics.adherence_improvement   * weights.adherence_improvement +
    rtScore                         * weights.avg_response_time_score
  ) * 100);
}
```
