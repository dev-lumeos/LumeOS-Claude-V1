# Lumeos Scoring-System & Safety Rules

**Date:** 2026-02-17
**Status:** Aligned mit LUMEOS_OVERVIEW.md
**Scope:** Systemweite Definitionen für Scoring, Thresholds, Safety Order

---

## Scoring-System (0-100)

### Grundprinzip
- Jedes Modul hat einen eigenen **0-100 Score**
- Es gibt **KEINEN aggregierten Gesamt-Score** — Dashboard zeigt 5 individuelle Scores
- Scores sind **deterministisch** (Pure Functions, testbar)
- AI Coach **verpackt** Scores in Sprache, **berechnet** sie nicht

### Modul-Scores

| Modul | Score-Typ | Key Metric | Thresholds (ok/warn/block) |
|-------|-----------|------------|---------------------------|
| Nutrition | Daily Score | Macro Compliance % | 80/50 |
| Training | Session Score | Session Score | 80/50 |
| Supplements | Daily Score | Safety + Compliance | 80/50 |
| Recovery | Daily Score | Recovery Score | **75/50** (abweichend!) |
| Medical | System Scores (5×) | Niedrigster System Score | 80/50 |

### Status-Mapping

| Score | Status | Farbe | Bedeutung |
|-------|--------|-------|-----------|
| ≥ 80 | `ok` | 🟢 Grün | Alles im grünen Bereich |
| 50-79 | `warn` | 🟡 Gelb | Aufmerksamkeit erforderlich |
| < 50 | `block` | 🔴 Rot | Kritisch, Handlung nötig |

### User-Adaptive Thresholds

Scores werden relativ zu User-Targets berechnet. Der Multiplikator passt die Erwartung an:

| Level | Multiplikator | Beispiel (Protein Target 140g) |
|-------|---------------|-------------------------------|
| beginner | 0.75 | 105g = 100% |
| intermediate | 0.90 | 126g = 100% |
| advanced | 1.00 | 140g = 100% |
| elite | 1.10 | 154g = 100% |

---

## Scoring-Formeln pro Modul

### Nutrition Score (Daily)

```typescript
function calcNutritionScore(actual: Macros, target: Macros, level: Level): number {
  const mult = LEVEL_MULTIPLIER[level];
  const adjustedTarget = {
    calories: target.calories * mult,
    protein: target.protein * mult,
    carbs: target.carbs * mult,
    fat: target.fat * mult,
    fiber: target.fiber * mult,
  };
  
  // Compliance pro Macro (0-100%, capped at 100)
  const proteinComp = Math.min(actual.protein / adjustedTarget.protein, 1.0);
  const carbsComp = Math.min(actual.carbs / adjustedTarget.carbs, 1.0);
  const fatComp = Math.min(actual.fat / adjustedTarget.fat, 1.0);
  const fiberComp = Math.min(actual.fiber / adjustedTarget.fiber, 1.0);
  const calorieComp = 1 - Math.abs(actual.calories - adjustedTarget.calories) / adjustedTarget.calories;
  
  // Gewichtung
  const score = (
    proteinComp * 0.30 +
    calorieComp * 0.25 +
    carbsComp * 0.15 +
    fatComp * 0.15 +
    fiberComp * 0.15
  ) * 100;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### Training Score (Session)

```typescript
function calcTrainingScore(session: WorkoutSession): number {
  let score = 100; // Base
  
  // Missing Sets Penalty
  const planned = session.plannedSets.length;
  const logged = session.loggedSets.length;
  if (planned > 0) {
    const missingPenalty = ((planned - logged) / planned) * 30;
    score -= missingPenalty;
  }
  
  // Low Volume Penalty
  const todayVolume = calcTotalVolume(session.loggedSets);
  const avgVolume7d = session.avgVolume7d;
  if (avgVolume7d > 0 && todayVolume < avgVolume7d * 0.70) {
    score -= 15;
  }
  
  // RPE Adherence Bonus (optional)
  // Falls RPE geloggt und innerhalb ±1 vom Plan: +5
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### Supplements Score (Daily)

```typescript
function calcSupplementScore(stack: StackItem[], intakeLogs: IntakeLog[], interactions: Interaction[]): number {
  // HARD BLOCK OVERRIDE
  const criticalInteractions = interactions.filter(i => i.severity === 'critical');
  const medConflicts = interactions.filter(i => i.type === 'medication_conflict');
  if (criticalInteractions.length > 0 || medConflicts.length > 0) {
    return 0; // Sofort block
  }
  
  let score = 100;
  
  // Compliance: wurden alle geplanten Supplements genommen?
  const planned = stack.filter(s => s.active).length;
  const taken = intakeLogs.filter(l => l.taken).length;
  const compliancePenalty = planned > 0 ? ((planned - taken) / planned) * 40 : 0;
  score -= compliancePenalty;
  
  // Timing Penalty: falsche Uhrzeit?
  const wrongTiming = intakeLogs.filter(l => l.timingDeviation > 120); // >2h off
  score -= wrongTiming.length * 5;
  
  // Interaction Warnings (non-critical)
  const warnings = interactions.filter(i => i.severity === 'warning');
  score -= warnings.length * 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

**Interaktionstypen:**
| Typ | Bedeutung | Beispiel |
|-----|-----------|---------|
| `synergy` | Verstärkende Wirkung | Vitamin D + K2 |
| `absorption` | Beeinflusst Aufnahme | Eisen + Vitamin C (positiv), Eisen + Calcium (negativ) |
| `conflict` | Potenziell problematisch | Hohe Zink-Dosis + Kupfer |
| `timing` | Timing-Empfehlung | Magnesium + ZMA = abends |

### Recovery Score (Daily)

```typescript
function calcRecoveryScore(data: RecoveryData): number {
  // Gewichtung: Sleep 60%, Load 30%, Subjective 10%
  
  // Sleep Score (0-100)
  const sleepDurationScore = Math.min(data.sleepHours / 8.0, 1.0) * 100;
  const sleepQualityScore = data.sleepQuality * 10; // 1-10 → 10-100
  const interruptionPenalty = data.interruptions * 10; // -10 pro Unterbrechung
  const sleepScore = Math.max(0, (sleepDurationScore * 0.5 + sleepQualityScore * 0.5) - interruptionPenalty);
  
  // Load Score (inverse of training load)
  // High load = low recovery score
  const loadIndex = data.trainingLoadIndex; // 0-100
  const loadScore = Math.max(0, 100 - loadIndex);
  
  // Subjective Score (optional, 1-10 direkt)
  const subjectiveScore = data.subjectiveRecovery ? data.subjectiveRecovery * 10 : null;
  
  // Composite
  let score: number;
  if (subjectiveScore !== null) {
    score = sleepScore * 0.60 + loadScore * 0.30 + subjectiveScore * 0.10;
  } else {
    // Ohne Subjective: Sleep 65%, Load 35%
    score = sleepScore * 0.65 + loadScore * 0.35;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Recovery Thresholds (abweichend von Standard!)
// ≥ 75 = ready (ok)
// 50-74 = caution (warn)  
// < 50 = rest (block)
```

**Training Readiness:**
| Score | Status | Empfehlung |
|-------|--------|-----------|
| ≥ 75 | `ready` | Normales Training |
| 50-74 | `caution` | Reduziertes Volumen/Intensität |
| < 50 | `rest` | Kein Training, aktive Recovery |

### Medical Scores (5 System-Scores)

```typescript
interface SystemScore {
  system: 'liver' | 'cardio' | 'kidney' | 'hormone' | 'metabolic';
  analytes: AnalyteResult[];
  score: number; // 0-100
}

const SYSTEM_ANALYTES = {
  liver:     ['ALT', 'AST', 'GGT', 'Bilirubin', 'Albumin'],
  cardio:    ['LDL', 'HDL', 'Triglycerides', 'CRP', 'Homocysteine'],
  kidney:    ['Creatinine', 'BUN', 'eGFR', 'Uric_Acid'],
  hormone:   ['Testosterone', 'Estradiol', 'Cortisol', 'TSH', 'T3', 'T4'],
  metabolic: ['HbA1c', 'Fasting_Glucose', 'Insulin', 'HOMA_IR'],
};

function calcSystemScore(analytes: AnalyteResult[], ranges: OptimalRange[]): number {
  let totalWeight = 0;
  let weightedScore = 0;
  
  for (const analyte of analytes) {
    const range = ranges.find(r => r.code === analyte.code);
    if (!range || analyte.value === null) continue;
    
    const weight = range.weight || 1;
    totalWeight += weight;
    
    // In optimal range = 100, in lab-normal = 70, out of range = proportional to deviation
    if (analyte.value >= range.optimalLow && analyte.value <= range.optimalHigh) {
      weightedScore += 100 * weight;
    } else if (analyte.value >= range.labLow && analyte.value <= range.labHigh) {
      // In lab-normal but not optimal
      weightedScore += 70 * weight;
    } else {
      // Out of range — score decreases with deviation
      const deviation = analyte.value < range.labLow
        ? (range.labLow - analyte.value) / range.labLow
        : (analyte.value - range.labHigh) / range.labHigh;
      const outScore = Math.max(0, 50 - deviation * 100);
      weightedScore += outScore * weight;
    }
  }
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : -1; // -1 = no data
}

// Gesamt-Status = Niedrigster System-Score
function calcMedicalStatus(systems: SystemScore[]): Status {
  const lowest = Math.min(...systems.filter(s => s.score >= 0).map(s => s.score));
  if (lowest >= 80) return 'ok';
  if (lowest >= 50) return 'warn';
  return 'block';
}
```

---

## Safety Order (Prioritätskette)

Bei Konflikten zwischen Modulen gilt IMMER diese Reihenfolge:

```
1. 🩺 MEDICAL BLOCKS         — Immer oberste Priorität
   "Leberwerte kritisch → KEIN hepatotoxisches Supplement"
   
2. 💊 SUPPLEMENTS BLOCKS     — Interaktions-Konflikte
   "Kritische Wechselwirkung → STOP"
   
3. 😴 RECOVERY REST          — Übertraining vermeiden
   "Recovery < 50 → kein hartes Training"
   
4. 📋 PROTOCOLS              — Regelbasierte Empfehlungen
   "Protein unter 80% → Empfehlung anzeigen"
   
5. ⚡ OPTIMIZATION           — Performance-Feintuning
   "Creatine-Timing optimieren"
```

### Hard Blocks (nicht überschreibbar)

| Trigger | Aktion | Beispiel |
|---------|--------|---------|
| Medical Score < 30 | BLOCK alle Supplement-Empfehlungen | Leberwerte kritisch → keine oralen Supplements |
| Critical Interaction | BLOCK Supplement-Einnahme | Blutverdünner + hohe Omega-3 Dosis |
| Medication Conflict | BLOCK Supplement | Schilddrüsenmedikament + Eisen (gleichzeitig) |
| Recovery < 50 + Training planned | WARNING + Alternative | "Heute besser Mobility statt Heavy Squats" |

### Soft Blocks (überschreibbar mit User-Bestätigung)

| Trigger | Aktion | Beispiel |
|---------|--------|---------|
| Recovery 50-74 | CAUTION + Empfehlung | "Reduziertes Volumen empfohlen. Trotzdem trainieren?" |
| Nutrition < 50 | WARNING | "Heute wenig gegessen. Protein-Ziel 40% verfehlt." |
| Medical Trend negativ | INFO | "Dein Cholesterin steigt seit 3 Monaten." |

---

## Cross-Module Interactions

### Safety Order in der Praxis

```
Szenario: User hat
- Medical: Leberwerte erhöht (ALT 65, Score 45/100 → warn)
- Supplements: Stack enthält NAC (gut für Leber) + Kava (hepatotoxisch)
- Training: Heavy Leg Day geplant
- Recovery: Score 52 (caution)

Safety Chain:
1. Medical: WARN → "Leberwerte erhöht"
2. Supplements: BLOCK Kava → "Hepatotoxisch bei erhöhten Leberwerten"
   → NAC: SUGGEST → "Kann Leberwerte unterstützen (mit Arzt besprechen)"
3. Recovery: CAUTION → "Reduziertes Volumen empfohlen"
4. Training: Adjust → AI passt Workout an (weniger Volumen, keine Maximalversuche)
5. Nutrition: SUGGEST → "Erhöhe Antioxidantien (Brokkoli, Beeren, Kurkuma)"
```

---

## Medical Safety Disclaimer

**⚠️ LUMEOS Medical ist KEIN Arzt.**

Es ist ein regelbasiertes Monitoringsystem. Es liefert:
- ✅ Trend-Analyse von Biomarkern
- ✅ Optimal vs. Lab-Normal Range Vergleich
- ✅ Automatische Alerts bei kritischen Werten
- ✅ Medikamenten-Tracking + Interaktionschecks

Es liefert NICHT:
- ❌ Diagnosen
- ❌ Therapieplanung
- ❌ Dosierungsempfehlungen für Medikamente
- ❌ Medizinische Beratung

**Auto-Disclaimer (bei jedem Medical Output):**
> "Lumeos ist kein medizinisches Gerät und ersetzt keinen Arzt. Bespreche Änderungen immer mit deinem Arzt."

---

*Aligned mit LUMEOS_OVERVIEW.md, Stand: 2026-02-17*
