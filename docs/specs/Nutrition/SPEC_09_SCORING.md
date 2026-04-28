# Nutrition Module — Scoring Engine

> Spec Phase 9 | Deterministische Score-Berechnung

---

## Prinzipien

- Alle Scores sind **Pure Functions** — gleiche Inputs → immer gleicher Output
- Kein AI, kein ML, keine Zufälligkeit
- Vollständig testbar mit Unit Tests
- Scores werden **nie persistiert** (immer on-demand berechnet)
- Implementierungsort: `packages/scoring/src/nutrition.ts`

---

## 1. Nutrition Daily Score

### Zweck

Misst wie gut der User seine täglichen Makro-Targets erfüllt hat. Liefert `compliance_score` (0–100) an Goals.

### Formel

```typescript
function calcNutritionScore(
  actual: DailyMacros,
  target: NutritionTarget,
  level: UserLevel
): NutritionScore {

  const mult = LEVEL_MULTIPLIER[level];

  // Adjusted Targets (Level-Multiplikator)
  const adj = {
    calories: target.calorie_target * mult,
    protein:  target.protein_target * mult,
    carbs:    target.carbs_target   * mult,
    fat:      target.fat_target     * mult,
    fiber:    target.fiber_target   * mult,
  };

  // Compliance pro Makro (0.0 – 1.0)
  const protein_comp  = Math.min(actual.prot625 / adj.protein, 1.0);
  const carbs_comp    = Math.min(actual.cho     / adj.carbs,   1.0);
  const fat_comp      = Math.min(actual.fat     / adj.fat,     1.0);
  const fiber_comp    = Math.min(actual.fibt    / adj.fiber,   1.0);

  // Kalorien: bidirektional — Über- UND Unter-Essen zählen als Abweichung
  const calorie_comp  = Math.max(
    0,
    1.0 - Math.abs(actual.enercc - adj.calories) / adj.calories
  );

  // Gewichteter Score
  const raw = (
    protein_comp  * 0.30 +
    calorie_comp  * 0.25 +
    carbs_comp    * 0.15 +
    fat_comp      * 0.15 +
    fiber_comp    * 0.15
  );

  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  return {
    score,
    status: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'block',
    breakdown: {
      protein_compliance:  protein_comp,
      calorie_compliance:  calorie_comp,
      carbs_compliance:    carbs_comp,
      fat_compliance:      fat_comp,
      fiber_compliance:    fiber_comp,
    },
    level_multiplier: mult,
  };
}
```

### Level-Multiplikatoren

LevelMultiplierBedeutung`beginner`0.7575% des Targets = 100% Score`intermediate`0.9090% = 100%`advanced`1.00100% = 100%`elite`1.10110% = 100% — höhere Erwartung

### Score-Status Thresholds

ScoreStatusFarbeBedeutung≥ 80`ok`🟢Ziele gut erfüllt50–79`warn`🟡Verbesserungsbedarf&lt; 50`block`🔴Signifikante Abweichung

### Edge Cases

```typescript
// Kein Essen geloggt
if (actual.enercc === 0) return { score: 0, status: 'block' }

// Keine Targets gesetzt (Fallback-Defaults aktiv)
if (!target || !target.calorie_target) return { score: null, status: 'no_target' }

// Fiber-Target 0 (nicht gesetzt) → Fiber ignorieren, Gewichtung auf andere Makros verteilen
if (target.fiber_target === 0) {
  // protein 0.375, calorie 0.3125, carbs 0.1875, fat 0.1875
}

// Extrem-Überschuss (>200% der Kalorien) → Score kann nie negativ werden
calorie_comp = Math.max(0, calorie_comp)  // bereits durch Math.max(0, ...) abgedeckt
```

---

## 2. Plan Compliance Score

### Zweck

Misst wie konsequent der User seinen aktiven Meal Plan befolgt. Wird an Goals als `plan_compliance_pct` übermittelt.

### Formel

```typescript
function calcPlanCompliance(logs: MealPlanLog[]): PlanCompliance {
  const decided = logs.filter(l =>
    l.status === 'confirmed' || l.status === 'deviated' || l.status === 'skipped'
  );
  const successful = logs.filter(l =>
    l.status === 'confirmed' || l.status === 'deviated'
  );
  const pending = logs.filter(l => l.status === 'pending');

  // Compliance nur über entschiedene Items
  const compliance_pct = decided.length > 0
    ? Math.round((successful.length / decided.length) * 100)
    : null;  // null = noch keine Entscheidungen getroffen

  // Durchschnittliche Abweichung bei deviated Items
  const deviated = logs.filter(l => l.status === 'deviated' && l.deviation_pct !== null);
  const avg_deviation_pct = deviated.length > 0
    ? Math.round(deviated.reduce((sum, l) => sum + Math.abs(l.deviation_pct!), 0) / deviated.length)
    : 0;

  return {
    total_items: logs.length,
    confirmed: logs.filter(l => l.status === 'confirmed').length,
    deviated: deviated.length,
    skipped: logs.filter(l => l.status === 'skipped').length,
    pending: pending.length,
    compliance_pct,
    avg_deviation_pct,
  };
}
```

### Regeln

- `pending` Items zählen **nicht** im Nenner (kein Zwang, kein Malus)
- `deviated` zählt als Erfolg für Compliance (User hat sich aktiv entschieden)
- Compliance = `null` wenn noch keine Items entschieden wurden
- Skipped Items zählen als entschieden (bewusste Wahl)

---

## 3. Mikronährstoff Flags

### Zweck

Identifiziert Nährstoffe die signifikant unter oder über dem Zielwert liegen.

### Berechnung

```typescript
function calcMicroFlags(
  dailySummary: Record<string, number>,  // nutrient_code → Tageswert
  targets: NutritionTarget,              // inkl. RDA-Werte aus nutrient_defs
  userTier: 1 | 2 | 3
): MicroFlag[] {
  const flags: MicroFlag[] = [];

  // Tier-Filter: nur Nährstoffe des User-Tiers und darunter
  const relevantCodes = NUTRIENT_DEFS
    .filter(nd => nd.display_tier <= userTier)
    .map(nd => nd.code);

  for (const code of relevantCodes) {
    const actual = dailySummary[code] ?? 0;
    const target = getRDAForCode(code, targets);  // aus nutrient_defs.rda_male/female
    if (!target || target === 0) continue;

    const pct = (actual / target) * 100;

    // Deficit
    if (pct < 100) {
      let severity: 'info' | 'warn' | 'critical';
      if (pct < 50)       severity = 'critical';
      else if (pct < 80)  severity = 'warn';
      else                severity = 'info';

      flags.push({
        nutrient_code: code,
        flag_type: 'deficit',
        actual_value: actual,
        target_value: target,
        pct_of_target: Math.round(pct * 10) / 10,
        severity,
      });
    }

    // Surplus
    else if (pct > 200) {
      flags.push({
        nutrient_code: code,
        flag_type: 'surplus',
        actual_value: actual,
        target_value: target,
        pct_of_target: Math.round(pct * 10) / 10,
        severity: pct > 300 ? 'critical' : 'warn',
      });
    }
  }

  return flags.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);
}

const SEVERITY_ORDER = { critical: 3, warn: 2, info: 1 };
```

### RDA-Werte (aus nutrient_defs)

RDA-Werte kommen direkt aus `nutrition.nutrient_defs.rda_male` / `rda_female`. Kein Hardcoding im Scoring-Code — immer aus DB.

**Ausnahmen (kein RDA → kein Flag):**

- `ENERCJ` (kJ) — doppelt zu ENERCC
- `ASH`, `NT` — Hilfswerte ohne nutritiven Zielwert
- `OA` — Organische Säuren gesamt
- Berechnete Summen-Parameter (MNSAC, DISAC, etc.) wenn Einzelwerte bereits geflaggt

---

## 4. Water Compliance

```typescript
function calcWaterCompliance(
  total_ml: number,
  target_ml: number
): WaterCompliance {
  const pct = target_ml > 0 ? (total_ml / target_ml) * 100 : 100;
  return {
    total_ml,
    target_ml,
    pct: Math.round(pct * 10) / 10,
    met: pct >= 100,
    status: pct >= 100 ? 'ok' : pct >= 80 ? 'warn' : 'low',
  };
}
```

---

## 5. For-Goals Output

```typescript
function buildGoalsContribution(
  nutritionScore: NutritionScore,
  waterCompliance: WaterCompliance,
  planCompliance: PlanCompliance | null
): GoalsContribution {
  return {
    module: 'nutrition',
    compliance_score: nutritionScore.score ?? 0,
    details: {
      calorie_adherence_pct:  Math.round(nutritionScore.breakdown.calorie_compliance  * 100),
      protein_adherence_pct:  Math.round(nutritionScore.breakdown.protein_compliance  * 100),
      carbs_adherence_pct:    Math.round(nutritionScore.breakdown.carbs_compliance    * 100),
      fat_adherence_pct:      Math.round(nutritionScore.breakdown.fat_compliance      * 100),
      fiber_adherence_pct:    Math.round(nutritionScore.breakdown.fiber_compliance    * 100),
      water_target_met:       waterCompliance.met,
      water_pct:              waterCompliance.pct,
      plan_compliance_pct:    planCompliance?.compliance_pct ?? null,
    },
  };
}
```

---

## 6. Pending Actions Logik

```typescript
function calcPendingActions(
  date: string,                          // heute
  ghostEntries: MealPlanLog[],           // pending Ghost Entries für heute
  waterCompliance: WaterCompliance,
  meals: Meal[],
  currentHour: number                    // 0–23
): PendingAction[] {
  const actions: PendingAction[] = [];

  // 1. Offene Ghost Entries
  for (const entry of ghostEntries.filter(e => e.status === 'pending')) {
    const scheduledHour = getMealScheduledHour(entry.meal_type);
    const isPast = currentHour > scheduledHour;
    actions.push({
      id: entry.id,
      type: 'meal_confirm',
      priority: isPast ? 'high' : 'normal',
      label: `${MEAL_TYPE_LABELS[entry.meal_type]} bestätigen`,
      subtitle: buildPlanItemSummary(entry),
      plan_item_id: entry.plan_item_id,
      meal_type: entry.meal_type,
      scheduled_time: `${scheduledHour}:00`,
      action_url: `/nutrition/diary?confirm=${entry.id}`,
    });
  }

  // 2. Water Reminder (nach 18 Uhr wenn < 80%)
  if (currentHour >= 18 && !waterCompliance.met && waterCompliance.pct < 80) {
    const remaining = waterCompliance.target_ml - waterCompliance.total_ml;
    actions.push({
      id: 'water-reminder',
      type: 'water_reminder',
      priority: 'normal',
      label: `Noch ${remaining}ml bis Tagesziel`,
      current_ml: waterCompliance.total_ml,
      target_ml: waterCompliance.target_ml,
      action_url: '/nutrition/water',
    });
  }

  // 3. Kein Meal geloggt (nach 14 Uhr)
  if (currentHour >= 14 && meals.length === 0) {
    actions.push({
      id: 'no-meal-logged',
      type: 'no_meal_logged',
      priority: 'normal',
      label: 'Noch keine Mahlzeit geloggt heute',
      action_url: '/nutrition/diary',
    });
  }

  // Sortierung: high zuerst, dann chronologisch
  return actions.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return 0;
  });
}

const MEAL_TYPE_LABELS = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
  pre_workout: 'Pre-Workout',
  post_workout: 'Post-Workout',
  other: 'Mahlzeit',
};
```

---

## 7. For-AI Buddy Output

```typescript
function buildBuddyContext(
  dailySummary: DailyNutritionSummary,
  target: NutritionTarget,
  microFlags: MicroFlag[],
  lastMeal: Meal | null,
  activePlan: ActivePlanStatus | null,
  waterCompliance: WaterCompliance
): BuddyContext {

  const remaining = {
    protein_g:    Math.max(0, target.protein_target - dailySummary.total_protein_g),
    calories_kcal: Math.max(0, target.calorie_target - dailySummary.total_kcal),
    water_ml:     Math.max(0, target.water_target   - waterCompliance.total_ml),
  };

  const status_parts = [
    `${Math.round(dailySummary.total_protein_g)}/${target.protein_target}g Protein`,
    `${Math.round(dailySummary.total_kcal)}/${target.calorie_target} kcal`,
    `Wasser ${Math.round(waterCompliance.pct)}%`,
  ];

  const flags = microFlags
    .filter(f => f.severity !== 'info')
    .map(f => `${f.nutrient_code.toLowerCase()}_${f.flag_type}`);

  const recommendations = buildRecommendations(remaining, microFlags, activePlan);

  return {
    daily_status: status_parts.join(' · '),
    last_meal: lastMeal
      ? `vor ${getHoursAgo(lastMeal.created_at)}h (${MEAL_TYPE_LABELS[lastMeal.meal_type]})`
      : 'noch nichts gegessen',
    remaining,
    flags,
    active_plan: activePlan ? {
      name: activePlan.plan_name,
      pending_confirms: activePlan.pending_count,
      next_meal: activePlan.next_scheduled_meal,
    } : null,
    recommendations,
  };
}

function buildRecommendations(
  remaining: Remaining,
  microFlags: MicroFlag[],
  plan: ActivePlanStatus | null
): string[] {
  const recs: string[] = [];

  if (remaining.protein_g > 20)
    recs.push(`Noch ${remaining.protein_g}g Protein offen`);

  const criticalMicros = microFlags.filter(f => f.severity === 'critical');
  for (const m of criticalMicros.slice(0, 2)) {
    recs.push(`${NUTRIENT_NAMES[m.nutrient_code]} heute nur ${Math.round(m.pct_of_target)}% RDA`);
  }

  if (plan?.pending_count > 0)
    recs.push(`${plan.pending_count} Mahlzeit(en) aus Plan noch nicht bestätigt`);

  return recs;
}
```

---

## 8. TypeScript Types

```typescript
// packages/scoring/src/nutrition.ts

export type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export const LEVEL_MULTIPLIER: Record<UserLevel, number> = {
  beginner:     0.75,
  intermediate: 0.90,
  advanced:     1.00,
  elite:        1.10,
};

export interface DailyMacros {
  enercc:  number;
  prot625: number;
  fat:     number;
  cho:     number;
  fibt:    number;
}

export interface NutritionScore {
  score:       number;                        // 0–100
  status:      'ok' | 'warn' | 'block' | 'no_target';
  breakdown: {
    protein_compliance:  number;              // 0.0–1.0
    calorie_compliance:  number;
    carbs_compliance:    number;
    fat_compliance:      number;
    fiber_compliance:    number;
  };
  level_multiplier: number;
}

export interface MicroFlag {
  nutrient_code: string;
  flag_type:     'deficit' | 'surplus';
  actual_value:  number;
  target_value:  number;
  pct_of_target: number;
  severity:      'info' | 'warn' | 'critical';
}

export interface PlanCompliance {
  total_items:       number;
  confirmed:         number;
  deviated:          number;
  skipped:           number;
  pending:           number;
  compliance_pct:    number | null;
  avg_deviation_pct: number;
}

export interface WaterCompliance {
  total_ml:  number;
  target_ml: number;
  pct:       number;
  met:       boolean;
  status:    'ok' | 'warn' | 'low';
}

export interface PendingAction {
  id:           string;
  type:         'meal_confirm' | 'water_reminder' | 'no_meal_logged';
  priority:     'high' | 'normal';
  label:        string;
  subtitle?:    string;
  action_url:   string;
  [key: string]: unknown;
}
```

---

## 9. Test-Cases (Unit Tests)

```typescript
describe('calcNutritionScore', () => {

  it('perfect compliance → 100', () => {
    const score = calcNutritionScore(
      { enercc: 2400, prot625: 180, fat: 75, cho: 250, fibt: 30 },
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'advanced'
    );
    expect(score.score).toBe(100);
    expect(score.status).toBe('ok');
  });

  it('beginner at 75% targets → 100 (level adjustment)', () => {
    const score = calcNutritionScore(
      { enercc: 1800, prot625: 135, fat: 56, cho: 188, fibt: 22 },
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'beginner'  // mult = 0.75, so 75% = 100%
    );
    expect(score.score).toBe(100);
  });

  it('zero food logged → score 0, status block', () => {
    const score = calcNutritionScore(
      { enercc: 0, prot625: 0, fat: 0, cho: 0, fibt: 0 },
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'intermediate'
    );
    expect(score.score).toBe(0);
    expect(score.status).toBe('block');
  });

  it('over-eating calories reduces score', () => {
    const score = calcNutritionScore(
      { enercc: 4800, prot625: 180, fat: 75, cho: 250, fibt: 30 },  // 200% kalorien
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'advanced'
    );
    // calorie_comp = 1 - |4800-2400|/2400 = 1 - 1 = 0 → score deutlich reduziert
    expect(score.score).toBeLessThan(75);
  });

  it('protein overachievement capped at 1.0', () => {
    const score = calcNutritionScore(
      { enercc: 2400, prot625: 360, fat: 75, cho: 250, fibt: 30 },  // 200% protein
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'advanced'
    );
    expect(score.breakdown.protein_compliance).toBe(1.0);  // capped
  });

  it('score between 50-79 → warn status', () => {
    const score = calcNutritionScore(
      { enercc: 1400, prot625: 100, fat: 40, cho: 140, fibt: 15 },  // ~60% compliance
      { calorie_target: 2400, protein_target: 180, fat_target: 75, carbs_target: 250, fiber_target: 30 },
      'advanced'
    );
    expect(score.status).toBe('warn');
  });
});

describe('calcMicroFlags', () => {

  it('vitamin D deficit < 50% → critical', () => {
    const flags = calcMicroFlags(
      { 'VITD': 4 },   // 4µg von 20µg RDA = 20%
      mockTarget,
      1
    );
    const vitdFlag = flags.find(f => f.nutrient_code === 'VITD');
    expect(vitdFlag?.severity).toBe('critical');
    expect(vitdFlag?.flag_type).toBe('deficit');
  });

  it('no flag for 100% compliance', () => {
    const flags = calcMicroFlags(
      { 'VITD': 20 },   // 100% RDA
      mockTarget,
      1
    );
    expect(flags.find(f => f.nutrient_code === 'VITD')).toBeUndefined();
  });

});
```
