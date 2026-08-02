# Buddy / AI Coach Module — Engines (Spec)
> Spec Phase 5 | 11 deterministischen Engines

---

## Engine-Prinzip

Alle 11 Engines sind:
- Pure Functions (keine Side Effects)
- Deterministisch (gleiche Inputs = gleiche Outputs)
- Testbar ohne LLM
- Austauschbar (LLM ist Rendering-Schicht)

Engines berechnen. LLM erklärt.

---

## 1. Nutrition Engine

```typescript
interface NutritionEngineInput {
  food_events_today:    FoodEvent[];
  macro_targets:        MacroTargets;
  bodyweight_kg:        number;
  meal_timing_today:    string[];
}

interface NutritionEngineOutput {
  nutrition_score:       number;        // 0–100
  protein_gap_g:         number;        // negativ = Überschuss
  calorie_gap_kcal:      number;
  macro_balance:         MacroBalance;
  micronutrient_deficits: string[];
  meal_timing_flag:      boolean;
  hydration_score:       number;
  recommendation_candidates: string[];
}

function runNutritionEngine(input: NutritionEngineInput): NutritionEngineOutput {
  const totals = sumMacros(input.food_events_today);
  const proteinAdherence = totals.protein / Math.max(input.macro_targets.protein_g, 1);
  const calorieAdherence = totals.calories / Math.max(input.macro_targets.calories, 1);

  // Score: gewichtetes Mittel der Adherence-Werte
  const score = Math.round(
    Math.min(proteinAdherence, 1.2) * 40 +  // Protein max 120% = 40 Punkte
    Math.min(calorieAdherence, 1.1) * 35 +  // Kalorien max 110% = 35 Punkte
    (totals.fiber_g >= 25 ? 10 : totals.fiber_g / 25 * 10) +   // Ballaststoffe
    (totals.water_ml >= 2000 ? 15 : totals.water_ml / 2000 * 15) // Hydration
  );

  return {
    nutrition_score:      Math.min(100, Math.max(0, score)),
    protein_gap_g:        input.macro_targets.protein_g - totals.protein,
    calorie_gap_kcal:     input.macro_targets.calories - totals.calories,
    macro_balance:        calcMacroBalance(totals, input.macro_targets),
    micronutrient_deficits: findMicroDeficits(input.food_events_today),
    meal_timing_flag:     checkMealTiming(input.meal_timing_today),
    hydration_score:      Math.min(100, (totals.water_ml / 2500) * 100),
    recommendation_candidates: buildNutritionRecs(totals, input.macro_targets),
  };
}
```

---

## 2. Training Engine

```typescript
interface TrainingEngineInput {
  set_logs:           SetLog[];
  workout_templates:  WorkoutTemplate[];
  exercise_metadata:  ExerciseMetadata[];
  training_history:   WorkoutSession[];
  current_fatigue:    number;   // 0–1
}

interface TrainingEngineOutput {
  training_readiness:  number;         // 0–100
  progression_state:   'progressing'|'plateauing'|'regressing';
  fatigue_flags:       FatigueFlag[];
  overreach_risk:      'low'|'moderate'|'high';
  suggested_adjustments: TrainingAdjustment[];
  weekly_volume_kg:    number;
  volume_delta_pct:    number;          // vs. letzte Woche
  exercise_failures:   string[];
}

function calcProgressionState(
  history: WorkoutSession[],
  exerciseId: string
): 'progressing' | 'plateauing' | 'regressing' {
  const recent = history.filter(s => s.hasExercise(exerciseId)).slice(-4);
  if (recent.length < 3) return 'progressing';  // Nicht genug Daten

  const volumes = recent.map(s => s.getVolume(exerciseId));
  const slope   = calcLinearSlope(volumes);

  if (slope > 0.02) return 'progressing';
  if (slope < -0.02) return 'regressing';
  return 'plateauing';
}

function calcOverreachRisk(
  weeklyVolume:    number,
  avgWeeklyVolume: number,
  recoveryScore:   number,
  sleepHours:      number
): 'low' | 'moderate' | 'high' {
  const volumeSpike = weeklyVolume / Math.max(avgWeeklyVolume, 1);
  const recoveryFactor = recoveryScore / 100;

  if (volumeSpike > 1.40 && recoveryFactor < 0.60) return 'high';
  if (volumeSpike > 1.25 || recoveryFactor < 0.50) return 'moderate';
  return 'low';
}
```

---

## 3. Recovery Engine

```typescript
interface RecoveryEngineInput {
  sleep_hours:          number;
  sleep_regularity:     number;    // 0–1 (Wie regelmäßig)
  sleep_quality:        number;    // 0–10 subjektiv
  training_load_7d:     number;    // ACWR Nominator
  training_load_28d:    number;    // ACWR Denominator
  subjective_fatigue:   number;    // 1–10
  soreness_scores:      Record<string, number>;   // Muskelgruppe → 0–10
  hrv_score?:           number;    // Optional (Wearable)
}

function runRecoveryEngine(input: RecoveryEngineInput): RecoveryEngineOutput {
  // ACWR (Acute:Chronic Workload Ratio)
  const acwr = input.training_load_28d > 0
    ? input.training_load_7d / input.training_load_28d : 1.0;

  // Sleep Score
  const sleepScore = calcSleepScore(input.sleep_hours, input.sleep_quality, input.sleep_regularity);

  // HRV Score (wenn vorhanden)
  const hrvScore = input.hrv_score ? calcHRVScore(input.hrv_score) : 70;

  // ACWR Score (1.0–1.3 = optimal, < 0.8 oder > 1.5 = problematisch)
  const acwrScore = acwr >= 0.8 && acwr <= 1.3 ? 100 - Math.abs(1.0 - acwr) * 100 : Math.max(0, 100 - Math.abs(1.0 - acwr) * 200);

  // Soreness Score
  const maxSoreness = Math.max(...Object.values(input.soreness_scores), 0);
  const sorenessScore = Math.max(0, 100 - maxSoreness * 8);

  const recoveryScore = Math.round(
    sleepScore   * 0.35 +
    hrvScore     * 0.25 +
    acwrScore    * 0.20 +
    sorenessScore * 0.10 +
    (100 - input.subjective_fatigue * 10) * 0.10
  );

  return {
    recovery_score:        Math.min(100, Math.max(0, recoveryScore)),
    sleep_priority_flag:   sleepScore < 60,
    deload_recommendation: acwr > 1.5 || recoveryScore < 40,
    recovery_drivers:      identifyRecoveryDrivers(input),
    heavy_training_ok:     recoveryScore >= 65,
  };
}

function calcSleepScore(hours: number, quality: number, regularity: number): number {
  const hourScore    = hours >= 8 ? 100 : hours >= 7 ? 85 : hours >= 6 ? 65 : hours >= 5 ? 40 : 20;
  const qualityScore = (quality / 10) * 100;
  return Math.round(hourScore * 0.6 + qualityScore * 0.25 + regularity * 100 * 0.15);
}
```

---

## 4. Biomarker Engine

```typescript
interface BiomarkerEngineInput {
  blood_values:      BloodValue[];    // {marker, value, unit}
  reference_ranges:  ReferenceRange[]; // aus lab_reference_ranges Tabelle
  user_sex:          'male'|'female';
  user_age:          number;
  lab_history:       BloodValue[][];  // Vorherige Messungen
}

function runBiomarkerEngine(input: BiomarkerEngineInput): BiomarkerEngineOutput {
  const flags: BiomarkerFlag[] = [];
  const drifts: DriftSummary[] = [];

  for (const bv of input.blood_values) {
    const range = input.reference_ranges.find(r => r.marker === bv.marker);

    // REGEL: Wenn kein Referenzbereich → NIEMALS als "auffällig" markieren
    if (!range) continue;

    const isLow  = bv.value < range.min;
    const isHigh = bv.value > range.max;

    if (isLow || isHigh) {
      flags.push({
        marker:     bv.marker,
        value:      bv.value,
        unit:       bv.unit,
        status:     isLow ? 'below_range' : 'above_range',
        reference:  `${range.min}–${range.max} ${bv.unit}`,
        severity:   calcSeverity(bv.value, range),
        // KEIN Supplement-Vorschlag, kein Diagnose-Versuch
      });
    }

    // Trend-Analyse wenn History vorhanden
    const history = input.lab_history.map(batch => batch.find(v => v.marker === bv.marker));
    if (history.length >= 2) {
      const trend = calcTrend(history.filter(Boolean).map(v => v!.value));
      if (Math.abs(trend) > 0.1) {
        drifts.push({ marker: bv.marker, trend, direction: trend > 0 ? 'rising' : 'falling' });
      }
    }
  }

  return {
    biomarker_risk_flags:    flags,
    drift_summary:           drifts,
    escalation_recommendation: flags.some(f => f.severity === 'critical'),
    retest_suggestions:      flags.map(f => f.marker),
    // Keine Supplement-Empfehlungen — Entkopplung ist absolute Regel
  };
}
```

---

## 5. Supplement Engine

```typescript
function runSupplementEngine(input: SupplementEngineInput): SupplementEngineOutput {
  const interactions: InteractionFlag[] = [];
  const redundancies: RedundancyFlag[]  = [];

  // Interaction Check (deterministisch)
  for (let i = 0; i < input.stack.length; i++) {
    for (let j = i + 1; j < input.stack.length; j++) {
      const inter = checkInteraction(input.stack[i], input.stack[j]);
      if (inter) interactions.push({ ...inter, a: input.stack[i], b: input.stack[j] });
    }
  }

  // UL (Tolerable Upper Level) Check
  for (const supp of input.stack) {
    const totalDose = getTotalDose(supp, input.stack);
    const ul = getULForNutrient(supp.nutrient_id);
    if (ul && totalDose > ul * 0.90) {
      interactions.push({
        severity: totalDose > ul ? 'critical' : 'warning',
        type:     'ul_exceeded',
        message:  `${supp.name}: Obere Toleranzgrenze${totalDose > ul ? ' überschritten' : ' fast erreicht'}`,
      });
    }
  }

  // Stack Safety Score
  const criticalCount = interactions.filter(i => i.severity === 'critical').length;
  const warningCount  = interactions.filter(i => i.severity === 'warning').length;
  const safetyScore   = Math.max(0, 100 - criticalCount * 40 - warningCount * 15);

  return {
    stack_safety_score: safetyScore,
    interaction_flags:  interactions,
    redundancy_flags:   redundancies,
    gap_suggestions:    [],  // Keine Gap-Suggestions basierend auf Blutwerten!
    // Supplement-Empfehlungen kommen aus Ziel + Präferenz, NIE aus Blutwerten
  };
}
```

---

## 6. Body Composition Engine

```typescript
function runBodyCompositionEngine(input: BodyCompEngineInput): BodyCompEngineOutput {
  const weights     = input.bodyweight_history.slice(-14);
  const weightTrend = calcWeightTrend(weights);
  const tdee        = estimateAdaptiveTDEE(input.calorie_history, weights);

  const phaseState = determinePhaseState(
    weightTrend,
    input.goal,
    tdee,
    calcAvg(input.calorie_history.slice(-7))
  );

  return {
    composition_score:     calcCompositionScore(weightTrend, input.goal),
    phase_state:           phaseState,
    projected_weight_change: calcProjection(weightTrend, 4),  // 4 Wochen
    tdee_estimate:         tdee,
    on_track:              isOnTrack(phaseState, input.goal),
    weekly_weight_avg:     calcWeeklyAvg(weights),
  };
}
```

---

## 7. Behaviour Engine

```typescript
function runBehaviourEngine(input: BehaviourEngineInput): BehaviourEngineOutput {
  const loggingDays      = input.events_30d.filter(e => e.is_logging_event).length;
  const logConsistency   = loggingDays / 30;

  const planRejections   = input.events_30d.filter(e => e.type === 'plan_rejection').length;
  const planRejectionRate = planRejections / Math.max(input.plans_presented, 1);

  const missedWorkouts   = input.events_30d.filter(e => e.type === 'workout_missed').length;
  const adherenceScore   = 1 - (missedWorkouts / Math.max(input.workouts_scheduled, 1));

  const complianceScore  = Math.round(
    logConsistency   * 40 +
    (1 - planRejectionRate) * 30 +
    adherenceScore   * 30
  );

  return {
    compliance_score:      Math.min(100, Math.max(0, complianceScore)),
    adherence_pattern:     detectAdherencePattern(input.events_30d),
    habit_focus_candidates: identifyHabitFocus(input.events_30d),
    logging_consistency:   logConsistency,
    plan_rejection_rate:   planRejectionRate,
  };
}
```

---

## 8. Circadian Engine

```typescript
function runCircadianEngine(input: CircadianEngineInput): CircadianEngineOutput {
  const sleepMidpoint    = calcSleepMidpoint(input.sleep_timing, input.wake_timing);
  const mealSpread       = calcMealSpread(input.meal_timing);
  const trainingWindow   = getOptimalTrainingWindow(input.chronotype ?? 'intermediate');

  const circadianScore = calcCircadianAlignment(
    sleepMidpoint, mealSpread, input.training_timing, trainingWindow
  );

  return {
    circadian_alignment_score: circadianScore,
    timing_flags:              identifyTimingFlags(input),
    optimal_training_window:   trainingWindow,
    optimal_meal_window:       calcOptimalMealWindow(sleepMidpoint),
  };
}
```

---

## 9. Energy Availability Engine

```typescript
function runEnergyAvailabilityEngine(input: EnergyAvailabilityInput): EnergyAvailabilityOutput {
  const leanBodyMass  = input.bodyweight_kg * (1 - (input.body_fat_pct ?? 20) / 100);
  const energyAvailability = (input.calorie_intake - input.exercise_energy_expenditure) / leanBodyMass;

  // LOW EA: < 30 kcal/kg LBM = RED (Risiko für Hormonstörungen, Knochenprobleme)
  // MODERATE: 30–45 kcal/kg LBM
  // OPTIMAL: > 45 kcal/kg LBM
  const eaStatus = energyAvailability < 30 ? 'low' : energyAvailability < 45 ? 'moderate' : 'optimal';

  return {
    energy_availability_score: Math.min(100, Math.max(0, (energyAvailability / 45) * 100)),
    energy_availability_kcal:  energyAvailability,
    ea_status:                 eaStatus,
    underfueling_flag:         eaStatus === 'low',
  };
}
```

---

## 10. Stress Load Engine

```typescript
function runStressLoadEngine(input: StressLoadInput): StressLoadOutput {
  // Monotony = Avg Load / StdDev Load (hohe Monotonie = Übertraining-Risiko)
  const monotony = calcMonotony(input.daily_training_loads);
  // Strain = Weekly Load × Monotony
  const strain   = input.weekly_training_load * monotony;

  const stressScore = Math.min(100, Math.max(0,
    (input.weekly_training_load / input.baseline_load) * 40 +
    (1 - input.sleep_quality / 10) * 30 +
    input.subjective_stress / 10 * 30
  ));

  return {
    stress_load_score:   stressScore,
    overload_flag:       stressScore > 75 || strain > 6000,
    monotony:            monotony,
    strain:              strain,
    workload_adjustment: stressScore > 75 ? 'reduce_by_20pct' : 'maintain',
  };
}
```

---

## 11. Electrolyte Engine

```typescript
function runElectrolyteEngine(input: ElectrolyteInput): ElectrolyteOutput {
  const DRI = { sodium: 2300, potassium: 4700, magnesium: 400 };  // mg/Tag

  const sodiumAdh  = input.sodium_mg  / DRI.sodium;
  const potAdh     = input.potassium_mg / DRI.potassium;
  const magAdh     = input.magnesium_mg / DRI.magnesium;

  const balanceScore = Math.round((
    Math.min(sodiumAdh, 1.5) / 1.5 +
    Math.min(potAdh, 1.0) +
    Math.min(magAdh, 1.0)
  ) / 3 * 100);

  const imbalanceFlags: string[] = [];
  if (sodiumAdh > 1.5) imbalanceFlags.push('sodium_high');
  if (potAdh < 0.6)    imbalanceFlags.push('potassium_low');
  if (magAdh < 0.6)    imbalanceFlags.push('magnesium_low');

  return {
    electrolyte_balance_score: balanceScore,
    imbalance_flags:           imbalanceFlags,
    intake_gaps:               imbalanceFlags,
  };
}
```

---

## Engine Orchestration

```typescript
// Welche Engines laufen bei welchem Event?
const ENGINE_TRIGGERS: Record<string, string[]> = {
  meal_logged:        ['nutrition', 'electrolyte', 'energy_availability'],
  workout_completed:  ['training', 'recovery', 'stress_load', 'body_composition'],
  sleep_logged:       ['recovery', 'circadian'],
  bodyweight_logged:  ['body_composition', 'energy_availability'],
  supplement_taken:   ['supplement'],
  blood_test_imported: ['biomarker'],
  check_in:           ['behaviour', 'recovery'],
  daily_refresh:      ['nutrition', 'training', 'recovery', 'behaviour', 'stress_load'],
};

async function runEnginesForEvent(
  userId:    string,
  eventType: string,
  state:     BuddyState
): Promise<Partial<BuddyState>> {
  const engines = ENGINE_TRIGGERS[eventType] ?? [];
  const results: Partial<BuddyState> = {};

  for (const engine of engines) {
    const input  = buildEngineInput(engine, state, userId);
    const output = await runEngine(engine, input);
    mergeEngineOutput(results, engine, output);
  }

  return results;
}
```
