# Supplements Module — Scoring

## 1. Supplement Compliance Score (→ Goals)

Evidence-gewichtet — Creatine (S) vergessen = mehr Malus als Glutamin (D).

```typescript
const EVIDENCE_WEIGHT = { S: 1.0, A: 0.9, B: 0.75, C: 0.6, D: 0.4, F: 0.0 };

function calcSupplementScore(logs: IntakeLogSummary[]): SupplementScore {
  const decided = logs.filter(l => l.status !== 'pending');
  const taken   = decided.filter(l => l.status === 'taken');
  if (!decided.length) return { score: null, status: 'no_data' };

  const base_pct     = taken.length / decided.length;
  const total_weight = decided.reduce((s, l) => s + EVIDENCE_WEIGHT[l.evidence_grade ?? 'C'], 0);
  const taken_weight = taken.reduce((s, l) => s + EVIDENCE_WEIGHT[l.evidence_grade ?? 'C'], 0);
  const weighted_pct = total_weight > 0 ? taken_weight / total_weight : 0;
  const score        = Math.round(weighted_pct * 100);

  return {
    score,
    status: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'low',
    base_compliance_pct: Math.round(base_pct * 100),
    weighted_compliance_pct: Math.round(weighted_pct * 100),
    items_taken: taken.length, items_decided: decided.length,
  };
}
```

**Thresholds:** ok ≥ 80 | warn 50–79 | low < 50

---

## 2. Interaction Risk Score

```typescript
function calcInteractionRisk(interactions: InteractionResult[]): InteractionRisk {
  const critical = interactions.filter(i => i.severity === 'critical');
  if (critical.length > 0) return { score: 0, risk: 'critical', critical_count: critical.length };

  const warnings = interactions.filter(i => i.severity === 'warning');
  const cautions = interactions.filter(i => i.severity === 'caution');
  const penalty  = warnings.length * 15 + cautions.length * 5;
  const score    = Math.max(0, 100 - penalty);

  return {
    score,
    risk: score >= 80 ? 'ok' : score >= 60 ? 'moderate' : 'high',
    warning_count: warnings.length, caution_count: cautions.length,
  };
}
```

---

## 3. Gesamt-Supplement Score (für Goals)

```typescript
function calcOverallScore(compliance: SupplementScore, risk: InteractionRisk): number {
  if (risk.risk === 'critical') return Math.min(compliance.score ?? 0, 30);
  return Math.round((compliance.score ?? 0) * 0.80 + risk.score * 0.20);
}
```

---

## 4. Cycling-Phase Check

```typescript
function isCyclingOnDay(cycling: CyclingConfig, date: string): boolean {
  const daysDiff   = daysBetween(new Date(cycling.start_date), new Date(date));
  const cycleLen   = (cycling.on_weeks + cycling.off_weeks) * 7;
  const posInCycle = ((daysDiff % cycleLen) + cycleLen) % cycleLen;
  return posInCycle < cycling.on_weeks * 7;
}
// on_weeks=8, off_weeks=4: Tage 0–55=ON, 56–83=OFF, 84–139=ON ...
```

---

## 5. Mikronährstoff-Gap Score

```typescript
function calcGapScore(gaps: MicroGap[]): GapScore {
  const significant = gaps.filter(g => g.pct_of_rda < 80 && !g.covered_by_stack);
  const critical    = gaps.filter(g => g.pct_of_rda < 50 && !g.covered_by_stack);
  const penalty     = significant.length * 10 + critical.length * 10;
  return { score: Math.max(0, 100 - penalty), gaps_count: significant.length };
}
```

---

## 6. Monatliche Kosten

```typescript
const FREQUENCY_DAYS: Record<string, number> = {
  daily: 30, weekdays: 22, training_days: 16, cycling: 15,
};

function calcMonthlyCost(items: StackItemWithCost[]): CostBreakdown {
  const breakdown = items.map(item => ({
    name: item.custom_name ?? item.supplement_name,
    evidence_grade: item.evidence_grade,
    monthly_cost: (item.supplement?.cost_per_serving ?? 0) * (FREQUENCY_DAYS[item.frequency] ?? 30),
  }));
  return {
    total: breakdown.reduce((s, i) => s + i.monthly_cost, 0),
    breakdown,
    by_evidence: {
      essential: breakdown.filter(i => ['S','A'].includes(i.evidence_grade)).reduce((s,i) => s+i.monthly_cost, 0),
      moderate:  breakdown.filter(i => ['B','C'].includes(i.evidence_grade)).reduce((s,i) => s+i.monthly_cost, 0),
      low:       breakdown.filter(i => ['D','F'].includes(i.evidence_grade)).reduce((s,i) => s+i.monthly_cost, 0),
    },
  };
}
```
