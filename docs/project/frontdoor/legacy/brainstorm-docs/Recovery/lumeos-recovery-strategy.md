# Lumeos Recovery Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **13 Competitors analysiert** across 5 Kategorien: Wearable Ecosystems (WHOOP, Oura, Garmin, Polar), Sleep Tech (Eight Sleep), HRV Specialists (HRV4Training, Elite HRV), Stress/Wellbeing (Welltory, Calm, Headspace), Muscle Recovery (NONE dedicated)
- **Market Size:** Sleep Tech $51B (2025), Wearables $116B (2025)
- **Key Players:** WHOOP ($3.6B Valuation), Oura (2.5M+ Rings), Garmin ($5.9B Revenue)

### Kritische Gaps
1. **Muscle-Specific Recovery = COMPLETELY UNDERSERVED** — kein Wearable, keine App trackt welche Muskelgruppe wie erholt ist. WHOOP gibt einen globalen Recovery Score, aber nicht "Quads sind noch kaputt von Montag"
2. **Recovery Score ist Industry Standard** — WHOOP (0-100%), Oura Readiness, Garmin Body Battery. Lumeos MUSS einen haben
3. **HRV = Gold Standard** für Recovery-Messung, alle Wearables nutzen es
4. **Wearable Lock-in** — WHOOP kostet $30/mo, Oura $6/mo, Garmin braucht $300+ Watch. Users sind genervt von Hardware-Zwang
5. **No app combines Recovery + Training Load + Nutrition + Sleep** — WHOOP hat Strain, aber kennt dein Trainingsvolumen nicht. Oura kennt deinen Schlaf, aber nicht dein Protein

### Competitive Intelligence
- **WHOOP:** Bester Recovery Score, $30/mo Subscription (kein einmal-Kauf), Strain Coach, Journal Feature, aber: teuer + eigene Hardware nötig
- **Oura:** Bester Sleep Tracker, Readiness Score, aber: Ring-Kauf ($299+) + $6/mo, kein Training-Integration
- **Garmin:** Body Battery Score, größtes Wearable-Ökosystem, aber: Watch-gebunden, keine App-standalone-Lösung
- **HRV4Training:** Validiert Phone-Camera HRV (200K+ Users, peer-reviewed), beweist dass HRV ohne Wearable geht
- **Eight Sleep:** Pod ($2K+) für Sleep-Optimierung, Thermal Regulation, Premium Niche

---

## 🏗️ Lumeos Recovery — Architektur

### Modul-Übersicht
```
┌────────────────────────────────────────────────┐
│              RECOVERY MODULE                    │
├───────────┬────────────┬───────────────────────┤
│  Sleep    │  HRV /     │  Muscle Recovery      │
│  Tracking │  Readiness │  (per Muscle Group)   │
├───────────┴────────────┴───────────────────────┤
│          Lumeos Recovery Score (0-100%)          │
│  Composite: Sleep + HRV + Muscle + Stress       │
├────────────────────────────────────────────────┤
│          Wearable Integration Layer             │
│  Apple Health · Google Health Connect · Direct   │
├────────────────────────────────────────────────┤
│         Cross-Module Connectors                 │
│  Training Load ↔ Nutrition ↔ Medical ↔ Goals    │
└────────────────────────────────────────────────┘
```

### Recovery Score Algorithm
```
Recovery Score = weighted composite:
  Sleep Quality    (30%) — Duration, Efficiency, Deep Sleep %, Consistency
  HRV Status       (25%) — Resting HRV vs. 30-day baseline, Trend
  Muscle Readiness (25%) — Per-group recovery estimation from Training Log
  Stress/Wellbeing (10%) — Self-reported or wearable Stress Score
  Biomarkers       (10%) — CRP, Cortisol, Testosterone (if available from Medical)
```

### Muscle Recovery Engine
```typescript
interface MuscleGroupRecovery {
  muscleGroup: MuscleGroup;          // e.g., 'quadriceps'
  lastTrainedAt: Date;
  totalSetsLast7d: number;
  totalVolumeLast7d: number;         // kg × reps
  estimatedRecoveryHours: number;    // based on volume + intensity
  currentRecoveryPercent: number;    // 0-100%
  readyForTraining: boolean;         // >80% = ready
  riskLevel: 'low' | 'moderate' | 'overreaching';
}

// Factors:
// - Sets performed (MV → MEV → MAV → MRV from Training Module)
// - Intensity (RPE, %1RM)
// - Sleep quality (previous night)
// - Nutrition (Protein intake, caloric surplus/deficit)
// - Age, Training Experience
// - Self-reported soreness (optional)
```

### Datenfluss
1. **Input:** Wearable Data (Sleep, HRV, Steps) + Training Log + Self-Report
2. **Processing:** Sleep Analysis → HRV Baseline Comparison → Muscle Recovery Estimation
3. **Cross-Module:** Training Volume → Recovery Load, Nutrition → Recovery Speed, Bloodwork → Recovery Capacity
4. **Output:** Recovery Score, Muscle Readiness Map, Training Recommendations

---

## 👤 Persona Design

### Persona 1: "Alex" — Serious Lifter ohne Wearable (35%)
- **Alter:** 27, männlich, trainiert 5-6x/Woche
- **Ziel:** Nicht overtrain, Muskelgruppen optimal rotieren
- **Pain Points:** Hat kein WHOOP ($30/mo zu teuer), will trotzdem wissen ob er heute trainieren sollte
- **Feature-Needs:** Muscle Recovery Map, Phone Camera HRV, Training Load Tracking, Sleep Logging
- **Zahlungsbereitschaft:** $9.99/mo — deutlich günstiger als WHOOP

### Persona 2: "Sandra" — Oura/WHOOP User (25%)
- **Alter:** 34, weiblich, CrossFit + Running
- **Ziel:** Wearable-Daten mit Training/Nutrition verbinden
- **Pain Points:** WHOOP zeigt Recovery Score aber weiß nicht was sie gegessen hat oder welche Muskeln kaputt sind
- **Feature-Needs:** Wearable Sync, Cross-Module Insights, Muscle-Specific Recovery, Nutrition×Recovery Correlation
- **Zahlungsbereitschaft:** $9.99/mo (zusätzlich zu Wearable-Kosten)

### Persona 3: "Peter" — Sleep Optimizer (25%)
- **Alter:** 45, männlich, Manager mit Schlafproblemen
- **Ziel:** Schlafqualität verbessern, Factors verstehen
- **Pain Points:** Oura zeigt Schlaf-Daten aber keine Empfehlungen basierend auf Ernährung/Supplements
- **Feature-Needs:** Sleep Analysis, Supplement Correlation (Magnesium, Melatonin), Caffeine Tracking, Sleep Hygiene Score
- **Zahlungsbereitschaft:** $9.99/mo

### Persona 4: "Lisa" — Injury Recovery (15%)
- **Alter:** 30, weiblich, nach Kreuzband-OP
- **Ziel:** Reha-Fortschritt tracken, safe zum Training zurück
- **Pain Points:** Physio sagt "hör auf deinen Körper" aber will Daten
- **Feature-Needs:** Injury Tracking, Modified Training Suggestions, Recovery Timeline, Doctor Export
- **Zahlungsbereitschaft:** $9.99/mo (zeitlich begrenzt)

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers

| Tier | Preis | Features |
|------|-------|----------|
| **Free** | $0 | Basic Sleep Log, Manual HRV Entry, Training Recovery Timer, Muscle Soreness Self-Report |
| **Plus** | $9.99/mo | Phone Camera HRV, Recovery Score, Muscle Recovery Map, Wearable Sync, Sleep Analysis, Trends |
| **Pro** | $19.99/mo | Cross-Module Correlation, Biomarker Integration, Custom Recovery Protocols, Coach Sharing, API |

### Revenue Streams
1. **Subscriptions** (80%) — Core Revenue
2. **Wearable Affiliate** (10%) — Oura/WHOOP/Garmin Purchase Links (5-10% Commission)
3. **Supplement Recommendations** (5%) — "Dein Recovery Score ist niedrig → Magnesium + ZMA?"
4. **Sleep Product Affiliate** (5%) — Matratzen, Supplements, Blaulichtbrillen

### Conversion Strategy
- **Free → Plus:** "Dein Phone kann HRV messen — aktiviere es" + Muscle Recovery Map Teaser
- **Plus → Pro:** "Dein Recovery Score korreliert mit deinem Protein-Intake → sieh die Analyse"
- **vs. WHOOP:** $9.99/mo vs. $30/mo, keine Hardware nötig, PLUS Training/Nutrition Integration

---

## 🔧 Technical Architecture

### Wearable Integration — MVP Strategy
```
Tier 1 (MVP): Health Aggregators
  → Apple HealthKit (iOS) — covers Apple Watch, Oura, WHOOP, Garmin, Fitbit
  → Google Health Connect (Android) — covers Wear OS, Samsung, Fitbit, Oura
  → Coverage: ~90% aller Wearable-User mit 2 Integrations

Tier 2 (Phase 2): Direct APIs
  → WHOOP API (detailed Strain/Recovery)
  → Oura API (detailed Sleep Stages)
  → Garmin Connect API (Body Battery, Training Load)
  → Polar Flow API (Training Load Pro)

Tier 3 (Phase 3): No-Hardware
  → Phone Camera HRV (via PPG — validated by HRV4Training)
  → Accelerometer Sleep Detection
  → Phone Microphone Snore Detection
```

### HRV Measurement (Phone Camera)
```
Phone Camera (Flashlight ON) → Finger on Lens
  → PPG Signal Extraction (60 seconds)
  → R-R Interval Detection
  → RMSSD Calculation (HRV metric)
  → Compare to 30-day rolling baseline
  → Output: HRV Score + Trend + Recovery Impact

Validation: HRV4Training published peer-reviewed studies
Accuracy: r=0.98 vs. chest strap (in controlled conditions)
Limitation: Requires 60s morning measurement (compliance challenge)
```

### Recovery Score Computation
```typescript
function computeRecoveryScore(data: RecoveryInput): number {
  const sleepScore = computeSleepScore(data.sleep);         // 0-100
  const hrvScore = computeHRVScore(data.hrv, data.baseline); // 0-100
  const muscleScore = computeMuscleReadiness(data.training);  // 0-100
  const stressScore = data.stressLevel ?? 70;                 // 0-100, default neutral
  const bioScore = data.biomarkers ? computeBioScore(data.biomarkers) : 70;

  return Math.round(
    sleepScore * 0.30 +
    hrvScore * 0.25 +
    muscleScore * 0.25 +
    stressScore * 0.10 +
    bioScore * 0.10
  );
}
```

### Tech Stack
```
HRV:       Custom PPG library (camera access) or HealthKit/Health Connect
Sleep:     HealthKit/Health Connect data + custom analysis
ML:        TensorFlow Lite (on-device sleep stage classification)
Cache:     30-day rolling HRV baseline (local SQLite)
Sync:      Background sync every 15 min (HealthKit observer)
```

---

## ⚖️ Key Design Decisions

### 1. Recovery Score ist Pflicht
**Decision:** Lumeos hat einen eigenen Recovery Score (0-100%)
**Rationale:** Industry Standard (WHOOP, Oura, Garmin haben alle einen). Ohne Score fehlt das Core Value Proposition. Composite Score aus Sleep + HRV + Muscle + Stress + Biomarkers.

### 2. Phone Camera HRV als Wearable-Alternative
**Decision:** HRV-Messung über Phone-Kamera als Free/Plus Feature
**Rationale:** HRV4Training hat mit 200K+ Usern und peer-reviewed Papers bewiesen dass PPG via Phone-Kamera valide ist (r=0.98 vs. Chest Strap). Ermöglicht Recovery Score OHNE $300+ Wearable. Massiver Accessibility-Gewinn.

### 3. Apple Health + Google Health Connect First
**Decision:** Wearable-Integration über Health Aggregators, nicht Direct APIs
**Rationale:** 2 Integrations covern ~90% aller Wearable-User. Direct APIs (WHOOP, Oura, Garmin) erst in Phase 2 für detailliertere Daten. Minimaler Dev-Aufwand, maximale Coverage.

### 4. Muscle-Specific Recovery als Killer Feature
**Decision:** Recovery nicht nur global (WHOOP-Style) sondern pro Muskelgruppe
**Rationale:** KEIN Competitor bietet das. Training Module liefert die Daten (welche Muskeln, wie viel Volumen, welche Intensität). Recovery Module berechnet wann welche Muskelgruppe wieder ready ist. Direkte Training-Empfehlung: "Heute Push, nicht Pull — Lats noch bei 65%".

### 5. Sleep als Eingangstor (nicht HRV)
**Decision:** Sleep Tracking ist prominenter als HRV im UI
**Rationale:** Jeder versteht "Schlaf". HRV ist für Nerds. Sleep Quality → Recovery Score → HRV Details (progressive Disclosure). Sleep hat auch die breiteste Datenverfügbarkeit (jede Smartwatch trackt Schlaf).

### 6. Self-Report als Fallback und Enhancer
**Decision:** Morning Check-in ("Wie fühlst du dich? Muskelkater wo?") als täglicher Input
**Rationale:** Subjektives Empfinden ist oft akkurater als Wearable-Daten für Muscle Recovery. 30-Sekunden Morning Survey erhöht Engagement + liefert Daten die kein Sensor messen kann.

---

## 🚀 Lumeos Recovery USP

### Primary USP: "Recovery That Knows Your Training, Nutrition, and Body — Not Just Your Heart Rate"

WHOOP weiß dass dein HRV niedrig ist.
Lumeos weiß WARUM:
- Dein Training-Volumen war 30% über MAV letzte Woche
- Dein Protein-Intake war 40g unter Ziel gestern
- Dein Ferritin fiel von 80 auf 45 laut letztem Bluttest
- Du hast nur 5.5h geschlafen (2h unter deinem Durchschnitt)

**→ Und empfiehlt konkret:** Deload-Woche, +40g Protein, Eisen supplementieren, 22:00 Schlafenszeit

### Secondary USPs

1. **Muscle-Specific Recovery Map**
   - "Deine Quads sind bei 55% Recovery → heute KEIN Leg Day"
   - "Chest ist bei 95% → Push Day ist ideal"
   - Visuell: Muscle Map mit Farbcoding (rot/gelb/grün)
   - **KEIN Competitor hat das**

2. **Kein Wearable nötig**
   - Phone Camera HRV (validated)
   - Sleep Detection via Phone
   - Voller Recovery Score ohne $300+ Hardware
   - WHOOP: $30/mo + Hardware. Lumeos: $9.99/mo + dein Phone

3. **Cross-Module Recovery Insights**
   - "Dein Recovery Score steigt um 15% an Tagen mit >30g Protein zum Abendessen"
   - "Magnesium Supplementierung korreliert mit +20% Deep Sleep"
   - "Dein CRP steigt nach >5 Trainingstagen in Folge"

4. **Smart Training Recommendations**
   - Recovery Score → Training Intensity Suggestion
   - <50%: Active Recovery / Rest Day
   - 50-70%: Light Training, reduziertes Volumen
   - 70-90%: Normal Training
   - >90%: Push Day — maximize Intensity

### Warum Lumeos gewinnt
| Kriterium | WHOOP | Oura | Garmin | HRV4Training | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Recovery Score | ✅ | ✅ | ✅ (Body Battery) | 🟡 | ✅ |
| Sleep Tracking | ✅ | ✅ (Best) | ✅ | ❌ | ✅ |
| HRV | ✅ | ✅ | ✅ | ✅ (Phone) | ✅ (Phone + Wearable) |
| Muscle Recovery | ❌ | ❌ | ❌ | ❌ | ✅ |
| Training Integration | 🟡 (Strain) | ❌ | 🟡 | ❌ | ✅ (Deep) |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bloodwork Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| No Hardware Needed | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Price** | $30/mo + Band | $6/mo + Ring | $0 + $300 Watch | $10/yr | **$9.99/mo** |
