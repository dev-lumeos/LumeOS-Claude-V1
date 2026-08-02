# Buddy / AI Coach Module — Scoring Engine

## 1. Behavior Stability Score (BSS)

```typescript
// packages/scoring/src/buddy.ts

export function calcBSS(snapshot: BSSInput): BSSResult {
  const stability = calcStabilityScore(snapshot);
  const alignment  = calcAlignmentScore(snapshot);
  return {
    bss_total:   Math.round(stability * 0.5 + alignment * 0.5),
    stability_score: stability,
    alignment_score: alignment,
  };
}

function calcStabilityScore(s: BSSInput): number {
  // Training Consistency: Varianz Workouts/Woche
  const trainingCV = s.workouts_per_week_stddev / Math.max(s.workouts_per_week_avg, 0.1);
  const trainingConsistency = Math.max(0, Math.min(100, 100 - trainingCV * 50));

  // Nutrition Adherence Stability
  const nutritionStability = Math.max(0, Math.min(100, s.macro_hit_rate_avg * 100 * (1 - s.macro_drift_variance)));

  // Recovery Stability
  const sleepScore = Math.max(0, Math.min(100, (s.sleep_avg_hours / 8) * 100));
  const recoveryStability = sleepScore * (1 - Math.min(1, s.sleep_variance / 3));

  // Dropout Resilience
  const dropoutScore = Math.max(0, 100 - s.dropout_events_90d * 10);

  // Bounceback Time (strategisch wichtigster Sub-Score)
  const bouncebackScore = Math.max(0, 100 - s.avg_days_to_return * 12);

  return Math.round(
    trainingConsistency * 0.25 +
    nutritionStability  * 0.25 +
    recoveryStability   * 0.20 +
    dropoutScore        * 0.15 +
    bouncebackScore     * 0.15
  );
}

function calcAlignmentScore(s: BSSInput): number {
  const trainingAlign  = s.target_workouts_week > 0
    ? Math.min(1, s.actual_workouts_avg / s.target_workouts_week) * 100 : 50;
  const nutritionAlign = (s.protein_target_hit_rate * 50) + (s.calorie_target_hit_rate * 50);
  const bodyAlign      = s.body_composition_on_track ? 80 : 40;

  return Math.round(trainingAlign * 0.40 + nutritionAlign * 0.40 + bodyAlign * 0.20);
}
```

---

## 2. Intervention Selection Algorithm

```typescript
interface InterventionCandidate {
  type:  'confrontation'|'encouragement'|'adjustment'|'redirect'|'silence';
  tone:  'direct'|'soft'|'humorous'|'analytical'|'tough_love';
  score: number;
}

function selectIntervention(
  ctx:     ContextVector,
  history: InterventionLog[]
): InterventionCandidate | null {
  // Bucket bestimmen
  const bucket = determineBucket(ctx);

  // Candidates für diesen Bucket
  const candidates = getCandidatesForBucket(bucket);

  // Score pro Candidate
  const scored = candidates.map(c => ({
    ...c,
    score: calcCandidateScore(c, ctx, history),
  }));

  // Cooldown-Filter
  const eligible = scored.filter(c => !isOnCooldown(c, ctx.user_id, history));

  if (eligible.length === 0) return null;  // Stille ist auch eine Entscheidung

  // Intervention-Load prüfen
  const load = ctx.intervention_limits.intervention_load_7d;
  if (load.total >= load.max_total) return null;
  if (eligible[0].type === 'confrontation' && load.confrontations >= load.max_confrontations) {
    return eligible.find(c => c.type !== 'confrontation') ?? null;
  }

  return eligible.sort((a, b) => b.score - a.score)[0];
}

function calcCandidateScore(
  c:       InterventionCandidate,
  ctx:     ContextVector,
  history: InterventionLog[]
): number {
  // Historische Effektivität für diesen Bucket + Type
  const histScore = getHistoricalEffectiveness(c, ctx.user_id, history);
  // Risk-Penalty für hohe Intensität bei niedrigem Trust
  const riskPenalty = c.type === 'confrontation' && ctx.relationship.trust_score < 0.6 ? 0.5 : 1.0;
  // Fatigue-Penalty wenn viele Interventionen kürzlich
  const fatiguePenalty = 1 - (ctx.intervention_limits.intervention_load_7d.total / 5) * 0.3;

  return histScore * riskPenalty * fatiguePenalty;
}
```

---

## 3. Context Vector Berechnung

```typescript
function buildContextVector(userId: string, state: BuddyState): ContextVector {
  return {
    features: {
      sleep_3d_avg:           calcSleep3dAvg(userId),
      missed_workouts_7d:     state.training_state.missed_workouts_7d,
      protein_adherence_7d:   state.nutrition_state.protein_adherence_7d,
      training_streak_days:   state.training_state.streak_days,
      stress_proxy:           calcStressProxy(state),
      time_of_day:            getTimeOfDay(),
      day_of_week:            getDayOfWeek(),
    },
    relationship: {
      trust_score:       getRelationshipTrust(userId),
      push_tolerance:    getPushTolerance(userId),
      preferred_tone:    getUserPreferredTone(userId),
      identity_phase:    getIdentityPhase(userId),
    },
    behavioral_signature: state.behavioral_signature,
    intervention_limits:  getInterventionLimits(userId),
  };
}
```

---

## 4. Policy Gate (Medical Safety)

```typescript
interface PolicyGateResult {
  action:   'pass' | 'redact_rewrite' | 'block_escalate';
  rewritten?: string;
  reason?:    string;
}

function runPolicyGate(response: CoachResponse): PolicyGateResult {
  const text = response.speech_text;

  // Hard Block Patterns
  const BLOCK_PATTERNS = [
    /nehm.{0,20}\d+\s*(mg|g|iu|mcg)/i,  // Dosierungen
    /(du hast|diagnose|erkrankung|therapie|behandle)/i,
    /das erklärt dein.{0,30}(müdigkeit|schmerz|schwäche)/i,
  ];
  for (const p of BLOCK_PATTERNS) {
    if (p.test(text)) {
      return { action: 'block_escalate', reason: 'Medical claim detected' };
    }
  }

  // Redact Patterns
  const REDACT_PATTERNS = [
    { pattern: /studien zeigen/i, replacement: 'Es ist bekannt' },
    { pattern: /meta-analysen belegen/i, replacement: 'Erfahrungen zeigen' },
  ];
  let cleaned = text;
  for (const r of REDACT_PATTERNS) {
    cleaned = cleaned.replace(r.pattern, r.replacement);
  }
  if (cleaned !== text) {
    return { action: 'redact_rewrite', rewritten: cleaned };
  }

  return { action: 'pass' };
}
```

---

## 5. Feature Gate (Tier Check)

```typescript
export const FEATURE_TIERS: Record<string, FeatureTier> = {
  'chat_basic':          'free',
  'insights_feed':       'free',
  'chat_daily_limit_5':  'free',
  'chat_unlimited':      'plus',
  'journey_heartbeat':   'plus',
  'briefings':           'plus',
  'all_personas':        'plus',
  'voice_input':         'pro',
  'action_execution':    'pro',
  'proactive_watcher':   'pro',
  'push_alerts':         'pro',
  'gym_finder':          'pro',
  'training_plans':      'elite',
  'cycle_consulting':    'elite',
  'weekly_deep_report':  'elite',
  'ai_clone':            'coach_b2b',
};

const TIER_RANK: Record<FeatureTier, number> = {
  free: 0, plus: 1, pro: 2, elite: 3, coach_b2b: 4
};

export function hasFeatureAccess(
  userTier:    FeatureTier,
  featureKey:  string
): boolean {
  const required = FEATURE_TIERS[featureKey];
  if (!required) return true;  // Unknown feature = allow
  return TIER_RANK[userTier] >= TIER_RANK[required];
}
```

---

## 6. Identity Phase Determination

```typescript
export function getIdentityPhase(
  trustScore:      number,
  relationshipWeeks: number
): 'observe' | 'mirror' | 'reinforce' {
  if (trustScore < 0.60 || relationshipWeeks < 8) return 'observe';
  if (trustScore < 0.75) return 'mirror';
  return 'reinforce';
}

export function canMakeIdentityStatement(
  phase: string,
  statement: string
): boolean {
  if (phase === 'observe') return false;
  if (phase === 'mirror') {
    // Mirror: nur Beobachtungen ("du hast 3 Wochen durchgehalten"), keine Identity-Claims
    return !/(du bist|du wirst|du wärst|jemand der)/i.test(statement);
  }
  return true;  // reinforce: alles erlaubt
}
```

---

## 7. Smart Actions für Floating Widget

```typescript
function generateSmartActions(stats: BuddyQuickStats): SmartAction[] {
  const actions: SmartAction[] = [];

  // Nutrition
  if (stats.protein_adherence < 0.60) {
    actions.push({ type: 'nutrition', priority: 'urgent', label: 'Protein nachbessern', icon: '🥩', route: 'diary' });
  } else if (stats.protein_adherence < 0.80) {
    actions.push({ type: 'nutrition', priority: 'recommended', label: 'Protein: noch etwas', icon: '🥩', route: 'diary' });
  }

  if (stats.calorie_over_pct > 1.10) {
    actions.push({ type: 'nutrition', priority: 'warning', label: 'Kalorien: über Ziel', icon: '⚠️', route: 'diary' });
  }

  // Training
  const hour = new Date().getHours();
  if (hour >= 16 && hour <= 20 && !stats.workout_today) {
    actions.push({ type: 'training', priority: 'recommended', label: 'Training einplanen', icon: '💪', route: 'training' });
  }

  // Recovery
  if (hour >= 21 && stats.sleep_goal_h > 0) {
    actions.push({ type: 'recovery', priority: 'recommended', label: 'Bettzeit vorbereiten', icon: '🌙', route: 'recovery' });
  }

  // Supplements
  if (stats.supplements_pending > 0) {
    actions.push({ type: 'supplements', priority: 'recommended', label: `${stats.supplements_pending} Supps fällig`, icon: '💊', route: 'supplements' });
  }

  return actions.sort((a, b) => (a.priority === 'urgent' ? -1 : 1));
}
```

---

## 8. Unit Tests

```typescript
describe('calcBSS', () => {
  it('stable 5×/week, perfect nutrition → BSS > 85', () => {
    const r = calcBSS({ workouts_per_week_avg: 5, workouts_per_week_stddev: 0.3,
      macro_hit_rate_avg: 0.92, macro_drift_variance: 0.05, sleep_avg_hours: 7.5,
      sleep_variance: 0.5, dropout_events_90d: 0, avg_days_to_return: 1,
      target_workouts_week: 5, actual_workouts_avg: 4.8, protein_target_hit_rate: 0.90,
      calorie_target_hit_rate: 0.88, body_composition_on_track: true });
    expect(r.bss_total).toBeGreaterThan(85);
  });
});

describe('hasFeatureAccess', () => {
  it('free tier cannot use voice_input', () => {
    expect(hasFeatureAccess('free', 'voice_input')).toBe(false);
  });
  it('pro tier can use voice_input', () => {
    expect(hasFeatureAccess('pro', 'voice_input')).toBe(true);
  });
  it('elite tier can use all features', () => {
    expect(hasFeatureAccess('elite', 'weekly_deep_report')).toBe(true);
  });
});

describe('runPolicyGate', () => {
  it('blocks dosage recommendations', () => {
    const r = runPolicyGate({ speech_text: 'Nimm 5000 IU Vitamin D täglich', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('block_escalate');
  });
  it('passes safe nutrition advice', () => {
    const r = runPolicyGate({ speech_text: 'Heute noch 40g Protein essen', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('pass');
  });
});
```
