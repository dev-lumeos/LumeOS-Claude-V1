# Buddy / AI Coach Module — Scoring Engine (Spec)
> Spec Phase 9 | BSS, Intervention, Policy Gate, Feature Gate, Output Contract

---

## 1. Behavior Stability Score (BSS) — vollständig

```typescript
// packages/scoring/src/buddy.ts

export interface BSSInput {
  // Stability Inputs
  workouts_per_week_avg:       number;
  workouts_per_week_stddev:    number;
  macro_hit_rate_avg:          number;    // 0–1
  macro_drift_variance:        number;    // 0–1
  sleep_avg_hours:             number;
  sleep_variance:              number;
  dropout_events_90d:          number;
  avg_days_to_return:          number;    // Bounceback-Zeit

  // Alignment Inputs
  target_workouts_week:        number;
  actual_workouts_avg:         number;
  protein_target_hit_rate:     number;   // 0–1
  calorie_target_hit_rate:     number;   // 0–1
  body_composition_on_track:   boolean;
}

export interface BSSResult {
  bss_total:           number;
  stability_score:     number;
  alignment_score:     number;
  sub_scores: {
    training_consistency:            number;
    nutrition_adherence_stability:   number;
    recovery_stability:              number;
    dropout_resilience:              number;
    bounceback_time:                 number;   // ← Strategisch wichtigster Sub-Score
  };
}

export function calcBSS(input: BSSInput): BSSResult {
  // --- STABILITY SUB-SCORES ---

  // Training Consistency (Variationskoeffizient)
  const trainingCV = input.workouts_per_week_stddev /
    Math.max(input.workouts_per_week_avg, 0.1);
  const trainingConsistency = Math.max(0, Math.min(100, Math.round(100 - trainingCV * 50)));

  // Nutrition Adherence Stability
  const nutritionStability = Math.max(0, Math.min(100, Math.round(
    input.macro_hit_rate_avg * 100 * (1 - input.macro_drift_variance)
  )));

  // Recovery Stability
  const sleepBase     = input.sleep_avg_hours >= 8 ? 100
                      : input.sleep_avg_hours >= 7 ? 85
                      : input.sleep_avg_hours >= 6 ? 65
                      : input.sleep_avg_hours >= 5 ? 40 : 20;
  const variancePenalty = Math.min(1, input.sleep_variance / 3);
  const recoveryStability = Math.max(0, Math.min(100, Math.round(sleepBase * (1 - variancePenalty))));

  // Dropout Resilience (weniger Dropout-Events = besser)
  const dropoutScore = Math.max(0, Math.min(100, Math.round(100 - input.dropout_events_90d * 10)));

  // Bounceback Time (schnelle Rückkehr nach Aussetzer = top Score)
  const bouncebackScore = Math.max(0, Math.min(100, Math.round(100 - input.avg_days_to_return * 12)));

  const stabilityScore = Math.round(
    trainingConsistency * 0.25 +
    nutritionStability  * 0.25 +
    recoveryStability   * 0.20 +
    dropoutScore        * 0.15 +
    bouncebackScore     * 0.15
  );

  // --- ALIGNMENT SUB-SCORES ---

  const trainingAlign = input.target_workouts_week > 0
    ? Math.min(100, Math.round((input.actual_workouts_avg / input.target_workouts_week) * 100))
    : 50;

  const nutritionAlign = Math.round(
    input.protein_target_hit_rate * 50 + input.calorie_target_hit_rate * 50
  );

  const bodyAlign = input.body_composition_on_track ? 80 : 40;

  const alignmentScore = Math.round(
    trainingAlign   * 0.40 +
    nutritionAlign  * 0.40 +
    bodyAlign       * 0.20
  );

  return {
    bss_total:       Math.round(stabilityScore * 0.5 + alignmentScore * 0.5),
    stability_score: stabilityScore,
    alignment_score: alignmentScore,
    sub_scores: {
      training_consistency:          trainingConsistency,
      nutrition_adherence_stability: nutritionStability,
      recovery_stability:            recoveryStability,
      dropout_resilience:            dropoutScore,
      bounceback_time:               bouncebackScore,
    },
  };
}
```

---

## 2. Feature Gate — vollständig

```typescript
export type FeatureTier = 'free' | 'plus' | 'pro' | 'elite' | 'coach_b2b';

export const FEATURE_TIERS: Record<string, FeatureTier> = {
  // Free
  'chat_basic':          'free',
  'insights_feed':       'free',

  // Plus
  'chat_unlimited':      'plus',
  'journey_heartbeat':   'plus',
  'briefings':           'plus',
  'all_personas':        'plus',

  // Pro
  'voice_input':         'pro',
  'action_execution':    'pro',
  'proactive_watcher':   'pro',
  'push_alerts':         'pro',
  'gym_finder':          'pro',

  // Elite
  'training_plans':      'elite',
  'cycle_consulting':    'elite',
  'weekly_deep_report':  'elite',

  // Coach B2B only
  'ai_clone':            'coach_b2b',
};

const TIER_RANK: Record<FeatureTier, number> = {
  free: 0, plus: 1, pro: 2, elite: 3, coach_b2b: 4
};

export function hasFeatureAccess(userTier: FeatureTier, featureKey: string): boolean {
  const required = FEATURE_TIERS[featureKey];
  if (!required) return true;  // Unbekanntes Feature → erlauben
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

export function buildUpgradeMessage(featureKey: string): string {
  const required = FEATURE_TIERS[featureKey];
  const TIER_NAMES: Record<FeatureTier, string> = {
    free: 'Free', plus: 'Plus', pro: 'Pro',
    elite: 'Elite', coach_b2b: 'Coach'
  };
  return `Dieses Feature ist im ${TIER_NAMES[required]}-Plan verfügbar.`;
}
```

---

## 3. Policy Gate — vollständig

```typescript
// packages/scoring/src/policy-gate.ts

interface PolicyGateResult {
  action:    'pass' | 'redact_rewrite' | 'block_escalate';
  rewritten?: string;
  reason?:    string;
}

const BLOCK_PATTERNS: RegExp[] = [
  /\b\d+\s*(mg|g|iu|mcg|ml)\b.*\b(nehm|nimm|einn|supplement|vitamin)\b/i,
  /\b(nehm|nimm)\b.{0,20}\d+\s*(mg|g|iu|mcg)/i,
  /\b(du hast|diagnose|leidest|hast.*krankheit)\b/i,
  /\b(therapiere|behandle|heile|kuriere)\b/i,
  /\bdas erklärt\b.{0,30}\b(müdigkeit|schmerz|schwäche|symptom)\b/i,
  /\b(ursache|grund)\b.{0,30}\b(symptom|müdigkeit|schmerz)\b/i,
  /\b(verursacht|ausgelöst durch)\b/i,
];

const REDACT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b(studien zeigen|studien belegen)\b/gi, 'es ist bekannt'],
  [/\b(meta-analysen|forschung zeigt)\b/gi, 'erfahrungen zeigen'],
  [/\b(wissenschaftlich bewiesen)\b/gi, 'gut dokumentiert'],
  [/\blauten.*einheit.*täglich\b/gi, 'besprich die genaue Menge mit deinem Arzt'],
];

export function runPolicyGate(response: CoachResponse): PolicyGateResult {
  const text = response.speech_text;

  // Hard Block
  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return { action: 'block_escalate', reason: `Pattern matched: ${pattern.source}` };
    }
  }

  // Redact
  let cleaned = text;
  let wasRedacted = false;
  for (const [pattern, replacement] of REDACT_REPLACEMENTS) {
    const result = cleaned.replace(pattern, replacement);
    if (result !== cleaned) { cleaned = result; wasRedacted = true; }
  }
  if (wasRedacted) return { action: 'redact_rewrite', rewritten: cleaned };

  return { action: 'pass' };
}

export function buildSafetyRedirectText(reason: string): string {
  return 'Bitte besprich das mit deinem Arzt. Ich bin kein Ersatz für medizinische Beratung.';
}
```

---

## 4. Identity Phase — vollständig

```typescript
export function getIdentityPhase(
  trustScore:        number,
  relationshipWeeks: number
): 'observe' | 'mirror' | 'reinforce' {
  if (trustScore < 0.60 || relationshipWeeks < 8)  return 'observe';
  if (trustScore < 0.75)                            return 'mirror';
  return 'reinforce';
}

export function checkIdentityStatement(
  statement:      string,
  identityPhase:  string
): { allowed: boolean; reason?: string } {
  if (identityPhase === 'observe') {
    return { allowed: false, reason: 'Trust too low for identity statements' };
  }
  if (identityPhase === 'mirror') {
    const identityClaims = /\b(du bist|du wirst|du wärst|jemand der|ein mensch der)\b/i;
    if (identityClaims.test(statement)) {
      return { allowed: false, reason: 'Identity claims not allowed in mirror phase' };
    }
  }
  return { allowed: true };
}
```

---

## 5. Intervention Selection — vollständig

```typescript
interface InterventionCandidate {
  type:  'confrontation'|'encouragement'|'adjustment'|'redirect'|'silence';
  tone:  'direct'|'soft'|'humorous'|'analytical'|'tough_love';
}

interface InterventionLimits {
  total:                 number;   max_total:              number;
  confrontations:        number;   max_confrontations:     number;
  identity_statements:   number;   max_identity_statements: number;
}

export function selectIntervention(
  ctx:     ContextVector,
  history: InterventionLog[]
): InterventionCandidate | null {
  // 1. Load Check
  const l = ctx.intervention_limits.intervention_load_7d;
  if (l.total >= l.max_total) return null;

  // 2. Bucket → Candidates
  const bucket     = determineBucket(ctx);
  const candidates = INTERVENTION_CANDIDATES[bucket] ?? [];
  if (candidates.length === 0) return null;

  // 3. Score Candidates
  const scored = candidates
    .filter(c => !isOnCooldown(c, ctx.user_id, history))
    .filter(c => c.type !== 'confrontation' || l.confrontations < l.max_confrontations)
    .map(c => ({
      ...c,
      score: calcCandidateScore(c, ctx, history),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}

function calcCandidateScore(
  c:       InterventionCandidate,
  ctx:     ContextVector,
  history: InterventionLog[]
): number {
  const historical = getHistoricalEffectiveness(c, ctx.user_id, history);  // 0–1
  const riskPenalty =
    (c.type === 'confrontation' && ctx.relationship.trust_score < 0.60) ? 0.40 : 1.0;
  const fatigue =
    1 - (ctx.intervention_limits.intervention_load_7d.total / 5) * 0.25;

  return historical * riskPenalty * fatigue;
}

function isOnCooldown(
  c:       InterventionCandidate,
  userId:  string,
  history: InterventionLog[]
): boolean {
  const COOLDOWNS: Record<string, number> = {
    confrontation: 48, encouragement: 24, adjustment: 12, redirect: 6
  };
  const hours    = COOLDOWNS[c.type] ?? 24;
  const lastSame = history
    .filter(h => h.user_id === userId && h.intervention_type === c.type)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!lastSame) return false;
  const hoursSince = (Date.now() - new Date(lastSame.created_at).getTime()) / 3_600_000;
  return hoursSince < hours;
}
```

---

## 6. Unit Tests

```typescript
describe('calcBSS', () => {
  it('perfect user → BSS > 90', () => {
    const r = calcBSS({
      workouts_per_week_avg: 5, workouts_per_week_stddev: 0.2,
      macro_hit_rate_avg: 0.95, macro_drift_variance: 0.03,
      sleep_avg_hours: 7.8, sleep_variance: 0.4,
      dropout_events_90d: 0, avg_days_to_return: 0.5,
      target_workouts_week: 5, actual_workouts_avg: 4.9,
      protein_target_hit_rate: 0.92, calorie_target_hit_rate: 0.90,
      body_composition_on_track: true,
    });
    expect(r.bss_total).toBeGreaterThan(85);
    expect(r.sub_scores.bounceback_time).toBeGreaterThan(90);
  });

  it('stable but misaligned → BSS around 60', () => {
    const r = calcBSS({
      workouts_per_week_avg: 2, workouts_per_week_stddev: 0.3,
      macro_hit_rate_avg: 0.90, macro_drift_variance: 0.05,
      sleep_avg_hours: 7.5, sleep_variance: 0.5,
      dropout_events_90d: 0, avg_days_to_return: 1,
      target_workouts_week: 5, actual_workouts_avg: 2,
      protein_target_hit_rate: 0.88, calorie_target_hit_rate: 0.85,
      body_composition_on_track: false,
    });
    expect(r.bss_total).toBeLessThan(70);
    expect(r.stability_score).toBeGreaterThan(r.alignment_score);
  });
});

describe('hasFeatureAccess', () => {
  it('free cannot use voice_input', () => {
    expect(hasFeatureAccess('free', 'voice_input')).toBe(false);
  });
  it('pro can use voice_input', () => {
    expect(hasFeatureAccess('pro', 'voice_input')).toBe(true);
  });
  it('plus cannot use weekly_deep_report', () => {
    expect(hasFeatureAccess('plus', 'weekly_deep_report')).toBe(false);
  });
  it('elite can use all features', () => {
    ['training_plans', 'cycle_consulting', 'weekly_deep_report'].forEach(f => {
      expect(hasFeatureAccess('elite', f)).toBe(true);
    });
  });
});

describe('runPolicyGate', () => {
  it('blocks dosage recommendation', () => {
    const r = runPolicyGate({ speech_text: 'Nimm 5000 IU Vitamin D täglich', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('block_escalate');
  });
  it('redacts study claims', () => {
    const r = runPolicyGate({ speech_text: 'Studien zeigen dass Kreatin wirkt', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('redact_rewrite');
    expect(r.rewritten).toContain('es ist bekannt');
  });
  it('passes safe advice', () => {
    const r = runPolicyGate({ speech_text: 'Heute noch 40g Protein essen', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('pass');
  });
  it('blocks diagnosis attempt', () => {
    const r = runPolicyGate({ speech_text: 'Das erklärt deine Müdigkeit', ui_cards: [], actions: [] } as any);
    expect(r.action).toBe('block_escalate');
  });
});

describe('getIdentityPhase', () => {
  it('returns observe for new user', () => {
    expect(getIdentityPhase(0.35, 3)).toBe('observe');
  });
  it('returns mirror at week 10 with trust 0.65', () => {
    expect(getIdentityPhase(0.65, 10)).toBe('mirror');
  });
  it('returns reinforce at week 20 with trust 0.80', () => {
    expect(getIdentityPhase(0.80, 20)).toBe('reinforce');
  });
  it('observe even at week 10 if trust too low', () => {
    expect(getIdentityPhase(0.55, 12)).toBe('observe');
  });
});
```
