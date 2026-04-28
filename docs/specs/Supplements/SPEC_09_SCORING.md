# Supplements Module — Scoring Engine
> Spec Phase 9 | Deterministischer Score

---

## Prinzipien

Pure Functions, kein AI, deterministisch, testbar.
`packages/scoring/src/supplements.ts`

---

## 1. Supplement Compliance Score (→ Goals)

```typescript
interface IntakeLogSummary {
  stack_item_id: string;
  evidence_grade: 'S'|'A'|'B'|'C'|'D'|'F';
  status: 'taken'|'skipped'|'pending';
}

const EVIDENCE_WEIGHT: Record<string, number> = {
  S: 1.00, A: 0.90, B: 0.75, C: 0.60, D: 0.40, F: 0.00,
};

function calcSupplementScore(logs: IntakeLogSummary[]): SupplementScore {
  // Nur entschiedene Items (nicht pending)
  const decided = logs.filter(l => l.status !== 'pending');
  const taken   = decided.filter(l => l.status === 'taken');

  if (decided.length === 0) {
    return { score: null, status: 'no_data', base_compliance_pct: null };
  }

  // Basis-Compliance (ungwichtet)
  const base_pct = taken.length / decided.length;

  // Evidence-gewichtet
  const total_weight   = decided.reduce((s, l) => s + EVIDENCE_WEIGHT[l.evidence_grade], 0);
  const taken_weight   = taken.reduce((s, l) => s + EVIDENCE_WEIGHT[l.evidence_grade], 0);
  const weighted_pct   = total_weight > 0 ? taken_weight / total_weight : 0;

  // Score = gewichtete Compliance × 100
  const score = Math.round(weighted_pct * 100);

  return {
    score,
    status: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'low',
    base_compliance_pct: Math.round(base_pct * 100),
    weighted_compliance_pct: Math.round(weighted_pct * 100),
    items_taken: taken.length,
    items_decided: decided.length,
    items_pending: logs.filter(l => l.status === 'pending').length,
  };
}
```

**Warum evidence-gewichtet?**
Jemand der Creatine (S) und Glutamin (D) nimmt, aber heute nur Glutamin vergisst,
verliert weniger Score als wenn er Creatine vergisst. Das spiegelt den realen Wert wider.

---

## 2. Mikronährstoff-Gap Score

```typescript
interface MicroGap {
  nutrient_code: string;
  pct_of_rda: number;    // actual / rda × 100
  covered_by_stack: boolean;
}

function calcGapScore(gaps: MicroGap[]): GapScore {
  if (gaps.length === 0) return { score: 100, gaps_count: 0 };

  const significant = gaps.filter(g => g.pct_of_rda < 80 && !g.covered_by_stack);
  const critical    = gaps.filter(g => g.pct_of_rda < 50 && !g.covered_by_stack);

  // Penalizer: −10 pro signifikante Lücke, −20 pro kritische
  const penalty = significant.length * 10 + critical.length * 10; // (critical zählt doppelt)
  const score   = Math.max(0, 100 - penalty);

  return {
    score,
    gaps_count: significant.length,
    critical_count: critical.length,
    top_gaps: significant
      .sort((a, b) => a.pct_of_rda - b.pct_of_rda)
      .slice(0, 3)
      .map(g => ({ code: g.nutrient_code, pct: Math.round(g.pct_of_rda) })),
  };
}
```

---

## 3. Interaction Severity Score

```typescript
function calcInteractionRisk(interactions: InteractionResult[]): InteractionRisk {
  const critical = interactions.filter(i => i.severity === 'critical');
  const warnings = interactions.filter(i => i.severity === 'warning');
  const cautions = interactions.filter(i => i.severity === 'caution');

  // Jede kritische Interaction = sofortiger Block → Score 0
  if (critical.length > 0) {
    return {
      score: 0,
      risk: 'critical',
      critical_count: critical.length,
      warning_count: warnings.length,
    };
  }

  // Warnungen reduzieren Score
  const penalty = warnings.length * 15 + cautions.length * 5;
  const score   = Math.max(0, 100 - penalty);

  return {
    score,
    risk: score >= 80 ? 'ok' : score >= 60 ? 'moderate' : 'high',
    critical_count: 0,
    warning_count: warnings.length,
    caution_count: cautions.length,
  };
}
```

---

## 4. Gesamt-Supplement Score (für Goals)

```typescript
function calcOverallSupplementScore(
  compliance: SupplementScore,
  interactionRisk: InteractionRisk
): number {
  // Wenn kritische Interaction → Score gecappt bei 30
  if (interactionRisk.risk === 'critical') {
    return Math.min(compliance.score ?? 0, 30);
  }

  // Gewichteter Gesamt-Score
  const comp_score = compliance.score ?? 0;
  const int_score  = interactionRisk.score;

  // 80% Compliance, 20% Interaction Safety
  return Math.round(comp_score * 0.80 + int_score * 0.20);
}
```

---

## 5. Cycling-Phase Check

```typescript
interface CyclingConfig {
  on_weeks:     number;
  off_weeks:    number;
  start_date:   string;   // ISO Date
}

function isCyclingOnDay(cycling: CyclingConfig, date: string): boolean {
  const start    = new Date(cycling.start_date);
  const target   = new Date(date);
  const daysDiff = Math.floor((target.getTime() - start.getTime()) / 86400000);

  const cycleLength  = (cycling.on_weeks + cycling.off_weeks) * 7;
  const posInCycle   = ((daysDiff % cycleLength) + cycleLength) % cycleLength;
  const onDays       = cycling.on_weeks * 7;

  return posInCycle < onDays;
}

// Beispiel: on_weeks=8, off_weeks=4 → 12-Wochen Zyklus
// Tage 0–55 = ON, Tage 56–83 = OFF, Tage 84–139 = ON, ...
```

---

## 6. Pending Actions Logik

```typescript
function calcPendingActions(
  today: string,
  intakeLogs: IntakeLog[],
  inventory: UserInventory[],
  interactions: InteractionResult[],
  currentHour: number
): PendingAction[] {
  const actions: PendingAction[] = [];

  // 1. Ausstehende Einnahmen (nach Timing-Uhrzeit)
  const timingHours: Record<string, number> = {
    morning: 9, midday: 13, evening: 19, pre_workout: 17,
    post_workout: 20, bedtime: 22,
  };

  for (const log of intakeLogs.filter(l => l.status === 'pending')) {
    const slotHour = timingHours[log.timing] ?? 12;
    if (currentHour >= slotHour) {
      actions.push({
        id: `intake-${log.id}`,
        type: 'take_supplement',
        priority: currentHour > slotHour + 2 ? 'high' : 'normal',
        label: `${log.supplement_name} ${log.dose}${log.dose_unit} (${TIMING_LABELS[log.timing]}) ausstehend`,
        stack_item_id: log.stack_item_id,
        action_url: '/supplements/today',
      });
    }
  }

  // 2. Low Stock Alerts
  for (const inv of inventory) {
    const daysLeft = inv.current_stock / (inv.daily_consumption ?? 1);
    if (daysLeft <= (inv.low_stock_threshold ?? 7)) {
      actions.push({
        id: `stock-${inv.id}`,
        type: 'low_stock',
        priority: daysLeft <= 3 ? 'high' : 'normal',
        label: `${inv.product_name}: noch ca. ${Math.round(daysLeft)} Tage Vorrat`,
        inventory_id: inv.id,
        action_url: '/supplements/inventory',
      });
    }
  }

  // 3. Unaufgelöste kritische Interactions
  for (const interaction of interactions.filter(i => i.severity === 'critical')) {
    actions.push({
      id: `interaction-${interaction.id}`,
      type: 'interaction_unresolved',
      priority: 'high',
      label: `⚠️ Kritische Interaction: ${interaction.supplement1} + ${interaction.supplement2}`,
      action_url: '/supplements/stacks',
    });
  }

  return actions.sort((a, b) =>
    a.priority === 'high' && b.priority !== 'high' ? -1 :
    b.priority === 'high' && a.priority !== 'high' ? 1 : 0
  );
}

const TIMING_LABELS: Record<string, string> = {
  morning: 'Morgens', midday: 'Mittags', evening: 'Abends',
  pre_workout: 'Pre-Workout', post_workout: 'Post-Workout', bedtime: 'Vor dem Schlafen',
};
```

---

## 7. Cost Calculation

```typescript
const FREQUENCY_DAYS_PER_MONTH: Record<string, number> = {
  daily: 30,
  weekdays: 22,       // ~5 Tage/Woche × 4.4 Wochen
  training_days: 16,  // ~4 Trainingstage/Woche × 4 Wochen
  cycling: 15,        // Annahme: durchschnittlich 50% der Zeit "on"
};

function calcMonthlyCost(stackItems: StackItemWithCost[]): CostBreakdown {
  const items = stackItems.map(item => {
    const daysPerMonth = FREQUENCY_DAYS_PER_MONTH[item.frequency] ?? 30;
    const cost_per_serving = item.supplement?.cost_per_serving ?? 0;
    const monthly = cost_per_serving * daysPerMonth;

    return {
      name: item.custom_name ?? item.supplement_name,
      evidence_grade: item.evidence_grade,
      dose: item.dose,
      dose_unit: item.dose_unit,
      monthly_cost: Math.round(monthly * 100) / 100,
      monthly_servings: daysPerMonth,
    };
  });

  const total = items.reduce((sum, i) => sum + i.monthly_cost, 0);
  const by_evidence = {
    essential: items.filter(i => ['S','A'].includes(i.evidence_grade))
                    .reduce((s, i) => s + i.monthly_cost, 0),
    moderate: items.filter(i => ['B','C'].includes(i.evidence_grade))
                   .reduce((s, i) => s + i.monthly_cost, 0),
    low: items.filter(i => ['D','F'].includes(i.evidence_grade))
              .reduce((s, i) => s + i.monthly_cost, 0),
  };

  return {
    total: Math.round(total * 100) / 100,
    breakdown: items,
    by_evidence,
  };
}
```

---

## 8. TypeScript Types

```typescript
export type EvidenceGrade = 'S'|'A'|'B'|'C'|'D'|'F';
export type InteractionSeverity = 'info'|'caution'|'warning'|'critical';
export type IntakeStatus = 'pending'|'taken'|'skipped'|'snoozed';

export interface SupplementScore {
  score:                   number | null;
  status:                  'ok'|'warn'|'low'|'no_data';
  base_compliance_pct:     number | null;
  weighted_compliance_pct: number;
  items_taken:             number;
  items_decided:           number;
  items_pending:           number;
}

export interface InteractionRisk {
  score:          number;
  risk:           'ok'|'moderate'|'high'|'critical';
  critical_count: number;
  warning_count:  number;
  caution_count?: number;
}

export interface GapScore {
  score:          number;
  gaps_count:     number;
  critical_count: number;
  top_gaps:       { code: string; pct: number }[];
}

export interface PendingAction {
  id:            string;
  type:          'take_supplement'|'low_stock'|'interaction_unresolved'|'cycling_reminder';
  priority:      'high'|'normal';
  label:         string;
  action_url:    string;
  [key: string]: unknown;
}

export interface CostBreakdown {
  total:        number;
  breakdown:    { name: string; evidence_grade: string; monthly_cost: number }[];
  by_evidence:  { essential: number; moderate: number; low: number };
}
```

---

## 9. Unit Tests

```typescript
describe('calcSupplementScore', () => {

  it('all S-grade taken → 100', () => {
    const logs = [
      { stack_item_id: '1', evidence_grade: 'S', status: 'taken' },
      { stack_item_id: '2', evidence_grade: 'S', status: 'taken' },
    ];
    expect(calcSupplementScore(logs).score).toBe(100);
    expect(calcSupplementScore(logs).status).toBe('ok');
  });

  it('S taken + D skipped → high score (D weighted low)', () => {
    const logs = [
      { stack_item_id: '1', evidence_grade: 'S', status: 'taken' },
      { stack_item_id: '2', evidence_grade: 'D', status: 'skipped' },
    ];
    const result = calcSupplementScore(logs);
    // taken_weight = 1.0, total_weight = 1.0 + 0.4 = 1.4
    // weighted_pct = 1.0 / 1.4 ≈ 71.4 → score 71
    expect(result.score).toBeGreaterThan(65);
    expect(result.score).toBeLessThan(80);
  });

  it('S skipped + D taken → low score (S missing)', () => {
    const logs = [
      { stack_item_id: '1', evidence_grade: 'S', status: 'skipped' },
      { stack_item_id: '2', evidence_grade: 'D', status: 'taken' },
    ];
    const result = calcSupplementScore(logs);
    // taken_weight = 0.4, total = 1.4 → 28.6 → score 29
    expect(result.score).toBeLessThan(40);
  });

  it('all pending → no_data', () => {
    const logs = [
      { stack_item_id: '1', evidence_grade: 'A', status: 'pending' },
    ];
    expect(calcSupplementScore(logs).status).toBe('no_data');
    expect(calcSupplementScore(logs).score).toBeNull();
  });

});

describe('isCyclingOnDay', () => {

  it('day 0 = ON', () => {
    expect(isCyclingOnDay({ on_weeks: 8, off_weeks: 4, start_date: '2026-01-01' }, '2026-01-01')).toBe(true);
  });

  it('day 55 = ON (last ON day)', () => {
    expect(isCyclingOnDay({ on_weeks: 8, off_weeks: 4, start_date: '2026-01-01' }, '2026-02-25')).toBe(true);
  });

  it('day 56 = OFF (first OFF day)', () => {
    expect(isCyclingOnDay({ on_weeks: 8, off_weeks: 4, start_date: '2026-01-01' }, '2026-02-26')).toBe(false);
  });

  it('day 84 = ON again (new cycle)', () => {
    expect(isCyclingOnDay({ on_weeks: 8, off_weeks: 4, start_date: '2026-01-01' }, '2026-03-26')).toBe(true);
  });

});

describe('calcInteractionRisk', () => {

  it('critical interaction → score 0', () => {
    const result = calcInteractionRisk([
      { severity: 'critical', supplement1: 'St. John''s Wort', supplement2: 'SSRIs' }
    ]);
    expect(result.score).toBe(0);
    expect(result.risk).toBe('critical');
  });

  it('no interactions → score 100', () => {
    expect(calcInteractionRisk([]).score).toBe(100);
    expect(calcInteractionRisk([]).risk).toBe('ok');
  });

});
```
