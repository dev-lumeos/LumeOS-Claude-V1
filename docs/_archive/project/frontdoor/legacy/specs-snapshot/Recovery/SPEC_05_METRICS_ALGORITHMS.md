# Recovery Module — Recovery Score Algorithmen & Metriken
> Spec Phase 5 | Scores, Modifikatoren, Baseline-Systeme

---

## 1. Recovery Score (Vollständige Formel)

### Gewichtung je nach verfügbaren Daten

```typescript
// Mode 1: Self-Report Only (MVP)
const WEIGHTS_MANUAL = {
  sleep_quality:    0.30,
  sleep_duration:   0.15,
  subjective:       0.15,
  soreness:         0.10,
  training_load:    0.15,
  nutrition:        0.10,
  mood:             0.05,
};

// Mode 2: Mit HRV-Daten
const WEIGHTS_HRV = {
  hrv:              0.25,
  sleep_quality:    0.15,
  sleep_duration:   0.15,
  subjective:       0.10,
  soreness:         0.10,
  training_load:    0.15,
  nutrition:        0.10,
};
// mood fällt aus Gewichtung heraus wenn HRV verfügbar

// Mode 3: Mit Wearable (Sleep Stages + HRV)
const WEIGHTS_WEARABLE = {
  hrv:              0.25,
  sleep_quality:    0.10,  // aus Wearable
  deep_sleep:       0.10,  // neu
  sleep_duration:   0.10,
  sleep_efficiency: 0.05,  // neu
  subjective:       0.10,
  soreness:         0.10,
  training_load:    0.15,
  nutrition:        0.05,
};
```

### Einzelne Sub-Score-Berechnungen

```typescript
// Schlafqualität (1-10 → 0-100)
const sleepQualityScore = (quality / 10) * 100;

// Schlafdauer (vs. persönlichem Ziel, default 8h)
const sleepDurationScore = Math.min(hours / (personalTarget ?? 8), 1.0) * 100;

// Subjektives Empfinden (1-10 → 0-100)
const subjectiveScore = (feeling / 10) * 100;

// Muskelkater (0-3 je Gruppe → Durchschnitt → invertiert)
function sorenessScore(soreness: Record<string, number>): number {
  const values = Object.values(soreness);
  if (values.length === 0) return 100;  // Kein Kater = optimal
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.round((1 - avg / 3) * 100);
}

// Stimmung
const MOOD_SCORE: Record<string, number> = {
  motivated: 100, good: 80, neutral: 60, tired: 30, sick: 10,
};

// Training Load Score (via ACWR)
function trainingLoadScore(acwr: number): number {
  if (!acwr) return 70;  // Neutral wenn kein Training-Modul
  if (acwr >= 0.8 && acwr <= 1.2)  return 100;  // Optimal
  if (acwr > 1.2 && acwr <= 1.4)  return lerp(100, 60, (acwr - 1.2) / 0.2);
  if (acwr > 1.4 && acwr <= 1.6)  return lerp(60, 20, (acwr - 1.4) / 0.2);
  if (acwr > 1.6)                  return 0;
  // Zu wenig Training
  if (acwr < 0.8 && acwr >= 0.6)  return lerp(80, 90, (acwr - 0.6) / 0.2);
  return 90;  // Kein Training dieser Woche
}

// Nutrition Score (kommt direkt aus Nutrition-Modul 0-100)
const nutritionScore = nutritionCompliance ?? 70;

// HRV Score (vs. persönliche Baseline)
function hrvScore(rmssd: number, baseline: HRVBaseline): number {
  if (!baseline || baseline.data_points < 7) return 70;  // Zu wenig Daten
  const zScore = (rmssd - baseline.avg_rmssd) / Math.max(baseline.stddev_rmssd, 1);
  return Math.max(0, Math.min(100, Math.round(70 + zScore * 15)));
}

// Modality Bonus (max 5 Punkte)
function modalityBonus(modalities: RecoveryModality[]): number {
  const total = modalities
    .filter(m => isSameDay(m.logged_at, new Date()))
    .reduce((sum, m) => sum + (MODALITY_BONUS[m.modality_type] ?? 0.5), 0);
  return Math.min(5, total);
}
```

---

## 2. Muscle Recovery Berechnung (Details)

### Base Recovery Curve (lineare Interpolation)

```typescript
function baseRecoveryCurve(hoursSince: number): number {
  if (hoursSince < 0)  return 0;
  if (hoursSince < 12) return lerp(10, 30, hoursSince / 12);
  if (hoursSince < 24) return lerp(30, 50, (hoursSince - 12) / 12);
  if (hoursSince < 48) return lerp(50, 75, (hoursSince - 24) / 24);
  if (hoursSince < 72) return lerp(75, 90, (hoursSince - 48) / 24);
  if (hoursSince < 96) return lerp(90, 100, (hoursSince - 72) / 24);
  return 100;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}
```

### Typische Recovery-Zeiten je Muskelgruppe

| Muskelgruppe | Base Recovery (h) | Grund |
|---|---|---|
| Quadriceps | 72–96h | Große Muskelgruppe, metabolisch fordernd |
| Hamstrings | 72–96h | Exzentrische Belastung hoch |
| Glutes | 72–96h | Große Muskeln, hohe Aktivierung |
| Chest | 48–72h | Mittelgroß, Compound-Übungen |
| Back | 48–72h | Komplex, viele Muskeln |
| Shoulders | 48–72h | Häufig synergistisch involviert |
| Biceps | 36–48h | Kleiner Muskel, schnellere Erholung |
| Triceps | 36–48h | Kleiner Muskel |
| Forearms | 24–48h | Schnelle Erholung |
| Core | 24–48h | Hohe Stresstoleranz |

### Volume Modifier-Tabelle

| Sätze/Session | Modifier | Begründung |
|---|---|---|
| 1–4 | 1.15× | Sehr leichtes Training → schnellere Erholung |
| 5–8 | 1.05× | Leicht |
| 9–12 | 1.00× | Normal (baseline) |
| 13–18 | 0.85× | Hoch — mehr Repair nötig |
| 19–24 | 0.70× | Sehr hoch |
| 25+ | 0.50× | Nahe MRV — langsam |

### Kein Training geloggt
Wenn kein Training-Modul-Daten für Muskelgruppe vorhanden → 100% Recovery.

---

## 3. HRV Baseline System

### Rolling 30-Tage Average

```typescript
function updateHRVBaseline(
  userId: string,
  newMeasurement: number
): HRVBaseline {
  const last30 = getLastNMeasurements(userId, 30);
  const allValues = [...last30, newMeasurement];

  const avg = mean(allValues);
  const stddev = standardDeviation(allValues);

  return {
    user_id: userId,
    avg_rmssd: round(avg, 2),
    stddev_rmssd: round(stddev, 2),
    min_rmssd: round(Math.min(...allValues), 2),
    max_rmssd: round(Math.max(...allValues), 2),
    data_points: allValues.length,
    calculated_at: new Date(),
  };
}
```

### HRV Score Interpretation
- **Z > +2:** Außergewöhnlich hoch — Maximum Intensity empfohlen
- **Z +1 bis +2:** Überdurchschnittlich erholt
- **Z -1 bis +1:** Normal (70 Punkte = Basis)
- **Z -1 bis -2:** Unterdurchschnittlich — Intensität reduzieren
- **Z < -2:** Stark erholt — Rest Day oder leichtes Training

---

## 4. ACWR (Acute/Chronic Workload Ratio)

```typescript
function calcACWR(userId: string, date: string): number {
  const acute  = getTrainingLoadSum(userId, date, 7);   // letzte 7 Tage
  const chronic = getTrainingLoadAvg(userId, date, 28); // letzte 28 Tage Ø/Woche

  if (!chronic || chronic === 0) return 1.0;
  return acute / (chronic * 7 / 7);  // wöchentliche Basis
}

// Interpretation:
// < 0.8: Undertraining (Detraining-Risiko)
// 0.8–1.3: Sweet Spot (optimale Anpassung)
// 1.3–1.5: Erhöhtes Verletzungsrisiko
// > 1.5: Sehr hohes Verletzungs-/Übertrainingsrisiko
```

---

## 5. Übertraining Score

```typescript
interface OvertSignal {
  id: string;
  active: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  value: number;
  threshold: number;
}

function calcOvertScore(signals: OvertSignal[]): {
  score: number;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
} {
  const active = signals.filter(s => s.active);
  const score = active.length;

  return {
    score,
    severity:
      score === 0 ? 'none' :
      score <= 2  ? 'low' :
      score <= 4  ? 'moderate' :
      score <= 6  ? 'high' : 'critical',
  };
}
```

---

## 6. Sleep Score (Wearable-Daten)

```typescript
function calcSleepScoreWearable(sleep: SleepData): number {
  // Dauer (vs. 8h Ziel)
  const durationScore     = Math.min(sleep.total_sleep_minutes / 480, 1.0);

  // Effizienz (Schlafzeit / Zeit im Bett)
  const efficiencyScore   = (sleep.sleep_efficiency ?? 85) / 100;

  // Deep Sleep (Ziel: >90min oder >20%)
  const deepPct           = (sleep.deep_sleep_minutes ?? 0) / (sleep.total_sleep_minutes || 1);
  const deepScore         = Math.min(deepPct / 0.20, 1.0);

  // REM Sleep (Ziel: >90min oder >20%)
  const remPct            = (sleep.rem_sleep_minutes ?? 0) / (sleep.total_sleep_minutes || 1);
  const remScore          = Math.min(remPct / 0.20, 1.0);

  // Fragmentierung
  const wakeScore         = Math.max(0, 1 - (sleep.wake_frequency ?? 0) / 5);

  return Math.round((
    durationScore   * 0.35 +
    efficiencyScore * 0.25 +
    deepScore       * 0.20 +
    remScore        * 0.10 +
    wakeScore       * 0.10
  ) * 100);
}
```

---

## 7. TypeScript Types

```typescript
export type ReadinessLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'rest';
export type Mood = 'motivated' | 'good' | 'neutral' | 'tired' | 'sick';
export type SorenessLevel = 0 | 1 | 2 | 3;
export type ModalityType =
  'sauna' | 'cold_plunge' | 'contrast_therapy' | 'massage' | 'foam_rolling' |
  'stretching' | 'yoga' | 'meditation' | 'breathwork' | 'nap' | 'active_recovery';

export interface RecoveryScoreResult {
  recovery_score:          number;    // 0–100
  readiness_level:         ReadinessLevel;
  intensity_recommendation: string;
  components: {
    sleep_quality_score:     number;
    sleep_duration_score:    number;
    subjective_score:        number;
    soreness_score:          number;
    hrv_score?:              number;
    training_load_score:     number;
    nutrition_score:         number;
    mood_score:              number;
    modality_bonus:          number;
  };
  mode: 'manual' | 'hrv' | 'wearable';
}

export interface MuscleRecoveryResult {
  muscle_group: string;
  recovery_pct: number;
  status: 'ready' | 'recovering' | 'not_ready';
  hours_since_trained: number;
  estimated_ready_in_hours: number;
}

export interface HRVBaseline {
  avg_rmssd:    number;
  stddev_rmssd: number;
  data_points:  number;
}
```

---

## 8. Unit Tests

```typescript
describe('calcRecoveryScore', () => {

  it('perfect inputs → ~95 score', () => {
    const checkin = {
      sleep_quality: 9, sleep_hours: 8,
      subjective_feeling: 9, soreness: {},
      mood: 'motivated' as Mood,
    };
    const result = calcRecoveryScore(checkin, null, 1.0, 100, []);
    expect(result.recovery_score).toBeGreaterThan(90);
    expect(result.readiness_level).toBe('excellent');
  });

  it('sick day → low score', () => {
    const checkin = {
      sleep_quality: 4, sleep_hours: 5,
      subjective_feeling: 3, soreness: { chest: 3, legs: 3 },
      mood: 'sick' as Mood,
    };
    const result = calcRecoveryScore(checkin, null, 1.5, 30, []);
    expect(result.recovery_score).toBeLessThan(40);
    expect(result.readiness_level).toBe('rest');
  });

  it('modality bonus capped at 5', () => {
    const modalities = [
      { modality_type: 'sauna' },
      { modality_type: 'massage' },
      { modality_type: 'cold_plunge' },
      { modality_type: 'meditation' },
    ].map(m => ({ ...m, logged_at: new Date() }));
    expect(modalityBonus(modalities)).toBe(5);
  });

});

describe('calcMuscleRecovery', () => {

  it('72h rest + normal sleep + no soreness → high recovery', () => {
    const pct = calcMuscleRecovery('Quadriceps', 72, 10, 3000, { sleep_quality: 8, soreness: {} });
    expect(pct).toBeGreaterThan(75);
  });

  it('16h after heavy session + soreness → low recovery', () => {
    const pct = calcMuscleRecovery('Quadriceps', 16, 20, 6000, { sleep_quality: 7, soreness: { quadriceps: 3 } });
    expect(pct).toBeLessThan(30);
  });

});
```
